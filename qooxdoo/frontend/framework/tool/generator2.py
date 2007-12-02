#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1and1.org
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

"""
Introduction
======================
Replacement for old generator

Overview
======================
* Load project configuration from JSON data file
* Each configuration can define multiple so named jobs
* Each job defines one action with all configuration
* A job can extend any other job and finetune the configuration
* Each execution of the generator can execute multiple of these jobs at once

* The system supports simple include/exclude lists
* The smart mode (default) includes the defined classes and their dependencies
and excludes the defined classes and dependencies but does not break remaining
included features.
* Each generated script (named package here) contains the compiled JavaScript data
* It is possible to generate multiple variant combinations
* This means that a single job execution can create multiple files at once
* Variants are combineable and all possible combinations are automatically created.
For example: gecko+debug, mshtml+debug, gecko+nodebug, mshtml+nodebug

* A further method to work with is the declaration of so named parts
* Each part defines a part of the application which you want to load separately
* A part could be of visual or logical nature
* Each part may result into multiple packages (script files)
* The number of packages could be exponential to the number of parts
but through the optimization this is often not the case
* You can automatically collapse the important parts. Such an important
part may be the initial application class (application layout frame) or
the splashscreen. Collapsing reduces the number of packages for the
defined parts. However collapsing badly influences the fine-grained nature
of the package system and should be ommitted for non-initial parts normally.
* Further optimization includes support for auto-merging small packages.
The relevant size to decide if a package is too small is the token size which
is defined by the author of the job. The system calculates the token size of
each package and tries to merge packages automatically.

Internals
======================
* All merges happen from right to left when the package list is sorted by priority.
The main theory is that a package which is used by multiple parts must have the dependencies
solved by both of them. So the merge will always happen into the next common package of
both parts from the current position to the left side.
"""

import sys, re, os, optparse, math, cPickle, copy, zlib

# reconfigure path
script_path = os.path.dirname(os.path.abspath(sys.argv[0]))
sys.path.insert(0, os.path.join(script_path, "modules"))
sys.path.insert(0, os.path.join(script_path, "generator2"))

from modules import optparseext
from modules import filetool
from modules import textutil
from modules import simplejson

from generator2 import apidata
from generator2 import cachesupport
from generator2 import treesupport
from generator2 import classpath
from generator2 import variantsupport
from generator2 import logsupport
from generator2 import dependencysupport
from generator2 import compilesupport
from generator2 import partsupport
from generator2 import scriptsupport
from generator2 import configsupport




######################################################################
#  UTILITIES
######################################################################

def __splitListToDict(data, divider=":"):
    result = {}
    for entry in data:
        splitted = entry.split(divider)
        result[splitted[0]] = splitted[1]

    return result


def __translateVariantValuesToFeatureSet(data):
    for key in data:
        if data[key] == "on":
            data[key] = True
        elif data[key] == "off":
            data[key] = False

    return data


def __translateVariantValuesFromFeatureSet(data):
    for key in data:
        if data[key] == True:
            data[key] = "on"
        elif data[key] == False:
            data[key] = "off"

    return data


def __translateSettingValuesToFeatureSet(data):
    for key in data:
        if data[key] == "true":
            data[key] = True
        elif data[key] == "false":
            data[key] = False

    return data


def __translateSettingValuesFromFeatureSet(data):
    for key in data:
        if data[key] == True:
            data[key] = "true"
        elif data[key] == False:
            data[key] = "false"

    return data




######################################################################
#  MAIN CONTENT
######################################################################

def main():
    parser = optparse.OptionParser(option_class=optparseext.ExtendAction)

    parser.add_option("-c", "--config", dest="config", metavar="FILENAME", help="Configuration file")
    parser.add_option("-j", "--jobs", action="extend", dest="jobs", metavar="DIRECTORY", type="string", default=[], help="Selected jobs")
    parser.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="Quiet output mode (Extra quiet).")
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="Verbose output mode (Extra verbose).")
    parser.add_option("-l", "--logfile", dest="logfile", metavar="FILENAME", default="", type="string", help="Log file")

    # runtime addons
    parser.add_option("--setting", action="extend", dest="settings", metavar="KEY:VALUE", type="string", default=[], help="Used settings")
    parser.add_option("--variant", action="extend", dest="variants", metavar="KEY:VALUE", type="string", default=[], help="Selected variants")
    parser.add_option("--featureset", action="extend", dest="featuresets", metavar="NAMESPACE:FILE", type="string", default=[], help="Featureset files to load")

    if len(sys.argv[1:]) == 0:
        basename = os.path.basename(sys.argv[0])
        print "usage: %s [options]" % basename
        print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
        sys.exit(1)

    (options, args) = parser.parse_args(sys.argv[1:])

    process(options)



def process(options):
    # Initialize console
    if options.verbose:
        console = logsupport.Log(options.logfile, "debug")
    elif options.quiet:
        console = logsupport.Log(options.logfile, "warning")
    else:
        console = logsupport.Log(options.logfile, "info")

    # Initial user feedback
    console.head("Initialization", True)
    console.info("Processing...")
    console.indent()
    console.debug("Configuration: %s" % options.config)
    console.debug("Jobs: %s" % ", ".join(options.jobs))
    console.outdent()

    # Load from json configuration
    config = simplejson.loads(filetool.read(options.config))

    # Resolve "extend"-Keys
    resolve(console, config, options.jobs)

    # Convert into Config class instance
    config = configsupport.Config(config)

    # Process feature sets
    runtime = {
      "variant" : __translateVariantValuesToFeatureSet(__splitListToDict(options.variants)),
      "setting" : __translateSettingValuesToFeatureSet(__splitListToDict(options.settings))
    }

    for fileName in options.featuresets:
        console.debug("Executing feature set: %s" % fileName)
        execfile(fileName, {}, runtime)

    # Convert to useable variants and settings
    variants = __translateVariantValuesFromFeatureSet(runtime["variant"])
    settings = __translateSettingValuesFromFeatureSet(runtime["setting"])

    # Processing jobs...
    for job in options.jobs:
        console.head("Executing: %s" % job, True)
        generator = Generator(config.split(job), console, variants, settings)



def resolve(console, config, jobs):
    console.info("Resolving jobs...")
    console.indent()

    for job in jobs:
        resolveEntry(console, config, job)

    console.outdent()



def resolveEntry(console, config, job):
    if not config.has_key(job):
        console.warn("No such job: %s" % job)
        sys.exit(1)

    data = config[job]

    if data.has_key("resolved"):
        return

    if data.has_key("extend"):
        includes = data["extend"]

        for entry in includes:
            resolveEntry(console, config, entry)
            mergeEntry(config[job], config[entry])

    data["resolved"] = True



def mergeEntry(target, source):
    for key in source:
        if not target.has_key(key):
            target[key] = source[key]







######################################################################
#  CORE: GENERATORS
######################################################################

class Generator:
    def __init__(self, config, console, variants, settings):
        self._config = config
        self._console = console
        self._variants = variants
        self._settings = settings

        self._cache = cachesupport.Cache(self._config.get("cache/path"), self._console)
        self._classes = classpath.getClasses(self._config.split("library"), self._console)
        self._treeutil = treesupport.TreeUtil(self._classes, self._cache, self._console)
        self._deputil = dependencysupport.DependencyUtil(self._classes, self._cache, self._console, self._treeutil, self._config.get("require", {}), self._config.get("use", {}))
        self._compiler = compilesupport.Compiler(self._classes, self._cache, self._console, self._treeutil)
        self._apiutil = apidata.ApiUtil(self._classes, self._cache, self._console, self._treeutil)
        self._partutil = partsupport.PartUtil(self._console, self._deputil, self._compiler)

        self.run()
        

    def getSettings(self):
        settings = {}
        settingsConfig = self._config.get("settings", {})
        settingsRuntime = self._settings

        for key in settingsConfig:
            settings[key] = settingsConfig[key]

        for key in settingsRuntime:
            settings[key] = settingsRuntime[key]

        return settings



    def getVariants(self):
        variants = {}
        variantsConfig = self._config.get("variants", {})
        variantsRuntime = self._variants

        for key in variantsConfig:
            variants[key] = variantsConfig[key]

        for key in variantsRuntime:
            variants[key] = [variantsRuntime[key]]

        return variants        



    def run(self):
        # Preprocess include/exclude lists
        # This is only the parsing of the config values
        # We only need to call this once on each job
        smartInclude, explicitInclude = self.getIncludes()
        smartExclude, explicitExclude = self.getExcludes()

        # Processing all combinations of variants
        variantData = self.getVariants()
        variantSets = variantsupport.computeCombinations(variantData)

        # Iterate through variant sets
        for variantSetNum, variants in enumerate(variantSets):
            if len(variantSets) > 1:
                self._console.head("Processing variant set %s/%s" % (variantSetNum+1, len(variantSets)))

                # Debug variant combination
                self._console.debug("Switched variants:")
                self._console.indent()
                for key in variants:
                    if len(variantData[key]) > 1:
                        self._console.debug("%s = %s" % (key, variants[key]))
                self._console.outdent()


            # Check for package configuration
            if self._config.get("packages"):
                # Reading configuration
                partsCfg = self._config.get("packages/parts", [])
                collapseCfg = self._config.get("packages/collapse", [])
                sizeCfg = self._config.get("packages/size", 0)
                bootPart = self._config.get("packages/init", "boot")

                # Automatically add boot part to collapse list
                if bootPart in partsCfg:
                    if not bootPart in collapseCfg:
                        collapseCfg.append(bootPart)

                # Expanding expressions
                self._console.debug("Expanding include expressions...")
                partIncludes = {}
                for partId in partsCfg:
                    partIncludes[partId] = self._expandRegExps(partsCfg[partId])

                # Computing packages
                partToPackages, packageContent = self._partutil.getPackages(partIncludes, smartExclude, explicitExclude, collapseCfg, variants, sizeCfg)

            else:
                # Resolving dependencies
                self._console.info("Resolving dependencies...")
                self._console.indent()
                classList = self._deputil.getClassList(smartInclude, smartExclude, explicitInclude, explicitExclude, variants)
                self._console.outdent()

                # Cleanup Task
                self.runClean(classList)

                # API Data Task
                self.runApiData(classList)

                # Emulate configuration
                bootPart = "boot"

                # Emulate one package
                partToPackages = { "boot" : [0] }
                packageContent = [classList]


            # Source Task
            self.runSource(partToPackages, packageContent, bootPart, variants)

            # Compiled Task
            self.runCompiled(partToPackages, packageContent, bootPart, variants)

            # Dependeny Debug Task
            self.runDependencyDebug(partToPackages, packageContent, variants)



    def runClean(self, classList):
        cleanCfg = self._config.get("clean")

        if not cleanCfg:
            return

        self._console.info("Cleaning up cache")
        self._console.indent()
        for cleanJob in cleanCfg:
            self._console.info("Job: %s" % cleanJob)

        self._console.outdent()

        self._console.info("Removing cache files:", False)
        self._console.indent()

        for entryPos, entry in enumerate(classes):
            self._console.progress(entryPos, len(classes))
            self._console.debug("Cleaning up: %s" % entry)

            if "tokens" in cleanCache:
                treeutil.cleanTokens(entry)

            if "tree" in cleanCache:
                treeutil.cleanTree(entry)

            if "variants-tree" in cleanCache:
                treeutil.cleanVariantsTree(entry, variants)

            if "compiled" in cleanCache:
                compiler.cleanCompiled(entry, variants, buildProcess)

        self._console.outdent()
        return



    def runApiData(self, classList):
        apiPath = self._config.get("api/path")

        if not apiPath:
            return

        self._apiutil.storeApi(classList, apiPath)



    def runDependencyDebug(self, partToPackages, packageContents, variants):
         if not self._config.get("debug/dependencies", False):
            return

         self._console.info("Dependency debugging...")
         self._console.indent()

         for packageId, packageContent in enumerate(packageContents):
             self._console.info("Package %s" % packageId)
             self._console.indent()

             for partId in partToPackages:
                 if packageId in partToPackages[partId]:
                     self._console.info("Part %s" % partId)

             for classId in packageContent:
                 self._console.debug("Class: %s" % classId)
                 self._console.indent()

                 for otherClassId in packageContent:
                     otherClassDeps = self._deputil.getDeps(otherClassId, variants)

                     if classId in otherClassDeps["load"]:
                         self._console.debug("Used by: %s (load)" % otherClassId)

                     if classId in otherClassDeps["run"]:
                         self._console.debug("Used by: %s (run)" % otherClassId)

                 self._console.outdent()
             self._console.outdent()

         self._console.outdent()



    def runCompiled(self, partToPackages, packageContents, bootPart, variants):
        if not self._config.get("compile/file"):
            return

        # Read in base file name
        filePath = self._config.get("compile/file")

        # Read in relative file name
        fileUri = self._config.get("compile/uri", filePath)

        # Read in compiler options
        optimize = self._config.get("compile/optimize", [])

        # Whether the code should be formatted
        format = self._config.get("compile/format", False)

        # Read in settings
        settings = self.getSettings()


        # Generating boot script
        self._console.info("Generating boot script...")

        bootBlocks = []
        bootBlocks.append(self.generateSettingsCode(settings, format))
        bootBlocks.append(self.generateVariantsCode(variants, format))
        bootBlocks.append(self.generateCompiledPackageCode(fileUri, partToPackages, packageContents, bootPart, variants, settings, format))

        if format:
            bootContent = "\n\n".join(bootBlocks)
        else:
            bootContent = scriptsupport.optimizeJavaScript("".join(bootBlocks))

        # Resolve file name variables
        resolvedFilePath = self._resolveFileName(filePath, variants, settings)

        # Save result file
        filetool.save(resolvedFilePath, bootContent)

        if self._config.get("compile/gzip"):
            filetool.gzip(resolvedFilePath, bootContent)

        self._console.debug("Done: %s" % self._getContentSize(bootContent))
        self._console.debug("")


        # Generating packages
        self._console.info("Generating packages...")
        self._console.indent()

        for packageId, packageContent in enumerate(packageContents):
            self._console.info("Compiling classes of package #%s:" % packageId, False)
            self._console.indent()

            # Compile file content
            compiledContent = self._compiler.compileClasses(packageContent, variants, optimize, format)

            # Construct file name
            resolvedFilePath = self._resolveFileName(filePath, variants, settings, packageId)

            # Save result file
            filetool.save(resolvedFilePath, compiledContent)

            if self._config.get("compile/gzip"):
                filetool.gzip(resolvedFilePath, compiledContent)

            self._console.debug("Done: %s" % self._getContentSize(compiledContent))
            self._console.outdent()

        self._console.outdent()




    def runSource(self, partToPackages, packageContents, bootPart, variants):
        if not self._config.get("source/file"):
            return

        self._console.info("Generate source version...")

        # Read in base file name
        filePath = self._config.get("source/file")

        # Whether the code should be formatted
        format = self._config.get("source/format", False)

        # Read in settings
        settings = self.getSettings()

        # Add data from settings, variants and packages
        sourceBlocks = []
        sourceBlocks.append(self.generateSettingsCode(settings, format))
        sourceBlocks.append(self.generateVariantsCode(variants, format))
        sourceBlocks.append(self.generateSourcePackageCode(partToPackages, packageContents, bootPart, format))

        if format:
            sourceContent = "\n\n".join(sourceBlocks)
        else:
            sourceContent = scriptsupport.optimizeJavaScript("".join(sourceBlocks))

        # Construct file name
        resolvedFilePath = self._resolveFileName(filePath, variants, settings)

        # Save result file
        filetool.save(resolvedFilePath, sourceContent)

        if self._config.get("source/gzip"):
            filetool.gzip(resolvedFilePath, sourceContent)

        self._console.debug("Done: %s" % self._getContentSize(sourceContent))
        self._console.outdent()





    ######################################################################
    #  SETTINGS/VARIANTS/PACKAGE DATA
    ######################################################################

    def generateSettingsCode(self, settings, format=False):
        number = re.compile("^([0-9\-]+)$")
        result = 'if(!window.qxsettings)qxsettings={};'

        for key in settings:
            if format:
                result += "\n"

            value = settings[key]

            if not (value == "false" or value == "true" or value == "null" or number.match(value)):
                value = '"%s"' % value.replace("\"", "\\\"")

            result += 'qxsettings["%s"]=%s;' % (key, value)

        return result



    def generateVariantsCode(self, variants, format=False):
        number = re.compile("^([0-9\-]+)$")
        result = 'if(!window.qxvariants)qxvariants={};'

        for key in variants:
            if format:
                result += "\n"

            value = variants[key]

            if not (value == "false" or value == "true" or value == "null" or number.match(value)):
                value = '"%s"' % value.replace("\"", "\\\"")

            result += 'qxvariants["%s"]=%s;' % (key, value)

        return result



    def generateSourcePackageCode(self, partToPackages, packageContents, bootPart, format=False):
        if not partToPackages:
            return ""

        # Translate part information to JavaScript
        partData = "{"
        for partId in partToPackages:
            partData += '"%s":' % (partId)
            partData += ('%s,' % partToPackages[partId]).replace(" ", "")

        partData=partData[:-1] + "}"

        # Translate URI data to JavaScript
        allUris = []
        for packageId, packageContent in enumerate(packageContents):
            packageUris = []
            for fileId in packageContent:
                packageUris.append('"%s"' % self._classes[fileId]["uri"])

            allUris.append("[" + ",".join(packageUris) + "]")

        uriData = "[" + ",\n".join(allUris) + "]"

        # Locate and load loader basic script
        loaderFile = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "loader.js")
        result = filetool.read(loaderFile)

        # Replace template with computed data
        result = result.replace("%PARTS%", partData)
        result = result.replace("%URIS%", uriData)
        result = result.replace("%BOOT%", '"%s"' % bootPart)

        return result



    def generateCompiledPackageCode(self, fileName, partToPackages, packageContents, bootPart, variants, settings, format=False):
        if not partToPackages:
            return ""

        # Translate part information to JavaScript
        partData = "{"
        for partId in partToPackages:
            partData += '"%s":' % (partId)
            partData += ('%s,' % partToPackages[partId]).replace(" ", "")

        partData=partData[:-1] + "}"

        # Translate URI data to JavaScript
        allUris = []
        for packageId, packageContent in enumerate(packageContents):
            packageFileName = self._resolveFileName(fileName, variants, settings, packageId)
            allUris.append('["' + packageFileName + '"]')

        uriData = "[" + ",\n".join(allUris) + "]"

        # Locate and load loader basic script
        loaderFile = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "loader.js")
        result = filetool.read(loaderFile)

        # Replace template with computed data
        result = result.replace("%PARTS%", partData)
        result = result.replace("%URIS%", uriData)
        result = result.replace("%BOOT%", '"%s"' % bootPart)

        return result







    ######################################################################
    #  DEPENDENCIES
    ######################################################################

    def getIncludes(self):
        includeCfg = self._config.get("include", [])
        packagesCfg = self._config.get("packages")

        # Splitting lists
        self._console.debug("Preparing include configuration...")
        smartInclude, explicitInclude = self._splitIncludeExcludeList(includeCfg)

        # Configuration feedback
        self._console.indent()
        self._console.debug("Including %s items smart, %s items explicit" % (len(smartInclude), len(explicitInclude)))

        if len(explicitInclude) > 0:
            self._console.warn("Explicit included classes may not work")

        self._console.outdent()

        # Resolve regexps
        self._console.indent()
        self._console.debug("Expanding expressions...")
        smartInclude = self._expandRegExps(smartInclude)
        explicitInclude = self._expandRegExps(explicitInclude)
        self._console.outdent()

        return smartInclude, explicitInclude



    def getExcludes(self):
        excludeCfg = self._config.get("exclude", [])

        # Splitting lists
        self._console.debug("Preparing exclude configuration...")
        smartExclude, explicitExclude = self._splitIncludeExcludeList(excludeCfg)

        # Configuration feedback
        self._console.indent()
        self._console.debug("Excluding %s items smart, %s items explicit" % (len(smartExclude), len(explicitExclude)))

        if len(excludeCfg) > 0:
            self._console.warn("Excludes may break code!")

        self._console.outdent()

        # Resolve regexps
        self._console.indent()
        self._console.debug("Expanding expressions...")
        smartExclude = self._expandRegExps(smartExclude)
        explicitExclude = self._expandRegExps(explicitExclude)
        self._console.outdent()

        return smartExclude, explicitExclude



    def _splitIncludeExcludeList(self, data):
        intelli = []
        explicit = []

        for entry in data:
            if entry[0] == "=":
                explicit.append(entry[1:])
            else:
                intelli.append(entry)

        return intelli, explicit



    def _expandRegExps(self, entries):
        result = []

        for entry in entries:
            # Fast path: Try if a matching class could directly be found
            if entry in self._classes:
                result.append(entry)

            else:
                regexp = textutil.toRegExp(entry)
                expanded = []

                for classId in self._classes:
                    if regexp.search(classId):
                        if not classId in expanded:
                            expanded.append(classId)

                if len(expanded) == 0:
                    self._console.error("Expression gives no results. Maybe malformed expression?: %s" % entry)
                    sys.exit(1)

                result.extend(expanded)

        return result






    ######################################################################
    #  UTIL
    ######################################################################

    def _getContentSize(self, content):
        # Convert to utf-8 first
        uni = unicode(content).encode("utf-8")

        # Calculate sizes
        origSize = len(uni) / 1024
        compressedSize = len(zlib.compress(uni, 9)) / 1024

        return "%sKB / %sKB" % (origSize, compressedSize)



    def _resolveFileName(self, fileName, variants=None, settings=None, packageId=""):
        if variants:
            for key in variants:
                pattern = "{%s}" % key
                fileName = fileName.replace(pattern, variants[key])

        if settings:
            for key in settings:
                pattern = "{%s}" % key
                fileName = fileName.replace(pattern, settings[key])

        if packageId != "":
            fileName = fileName.replace(".js", "-%s.js" % packageId)

        return fileName







######################################################################
#  MAIN LOOP
######################################################################

if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)

