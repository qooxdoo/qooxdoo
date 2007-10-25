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
* Load project configuration from JSON(-like) data file
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

* All cache data is automatically stored into framework/tool/.cache. The path is automatically
  detected through the location of the generator script.
"""


import sys, re, os, optparse, math, cPickle, copy, sets, zlib

# reconfigure path to import own modules from modules subfolder
script_path = os.path.dirname(os.path.abspath(sys.argv[0]))
sys.path.insert(0, os.path.join(script_path, "modules"))
sys.path.insert(0, os.path.join(script_path, "generator2"))

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
from generator2 import hashcode
from generator2 import apidata
from generator2 import progress
from generator2 import treesupport

hashes = None


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


def init():
    "Construct some global objects"
    global treesupport
    global classes
    global jobconfig
    global verbose

    treesupport = treesupport.TreeSupport(classes, jobconfig["cachePath"], verbose)


def process(options):
    global verbose
    global quiet

    verbose = options.verbose
    quiet = options.quiet

    if verbose:
        quiet = False

    print ">>> Processing..."
    if not quiet:
        print "  - Configuration: %s" % options.config
        print "  - Jobs: %s" % ", ".join(options.jobs)

    config = simplejson.loads(filetool.read(options.config))
    resolve(config, options.jobs)

    for job in options.jobs:
        execute(job, config[job])


def resolve(config, jobs):
    print ">>> Resolving jobs..."
    for job in jobs:
        resolveEntry(config, job)


def resolveEntry(config, job):
    global quiet

    if not config.has_key(job):
        print "  - No such job: %s" % job
        sys.exit(1)

    data = config[job]

    if data.has_key("resolved"):
        return

    #print "  - Processing: %s" % job

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

    print
    print "============================================================================"
    print "    EXECUTING: %s" % job
    print "============================================================================"

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
    global verbose
    global quiet


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
    # SCAN PHASE
    #

    # Scan for classes and modules
    scanClassPaths(classPaths)
    scanModules()


    # Init global objects
    init()


    #
    # PREPROCESS PHASE: INCLUDE/EXCLUDE
    #

    # Auto include all when nothing defined
    if execMode == "normal" and len(userInclude) == 0:
        print "  - Automatically including all available classes"
        userInclude.append("*")



    print ">>> Preparing include/exclude configuration..."
    smartInclude, explicitInclude = _splitIncludeExcludeList(userInclude)
    smartExclude, explicitExclude = _splitIncludeExcludeList(userExclude)


    # Configuration feedback
    if not quiet:
        print "  - Including %s items smart, %s items explicit" % (len(smartInclude), len(explicitInclude))
        print "  - Excluding %s items smart, %s items explicit" % (len(smartExclude), len(explicitExclude))

        if len(userExclude) > 0:
            print "    - Warning: Excludes may break code!"

        if len(explicitInclude) > 0:
            print "    - Warning: Explicit included classes may not work"






    # Resolve modules/regexps
    print "  - Resolving modules/regexps..."
    smartInclude = resolveComplexDefs(smartInclude)
    explicitInclude = resolveComplexDefs(explicitInclude)
    smartExclude = resolveComplexDefs(smartExclude)
    explicitExclude = resolveComplexDefs(explicitExclude)





    #
    # PREPROCESS PHASE: VIEWS
    #

    if execMode == "parts":
        print
        print ">>> Preparing part configuration..."

        # Build bitmask ids for parts
        if verbose:
            print

        print "  - Assigning bits to parts..."

        # References partId -> bitId of that part
        partBits = {}

        partPos = 0
        for partId in userParts:
            partBit = 1<<partPos

            if verbose:
                print "    - Part #%s => %s" % (partId, partBit)

            partBits[partId] = partBit
            partPos += 1

        # Resolving modules/regexps
        print "  - Resolving part modules/regexps..."
        partClasses = {}
        for partId in userParts:
            partClasses[partId] = resolveComplexDefs(userParts[partId])




    #
    # EXECUTION PHASE
    #

    sets = _computeVariantCombinations(userVariants)
    for pos, variants in enumerate(sets):
        print
        print "----------------------------------------------------------------------------"
        print "    PROCESSING VARIANT SET %s/%s" % (pos+1, len(sets))
        print "----------------------------------------------------------------------------"
        if not quiet and len(variants) > 0:
            for entry in variants:
                print "  - %s = %s" % (entry["id"], entry["value"])
            print "----------------------------------------------------------------------------"


        # Detect dependencies
        print ">>> Resolving application dependencies..."
        includeDict = resolveDependencies(smartInclude, smartExclude, dynLoadDeps, dynRunDeps, variants)


        # Explicit include/exclude
        if len(explicitInclude) > 0 or len(explicitExclude) > 0:
            print ">>> Processing explicitely configured includes/excludes..."
            for entry in explicitInclude:
                includeDict[entry] = True

            for entry in explicitExclude:
                if includeDict.has_key(entry):
                    del includeDict[entry]


        # Detect optionals
        if verbose:
            optionals = getOptionals(includeDict)
            if len(optionals) > 0:
                print ">>> These optional classes may be useful:"
                for entry in optionals:
                    print "  - %s" % entry


        if apiPath != None:
            apidata.storeApi(includeDict, dynLoadDeps, dynRunDeps, apiPath, classes, jobconfig["cachePath"], treesupport, quiet, verbose)


        if buildScript != None:
            if execMode == "parts":
                processParts(partClasses, partBits, includeDict, dynLoadDeps, dynRunDeps, variants, collapseParts, optimizeLatency, buildScript, buildProcess)
            else:
                sys.stdout.write(">>> Compiling classes:")
                sys.stdout.flush()
                packageFileName = buildScript + "_$variants_$process.js"
                packageSize = storeCompiledPackage(includeDict, packageFileName, dynLoadDeps, dynRunDeps, variants, buildProcess)
                print "    - Done: %s" % packageSize

        sourceScript = True

        if sourceScript != None:
            sys.stdout.write(">>> Generating script file...\n")
            sys.stdout.flush()
            sourceScriptFile = "script.js"
            sourceScript = storeSourceScript(includeDict, sourceScriptFile, dynLoadDeps, dynRunDeps, variants, buildProcess)
            print "    - Done"



def storeSourceScript(includeDict, sourceScriptFile, loadDeps, runDeps, variants, buildProcess):
    global classes

    scriptBlocks = ""
    sortedClasses = sortClasses(includeDict, loadDeps, runDeps, variants)
    for f in sortedClasses:
        cEntry    = classes[f]
        uriprefix = ""
        for pElem in jobconfig['path']:
            if pElem['class'] == cEntry['classPath']:
                uriprefix = pElem['web']
                break
        if uriprefix == "":
            raise "Cannot find uriprefix for %s" % f
        uri       = os.path.join(uriprefix, f.replace(".",os.sep)) + ".js"
        scriptBlocks += '<script type="text/javascript" src="%s"></script>' % uri
        scriptBlocks += "\n"

    sourceScript = "document.write('%s');" % scriptBlocks.replace("'", "\\'")

    filetool.save(sourceScriptFile, sourceScript)
    return sourceScript




######################################################################
#  META DATA SUPPORT
######################################################################

def getMeta(id):
    global classes

    entry = classes[id]
    path = entry["path"]

    cache = cachesupport.readCache(id, "meta", path, jobconfig["cachePath"])
    if cache != None:
        return cache

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

    cachesupport.writeCache(id, "meta", meta, jobconfig["cachePath"])

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

def storeCompiledPackage(includeDict, packageFileName, loadDeps, runDeps, variants, buildProcess):
    # Compiling classes
    sortedClasses = sortClasses(includeDict, loadDeps, runDeps, variants)
    compiledContent = compileClasses(sortedClasses, variants, buildProcess)

    # Pre storage calculations
    variantsId = generateVariantCombinationId(variants)
    processId = generateProcessCombinationId(buildProcess)

    variantsId = hashcode.toHashCode(variantsId, hashes, jobconfig["cachePath"])
    processId  = hashcode.toHashCode(processId , hashes, jobconfig["cachePath"])

    packageFileName = packageFileName.replace("$variants", variantsId)
    packageFileName = packageFileName.replace("$process", processId)

    # Saving compiled content
    filetool.save(packageFileName, compiledContent)
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



def _findCombinations(a):
    result = [[]]

    for x in a:
        t = []
        for y in x:
            for i in result:
                t.append(i+[y])
        result = t

    return result



def _computeVariantCombinations(variants):
    variantPossibilities = []
    for variantId in variants:
        innerList = []
        for variantValue in variants[variantId]:
            innerList.append({"id" : variantId, "value" : variantValue})
        variantPossibilities.append(innerList)

    return _findCombinations(variantPossibilities)



def generateVariantCombinationId(selected):
    def _compare(x, y):
        if x["id"] > y["id"]:
            return 1

        if x["id"] < y["id"]:
            return -1

        return 0

    sortedList = []
    sortedList.extend(selected)
    sortedList.sort(_compare)

    sortedString = []
    for entry in sortedList:
        sortedString.append("(" + entry["id"].replace(".", "") + "_" + entry["value"] + ")")

    return "_".join(sortedString)







######################################################################
#  VIEW/PACKAGE SUPPORT
######################################################################

def processParts(partClasses, partBits, includeDict, loadDeps, runDeps, variants, collapseParts, optimizeLatency, buildScript, buildProcess):
    global classes
    global verbose
    global quiet


    # Caching dependencies of each part
    if not quiet:
        print

    print ">>> Resolving part dependencies..."
    partDeps = {}
    length = len(partClasses.keys())
    for pos, partId in enumerate(partClasses.keys()):
        if not quiet:
            print "  - Part #%s..." % partId

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

        if not quiet:
            print "    - Needs %s classes" % len(localDeps)

        partDeps[partId] = localDeps



    # Assign classes to packages
    if not quiet:
        print

    print ">>> Assigning classes to packages..."

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
    print ">>> Assigning packages to parts..."
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
        if not quiet:
            print

        collapsePos = 0
        print ">>> Collapsing parts..."
        for partId in collapseParts:
            if not quiet:
                print "  - Collapsing part #%s(%s)..." % (partId, collapsePos)

            collapsePackage = partPackages[partId][collapsePos]
            for packageId in partPackages[partId][collapsePos+1:]:
                if not quiet:
                    print "    - Merge package #%s into #%s" % (packageId, collapsePackage)

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

        if not quiet:
            print
        print ">>> Analysing package sizes..."
        if not quiet:
            print "  - Optimize at %s tokens" % optimizeLatency

        for packageId in sortedPackageIds:
            packageLength = 0

            for classId in packageClasses[packageId]:
                packageLength += treesupport.getLength(classId)

            if packageLength >= optimizeLatency:
                if not quiet:
                    print "    - Package #%s has %s tokens" % (packageId, packageLength)
                continue
            else:
                if not quiet:
                    print "    - Package #%s has %s tokens => trying to optimize" % (packageId, packageLength)

            collapsePackage = _getPreviousCommonPackage(packageId, partPackages, packageBitCounts)
            if collapsePackage != None:
                if not quiet:
                    print "      - Merge package #%s into #%s" % (packageId, collapsePackage)
                _mergePackage(packageId, collapsePackage, partClasses, partPackages, packageClasses)

        # User feedback
        _printPartStats(packageClasses, partPackages)



    # Compile files...
    packageLoaderContent = ""
    sortedPackageIds = _sortPackageIdsByPriority(_dictToHumanSortedList(packageClasses), packageBitCounts)
    variantsId = generateVariantCombinationId(variants)
    processId = generateProcessCombinationId(buildProcess)

    if not quiet:
        print


    print ">>> Creating packages..."
    for packageId in sortedPackageIds:
        sys.stdout.write("  - Compiling package #%s:" % packageId)
        sys.stdout.flush()

        packageFileName = buildScript + "_$variants_$process_%s.js" % packageId
        packageSize = storeCompiledPackage(packageClasses[packageId], packageFileName, loadDeps, runDeps, variants, buildProcess)
        print "    - Done: %s" % packageSize

        # TODO: Make prefix configurable
        prefix = "script/"
        packageLoaderContent += "document.write('<script type=\"text/javascript\" src=\"%s\"></script>');\n" % (prefix + packageFileName)


    print ">>> Storing package loader script..."
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
    global verbose

    if not verbose:
        return

    packageIds = _dictToHumanSortedList(packageClasses)

    print
    print ">>> Content of packages(%s):" % len(packageIds)
    for packageId in packageIds:
        print "  - Package #%s contains %s classes" % (packageId, len(packageClasses[packageId]))

    print
    print ">>> Content of parts(%s):" % len(partPackages)
    for partId in partPackages:
        print "  - Part #%s uses these packages: %s" % (partId, _intListToString(partPackages[partId]))



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
    global quiet
    content = ""
    length = len(todo)

    for pos, id in enumerate(todo):
        progress.printProgress(pos, length, quiet)
        content += getCompiled(id, variants, process)

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


def getCompiled(id, variants, process):
    global classes
    global verbose

    variantsId = generateVariantCombinationId(variants)
    processId = generateProcessCombinationId(process)

    variantsId = hashcode.toHashCode(variantsId, hashes, jobconfig["cachePath"])
    processId  = hashcode.toHashCode(processId , hashes, jobconfig["cachePath"])

    if variantsId != "":
        variantsId = "-" + variantsId

    if processId != "":
        processId = "-" + processId

    cache = cachesupport.readCache(id, "compiled" + variantsId + processId, classes[id]["path"], jobconfig["cachePath"])
    if cache != None:
        return cache

    tokens = treesupport.getTokens(id)

    tree = copy.deepcopy(treesupport.getVariantsTree(id, variants))

    if verbose:
        print "  - Postprocessing tree: %s..." % id

    tree = _postProcessHelper(tree, id, process, variants)

    if verbose:
        print "  - Compiling tree: %s..." % id

    compiled = _compileClassHelper(tree)

    cachesupport.writeCache(id, "compiled" + variantsId + processId, compiled, jobconfig["cachePath"])
    return compiled


def _postProcessHelper(tree, id, process, variants):
    global verbose
    global quiet

    if "optimize-basecalls" in process:
        if verbose:
            print "    - Optimize base calls..."
        baseCallOptimizeHelper(tree, id, variants)

    if "optimize-variables" in process:
        if verbose:
            print "    - Optimize local variables..."
        variableOptimizeHelper(tree, id, variants)

    if "optimize-privates" in process:
        if verbose:
            print "    - Optimize privates..."
        privateOptimizeHelper(tree, id, variants)

    if "optimize-strings" in process:
        if verbose:
            print "    - Optimize strings..."
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
    global hashes
    global jobconfig
    unique = hashcode.toHashCode(id, hashes, jobconfig["cachePath"])
    privateoptimizer.patch(unique, tree, {})


def stringOptimizeHelper(tree, id, variants):
    global verbose
    global quiet

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
    global verbose

    variantsId = generateVariantCombinationId(variants)

    cache = cachesupport.readCache(id, "deps" + variantsId, classes[id]["path"], jobconfig["cachePath"])
    if cache != None:
        return cache

    # Notes:
    # load time = before class = require
    # runtime = after class = use

    if verbose:
        print "  - Gathering dependencies: %s" % id

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
                if verbose:
                    print "  - #require(%s) is auto-detected" % entry
            else:
                load.append(entry)

    if not "auto-use" in metaIgnore:
        for entry in autoRun:
            if entry in metaOptional:
                pass
            elif entry in load:
                pass
            elif entry in run:
                if verbose:
                    print "  - #use(%s) is auto-detected" % entry
            else:
                run.append(entry)

    # Build data structure
    deps = {
        "load" : load,
        "run" : run
    }

    cachesupport.writeCache(id, "deps" + variantsId, deps, jobconfig["cachePath"])

    return deps


def _readDictKey(data, key, default=None):
    if data.has_key(key):
        return data[key]

    return default


def _analyzeClassDeps(id, variants):
    global classes

    tree = treesupport.getVariantsTree(id, variants)
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





######################################################################
#  CLASS PATH SUPPORT
######################################################################

def scanModules():
    global classes
    global modules
    global quiet

    modules = {}

    print ">>> Searching for module definitions..."
    for id in classes:
        if classes[id]["category"] == "qx.impl":
            for mod in getMeta(id)["modules"]:
                if not modules.has_key(mod):
                    modules[mod] = []

                modules[mod].append(id)

    if not quiet:
        print "  - Found %s modules" % len(modules)
        print


def scanClassPaths(paths):
    global classes
    global quiet

    classes = {}

    print ">>> Scanning class paths..."
    for path in paths:
        _addClassPath(path)

    if not quiet:
        print

    return classes


def _addClassPath(classPath, encoding="utf-8"):
    global classes
    global quiet

    if not quiet:
        print "  - Scanning: %s" % classPath

    implCounter = 0
    docCounter = 0
    localeCounter = 0

    for root, dirs, files in os.walk(classPath):

        # Filter ignored directories
        for ignoredDir in config.DIRIGNORE:
            if ignoredDir in dirs:
                dirs.remove(ignoredDir)

        # Searching for files
        for fileName in files:
            if os.path.splitext(fileName)[1] == config.JSEXT and not fileName.startswith("."):
                filePath = os.path.join(root, fileName)
                filePathId = filePath.replace(classPath + os.sep, "").replace(config.JSEXT, "").replace(os.sep, ".")
                fileContent = filetool.read(filePath, encoding)
                fileCategory = "unknown"

                if fileName == "__init__.js":
                    fileContentId = filePathId
                    fileCategory = "qx.doc"
                    docCounter += 1

                else:
                    fileContentId = _extractQxClassContentId(fileContent)

                    if fileContentId == None:
                        fileContentId = _extractQxLocaleContentId(fileContent)

                        if fileContentId != None:
                            fileCategory = "qx.locale"
                            localeCounter += 1

                    else:
                        fileCategory = "qx.impl"
                        implCounter += 1

                    if filePathId != fileContentId:
                        print "    - Mismatching IDs in file: %s" % filePath
                        print "      Detail: %s != %s" % (filePathId, fileContentId)

                if fileCategory == "unknown":
                    print "    - Invalid file: %s" % filePath
                    sys.exit(1)

                fileId = filePathId

                classes[fileId] = {
                    "path" : filePath,
                    "encoding" : encoding,
                    "classPath" : classPath,
                    "category" : fileCategory,
                    "id" : fileId,
                    "contentId" : fileContentId,
                    "pathId" : filePathId
                }

    if not quiet:
        print "    - Found: %s impl, %s doc, %s locale" % (implCounter, docCounter, localeCounter)


def _extractQxClassContentId(data):
    classDefine = re.compile('qx.(Bootstrap|List|Class|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)

    for item in classDefine.findall(data):
        return item[1]

    return None


def _extractQxLocaleContentId(data):
    # 0.8 style
    localeDefine = re.compile('qx.Locale.define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)

    for item in localeDefine.findall(data):
        return item

    # 0.7.x compat
    localeDefine = re.compile('qx.locale.Locale.define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)

    for item in localeDefine.findall(data):
        return item

    return None







######################################################################
#  MAIN LOOP
######################################################################

if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)

