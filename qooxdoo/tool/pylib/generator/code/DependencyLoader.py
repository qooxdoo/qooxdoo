#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
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
#  - DependencyLoader.classlistFromInclude()
#  - DependencyLoader.getCombinedDeps()
#  - DependencyLoader.sortClasses()
#
##

import sys, re, os, types
import graph

from misc.ExtMap                import ExtMap
from ecmascript.frontend        import lang
from generator.code.Class       import DependencyItem

class DependencyLoader(object):

    def __init__(self, classesObj, cache, console, require, use, context):
        self._classesObj = classesObj
        self._cache   = cache
        self._console = console
        self._context = context
        self._jobconf = context.get('jobconf', ExtMap())
        self._require = require
        self._use     = use


    def getClassList(self, includeWithDeps, excludeWithDeps, includeNoDeps, excludeNoDeps, variants, verifyDeps=False, script=None):
        # return a class list for the current script (i.e. compilation)

        def resolveDepsSmartCludes():
            # Resolve intelli include/exclude depdendencies
            if len(includeWithDeps) == 0 and len(includeNoDeps) > 0:
                if len(excludeWithDeps) > 0:
                    raise ValueError("Blocking is not supported when only explicit includes are defined!");
                result = []
            else:
                result = self.classlistFromInclude(includeWithDeps, excludeWithDeps, variants, verifyDeps, script)

            return result


        def processExplicitCludes(result):
            # Explicit include/exclude
            if len(includeNoDeps) > 0 or len(excludeNoDeps) > 0:
                self._console.info("Processing explicitely configured includes/excludes...")
                for entry in includeNoDeps:
                    if not entry in result:
                        result.append(entry)

                for entry in excludeNoDeps:
                    if entry in result:
                        result.remove(entry)
            return result

        # ---------------------------------------------------

        if script:
            buildType = script.buildType  # source/build, for sortClasses
        else:
            buildType = ""

        result = resolveDepsSmartCludes()
        result = processExplicitCludes(result)
        # Sort classes
        self._console.info("Sorting %s classes..." % len(result))
        if  self._jobconf.get("dependencies/sort-topological", False):
            result = self.sortClassesTopological(result, variants)
        else:
            result = self.sortClasses(result, variants, buildType)

        if self._console.getLevel() == "debug":
            self._console.indent()
            self._console.debug("Sorted class list:")
            self._console.indent()
            for classId in result:
                self._console.debug(classId)
            self._console.outdent()
            self._console.outdent()

        # Return list
        return result



    def classlistFromInclude(self, includeWithDeps, excludeWithDeps, variants, 
                             verifyDeps=False, script=None):

        def classlistFromClassRecursive(item, excludeWithDeps, variants, result):
            # support blocking
            if item in excludeWithDeps:
                return

            # check if already in
            if item in result:
                return

            # add self
            result.append(item)

            # reading dependencies
            if self._console.getLevel() is "info":
                self._console.dot()
            self._console.debug("Gathering dependencies: %s" % item)
            self._console.indent()
            deps = self.getCombinedDeps(item, variants, buildType)
            self._console.outdent()

            # and evaluate them
            deps["warn"] = self._checkDepsAreKnown(deps,)
            ignore_names = [x.name for x in deps["ignore"]]
            if verifyDeps:
                for dep in deps["warn"]:
                    if dep.name not in ignore_names:
                        self._console.warn("! Unknown global symbol referenced: %s (%s:%s)" % (dep.name, item, dep.line))

            # process lists
            try:
              skipList = deps["warn"] + deps["ignore"]

              for subitem in deps["load"]:
                  if not subitem in result and not subitem in excludeWithDeps and not subitem in skipList:
                      classlistFromClassRecursive(subitem.name, excludeWithDeps, variants, result)

              for subitem in deps["run"]:
                  if not subitem in result and not subitem in excludeWithDeps and not subitem in skipList:
                      classlistFromClassRecursive(subitem.name, excludeWithDeps, variants, result)

            except NameError, detail:
                raise NameError("Could not resolve dependencies of class: %s \n%s" % (item, detail))

            # TODO: superseded by checkDepsAreKnown()
            #if deps['undef']:
            #    self._console.indent()
            #    for id in deps['undef']:
            #        self._console.warn("! Unknown class referenced: %s (in: %s)" % (id, item))
            #    self._console.outdent()

            return

        # -------------------------------------------

        if script:
            buildType = script.buildType  # source/build, for classlistFromClassRecursive
        else:
            buildType = ""

        if len(includeWithDeps) == 0:
            self._console.info("Including all known classes")
            result = self._classesObj.keys()

            # In this case the block works like an explicit exclude
            # because all classes are included like an explicit include.
            for classId in excludeWithDeps:
                result.remove(classId)

        else:
            result = []
            self._console.info(" ", feed=False)

            for item in includeWithDeps:
                classlistFromClassRecursive(item, excludeWithDeps, variants, result)

            if self._console.getLevel() is "info":
                self._console.nl()

        return result


    ##
    # return dependencies of class named <fileId>, both found in its code and
    # expressed in config options
    # - interface method

    def getCombinedDeps(self, fileId, variants, buildType=""):

        # init lists
        loadFinal = []
        runFinal  = []

        # add static dependencies
        classObj = self._classesObj[fileId]
        static   = classObj.dependencies(variants)
        #static   = self.getDeps(fileId, variants)
        loadFinal.extend(static["load"])
        runFinal.extend(static["run"])

        # fix source dependency to qx.core.Variant
        if len(variants) and buildType == "source" :
            #depsUnOpt = self.getDeps(fileId, {})  # get unopt deps
            depsUnOpt = classObj.dependencies({})  # get unopt deps
            # this might incur extra generation if unoptimized deps
            # haven't computed before for this fileId
            for depItem in depsUnOpt["load"]:
                if depItem.name == "qx.core.Variant":
                    loadFinal.append(depItem)
                    break
            for depItem in depsUnOpt["run"]:
                if depItem.name == "qx.core.Variant":
                    runFinal.append(depItem)
                    break

        # add config dependencies
        if self._require.has_key(fileId):
            loadFinal.extend(DependencyItem(x, -1) for x in self._require[fileId])

        if self._use.has_key(fileId):
            runFinal.extend(DependencyItem(x,-1) for x in self._use[fileId])

        # result dict
        deps = {
            "load" : loadFinal,
            "run"  : runFinal,
            "ignore" : static['ignore'],
            'undef' : static['undef']
        }

        return deps



    def _checkDepsAreKnown(self, deps,):
        # check the shallow deps are known classes
        new_warn = []
        for dep in deps["load"] + deps["run"] + deps["undef"]:
            if not self._isKnownClass(dep.name):
                new_warn.append(dep)
        return new_warn


    def _isKnownClass(self, classId):
        # check whether classId can be considered a known class
        if classId in lang.BUILTIN + ["clazz"]:
            return True
        elif classId in self._classesObj:
            return True
        elif re.match(r'this\b', classId):
            return True
        return False

    


    ######################################################################
    #  CLASS SORT SUPPORT
    ######################################################################

    def sortClasses(self, includeWithDeps, variants, buildType=""):

        def sortClassesRecurser(classId, available, variants, result, path):
            if classId in result:
                return

            # reading dependencies
            deps = self.getCombinedDeps(classId, variants, buildType)

            # path is needed for recursion detection
            if not classId in path:
                path.append(classId)

            # process loadtime requirements
            for dep in deps["load"]:
                item = dep.name
                if item in available and not item in result:
                    if item in path:
                        other = self.getCombinedDeps(item, variants)
                        self._console.warn("Detected circular dependency between: %s and %s" % (classId, item))
                        self._console.indent()
                        self._console.debug("%s depends on: %s" % (classId, ", ".join(deps["load"])))
                        self._console.debug("%s depends on: %s" % (item, ", ".join(other["load"])))
                        self._console.outdent()
                        raise RuntimeError("Circular class dependencies")

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

        for classId in includeWithDeps:
            sortClassesRecurser(classId, includeWithDeps, variants, result, path)

        return result


    def sortClassesTopological(self, includeWithDeps, variants):
        
        # create graph object
        gr = graph.digraph()

        # add classes as nodes
        gr.add_nodes(includeWithDeps)

        # for each load dependency add a directed edge
        for classId in includeWithDeps:
            deps = self.getCombinedDeps(classId, variants)
            for depClassId in deps["load"]:
                if depClassId in includeWithDeps:
                    gr.add_edge(depClassId, classId)

        # cycle check?
        cycle_nodes = gr.find_cycle()
        if cycle_nodes:
            raise RuntimeError("Detected circular dependencies between nodes: %r" % cycle_nodes)

        classList = gr.topological_sorting()

        return classList
