#!/usr/bin/env python

import sys, string, re, os, random
import config




R_QXDEFINECLASS = re.compile('qx.OO.defineClass\("([\.a-zA-Z0-9_-]+)"(\s*\,\s*([\.a-zA-Z0-9_-]+))?', re.M)
R_QXUNIQUEID = re.compile("#id\(([\.a-zA-Z0-9_-]+)\)", re.M)
R_QXPACKAGE = re.compile("#package\(([\.a-zA-Z0-9_-]+)\)", re.M)
R_QXREQUIRE = re.compile("#require\(([\.a-zA-Z0-9_-]+)\)", re.M)
R_QXUSE = re.compile("#use\(([\.a-zA-Z0-9_-]+)\)", re.M)




def extractMetaData(data, loadDeps, runtimeDeps, knownPackages):
  thisClass = None
  superClass = None

  dc = config.QXHEAD["defineClass"].search(data)

  if dc:
    thisClass = dc.group(1)
    superClass = dc.group(3)

  else:
    # print "Sorry. Don't find any class informations. Trying id information."

    ns = config.QXHEAD["uniqueId"].search(data)

    if ns:
      thisClass = ns.group(1)


  if thisClass == None:
    print "    * Error while extracting uniqueId!"
    return None


  # Pre-Creating data storage
  if not loadDeps.has_key(thisClass):
    loadDeps[thisClass] = []

  if not runtimeDeps.has_key(thisClass):
    runtimeDeps[thisClass] = []


  # Storing inheritance deps
  if superClass != None:
    if superClass in config.JSBUILTIN:
      pass

    else:
      loadDeps[thisClass].append(superClass)


  # Storing defined deps and package informations
  for line in data.split("\n"):
    req = config.QXHEAD["require"].search(line)
    use = config.QXHEAD["use"].search(line)
    pkg = config.QXHEAD["package"].search(line)

    if req:
      loadDeps[thisClass].append(req.group(1))

    if use:
      runtimeDeps[thisClass].append(use.group(1))

    if pkg:
      pkgname = pkg.group(1)

      if knownPackages.has_key(pkgname):
        knownPackages[pkgname].append(thisClass)
      else:
        knownPackages[pkgname] = [ thisClass ]


  return thisClass







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
        uniqueId = extractMetaData(file(completeFileName, "r").read(), loadDeps, runtimeDeps, knownPackages)

        if uniqueId == None:
          print "    * Could not extract meta data from file: %s" % filename
          print "    * Using filename (compatibility mode)"
          uniqueId = filename.replace(config.JSEXT, "")
          knownFiles[uniqueId] = completeFileName
          loadDeps[uniqueId] = []
          runtimeDeps[uniqueId] = []

        else:

          splitUniqueId = uniqueId.split(".")
          splitFileName = completeFileName.replace(config.JSEXT, "").split(os.sep)
          uniqueFileId = ".".join(splitFileName[len(splitFileName)-len(splitUniqueId):])

          if uniqueId != uniqueFileId:
            print "    * UniqueId/Filename mismatch: %s != %s" % (uniqueId, uniqueFileId)

          knownFiles[uniqueId] = completeFileName





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
