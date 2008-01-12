#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
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

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  module.py -- module short description
#
# SYNTAX
#  module.py --help
#
#  or
#
#  import module
#  result = module.func()
#
# DESCRIPTION
#  The module module does blah.
#
# CAVEATS
#
# KNOWN ISSUES
#  There are no known issues.
#</pre>
##

import sys, string, re, os, random, cPickle, codecs
import config, tokenizer, treegenerator, filetool, stringoptimizer, textutil
import treeutil

internalModTime = 0


##
# Some nice short description of foo(); this can contain html and
# {@link #foo Links} to items in the current file.
#
# @param     a        Describe a positional parameter
# @keyparam  b        Describe a keyword parameter
# @def       foo(name)    # overwrites auto-generated function signature
# @param     name     Describe aliased parameter
# @return             Description of the things returned
# @defreturn          The return type
# @exception IOError  The error it throws
#
def validateFiles():

    global internalModTime

    base = os.path.dirname(os.path.abspath(sys.argv[0]))
    if base.endswith("modules"):
        path = base
    else:
        path = os.path.join(base, "modules")

    maxFileModTime = os.stat(os.path.join(path, ".." + os.path.sep + "generator.py")).st_mtime

    for root, dirs, files in os.walk(path):

        # Filter ignored directories
        for ignoredDir in config.DIRIGNORE:
            if ignoredDir in dirs:
                dirs.remove(ignoredDir)

        # Searching for files
        for fileName in files:
            if os.path.splitext(fileName)[1] != config.PYEXT:
                continue

            filePath = os.path.join(root, fileName)
            fileModTime = os.stat(filePath).st_mtime

            if fileModTime > maxFileModTime:
                maxFileModTime = fileModTime


    internalModTime = maxFileModTime



def getInternalModTime(options):

    global internalModTime

    if internalModTime == 0 and not options.disableInternalCheck:
        validateFiles()

    return internalModTime







def extractFileContentId(data, fileId=""):
    # 0.6 class style
    for item in config.QXHEAD["defineClass"].findall(data):
        return item[0]

    # 0.7 class style
    for item in config.QXHEAD["classDefine"].findall(data):
        return item[1]

    return None


def extractLoadtimeDeps(data, fileId=""):
    deps = []

    for item in config.QXHEAD["require"].findall(data):
        if item == fileId:
            print "    - Error: Self-referring load dependency: %s" % item
            sys.exit(1)
        else:
            deps.append(item)

    return deps


def extractRuntimeDeps(data, fileId=""):
    deps = []

    for item in config.QXHEAD["use"].findall(data):
        if item == fileId:
            print "    - Self-referring runtime dependency: %s" % item
        else:
            deps.append(item)

    return deps


def extractOptional(data, fileId=""):
    deps = []

    # Adding explicit requirements
    for item in config.QXHEAD["optional"].findall(data):
        if not item in deps:
            deps.append(item)

    return deps


def extractIgnore(data, fileId=""):
    ignores = []

    # Adding explicit requirements
    for item in config.QXHEAD["ignore"].findall(data):
        if not item in ignores:
            ignores.append(item)

    return ignores


def extractModules(data, fileId=""):
    mods = []

    for item in config.QXHEAD["module"].findall(data):
        if not item in mods:
            mods.append(item)

    return mods


def extractResources(data, fileId=""):
    res = []

    for item in config.QXHEAD["resource"].findall(data):
        res.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

    return res


def extractEmbeds(data, fileId=""):
    emb = []

    for item in config.QXHEAD["embed"].findall(data):
        emb.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

    return emb









def getTokens(fileDb, fileId, options):
    if not fileDb[fileId].has_key("tokens"):
        if options.verbose:
            print "    - Generating tokens for %s..." % fileId

        useCache = False
        loadCache = False

        fileEntry = fileDb[fileId]

        filePath = fileEntry["path"]
        fileEncoding = fileEntry["encoding"]

        if options.cacheDirectory != None:
            cachePath = os.path.join(filetool.normalize(options.cacheDirectory), fileId + "-tokens.pcl")
            useCache = True

            if not filetool.checkCache(filePath, cachePath, getInternalModTime(options)):
                loadCache = True

        if loadCache:
            tokens = filetool.readCache(cachePath)
        else:
            fileContent = filetool.read(filePath, fileEncoding)

            # TODO: This hack is neccesary because the current parser cannot handle comments
            #       without a context.
            if fileDb[fileId]["meta"]:
                fileContent += "\n(function() {})()"

            tokens = tokenizer.parseStream(fileContent, fileId)

            if useCache:
                if options.verbose:
                    print "    - Caching tokens for %s..." % fileId

                filetool.storeCache(cachePath, tokens)

        fileDb[fileId]["tokens"] = tokens

    return fileDb[fileId]["tokens"]




def getTree(fileDb, fileId, options):
    if not fileDb[fileId].has_key("tree"):
        if options.verbose:
            print "    - Generating tree for %s..." % fileId

        useCache = False
        loadCache = False

        fileEntry = fileDb[fileId]
        filePath = fileEntry["path"]

        if options.cacheDirectory != None:
            cachePath = os.path.join(filetool.normalize(options.cacheDirectory), fileId + "-tree.pcl")
            useCache = True

            if not filetool.checkCache(filePath, cachePath, getInternalModTime(options)):
                loadCache = True

        if loadCache:
            tree = filetool.readCache(cachePath)
        else:
            tree = treegenerator.createSyntaxTree(getTokens(fileDb, fileId, options))

            if useCache:
                if options.verbose:
                    print "    - Caching tree for %s..." % fileId

                filetool.storeCache(cachePath, tree)

        fileDb[fileId]["tree"] = tree

    return fileDb[fileId]["tree"]










def detectDeps(node, optionalDeps, loadtimeDeps, runtimeDeps, fileId, fileDb, inFunction):
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

                    if assembled != fileId and fileDb.has_key(assembled) and not assembled in optionalDeps:
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

                # treat dependencies in defer as requires
                if assembled == "qx.Class.define":
                    if node.parent.type == "operand" and node.parent.parent.type == "call":
                        deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
                        if deferNode != None:
                            detectDeps(deferNode, optionalDeps, loadtimeDeps, runtimeDeps, fileId, fileDb, False)


    elif node.type == "body" and node.parent.type == "function":
        inFunction = True

    if node.hasChildren():
        for child in node.children:
            detectDeps(child, optionalDeps, loadtimeDeps, runtimeDeps, fileId, fileDb, inFunction)


def resolveAutoDeps(fileDb, options):

    if options.verbose:
        print "  * Resolving dependencies..."
    else:
        print "  * Resolving dependencies: ",

    for fileId in fileDb:
        if not options.verbose:
            sys.stdout.write(".")
            sys.stdout.flush()

        # Cache entry
        fileEntry = fileDb[fileId]

        # Ignore already complete ones
        if fileEntry["autoDependencies"] == True:
            continue

        # Creating empty lists
        loadtimeDeps = []
        runtimeDeps = []

        # Detecting auto dependencies
        detectDeps(getTree(fileDb, fileId, options), fileEntry["optionalDeps"], loadtimeDeps, runtimeDeps, fileId, fileDb, False)

        # Handle ignore configuration
        if "auto-require" in fileEntry["ignoreDeps"]:
            loadtimeDeps = []

        if "auto-use" in fileEntry["ignoreDeps"]:
            runtimeDeps = []

        # Detecting doubles in loadtime data
        for dep in fileEntry["loadtimeDeps"]:
            if dep in loadtimeDeps:
                if not options.verbose:
                    print

                print "    - Please remove #require(%s) from the class %s as this was already auto-detected." % (dep, fileId)
            else:
                if dep in runtimeDeps:
                    if options.verbose:
                        print "    - Move #use(%s) to #require(%s) following user hint in %s" % (dep, dep, fileId)
                    runtimeDeps.remove(dep)

                if options.verbose:
                    print "    - Following user hint, adding #require(%s) into class %s" % (dep, fileId)

                loadtimeDeps.append(dep)

        # Detecting doubles in runtime data
        for dep in fileEntry["runtimeDeps"]:
            if dep in runtimeDeps:
                if not options.verbose:
                    print

                print "    - Please remove #use(%s) from the class %s as this was already auto-detected." % (dep, fileId)
            elif dep in loadtimeDeps:
                if not options.verbose:
                    print

                print "    - Please remove #require(%s) from the class %s as this was already auto-detected as loadtime dependency." % (dep, fileId)
            else:
                if options.verbose:
                    print "    - Following user hint, adding #use(%s) into class %s" % (dep, fileId)

                runtimeDeps.append(dep)

        # Removing runtime entries which are already in loadtime table
        for dep in loadtimeDeps:
            if dep in runtimeDeps:
                if options.verbose:
                    print "    - Removing runtime %s which is already defined in loadtime table." % dep

                runtimeDeps.remove(dep)

        # Store new tables
        fileEntry["loadtimeDeps"] = loadtimeDeps
        fileEntry["runtimeDeps"] = runtimeDeps

        # Store flag to omit it the next run
        fileEntry["autoDependencies"] = True

    if not options.verbose:
        print









def storeEntryCache(fileDb, options):
    cacheCounter = 0
    ignoreDbEntries = ["tokens", "tree", "path", "pathId", "encoding", "resourceInput", "resourceOutput", "listIndex", "classPath", "classUri"]

    for fileId in fileDb:
        fileEntry = fileDb[fileId]

        if fileEntry["cached"] == True:
            continue

        # Store flag
        fileEntry["cached"] = True

        # Copy entries
        fileEntryCopy = {}
        for key in fileEntry:
            if not key in ignoreDbEntries:
                fileEntryCopy[key] = fileEntry[key]

        filetool.storeCache(fileEntry["cachePath"], fileEntryCopy)
        cacheCounter += 1

    if cacheCounter == 0:
        print "  * No classes were modified"
    else:
        print "  * %s classes were modified" % cacheCounter


def indexFile(filePath, filePathId, classPath, listIndex, classEncoding, classUri, resourceInput, resourceOutput, options, fileDb={}, moduleDb={}):

    ########################################
    # Checking cache
    ########################################

    useCache = False
    loadCache = False
    cachePath = None

    if options.cacheDirectory != None:
        cachePath = os.path.join(filetool.normalize(options.cacheDirectory), filePathId + "-entry.pcl")
        useCache = True

        if not filetool.checkCache(filePath, cachePath, getInternalModTime(options)):
            loadCache = True



    ########################################
    # Loading file content / cache
    ########################################

    if loadCache:
        fileEntry = filetool.readCache(cachePath)
        fileId = filePathId

    else:
        fileContent = filetool.read(filePath, classEncoding)

        # Extract ID
        fileContentId = extractFileContentId(fileContent)

        # Search for valid ID
        if fileContentId == None:
            if not filePathId.endswith("__init__"):
                print "    - Could not extract ID from file: %s. Fallback to path %s!" % (filePath, filePathId)
            fileId = filePathId

        else:
            fileId = fileContentId

        if fileId != filePathId:
            print "    - ID mismatch: CONTENT=%s != PATH=%s" % (fileContentId, filePathId)
            sys.exit(1)

        fileEntry = {
            "autoDependencies" : False,
            "cached" : False,
            "cachePath" : cachePath,
            "meta" : fileId.endswith("__init__"),
            "ignoreDeps" : extractIgnore(fileContent, fileId),
            "optionalDeps" : extractOptional(fileContent, fileId),
            "loadtimeDeps" : extractLoadtimeDeps(fileContent, fileId),
            "runtimeDeps" : extractRuntimeDeps(fileContent, fileId),
            "resources" : extractResources(fileContent, fileId),
            "embeds" : extractEmbeds(fileContent, fileId),
            "modules" : extractModules(fileContent, fileId)
        }



    ########################################
    # Additional data
    ########################################

    # We don't want to cache these items
    fileEntry["path"] = filePath
    fileEntry["pathId"] = filePathId
    fileEntry["encoding"] = classEncoding
    fileEntry["resourceInput"] = resourceInput
    fileEntry["resourceOutput"] = resourceOutput
    fileEntry["classUri"] = classUri
    fileEntry["listIndex"] = listIndex
    fileEntry["classPath"] = classPath


    ########################################
    # Registering file
    ########################################

    # Register to file database
    fileDb[fileId] = fileEntry

    # Register to module database
    for moduleId in fileEntry["modules"]:
        if moduleDb.has_key(moduleId):
            moduleDb[moduleId].append(fileId)
        else:
            moduleDb[moduleId] = [fileId]


def indexClassPath(classPath, listIndex, options, fileDb={}, moduleDb={}):
    classPath = filetool.normalize(classPath)
    counter = 0

    # Search for other indexed lists
    if len(options.classEncoding) > listIndex:
        classEncoding = options.classEncoding[listIndex]
    else:
        classEncoding = "utf-8"

    if len(options.classUri) > listIndex:
        classUri = options.classUri[listIndex]
    else:
        classUri = None

    if len(options.resourceInput) > listIndex:
        resourceInput = options.resourceInput[listIndex]
    else:
        resourceInput = None

    if len(options.resourceOutput) > listIndex:
        resourceOutput = options.resourceOutput[listIndex]
    else:
        resourceOutput = None

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

                indexFile(filePath, filePathId, classPath, listIndex, classEncoding, classUri, resourceInput, resourceOutput, options, fileDb, moduleDb)
                counter += 1

    return counter


def indexAll(options):
    if options.cacheDirectory != None:
        filetool.directory(options.cacheDirectory)

    print "  * Indexing class paths... "

    fileDb = {}
    moduleDb = {}
    listIndex = 0

    for classPath in options.classPath:
        print "    - Indexing: %s" % classPath
        counter = indexClassPath(classPath, listIndex, options, fileDb, moduleDb)
        print "      - %s classes were found" % counter
        listIndex += 1

    # Resolving auto-deps
    resolveAutoDeps(fileDb, options)

    if options.cacheDirectory != None:
        storeEntryCache(fileDb, options)

    return fileDb, moduleDb











def addClass(fileDb, fileId, content, dynLoad, dynRun):
    if not fileDb.has_key(fileId):
        print '    - Error: Could not find class "%s" (%s)' % (fileId, len(fileDb))
        return False

    fileEntry = fileDb[fileId]

    # Concat static and dynamic deps
    loadDeps = fileEntry["loadtimeDeps"]
    if dynLoad.has_key(fileId):
        loadDeps += dynLoad[fileId]

    runDeps = fileEntry["runtimeDeps"]
    if dynRun.has_key(fileId):
        runDeps += dynRun[fileId]

    # Including myself
    if not fileId in content:
        content.append(fileId)

    # Including loadtime dependencies
    for depId in loadDeps:
        if not depId in content:
            addClass(fileDb, depId, content, dynLoad, dynRun)

    # Including runtime dependencies
    for depId in runDeps:
        if not depId in content:
            addClass(fileDb, depId, content, dynLoad, dynRun)


def sortClass(fileDb, fileId, avail, result, verbose, dynLoad, dynRun):
    if fileId in result or not fileId in avail:
        return

    fileEntry = fileDb[fileId]

    if verbose:
        print "    - Trying to include: %s" % fileId

    # Concat static and dynamic deps
    loadDeps = fileEntry["loadtimeDeps"]
    if dynLoad.has_key(fileId):
        loadDeps += dynLoad[fileId]

    runDeps = fileEntry["runtimeDeps"]
    if dynRun.has_key(fileId):
        runDeps += dynRun[fileId]

    # Priorize loadtime dependencies
    for depId in loadDeps:
        if not depId in result and depId in avail:
            sortClass(fileDb, depId, avail, result, verbose, dynLoad, dynRun)

    # Insert myself
    if not fileId in result:
        if verbose:
            print "      - Including %s" % fileId

        result.append(fileId)

    # Finally load other used classes
    for depId in runDeps:
        if not depId in result and depId in avail:
            sortClass(fileDb, depId, avail, result, verbose, dynLoad, dynRun)





def getSortedList(options, fileDb, moduleDb):

    print "  * Processing %s classes" % len(fileDb)
    print "  * Processing %s modules" % len(moduleDb)

    if options.verbose:
        print "  * Configuration:"
        print "    - Include with dependencies: %s" % ", ".join(options.include)
        print "    - Include without dependencies: %s" % ", ".join(options.includePure)
        print "    - Exclude with dependencies: %s" % ", ".join(options.exclude)
        print "    - Exclude without dependencies: %s" % ", ".join(options.excludePure)




    print "  * Processing dynamic dependencies..."

    dynLoad = {}
    for pair in options.addRequire:
        class1 = pair.split(":")[0]
        class2 = pair.split(":")[1]

        if not class1 in fileDb or not class2 in fileDb:
            print "    - Invalid runtime dependency definition: %s" % pair
            continue

        if not class2 in fileDb[class1]["loadtimeDeps"]:
            print "    - Adding #require(%s) to %s" % (class2, class1)
            if dynLoad.has_key(class1):
                dynLoad[class1].append(class2)
            else:
                dynLoad[class1] = [class2]

    dynRun = {}
    for pair in options.addUse:
        class1 = pair.split(":")[0]
        class2 = pair.split(":")[1]

        if not class1 in fileDb or not class2 in fileDb:
            print "    - Invalid loadtime dependency definition: %s" % pair
            continue

            if not class2 in fileDb[class1]["runtimeDeps"]:
                print "    - Adding #use(%s) to %s" % (class2, class1)
                if dynRun.has_key(class1):
                    dynRun[class1].append(class2)
                else:
                    dynRun[class1] = [class2]



    print "  * Preparing lists..."

    # PROCESS INCLUDES

    # Include modules and classes with dependencies
    include = []
    if options.include:
        for entry in options.include:
            if moduleDb.has_key(entry):
                include.extend(moduleDb[entry])

            else:
                regexp = textutil.toRegExp(entry)

                for fileId in fileDb:
                    if regexp.search(fileId):
                        if not fileId in include:
                            include.append(fileId)

    # Include modules and classes without dependencies
    includePure = []
    if options.includePure:
        for entry in options.includePure:
            if moduleDb.has_key(entry):
                includePure.extend(moduleDb[entry])

            else:
                regexp = textutil.toRegExp(entry)

                for fileId in fileDb:
                    if regexp.search(fileId):
                        if not fileId in includePure:
                            includePure.append(fileId)

    # Fill combined include list
    includeCombined = []
    for fileId in include:
        addClass(fileDb, fileId, includeCombined, dynLoad, dynRun)

    for fileId in includePure:
        if not fileId in includeCombined:
            includeCombined.append(fileId)

    # Default include handling/check
    if len(options.include) == 0 and len(options.includePure) == 0:
        includeCombined = fileDb.keys()

    if len(includeCombined) == 0:
        print "    - Could not find any classes to include. Maybe malformed parameter set!"
        # sys.exit(1)





    # PROCESS EXCLUDES

    # Exclude Modules and Files with dependencies
    exclude = []
    if options.exclude:
        for entry in options.exclude:
            if moduleDb.has_key(entry):
                exclude.extend(moduleDb[entry])

            else:
                regexp = textutil.toRegExp(entry)

                for fileId in fileDb:
                    if regexp.search(fileId):
                        if not fileId in exclude:
                            exclude.append(fileId)

    # Exclude Modules and Files without dependencies
    excludePure = []
    if options.excludePure:
        for entry in options.excludePure:
            if moduleDb.has_key(entry):
                excludePure.extend(moduleDb[entry])

            else:
                regexp = textutil.toRegExp(entry)

                for fileId in fileDb:
                    if regexp.search(fileId):
                        if not fileId in exclude:
                            excludePure.append(fileId)

    # Fill combined exclude list
    excludeCombined = []
    for fileId in exclude:
        addClass(fileDb, fileId, excludeCombined, dynLoad, dynRun)

    for fileId in excludePure:
        if not fileId in excludeCombined:
            excludeCombined.append(fileId)




    # User feedback
    print "    - Include list contains %s classes" % len(includeCombined)
    print "    - Exclude list contains %s classes" % len(excludeCombined)




    # MERGE LISTS
    # Remove excluded files from included files list

    if len(excludeCombined) > 0:
        print "  * Filtering excludes..."

        for fileId in excludeCombined:
            if fileId in includeCombined:
                includeCombined.remove(fileId)



    #
    # SORTING
    #

    print "  * Sorting %s classes..." % len(includeCombined)

    result = []
    for fileId in includeCombined:
        sortClass(fileDb, fileId, includeCombined, result, options.verbose, dynLoad, dynRun)



    #
    # EXCLUDED HINTS
    #
    excludedLoadtimeHints = []
    for fileId in result:
        fileEntry = fileDb[fileId]
        for depId in fileEntry["loadtimeDeps"]:
            if not depId in result and not depId in excludedLoadtimeHints:
                excludedLoadtimeHints.append(depId)

    excludedRuntimeHints = []
    for fileId in result:
        fileEntry = fileDb[fileId]
        for depId in fileEntry["runtimeDeps"]:
            if not depId in result and not depId in excludedRuntimeHints and not depId in excludedLoadtimeHints:
                excludedRuntimeHints.append(depId)

    if len(excludedLoadtimeHints) == 0 and len(excludedRuntimeHints) == 0:
        print "  * This package should work standalone"
    else:
        print "  * This package does not work standalone"

        if len(excludedLoadtimeHints) > 0:
            print "    - The following classes are missing at loadtime:"
            for depId in excludedLoadtimeHints:
                print "      - %s" % depId

        if len(excludedRuntimeHints) > 0:
            print "    - The following classes are missing at runtime:"
            for depId in excludedRuntimeHints:
                print "      - %s" % depId



    #
    # OPTIONAL HINTS
    #
    optionalHints = []

    for fileId in result:
        fileEntry = fileDb[fileId]
        for depId in fileEntry["optionalDeps"]:
            if not depId in result and not depId in optionalHints:
                optionalHints.append(depId)

    if len(optionalHints) > 0:
        print "  * The following add-on classes may be useful:"
        for depId in optionalHints:
            print "    - %s" % depId



    #
    # DONE
    #
    return result
