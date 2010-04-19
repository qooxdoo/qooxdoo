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
from ecmascript.frontend import treeutil, tokenizer, treegenerator, lang
from ecmascript.transform.optimizer import variantoptimizer
from misc import util, filetool

class Class(object):

    def __init__(self, id, path, library, context):
        #__slots__       = ('id', 'path', 'size', 'encoding', 'library', 'context', 'source', 'scopes', 'translations')
        global console, cache
        self.id         = id   # qooxdoo name of class, classId
        self.path       = path  # file path of this class
        self.size       = -1
        self.encoding   = 'utf-8'
        self.library    = library
        self.context    = context
        self.source     = u''  # source text of this class
        #self.ast        = None # ecmascript.frontend.tree instance
        self.scopes     = None # an ecmascript.frontend.Script instance
        self.translations = {} # map of translatable strings in this class

        console = context["console"]
        cache   = context["cache"]


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

    def compiled(variants):
        compiled = u''
        tree = self.optimize(self.ast)
        compiled =compiler.compile(tree)
        return compiled

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
            ignore = [DependencyItem(x,-1) for x in self._defaultIgnore]

            console.debug("Gathering dependencies: %s" % fileId)
            console.indent()

            # Read meta data
            meta         = self.getMeta(self.id)
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
                        console.warn("%s: #require(%s) is auto-detected" % (fileId, item))
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
                        console.warn("%s: #use(%s) is auto-detected" % (fileId, item))
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

        classVariants    = clazz.classVariants()
        relevantVariants = projectClassVariantsToCurrent(classVariants, variantSet)
        cacheId          = "deps-%s-%s" % (self.path, util.toString(relevantVariants))

        deps = cache.readmulti(cacheId, self.path)
        if deps == None:
            deps = buildShallowDeps()
            cache.writemulti(cacheId, deps)
        
        return deps

        # end:dependencies()


    def _analyzeClassDepsNode(self, fileId, node, loadtime, runtime, warn, inFunction, variants):
        # analyze a class AST for dependencies (compiler hints not treated here)
        # does not follow dependencies to other classes (ie. it's a "shallow" analysis)!
        # the "variants" param is only to support getMethodDeps()!

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
                self._jobconf.get("dependencies/follow-static-initializers", False) and
                node.hasParentContext("call/operand")  # it's a method call
               ):  
                deps = self.getMethodDeps(assembledId, assembled, variants)
                loadtime.extend([x for x in deps if x not in loadtime]) # add uniquely

            return


        def followCallDeps(assembledId):
            if (assembledId and
                assembledId in self._classesObj and       # we have a class id
                assembledId != fileId and
                self._jobconf.get("dependencies/follow-static-initializers", False) and
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

        if node.type == "variable":
            assembled = (treeutil.assembleVariable(node))[0]

            # treat dependencies in defer as requires
            deferNode = checkDeferNode(assembled, node)
            if deferNode != None:
                self._analyzeClassDepsNode(fileId, deferNode, loadtime, runtime, warn, False, variants)

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
                self._analyzeClassDepsNode(fileId, child, loadtime, runtime, warn, inFunction, variants)

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
    #   Meta Data Support
    # --------------------------------------------------------------------------

    HEAD = {
        "require"  : re.compile(r"^\s* \#require  \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "use"      : re.compile(r"^\s* \#use      \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "optional" : re.compile(r"^\s* \#optional \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "ignore"   : re.compile(r"^\s* \#ignore   \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "asset"    : re.compile(r"^\s* \#asset    \(\s* ([^)]+?)  \s*\)"                        , re.M|re.X)
    }


    def getMeta(self, fileId):

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

        # ----------------------------------------------------------

        fileEntry = self._classesObj[fileId]
        filePath = fileEntry.path
        cacheId = "meta-%s" % filePath

        meta = cache.readmulti(cacheId, filePath)
        if meta != None:
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

        console.outdent()

        cache.writemulti(cacheId, meta)
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



class DependencyItem(object):
    __slots__ = ('name', 'line')
    def __init__(self, name, line):
        self.name = name
        self.line = line


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

