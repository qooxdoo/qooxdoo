#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#
################################################################################

##
# NAME
#  DependencyLoader
#
# SYNTAX
#  from DependencyLoader import DependencyLoader
#  mydl = DependencyLoader(...)
#
# DESCRIPTION
#
# ENTRY POINTS (for generator)
#  - DependencyLoader.__init__()
#  - DependencyLoader.getClassList()
#  - DependencyLoader.getMeta()
#  - DependencyLoader.getDeps()
#
##

import sys, re, os, types

from ecmascript.frontend import treeutil, lang
from ecmascript.frontend.Script import Script
from misc import filetool, idlist


class DependencyLoader:

    def __init__(self, classes, cache, console, treeLoader, require, use):
        self._classes = classes
        self._cache = cache
        self._console = console
        self._treeLoader = treeLoader
        self._require = require
        self._use = use


    def getClassList(self, include, block, explicitInclude, explicitExclude, variants):

        def resolveDepsSmartCludes():
            # Resolve intelli include/exclude depdendencies
            if len(include) == 0 and len(explicitInclude) > 0:
                if len(block) > 0:
                    self._console.error("Blocking is not supported when only explicit includes are defined!");
                    sys.exit(1)

                result = []
            else:
                result = self.resolveDependencies(include, block, variants)

            return result


        def processExplicitCludes(result):
            # Explicit include/exclude
            if len(explicitInclude) > 0 or len(explicitExclude) > 0:
                self._console.info("Processing explicitely configured includes/excludes...")
                for entry in explicitInclude:
                    if not entry in result:
                        result.append(entry)

                for entry in explicitExclude:
                    if entry in result:
                        result.remove(entry)
            return result

        # ---------------------------------------------------

        result = resolveDepsSmartCludes()
        result = processExplicitCludes(result)
        # Sort classes
        self._console.info("Sorting %s classes..." % len(result))
        result = self.sortClasses(result, variants)
        #result = self.sortClassesTopological(result, variants)

        if self._console.getLevel() == "debug":# or True:
            self._console.indent()
            self._console.info("Sorted class list:")
            self._console.indent()
            for classId in result:
                self._console.info(classId)
            self._console.outdent()
            self._console.outdent()

        # Return list
        return result



    def resolveDependencies(self, include, block, variants):

        def resolveDependenciesRecurser(item, block, variants, result):
            # support blocking
            if item in block:
                return

            # check if already in
            if item in result:
                return

            # add self
            result.append(item)

            # reading dependencies
            try:
                deps = self.getCombinedDeps(item, variants)
            except NameError, detail:
                raise NameError("Could not resolve dependencies of class: %s\n%s" % (item, detail))

            # process lists
            try:
              for subitem in deps["load"]:
                  if not subitem in result and not subitem in block:
                      resolveDependenciesRecurser(subitem, block, variants, result)

              for subitem in deps["run"]:
                  if not subitem in result and not subitem in block:
                      resolveDependenciesRecurser(subitem, block, variants, result)

            except NameError, detail:
                raise NameError("Could not resolve dependencies of class: %s \n%s" % (item, detail))

            if deps['undef']:
                self._console.indent()
                for id in deps['undef']:
                    self._console.warn("! Unknown class referenced: %s (in: %s)" % (id, item))
                self._console.outdent()

            return

        # -------------------------------------------

        if len(include) == 0:
            self._console.info("Including all known classes")
            result = self._classes.keys()

            # In this case the block works like an explicit exclude
            # because all classes are included like an explicit include.
            for classId in block:
                result.remove(classId)

        else:
            result = []
            for item in include:
                try:
                    resolveDependenciesRecurser(item, block, variants, result)

                except NameError, detail:
                    self._console.error("Dependencies resolving failed for %s with: \n%s" % (item, detail))
                    sys.exit(1)

        return result





    def getMethodDeps(self, fileId, methodNameFQ, variants):
        # find the dependencies of a specific method
        # get the fileId class, find the node of methodNameFQ, and extract its
        # dependencies (can only be runtime deps, since all inFunction)
        # return the deps

        def findMethodName(fileId, methodNameFQ):
            mo = re.match(r'^%s\.(.+)$' % fileId, methodNameFQ)
            if mo and mo.group(1):
                return mo.group(1)
            else:
                return ''
        
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
        tree = self._treeLoader.getTree(fileId, variants)

        # find the method node
        funcNode   = findMethod(tree, methodName)
        if not funcNode:
            raise RuntimeError, "No method named \"%s\" found in class \"%s\"." % (methodName, fileId)

        # get the deps of the method
        runtime  = []
        loadtime = []
        warn     = []
        self._analyzeClassDepsNode(fileId, funcNode, runtime, loadtime, warn, True, variants)

        return loadtime


    def getCombinedDeps(self, fileId, variants):
        # return dependencies of class named <fileId>, both found in its code and
        # expressed in config options

        # print "Get combined deps: %s" % fileId

        # init lists
        loadFinal = []
        runFinal = []

        # add static dependencies
        static = self.getDeps(fileId, variants)
        loadFinal.extend(static["load"])
        runFinal.extend(static["run"])

        # add dynamic dependencies
        if self._require.has_key(fileId):
            loadFinal.extend(self._require[fileId])

        if self._use.has_key(fileId):
            runFinal.extend(self._use[fileId])

        # return dict
        return {
            "load" : loadFinal,
            "run"  : runFinal,
            'undef' : static['undef']
        }



    ##
    # Interface method
    #
    def getDeps(self, fileId, variants):
        # find dependencies of class named <fileId> in its code (both meta hints as
        # well as source code)

        def analyzeClassDeps(fileId, variants):

            ## analyze with no variants

            #loadtimeDepsNV = []  # NV = no variants
            #runtimeDepsNV  = []
            #undefDepsNV    = []

            #tree = self._treeLoader.getTree(fileId, {})
            #self._analyzeClassDepsNode(fileId, tree, loadtimeDepsNV, runtimeDepsNV, undefDepsNV, False, variants)

            # now analyze with variants

            loadtimeDeps = []
            runtimeDeps  = []
            undefDeps    = []

            tree = self._treeLoader.getTree(fileId, variants)
            self._analyzeClassDepsNode(fileId, tree, loadtimeDeps, runtimeDeps, undefDeps, False, variants)

            ## this should be for *source* version only!
            #if "qx.core.Variant" in loadtimeDepsNV and "qx.core.Variant" not in loadtimeDeps:
            #    loadtimeDeps.append("qx.core.Variant")

            return loadtimeDeps, runtimeDeps, undefDeps

        # -----------------------------------------------------------------

        if not self._classes.has_key(fileId):
            raise NameError("Could not find class to fulfil dependency: %s" % fileId)

        filePath = self._classes[fileId]["path"]
        cacheId = "deps-%s-%s" % (fileId, idlist.toString(variants))

        # print "Read from cache: %s" % fileId
        
        deps = self._cache.readmulti(cacheId, filePath)
        if fileId=="qx.List": deps = None
        if deps != None:
            return deps

        # Notes:
        # load time = before class = require
        # runtime = after class = use

        load = []
        run = []

        self._console.debug("Gathering dependencies: %s" % fileId)
        self._console.indent()

        # Read meta data
        meta         = self.getMeta(fileId)
        metaLoad     = meta.get("loadtimeDeps", [])
        metaRun      = meta.get("runtimeDeps" , [])
        metaOptional = meta.get("optionalDeps", [])
        metaIgnore   = meta.get("ignoreDeps"  , [])

        # Process meta data
        load.extend(metaLoad)
        run.extend(metaRun)

        # Read content data
        (autoLoad, autoRun, autoWarn) = analyzeClassDeps(fileId, variants)
        
        # Process content data
        if not "auto-require" in metaIgnore:
            for item in autoLoad:
                if item in metaOptional:
                    pass
                elif item in load:
                    self._console.warn("%s: #require(%s) is auto-detected" % (fileId, item))
                else:
                    load.append(item)

        if not "auto-use" in metaIgnore:
            for item in autoRun:
                if item in metaOptional:
                    pass
                elif item in load:
                    pass
                elif item in run:
                    self._console.warn("%s: #use(%s) is auto-detected" % (fileId, item))
                else:
                    run.append(item)

        self._console.outdent()

        # Build data structure
        deps = {
            "load" : load,
            "run"  : run,
            'undef' : autoWarn
        }
        
        self._cache.writemulti(cacheId, deps)
        return deps


    def _analyzeClassDepsNode(self, fileId, node, loadtime, runtime, warn, inFunction, variants):
        # the "variants" param is only to support getMethodDeps()!

        def isScopedVar(idString, node, fileId):

            def findScopeNodeAndRoot(node):
                node1 = node
                sNode = None
                rNode = None
                while True:
                    if not sNode and node1.type in ["function", "catch"]:
                        sNode = node1
                    if node1.hasParent():
                        node1 = node1.parent
                    else:  # we're at the root
                        if not sNode:
                            sNode = node1
                        rNode = node1
                        break
                return sNode, rNode

            # check composite id a.b.c, check only first part
            dotIdx = idString.find('.')
            if dotIdx > -1:
                idString = idString[:dotIdx]
            scopeNode, rootNode  = findScopeNodeAndRoot(node)  # find the node of the enclosing scope (function - catch - global)
            script = Script(rootNode, fileId)
            if scopeNode == rootNode:
                fcnScope = script.getGlobalScope()
            else:
                fcnScope = script.getScope(scopeNode)
            varDef = script.getVariableDefinition(idString, fcnScope)
            if varDef:
                return True
            return False

        # -----------------------------------------------------------

        if node.type == "variable":
            assembled = (treeutil.assembleVariable(node))[0]

            # treat dependencies in defer as requires
            if assembled == "qx.Class.define" or assembled == "qx.Bootstrap.define" or assembled == "qx.List.define":
                if node.hasParentContext("call/operand"):
                    deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
                    if deferNode != None:
                        self._analyzeClassDepsNode(fileId, deferNode, loadtime, runtime, warn, False, variants)


            # try to reduce to a class name
            assembledId = None
            if self._classes.has_key(assembled):
                assembledId = assembled

            elif "." in assembled:
                for entryId in self._classes:
                    if assembled.startswith(entryId) and re.match("%s\W" % entryId, assembled):
                        assembledId = entryId
                        break

            # warn about instantiations of unknown classes
            ##if not assembledId:
            ##    print assembled
            if ((not assembledId
                and 'parent' in node.__dict__
                and 'parent' in node.parent.__dict__
                and 'parent' in node.parent.parent.__dict__
                and 'parent' in node.parent.parent.parent.__dict__
                and node.parent.parent.parent.parent.type == 'instantiation'  # we're inside a 'new' expression
                and node.parent.type == 'operand' # and it's the class name
                ) or
                (not assembledId
                and 'parent' in node.__dict__
                and 'parent' in node.parent.__dict__
                and node.parent.parent.type == 'keyvalue'
                and node.parent.parent.get('key') == 'extend'        # it's the value of an 'extend' key
                )
               ):
                # skip built-in classes (Error, document, RegExp, ...)
                if (assembled in lang.BUILTIN + ['clazz']
                    or re.match(r'this\b', assembled)
                   ):
                   pass
                else:
                    # skip scoped vars
                    isScopedVar = isScopedVar(assembled, node, fileId)
                    if isScopedVar:
                        pass
                    else:
                        warn.append(assembled)

            if assembledId and assembledId != fileId:
                if self._classes.has_key(assembledId):
                    if inFunction:
                        target = runtime
                    else:
                        target = loadtime

                    if not assembledId in target:
                        target.append(assembledId)

                    # an attempt to fix static initializers (bug#1455)
                    if (target == loadtime and False and
                        node.hasParentContext("call/operand")  # it's a method call
                       ):  
                        # make run-time deps of the called method load-deps of the current
                        self._console.debug("Looking for rundeps in '%s' of '%s'" % (assembled, assembledId))
                        deps = self.getMethodDeps(assembledId, assembled, variants)
                        target.extend([x for x in deps if x not in target]) # add uniquely

        elif node.type == "body" and node.parent.type == "function":
            inFunction = True

        if node.hasChildren():
            for child in node.children:
                self._analyzeClassDepsNode(fileId, child, loadtime, runtime, warn, inFunction, variants)

        return



    ######################################################################
    #  CLASS SORT SUPPORT
    ######################################################################

    def sortClasses(self, include, variants):

        def sortClassesRecurser(classId, available, variants, result, path):
            if classId in result:
                return

            # reading dependencies
            deps = self.getCombinedDeps(classId, variants)

            # path is needed for recursion detection
            if not classId in path:
                path.append(classId)

            # process loadtime requirements
            for item in deps["load"]:
                if item in available and not item in result:
                    if item in path:
                        other = self.getCombinedDeps(item, variants)
                        self._console.warn("Detected circular dependency between: %s and %s" % (classId, item))
                        self._console.indent()
                        self._console.debug("%s depends on: %s" % (classId, ", ".join(deps["load"])))
                        self._console.debug("%s depends on: %s" % (item, ", ".join(other["load"])))
                        self._console.outdent()
                        sys.exit(1)

                    sortClassesRecurser(item, available, variants, result, path)

            if not classId in result:
                # remove element from path
                path.remove(classId)

                # print "Add: %s" % classId
                result.append(classId)

            return

        # ---------------------------------

        result = []
        path   = []

        for classId in include:
            sortClassesRecurser(classId, include, variants, result, path)

        return result


    def sortClassesTopological(self, include, variants):
        
        import graph

        # create graph object
        gr = graph.digraph()

        # add classes as nodes
        gr.add_nodes(include)

        # for each load dependency add a directed edge
        for classId in include:
            deps = self.getCombinedDeps(classId, variants)
            for depClassId in deps["load"]:
                if depClassId in include:
                    gr.add_edge(depClassId, classId)
                    #print "-- adding edge: %s -> %s" % (depClassId, classId)

        #dot = gr.write(fmt='dot')
        #open("/tmp/graph.dot","w").write(dot)
        #os.system("dot /tmp/graph.dot -Tpng > /tmp/graph.png")

        # cycle check?
        cycle_nodes = gr.find_cycle()
        if cycle_nodes:
            self._console.error("Detected circular dependencies between nodes: %r" % cycle_nodes)
            #sys.exit(1)

        classList = gr.topological_sorting()

        return classList




    ######################################################################
    #  META DATA SUPPORT
    ######################################################################

    HEAD = {
        "require"  : re.compile("^#require\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
        "use"      : re.compile("^#use\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
        "optional" : re.compile("^#optional\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
        "ignore"   : re.compile("^#ignore\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
        "embed"    : re.compile("^#embed\(\s*([\.\*a-zA-Z0-9/_-]+?)\s*\)", re.M),
        "asset"    : re.compile("^#asset\(\s*([^)]+?)\s*\)", re.M)
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
                    self._console.error("Self-referring runtime dependency: %s" % item)
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
            asset_reg = re.compile("^[\$\.\*a-zA-Z0-9/{}_-]+$")
            
            for item in self.HEAD["asset"].findall(data):
                if not asset_reg.match(item):
                    raise ValueError, "Illegal asset declaration: %" % item
                if not item in deps:
                    deps.append(item)
            
            return deps

        # ----------------------------------------------------------

        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]
        cacheId = "meta-%s" % fileId

        meta = self._cache.readmulti(cacheId, filePath)
        if meta != None:
            return meta

        meta = {}

        self._console.indent()

        content = filetool.read(filePath, fileEntry["encoding"])

        meta["loadtimeDeps"] = _extractLoadtimeDeps(content, fileId)
        meta["runtimeDeps"]  = _extractRuntimeDeps(content, fileId)
        meta["optionalDeps"] = _extractOptionalDeps(content)
        meta["ignoreDeps"]   = _extractIgnoreDeps(content)
        meta["assetDeps"]    = _extractAssetDeps(content)

        self._console.outdent()

        self._cache.writemulti(cacheId, meta)
        return meta


    def getOptionals(self, include):
        result = []

        for classId in include:
            try:
                for optional in self.getMeta(classId)["optionalDeps"]:
                    if not optional in include and not optional in result:
                        result.append(optional)

            # Not all meta data contains optional infos
            except KeyError:
                continue

        return result


