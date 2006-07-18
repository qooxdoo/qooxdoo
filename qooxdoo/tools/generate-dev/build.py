#!/usr/bin/env python

import sys, string, re, os, random, shutil, optparse
import config, tokenizer, loader, compile



def getparser():
  parser = optparse.OptionParser("usage: %prog [options]")

  # From file
  parser.add_option("--from-file", dest="fromFile", metavar="CONFIG_FILE", help="Read options from CONFIG_FILE.")

  # Directories
  parser.add_option("-s", "--source-directory", action="append", dest="sourceDirectories", metavar="DIRECTORY", default=[], help="Add source directory.")
  parser.add_option("--token-directory", dest="tokenDirectory", metavar="DIRECTORY", help="Define output directory for tokenized source files.")
  parser.add_option("--compile-directory", dest="compileDirectory", metavar="DIRECTORY", help="Define output directory for compiled source files.")

  # Actions
  parser.add_option("-c", "--compile-source", action="store_true", dest="compileSource", default=False, help="Compile source files.")
  parser.add_option("-r", "--copy-resources", action="store_true", dest="copyResources", default=False, help="Copy resource files.")
  parser.add_option("--store-tokens", action="store_true", dest="storeTokens", default=False, help="Store tokenized content of source files.")
  parser.add_option("--output-files", action="store_true", dest="outputFiles", default=False, help="Output known files.")
  parser.add_option("--output-modules", action="store_true", dest="outputModules", default=False, help="Output known modules.")
  parser.add_option("--output-list", action="store_true", dest="outputList", default=False, help="Output sorted file list.")

  # General options
  parser.add_option("-q", "--quiet", action="store_false", dest="verbose", default=False, help="Quiet output mode.")
  parser.add_option("-v", "--verbose", action="store_true", dest="verbose", help="Verbose output mode.")

  # Include/Exclude
  parser.add_option("-i", "--include", action="append", dest="include", help="Include ID")
  parser.add_option("-e", "--exclude", action="append", dest="exclude", help="Exclude ID")
  parser.add_option("--disable-include-deps", action="store_false", dest="enableIncludeDeps", default=True, help="Enable include dependencies.")
  parser.add_option("--disable-exclude-deps", action="store_false", dest="enableExcludeDeps", default=True, help="Enable exclude dependencies.")

  # Compile options
  parser.add_option("--store-separate-scripts", action="store_true", dest="storeSeparateScripts", default=False, help="Store compiled javascript files separately, too.")
  parser.add_option("--compile-with-new-lines", action="store_true", dest="compileWithNewLines", default=False, help="Keep newlines in compiled files.")
  parser.add_option("--compile-output-name", dest="compileOutputName", default="qooxdoo.js", metavar="FILENAME", help="Name of output file from compiler")
  parser.add_option("--add-file-ids", action="store_true", dest="addFileIds", default=False, help="Add file IDs to compiled output.")

  return parser



def argparser(cmdlineargs):

  # Parse arguments
  (options, args) = getparser().parse_args(cmdlineargs)

  # Read from file
  if options.fromFile == None:

    execute(options)

  else:

    # Convert file content into arguments
    fileargs = []
    fileargpos = 0

    for line in file(options.fromFile).read().split("\n"):
      if len(fileargs) <= fileargpos:
        currentfileargs = []
        fileargs.append(currentfileargs)

      line = line.strip()

      if line == "" or line.startswith("#") or line.startswith("//"):
        continue

      line = line.split("=")
      key = line.pop(0).strip()

      # Separate packages
      if key == "package":
        fileargpos += 1
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
    if len(fileargs) > 1:
      # Combine basearg later with the current args
      basearg = fileargs.pop(0)
      for filearg in fileargs:
        combinedargs = []
        combinedargs.extend(basearg)
        combinedargs.extend(filearg)
        execute(getparser().parse_args(combinedargs)[0])

    else:
      execute(getparser().parse_args(fileargs[0])[0])







def main():
  if len(sys.argv[1:]) == 0:
    basename = os.path.basename(sys.argv[0])
    print "usage: %s [options]" % basename
    print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
    sys.exit(1)

  argparser(sys.argv[1:])








def execute(options):
  if options.sourceDirectories == None or len(options.sourceDirectories) == 0:
    basename = os.path.basename(sys.argv[0])
    print "You must define at least one source directory!"
    print "usage: %s [options]" % basename
    print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
    sys.exit(1)


  print
  print "  PREPARING:"
  print "***********************************************************************************************"

  print "  * Loading source directory content..."

  # Normalizing directories
  i=0
  for directory in options.sourceDirectories:
    options.sourceDirectories[i] = os.path.normpath(options.sourceDirectories[i])
    i+=1

  scanResult = loader.scanAll(options.sourceDirectories)
  sortedIncludeList = loader.getSortedList(options, scanResult)





  if options.outputFiles:
    print
    print "  KNOWN FILES:"
    print "***********************************************************************************************"
    for key in scanResult["files"]:
      print "  %s (%s)" % (key, scanResult["files"][key])

  if options.outputModules:
    print
    print "  KNOWN MODULES:"
    print "***********************************************************************************************"
    for pkg in scanResult["modules"]:
      print "  * %s" % pkg
      for key in scanResult["modules"][pkg]:
        print "    - %s" % key

  if options.outputList:
    print
    print "  INCLUDE ORDER:"
    print "***********************************************************************************************"
    for key in sortedIncludeList:
      print "  * %s" % key




  if options.copyResources:
    print
    print "  COPY RESOURCES:"
    print "***********************************************************************************************"
    for fileId in sortedIncludeList:
      filePath = scanResult["files"][fileId]
      fileContent = file(filePath, "r").read()
      fileResourceList = loader.extractResources(fileContent)

      if len(fileResourceList) > 0:
        print "  * Found %i resources in %s" % (len(fileResourceList), fileId)

        for fileResource in fileResourceList:
          resourceId = fileId + "." + fileResource
          resourcePath = resourceId.replace(".", os.sep)

          if options.verbose:
            print "    * ResourcePath: %s" % resourcePath

          sourceDir = os.path.join(os.path.dirname(filePath), fileResource)
          destDir = os.path.join(options.compileDirectory, resourcePath)

          for root, dirs, files in os.walk(sourceDir):

            # Filter ignored directories
            for ignoredDir in config.DIRIGNORE:
              if ignoredDir in dirs:
                dirs.remove(ignoredDir)

            # Searching for items (resource files)
            for itemName in files:

              # Generate absolute source file path
              itemSourcePath = os.path.join(root, itemName)

              # Extract relative path and directory
              itemRelPath = itemSourcePath.replace(sourceDir + os.sep, "")
              itemRelDir = os.path.dirname(itemRelPath)

              # Generate destination directory and file path
              itemDestDir = os.path.join(destDir, itemRelDir)
              itemDestPath = os.path.join(itemDestDir, itemName)

              # Check/Create destination directory
              if not os.path.exists(itemDestDir):
                os.makedirs(itemDestDir)

              # Copy file
              shutil.copyfile(itemSourcePath, itemDestPath)





  if options.compileSource or options.storeTokens:
    print
    print "  TRANSFORMING SOURCE:"
    print "***********************************************************************************************"

    print "  * Creating needed directories..."

    if options.storeTokens:
      if options.tokenDirectory == None:
        print "    * You must define the token directory!"
        sys.exit(1)

      else:
        options.tokenDirectory = os.path.normpath(options.tokenDirectory)

        # Normalizing directory
        if not os.path.exists(options.tokenDirectory):
          os.makedirs(options.tokenDirectory)

    if options.compileSource or options.copyResources:
      if options.compileDirectory == None:
        print "    * You must define the build directory!"
        sys.exit(1)

      else:
        options.compileDirectory = os.path.normpath(options.compileDirectory)

        # Normalizing directory
        if not os.path.exists(options.compileDirectory):
          os.makedirs(options.compileDirectory)




    compAllString = ""

    for fileId in sortedIncludeList:
      print "  * %s" % fileId

      if options.verbose:
        print "    * reading..."

      fileName = scanResult["files"][fileId]
      fileContent = file(fileName, "r").read()
      fileSize = len(fileContent) / 1000.0

      if options.verbose:
        print "    * tokenizing source (%s KB)..." % fileSize

      tokens = tokenizer.parseStream(fileContent, fileId)

      if options.storeTokens:
        tokenString = tokenizer.convertTokensToString(tokens)
        tokenSize = len(tokenString) / 1000.0

        if options.verbose:
          print "    * writing tokens to file (%s KB)..." % tokenSize

        tokenFileName = os.path.join(options.tokenDirectory, fileId + config.TOKENEXT)

        tokenFile = file(tokenFileName, "w")
        tokenFile.write(tokenString)
        tokenFile.flush()
        tokenFile.close()

      if options.compileSource:
        if options.verbose:
          print "    * compiling..."

        compString = compile.compile(tokens, options.compileWithNewLines)

        if options.addFileIds:
          compAllString += "/* ID: " + fileId + " */\n" + compString + "\n"
        else:
          compAllString += compString

        compSize = len(compString) / 1000.0
        compFactor = 100 - (compSize / fileSize * 100)

        if options.verbose:
          print "    * compression %i%% (%s KB)" % (compFactor, compSize)

        if options.storeSeparateScripts:
          if options.verbose:
            print "    * writing compiled file..."

          compFileName = os.path.join(options.compileDirectory, fileId.replace(".", os.path.sep) + config.JSEXT)
          compFileDir = os.path.dirname(compFileName)

          # Check/Create destination directory
          if not os.path.exists(compFileDir):
            os.makedirs(compFileDir)

          compFile = file(compFileName, "w")
          compFile.write(compString)
          compFile.flush()
          compFile.close()

    if options.compileSource:
      compFileName = os.path.join(options.compileDirectory, options.compileOutputName)

      compFile = file(compFileName, "w")
      compFile.write(compAllString)
      compFile.flush()
      compFile.close()




if __name__ == '__main__':
  try:
    main()

  except KeyboardInterrupt:
    print "  * Keyboard Interrupt"
    sys.exit(1)
