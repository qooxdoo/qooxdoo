#!/usr/bin/env python

import sys, string, re, os, random
import config, tokenizer, loader



def printHelp():
  print

  # Help
  print "  HELP"
  print "***********************************************************************************************"
  print "  -h,  --help                       show this help screen"
  print

  # Jobs
  print "  -b,  --generate-build             generate build version"
  print "  -f,  --print-files                print known files"
  print "  -p,  --print-packages             print known packages"
  print "  -s,  --print-sorted               print sorted include list"
  print

  # Include/Exclude
  print "  -i,  --include <LIST>             comma seperated include list"
  print "  -e,  --exclude <LIST>             comma seperated exclude list"
  print "       --disable-include-deps       disable include dependencies"
  print "       --disable-exclude-deps       disable exclude dependencies"
  print

  # Directories
  print "       --source-directories <LIST>  comma separated list with source directories"
  print "       --output-tokenized <DIR>     destination directory of tokenized files"
  print "       --output-build <DIR>         destination directory of build files"
  print





def main():
  cmds = {}

  # Source
  cmds["source"] = ["source/script", "source/themes"]

  # Output
  cmds["outputTokenized"] = "build/tokens"
  cmds["outputBuild"] = "build/script"

  # Jobs
  cmds["generateBuild"] = False
  cmds["generateTokenized"] = False
  cmds["printKnownFiles"] = False
  cmds["printKnownPackages"] = False
  cmds["printSortedIdList"] = False

  # Include/Exclude
  cmds["include"] = []
  cmds["exclude"] = []
  cmds["ignoreIncludeDeps"] = False
  cmds["ignoreExcludeDeps"] = False




  if "-h" in sys.argv or "--help" in sys.argv or len(sys.argv) == 1:
    printHelp()
    return



  i = 1
  while i < len(sys.argv):
    c = sys.argv[i]

    # Source
    if c == "--source-directories":
      cmds["source"] = sys.argv[i+1].split(",")

      if "" in cmds["source"]:
        cmds["source"].remove("")
      i += 1



    # Output
    elif c == "--output-tokenized":
      cmds["outputTokenized"] = sys.argv[i+1]
      i += 1

    elif c == "--output-build":
      cmds["outputBuild"] = sys.argv[i+1]
      i += 1




    # Jobs
    elif c == "-b" or c == "--generate-build":
      cmds["generateBuild"] = True

    elif c == "-t" or c == "--generate-tokenized":
      cmds["generateTokenized"] = True

    elif c == "-f" or c == "--print-files":
      cmds["printKnownFiles"] = True

    elif c == "-p" or c == "--print-packages":
      cmds["printKnownPackages"] = True

    elif c == "-s" or c == "--print-sorted":
      cmds["printSortedIdList"] = True



    # Include/Exclude
    elif c == "-i" or c == "--include":
      if len(sys.argv) <= i+1:
        print ">>> Missing parameter(s) to include"
        printHelp()
        return

      cmds["include"] = sys.argv[i+1].split(",")
      i += 1

    elif c == "-e" or c == "--exclude":
      if len(sys.argv) <= i+1:
        print ">>> Missing parameter(s) to exclude"
        printHelp()
        return

      cmds["exclude"] = sys.argv[i+1].split(",")
      i += 1

    elif c == "--disable-include-deps":
      cmds["ignoreIncludeDeps"] = True

    elif c == "--disable-exclude-deps":
      cmds["ignoreExcludeDeps"] = True



    # Fallback
    else:
      print ">>> Unknown option: %s" % c
      printHelp()
      return


    # Countin' up
    i += 1





  print
  print "  PREPARING:"
  print "***********************************************************************************************"

  print "  * Creating directory layout..."

  if cmds["generateTokenized"] and cmds["outputTokenized"] != "" and not os.path.exists(cmds["outputTokenized"]):
    os.makedirs(cmds["outputTokenized"])

  if cmds["generateBuild"] and cmds["outputBuild"] != "" and not os.path.exists(cmds["outputBuild"]):
    os.makedirs(cmds["outputBuild"])



  scanResult = loader.scanAll(cmds["source"])
  sortedIncludeList = loader.getSortedList(cmds, scanResult)





  if cmds["printKnownFiles"]:
    print
    print "  KNOWN FILES:"
    print "***********************************************************************************************"
    for key in scanResult["files"]:
      print "  %s (%s)" % (key, scanResult["files"][key])

  if cmds["printKnownPackages"]:
    print
    print "  KNOWN PACKAGES:"
    print "***********************************************************************************************"
    for pkg in scanResult["packages"]:
      print "  * %s" % pkg
      for key in scanResult["packages"][pkg]:
        print "    - %s" % key

  if cmds["printSortedIdList"]:
    print
    print "  INCLUDE ORDER:"
    print "***********************************************************************************************"
    for key in sortedIncludeList:
      print "  * %s" % key

  if cmds["generateBuild"] or cmds["generateTokenized"]:
    print
    print "  BUIDLING FILES:"
    print "***********************************************************************************************"

    for uniqueId in sortedIncludeList:
      print "  * %s" % uniqueId

      print "    * reading..."
      fileContent = file(scanResult["files"][uniqueId], "r").read()

      print "    * tokenizing source: %s KB" % (len(fileContent) / 1000)
      tokens = tokenizer.parseStream(fileContent, uniqueId)

      if cmds["generateTokenized"]:
        tokenString = tokenizer.convertTokensToString(tokens)
        tokenFileName = os.path.join(cmds["outputTokenized"], uniqueId + config.TOKENEXT)

        print "    * writing tokens to file (%s KB)..." % (len(tokenString) / 1000)

        tokenFile = file(tokenFileName, "w")
        tokenFile.write(tokenString)
        tokenFile.flush()
        tokenFile.close()








if __name__ == '__main__':
  if sys.version_info[0] < 2 or (sys.version_info[0] == 2 and sys.version_info[1] < 3):
    raise RuntimeError, "Please upgrade to >= Python 2.3"

  try:
    main()

  except KeyboardInterrupt:
    print
    print "  STOPPED"
    print "***********************************************************************************************"

  except:
    print "Unexpected error:", sys.exc_info()[0]
    raise
