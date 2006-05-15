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


def extractPackages(data):
  pkgs = []

  for item in config.QXHEAD["package"].findall(data):
    pkgs.append(item)

  return pkgs


def extractCopyInfo(data):
  copy = []

  for item in config.QXHEAD["copy"].findall(data):
    copy.append(item)

  return copy




def addUniqueIdToSortedList(uniqueId, loadDeps, runtimeDeps, sortedList, ignoreDeps):
  if not loadDeps.has_key(uniqueId):
    print "    * Could not resolve requirement of uniqueId: %s" % uniqueId
    return False

  # Test if already in
  try:
    sortedList.index(uniqueId)

  except ValueError:
    # Including pre-deps
    if not ignoreDeps:
      for preUniqueId in loadDeps[uniqueId]:
        addUniqueIdToSortedList(preUniqueId, loadDeps, runtimeDeps, sortedList, False)

    # Add myself
    try:
      sortedList.index(uniqueId)
    except ValueError:
      sortedList.append(uniqueId)

    # Include post-deps
    if not ignoreDeps:
      for postUniqueId in runtimeDeps[uniqueId]:
        addUniqueIdToSortedList(postUniqueId, loadDeps, runtimeDeps, sortedList, False)





def scan(sourceDir, knownFiles, knownPackages, loadDeps, runtimeDeps):
  for root, dirs, files in os.walk(sourceDir):
    if "CVS" in dirs:
      dirs.remove('CVS')

    if ".svn" in dirs:
      dirs.remove('.svn')

    for filename in files:
      if os.path.splitext(filename)[1] == config.JSEXT:
        completeFileName = os.path.join(root, filename)
        fileData = file(completeFileName, "r").read()
        uniqueId = extractUniqueId(fileData)

        if uniqueId == None:
          uniqueId = filename.replace(config.JSEXT, "")
          print "    * Could not extract uniqueId from file: %s. Using filename!" % uniqueId

        else:
          splitUniqueId = uniqueId.split(".")
          splitFileName = completeFileName.replace(config.JSEXT, "").split(os.sep)
          uniqueFileId = ".".join(splitFileName[len(splitFileName)-len(splitUniqueId):])

          if uniqueId != uniqueFileId:
            print "    * UniqueId/Filename mismatch: %s != %s" % (uniqueId, uniqueFileId)


        # Map uniqueId to fileName
        knownFiles[uniqueId] = completeFileName

        # Store explicit deps
        loadDeps[uniqueId] = extractLoadtimeDeps(fileData)
        runtimeDeps[uniqueId] = extractRuntimeDeps(fileData)

        # Register file to package information
        for pkgname in extractPackages(fileData):
          if knownPackages.has_key(pkgname):
            knownPackages[pkgname].append(uniqueId)
          else:
            knownPackages[pkgname] = [ uniqueId ]




def scanAll(sourceDirectories):
  knownFiles = {}
  knownPackages = {}

  loadDeps = {}
  runtimeDeps = {}

  print "  * Searching for files..."

  for sourceDir in sourceDirectories:
    scan(sourceDir, knownFiles, knownPackages, loadDeps, runtimeDeps)

  print "  * Found %s files" % len(knownFiles)

  return {
    "files" : knownFiles,
    "packages" : knownPackages,
    "loadDeps" : loadDeps,
    "runtimeDeps" : runtimeDeps
  }





def getSortedList(cmds, scanResult):
  includeIds = []
  excludeIds = []

  sortedList = []
  sortedExcludeList = []



  # INCLUDE

  # Add Packages and Files
  if cmds.has_key("include"):
    for include in cmds["include"]:
      if include in scanResult["packages"]:
        includeIds.extend(scanResult["packages"][include])

      else:
        includeIds.append(include)

  # Add all if empty
  if len(includeIds) == 0:
    for uniqueId in scanResult["files"]:
      includeIds.append(uniqueId)

  # Sorting
  for uniqueId in includeIds:
    addUniqueIdToSortedList(uniqueId, scanResult["loadDeps"], scanResult["runtimeDeps"], sortedList, cmds["ignoreIncludeDeps"])



  # EXCLUDE

  # Add Packages and Files
  if cmds.has_key("exclude"):
    for exclude in cmds["exclude"]:
      if exclude in scanResult["packages"]:
        excludeIds.extend(scanResult["packages"][exclude])

      else:
        excludeIds.append(exclude)

    # Sorting
    for uniqueId in excludeIds:
      addUniqueIdToSortedList(uniqueId, scanResult["loadDeps"], scanResult["runtimeDeps"], sortedExcludeList, cmds["ignoreExcludeDeps"])




  # MERGE

  # Remove excluded files from included files list
  for uniqueId in sortedExcludeList:
    if uniqueId in sortedList:
      sortedList.remove(uniqueId)



  # RETURN

  return sortedList
