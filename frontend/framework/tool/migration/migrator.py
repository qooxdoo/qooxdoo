#!/usr/bin/env python

import sys, re, os, optparse, codecs
import config



def entryCompiler(line):
  # protect escaped equal symbols
  line = line.replace("\=", "----EQUAL----")

  splitLine = line.split("=")
  key = splitLine[0]
  repl = splitLine[1]

  #print "%s :: %s" % (key, value)

  # recover protected equal symbols
  key = key.replace("----EQUAL----", "=")

  return {"reg":re.compile(key), "repl":repl}





def start(infoList, patchList, fileList, options):

  print "  * Starting..."
  print "    - Number of input files: %s" % len(fileList)
  print "    - Number of info files: %s" % len(infoList)
  print "    - Number of patch files: %s" % len(patchList)

  print "  * Compiling..."

  emptyLine = re.compile("^\s*$")

  compiledInfos = []
  compiledPatches = []

  for infoFile in infoList:
    print "    - %s" % os.path.basename(infoFile["path"])
    for line in infoFile["content"]:
      if emptyLine.match(line) or line.startswith("#") or line.startswith("//"):
        continue

      compiledInfos.append({"cfg":line,"reg":entryCompiler(line)})


  for patchFile in patchList:
    print "    - %s" % os.path.basename(patchFile["path"])
    for line in patchFile["content"]:
      if emptyLine.match(line) or line.startswith("#") or line.startswith("//"):
        continue

      compiledPatches.append({"cfg":line,"comp":entryCompiler(line)})


  print "  * Statistics"
  print "    - Number of infos: %s" % len(compiledInfos)
  print "    - Number of patches: %s" % len(compiledPatches)

  print "  * Processing:"

  for inputFile in fileList:
    print "    - %s" % inputFile["path"]

    for fileLine in inputFile["content"]:
      for patchEntry in compiledPatches:
        if patchEntry["comp"]["reg"].search(fileLine):
          print "      - Matches %s" % patchEntry["cfg"]











def handle(options):
  inputPaths = options.input
  inputEncodings = options.encoding

  print "  * Input directories:"
  for inputPath in inputPaths:
    print "    - %s" % inputPath

  print "  * Update to version: %s" % options.version

  confPath = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), options.version)
  infoPath = os.path.join(confPath, "info")
  patchPath = os.path.join(confPath, "patches")


  infoList = []
  patchList = []
  fileList = []




  print "  * Searching for info data..."

  for root, dirs, files in os.walk(infoPath):

    # Filter ignored directories
    for ignoredDir in config.DIRIGNORE:
      if ignoredDir in dirs:
        dirs.remove(ignoredDir)

    # Searching for files
    for fileName in files:
      filePath = os.path.join(root, fileName)

      fileObject = codecs.open(filePath, "r", "utf-8")
      infoList.append({"path":filePath, "content":fileObject.read().split("\n")})

      if options.verbose:
        print "    - %s" % filePath



  print "  * Searching for patch data..."

  for root, dirs, files in os.walk(patchPath):

    # Filter ignored directories
    for ignoredDir in config.DIRIGNORE:
      if ignoredDir in dirs:
        dirs.remove(ignoredDir)

    # Searching for files
    for fileName in files:
      filePath = os.path.join(root, fileName)

      fileObject = codecs.open(filePath, "r", "utf-8")
      patchList.append({"path":filePath, "content":fileObject.read().split("\n")})

      if options.verbose:
        print "    - %s" % filePath



  print "  * Scanning input directories..."

  indexPos = 0
  for inputPath in inputPaths:
    for root, dirs, files in os.walk(inputPath):

      # Filter ignored directories
      for ignoredDir in config.DIRIGNORE:
        if ignoredDir in dirs:
          dirs.remove(ignoredDir)

      # Searching for files
      for fileName in files:
        if not os.path.splitext(fileName)[1] in config.EXTINCLUDE:
          continue

        filePath = os.path.join(root, fileName)

        if len(inputEncodings) > indexPos:
          fileEncoding = inputEncodings[indexPos]
        else:
          fileEncoding = "utf-8"

        fileObject = codecs.open(filePath, "r", fileEncoding)

        try:
          fileContent = fileObject.read().split("\n")
        except ValueError:
          print "    * Invalid Encoding. Required encoding: %s in %s" % (fileEncoding, filePath)
          print "        => Ignore file"
          continue

        fileList.append({"path":filePath,"encoding":fileEncoding,"content":fileContent})
        if options.verbose:
          print "    - %s" % filePath

    indexPos += 1


  start(infoList, patchList, fileList, options)









def main():
  # Initialize new parser
  parser = optparse.OptionParser("usage: %prog [options]")

  # Add required options
  parser.add_option("--input", action="append", dest="input", metavar="DIRECTORY", type="string", default=[], help="Define a input directory.")
  parser.add_option("--encoding", action="append", dest="encoding", metavar="ENCODING", type="string", default=[], help="Define the encoding for a script input directory.")
  parser.add_option("--version", action="store", dest="version", metavar="VERSION", type="string", help="Define the version to switch to.")

  # Add general options
  parser.add_option("-q", "--quiet", action="store_false", dest="verbose", default=False, help="Quiet output mode.")
  parser.add_option("-v", "--verbose", action="store_true", dest="verbose", help="Verbose output mode.")

  # Parse incoming arguments
  (options, args) = parser.parse_args(sys.argv[1:])

  # Verification
  if options.input == None:
    print "  * You must define a input directory!"
    sys.exit(1)

  if options.version == None:
    print "  * You must define a version string!"
    sys.exit(1)

  # Start migration preparations
  handle(options)













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
