#!/usr/bin/env python

import sys, string, re, os, random, shutil, optparse, subprocess
import config, tokenizer, loader, compile, docgenerator, tree, treegenerator





def filetool(filepath, filename, content="", encoding="utf-8"):
  # Concatting and Splitting
  outputFileName = os.path.normpath(os.path.join(filepath, filename))
  outputFileDir = os.path.dirname(outputFileName)

  # Check/Create directory
  if not os.path.exists(outputFileDir):
    os.makedirs(outputFileDir)

  # Writing file
  outputFile = file(outputFileName, "w")
  outputFile.write(content.encode(encoding))
  outputFile.flush()
  outputFile.close()





def getparser():
  parser = optparse.OptionParser("usage: %prog [options]")

  # From file
  parser.add_option("--from-file", dest="fromFile", metavar="FILENAME", help="Read options from FILENAME.")
  parser.add_option("--export-to-file", dest="exportToFile", metavar="FILENAME", help="Store options to FILENAME.")

  # Setting
  parser.add_option("--setting", action="append", dest="setting", metavar="NAMESPACE.KEY:VALUE", default=[], help="Define a setting.")

  # Source Directories
  parser.add_option("-s", "--source-directory", action="append", dest="sourceDirectories", metavar="DIRECTORY", default=[], help="Add source directory.")

  # Destination Directories
  parser.add_option("--source-output-directory", dest="sourceOutputDirectory", metavar="DIRECTORY", help="Define output directory for source JavaScript files.")
  parser.add_option("--token-output-directory", dest="tokenOutputDirectory", metavar="DIRECTORY", help="Define output directory for tokenized JavaScript files.")
  parser.add_option("--compile-output-directory", dest="compileOutputDirectory", metavar="DIRECTORY", help="Define output directory for compiled JavaScript files.")
  parser.add_option("--api-output-directory", dest="apiOutputDirectory", metavar="DIRECTORY", help="Define api output directory.")

  # Destination Filenames
  parser.add_option("--source-output-filename", dest="sourceOutputFilename", default="qx.js", metavar="FILENAME", help="Name of output file from source build process.")
  parser.add_option("--compile-output-filename", dest="compileOutputFilename", default="qx.js", metavar="FILENAME", help="Name of output file from compiler.")
  parser.add_option("--json-api-output-filename", dest="jsonApiOutputFilename", default="api.js", metavar="FILENAME", help="Name of JSON API file.")
  parser.add_option("--xml-api-output-filename", dest="xmlApiOutputFilename", default="api.xml", metavar="FILENAME", help="Name of XML API file.")

  # Actions
  parser.add_option("-c", "--compile-source", action="store_true", dest="compileSource", default=False, help="Compile source files.")
  parser.add_option("-r", "--copy-resources", action="store_true", dest="copyResources", default=False, help="Copy resource files.")
  parser.add_option("--store-tokens", action="store_true", dest="storeTokens", default=False, help="Store tokenized content of source files.")
  parser.add_option("-g", "--generate-source", action="store_true", dest="generateSource", default=False, help="Generate source version.")
  parser.add_option("-a", "--generate-api", action="store_true", dest="generateApi", default=False, help="Generate API documentation.")
  parser.add_option("--print-files", action="store_true", dest="printFiles", default=False, help="Output known files.")
  parser.add_option("--print-modules", action="store_true", dest="printModules", default=False, help="Output known modules.")
  parser.add_option("--print-include", action="store_true", dest="printList", default=False, help="Output sorted file list.")

  # General options
  parser.add_option("-q", "--quiet", action="store_false", dest="verbose", default=False, help="Quiet output mode.")
  parser.add_option("-v", "--verbose", action="store_true", dest="verbose", help="Verbose output mode.")
  parser.add_option("--encoding", dest="encoding", default="utf-8", metavar="ENCODING", help="Defines the encoding used for output files.")
  parser.add_option("--add-new-lines", action="store_true", dest="addNewLines", default=False, help="Keep newlines in compiled files.")

  # Include/Exclude
  parser.add_option("-i", "--include", action="append", dest="include", help="Include ID")
  parser.add_option("-e", "--exclude", action="append", dest="exclude", help="Exclude ID")

  # Include/Exclude options
  parser.add_option("--disable-include-dependencies", action="store_false", dest="enableIncludeDependencies", default=True, help="Enable include dependencies.")
  parser.add_option("--disable-exclude-dependencies", action="store_false", dest="enableExcludeDependencies", default=True, help="Enable exclude dependencies.")
  parser.add_option("--disable-auto-dependencies", action="store_false", dest="enableAutoDependencies", default=True, help="Disable detection of dependencies.")

  # Compile options
  parser.add_option("--add-file-ids", action="store_true", dest="addFileIds", default=False, help="Add file IDs to compiled output.")
  parser.add_option("--compress-strings", action="store_true", dest="compressStrings", default=False, help="Compress Strings.")
  parser.add_option("--store-separate-scripts", action="store_true", dest="storeSeparateScripts", default=False, help="Store compiled javascript files separately, too.")

  # Source options
  parser.add_option("--script-source-uri", dest="scriptSourceUri", default="", metavar="URI", help="Defines the script source URI (or path).")

  # API options
  parser.add_option("--generate-json-api", action="store_true", dest="generateJsonApi", default=False, help="Generate JSON output in API documentation process.")
  parser.add_option("--generate-xml-api", action="store_true", dest="generateXmlApi", default=False, help="Generate XML output in API documentation process.")

  # Resource options
  parser.add_option("--resource-target", action="append", dest="resourceTargets", metavar="CLASSNAME.ID:DIRECTORY", default=[], help="Add source directory.")

  return parser






def argparser(cmdlineargs):

  # Parse arguments
  (options, args) = getparser().parse_args(cmdlineargs)

  # Export to file
  if options.exportToFile != None:
    print
    print "  EXPORTING:"
    print "----------------------------------------------------------------------------"

    print " * Translating options..."

    optionString = "# Exported configuration from build.py\n\n"
    ignoreValue = True
    lastWasKey = False

    for arg in cmdlineargs:
      if arg == "--export-to-file":
        ignoreValue = True

      elif arg.startswith("--"):
        if lastWasKey:
          optionString += "\n"

        optionString += arg[2:]
        ignoreValue = False
        lastWasKey = True

      elif arg.startswith("-"):
        print "   * Couldn't export short argument: %s" % arg
        optionString += "\n# Ignored short argument %s\n" % arg
        ignoreValue = True

      elif not ignoreValue:
        optionString += " = %s\n" % arg
        ignoreValue = True
        lastWasKey = False



    print " * Export to file: %s" % options.exportToFile
    exportFile = file(options.exportToFile, "w")
    exportFile.write(optionString)
    exportFile.flush()
    exportFile.close()

    sys.exit(0)

  # Read from file
  elif options.fromFile != None:

    print
    print "  INITIALIZATION:"
    print "----------------------------------------------------------------------------"

    print "  * Reading configuration..."

    # Convert file content into arguments
    fileargs = {}
    fileargpos = 0
    fileargid = "default"
    currentfileargs = []
    fileargs[fileargid] = currentfileargs

    for line in file(options.fromFile).read().split("\n"):
      line = line.strip()

      if line == "" or line.startswith("#") or line.startswith("//"):
        continue

      # Splitting line
      line = line.split("=")

      # Extract key element
      key = line.pop(0).strip()

      # Separate packages
      if key == "package":
        fileargpos += 1
        fileargid = line[0].strip()

        print "    - Found package: %s" % fileargid

        currentfileargs = []
        fileargs[fileargid] = currentfileargs
        continue

      key = "--%s" % key

      if len(line) > 0:
        line = line[0].split(",")

        for elem in line:
          currentfileargs.append(key)
          currentfileargs.append(elem.strip())

      else:
        currentfileargs.append(key)

    # Parse
    defaultargs = fileargs["default"]

    if len(fileargs) > 1:
      (fileDb, moduleDb) = load(getparser().parse_args(defaultargs)[0])

      for filearg in fileargs:
        if filearg == "default":
          continue

        print
        print
        print "**************************** Next Package **********************************"
        print "PACKAGE: %s" % filearg

        combinedargs = []
        combinedargs.extend(defaultargs)
        combinedargs.extend(fileargs[filearg])

        options = getparser().parse_args(combinedargs)[0]
        execute(fileDb, moduleDb, options, filearg)

    else:
      options = getparser().parse_args(defaultargs)[0]
      (fileDb, moduleDb) = load(options)
      execute(fileDb, moduleDb, options)

  else:
    print
    print "  INITIALIZATION:"
    print "----------------------------------------------------------------------------"

    print "  * Processing arguments..."

    (fileDb, moduleDb) = load(options)
    execute(fileDb, moduleDb, options)







def main():
  if len(sys.argv[1:]) == 0:
    basename = os.path.basename(sys.argv[0])
    print "usage: %s [options]" % basename
    print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
    sys.exit(1)

  argparser(sys.argv[1:])






def load(options):

  ######################################################################
  #  INITIAL CHECK
  ######################################################################

  if options.sourceDirectories == None or len(options.sourceDirectories) == 0:
    basename = os.path.basename(sys.argv[0])
    print "You must define at least one source directory!"
    print "usage: %s [options]" % basename
    print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
    sys.exit(1)
  else:
    # Normalizing directories
    i=0
    for directory in options.sourceDirectories:
      options.sourceDirectories[i] = os.path.normpath(options.sourceDirectories[i])
      i+=1

  print
  print "  LOADING:"
  print "----------------------------------------------------------------------------"









  ######################################################################
  #  PROCESSING FILES
  ######################################################################

  print "  * Processing files..."

  (fileDb, moduleDb) = loader.indexDirectories(options.sourceDirectories, options.verbose)

  print "  * Found %s files" % len(fileDb)

  if options.printFiles:
    print
    print "  KNOWN FILES:"
    print "----------------------------------------------------------------------------"
    print "  * These are all known files:"
    for fileEntry in fileDb:
      print "    - %s (%s)" % (fileEntry, fileDb[fileEntry]["path"])

  if options.printModules:
    print
    print "  KNOWN MODULES:"
    print "----------------------------------------------------------------------------"
    print "  * These are all known modules:"
    for moduleEntry in moduleDb:
      print "    * %s" % moduleEntry
      for fileEntry in moduleDb[moduleEntry]:
        print "      - %s" % fileEntry






  ######################################################################
  #  PLUGIN: AUTO DEPENDENCIES
  ######################################################################

  if options.enableAutoDependencies:
    print
    print "  AUTO DEPENDENCIES:"
    print "----------------------------------------------------------------------------"

    print "  * Collecting IDs..."

    knownIds = []

    for fileEntry in fileDb:
      knownIds.append(fileEntry)

    print "  * Detecting dependencies..."

    for fileEntry in fileDb:
      if options.verbose:
        print "    * %s" % fileEntry

      fileTokens = fileDb[fileEntry]["tokens"]
      fileDeps = []

      assembledName = ""

      for token in fileTokens:
        if token["type"] == "name" or token["type"] == "builtin":
          if assembledName == "":
            assembledName = token["source"]
          else:
            assembledName += ".%s" % token["source"]

          if assembledName in knownIds:
            if assembledName != fileEntry and not assembledName in fileDeps:
              fileDeps.append(assembledName)

            assembledName = ""

        elif not (token["type"] == "token" and token["source"] == "."):
          if assembledName != "":
            assembledName = ""

          if token["type"] == "string" and token["source"] in knownIds and token["source"] != fileEntry and not token["source"] in fileDeps:
            fileDeps.append(token["source"])

      # Updating lists...
      optionalDeps = fileDb[fileEntry]["optionalDeps"]
      loadtimeDeps = fileDb[fileEntry]["loadDeps"]
      runtimeDeps = fileDb[fileEntry]["runtimeDeps"]

      # Removing optional deps from list
      for dep in optionalDeps:
        if dep in fileDeps:
          fileDeps.remove(dep)

      # Checking loadtime dependencies
      for dep in loadtimeDeps:
        if not dep in fileDeps:
          print "    * Wrong load dependency %s in %s!" % (dep, fileEntry)

      # Checking runtime dependencies
      for dep in runtimeDeps:
        if not dep in fileDeps:
          print "    * Wrong runtime dependency %s in %s!" % (dep, fileEntry)

      # Adding new content to runtime dependencies
      for dep in fileDeps:
        if not dep in runtimeDeps and not dep in loadtimeDeps:
          runtimeDeps.append(dep)







  return fileDb, moduleDb







def execute(fileDb, moduleDb, options, pkgid=""):

  additionalOutput = []


  ######################################################################
  #  SORTING FILES
  ######################################################################

  print
  print "  LIST SORT:"
  print "----------------------------------------------------------------------------"

  if options.verbose:
    print "  * Include: %s" % options.include
    print "  * Exclude: %s" % options.exclude

  print "  * Sorting files..."

  sortedIncludeList = loader.getSortedList(options, fileDb, moduleDb)

  if options.printList:
    print
    print "  INCLUDE ORDER:"
    print "----------------------------------------------------------------------------"
    print "  * The files will be included in this order:"
    for key in sortedIncludeList:
      print "    - %s" % key







  ######################################################################
  #  PLUGIN: COMPRESS STRINGS
  ######################################################################

  if options.compressStrings:
    print
    print "  STRING COMPRESSION (ALPHA!!!):"
    print "----------------------------------------------------------------------------"

    print "  * Searching for string instances..."

    compressedStrings = {}

    for fileId in sortedIncludeList:
      if options.verbose:
        print "    - %s" % fileId

      for token in fileDb[fileId]["tokens"]:
        if token["type"] != "string":
          continue

        if token["detail"] == "doublequotes":
          compressSource = "\"%s\"" % token["source"]
        else:
          compressSource = "'%s'" % token["source"]

        if not compressedStrings.has_key(compressSource):
          compressedStrings[compressSource] = 1
        else:
          compressedStrings[compressSource] += 1


    if options.verbose:
      print "  * Sorting strings..."

    compressedList = []

    for compressSource in compressedStrings:
      compressedList.append({ "source" : compressSource, "usages" : compressedStrings[compressSource] })

    pos = 0
    while pos < len(compressedList):
      item = compressedList[pos]
      if item["usages"] <= 1:
        compressedList.remove(item)

      else:
        pos += 1

    compressedList.sort(lambda x, y: y["usages"]-x["usages"])

    print "  * Found %s string instances" % len(compressedList)

    if options.verbose:
      print "  * Building replacement map..."

    compressMap = {}
    compressCounter = 0
    compressJavaScript = "QXS%s=[" % pkgid

    for item in compressedList:
      if compressCounter != 0:
        compressJavaScript += ","

      compressMap[item["source"]] = compressCounter
      compressCounter += 1
      compressJavaScript += item["source"]

    compressJavaScript += "];"

    additionalOutput.append(compressJavaScript)

    print "  * Updating tokens..."

    for fileId in sortedIncludeList:
      if options.verbose:
        print "    - %s" % fileId

      for token in fileDb[fileId]["tokens"]:
        if token["type"] != "string":
          continue

        if token["detail"] == "doublequotes":
          compressSource = "\"%s\"" % token["source"]
        else:
          compressSource = "'%s'" % token["source"]

        if compressSource in compressMap:
          token["source"] = "QXS%s[%s]" % (pkgid, compressMap[compressSource])
          token["detail"] = "compressed"





  ######################################################################
  #  PLUGIN: STORE TOKENS
  ######################################################################

  if options.storeTokens:

    if options.tokenOutputDirectory == None:
      print "    * You must define the token directory!"
      sys.exit(1)

    else:
      options.tokenOutputDirectory = os.path.normpath(options.tokenOutputDirectory)

      # Normalizing directory
      if not os.path.exists(options.tokenOutputDirectory):
        os.makedirs(options.tokenOutputDirectory)

    print "  * Storing tokens..."

    for fileId in sortedIncludeList:
      if options.verbose:
        print "    - %s" % fileId

      tokenString = tokenizer.convertTokensToString(fileDb[fileId]["tokens"])
      tokenSize = len(tokenString) / 1000.0

      if options.verbose:
        print "    * writing tokens to file (%s KB)..." % tokenSize

      tokenFileName = os.path.join(options.tokenOutputDirectory, fileId + config.TOKENEXT)

      tokenFile = file(tokenFileName, "w")
      tokenFile.write(tokenString)
      tokenFile.flush()
      tokenFile.close()




  ######################################################################
  #  GENERATE API
  ######################################################################

  if options.generateApi:
    print
    print "  GENERATE API:"
    print "----------------------------------------------------------------------------"

    if options.apiOutputDirectory == None:
      print "    * You must define the API output directory!"
      sys.exit(1)

    else:
      options.apiOutputDirectory = os.path.normpath(options.apiOutputDirectory)

      # Normalizing directory
      if not os.path.exists(options.apiOutputDirectory):
        os.makedirs(options.apiOutputDirectory)

    docTree = None

    print "  * Generating API tree..."

    for fileId in fileDb:
      if options.verbose:
        print "  - %s" % fieId

      docTree = docgenerator.createDoc(fileDb[fileId]["tree"], docTree)

    if docTree:
      print "  * Finalising tree..."
      docgenerator.postWorkPackage(docTree, docTree)

    print "  * Writing API files..."

    if options.generateXmlApi:
      jsonContent = tree.nodeToXmlString(docTree)

      filetool(options.apiOutputDirectory, options.xmlApiOutputFilename, jsonContent, options.encoding)

    if options.generateJsonApi:
      xmlContent = "<?xml version=\"1.0\" encoding=\"" + options.encoding + "\"?>\n\n"
      xmlContent += tree.nodeToJsonString(docTree)

      filetool(options.apiOutputDirectory, options.jsonApiOutputFilename, xmlContent, options.encoding)





  ######################################################################
  #  COPY RESOURCES
  ######################################################################

  if options.copyResources:

    print
    print "  COPY RESOURCES:"
    print "----------------------------------------------------------------------------"

    print "  * Preparing target configuration..."

    targets = []

    for target in options.resourceTargets:
      # fileId.resourceId:destinationDirectory

      cur = {}
      targets.append(cur)

      targetSplit = target.split(":")
      targetStart = targetSplit.pop(0)

      cur["destinationFileDirectory"] = ":".join(targetSplit)

      targetStartSplit = targetStart.split(".")

      cur["resourceId"] = targetStartSplit.pop()
      cur["fileId"] = ".".join(targetStartSplit)

    print "  * Syncing..."

    for fileId in sortedIncludeList:
      filePath = fileDb[fileId]["path"]
      fileContent = fileDb[fileId]["content"]
      fileResourceList = loader.extractResources(fileContent)

      if len(fileResourceList) > 0:
        print "    - Found %i resources in %s" % (len(fileResourceList), fileId)

        for fileResource in fileResourceList:
          fileResourceSplit = fileResource.split(":")

          resourceId = fileResourceSplit.pop(0)
          sourceFileDirectory = ":".join(fileResourceSplit)

          for target in targets:
            if fileId != target["fileId"] or resourceId != target["resourceId"]:
              continue

            destinationFileDirectory = target["destinationFileDirectory"]

            print "    - Sync: %s => %s" % (sourceFileDirectory, destinationFileDirectory)

            for root, dirs, files in os.walk(sourceFileDirectory):

              # Filter ignored directories
              for ignoredDir in config.DIRIGNORE:
                if ignoredDir in dirs:
                  dirs.remove(ignoredDir)

              # Searching for items (resource files)
              for itemName in files:

                # Generate absolute source file path
                itemSourcePath = os.path.join(root, itemName)

                # Extract relative path and directory
                itemRelPath = itemSourcePath.replace(sourceFileDirectory + os.sep, "")
                itemRelDir = os.path.dirname(itemRelPath)

                # Generate destination directory and file path
                itemDestDir = os.path.join(destinationFileDirectory, itemRelDir)
                itemDestPath = os.path.join(itemDestDir, itemName)

                # Check/Create destination directory
                if not os.path.exists(itemDestDir):
                  os.makedirs(itemDestDir)

                # Copy file
                if options.verbose:
                  print "      - Copy: %s => %s" % (itemSourcePath, itemDestPath)

                shutil.copyfile(itemSourcePath, itemDestPath)






  ######################################################################
  #  SETTINGS
  ######################################################################

  if options.generateSource or options.compileSource:
    print
    print "  GENERATING SETTINGS:"
    print "----------------------------------------------------------------------------"

    print "  * Processing input data..."

    TypeFloat = re.compile("^([0-9\-]+\.[0-9]+)$")
    TypeNumber = re.compile("^([0-9\-])$")

    settingsStr = ""

    # If you change this, change this in qx.Settings and qx.OO, too.
    settingsStr += 'if(typeof qx==="undefined"){var qx={_UNDEFINED:"undefined",_LOADSTART:(new Date).valueOf()};}'

    if options.addNewLines:
      settingsStr += "\n"

    # If you change this, change this in qx.Settings, too.
    settingsStr += 'if(typeof qx.Settings===qx._UNDEFINED){qx.Settings={_userSettings:{},_defaultSettings:{}};}'

    if options.addNewLines:
      settingsStr += "\n"

    for setting in options.setting:
      settingSplit = setting.split(":")
      settingKey = settingSplit.pop(0)
      settingValue = ":".join(settingSplit)

      settingKeySplit = settingKey.split(".")
      settingKeyName = settingKeySplit.pop()
      settingKeySpace = ".".join(settingKeySplit)

      checkStr = 'if(typeof qx.Settings._userSettings["%s"]===qx._UNDEFINED){qx.Settings._userSettings["%s"]={};}' % (settingKeySpace, settingKeySpace)
      if not checkStr in settingsStr:
        settingsStr += checkStr

        if options.addNewLines:
          settingsStr += "\n"

      settingsStr += 'qx.Settings._userSettings["%s"]["%s"]=' % (settingKeySpace, settingKeyName)

      if settingValue == "false" or settingValue == "true" or TypeFloat.match(settingValue) or TypeNumber.match(settingValue):
        settingsStr += '%s' % settingValue

      else:
        settingsStr += '"%s"' % settingValue.replace("\"", "\\\"")

      settingsStr += ";"

      if options.addNewLines:
        settingsStr += "\n"











  ######################################################################
  #  SOURCE
  ######################################################################

  if options.generateSource:
    print
    print "  GENERATING SOURCE VERSION:"
    print "----------------------------------------------------------------------------"

    if options.sourceOutputDirectory == None:
      print "    * You must define the source output directory!"
      sys.exit(1)

    else:
      options.sourceOutputDirectory = os.path.normpath(options.sourceOutputDirectory)

    print "  * Generating includer..."

    sourceOutput = settingsStr

    if sourceOutput != "" and options.addNewLines:
      settingsStr += "\n"

    if options.addNewLines:
      for fileId in sortedIncludeList:
        sourceOutput += 'document.write(\'<script type="text/javascript" src="%s%s"></script>\');\n' % (os.path.join(options.scriptSourceUri, fileId.replace(".", os.sep)), config.JSEXT)

    else:
      includeCode = ""
      for fileId in sortedIncludeList:
        includeCode += '<script type="text/javascript" src="%s%s"></script>' % (os.path.join(options.scriptSourceUri, fileId.replace(".", os.sep)), config.JSEXT)
      sourceOutput += "document.write('%s');" % includeCode

    # Store file
    filetool(options.sourceOutputDirectory, options.sourceOutputFilename, sourceOutput, options.encoding)






  ######################################################################
  #  COMPILE
  ######################################################################

  if options.compileSource:
    print
    print "  GENERATING COMPILED VERSION:"
    print "----------------------------------------------------------------------------"

    if options.compileSource:
      compiledOutput = ""

      print "  * Compiling tokens..."

      if options.compileOutputDirectory == None:
        print "    * You must define the compile directory!"
        sys.exit(1)

      else:
        options.compileOutputDirectory = os.path.normpath(options.compileOutputDirectory)

      for fileId in sortedIncludeList:
        if options.verbose:
          print "    - %s" % fileId

        compiledFileContent = compile.compile(fileDb[fileId]["tokens"], options.addNewLines)

        if options.addFileIds:
          compiledOutput += "/* ID: " + fileId + " */\n" + compiledFileContent + "\n"
        else:
          compiledOutput += compiledFileContent

        if options.storeSeparateScripts:
          if options.verbose:
            print "      * writing compiled file..."
          filetool(options.compileOutputDirectory, fileId.replace(".", os.path.sep) + config.JSEXT, compiledFileContent, options.encoding)

      print "  * Saving compiled output %s..." % options.compileOutputFilename
      filetool(options.compileOutputDirectory, options.compileOutputFilename, settingsStr + "".join(additionalOutput) + compiledOutput, options.encoding)







######################################################################
#  MAIN LOOP
######################################################################

if __name__ == '__main__':
  try:
    main()

  except KeyboardInterrupt:
    print "  * Keyboard Interrupt"
    sys.exit(1)
