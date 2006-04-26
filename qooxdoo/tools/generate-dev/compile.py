#!/usr/bin/env python

import sys, string, re, os, random

JSEXT = ".js"
XMLEXT = ".xml"
TKEXT = ".txt"

TOKENS = {
  "." : "DOT",
  "," : "COMMA",
  ":" : "COLON",
  "?" : "HOOK",
  ";" : "SEMICOLON",
  "!" : "NOT",
  "~" : "BITNOT",
  "\\" : "BACKSLASH",

  "+" : "ADD",
  "-" : "SUB",
  "*" : "MUL",
  "/" : "DIV",
  "%" : "MOD",

  "{" : "LC",
  "}" : "RC",
  "(" : "LP",
  ")" : "RP",
  "[" : "LB",
  "]" : "RB",

  "<" : "LT",
  "<=" : "LE",
  ">" : "GT",
  ">=" : "GE",
  "==" : "EQ",
  "!=" : "NE",
  "===" : "SHEQ",
  "!==" : "SHNE",

  "=" : "ASSIGN",

  "+=" : "ASSIGN_ADD",
  "-=" : "ASSIGN_SUB",
  "*=" : "ASSIGN_MUL",
  "/=" : "ASSIGN_DIV",
  "%=" : "ASSIGN_MOD",

  "|=" : "ASSIGN_BITOR",
  "^=" : "ASSIGN_BITXOR",
  "&=" : "ASSIGN_BITAND",
  "<<=" : "ASSIGN_LSH",
  ">>=" : "ASSIGN_RSH",
  ">>>=" : "ASSIGN_URSH",

  "&&" : "AND",
  "||" : "OR",

  "|" : "BITOR",
  "^|" : "BITXOR",
  "&" : "BITAND",

  "^" : "POWEROF",

  "<<" : "LSH",
  ">>" : "RSH",
  ">>>" : "URSH",

  "++" : "INC",
  "--" : "DEC",

  "::" : "COLONCOLON",
  ".." : "DOTDOT",

  "@" : "XMLATTR",

  "//" : "SINGLE_COMMENT",
  "/*" : "COMMENT_START",
  "*/" : "COMMENT_STOP",
  "/*!" : "DOC_START"
}

PROTECTED = {
  "null" : "NULL",
  "Infinity" : "INFINITY",
  "true" : "TRUE",
  "false" : "FALSE",

  "this" : "THIS",
  "var" : "VAR",
  "new" : "NEW",
  "prototype" : "PROTOTYPE",
  "return" : "RETURN",
  "function" : "FUNCTION",

  "while" : "WHILE",
  "if" : "IF",
  "else" : "ELSE",
  "switch" : "SWITCH",
  "case" : "CASE",
  "default" : "DEFAULT",
  "break" : "BREAK",
  "continue" : "CONTINUE",
  "do" : "DO",
  "delete" : "DELETE",
  "for" : "FOR",
  "in" : "IN",
  "with" : "WITH",
  "try" : "TRY",
  "catch" : "CATCH",
  "finally" : "FINALLY",
  "throw" : "THROW",
  "instanceof" : "INSTANCEOF",
  "typeof" : "TYPEOF",
  "void" : "VOID",
  "call" : "CALL",
  "apply" : "APPLY"
}

SEPARATORS = [ ",", ";", ":", "(", ")", "{", "}", "[", "]", ".", "?" ]
BLOCKSEPARATORS = [ ",", ";", ":", "(", ")", "{", "}", "[", "]", "?" ]

SPACEAROUND = [ "in", "instanceof" ]
SPACEAFTER = [ "throw", "new", "delete", "var", "typeof", "return" ]

SPACES = re.compile("(\s+)")

BUILTIN = [ "Object", "Array", "RegExp", "Math", "String", "Number", "Error" ]

R_QXDEFINECLASS = re.compile('qx.OO.defineClass\("([\.a-zA-Z0-9_-]+)"(\s*\,\s*([\.a-zA-Z0-9_-]+))?', re.M)
R_QXUNIQUEID = re.compile("#id\(([\.a-zA-Z0-9_-]+)\)", re.M)
R_QXREQUIRE = re.compile("#require\(([\.a-zA-Z0-9_-]+)\)", re.M)
R_QXUSE = re.compile("#use\(([\.a-zA-Z0-9_-]+)\)", re.M)
R_QXPACKAGE = re.compile("#package\(([\.a-zA-Z0-9_-]+)\)", re.M)


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

S_OPERATORS_2 = r"(==)|(!=)|(\+\+)|(--)|(-=)|(\+=)|(\*=)|(/=)|(%=)|(&&)|(\|\|)|(\>=)|(\<=)|(\^\|)|(\|=)|(\^=)|(&=)"
S_OPERATORS_3 = r"(===)|(!==)|(\<\<=)|(\>\>=)"
S_OPERATORS_4 = r"(\>\>\>=)"
S_OPERATORS = "(" + S_OPERATORS_4 + "|" + S_OPERATORS_3 + "|" + S_OPERATORS_2 + ")"

S_REGEXP = "(\/[^\t\n\r\f\v]+\/g?i?)"
S_REGEXP_A = "\.(match|search|split)\(" + S_REGEXP + "\)"
S_REGEXP_B = "\.(replace)\(" + S_REGEXP + ",.*\)"
S_REGEXP_C = "\s*=\s*" + S_REGEXP
S_REGEXP_D = S_REGEXP + "\.(test|exec)\(.+\)"
S_REGEXP_ALL = S_REGEXP_A + "|" + S_REGEXP_B + "|" + S_REGEXP_C + "|" + S_REGEXP_D

S_ALL = "(" + S_MULTICOMMENT + "|" + S_SINGLECOMMENT + "|" + S_STRING_A + "|" + S_STRING_B + "|" + S_REGEXP_ALL + "|" + S_OPERATORS + ")"

# compile regexp strings
R_MULTICOMMENT = re.compile("^" + S_MULTICOMMENT + "$")
R_SINGLECOMMENT = re.compile("^" + S_SINGLECOMMENT + "$")
R_STRING_A = re.compile("^" + S_STRING_A + "$")
R_STRING_B = re.compile("^" + S_STRING_B + "$")
R_OPERATORS = re.compile(S_OPERATORS)
R_REGEXP = re.compile(S_REGEXP)
R_ALL = re.compile(S_ALL)



tokenizerLine = 0
tokenizerFile = ""

xmlindent = 0
xmloutput = ""
treecontext = []







def recoverEscape(s):
  return s.replace("__$ESCAPE1$__", "\\\"").replace("__$ESCAPE2__", "\\'")



def tokenize_name(data):
  global tokenizerFile
  global tokenizerLine

  if PROTECTED.has_key(data):
    # print "PROTECTED: %s" % PROTECTED[data]
    return { "type" : "protected", "detail" : PROTECTED[data], "source" : data, "line" : tokenizerLine, "file" : tokenizerFile }

  elif data in BUILTIN:
    return { "type" : "builtin", "detail" : "", "source" : data, "line" : tokenizerLine, "file" : tokenizerFile }

  elif R_NUMBER.search(data):
    # print "NUMBER: %s" % data
    return { "type" : "number", "detail" : "", "source" : data, "line" : tokenizerLine, "file" : tokenizerFile }

  elif data.startswith("_"):
    # print "PRIVATE NAME: %s" % data
    return { "type" : "name", "detail" : "private", "source" : data, "line" : tokenizerLine, "file" : tokenizerFile }

  elif len(data) > 0:
    # print "PUBLIC NAME: %s" % data
    return { "type" : "name", "detail" : "public", "source" : data, "line" : tokenizerLine, "file" : tokenizerFile }



def tokenize_part(data):
  global tokenizerFile
  global tokenizerLine

  result = []
  temp = ""

  for line in R_NEWLINE.split(data):
    if line == "\n":
      result.append({ "type" : "eol", "source" : "", "detail" : "", "line" : tokenizerLine, "file" : tokenizerFile })
      tokenizerLine += 1

    else:
      for item in R_WHITESPACE.split(line):
        for char in item:
          if TOKENS.has_key(char):
            if temp != "":
              if R_NONWHITESPACE.search(temp):
                result.append(tokenize_name(temp))

              temp = ""

            result.append({ "type" : "token", "detail" : TOKENS[char], "source" : char, "line" : tokenizerLine, "file" : tokenizerFile })

          else:
            temp += char

        if temp != "":
          if R_NONWHITESPACE.search(temp):
            result.append(tokenize_name(temp))

          temp = ""

  return result



def tokenizer(data, filename):
  # make global variables available
  global tokenizerLine
  global tokenizerFile

  # reset global stuff
  tokenizerLine = 1
  tokenizerFile = filename

  # Protect/Replace Escape sequences first
  data = data.replace("\\\"", "__$ESCAPE1$__").replace("\\\'", "__$ESCAPE2__")

  # Searching for special characters and sequences
  alllist = R_ALL.findall(data)
  tokenized = []

  for item in alllist:
    fragment = item[0]

    if R_MULTICOMMENT.match(fragment):
      # print "Type:MultiComment"

      pos = data.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(data[0:pos])))

      data = data[pos+len(fragment):]
      tokenized.append({ "type" : "comment", "detail" : "multi", "source" : recoverEscape(fragment), "file" : tokenizerFile, "line" : tokenizerLine })

      tokenizerLine += len(fragment.split("\n")) - 1

    elif R_SINGLECOMMENT.match(fragment):
      # print "Type:SingleComment"

      pos = data.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(data[0:pos])))

      data = data[pos+len(fragment):]
      tokenized.append({ "type" : "comment", "detail" : "single", "source" : recoverEscape(fragment), "file" : tokenizerFile, "line" : tokenizerLine })

    elif R_STRING_A.match(fragment):
      # print "Type:StringA: %s" % fragment

      pos = data.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(data[0:pos])))

      data = data[pos+len(fragment):]
      tokenized.append({ "type" : "string", "detail" : "singlequotes", "source" : recoverEscape(fragment)[1:-1], "file" : tokenizerFile, "line" : tokenizerLine })

    elif R_STRING_B.match(fragment):
      # print "Type:StringB: %s" % fragment

      pos = data.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(data[0:pos])))

      data = data[pos+len(fragment):]
      tokenized.append({ "type" : "string", "detail" : "doublequotes", "source" : recoverEscape(fragment)[1:-1], "file" : tokenizerFile, "line" : tokenizerLine })

    elif R_OPERATORS.match(fragment):
      # print "Type:Operator: %s" % fragment

      pos = data.find(fragment)
      if pos > 0:
        tokenized.extend(tokenize_part(recoverEscape(data[0:pos])))

      data = data[pos+len(fragment):]
      tokenized.append({ "type" : "token", "detail" : TOKENS[fragment], "source" : fragment, "file" : tokenizerFile, "line" : tokenizerLine })

    else:
      fragresult = R_REGEXP.search(fragment)
      if fragresult:
        # print "Type:RegExp: %s" % fragresult.group(0)

        pos = data.find(fragresult.group(0))
        if pos > 0:
          tokenized.extend(tokenize_part(recoverEscape(data[0:pos])))

        data = data[pos+len(fragresult.group(0)):]
        tokenized.append({ "type" : "regexp", "detail" : "", "source" : recoverEscape(fragresult.group(0)), "file" : tokenizerFile, "line" : tokenizerLine })

      else:
        print "Type:None!"


  tokenized.extend(tokenize_part(recoverEscape(data)))

  tokenized.append({ "type" : "eof", "source" : "", "detail" : "", "line" : tokenizerLine, "file" : tokenizerFile })
  return tokenized












def treebuilder(data, item):
  global xmlindent
  global treecontext
  global sourceline

  treecontext = [ "root" ]
  sourceline = 0
  xmlindent = 0

  xmlstart()

  tagstart("file")

  tagstart("info")

  tagsingle("id", item)
  tagsingle("datasize", len(data))

  tagstop("info")

  tagstart("content")

  treebuilder_content(data, item)

  tagstop("content")

  tagstop("file")



def treecloser(need=False):
  global xmlindent
  global treecontext
  global sourceline

  if treecontext[-1] == "namegroup":
    tagstop("namegroup")

  if treecontext[-1] == "block":
    tagstop("block")

  elif need:
    print "    Warning: Used semicolon outside a block! (Line: %s)" % sourceline


  while treecontext[-1] == "else":
    tagstop("else")

    if treecontext[-1] == "block":
      tagstop("block")


  if treecontext[-1] == "if":
    tagstop("if")



def treeblockstart(typ, det, src):
  global xmlindent
  global treecontext
  global sourceline

  if treecontext[-1] == "if":
    print "    Info: No brackets for if command! (Line: %s)" % sourceline

  if treecontext[-1] == "else" and not(typ == "protected" and det == "IF"):
    print "    Info: No brackets for else command! (Line: %s)" % sourceline


  tagstart("block")



def treebuilder_content(data, item):
  global xmlindent
  global treecontext
  global sourceline

  pos = -1
  det = ""

  for item in data:
    pos += 1

    lin = item["line"]
    typ = item["type"]
    det = item["detail"]
    src = item["source"]


    if pos > 0:
      lastitem = data[pos-1]

      if lastitem["type"] != "eol" and lastitem["type"] != "comment":
        lastitem_typ = lastitem["type"]
        lastitem_det = lastitem["detail"]
        lastitem_src = lastitem["source"]

    else:
      lastitem_typ = ""
      lastitem_det = ""
      lastitem_src = ""


    # store in global variable
    sourceline = lin

    if typ == "comment":
      pass

    elif typ == "eof":
      treecloser()

    elif typ == "eol":
      pass

    elif typ == "token" and det == "SEMICOLON":
      treecloser(True)



    else:
      if typ == "token":
        if det != "DOT" and treecontext[-1] == "namegroup":
          tagstop("namegroup")




        if det == "LC":
          tagstart("commandgroup")

        elif det == "RC":
          if treecontext[-1] == "else":
            tagstop("else")

          if treecontext[-1] == "block":
            tagstop("block")

          tagstop("commandgroup")

          if treecontext[-1] == "if":
            tagstop("if")

          elif treecontext[-1] == "else":
            tagstop("else")

          elif treecontext[-1] == "function":
            tagstop("function")



        elif det == "LB":
          tagstart("accessgroup")

        elif det == "RB":
          treecloser()
          tagstop("accessgroup")



        elif det == "LP":


          if treecontext[-1] != "function" and treecontext[-1] != "block" and treecontext[-1] != "if":
            tagstart("block")



          tagstart("argumentgroup")

        elif det == "RP":
          treecloser()
          tagstop("argumentgroup")




        elif det == "DOT" and treecontext[-1] == "namegroup":
          pass

        elif det == "COMMA":
          tagsource(typ, det, src)

        else:
          if treecontext[-1] != "namegroup" and treecontext[-1] != "block":
            treeblockstart(typ, det, src)

          tagsource(typ, det, src)
          # print "Other token: %s" % src



      else:
        if treecontext[-1] != "namegroup" and treecontext[-1] != "block" and treecontext[-1] != "function":
          treeblockstart(typ, det, src)



        if (typ == "protected" and (det == "THIS" or det == "PROTOTYPE" or det == "CALL" or det == "APPLY")) or typ == "name" or typ == "builtin":
          if treecontext[-1] != "namegroup":
            tagstart("namegroup")

          tagsource(typ, det, src)

        elif typ == "protected":
          if treecontext[-1] == "namegroup":
            tagstop("namegroup")



          if det == "FUNCTION":
            tagstart("function")

          elif det == "IF":
            tagstart("if")

          elif det == "ELSE":
            tagstart("else")

          else:
            if src in SPACEAROUND:
              tagspace()

            tagsource(typ, det, src)

            if src in SPACEAFTER or src in SPACEAROUND:
              tagspace()



        elif typ == "number" or typ == "string" or typ == "regexp":
          tagsource(typ, det, src)

        else:
          print "Other type: %s" % typ











def tagsingle(tag, content):
  global xmlindent
  global xmloutput

  xmloutput += "%s<%s>%s</%s>\n" % (("  " * xmlindent), tag, content, tag)

def tagspace():
  global xmlindent
  global xmloutput
  global sourceline

  xmloutput += "%s<space line=\"%s\"/>\n" % (("  " * xmlindent), sourceline)

def tagsource(tag, detail, source):
  global xmlindent
  global xmloutput
  global sourceline

  if detail == "\"":
    detail = ""

  source = source.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

  xmloutput += "%s<%s detail=\"%s\" line=\"%s\">%s</%s>\n" % (("  " * xmlindent), tag, detail, sourceline, source, tag)

def tagcomment(tag, detail, source):
  global xmlindent
  global xmloutput
  global sourceline

  xmloutput += "%s<%s detail=\"%s\" line=\"%s\">\n%s\n%s</%s>\n" % (("  " * xmlindent), tag, detail, sourceline, source.replace("<", "&lt;").replace(">", "&gt;"), ("  " * xmlindent), tag)

def tagstart(tag):
  global xmlindent
  global xmloutput
  global treecontext
  global sourceline

  xmloutput += "%s<%s line=\"%s\">\n" % (("  " * xmlindent), tag, sourceline)
  xmlindent += 1
  treecontext.append(tag)

def tagstop(tag):
  global xmlindent
  global xmloutput
  global treecontext
  global sourceline



  while treecontext[-1] != tag:
    print "    Warning: Want to close: %s, but in wrong tree context: %s (Line: %s)" % (tag, treecontext[-1], sourceline)

    xmlindent -= 1;
    xmloutput += "%s</%s>\n" % (("  " * xmlindent), treecontext.pop())



  xmlindent -= 1;
  xmloutput += "%s</%s>\n" % (("  " * xmlindent), tag)
  treecontext.pop()

def xmlstart():
  global xmloutput
  global sourceline

  xmloutput = "<?xml version=\"1.0\" encoding=\"iso-8859-15\"?>\n\n"







def extractDeps(data, loadDependencyData, runtimeDependencyData, knownPackages):
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
    return False


  # Pre-Creating data storage
  if not loadDependencyData.has_key(thisClass):
    loadDependencyData[thisClass] = []

  if not runtimeDependencyData.has_key(thisClass):
    runtimeDependencyData[thisClass] = []


  # Storing inheritance deps
  if superClass != None:
    if superClass in BUILTIN:
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
  print "  HELP"
  print "***********************************************************************************************"
  print "  -h,  --help                       show this help screen"
  print

  # Source
  print "  -sd, --source-directories <DIRS>  comma separated list with source directories (to search in)"
  print "  -sf, --source-files <FILES>       comma separated list with source files"
  print

  # Output
  print "  -ob, --output-build <DIR>         the output directory where the standalone compressed files should be stored"
  print "  -ox, --output-xml <DIR>           the output directory where the standalone generated xml files should be stored"
  print

  # Jobs
  print "  -go, --generate-optimized         enables the generation of optimized files"
  print "  -lf, --list-files                 list known files"
  print "  -lp, --list-packages              list known knownPackages"
  print "  -li, --list-include               list include order"
  print

  # Include/Exclude
  print "  -ip, --include-packages <PKGIDS>  comma seperated list of package IDs to include"
  print "  -id, --include-ids <IDS>          comma seperated list of file IDs to include"
  print "  -ep, --exclude-packages <PKGIDS>  comma seperated list of package IDs to exclude"
  print "  -ed, --exclude-ids <IDS>          comma seperated list of file IDs to exclude"
  print

  # Options
  print "  -a,  --use-all                    include all known files"
  print "  -ii, --ignore-include-deps        ignore include dependencies, use only explicitly defined things"
  print "  -ie, --ignore-exclude-deps        ignore exclude dependencies, use only explicitly defined things"
  print "  -cf, --combined-file <FILE>       create a combined file with the given filename"
  print "  -oc, --only-combined              do not create single compressed files (useful in combination with the previous option)"
  print





def start():
  # Source
  cmdSourceDirectories = ["source/script", "source/themes"]
  cmdSourceFiles = ""

  # Jobs
  cmdGenerateBuild = False
  cmdListPackages = False
  cmdListFiles = False
  cmdListPre = False
  cmdListPost = False
  cmdListIncludes = False

  # Include/Exclude
  cmdIncludePackages = []
  cmdIncludeIds = []
  cmdExcludePackages = []
  cmdExcludeIds = []

  # Output
  cmdOutputBuild = "build/script"
  cmdOutputXml = "xml"
  cmdOutputCompressed = "compressed"
  cmdOutputTokenized = "tokenized"

  # Options
  cmdOutputCombined = ""
  cmdOutputSingle = True
  cmdIncludeAll = False
  cmdIgnoreIncludeDeps = False
  cmdIgnoreExcludeDeps = False




  if "-h" in sys.argv or "--help" in sys.argv or len(sys.argv) == 1:
    printHelp()
    return




  print
  print "  INITIALISATION"
  print "***********************************************************************************************"

  i = 1
  while i < len(sys.argv):
    c = sys.argv[i]


    # Source
    if c == "-sd" or c == "--source-directories":
      cmdSourceDirectories = sys.argv[i+1].split(",")

      if "" in cmdSourceDirectories:
        cmdSourceDirectories.remove("")
      i += 1

    elif c == "-sf" or c == "--source-files":
      cmdSourceFiles = sys.argv[i+1].split(",")

      if "" in cmdSourceFiles:
        cmdSourceFiles.remove("")
      i += 1




    # Output
    elif c == "-ob" or c == "--output-build":
      cmdOutputBuild = sys.argv[i+1]
      i += 1

    elif c == "-ox" or c == "--output-xml":
      cmdOutputXml = sys.argv[i+1]
      i += 1

    elif c == "-ot" or c == "--output-tokenized":
      cmdOutputTokenized = sys.argv[i+1]
      i += 1

    elif c == "-oc" or c == "--output-compressed":
      cmdOutputCompressed = sys.argv[i+1]
      i += 1




     # Jobs
    elif c == "-gb" or c == "--generate-build":
      cmdGenerateBuild = True

    elif c == "-lp" or c == "--list-packages":
      cmdListPackages = True

    elif c == "-lf" or c == "--list-files":
      cmdListFiles = True

    elif c == "-li" or c == "--list-includes":
      cmdListIncludes = True




    # Include/Exclude
    elif c == "-ip" or c == "--include-packages":
      cmdIncludePackages = sys.argv[i+1].split(",")
      i += 1

    elif c == "-id" or c == "--include-ids":
      cmdIncludeIds = sys.argv[i+1].split(",")
      i += 1

    elif c == "-ep" or c == "--exclude-packages":
      cmdExcludePackages = sys.argv[i+1].split(",")
      i += 1

    elif c == "-ed" or c == "--exclude-ids":
      cmdExcludeIds = sys.argv[i+1].split(",")
      i += 1




    # Options
    elif c == "-cf" or c == "--combined-file":
      cmdOutputCombined = sys.argv[i+1]
      i += 1

    elif c == "-oc" or c == "--only-combined":
      cmdOutputSingle = False

    elif c == "-a" or c == "--use-all":
      cmdIncludeAll = True

    elif c == "-ii" or c == "--ignore-include-deps":
      cmdIgnoreIncludeDeps = True

    elif c == "-ie" or c == "--ignore-exclude-deps":
      cmdIgnoreExcludeDeps = True




    # Fallback
    else:
      print "  Unknown option: %s" % c
      printHelp()
      return



    # Countin' up
    i += 1




  # Inform user
  print "  Source Configuration"
  print "  * Directories (-sd): %s" % cmdSourceDirectories
  print "  * Files (-sf): %s" % cmdSourceFiles
  print "  Output Configuration"
  print "  * Build (-ob): %s" % cmdOutputBuild
  print "  * XML (-ox): %s" % cmdOutputXml
  print "  * Tokenized (-ot): %s" % cmdOutputTokenized
  print "  * Compressed (-oc): %s" % cmdOutputCompressed
  print "  Jobs:"
  print "  * Generate Build (-go): %s" % cmdGenerateBuild
  print "  * List Files (-lf): %s" % cmdListFiles
  print "  * List Packages (-lp): %s" % cmdListPackages
  print "  * List Includes (-li): %s" % cmdListIncludes
  print "  Include:"
  print "  * Packages (-ip): %s" % cmdIncludePackages
  print "  * UniqueIds (-id): %s" % cmdIncludeIds
  print "  Exclude:"
  print "  * Packages (-ep): %s" % cmdExcludePackages
  print "  * UniqueIds (-ed): %s" % cmdExcludeIds
  print "  Options:"
  print "  * Combined File (-cf): %s" % cmdOutputCombined
  print "  * Output Single Generated Files (-oc): %s" % cmdOutputSingle
  print "  * Use All Known Files (-a): %s" % cmdIncludeAll
  print "  * Ignore Include Deps (-ii): %s" % cmdIgnoreIncludeDeps
  print "  * Ignore Exclude Deps (-ie): %s" % cmdIgnoreExcludeDeps

  if cmdGenerateBuild == False and cmdListFiles == False and cmdListPackages == False and cmdListIncludes == False:
    print
    print "  NO JOB GIVEN"
    print "***********************************************************************************************"
    print
    return







  global xmloutput

  loadDependencyData = {}
  runtimeDependencyData = {}

  knownPackages = {}
  knownFiles = {}

  includeIds = []
  excludeIds = []

  combinedOptimized = ""




  print
  print "  PREPARING:"
  print "***********************************************************************************************"

  print "  * Creating directory layout..."

  if not os.path.exists(cmdOutputBuild):
    os.makedirs(cmdOutputBuild)

  if not os.path.exists(cmdOutputXml):
    os.makedirs(cmdOutputXml)

  if not os.path.exists(cmdOutputTokenized):
    os.makedirs(cmdOutputTokenized)




  print "  * Searching for files..."

  for basedir in cmdSourceDirectories:
    for root, dirs, files in os.walk(basedir):
      if "CVS" in dirs:
        dirs.remove('CVS')

      if ".svn" in dirs:
        dirs.remove('.svn')

      for filename in files:
        if os.path.splitext(filename)[1] == JSEXT:
          infilename = os.path.join(root, filename)
          basefilename = filename.replace(JSEXT, "")

          knownFiles[basefilename] = infilename
          if extractDeps(file(infilename, "r").read(), loadDependencyData, runtimeDependencyData, knownPackages) == False:
            print "    * Could not extract dependencies of file: %s" % filename

  for filename in cmdSourceFiles:
    if os.path.splitext(filename)[1] == JSEXT:
      infilename = filename
      basefilename = filename.split(os.sep)[-1].replace(JSEXT, "")

      knownFiles[basefilename] = infilename
      if extractDeps(file(infilename, "r").read(), loadDependencyData, runtimeDependencyData, knownPackages) == False:
        print "Could not extract dependencies of file: %s" % filename




  print "  * Sorting files..."

  # Building Filelists
  if cmdIncludeAll:
    for key in loadDependencyData:
      includeIds.append(key)

  else:
    # Add Packages
    for pkg in cmdIncludePackages:
      includeIds.extend(knownPackages[pkg])

    # Add Files
    includeIds.extend(cmdIncludeIds)



  # Add Exclude knownPackages
  for pkg in cmdExcludePackages:
    excludeIds.extend(knownPackages[pkg])

  # Add Exclude Files
  excludeIds.extend(cmdExcludeIds)

  # Sorting included files...
  sortedIncludeList = []
  for uniqueId in includeIds:
    addUniqueIdToSortedList(uniqueId, loadDependencyData, runtimeDependencyData, sortedIncludeList, cmdIgnoreIncludeDeps)

  # Sorting excluded files...
  sortedExcludeList = []
  for uniqueId in excludeIds:
    addUniqueIdToSortedList(uniqueId, loadDependencyData, runtimeDependencyData, sortedExcludeList, cmdIgnoreExcludeDeps)

  # Remove excluded files from included files list
  for key in sortedExcludeList:
    if key in sortedIncludeList:
      sortedIncludeList.remove(key)







  if cmdListFiles:
    print
    print "  KNOWN FILES:"
    print "***********************************************************************************************"
    for key in knownFiles:
      print "  %s (%s)" % (key, knownFiles[key])

  if cmdListPackages:
    print
    print "  KNOWN PACKAGES:"
    print "***********************************************************************************************"
    for pkg in knownPackages:
      print "  * %s" % pkg
      for key in knownPackages[pkg]:
        print "    - %s" % key

  if cmdListIncludes:
    print
    print "  INCLUDE ORDER:"
    print "***********************************************************************************************"
    for key in sortedIncludeList:
      print "  * %s" % key








  if cmdGenerateBuild:
    print
    print "  PROCESSING FILES:"
    print "***********************************************************************************************"

    for uniqueId in sortedIncludeList:
      print "  * %s" % uniqueId

      infilename = knownFiles[uniqueId]

      if cmdGenerateBuild:
        tokenized = tokenizer(file(knownFiles[uniqueId], "r").read(), infilename)

        tokenizedString = ""
        for token in tokenized:
          tokenizedString += "%s%s" % (token, "\n")

        outfilename = os.path.join(cmdOutputTokenized, uniqueId + TKEXT)

        outfile = file(outfilename, "w")
        outfile.write(tokenizedString)
        outfile.flush()
        outfile.close()


      if cmdGenerateBuild:
        treebuilder(tokenized, uniqueId)

        outfilename = os.path.join(cmdOutputXml, uniqueId + XMLEXT)

        outfile = file(outfilename, "w")
        outfile.write(xmloutput)
        outfile.flush()
        outfile.close()

        xmloutput = ""

        optfilename = os.path.join(cmdOutputCompressed, uniqueId + JSEXT)
        os.system("/usr/bin/xsltproc -o " + optfilename + " tools/generate-dev/compile_compress.xsl " + outfilename)

        if cmdOutputCombined:
          combinedOptimized += "/* " + infilename + " */ " + file(optfilename, "r").read()

        if not cmdOutputSingle:
          os.system("rm -f " + optfilename)



    if cmdGenerateBuild and cmdOutputCombined != "":
      print
      print "  COMBINING OUTPUT FILES"
      print "***********************************************************************************************"
      print "  Writing to: %s" % cmdOutputCombined

      outfile = file(cmdOutputCombined, "w")
      outfile.write(combinedOptimized)
      outfile.flush()
      outfile.close()













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
