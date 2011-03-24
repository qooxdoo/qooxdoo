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
from operator import attrgetter
import graph

from misc.ExtMap                import ExtMap
from ecmascript.frontend        import lang
from generator.code.Class       import DependencyItem, DependencyError

class DependencyLoader(object):

    def __init__(self, classesObj, cache, console, require, use, context):
        self._classesObj = classesObj
        self._cache   = cache
        self._console = console
        self._context = context
        self._jobconf = context.get('jobconf', ExtMap())
        self._require = require
        self._use     = use
        self.counter  = 0


    ##
    # Return a class list for the current script
    def getClassList(self, includeWithDeps, excludeWithDeps, includeNoDeps, excludeNoDeps, variants, verifyDeps=False, script=None):
        
        ##
        # Resolve intelli include/exclude depdendencies
        def resolveDepsSmartCludes():
            if len(includeWithDeps) == 0 and len(includeNoDeps) > 0:
                if len(excludeWithDeps) > 0:
                    #raise ValueError("Blocking is not supported when only explicit includes are defined!");
                    pass
                result = []
            else:
                result = self.classlistFromInclude(includeWithDeps, excludeWithDeps, variants, verifyDeps, script)

            return result


        ##
        # Explicit include/exclude
        def processExplicitCludes(result, includeNoDeps, excludeNoDeps):
            if len(includeNoDeps) > 0 or len(excludeNoDeps) > 0:
                self._console.info("Processing explicitly configured includes/excludes...")
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
        result = processExplicitCludes(result, includeNoDeps, excludeWithDeps) # using excludeWithDeps here as well
        # Sort classes
        self._console.info("Sorting %s classes " % len(result), False)
        if  self._jobconf.get("dependencies/sort-topological", False):
            result = self.sortClassesTopological(result, variants)
        else:
            result = self.sortClasses(result, variants, buildType)
        self._console.nl()

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
                             verifyDeps=False, script=None, allowBlockLoaddeps=True):

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
            self._console.debug("Gathering dependencies: %s" % depsItem.name)
            self._console.indent()
            deps, cached = self.getCombinedDeps(depsItem.name, variants, buildType)
            self._console.outdent()
            if logInfos: self._console.dot("%s" % "." if cached else "*")

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

        if script:
            buildType = script.buildType  # source/build, for classlistFromClassRecursive
        else:
            buildType = ""

        result = []
        resultNames = []
        warn_deps = []
        logInfos = self._console.getLevel() == "info"

        # No dependency calculation
        if len(includeWithDeps) == 0:
            self._console.info("Including all known classes")
            result = self._classesObj.keys()

            # In this case the block works like an explicit exclude
            # because all classes are included like an explicit include.
            for classId in excludeWithDeps:
                result.remove(classId)

        # Calculate dependencies
        else:
            self._console.info(" ", feed=False)

            for item in includeWithDeps:
                depsItem = DependencyItem(item, '', '|config|')
                # calculate dependencies and add required classes
                classlistFromClassRecursive(depsItem, excludeWithDeps, variants, result, warn_deps, allowBlockLoaddeps)

            if self._console.getLevel() is "info":
                self._console.nl()

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
                self._console.warn("Hint: Unknown global symbol referenced: %s (%s:%s)" % (dep.name, dep.requestor, dep.line))


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

        # fix source dependency to qx.core.Variant
        variantSelectClasses = ("qx.core.Variant", "qx.core.Environment")
        if len(variants) and (buildType in ("source","hybrid")) and (classObj.id not in variantSelectClasses):
            depsUnOpt, _ = classObj.dependencies({})  # get unopt deps
            # this might incur extra generation if unoptimized deps
            # haven't computed before for this fileId
            for depItem in depsUnOpt["load"]:
                if depItem.name in variantSelectClasses:
                    loadFinal.append(depItem)
                    # @deprecated
                    #break
            for depItem in depsUnOpt["run"]:
                if depItem.name in variantSelectClasses:
                    runFinal.append(depItem)
                    # @deprecated
                    #break

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

    def sortClasses(self, classList, variants, buildType=""):

        def sortClassesRecurser(classId, classListSorted, path):
            if classId in classListSorted:
                return

            # reading dependencies
            deps, cached = self.getCombinedDeps(classId, variants, buildType)

            if self._console.getLevel() is "info":
                self._console.dot("%s" % "." if cached else "*")

            # path is needed for recursion detection
            if not classId in path:
                path.append(classId)

            # process loadtime requirements
            for dep in deps["load"]:
                dep_name = dep.name
                if dep_name in classList and not dep_name in classListSorted:
                    if dep_name in path:
                        self._console.warn("Detected circular dependency between: %s and %s" % (classId, dep_name))
                        self._console.indent()
                        self._console.debug("currently explored dependency path: %r" % path)
                        self._console.outdent()
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


    def sortClassesTopological(self, includeWithDeps, variants):
        
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

    
    ##
    # Returns featureMap =
    # { 'qx.core.Object' : {'myFeature': ('r',)} }  -- ('r',) is currently a way to say 'True'
    def registerDependeeFeatures(self, classList, variants, buildType=""):
        featureMap = {}

        for clazz in classList:
            # make sure every class is at least listed
            if clazz.id not in featureMap:
                featureMap[clazz.id] = {}
            deps, _ = self.getCombinedDeps(clazz.id, variants, buildType, stripSelfReferences=False, projectClassNames=False)
            ignored_names = map(attrgetter("name"), deps['ignore'])
            for dep in deps['load'] + deps['run']:
                if dep.name in ignored_names:
                    continue
                if dep.name not in featureMap:
                    featureMap[dep.name] = {}
                featureMap[dep.name][dep.attribute] = ("r",)  # use 'r' for all currently
        
        self._console.indent()
        for clazz in featureMap:
            self._console.debug("'%s': used features: %r" % (clazz, featureMap[clazz].keys()))
        self._console.outdent()

        return featureMap

