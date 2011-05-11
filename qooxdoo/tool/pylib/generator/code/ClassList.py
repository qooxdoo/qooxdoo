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

import sys, os, re, types
import graph

from generator                  import Context
from misc.NameSpace             import NameSpace
from ecmascript.frontend        import lang
from generator.code.Class       import DependencyItem, DependencyError


##
# Class to represent a list of classes (potentially sorted)
#
# - support for calculating the list from include seeds, via dependencies
# - support for dependency sorting
#
# It should also be possible to set the final list of classes in an instance,
# and then e.g. only use the sorting feature. Therefore, all constructor args
# are optional.
#
class ClassList(object):

    def __init__(self, libraries=[], includeWithDeps=[], includeNoDeps=[], exclude=[], variantSet={}, buildType=""):
        global console
        self._classList = []  # [Class()]
        self.libraries  = libraries   # [Library()]
        self.selection  = NameSpace()
        self.selection.includeWithDeps = includeWithDeps  # ["qx.Class"]
        self.selection.includeNoDeps = includeNoDeps
        self.selection.exclude = exclude
        self.variantSet  = variantSet    # {qx.debug:True}
        self.buildType = buildType   # source/build/...
        
        self.globalClasses = {}
        for lib in self.libraries:
            libclasses = lib.getClasses()
            for clazz in libclasses:
                self.globalClasses[clazz.id] = clazz

        console = Context.console

    def list(self):
        return self._classList


    ##
    # Calculate the exhaustive class list from the seed
    #
    def calculate(self, verifyDeps=False, force=False):

        ##
        # Resolve intelli include/exclude depdendencies
        def resolveDepsSmartCludes():
            if len(includeWithDeps) == 0 and len(includeNoDeps) > 0:
                if len(excludeWithDeps) > 0:
                    #raise ValueError("Blocking is not supported when only explicit includes are defined!");
                    pass
                result = []
            else:
                result = self.classlistFromInclude(includeWithDeps, excludeWithDeps, variants, verifyDeps, )

            return result


        ##
        # Explicit include/exclude
        def processExplicitCludes(result, includeNoDeps, excludeNoDeps):
            if len(includeNoDeps) > 0 or len(excludeNoDeps) > 0:
                console.info("Processing explicitly configured includes/excludes...")
                for entry in includeNoDeps:
                    if not entry in result:
                        result.append(entry)

                for entry in excludeNoDeps:
                    if entry in result:
                        result.remove(entry)
            return result

        # ---------------------------------------------------

        # already calculated - nothing to do
        if self._classList and not force:
            return self._classList

        buildType = self.buildType  # source/build, for sortClasses
        includeWithDeps = self.selection.includeWithDeps
        includeNoDeps = self.selection.includeNoDeps
        excludeWithDeps = self.selection.exclude
        variants = self.variantSet

        result = resolveDepsSmartCludes()
        result = processExplicitCludes(result, includeNoDeps, excludeWithDeps) # using excludeWithDeps here as well
        # Sort classes
        console.info("Sorting %s classes " % len(result), False)
        if  self._jobconf.get("dependencies/sort-topological", False):
            result = self.sortClassesTopological(result, variants)
        else:
            result = self.sortClasses(result, variants, buildType)
        console.nl()

        if console.getLevel() == "debug":
            console.indent()
            console.debug("Sorted class list:")
            console.indent()
            for classId in result:
                console.debug(classId)
            console.outdent()
            console.outdent()

        self._classList = result
        # Return list
        return self._classList



    def classlistFromInclude(self, includeWithDeps, excludeWithDeps, variants, 
                             verifyDeps=False, allowBlockLoaddeps=True):

        def classlistFromClassRecursive(depsItem, excludeWithDeps, variants, result, warn_deps, allowBlockLoaddeps=True):
            # support blocking
            if depsItem.name in excludeWithDeps:
                if depsItem.isLoadDep and not allowBlockLoaddeps:
                    raise DependencyError()
                return

            # check if already in
            if depsItem.name in resultNames:  # string compares are perceivably faster than object compares (as DependencyItem defines __eq__)
                return

            # add self
            result.append(depsItem)
            resultNames.append(depsItem.name)

            # reading dependencies
            console.debug("Gathering dependencies: %s" % depsItem.name)
            console.indent()
            deps, cached = self.getCombinedDeps(depsItem.name, variants, buildType)
            console.outdent()
            if logInfos: console.dot("%s" % "." if cached else "*")

            # and evaluate them
            deps["warn"] = self._checkDepsAreKnown(deps)  # add 'warn' key to deps
            ignore_names = [x.name for x in deps["ignore"]]
            if verifyDeps:
                for dep in deps["warn"]:
                    if dep.name not in ignore_names:
                        warn_deps.append(dep)

            # process lists
            try:
                skipNames = [x.name for x in deps["warn"] + deps["ignore"]]
  
                for subitem in deps["load"]:
                    if subitem.name not in resultNames and subitem.name not in skipNames:
                        classlistFromClassRecursive(subitem, excludeWithDeps, variants, result, warn_deps, allowBlockLoaddeps)
  
                ##
                # putting this here allows sorting and expanding of the class
                # list in one go! what's missing from sortClassesRecursor is
                # the cycle check
                #if depsItem.name not in resultNames:
                #    result.append(depsItem)
                #    resultNames.append(depsItem.name)
  
                for subitem in deps["run"]:
                    if subitem.name not in resultNames and subitem.name not in skipNames:
                        classlistFromClassRecursive(subitem, excludeWithDeps, variants, result, warn_deps, allowBlockLoaddeps)
  
            except DependencyError, detail:
                raise ValueError("Attempt to block load-time dependency of class %s to %s" % (depsItem.name, subitem.name))

            except NameError, detail:
                raise NameError("Could not resolve dependencies of class: %s \n%s" % (depsItem.name, detail))

            return

        # -------------------------------------------

        buildType = self.buildType  # source/build, for classlistFromClassRecursive

        result = []
        resultNames = []
        warn_deps = []
        logInfos = console.getLevel() == "info"

        # No dependency calculation
        if len(includeWithDeps) == 0:
            console.info("Including all known classes")
            result = self._classesObj.keys()

            # In this case the block works like an explicit exclude
            # because all classes are included like an explicit include.
            for classId in excludeWithDeps:
                result.remove(classId)

        # Calculate dependencies
        else:
            console.info(" ", feed=False)

            for item in includeWithDeps:
                depsItem = DependencyItem(item, '', '|config|')
                # calculate dependencies and add required classes
                classlistFromClassRecursive(depsItem, excludeWithDeps, variants, result, warn_deps, allowBlockLoaddeps)

            if console.getLevel() is "info":
                console.nl()

            # extract names of depsItems
            result = [x.name for x in result]

        # warn about unknown references
        ignored_names = set()
        # the current global ignore set is just the list of name spaces of the selected classes
        for classid in result:
            nsindex = classid.rfind(".")
            if nsindex == -1:
                continue # not interested in bare class names
            classnamespace = classid[:nsindex]
            ignored_names.add(classnamespace)
        for dep in warn_deps:
            if dep.name not in ignored_names:
                console.warn("Hint: Unknown global symbol referenced: %s (%s:%s)" % (dep.name, dep.requestor, dep.line))


        return result


    ##
    # return dependencies of class named <fileId>, both found in its code and
    # expressed in config options
    # - interface method

    def getCombinedDeps(self, fileId, variants, buildType="", stripSelfReferences=True, projectClassNames=True):

        # init lists
        loadFinal = []
        runFinal  = []

        # add static dependencies
        classObj = self._classesObj[fileId]

        static, cached = classObj.dependencies (variants)

        loadFinal.extend(static["load"])
        runFinal.extend(static["run"])

        # fix self-references
        if stripSelfReferences:
            loadFinal = [x for x in loadFinal if x.name != fileId]
            runFinal  = [x for x in runFinal  if x.name != fileId]

        # collapse multiple occurrences of the same class
        if projectClassNames:
            loads = loadFinal
            loadFinal = []
            for dep in loads:
                if dep.name not in (x.name for x in loadFinal):
                    loadFinal.append(dep)
            runs = runFinal
            runFinal = []
            for dep in runs:
                if dep.name not in (x.name for x in runFinal):
                    runFinal.append(dep)

        # fix source dependency to qx.core.Variant etc.
        variantSelectClasses = ("qx.core.Variant", "qx.core.Environment")
        if len(variants) and (buildType in ("source","hybrid", "build")) and (classObj.id not in variantSelectClasses):
            depsUnOpt, _ = classObj.dependencies({})  # get unopt deps
            # this might incur extra generation if unoptimized deps
            # haven't computed before for this fileId
            for depItem in depsUnOpt["load"]:
                if depItem.name in variantSelectClasses:
                    loadFinal.append(depItem)
            for depItem in depsUnOpt["run"]:
                if depItem.name in variantSelectClasses:
                    runFinal.append(depItem)

        # add config dependencies
        if fileId in self._require:
            loadFinal.extend(DependencyItem(x, '', "|config|") for x in self._require[fileId])

        if fileId in self._use:
            runFinal.extend(DependencyItem(x, '', "|config|") for x in self._use[fileId])

        # result dict
        deps = {
            "load"   : loadFinal,
            "run"    : runFinal,
            "ignore" : static['ignore'],
        }

        return deps, cached



    def _checkDepsAreKnown(self, deps,):
        # check the shallow deps are known classes
        new_warn = []
        for dep in deps["load"] + deps["run"]:
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

    def sort(self, classList, variants, buildType=""):

        def sortClassesRecurser(classId, classListSorted, path):
            if classId in classListSorted:
                return

            # reading dependencies
            deps, cached = self.getCombinedDeps(classId, variants, buildType)

            if console.getLevel() is "info":
                console.dot("%s" % "." if cached else "*")

            # path is needed for recursion detection
            if not classId in path:
                path.append(classId)

            # process loadtime requirements
            for dep in deps["load"]:
                dep_name = dep.name
                if dep_name in classList and not dep_name in classListSorted:
                    if dep_name in path:
                        console.warn("Detected circular dependency between: %s and %s" % (classId, dep_name))
                        console.indent()
                        console.debug("currently explored dependency path: %r" % path)
                        console.outdent()
                        raise RuntimeError("Circular class dependencies")
                    else:
                        sortClassesRecurser(dep_name, classListSorted, path)

            if not classId in classListSorted:
                # remove element from path
                path.remove(classId)

                # print "Add: %s" % classId
                classListSorted.append(classId)

            return

        # ---------------------------------

        classListSorted = []
        path   = []

        for classId in classList:
            sortClassesRecurser(classId, classListSorted, path)

        return classListSorted


    def sortTopological(self, includeWithDeps, variants):
        
        # create graph object
        gr = graph.digraph()

        # add classes as nodes
        gr.add_nodes(includeWithDeps)

        # for each load dependency add a directed edge
        for classId in includeWithDeps:
            deps, _ = self.getCombinedDeps(classId, variants)
            for depClassId in deps["load"]:
                if depClassId in includeWithDeps:
                    gr.add_edge(depClassId, classId)

        # cycle check?
        cycle_nodes = gr.find_cycle()
        if cycle_nodes:
            raise RuntimeError("Detected circular dependencies between nodes: %r" % cycle_nodes)

        classList = gr.topological_sorting()

        return classList

    
