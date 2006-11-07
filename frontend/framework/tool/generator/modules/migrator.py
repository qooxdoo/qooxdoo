#!/usr/bin/env python

import sys, re, os, codecs
import config, filetool


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










def handle(fileList, fileDb, options):
  confPath = os.path.join(os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "data"), options.migrationTarget)
  
  infoPath = os.path.join(confPath, "info")
  patchPath = os.path.join(confPath, "patches")

  importedModule = False
  infoList = []
  patchList = []
  
  options.verbose=True


  print "  * Number of input files: %s" % len(fileList)
  print "  * Update to version: %s" % options.migrationTarget
  


  print "  * Searching for patch module..."
  
  patch = None

  for root, dirs, files in os.walk(confPath):

    # Filter ignored directories
    for ignoredDir in DIRIGNORE:
      if ignoredDir in dirs:
        dirs.remove(ignoredDir)

    # Searching for files
    for fileName in files:
      filePath = os.path.join(root, fileName)
      
      if os.path.splitext(fileName)[1] != config.PYEXT:
        continue
        
      if fileName == "patch.py":
        print "    - Found => Importing"
        
        if not root in sys.path:
          sys.path.insert(0, root)

        import patch
        
        importedModule = True
     




  print "  * Searching for info regexp data..."

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

  print "    - Number of info files: %s" % len(infoList)


  print "  * Searching for patch regexp data..."

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

  print "    - Number of patch files: %s" % len(patchList)





  print "  * Compiling expressions..."

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


  print "  * Expression statistics"
  print "    - Number of infos: %s" % len(compiledInfos)
  print "    - Number of patches: %s" % len(compiledPatches)

  print
  print "  FILE PROCESSING:"
  print "----------------------------------------------------------------------------"

  print "  * Processing:"

  for fileId in fileList:
    fileEntry = fileDb[fileId]
    
    filePath = fileEntry["path"]
    fileEncoding = fileEntry["encoding"]
    
    print "    * %s" % fileEntry["path"]

    # Read in original content
    fileContent = filetool.read(filePath, fileEncoding)

    # Apply patches
    patchedContent = fileContent
    patchedContent = regtool(patchedContent, compiledPatches, True, options)
    patchedContent = regtool(patchedContent, compiledInfos, False, options)

    # Write file
    if patchedContent != fileContent:
      filetool.save(filePath, patchedContent, fileEncoding)

  print "  * Done"















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
