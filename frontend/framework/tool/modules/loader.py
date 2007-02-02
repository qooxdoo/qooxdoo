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

import sys, string, re, os, random, cPickle, codecs
import config, tokenizer, treegenerator, filetool, stringoptimizer, textutil

internalModTime = 0


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


def extractModules(data, fileId=""):
  mods = []

  for item in config.QXHEAD["module"].findall(data):
    if not item in mods:
      mods.append(item)

  return mods


def extractResources(data, fileId=""):
  res = []

  for item in config.QXHEAD["resource"].findall(data):
    res.append({ "namespace" : fileId[0:fileId.find(".")], "id" : item[0], "entry" : item[1] })

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





def getStrings(fileDb, fileId, options):
  if not fileDb[fileId].has_key("strings"):
    if options.verbose:
      print "    - Searching for strings in %s..." % fileId

    useCache = False
    loadCache = False

    fileEntry = fileDb[fileId]
    filePath = fileEntry["path"]

    if options.cacheDirectory != None:
      cachePath = os.path.join(filetool.normalize(options.cacheDirectory), fileId + "-strings.pcl")
      useCache = True

      if not filetool.checkCache(filePath, cachePath, getInternalModTime(options)):
        loadCache = True

    if loadCache:
      strings = filetool.readCache(cachePath)
    else:
      strings = stringoptimizer.search(getTree(fileDb, fileId, options), options.verbose)

      if useCache:
        if options.verbose:
          print "    - Caching strings for %s..." % fileId

        filetool.storeCache(cachePath, strings)

    fileDb[fileId]["strings"] = strings

  return fileDb[fileId]["strings"]









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
              deps = runtimeDeps
            else:
              deps = loadtimeDeps

            if assembled in deps:
              return

            deps.append(assembled)

        else:
          assembled = ""
          break

  elif node.type == "constant" and node.get("constantType") == "string":
    value = "%s" % node.get("value")

    if value != fileId and fileDb.has_key(value) and not value in optionalDeps and not value in runtimeDeps:
      runtimeDeps.append(value)

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
    if fileEntry["autoDeps"] == True:
      continue

    # Creating empty lists
    loadtimeDeps = []
    runtimeDeps = []

    # Detecting auto dependencies
    detectDeps(getTree(fileDb, fileId, options), fileEntry["optionalDeps"], loadtimeDeps, runtimeDeps, fileId, fileDb, False)

    # Detecting doubles
    for dep in fileEntry["loadtimeDeps"]:
      if dep in loadtimeDeps:
        if not options.verbose:
          print

        print "    - Please remove #require(%s) from the class %s as this was already auto-detected." % (dep, fileId)
      else:
        loadtimeDeps.append(dep)

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
    fileEntry["autoDeps"] = True

  if not options.verbose:
    print









def storeEntryCache(fileDb, options):
  cacheCounter = 0
  ignoreDbEntries = [ "tokens", "tree", "path", "pathId", "encoding", "resourceInput", "resourceOutput", "listIndex", "classPath", "classUri" ]

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
      print "    - Could not extract ID from file: %s. Fallback to path %s!" % (filePath, filePathId)
      fileId = filePathId

    else:
      fileId = fileContentId

    if fileId != filePathId:
      print "    - ID mismatch: CONTENT=%s != PATH=%s" % (fileContentId, filePathId)
      sys.exit(1)

    fileEntry = {
      "autoDeps" : False,
      "cached" : False,
      "cachePath" : cachePath,
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
      moduleDb[moduleId] = [ fileId ]


def indexSingleScriptInput(classPath, listIndex, options, fileDb={}, moduleDb={}):
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
      if os.path.splitext(fileName)[1] == config.JSEXT:
        filePath = os.path.join(root, fileName)
        filePathId = filePath.replace(classPath + os.sep, "").replace(config.JSEXT, "").replace(os.sep, ".")

        indexFile(filePath, filePathId, classPath, listIndex, classEncoding, classUri, resourceInput, resourceOutput, options, fileDb, moduleDb)
        counter += 1

  return counter


def indexScriptInput(options):
  if options.cacheDirectory != None:
    filetool.directory(options.cacheDirectory)

  print "  * Indexing class paths... "

  fileDb = {}
  moduleDb = {}
  listIndex = 0

  for classPath in options.classPath:
    print "    - Indexing: %s" % classPath
    counter = indexSingleScriptInput(classPath, listIndex, options, fileDb, moduleDb)
    print "      - %s classes were found" % counter
    listIndex += 1

  if options.enableAutoDependencies:
    resolveAutoDeps(fileDb, options)

  if options.cacheDirectory != None:
    storeEntryCache(fileDb, options)

  return fileDb, moduleDb











"""
Simple resolver, just try to add items and put missing stuff around
the new one.
"""
def recursiveAddClass(fileDb, fileId, sortedList):
  if not fileDb.has_key(fileId):
    print "    - Error: Could not find class '%s'" % fileId
    return False

  # Including loadtime dependencies
  for depId in fileDb[fileId]["loadtimeDeps"]:
    recursiveAddClass(fileDb, depId, sortedList)

  # Add myself
  if not fileId in sortedList:
    sortedList.append(fileId)

    # Include runtime dependencies
    for depId in fileDb[fileId]["runtimeDeps"]:
      recursiveAddClass(fileDb, depId, sortedList)



def addClass(fileDb, todo, result, dependencies=True):
  if dependencies:
    for fileId in todo:
      recursiveAddClass(fileDb, fileId, result)

  else:
    for fileId in todo:
      if fileId in result:
        continue

      if not fileDb.has_key(fileId):
        print "    - Error: Could not find class '%s'" % fileId
        return False

      # Test if any of my load dependencies could be solved by the other entries
      for depId in fileDb[fileId]["loadtimeDeps"]:
        if depId in todo:
          if not depId in result:
            result.append(depId)

      # Add myself
      if not fileId in result:
        result.append(fileId)



def getSortedList(options, fileDb, moduleDb):

  # PREPARATION

  # Create empty lists
  include = []
  exclude = []
  includePure = []
  excludePure = []
  sortedInclude = []
  sortedExclude = []


  # PROCESS INCLUDES

  # Add all if both lists are empty
  if len(options.include) == 0 and len(options.includePure) == 0:
    include = fileDb.keys()

  else:
    # Add modules and classes with dependencies
    if options.include:
      for include in options.include:
        if include in moduleDb:
          include.extend(moduleDb[include])

        else:
          regexp = textutil.toRegExp(include)

          for fileId in fileDb:
            if regexp.search(fileId):
              if not fileId in include:
                include.append(fileId)

    # Add modules and classes without dependencies
    if options.includePure:
      for include in options.includePure:
        if include in moduleDb:
          includePure.extend(moduleDb[include])

        else:
          regexp = textutil.toRegExp(include)

          for fileId in fileDb:
            if regexp.search(fileId):
              if not fileId in includePure:
                includePure.append(fileId)



  # PROCESS EXCLUDES

  # Add Modules and Files with dependencies
  if options.exclude:
    for exclude in options.exclude:
      if exclude in moduleDb:
        exclude.extend(moduleDb[exclude])

      else:
        regexp = textutil.toRegExp(exclude)

        for fileId in fileDb:
          if regexp.search(fileId):
            if not fileId in exclude:
              exclude.append(fileId)

  # Add Modules and Files without dependencies
  if options.excludePure:
    for exclude in options.excludePure:
      if exclude in moduleDb:
        excludePure.extend(moduleDb[exclude])

      else:
        regexp = textutil.toRegExp(exclude)

        for fileId in fileDb:
          if regexp.search(fileId):
            if not fileId in exclude:
              excludePure.append(fileId)


  # SORTING INCLUDES

  addClass(fileDb, include, sortedInclude, True)
  addClass(fileDb, includePure, sortedInclude, False)


  # SORTING EXCLUDES

  addClass(fileDb, exclude, sortedExclude, True)
  addClass(fileDb, excludePure, sortedExclude, False)


  # MERGE SORTED LISTS

  # Remove excluded files from included files list
  for fileId in sortedExclude:
    if fileId in sortedInclude:
      sortedInclude.remove(fileId)


  # DONE

  return sortedInclude
