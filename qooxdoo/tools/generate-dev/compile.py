#!/usr/bin/env python

import sys, string, re, os, random
import config

R_QXDEFINECLASS = re.compile('qx.OO.defineClass\("([\.a-zA-Z0-9_-]+)"(\s*\,\s*([\.a-zA-Z0-9_-]+))?', re.M)
R_QXUNIQUEID = re.compile("#id\(([\.a-zA-Z0-9_-]+)\)", re.M)
R_QXPACKAGE = re.compile("#package\(([\.a-zA-Z0-9_-]+)\)", re.M)
R_QXREQUIRE = re.compile("#require\(([\.a-zA-Z0-9_-]+)\)", re.M)
R_QXUSE = re.compile("#use\(([\.a-zA-Z0-9_-]+)\)", re.M)

R_WHITESPACE = re.compile("\s+")
R_NONWHITESPACE = re.compile("\S+")
R_NUMBER = re.compile("^[0-9]+")
R_NEWLINE = re.compile(r"(\n)")

# Ideas from: http://www.regular-expressions.info/examplesprogrammer.html
# Multicomment RegExp inspired by: http://ostermiller.org/findcomment.html

# builds regexp strings
S_MULTICOMMENT = "/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/"
S_SINGLECOMMENT = "//.*"
S_STRING_A = "'[^'\\\r\n]*(\\.[^'\\\r\n]*)*'"
S_STRING_B = '"[^"\\\r\n]*(\\.[^"\\\r\n]*)*"'
S_FLOAT = "([0-9]+\.[0-9]+)"

S_OPERATORS_2 = r"(==)|(!=)|(\+\+)|(--)|(-=)|(\+=)|(\*=)|(/=)|(%=)|(&&)|(\|\|)|(\>=)|(\<=)|(\^\|)|(\|=)|(\^=)|(&=)"
S_OPERATORS_3 = r"(===)|(!==)|(\<\<=)|(\>\>=)"
S_OPERATORS_4 = r"(\>\>\>=)"
S_OPERATORS = "(" + S_OPERATORS_4 + "|" + S_OPERATORS_3 + "|" + S_OPERATORS_2 + ")"

S_REGEXP = "(\/[^\t\n\r\f\v]+?\/g?i?)"
S_REGEXP_A = "\.(match|search|split)\(" + S_REGEXP + "\)"
S_REGEXP_B = "\.(replace)\(" + S_REGEXP + ","
S_REGEXP_C = "\s*=\s*" + S_REGEXP
S_REGEXP_D = S_REGEXP + "\.(test|exec)\("
S_REGEXP_ALL = S_REGEXP_A + "|" + S_REGEXP_B + "|" + S_REGEXP_C + "|" + S_REGEXP_D

S_ALL = "(" + S_MULTICOMMENT + "|" + S_SINGLECOMMENT + "|" + S_STRING_A + "|" + S_STRING_B + "|" + S_REGEXP_ALL + "|" + S_FLOAT + "|" + S_OPERATORS + ")"

# compile regexp strings
R_MULTICOMMENT = re.compile("^" + S_MULTICOMMENT + "$")
R_SINGLECOMMENT = re.compile("^" + S_SINGLECOMMENT + "$")
R_STRING_A = re.compile("^" + S_STRING_A + "$")
R_STRING_B = re.compile("^" + S_STRING_B + "$")
R_FLOAT = re.compile("^" + S_FLOAT + "$")
R_OPERATORS = re.compile(S_OPERATORS)
R_REGEXP = re.compile(S_REGEXP)
R_ALL = re.compile(S_ALL)








tokenizerLine = 0
tokenizerId = ""

def recoverEscape(s):
  instr=s
  outstr=s.replace("__$ESCAPE1$__", "\\\"").replace("__$ESCAPE2__", "\\'").replace("__$ESCAPE3__", "\/")

  #if instr != outstr:
  #  print instr + " || " + outstr

  return outstr



def tokenize_name(nameContent):
  global tokenizerId
  global tokenizerLine

  if config.PROTECTED.has_key(nameContent):
    # print "PROTECTED: %s" % PROTECTED[nameContent]
    return { "type" : "protected", "detail" : config.PROTECTED[nameContent], "source" : nameContent, "line" : tokenizerLine, "file" : tokenizerId }

  elif nameContent in config.BUILTIN:
    return { "type" : "builtin", "detail" : "", "source" : nameContent, "line" : tokenizerLine, "file" : tokenizerId }

  elif R_NUMBER.search(nameContent):
    # print "NUMBER: %s" % nameContent
    return { "type" : "number", "detail" : "int", "source" : nameContent, "line" : tokenizerLine, "file" : tokenizerId }

  elif nameContent.startswith("_"):
    # print "PRIVATE NAME: %s" % nameContent
    return { "type" : "name", "detail" : "private", "source" : nameContent, "line" : tokenizerLine, "file" : tokenizerId }

  elif len(nameContent) > 0:
    # print "PUBLIC NAME: %s" % nameContent
    return { "type" : "name", "detail" : "public", "source" : nameContent, "line" : tokenizerLine, "file" : tokenizerId }



def tokenize_part(partContent):
  global tokenizerId
  global tokenizerLine

  result = []
  temp = ""

  for line in R_NEWLINE.split(partContent):
    if line == "\n":
      result.append({ "type" : "eol", "source" : "", "detail" : "", "line" : tokenizerLine, "file" : tokenizerId })
      tokenizerLine += 1

    else:
      for item in R_WHITESPACE.split(line):
        for char in item:
          if config.TOKENS.has_key(char):
            if temp != "":
              if R_NONWHITESPACE.search(temp):
                result.append(tokenize_name(temp))

              temp = ""

            result.append({ "type" : "token", "detail" : config.TOKENS[char], "source" : char, "line" : tokenizerLine, "file" : tokenizerId })

          else:
            temp += char

        if temp != "":
          if R_NONWHITESPACE.search(temp):
            result.append(tokenize_name(temp))

          temp = ""

  return result



def tokenizer(fileContent, uniqueId):

  # make global variables available
  global tokenizerLine
  global tokenizerId

  # reset global stuff
  tokenizerLine = 1
  tokenizerId = uniqueId

  # Protect/Replace Escape sequences first
  fileContent = fileContent.replace("\\\"", "__$ESCAPE1$__").replace("\\\'", "__$ESCAPE2__").replace("\/", "__$ESCAPE3__")

  # Searching for special characters and sequences
  alllist = R_ALL.findall(fileContent)
  tokenized = []

  for item in alllist:
    fragment = item[0]

    if R_MULTICOMMENT.match(fragment):
      # print "Type:MultiComment"

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "comment", "detail" : "multi", "source" : recoverEscape(fragment), "file" : tokenizerId, "line" : tokenizerLine })

      tokenizerLine += len(fragment.split("\n")) - 1

    elif R_SINGLECOMMENT.match(fragment):
      # print "Type:SingleComment"

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "comment", "detail" : "single", "source" : recoverEscape(fragment), "file" : tokenizerId, "line" : tokenizerLine })

    elif R_STRING_A.match(fragment):
      # print "Type:StringA: %s" % fragment

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "string", "detail" : "singlequotes", "source" : recoverEscape(fragment)[1:-1], "file" : tokenizerId, "line" : tokenizerLine })

    elif R_STRING_B.match(fragment):
      # print "Type:StringB: %s" % fragment

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "string", "detail" : "doublequotes", "source" : recoverEscape(fragment)[1:-1], "file" : tokenizerId, "line" : tokenizerLine })

    elif R_FLOAT.match(fragment):
      # print "Type:Float: %s" % fragment

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "number", "detail" : "float", "source" : fragment, "file" : tokenizerId, "line" : tokenizerLine })

    elif R_OPERATORS.match(fragment):
      # print "Type:Operator: %s" % fragment

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "token", "detail" : config.TOKENS[fragment], "source" : fragment, "file" : tokenizerId, "line" : tokenizerLine })

    else:
      fragresult = R_REGEXP.search(fragment)
      if fragresult:
        # print "Type:RegExp: %s" % fragresult.group(0)

        pos = fileContent.find(fragresult.group(0))
        if pos > 0:
          tokenized.extend(tokenize_part(recoverEscape(fileContent[0:pos])))

        fileContent = fileContent[pos+len(fragresult.group(0)):]
        tokenized.append({ "type" : "regexp", "detail" : "", "source" : recoverEscape(fragresult.group(0)), "file" : tokenizerId, "line" : tokenizerLine })

      else:
        print "Type:None!"


  tokenized.extend(tokenize_part(recoverEscape(fileContent)))

  tokenized.append({ "type" : "eof", "source" : "", "detail" : "", "line" : tokenizerLine, "file" : tokenizerId })

  return tokenized










def extractMetaData(data, loadDependencyData, runtimeDependencyData, knownPackages):
  thisClass = None
  superClass = None

  dc = R_QXDEFINECLASS.search(data)

  if dc:
    thisClass = dc.group(1)
    superClass = dc.group(3)

  else:
    # print "Sorry. Don't find any class informations. Trying id information."

    ns = R_QXUNIQUEID.search(data)

    if ns:
      thisClass = ns.group(1)


  if thisClass == None:
    print "    * Error while extracting uniqueId!"
    return None


  # Pre-Creating data storage
  if not loadDependencyData.has_key(thisClass):
    loadDependencyData[thisClass] = []

  if not runtimeDependencyData.has_key(thisClass):
    runtimeDependencyData[thisClass] = []


  # Storing inheritance deps
  if superClass != None:
    if superClass in config.BUILTIN:
      pass

    else:
      loadDependencyData[thisClass].append(superClass)


  # Storing defined deps and package informations
  for line in data.split("\n"):
    req = R_QXREQUIRE.search(line)
    use = R_QXUSE.search(line)
    pkg = R_QXPACKAGE.search(line)

    if req:
      loadDependencyData[thisClass].append(req.group(1))

    if use:
      runtimeDependencyData[thisClass].append(use.group(1))

    if pkg:
      pkgname = pkg.group(1)

      if knownPackages.has_key(pkgname):
        knownPackages[pkgname].append(thisClass)
      else:
        knownPackages[pkgname] = [ thisClass ]


  return thisClass







def addUniqueIdToSortedList(uniqueId, loadDependencyData, runtimeDependencyData, sortedIncludeList, ignoreDeps):

  if not loadDependencyData.has_key(uniqueId):
    print "    * Could not resolve requirement of uniqueId: %s" % uniqueId
    return False

  # Test if already in
  try:
    sortedIncludeList.index(uniqueId)

  except ValueError:
    # Including pre-deps
    if not ignoreDeps:
      for preUniqueId in loadDependencyData[uniqueId]:
        addUniqueIdToSortedList(preUniqueId, loadDependencyData, runtimeDependencyData, sortedIncludeList, False)

    # Add myself
    try:
      sortedIncludeList.index(uniqueId)
    except ValueError:
      sortedIncludeList.append(uniqueId)

    # Include post-deps
    if not ignoreDeps:
      for postUniqueId in runtimeDependencyData[uniqueId]:
        addUniqueIdToSortedList(postUniqueId, loadDependencyData, runtimeDependencyData, sortedIncludeList, False)







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
  print "       --output-combined <FILE>     destination file of all builded files"
  print





def start():
  loadDependencyData = {}
  runtimeDependencyData = {}

  knownPackages = {}
  knownFiles = {}

  includeIds = []
  excludeIds = []

  combinedBuildContent = ""




  # Source
  cmdSourceDirectories = ["source/script", "source/themes"]

  # Jobs
  cmdGenerateBuild = False
  cmdPrintKnownFiles = False
  cmdPrintKnownPackages = False
  cmdPrintSortedIdList = False

  # Include/Exclude
  cmdInclude = []
  cmdExclude = []
  cmdIgnoreIncludeDeps = False
  cmdIgnoreExcludeDeps = False

  # Output
  cmdOutputTokenized = ""
  cmdOutputBuild = "build/script/cache/"
  cmdOutputCombined = "build/script/qooxdoo.js"



  if "-h" in sys.argv or "--help" in sys.argv or len(sys.argv) == 1:
    printHelp()
    return



  i = 1
  while i < len(sys.argv):
    c = sys.argv[i]

    # Source
    if c == "--source-directories":
      cmdSourceDirectories = sys.argv[i+1].split(",")

      if "" in cmdSourceDirectories:
        cmdSourceDirectories.remove("")
      i += 1



    # Output
    elif c == "--output-tokenized":
      cmdOutputTokenized = sys.argv[i+1]
      i += 1

    elif c == "--output-build":
      cmdOutputBuild = sys.argv[i+1]
      i += 1

    elif c == "--output-combined":
      cmdOutputCombined = sys.argv[i+1]
      i += 1



    # Jobs
    elif c == "-b" or c == "--generate-build":
      cmdGenerateBuild = True

    elif c == "-p" or c == "--print-packages":
      cmdPrintKnownPackages = True

    elif c == "-f" or c == "--print-files":
      cmdPrintKnownFiles = True

    elif c == "-s" or c == "--print-sorted":
      cmdPrintSortedIdList = True



    # Include/Exclude
    elif c == "-i" or c == "--include":
      cmdInclude = sys.argv[i+1].split(",")
      i += 1

    elif c == "-e" or c == "--exclude":
      cmdExclude = sys.argv[i+1].split(",")
      i += 1

    elif c == "--disable-include-deps":
      cmdIgnoreIncludeDeps = True

    elif c == "--disable-exclude-deps":
      cmdIgnoreExcludeDeps = True



    # Fallback
    else:
      print "  Unknown option: %s" % c
      printHelp()
      return


    # Countin' up
    i += 1














  print
  print "  PREPARING:"
  print "***********************************************************************************************"

  print "  * Creating directory layout..."

  if cmdOutputTokenized != "" and not os.path.exists(cmdOutputTokenized):
    os.makedirs(cmdOutputTokenized)

  if cmdOutputBuild != "" and not os.path.exists(cmdOutputBuild):
    os.makedirs(cmdOutputBuild)





  print "  * Searching for files..."

  for basedir in cmdSourceDirectories:
    for root, dirs, files in os.walk(basedir):
      if "CVS" in dirs:
        dirs.remove('CVS')

      if ".svn" in dirs:
        dirs.remove('.svn')

      for filename in files:
        if os.path.splitext(filename)[1] == config.JSEXT:
          completeFileName = os.path.join(root, filename)
          uniqueId = extractMetaData(file(completeFileName, "r").read(), loadDependencyData, runtimeDependencyData, knownPackages)

          if uniqueId == None:
            print "    * Could not extract meta data from file: %s" % filename
          else:

            splitUniqueId = uniqueId.split(".")
            splitFileName = completeFileName.replace(config.JSEXT, "").split(os.sep)
            uniqueFileId = ".".join(splitFileName[len(splitFileName)-len(splitUniqueId):])

            if uniqueId != uniqueFileId:
              print "    * UniqueId/Filename mismatch: %s != %s" % (uniqueId, uniqueFileId)

            knownFiles[uniqueId] = completeFileName





  print "  * Sorting files..."

  # INCLUDE

  # Add Packages and Files
  for include in cmdInclude:
    if include in knownPackages:
      includeIds.extend(knownPackages[include])

    else:
      includeIds.append(include)

  # Add all if empty
  if len(includeIds) == 0:
    for uniqueId in knownFiles:
      includeIds.append(uniqueId)

  # Sorting
  sortedIncludeList = []
  for uniqueId in includeIds:
    addUniqueIdToSortedList(uniqueId, loadDependencyData, runtimeDependencyData, sortedIncludeList, cmdIgnoreIncludeDeps)



  # EXCLUDE

  # Add Packages and Files
  for exclude in cmdExclude:
    if exclude in knownPackages:
      excludeIds.extend(knownPackages[exclude])

    else:
      excludeIds.append(exclude)

  # Sorting
  sortedExcludeList = []
  for uniqueId in excludeIds:
    addUniqueIdToSortedList(uniqueId, loadDependencyData, runtimeDependencyData, sortedExcludeList, cmdIgnoreExcludeDeps)




  # MERGE

  # Remove excluded files from included files list
  for uniqueId in sortedExcludeList:
    if uniqueId in sortedIncludeList:
      sortedIncludeList.remove(uniqueId)







  if cmdPrintKnownFiles:
    print
    print "  KNOWN FILES:"
    print "***********************************************************************************************"
    for key in knownFiles:
      print "  %s (%s)" % (key, knownFiles[key])

  if cmdPrintKnownPackages:
    print
    print "  KNOWN PACKAGES:"
    print "***********************************************************************************************"
    for pkg in knownPackages:
      print "  * %s" % pkg
      for key in knownPackages[pkg]:
        print "    - %s" % key

  if cmdPrintSortedIdList:
    print
    print "  INCLUDE ORDER:"
    print "***********************************************************************************************"
    for key in sortedIncludeList:
      print "  * %s" % key

  if cmdGenerateBuild:
    print
    print "  BUIDLING FILES:"
    print "***********************************************************************************************"

    for uniqueId in sortedIncludeList:
      print "  * %s" % uniqueId

      fileContent = file(knownFiles[uniqueId], "r").read()
      tokenizedString = ""




      print "    * tokenizing..."

      tokenizedFileContent = tokenizer(fileContent, uniqueId)

      if cmdOutputTokenized != "":
        for token in tokenizedFileContent:
          tokenizedString += "%s%s" % (token, "\n")

        tokenizedFileName = os.path.join(cmdOutputTokenized, uniqueId + config.TOKENEXT)

        tokenizedFile = file(tokenizedFileName, "w")
        tokenizedFile.write(tokenizedString)
        tokenizedFile.flush()
        tokenizedFile.close()






      print "    * building..."

      buildFileName = os.path.join(cmdOutputBuild, uniqueId + config.JSEXT)
      os.system("/usr/bin/xsltproc -o " + buildFileName + " tools/generate-dev/compile_compress.xsl " + xmlFileName)

      combinedBuildContent += "/* " + uniqueId + " */ " + file(buildFileName, "r").read()




    print
    print "  COMBINING BUILD FILES:"
    print "***********************************************************************************************"
    print "  Writing to: %s" % cmdOutputCombined

    combinedFile = file(cmdOutputCombined, "w")
    combinedFile.write(combinedBuildContent)
    combinedFile.flush()
    combinedFile.close()







if __name__ == '__main__':
  if sys.version_info[0] < 2 or (sys.version_info[0] == 2 and sys.version_info[1] < 3):
    raise RuntimeError, "Please upgrade to >= Python 2.3"

  try:
    start()

  except KeyboardInterrupt:
    print
    print "  STOPPED"
    print "***********************************************************************************************"

  except:
    print "Unexpected error:", sys.exc_info()[0]
    raise
