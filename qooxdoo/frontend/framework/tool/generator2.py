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

import sys, re, os, optparse, math, cPickle, copy, sets

# reconfigure path to import own modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "modules"))

import config, tokenizer, tree, treegenerator, treeutil, optparseext, filetool
import compiler, variableoptimizer, textutil






######################################################################
#  MAIN CONTENT
######################################################################

def main():
    print "========================================================="
    print "    INIT"
    print "========================================================="
        
    parser = optparse.OptionParser(option_class=optparseext.ExtendAction)
    
    parser.add_option("--config", dest="config", metavar="FILENAME", help="Configuration file")
    parser.add_option("--jobs", action="extend", dest="jobs", metavar="DIRECTORY", type="string", default=[], help="Selected jobs")
    
    if len(sys.argv[1:]) == 0:
        basename = os.path.basename(sys.argv[0])
        print "usage: %s [options]" % basename
        print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
        sys.exit(1)

    (options, args) = parser.parse_args(sys.argv[1:])
    
    process(options)
    
    
def process(options):
    print ">>> Processing..."
    print "  - Configuration: %s" % options.config
    print "  - Jobs: %s" % ", ".join(options.jobs)
    
    # TODO: File parser
    # - Translate dashed to camelcase
    # - Translate "true" to Python "True"
    
    # Include/Exclude hints
    #
    # class/module =>
    #   include items with their dependencies
    #   exclude items, also remove items not needed by other modules than the removed ones
    #
    # =class/module => 
    #   explicit include/exclude of given module or class
    #
    # +class/module =>
    #   aggressive exclude (excluding also things needed by other classes)
    # 
    
    config = {
        "common" : 
        {
            "classPath" : 
            [ 
                "framework/source/class", 
                "application/apiviewer/source/class", 
                "application/feedreader/source/class",
                "application/webmail/source/class",
                "application/showcase/source/class"
            ],
            
            "require" :
            {
                "qx.log.Logger" : ["qx.log.appender.Native"]
            }
        },
      
        "source" : 
        {
            "extend" : ["common"],
            "sourceScript" : "source.js"
        },
      



        "build-common" :
        {
            "extend" : ["common"],
            "optimizeVariables" : True,
        },
      
        "build-core" : 
        {
            "extend" : ["build-common"],
            "buildScript" : "build-core.js",
            "include" : ["apiviewer.Application"],
            "exclude" : ["ui_tree","=qx.ui.core.Widget"]
        },

        "build-apiviewer" : 
        {
            "extend" : ["build-common"],
            "buildScript" : "build-apiviewer.js",
            "include" : ["apiviewer.*","qx.theme.ClassicRoyale"]
        },        
        
        "build-feedreader" : 
        {
            "extend" : ["build-common"],
            "buildScript" : "build-feedreader.js",
            "include" : ["feedreader.Application"]
        },    
        
        
        
        "build-views-common" :
        {
            "extend" : ["build-common"],
            "optimizeLatency" : 5000
        },            
        
        "build-app-views" : 
        {
            "extend" : ["build-views-common"],
            "buildScript" : "build-app-views.js",
            "views" : 
            {
                "apiviewer" : ["apiviewer.Application"],
                "feedreader" : ["feedreader.Application"],
                "webmail" : ["webmail.Application"],
                "showcase" : ["showcase.Application"]
            }
        },
        
        "build-comp-views" :
        {
            "extend" : ["build-views-common"],
            "buildScript" : "build-comp-views.js",
            "views" : 
            {
                "tree" : ["ui_tree"],
                "colorselector" : ["qx.ui.component.ColorSelector"],
                "window" : ["ui_window"],
                "toolbar" : ["ui_toolbar", "ui_menu"],
                "table" : ["ui_table"],
                "form" : ["ui_form"]
            }
        },
        
        "build-feedreader-views" : 
        {
            "extend" : ["build-views-common"],
            "buildScript" : "build-feedreader-views.js",
            "collapseViews" : ["core"],
            "views" : 
            {
                "core" : ["feedreader.Application","qx.theme.ClassicRoyale"],
                "table" : ["qx.ui.table.Table", "qx.ui.table.model.Simple", "qx.ui.table.columnmodel.Resize"],
                "article" : ["feedreader.ArticleView"],
                "preferences" : ["ui_window"]
            }        
        },
        
        "build-apiviewer-views" :
        {
            "extend" : ["build-views-common"],
            "buildScript" : "build-apiviewer-views.js",
            "collapseViews" : ["core"],
            "views" : 
            {
                "core" : ["apiviewer.Application","qx.theme.ClassicRoyale"],
                "viewer" : ["apiviewer.Viewer"],
                "content" : ["apiviewer.ui.ClassViewer","apiviewer.ui.PackageViewer"]
            }
        }    
    }
    
    resolve(config, options.jobs)
    
    for job in options.jobs:
        execute(job, config[job])
        

def resolve(config, jobs):
    print ">>> Resolving jobs..."
    for job in jobs:
        resolveEntry(config, job)
    

def resolveEntry(config, job):
    if not config.has_key(job):
        print "  - No such job: %s" % job
        sys.exit(1)

    data = config[job]
    
    if data.has_key("resolved"):
        return
    
    print "  - Processing: %s" % job

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
    
    
def execute(id, config):
    print
    print "========================================================="
    print "    EXECUTING: %s" % id
    print "========================================================="
    
    if config.has_key("buildScript"):
        generateBuildScript(config)
        
    if config.has_key("sourceScript"):
        generateSourceScript(config)
    





######################################################################
#  CORE: GENERATORS
######################################################################

def generateSourceScript(config):
    global classes
    
    print ">>> Generate source script..."




def generateBuildScript(config):
    global classes
    global modules
    
    outputFilename = config["buildScript"]
    classPaths = config["classPath"]

    print ">>> Generate build script: %s" % outputFilename

    scanClassPaths(classPaths)
    scanModules()
        
    # 1. Loading include list -> Resolving
    # 2. Removing variant code
    # 3. Reloading include list based on new trees
    # 4. Optimize variables
    # 5. Optimize strings
    # 6. Protect private members
    # 7. Compiling output
    # 8. Storing result file

    # Normalize incoming data
    if config.has_key("include"):
        include = config["include"]
    else:
        include = []
    
    if config.has_key("exclude"):   
        exclude = config["exclude"]
    else:
        exclude = []
    
    if config.has_key("require"):
        require = config["require"]
    else:
        require = {}
    
    if config.has_key("use"):
        use = config["use"]
    else:
        use = {}
        
    if config.has_key("views"):
        views = config["views"]
    else:
        views = {}
        
    if config.has_key("buildScript"):
        script = config["buildScript"]
    else:
        script = ""
        
    if config.has_key("collapseViews"):
        collapseViews = config["collapseViews"]
    else:
        collapseViews = []                 
    
    if config.has_key("optimizeLatency"):
        optimizeLatency = config["optimizeLatency"]
    else:
        optimizeLatency = None
        
            
    
    # Two alternative solutions to build the class list
    if len(views) > 0:
        processViews(views, require, use, collapseViews, optimizeLatency, script)
    else:
        processIncludeExclude(include, exclude, require, use, script)

    








######################################################################
#  CORE: CACHE SUPPORT
######################################################################

# Improved version of the one in filetool module
# TODO: Add memcache with controllable size

cachePath = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), ".cache") + os.sep
filetool.directory(cachePath)

def readCache(id, segment, dep):
    fileModTime = os.stat(dep).st_mtime

    try:
        cacheModTime = os.stat(cachePath + id + "-" + segment).st_mtime
    except OSError:
        cacheModTime = 0
        
    # Out of date check
    if fileModTime > cacheModTime:
        return None
        
    try:
        return cPickle.load(open(cachePath + id + "-" + segment, 'rb'))

    except (EOFError, cPickle.PickleError, cPickle.UnpicklingError):
        print ">>> Could not read cache from %s" % cachePath
        return None
    
    
def writeCache(id, segment, content):
    try:
        cPickle.dump(content, open(cachePath + id + "-" + segment, 'wb'), 2)

    except (EOFError, cPickle.PickleError, cPickle.PicklingError):
        print ">>> Could not store cache to %s" % cachePath
        sys.exit(1)



        
        
        
        
        
        
######################################################################
#  META DATA SUPPORT
######################################################################

def getMeta(id):
    global classes
    
    entry = classes[id]
    path = entry["path"]
    encoding = entry["encoding"]
    
    cache = readCache(id, "meta", path)
    if cache != None:
        return cache
        
    meta = {}
    category = entry["category"]

    if category == "qx.doc":
        pass
        
    elif category == "qx.locale":
        meta["loadtimeDeps"] = ["qx.locale.Locale", "qx.locale.Manager"]
        
    elif category == "qx.impl":
        content = filetool.read(path, encoding)
        
        meta["loadtimeDeps"] = _extractQxLoadtimeDeps(content, id)
        meta["runtimeDeps"] = _extractQxRuntimeDeps(content, id)
        meta["optionalDeps"] = _extractQxOptionalDeps(content)
        meta["ignoreDeps"] = _extractQxIgnoreDeps(content)

        meta["modules"] = _extractQxModules(content)
        meta["resources"] = _extractQxResources(content)
        meta["embeds"] = _extractQxEmbeds(content)    
        
    writeCache(id, "meta", meta)
    
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
#  TREE SUPPORT
######################################################################

def getTokens(id):
    global classes
    
    cache = readCache(id, "tokens", classes[id]["path"])
    if cache != None:
        return cache
    
    print "  - Generating tokens: %s" % id
    tokens = tokenizer.parseFile(classes[id]["path"], id, classes[id]["encoding"])
    
    writeCache(id, "tokens", tokens)
    return tokens
        

def getLength(id):
    return len(getTokens(id))


def getTree(id):
    global classes
    
    cache = readCache(id, "tree", classes[id]["path"])
    if cache != None:
        return cache
    
    print "  - Generating tree: %s" % id
    tree = treegenerator.createSyntaxTree(getTokens(id))
    
    writeCache(id, "tree", tree)
    return tree


def getTreeCopy(id):
    return copy.deepcopy(getTree(id))


def getVariableOptimizedTree(id):
    global classes
    
    cache = readCache(id, "tree-varopt", classes[id]["path"])
    if cache != None:
        return cache
    
    print ">>> Optimize variables: %s" % id    
    tree = getTreeCopy(id)
    counter = variableoptimizer.search(tree, [], 0, 0, "$")
    print "  - Optimized %s variables" % counter
        
    writeCache(id, "tree-varopt", tree)
    return tree    
        
        



######################################################################
#  INCLUDE/EXCLUDE SUPPORT
######################################################################

def processIncludeExclude(include, exclude, loadDeps, runDeps, script):
    print ">>> Processing include/exclude"    
    smartInclude, explicitInclude = _splitIncludeExcludeList(include)
    smartExclude, explicitExclude = _splitIncludeExcludeList(exclude)
    print "  - Including %s items smart, %s items explicit" % (len(smartInclude), len(explicitInclude))
    print "  - Excluding %s items smart, %s items explicit" % (len(smartExclude), len(explicitExclude))
    
    # Configuration feedback
    if len(exclude) > 0:
        print "  - Warning: Excludes may break code!"
        
    if len(explicitInclude) > 0:
        print "  - Warning: Explicit included classes may not work"
    
    # Resolve modules/regexps
    print ">>> Resolving modules/regexps..."
    smartInclude = resolveComplexDefs(smartInclude)
    explicitInclude = resolveComplexDefs(explicitInclude)
    smartExclude = resolveComplexDefs(smartExclude)
    explicitExclude = resolveComplexDefs(explicitExclude)
    
    # Detect dependencies
    print ">>> Resolving dependencies for smart includes/excludes..."
    result = resolveDependencies(smartInclude, smartExclude, loadDeps, runDeps)
    print "  - List contains %s classes" % len(result)
    
    # Explicit include/exclude
    print ">>> Processing explicitely configured includes/excludes..."
    for entry in explicitInclude:
        result[entry] = True

    for entry in explicitExclude:
        del result[entry]

    print "  - List contains %s classes" % len(result)
    
    # Detect optionals
    optionals = getOptionals(result)
    if len(optionals) > 0:
        print ">>> These optional classes may be useful:"
        for entry in optionals:
            print "  - %s" % entry

    # Compiling classes
    print ">>> Compiling classes..."
    compiled = compileClasses(sortClasses(result, loadDeps, runDeps))
    
    # Saving result
    print ">>> Storing result (%s KB) to %s" % ((len(compiled) / 1024), script)
    filetool.save(script, compiled)


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

def processViews(viewDefs, loadDeps, runDeps, collapseViews, optimizeLatency, outputFile):
    global classes

    
    
    # Resolving modules/regexps
    print ">>> Resolving modules/regexps..."
    viewClasses = {}
    for viewId in viewDefs:
        viewClasses[viewId] = resolveComplexDefs(viewDefs[viewId])
    
    

    # Caching dependencies of each view
    print
    print ">>> Resolving dependencies..."
    viewDeps = {}
    for viewId in viewClasses:
        # Exclude all features of other views
        # and handle dependencies the smart way =>
        # also exclude classes only needed by the
        # already excluded features
        viewExcludes = []
        for subViewId in viewClasses:
            if subViewId != viewId:
                viewExcludes.extend(viewClasses[subViewId])

        # Finally resolve the dependencies
        viewDeps[viewId] = resolveDependencies(viewClasses[viewId], viewExcludes, loadDeps, runDeps)
        print "  - View '%s' needs %s classes" % (viewId, len(viewDeps[viewId]))



    # Build bitmask ids for views
    print    
    print ">>> Assigning bits to views..."
    
    # References viewId -> bitId of that view
    viewBits = {}
    
    viewPos = 0
    for viewId in viewDefs:
        viewBit = 1<<viewPos
        print "  - View '%s' => %s" % (viewId, viewBit)
        viewBits[viewId] = viewBit
        viewPos += 1
        
        
        
    # Assign classes to packages
    print
    print ">>> Assigning classes to packages..."
    
    # References packageId -> class list
    packageClasses = {}
    
    # References packageId -> bit number e.g. 4=1, 5=2, 6=2, 7=3
    packageBitCounts = {}
    
    for classId in classes:
        packageId = 0
        bitCount = 0
        
        # Iterate through the views use needs this class
        for viewId in viewClasses:
            if classId in viewDeps[viewId]:
                packageId += viewBits[viewId]
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
        



    # Assign packages to views
    print ">>> Assigning packages to views..."
    viewPackages = {}
    
    for viewId in viewClasses:
        viewBit = viewBits[viewId]
        
        for packageId in packageClasses:
            if packageId&viewBit:
                if not viewPackages.has_key(viewId):
                    viewPackages[viewId] = []
                    
                viewPackages[viewId].append(packageId)
                
        # Be sure that the view package list is in order to the package priorit
        _sortPackageIdsByPriority(viewPackages[viewId], packageBitCounts)



                
    # User feedback
    _printViewStats(packageClasses, viewPackages)


    
    # Support for package collapsing
    # Could improve latency when initial loading an application
    # Merge all packages of a specific view into one (also supports multiple views)
    # Hint: View packages are sorted by priority, this way we can
    # easily merge all following packages with the first one, because
    # the first one is always the one with the highest priority
    if len(collapseViews) > 0:
        print ">>> Collapsing views..."
        for viewId in collapseViews:
            print "  - Collapsing view '%s'..." % viewId
            collapsePackage = viewPackages[viewId][0]
            for packageId in viewPackages[viewId][1:]:
                print "    - Merge package #%s into #%s" % (packageId, collapsePackage)
                _mergePackage(packageId, collapsePackage, viewClasses, viewPackages, packageClasses)
        
        # User feedback
        _printViewStats(packageClasses, viewPackages)
      
      
    # Support for merging small packages
    # Hint1: Based on the token length which is a bit strange but a good
    # possibility to get the not really correct filesize in an ultrafast way
    # More complex code and classes generally also have more tokens in them
    # Hint2: The first common package before the selected package between two 
    # or more views is allowed to merge with. As the package which should be merged
    # may have requirements these must be solved. The easiest way to be sure regarding
    # this issue, is to look out for another common package. The package for which we
    # are looking must have requirements in all views so these must be solved by all views
    # so there must be another common package. Hardly to describe... hope this makes some sense
    if optimizeLatency != None and optimizeLatency != 0:
        smallPackages = []
        
        # Start at the end with the priority sorted list
        sortedPackageIds = _sortPackageIdsByPriority(_dictToHumanSortedList(packageClasses), packageBitCounts)
        sortedPackageIds.reverse()
        
        print ">>> Analysing package sizes..."
        print "  - Optimize at %s tokens" % optimizeLatency
        for packageId in sortedPackageIds:
            packageLength = 0
        
            for classId in packageClasses[packageId]:
                packageLength += getLength(classId)
            
            if packageLength >= optimizeLatency:
                print "  - Package #%s has %s tokens" % (packageId, packageLength)
                continue
            else:
                print "  - Package #%s has %s tokens => trying to optimize" % (packageId, packageLength)
            
            collapsePackage = _getPreviousCommonPackage(packageId, viewPackages)
            if collapsePackage != None:
                print "    - Merge package #%s into #%s" % (packageId, collapsePackage)
                _mergePackage(packageId, collapsePackage, viewClasses, viewPackages, packageClasses)                
            else:
                print "    - Sorry no matching parent found (should normally not occour)!"
            
        # User feedback
        _printViewStats(packageClasses, viewPackages)

  

    # Compile files...
    packageLoaderContent = ""
    for packageId in packageClasses:
        packageFile = outputFile.replace(".js", "_%s.js" % packageId)
        
        print ">>> Compiling classes of package #%s..." % packageId
        sortedClasses = sortClasses(packageClasses[packageId], loadDeps, runDeps)
        compiledContent = compileClasses(sortedClasses)
        
        print "  - Storing result (%s KB) to %s" % ((len(compiledContent) / 1024), packageFile)
        filetool.save(packageFile, compiledContent)
        filetool.save(packageFile + ".index", "\n".join(sortedClasses))

        # TODO: Make prefix configurable
        prefix = "script/"
        packageLoaderContent += "document.write('<script type=\"text/javascript\" src=\"%s\"></script>');\n" % (prefix + packageFile)

    print ">>> Storing package loader..."
    filetool.save(outputFile, packageLoaderContent)
 
 
 
def _sortPackageIdsByPriority(packageIds, packageBitCount):
    def _cmpPackageIds(pkgId1, pkgId2):
        return packageBitCount[pkgId2] - packageBitCount[pkgId1]
        
    packageIds.sort(_cmpPackageIds)
    
    return packageIds
    
  
def _getPreviousCommonPackage(searchId, viewPackages):
    relevantViews = []
    relevantPackages = []
    
    for viewId in viewPackages:
        packages = viewPackages[viewId]
        if searchId in packages:
            relevantViews.append(viewId)
            relevantPackages.extend(packages[:packages.index(searchId)])

    # Should be sorted like other package lists
    # but in this case starting from the end (so not reversing)
    relevantPackages.sort()

    # Check if a package is available identical times to the number of views
    for packageId in relevantPackages:
        if relevantPackages.count(packageId) == len(relevantViews):
            return packageId
            
    return None

        
def _printViewStats(packageClasses, viewPackages):
    packageIds = _dictToHumanSortedList(packageClasses)
    
    print
    print ">>> Current package contents:"
    for packageId in packageIds:
        print "  - Package #%s contains %s classes" % (packageId, len(packageClasses[packageId]))

    print
    print ">>> Current view contents:"
    for viewId in viewPackages:
        print "  - View '%s' uses these packages: %s" % (viewId, _intListToString(viewPackages[viewId]))
        
    print
        

def _dictToHumanSortedList(input):
    output = []
    for key in input:
        output.append(key)
    output.sort()
    output.reverse()

    return output
    

def _mergePackage(replacePackage, collapsePackage, viewClasses, viewPackages, packageClasses):
    # Replace other package content
    for viewId in viewClasses:
        viewContent = viewPackages[viewId]
    
        if replacePackage in viewContent:
            # Store collapse package at the place of the old value
            viewContent[viewContent.index(replacePackage)] = collapsePackage
        
            # Remove duplicate (may be, but only one)
            if viewContent.count(collapsePackage) > 1:
                viewContent.reverse()
                viewContent.remove(collapsePackage)
                viewContent.reverse()

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

def compileClasses(classes):
    content = ""
    
    for id in classes:
        content += _compileClassHelper(getVariableOptimizedTree(id))
    
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
    
    
    
     
     
     
     
######################################################################
#  CLASS DEPENDENCY SUPPORT
######################################################################

def resolveDependencies(add, block, loadDeps, runDeps):
    result = {}
    
    for entry in add:
        _resolveDependenciesRecurser(entry, result, block, loadDeps, runDeps)
        
    return result


def _resolveDependenciesRecurser(add, result, block, loadDeps, runDeps):
    global classes
    
    # check if already in
    if result.has_key(add):
        return
    
    # add self
    result[add] = True

    # reading dependencies
    deps = getCombinedDeps(add, loadDeps, runDeps)
    
    # process lists
    for sub in deps["load"]:
        if not result.has_key(sub) and not sub in block:
            _resolveDependenciesRecurser(sub, result, block, loadDeps, runDeps)            

    for sub in deps["run"]:
        if not result.has_key(sub) and not sub in block:
            _resolveDependenciesRecurser(sub, result, block, loadDeps, runDeps)     


def getCombinedDeps(id, loadDeps, runDeps):
    # init lists
    loadFinal = []
    runFinal = []
    
    # add static dependencies
    static = getDeps(id)
    loadFinal.extend(static["load"])
    runFinal.extend(static["run"])
    
    # add dynamic dependencies
    if loadDeps.has_key(id):
        #for entry in loadDeps[id]:
        #    print "  - Adding loadtime dependency %s to %s" % (entry, id)
        
        loadFinal.extend(loadDeps[id])

    if runDeps.has_key(id):
        #for entry in runDeps[id]:
        #    print "  - Adding runtime dependency %s to %s" % (entry, id)

        runFinal.extend(runDeps[id])
    
    # return dict
    return {
        "load" : loadFinal,
        "run" : runFinal
    }
    

def getDeps(id):
    global classes
    
    cache = readCache(id, "deps", classes[id]["path"])
    if cache != None:
        return cache
    
    # Notes:
    # load time = before class = require
    # runtime = after class = use    

    print "  - Gathering dependencies: %s" % id
    load = []
    run = []
    
    # Read meta data
    meta = getMeta(id)
    metaLoad = meta["loadtimeDeps"]
    metaRun = meta["runtimeDeps"]
    metaOptional = meta["optionalDeps"]
    metaIgnore = meta["ignoreDeps"]

    # Process meta data
    load.extend(metaLoad)
    run.extend(metaRun)    

    # Read content data
    (autoLoad, autoRun) = _analyzeClassDeps(id)

    # Process content data
    if not "auto-require" in metaIgnore:
        for entry in autoLoad:
            if entry in metaOptional:
                pass
            elif entry in load:
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
                print "  - #use(%s) is auto-detected" % entry
            else:
                run.append(entry)
                    
    # Build data structure
    deps = {
        "load" : load,
        "run" : run
    }
    
    writeCache(id, "deps", deps)
    
    return deps
    
    
def _analyzeClassDeps(id):
    global classes
    
    tree = getTree(id)
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
            
def sortClasses(input, loadDeps, runDeps):
    sorted = []
    
    for entry in input:
        _sortClassesRecurser(entry, input, sorted, loadDeps, runDeps)
     
    return sorted
    
    
def _sortClassesRecurser(id, available, sorted, loadDeps, runDeps):
    global classes
    
    if id in sorted:
        return
            
    # reading dependencies
    deps = getCombinedDeps(id, loadDeps, runDeps)
    
    # process loadtime requirements
    for entry in deps["load"]:
        if entry in available and not entry in sorted:
            _sortClassesRecurser(entry, available, sorted, loadDeps, runDeps)
            
    if id in sorted:
        return
        
    # print "  - Adding: %s" % id
    sorted.append(id)

    # process runtime requirements
    for entry in deps["run"]:
        if entry in available and not entry in sorted:
            _sortClassesRecurser(entry, available, sorted, loadDeps, runDeps)

    
    


######################################################################
#  CLASS PATH SUPPORT
######################################################################

def scanModules():
    global classes
    global modules
    
    modules = {}

    print ">>> Searching for module definitions..."
    for id in classes:
        if classes[id]["category"] == "qx.impl":
            for mod in getMeta(id)["modules"]:
                if not modules.has_key(mod):
                    modules[mod] = []
                
                modules[mod].append(id)
    
    print "  - Found %s modules" % len(modules)
                

def scanClassPaths(paths):
    global classes
    classes = {}
    
    print ">>> Scanning class paths..."
    for path in paths:
        _addClassPath(path)
        
    return classes
    

def _addClassPath(classPath, encoding="utf-8"):
    global classes
        
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
                
                
    print "    - Found: %s impl, %s doc, %s locale" % (implCounter, docCounter, localeCounter)


def _extractQxClassContentId(data):
    classDefine = re.compile('qx.(Class|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)

    for item in classDefine.findall(data):
        return item[1]

    return None


def _extractQxLocaleContentId(data):
    localeDefine = re.compile('qx.locale\.Locale.define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)
    
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

