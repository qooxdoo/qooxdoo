#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
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
# generator.code.Class Mixin: class dependencies
##

import sys, os, types, re, string, time
from ecmascript.frontend import treeutil, lang
from ecmascript.frontend.Script     import Script
from ecmascript.frontend.tree       import Node, NODE_VARIABLE_TYPES
from ecmascript.transform.optimizer import variantoptimizer
from generator.code.DependencyItem  import DependencyItem
from misc import util

ClassesAll = None # {'cid':generator.code.Class}

QXGLOBALS = [
    #"clazz",
    "qxvariants",
    "qxsettings",
    r"qx\.\$\$",    # qx.$$domReady, qx.$$libraries, ...
    ]

GlobalSymbolsCombinedPatt = re.compile('|'.join(r'^%s\b' % x for x in lang.GLOBALS + QXGLOBALS))

_memo1_ = [None, None]  # for memoizing getScript()

DEFER_ARGS = ("statics", "members", "properties")


class MClassDependencies(object):

    # --------------------------------------------------------------------------
    #   Dependencies Interface
    # --------------------------------------------------------------------------

    ##
    # Interface method
    #
    # return all dependencies of class from its code (both meta hints as well
    # as source code, and transitive load deps)

    def dependencies(self, variantSet, force=False, tree=None):

        ##
        # Get deps from meta info and class code, and sort them into
        # load/run/ignore deps.
        #
        # Note:
        #   load time = before class = require
        #   run time  = after class  = use
        def buildShallowDeps(tree=None):

            load   = []
            run    = []
            ignore = [DependencyItem(x, '', "|DefaultIgnoredNamesDynamic|") for x in self.defaultIgnoredNamesDynamic]

            console.debug("Analyzing tree: %s" % self.id)
            console.indent()

            # Read meta data
            meta         = self.getHints()
            metaLoad     = meta.get("loadtimeDeps", [])
            metaRun      = meta.get("runtimeDeps" , [])
            metaOptional = meta.get("optionalDeps", [])
            metaIgnore   = meta.get("ignoreDeps"  , [])
            metaIgnore.extend(metaOptional)

            # regexify globs in metaignore
            metaIgnore = map(MetaIgnore, metaIgnore)

            # Turn strings into DependencyItems()
            for target,metaHint in ((load,metaLoad), (run,metaRun), (ignore,metaIgnore)):
                for key in metaHint:
                    # add all feature checks if requested
                    if key == "feature-checks" and metaHint in (metaLoad, metaRun):
                        target.extend(self.getAllEnvChecks(-1, metaHint==metaLoad))
                    # turn an entry into a DependencyItem
                    elif isinstance(key, types.StringTypes):
                        sig = key.split('#',1)
                        className = sig[0]
                        attrName  = sig[1] if len(sig)>1 else ''
                        target.append(DependencyItem(className, attrName, self.id, "|hints|"))

            # Read source tree data
            if not tree:
                if variantSet: # a filled variantSet map means that "variants" optimization is wanted
                    tree = self.optimize(None, ["variants"], variantSet)
                else:
                    tree = self.tree()

            # analyze tree
            treeDeps  = []  # will be filled by _analyzeClassDepsNode
            self._analyzeClassDepsNode(tree, treeDeps, inLoadContext=True)

            # Process source tree data
            for dep in treeDeps:
                if dep.isLoadDep:
                    if "auto-require" not in metaIgnore:
                        item = dep.name
                        if item in metaIgnore:
                            pass
                        elif item in metaLoad:
                            console.warn("%s: #require(%s) is auto-detected" % (self.id, item))
                        else:
                            # adding all items to list (the second might have needsRecursion)
                            load.append(dep)

                else: # runDep
                    if "auto-use" not in metaIgnore:
                        item = dep.name
                        if item in metaIgnore:
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
                    recDeps = self.getTransitiveDeps(dep, variantSet, classMaps, force=force)  # need variantSet here (not relevantVariants), as the recursive deps might depend on any of those
                    for recdep in recDeps:
                        recdep.isLoadDep = True # all these become load dependencies
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
                        if dep.name in ClassesAll:
                            classObj = ClassesAll[dep.name]
                            if cacheModTime < classObj.m_time():
                            #if cacheModTime < classObj.library.mostRecentlyChangedFile()[1]:
                                console.debug("Invalidating dep cache for %s, as %s is newer" % (self.id, classObj.id))
                                result = False
                                break
                                # checking classObj.m_time() was done a lot, and was a major time consumer,
                                # esp. when building demobrowser; just checking a library's youngest entry is
                                # much faster, as it is only calculated once (when called without (force=True));
                                # the downside is that a change of one class in a library will result in cache
                                # invalidation for *all* classes in this lib; that's the trade-off;
                                # i'd love to just check the libs directly ("for lib in script.libraries: 
                                # if cacheModTime < lib.mostRecentlyChangedFile()[1]:..."), but I don't
                                # have access to the script here in Class.
            
            return result
        # -- Main ---------------------------------------------------------

        # handles cache and invokes worker function

        console = self.context['console']

        classVariants    = self.classVariants()
        relevantVariants = self.projectClassVariantsToCurrent(classVariants, variantSet)
        cacheId          = "deps-%s-%s" % (self.path, util.toString(relevantVariants))
        cached           = True

        classInfo, classInfoMTime = self._getClassCache()
        (deps, cacheModTime) =  classInfo[cacheId] if cacheId in classInfo else (None,None)

        if (deps == None
          or force == True
          or not transitiveDepsAreFresh(deps, cacheModTime)):
            cached = False
            deps = buildShallowDeps(tree)
            deps = buildTransitiveDeps(deps)
            if not tree: # don't cache for a passed-in tree
                classInfo[cacheId] = (deps, time.time())
                self._writeClassCache(classInfo)
        
        return deps, cached

        # end:dependencies()


    def getCombinedDeps(self, classesAll_, variants, config, stripSelfReferences=True, projectClassNames=True, genProxy=None, force=False, tree=None):

        # init lists
        global ClassesAll
        ClassesAll = classesAll_  # TODO: this is a quick hack, to not have to pass classesAll_ around as param
        loadFinal = []
        runFinal  = []

        # add static dependencies
        if genProxy == None:
            static, cached = self.dependencies (variants, force, tree=tree)
        else:
            static, cached = genProxy.dependencies(self.id, self.path, variants)

        loadFinal.extend(static["load"])
        runFinal.extend(static["run"])

        # fix self-references
        if stripSelfReferences:
            loadFinal = [x for x in loadFinal if x.name != self.id]
            runFinal  = [x for x in runFinal  if x.name != self.id]

        # collapse multiple occurrences of the same class
        if projectClassNames:
            def dedup(deps):
                out = []
                seen = set()
                for dep in deps:
                    name = dep.name
                    if name in seen:
                        continue
                    seen.add(name)
                    out.append(dep)
                return out

            loadFinal = dedup(loadFinal)
            runFinal = dedup(runFinal)

        # add config dependencies
        crequire = config.get("require", {})
        if self.id in crequire:
            loadFinal.extend(DependencyItem(x, '', "|config|") for x in crequire[self.id])

        cuse = config.get("use", {})
        if self.id in cuse:
            runFinal.extend(DependencyItem(x, '', "|config|") for x in cuse[self.id])

        # result dict
        deps = {
            "load"   : loadFinal,
            "run"    : runFinal,
            "ignore" : static['ignore'],
        }

        return deps, cached


    # ----------------------------------------------------------------------------------
    # -- all methods below this line up to _analyzeClassDepsNode() are only used by that

    ##
    # Only applies to qx.*.define calls, checks for a 'defer' child in class map
    def checkDeferNode(self, assembled, node):
        deferNode = None
        if assembled == "qx.Class.define" or assembled == "qx.Bootstrap.define" or assembled == "q.define":
            if node.hasParentContext("call/operand"):
                deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
        return deferNode


    def isUnknownClass(self, assembled, node, fileId):
        # check name in 'new ...' position
        if (treeutil.isNEWoperand(node)
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
    # Checks if the required class is known, and the reference to it is in a
    # context that is executed at load-time
    def followCallDeps(self, node, fileId, depClassName, inLoadContext):
        
        def hasFollowContext(node):
            pchn = node.getParentChain()
            pchain = "/".join(pchn)
            return (
                pchain.endswith("call/operand")  # it's a function call
                or treeutil.isNEWoperand(node)   # it's a 'new' operation
                )

        if (inLoadContext
            and depClassName
            and depClassName in ClassesAll  # we have a class id
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
    def _analyzeClassDepsNode(self, node, depsList, inLoadContext, inDefer=False):

        if node.isVar():
            if node.dep:
                depsList.append(node.dep)
                return
                
            assembled = (treeutil.assembleVariable(node))[0]

            # treat dependencies in defer as requires
            deferNode = self.checkDeferNode(assembled, node)
            if deferNode != None:
                self._analyzeClassDepsNode(deferNode, depsList, inLoadContext=True, inDefer=True)

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
                #if self.id=="feedreader.model.FeedFolder" and className=="qx.data.Array":
                #    import pydb; pydb.debugger()
                if not classAttribute:  # see if we have to provide 'construct'
                    if treeutil.isNEWoperand(node):
                        classAttribute = 'construct'
                # Can't do the next; it's catching too many occurrences of 'getInstance' that have
                # nothing to do with the singleton 'getInstance' method (just grep in the framework)
                #elif classAttribute == 'getInstance':  # erase 'getInstance' and introduce 'construct' dependency
                #    classAttribute = 'construct'
                line = node.get('line',0)
                depsItem = DependencyItem(className, classAttribute, self.id, line if line else -1, inLoadContext)
                #print "-- adding: %s (%s:%s)" % (className, treeutil.getFileFromSyntaxItem(node), node.get('line',False))
                if node.hasParentContext("call/operand"): # it's a function call
                    depsItem.isCall = True  # interesting when following transitive deps

                # Adding all items to list; let caller sort things out
                depsList.append(depsItem)
                node.dep = depsItem

                # Mark items that need recursive analysis of their dependencies (bug#1455)
                if self.followCallDeps(node, self.id, className, inLoadContext):
                    depsItem.needsRecursion = True

        # check e.g. qx.core.Environment.get("runtime.name")
        elif node.type == "constant" and node.hasParentContext("call/params"):
            if node.dep:
                depsList.append(node.dep)
                return
            callnode = treeutil.selectNode(node, "../..")
            if variantoptimizer.isEnvironmentCall(callnode):
                className, classAttribute = self.getClassNameFromEnvKey(node.get("value", ""))
                if className:
                    depsItem = DependencyItem(className, classAttribute, self.id, node.get('line', -1), inLoadContext)
                    depsItem.isCall = True  # treat as if actual call, to collect recursive deps
                    if inLoadContext:
                        depsItem.needsRecursion = True
                    depsList.append(depsItem)
                    node.dep = depsItem


        elif node.type == "body" and node.parent.type == "function":
            if (node.parent.hasParentContext("call/operand") 
                or node.parent.hasParentContext("call/operand/group")):
                # if the function is immediately called, it's still load context (if that's what it was before)
                pass
            else:
                inLoadContext = False

        if node.hasChildren():
            for child in node.children:
                self._analyzeClassDepsNode(child, depsList, inLoadContext, inDefer)

        return

        # end:_analyzeClassDepsNode


    def getAllEnvChecks(self, nodeline, inLoadContext):
        result = []
        envmappings = self.context['envchecksmap']
        for key in envmappings:
            clsname, clsattribute = self.getClassNameFromEnvKey(key)
            result.append(DependencyItem(clsname, clsattribute, self.id, nodeline, inLoadContext))
        return result


    ##
    # Looks up the environment key in a map that yields the full class plus
    # method name as a string.
    def getClassNameFromEnvKey(self, key):
        result = '',''
        envmappings = self.context['envchecksmap']
        if key in envmappings:
            implementation = envmappings[key]
            fullname, methname = implementation.rsplit(".", 1)
            if fullname in ClassesAll:
                result = fullname, methname
        return result


    def _isInterestingReference(self, assembled, node, fileId, inDefer):

        ##
        # try to qualify the syntactical context of the given variable node (call, instantiation,
        # ...); also, filter for the "head" symbol of a complex var expression (like 'a.b.c').
        def checkNodeContext(node):
            context = 'interesting' # every context is interesting, maybe we get more specific or reset to ''

            # don't treat label references
            if node.parent.type in ("break", "continue"):
                return ''

            # as _isInterestingReference is run on *any* var node while
            # traversing the tree intermediate occurrences var nodes like
            # in 'a.b().c[d].e' are run through it as well; but it is enough to treat
            # the longest left-most expression, so we restrict ourself to the "head" var
            # expression like 'a.b' here, and skip other occurrences (like 'c', 'd'
            # and 'e' in the example)
            #myFirst = node.getFirstChild(mandatory=False, ignoreComments=True)
            #if not treeutil.checkFirstChainChild(myFirst): # see if myFirst is the first identifier in a chain
            #    context = ''

            leftmostChild = treeutil.findLeftmostChild(node)  # works for leafs too

            # get the top-most dotaccessor of this identifier/constant
            if leftmostChild.hasParentContext("dotaccessor/*"): # operand of a dotaccessor
                localTop = leftmostChild.parent.parent.getHighestPureDotParent()
            else:
                localTop = leftmostChild 
            
            # testing for the 'a.b' in 'a.b().c[d].e'; bare 'a' in 'a' is also caught
            if localTop != node:
                context = ''

            # '/^\s*$/.test(value)' or '[].push' or '{}.toString'
            elif leftmostChild.type in ("constant", "array", "map"):
                context = ''

            ## testing for the 'a' in 'a.b().c[d].e'
            #elif not treeutil.checkFirstChainChild(treeutil.findLeftmostChild(localTop)):
            #    context = ''

            # check name in 'new ...' position
            elif ((node.hasParentContext("operation/first") and node.parent.parent.get("operator",0) == "new")
                or (node.hasParentContext("operation/first/call/operand") and
                    node.parent.parent.parent.parent.get("operator",0) == "new") # WISH: hasParentContext("operation[@operator='new']/...")
                ):
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
            if firstDot > -1:
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
        if assembled in ClassesAll:  # short cut
            className = assembled
        elif "." in assembled:
            for entryId in ClassesAll:
                if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                    if len(entryId) > len(className): # take the longest match
                        className      = entryId
                        classAttribute = assembled[ len(entryId) +1 :]  # skip entryId + '.'
                        # see if classAttribute is chained, too
                        dotidx = classAttribute.find(".")
                        if dotidx > -1:
                            classAttribute = classAttribute[:dotidx]    # only use the first component
        return className, classAttribute


    ##
    # Check if the detected (pot. complex) identifier <idStr>, with corresponding
    # AST node <node>, is a scoped identifier in <fileId>.
    #
    # Uses scope analysis (ecmascript.frontend.Scope) of <fileId>; finds the
    # enclosing scope of <node>, then looks up <idStr> in this scope.
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

        def getScript(node, fileId, ):
            # TODO: checking the root nodes is a fix, as they sometimes differ (prob. caching)
            # -- looking up nodes in a Script() uses object identity for comparison; sometimes, the
            #    tree _analyzeClassDepsNode works on and the tree Script is built from are not the
            #    same in memory, e.g. when the tree is re-read from disk; then those comparisons
            #    fail (although the nodes are semantically the same); hence we have to
            #    re-calculate the Script (which is expensive!) when the root node object changes;
            #    using __memo allows at least to re-use the existing script when a class is worked
            #    on and this method is called successively for the same tree.
            rootNode = node.getRoot()
            #if _memo1_[0] == fileId: # replace with '_memo1_[0] == rootNode', to make it more robust, but slightly less performant
            if _memo1_[0] == rootNode:
                script = _memo1_[1]
            else:
                # TODO: disentagle use of ecmascript.frontend.Script and generator.code.Script
                script = Script(rootNode, fileId)
                _memo1_[0], _memo1_[1] = rootNode, script
            return script

        def getLeadingId(idStr):
            leadingId = idStr
            dotIdx = idStr.find('.')
            if dotIdx > -1:
                leadingId = idStr[:dotIdx]
            return leadingId

        # -----------------------------------------------------------------------------

        # check composite id a.b.c, check only first part
        idString = getLeadingId(idStr)
        script   = getScript(node, fileId)

        scopeNode = findScopeNode(node)  # find the node of the enclosing scope (function - catch - global)
        if scopeNode == script.root:
            fcnScope = script.getGlobalScope()
        else:
            fcnScope  = script.getScope(scopeNode)
        assert fcnScope != None, "idString: '%s', idStr: '%s', fileId: '%s'" % (idString, idStr, fileId)
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
        # TODO: The next doesn't provide much, qx.Class.getInstance has no new dependencies
        # currently (aside from "new this", which I cannot relate back to 'construct'
        # ATM). Leave it in anyway, to not break bug#5660.
        #elif featureId == "getInstance": # corner case: singletons get this from qx.Class
        #    clazzId = "qx.Class"
        elif featureId == "getInstance" and self.type == "singleton":
            featureId = "construct"
        elif featureId in ('call', 'apply'):  # this might get overridden, oh well...
            clazzId = "Function"
        # TODO: getter/setter are also not lexically available!
        # handle .call() ?!
        if clazzId not in ClassesAll: # can't further process non-qooxdoo classes
            # TODO: maybe this should better use something like isInterestingIdentifier()
            # to invoke the same machinery for filtering references like in other places
            return None, None

        # early return if class id is finalized
        if clazzId != self.id:
            classObj = ClassesAll[clazzId]
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
                if classId in ClassesAll:
                    return ClassesAll[classId].findClassForFeature('construct', variants, classMaps)
                else:
                    return None, None
        includeVal = classMap.get('include', None)
        if includeVal:
            # 'include' value according to Class spec.
            if includeVal.type in NODE_VARIABLE_TYPES + ('array',):
                includeVal = treeutil.variableOrArrayNodeToArray(includeVal)
            
            # assume qx.core.Environment.filter() call
            else:
                filterMap = variantoptimizer.getFilterMap(includeVal, self.id)
                includeSymbols = []
                for key, node in filterMap.items():
                    # only consider true or undefined 
                    #if key not in variants or (key in variants and bool(variants[key]):
                    # map value has to be value/variable
                    variable =  node.children[0]
                    assert variable.isVar()
                    symbol, isComplete = treeutil.assembleVariable(variable)
                    assert isComplete
                    includeSymbols.append(symbol)
                includeVal = includeSymbols

            parents.extend(includeVal)

        # go through all ancestors
        for parClass in parents:
            if parClass not in ClassesAll:
                continue
            parClassObj = ClassesAll[parClass]
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
        tree = self.optimize (None, ["variants"], variants) # TODO: this might incur an extra cached tree, if not(variants)
        qxDefine = treeutil.findQxDefine (tree)
        classMap = treeutil.getClassMap (qxDefine)

        return classMap

    ##
    # add to global result set sanely
    def resultAdd(self, depsItem, localDeps):
        # cyclic check
        if depsItem in (localDeps):
            self.context['console'].debug("Class.method already seen, skipping: %s#%s" % (depsItem.name, depsItem.attribute))
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

    def getTransitiveDeps(self, depsItem, variants, classMaps, checkSet=None, force=False):

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

            cacheId = "methoddeps-%r-%r-%r" % (classId, methodId, variantString)
                # The bad thing here is that 'variantString' contains environment setting
                # that normally have no influence on the dependencies (like
                # 'qx.Application'). So cached deps are rejected for no reason (ex.
                # building the demos of Demobrowser). But I cannot easily apply
                # variant-projection here, as it only proves that the current class is
                # independent of a specific environement key; but its recursive deps could
                # well be. Fix: Get the shallow deps of the current method from cache, and then get the
                # trans. deps of those items. They then could appy the same reasoning.
            if not force:
                # Check cache
                cachedDeps, _ = cache.read(cacheId)  # no use to put this into a file, due to transitive dependencies to other files
                if cachedDeps != None:
                    console.debug("using cached result")
                    #print "\nusing cached result for", classId, methodId
                    return cachedDeps

            # Need to calculate deps
            console.dot("_")

            # Check known class
            if classId not in ClassesAll:
                console.debug("Skipping unknown class of dependency: %s#%s (%s:%d)" % (classId, methodId,
                              dependencyItem.requestor, dependencyItem.line))
                return set()

            # Check other class
            elif classId != self.id:
                classObj = ClassesAll[classId]
                otherdeps = classObj.getTransitiveDeps(dependencyItem, variants, classMaps, totalDeps, force)
                return otherdeps

            # Check own hierarchy
            defClassId, attribNode = self.findClassForFeature(methodId, variants, classMaps)

            # lookup error
            if not defClassId or defClassId not in ClassesAll:
                console.debug("Skipping unknown definition of dependency: %s#%s (%s:%d)" % (classId, 
                              methodId, dependencyItem.requestor, dependencyItem.line))
                return set()
            
            defDepsItem = DependencyItem(defClassId, methodId, classId)
            if dependencyItem.isCall:
                defDepsItem.isCall = True  # if the dep is an inherited method being called, pursue the parent method as call
            localDeps   = set()

            # inherited feature
            if defClassId != classId:
                self.resultAdd(defDepsItem, localDeps)
                defClass = ClassesAll[defClassId]
                otherdeps = defClass.getTransitiveDeps(defDepsItem, variants, classMaps, totalDeps, force)
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
                    self._analyzeClassDepsNode(attribNode, depslist, inLoadContext=False)
                    console.debug( "shallow dependencies: %r" % (depslist,))

                    # This depends on attribNode belonging to current class
                    my_ignores = self.getHints("ignoreDeps") + self.getHints("optionalDeps")
                    my_ignores = map(MetaIgnore, my_ignores)

                    for depsItem in depslist:
                        if depsItem in totalDeps:
                            continue
                        if depsItem.name in my_ignores:
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

        cache = self.context['cache']
        console = self.context['console']
        checkset = checkSet or set()
        variantString = util.toString(variants)
        deps = getTransitiveDepsR(depsItem, variantString, checkset) # checkset is currently not used, leaving it for now

        return deps



##
# #ignore hints can have globs (like 'qx.test.*')
# This class provides a wrapper around those entries so you can immediately match
# agaist the regexp.
class MetaIgnore(object):

    def __init__ (self, source=""):
        self.source   = source  # "qx/test/*"
        so = re.escape(source)  # for '.', '$'
        so = so.replace(r'\*', '.*')  # re-activate '*'
        self.regex    = re.compile(r'^%s$' % so) # re.compile("qx\.test\.*")

    ##
    # Overloading __eq__ so that 'in' tests will use a regex match
    def __eq__ (self, other):
        return self.regex.match(other)



