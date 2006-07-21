#!/usr/bin/env python

import sys, string, re, os, random
import config, tokenizer, treegenerator




def extractFileContentId(data):
  for item in config.QXHEAD["uniqueId"].findall(data):
    return item

  for item in config.QXHEAD["defineClass"].findall(data):
    return item[0]

  return None


def extractSuperClass(data):
  for item in config.QXHEAD["defineClass"].findall(data):
    return item[2]

  return None


def extractLoadtimeDeps(data):
  deps = []

  # Storing inheritance deps
  superClass = extractSuperClass(data)
  if superClass != None and superClass != "" and not superClass in config.JSBUILTIN:
    deps.append(superClass)

  # Adding explicit requirements
  for item in config.QXHEAD["require"].findall(data):
    deps.append(item)

  return deps


def extractRuntimeDeps(data):
  deps = []

  # Adding explicit requirements
  for item in config.QXHEAD["use"].findall(data):
    deps.append(item)

  return deps


def extractOptionalDeps(data):
  deps = []

  # Adding explicit requirements
  for item in config.QXHEAD["optional"].findall(data):
    deps.append(item)

  return deps


def extractModules(data):
  pkgs = []

  for item in config.QXHEAD["module"].findall(data):
    pkgs.append(item)

  return pkgs


def extractResources(data):
  copy = []

  for item in config.QXHEAD["resource"].findall(data):
    copy.append(item)

  return copy










def indexFile(filePath, filePathId, fileDb={}, moduleDb={}, verbose=False):
  # Read file content and extract ID from content definition
  fileContent = file(filePath, "r").read()
  fileContentId = extractFileContentId(fileContent)

  # Search for valid ID
  if fileContentId == None:
    fileId = filePathId
    print "    * Could not extract uniqueId from file: %s. Using fileName!" % fileId

  else:
    fileId = fileContentId

    if fileContentId != filePathId:
      print "    * ID mismatch: CONTENT=%s != PATH=%s" % (fileContentId, filePathId)

  if verbose:
    print "    - Indexing %s" % fileId

  tokens = tokenizer.parseStream(fileContent, fileId)
  tree = treegenerator.createSyntaxTree(tokens)

  # Store file data
  fileDb[fileId] = {
    "path" : filePath,
    "content" : fileContent,
    "tokens" : tokens,
    "tree" : tree,
    "loadDeps" : extractLoadtimeDeps(fileContent),
    "runtimeDeps" : extractRuntimeDeps(fileContent),
    "optionalDeps" : extractOptionalDeps(fileContent)
  }

  # Register file to module data
  for moduleId in extractModules(fileContent):
    if moduleDb.has_key(moduleId):
      moduleDb[moduleId].append(fileId)
    else:
      moduleDb[moduleId] = [ fileId ]


def indexSingleDirectory(sourceDirectory, fileDb={}, moduleDb={}, verbose=False):
  for root, dirs, files in os.walk(sourceDirectory):

    # Filter ignored directories
    for ignoredDir in config.DIRIGNORE:
      if ignoredDir in dirs:
        dirs.remove(ignoredDir)

    # Searching for files
    for fileName in files:
      if os.path.splitext(fileName)[1] == config.JSEXT:
        filePath = os.path.join(root, fileName)
        filePathId = os.path.join(root.replace(sourceDirectory + os.sep, ""), fileName.replace(config.JSEXT, "")).replace(os.sep, ".")

        indexFile(filePath, filePathId, fileDb, moduleDb, verbose)


def indexDirectories(sourceDirectories, verbose=False):
  fileDb = {}
  moduleDb = {}

  for sourceDir in sourceDirectories:
    indexSingleDirectory(sourceDir, fileDb, moduleDb, verbose)

  return fileDb, moduleDb









def addFileToSortedList(sortedList, fileDb, moduleDb, fileId, enableDeps):
  if not fileDb.has_key(fileId):
    print "    * Error: Couldn't find required file: %s" % fileId
    return False

  # Test if already in
  try:
    sortedList.index(fileId)

  except ValueError:
    # Including load dependencies
    if enableDeps:
      for loadDepId in fileDb[fileId]["loadDeps"]:
        addFileToSortedList(sortedList, fileDb, moduleDb, loadDepId, True)

    # Add myself
    try:
      sortedList.index(fileId)
    except ValueError:
      sortedList.append(fileId)

    # Include runtime dependencies
    if enableDeps:
      for runtimeDepId in fileDb[fileId]["runtimeDeps"]:
        addFileToSortedList(sortedList, fileDb, moduleDb, runtimeDepId, True)


def getSortedList(options, fileDb, moduleDb):
  includeIds = []
  excludeIds = []

  sortedIncludeList = []
  sortedExcludeList = []



  # INCLUDE

  # Add Modules and Files
  if options.include:
    for include in options.include:
      if include in moduleDb:
        includeIds.extend(moduleDb[include])

      else:
        includeIds.append(include)

  # Add all if empty
  if len(includeIds) == 0:
    for fileId in fileDb:
      includeIds.append(fileId)

  # Sorting
  for fileId in includeIds:
    addFileToSortedList(sortedIncludeList, fileDb, moduleDb, fileId, options.enableIncludeDependencies)



  # EXCLUDE

  # Add Modules and Files
  if options.exclude:
    for exclude in options.exclude:
      if exclude in moduleDb:
        excludeIds.extend(moduleDb[exclude])

      else:
        excludeIds.append(exclude)

    # Sorting
    for fileId in excludeIds:
      addFileToSortedList(sortedExcludeList, fileDb, moduleDb, fileId, options.enableExcludeDependencies)




  # MERGE

  # Remove excluded files from included files list
  for fileId in sortedExcludeList:
    if fileId in sortedIncludeList:
      sortedIncludeList.remove(fileId)



  # RETURN

  return sortedIncludeList
