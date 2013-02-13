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
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

#

import re, os, sys, types, string, time

from misc                            import textutil, util, json
from generator.code.DependencyLoader import DependencyLoader
from generator.code.PartBuilder      import PartBuilder
from generator.code.Script           import Script
from generator.code.Package          import Package
from generator.code.Part             import Part
from generator.action.CodeGenerator  import CodeGenerator
from generator.action.ActionLib      import ActionLib
from generator.action.Locale         import Locale as LocaleCls
from generator.action                import ApiLoader, Locale, CodeMaintenance, Testing, JsonValidation
from generator.action                import CodeProvider, Logging, FileSystem, Resources
from generator.action                import MiniWebServer
from generator.runtime.Cache         import Cache
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

            "manifest-validate" :
            {
              "type"   : "JSimpleJob"
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
            },
            "watch-files" :
            {
              "type"   : "JSimpleJob"
            },
            "web-server" :
            {
              "type"   : "JSimpleJob"
            },
            "web-server-config" :
            {
              "type"   : "JSimpleJob"
            },
          }


        ##
        # Invoke the DependencyLoader to calculate the list of required classes
        # from include/exclude settings
        def computeClassList(includeWithDeps, excludeWithDeps, includeNoDeps, excludeWithDepsHard, script, verifyDeps=False):
            self._console.info("Collecting classes   ", feed=False)
            self._console.indent()
            classList = self._depLoader.getClassList(includeWithDeps, excludeWithDeps, includeNoDeps, excludeWithDepsHard, script, verifyDeps)
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
                    partIncludes[partId] = textutil.expandGlobs(partsCfg[partId]['include'], self._classesObj)

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

            # Check for a 'packages' configuration in the job
            if 0:
                # this branch should work, but doesn't;
                # create a synthetic job key and let evalPackagesConfig do the rest
                if not self._job.get("packages"):
                    package_config = {
                        "parts" : {
                            "boot" : {
                                "include" : includeWithDeps
                            }
                        },
                        "init" : "boot"
                    }
                    self._job.setFeature("packages", package_config)
                (boot,
                partPackages,           # partPackages[partId]=[0,1,3]
                packageClasses          # packageClasses[0]=['qx.Class','qx.bom.Stylesheet',...]
                )   = evalPackagesConfig(excludeWithDeps, classList, variants)
            else:
                if self._job.get("packages"):
                    (boot,
                    partPackages,           # partPackages[partId]=[0,1,3]
                    packageClasses          # packageClasses[0]=['qx.Class','qx.bom.Stylesheet',...]
                    )   = evalPackagesConfig(excludeWithDeps, classList, variants)
                else:
                    # Emulate a 'boot' part
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
                    initial_deps = list(set(includeWithDeps).difference(script.excludes)) # defining classes from config minus expanded excludes
                    partObj.initial_deps = initial_deps
                    partObj.deps       = initial_deps[:]
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
            excludeWithDepsHard   = []

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
            excludeWithDeps, excludeWithDepsHard = textutil.splitPrefixedStrings(excludeCfg)

            # Configuration feedback
            self._console.indent()

            if len(excludeWithDepsHard) > 0:
                #if self._job.get("config-warnings/exclude", True):
                #    self._console.warn("Excluding without dependencies is not supported, treating them as normal excludes: %r" % excludeWithDepsHard)
                #excludeWithDeps.extend(excludeWithDepsHard)
                #excludeWithDepsHard = []
                pass
            self._console.debug("Excluding %s items smart, %s items explicit" % (len(excludeWithDeps), len(excludeWithDepsHard)))

            self._console.outdent()

            # Resolve regexps
            self._console.indent()
            self._console.debug("Expanding expressions...")
            for list_ in (excludeWithDeps, excludeWithDepsHard):
                lst = list_[:]
                list_[:] = []
                for elem in lst:
                    try:
                        expanded = textutil.expandGlob(elem, self._classesObj)
                    except RuntimeError, ex:
                        self._console.warn("Invalid exclude block: %s\n%s" % (excludeCfg, ex))
                    else:
                        list_.extend(expanded)

            self._console.outdent()

            return excludeWithDeps, excludeWithDepsHard


        ##
        # Get the include definition from the config
        #
        # @param includeCfg []  self._job.get("include", [])
        #
        def getIncludes(includeCfg):

            # Splitting lists
            self._console.debug("Preparing include configuration...")
            includeWithDeps, includeNoDeps = textutil.splitPrefixedStrings(includeCfg)
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
                    includeWithDeps = textutil.expandGlobs(includeWithDeps, self._classesObj)
                    includeNoDeps   = textutil.expandGlobs(includeNoDeps, self._classesObj)
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
                includeWithDeps = textutil.expandGlobs(includeWithDeps, self._classesObj)

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


        def prepareGenerator():
            # scanning given library paths
            (self._namespaces,
             self._classesObj,
             self._docs,
             self._translations,
             self._libraries)     = self.scanLibrary(config.get("library", []))


            # create tool chain instances
            self._locale = LocaleCls(self._context, self._classesObj, self._translations, self._cache, self._console, )
            self._depLoader = DependencyLoader(self._classesObj, self._cache, self._console, require, use, self._context)
            self._codeGenerator = CodeGenerator(self._cache, self._console, self._config, self._job, self._settings, self._locale, self._classesObj)

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
            Logging.runCollectEnvironmentInfo(self._job, self._config)
        if takeout(jobTriggers, "copy-files"):
            FileSystem.runCopyFiles(self._job, self._config)
        if takeout(jobTriggers, "combine-images"):
            Resources.runImageCombining(self._job, self._config)
        if takeout(jobTriggers, "clean-files"):
            FileSystem.runClean(self._job, self._config, self._cache)
        if takeout(jobTriggers, "manifest-validate"):
            JsonValidation.validateManifest(self._job, self._config)
        if takeout(jobTriggers, "migrate-files"):
            CodeMaintenance.runMigration(self._job, config.get("library"))
        if takeout(jobTriggers, "shell"):
            self._actionLib.runShellCommands(self._job)
        if takeout(jobTriggers, "simulate"):
            Testing.runSimulation(self._job)
        if takeout(jobTriggers, "slice-images"):
            Resources.runImageSlicing(self._job, self._config)
        if takeout(jobTriggers, "watch-files"):
            self._actionLib.watch(self._job, self._config)
        if takeout(jobTriggers, "web-server"):
            MiniWebServer.runWebServer(self._job, self._config)
        if takeout(jobTriggers, "web-server-config"):
            MiniWebServer.generateHttpdConfig(self._job, self._config)

        if jobTriggers:

            # -- Process job triggers that require a class list (and some)
            prepareGenerator()

            # Preprocess include/exclude lists
            includeWithDeps, includeNoDeps = getIncludes(self._job.get("include", []))
            excludeWithDeps, excludeWithDepsHard = getExcludes(self._job.get("exclude", []))

            # process classdep triggers
            if takeout(jobTriggers, "fix-files"):
                CodeMaintenance.runFix(self._job, self._classesObj)
            if takeout(jobTriggers, "lint-check"):
                CodeMaintenance.runLint(self._job, self._classesObj)
            if takeout(jobTriggers, "translate"):
                Locale.runUpdateTranslation(self._job, self._classesObj, self._libraries, self._translations)
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
                                   includeNoDeps, excludeWithDepsHard, script, verifyDeps=True)
                # keep the list of class objects in sync
                script.classesObj = [self._classesObj[id] for id in script.classes]

                if "statics" in script.optimize:
                    featureMap = self._depLoader.registerDependeeFeatures(script.classesObj, script.variants, script.buildType)
                    script._featureMap = featureMap
                else:
                    script._featureMap = {}

                # set the complete exclude list for classes
                excludes = set(excludeWithDeps[:])
                excludes.update(self._depLoader.expand_hard_excludes(excludeWithDepsHard, script))
                script.excludes = list(excludes)

                # prepare 'script' object
                if set(("compile", "log")).intersection(jobTriggers):
                    partsConfigFromClassList(includeWithDeps, excludeWithDeps, script)

                # Execute real tasks
                if "api" in jobTriggers:
                    ApiLoader.runApiData(self._job, self._config, script, self._docs)
                if "copy-resources" in jobTriggers:
                    FileSystem.runResources(self._config, script)
                if "compile" in jobTriggers:
                    self._codeGenerator.runCompiled(script)
                if "log" in jobTriggers:
                    Logging.runLogDependencies(self._job, script)
                    Logging.runPrivateDebug(self._job)
                    #Logging.runClassOrderingDebug(self._job, script)
                    Logging.runLogUnusedClasses(self._job, script)
                    Logging.runLogResources(self._job, script)

        elapsedsecs = time.time() - starttime
        self._console.info("Done (%dm%05.2f)" % (int(elapsedsecs/60), elapsedsecs % 60))

        return


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

            checkFile, fsTime = libObj.mostRecentlyChangedFile() # use the fresh Library() object to get the newest file on disk
            cacheId   = "lib-%s" % libObj.manipath
            checkObj, cacheTime  = self._cache.read(cacheId, memory=True)
            # need re-scan?
            if not checkObj or cacheTime < fsTime:
                self._console.debug("Re-scanning lib %s" % libObj.path)
                libObj.scan(cacheTime)
                self._cache.write(cacheId, libObj, memory=True)
            else:
                libObj = checkObj  # continue with cached obj

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




