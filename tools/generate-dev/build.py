#!/usr/bin/env python

import sys, string, re, os, random
import config, tokenizer, loader, compile



def printHelp():
  print

  # Help
  print "  HELP"
  print "***********************************************************************************************"
  print "  -h,  --help                       show this help screen"
  print

  # Jobs
  print "  -c,  --compile-tokens             compile tokens to new js-files"
  print "  -t   --store-tokens               store token list for each file"
  print "       --store-separate-scripts     store each compiled file separately"
  print "       --compile-with-new-lines     enable newlines in compiled js-files"
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
  cmds["compileTokens"] = False
  cmds["storeTokens"] = False
  cmds["printKnownFiles"] = False
  cmds["printKnownPackages"] = False
  cmds["printSortedIdList"] = False
  cmds["storeSeparateScripts"] = False
  cmds["compileWithNewLines"] = False
  cmds["addUniqueIds"] = False

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
    elif c == "-c" or c == "--compile-tokens":
      cmds["compileTokens"] = True

    elif c == "-t" or c == "--store-tokens":
      cmds["storeTokens"] = True

    elif c == "-f" or c == "--print-files":
      cmds["printKnownFiles"] = True

    elif c == "-p" or c == "--print-packages":
      cmds["printKnownPackages"] = True

    elif c == "-s" or c == "--print-sorted":
      cmds["printSortedIdList"] = True

    elif c == "--store-separate-scripts":
      cmds["storeSeparateScripts"] = True

    elif c == "--compile-with-new-lines":
      cmds["compileWithNewLines"] = True

    elif c == "--add-unique-ids":
      cmds["addUniqueIds"] = True



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

  if cmds["storeTokens"] and cmds["outputTokenized"] != "" and not os.path.exists(cmds["outputTokenized"]):
    os.makedirs(cmds["outputTokenized"])

  if cmds["compileTokens"] and cmds["outputBuild"] != "" and not os.path.exists(cmds["outputBuild"]):
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

  if cmds["compileTokens"] or cmds["storeTokens"]:
    print
    print "  BUIDLING FILES:"
    print "***********************************************************************************************"

    compAllString = ""

    for uniqueId in sortedIncludeList:
      print "  * %s" % uniqueId

      print "    * reading..."
      fileContent = file(scanResult["files"][uniqueId], "r").read()
      fileSize = len(fileContent) / 1000.0

      print "    * tokenizing source (%s KB)..." % fileSize
      tokens = tokenizer.parseStream(fileContent, uniqueId)

      if cmds["storeTokens"]:
        tokenString = tokenizer.convertTokensToString(tokens)
        tokenSize = len(tokenString) / 1000.0

        print "    * writing tokens to file (%s KB)..." % tokenSize

        tokenFileName = os.path.join(cmds["outputTokenized"], uniqueId + config.TOKENEXT)

        tokenFile = file(tokenFileName, "w")
        tokenFile.write(tokenString)
        tokenFile.flush()
        tokenFile.close()

      if cmds["compileTokens"]:
        print "    * compiling..."

        compString = compile.compile(tokens, cmds["compileWithNewLines"])

        if cmds["addUniqueIds"]:
          compAllString += "/* ID: " + uniqueId + " */\n" + compString + "\n"
        else:
          compAllString += compString

        compSize = len(compString) / 1000.0
        compFactor = 100 - (compSize / fileSize * 100)

        print "    * compression %i%% (%s KB)" % (compFactor, compSize)

        if cmds["storeSeparateScripts"]:
          print "    * writing compiled code to file..." % compSize
          compFileName = os.path.join(cmds["outputBuild"], uniqueId + config.JSEXT)

          compFile = file(compFileName, "w")
          compFile.write(compString)
          compFile.flush()
          compFile.close()




    if cmds["compileTokens"]:
      compFileName = os.path.join(cmds["outputBuild"], "qooxdoo" + config.JSEXT)

      compFile = file(compFileName, "w")
      compFile.write(compAllString)
      compFile.flush()
      compFile.close()




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
