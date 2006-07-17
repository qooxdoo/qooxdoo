#!/usr/bin/env python

import sys, string, re, os, random
import config




def extractUniqueId(data):
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




def addUniqueIdToSortedList(uniqueId, loadDeps, runtimeDeps, sortedList, enableDeps):
  if not loadDeps.has_key(uniqueId):
    print "    * Could not resolve requirement of uniqueId: %s" % uniqueId
    return False

  # Test if already in
  try:
    sortedList.index(uniqueId)

  except ValueError:
    # Including pre-deps
    if enableDeps:
      for preUniqueId in loadDeps[uniqueId]:
        addUniqueIdToSortedList(preUniqueId, loadDeps, runtimeDeps, sortedList, True)

    # Add myself
    try:
      sortedList.index(uniqueId)
    except ValueError:
      sortedList.append(uniqueId)

    # Include post-deps
    if enableDeps:
      for postUniqueId in runtimeDeps[uniqueId]:
        addUniqueIdToSortedList(postUniqueId, loadDeps, runtimeDeps, sortedList, True)





def scan(sourceDir, knownFiles, knownModules, loadDeps, runtimeDeps):
  for root, dirs, files in os.walk(sourceDir):

    # Filter ignored directories
    for ignoredDir in config.DIRIGNORE:
      if ignoredDir in dirs:
        dirs.remove(ignoredDir)

    # Searching for files
    for fileName in files:
      if os.path.splitext(fileName)[1] == config.JSEXT:

        # Build complete filename and extract ID from relative path
        filePath = os.path.join(root, fileName)
        filePathId = os.path.join(root.replace(sourceDir + os.sep, ""), fileName.replace(config.JSEXT, "")).replace(os.sep, ".")

        # Read file content and extract ID from content definition
        fileContent = file(filePath, "r").read()
        fileContentId = extractUniqueId(fileContent)

        # Search for valid ID
        if fileContentId == None:
          fileId = filePathId
          print "    * Could not extract uniqueId from file: %s. Using fileName!" % uniqueId

        else:
          fileId = fileContentId

          if fileContentId != filePathId:
            print "    * ID mismatch: CONTENT=%s != PATH=%s" % (fileContentId, filePathId)

        # Map uniqueId to fileName
        knownFiles[fileId] = filePath

        # Store explicit deps
        loadDeps[fileId] = extractLoadtimeDeps(fileContent)
        runtimeDeps[fileId] = extractRuntimeDeps(fileContent)

        # Register file to module information
        for pkgname in extractModules(fileContent):
          if knownModules.has_key(pkgname):
            knownModules[pkgname].append(fileId)
          else:
            knownModules[pkgname] = [ fileId ]




def scanAll(sourceDirectories):
  knownFiles = {}
  knownModules = {}

  loadDeps = {}
  runtimeDeps = {}

  print "  * Searching for files..."

  for sourceDir in sourceDirectories:
    scan(sourceDir, knownFiles, knownModules, loadDeps, runtimeDeps)

  print "  * Found %s files" % len(knownFiles)

  return {
    "files" : knownFiles,
    "modules" : knownModules,
    "loadDeps" : loadDeps,
    "runtimeDeps" : runtimeDeps
  }





def getSortedList(options, scanResult):
  includeIds = []
  excludeIds = []

  sortedList = []
  sortedExcludeList = []



  # INCLUDE

  # Add Modules and Files
  if options.include:
    for include in options.include:
      if include in scanResult["modules"]:
        includeIds.extend(scanResult["modules"][include])

      else:
        includeIds.append(include)

  # Add all if empty
  if len(includeIds) == 0:
    for uniqueId in scanResult["files"]:
      includeIds.append(uniqueId)

  # Sorting
  for uniqueId in includeIds:
    addUniqueIdToSortedList(uniqueId, scanResult["loadDeps"], scanResult["runtimeDeps"], sortedList, options.enableIncludeDeps)



  # EXCLUDE

  # Add Modules and Files
  if options.exclude:
    for exclude in options.exclude:
      if exclude in scanResult["modules"]:
        excludeIds.extend(scanResult["modules"][exclude])

      else:
        excludeIds.append(exclude)

    # Sorting
    for uniqueId in excludeIds:
      addUniqueIdToSortedList(uniqueId, scanResult["loadDeps"], scanResult["runtimeDeps"], sortedExcludeList, options.enableExcludeDeps)




  # MERGE

  # Remove excluded files from included files list
  for uniqueId in sortedExcludeList:
    if uniqueId in sortedList:
      sortedList.remove(uniqueId)



  # RETURN

  return sortedList
