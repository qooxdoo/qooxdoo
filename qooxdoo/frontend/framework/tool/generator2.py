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
Currently includes features of the old modules "generator" and "loader"

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

* There are some utility method which

* The following global variables exist:
  * classes{Dict}: All classes of the present class path configuration. Each entry
      contains information regarding the path, the encoding, the class path and stuff
  * modules{Dict}: All known modules from all available classes. Each entry contains
      the classes of the current module
  * verbose{Boolean}: If verbose mode is enabled
  * quiet{Boolean}: If quiet mode is enabled
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
    global console

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
    resolve(config, options.jobs)

    for job in options.jobs:
        execute(job, config[job])



def resolve(config, jobs):
    console.info("Resolving jobs...")
    console.indent()

    for job in jobs:
        resolveEntry(config, job)

    console.outdent()


def resolveEntry(config, job):
    if not config.has_key(job):
        console.warn("No such job: %s" % job)
        sys.exit(1)

    data = config[job]

    if data.has_key("resolved"):
        return

    if data.has_key("extend"):
        includes = data["extend"]

        for entry in includes:
            resolveEntry(config, entry)
            mergeEntry(config[job], config[entry])

    data["resolved"] = True


def mergeEntry(target, source):
    for key in source:
        if not target.has_key(key):
            target[key] = source[key]







######################################################################
#  CORE: GENERATORS
######################################################################

def getJobConfig(key, default=None):
    global jobconfig
    return _getJobConfig(key, jobconfig, default)


def _getJobConfig(key, configpart, default):
    sepindex = key.find(".")

    # simple key
    if sepindex == -1:
        if configpart.has_key(key):
            return configpart[key]
        else:
            return default

    # complex key
    else:
        firstpart = key[0:sepindex]
        if configpart.has_key(firstpart):  # check first part
            return _getJobConfig(key[sepindex+1:], configpart[firstpart],default)
        else:
            return default


def execute(job, config):
    global classes
    global deputil
    global modules
    global cache
    global compiler
    global jobconfig
    global treeutil
    global apiutil
    global partutil

    jobconfig = config

    console.head("Executing: %s" % job, True)




    #
    # INITIALIZATION PHASE
    #

    # Script names
    buildCfg = getJobConfig("build")
    sourceCfg = getJobConfig("source")
    apiCfg = getJobConfig("api")
    cleanCfg = getJobConfig("clean")

    # Part support (has priority)
    userParts = getJobConfig("parts", {})
    collapseParts = getJobConfig("collapseParts", [])
    optimizeLatency = getJobConfig("optimizeLatency")

    userInclude = getJobConfig("include", [])
    userExclude = getJobConfig("exclude", [])




    if len(userParts) > 0:
        execMode = "parts"
    else:
        execMode = "normal"




    #
    # INIT PHASE
    #

    cache = cachesupport.Cache(getJobConfig("cache")["path"], console)
    classes = classpath.getClasses(getJobConfig("class"), console)
    treeutil = treesupport.TreeUtil(classes, cache, console)
    deputil = dependencysupport.DependencyUtil(classes, cache, console, treeutil, getJobConfig("require", {}), getJobConfig("use", {}))
    modules = deputil.getModules()
    compiler = compilesupport.Compiler(classes, cache, console, treeutil)
    apiutil = apidata.ApiUtil(classes, cache, console, treeutil)
    partutil = partsupport.PartUtil(classes, console, deputil, treeutil)





    #
    # PREPROCESS PHASE: INCLUDE/EXCLUDE
    #

    # Auto include all when nothing defined
    if execMode == "normal" and len(userInclude) == 0:
        console.info("Automatically including all available classes")
        userInclude.append("*")



    console.info("Preparing include/exclude configuration...")
    smartInclude, explicitInclude = _splitIncludeExcludeList(userInclude)
    smartExclude, explicitExclude = _splitIncludeExcludeList(userExclude)


    # Configuration feedback
    console.indent()
    console.debug("Including %s items smart, %s items explicit" % (len(smartInclude), len(explicitInclude)))
    console.debug("Excluding %s items smart, %s items explicit" % (len(smartExclude), len(explicitExclude)))

    if len(userExclude) > 0:
        console.warn("Excludes may break code!")

    if len(explicitInclude) > 0:
        console.warn("Explicit included classes may not work")

    console.outdent()






    # Resolve modules/regexps
    console.indent()
    console.debug("Resolving modules/regexps...")
    smartInclude = resolveComplexDefs(smartInclude)
    explicitInclude = resolveComplexDefs(explicitInclude)
    smartExclude = resolveComplexDefs(smartExclude)
    explicitExclude = resolveComplexDefs(explicitExclude)
    console.outdent()





    #
    # PREPROCESS PHASE: PARTS
    #

    if execMode == "parts":
        console.info("Preparing part configuration...")
        console.indent()

        # Build bitmask ids for parts
        console.debug("Assigning bits to parts...")

        # References partId -> bitId of that part
        console.indent()
        partBits = {}
        partPos = 0
        for partId in userParts:
            partBit = 1<<partPos

            console.debug("Part #%s => %s" % (partId, partBit))

            partBits[partId] = partBit
            partPos += 1

        console.outdent()

        # Resolving modules/regexps
        console.debug("Resolving part modules/regexps...")
        partClasses = {}
        for partId in userParts:
            partClasses[partId] = resolveComplexDefs(userParts[partId])

        console.outdent()




    #
    # EXECUTION PHASE
    #

    variantSets = variantsupport.computeCombinations(getJobConfig("variants", {}))

    for variantSetPos, variants in enumerate(variantSets):
        if len(variantSets) > 1:
            console.head("PROCESSING VARIANT SET %s/%s" % (variantSetPos+1, len(variantSets)))


        # Debug variant combination
        if len(variants) > 0:
            console.debug("Selected variants:")
            console.indent()
            for key in variants:
                console.debug("%s = %s" % (key, variants[key]))
            console.outdent()


        # Cleanup cache
        if cleanCfg != None:
            console.info("Cleaning up cache")
            console.indent()
            for cleanJob in cleanCfg:
                console.info("Job: %s" % cleanJob)

            console.outdent()

            console.info("Removing cache files:", False)
            console.indent()

            for entryPos, entry in enumerate(classes):
                console.progress(entryPos, len(classes))
                console.debug("Cleaning up: %s" % entry)

                if "tokens" in cleanCache:
                    treeutil.cleanTokens(entry)

                if "tree" in cleanCache:
                    treeutil.cleanTree(entry)

                if "variants-tree" in cleanCache:
                    treeutil.cleanVariantsTree(entry, variants)

                if "compiled" in cleanCache:
                    compiler.cleanCompiled(entry, variants, buildProcess)


            console.outdent()
            return


        # Detect dependencies
        console.info("Resolving application dependencies...")
        console.indent()
        includeDict = deputil.resolveDependencies(smartInclude, smartExclude, variants)
        console.outdent()


        # Explicit include/exclude
        if len(explicitInclude) > 0 or len(explicitExclude) > 0:
            console.info("Processing explicitely configured includes/excludes...")
            for entry in explicitInclude:
                includeDict[entry] = True

            for entry in explicitExclude:
                if includeDict.has_key(entry):
                    del includeDict[entry]


        # Debug optional classes
        optionals = deputil.getOptionals(includeDict)
        if len(optionals) > 0:
            console.debug("These optional classes may be useful:")
            console.indent()
            for entry in optionals:
                console.debug("%s" % entry)
            console.outdent()





        # Generate API data
        if apiCfg != None:
            apiutil.storeApi(includeDict, apiCfg["path"])






        # Generate application script files
        if buildCfg != None or sourceCfg != None:
            if execMode == "parts":
                (pkgIds, pkg2classes, part2pkgs) = partutil.getPackages(partClasses, partBits, includeDict, variants, collapseParts, optimizeLatency)

            else:
                # simulate package
                pkgIds = ["1"]
                pkg2classes = {
                    "1" : includeDict.keys()
                }


            settings = getJobConfig("settings", {})


            if buildCfg != None:
                addVariants = True
                addSettings = True
                
                if buildCfg.has_key("process"):
                    buildProcess = buildCfg["process"]
                else:
                    buildProcess = []  
                    
                if buildCfg.has_key("format"):
                    buildFormat = buildCfg["format"]
                else:
                    buildFormat = False
                
                for packageId in pkgIds:
                    console.info("Compiling classes for package #%s:" % packageId, False)
                    console.indent()

                    # Compile file content
                    compiledContent = getCompiledPackage(pkg2classes[packageId], variants, buildProcess)

                    # Add settings and variants
                    if addVariants:
                        variantsCode = generateVariantsCode(variants)
                        compiledContent = variantsCode + compiledContent
                        addVariants = False

                    if addSettings:
                        settingsCode = generateSettingsCode(settings)
                        compiledContent = settingsCode + compiledContent
                        addSettings = False

                    # Construct file name
                    fileName = buildCfg["file"]
                    fileName = fileName.replace("$variant", str(variantSetPos))
                    fileName = fileName.replace("$package", str(packageId))

                    # Save result file
                    filetool.save(fileName, compiledContent)

                    console.debug("Done: %s" % getContentSize(compiledContent))
                    console.outdent()


            if sourceCfg != None:
                addVariants = True
                addSettings = True
                
                if sourceCfg.has_key("format"):
                    sourceFormat = sourceCfg["format"]
                else:
                    sourceFormat = True

                for packageId in pkgIds:
                    console.info("Generating source includer for package #%s" % packageId)
                    
                    # Generate loader
                    includeBlocks = getSourceIncludeList(pkg2classes[packageId], variants)
                    
                    # Add settings and variants
                    if addVariants:
                        variantsCode = generateVariantsCode(variants, sourceFormat)
                        includeBlocks.insert(0, wrapJavaScript(variantsCode))
                        addVariants = False

                    if addSettings:
                        settingsCode = generateSettingsCode(settings, sourceFormat)
                        includeBlocks.insert(0, wrapJavaScript(settingsCode))
                        addSettings = False
                        
                    # Put into document.write
                    loaderCode = "document.write('%s');" % "\n".join(includeBlocks).replace("'", "\\'")

                    # Construct file name
                    fileName = sourceCfg["file"]
                    fileName = fileName.replace("$variant", str(variantSetPos))
                    fileName = fileName.replace("$package", str(packageId))
                    
                    # Save result file
                    filetool.save(fileName, loaderCode)


    
def wrapJavaScript(code):
    return '<script type="text/javascript">%s</script>' % code


def getSourceIncludeList(include, variants):
    scriptBlocks = []
    sortedInclude = deputil.sortClasses(include, variants)

    for fileId in sortedInclude:
        fileUri = classes[fileId]["uri"]
        scriptBlocks.append('<script type="text/javascript" src="%s"></script>' % fileUri)

    return scriptBlocks








def generateSettingsCode(settings, format=True):
    number = re.compile("^([0-9\-]+)$")
    result = 'if(!window.qxsettings)qxsettings={};'

    if format:
        result += "\n"

    for key in settings:
        value = settings[key]

        if not (value == "false" or value == "true" or value == "null" or number.match(value)):
            value = '"%s"' % value.replace("\"", "\\\"")

        result += 'if(qxsettings["%s"]==undefined)qxsettings["%s"]=%s;' % (key, key, value)

        if format:
            result += "\n"

    return result


def generateVariantsCode(variants, format=True):
    number = re.compile("^([0-9\-]+)$")
    result = 'if(!window.qxvariants)qxvariants={};'

    if format:
        result += "\n"

    for key in variants:
        value = variants[key]

        if not (value == "false" or value == "true" or value == "null" or number.match(value)):
            value = '"%s"' % value.replace("\"", "\\\"")

        result += 'qxvariants["%s"]=%s;' % (key, value)

        if format:
            result += "\n"

    return result






######################################################################
#  COMMON COMPILED PKG SUPPORT
######################################################################

def getCompiledPackage(includeDict, variants, buildProcess):

    # Compiling classes
    sortedClasses = deputil.sortClasses(includeDict, variants)
    compiledContent = compiler.compileClasses(sortedClasses, variants, buildProcess)

    return compiledContent



def getContentSize(content):
    # Convert to utf-8 first
    uni = unicode(content).encode("utf-8")

    # Calculate sizes
    origSize = len(uni) / 1024
    compressedSize = len(zlib.compress(uni, 9)) / 1024

    return "%sKB / %sKB" % (origSize, compressedSize)



def _splitIncludeExcludeList(input):
    intelli = []
    explicit = []

    for entry in input:
        if entry[0] == "=":
            explicit.append(entry[1:])
        else:
            intelli.append(entry)

    return intelli, explicit



def resolveComplexDefs(entries):
    global modules
    global classes

    content = []

    for entry in entries:
        if entry in modules:
            content.extend(modules[entry])
        else:
            regexp = textutil.toRegExp(entry)

            for className in classes:
                if regexp.search(className):
                    if not className in content:
                        # print "Resolved: %s with %s" % (entry, className)
                        content.append(className)

    return content






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

