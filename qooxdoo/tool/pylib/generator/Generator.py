#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
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

import re, os, sys, zlib, optparse, types, string, glob

from misc import filetool, textutil, util, Path, PathType
from misc.PathType import PathType
from ecmascript import compiler
from ecmascript.frontend             import treegenerator, tokenizer
from ecmascript.transform.optimizer  import variableoptimizer
from ecmascript.transform.optimizer  import privateoptimizer
#from ecmascript.transform.optimizer import protectedoptimizer
from misc.ExtMap                     import ExtMap
from generator.code.DependencyLoader import DependencyLoader
from generator.code.PartBuilder      import PartBuilder
from generator.code.TreeLoader       import TreeLoader
from generator.code.TreeCompiler     import TreeCompiler
from generator.code.LibraryPath      import LibraryPath
from generator.code.ResourceHandler  import ResourceHandler
from generator.code.Script           import Script
from generator.code.Package          import Package
from generator.code.Part             import Part
from generator.action.CodeGenerator  import CodeGenerator
from generator.action.ImageInfo      import ImgInfoFmt
from generator.action.ImageClipping  import ImageClipping
from generator.action.ApiLoader      import ApiLoader
from generator.action.Locale         import Locale
from generator.action.ActionLib      import ActionLib
from generator.runtime.Cache         import Cache
from generator.runtime.ShellCmd      import ShellCmd
import simplejson
from robocopy import robocopy
import graph


class Generator(object):

    def __init__(self, context):
        global console, interruptRegistry
        interruptRegistry = context['interruptRegistry']
        self._config    = context['config']  #config
        self._job       = context['jobconf'] #config.getJob(job)
        self._console   = context['console'] #console_
        self._variants  = {}
        self._settings  = {}
        self.approot    = None

        if 'cache' in context:  # in case the Generator want to use a common cache object
            self._cache = context['cache']
        else:
            cache_path  = self._job.get("cache/compile", "cache")
            cache_path  = self._config.absPath(cache_path)
            self._cache = Cache(cache_path, context)

        console = self._console



    # This is the main dispatch method to run a single job. It uses the top-
    # level keys of the job description to run all necessary methods. In order
    # to do so, it also sets up a lot of tool chain infrastructure.
    def run(self):

        # -- Helpers ----------------------------------------------------------

        def listJobTriggers(): return {
          
            "api" :
            {
              "type"   : "JClassDepJob"
            },
            
            "collect-environment-info" :
            {
              "type"   : "JSimpleJob"
            },

            "copy-files" :
            {
              "type"   : "JSimpleJob"
            },

            "combine-images" :
            {
              "type"   : "JSimpleJob"
            },

            "clean-files" :
            {
              "type"   : "JSimpleJob"
            },

            "copy-resources" :
            {
              "type"   : "JClassDepJob"
            },

            "compile-source" :
            {
              "type" : "JCompileJob",
            },

            "compile-dist" :
            {
              "type" : "JCompileJob",
            },

            "fix-files" :
            {
              "type" : "JClassDepJob",
            },

            "lint-check" :
            {
              "type" : "JClassDepJob",
            },

            "log" :
            {
              "type" : "JCompileJob",
            },

            "migrate-files" :
            {
              "type"   : "JSimpleJob",           # this might change once we stop to shell exit to an external script
            },

            "pretty-print" :
            {
              "type" : "JClassDepJob",
            },

            "shell" :
            {
              "type"   : "JSimpleJob"
            },

            "slice-images" :
            {
              "type"   : "JSimpleJob"
            },

            "translate" :
            {
              "type"   : "JClassDepJob"
            },
          }


        def computeClassList(includeWithDeps, excludeWithDeps, includeNoDeps, excludeNoDeps, variants, verifyDeps=False):
            self._console.info("Resolving dependencies...")
            self._console.indent()
            classList = self._depLoader.getClassList(includeWithDeps, excludeWithDeps, includeNoDeps, excludeNoDeps, variants, verifyDeps)
            self._console.outdent()

            return classList


        def scanLibrary(library):
            self._console.info("Scanning libraries...")
            self._console.indent()

            _namespaces = []
            _classes = {}
            _docs = {}
            _translations = {}
            _libs = {}
            if not isinstance(library, types.ListType):
                return (_namespaces, _classes, _docs, _translations, _libs)

            def getJobsLib(path):
                lib = None
                #path = os.path.abspath(os.path.normpath(path))  # this shouldn't be necessary, and breaks in some scenarios (s. bug#1861)
                libMaps = self._job.getFeature("library")
                for l in libMaps:
                    if l['path'] == path:
                        lib = l
                        break
                if not lib:   # this must never happen
                    raise RuntimeError("Unable to look up library \"%s\" in Job definition" % path)
                return lib

            def mostRecentlyChangedIn(lib):  # this should go into another class
                youngFiles = {}
                # for each interesting library part
                for category in ["class", "translation", "resource"]:
                    catPath = os.path.normpath(os.path.join(lib["path"], lib[category]))
                    # find youngest file
                    file, mtime = filetool.findYoungest(catPath)
                    youngFiles[mtime] = file
                    
                # also check the Manifest file
                file, mtime = filetool.findYoungest(lib["manifest"])
                youngFiles[mtime] = file
                
                # and return the maximum of those
                ytime = sorted(youngFiles.keys())[-1]
                return (youngFiles[ytime], ytime)

            for lib in library:
                key  = lib["path"]

                checkFile = mostRecentlyChangedIn(lib)[0]
                cacheId   = "lib-%s" % lib["manifest"] #key
                #print "xxx %s: %s" % (lib["namespace"], cacheId)
                path      = self._cache.read(cacheId, checkFile, memory=True)
                if path:
                    self._console.debug("Use memory cache for %s" % key)
                    path._console = self._console  # TODO: this is a hack to compensate LibraryPath.__getstate__ when pickeling
                else:
                    path = LibraryPath(lib, self._console)
                    namespace = getJobsLib(key)['namespace']
                    path._namespace = namespace  # patch namespace
                    path.scan()
                    self._cache.write(cacheId, path, memory=True)

                namespace = path.getNamespace()
                #namespace = getJobsLib(key)['namespace']
                _namespaces.append(namespace)

                classes = path.getClasses()
                _classes.update(classes)

                _docs.update(path.getDocs())
                _translations[namespace] = path.getTranslations()
                _libs[namespace] = lib

            self._console.outdent()
            self._console.debug("Loaded %s libraries" % len(_namespaces))
            self._console.debug("")

            return (_namespaces, _classes, _docs, _translations, _libs)



        def partsConfigFromClassList(excludeWithDeps, script):

            classList  = script.classes
            variants   = script.variants

            def evalPackagesConfig(excludeWithDeps, classList, variants):
                
                # Reading configuration
                partsCfg = self._job.get("packages/parts", {})

                # Expanding expressions
                self._console.debug("Expanding include expressions...")
                partIncludes = {}
                for partId in partsCfg:
                    partIncludes[partId] = self._expandRegExps(partsCfg[partId]['include'])

                # Computing packages
                #boot, partPackages, packageClasses = self._partBuilder.getPackages(partIncludes, excludeWithDeps, self._context, script)
                partPackages, _ = self._partBuilder.getPackages(partIncludes, excludeWithDeps, self._context, script)
                packageClasses = script.packagesArraySorted()

                #return boot, partPackages, packageClasses
                return script.boot, script.parts, packageClasses


            # Check for package configuration
            if self._job.get("packages"):
                (boot,
                partPackages,           # partPackages[partId]=[0,1,3]
                packageClasses          # packageClasses[0]=['qx.Class','qx.bom.Stylesheet',...]
                )              = evalPackagesConfig(excludeWithDeps, classList, variants)
            else:
                # Emulate configuration
                boot           = "boot"
                partPackages   = { "boot" : [0] }
                packageClasses = [classList]
                # patch script object
                script.boot        = boot
                packageObj         = Package(0)
                packageObj.classes = classList
                script.packages[0] = packageObj
                script.packageIdsSorted = [0]
                partObj            = Part("boot")
                #partObj.packages   = [0]
                partObj.packages.append(packageObj)
                script.parts       = { "boot" : partObj }

            return boot, partPackages, packageClasses


        def getVariants():
            # TODO: Runtime variants support is currently missing
            variants = {}
            variantsConfig = self._job.get("variants", {})
            variantsRuntime = self._variants

            for key in variantsConfig:
                variants[key] = variantsConfig[key]

            for key in variantsRuntime:
                variants[key] = [variantsRuntime[key]]

            return variants


        def getExcludes(excludeCfg):
            #excludeCfg = self._job.get("exclude", [])

            # Splitting lists
            self._console.debug("Preparing exclude configuration...")
            excludeWithDeps, excludeNoDeps = self._splitIncludeExcludeList(excludeCfg)

            # Configuration feedback
            self._console.indent()
            self._console.debug("Excluding %s items smart, %s items explicit" % (len(excludeWithDeps), len(excludeNoDeps)))

            if len(excludeCfg) > 0:
                self._console.warn("Excludes may break code!")

            self._console.outdent()

            # Resolve regexps
            self._console.indent()
            self._console.debug("Expanding expressions...")
            nexcludeWithDeps = []
            for entry in excludeWithDeps:
                try:
                    expanded = self._expandRegExp(entry)
                    nexcludeWithDeps.extend(expanded)
                except RuntimeError:
                    self._console.warn("! Skipping unresolvable exclude entry: \"%s\"" % entry)
            excludeWithDeps = nexcludeWithDeps

            nexcludeNoDeps = []
            for entry in excludeNoDeps:
                try:
                    expanded = self._expandRegExp(entry)
                    nexcludeNoDeps.extend(expanded)
                except RuntimeError:
                    self._console.warn("! Skipping unresolvable exclude entry: \"%s\"" % entry)
            excludeNoDeps = nexcludeNoDeps

            self._console.outdent()

            return excludeWithDeps, excludeNoDeps



        def getIncludes(includeCfg):
            #includeCfg = self._job.get("include", [])

            # Splitting lists
            self._console.debug("Preparing include configuration...")
            includeWithDeps, includeNoDeps = self._splitIncludeExcludeList(includeCfg)
            self._console.indent()

            if len(includeWithDeps) > 0 or len(includeNoDeps) > 0:
                # Configuration feedback
                self._console.debug("Including %s items smart, %s items explicit" % (len(includeWithDeps), len(includeNoDeps)))

                if len(includeNoDeps) > 0:
                    self._console.warn("Explicit included classes may not work")

                # Resolve regexps
                self._console.debug("Expanding expressions...")
                try:
                    includeWithDeps = self._expandRegExps(includeWithDeps)
                    includeNoDeps = self._expandRegExps(includeNoDeps)
                except RuntimeError:
                    self._console.error("Invalid include block: %s" % includeCfg)
                    raise

            elif self._job.get("packages"):
                # Special part include handling
                self._console.info("Including part classes...")
                partsCfg = partsCfg = self._job.get("packages/parts", {})
                includeWithDeps = []
                for partId in partsCfg:
                    includeWithDeps.extend(partsCfg[partId])

                # Configuration feedback
                self._console.debug("Including %s items smart, %s items explicit" % (len(includeWithDeps), len(includeNoDeps)))

                # Resolve regexps
                self._console.debug("Expanding expressions...")
                includeWithDeps = self._expandRegExps(includeWithDeps)

            self._console.outdent()

            return includeWithDeps, includeNoDeps


        def printVariantInfo(variantSetNum, variants, variantSets, variantData):
            if len(variantSets) < 2:  # only log when more than 1 set
                return
            variantStr = simplejson.dumps(variants,ensure_ascii=False)
            self._console.head("Processing variant set %s/%s" % (variantSetNum+1, len(variantSets)))

            # Debug variant combination
            hasVariants = False
            for key in variants:
                if len(variantData[key]) > 1:
                    hasVariants = True
                    
            if hasVariants:
                self._console.info("Switched variants:")
                self._console.indent()
                for key in variants:
                    if len(variantData[key]) > 1:
                        self._console.info("%s = %s" % (key, variants[key]))
                self._console.outdent()
            
            return


        # -- Main --------------------------------------------------------------

        config = self._job
        job    = self._job
        require = config.get("require", {})
        use     = config.get("use", {})
        context = {'config': self._config, 'jobconf': self._job, 'console': self._console, 'cache': self._cache}
        self._context = context

        # We use some sets of Job keys, both well-known and actual, to determin
        # which actions have to be run, and in which order.

        # Known job trigger keys
        triggersSet         = listJobTriggers()

        # some interesting categories
        triggersSimpleSet   = set((x for x in triggersSet if triggersSet[x]['type']=="JSimpleJob"))
        triggersClassDepSet = set((x for x in triggersSet if triggersSet[x]['type']=="JClassDepJob"))
        triggersCompileSet  = set((x for x in triggersSet if triggersSet[x]['type']=="JCompileJob"))

        # This job's triggers
        jobKeySet           = set(job.getData().keys())
        jobTriggers         = jobKeySet.intersection(triggersSet)

        # let's check for presence of certain triggers
        simpleTriggers   = jobTriggers.intersection(triggersSimpleSet) # we have simple job triggers
        classdepTriggers = jobTriggers.intersection(triggersClassDepSet) # we have classdep. triggers
        compileTriggers  = jobTriggers.intersection(triggersCompileSet)

        # Create tool chain instances
        self._actionLib     = ActionLib(self._config, self._console)

        # -- Process simple job triggers
        if simpleTriggers:
            for trigger in simpleTriggers:
                if trigger == "collect-environment-info":
                    self.runCollectEnvironmentInfo()
                elif trigger == "copy-files":
                    self.runCopyFiles()
                elif trigger == "combine-images":
                    self.runImageCombining()
                elif trigger == "clean-files":
                    self.runClean()
                elif trigger == "migrate-files":
                    self.runMigration(config.get("library"))
                elif trigger == "shell":
                    self.runShellCommands()
                elif trigger == "slice-images":
                    self.runImageSlicing()
                else:
                    pass # there cannot be exceptions, due to the way simpleTriggers is constructed

        # remove the keys we have processed
        jobTriggers = jobTriggers.difference(simpleTriggers)

        # use early returns to avoid setting up costly, but unnecessary infrastructure
        if not jobTriggers:
            self._console.info("Done")
            return

        # -- Process job triggers that require a class list (and some)

        # scanning given library paths
        (self._namespaces,
         self._classes,
         self._docs,
         self._translations,
         self._libs)         = scanLibrary(config.get("library"))

        # create tool chain instances
        self._treeLoader     = TreeLoader(self._classes, self._cache, self._console)
        self._locale         = Locale(self._context, self._classes, self._translations, self._cache, self._console, self._treeLoader)
        self._depLoader      = DependencyLoader(self._classes, self._cache, self._console, self._treeLoader, require, use, context)
        self._resourceHandler= ResourceHandler(self)
        self._codeGenerator  = CodeGenerator(self._cache, self._console, self._config, self._job, self._settings, self._locale, self._resourceHandler, self._classes)

        # Preprocess include/exclude lists
        includeWithDeps, includeNoDeps = getIncludes(self._job.get("include", []))
        excludeWithDeps, excludeNoDeps = getExcludes(self._job.get("exclude", []))
        # Processing all combinations of variants
        variantData = getVariants()  # e.g. {'qx.debug':['on','off'], 'qx.aspects':['on','off']}
        variantSets = util.computeCombinations(variantData) # e.g. [{'qx.debug':'on','qx.aspects':'on'},...]
        # get a class list with an initial variant set
        classList = computeClassList(includeWithDeps, excludeWithDeps, includeNoDeps, excludeNoDeps, variantSets[0], verifyDeps=True)
        
        # process job triggers
        if classdepTriggers:
            for trigger in classdepTriggers:
                if trigger == "api":
                    self.runApiData(classList)
                elif trigger == "copy-resources":
                    self.runResources(classList)
                elif trigger == "fix-files":
                    self.runFix(classList)
                elif trigger == "lint-check":
                    self.runLint(classList)
                elif trigger == "translate":
                    self.runUpdateTranslation()
                elif trigger == "pretty-print":
                    self._codeGenerator.runPrettyPrinting(classList, self._treeLoader)
                else:
                    pass

        # remove the keys we have processed, and check return
        jobTriggers = jobTriggers.difference(classdepTriggers)
        if not jobTriggers:
            self._console.info("Done")
            return

        # -- Process job triggers that require the full tool chain

        # Create tool chain instances
        self._treeCompiler   = TreeCompiler(self._classes, self._treeLoader, context)
        self._partBuilder    = PartBuilder(self._console, self._depLoader, self._treeCompiler)

        # TODO: the next is a kludge to optimize compile behaviour
        if "log" in jobTriggers:
            optimize = config.get("log/dependencies/dot/optimize", [])
            self._treeCompiler.setOptimize(optimize)
        if "compile-dist" in jobTriggers:  # let the compile-dist settings win
            optimize = config.get("compile-dist/code/optimize", [])
            self._treeCompiler.setOptimize(optimize)

        # Iterate through variant sets
        for variantSetNum, variants in enumerate(variantSets):

            # some console output
            printVariantInfo(variantSetNum, variants, variantSets, variantData)

            script          = Script()  # a new Script object represents the target code
            script.variants = variants

            # get current class list
            self._classList = computeClassList(includeWithDeps, excludeWithDeps, includeNoDeps, 
                                               excludeNoDeps, variants)
            script.classes  = self._classList

            # get parts config
            #(script.boot,
            #script.parts,            # script.parts['boot']=[0,1,3]
            #script.packages          # script.packages[0]=['qx.Class','qx.bom.Stylesheet',...]
            (_,
            _,            # script.parts['boot']=[0,1,3]
            _          # script.packages[0]=['qx.Class','qx.bom.Stylesheet',...]
            )               = partsConfigFromClassList(excludeWithDeps, script)

            # Execute real tasks
            self._codeGenerator.runSource  (script, self._libs, self._classes)
            self._codeGenerator.runCompiled(script, self._treeCompiler)

            # debug tasks
            self.runLogDependencies(script)
            self.runPrivateDebug()
            self.runLogUnusedClasses(script)
            #self.runClassOrderingDebug(partPackages, packageClasses, variants)

        self._console.info("Done")

        return


    def runPrivateDebug(self):
        if not self._job.get("log/privates", False):
            return

        self._console.info("Privates debugging...")
        privateoptimizer.debug()



    def runApiData(self, classList):
        apiPath = self._job.get("api/path")
        if not apiPath:
            return

        apiPath = self._config.absPath(apiPath)

        self._apiLoader      = ApiLoader(self._classes, self._docs, self._cache, self._console, self._treeLoader)

        self._apiLoader.storeApi(classList, apiPath)

        return


    def runLogUnusedClasses(self, script):
        if not self._job.get("log/classes-unused", False):
            return

        packages   = script.packagesArraySorted()
        parts      = script.parts
        variants   = script.variants

        namespaces = self._job.get("log/classes-unused", [])
        
        self._console.info("Find unused classes...");
        self._console.indent()

        usedClassesArr = {}
        allClassesArr = {}
        for namespace in namespaces:
            usedClassesArr[namespace] = []
            allClassesArr[namespace]  = []

        # used classes of interest
        for packageId, package in enumerate(packages):
            for namespace in namespaces:
                packageClasses = self._expandRegExps([namespace], package)
                usedClassesArr[namespace].extend(packageClasses)
        
        # available classes of interest
        for namespace in namespaces:
            allClassesArr[namespace] = self._expandRegExps([namespace])
        
        # check
        for namespace in namespaces:
            self._console.info("Checking namespace: %s" % namespace);
            self._console.indent()
            for cid in allClassesArr[namespace]:
                if cid not in usedClassesArr[namespace]:
                    self._console.info("Unused class: %s" % cid)
            self._console.outdent()
        self._console.outdent()



    def runClassOrderingDebug(self, parts, packages, variants):
        self._console.info("Class ordering debugging...")
        self._console.indent()


        for packageId, package in enumerate(packages):
            self._console.info("Package %s" % packageId)
            self._console.indent()

            for partId in parts:
                if packageId in parts[partId]:
                    self._console.info("Part %s" % partId)

                classList = self._depLoader.sortClasses(package, variants)
                #classList = self._depLoader.sortClassesTopological(package, variants)
                # report
                self._console.info("Sorted class list:")
                self._console.indent()
                for classId in classList:
                    self._console.info(classId)
                self._console.outdent()

            self._console.outdent()

        self._console.outdent()

        return


    ##
    #
    def runLogDependencies(self, script):

        depsLogConf = self._job.get("log/dependencies", False)
        if not depsLogConf:
           return

        packages   = script.packagesArraySorted()
        parts      = script.parts
        variants   = script.variants

        
        depsLogConf = ExtMap(depsLogConf)

        def lookupUsingDeps(packages):
            # a generator to yield all using-dependencies of classes in packages
            for packageId, package in enumerate(packages):
                for classId in sorted(package):
                    classDeps = self._depLoader.getDeps(classId, variants)
                    if classDeps["load"]:
                        for dep in classDeps["load"]:
                            yield (packageId, classId, dep.name, 'load')
                    if classDeps["run"]:
                        for dep in classDeps["run"]:
                            yield (packageId, classId, dep.name, 'run')
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
            self._console.info("Writing dependency data to file: %s" % file)
            pretty = depsLogConf.get('json/pretty', None)
            if pretty:
                indent     = 2
                separators = (', ', ': ')
            else:
                indent     = None
                separators = (',', ':')
            open(file, 'w').write(simplejson.dumps(data, sort_keys=True, indent=indent, separators=separators))
            
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
            self._console.info("Writing dependency data to file: %s" % file)
            pretty = depsLogConf.get('flare/pretty', None)
            if pretty:
                indent = 2
                separators = (', ', ': ')
            else:
                indent = None
                separators = (',', ':')
            open(file, 'w').write(simplejson.dumps(output, sort_keys=True, indent=indent, separators=separators))
            
            return

        def depsToDotFile(depsLogConf, gr):

            def getNodeAttribs(classId, useCompiledSize=False, optimize=[]):
                # return color according to size
                attribs = []
                color = fontsize = None
                sizes = {      # (big-threshold, medium-threshold)
                    'compiled' : (8000, 2000),
                    'source'   : (20000, 5000)
                }
                if useCompiledSize:
                    fsize = self._treeCompiler.getCompiledSize(classId, variants, optimize, recompile=True)
                    mode  = 'compiled'
                else:
                    fsize = self._classes[classId]['size']
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
                            if gr.has_edge(v1, v2): 
                                gr1.add_edge(v1, v2, attrs=gr.get_edge_attributes(v1, v2))
                return

            def addNodes(gr, st_nodes):
                # rather gr.add_nodes(st), go through indiviudal nodes for coloring
                if depsLogConf.get("dot/compiled-class-size", True):
                    useCompiledSize = True
                    optimize        = depsLogConf.get("dot/optimize", [])
                for cid in st_nodes:
                    if cid == None:  # None is introduced in st
                        continue
                    attribs = getNodeAttribs(cid, useCompiledSize, optimize)
                    gr.add_node(cid, attrs=attribs)
                return

            def writeDotFile(gr1, depsLogConf):
                file = depsLogConf.get('dot/file', "deps.dot")
                dot = gr1.write(fmt='dotwt')
                self._console.info("Writing dependency graph to file: %s" % file)
                open(file, 'w').write(dot)
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

            gr1 = createPrinterGraph(gr, depsLogConf)
            writeDotFile(gr1, depsLogConf)
            return


        def depsToConsole(classDepsIter):
            oPackageId = oClassId = oLoadOrRun = ''
            self._console.indent()
            self._console.indent()

            for (packageId, classId, depId, loadOrRun) in classDepsIter:
                if packageId != oPackageId:
                    oPackageId = packageId
                    self._console.outdent()
                    self._console.outdent()
                    self._console.info("Package %s" % packageId)
                    self._console.indent()
                    for partId in parts:
                        if packageId in parts[partId]:
                            self._console.info("Part %s" % partId)
                    self._console.indent()
                    self._console.indent()
                            
                if classId != oClassId:
                    oClassId   = classId
                    oLoadOrRun = ''         # reset this
                    self._console.outdent()
                    self._console.outdent()
                    self._console.info("Class: %s" % classId)
                    self._console.indent()
                    self._console.indent()

                if loadOrRun != oLoadOrRun:
                    oLoadOrRun = loadOrRun
                    self._console.outdent()
                    if loadOrRun == 'load':
                        self._console.info("Uses (load):")
                    elif loadOrRun == 'run':
                        self._console.info("Uses (run):")
                    self._console.indent()

                self._console.info("%s" % depId)

            self._console.outdent()
            self._console.outdent()
            return


        def graphAddEdges(classDepsIter, gr, pLoadOrRun):

            loadAttrs = [('color','red')]
            runAttrs  = []

            for (packageId, classId, depId, loadOrRun) in classDepsIter:
                if not gr.has_node(depId):         # skip dependencies outside includes/excludes
                    continue
                if loadOrRun == 'load' and pLoadOrRun != "runtime":
                    gr.add_edge(classId, depId, attrs = loadAttrs)
                elif loadOrRun == 'run' and pLoadOrRun != "loadtime":
                    gr.add_edge(classId, depId, attrs = runAttrs)

            return


        def graphAddNodes(gr, clsList):
            for cid in clsList:
                fsize = self._classes[cid]['size']
                if fsize > 20000:
                    color = "red"
                elif fsize > 5000:
                    color = "green"
                else:
                    color = "blue"
                gr.add_node(cid, attrs=[("color", color)])
            return

        def usedByDeps(depsLogConf):
            for packageId, package in enumerate(packages):
                self._console.info("Package %s" % packageId)
                self._console.indent()

                for partId in parts:
                    if packageId in parts[partId]:
                        self._console.info("Part %s" % partId)

                for classId in sorted(package):
                    self._console.info("Class: %s" % classId)
                    self._console.indent()

                    for otherClassId in package:
                        otherClassDeps = self._depLoader.getDeps(otherClassId, variants)

                        if classId in (x.name for x in otherClassDeps["load"]):
                            self._console.info("Used by: %s (load)" % otherClassId)

                        if classId in (x.name for x in otherClassDeps["run"]):
                            self._console.info("Used by: %s (run)" % otherClassId)

                    self._console.outdent()
                self._console.outdent()

            return

        def usingDeps(depsLogConf):

            dset       = depsLogConf.get('using/phase', None)
            mainformat = depsLogConf.get('format', None)
            if mainformat == 'dot':
                gr = graph.digraph()
                graphAddNodes(gr, self._classList)
                graphAddEdges(lookupUsingDeps(packages), gr, dset)
                depsToDotFile(depsLogConf, gr)
            elif mainformat == 'json':
                depsToJsonFile(lookupUsingDeps(packages), depsLogConf)
            elif mainformat == 'flare':
                depsToFlareFile(lookupUsingDeps(packages), depsLogConf)
            else:
                depsToConsole(lookupUsingDeps(packages))
            
            return

        # -----------------------------------------------

        self._console.info("Dependency logging...")
        self._console.indent()

        type = depsLogConf.get('type', None)
        if type == "used-by":
            usedByDeps(depsLogConf)
        elif type == "using":
            usingDeps(depsLogConf)
        else:
            self._console.error('Dependency log type "%s" not in ["using", "used-by"]; skipping...' % mode)

        self._console.outdent()
        return


    ##
    # update .po files
    #
    def runUpdateTranslation(self):
        namespaces = self._job.get("translate/namespaces")
        if not namespaces:
            return

        locales = self._job.get("translate/locales", None)
        self._console.info("Updating translations...")
        self._console.indent()
        for namespace in namespaces:
            lib = self._libs[namespace]
            self._locale.updateTranslations(namespace, os.path.join(lib['path'],lib['translation']), 
                                            locales)

        self._console.outdent()



    def runResources(self, classList):
        # only run for copy jobs
        if not self._job.get("copy-resources", False):
            return

        self._console.info("Copying resources...")
        resTargetRoot = self._job.get("copy-resources/target", "build")
        resTargetRoot = self._config.absPath(resTargetRoot)
        self.approot  = resTargetRoot  # this is a hack, because resource copying generates uri's
        libs          = self._job.get("library", [])
        resourceFilter, classMap = self._resourceHandler.getResourceFilterByAssets(classList)

        self._console.indent()
        # Copy resources
        for lib in libs:
            #libp = LibraryPath(lib,self._console)
            #ns   = libp.getNamespace()

            # construct a path to the source root for the resources
            #  (to be used later as a stripp-off from the resource source path)
            libpath = os.path.join(lib['path'],lib['resource'])
            libpath = os.path.normpath(libpath)

            # get relevant resources for this lib
            resList  = self._resourceHandler.findAllResources([lib], resourceFilter)

            # for each needed resource
            for res in resList:
                # Get source and target paths, and invoke copying

                # Get a source path
                resSource = os.path.normpath(res)

                # Construct a target path
                # strip off a library prefix...
                #  relpath = respath - libprefix
                relpath = (Path.getCommonPrefix(libpath, resSource))[2]
                if relpath[0] == os.sep:
                    relpath = relpath[1:]
                # ...to construct a suitable target path
                #  target = targetRoot + relpath
                resTarget = os.path.join(resTargetRoot, 'resource', relpath)

                # Copy
                self._copyResources(res, os.path.dirname(resTarget))

        self._console.outdent()

    

    def runCollectEnvironmentInfo(self):
        letConfig = self._job.get('let',{})      
        
        self._console.info("Environment information")
        self._console.indent()        
        
        platformInfo = util.getPlatformInfo()
        self._console.info("Platform: %s %s" % (platformInfo[0], platformInfo[1]))
        
        self._console.info("Python version: %s" % sys.version)
        
        if 'QOOXDOO_PATH' in letConfig:
            qxPath = letConfig['QOOXDOO_PATH']
            self._console.info("qooxdoo path: %s" % qxPath)
        
            versionFile = open(os.path.join(qxPath, "version.txt"))
            version = versionFile.read()
            self._console.info("Framework version: %s" % version.strip())
        
            #TODO: Improve this check
            classFile = os.path.join(qxPath, "framework", "source", "class", "qx", "Class.js")
            self._console.info("Kit looks OK: %s" % os.path.isfile(classFile) )
        
        if 'APPLICATION' in letConfig:
            appNamespace = letConfig['APPLICATION']
          
            buildScriptFile = os.path.join("build", "script", appNamespace + ".js")
            self._console.info("Build version generated: %s" % os.path.isfile(buildScriptFile) )
        
            sourceScriptFile = os.path.join("source", "script", appNamespace + ".js")
            self._console.info("Source version generated: %s" % os.path.isfile(sourceScriptFile) )
        
        self._console.outdent()
            


    def runCopyFiles(self):
        # Copy application files
        if not self._job.get("copy-files/files", False):
            return

        appfiles = self._job.get("copy-files/files",[])
        if appfiles:
            buildRoot  = self._job.get("copy-files/target", "build")
            buildRoot  = self._config.absPath(buildRoot)
            sourceRoot = self._job.get("copy-files/source", "source")
            sourceRoot  = self._config.absPath(sourceRoot)
            self._console.info("Copying application files...")
            self._console.indent()
            for file in appfiles:
                srcfile = os.path.join(sourceRoot, file)
                self._console.debug("copying %s" % srcfile)
                if (os.path.isdir(srcfile)):
                    destfile = os.path.join(buildRoot,file)
                else:
                    destfile = os.path.join(buildRoot, os.path.dirname(file))
                self._copyResources(srcfile, destfile)

            self._console.outdent()


    def runShellCommands(self):
        # wpbasti:
        # rename trigger from "shell" to "execute-commands"?
        # Should contain a list of commands instead
        if not self._job.get("shell/command"):
            return

        shellcmd = self._job.get("shell/command", "")
        rc = 0
        self._shellCmd       = ShellCmd()

        # massage relative paths - tricky!
        #parts = shellcmd.split()
        #nparts= []
        #for p in parts:
        #    if p.find(os.sep) > -1:
        #        if not os.path.isabs(p):
        #            nparts.append(self._config.absPath(p))
        #            continue
        #    nparts.append(p)

        #shellcmd = " ".join(nparts)
        self._console.info("Executing shell command \"%s\"..." % shellcmd)
        self._console.indent()

        rc = self._shellCmd.execute(shellcmd, self._config.getConfigDir())
        if rc != 0:
            raise RuntimeError, "Shell command returned error code: %s" % repr(rc)
        self._console.outdent()


    def runImageSlicing(self):
        """Go through a list of images and slice each one into subimages"""
        if not self._job.get("slice-images", False):
            return

        self._imageClipper   = ImageClipping(self._console, self._cache)

        images = self._job.get("slice-images/images", {})
        for image, imgspec in images.iteritems():
            image = self._config.absPath(image)
            # wpbasti: Rename: Border => Inset as in qooxdoo JS code
            prefix       = imgspec['prefix']
            border_width = imgspec['border-width']
            self._imageClipper.slice(image, prefix, border_width)


    def runImageCombining(self):
        """Go through a list of images and create them as combination of other images"""

        def extractFromPrefixSpec(prefixSpec):
            prefix = altprefix = ""
            if len(prefixSpec) == 2 :  # prefixSpec = [ prefix, altprefix ]
                prefix, altprefix = prefixSpec
            elif len(prefixSpec) == 1:
                prefix            = prefixSpec[0]
                altprefix         = ""
            return prefix, altprefix
                
        def getImageId(imagePath, prefixSpec):
            "strip prefix - if available - from imagePath, and replace by altprefix"
            prefix, altprefix = extractFromPrefixSpec(prefixSpec)
            imageId = imagePath # init
            _, imageId, _ = Path.getCommonPrefix(imagePath, prefix) # assume: imagePath = prefix "/" imageId
            if altprefix:
                imageId   = altprefix + "/" + imageId
                
            imageId = Path.posifyPath(imageId)
            return imageId

        def getClippedImagesDict(imageSpec):
            "create a dict with the clipped image file path as key, and an ImgInfoFmt object as value"
            imgDict = {}
            inputStruct = imageSpec['input']
            for group in inputStruct:
                prefixSpec = group.get('prefix')
                prefix, altprefix = extractFromPrefixSpec(prefixSpec)
                if prefix:
                    prefix = self._config.absPath(prefix)
                for filepatt in group['files']:
                    for file in glob.glob(self._config.absPath(filepatt)):  # resolve file globs - TODO: can be removed in generator.action.ImageClipping
                        imgObject        = ImgInfoFmt()
                        imgObject.prefix = [prefix, altprefix]
                        self._console.debug("adding image %s" % file)
                        imgDict[file]  = imgObject

            return imgDict

        # ----------------------------------------------------------------------

        if not self._job.get("combine-images", False):
            return

        self._console.info("Combining images...")
        self._console.indent()
        self._imageClipper   = ImageClipping(self._console, self._cache)

        images = self._job.get("combine-images/images", {})
        for image, imgspec in images.iteritems():
            imageId= getImageId(image, imgspec.get('prefix', None))
            image  = self._config.absPath(image)  # abs output path
            self._console.info("Creating image %s" % image)
            self._console.indent()
            config = {}

            # create a dict of clipped image objects - for later look-up
            clippedImages = getClippedImagesDict(imgspec)

            # collect list of all input files, no matter where the come from
            input = clippedImages.keys()

            # collect layout property
            if 'layout' in imgspec:
                layout = imgspec['layout'] == "horizontal"
            else:
                layout = "horizontal" == "horizontal" # default horizontal=True
            
            # create the combined image
            subconfigs = self._imageClipper.combine(image, input, layout)

            # for the meta information, go through the list of returned subconfigs (one per clipped image)
            for sub in subconfigs:
                x = ImgInfoFmt()
                x.mappedId, x.left, x.top, x.width, x.height, x.type = (
                   #Path.posifyPath(sub['combined']), sub['left'], sub['top'], sub['width'], sub['height'], sub['type'])
                   imageId, sub['left'], sub['top'], sub['width'], sub['height'], sub['type'])
                #config[Path.posifyPath(sub['file'])] = x.meta_format()  # this could use 'flatten()' eventually!
                subId         = getImageId(sub['file'], getattr(clippedImages[sub['file']], 'prefix', None))
                config[subId] = x.meta_format()  # this could use 'flatten()' eventually!

            # store meta data for this combined image
            bname = os.path.basename(image)
            ri = bname.rfind('.')
            if ri > -1:
                bname = bname[:ri]
            bname += '.meta'
            meta_fname = os.path.join(os.path.dirname(image), bname)
            self._console.debug("writing meta file %s" % meta_fname)
            filetool.save(meta_fname, simplejson.dumps(config, ensure_ascii=False, sort_keys=True))
            self._console.outdent()
            
        self._console.outdent()

        return


    def runClean(self):
        if not self._job.get('clean-files', False):
            return

        self._console.info("Cleaning up files...")
        self._console.indent()

        self._actionLib.clean(self._job.get('clean-files'))

        self._console.outdent()


    def runLint(self, classes):
        if not self._job.get('lint-check', False):
            return

        self._console.info("Checking Javascript source code...")
        self._console.indent()
        self._shellCmd  = ShellCmd()

        qxPath = self._job.get('let',{})
        if 'QOOXDOO_PATH' in qxPath:
            qxPath = qxPath['QOOXDOO_PATH']
        else:
            raise RuntimeError, "Need QOOXDOO_PATH setting to run lint command"
        lintCommand = os.path.join(qxPath, 'tool', 'bin', "ecmalint.py")
        lintsettings = ExtMap(self._job.get('lint-check'))
        allowedGlobals = lintsettings.get('allowed-globals', [])

        #self._actionLib.lint(classes)
        lint_opts = "".join(map(lambda x: " -g"+x, allowedGlobals))
        numClasses = len(classes)
        for pos, classId in enumerate(classes):
            self._shellCmd.execute('python "%s" %s "%s"' % (lintCommand, lint_opts, self._classes[classId]['path']))

        self._console.outdent()


    def runMigration(self, libs):
        if not self._job.get('migrate-files', False):
            return

        self._console.info("Migrating Javascript source code to most recent qooxdoo version...")
        self._console.indent()

        migSettings     = self._job.get('migrate-files')
        self._shellCmd  = ShellCmd()

        qxPath      = self._job.get('let',{})['QOOXDOO_PATH']
        migratorCmd = os.path.join(qxPath, 'tool', "bin", "migrator.py")

        libPaths = []
        for lib in libs:
            libPaths.append(os.path.join(lib['path'], lib['class']))

        mig_opts = ""
        if migSettings.get('from-version', False):
            mig_opts += "--from-version %s" % migSettings.get('from-version')
        if migSettings.get('migrate-html'):
            mig_opts += " --migrate-html"
        mig_opts += " --class-path %s" % ",".join(libPaths)

        shcmd = "python %s %s" % (migratorCmd, mig_opts)
        self._console.debug("Invoking migrator as: \"%s\"" % shcmd)
        self._shellCmd.execute(shcmd)

        self._console.outdent()


    def runFix(self, classes):
        if not isinstance(self._job.get("fix-files", False), types.DictType):
            return

        self._console.info("Fixing whitespace in source files...")
        self._console.indent()
        fixsettings = ExtMap(self._job.get("fix-files"))

        self._console.info("Fixing files: ", False)
        numClasses = len(classes)
        for pos, classId in enumerate(classes):
            self._console.progress(pos, numClasses)
            classEntry = self._classes[classId]
            filePath   = classEntry['path']
            fileEncoding = classEntry['encoding']
            fileContent  = filetool.read(filePath, fileEncoding)
            fixedContent = textutil.removeTrailingSpaces(textutil.tab2Space(textutil.any2Unix(fileContent), 2))
            if fixedContent != fileContent:
                self._console.debug("modifying file: %s" % filePath)
            filetool.save(filePath, fixedContent, fileEncoding)

        self._console.outdent()


    def _splitIncludeExcludeList(self, data):
        intelli = []
        explicit = []

        for entry in data:
            if entry[0] == "=":
                explicit.append(entry[1:])
            else:
                intelli.append(entry)

        return intelli, explicit



    def _expandRegExps(self, entries, container=None):
        result = []
        for entry in entries:
            expanded = self._expandRegExp(entry, container)
            result.extend(expanded)
        return result

    def _expandRegExp(self, entry, container=None):
        if not container:
            container = self._classes
        result = []

        # Fast path: Try if a matching class could directly be found
        if entry in container:
            result.append(entry)
        else:
            regexp   = textutil.toRegExp(entry)
            for classId in container:
                if regexp.search(classId) and classId not in result:
                    result.append(classId)
            if len(result) == 0:
                raise RuntimeError, "Expression gives no results. Malformed entry: %s" % entry

        return result


    # wpbasti: Does robocopy really help us here? Is it modified largely. Does this only mean modifications
    # for qooxdoo or code improvements as well? Do we need to give them back to the community of robocopy?
    def _copyResources(self, srcPath, targPath):
        # targPath *has* to be directory  -- there is now way of telling a
        # non-existing target file from a non-existing target directory :-)
        generator = self
        #generator._console.debug("_copyResource: %s => %s" % (srcPath, targPath))
        copier = robocopy.PyRobocopier(generator._console)
        copier.parse_args(['-f', '-c', '-s', '-x', '.svn', srcPath, targPath])
        copier.do_work()


    def _makeVariantsName(self, pathName, variants):
        (newname, ext) = os.path.splitext(pathName)
        for key in variants:
            newname += "_%s:%s" % (str(key), str(variants[key]))
        newname += ext
        return newname


