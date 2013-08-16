#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2012 1&1 Internet AG, Germany, http://www.1und1.de
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
# Logging related Generator Tasks
##

import os, sys, re, types, string
import graph
from generator         import Context
from misc              import filetool, textutil, json, util
from misc.ExtMap       import ExtMap
from ecmascript.transform.optimizer import privateoptimizer
from generator.output.CodeGenerator   import CodeGenerator
from generator.code.Class           import Class, CompileOptions

def runLogUnusedClasses(jobconf, script):
    if not jobconf.get("log/classes-unused", False):
        return

    console    = Context.console
    packages   = script.packagesSorted()
    namespaces = jobconf.get("log/classes-unused", [])

    console.info("Find unused classes...");
    console.indent()

    usedClassesArr = {}
    allClassesArr = {}
    for namespace in namespaces:
        usedClassesArr[namespace] = []
        allClassesArr[namespace]  = []

    # used classes of interest
    for packageId, package in enumerate(packages):
        for namespace in namespaces:
            packageClasses = textutil.expandGlobs([namespace], [x.id for x in package.classes])
            usedClassesArr[namespace].extend(packageClasses)

    # available classes of interest
    for namespace in namespaces:
        allClassesArr[namespace] = textutil.expandGlobs([namespace], script.classesAll)

    # check
    for namespace in namespaces:
        console.info("Checking namespace: %s" % namespace);
        console.indent()
        for cid in allClassesArr[namespace]:
            if cid not in usedClassesArr[namespace]:
                console.info("Unused class: %s" % cid)
        console.outdent()
    console.outdent()

    return


##
# Print Sorted Classes of Parts.
# (currently unused)
#
#def runClassOrderingDebug(jobconf, script):
#    console = Context.console
#    console.info("Class ordering debugging...")
#    console.indent()
#    parts = script.parts
#    packages = script.packages
#    variants = script.variants
#
#    for packageId, package in enumerate(packages):
#        console.info("Package %s" % packageId)
#        console.indent()
#
#        for partId in parts:
#            if packageId in parts[partId]:
#                console.info("Part %s" % partId)
#
#            classList = self._depLoader.sortClasses(package, variants)
#            #classList = self._depLoader.sortClassesTopological(package, variants)
#            # report
#            console.info("Sorted class list:")
#            console.indent()
#            for classId in classList:
#                console.info(classId)
#            console.outdent()
#
#        console.outdent()
#
#    console.outdent()
#
#    return


def runPrivateDebug(jobconf):
    if not jobconf.get("log/privates", False):
        return
    console = Context.console
    cache   = Context.cache

    cacheId = privateoptimizer.privatesCacheId
    privates, _ = cache.read(cacheId)

    console.info("Privates debugging...")
    privateoptimizer.debug(privates)


##
#
def runLogDependencies(jobconf, script):

    ##
    # A generator to yield all using dependencies of classes in packages;
    def lookupUsingDeps(packages, includeTransitives, forceFreshDeps=False):

        ##
        # has classId been yielded?
        def hasVisibleDeps(classId):
            # judged from the contents of its deps arrays
            load_names = [x.name for x in classDeps["load"]]
            run_names  = [x.name for x in classDeps["run"]]
            return set(load_names).union(run_names).difference(ignored_names)

        for packageId, package in enumerate(packages):
            for classObj in package.classes:
                classId = classObj.id
                classDeps, _ = classObj.getCombinedDeps(script.classesAll, variants, script.jobconfig, projectClassNames=False, force=forceFreshDeps, tree=classObj._tmp_tree)
                ignored_names = [x.name for x in classDeps["ignore"]]
                loads = classDeps["load"]
                runs = classDeps["run"]

                # strip transitive dependencies
                if not includeTransitives:
                    loads1, loads = loads[:], []
                    for dep in loads1:
                        # if the .requestor is different from classId, it must have been
                        # included through a transitive analysis
                        if dep.requestor == classId:
                            loads.append(dep)

                # project class names
                loads1, loads = loads[:], []
                for dep in loads1:
                    if dep.name not in (x.name for x in loads):
                        loads.append(dep)
                runs1, runs = runs[:], []
                for dep in runs1:
                    if dep.name not in (x.name for x in runs):
                        runs.append(dep)

                # yield dependencies
                for dep in loads:
                    if dep.name not in ignored_names:
                        yield (packageId, classId, dep.name, 'load')

                load_names = [x.name for x in loads]
                for dep in runs:
                    if dep.name not in ignored_names and dep.name not in load_names:
                        yield (packageId, classId, dep.name, 'run')

                if not hasVisibleDeps(classId):
                    # yield two empty relations, so that classId is at least visible to consumer
                    yield (packageId, classId, None, 'load')
                    yield (packageId, classId, None, 'run')

        return


    ##
    # A generator to yield all used-by dependencies of classes in packages;
    # will report used-by relations of a specific class in sequence
    def lookupUsedByDeps(packages, includeTransitives, forceFreshDeps=False):

        depsMap = {}

        # build up depsMap {"classId" : ("packageId", [<load_deps>,...], [<run_deps>, ...]) }
        for packageId, package in enumerate(packages):
            for classObj in package.classes:
                classId = classObj.id
                if classId not in depsMap:
                    depsMap[classId] = (packageId, [], [])
                classDeps, _ = classObj.getCombinedDeps(script.classesAll, variants, script.jobconfig, projectClassNames=False, force=forceFreshDeps)
                ignored_names = [x.name for x in classDeps["ignore"]]
                loads = classDeps["load"]
                runs  = classDeps["run"]

                # strip transitive dependencies
                if not includeTransitives:
                    loads1, loads = loads[:], []
                    for dep in loads1:
                        # if the .requestor is different from classId, it must be included
                        # through a transitive analysis
                        if dep.requestor == classId:
                            loads.append(dep)

                # project class names
                loads1, loads = loads[:], []
                for dep in loads1:
                    if dep.name not in (x.name for x in loads):
                        loads.append(dep)
                runs1, runs = runs[:], []
                for dep in runs1:
                    if dep.name not in (x.name for x in runs):
                        runs.append(dep)

                # collect dependencies
                for dep in loads:
                    if dep.name not in ignored_names:
                        if dep.name not in depsMap:
                            depsMap[dep.name] = (packageId, [], [])  # the packageId is bogus here
                        depsMap[dep.name][1].append(classId)
                for dep in runs:
                    if dep.name not in ignored_names:
                        if dep.name not in depsMap:
                            depsMap[dep.name] = (packageId, [], [])
                        depsMap[dep.name][2].append(classId)

        # yield depsMap
        for depId, depVal in depsMap.items():
            packageId   = depVal[0]
            usedByLoad  = depVal[1]
            usedByRun   = depVal[2]

            for classId in usedByLoad:
                yield (packageId, depId, classId, 'load')

            for classId in usedByRun:
                yield (packageId, depId, classId, 'run')

            if not usedByLoad + usedByRun: # this class isn't used at all
                # yield two empty relations, so that classId is at least visible to consumer
                yield (packageId, depId, None, 'load')
                yield (packageId, depId, None, 'run')

        return


    def depsToJsonFile(classDepsIter, depsLogConf):
        data = {}
        for (packageId, classId, depId, loadOrRun) in classDepsIter:
            if classId not in data:
                data[classId] = {}
                data[classId]["load"] = []
                data[classId]["run"] = []

            data[classId][loadOrRun].append(depId)

        file = depsLogConf.get('json/file', "deps.json")
        console.info("Writing dependency data to file: %s" % file)
        pretty = depsLogConf.get('json/pretty', None)
        if pretty:
            indent     = 2
            separators = (', ', ': ')
        else:
            indent     = None
            separators = (',', ':')
        filetool.save(file, json.dumps(data, sort_keys=True, indent=indent, separators=separators))

        return


    def depsToProviderFormat(classDepsIter, depsLogConf):
        ##
        # duplicates CodeProvider.passesOutputFilter
        def passesOutputFilter(resId):
            # must match some include expressions
            if not filter(None, [x.search(resId) for x in inclregexps]):  # [None, None, _sre.match, None, _sre.match, ...]
                return False
            # must not match any exclude expressions
            if filter(None, [x.search(resId) for x in exclregexps]):
                return False
            return True

        # ---------------------------------------

        inclregexps = jobconf.get("provider/include", ["*"])
        exclregexps = jobconf.get("provider/exclude", [])
        inclregexps = map(textutil.toRegExp, inclregexps)
        exclregexps = map(textutil.toRegExp, exclregexps)
        replace_dots = depsLogConf.get("json/replace-dots-in", [])
        slashes_keys = 'keys' in replace_dots
        slashes_vals = 'values' in replace_dots

        classToDeps = {}
        # Class deps
        for (packageId, classId, depId, loadOrRun) in classDepsIter:
            if passesOutputFilter(classId):
                if classId not in classToDeps:
                    classToDeps[classId] = {}
                    classToDeps[classId]["load"] = []
                    classToDeps[classId]["run"] = []
                if depId != None:
                    classToDeps[classId][loadOrRun].append(depId)

        if slashes_vals:
            # transform dep items
            for key, val in classToDeps.items():
                newval = []
                for ldep in val["load"]:
                    newdep = ldep.replace(".", "/")
                    newval.append(newdep)
                val["load"] = newval
                newval = []
                for ldep in val["run"]:
                    newdep = ldep.replace(".", "/")
                    newval.append(newdep)
                val["run"] = newval

        # Resource deps
        # class list
        classObjs = [x for x in script.classesObj if x.id in classToDeps.keys()]
        # map resources to class.resources
        classObjs = Class.mapResourcesToClasses(script.libraries, classObjs, jobconf.get("asset-let", {}))

        for clazz in classObjs:
            reskeys = ["/resource/resources#"+x.id for x in clazz.resources]
            classToDeps[clazz.id]["run"].extend(reskeys)

        # Message key deps
        for classId in classToDeps:
            #classKeys, _ = Locale.getTranslation(classId, {})
            classKeys, _ = script.classesAll[classId].messageStrings({})
            transIds  = set(x['id'] for x in classKeys) # get the msgid's, uniquely
            transIds.update(x['plural'] for x in classKeys if 'plural' in x) # add plural keys
            transKeys = ["/translation/i18n-${lang}#" + x for x in transIds]
            classToDeps[classId]["run"].extend(transKeys)

        # CLDR dependency
        for classId in classToDeps:
            if script.classesAll[classId].getHints("cldr"):
                classToDeps[classId]["run"].append("/locale/locale-${lang}#cldr")

        if slashes_keys:
            # transform dep keys ("qx.Class" -> "qx/Class.js")
            for key, val in classToDeps.items():
                if key.find(".")>-1:
                    newkey = key.replace(".", "/")
                    classToDeps[newkey] = classToDeps[key]
                    del classToDeps[key]

        # sort information for each class (for stable output)
        for classvals in classToDeps.values():
            for key in classvals:
                classvals[key] = sorted(classvals[key], reverse=True)

        # write to file
        file_ = depsLogConf.get('json/file', "deps.json")
        console.info("Writing dependency data to file: %s" % file_)
        pretty = depsLogConf.get('json/pretty', None)
        if pretty:
            indent     = 2
            separators = (', ', ': ')
        else:
            indent     = None
            separators = (',', ':')
        filetool.save(file_, json.dumps(classToDeps, sort_keys=True, indent=indent, separators=separators))

        return


    def depsToFlareFile(classDepsIter, depsLogConf):
        data = {}
        for (packageId, classId, depId, loadOrRun) in classDepsIter:
            if classId not in data:
                data[classId] = {}
                data[classId]['name'] = classId
                data[classId]["size"] = 1000
                data[classId]["imports"] = []

            if loadOrRun == 'load':
                data[classId]['imports'].append(depId)

        output = []
        for cid in data.keys():
            output.append(data[cid])

        file = depsLogConf.get('flare/file', "flare.json")
        console.info("Writing dependency data to file: %s" % file)
        pretty = depsLogConf.get('flare/pretty', None)
        if pretty:
            indent = 2
            separators = (', ', ': ')
        else:
            indent = None
            separators = (',', ':')
        filetool.save(file, json.dumps(output, sort_keys=True, indent=indent, separators=separators))

        return

    def depsToDotFile(classDepsIter, depsLogConf):

        def getNodeAttribs(classId, useCompiledSize=False, optimize=[]):
            # return color according to size
            attribs = []
            color = fontsize = None
            sizes = {      # (big-threshold, medium-threshold)
                'compiled' : (8000, 2000),
                'source'   : (20000, 5000)
            }
            compOptions = CompileOptions()
            compOptions.optimize = optimize
            compOptions.variantset = variants
            compOptions.format = True # guess it's most likely
            if classId in script.classesAll:
                if useCompiledSize:
                    fsize = script.classesAll[classId].getCompiledSize(compOptions, featuremap=script._featureMap)
                    mode  = 'compiled'
                else:
                    fsize = script.classesAll[classId].size
                    mode  = 'source'

                if fsize > sizes[mode][0]:
                    color = "red"
                    fontsize = 15
                elif fsize > sizes[mode][1]:
                    color = "green"
                    fontsize = 13
                else:
                    color = "blue"
                    fontsize = 10

            if fontsize:
                attribs.append(("fontsize",fontsize))
            if color:
                attribs.append(("color",color))
            return attribs

        def addEdges(gr, gr1, st, st_nodes, mode):
            # rather gr.add_spanning_tree(st), go through individual edges for coloring
            for v in st.iteritems():
                if None in v:  # drop edges with a None node
                    continue
                v2, v1 = v
                if gr.has_edge(v1,v2):
                    gr1.add_edge(v1, v2, attrs=gr.get_edge_attributes(v1, v2))
                else:
                    gr1.add_edge(v1, v2, )
            if not mode or not mode == "span-tree-only":  # add additional dependencies
                for v1 in st_nodes:                       # that are not covered by the span tree
                    for v2 in st_nodes:
                        if None in (v1, v2):
                            continue
                        if gr.has_edge(v1, v2):
                            gr1.add_edge(v1, v2, attrs=gr.get_edge_attributes(v1, v2))
            return

        def addNodes(gr, st_nodes):
            # rather gr.add_nodes(st), go through indiviudal nodes for coloring
            useCompiledSize = depsLogConf.get("dot/compiled-class-size", True)
            optimize        = jobconf.get("compile-options/code/optimize", [])
            for cid in st_nodes:
                if cid == None:  # None is introduced in st
                    continue
                attribs = getNodeAttribs(cid, useCompiledSize, optimize)
                gr.add_node(cid, attrs=attribs)
            return

        def writeDotFile(gr1, depsLogConf):
            file = depsLogConf.get('dot/file', "deps.dot")
            dot = gr1.write(fmt='dotwt')
            console.info("Writing dependency graph to file: %s" % file)
            filetool.save(file, dot)
            return

        def getFormatMode(depsLogConf):
            format = mode = None
            mode = depsLogConf.get('dot/span-tree-only', None)
            if mode:
                mode = "span-tree-only"
            return format, mode

        def createPrinterGraph(gr, depsLogConf):
            # create a helper graph for output
            format, mode = getFormatMode(depsLogConf)
            searchRoot   = depsLogConf.get('dot/root')  # get the root node for the spanning tree
            searchRadius = depsLogConf.get('dot/radius', None)
            if searchRadius:
                filter    = graph.filters.radius(searchRadius)
            else:
                filter    = graph.filters.null()
            st, op = gr.breadth_first_search(root=searchRoot, filter=filter) # get the spanning tree
            gr1 = graph.digraph()
            st_nodes = set(st.keys() + st.values())
            addNodes(gr1, st_nodes)
            addEdges(gr, gr1, st, st_nodes, mode)
            return gr1

        # -- Main (depsToDotFile) ------------------------------------------

        phase = depsLogConf.get('phase', None)
        gr    = graph.digraph()
        #graphAddNodes(gr, script.classes)
        graphAddEdges(classDepsIter, gr, phase)
        gr1   = createPrinterGraph(gr, depsLogConf)
        writeDotFile(gr1, depsLogConf)
        return


    def depsToTerms(classDepsIter):

        depends = {}
        for (packageId, classId, depId, loadOrRun) in classDepsIter:
            if classId not in depends:
                depends[classId]         = {}
                depends[classId]['load'] = []
                depends[classId]['run']  = []
            depends[classId][loadOrRun].append(depId)

        for classId, classDeps in depends.items():
            console.info("depends(%r, %r, %r)" % (classId, classDeps['load'], classDeps['run']))

        return


    def collectDispersedDependencies(classDepsIter):
        depsMap = {}
        # collect relations of a single class
        for (packageId, classId, depId, loadOrRun) in classDepsIter:
            if classId not in depsMap:
                depsMap[classId] = (packageId, [], [])
            if loadOrRun == "load":
                depsMap[classId][1].append(depId)
            elif loadOrRun == "run":
                depsMap[classId][2].append(depId)
        return depsMap


    def depsToConsole(classDepsIter, type):
        oPackageId = ''
        console.indent()
        console.indent()
        relstring = "Uses" if type == "using" else "Used by"
        depsMap = collectDispersedDependencies(classDepsIter)

        for classId in sorted(depsMap.keys()):
            classVals = depsMap[classId]
            packageId = classVals[0]
            depsLoad  = classVals[1]
            depsRun   = classVals[2]

            if packageId != oPackageId:
                oPackageId = packageId
                console.outdent()
                console.info("Package %s" % packageId)
                console.indent()
                for partId in parts:
                    if packageId in (x.id for x in parts[partId].packages):
                        console.info("Part %s" % partId)

            console.info("Class: %s" % classId)

            console.indent()
            for depId in sorted(depsLoad):
                console.info("%s: %s (load)" % (relstring, depId))
            for depId in sorted(depsRun):
                console.info("%s: %s (run)"  % (relstring, depId))
            console.outdent()

        console.outdent()
        console.outdent()
        return


    def graphAddEdges(classDepsIter, gr, pLoadOrRun):

        loadAttrs = [('color','red')]
        runAttrs  = []

        for (packageId, classId, depId, loadOrRun) in classDepsIter:
            if not gr.has_node(classId):
                graphAddNode(gr, classId)
            if not gr.has_node(depId):
                graphAddNode(gr, depId)
            if loadOrRun == 'load' and pLoadOrRun != "runtime":
                gr.add_edge(classId, depId, attrs = loadAttrs)
            if loadOrRun == 'run' and pLoadOrRun != "loadtime":
                gr.add_edge(classId, depId, attrs = runAttrs)

        return


    def graphAddNodes(gr, clsList):
        for cid in clsList:
            graphAddNode(gr, cid)


    def graphAddNode(gr, cid):
        if cid in script.classesAll:
            fsize = script.classesAll[cid].size
            if fsize > 20000:
                color = "red"
            elif fsize > 5000:
                color = "green"
            else:
                color = "blue"
        else:
            color = "blue"
        gr.add_node(cid, attrs=[("color", color)])
        return


    def logDeps(depsLogConf, type):

        mainformat = depsLogConf.get('format', None)
        includeTransitives = depsLogConf.get('include-transitive-load-deps', True)
        forceFreshDeps = depsLogConf.get('force-fresh-deps', False)

        # TODO: debug
        for cls in (c for p in packages for c in p.classes):
            #print cls.id
            pass

        if type == "using":
            classDepsIter = lookupUsingDeps(packages, includeTransitives, forceFreshDeps)
        else:
            classDepsIter = lookupUsedByDeps(packages, includeTransitives, forceFreshDeps)

        if mainformat == 'dot':
            depsToDotFile(classDepsIter, depsLogConf)
        elif mainformat == 'json':
            depsToJsonFile(classDepsIter, depsLogConf)
        elif mainformat == 'flare':
            depsToFlareFile(classDepsIter, depsLogConf)
        elif mainformat == 'term':
            depsToTerms(classDepsIter)
        elif mainformat == 'provider':
            depsToProviderFormat(classDepsIter, depsLogConf)
        else:
            depsToConsole(classDepsIter, type)

        return

    # -- Main (runLogDependencies) ------------------

    depsLogConf = jobconf.get("log/dependencies", False)
    if not depsLogConf:
       return

    console = Context.console
    console.info("Dependency logging  ", feed=False)
    console.indent()

    packages   = script.packagesSorted()
    parts      = script.parts
    variants   = script.variants
    depsLogConf = ExtMap(depsLogConf)

    type = depsLogConf.get('type', None)
    if type in ("used-by", "using"):
        logDeps(depsLogConf, type)
    else:
        console.error('Dependency log type "%s" not in ["using", "used-by"]; skipping...' % type)

    console.outdent()
    console.dotclear()
    return


def runLogResources(jobconf, script):
    if not isinstance(jobconf.get("log/resources", False), types.DictType):
        return
    console = Context.console
    packages = script.packagesSorted()

    console.info("Dumping resource info...");
    console.indent()

    allresources = {}
    # get resource info
    CodeGenerator.packagesResourceInfo(script) # populate package.data.resources
    for packageId, package in enumerate(packages):
        allresources.update(package.data.resources)

    file_ = jobconf.get("log/resources/file", "resources.json")
    filetool.save(file_, json.dumpsCode(allresources))
    console.outdent()

    return


def runCollectEnvironmentInfo(jobconfig, confObj):
    letConfig = jobconfig.get('let',{})
    console = Context.console
    cache = Context.cache

    console.info("Environment information")
    console.indent()

    platformInfo = util.getPlatformInfo()
    console.info("Platform: %s %s" % (platformInfo[0], platformInfo[1]))

    console.info("Python version: %s" % sys.version)

    if 'QOOXDOO_PATH' in letConfig:
        qxPath = confObj.absPath(letConfig['QOOXDOO_PATH'])
        console.info("qooxdoo path: %s" % qxPath)

        versionFile = open(os.path.join(qxPath, "version.txt"))
        version = versionFile.read()
        console.info("Framework version: %s" % version.strip())

        #TODO: Improve this check
        classFile = os.path.join(qxPath, "framework", "source", "class", "qx", "Class.js")
        console.info("Kit looks OK: %s" % os.path.isfile(classFile) )

    console.info("Looking for generated versions...")
    console.indent()
    try:
        expandedjobs = confObj.resolveExtendsAndRuns(["build-script", "source-script"])
        confObj.includeSystemDefaults(expandedjobs)
        confObj.resolveMacros(expandedjobs)
    except Exception:
        console.outdent()  # TODO: clean-up from the try block; fix this where the exception occurrs
        expandedjobs = []

    if expandedjobs:
        # make sure we're working with Job() objects (bug#5896)
        expandedjobs = [confObj.getJob(x) for x in expandedjobs]

        # check for build loader
        buildScriptFile =  expandedjobs[0].get("compile-options/paths/file", None)
        if buildScriptFile:
            buildScriptFilePath = confObj.absPath(buildScriptFile)
            console.info("Build version generated: %s" % os.path.isfile(buildScriptFilePath) )

        # check for source loader
        sourceScriptFile =  expandedjobs[1].get("compile-options/paths/file", None)
        if sourceScriptFile:
            sourceScriptFilePath = confObj.absPath(sourceScriptFile)
            console.info("Source version generated: %s" % os.path.isfile(sourceScriptFilePath) )
    else:
        console.info("nope")
    console.outdent()

    # check cache path
    cacheCfg = jobconfig.get("cache", None)
    if cacheCfg:
        console.info("Cache settings")
        console.indent()
        if 'compile' in cacheCfg:
            compDir = confObj.absPath(cacheCfg['compile'])
            console.info("Compile cache path is: %s" % compDir )
            console.indent()
            isDir = os.path.isdir(compDir)
            console.info("Existing directory: %s" % isDir)
            if isDir:
                console.info("Cache file revision: %d" % cache.getCacheFileVersion())
                console.info("Elements in cache: %d" % len(os.listdir(compDir)))
            console.outdent()
        if 'downloads' in cacheCfg:
            downDir = confObj.absPath(cacheCfg['downloads'])
            console.info("Download cache path is: %s" % downDir )
            console.indent()
            isDir = os.path.isdir(downDir)
            console.info("Existing directory: %s" % isDir)
            if isDir:
                console.info("Elements in cache: %d" % len(os.listdir(downDir)))
            console.outdent()
        console.outdent()

    console.outdent()



