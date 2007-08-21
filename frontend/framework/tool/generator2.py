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

import sys, re, os, optparse, math, cPickle, copy

# reconfigure path to import own modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "modules"))

import config, tokenizer, tree, treegenerator, treeutil, optparseext, filetool
import compiler, variableoptimizer



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
            "include" : ["apiviewer.Application","qx.theme.ClassicRoyale"]
        },        
        
        "build-feedreader" : 
        {
            "extend" : ["build-common"],
            "buildScript" : "build-feedreader.js",
            "include" : ["feedreader.Application"]
        },        
        
        "build-app-views" : 
        {
            "extend" : ["build-common"],
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
            "extend" : ["build-common"],
            "buildScript" : "build-comp-views.js",
            "views" : 
            {
                "tree" : ["qx.ui.tree.Tree"],
                "colorselector" : ["qx.ui.component.ColorSelector"],
                "window" : ["qx.ui.window.Window"],
                "toolbar" : ["qx.ui.toolbar.ToolBar", "qx.ui.menu.Menu"]
            }
        },
        
        "build-apiviewer-views" :
        {
            "extend" : ["build-common"],
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
        collapse = config["collapseViews"]
    else:
        collapse = []                 
    
    
    # Two alternative solutions to build the class list
    if len(views) > 0:
        processViews(views, require, use, collapse, script)
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

def getTree(id):
    global classes
    
    cache = readCache(id, "tree", classes[id]["path"])
    if cache != None:
        return cache
    
    print "  - Generating tree: %s" % id
    tree = treegenerator.createSyntaxTree(tokenizer.parseFile(classes[id]["path"], id, classes[id]["encoding"]))
    
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
#  USE/SORT SUPPORT
######################################################################

def processIncludeExclude(include, exclude, loadDeps, runDeps, script):
    print ">>> Processing include/exclude"    
    smartInclude, explicitInclude = _splitIncludeExcludeList(include)
    smartExclude, explicitExclude = _splitIncludeExcludeList(exclude)
    print "  - Including %s items smart, %s items explicit" % (len(smartInclude), len(explicitInclude))
    print "  - Excluding %s items smart, %s items explicit" % (len(smartExclude), len(explicitExclude))
    
    if len(exclude) > 0:
        print "  - Warning: Excludes may break code!"
        
    if len(explicitInclude) > 0:
        print "  - Warning: Explicit included classes may not work"
    
    print ">>> Resolving modules..."
    smartInclude = resolveModules(smartInclude)
    explicitInclude = resolveModules(explicitInclude)
    smartExclude = resolveModules(smartExclude)
    explicitExclude = resolveModules(explicitExclude)
    
    # getting dictionary of files
    print ">>> Resolving dependencies for smart includes/excludes..."
    result = resolveDependencies(smartInclude, smartExclude, loadDeps, runDeps)
    print "  - List contains %s classes" % len(result)
    
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

    print ">>> Sorting classes..."
    sorted = sortClasses(result, loadDeps, runDeps) 
    
    print ">>> Compiling classes..."
    compiled = compileClasses(sorted)
    
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


def resolveModules(entries):
    global modules
    
    classes = []
    
    for id in entries:
        if id in modules:
            classes.extend(modules[id])
        else:
            classes.append(id)
    
    return classes
        

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


def getOptionals(classes):
    opt = {}
    
    for id in classes:
        for sub in getMeta(id)["optionalDeps"]:
            if not sub in classes:
                opt[sub] = True

    return opt
        
        
def compileClasses(classes):
    content = ""
    
    for id in classes:
        # print "  - %s" % id
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
#  VIEW SUPPORT
######################################################################

def processViews(views, loadDeps, runDeps, collapseViews, outputFile):
    global classes
    
    
    

    # Find all classes
    print ">>> Analysing %s views..." % len(views)
    allIncludes = []
    for id in views:
        allIncludes.extend(views[id])
    
    allClasses = resolveDependencies(allIncludes, [], loadDeps, runDeps)
    
    print "  - Using %s classes" % len(allClasses)
    
    
    # Caching dependencies of each view
    deps = {}
    for viewId in views:
        # Exclude all features of other views
        # and handle dependencies the smart way =>
        # also exclude classes only needed by the
        # already excluded features
        exclude = []
        for subViewId in views:
            if subViewId != viewId:
                exclude.extend(views[subViewId])

        # Finally resolve the dependencies
        deps[viewId] = resolveDependencies(views[viewId], exclude, loadDeps, runDeps)
        print "    - %s uses %s classes" % (viewId, len(deps[viewId]))
    
    
    # Build bitmask ids for views
    # 1,2,4,8,16,32,64,128
    bits = {}
    pos = 0
    for viewId in views:
        bits[viewId] = 1<<pos
        pos += 1
        print "  - %s has bit %s" % (viewId, bits[viewId])
    
    


   
   
    
    # TODO: Select "init" package to have init stuff in one package            

        
    # Find out usage of classes and assign them to a bitmask using map    
    packages = {}
    for classId in allClasses:
        packageId = 0
        for viewId in views:
            if classId in deps[viewId]:
                packageId += bits[viewId]
        
        if packageId == 0:
            continue
        
        if not packages.has_key(packageId):
            packages[packageId] = []
            
        packages[packageId].append(classId)
        
    

    
    # Debug package content
    print ">>> Packages:"
    for packageId in packages:
        print "  - %s contains %s classes" % (packageId, len(packages[packageId]))
    
    
    # Debug (map views to packages they need)
    viewFiles = {}
    for viewId in views:
        bitId = bits[viewId]
        content = []
        
        for num in packages:
            if num&bitId:
                content.insert(0, num)

        viewFiles[viewId] = content
  
  
    # Collapse packages...
    if len(collapseViews) > 0:
        for viewId in collapseViews:
            oldPackages = viewFiles[viewId]
            
            # TODO: Impl...
            

    # Compile files...
    revertedPackages = []
    for packageId in packages:
        revertedPackages.insert(0, packageId)
    
    packageLoaderContent = ""
    for packageId in revertedPackages:
        packageFile = outputFile.replace(".js", "_%s.js" % packageId)
        
        print ">>> Compiling classes of package %s..." % packageId
        compiledContent = compileClasses(sortClasses(packages[packageId], loadDeps, runDeps))
        
        print "  - Storing result (%s KB) to %s" % ((len(compiledContent) / 1024), packageFile)
        filetool.save(packageFile, compiledContent)

        # TODO: Make configurable
        prefix = "script/"
        packageLoaderContent += "document.write('<script type=\"text/javascript\" src=\"%s\"></script>');\n" % (prefix + packageFile)

    print ">>> Creating package loader..."
    filetool.save(outputFile, packageLoaderContent)
        


    
    

     
     
     
     
######################################################################
#  DEPENDENCY SUPPORT
######################################################################

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
    
    for path in paths:
        _addClassPath(path)
        
    return classes
    

def _addClassPath(classPath, encoding="utf-8"):
    global classes
        
    print ">>> Scanning: %s" % classPath
    
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
                        print "  - Mismatching IDs in file: %s" % filePath
                
                if fileCategory == "unknown":
                    print "  - Invalid file: %s" % filePath
                    sys.exit(1)
                
                fileId = filePathId
                    
                classes[fileId] = {
                    "path" : filePath,
                    "encoding" : encoding,
                    "classPath" : classPath,
                    "category" : fileCategory,
                    "id" : fileId,
                    "contentId" : fileContentId,
                    "pathId" : filePathId,
                    "runtimeDeps" : [],
                    "loadtimeDeps" : [],
                    "optionalDeps" : [],
                    "ignoreDeps" : []
                }
                
                
    print "  - Found: %s impl, %s doc, %s locale" % (implCounter, docCounter, localeCounter)


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

