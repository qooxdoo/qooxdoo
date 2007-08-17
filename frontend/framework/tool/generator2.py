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

import sys, re, os, optparse, math

# reconfigure path to import own modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "modules"))

import config, tokenizer, tree, treegenerator, optparseext, loader, filetool



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
            "useClass" : "apiviewer.Application"
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
#  GENERATORS
######################################################################

def generateSourceScript(config):
    print ">>> Generate source script..."

def generateBuildScript(config):
    outputFilename = config["buildScript"]
    classPaths = config["classPath"]

    
    print ">>> Generate build script: %s" % outputFilename
    print "  - Class Paths: %s" % ", ".join(classPaths)
    
    # 1. Loading include list -> Resolving
    # 2. Removing variant code
    # 3. Reloading include list based on new trees
    # 4. Optimize variables
    # 5. Optimize strings
    # 6. Protect private members
    # 7. Compiling output
    # 8. Storing result file
    
    classes = analyzeClassesBasic(scanClassPaths(classPaths))
    
    analyzeDependencies(classes)
    
    if config.has_key("views"):
        views = config["views"]
        analyzeViews(views, classes)







######################################################################
#  CACHE SUPPORT
######################################################################

def readCache(id, segment, dep):
    cachePath = "/tmp/qxcache/" + id + "-" + segment
        
    # TODO: Internal time
    if not filetool.checkCache(dep, cachePath, 0):
        return filetool.readCache(cachePath)
        
    return None
    
    
def writeCache(id, segment, content):
    cachePath = "/tmp/qxcache/" + id + "-" + segment
    
    filetool.directory("/tmp/qxcache")
    filetool.storeCache(cachePath, content)






######################################################################
#  CLASS ANALYSIS
######################################################################

def analyzeClassesBasic(classes):
    print ">>> Basic analysis of %s classes..." % len(classes)
    
    for fileId in classes:        
        entry = classes[fileId]        

        # Check cache availability
        cache = readCache(fileId, "basic", entry["path"])
        
        if cache != None:
            classes[fileId] = cache
            continue
        
        # Invalid cache => reevaluate         
        # Category specific processing
        category = entry["category"]

        if category == "qx.doc":
            pass
            
        elif category == "qx.locale":
            entry["loadtimeDeps"] = ["qx.locale.Locale", "qx.locale.Manager"]
            
        elif category == "qx.impl":
            content = filetool.read(entry["path"], entry["encoding"])
            
            entry["loadtimeDeps"] = extractQxLoadtimeDeps(content, fileId)
            entry["runtimeDeps"] = extractQxRuntimeDeps(content, fileId)
            entry["optionalDeps"] = extractQxOptionalDeps(content)
            entry["ignoreDeps"] = extractQxIgnoreDeps(content)

            entry["modules"] = extractQxModules(content)
            entry["resources"] = extractQxResources(content)
            entry["embeds"] = extractQxEmbeds(content)
            
        # Store cache
        writeCache(fileId, "basic", entry)
        
    return classes
        



def getTree(fileId, filePath, fileEncoding="utf-8"):
    cache = readCache(fileId, "tree", filePath)
    
    if cache != None:
        return cache
    
    print "  - Generating tree: %s" % fileId
    tree = treegenerator.createSyntaxTree(tokenizer.parseFile(filePath, fileId, fileEncoding))
    
    writeCache(fileId, "tree", tree)
    return tree


def analyzeDependencies(classes):
    print ">>> Analysing dependencies..."
    
    for fileId in classes:
        entry = classes[fileId]
        analyzeClassDeps(fileId, entry["path"], classes)
        

def analyzeClassDeps(fileId, filePath, classes):
    loadtimeDeps = []
    runtimeDeps = []
    
    analyzeClassDepsNode(getTree(fileId, filePath), loadtimeDeps, runtimeDeps, fileId, classes, False)
    
    


def analyzeClassDepsNode(node, loadtimeDeps, runtimeDeps, fileId, fileDb, inFunction):
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

                    if assembled != fileId and fileDb.has_key(assembled):
                        if inFunction:
                            targetDeps = runtimeDeps
                        else:
                            targetDeps = loadtimeDeps

                        if assembled in targetDeps:
                            return

                        targetDeps.append(assembled)

                else:
                    assembled = ""
                    break

    elif node.type == "body" and node.parent.type == "function":
        inFunction = True

    if node.hasChildren():
        for child in node.children:
            analyzeClassDepsNode(child, loadtimeDeps, runtimeDeps, fileId, fileDb, inFunction)





        




######################################################################
#  VIEW SUPPORT
######################################################################

def analyzeViews(views, classes):
    print ">>> Analysing %s views..." % len(views)
    
    
    
    


######################################################################
#  CLASS FILE IO
######################################################################

def scanClassPaths(paths):
    classes = {}
    
    for path in paths:
        scanClassPath(path, classes)
        
    return classes
    

def scanClassPath(classPath, classes, encoding="utf-8"):
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
                    fileContentId = extractQxClassContentId(fileContent)
                    
                    if fileContentId == None:
                        fileContentId = extractQxLocaleContentId(fileContent)
                        
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
                    "contentId" : fileContentId,
                    "pathId" : filePathId,
                    "runtimeDeps" : [],
                    "loadtimeDeps" : [],
                    "optionalDeps" : [],
                    "ignoreDeps" : []
                }
                
                
    print "  - Found these files: %s impl, %s doc, %s locale" % (implCounter, docCounter, localeCounter)






######################################################################
#  FILE CONTENT PROCESSING
######################################################################

def extractQxClassContentId(data):
    classDefine = re.compile('qx.(Class|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)

    for item in classDefine.findall(data):
        return item[1]

    return None


def extractQxLocaleContentId(data):
    localeDefine = re.compile('qx.locale\.Locale.define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)
    
    for item in localeDefine.findall(data):
        return item

    return None


def extractQxLoadtimeDeps(data, fileId=""):
    deps = []

    for item in config.QXHEAD["require"].findall(data):
        if item == fileId:
            print "    - Error: Self-referring load dependency: %s" % item
            sys.exit(1)
        else:
            deps.append(item)

    return deps


def extractQxRuntimeDeps(data, fileId=""):
    deps = []

    for item in config.QXHEAD["use"].findall(data):
        if item == fileId:
            print "    - Self-referring runtime dependency: %s" % item
        else:
            deps.append(item)

    return deps


def extractQxOptionalDeps(data):
    deps = []

    # Adding explicit requirements
    for item in config.QXHEAD["optional"].findall(data):
        if not item in deps:
            deps.append(item)

    return deps


def extractQxIgnoreDeps(data):
    ignores = []

    # Adding explicit requirements
    for item in config.QXHEAD["ignore"].findall(data):
        if not item in ignores:
            ignores.append(item)

    return ignores


def extractQxModules(data):
    mods = []

    for item in config.QXHEAD["module"].findall(data):
        if not item in mods:
            mods.append(item)

    return mods


def extractQxResources(data):
    res = []

    for item in config.QXHEAD["resource"].findall(data):
        res.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

    return res


def extractQxEmbeds(data):
    emb = []

    for item in config.QXHEAD["embed"].findall(data):
        emb.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

    return emb

    
    
    
    
    
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

