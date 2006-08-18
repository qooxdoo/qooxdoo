#!/usr/bin/env python

import sys, re, os, optparse, codecs


DIRIGNORE = [ ".svn", "CVS" ]
EXTINCLUDE = [ ".php", ".asp", ".jsp", ".html", ".htm", ".js" ]


def entryCompiler(line):
  # protect escaped equal symbols
  line = line.replace("\=", "----EQUAL----")

  splitLine = line.split("=")
  orig = splitLine[0].strip()
  repl = splitLine[1].strip()

  #print "%s :: %s" % (orig, value)

  # recover protected equal symbols
  orig = orig.replace("----EQUAL----", "=")

  return {"expr":re.compile(orig), "orig":orig, "repl":repl}




def regtool(content, regs, patch, options):
  for patchEntry in regs:
    matches = patchEntry["expr"].findall(content)
    itercontent = content
    line = 1

    for fragment in matches:
      # Search for first match position
      pos = itercontent.find(fragment)
      pos = patchEntry["expr"].search(itercontent).start()

      # Update current line
      line += len((itercontent[:pos] + fragment).split("\n")) - 1

      # Removing leading part til matching part
      itercontent = itercontent[pos+len(fragment):]

      # Debug
      if options.verbose:
        print "      - Matches %s in %s" % (patchEntry["orig"], line)

      # Replacing
      if patch:
        content = patchEntry["expr"].sub(patchEntry["repl"], content, 1)
      else:
        print "      - line %s : (%s)" % (line, patchEntry["orig"])
        print "        %s" % patchEntry["repl"]


  return content





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

      compiledInfos.append(entryCompiler(line))


  for patchFile in patchList:
    print "    - %s" % os.path.basename(patchFile["path"])
    for line in patchFile["content"]:
      if emptyLine.match(line) or line.startswith("#") or line.startswith("//"):
        continue

      compiledPatches.append(entryCompiler(line))


  print "  * Statistics"
  print "    - Number of infos: %s" % len(compiledInfos)
  print "    - Number of patches: %s" % len(compiledPatches)

  print
  print "  FILE PROCESSING:"
  print "----------------------------------------------------------------------------"

  print "  * Processing:"

  for inputFile in fileList:
    print
    print "    * %s" % inputFile["path"]

    content = inputFile["content"]

    content = regtool(content, compiledPatches, True, options)
    content = regtool(content, compiledInfos, False, options)

    outname = inputFile["path"] + options.extension

    if inputFile["content"] != content:
      if options.extension == "":
        print "      - Overwrite original file"
      else:
        print "      - Saving changes to: %s" % outname

      outputFile = file(outname, "w")
      outputFile.write(content.encode(inputFile["encoding"]))
      outputFile.flush()
      outputFile.close()

    else:
      print "      - No changes"

  print "  * Done"







def handle(options):
  print
  print "  PREPARATION:"
  print "----------------------------------------------------------------------------"

  inputPaths = options.input
  inputEncodings = options.encoding

  print "  * Input directories:"
  for inputPath in inputPaths:
    print "    - %s" % inputPath

  print "  * Update to version: %s" % options.version

  confPath = os.path.join(os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "data"), options.version)
  infoPath = os.path.join(confPath, "info")
  patchPath = os.path.join(confPath, "patches")


  infoList = []
  patchList = []
  fileList = []




  print "  * Searching for info data..."

  for root, dirs, files in os.walk(infoPath):

    # Filter ignored directories
    for ignoredDir in DIRIGNORE:
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
    for ignoredDir in DIRIGNORE:
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
  errorFlag = False
  for inputPath in inputPaths:
    for root, dirs, files in os.walk(inputPath):

      # Filter ignored directories
      for ignoredDir in DIRIGNORE:
        if ignoredDir in dirs:
          dirs.remove(ignoredDir)

      # Searching for files
      for fileName in files:
        if not os.path.splitext(fileName)[1] in EXTINCLUDE:
          continue

        filePath = os.path.join(root, fileName)

        if len(inputEncodings) > indexPos:
          fileEncoding = inputEncodings[indexPos]
        else:
          fileEncoding = "utf-8"

        fileObject = codecs.open(filePath, "r", fileEncoding)

        try:
          fileContent = fileObject.read()

        except ValueError:
          print "    * Invalid Encoding. Required encoding: %s in %s" % (fileEncoding, filePath)
          errorFlag = True
          continue

        fileList.append({"path":filePath,"encoding":fileEncoding,"content":fileContent})
        if options.verbose:
          print "    - %s" % filePath

    indexPos += 1

  if errorFlag:
    print "  * Exiting due to errors."
    sys.exit(1)

  start(infoList, patchList, fileList, options)









def main():
  print
  print "  INITIALIZATION:"
  print "----------------------------------------------------------------------------"

  print "  * Processing arguments..."

  # Initialize new parser
  parser = optparse.OptionParser("usage: %prog [options]")

  # Add required options
  parser.add_option("--input", action="append", dest="input", metavar="DIRECTORY", type="string", default=[], help="Define a input directory. Multiple --input are supported.")
  parser.add_option("--encoding", action="append", dest="encoding", metavar="ENCODING", type="string", default=[], help="Define the encoding for a script input directory (default: utf-8).")
  parser.add_option("--version", action="store", dest="version", metavar="VERSION", type="string", help="Define the version number to switch to, e.g. 0.6")
  parser.add_option("--extension", action="store", dest="extension", metavar="EXTENSION", type="string", default="", help="File extension of new file(s), leave empty to overwrite original file(s)")

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
