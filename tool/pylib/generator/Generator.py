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

#

import re, os, sys, zlib, optparse, types, string, glob
import functools, codecs, operator, time
import graph

from misc                            import filetool, textutil, util, Path, json, copytool
from ecmascript.transform.optimizer  import privateoptimizer
from misc.ExtMap                     import ExtMap
from generator.code.Class            import Class, CompileOptions
from generator.code.DependencyLoader import DependencyLoader
from generator.code.PartBuilder      import PartBuilder
from generator.code.Script           import Script
from generator.code.Package          import Package
from generator.code.Part             import Part
from generator.code.CodeGenerator    import CodeGenerator
from generator.resource.Library      import Library
from generator.resource.ImageClipping    import ImageClipping
from generator.resource.Image        import Image
from generator.action.ApiLoader      import ApiLoader
from generator.action.Locale         import Locale
from generator.action.ActionLib      import ActionLib
from generator.action                import CodeProvider
from generator.runtime.Cache         import Cache
from generator.runtime.ShellCmd      import ShellCmd
from generator                       import Context


class Generator(object):

    def __init__(self, context):
        global console, interruptRegistry
        interruptRegistry = context['interruptRegistry']
        self._context   = context
        self._config    = context['config']  #config
        self._job       = context['jobconf'] #config.getJob(job)
        self._console   = context['console'] #console_
        self._variants  = {}
        self._settings  = {}
        self.approot    = None
        self._classesObj= {} # {'cid':generator.code.Class}

        if 'cache' in context:  # in case the Generator want to use a common cache object
            self._cache = context['cache']
        else:
            cache_path  = self._job.get("cache/compile", "cache")
            cache_path  = self._config.absPath(cache_path)
            self._cache = Cache(cache_path, **{
                'interruptRegistry' : context['interruptRegistry'],
                'console' : context['console'],
                'cache/downloads' : self._job.get("cache/downloads", cache_path + "/downloads"),
                'cache/invalidate-on-tool-change' : self._job.get('cache/invalidate-on-tool-change', False),
            })
            context['cache'] = self._cache

        console = self._console
        console.resetFilter()   # reset potential filters from a previous job

        Context.cache = self._cache
        
        return



    ##
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
              #"type"   : "JClassDepJob"
              "type" : "JCompileJob",
            },

            "compile" :
            {
              "type" : "JCompileJob",
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

            "provider" :
            {
              #"type" : "JCompileJob",
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
            "simulate" :
            {
              "type"   : "JSimpleJob"
            }
          }


        ##
        # Invoke the DependencyLoader to calculate the list of required classes
        # from include/exclude settings
        def computeClassList(includeWithDeps, excludeWithDeps, includeNoDeps, script, verifyDeps=False):
            self._console.info("Collecting classes   ", feed=False)
            self._console.indent()
            classList = self._depLoader.getClassList(includeWithDeps, excludeWithDeps, includeNoDeps, [], script, verifyDeps)
            # with generator.code.ClassList(): 
            #classList = ClassList(self._libraries, includeWithDeps, includeNoDeps, excludeWithDeps, variants, buildType)
            #classList = classList.calculate(verifyDeps)
            self._console.outdent()

            return classList


        ##
        # Invoke the PartBuilder to compute the packages for the configured
        # parts.
        def partsConfigFromClassList(includeWithDeps, excludeWithDeps, script):

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
                packageClasses = script.packagesSorted()

                #return boot, partPackages, packageClasses
                return script.boot, script.parts, packageClasses


            # -----------------------------------------------------------
            classList  = script.classes
            variants   = script.variants
            self._partBuilder = PartBuilder(self._console, self._depLoader)

            # Check for package configuration
            if self._job.get("packages"):
                (boot,
                partPackages,           # partPackages[partId]=[0,1,3]
                packageClasses          # packageClasses[0]=['qx.Class','qx.bom.Stylesheet',...]
                )   = evalPackagesConfig(excludeWithDeps, classList, variants)
            else:
                # Emulate configuration
                boot           = "boot"
                partPackages   = { "boot" : [0] }
                packageClasses = [classList]
                # patch script object
                script.boot        = boot
                packageObj         = Package(0)
                packageObj.classes = script.classesObj
                script.packages.append(packageObj)
                partObj            = Part("boot")
                partObj.packages.append(packageObj)
                partObj.initial_deps = includeWithDeps
                script.parts       = { "boot" : partObj }

            return boot, partPackages, packageClasses


        ##
        # Get the variants from the config
        def getVariants(confkey):
            variants = {}
            variantsConfig = self._job.get(confkey, {})
            variantsRuntime = self._variants

            for key in variantsConfig:
                variants[key] = variantsConfig[key]

            for key in variantsRuntime:
                variants[key] = [variantsRuntime[key]]

            # sanity check variants
            for key,val in variants.items():
                if not isinstance(val, types.ListType):
                    #raise ValueError("Config error: Variant values must be lists: \"%s\":\"%r\"" % (key,val))
                    # allow scalar values
                    variants[key] = [ val ]

            return variants


        ##
        # Get the exclude definition from the config
        def getExcludes(excludeCfg):
            #excludeCfg = self._job.get("exclude", [])
            excludeWithDeps = []
            excludeNoDeps   = []

            if len(excludeCfg) == 0:
                return [], []
            else:
                ignore_excludes = self._job.get("config-warnings/exclude", [])
                if '*' not in ignore_excludes:  # check individually
                    complain_excludes = [x for x in excludeCfg if not x in ignore_excludes]
                    if complain_excludes:
                        self._console.warn("Excludes may break code (%r)" % complain_excludes)

            # Splitting lists
            self._console.debug("Preparing exclude configuration...")
            excludeWithDeps, excludeNoDeps = self._splitIncludeExcludeList(excludeCfg)

            # Configuration feedback
            self._console.indent()

            if len(excludeNoDeps) > 0:
                if self._job.get("config-warnings/exclude", True):
                    self._console.warn("Excluding without dependencies is not supported, treating them as normal excludes: %r" % excludeNoDeps)
                excludeWithDeps.extend(excludeNoDeps)
                excludeNoDeps = []
            self._console.debug("Excluding %s items smart, %s items explicit" % (len(excludeWithDeps), len(excludeNoDeps)))

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
                    if self._job.get("config-warnings/exclude", True):
                        self._console.warn("Skipping unresolvable exclude entry: \"%s\"" % entry)
            excludeWithDeps = nexcludeWithDeps

            self._console.outdent()

            return excludeWithDeps, excludeNoDeps


        ##
        # Get the include definition from the config
        #
        # @param includeCfg []  self._job.get("include", [])
        #
        def getIncludes(includeCfg):

            # Splitting lists
            self._console.debug("Preparing include configuration...")
            includeWithDeps, includeNoDeps = self._splitIncludeExcludeList(includeCfg)
            self._console.indent()

            if len(includeWithDeps) > 0 or len(includeNoDeps) > 0:
                # Configuration feedback
                self._console.debug("Including %s items smart, %s items explicit" % (len(includeWithDeps), len(includeNoDeps)))

                if len(includeNoDeps) > 0:
                    if self._job.get("config-warnings/include", True):
                        self._console.warn("Explicitly included classes may not work")  # ?!

                # Resolve regexps
                self._console.debug("Expanding expressions...")
                try:
                    includeWithDeps = self._expandRegExps(includeWithDeps)
                    includeNoDeps   = self._expandRegExps(includeNoDeps)
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


        ##
        # Console output about variant being generated
        def printVariantInfo(variantSetNum, variants, variantSets, variantData):
            if len(variantSets) < 2:  # only log when more than 1 set
                return
            variantStr = json.dumps(variants,ensure_ascii=False)
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


        def prepareGenerator1():
            # scanning given library paths
            (self._namespaces,
             self._classesObj,
             self._docs,
             self._translations,
             self._libraries)     = self.scanLibrary(config.get("library", []))


            # create tool chain instances
            self._locale         = Locale(self._context, self._classesObj, self._translations, self._cache, self._console, )
            self._depLoader      = DependencyLoader(self._classesObj, self._cache, self._console, require, use, self._context)
            self._codeGenerator  = CodeGenerator(self._cache, self._console, self._config, self._job, self._settings, self._locale, self._classesObj)

            # distribute environment checks map
            # TODO : this could also be passed as a parameter to Class.dependencies()
            if "qx.core.Environment" in self._classesObj:
                envChecksMap = self._classesObj["qx.core.Environment"].extractChecksMap()
                for clazz in self._classesObj.values():
                    clazz.context['envchecksmap'] = envChecksMap



        ##
        # Safely take out a member from a set. Returns the member if it could
        # be removed, None otherwise.
        def takeout(s, m):
            try:
                s.remove(m)
            except KeyError:
                return None
            return m

        # -- Main --------------------------------------------------------------

        starttime = time.time()
        config = self._job
        job    = self._job
        require = config.get("require", {})
        use     = config.get("use", {})

        # Apply output log filter, if any
        self._console.setFilter(config.get("log/filter/debug", []))

        # This job's triggers
        triggersSet         = listJobTriggers()
        jobKeySet           = set(job.getData().keys())
        jobTriggers         = jobKeySet.intersection(triggersSet)

        # Create tool chain instances
        self._actionLib     = ActionLib(self._config, self._console)

        # process simple triggers
        if takeout(jobTriggers, "collect-environment-info"):
            self.runCollectEnvironmentInfo()
        if takeout(jobTriggers, "copy-files"):
            self.runCopyFiles()
        if takeout(jobTriggers, "combine-images"):
            self.runImageCombining()
        if takeout(jobTriggers, "clean-files"):
            self.runClean()
        if takeout(jobTriggers, "migrate-files"):
            self.runMigration(config.get("library"))
        if takeout(jobTriggers, "shell"):
            self.runShellCommands()
        if takeout(jobTriggers, "simulate"):
            self.runSimulation()
        if takeout(jobTriggers, "slice-images"):
            self.runImageSlicing()
         
        if jobTriggers:

            # -- Process job triggers that require a class list (and some)
            prepareGenerator1()

            # Preprocess include/exclude lists
            includeWithDeps, includeNoDeps = getIncludes(self._job.get("include", []))
            excludeWithDeps, excludeNoDeps = getExcludes(self._job.get("exclude", []))
            
            # process classdep triggers
            if takeout(jobTriggers, "fix-files"):
                self.runFix(self._classesObj)
            if takeout(jobTriggers, "lint-check"):
                self.runLint(self._classesObj)
            if takeout(jobTriggers, "translate"):
                self.runUpdateTranslation()
            if takeout(jobTriggers, "pretty-print"):
                self._codeGenerator.runPrettyPrinting(self._classesObj)
            if takeout(jobTriggers, "provider"):
                script = Script()
                script.classesObj = self._classesObj.values()
                environData = getVariants("environment") 
                variantSets = util.computeCombinations(environData)
                script.variants = variantSets[0] 
                script.optimize = config.get("compile-options/code/optimize", [])
                script.libraries = self._libraries
                script.namespace = self.getAppName()
                script.locales = config.get("compile-options/code/locales", [])
                CodeProvider.runProvider(script, self)

        if jobTriggers:

            # -- Process job triggers that require the full tool chain

            # Processing all combinations of variants
            environData = getVariants("environment")   # e.g. {'qx.debug':false, 'qx.aspects':[true,false]}
            variantSets  = util.computeCombinations(environData) # e.g. [{'qx.debug':'on','qx.aspects':'on'},...]
            for variantSetNum, variantset in enumerate(variantSets):

                # some console output
                printVariantInfo(variantSetNum, variantset, variantSets, environData)

                script           = Script()  # a new Script object represents the target code
                script.classesAll = self._classesObj  # for deps. analysis
                script.namespace = self.getAppName()
                script.variants  = variantset
                script.environment = variantset
                script.optimize  = config.get("compile-options/code/optimize", [])
                script.locales   = config.get("compile-options/code/locales", [])
                script.libraries = self._libraries
                script.jobconfig = self._job
                # set source/build version
                if "compile" in jobTriggers:
                    script.buildType = config.get("compile/type", "")
                    if script.buildType not in ("source","build","hybrid"):
                        raise ValueError("Unknown compile type '%s'" % script.buildType)

                if (script.buildType == "source"   # TODO: source processing could be placed outside the variant loop
                    or "variants" not in script.optimize  # TODO: script.variants is used both declaratively (config's environment map) *and* to signal variants optimization (e.g. in Class.dependencies())
                    ):
                    script.variants = {}

                # get current class list
                script.classes = computeClassList(includeWithDeps, excludeWithDeps, 
                                   includeNoDeps, script, verifyDeps=True)
                # keep the list of class objects in sync
                script.classesObj = [self._classesObj[id] for id in script.classes]

                if "statics" in script.optimize:
                    featureMap = self._depLoader.registerDependeeFeatures(script.classesObj, script.variants, script.buildType)
                    script._featureMap = featureMap
                else:
                    script._featureMap = {}

                # prepare 'script' object
                if set(("compile", "log")).intersection(jobTriggers):
                    partsConfigFromClassList(includeWithDeps, excludeWithDeps, script)

                # Execute real tasks
                if "api" in jobTriggers:
                    self.runApiData(script.classes, variantset)
                if "copy-resources" in jobTriggers:
                    self.runResources(script)
                if "compile" in jobTriggers:
                    self._codeGenerator.runCompiled(script)
                if "log" in jobTriggers:
                    self.runLogDependencies(script)
                    self.runPrivateDebug()
                    self.runLogUnusedClasses(script)
                    self.runLogResources(script)
                
        elapsedsecs = time.time() - starttime
        self._console.info("Done (%dm%05.2f)" % (int(elapsedsecs/60), elapsedsecs % 60))

        return


    def runPrivateDebug(self):
        if not self._job.get("log/privates", False):
            return

        self._console.info("Privates debugging...")
        privateoptimizer.debug()



    def runApiData(self, aClassList, variantset):
        apiPath = self._job.get("api/path")
        if not apiPath:
            return

        apiPath         = self._config.absPath(apiPath)
        self._apiLoader = ApiLoader(self._classesObj, self._docs, self._cache, self._console, self._job)

        classList = self._job.get("let/ARGS", [])
        if not classList:
            classList = aClassList
        
        self._apiLoader.storeApi(classList, apiPath, variantset, self._job.get("api/verify", []))
        
        return


    def runLogUnusedClasses(self, script):
        if not self._job.get("log/classes-unused", False):
            return

        packages   = script.packagesSorted()
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
                packageClasses = self._expandRegExps([namespace], [x.id for x in package.classes])
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

        return



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
            self._console.info("Writing dependency data to file: %s" % file)
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

            inclregexps = self._job.get("provider/include", ["*"])
            exclregexps = self._job.get("provider/exclude", [])
            inclregexps = map(textutil.toRegExp, inclregexps)
            exclregexps = map(textutil.toRegExp, exclregexps)

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
            classObjs = Class.mapResourcesToClasses(script.libraries, classObjs, self._job.get("asset-let", {}))

            for clazz in classObjs:
                reskeys = ["/resource/resources#"+x.id for x in clazz.resources]
                classToDeps[clazz.id]["run"].extend(reskeys)

            # Message key deps
            for classId in classToDeps:
                #classKeys, _ = self._locale.getTranslation(classId, {})
                classKeys, _ = self._classesObj[classId].messageStrings({})
                transIds  = set(x['id'] for x in classKeys) # get the msgid's, uniquely
                transIds.update(x['plural'] for x in classKeys if 'plural' in x) # add plural keys
                transKeys = ["/translation/i18n-${lang}#" + x for x in transIds]
                classToDeps[classId]["run"].extend(transKeys)

            # CLDR dependency
            for classId in classToDeps:
                if self._classesObj[classId].getHints("cldr"):
                    classToDeps[classId]["run"].append("/locale/locale-${lang}#cldr")

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
            file = depsLogConf.get('json/file', "deps.json")
            self._console.info("Writing dependency data to file: %s" % file)
            pretty = depsLogConf.get('json/pretty', None)
            if pretty:
                indent     = 2
                separators = (', ', ': ')
            else:
                indent     = None
                separators = (',', ':')
            filetool.save(file, json.dumps(classToDeps, sort_keys=True, indent=indent, separators=separators))
            
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
                if classId in self._classesObj:
                    if useCompiledSize:
                        fsize = self._classesObj[classId].getCompiledSize(compOptions, featuremap=script._featureMap)
                        mode  = 'compiled'
                    else:
                        fsize = self._classesObj[classId].size
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
                optimize        = self._config.get("compile-options/code/optimize", [])
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
                self._console.info("depends(%r, %r, %r)" % (classId, classDeps['load'], classDeps['run']))

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
            self._console.indent()
            self._console.indent()
            relstring = "Uses" if type == "using" else "Used by"
            depsMap = collectDispersedDependencies(classDepsIter)

            for classId in sorted(depsMap.keys()):
                classVals = depsMap[classId]
                packageId = classVals[0]
                depsLoad  = classVals[1]
                depsRun   = classVals[2]

                if packageId != oPackageId:
                    oPackageId = packageId
                    self._console.outdent()
                    self._console.info("Package %s" % packageId)
                    self._console.indent()
                    for partId in parts:
                        if packageId in (x.id for x in parts[partId].packages):
                            self._console.info("Part %s" % partId)
                            
                self._console.info("Class: %s" % classId)

                self._console.indent()
                for depId in sorted(depsLoad):
                    self._console.info("%s: %s (load)" % (relstring, depId))
                for depId in sorted(depsRun):
                    self._console.info("%s: %s (run)"  % (relstring, depId))
                self._console.outdent()
                    
            self._console.outdent()
            self._console.outdent()
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
            if cid in self._classesObj:
                fsize = self._classesObj[cid].size
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

        depsLogConf = self._job.get("log/dependencies", False)
        if not depsLogConf:
           return

        packages   = script.packagesSorted()
        parts      = script.parts
        variants   = script.variants

        # create a temp. lookup map to access Class() objects
        ClassIdToObject = dict([(classObj.id, classObj) for classObj in script.classesObj])
        
        depsLogConf = ExtMap(depsLogConf)

        self._console.info("Dependency logging  ", feed=False)
        self._console.indent()

        type = depsLogConf.get('type', None)
        if type in ("used-by", "using"):
            logDeps(depsLogConf, type)
        else:
            self._console.error('Dependency log type "%s" not in ["using", "used-by"]; skipping...' % type)

        self._console.outdent()
        self._console.dotclear()
        return


    def runLogResources(self, script):
        if not self._job.get("log/resources", False):
            return

        packages   = script.packagesSorted()
        parts      = script.parts
        variants   = script.variants

        self._console.info("Dumping resource info...");
        self._console.indent()

        allresources = {}
        # get resource info
        self._codeGenerator.packagesResourceInfo(script) # populate package.data.resources
        for packageId, package in enumerate(packages):
            allresources.update(package.data.resources)
        
        file = self._job.get("log/resources/file", "resources.json")
        filetool.save(file, json.dumpsCode(allresources))
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
            lib = [x for x in self._libraries if x.namespace == namespace][0]
            self._locale.updateTranslations(namespace, lib.translationPathSuffix(), locales)

        self._console.outdent()


    def runResources(self, script):
        if not self._job.get("copy-resources", False):
            return

        self._console.info("Copying resources...")
        classList     = script.classesObj
        resTargetRoot = self._job.get("copy-resources/target", "build")
        resTargetRoot = self._config.absPath(resTargetRoot)
        self.approot  = resTargetRoot  # this is a hack, because resource copying generates uri's

        # map resources to class.resources
        classList = Class.mapResourcesToClasses(script.libraries, classList, self._job.get("asset-let", {}))

        self._console.indent()
        # make resources to copy unique
        resources_to_copy = set(_res for cls in classList for _res in cls.resources)
        # Copy resources
        #for lib in libs:
        for res in resources_to_copy:
            # construct target path
            resTarget = os.path.join(resTargetRoot, 'resource', res.id)
            # Copy
            self._copyResources(res.path, os.path.dirname(resTarget))

        self._console.outdent()


    def runCollectEnvironmentInfo(self):
        letConfig = self._job.get('let',{})
        
        self._console.info("Environment information")
        self._console.indent()        
        
        platformInfo = util.getPlatformInfo()
        self._console.info("Platform: %s %s" % (platformInfo[0], platformInfo[1]))
        
        self._console.info("Python version: %s" % sys.version)
        
        if 'QOOXDOO_PATH' in letConfig:
            qxPath = self._config.absPath(letConfig['QOOXDOO_PATH'])
            self._console.info("qooxdoo path: %s" % qxPath)
        
            versionFile = open(os.path.join(qxPath, "version.txt"))
            version = versionFile.read()
            self._console.info("Framework version: %s" % version.strip())
        
            #TODO: Improve this check
            classFile = os.path.join(qxPath, "framework", "source", "class", "qx", "Class.js")
            self._console.info("Kit looks OK: %s" % os.path.isfile(classFile) )

        self._console.info("Looking for generated versions...")
        self._console.indent()
        try:
            expandedjobs = self._config.resolveExtendsAndRuns(["build-script", "source-script"])
            self._config.includeSystemDefaults(expandedjobs)
            self._config.resolveMacros(expandedjobs)
        except Exception:
            self._console.outdent()  # TODO: clean-up from the try block; fix this where the exception occurrs
            expandedjobs = []
        
        if expandedjobs:
            # make sure we're working with Job() objects (bug#5896)
            expandedjobs = [self._config.getJob(x) for x in expandedjobs]

            # check for build loader
            buildScriptFile =  expandedjobs[0].get("compile-options/paths/file", None)
            if buildScriptFile:
                buildScriptFilePath = self._config.absPath(buildScriptFile)
                self._console.info("Build version generated: %s" % os.path.isfile(buildScriptFilePath) )
            
            # check for source loader
            sourceScriptFile =  expandedjobs[1].get("compile-options/paths/file", None)
            if sourceScriptFile:
                sourceScriptFilePath = self._config.absPath(sourceScriptFile)
                self._console.info("Source version generated: %s" % os.path.isfile(sourceScriptFilePath) )
        else:
            self._console.info("nope")
        console.outdent()

        # check cache path
        cacheCfg = self._job.get("cache", None)
        if cacheCfg:
            self._console.info("Cache settings")
            self._console.indent()
            if 'compile' in cacheCfg:
                compDir = self._config.absPath(cacheCfg['compile'])
                self._console.info("Compile cache path is: %s" % compDir )
                self._console.indent()
                isDir = os.path.isdir(compDir)
                self._console.info("Existing directory: %s" % isDir)
                if isDir:
                    self._console.info("Cache file revision: %d" % self._cache.getCacheFileVersion())
                    self._console.info("Elements in cache: %d" % len(os.listdir(compDir)))
                self._console.outdent()
            if 'downloads' in cacheCfg:
                downDir = self._config.absPath(cacheCfg['downloads'])
                self._console.info("Download cache path is: %s" % downDir )
                self._console.indent()
                isDir = os.path.isdir(downDir)
                self._console.info("Existing directory: %s" % isDir)
                if isDir:
                    self._console.info("Elements in cache: %d" % len(os.listdir(downDir)))
                self._console.outdent()
            self._console.outdent()
        
        self._console.outdent()
            


    def runCopyFiles(self):
        # Copy application files
        if not self._job.get("copy-files/files", False):
            return

        filePatts = self._job.get("copy-files/files",[])
        if filePatts:
            buildRoot  = self._job.get("copy-files/target", "build")
            buildRoot  = self._config.absPath(buildRoot)
            sourceRoot = self._job.get("copy-files/source", "source")
            sourceRoot  = self._config.absPath(sourceRoot)
            self._console.info("Copying application files...")
            self._console.indent()
            for patt in filePatts:
                appfiles = glob.glob(os.path.join(sourceRoot, patt))
                for srcfile in appfiles:
                    self._console.debug("copying %s" % srcfile)
                    srcfileSuffix = Path.getCommonPrefix(sourceRoot, srcfile)[2]
                    destfile = os.path.join(buildRoot,srcfileSuffix)
                    if (os.path.isdir(srcfile)):
                        destdir = destfile
                    else:
                        destdir = os.path.dirname(destfile)
                    self._copyResources(srcfile, destdir)

            self._console.outdent()


    def runShellCommands(self):
        # wpbasti:
        # rename trigger from "shell" to "execute-commands"?
        # Should contain a list of commands instead
        if not self._job.get("shell/command"):
            return

        shellcmd = self._job.get("shell/command", "")
        if isinstance(shellcmd, list):
            for cmd in shellcmd:
                self.runShellCommand(cmd)
        else:
            self.runShellCommand(shellcmd)


    def runShellCommand(self, shellcmd):    
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

        self._imageClipper   = ImageClipping(self._console, self._cache, self._job)

        images = self._job.get("slice-images/images", {})
        for image, imgspec in images.iteritems():
            image = self._config.absPath(image)
            # wpbasti: Rename: Border => Inset as in qooxdoo JS code
            prefix       = imgspec['prefix']
            border_width = imgspec['border-width']
            if 'trim-width' in imgspec:
                trim_width = imgspec['trim-width']
            else:
                trim_width = True
            self._imageClipper.slice(image, prefix, border_width, trim_width)


    ##
    # Go through a list of images and create them as combination of other images
    def runImageCombining(self):

        def extractFromPrefixSpec(prefixSpec):
            prefix = altprefix = ""
            if not prefixSpec or not isinstance(prefixSpec, types.ListType):
                if self._job.get("config-warnings/combine-images", True):
                    self._console.warn("Missing or incorrect prefix spec, might lead to incorrect resource id's.")
            elif len(prefixSpec) == 2 :  # prefixSpec = [ prefix, altprefix ]
                prefix, altprefix = prefixSpec
            elif len(prefixSpec) == 1:
                prefix            = prefixSpec[0]
                altprefix         = ""
            return prefix, altprefix
                
        ##
        # strip prefix - if available - from imagePath, and replace by altprefix
        def getImageId(imagePath, prefixSpec):
            prefix, altprefix = extractFromPrefixSpec(prefixSpec)
            imageId = imagePath # init
            _, imageId, _ = Path.getCommonPrefix(imagePath, prefix) # assume: imagePath = prefix "/" imageId
            if altprefix:
                imageId   = altprefix + "/" + imageId
                
            imageId = Path.posifyPath(imageId)
            return imageId

        ##
        # create a dict with the clipped image file path as key, and prefix elements as value
        def getClippedImagesDict(imageSpec):
            imgDict = {}
            inputStruct = imageSpec['input']
            for group in inputStruct:
                prefixSpec = group.get('prefix', [])
                prefix, altprefix = extractFromPrefixSpec(prefixSpec)
                if prefix:
                    prefix = self._config.absPath(prefix)
                for filepatt in group['files']:
                    num_files = 0
                    for file in glob.glob(self._config.absPath(filepatt)):  # resolve file globs - TODO: can be removed in generator.action.ImageClipping
                        self._console.debug("adding image %s" % file)
                        imgDict[file]    = [prefix, altprefix] 
                        num_files       += 1
                    if num_files == 0:
                        raise ValueError("Non-existing file spec: %s" % filepatt)

            return imgDict

        # ----------------------------------------------------------------------

        if not self._job.get("combine-images", False):
            return

        self._console.info("Combining images...")
        self._console.indent()
        self._imageClipper   = ImageClipping(self._console, self._cache, self._job)

        images = self._job.get("combine-images/images", {})
        for image, imgspec in images.iteritems():
            self._console.info("Creating image %s" % image)
            self._console.indent()
            imageId= getImageId(image, imgspec.get('prefix', []))
            image  = self._config.absPath(image)  # abs output path
            config = {}

            # create a dict of clipped image objects - for later look-up
            clippedImages = getClippedImagesDict(imgspec)

            # collect list of all input files, no matter where they come from
            input = sorted(clippedImages.keys())

            # collect layout property
            if 'layout' in imgspec:
                layout = imgspec['layout'] == "horizontal"
            else:
                layout = "horizontal" == "horizontal" # default horizontal=True

            # get type of combined image (png, base64, ...)
            combtype = "base64" if image.endswith(".b64.json") else "extension"
            
            # create the combined image
            subconfigs = self._imageClipper.combine(image, input, layout, combtype)

            # for the meta information, go through the list of returned subconfigs (one per clipped image)
            for sub in subconfigs:
                x = Image()
                x.combId, x.left, x.top, x.width, x.height, x.format = (
                   imageId, sub['left'], sub['top'], sub['width'], sub['height'], sub['type'])
                subId = getImageId(sub['file'], clippedImages[sub['file']])
                config[subId] = x.toMeta()

            # store meta data for this combined image
            bname = os.path.basename(image)
            ri = bname.rfind('.')
            if ri > -1:
                bname = bname[:ri]
            bname += '.meta'
            meta_fname = os.path.join(os.path.dirname(image), bname)
            self._console.debug("writing meta file %s" % meta_fname)
            filetool.save(meta_fname, json.dumps(config, ensure_ascii=False, sort_keys=True))
            self._console.outdent()

            # handle base64 type, need to write "combined image" to file
            if combtype == "base64":
                combinedMap = {}
                for sub in subconfigs:
                    subMap = {}
                    subId  = getImageId(sub['file'], clippedImages[sub['file']])
                    subMap['width']    = sub['width']
                    subMap['height']   = sub['height']
                    subMap['type']     = sub['type']
                    subMap['encoding'] = sub['encoding']
                    subMap['data']     = sub['data']
                    combinedMap[subId] = subMap
                filetool.save(image, json.dumpsCode(combinedMap))
            
        self._console.outdent()

        return


    def runClean(self):

        def isLocalPath(path):
            return self._config.absPath(path).startswith(self._config.absPath(self._job.get("let/ROOT")))

        # -------------------------------------------

        if not self._job.get('clean-files', False):
            return

        self._console.info("Cleaning up files...")
        self._console.indent()

        # Handle caches
        #print "-- cache: %s; root: %s" % (self._config.absPath(self._job.get("cache/compile")), self._config.absPath(self._job.get("let/ROOT")))

        if (self._job.name == "clean" and not isLocalPath(self._job.get("cache/compile"))): # "clean" with non-local caches
            pass
        else:
            self._cache.cleanCompileCache()
        if (self._job.name == "clean" and not isLocalPath(self._job.get("cache/downloads"))): # "clean" with non-local caches
            pass
        else:
            self._cache.cleanDownloadCache()
        # Clean up other files
        self._actionLib.clean(self._job.get('clean-files'))

        self._console.outdent()


    def runLint(self, classes):

        def getFilteredClassList(classes, includePatt_, excludePatt_):
            # Although lint-check doesn't work with dependencies, we allow
            # '=' in class pattern for convenience; stripp those now
            intelli, explicit = self._splitIncludeExcludeList(includePatt_)
            includePatt = intelli + explicit
            intelli, explicit = self._splitIncludeExcludeList(excludePatt_)
            excludePatt = intelli + explicit
            if len(includePatt):
                incRegex = map(textutil.toRegExpS, includePatt)
                incRegex = re.compile("|".join(incRegex))
            else:
                incRegex = re.compile(".")  # catch-all
            if len(excludePatt):
                excRegex = map(textutil.toRegExpS, excludePatt)
                excRegex = re.compile("|".join(excRegex))
            else:
                excRegex = re.compile("^$")  # catch-none

            classesFiltered = (c for c in classes if incRegex.search(c) and not excRegex.search(c))
            return classesFiltered

        if not self._job.get('lint-check', False):
            return

        classes = classes.keys()
        self._console.info("Checking Javascript source code...")
        self._console.indent()
        self._shellCmd  = ShellCmd()

        qxPath = self._job.get('let',{})
        if 'QOOXDOO_PATH' in qxPath:
            qxPath = qxPath['QOOXDOO_PATH']
        else:
            raise RuntimeError, "Need QOOXDOO_PATH setting to run lint command"
        lintCommand    = os.path.join(qxPath, 'tool', 'bin', "ecmalint.py")
        lintJob        = self._job
        allowedGlobals = lintJob.get('lint-check/allowed-globals', [])
        includePatt    = lintJob.get('include', [])  # this is for future use
        excludePatt    = lintJob.get('exclude', [])

        #self._actionLib.lint(classes)
        lint_opts = "".join(map(lambda x: " -g"+x, allowedGlobals))
        classesToCheck = getFilteredClassList(classes, includePatt, excludePatt)
        for pos, classId in enumerate(classesToCheck):
            self._console.debug("Checking %s" % classId)
            self._shellCmd.execute('%s "%s" %s "%s"' % (sys.executable, lintCommand, lint_opts, self._classesObj[classId].path))

        self._console.outdent()


    def runMigration(self, libs):
        
        if not self._job.get('migrate-files', False):
            return

        self._console.info("Please heed the warnings from the configuration file parsing")
        self._console.info("Migrating Javascript source code to most recent qooxdoo version...")
        self._console.indent()

        migSettings     = self._job.get('migrate-files')
        self._shellCmd  = ShellCmd()

        migratorCmd = os.path.join(os.path.dirname(filetool.root()), "bin", "migrator.py")

        libPaths = []
        for lib in libs:
            lib._init_from_manifest() # Lib()'s aren't initialized yet
            libPaths.append(os.path.join(lib.path, lib.classPath))

        mig_opts = []
        if migSettings.get('from-version', False):
            mig_opts.extend(["--from-version", migSettings.get('from-version')])
        if migSettings.get('migrate-html'):
            mig_opts.append("--migrate-html")
        mig_opts.extend(["--class-path", ",".join(libPaths)])

        shcmd = " ".join(textutil.quoteCommandArgs([sys.executable, migratorCmd] + mig_opts))
        self._console.debug("Invoking migrator as: '%s'" % shcmd)
        self._shellCmd.execute(shcmd)

        self._console.outdent()


    def runFix(self, classes):

        def fixPng():
            return

        def removeBOM(fpath):
            content = open(fpath, "rb").read()
            if content.startswith(codecs.BOM_UTF8):
                self._console.debug("removing BOM: %s" % filePath)
                open(fpath, "wb").write(content[len(codecs.BOM_UTF8):])
            return

        # - Main ---------------------------------------------------------------

        if not isinstance(self._job.get("fix-files", False), types.DictType):
            return

        classes = classes.keys()
        fixsettings = ExtMap(self._job.get("fix-files"))

        # Fixing JS source files
        self._console.info("Fixing whitespace in source files...")
        self._console.indent()

        self._console.info("Fixing files: ", False)
        numClasses = len(classes)
        eolStyle = fixsettings.get("eol-style", "LF")
        tabWidth = fixsettings.get("tab-width", 2)
        for pos, classId in enumerate(classes):
            self._console.progress(pos+1, numClasses)
            classEntry   = self._classesObj[classId]
            filePath     = classEntry.path
            fileEncoding = classEntry.encoding
            fileContent  = filetool.read(filePath, fileEncoding)
            # Caveat: as filetool.read already calls any2Unix, converting to LF will
            # not work as the file content appears unchanged to this function
            if eolStyle == "CR":
                fixedContent = textutil.any2Mac(fileContent)
            elif eolStyle == "CRLF":
                fixedContent = textutil.any2Dos(fileContent)
            else:
                fixedContent = textutil.any2Unix(fileContent)
            fixedContent = textutil.normalizeWhiteSpace(textutil.removeTrailingSpaces(textutil.tab2Space(fixedContent, tabWidth)))
            if fixedContent != fileContent:
                self._console.debug("modifying file: %s" % filePath)
                filetool.save(filePath, fixedContent, fileEncoding)
            # this has to go separate, as it requires binary operation
            removeBOM(filePath)

        self._console.outdent()

        # Fixing PNG files -- currently just a stub!
        if fixsettings.get("fix-png", False):
            self._console.info("Fixing PNGs...")
            self._console.indent()
            fixPng()
            self._console.outdent()

        return


    def runSimulation(self):
        self._console.info("Running Simulation...")
        
        argv    = []
        javaBin = "java"
        javaClassPath = "-cp"
        argv.extend((javaBin, javaClassPath))

        configClassPath = self._job.get("simulate/java-classpath", [])
        qxSeleniumPath = self._job.get("simulate/qxselenium-path", False)
        if qxSeleniumPath:
            configClassPath.append(qxSeleniumPath)
        
        classPathSeparator = ":"
        if util.getPlatformInfo()[0] == "Windows":
            classPathSeparator = ";"
        
        configClassPath = classPathSeparator.join(configClassPath)
        
        if "CYGWIN" in util.getPlatformInfo()[0]:
            configClassPath = "`cygpath -wp " + configClassPath + "`"
        
        argv.append(configClassPath)
        
        rhinoClass = self._job.get("simulate/rhino-class", "org.mozilla.javascript.tools.shell.Main")
        runnerScript = self._job.get("simulate/simulator-script")
        argv.extend((rhinoClass, runnerScript))
        
        cmd = " ".join(textutil.quoteCommandArgs(argv))
        
        settings = self._job.get("environment", None)
        for key in settings:
            if type(settings[key]) == unicode:
                settings[key] = settings[key].replace(" ", "$")
        if settings:
            settings = json.dumps(settings, separators=(",", ":"))
            settings = settings.replace('"','\\"').replace("{", "\{").replace("}", "\}")
            settings = "settings=" + settings
            cmd += " " + settings
        
        self._console.debug("Selenium start command: " + cmd)
        shell = ShellCmd()
        shell.execute_logged(cmd, self._console, True)
        
    
    ##
    # Sorts the entries in [data] in those without ('intelli') and with
    # ('explicit') "=" at the beginning, stripping off the "=" in the latter
    # case.
    def _splitIncludeExcludeList(self, data):
        intelli = []
        explicit = []

        for entry in data:
            if len(entry) > 0:
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


    ##
    # Expand a list of class specifiers, pot. containing wildcards, into the
    # full list of classes that are covered by the initial list.
    def _expandRegExp(self, entry, container=None):
        if not container:
            container = self._classesObj
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


    ##
    # create a list ['-x', '.svn', '-x', '.git', '-x', ...] for version dir patts
    # used in _copyResources
    #skip_list = reduce(operator.concat, 
    #                   [['-x', x.strip("^\\$")] for x in filetool.VERSIONCONTROL_DIR_PATTS],
    #                   [])

    #skip_list = [x.strip("^\\$") for x in filetool.VERSIONCONTROL_DIR_PATTS]
    skip_list = filetool.VERSIONCONTROL_DIR_PATTS


    def _copyResources(self, srcPath, targPath):
        # targPath *has* to be directory  -- there is now way of telling a
        # non-existing target file from a non-existing target directory :-)
        generator = self
        #generator._console.debug("_copyResource: %s => %s" % (srcPath, targPath))
        copier = copytool.CopyTool(generator._console)
        args      = ['-s', '-x'] + [",".join(self.skip_list)] + [srcPath, targPath]
        copier.parse_args(args)
        copier.do_work()


    def _makeVariantsName(self, pathName, variants):
        (newname, ext) = os.path.splitext(pathName)
        for key in variants:
            newname += "_%s:%s" % (str(key), str(variants[key]))
        newname += ext
        return newname


    def getAppName(self, memo={}):
        if not 'appname' in memo:
            appname = self._job.get("let/APPLICATION")
            if not appname:
                raise RuntimeError, "Need an application name in config (key let/APPLICATION)"
            else:
                memo['appname'] = appname
        return memo['appname']


    ##
    # Invoke the Library() objects on involved libraries, to collect class
    # and resource lists etc.
    def scanLibrary(self, libraryKey):

        self._console.info("Scanning libraries  ", feed=False)
        self._console.indent()

        namespaces = []
        classes = {}
        docs = {}
        translations = {}
        libraries = []     # [generator.code.Library]
        if not isinstance(libraryKey, types.ListType):
            return (namespaces, classes, docs, translations, libraries)

        # have Libs read their Manifest's
        for libObj in libraryKey:
            libObj._init_from_manifest()  # delayed until here, where jobconf is in effect

        for libObj in libraryKey:

            checkFile, fsTime = libObj.mostRecentlyChangedFile()
            cacheId   = "lib-%s" % libObj.manipath
            checkObj, cacheTime  = self._cache.read(cacheId, memory=True)
            if checkObj:
                libObj = checkObj  # continue with cached obj
            # need re-scan?
            if not checkObj or cacheTime < fsTime:
                self._console.debug("Re-scanning lib %s" % libObj.path)
                libObj.scan(cacheTime)
                self._cache.write(cacheId, libObj, memory=True)

            namespace = libObj.getNamespace()
            namespaces.append(namespace)

            classList = libObj.getClasses()

            for entry in classList:
                classes[entry.id] = entry

            docs.update(libObj.getDocs())
            translations[namespace] = libObj.getTranslations()
            libraries.append(libObj)

        self._console.dotclear()
        self._console.nl()
        self._console.outdent()
        self._console.debug("Loaded %s libraries" % len(namespaces))
        self._console.debug("")

        return (namespaces, classes, docs, translations, libraries)




