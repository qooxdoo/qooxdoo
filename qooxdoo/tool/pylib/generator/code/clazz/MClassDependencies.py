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
from ecmascript.frontend.tree       import Node, NodeAccessException
from ecmascript.transform.optimizer import variantoptimizer
from misc import util

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

    def dependencies(self, variantSet, force=False):

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

            # Parse all meta keys for '#'
            for container,provider in ((load,metaLoad), (run,metaRun), (ignore,metaIgnore)):
                for key in provider:
                    if isinstance(key, types.StringTypes):
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
                    recDeps = self.getTransitiveDeps(dep, variantSet, classMaps, force=force)
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
            deps = buildShallowDeps()
            deps = buildTransitiveDeps(deps)
            if self.id != "qx.core.Environment":
                # Mustn't cache q.c.Env deps across runs, as they depend on the entire
                # class list
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



