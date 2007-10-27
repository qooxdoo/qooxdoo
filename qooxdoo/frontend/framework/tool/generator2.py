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
* The number of packages could be exponential to the number of views
but through the optimization this is often not the case
* You can automatically collapse the important views. Such an important
view may be the initial application class (application layout frame) or
the splashscreen. Collapsing reduces the number of packages for the
defined views. However collapsing badly influences the fine-grained nature
of the package system and should be ommitted for non-initial views normally.
* Further optimization includes support for auto-merging small packages.
The relevant size to decide if a package is too small is the token size which
is defined by the author of the job. The system calculates the token size of
each package and tries to merge packages automatically.

Internals
======================
* All merges happen from right to left when the package list is sorted by priority.
The main theory is that a package which is used by multiple views must have the dependencies
solved by both of them. So the merge will always happen into the next common package of
both views from the current position to the left side.

* There are some utility method which

* The following global variables exist:
  * classes{Dict}: All classes of the present class path configuration. Each entry
      contains information regarding the path, the encoding, the class path and stuff
  * modules{Dict}: All known modules from all available classes. Each entry contains
      the classes of the current module
  * verbose{Boolean}: If verbose mode is enabled
  * quiet{Boolean}: If quiet mode is enabled

* All cache data is automatically stored into "cache2"". The path is automatically
  detected through the location of the generator script.
"""

import sys, re, os, optparse, math, cPickle, copy, sets, zlib

# reconfigure path to import own modules from modules subfolder
script_path = os.path.dirname(os.path.abspath(sys.argv[0]))
sys.path.insert(0, os.path.join(script_path, "modules"))
#sys.path.insert(0, os.path.join(script_path, "generator2"))

from modules import config
from modules import tokenizer
from modules import tree
from modules import treegenerator
from modules import treeutil
from modules import optparseext
from modules import filetool
from modules import compiler
from modules import textutil
from modules import mapper
from modules import variantoptimizer
from modules import variableoptimizer
from modules import stringoptimizer
from modules import basecalloptimizer
from modules import privateoptimizer
from modules import api
from modules import simplejson

from generator2 import cachesupport
from generator2 import apidata
from generator2 import treesupport
from generator2 import classpath
from generator2 import variantsupport
from generator2 import logsupport


######################################################################
#  MAIN CONTENT
######################################################################

def main():
    print "============================================================================"
    print "    INITIALIZATION"
    print "============================================================================"

    parser = optparse.OptionParser(option_class=optparseext.ExtendAction)

    parser.add_option("-c", "--config", dest="config", metavar="FILENAME", help="Configuration file")
    parser.add_option("-j", "--jobs", action="extend", dest="jobs", metavar="DIRECTORY", type="string", default=[], help="Selected jobs")
    parser.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="Quiet output mode (Extra quiet).")
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="Verbose output mode (Extra verbose).")

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
        console = logsupport.Log(10)
    elif options.quiet:
        console = logsupport.Log(30)
    else:
        console = logsupport.Log(20)
        
    console.info(">>> Processing...")
    console.debug("  - Configuration: %s" % options.config)
    console.debug("  - Jobs: %s" % ", ".join(options.jobs))

    config = simplejson.loads(filetool.read(options.config))
    resolve(config, options.jobs)

    for job in options.jobs:
        execute(job, config[job])


def resolve(config, jobs):
    console.info(">>> Resolving jobs...")
    for job in jobs:
        resolveEntry(config, job)


def resolveEntry(config, job):
    if not config.has_key(job):
        console.warn("  - No such job: %s" % job)
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


def execute(job, config):
    global jobconfig
    jobconfig = config

    console.info("")
    console.info("============================================================================")
    console.info("    EXECUTING: %s" % job)
    console.info("============================================================================")

    generateScript()






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


def generateScript():
    global classes
    global modules
    global cache


    #
    # INITIALIZATION PHASE
    #

    # Class paths
    classPaths = getJobConfig("classPath__")
    #classPaths = getJobConfig("path.class")

    # Script names
    buildScript = getJobConfig("buildScript")
    sourceScript = getJobConfig("sourceScript")
    apiPath = getJobConfig("apiPath")

    # Dynamic dependencies
    dynLoadDeps = getJobConfig("require", {})
    dynRunDeps = getJobConfig("use", {})

    # Variants data
    # TODO: Variants for source -> Not possible
    userVariants = getJobConfig("variants", {})

    # Part support (has priority)
    userParts = getJobConfig("parts", {})

    # Build relevant post processing
    buildProcess = getJobConfig("buildProcess", [])

    userInclude = getJobConfig("include", [])
    userExclude = getJobConfig("exclude", [])

    collapseParts = getJobConfig("collapseParts", [])
    optimizeLatency = getJobConfig("optimizeLatency")



    if len(userParts) > 0:
        execMode = "parts"
    else:
        execMode = "normal"


    #
    # INIT PHASE
    #

    cache = cachesupport.Cache(getJobConfig("cachePath"), console)
    
    


    #
    # SCAN PHASE
    #

    # Scan for classes and modules
    classes = classpath.getClasses(classPaths, console)
    scanModules()


    #
    # PREPROCESS PHASE: INCLUDE/EXCLUDE
    #

    # Auto include all when nothing defined
    if execMode == "normal" and len(userInclude) == 0:
        console.info(">>> Automatically including all available classes")
        userInclude.append("*")



    console.info(">>> Preparing include/exclude configuration...")
    smartInclude, explicitInclude = _splitIncludeExcludeList(userInclude)
    smartExclude, explicitExclude = _splitIncludeExcludeList(userExclude)


    # Configuration feedback
    console.debug("  - Including %s items smart, %s items explicit" % (len(smartInclude), len(explicitInclude)))
    console.debug("  - Excluding %s items smart, %s items explicit" % (len(smartExclude), len(explicitExclude)))

    if len(userExclude) > 0:
        console.warn("  - Warning: Excludes may break code!")

    if len(explicitInclude) > 0:
        console.warn("  - Warning: Explicit included classes may not work")






    # Resolve modules/regexps
    console.info("  - Resolving modules/regexps...")
    smartInclude = resolveComplexDefs(smartInclude)
    explicitInclude = resolveComplexDefs(explicitInclude)
    smartExclude = resolveComplexDefs(smartExclude)
    explicitExclude = resolveComplexDefs(explicitExclude)





    #
    # PREPROCESS PHASE: VIEWS
    #

    if execMode == "parts":
        console.info(">>> Preparing part configuration...")

        # Build bitmask ids for parts
        console.info("  - Assigning bits to parts...")

        # References partId -> bitId of that part
        partBits = {}

        partPos = 0
        for partId in userParts:
            partBit = 1<<partPos

            console.info("    - Part #%s => %s" % (partId, partBit))

            partBits[partId] = partBit
            partPos += 1

        # Resolving modules/regexps
        console.info("  - Resolving part modules/regexps...")
        partClasses = {}
        for partId in userParts:
            partClasses[partId] = resolveComplexDefs(userParts[partId])




    #
    # EXECUTION PHASE
    #

    sets = variantsupport.computeCombinations(userVariants)
    for pos, variants in enumerate(sets):
        console.info("")
        console.info("----------------------------------------------------------------------------")
        console.info("    PROCESSING VARIANT SET %s/%s" % (pos+1, len(sets)))
        console.info("----------------------------------------------------------------------------")
        
        if len(variants) > 0:
            for entry in variants:
                console.debug("  - %s = %s" % (entry["id"], entry["value"]))
            console.debug("----------------------------------------------------------------------------")

        # Detect dependencies
        console.info(">>> Resolving application dependencies...")
        includeDict = resolveDependencies(smartInclude, smartExclude, dynLoadDeps, dynRunDeps, variants)


        # Explicit include/exclude
        if len(explicitInclude) > 0 or len(explicitExclude) > 0:
            console.info(">>> Processing explicitely configured includes/excludes...")
            for entry in explicitInclude:
                includeDict[entry] = True

            for entry in explicitExclude:
                if includeDict.has_key(entry):
                    del includeDict[entry]


        # Detect optionals
        optionals = getOptionals(includeDict)
        if len(optionals) > 0:
            console.debug(">>> These optional classes may be useful:")
            for entry in optionals:
                console.debug("  - %s" % entry)


        if apiPath != None:
            apidata.storeApi(includeDict, apiPath, classes, cache, console)


        if buildScript != None:
            if execMode == "parts":
                processParts(partClasses, partBits, includeDict, dynLoadDeps, dynRunDeps, variants, collapseParts, optimizeLatency, buildScript, buildProcess)
            else:
                sys.stdout.write(">>> Compiling classes:")
                sys.stdout.flush()
                packageSize = storeCompiledPackage(includeDict, buildScript, dynLoadDeps, dynRunDeps, variants, buildProcess, pos+1)
                print "    - Done: %s" % packageSize

        if sourceScript != None:
            sys.stdout.write(">>> Generating script file...\n")
            sys.stdout.flush()
            sourceScript = storeSourceScript(includeDict, sourceScript, dynLoadDeps, dynRunDeps, variants, pos+1)



def storeSourceScript(includeDict, packageFileName, loadDeps, runDeps, variants, variantPos):
    global classes

    scriptBlocks = ""
    sortedClasses = sortClasses(includeDict, loadDeps, runDeps, variants)
    fileId = "%s-%s.js" % (packageFileName, variantPos)    
    
    for f in sortedClasses:
        cEntry = classes[f]
        uriprefix = ""
        
        for pElem in jobconfig['path']:
            if pElem['class'] == cEntry['classPath']:
                uriprefix = pElem['web']
                break
                
        if uriprefix == "":
            raise "Cannot find uriprefix for %s" % f
            
        uri = os.path.join(uriprefix, f.replace(".",os.sep)) + ".js"
        scriptBlocks += '<script type="text/javascript" src="%s"></script>' % uri
        scriptBlocks += "\n"

    sourceScript = "document.write('%s');" % scriptBlocks.replace("'", "\\'")

    filetool.save(fileId, sourceScript)
    return sourceScript




######################################################################
#  META DATA SUPPORT
######################################################################

def getMeta(id):
    global classes

    entry = classes[id]
    path = entry["path"]
    
    cacheId = "%s-meta" % id

    meta = cache.read(cacheId, path)
    if meta != None:
        return meta

    meta = {}
    category = entry["category"]

    if category == "qx.doc":
        pass

    elif category == "qx.locale":
        meta["loadtimeDeps"] = ["qx.locale.Locale", "qx.locale.Manager"]

    elif category == "qx.impl":
        content = filetool.read(path, entry["encoding"])

        meta["loadtimeDeps"] = _extractQxLoadtimeDeps(content, id)
        meta["runtimeDeps"] = _extractQxRuntimeDeps(content, id)
        meta["optionalDeps"] = _extractQxOptionalDeps(content)
        meta["ignoreDeps"] = _extractQxIgnoreDeps(content)

        meta["modules"] = _extractQxModules(content)
        meta["resources"] = _extractQxResources(content)
        meta["embeds"] = _extractQxEmbeds(content)

    cache.write(cacheId, meta)

    return meta



def _extractQxLoadtimeDeps(data, fileId=""):
    deps = []

    for item in config.QXHEAD["require"].findall(data):
        if item == fileId:
            print "    - Error: Self-referring load dependency: %s" % item
            sys.exit(1)
        else:
            deps.append(item)

    return deps



def _extractQxRuntimeDeps(data, fileId=""):
    deps = []

    for item in config.QXHEAD["use"].findall(data):
        if item == fileId:
            print "    - Self-referring runtime dependency: %s" % item
        else:
            deps.append(item)

    return deps



def _extractQxOptionalDeps(data):
    deps = []

    # Adding explicit requirements
    for item in config.QXHEAD["optional"].findall(data):
        if not item in deps:
            deps.append(item)

    return deps



def _extractQxIgnoreDeps(data):
    ignores = []

    # Adding explicit requirements
    for item in config.QXHEAD["ignore"].findall(data):
        if not item in ignores:
            ignores.append(item)

    return ignores



def _extractQxModules(data):
    mods = []

    for item in config.QXHEAD["module"].findall(data):
        if not item in mods:
            mods.append(item)

    return mods



def _extractQxResources(data):
    res = []

    for item in config.QXHEAD["resource"].findall(data):
        res.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

    return res



def _extractQxEmbeds(data):
    emb = []

    for item in config.QXHEAD["embed"].findall(data):
        emb.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

    return emb







######################################################################
#  COMMON COMPILED PKG SUPPORT
######################################################################

def storeCompiledPackage(includeDict, packageFileName, loadDeps, runDeps, variants, buildProcess, variantPos):
    fileId = "%s-%s" % (packageFileName, variantPos)
    
    # Compiling classes
    sortedClasses = sortClasses(includeDict, loadDeps, runDeps, variants)
    compiledContent = compileClasses(sortedClasses, variants, buildProcess)

    # Saving compiled content
    filetool.save(fileId + ".js", compiledContent)
    return getContentSize(compiledContent)



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










######################################################################
#  VIEW/PACKAGE SUPPORT
######################################################################

def processParts(partClasses, partBits, includeDict, loadDeps, runDeps, variants, collapseParts, optimizeLatency, buildScript, buildProcess):
    global classes


    console.info("")
    console.info(">>> Resolving part dependencies...")
    partDeps = {}
    length = len(partClasses.keys())
    for pos, partId in enumerate(partClasses.keys()):
        console.debug("  - Part #%s..." % partId)

        # Exclude all features of other parts
        # and handle dependencies the smart way =>
        # also exclude classes only needed by the
        # already excluded features
        partExcludes = []
        for subPartId in partClasses:
            if subPartId != partId:
                partExcludes.extend(partClasses[subPartId])

        # Finally resolve the dependencies
        localDeps = resolveDependencies(partClasses[partId], partExcludes, loadDeps, runDeps, variants)


        # Remove all dependencies which are not included in the full list
        if len(includeDict) > 0:
          depKeys = localDeps.keys()
          for dep in depKeys:
              if not dep in includeDict:
                  del localDeps[dep]

        console.debug("    - Needs %s classes" % len(localDeps))

        partDeps[partId] = localDeps



    # Assign classes to packages
    console.debug("")
    console.info(">>> Assigning classes to packages...")

    # References packageId -> class list
    packageClasses = {}

    # References packageId -> bit number e.g. 4=1, 5=2, 6=2, 7=3
    packageBitCounts = {}

    for classId in classes:
        packageId = 0
        bitCount = 0

        # Iterate through the parts use needs this class
        for partId in partClasses:
            if classId in partDeps[partId]:
                packageId += partBits[partId]
                bitCount += 1

        # Ignore unused classes
        if packageId == 0:
            continue

        # Create missing data structure
        if not packageClasses.has_key(packageId):
            packageClasses[packageId] = []
            packageBitCounts[packageId] = bitCount

        # Finally store the class to the package
        packageClasses[packageId].append(classId)




    # Assign packages to parts
    console.info(">>> Assigning packages to parts...")
    partPackages = {}

    for partId in partClasses:
        partBit = partBits[partId]

        for packageId in packageClasses:
            if packageId&partBit:
                if not partPackages.has_key(partId):
                    partPackages[partId] = []

                partPackages[partId].append(packageId)

        # Be sure that the part package list is in order to the package priorit
        _sortPackageIdsByPriority(partPackages[partId], packageBitCounts)




    # User feedback
    _printPartStats(packageClasses, partPackages)



    # Support for package collapsing
    # Could improve latency when initial loading an application
    # Merge all packages of a specific part into one (also supports multiple parts)
    # Hint: Part packages are sorted by priority, this way we can
    # easily merge all following packages with the first one, because
    # the first one is always the one with the highest priority
    if len(collapseParts) > 0:
        console.debug("")
        collapsePos = 0
        console.info(">>> Collapsing parts...")
        for partId in collapseParts:
            console.info("  - Collapsing part #%s(%s)..." % (partId, collapsePos))

            collapsePackage = partPackages[partId][collapsePos]
            for packageId in partPackages[partId][collapsePos+1:]:
                console.debug("    - Merge package #%s into #%s" % (packageId, collapsePackage))

                _mergePackage(packageId, collapsePackage, partClasses, partPackages, packageClasses)

            collapsePos += 1

        # User feedback
        _printPartStats(packageClasses, partPackages)


    # Support for merging small packages
    # Hint1: Based on the token length which is a bit strange but a good
    # possibility to get the not really correct filesize in an ultrafast way
    # More complex code and classes generally also have more tokens in them
    # Hint2: The first common package before the selected package between two
    # or more parts is allowed to merge with. As the package which should be merged
    # may have requirements these must be solved. The easiest way to be sure regarding
    # this issue, is to look out for another common package. The package for which we
    # are looking must have requirements in all parts so these must be solved by all parts
    # so there must be another common package. Hardly to describe... hope this makes some sense
    if optimizeLatency != None and optimizeLatency != 0:
        smallPackages = []

        # Start at the end with the priority sorted list
        sortedPackageIds = _sortPackageIdsByPriority(_dictToHumanSortedList(packageClasses), packageBitCounts)
        sortedPackageIds.reverse()

        console.debug("")
        console.info(">>> Analysing package sizes...")
        console.debug("  - Optimize at %s tokens" % optimizeLatency)

        for packageId in sortedPackageIds:
            packageLength = 0

            for classId in packageClasses[packageId]:
                packageLength += treesupport.getLength(classId)

            if packageLength >= optimizeLatency:
                console.debug("    - Package #%s has %s tokens" % (packageId, packageLength))
                continue
            else:
                console.debug("    - Package #%s has %s tokens => trying to optimize" % (packageId, packageLength))

            collapsePackage = _getPreviousCommonPackage(packageId, partPackages, packageBitCounts)
            if collapsePackage != None:
                console.debug("      - Merge package #%s into #%s" % (packageId, collapsePackage))
                _mergePackage(packageId, collapsePackage, partClasses, partPackages, packageClasses)

        # User feedback
        _printPartStats(packageClasses, partPackages)



    # Compile files...
    packageLoaderContent = ""
    sortedPackageIds = _sortPackageIdsByPriority(_dictToHumanSortedList(packageClasses), packageBitCounts)
    variantsId = variantsupport.generateCombinationId(variants)
    processId = generateProcessCombinationId(buildProcess)


    console.debug("")
    console.info(">>> Creating packages...")
    for packageId in sortedPackageIds:
        console.info("  - Compiling package #%s:" % packageId, False)

        packageFileName = "%s_%s" % (buildScript, packageId) 
        packageSize = storeCompiledPackage(packageClasses[packageId], packageFileName, loadDeps, runDeps, variants, buildProcess)
        console.info("    - Done: %s" % packageSize)

        # TODO: Make prefix configurable
        prefix = "script/"
        packageLoaderContent += "document.write('<script type=\"text/javascript\" src=\"%s\"></script>');\n" % (prefix + packageFileName)


    console.info(">>> Storing package loader script...")
    packageLoader = "%s_%s_%s.js" % (buildScript, variantsId, processId)
    filetool.save(packageLoader, packageLoaderContent)



def _sortPackageIdsByPriority(packageIds, packageBitCounts):
    def _cmpPackageIds(pkgId1, pkgId2):
        if packageBitCounts[pkgId2] > packageBitCounts[pkgId1]:
            return 1
        elif packageBitCounts[pkgId2] < packageBitCounts[pkgId1]:
            return -1

        return pkgId2 - pkgId1

    packageIds.sort(_cmpPackageIds)

    return packageIds



def _getPreviousCommonPackage(searchId, partPackages, packageBitCounts):
    relevantParts = []
    relevantPackages = []

    for partId in partPackages:
        packages = partPackages[partId]
        if searchId in packages:
            relevantParts.append(partId)
            relevantPackages.extend(packages[:packages.index(searchId)])

    # Sorted by priority, but start from end
    _sortPackageIdsByPriority(relevantPackages, packageBitCounts)
    relevantPackages.reverse()

    # Check if a package is available identical times to the number of parts
    for packageId in relevantPackages:
        if relevantPackages.count(packageId) == len(relevantParts):
            return packageId

    return None



def _printPartStats(packageClasses, partPackages):
    packageIds = _dictToHumanSortedList(packageClasses)

    console.debug("")
    console.debug(">>> Content of packages(%s):" % len(packageIds))
    for packageId in packageIds:
        console.debug("  - Package #%s contains %s classes" % (packageId, len(packageClasses[packageId])))

    console.debug("")
    console.debug(">>> Content of parts(%s):" % len(partPackages))
    for partId in partPackages:
        console.debug("  - Part #%s uses these packages: %s" % (partId, _intListToString(partPackages[partId])))



def _dictToHumanSortedList(input):
    output = []
    for key in input:
        output.append(key)
    output.sort()
    output.reverse()

    return output



def _mergePackage(replacePackage, collapsePackage, partClasses, partPackages, packageClasses):
    # Replace other package content
    for partId in partClasses:
        partContent = partPackages[partId]

        if replacePackage in partContent:
            # Store collapse package at the place of the old value
            partContent[partContent.index(replacePackage)] = collapsePackage

            # Remove duplicate (may be, but only one)
            if partContent.count(collapsePackage) > 1:
                partContent.reverse()
                partContent.remove(collapsePackage)
                partContent.reverse()

    # Merging collapsed packages
    packageClasses[collapsePackage].extend(packageClasses[replacePackage])
    del packageClasses[replacePackage]



def _intListToString(input):
    result = ""
    for entry in input:
        result += "#%s, " % entry

    return result[:-2]






######################################################################
#  MODULE/REGEXP SUPPORT
######################################################################

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
#  SUPPORT FOR OPTIONAL CLASSES/FEATURES
######################################################################

def getOptionals(classes):
    opt = {}

    for id in classes:
        for sub in getMeta(id)["optionalDeps"]:
            if not sub in classes:
                opt[sub] = True

    return opt






######################################################################
#  COMPILER SUPPORT
######################################################################

def compileClasses(todo, variants, process):
    global classes
    
    content = ""
    length = len(todo)

    for pos, id in enumerate(todo):
        console.progress(pos, length)
        content += getCompiled(classes[id], variants, process)

    return content


def _compileClassHelper(restree):
    # Emulate options
    parser = optparse.OptionParser()
    parser.add_option("--p1", action="store_true", dest="prettyPrint", default=False)
    parser.add_option("--p2", action="store_true", dest="prettypIndentString", default="  ")
    parser.add_option("--p3", action="store_true", dest="prettypCommentsInlinePadding", default="  ")
    parser.add_option("--p4", action="store_true", dest="prettypCommentsTrailingCommentCols", default="")

    (options, args) = parser.parse_args([])

    return compiler.compile(restree, options)


def getCompiled(entry, variants, process):
    global cache
    global log
    
    fileId = entry["id"]
    filePath = entry["path"]

    variantsId = variantsupport.generateCombinationId(variants)
    processId = generateProcessCombinationId(process)
    cacheId = "%s-compiled-%s-%s" % (fileId, variantsId, processId)

    compiled = cache.read(cacheId, filePath)
    if compiled != None:
        return compiled

    tree = copy.deepcopy(treesupport.getVariantsTree(entry, variants, cache, log))

    console.debug("  - Postprocessing tree: %s..." % fileId)
    tree = _postProcessHelper(tree, fileId, process, variants)

    console.debug("  - Compiling tree: %s..." % fileId)
    compiled = _compileClassHelper(tree)

    cache.write(cacheId, compiled)
    return compiled


def _postProcessHelper(tree, id, process, variants):
    if "optimize-basecalls" in process:
        console.debug("    - Optimize base calls...")
        baseCallOptimizeHelper(tree, id, variants)

    if "optimize-variables" in process:
        console.debug("    - Optimize local variables...")
        variableOptimizeHelper(tree, id, variants)

    if "optimize-privates" in process:
        console.debug("    - Optimize privates...")
        privateOptimizeHelper(tree, id, variants)

    if "optimize-strings" in process:
        console.debug("    - Optimize strings...")
        stringOptimizeHelper(tree, id, variants)

    return tree


def generateProcessCombinationId(process):
    process = copy.copy(process)
    process.sort()

    return "[%s]" % ("-".join(process))


def baseCallOptimizeHelper(tree, id, variants):
    basecalloptimizer.patch(tree)


def variableOptimizeHelper(tree, id, variants):
    variableoptimizer.search(tree, [], 0, 0, "$")


def privateOptimizeHelper(tree, id, variants):
    global jobconfig
    unique = zlib.adler32(id)
    privateoptimizer.patch(unique, tree, {})


def stringOptimizeHelper(tree, id, variants):
    # Do not optimize strings for non-mshtml clients
    clientValue = getVariantValue(variants, "qx.client")
    if clientValue != None and clientValue != "mshtml":
        return

    # TODO: Customize option for __SS__

    stringMap = stringoptimizer.search(tree)
    stringList = stringoptimizer.sort(stringMap)

    stringoptimizer.replace(tree, stringList, "__SS__")

    # Build JS string fragments
    stringStart = "(function(){"
    stringReplacement = "var " + stringoptimizer.replacement(stringList, "__SS__")
    stringStop = "})();"

    # Compile wrapper node
    wrapperNode = treeutil.compileString(stringStart+stringReplacement+stringStop)

    # Reorganize structure
    funcBody = wrapperNode.getChild("operand").getChild("group").getChild("function").getChild("body").getChild("block")
    if tree.hasChildren():
        for child in copy.copy(tree.children):
            tree.removeChild(child)
            funcBody.addChild(child)

    # Add wrapper to tree
    tree.addChild(wrapperNode)


def getVariantValue(variants, key):
    for entry in variants:
        if entry["id"] == key:
            return entry["value"]

    return None






######################################################################
#  CLASS DEPENDENCY SUPPORT
######################################################################

def resolveDependencies(add, block, loadDeps, runDeps, variants):
    result = {}

    for entry in add:
        _resolveDependenciesRecurser(entry, result, block, loadDeps, runDeps, variants)

    return result


def _resolveDependenciesRecurser(add, result, block, loadDeps, runDeps, variants):
    global classes

    # check if already in
    if result.has_key(add):
        return

    # add self

    result[add] = True

    # reading dependencies
    deps = getCombinedDeps(add, loadDeps, runDeps, variants)

    # process lists
    for sub in deps["load"]:
        if not result.has_key(sub) and not sub in block:
            _resolveDependenciesRecurser(sub, result, block, loadDeps, runDeps, variants)

    for sub in deps["run"]:
        if not result.has_key(sub) and not sub in block:
            _resolveDependenciesRecurser(sub, result, block, loadDeps, runDeps, variants)


def getCombinedDeps(id, loadDeps, runDeps, variants):
    # init lists
    loadFinal = []
    runFinal = []

    # add static dependencies
    static = getDeps(id, variants)
    loadFinal.extend(static["load"])
    runFinal.extend(static["run"])

    # add dynamic dependencies
    if loadDeps.has_key(id):
        loadFinal.extend(loadDeps[id])

    if runDeps.has_key(id):
        runFinal.extend(runDeps[id])

    # return dict
    return {
        "load" : loadFinal,
        "run" : runFinal
    }


def getDeps(id, variants):
    global classes

    cacheId = "%s-deps-%s" % (id, variantsupport.generateCombinationId(variants))

    deps = cache.read(cacheId, classes[id]["path"])
    if deps != None:
        return deps

    # Notes:
    # load time = before class = require
    # runtime = after class = use

    console.debug("  - Gathering dependencies: %s" % id)

    load = []
    run = []

    # Read meta data

    meta = getMeta(id)
    metaLoad = _readDictKey(meta, "loadtimeDeps", [])
    metaRun = _readDictKey(meta, "runtimeDeps", [])
    metaOptional = _readDictKey(meta, "optionalDeps", [])
    metaIgnore = _readDictKey(meta, "ignoreDeps", [])

    # Process meta data
    load.extend(metaLoad)
    run.extend(metaRun)

    # Read content data
    (autoLoad, autoRun) = _analyzeClassDeps(id, variants)

    # Process content data
    if not "auto-require" in metaIgnore:
        for entry in autoLoad:
            if entry in metaOptional:
                pass
            elif entry in load:
                console.debug("  - #require(%s) is auto-detected" % entry)
            else:
                load.append(entry)

    if not "auto-use" in metaIgnore:
        for entry in autoRun:
            if entry in metaOptional:
                pass
            elif entry in load:
                pass
            elif entry in run:
                console.debug("  - #use(%s) is auto-detected" % entry)
            else:
                run.append(entry)

    # Build data structure
    deps = {
        "load" : load,
        "run" : run
    }

    cache.write(cacheId, deps)

    return deps


def _readDictKey(data, key, default=None):
    if data.has_key(key):
        return data[key]

    return default


def _analyzeClassDeps(id, variants):
    global classes
    global cache

    tree = treesupport.getVariantsTree(classes[id], variants, cache, log)
    loadtime = []
    runtime = []

    _analyzeClassDepsNode(id, tree, loadtime, runtime, False)

    return loadtime, runtime


def _analyzeClassDepsNode(id, node, loadtime, runtime, inFunction):
    global classes

    if node.type == "variable":
        if node.hasChildren:
            assembled = ""
            first = True

            for child in node.children:
                if child.type == "identifier":
                    if not first:
                        assembled += "."

                    assembled += child.get("name")
                    first = False

                    if assembled != id and classes.has_key(assembled):
                        if inFunction:
                            target = runtime
                        else:
                            target = loadtime

                        if assembled in target:
                            return

                        target.append(assembled)

                else:
                    assembled = ""
                    break

                # treat dependencies in defer as requires
                if assembled == "qx.Class.define":
                    if node.parent.type == "operand" and node.parent.parent.type == "call":
                        deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
                        if deferNode != None:
                            _analyzeClassDepsNode(id, deferNode, loadtime, runtime, False)

    elif node.type == "body" and node.parent.type == "function":
        inFunction = True

    if node.hasChildren():
        for child in node.children:
            _analyzeClassDepsNode(id, child, loadtime, runtime, inFunction)








######################################################################
#  CLASS SORT SUPPORT
######################################################################

def sortClasses(input, loadDeps, runDeps, variants):
    sorted = []

    for entry in input:
        _sortClassesRecurser(entry, input, sorted, loadDeps, runDeps, variants)

    return sorted


def _sortClassesRecurser(id, available, sorted, loadDeps, runDeps, variants):
    global classes

    if id in sorted:
        return

    # reading dependencies
    deps = getCombinedDeps(id, loadDeps, runDeps, variants)

    # process loadtime requirements
    for entry in deps["load"]:
        if entry in available and not entry in sorted:
            _sortClassesRecurser(entry, available, sorted, loadDeps, runDeps, variants)

    if id in sorted:
        return

    # print "  - Adding: %s" % id
    sorted.append(id)

    # process runtime requirements
    for entry in deps["run"]:
        if entry in available and not entry in sorted:
            _sortClassesRecurser(entry, available, sorted, loadDeps, runDeps, variants)





def scanModules():
    global classes
    global modules

    modules = {}

    console.info(">>> Searching for module definitions...")
    for id in classes:
        if classes[id]["category"] == "qx.impl":
            for mod in getMeta(id)["modules"]:
                if not modules.has_key(mod):
                    modules[mod] = []

                modules[mod].append(id)

    console.info("  - Found %s modules" % len(modules))
    console.info("")







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

