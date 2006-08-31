#!/usr/bin/env python

import sys, string, re, os, random, cPickle, codecs
import config, tokenizer, treegenerator, filetool




def extractFileContentId(data):
  for item in config.QXHEAD["id"].findall(data):
    return item

  for item in config.QXHEAD["defineClass"].findall(data):
    return item[0]

  return None


def extractSuperClass(data):
  for item in config.QXHEAD["defineClass"].findall(data):
    return item[2]

  return None


def extractLoadtimeDeps(data, fileId=""):
  deps = []

  # qooxdoo specific:
  # store inheritance deps
  superClass = extractSuperClass(data)
  if superClass != None and superClass != "" and not superClass in config.JSBUILTIN:
    deps.append("qx.OO")
    deps.append(superClass)
  elif "qx.OO.defineClass(" in data:
    deps.append("qx.OO")


  # Adding explicit requirements
  for item in config.QXHEAD["require"].findall(data):
    if item == fileId:
      print "      - Self-referring load dependency: %s" % item
    elif item in deps:
      print "      - Double definition of load dependency: %s" % item
    else:
      deps.append(item)

  return deps


def extractAfterDeps(data, fileId=""):
  deps = []

  # Adding explicit after requirements
  for item in config.QXHEAD["after"].findall(data):
    if item == fileId:
      print "      - Self-referring load dependency: %s" % item
    elif item in deps:
      print "      - Double definition of load dependency: %s" % item
    else:
      deps.append(item)

  return deps


def extractRuntimeDeps(data, fileId=""):
  deps = []

  # Adding explicit runtime requirements
  for item in config.QXHEAD["use"].findall(data):
    if item == fileId:
      print "      - Self-referring runtime dependency: %s" % item
    elif item in deps:
      print "      - Double definition of runtime dependency: %s" % item
    else:
      deps.append(item)

  return deps


def extractLoadDeps(data, fileId=""):
  deps = []

  # Adding before requirements
  for item in config.QXHEAD["load"].findall(data):
    if item == fileId:
      print "      - Self-referring runtime dependency: %s" % item
    elif item in deps:
      print "      - Double definition of runtime dependency: %s" % item
    else:
      deps.append(item)

  return deps


def extractOptional(data):
  deps = []

  # Adding explicit requirements
  for item in config.QXHEAD["optional"].findall(data):
    if not item in deps:
      deps.append(item)

  return deps


def extractModules(data):
  mods = []

  for item in config.QXHEAD["module"].findall(data):
    if not item in mods:
      mods.append(item)

  return mods


def extractResources(data):
  res = []

  for item in config.QXHEAD["resource"].findall(data):
    res.append(item)

  return res










def indexFile(filePath, filePathId, scriptInput, listIndex, scriptEncoding, sourceScriptPath, resourceInput, resourceOutput, options, fileDb={}, moduleDb={}):
  if options.verbose:
    print "    - %s" % filePathId

  # Modification time
  fileModTime = os.stat(filePath).st_mtime
  cacheModTime = 0

  if options.cacheDirectory:
    filetool.directory(options.cacheDirectory)
    fileCacheName = os.path.join(filetool.normalize(options.cacheDirectory), filePathId + ".pcl")

    try:
      cacheModTime = os.stat(fileCacheName).st_mtime
    except OSError:
      cacheModTime = 0

  # If we must read the file again
  if fileModTime <= cacheModTime:

    # We hope the ID is valid (saves one file read!)
    fileId = filePathId

    # Use Cache
    try:
      fileDb[fileId] = cPickle.load(open(fileCacheName))

    except EOFError or PickleError or UnpicklingError:
      cacheModTime = 0
      print "      - Error while reading! Ignore cache"

  if fileModTime > cacheModTime:
    if options.verbose:
      print "=> parse..."
    else:
      sys.stdout.write("!")

    useCache = True

    # Read file content and extract ID from content definition
    try:
      fileObject = codecs.open(filePath, "r", scriptEncoding)

    except ValueError:
      if options.verbose:
        print "      * Invalid Encoding. Required encoding: %s" % scriptEncoding

      else:
        print "\n    * Invalid Encoding in file %s. Required encoding: %s" % (filePath, scriptEncoding)

      sys.exit(1)

    # Read content
    try:
      fileContent = fileObject.read()

    except ValueError:
      if options.verbose:
        print "      * Invalid Encoding. Required encoding: %s" % scriptEncoding

      else:
        print "\n    * Invalid Encoding in file %s. Required encoding: %s" % (filePath, scriptEncoding)

      sys.exit(1)

    # Extract ID
    fileContentId = extractFileContentId(fileContent)

    # Search for valid ID
    if fileContentId == None:
      fileId = filePathId
      if not options.verbose:
        print "\n    - %s" % filePathId

      print "      * Could not extract ID from file: %s. Using fileName!" % fileId
      useCache = False

    else:
      fileId = fileContentId

      if fileContentId != filePathId:
        if not options.verbose:
          print "\n    - %s" % filePathId

        print "      * ID mismatch: CONTENT=%s != PATH=%s" % (fileContentId, filePathId)
        useCache = False

    # Structuring
    tokens = tokenizer.parseStream(fileContent, fileId)
    tree = treegenerator.createSyntaxTree(tokens)

    # Store file data
    fileDb[fileId] = {
      "tokens" : tokens,
      "tree" : tree,
      "optionalDeps" : extractOptional(fileContent),
      "loadtimeDeps" : extractLoadtimeDeps(fileContent, fileId),
      "runtimeDeps" : extractRuntimeDeps(fileContent, fileId),
      "afterDeps" : extractAfterDeps(fileContent, fileId),
      "loadDeps" : extractLoadDeps(fileContent, fileId),
      "resources" : extractResources(fileContent),
      "modules" : extractModules(fileContent)
    }

    if useCache and options.cacheDirectory:
      try:
        cPickle.dump(fileDb[fileId], open(fileCacheName, 'w'), 2)

      except EOFError or PickleError or PicklingError:
        print "      - Could not store cache file!"

  else:
    if options.verbose:
      print "=> cached"
    else:
      sys.stdout.write(".")

  # Register file to module data
  for moduleId in fileDb[fileId]["modules"]:
    if moduleDb.has_key(moduleId):
      moduleDb[moduleId].append(fileId)
    else:
      moduleDb[moduleId] = [ fileId ]

  sys.stdout.flush()

  # Store additional data (non-cached data)
  fileDb[fileId]["scriptInput"] = scriptInput
  fileDb[fileId]["modificationTime"] = fileModTime
  fileDb[fileId]["path"] = filePath
  fileDb[fileId]["pathId"] = filePathId
  fileDb[fileId]["resourceInput"] = resourceInput
  fileDb[fileId]["resourceOutput"] = resourceOutput
  fileDb[fileId]["sourceScriptPath"] = sourceScriptPath
  fileDb[fileId]["listIndex"] = listIndex


def indexSingleScriptInput(scriptInput, listIndex, options, fileDb={}, moduleDb={}):
  scriptInput = filetool.normalize(scriptInput)

  # Search for other indexed lists
  if len(options.scriptEncoding) > listIndex:
    scriptEncoding = options.scriptEncoding[listIndex]
  else:
    scriptEncoding = "utf-8"

  if len(options.sourceScriptPath) > listIndex:
    sourceScriptPath = options.sourceScriptPath[listIndex]
  else:
    sourceScriptPath = None

  if len(options.resourceInput) > listIndex:
    resourceInput = options.resourceInput[listIndex]
  else:
    resourceInput = None

  if len(options.resourceOutput) > listIndex:
    resourceOutput = options.resourceOutput[listIndex]
  else:
    resourceOutput = None

  for root, dirs, files in os.walk(scriptInput):

    # Filter ignored directories
    for ignoredDir in config.DIRIGNORE:
      if ignoredDir in dirs:
        dirs.remove(ignoredDir)

    # Searching for files
    for fileName in files:
      if os.path.splitext(fileName)[1] == config.JSEXT:
        filePath = os.path.join(root, fileName)
        filePathId = filePath.replace(scriptInput + os.sep, "").replace(config.JSEXT, "").replace(os.sep, ".")

        indexFile(filePath, filePathId, scriptInput, listIndex, scriptEncoding, sourceScriptPath, resourceInput, resourceOutput, options, fileDb, moduleDb)


def indexScriptInput(options):
  fileDb = {}
  moduleDb = {}
  listIndex = 0

  for scriptInput in options.scriptInput:
    indexSingleScriptInput(scriptInput, listIndex, options, fileDb, moduleDb)
    listIndex += 1

  return fileDb, moduleDb





"""
Simple resolver, just try to add items and put missing stuff around
the new one.
"""
def addIdWithDepsToSortedList(sortedList, fileDb, fileId):
  if not fileDb.has_key(fileId):
    print "    * Error: Couldn't find required file: %s" % fileId
    return False

  # Test if already in
  if not fileId in sortedList:

    # Including loadtime dependencies
    for loadtimeDepId in fileDb[fileId]["loadtimeDeps"]:
      addIdWithDepsToSortedList(sortedList, fileDb, loadtimeDepId)

    # Including after dependencies
    for afterDepId in fileDb[fileId]["afterDeps"]:
      addIdWithDepsToSortedList(sortedList, fileDb, afterDepId)

    # Add myself
    if not fileId in sortedList:
      sortedList.append(fileId)

    # Include runtime dependencies
    for runtimeDepId in fileDb[fileId]["runtimeDeps"]:
      addIdWithDepsToSortedList(sortedList, fileDb, runtimeDepId)

    # Include load dependencies
    for loadDepId in fileDb[fileId]["loadDeps"]:
      addIdWithDepsToSortedList(sortedList, fileDb, loadDepId)





"""
Search for dependencies, but don't add them. Just use them to put
the new class after the stuff which is required (if it's included, too)
"""
def addIdWithoutDepsToSortedList(sortedList, fileDb, fileId):
  if not fileDb.has_key(fileId):
    print "    * Error: Couldn't find required file: %s" % fileId
    return False

  # Test if already in
  if not fileId in sortedList:

    # Search sortedList for files which needs this one and are already included
    lowestIndex = None
    currentIndex = 0
    for lowId in sortedList:
      for lowDepId in getResursiveLoadDeps([], fileDb, lowId, lowId):
        if lowDepId == fileId and (lowestIndex == None or currentIndex < lowestIndex):
          lowestIndex = currentIndex

      currentIndex += 1

    # Insert at defined index or just append new entry
    if lowestIndex != None:
      sortedList.insert(lowestIndex, fileId)
    else:
      sortedList.append(fileId)




def getResursiveLoadDeps(deps, fileDb, fileId, ignoreId=None):
  if fileId in deps:
    return

  if fileId != ignoreId:
    deps.append(fileId)

  # Including loadtime dependencies
  for loadtimeDepId in fileDb[fileId]["loadtimeDeps"]:
    getResursiveLoadDeps(deps, fileDb, loadtimeDepId)

  # Including after dependencies
  for afterDepId in fileDb[fileId]["afterDeps"]:
    getResursiveLoadDeps(deps, fileDb, afterDepId)

  return deps





def getSortedList(options, fileDb, moduleDb):
  includeWithDeps = []
  excludeWithDeps = []
  includeWithoutDeps = []
  excludeWithoutDeps = []

  sortedIncludeList = []
  sortedExcludeList = []



  # INCLUDE

  # Add Modules and Files (with deps)
  if options.includeWithDeps:
    for include in options.includeWithDeps:
      if include in moduleDb:
        includeWithDeps.extend(moduleDb[include])

      elif "*" in include or "?" in include:
        regstr = "^(" + include.replace('.', '\\.').replace('*', '.*').replace('?', '.?') + ")$"
        regexp = re.compile(regstr)

        for fileId in fileDb:
          if regexp.search(fileId):
            if not fileId in includeWithDeps:
              includeWithDeps.append(fileId)

      else:
        if not include in includeWithDeps:
          includeWithDeps.append(include)


  # Add Modules and Files (without deps)
  if options.includeWithoutDeps:
    for include in options.includeWithoutDeps:
      if include in moduleDb:
        includeWithoutDeps.extend(moduleDb[include])

      elif "*" in include or "?" in include:
        regstr = "^(" + include.replace('.', '\\.').replace('*', '.*').replace('?', '.?') + ")$"
        regexp = re.compile(regstr)

        for fileId in fileDb:
          if regexp.search(fileId):
            if not fileId in includeWithoutDeps:
              includeWithoutDeps.append(fileId)

      else:
        if not include in includeWithoutDeps:
          includeWithoutDeps.append(include)






  # Add all if both lists are empty
  if len(includeWithDeps) == 0 and len(includeWithoutDeps) == 0:
    print "  * Including all classes..."
    for fileId in fileDb:
      includeWithDeps.append(fileId)

  # Sorting include (with deps)
  for fileId in includeWithDeps:
    addIdWithDepsToSortedList(sortedIncludeList, fileDb, fileId)

  # Sorting include (without deps)
  for fileId in includeWithoutDeps:
    addIdWithoutDepsToSortedList(sortedIncludeList, fileDb, fileId)



  # EXCLUDE

  # Add Modules and Files (with deps)
  if options.excludeWithDeps:
    for exclude in options.excludeWithDeps:
      if exclude in moduleDb:
        excludeWithDeps.extend(moduleDb[exclude])

      elif "*" in exclude or "?" in exclude:
        regstr = "^(" + exclude.replace('.', '\\.').replace('*', '.*').replace('?', '.?') + ")$"
        regexp = re.compile(regstr)

        for fileId in fileDb:
          if regexp.search(fileId):
            if not fileId in excludeWithDeps:
              excludeWithDeps.append(fileId)

      else:
        if not exclude in excludeWithDeps:
          excludeWithDeps.append(exclude)


  # Add Modules and Files (without deps)
  if options.excludeWithoutDeps:
    for exclude in options.excludeWithoutDeps:
      if exclude in moduleDb:
        excludeWithoutDeps.extend(moduleDb[exclude])

      elif "*" in exclude or "?" in exclude:
        regstr = "^(" + exclude.replace('.', '\\.').replace('*', '.*').replace('?', '.?') + ")$"
        regexp = re.compile(regstr)

        for fileId in fileDb:
          if regexp.search(fileId):
            if not fileId in excludeWithDeps:
              excludeWithoutDeps.append(fileId)

      else:
        if not exclude in excludeWithDeps:
          excludeWithoutDeps.append(exclude)





  # Sorting exclude (with deps)
  for fileId in excludeWithDeps:
    addIdWithDepsToSortedList(sortedExcludeList, fileDb, fileId)

  # Sorting exclude (without deps)
  for fileId in excludeWithoutDeps:
    addIdWithoutDepsToSortedList(sortedExcludeList, fileDb, fileId)




  # MERGE

  # Remove excluded files from included files list
  for fileId in sortedExcludeList:
    if fileId in sortedIncludeList:
      sortedIncludeList.remove(fileId)



  # RETURN

  return sortedIncludeList
