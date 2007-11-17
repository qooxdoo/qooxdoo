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

# reconfigure path to import own modules from modules subfolder
# only needed for simplejson...
script_path = os.path.dirname(os.path.abspath(sys.argv[0]))
sys.path.insert(0, os.path.join(script_path, "modules"))

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
from generator2 import javascript




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

    if len(sys.argv[1:]) == 0:
        basename = os.path.basename(sys.argv[0])
        print "usage: %s [options]" % basename
        print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
        sys.exit(1)

    (options, args) = parser.parse_args(sys.argv[1:])

    process(options)


def process(options):
    if options.verbose:
        console = logsupport.Log(logfile=options.logfile, level=10)
    elif options.quiet:
        console = logsupport.Log(logfile=options.logfile, level=30)
    else:
        console = logsupport.Log(logfile=options.logfile, level=20)

    console.head("Initialization", True)
    console.info("Processing...")
    console.indent()
    console.debug("Configuration: %s" % options.config)
    console.debug("Jobs: %s" % ", ".join(options.jobs))
    console.outdent()

    config = simplejson.loads(filetool.read(options.config))
    resolve(console, config, options.jobs)

    for job in options.jobs:
        console.head("Executing: %s" % job, True)
        generator = Generator(config[job], console)
        generator.run()


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

class Generator():
    def __init__(self, config, console):
        self._config = config
        self._console = console

        self._cache = cachesupport.Cache(self.getConfig("cache/path"), self._console)
        self._classes = classpath.getClasses(self.getConfig("library"), self._console)
        self._treeutil = treesupport.TreeUtil(self._classes, self._cache, self._console)
        self._deputil = dependencysupport.DependencyUtil(self._classes, self._cache, self._console, self._treeutil, self.getConfig("require", {}), self.getConfig("use", {}))
        self._compiler = compilesupport.Compiler(self._classes, self._cache, self._console, self._treeutil)
        self._apiutil = apidata.ApiUtil(self._classes, self._cache, self._console, self._treeutil)
        self._partutil = partsupport.PartUtil(self._classes, self._console, self._deputil, self._treeutil)



    def run(self):
        # Preprocess include/exclude lists
        # This is only the parsing of the config values
        # We only need to call this once on each job
        smartInclude, explicitInclude = self.getIncludes()
        smartExclude, explicitExclude = self.getExcludes()

        # Read settings
        settings = self.getConfig("settings", {})

        # Processing all combinations of variants
        variantSets = variantsupport.computeCombinations(self.getConfig("variants", {}))
        for variantSetPos, variants in enumerate(variantSets):
            if len(variantSets) > 1:
                self._console.head("PROCESSING VARIANT SET %s/%s" % (variantSetPos+1, len(variantSets)))


            # Debug variant combination
            if len(variants) > 0:
                self._console.debug("Selected variants:")
                self._console.indent()
                for key in variants:
                    self._console.debug("%s = %s" % (key, variants[key]))
                self._console.outdent()


            # Cleanup Job
            self.cleanJob()


            # Detect dependencies
            self._console.info("Resolving application dependencies...")
            self._console.indent()
            classList = self._deputil.getClassList(smartInclude, smartExclude, explicitInclude, explicitExclude, variants)
            self._console.outdent()



            packageCfg = self.getConfig("packages")

            # Use include/exclude
            if not packageCfg:
                sortedClassList = self._deputil.sortClasses(classList, variants)
                
                self.apiJob(sortedClassList)
                self.sourceJob(sortedClassList, variants, settings, variantSetPos)
                self.compileJob(sortedClassList, variants, settings, variantSetPos)


            # Enable package support
            else:
                # Reading configuration
                partsCfg = self.getConfig("packages/parts", [])
                collapseCfg = self.getConfig("packages/collapse", [])
                latencyCfg = self.getConfig("packages/optimize", 0)

                # Resolving regexps
                self._console.debug("Resolving part regexps...")
                partIncludes = {}
                for partId in partsCfg:
                    partIncludes[partId] = self._resolveComplexDefs(partsCfg[partId])

                # Computing packages
                pkgLists, partPkgs = self._partutil.getPackages(partIncludes, classList, variants, collapseCfg, latencyCfg)

                # Generating packages
                for pkgId, partList in enumerate(pkgLists):
                    self._console.info("Creating package #%s (%s classes)" % (pkgId, len(partList)))
                    self._console.indent()

                    self.sourceJob(partList, variants, settings, variantSetPos, pkgId, partPkgs)
                    self.compileJob(partList, variants, settings, variantSetPos, pkgId, partPkgs)

                    self._console.outdent()




    def cleanJob(self):
        cleanCfg = self.getConfig("clean")

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




    def apiJob(self, include):
        apiPath = self.getConfig("api/path")

        if not apiPath:
            return

        self._apiutil.storeApi(include, apiPath)




    def compileJob(self, include, variants, settings, variantId="", packageId="", partPkgs=None):
        if not self.getConfig("compile/file"):
            return

        self._console.info("Compiling classes:", False)
        self._console.indent()

        # Read in compiler options
        optimize = self.getConfig("compile/optimize", [])

        # Read in base file name
        baseFileName = self.getConfig("compile/file")

        # Whether the code should be formatted
        formatCode = self.getConfig("compile/format", False)

        # Compile file content
        compiledContent = self._compiler.compileClasses(include, variants, optimize, formatCode)

        # Add data from packages, settings, variants
        if "qx.lang.Core" in include:
            packageCode = self.generatePackageCode(partPkgs, variantId, formatCode)
            compiledContent = packageCode + compiledContent

        if "qx.core.Variant" in include:
            variantsCode = self.generateVariantsCode(variants, formatCode)
            compiledContent = variantsCode + compiledContent

        if "qx.core.Setting" in include:
            settingsCode = self.generateSettingsCode(settings, formatCode)
            compiledContent = settingsCode + compiledContent

        # Construct file name
        fileName = self.getFileName(baseFileName, variantId, packageId)

        # Save result file
        filetool.save(fileName, compiledContent)
        
        if self.getConfig("compile/gzip"):
            filetool.gzip(fileName, compiledContent)
        
        self._console.debug("Done: %s" % self.getContentSize(compiledContent))
        self._console.outdent()




    def sourceJob(self, include, variants, settings, variantId="", packageId="", partPkgs=None):
        if not self.getConfig("source/file"):
            return

        self._console.info("Generating source includer...")

        # Read in base file name
        baseFileName = self.getConfig("source/file")

        # Whether the code should be formatted
        formatCode = self.getConfig("source/format", False)

        # Prepare source list
        sourceList = []
        for fileId in include:
            sourceList.append(self._classes[fileId]["uri"])

        # Generate loader
        includeBlocks = []
        includeBlocks.append(self.wrapJavaScript(javascript.generateHttpIncluder(sourceList, formatCode)))
        
        # Add data from packages, settings, variants
        if "qx.lang.Core" in include:
            packageCode = self.generatePackageCode(partPkgs, variantId, formatCode)
            includeBlocks.insert(0, self.wrapJavaScript(packageCode))

        if "qx.core.Variant" in include:
            variantsCode = self.generateVariantsCode(variants, formatCode)
            includeBlocks.insert(0, self.wrapJavaScript(variantsCode))

        if "qx.core.Setting" in include:
            settingsCode = self.generateSettingsCode(settings, formatCode)
            includeBlocks.insert(0, self.wrapJavaScript(settingsCode))

        # Put into document.write
        if formatCode:
            divider = "\n"
        else:
            divider = ""

        loaderCode = "document.write('%s');" % divider.join(includeBlocks).replace("'", "\\'").replace("\n", "\\\n")

        # Construct file name
        fileName = self.getFileName(baseFileName, variantId, packageId)

        # Save result file
        filetool.save(fileName, loaderCode)
        
        if self.getConfig("source/gzip"):
            filetool.gzip(fileName, loaderCode)
        
        self._console.debug("Done: %s" % self.getContentSize(loaderCode))
        self._console.outdent()




        
        
        
        


    def getConfig(self, key, default=None):
        data = self._config
        splits = key.split("/")

        for item in splits:
            if data.has_key(item):
                data = data[item]
            else:
                return self._normalizeConfig(default)

        return self._normalizeConfig(data)



    def _normalizeConfig(self, value):
        if hasattr(value, "lower"):
            if value.lower() in [ "1", "on", "true", "yes", "enabled" ]:
                return True

            if value.lower() in [ "0", "off", "false", "no", "disabled" ]:
                return False

        return value



    def getIncludes(self):
        #
        # PREPROCESS PHASE: INCLUDE/EXCLUDE
        #

        includeCfg = self.getConfig("include", [])
        packagesCfg = self.getConfig("packages")

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
        self._console.debug("Resolving regexps...")
        smartInclude = self._resolveComplexDefs(smartInclude)
        explicitInclude = self._resolveComplexDefs(explicitInclude)
        self._console.outdent()

        return smartInclude, explicitInclude




    def getExcludes(self):
        #
        # PREPROCESS PHASE: INCLUDE/EXCLUDE
        #

        excludeCfg = self.getConfig("exclude", [])

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
        self._console.debug("Resolving regexps...")
        smartExclude = self._resolveComplexDefs(smartExclude)
        explicitExclude = self._resolveComplexDefs(explicitExclude)
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



    def _resolveComplexDefs(self, entries):
        classes = self._classes

        content = []

        for entry in entries:
            regexp = textutil.toRegExp(entry)

            for className in classes:
                if regexp.search(className):
                    if not className in content:
                        content.append(className)

        return content






    ######################################################################
    #  SETTINGS/VARIANTS/PACKAGE DATA
    ######################################################################

    def wrapJavaScript(self, code):
        if code.endswith("\n"):
            code = code[:-1]
        
        return '<script type="text/javascript">%s</script>' % code


    def generateSettingsCode(self, settings, format=False):
        number = re.compile("^([0-9\-]+)$")
        result = 'if(!window.qxsettings)qxsettings={};'

        for key in settings:
            if format:
                result += "\n"

            value = settings[key]

            if not (value == "false" or value == "true" or value == "null" or number.match(value)):
                value = '"%s"' % value.replace("\"", "\\\"")

            result += 'if(qxsettings["%s"]==undefined)qxsettings["%s"]=%s;' % (key, key, value)

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


    def generatePackageCode(self, partPkgs, variantId, format=False):
        if not partPkgs:
            return ""

        result = 'if(!window.qxpackages)qxpackages={};'

        # open map
        partData = "{"
        for partId in partPkgs:
            partData += '"%s":' % (partId, )
            partData += ('%s,' % partPkgs[partId][1:]).replace(" ", "")

        # remove last comma
        partData=partData[:-1]

        # close map
        partData += "}"

        result += 'qxpackages.parts=%s;' % partData
        result += 'qxpackages.variant=%s;' % variantId

        if format:
            result += "\n"

        return result




    ######################################################################
    #  UTIL
    ######################################################################

    def getContentSize(self, content):
        # Convert to utf-8 first
        uni = unicode(content).encode("utf-8")

        # Calculate sizes
        origSize = len(uni) / 1024
        compressedSize = len(zlib.compress(uni, 9)) / 1024

        return "%sKB / %sKB" % (origSize, compressedSize)



    def getFileName(self, fileName, variantId="", packageId=""):
        fileName = fileName.replace("$variant", str(variantId))
        fileName = fileName.replace("$package", str(packageId))

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

