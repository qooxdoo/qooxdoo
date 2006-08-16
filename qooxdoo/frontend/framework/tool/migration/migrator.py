#!/usr/bin/env python

import sys, re, os, optparse
import config



def start(infoList, patchList, fileList, options):

  print "  * Starting..."
  print "    - File number: %s" % len(fileList)
  print "    - Info number: %s" % len(infoList)
  print "    - Patch number: %s" % len(patchList)





def handle(options):
  inputPaths = options.input

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
      infoList.append(filePath)
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
      patchList.append(filePath)
      if options.verbose:
        print "    - %s" % filePath



  print "  * Scanning input directories..."

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
        fileList.append(filePath)
        if options.verbose:
          print "    - %s" % filePath




  start(infoList, patchList, fileList, options)





def main():
  parser = optparse.OptionParser("usage: %prog [options]")

  # Required options
  parser.add_option("--input", action="append", dest="input", metavar="DIRECTORY", type="string", default=[], help="Define a input directory.")
  parser.add_option("--version", action="store", dest="version", metavar="VERSION", type="string", help="Define the version to switch to.")

  # General options
  parser.add_option("-q", "--quiet", action="store_false", dest="verbose", default=False, help="Quiet output mode.")
  parser.add_option("-v", "--verbose", action="store_true", dest="verbose", help="Verbose output mode.")

  (options, args) = parser.parse_args(sys.argv[1:])

  if options.input == None:
    print "  * You must define a input directory!"
    sys.exit(1)

  if options.version == None:
    print "  * You must define a version string!"
    sys.exit(1)

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
