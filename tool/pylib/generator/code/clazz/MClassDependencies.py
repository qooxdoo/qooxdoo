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
from ecmascript.frontend.tree       import Node, NODE_VARIABLE_TYPES
from ecmascript.transform.optimizer import variantoptimizer
from ecmascript.transform.check     import scopes, jshints, global_symbols as gs
from generator.code.DependencyItem  import DependencyItem
from generator.code.HintArgument    import HintArgument
from generator                      import Context
from misc import util
from misc.util import inverse, bind, pipeline

ClassesAll = None # {'cid':generator.code.Class}

GlobalSymbolsCombinedPatt = re.compile('|'.join(r'^%s\b' % re.escape(x) for x in lang.GLOBALS + lang.QXGLOBALS))

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

            load, run   = [], []
            ignore = [DependencyItem(x, '', "|DefaultIgnoredNamesDynamic|") for x in self.defaultIgnoredNamesDynamic]

            console.debug("Getting shallow deps of: %s" % self.id)
            console.indent()

            # Read source tree data
            if not tree:
                if variantSet: # a filled variantSet map means that "variants" optimization is wanted
                    tree = self.optimize(None, ["variants"], variantSet)
                else:
                    tree = self.tree()

            # Get deps from compiler hints
            if not hasattr(tree, 'hint'):
                tree = jshints.create_hints_tree(tree) # this will be used by some of the subsequent method calls
            load_hints, run_hints, ignore_hints, all_feature_checks = self.dependencies_from_comphints(tree) # ignore_hints=[HintArgument]
            load.extend(load_hints)
            run.extend(run_hints)
            load_feature_checks = all_feature_checks[0]
            run_feature_checks = all_feature_checks[1]

            # Analyze tree
            treeDeps  = []  # will be filled by _analyzeClassDepsNode
            self._analyzeClassDepsNode(tree, treeDeps, inLoadContext=True)

            # Filter lexical deps through ignore_hints
            load1, run1, ignore1 = self.filter_symbols_by_comphints(treeDeps, ignore_hints)
                # load and run are being filtered, ignore contains the actually filtered depsItems

            # integrate into existing lists
            load_hint_names = [str(x) for x in load_hints]
            for dep in load1:
                if str(dep) in load_hint_names and not load_feature_checks:
                    console.warn("%s: @require(%s) is auto-detected" % (self.id, dep))
                load.append(dep)
            run_hint_names = [str(x) for x in run_hints]
            for dep in run1:
                if str(dep) in run_hint_names and not run_feature_checks:
                    console.warn("%s: @use(%s) is auto-detected" % (self.id, dep))
                run.append(dep)
            ignore.extend(ignore1)

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

        classVariants = self.classVariants()
        relevantVariants = self.projectClassVariantsToCurrent(classVariants, variantSet)
        statics_optim = 'statics' in Context.jobconf.get("compile-options/code/optimize",[])
        cacheId = "deps-%s-%s-%s" % (self.path, util.toString(relevantVariants), int(statics_optim))
        cached = True

        # try compile cache
        classInfo, classInfoMTime = self._getClassCache()
        (deps, cacheModTime) =  classInfo[cacheId] if cacheId in classInfo else (None,None)

        # try dependencies.json
        if (True  # just a switch
            and deps == None
            # TODO: temp. hack to work around issue with 'statics' optimization and dependencies.json
            and not statics_optim
           ):
            deps_json, cacheModTime = self.library.getDependencies(self.id)
            if deps_json is not None:
                #console.info("using dependencies.json for: %s" % self.id)
                deps = self.depsItems_from_Json(deps_json)
                # don't cache at all, so later 'statics' optimized jobs don't
                # pick up the short depsList from cache

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


    def getCombinedDeps(self, classesAll_, variants, config, stripSelfReferences=True, projectClassNames=True, force=False, tree=None):

        # init lists
        global ClassesAll
        ClassesAll = classesAll_  # TODO: this is a quick hack, to not have to pass classesAll_ around as param
        loadFinal = []
        runFinal  = []

        # add static dependencies
        static, cached = self.dependencies (variants, force, tree=tree)

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

    ##
    # Find dependencies of a code tree, purely looking at identifier head-symbols
    # that are not covered by the current scope chain.
    #
    # Node -> Node[]  (head nodes)
    #
    def dependencies_from_ast(self, tree):
        result = []

        if tree.type in ('file', 'function', 'catch'):
            top_scope = tree.scope
        else:
            top_scope = scopes.find_enclosing(tree)
        # walk through enclosing and all nested scopes
        for scope in top_scope.scope_iterator():
            if scope.is_defer:
                # e.g. in 'defer' handle locals like 'statics' as dependency with recursion
                vars_ = dict(scope.globals().items() +
                    [(x,y) for x,y in scope.locals().items() if y.is_param])
            else:
                # only consider global syms
                vars_ = scope.globals()
            for name, scopeVar in vars_.items():  # { sym_name: ScopeVar }
                # create a depsItem for all its uses
                for var_node in scopeVar.uses:
                    if treeutil.hasAncestor(var_node, tree): # var_node is not disconnected through optimization
                        #depsItem = self.depsItem_from_node(var_node)
                        #result.append(depsItem)
                        result.append(var_node)
        return result



    ##
    # DepsItems from qx.core.Environment.*() feature dependencies
    #
    def dependencies_from_envcalls(self, node):

        depsList = []
        if 'qx.core.Environment' not in ClassesAll:
            self.context['console'].warn("No qx.core.Environment available to extract feature keys from")
            return depsList
        qcEnvClass = ClassesAll['qx.core.Environment']

        for env_operand in variantoptimizer.findVariantNodes(node):
            call_node = env_operand.parent.parent
            env_key = call_node.getChild("arguments").children[0].get("value", "")
            # Without qx.core.Environment._checksMap:
            # ---------------------------------------
            className = qcEnvClass.classNameFromEnvKeyByIndex(env_key)
            if className and className in ClassesAll:
                #print className
                depsItem = DependencyItem(className, "", self.id, env_operand.get('line', -1))
                depsItem.isCall = True  # treat as if actual call, to collect recursive deps
                depsItem.node = call_node
                # .inLoadContext
                qx_idnode = treeutil.findFirstChainChild(env_operand) # 'qx' node of 'qx.core.Environment....'
                scope = qx_idnode.scope
                depsItem.isLoadDep = scope.is_load_time
                if depsItem.isLoadDep:
                    depsItem.needsRecursion = True
                depsList.append(depsItem)
            # With qx.core.Environment._checksMap:
            # ------------------------------------
            # className, classAttribute = qcEnvClass.classNameFromEnvKey(env_key)
            # if className and className in ClassesAll:
            #     #print className
            #     depsItem = DependencyItem(className, classAttribute, self.id, env_operand.get('line', -1))
            #     depsItem.isCall = True  # treat as if actual call, to collect recursive deps
            #     depsItem.node = call_node
            #     # .inLoadContext
            #     qx_idnode = treeutil.findFirstChainChild(env_operand) # 'qx' node of 'qx.core.Environment....'
            #     scope = qx_idnode.scope
            #     depsItem.isLoadDep = scope.is_load_time
            #     if depsItem.isLoadDep:
            #         depsItem.needsRecursion = True
            #     depsList.append(depsItem)
        return depsList


    ##
    # This still covers #-hints.
    #
    # @return
    #  load [DepsItem]     DepsItems from load hints
    #  run  [DepsItem]     DepsItems from run hints
    #  ignore [HintArgument]  HintArgument items from ignore hints
    #
    def dependencies_from_comphints(self, node):
        load, run = [], []
        # Read meta data
        meta         = self.getHints()
        metaLoad     = meta.get("loadtimeDeps", [])
        metaRun      = meta.get("runtimeDeps" , [])
        metaOptional = meta.get("optionalDeps", [])
        metaIgnore   = meta.get("ignoreDeps"  , [])
        metaIgnore.extend(metaOptional)
        all_feature_checks = [False, False]  # load_feature_checks, run_feature_checks

        # regexify globs in metaignore
        metaIgnore = map(HintArgument, metaIgnore)

        # Turn strings into DependencyItems()
        for target,metaHint in ((load,metaLoad), (run,metaRun)):
            for key in metaHint:
                # add all feature checks if requested
                if key == "feature-checks":
                    all_feature_checks[bool(metaHint==metaRun)] = True
                    target.extend(self.depsItems_from_envchecks(-1, metaHint==metaLoad))
                # turn an entry into a DependencyItem
                elif isinstance(key, types.StringTypes):
                    sig = key.split('#',1)
                    className = sig[0]
                    attrName  = sig[1] if len(sig)>1 else ''
                    target.append(DependencyItem(className, attrName, self.id, "|hints|"))

        # Add JSDoc Hints
        for hint in node.hint.iterator():
            for target,hintKey in ((load,'require'), (run,'use')):
                if hintKey in hint.hints:
                    for hintArg in hint.hints[hintKey][None]:
                        # add all feature checks if requested
                        if hintArg == "feature-checks":
                            all_feature_checks[bool(hintKey=='use')] = True
                            target.extend(self.depsItems_from_envchecks(hint.node.get('line',-1), metaHint==metaLoad))
                        # turn the HintArgument into a DependencyItem
                        else:
                            sig = hintArg.source.split('#',1)
                            className = sig[0]
                            attrName  = sig[1] if len(sig)>1 else ''
                            target.append(DependencyItem(className, attrName, self.id, hint.node.get('line',-1)))

        return load, run, metaIgnore, all_feature_checks


    ##
    # DepsItem Factory: Create a DependencyItem() from an AST node.
    #
    def depsItem_from_node(self, node):
        scope = node.scope
        # some initializations (might get refined later)
        depsItem = DependencyItem('', '', '')
        depsItem.name           = ''
        depsItem.attribute      = ''
        depsItem.requestor      = self.id
        depsItem.line           = node.get("line", -1)
        depsItem.isLoadDep      = scope.is_load_time
        depsItem.needsRecursion = False
        depsItem.isCall         = False
        depsItem.node           = node
        var_root = treeutil.findVarRoot(node)  # various of the tests need the var (dot) root, rather than the head symbol (like 'qx')

        # .isCall
        if treeutil.isCallOperand(var_root): # it's a function call or new op.
            depsItem.isCall = True  # interesting when following transitive deps

        # .name, .attribute
        assembled = (treeutil.assembleVariable(node))[0]
        className = gs.test_for_libsymbol(assembled, ClassesAll, []) # TODO: no namespaces!?
        if not className:
            is_lib_class = False
            className = assembled
            classAttribute = ''
        else:
            is_lib_class = True
            if len(assembled) > len(className):
                classAttribute = assembled[len(className)+1:]
                dotidx = classAttribute.find(".") # see if classAttribute is chained too
                if dotidx > -1:
                    classAttribute = classAttribute[:dotidx]    # only use the first component
            else:
                classAttribute = ''
        # we allow self-references, to be able to track method dependencies within the same class
        assembled_parts = assembled.split('.')
        if assembled_parts[0] == 'this':
            className = self.id
            is_lib_class = True
            if '.' in assembled:
                classAttribute = assembled_parts[1]
        elif scope.is_defer and assembled_parts[0] in DEFER_ARGS:
            className = self.id
            is_lib_class = True
            if '.' in assembled:
                classAttribute = assembled_parts[1]
        if is_lib_class and not classAttribute:  # see if we have to provide 'construct'
            if treeutil.isNEWoperand(var_root):
                classAttribute = 'construct'
        depsItem.name = className
        depsItem.attribute = classAttribute

        # .needsRecursion
        # Mark items that need recursive analysis of their dependencies (bug#1455)
        if (is_lib_class and
            scope.is_load_time and
            (treeutil.isCallOperand(var_root) or
             treeutil.isNEWoperand(var_root))):
            depsItem.needsRecursion = True

        return depsItem


    ##
    # DepsItem Factory: Create a DependencyItem() for each Feature Check class.
    #
    def depsItems_from_envchecks(self, nodeline, inLoadContext):
        # Without qx.core.Environment._checksMap:
        # ---------------------------------------
        result = []
        qcEnvClass = ClassesAll['qx.core.Environment']
        for key in qcEnvClass.envKeyProviderIndex:
            clsname = qcEnvClass.classNameFromEnvKeyByIndex(key)
            result.append(DependencyItem(clsname, "", self.id, nodeline, inLoadContext))
        return result
        # With qx.core.Environment._checksMap:
        # -----------------------------------
        # result = []
        # qcEnvClass = ClassesAll['qx.core.Environment']
        # for key in qcEnvClass.checksMap:
        #     clsname, clsattribute = qcEnvClass.classNameFromEnvKey(key)
        #     result.append(DependencyItem(clsname, clsattribute, self.id, nodeline, inLoadContext))
        # return result


    ##
    # Create depsItems from dependencies.json entry.
    #
    # deps_json = {'load':['qx.util.OOUtil', ...], 'run':['qx.util.DisposeUtil',...]}
    #
    def depsItems_from_Json(self, deps_json):
        result = {'run':[], 'load':[], 'ignore':[]}
        for category in ('run', 'load'):
            for classId in deps_json[category]:
                if any([classId.startswith(x) for x in ('/resource/', '/translation/', '/locale/')]):
                    continue  # sorting out resource, locale and msgid dependencies
                depsItem = DependencyItem(classId, '', '|dependency.json|')
                depsItem.isLoadDep = category == 'load'
                result[category].append(depsItem)
        return result


    ##
    # Return a list of dependency items, gleaned from an AST node, with some filters
    # applied.
    #
    def _analyzeClassDepsNode(self, node, depsList, inLoadContext, inDefer=False):
        # helper functions
        not_jsignored = inverse(gs.test_ident_is_jsignored)
        browser_sans_this = [x for x in lang.GLOBALS if x!='this']
        not_builtin = inverse(gs.test_ident_is_builtin(browser_sans_this))
        not_jsignore_envcall = inverse(lambda d: gs.name_is_jsignored(
            d.name+('.'+d.attribute if d.attribute else ''), d.node))
        # ensure a complete hint tree for ignore checking
        root_node = node.getRoot()
        if not hasattr(root_node, 'hint'):
            root_node = jshints.create_hints_tree(root_node)

        code_deps = pipeline(
            self.dependencies_from_ast(node)
            , bind(filter, not_jsignored)
            , bind(filter, not_builtin)
            , bind(map, self.depsItem_from_node)
        )
        envcall_deps = pipeline(
            self.dependencies_from_envcalls(node)
            , bind(filter, not_jsignore_envcall)
        )
        dependencies = code_deps + envcall_deps

        [setattr(x,'node',None) for x in dependencies]  # remove AST links (for easier caching)
        depsList.extend(dependencies)


    #def filter_symbols_by_builtins(self, depsList):
    #    return [deps for deps in depsList if not GlobalSymbolsCombinedPatt.search(deps.name)]


    #def filter_symbols_by_jshints(self, tree, depsItems):
    #    result = []
    #    for depsItem in depsItems:
    #        deps_repr = depsItem.name
    #        if depsItem.attribute:
    #            deps_repr += '.' + depsItem.attribute
    #        is_ignored = gs.name_is_jsignored(deps_repr, depsItem.node)
    #        if not is_ignored:
    #            result.append(depsItem)
    #    return result


    def filter_symbols_by_comphints(self, treeDeps, ignore_hints):
        load, run, ignored = [], [], []
        # Process source tree data
        for dep in treeDeps:
            # load deps
            if dep.isLoadDep:
                if "auto-require" not in ignore_hints:
                    if dep.name in ignore_hints:
                        ignored.append(dep)
                    else:
                        # adding all items to list (the second might have needsRecursion)
                        load.append(dep)
            # run deps
            else:
                if "auto-use" not in ignore_hints:
                    if dep.name in ignore_hints:
                        ignored.append(dep)
                    else:
                        # adding all items to list (to comply with the 'load' deps)
                        run.append(dep)
        return load, run, ignored


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
            # the next is a hack to provide minimal scope info
            featureNode.set("treegenerator_tag", 1)
            featureNode = scopes.create_scopes(featureNode)
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
            console.dot(1)

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
                    if attribNode.type == 'value':
                       attribNode = attribNode.children[0]
                    self._analyzeClassDepsNode(attribNode, depslist, inLoadContext=False)
                    console.debug( "shallow dependencies: %r" % (depslist,))

                    # This depends on attribNode belonging to current class
                    my_ignores = self.getHints("ignoreDeps") + self.getHints("optionalDeps")
                    my_ignores = map(HintArgument, my_ignores)

                    for depsItem in depslist:
                        if depsItem in totalDeps:
                            continue
                        if depsItem.name in my_ignores:
                            continue
                        if self.resultAdd(depsItem, localDeps):
                            totalDeps = totalDeps.union(localDeps)
                            # Recurse dependencies
                            downstreamDeps = getTransitiveDepsR(depsItem, variants, totalDeps)
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

