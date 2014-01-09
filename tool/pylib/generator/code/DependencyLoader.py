#!/usr/bin/env python
# -*- coding: utf-8 -*-
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
#  - DependencyLoader.sortClasses()
#
##

import sys, re, os, types, time
from operator import attrgetter
import graph

from misc.ExtMap                import ExtMap
from ecmascript.frontend        import lang
from ecmascript.transform.check import global_symbols as gs
from generator.code.Class       import DependencyError
from generator.code.DependencyItem  import DependencyItem
from generator.action           import CodeMaintenance

class DependencyLoader(object):

    def __init__(self, classesObj, cache, console, require, use, context):
        self._classesObj = classesObj  # _libClassesObj
        self._cache   = cache
        self._console = console
        self._context = context
        self._jobconf = context.get('jobconf', ExtMap())
        self._require = require
        self._use     = use
        self.counter  = 0


    def expand_hard_excludes(self, excludeWithDepsHard, script, verifyDeps=False):
        excludes_hard = []
        if excludeWithDepsHard:
            excludes_hard = self.classlistFromInclude(excludeWithDepsHard, [], script.variants, verifyDeps, script)
        return excludes_hard


    ##
    # Return a class list for the current script
    def getClassList(self, includeWithDeps, excludeWithDeps, includeNoDeps, excludeWithDepsHard, script, verifyDeps=False):

        ##
        # Resolve intelli include/exclude depdendencies
        def resolveDepsSmartCludes(includeWithDeps, excludeWithDeps):
            if len(includeWithDeps) == 0 and len(includeNoDeps) > 0:
                if len(excludeWithDeps) > 0:
                    #raise ValueError("Blocking is not supported when only explicit includes are defined!");
                    pass
                result = []
            else:
                result = self.classlistFromInclude(includeWithDeps, excludeWithDeps, script.variants, verifyDeps, script)

            return result


        ##
        # Explicit include/exclude
        def processExplicitCludes(result, includeList, excludeList):
            if len(includeList) > 0 or len(excludeList) > 0:
                self._console.info("Processing explicitly configured includes/excludes...")
                for entry in includeList:
                    if not entry in result:
                        result.append(entry)

                for entry in excludeList:
                    if entry in result:
                        result.remove(entry)
            return result

        # ---------------------------------------------------

        if excludeWithDepsHard:
            exclude_hard_list = resolveDepsSmartCludes(excludeWithDepsHard, [])
        else:
            exclude_hard_list = []
        excludeList = excludeWithDeps + exclude_hard_list
        result = resolveDepsSmartCludes(includeWithDeps, excludeList)
        result = processExplicitCludes(result, includeNoDeps, excludeList) # resolveDepsSmartCludes not necessarily removes elems of exlcudeList, hence repeated here

        # Sort classes
        self._console.info("Sorting %s classes  " % len(result), False)
        result = self.sortClasses(result, script.variants, script.buildType)
        self._console.dotclear()
        #self._console.nl()

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

        def classlistFromClassRecursive(depsItem, excludeWithDeps, variants, result, warn_deps, loadDepsChain, allowBlockLoaddeps=True):
            # support blocking
            if depsItem.name in excludeWithDeps:
                if depsItem.isLoadDep and not allowBlockLoaddeps:
                    raise DependencyError()
                return

            # check if already in
            if depsItem.name in resultNames:  # string compares are perceivably faster than object compares (as DependencyItem defines __eq__)
                return

            # Reading dependencies

            self._console.debug("Gathering dependencies: %s" % depsItem.name)
            self._console.indent()
            classObj = self._classesObj[depsItem.name] # get class from depsItem - throws KeyError
            deps, cached = classObj.getCombinedDeps(self._classesObj, variants, self._jobconf)
            # lint-check - sans globals check (s.further)
            if lint_check and is_app_code(classObj): # opt: and not cached
                warns = classObj.lint_warnings(lint_opts)
                for warn in warns:
                    self._console.warn("%s (%d, %d): %s" % (classObj.id, warn.line, warn.column,
                        warn.msg % tuple(warn.args)))
            self._console.outdent()
            if logInfos: self._console.dot("%s" % "." if cached else "*")

            # And evaluate them

            # check for unknown globals
            deps["warn"] = self._checkDepsAreKnown(deps)  # add 'warn' key to deps
            ignore_names = [x.name for x in deps["ignore"]]
            if verifyDeps:
                for dep in deps["warn"]:
                    if dep.name not in ignore_names:
                        warn_deps.append(dep) # add it to warnings accumulator

            # process lists
            try:
                skipNames = [x.name for x in deps["warn"] + deps["ignore"]]

                # cycle detection
                assert depsItem.name not in loadDepsChain
                loadDepsChain.append(depsItem.name)

                for subitem in deps["load"]:
                    # cycle check
                    if subitem.name in loadDepsChain:
                        self._console.warn("Detected circular dependency between: %s and %s" % (depsItem.name, subitem.name))
                        self._console.indent()
                        self._console.debug("currently explored dependency path: %r" % loadDepsChain)
                        self._console.outdent()
                        raise RuntimeError("Circular class dependencies")
                    if subitem.name not in resultNames and subitem.name not in skipNames:
                        classlistFromClassRecursive(subitem, excludeWithDeps, variants, result, warn_deps, loadDepsChain, allowBlockLoaddeps)

                ##
                # putting this here allows expanding and partially sorting of the class
                # list in one go
                if depsItem.name not in resultNames:
                    result.append(depsItem)
                    resultNames.append(depsItem.name)

                # cycle check
                loadDepsChain.remove(depsItem.name)

                for subitem in deps["run"]:
                    if subitem.name not in resultNames and subitem.name not in skipNames:
                        classlistFromClassRecursive(subitem, excludeWithDeps, variants, result, warn_deps, [], allowBlockLoaddeps)

            except DependencyError, detail:
                raise ValueError("Attempt to block load-time dependency of class %s to %s" % (depsItem.name, subitem.name))

            except KeyError, detail:
                raise NameError("Could not resolve dependencies of class '%s': %s" % (depsItem.name, detail))

            return


        def classlistFromClassIterative(depsItem, excludeWithDeps, variants, result, warn_deps, loadDepsChain, allowBlockLoaddeps=True):

            def processNode(depsItem):
                if depsItem.name in resultNames:
                    node = None
                else:
                    result.append(depsItem)
                    resultNames.append(depsItem.name)
                    node = depsItem
                return node

            def getNodeChildren(depsItem):
                deps, cached = self._classesObj[depsItem.name].getCombinedDeps(self._classesObj, variants, self._jobconf)

                # and evaluate them
                deps["warn"] = self._checkDepsAreKnown(deps)  # add 'warn' key to deps
                ignore_names = [x.name for x in deps["ignore"]]
                if verifyDeps:
                    for dep in deps["warn"]:
                        if dep.name not in ignore_names:
                            warn_deps.append(dep)

                skipNames = [x.name for x in deps["warn"] + deps["ignore"]]
                result = []
                for dep in deps['load'] + deps['run']:
                    if dep.name in skipNames or dep.name in resultNames:
                        continue
                    result.append(dep)

                return result  # returns *all* deps (load, run, ...)

            # ---------------------------------------------------------------------

            self.agendaSearch([depsItem], processNode, getNodeChildren, mode="bf")

            return

        def is_app_code(classObj):
            return classObj.library.namespace == app_namespace
        # -------------------------------------------

        result = []
        warn_deps = []
        logInfos = self._console.getLevel() == "info"
        app_namespace = self._jobconf.get("let/APPLICATION", u'')

        # Lint stuff
        lint_check, lint_opts = CodeMaintenance.lint_comptime_opts()
        if lint_check:
            lint_opts.library_classes = self._classesObj.keys() # for globals shadowing check

        # No dependency calculation
        if len(includeWithDeps) == 0:
            self._console.info("Including all known classes")
            result = self._classesObj.keys()

            # In this case the block works like an explicit exclude
            # because all classes are included like an explicit include.
            for classId in excludeWithDeps:
                result.remove(classId)

            # TODO: use lint_check

        # Calculate dependencies
        else:
            result = []  # reset any previous results for this iteration
            resultNames = []

            # calculate class list recursively
            for item in includeWithDeps:
                depsItem = DependencyItem(item, '', '|config|')
                classlistFromClassRecursive(depsItem, excludeWithDeps, variants, result, warn_deps, [], allowBlockLoaddeps)

            self._console.dotclear()

            # extract names of depsItems
            result = [x.name for x in result]

        # Unknown globals warnings
        # - late, because adding the list of name spaces of the selected classes
        known_namespaces = set()
        for classid in result:
            nsindex = classid.rfind(".")
            if nsindex == -1:
                continue # not interested in bare class names
            classnamespace = classid[:nsindex]
            known_namespaces.add(classnamespace)
        # honor lint-check/allowed-globals config
        callowed_globals = self._jobconf.get("lint-check/allowed-globals", [])
        #known_namespaces.update(callowed_globals)
        for dep in warn_deps:
            if not gs.test_for_libsymbol(dep.name, callowed_globals, known_namespaces):
                self._console.warn("%s (%s): Unknown global symbol used: %s" % (dep.requestor, dep.line, dep.assembled()))

        return result


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


    def agendaSearch(self, agenda, processNode, getNodeChildren, mode="df"):
        while agenda:
            node = agenda.pop(0)
            node = processNode(node)
            if node:
                children = getNodeChildren(node)
                if mode == "df":
                    agenda[0:0] = children  # prepend
                else:
                    agenda.extend(children) # append
        return


    def agendaSearchMP(self, agenda, processNode, getNodeChildren, mode="df"):
        while agenda:
            node = agenda.pop(0)
            node = processNode(node)
            if node:
                children = getNodeChildren(node)
                if mode == "df":
                    agenda[0:0] = children  # prepend
                else:
                    agenda.extend(children) # append
        return




    ######################################################################
    #  CLASS SORT SUPPORT
    ######################################################################

    ##
    # Method chooser
    def sortClasses(self, *args, **kwargs):
        #if  self._jobconf.get("dependencies/sort-topological", False):
        return self.sortClassesRec(*args, **kwargs)
        #return self.sortClassesTopological(*args, **kwargs)


    def sortClassesRec(self, classList, variants, buildType=""):

        def sortClassesRecurser(classId, classListSorted, path):
            if classId in classListSorted:
                return

            # reading dependencies
            deps, cached = self._classesObj[classId].getCombinedDeps(self._classesObj, variants, self._jobconf)

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


    def sortClassesTopological(self, classList, variants, buildType=''):

        # create graph object
        gr = graph.digraph()

        # add classes as nodes
        gr.add_nodes(classList)

        # for each load dependency add a directed edge
        for classId in classList:
            deps, _ = self._classesObj[classId].getCombinedDeps(variants, self._jobconf)
            for dep in deps["load"]:
                depClassId = dep.name
                if depClassId in classList:
                    gr.add_edge(depClassId, classId)

        # cycle check?
        cycle_nodes = gr.find_cycle()
        if cycle_nodes:
            #raise RuntimeError("Detected circular dependencies between nodes: %r" % cycle_nodes)
            pass

        classList = gr.topological_sorting()

        return classList


    ######################################################################
    #  FEATURE SUPPORT
    ######################################################################

    ##
    # Returns featureMap =
    # { 'qx.core.Object' : {'myFeature': ('r',)} }  -- ('r',) is currently a way to say 'True'
    def registerDependeeFeatures(self, classList, variants, buildType=""):
        featureMap = {}
        self._console.info("Registering used class features  ", False)

        for clazz in classList:
            # make sure every class is at least listed
            if clazz.id not in featureMap:
                featureMap[clazz.id] = {}
            deps, _ = clazz.getCombinedDeps(self._classesObj, variants, self._jobconf, stripSelfReferences=False, projectClassNames=False, force=0)
            ignored_names = map(attrgetter("name"), deps['ignore'])
            for dep in deps['load'] + deps['run']:
                if dep.name in ignored_names:
                    continue
                if dep.name not in featureMap:
                    featureMap[dep.name] = {}
                if dep.attribute in featureMap[dep.name]:
                    # increment
                    featureMap[dep.name][dep.attribute].addref(dep)
                else:
                    # create
                    featureMap[dep.name][dep.attribute] = UsedFeature(dep)

        self._console.nl()
        return featureMap


##
# Helper class, to represent reference counts in the FeatureMap
#
class UsedFeature(object):

    def __init__(s, dep):
        s._ref_cnt = 1
        s._refs = [dep]

    def __str__(s):
        return "<UsedFeature:%d:%r>" % (s._ref_cnt, [("%s:%s" % (x.requestor, x.line)) for x in s._refs])

    def __repr__(s):
        return str(s)

    def addref(s, dep):
        s._refs.append(dep)
        s._ref_cnt += 1

    #def incref(s):
    #    s._ref_cnt += 1

    def decref(s, req_name='', req_line=''):
        if s._ref_cnt > 0:
            s._ref_cnt -= 1
        ref_removed = False
        if req_name:
            for ref in s._refs[:]:
                if ((ref.requestor == req_name and not req_line) or
                    (ref.requestor == req_name and ref.line == req_line)):
                    ref_removed = True
                    s._refs.remove(ref) # TODO: this is very delicate, as [].remove uses __eq__ of the elements!
        return ref_removed

    def hasref(s):
        return s._ref_cnt > 0

    def __len__(s):
        return len(s._refs)

    # this is more specific than DependencyItem.__eq__
    # compare name, attribute, requestor and line
    _depattribs = 'name attribute requestor line'.split()
    def _depmatches(s, dep, odep):
        return all([(getattr(dep,f)==getattr(odep,f)) for f in s._depattribs])

    def __contains__(s, odep):
        for dep in s._refs:
            if s._depmatches(dep, odep):
                return True
        return False


