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
# Class -- Internal representation of a qooxdoo class; derives from Resource
##

import os, sys, re, types, copy, time
import codecs, optparse, functools
from operator import attrgetter

from misc                           import util, filetool, textutil
from misc.NameSpace                 import NameSpace
from ecmascript                     import compiler
from ecmascript.frontend            import treeutil, tokenizer, treegenerator, lang
from ecmascript.frontend.Script     import Script
from ecmascript.frontend.tree       import Node
from ecmascript.transform.optimizer import variantoptimizer, variableoptimizer, stringoptimizer, basecalloptimizer, privateoptimizer
from generator.resource.AssetHint   import AssetHint
from generator.resource.Resource    import Resource

DefaultIgnoredNamesDynamic = None

QXGLOBALS = [
    #"clazz",
    "qxvariants",
    "qxsettings",
    r"qx\.\$\$",    # qx.$$domReady, qx.$$libraries, ...
    ]

_memo1_ = [None, None]  # for memoizing getScript()

GlobalSymbolsCombinedPatt = re.compile('|'.join(r'^%s\b' % x for x in lang.GLOBALS + QXGLOBALS))

DEFER_ARGS = ("statics", "members", "properties")

class Class(Resource):

    def __init__(self, id, path, library, context, container):
        #__slots__       = ('id', 'path', 'size', 'encoding', 'library', 'context', 'source', 'scopes', 'translations')
        global console, cache, DefaultIgnoredNamesDynamic
        super(Class, self).__init__(path)
        self.id         = id   # qooxdoo name of class, classId
        self.library    = library     # Library()
        self.context    = context
        self._classesObj= container   # this is ugly, but curr. used to identify known names
        self.size       = -1
        self.encoding   = 'utf-8'
        self.source     = u''  # source text of this class
        #self.ast        = None # ecmascript.frontend.tree instance
        #self.type      = "" # PROPERTY
        self.scopes     = None # an ecmascript.frontend.Script instance
        self.translations = {} # map of translatable strings in this class
        self.resources  = set() # set of resource objects needed by the class
        self._assetRegex= None  # regex from #asset hints, for resource matching
        self.cacheId    = "class-%s" % self.path  # cache object for class-specific infos (outside tree, compile)
        
        console = context["console"]
        cache   = context["cache"]
        
        DefaultIgnoredNamesDynamic = [lib["namespace"] for lib in self.context['jobconf'].get("library", [])]


    def _getType(self):
        if hasattr(self, "_type"):
            return self._type
        ast = self.tree()
        qxDefine = treeutil.findQxDefine(ast)
        classMap = treeutil.getClassMap(qxDefine)
        if 'type' in classMap:
            self._type = classMap['type'].get('value')
        elif 'extend' not in classMap:
            self._type = "static"  # this is qx.Class.define semantics!
        else:
            self._type = "normal"
        return self._type
        

    type = property(_getType)


    ##
    # classInfo = {
    #   'svariants' : ['qx.debug']    # supported variants
    #   'deps-<path>-<variants>' : ([<Dep>qx.Class#define], <timestamp>)  # class dependencies
    #   'messages-<variants>' : ["Hello %1"]  # message strings
    # }
    def _getClassCache(self):
        cache = self.context["cache"]
        classInfo, modTime = cache.read(self.cacheId, self.path, memory=True)
        if classInfo:
            return classInfo, modTime
        else:
            return {}, None
 
    def _writeClassCache(self, data):
        cache = self.context["cache"]
        cache.write(self.cacheId, data, memory=True)


    # --------------------------------------------------------------------------
    #   Tree Interface
    # --------------------------------------------------------------------------

    def _getSourceTree(self, cacheId, tradeSpaceForSpeed):

        # Lookup for unoptimized tree
        tree, _ = cache.read(cacheId, self.path, memory=tradeSpaceForSpeed)

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
        classVariants    = self.classVariants(generate=False) # just check the cache
        if classVariants == None:
            tree = self._getSourceTree(unoptCacheId, tradeSpaceForSpeed)
            classVariants= self._variantsFromTree(tree)

        relevantVariants = self.projectClassVariantsToCurrent(classVariants, variantSet)
        cacheId          = "tree-%s-%s" % (self.path, util.toString(relevantVariants))

        # Get the right tree to return
        if cacheId == unoptCacheId and tree:  # early return optimization
            return tree

        opttree, cacheMod = cache.read(cacheId, self.path, memory=tradeSpaceForSpeed)
        if not opttree:
            # start from source tree
            if tree:
                opttree = tree
            else:
                opttree = self._getSourceTree(unoptCacheId, tradeSpaceForSpeed)
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
                cache.write(cacheId, opttree, memory=tradeSpaceForSpeed, writeToFile=True)

        return opttree


    # --------------------------------------------------------------------------
    #   Variant Support
    # --------------------------------------------------------------------------

    ##
    # Return the list of variant keys (like "qx.debug") used in the source of
    # this class. Uses the plain source syntax tree and _variantsFromTree, and
    # caches to classCache.
    # Is used internally, but should also be usable as public interface.
    # 
    # @param generate {Boolean} whether to calculate the variant uses of the class
    #   afresh from the tree when they are not cached
    # @return {[String]} list of variant keys, e.g. ["qx.debug", ...]
    #
    def classVariants(self, generate=True):

        classinfo, _ = self._getClassCache()
        classvariants = None
        if classinfo == None or 'svariants' not in classinfo:  # 'svariants' = supported variants
            if generate:
                tree = self.tree({})  # get complete tree
                classvariants = self._variantsFromTree(tree) # get list of variant keys
                if classinfo == None:
                    classinfo = {}
                classinfo['svariants'] = classvariants
                self._writeClassCache (classinfo)
        else:
            classvariants = classinfo['svariants']

        return classvariants

    ##
    # Calculate uses of qx.core.Environment.select|get|... from the source tree.
    # This helper is used by both, tree() and classVariants(), to resolve mutual
    # recursion between them.
    #
    # @param  node {ecmascript.frontend.tree.Node} syntax tree to inspect (e.g.
    #   a file or class map)
    # @return {[String]}  list of variant keys, e.g. ["qx.debug", ...]
    #
    def _variantsFromTree(self, node):
        classvariants = set([])
        for variantNode in variantoptimizer.findVariantNodes(node):
            firstParam = treeutil.selectNode(variantNode, "../../params/1")
            if firstParam and treeutil.isStringLiteral(firstParam):
                classvariants.add(firstParam.get("value"))
            else:
                console.warn("qx.core.[Environment|Variant] call without literal argument")
        return classvariants


    ##
    # Only return those key:value pairs from <variantSet> that are supported
    # in <classVariants>.
    # 
    # @param classVariants {[String]} list of variant keys used in a class
    # @param variantSet {Map} map of variant key:value's used in current build
    # @return {Map} map of variant key:value's relevant for given class
    @staticmethod
    def projectClassVariantsToCurrent(classVariants, variantSet):
        #res = dict([(key,val) for key,val in variantSet.iteritems() if key in classVariants])
        # @deprecated
        res = dict([(key,val) for key,val in variantSet.iteritems() if (key in classVariants
                                           or (key.replace('<env>:','',1)) in classVariants)])
        return res


    # --------------------------------------------------------------------------
    #   Compile Interface
    # --------------------------------------------------------------------------

    def getCode(self, compOptions):
        def strip_comments(buffer):
            #TODO:
            return buffer

        optimize = compOptions.optimize
        variants = compOptions.variantset
        format = compOptions.format
        source_with_comments = compOptions.source_with_comments
        result = u''
        # source versions
        if not optimize:
            result = filetool.read(self.path)
            if not source_with_comments:
                result = strip_comments(result)
            # make sure it terminates with an empty line - better for cat'ing
            if result[-1:] != "\n":
                result += '\n'
        # compiled versions
        else:
            result = self._getCompiled(optimize, variants, format)

        return result


    def _getCompiled(self, optimize, variants, format):

        classVariants     = self.classVariants()
        relevantVariants  = self.projectClassVariantsToCurrent(classVariants, variants)
        variantsId        = util.toString(relevantVariants)
        optimizeId        = self._getOptimizeId(optimize)

        # Caution: This sharing cached compiled classes with TreeCompiler!
        cacheId = "compiled-%s-%s-%s-%s" % (self.path, variantsId, optimizeId, format)
        compiled, _ = cache.read(cacheId, self.path)

        if compiled == None:
            tree   = self.optimize(self.tree(variants), optimize)
            compiled = self.compile(tree, format)
            cache.write(cacheId, compiled)

        return compiled


    def _getOptimizeId(self, optimize):
        optimize = copy.copy(optimize)
        optimize.sort()
        return "[%s]" % ("-".join(optimize))


    def compile(self, tree, format=False):
        # Emulate options  -- TODO: Refac interface
        parser = optparse.OptionParser()
        parser.add_option("--p1", action="store_true", dest="prettyPrint", default=False)
        parser.add_option("--p2", action="store_true", dest="prettypIndentString", default="  ")
        parser.add_option("--p3", action="store_true", dest="prettypCommentsInlinePadding", default="  ")
        parser.add_option("--p4", action="store_true", dest="prettypCommentsTrailingCommentCols", default="")

        (options, args) = parser.parse_args([])

        return compiler.compile(tree, options, format)


    def optimize(self, tree, optimize=[], featureMap={}):

        def load_privates():
            cacheId  = privateoptimizer.privatesCacheId
            privates, _ = cache.read(cacheId, keepLock=True)
            if privates == None:
                privates = {}
            return privates

        def write_privates(globalprivs):
            cacheId  = privateoptimizer.privatesCacheId
            cache.write(cacheId, globalprivs)  # removes lock by default

        # -----------------------------------------------------------------------------

        if not optimize:
            return tree
        
        # 'statics' has to come before 'privates', as it needs the original key names in tree
        if "statics" in optimize:
            if not featureMap:
                console.warn("Empty feature map passed to static methods optimization; skipping")
            elif self.type == 'static' and self.id in featureMap:
                featureoptimizer.patch(tree, self.id, featureMap[self.id])

        if "basecalls" in optimize:
            basecalloptimizer.patch(tree)

        if "privates" in optimize:
            privatesMap = load_privates()
            privateoptimizer.patch(tree, id, privatesMap)
            write_privates(privatesMap)

        if "strings" in optimize:
            tree = self._stringOptimizer(tree)

        if "variables" in optimize:
            variableoptimizer.search(tree)

        return tree


    def _stringOptimizer(self, tree):
        stringMap = stringoptimizer.search(tree)

        if len(stringMap) == 0:
            return tree

        stringList = stringoptimizer.sort(stringMap)
        stringoptimizer.replace(tree, stringList)

        # Build JS string fragments
        stringStart = "(function(){"
        stringReplacement = stringoptimizer.replacement(stringList)
        stringStop = "})();"

        # Compile wrapper node
        wrapperNode = treeutil.compileString(stringStart+stringReplacement+stringStop, self.id + "||stringopt")

        # Reorganize structure
        funcBody = wrapperNode.getChild("operand").getChild("group").getChild("function").getChild("body").getChild("block")
        if tree.hasChildren():
            for child in copy.copy(tree.children):
                tree.removeChild(child)
                funcBody.addChild(child)

        # Add wrapper to tree
        tree.addChild(wrapperNode)

        return tree


    # --------------------------------------------------------------------------
    #   Dependencies Interface
    # --------------------------------------------------------------------------

    ##
    # Interface method
    #
    # return all dependencies of class from its code (both meta hints as well
    # as source code, and transitive load deps)

    def dependencies(self, variantSet):

        ##
        # Get deps from meta info and class code, and sort them into
        # load/run/ignore deps.
        #
        # Note:
        #   load time = before class = require
        #   run time  = after class  = use
        def buildShallowDeps():

            load   = []
            run    = []
            ignore = [DependencyItem(x, '', "|DefaultIgnoredNamesDynamic|") for x in DefaultIgnoredNamesDynamic]

            console.debug("Analyzing tree: %s" % self.id)
            console.indent()

            # Read meta data
            meta         = self.getHints()
            metaLoad     = meta.get("loadtimeDeps", [])
            metaRun      = meta.get("runtimeDeps" , [])
            metaOptional = meta.get("optionalDeps", [])
            metaIgnore   = meta.get("ignoreDeps"  , [])

            # Parse all meta keys for '#'
            for container,provider in ((load,metaLoad), (run,metaRun), (ignore,metaIgnore)):
                for key in provider:
                    sig = key.split('#',1)
                    className = sig[0]
                    attrName  = sig[1] if len(sig)>1 else ''
                    container.append(DependencyItem(className, attrName, self.id, "|hints|"))

            # Read source tree data
            treeDeps  = []  # will be filled by _analyzeClassDepsNode
            self._analyzeClassDepsNode(self.tree(variantSet), treeDeps, variantSet, inLoadContext=True)

            # Process source tree data
            for dep in treeDeps:
                if dep.isLoadDep:
                    if not "auto-require" in metaIgnore:
                        item = dep.name
                        if item in metaOptional:
                            pass
                        elif item in metaLoad:
                            console.warn("%s: #require(%s) is auto-detected" % (self.id, item))
                        else:
                            # adding all items to list (the second might have needsRecursion)
                            load.append(dep)

                else: # runDep
                    if not "auto-use" in metaIgnore:
                        item = dep.name
                        if item in metaOptional:
                            pass
                        #elif item in (x.name for x in load):
                        #    pass
                        elif item in metaRun:
                            console.warn("%s: #use(%s) is auto-detected" % (self.id, item))
                        else:
                            # adding all items to list (to comply with the 'load' deps)
                            run.append(dep)

            console.outdent()

            # Build data structure
            deps = {
                "load"   : load,
                "run"    : run,
                "ignore" : ignore,
            }

            return deps


        def buildTransitiveDeps(shallowDeps):
            newLoad = set(shallowDeps['load'])
            classMaps = {}
            for dep in shallowDeps['load']:
                if dep.needsRecursion:
                    recDeps = self.getTransitiveDeps(dep, variantSet, classMaps)
                    newLoad.update(recDeps)
            shallowDeps['load'] = list(newLoad)

            return shallowDeps


        ##
        # Check wether load dependencies are fresh which are included following
        # a depsItem.needsRecursion of the current class
        def transitiveDepsAreFresh(depsStruct, cacheModTime):
            result = True
            if cacheModTime is None:  # TODO: this can currently only occur with a Cache.memcache result
                result = False
            else:
                for dep in depsStruct["load"]:
                    if dep.requestor != self.id: # this was included through a recursive traversal
                        if dep.name in self._classesObj:
                            classObj = self._classesObj[dep.name]
                            if cacheModTime < classObj.m_time():
                                # if e.g. qx.Class was touched, this will invalidate a lot of depending classes!
                                console.debug("Invalidating dep cache for %s, as %s is newer" % (self.id, classObj.id))
                                result = False
                                break
            
            return result
        # -- Main ---------------------------------------------------------

        # handles cache and invokes worker function

        classVariants    = self.classVariants()
        relevantVariants = self.projectClassVariantsToCurrent(classVariants, variantSet)
        cacheId          = "deps-%s-%s" % (self.path, util.toString(relevantVariants))
        cached           = True

        classInfo, classInfoMTime = self._getClassCache()
        (deps, cacheModTime) =  classInfo[cacheId] if cacheId in classInfo else (None,None)

        if (deps == None
          or not transitiveDepsAreFresh(deps, cacheModTime)):
            cached = False
            deps = buildShallowDeps()
            deps = buildTransitiveDeps(deps)
            classInfo[cacheId] = (deps, time.time())
            self._writeClassCache(classInfo)

        
        return deps, cached

        # end:dependencies()


    # ----------------------------------------------------------------------------------
    # -- all methods below this line up to _analyzeClassDepsNode() are only used by that
    
    ##
    # Only applies to qx.*.define calls, checks for a 'defer' child in class map
    def checkDeferNode(self, assembled, node):
        deferNode = None
        if assembled == "qx.Class.define" or assembled == "qx.Bootstrap.define" or assembled == "qx.List.define":
            if node.hasParentContext("call/operand"):
                deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
        return deferNode


    def isUnknownClass(self, assembled, node, fileId):
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
        

    ##
    # Checks if the required class is known, and the reference to is in a
    # context that is executed at load-time
    def followCallDeps(self, node, fileId, depClassName, inLoadContext):
        
        def hasFollowContext(node):
            pchn = node.getParentChain()
            pchain = "/".join(pchn)
            return (
                #pchain.endswith("keyvalue/value/call/operand")               # limited version
                #or pchain.endswith("instantiation/expression/call/operand")  # limited version
                pchain.endswith("call/operand")                 # it's a function call
                or pchain.endswith("instantiation/expression")  # like "new Date" (no parenthesies, but constructor called anyway)
                )

        if (inLoadContext
            and depClassName
            and depClassName in self._classesObj  # we have a class id
            and hasFollowContext(node)
           ):
            return True
        else:
            return False


    ##
    # analyze a class AST for dependencies (compiler hints not treated here)
    # does not follow dependencies to other classes (ie. it's a "shallow" analysis)!
    # the "variants" param is only to support getTransitiveDeps()!
    #
    # i tried an iterative version once, wrapping the main function body into a
    # loop over treeutil.nodeIteratorNonRec(); surprisingly, it seem slightly
    # slower than the recursive version on first measurements; also, it still
    # needed a recursive call when coming across a 'defer' node, and i'm not
    # sure how to handle this sub-recursion when the main body is an iteration.
    # TODO:
    # - <recurse> seems artificial, and should be removed when cleaning up dependencies1()
    def _analyzeClassDepsNode(self, node, depsList, variants, inLoadContext, inDefer=False):

        if node.type == "variable":
            assembled = (treeutil.assembleVariable(node))[0]

            # treat dependencies in defer as requires
            deferNode = self.checkDeferNode(assembled, node)
            if deferNode != None:
                self._analyzeClassDepsNode(deferNode, depsList, variants, inLoadContext=True, inDefer=True)

            (context, className, classAttribute) = self._isInterestingReference(assembled, node, self.id, inDefer)
            # postcond: 
            # - if className != '' it is an interesting reference
            # - might be a known qooxdoo class, or an unknown class (use 'className in self._classes')
            # - if assembled contained ".", classAttribute will contain approx. non-class part

            if className:
                # we allow self-references, to be able to track method dependencies within the same class
                if className == 'this':
                    className = self.id
                elif inDefer and className in DEFER_ARGS:
                    className = self.id
                if not classAttribute:  # see if we have to provide 'construct'
                    if node.hasParentContext("instantiation/*/*/operand"): # 'new ...' position
                        classAttribute = 'construct'
                depsItem = DependencyItem(className, classAttribute, self.id, node.get('line', -1), inLoadContext)
                #print "-- adding: %s (%s:%s)" % (className, treeutil.getFileFromSyntaxItem(node), node.get('line',False))
                if node.hasParentContext("call/operand"): # it's a function call
                    depsItem.isCall = True  # interesting when following transitive deps

                # Adding all items to list; let caller sort things out
                depsList.append(depsItem)

                # Mark items that need recursive analysis of their dependencies (bug#1455)
                if self.followCallDeps(node, self.id, className, inLoadContext):
                    depsItem.needsRecursion = True

        elif node.type == "body" and node.parent.type == "function":
            if (node.parent.hasParentContext("call/operand") 
                or node.parent.hasParentContext("call/operand/group")):
                # if the function is immediately called, it's still load context (if that's what it was before)
                pass
            else:
                inLoadContext = False

        if node.hasChildren():
            for child in node.children:
                self._analyzeClassDepsNode(child, depsList, variants, inLoadContext, inDefer)

        return

        # end:_analyzeClassDepsNode


    def _isInterestingReference(self, assembled, node, fileId, inDefer):

        def checkNodeContext(node):
            context = 'interesting' # every context is interesting, mybe we get more specific
            #context = ''

            # filter out the occurrences like 'c' in a.b().c
            myFirst = node.getFirstChild(mandatory=False, ignoreComments=True)
            if not treeutil.checkFirstChainChild(myFirst): # see if myFirst is the first identifier in a chain
                context = ''

            # filter out variable in lval position -- Nope! (qx.ui.form.ListItem.prototype.setValue = 
            # function(..){...};)
            #elif (node.hasParentContext("assignment/left")):
            #    context = ''

            # fitler out a.b[c] -- Nope! E.g. foo.ISO_8601_FORMAT might carry further dependencies
            # (like 'new qx.util.format.DateFormat("yyyy-MM-dd")')
            elif (treeutil.selectNode(node, "accessor")):
                context = 'accessor'

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
            # accept 'this', as we want to track dependencies within the same class
            if assembled[:4] == "this":
                if len(assembled) == 4 or (len(assembled) > 4 and assembled[4] == "."):
                    return True
            # skip built-in classes (Error, document, RegExp, ...); GLOBALS contains 'this' and 'arguments'
            if GlobalSymbolsCombinedPatt.search(assembled):
                return False
            firstDot = assembled.find(".")
            if firstDot:
                firstElement = assembled[:firstDot]
            else:
                firstElement = assembled
            if inDefer and firstElement in DEFER_ARGS:
                return True
            # skip scoped vars - expensive, therefore last test
            elif self._isScopedVar(assembled, node, fileId):
                return False
            else:
                return True

        def attemptSplitIdentifier(context, assembled):
            # try qooxdoo classes first
            className, classAttribute = self._splitQxClass(assembled)
            if className:
                return className, classAttribute

            # check some scoped vars that equal 'this'
            parts = assembled.split(".")  # split on ".", if any
            if parts[0] in (("this",) + DEFER_ARGS):
                className, classAttribute = parts[0], (parts[1] if len(parts)>1 else '') # this also strips parts[>1]
                return className, classAttribute
            
            # now handle non-qooxdoo classes
            className, classAttribute = assembled, ''
            if context == 'new':
                className = assembled
            elif context == 'extend':
                className = assembled
            #elif context in ('call', 'accessor'):
            else:
                # try split at last dot
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
            if isInterestingIdentifier(assembled): # filter some local or build-in names
                nameBase, nameExtension = attemptSplitIdentifier(context, assembled)

        return context, nameBase, nameExtension

        # end:_isInterestingReference()


    ##
    # this supersedes reduceAssembled(), improving the return value
    def _splitQxClass(self, assembled):
        className = classAttribute = ''
        if assembled in self._classesObj:  # short cut
            className = assembled
        elif "." in assembled:
            for entryId in self._classesObj:
                if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                    if len(entryId) > len(className): # take the longest match
                        className      = entryId
                        classAttribute = assembled[ len(entryId) +1 :]  # skip entryId + '.'
                        # see if classAttribute is chained, too
                        dotidx = classAttribute.find(".")
                        if dotidx > -1:
                            classAttribute = classAttribute[:dotidx]    # only use the first component
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
            # -- looking up nodes in a Script() uses object identity for comparison; sometimes, the
            #    tree _analyzeClassDepsNode works on and the tree Script is built from are not the
            #    same in memory, e.g. when the tree is re-read from disk; then those comparisons
            #    fail (although the nodes are semantically the same); hence we have to
            #    re-calculate the Script (which is expensive!) when the root node object changes;
            #    using __memo allows at least to re-use the existing script when a class is worked
            #    on and this method is called successively for the same tree.
            rootNode = findRoot(node)
            #if _memo1_[0] == fileId: # replace with '_memo1_[0] == rootNode', to make it more robust, but slightly less performant
            if _memo1_[0] == rootNode:
                #print "-- re-using scopes for: %s" % fileId
                script = _memo1_[1]
            else:
                #print "-- re-calculating scopes for: %s" % fileId
                script = Script(rootNode, fileId)
                _memo1_[0], _memo1_[1] = rootNode, script
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


    # --------------------------------------------------------------------
    # -- Method Dependencies Support

    ##
    # find the class the given <methodId> is defined in; start with the
    # given class, inspecting its class map to find the method; if
    # unsuccessful, recurse on the potential super class and mixins; return
    # the defining class name, and the tree node defining the method
    # (actually, the map value of the method name key, whatever that is)
    #
    # @out <string> class that defines method
    # @out <tree>   tree node value of methodId in the class map

    def findClassForFeature(self, featureId, variants, classMaps):

        # get the method name
        clazzId = self.id
        if  featureId == u'':  # corner case: bare class reference outside "new ..."
            return clazzId, featureId
        elif featureId == "getInstance": # corner case: singletons get this from qx.Class
            clazzId = "qx.Class"
        elif featureId in ('call', 'apply'):  # this might get overridden, oh well...
            clazzId = "Function"
        # TODO: getter/setter are also not lexically available!
        # handle .call() ?!
        if clazzId not in self._classesObj: # can't further process non-qooxdoo classes
            # TODO: maybe this should better use something like isInterestingIdentifier()
            # to invoke the same machinery for filtering references like in other places
            return None, None

        # early return if class id is finalized
        if clazzId != self.id:
            classObj = self._classesObj[clazzId]
            featureNode = self.getFeatureNode(featureId, variants)
            if featureNode:
                return clazzId, featureNode
            else:
                return None, None

        # now try this class
        if self.id in classMaps:
            classMap = classMaps[self.id]
        else:
            classMap = classMaps[self.id] = self.getClassMap (variants)
        featureNode = self.getFeatureNode(featureId, variants, classMap)
        if featureNode:
            return self.id, featureNode

        if featureId == 'construct':  # constructor requested, but not supplied in class map
            # supply the default constructor
            featureNode = treeutil.compileString("function(){this.base(arguments);}", self.path)
            return self.id, featureNode

        # inspect inheritance/mixins
        parents = []
        extendVal = classMap.get('extend', None)
        if extendVal:
            extendVal = treeutil.variableOrArrayNodeToArray(extendVal)
            parents.extend(extendVal)
            # this.base calls
            if featureId == "base":
                classId = parents[0]  # first entry must be super-class
                if classId in self._classesObj:
                    return self._classesObj[classId].findClassForFeature('construct', variants, classMaps)
                else:
                    return None, None
        includeVal = classMap.get('include', None)
        if includeVal:
            # 'include' value according to Class spec.
            if includeVal.type in ('variable', 'array'):
                includeVal = treeutil.variableOrArrayNodeToArray(includeVal)
            
            # assume qx.core.Variant.select() call
            else:
                _, branchMap = variantoptimizer.getSelectParams(includeVal)
                includeVal = set()
                for key in branchMap: # just pick up all possible include values
                    includeVal.update(treeutil.variableOrArrayNodeToArray(branchMap[key]))
                includeVal = list(includeVal)

            parents.extend(includeVal)

        # go through all ancestors
        for parClass in parents:
            if parClass not in self._classesObj:
                continue
            parClassObj = self._classesObj[parClass]
            rclass, keyval = parClassObj.findClassForFeature(featureId, variants, classMaps)
            if rclass:
                return rclass, keyval
        return None, None

    
    ##
    # Returns the AST node of a class feature (e.g. memeber method) if it exists
    def getFeatureNode(self, featureId, variants, classMap=None):

        def classHasOwnMethod(classAttribs, featId):
            candidates = {}
            candidates.update(classAttribs.get("members",{}))
            candidates.update(classAttribs.get("statics",{}))
            if "construct" in classAttribs:
                candidates.update(dict((("construct", classAttribs.get("construct")),)))
            if featId in candidates.keys():
                return candidates[featId]  # return the definition of the attribute
            else:
                return None

        if not classMap:
            classMap = self.getClassMap(variants)
        keyval = classHasOwnMethod( classMap, featureId)
        if keyval:
            return keyval
        else:
            return None


    def getClassMap(self, variants):
        tree = self.tree (variants)
        qxDefine = treeutil.findQxDefine (tree)
        classMap = treeutil.getClassMap (qxDefine)

        return classMap

    ##
    # add to global result set sanely
    def resultAdd(self, depsItem, localDeps):
        # cyclic check
        if depsItem in (localDeps):
            console.debug("Class.method already seen, skipping: %s#%s" % (depsItem.name, depsItem.attribute))
            return False
        localDeps.add(depsItem)
        return True


    ##
    # Find all run time dependencies of a given method, recursively.
    #
    # Outline:
    # - get the immediate runtime dependencies of the current method; for each
    #   of those dependencies:
    # - if it is a "<name>.xxx" method/attribute:
    #   - add this class#method dependency  (class symbol is required, even if
    #     the method is defined by super class)
    #   - find the defining class (<name>, ancestor of <name>, or mixin of
    #     <name>): findClassForFeature()
    #   - add defining class to dependencies (class symbol is required for
    #     inheritance)
    #   - recurse on dependencies of defining class#method, adding them to the
    #     current dependencies
    #
    # currently only a thin wrapper around its recursive sibling, getTransitiveDepsR

    def getTransitiveDeps(self, depsItem, variants, classMaps, checkSet=None):

        ##
        # find dependencies of a method <methodId> that has been referenced from
        # <classId>. recurse on the immediate dependencies in the method code.
        #
        # @param deps accumulator variable set((c1,m1), (c2,m2),...)
        
        def getTransitiveDepsR(dependencyItem, variantString, totalDeps):

            # We don't add the in-param to the global result
            classId  = dependencyItem.name
            methodId = dependencyItem.attribute
            function_pruned = False

            # Check cache
            cacheId = "methoddeps-%r-%r-%r" % (classId, methodId, variantString)
            cachedDeps, _ = cache.read(cacheId, memory=True)  # no use to put this into a file, due to transitive dependencies to other files
            if cachedDeps != None:
                console.debug("using cached result")
                #print "\nusing cached result for", classId, methodId
                return cachedDeps

            # Need to calculate deps
            console.dot("_")

            # Check known class
            if classId not in self._classesObj:
                console.debug("Skipping unknown class of dependency: %s#%s (%s:%d)" % (classId, methodId,
                              dependencyItem.requestor, dependencyItem.line))
                return set()

            # Check other class
            elif classId != self.id:
                classObj = self._classesObj[classId]
                otherdeps = classObj.getTransitiveDeps(dependencyItem, variants, classMaps, totalDeps)
                return otherdeps

            # Check own hierarchy
            defClassId, attribNode = self.findClassForFeature(methodId, variants, classMaps)

            # lookup error
            if not defClassId or defClassId not in self._classesObj:
                console.debug("Skipping unknown definition of dependency: %s#%s (%s:%d)" % (classId, 
                              methodId, dependencyItem.requestor, dependencyItem.line))
                return set()
            
            defDepsItem = DependencyItem(defClassId, methodId, classId)
            localDeps   = set()

            # inherited feature
            if defClassId != classId:
                self.resultAdd(defDepsItem, localDeps)
                defClass = self._classesObj[defClassId]
                otherdeps = defClass.getTransitiveDeps(defDepsItem, variants, classMaps, totalDeps)
                localDeps.update(otherdeps)
                return localDeps

            # Process own deps
            console.debug("%s#%s dependencies:" % (classId, methodId))
            console.indent()

            if isinstance(attribNode, Node):

                if (attribNode.getChild("function", False)       # is it a function(){..} value?
                    and not dependencyItem.isCall                # and the reference was no call
                   ):
                    function_pruned = True
                    pass                                         # don't lift those deps
                else:
                    # Get the method's immediate deps
                    # TODO: is this the right API?!
                    depslist = []
                    self._analyzeClassDepsNode(attribNode, depslist, variants, inLoadContext=False)
                    console.debug( "shallow dependencies: %r" % (depslist,))

                    for depsItem in depslist:
                        if depsItem in totalDeps:
                            continue
                        if self.resultAdd(depsItem, localDeps):
                            # Recurse dependencies
                            downstreamDeps = getTransitiveDepsR(depsItem, variants, totalDeps.union(localDeps))
                            localDeps.update(downstreamDeps)

            # Cache update
            # ---   i cannot cache currently, if the deps of a function are pruned
            #       when the function is passed as a ref, rather than called (s. above
            #       around 'attribNode.getChild("function",...)')
            if not function_pruned:
                cache.write(cacheId, localDeps, memory=True, writeToFile=False)
             
            console.outdent()
            return localDeps

        # -- getTransitiveDeps -------------------------------------------------

        checkset = checkSet or set()
        variantString = util.toString(variants)
        deps = getTransitiveDepsR(depsItem, variantString, checkset) # checkset is currently not used, leaving it for now

        return deps


    # --------------------------------------------------------------------------
    #   I18N Support
    # --------------------------------------------------------------------------

    ##
    # returns array of message dicts [{method:, line:, column:, hint:, id:, plural:},...]
    def messageStrings(self, variants):
        # this duplicates codef from Locale.getTranslation
        
        classVariants     = self.classVariants()
        relevantVariants  = self.projectClassVariantsToCurrent(classVariants, variants)
        variantsId        = util.toString(relevantVariants)
        cacheId           = "messages-%s" % (variantsId,)
        cached            = True

        #messages, _ = cache.readmulti(cacheId, self.path)
        classInfo, cacheModTime = self._getClassCache()
        messages = classInfo[cacheId] if cacheId in classInfo else None
        if messages != None:
            return messages, cached

        console.debug("Looking for message strings: %s..." % self.id)
        console.indent()
        cached = False

        tree = self.tree(variants)

        try:
            messages = self._findTranslationBlocks(tree, [])
        except NameError, detail:
            raise RuntimeError("Could not extract message strings from %s!\n%s" % (self.id, detail))

        if len(messages) > 0:
            console.debug("Found %s message strings" % len(messages))

        console.outdent()
        #cache.writemulti(cacheId, messages)
        classInfo[cacheId] = messages
        self._writeClassCache(classInfo)

        return messages, cached


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


    def _concatOperation(self, node):
        result = ""

        try:
            first = node.getChild("first").getChildByTypeAndAttribute("constant", "constantType", "string")
            result += first.get("value")

            second = node.getChild("second").getFirstChild(True, True)
            if second.type == "operation":
                result += self._concatOperation(second)
            else:
                result += second.get("value")

        except tree.NodeAccessException:
            self._console.warn("Unknown expression as argument to translation method at line %s" % (node.get("line"),))

        return result



    # --------------------------------------------------------------------------
    #   Resource Support
    # --------------------------------------------------------------------------

    def getAssets(self, assetMacros={}):

        if self._assetRegex == None:
            # prepare a regex encompassing all asset hints, asset macros resolved
            classAssets = self.getHints()['assetDeps'][:]
            iresult  = []  # [AssetHint]
            for res in classAssets:
                # expand file glob into regexp
                res = re.sub(r'\*', ".*", res)
                # expand macros
                if res.find('${')>-1:
                    expres = self._expandMacrosInMeta(assetMacros, res)
                else:
                    expres = [res]
                # collect resulting asset objects
                for e in expres:
                    assethint = AssetHint(res)
                    assethint.clazz = self
                    assethint.expanded = e
                    assethint.regex = re.compile(e)
                    if assethint not in iresult:
                        iresult.append(assethint)
            self._assetRegex = iresult

        return self._assetRegex


    ##
    # expand asset macros in asset strings, like "qx/decoration/${theme}/*"
    def _expandMacrosInMeta(self, assetMacros, res):
        
        def expMacRec(rsc):
            if rsc.find('${')==-1:
                return [rsc]
            result = []
            nres = rsc[:]
            mo = re.search(r'\$\{(.*?)\}',rsc)
            if mo:
                themekey = mo.group(1)
                if themekey in assetMacros:
                    # create an array with all possibly variants for this replacement
                    iresult = []
                    for val in assetMacros[themekey]:
                        iresult.append(nres.replace('${'+themekey+'}', val))
                    # for each variant replace the remaining macros
                    for ientry in iresult:
                        result.extend(expMacRec(ientry))
                else:
                    nres = nres.replace('${'+themekey+'}','') # just remove '${...}'
                    nres = nres.replace('//', '/')    # get rid of '...//...'
                    result.append(nres)
                    console.warn("Warning: (%s): Cannot replace macro '%s' in #asset hint" % (self.id, themekey))
            else:
                raise SyntaxError, "Non-terminated macro in string: %s" % rsc
            return result

        result = expMacRec(res)
        return result


    # --------------------------------------------------------------------------
    #   Compiler Hints Support
    # --------------------------------------------------------------------------

    HEAD = {
        "require"  : re.compile(r"^\s* \#require  \(\s* (%s+)     \s*\)" % (lang.IDENTIFIER_CHARS[:-1]+'#]',), re.M|re.X),
        "use"      : re.compile(r"^\s* \#use      \(\s* (%s+)     \s*\)" % (lang.IDENTIFIER_CHARS[:-1]+'#]',), re.M|re.X),
        "optional" : re.compile(r"^\s* \#optional \(\s* (%s+)     \s*\)" % (lang.IDENTIFIER_CHARS[:-1]+'#]',), re.M|re.X),
        "ignore"   : re.compile(r"^\s* \#ignore   \(\s* (%s+)     \s*\)" % (lang.IDENTIFIER_CHARS[:-1]+'#]',), re.M|re.X),
        "asset"    : re.compile(r"^\s* \#asset    \(\s* ([^)]+?)  \s*\)"                        , re.M|re.X),
        "cldr"     : re.compile(r"^\s*(\#cldr) (?:\(\s* ([^)]+?)  \s*\))?"                      , re.M|re.X),
    }


    def getHints(self, metatype=""):

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

        meta, _ = cache.readmulti(cacheId, filePath)
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
            e.args = (e.args[0] + u' in: %r' % filePath,) + e.args[1:]
            raise e
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
                for optional in self.getHints(classId)["optionalDeps"]:
                    if not optional in includeWithDeps and not optional in result:
                        result.append(optional)

            # Not all meta data contains optional infos
            except KeyError:
                continue

        return result



class DependencyItem(object):
    def __init__(self, name, attribute, requestor, line=-1, isLoadDep=False):
        self.name           = name       # "qx.Class" [dependency to (class)]
        assert isinstance(name, types.StringTypes)
        self.attribute      = attribute  # "methodA"   [dependency to (class.attribute)]
        self.requestor      = requestor  # "gui.Application" [the one depending on this item]
        self.line           = line       # 147        [source line in dependent's file]
        self.isLoadDep      = isLoadDep  # True       [load or run dependency]
        self.needsRecursion = False      # this is a load-time dep that draws in external deps recursively
        self.isCall         = False      # whether the reference is a function call
    def __repr__(self):
        return "<DepItem>:" + self.name + "#" + self.attribute
    def __str__(self):
        return self.name + "#" + self.attribute
    def __eq__(self, other):
        return self.name == other.name and self.attribute == other.attribute
    def __hash__(self):
        return hash(self.name + self.attribute)


##
# Throw this in cases of dependency problems
class DependencyError(ValueError): pass

 
##
# Auxiliary class for ClassDependencies() (although of more general appeal)
class ClassMap(object):
    def __init__(self):
        # after http://manual.qooxdoo.org/current/pages/core/class_quickref.html
        self.data = {
            'type'      : None,
            'extend'    : [],
            'implement' : [],
            'include'   : [],
            'construct' : [],
            'statics'   : {},  # { foo1 : [<dep1>,...], foo2 : [<dep2>,...] }
            'properties': {},
            'members'   : {},  # { foo1 : [<dep1>,...], foo2 : [<dep2>,...] }
            'settings'  : [],
            'variants'  : [],
            'events'    : [],
            'defer'     : [],
            'destruct'  : [],
        }
        return


##
# Captures the dependencies of a class (-file)
# - the main purpose of this is to have an accessible, shallow representation of
#   a class' dependencies, for caching and traversing
class ClassDependencies(object):
    def __init__(self):
        self.data = {
            'require' : [], # [qx.Class#define, #require(...), ... <other top-level code symbols>]
            'use'     : [], # [#use(...)]
            'optional': [], # [#optional(...)]
            'ignore'  : [], # [#ignore(...)]
            'classes' : {}, # {"classId" : ClassMap(), where the map values are lists of depsItems}
            }
        return

    ##
    # only iterates over the 'classes'
    def dependencyIterator(self):
        for classid, classMapObj in self.data['classes'].items():
            classMap = classMapObj.data
            for attrib in classMap:
                if isinstance(classMap[attrib], types.ListType):    # .defer
                    for dep in classMap[attrib]:
                        yield dep
                elif isinstance(classMap[attrib], types.DictType):  # .statics, .members, ...
                    for subattrib in classMap[attrib]:
                        for dep in classMap[attrib][subattrib]:     # e.g. methods
                            yield dep

    def getAttributeDeps(self, attrib):  # attrib="ignore", "qx.Class#define"
        res  = []
        data = self.data
        # top level
        if attrib.find('#')== -1:
            res = data[attrib]
        # class map
        else:
            classId, attribId = attrib.split('#', 1)
            data = data['classes'][classId].data
            if attribId in data:
                res = data[attribId]
            else:
                for submap in ('statics', 'members', 'properties'):
                    if attribId in data[submap]:
                        res = data[submap][attribId]
                        break
        return res
        

##
# Class to represent ["qx.util.*", "qx.core.Object"] et al.
# (like used in "include" and "exclude" config keys), to provide an
# encapsulated "match" method
class ClassMatchList(object):
    def __init__(self, matchlist):
        assert isinstance(matchlist, types.ListType)
        self.matchlist = matchlist   # ["a.b.c.*", "d.e.Foo"]
        elems = []
        for elem in matchlist:
            assert isinstance(elem, types.StringTypes)
            if elem != "":
                regexp = textutil.toRegExpS(elem)
                elems.append(regexp)
        if elems:
            self.__regexp = re.compile("|".join(elems))
        else:
            self.__regexp = r".\A"  # match none

    def isEmpty(self):
        return len(self.matchlist) == 0

    def match(self, classId):
        return self.__regexp.search(classId)


##
# Class to collect various options which influence the compilation process
# (optimizations, format, variants, ...)
class CompileOptions(object):
    def __init__(self, optimize=[], variants={}, _format=False, source_with_comments=False):
        self.optimize   = optimize
        self.variantset = variants
        self.format     = _format
        self.source_with_comments = source_with_comments
        self.privateMap = {} # {"<classId>:<private>":"<repl>"}

