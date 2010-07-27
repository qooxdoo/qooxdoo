#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2010-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# Class -- Internal representation of a qooxdoo class
##

import os, sys, re, types, codecs
from misc                           import util, filetool
from ecmascript.frontend            import treeutil, tokenizer, treegenerator, lang
from ecmascript.frontend.Script import Script
from ecmascript.transform.optimizer import variantoptimizer

DefaultIgnoredNamesDynamic = None
QXGLOBALS = [
    #"clazz",
    "qxvariants",
    "qxsettings",
    r"qx\.\$\$",    # qx.$$domReady, qx.$$libraries, ...
    ]

_memo1_ = {}  # for memoizing getScript()
_memo2_ = [None, None]

GlobalSymbolsRegPatts = []
for symb in lang.GLOBALS + QXGLOBALS:
    GlobalSymbolsRegPatts.append(re.compile(r'^%s\b' % symb))
GlobalSymbolsCombinedPatt = re.compile('|'.join(r'^%s\b' % x for x in lang.GLOBALS + QXGLOBALS))


class Class(object):


    def __init__(self, id, path, library, context, container):
        #__slots__       = ('id', 'path', 'size', 'encoding', 'library', 'context', 'source', 'scopes', 'translations')
        global console, cache, DefaultIgnoredNamesDynamic
        self.id         = id   # qooxdoo name of class, classId
        self.path       = path  # file path of this class
        self.size       = -1
        self.encoding   = 'utf-8'
        self.library    = library
        self.context    = context
        self._classesObj= container   # this is ugly, but curr. used to identify known names
        self.source     = u''  # source text of this class
        #self.ast        = None # ecmascript.frontend.tree instance
        self.scopes     = None # an ecmascript.frontend.Script instance
        self.translations = {} # map of translatable strings in this class

        console = context["console"]
        cache   = context["cache"]

        DefaultIgnoredNamesDynamic = [lib["namespace"] for lib in self.context['jobconf'].get("library", [])]


    # --------------------------------------------------------------------------
    #   Tree Interface
    # --------------------------------------------------------------------------

    def _getSourceTree(self, cacheId):
        tradeSpaceForSpeed = False

        # Lookup for unoptimized tree
        tree = cache.read(cacheId, self.path, memory=tradeSpaceForSpeed)

        # Tree still undefined?, create it!
        if tree == None:
            console.debug("Parsing file: %s..." % self.id)
            console.indent()

            fileContent = filetool.read(self.path, self.encoding)
            tokens = tokenizer.parseStream(fileContent, self.id)
            
            console.outdent()
            console.debug("Generating tree: %s..." % self.id)
            console.indent()
            tree = treegenerator.createSyntaxTree(tokens)  # allow exceptions to propagate

            # store unoptimized tree
            #print "Caching %s" % cacheId
            cache.write(cacheId, tree, memory=tradeSpaceForSpeed, writeToFile=True)

            console.outdent()
        return tree


    def tree(self, variantSet={}):
        context = self.context
        tradeSpaceForSpeed = False  # Caution: setting this to True seems to make builds slower, at least on some platforms!?

        # Construct the right cache id
        unoptCacheId     = "tree-%s-%s" % (self.path, util.toString({}))

        classVariants    = []
        tree             = None
        classVariants    = getClassVariants(self.id, self.path, None, context["cache"], context["console"], generate=False) # just check the cache
        if classVariants == None:
            tree = self._getSourceTree(unoptCacheId)
            classVariants= getClassVariantsFromTree(tree, context["console"])

        relevantVariants = projectClassVariantsToCurrent(classVariants, variantSet)
        cacheId          = "tree-%s-%s" % (self.path, util.toString(relevantVariants))

        # Get the right tree to return
        if cacheId == unoptCacheId and tree:  # early return optimization
            return tree

        opttree = context["cache"].read(cacheId, self.path, memory=tradeSpaceForSpeed)
        if not opttree:
            # start from source tree
            if tree:
                opttree = tree
            else:
                opttree = self._getSourceTree(unoptCacheId)
            # do we have to optimze?
            if cacheId == unoptCacheId:
                return opttree
            else:
                context["console"].debug("Selecting variants: %s..." % self.id)
                context["console"].indent()
                variantoptimizer.search(opttree, variantSet, self.id)
                context["console"].outdent()
                # store optimized tree
                #print "Caching %s" % cacheId
                context["cache"].write(cacheId, opttree, memory=tradeSpaceForSpeed, writeToFile=True)

        return opttree


    # --------------------------------------------------------------------------
    #   Variant Support
    # --------------------------------------------------------------------------

    ##
    # look for places where qx.core.Variant.select|isSet|.. are called
    # and return the list of first params (the variant name)
    # @cache

    def classVariants(self, generate=True):

        cache     = self.context["cache"]
        cacheId   = "class-%s" % (self.path,)
        classinfo = cache.readmulti(cacheId, self.path)
        classvariants = None
        if classinfo == None or 'svariants' not in classinfo:  # 'svariants' = supported variants
            if generate:
                tree = self.tree({})  # get complete tree
                classvariants = getClassVariantsFromTree(tree, self.context["console"])       # get variants used in qx.core.Variant...(<variant>,...)
                if classinfo == None:
                    classinfo = {}
                classinfo['svariants'] = classvariants
                cache.writemulti(cacheId, classinfo)
        else:
            classvariants = classinfo['svariants']

        return classvariants

    # --------------------------------------------------------------------------
    #   Compile Interface
    # --------------------------------------------------------------------------

    def _getAst(self):
        pass

    ast = property(_getAst)

    def getCode(self, compile_options=None, variants=None, source_with_comments=False):
        result = u''
        # source versions
        if not compile_options:
            result = filetool.read(self.path)
            if not source_with_comments:
                result = strip_comments(result)
        # compiled versions
        else:
            tree = self.optimize(self.ast, compile_options, variants)
            result =compiler.compile(tree)
        return result

    # --------------------------------------------------------------------------
    #   Dependencies Interface
    # --------------------------------------------------------------------------

    ##
    # Interface method
    #
    # return all dependencies of class from its code (both meta hints as well
    # as source code)

    def dependencies(self, variantSet):

        ##
        # get deps from meta info and class code
        def buildShallowDeps():

            ##
            # get deps from class code (tree)
            def analyzeClassTree(variantSet):

                loadtimeDeps = []
                runtimeDeps  = []
                undefDeps    = []

                tree = self.tree(variantSet)
                self._analyzeClassDepsNode(tree, loadtimeDeps, runtimeDeps, undefDeps, False, variantSet)

                return loadtimeDeps, runtimeDeps, undefDeps

            # ------------------------------------------------------
            # Notes:
            # load time = before class = require
            # runtime = after class = use

            load   = []
            run    = []
            ignore = [DependencyItem(x,-1) for x in DefaultIgnoredNamesDynamic]

            console.debug("Analyzing tree: %s" % self.id)
            console.indent()

            # Read meta data
            meta         = self.getMeta()
            metaLoad     = meta.get("loadtimeDeps", [])
            metaRun      = meta.get("runtimeDeps" , [])
            metaOptional = meta.get("optionalDeps", [])
            metaIgnore   = meta.get("ignoreDeps"  , [])

            # Process meta data
            load.extend(DependencyItem(x,-1) for x in metaLoad)
            run.extend(DependencyItem(x,-1) for x in metaRun)
            ignore.extend(DependencyItem(x,-1) for x in metaIgnore)

            # Read content data
            (autoLoad, autoRun, autoWarn) = analyzeClassTree(variantSet)
            
            # Process content data
            if not "auto-require" in metaIgnore:
                for dep in autoLoad:
                    item = dep.name
                    if item in metaOptional:
                        pass
                    elif item in (x.name for x in load):
                        console.warn("%s: #require(%s) is auto-detected" % (self.id, item))
                    else:
                        load.append(dep)

            if not "auto-use" in metaIgnore:
                for dep in autoRun:
                    item = dep.name
                    if item in metaOptional:
                        pass
                    elif item in (x.name for x in load):
                        pass
                    elif item in (x.name for x in run):
                        console.warn("%s: #use(%s) is auto-detected" % (self.id, item))
                    else:
                        run.append(dep)

            console.outdent()

            # Build data structure
            deps = {
                "load"   : load,
                "run"    : run,
                "ignore" : ignore,
                'undef'  : autoWarn
            }

            return deps

        # -- Main ---------------------------------------------------------

        # handles cache and invokes worker function

        classVariants    = self.classVariants()
        relevantVariants = projectClassVariantsToCurrent(classVariants, variantSet)
        cacheId          = "deps-%s-%s" % (self.path, util.toString(relevantVariants))

        deps = cache.readmulti(cacheId, self.path)
        if deps == None:
            deps = buildShallowDeps()
            cache.writemulti(cacheId, deps)
        
        return deps

        # end:dependencies()


    ##
    # analyze a class AST for dependencies (compiler hints not treated here)
    # does not follow dependencies to other classes (ie. it's a "shallow" analysis)!
    # the "variants" param is only to support getMethodDeps()!
    def _analyzeClassDepsNode(self, node, loadtime, runtime, warn, inFunction, variants):

        def checkDeferNode(assembled, node):
            deferNode = None
            if assembled == "qx.Class.define" or assembled == "qx.Bootstrap.define" or assembled == "qx.List.define":
                if node.hasParentContext("call/operand"):
                    deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
            return deferNode

        def reduceAssembled(assembled, node):
            # try to deduce a qooxdoo class from <assembled>
            assembledId = ''
            if assembled in self._classesObj:
                assembledId = assembled
            elif "." in assembled:
                for entryId in self._classesObj:
                    if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                        if len(entryId) > len(assembledId): # take the longest match
                            assembledId = entryId
            return assembledId

        def reduceAssembled1(assembled, node):
            def tryKnownClasses(assembled):
                result = ''
                for entryId in self._classesObj.keys() + ["this"]:
                    if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                        if len(entryId) > len(assembledId): # take the longest match
                            result = entryId
                return result

            def tryReduceClassname(assembled, node):
                result = ''
                # 'new <name>()'
                if (node.hasParentContext("instantiation/*/*/operand")):
                    result = assembled  # whole <name>
                # '"extend" : <name>'
                elif (node.hasParentContext("keyvalue/*") and node.parent.parent.get('key') == 'extend'):
                    result = assembled  # whole <name>
                # 'call' functor
                elif (node.hasParentContext("call/operand")):
                    result = assembled[:assembled.rindex('.')] # drop the method name after last '.'
                return result

            if assembled in self._classesObj:
                assembledId = assembled
            elif "." in assembled:
                assembledId = tryKnownClasses(assembled)
                if not assembledId:
                    assembledId = tryReduceClassname(assembled, node)
            if not assembledId:
                assembledId = assembled
            return assembledId

        def isUnknownClass(assembled, node, fileId):
            # check name in 'new ...' position
            if (node.hasParentContext("instantiation/*/*/operand")
            # check name in "'extend' : ..." position
            or (node.hasParentContext("keyvalue/*") and node.parent.parent.get('key') == 'extend')):
                # skip built-in classes (Error, document, RegExp, ...)
                if (assembled in lang.BUILTIN + ['clazz'] or re.match(r'this\b', assembled)):
                   return False
                # skip scoped vars - expensive, therefore last test
                elif self._isScopedVar(assembled, node, fileId):
                    return False
                else:
                    return True

            return False
        
        def addId(assembledId, runtime, loadtime, lineno):
            if inFunction:
                target = runtime
            else:
                target = loadtime

            if not assembledId in (x.name for x in target):
                target.append(DependencyItem(assembledId, lineno))

            if (not inFunction and  # only for loadtime items
                self.context['jobconf'].get("dependencies/follow-static-initializers", False) and
                node.hasParentContext("call/operand")  # it's a method call
               ):  
                deps = self.getMethodDeps(assembledId, assembled, variants)
                loadtime.extend([x for x in deps if x not in loadtime]) # add uniquely

            return


        def followCallDeps(assembledId):
            if (assembledId and
                assembledId in self._classesObj and       # we have a class id
                assembledId != fileId and
                self.context['jobconf'].get("dependencies/follow-static-initializers", False) and
                node.hasParentContext("call/operand")  # it's a method call
               ):
                return True
            return False


        def splitClassAttribute(assembledId, assembled):
            if assembledId == assembled:  # just a class id
                clazzId   = assembledId
                attribute = u''
            else:
                clazzId   = assembledId
                attribute = assembled[ len(assembledId) +1 :] # a.b.c.d = a.b.c + '.' + d
                
            return clazzId, attribute

        # -----------------------------------------------------------

        fileId = self.id

        if node.type == "variable":
            assembled = (treeutil.assembleVariable(node))[0]

            # treat dependencies in defer as requires
            deferNode = checkDeferNode(assembled, node)
            if deferNode != None:
                self._analyzeClassDepsNode(deferNode, loadtime, runtime, warn, False, variants)

            # try to reduce to a class name
            assembledId = reduceAssembled(assembled, node)

            (context, className, classAttribute) = self._isInterestingReference(assembled, node, fileId)
            # postcond: 
            # - if className != '' it is an interesting reference
            # - might be a known qooxdoo class, or an unknown class (use 'className in self._classes')
            # - if assembled contained ".", classAttribute will contain approx. non-class part

            #if assembledId:
            #    if assembledId in self._classes and assembledId != fileId:
            #        #print "-- adding: %s" % assembledId
            #        #print "-- nameba: %s" % className
            #        #if not className: import pydb; pydb.debugger()
            #        addId(assembledId, runtime, loadtime)
            #else:
            #    if isUnknownClass(assembled, node, fileId):
            #        #print "-- warning: %s" % assembled
            #        #print "-- namebas: %s" % className
            #        warn.append(assembled)

            if className:
                if className != fileId: # not checking for self._classes here!
                    #print "-- adding: %s (%s:%s)" % (className, treeutil.getFileFromSyntaxItem(node), node.get('line',False))
                    addId(className, runtime, loadtime, node.get('line', -1))

            # an attempt to fix static initializers (bug#1455)
            if not inFunction and followCallDeps(assembledId):
                console.debug("Looking for rundeps in '%s' of '%s'" % (assembled, assembledId))
                if False: # use old getMethodDeps()
                    ldeps = self.getMethodDeps(assembledId, assembled, variants)
                    # getMethodDeps is mutual recursive calling into the current function, but
                    # only does so with inFunction=True, so this branch is never hit through the
                    # recursive call
                    # make run-time deps of the called method load-deps of the current
                    loadtime.extend([x for x in ldeps if x not in loadtime]) # add uniquely
                else: # new getMethodDeps()
                    console.indent()
                    classId, attribId = splitClassAttribute(assembledId, assembled)
                    ldeps = self.getMethodDeps1(classId, attribId, variants)
                    ld = [x[0] for x in ldeps]
                    loadtime.extend([x for x in ld if x not in loadtime]) # add uniquely
                    console.outdent()

        elif node.type == "body" and node.parent.type == "function":
            inFunction = True

        if node.hasChildren():
            for child in node.children:
                self._analyzeClassDepsNode(child, loadtime, runtime, warn, inFunction, variants)

        return

        # end:_analyzeClassDepsNode


    ##
    # This is an iterative version of the previous (recursive) method.
    # Surprisingly, initial timings suggest that it is slightly slower (!) than
    # the recursive version. I leave it in, in case I want to pick up on
    # iterative solutions in the future.
    # NOT USED
    def _analyzeClassDepsNode_1(self, node_, loadtime, runtime, warn, inFunction, variants):

        def checkDeferNode(assembled, node):
            deferNode = None
            if assembled == "qx.Class.define" or assembled == "qx.Bootstrap.define" or assembled == "qx.List.define":
                if node.hasParentContext("call/operand"):
                    deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
            return deferNode

        def reduceAssembled(assembled, node):
            # try to deduce a qooxdoo class from <assembled>
            assembledId = ''
            if assembled in self._classesObj:
                assembledId = assembled
            elif "." in assembled:
                for entryId in self._classesObj:
                    if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                        if len(entryId) > len(assembledId): # take the longest match
                            assembledId = entryId
            return assembledId

        def reduceAssembled1(assembled, node):
            def tryKnownClasses(assembled):
                result = ''
                for entryId in self._classesObj.keys() + ["this"]:
                    if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                        if len(entryId) > len(assembledId): # take the longest match
                            result = entryId
                return result

            def tryReduceClassname(assembled, node):
                result = ''
                # 'new <name>()'
                if (node.hasParentContext("instantiation/*/*/operand")):
                    result = assembled  # whole <name>
                # '"extend" : <name>'
                elif (node.hasParentContext("keyvalue/*") and node.parent.parent.get('key') == 'extend'):
                    result = assembled  # whole <name>
                # 'call' functor
                elif (node.hasParentContext("call/operand")):
                    result = assembled[:assembled.rindex('.')] # drop the method name after last '.'
                return result

            if assembled in self._classesObj:
                assembledId = assembled
            elif "." in assembled:
                assembledId = tryKnownClasses(assembled)
                if not assembledId:
                    assembledId = tryReduceClassname(assembled, node)
            if not assembledId:
                assembledId = assembled
            return assembledId

        def isUnknownClass(assembled, node, fileId):
            # check name in 'new ...' position
            if (node.hasParentContext("instantiation/*/*/operand")
            # check name in "'extend' : ..." position
            or (node.hasParentContext("keyvalue/*") and node.parent.parent.get('key') == 'extend')):
                # skip built-in classes (Error, document, RegExp, ...)
                if (assembled in lang.BUILTIN + ['clazz'] or re.match(r'this\b', assembled)):
                   return False
                # skip scoped vars - expensive, therefore last test
                elif self._isScopedVar(assembled, node, fileId):
                    return False
                else:
                    return True

            return False
        
        def addId(assembledId, runtime, loadtime, lineno):
            if inFunction:
                target = runtime
            else:
                target = loadtime

            if not assembledId in (x.name for x in target):
                target.append(DependencyItem(assembledId, lineno))

            if (not inFunction and  # only for loadtime items
                self.context['jobconf'].get("dependencies/follow-static-initializers", False) and
                node.hasParentContext("call/operand")  # it's a method call
               ):  
                deps = self.getMethodDeps(assembledId, assembled, variants)
                loadtime.extend([x for x in deps if x not in loadtime]) # add uniquely

            return


        def followCallDeps(assembledId):
            if (assembledId and
                assembledId in self._classesObj and       # we have a class id
                assembledId != fileId and
                self.context['jobconf'].get("dependencies/follow-static-initializers", False) and
                node.hasParentContext("call/operand")  # it's a method call
               ):
                return True
            return False


        def splitClassAttribute(assembledId, assembled):
            if assembledId == assembled:  # just a class id
                clazzId   = assembledId
                attribute = u''
            else:
                clazzId   = assembledId
                attribute = assembled[ len(assembledId) +1 :] # a.b.c.d = a.b.c + '.' + d
                
            return clazzId, attribute

        # -----------------------------------------------------------

        fileId = self.id

        for parent_types, node in treeutil.nodeIteratorNonRec(node_):

            if 'function/body' in parent_types:
                inFunction = True
            else:
                inFunction = False

            if node.type == "variable":
                assembled = (treeutil.assembleVariable(node))[0]

                # treat dependencies in defer as requires
                deferNode = checkDeferNode(assembled, node)
                if deferNode != None:
                    self._analyzeClassDepsNode(deferNode, loadtime, runtime, warn, False, variants)

                # try to reduce to a class name
                assembledId = reduceAssembled(assembled, node)

                (context, className, classAttribute) = self._isInterestingReference(assembled, node, fileId)
                # postcond: 
                # - if className != '' it is an interesting reference
                # - might be a known qooxdoo class, or an unknown class (use 'className in self._classes')
                # - if assembled contained ".", classAttribute will contain approx. non-class part

                #if assembledId:
                #    if assembledId in self._classes and assembledId != fileId:
                #        #print "-- adding: %s" % assembledId
                #        #print "-- nameba: %s" % className
                #        #if not className: import pydb; pydb.debugger()
                #        addId(assembledId, runtime, loadtime)
                #else:
                #    if isUnknownClass(assembled, node, fileId):
                #        #print "-- warning: %s" % assembled
                #        #print "-- namebas: %s" % className
                #        warn.append(assembled)

                if className:
                    if className != fileId: # not checking for self._classes here!
                        #print "-- adding: %s (%s:%s)" % (className, treeutil.getFileFromSyntaxItem(node), node.get('line',False))
                        addId(className, runtime, loadtime, node.get('line', -1))

                # an attempt to fix static initializers (bug#1455)
                if not inFunction and followCallDeps(assembledId):
                    console.debug("Looking for rundeps in '%s' of '%s'" % (assembled, assembledId))
                    if False: # use old getMethodDeps()
                        ldeps = self.getMethodDeps(assembledId, assembled, variants)
                        # getMethodDeps is mutual recursive calling into the current function, but
                        # only does so with inFunction=True, so this branch is never hit through the
                        # recursive call
                        # make run-time deps of the called method load-deps of the current
                        loadtime.extend([x for x in ldeps if x not in loadtime]) # add uniquely
                    else: # new getMethodDeps()
                        console.indent()
                        classId, attribId = splitClassAttribute(assembledId, assembled)
                        ldeps = self.getMethodDeps1(classId, attribId, variants)
                        ld = [x[0] for x in ldeps]
                        loadtime.extend([x for x in ld if x not in loadtime]) # add uniquely
                        console.outdent()

                # end(while)

        return

        # end:_analyzeClassDepsNode


    def _isInterestingReference(self, assembled, node, fileId):

        def checkNodeContext(node):
            context = 'interesting' # every context is interesting, mybe we get more specific
            #context = ''

            # filter out the occurrences like 'c' in a.b().c
            myFirst = node.getFirstChild(mandatory=False, ignoreComments=True)
            if not treeutil.checkFirstChainChild(myFirst): # see if myFirst is the first identifier in a chain
                context = ''

            # filter out ... = position (lvals) - Nope! (qx.ui.form.ListItem.prototype.setValue = 
            # function(..){...};)
            #elif (node.hasParentContext("assignment/left")):
            #    context = ''

            # check name in 'new ...' position
            elif (node.hasParentContext("instantiation/*/*/operand")):
                context = 'new'

            # check name in call position
            elif (node.hasParentContext("call/operand")):
                context = 'call'

            # check name in "'extend' : ..." position
            elif (node.hasParentContext("keyvalue/*") and node.parent.parent.get('key') in ['extend']): #, 'include']):
                #print "-- found context: %s" % node.parent.parent.get('key')
                context = 'extend'

            return context

        def isInterestingIdentifier(assembled):
            # skip built-in classes (Error, document, RegExp, ...)
            #for bi in lang.GLOBALS + ['clazz', 'qx', r'qx\.\$\$\w+$']:  # GLOBALS contains 'this' and 'arguments'
            #for bi in lang.GLOBALS + QXGLOBALS:  # GLOBALS contains 'this' and 'arguments'
            #    if re.search(r'^%s\b' % bi, assembled):
            if GlobalSymbolsCombinedPatt.search(assembled):
                return False
            #for patt in GlobalSymbolsRegPatts:
            #    if patt.search(assembled):
            #        return False
            # skip scoped vars - expensive, therefore last test
            if self._isScopedVar(assembled, node, fileId):
                return False
            else:
                return True

        def attemptSplitIdentifier(context, assembled):
            # try qooxdoo classes first
            className, classAttribute = self._splitQxClass(assembled)
            if className:
                return className, classAttribute
            
            className, classAttribute = assembled, ''
            # now handle non-qooxdoo classes
            if context == 'new':
                className = assembled
            elif context == 'extend':
                className = assembled
            elif context == 'call':
                lastDotIdx = assembled.rfind('.')
                if lastDotIdx > -1:
                    className   = assembled[:lastDotIdx]
                    classAttribute = assembled[lastDotIdx + 1:]
                else:
                    className = assembled

            return className, classAttribute

        # ---------------------------------------------------------------------
        context = nameBase = nameExtension = ''
        context = checkNodeContext(node)
        if context: 
            if isInterestingIdentifier(assembled): # filter local or build-in names
                nameBase, nameExtension = attemptSplitIdentifier(context, assembled)

        return context, nameBase, nameExtension

        # end:_isInterestingReference()


    def _splitQxClass(self, assembled):
        # this supersedes reduceAssembled(), improving the return value
        className = classAttribute = ''
        if assembled in self._classesObj:
            className = assembled
        elif "." in assembled:
            for entryId in self._classesObj:
                if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                    if len(entryId) > len(className): # take the longest match
                        className      = entryId
                        classAttribute = assembled[ len(entryId) +1 :]  # skip entryId + '.'
        return className, classAttribute


    def _isScopedVar(self, idStr, node, fileId):

        def findScopeNode(node):
            node1 = node
            sNode = None
            while not sNode:
                if node1.type in ["function", "catch"]:
                    sNode = node1
                if node1.hasParent():
                    node1 = node1.parent
                else:
                    break # we're at the root
            if not sNode:
                sNode = node1 # use root node
            return sNode

        def findRoot(node):
            rnode = node
            while rnode.hasParent():
                rnode = rnode.parent
            return rnode

        def getScript(node, fileId, ):
            # TODO: checking the root nodes is a fix, as they sometimes differ (prob. caching)
            rootNode = findRoot(node)
            #if fileId in _memo1_:
            #if fileId in _memo1_ and _memo1_[fileId].root == rootNode:
            #    script = _memo1_[fileId]
            #if _memo2_[0] == fileId: # replace with '_memo2_[0] == rootNode', to make it more robust, but slightly less performant
            if _memo2_[0] == rootNode:
                #print "-- re-using scopes for: %s" % fileId
                script = _memo2_[1]
            else:
                #rootNode = findRoot(node)
                #if fileId in _memo1_ and _memo1_[fileId].root != rootNode:
                #print "-- re-calculating scopes for: %s" % fileId
                script = Script(rootNode, fileId)
                #_memo1_[fileId] = script
                #_memo2_[0], _memo2_[1] = fileId, script
                _memo2_[0], _memo2_[1] = rootNode, script
            return script

        def getLeadingId(idStr):
            leadingId = idStr
            dotIdx = idStr.find('.')
            if dotIdx > -1:
                leadingId = idStr[:dotIdx]
            return leadingId

        # check composite id a.b.c, check only first part
        idString = getLeadingId(idStr)
        script   = getScript(node, fileId)

        scopeNode = findScopeNode(node)  # find the node of the enclosing scope (function - catch - global)
        if scopeNode == script.root:
            fcnScope = script.getGlobalScope()
        else:
            fcnScope  = script.getScope(scopeNode)
        #assert fcnScope != None, "idString: '%s', idStr: '%s', fileId: '%s'" % (idString, idStr, fileId)
        varDef = script.getVariableDefinition(idString, fcnScope)
        if varDef:
            return True
        return False

        # end:_isScopedVar()


    # --------------------------------------------------------------------------
    #   I18N Support
    # --------------------------------------------------------------------------

    ##
    # returns array of message dicts [{method:, line:, column:, hint:, id:, plural:},...]
    def messageStrings(self, variants):
        # this duplicates codef from Locale.getTranslation
        
        classVariants     = self.classVariants()
        relevantVariants  = projectClassVariantsToCurrent(classVariants, variants)
        variantsId        = util.toString(relevantVariants)

        cacheId = "messages-%s-%s" % (self.path, variantsId)

        messages = cache.readmulti(cacheId, self.path)
        if messages != None:
            return messages

        console.debug("Looking for message strings: %s..." % self.id)
        console.indent()

        tree = self.tree(variants)

        #try:
        if True:
            messages = self._findTranslationBlocks(tree, [])
        #except NameError, detail:
        #    raise RuntimeError("Could not extract message strings from %s!\n%s" % (self.id, detail))

        if len(messages) > 0:
            console.debug("Found %s message strings" % len(messages))

        console.outdent()
        cache.writemulti(cacheId, messages)

        return messages


    def _findTranslationBlocks(self, node, messages):
        if node.type == "call":
            oper = node.getChild("operand", False)
            if oper:
                var = oper.getChild("variable", False)
                if var:
                    varname = (treeutil.assembleVariable(var))[0]
                    for entry in [ ".tr", ".trn", ".trc", ".marktr" ]:
                        if varname.endswith(entry):
                            self._addTranslationBlock(entry[1:], messages, node, var)
                            break

        if node.hasChildren():
            for child in node.children:
                self._findTranslationBlocks(child, messages)

        return messages

     
    def _addTranslationBlock(self, method, data, node, var):
        entry = {
            "method" : method,
            "line"   : node.get("line"),
            "column" : node.get("column")
        }

        # tr(msgid, args)
        # trn(msgid, msgid_plural, count, args)
        # trc(hint, msgid, args)
        # marktr(msgid)

        if method == "trn" or method == "trc": minArgc=2
        else: minArgc=1

        params = node.getChild("params", False)
        if not params or not params.hasChildren():
            raise NameError("Invalid param data for localizable string method at line %s!" % node.get("line"))

        if len(params.children) < minArgc:
            raise NameError("Invalid number of parameters %s at line %s" % (len(params.children), node.get("line")))

        strings = []
        for child in params.children:
            if child.type == "commentsBefore":
                continue

            elif child.type == "constant" and child.get("constantType") == "string":
                strings.append(child.get("value"))

            elif child.type == "operation":
                strings.append(self._concatOperation(child))

            elif len(strings) < minArgc:
                console.warn("Unknown expression as argument to translation method at line %s" % (child.get("line"),))

            # Ignore remaining (run time) arguments
            if len(strings) == minArgc:
                break

        lenStrings = len(strings)
        if lenStrings > 0:
            if method == "trc":
                entry["hint"] = strings[0]
                if lenStrings > 1 and strings[1]:  # msgid must not be ""
                    entry["id"]   = strings[1]
            else:
                if strings[0]:
                    entry["id"] = strings[0]

            if method == "trn" and lenStrings > 1:
                entry["plural"] = strings[1]

        # register the entry only if we have a proper key
        if "id" in entry:
            data.append(entry)

        return





    # --------------------------------------------------------------------------
    #   Meta Data Support
    # --------------------------------------------------------------------------

    HEAD = {
        "require"  : re.compile(r"^\s* \#require  \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "use"      : re.compile(r"^\s* \#use      \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "optional" : re.compile(r"^\s* \#optional \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "ignore"   : re.compile(r"^\s* \#ignore   \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "asset"    : re.compile(r"^\s* \#asset    \(\s* ([^)]+?)  \s*\)"                        , re.M|re.X),
        "cldr"     : re.compile(r"^\s*(\#cldr) (?:\(\s* ([^)]+?)  \s*\))?"                      , re.M|re.X),
    }


    def getMeta(self, metatype=""):

        def _extractLoadtimeDeps(data, fileId):
            deps = []

            for item in self.HEAD["require"].findall(data):
                if item == fileId:
                    raise NameError("Self-referring load dependency: %s" % item)
                else:
                    deps.append(item)

            return deps


        def _extractRuntimeDeps(data, fileId):
            deps = []

            for item in self.HEAD["use"].findall(data):
                if item == fileId:
                    console.error("Self-referring runtime dependency: %s" % item)
                else:
                    deps.append(item)

            return deps


        def _extractOptionalDeps(data):
            deps = []

            # Adding explicit requirements
            for item in self.HEAD["optional"].findall(data):
                if not item in deps:
                    deps.append(item)

            return deps


        def _extractIgnoreDeps(data):
            ignores = []

            # Adding explicit requirements
            for item in self.HEAD["ignore"].findall(data):
                if not item in ignores:
                    ignores.append(item)

            return ignores


        def _extractAssetDeps(data):
            deps = []
            #asset_reg = re.compile("^[\$\.\*a-zA-Z0-9/{}_-]+$")
            asset_reg = re.compile(r"^[\$\.\*\w/{}-]+$", re.U)  # have to include "-", which is permissible in paths, e.g. "folder-open.png"
            
            for item in self.HEAD["asset"].findall(data):
                if not asset_reg.match(item):
                    raise ValueError, "Illegal asset declaration: %s" % item
                if not item in deps:
                    deps.append(item)
            
            return deps

        def _extractCLDRDeps(data):
            cldr = []

            # Adding explicit requirements
            if self.HEAD["cldr"].findall(data):
                cldr = [True]

            return cldr

        # ----------------------------------------------------------

        fileEntry = self
        filePath = fileEntry.path
        fileId   = self.id
        cacheId = "meta-%s" % filePath

        meta = cache.readmulti(cacheId, filePath)
        if meta != None:
            if metatype:
                return meta[metatype]
            else:
                return meta

        meta = {}

        console.indent()

        content = filetool.read(filePath, fileEntry.encoding)

        meta["loadtimeDeps"] = _extractLoadtimeDeps(content, fileId)
        meta["runtimeDeps"]  = _extractRuntimeDeps(content, fileId)
        meta["optionalDeps"] = _extractOptionalDeps(content)
        meta["ignoreDeps"]   = _extractIgnoreDeps(content)
        try:
            meta["assetDeps"]    = _extractAssetDeps(content)
        except ValueError, e:
            raise ValueError, e.message + u' in: %r' % filePath
        meta["cldr"]         = _extractCLDRDeps(content)

        console.outdent()

        cache.writemulti(cacheId, meta)

        if metatype:
            return meta[metatype]
        else:
            return meta


    def getOptionals(self, includeWithDeps):
        result = []

        for classId in includeWithDeps:
            try:
                for optional in self.getMeta(classId)["optionalDeps"]:
                    if not optional in includeWithDeps and not optional in result:
                        result.append(optional)

            # Not all meta data contains optional infos
            except KeyError:
                continue

        return result

    ######################################################################
    #  METHOD DEPENDENCIES SUPPORT
    ######################################################################

    def getMethodDeps(self, fileId, methodNameFQ, variants):
        # find the dependencies of a specific method
        # get the fileId class, find the node of methodNameFQ, and extract its
        # dependencies (can only be runtime deps, since all inFunction)
        # return the deps

        def findMethodName(fileId, methodNameFQ):
            mo = re.match(r'(?u)^%s\.(.+)$' % fileId, methodNameFQ)
            if mo and mo.group(1):
                return mo.group(1)
            else:
                return u''
        
        def findMethod(tree, methodName):
            for node in treeutil.nodeIterator(tree, ["function"]):  # check function nodes
                if node.hasParentContext("keyvalue/value"): # it's a key : function() member
                    keyvalNode = node.parent.parent
                    key = keyvalNode.get("key", False)
                    if key and key == methodName:
                        return node
            return None

        # get the method name
        if fileId == methodNameFQ:  # corner case: the class is being called
            methodName = "construct"
        else:
            methodName = findMethodName(fileId, methodNameFQ) # methodNameFQ - fileId = methodName
        if methodName == "getInstance": # corner case: singletons get this from qx.Class
            fileId = "qx.Class"

        # get the class code
        tree = self._classesObj[fileId].tree( variants)

        # find the method node
        funcNode   = findMethod(tree, methodName)
        if not funcNode:
            raise RuntimeError, "No method named \"%s\" found in class \"%s\"." % (methodName, fileId)

        # get the deps of the method
        runtime  = []
        loadtime = []
        warn     = []
        self._analyzeClassDepsNode(fileId, funcNode, runtime, loadtime, warn, True, variants)

        # remove reference to itself
        while fileId in loadtime:
            loadtime.remove(fileId)

        return loadtime


    ##
    # find all run time dependencies of a given method, recursively
    #
    # this is supposed to be an improved version of getMethodDeps() that should be really
    # exhaustive (and therefore reliable):
    # - get the immediate runtime dependencies of the current method; for each of those dependencies:
    # - if it is a "<name>.xxx" method/attribute:
    #   - find the defining class (<name>, ancestor of <name>, or mixin of <name>): findClassForMethod()
    #   - add this class#method to dependencies
    #   - recurse on dependencies of this class#method, adding them to the current dependencies
    # currently only a thin wrapper around its recursive sibling, getMethodDepsR

    def getMethodDeps1(self, classId, methodId, variants):

        ##
        # find the class the given <methodId> is defined in; start with the
        # given class, inspecting its class map to find the method; if
        # unsuccessful, recurse on the potential super class and mixins; return
        # the defining class name, and the tree node defining the method
        # (actually, the map value of the method name key, whatever that is)
        #
        # @out <string> class that defines method
        # @out <tree>   tree node value of methodId in the class map

        def findClassForMethod(clazzId, methodId, variants):

            def classHasOwnMethod(classAttribs, methId):
                candidates = {}
                candidates.update(classAttribs.get("members",{}))
                candidates.update(classAttribs.get("statics",{}))
                if "construct" in classAttribs:
                    candidates.update(dict((("construct", classAttribs.get("construct")),)))
                if methId in candidates.keys():
                    return candidates[methId]  # return the definition of the attribute
                else:
                    return None

            # get the method name
            if  methodId == u'':  # corner case: the class is being called
                methodId = "construct"
            elif methodId == "getInstance": # corner case: singletons get this from qx.Class
                clazzId = "qx.Class"
            # TODO: getter/setter are also not statically available!
            # handle .call() ?!
            if clazzId in lang.BUILTIN:  # these are automatically fullfilled, signal this
                return True, True
            elif clazzId not in self._classesObj: # can't further process non-qooxdoo classes
                return None, None

            tree = self._classesObj[clazzId].tree( variants)
            clazz = treeutil.findQxDefine(tree)
            classAttribs = treeutil.getClassMap(clazz)
            keyval = classHasOwnMethod(classAttribs, methodId)
            if keyval:
                return clazzId, keyval

            # inspect inheritance/mixins
            parents = []
            extendVal = classAttribs.get('extend', None)
            if extendVal:
                extendVal = treeutil.variableOrArrayNodeToArray(extendVal)
                parents.extend(extendVal)
            includeVal = classAttribs.get('include', None)
            if includeVal:
                includeVal = treeutil.variableOrArrayNodeToArray(includeVal)
                parents.extend(includeVal)

            # go through all ancestors
            for parClass in parents:
                rclass, keyval = findClassForMethod(parClass, methodId, variants)
                if rclass:
                    return rclass, keyval
            return None, None

        ##
        # split a composed identifier into its class and attribute part, so that
        # <assembled> = <assembledId>.<attribute>

        def splitClassAttribute(assembledId, assembled):
            if assembledId == assembled:  # just a class id
                clazzId   = assembledId
                attribute = u''
            else:
                clazzId   = assembledId
                attribute = assembled[ len(assembledId) +1 :] # a.b.c.d = a.b.c + '.' + d
                
            return clazzId, attribute


        ##
        # extract the class name from a composed identifier
        # "qx.Class.define" -> "qx.Class"

        def reduceAssembled(assembled, node):
            assembledId = ''
            if assembled in self._classesObj:
                assembledId = assembled
            elif "." in assembled:
                for entryId in self._classesObj.keys() + ["this"]:
                    if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                        if len(entryId) > len(assembledId): # take the longest match
                            assembledId = entryId
            return assembledId


        ##
        # find interesting identifiers in a (method) source tree; "interesting"
        # means references to other methods within the qooxdoo world;
        # returns the full identifiers

        def getReferencesFromSource(fileId, node, runtime):
            # the "variants" param is only to support getMethodDeps()!

            ##
            # currently interesting are 
            # - 'new' operands ("new qx.ui.form.Button(...)"), and 
            # - call operands ("qx.core.Variant.select(...)")

            def isInterestingReference(assembled, node, fileId):
                # check name in 'new ...' position
                if (node.hasParentContext("instantiation/*/*/operand")
                # check name in call position
                or (node.hasParentContext("call/operand"))):
                    # skip built-in classes (Error, document, RegExp, ...)
                    for bi in lang.BUILTIN + ['clazz']:
                        if re.search(r'^%s\b' % bi, assembled):
                            return False
                    # skip scoped vars - expensive, therefore last test
                    if self._isScopedVar(assembled, node, fileId):
                        return False
                    else:
                        return True

                return False
            
            # -----------------------------------------------------------

            if node.type == "variable":
                assembled = (treeutil.assembleVariable(node))[0]

                if isInterestingReference(assembled, node, fileId):
                    runtime.append(assembled)

            if node.hasChildren():
                for child in node.children:
                    getReferencesFromSource(fileId, child, runtime)

            return



        ##
        # find dependencies of a method <methodId> that has been referenced from
        # <classId>. recurse on the immediate dependencies in the method code.
        #
        # @param deps accumulator variable set((c1,m1), (c2,m2),...)
        #
        # returns a set of pairs each representing a signature (classId,
        # methodId)

        def getMethodDepsR(classId, methodId, variants, deps):
            console.debug("%s#%s dependencies:" % (classId, methodId))
            console.indent()

            # Check cache
            filePath= self._classesObj[classId].path
            cacheId = "methoddeps-%r-%r-%r" % (classId, methodId, util.toString(variants))
            ndeps   = self._cache.read(cacheId, memory=True)  # no use to put this into a file, due to transitive dependencies to other files
            if ndeps != None:
                console.debug("using cached result")
                #deps.update(ndeps)
                console.outdent()
                return ndeps

            # Calculate deps

            # find the defining class
            clazzId, attribValNode = findClassForMethod(classId, methodId, variants)

            # Get the method's immediate deps
            deps_rt = []
            getReferencesFromSource(clazzId, attribValNode, deps_rt)
            ndeps= set(())
            # put into right format
            for dep in deps_rt:
                assId = reduceAssembled(dep)
                if assId == u'':  # unknown class
                    console.info("Skipping unknown id: %r" % dep)
                    continue
                clazzId, methId = splitClassAttribute(assId, dep)
                ndeps.add((clazzId,methId))

            console.debug("Code references: %r" % list(ndeps))

            # Recurse on the immediate deps
            ndepslist = list(ndeps)
            ndeps     = set(())   # will be re-populated with brushed values (e.g. 'this' gone)
            for clazzId, methId in ndepslist:
                if clazzId == "this":
                    clazzId = classId
                ndeps.add((clazzId, methId))
                nclazzId, methValNode = findClassForMethod(clazzId, methId, variants) # find the original class methId was defined in
                if not nclazzId:
                    console.warn("Skipping unknown class dependency: %s#%s" % (clazzId, methId))
                elif nclazzId == True:  # this must be a known global (like Error, Regexp, ...)
                    console.debug("Dependency automatically fullfilled: %s#%s" % (clazzId, methId))
                    continue
                else:
                    clazzId = nclazzId
                    # cyclic check
                    if (clazzId, methId) in deps:
                    #if (clazzId, methId) == (classId, methodId):
                        console.debug("Class.method already seen, skipping: %s#%s" % (clazzId, methId))
                        continue
                    else:
                        ndeps.add((clazzId, methId))
                        assert clazzId in self._classesObj
                        r = getMethodDepsR(clazzId, methId, variants, deps.union(ndeps))  # recursive call
                        ndeps.update(r)

            # Cache update
            self._cache.write(cacheId, ndeps, memory=True, writeToFile=False)
            # accumulator update
            #deps.update(ndeps)
            console.debug("Recursive dependencies: %r" % list(ndeps))
            console.outdent()
            return ndeps

        # - Main ---------------------
        deps = getMethodDepsR(classId, methodId, variants, set(()))
        return deps




class DependencyItem(object):
    __slots__ = ('name', 'line')
    def __init__(self, name, line):
        self.name = name
        self.line = line
    def __repr__(self):
        return "<DepItem>:"+self.name


# -- temp. module helper functions ---------------------------------------------


##
# only return those keys from <variantSet> that are supported
# in <classVariants>

def projectClassVariantsToCurrent(classVariants, variantSet):
    res = {}
    for key in variantSet:
        if key in classVariants:
            res[key] = variantSet[key]
    return res


##
# helper that operates on ecmascript.frontend.tree
def getClassVariantsFromTree(node, console):
    classvariants = set([])
    # mostly taken from ecmascript.transform.optimizer.variantoptimizer
    variants = treeutil.findVariablePrefix(node, "qx.core.Variant")
    for variant in variants:
        if not variant.hasParentContext("call/operand"):
            continue
        variantMethod = treeutil.selectNode(variant, "identifier[4]/@name")
        if variantMethod not in ["select", "isSet", "compilerIsSet"]:
            continue
        firstParam = treeutil.selectNode(variant, "../../params/1")
        if firstParam and treeutil.isStringLiteral(firstParam):
            classvariants.add(firstParam.get("value"))
        else:
            console.warn("! qx.core.Variant call without literal argument")

    return classvariants

##
# look for places where qx.core.Variant.select|isSet|.. are called
# and return the list of first params (the variant name)
# @cache

def getClassVariants(fileId, filePath, treeLoader, cache, console, generate=True):

    cacheId   = "class-%s" % (filePath,)
    classinfo = cache.readmulti(cacheId, filePath)
    classvariants = None
    if classinfo == None or 'svariants' not in classinfo:  # 'svariants' = supported variants
        if generate:
            tree = treeLoader.getTree(fileId, {})  # get complete tree
            classvariants = getClassVariantsFromTree(tree, console)       # get variants used in qx.core.Variant...(<variant>,...)
            if classinfo == None:
                classinfo = {}
            classinfo['svariants'] = classvariants
            cache.writemulti(cacheId, classinfo)
    else:
        classvariants = classinfo['svariants']

    return classvariants

