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

import sys, re, os, optparse, math, cPickle

# reconfigure path to import own modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "modules"))

import config, tokenizer, tree, treegenerator, optparseext, filetool



######################################################################
#  MAIN CONTENT
######################################################################

def main():
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
    
    config = {
        "common" : 
        {
            "classPath" : [ "framework/source/class", "application/apiviewer/source/class" ]
        },
      
        "source" : 
        {
            "include" : ["common"],
            "sourceScript" : "source.js"
        },
      
        "build" : 
        {
            "include" : ["common"],
            "optimizeVariables" : True,
            "buildScript" : "build.js",
            "use" : ["apiviewer.Application"],
            "ignore" : ["tree"]
        },
        
        "views" : 
        {
            "include" : ["common"],
            "optimizeVariables" : True,
            "buildScript" : "build.js",
            "views" : {
                "frame" : ["apiviewer.Application"],
                "panels" : ["apiviewer.ui.panels.*"]
            }
        },        
        
        "unused" :
        {
            "include" : ["source"]
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
        return

    data = config[job]
    
    if data.has_key("resolved"):
        return
    
    print "  - Processing: %s" % job

    if data.has_key("include"):
        includes = data["include"]
        
        for entry in includes:
            resolveEntry(config, entry)
            mergeEntry(config[job], config[entry])
    
    data["resolved"] = True
    

def mergeEntry(target, source):
    for key in source:
        if not target.has_key(key):
            target[key] = source[key] 
    
    
def execute(id, config):
    print ">>> Executing job: %s" % id
    
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
    
    outputFilename = config["buildScript"]
    classPaths = config["classPath"]

    print ">>> Generate build script: %s" % outputFilename
    print "  - Class Paths: %s" % ", ".join(classPaths)

    scanClassPaths(classPaths)
    
    # 1. Loading include list -> Resolving
    # 2. Removing variant code
    # 3. Reloading include list based on new trees
    # 4. Optimize variables
    # 5. Optimize strings
    # 6. Protect private members
    # 7. Compiling output
    # 8. Storing result file
    
    if config.has_key("use"):
        use = config["use"]
        processUse(use)
        
    if config.has_key("views"):
        views = config["views"]
        processViews(views)









######################################################################
#  CORE: CACHE SUPPORT
######################################################################

# Improved version of the one in filetool module

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




        
        



######################################################################
#  USE SUPPORT
######################################################################

def processUse(input):
    output = {}
    
    print ">>> Analysing USE list..."
    
    for entry in input:
        print "  - Processing: %s" % entry
        _useRecurser(entry, output)
        
    print ">>> Use %s classes" % len(output)


def _useRecurser(id, use):
    global classes
    
    if use.has_key(id):
        return
    
    use[id] = True
    deps = getDeps(id)
    
    for entry in deps["load"]:
        if not use.has_key(entry):
            _useRecurser(entry, use)
        
    for entry in deps["run"]:
        if not use.has_key(entry):
            _useRecurser(entry, use)
            
     





######################################################################
#  VIEW SUPPORT
######################################################################

def processViews(classes, views):
    print ">>> Analysing %s views..." % len(views)
    
    
    
    
     
     
     
     
######################################################################
#  DEPENDENCY SUPPORT
######################################################################

def getDeps(id):
    global classes
    
    cache = readCache(id, "deps", classes[id]["path"])
    if cache != None:
        return cache
    
    print "  - Gathering dependencies: %s" % id
    (load, run) = _analyzeClassDeps(id)
    meta = getMeta(id)
    
    load.extend(meta["loadtimeDeps"])
    run.extend(meta["runtimeDeps"])
    
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

    elif node.type == "body" and node.parent.type == "function":
        inFunction = True

    if node.hasChildren():
        for child in node.children:
            _analyzeClassDepsNode(id, child, loadtime, runtime, inFunction)





    
    


######################################################################
#  CLASS PATH SUPPORT
######################################################################

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

