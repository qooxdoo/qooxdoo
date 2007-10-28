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

* All cache data is automatically stored into "cache2"". The path is automatically
  detected through the location of the generator script.
"""

import sys, re, os, optparse, math, cPickle, copy, sets, zlib

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

    jobconfig = config

    console.head("Executing: %s" % job, True)
    
    


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

    # Variants data
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
    classes = classpath.getClasses(classPaths, console)
    treeutil = treesupport.TreeUtil(classes, cache, console)
    deputil = dependencysupport.DependencyUtil(classes, cache, console, treeutil, getJobConfig("require", {}), getJobConfig("use", {}))
    modules = deputil.getModules()
    compiler = compilesupport.Compiler(classes, cache, console, treeutil)
    apiutil = apidata.ApiUtil(classes, cache, console, treeutil)
    
    


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

    sets = variantsupport.computeCombinations(userVariants)
    for pos, variants in enumerate(sets):
        console.head("PROCESSING VARIANT SET %s/%s" % (pos+1, len(sets)))
        
        if len(variants) > 0:
            console.debug("Selected variants:")
            console.indent()
            for entry in variants:
                console.debug("%s = %s" % (entry["id"], entry["value"]))
            console.outdent()

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


        # Detect optionals
        optionals = deputil.getOptionals(includeDict)
        if len(optionals) > 0:
            console.debug("These optional classes may be useful:")
            console.indent()
            for entry in optionals:
                console.debug("%s" % entry)
            console.outdent()


        if apiPath != None:
            apiutil.storeApi(includeDict, apiPath)


        if buildScript != None:
            if execMode == "parts":
                processParts(partClasses, partBits, includeDict, variants, collapseParts, optimizeLatency, buildScript, buildProcess)
            else:
                console.info("Compiling classes:", False)
                packageSize = storeCompiledPackage(includeDict, buildScript, variants, buildProcess, pos+1)
                
                console.indent()
                console.debug("Done: %s" % packageSize)
                console.outdent()

        if sourceScript != None:
            console.debug("Generating script file...")
            sourceScript = storeSourceScript(includeDict, sourceScript, variants, pos+1)



def storeSourceScript(includeDict, packageFileName, variants, variantPos):
    global classes

    scriptBlocks = ""
    sortedClasses = deputil.sortClasses(includeDict, variants)
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
#  COMMON COMPILED PKG SUPPORT
######################################################################

def storeCompiledPackage(includeDict, packageFileName, variants, buildProcess, variantPos):
    fileId = "%s-%s" % (packageFileName, variantPos)
    
    # Compiling classes
    sortedClasses = deputil.sortClasses(includeDict, variants)
    compiledContent = compiler.compileClasses(sortedClasses, variants, buildProcess)

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
#  PART SUPPORT
######################################################################

def processParts(partClasses, partBits, includeDict, variants, collapseParts, optimizeLatency, buildScript, buildProcess):
    global classes

    console.debug("")
    console.info("Resolving part dependencies...")
    console.indent()
    partDeps = {}
    length = len(partClasses.keys())
    for pos, partId in enumerate(partClasses.keys()):
        # Exclude all features of other parts
        # and handle dependencies the smart way =>
        # also exclude classes only needed by the
        # already excluded features
        partExcludes = []
        for subPartId in partClasses:
            if subPartId != partId:
                partExcludes.extend(partClasses[subPartId])

        # Finally resolve the dependencies
        localDeps = dependencysupport.resolveDependencies(partClasses[partId], partExcludes, variants)


        # Remove all dependencies which are not included in the full list
        if len(includeDict) > 0:
          depKeys = localDeps.keys()
          for dep in depKeys:
              if not dep in includeDict:
                  del localDeps[dep]

        console.debug("Part #%s needs %s classes" % (partId, len(localDeps)))

        partDeps[partId] = localDeps
        
    console.outdent()


    # Assign classes to packages
    console.debug("")
    console.debug("Assigning classes to packages...")

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
    console.debug("Assigning packages to parts...")
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
        console.info("Collapsing packages...")
        console.indent()
        for partId in collapseParts:
            console.debug("#%s(%s)..." % (partId, collapsePos))

            collapsePackage = partPackages[partId][collapsePos]
            console.indent()
            for packageId in partPackages[partId][collapsePos+1:]:
                console.debug("    - Merge #%s into #%s" % (packageId, collapsePackage))
                _mergePackage(packageId, collapsePackage, partClasses, partPackages, packageClasses)
            
            console.outdent()
            collapsePos += 1

        console.outdent()
        
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
        console.info("Analysing package sizes...")
        console.indent()
        console.debug("Optimize at %s tokens" % optimizeLatency)

        for packageId in sortedPackageIds:
            packageLength = 0
            console.indent()

            for classId in packageClasses[packageId]:
                packageLength += treeutil.getLength(classes[classId], cache, console)

            if packageLength >= optimizeLatency:
                console.debug("    - Package #%s has %s tokens" % (packageId, packageLength))
                continue
            else:
                console.debug("    - Package #%s has %s tokens => trying to optimize" % (packageId, packageLength))

            collapsePackage = _getPreviousCommonPackage(packageId, partPackages, packageBitCounts)

            console.indent()
            if collapsePackage != None:
                console.debug("Merge package #%s into #%s" % (packageId, collapsePackage))
                _mergePackage(packageId, collapsePackage, partClasses, partPackages, packageClasses)

            console.outdent()
            console.outdent()

        # User feedback
        _printPartStats(packageClasses, partPackages)



    # Compile files...
    packageLoaderContent = ""
    sortedPackageIds = _sortPackageIdsByPriority(_dictToHumanSortedList(packageClasses), packageBitCounts)
    variantsId = variantsupport.generateCombinationId(variants)
    processId = generateProcessCombinationId(buildProcess)


    console.debug("")
    console.info("Compiling packages...")
    console.indent()
    for packageId in sortedPackageIds:
        console.info("Package #%s:" % packageId, False)

        packageFileName = "%s_%s" % (buildScript, packageId) 
        packageSize = storeCompiledPackage(packageClasses[packageId], packageFileName, variants, buildProcess, pos+1)
        
        console.indent()
        console.debug("Done: %s" % packageSize)
        console.outdent()

        # TODO: Make prefix configurable
        prefix = "script/"
        packageLoaderContent += "document.write('<script type=\"text/javascript\" src=\"%s\"></script>');\n" % (prefix + packageFileName)

    console.outdent()
    console.info("Storing package loader script...")
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
    console.debug("Content of packages(%s):" % len(packageIds))
    console.indent()
    for packageId in packageIds:
        console.debug("Package #%s contains %s classes" % (packageId, len(packageClasses[packageId])))
    console.outdent()

    console.debug("")
    console.debug("Content of parts(%s):" % len(partPackages))
    console.indent()
    for partId in partPackages:
        console.debug("Part #%s uses these packages: %s" % (partId, _intListToString(partPackages[partId])))
    console.outdent()



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
#  MAIN LOOP
######################################################################

if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)

