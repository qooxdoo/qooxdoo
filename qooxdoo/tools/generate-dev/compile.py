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

R_QXEXTEND = re.compile("([a-zA-Z]+)\.extend\(([a-zA-Z0-9_-]+).*\)")
R_QXREQUIRE = re.compile("#require\(([a-zA-Z0-9_-]+)\)")
R_QXPOST = re.compile("#post\(([a-zA-Z0-9_-]+)\)")
R_QXPACKAGE = re.compile("#package\(([a-zA-Z0-9_-]+)\)")

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

operatorMode = False

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
  global operatorMode

  # reset global stuff
  tokenizerLine = 1
  tokenizerFile = filename
  operatorMode = False

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







def getdeps(data, filename, deptree, posttree, packages):
  if not deptree.has_key(filename):
    deptree[filename] = []

  if not posttree.has_key(filename):
    posttree[filename] = []

  for line in data.split("\n"):
    ext = R_QXEXTEND.search(line)
    req = R_QXREQUIRE.search(line)
    pos = R_QXPOST.search(line)
    pkg = R_QXPACKAGE.search(line)

    if ext:
      inherited = ext.group(1)
      base = ext.group(2)

      if base in BUILTIN:
        if not deptree.has_key(inherited):
          deptree[inherited] = []

      else:
        if deptree.has_key(inherited):
          deptree[inherited].append(base)
        else:
          deptree[inherited] = [base]

    if req:
      deptree[filename].append(req.group(1))

    if pos:
      posttree[filename].append(pos.group(1))

    if pkg:
      pkgname = pkg.group(1)

      if packages.has_key(pkgname):
        packages[pkgname].append(filename)
      else:
        packages[pkgname] = [ filename ]



def handleDeps(key, deptree, posttree, deplist, ignoreDeps):
  try:
    deplist.index(key)

  except ValueError:
    if not ignoreDeps and deptree.has_key(key):
      for subkey in deptree[key]:
        handleDeps(subkey, deptree, posttree, deplist, ignoreDeps)

    try:
      deplist.index(key)
    except ValueError:
      deplist.append(key)

    if not ignoreDeps and posttree.has_key(key):
      for subkey in posttree[key]:
        handleDeps(subkey, deptree, posttree, deplist, ignoreDeps)




def main(conf):
  global xmloutput

  deptree = {}
  posttree = {}

  packages = {}
  allfiles = {}


  print
  print "  PREPARING:"
  print "***********************************************************************************************"

  print "  * Creating directory layout..."

  if conf["outputSingle"] and not os.path.exists(conf["outputBuild"]):
    os.makedirs(conf["outputBuild"])

  if not os.path.exists(conf["outputXml"]):
    os.makedirs(conf["outputXml"])

  if not os.path.exists(conf["outputTokenized"]):
    os.makedirs(conf["outputTokenized"])


  print "  * Searching for files..."

  for basedir in conf["sourceDirectories"]:
    for root, dirs, files in os.walk(basedir):
      if "CVS" in dirs:
        dirs.remove('CVS')

      if ".svn" in dirs:
        dirs.remove('.svn')

      for filename in files:
        if os.path.splitext(filename)[1] == JSEXT:
          infilename = os.path.join(root, filename)
          basefilename = filename.replace(JSEXT, "")

          allfiles[basefilename] = infilename
          getdeps(file(infilename, "r").read(), basefilename, deptree, posttree, packages)



  for filename in conf["sourceFiles"]:
    if os.path.splitext(filename)[1] == JSEXT:
      infilename = filename
      basefilename = filename.split(os.sep)[-1].replace(JSEXT, "")

      allfiles[basefilename] = infilename
      getdeps(file(infilename, "r").read(), basefilename, deptree, posttree, packages)



  print "  * Sorting files..."

  # Building Filelists
  includeFiles = []
  excludeFiles = []

  if conf["useAll"]:
    for key in deptree:
      includeFiles.append(key)

  else:
    # Fix Package List
    if "all" in conf["includePackages"]:
      conf["includePackages"] = []
      for pkg in packages:
        conf["includePackages"].append(pkg)

    # Add Packages
    for pkg in conf["includePackages"]:
      includeFiles.extend(packages[pkg])

    # Add Files
    includeFiles.extend(conf["includeFiles"])



  # Add Exclude Packages
  for pkg in conf["excludePackages"]:
    excludeFiles.extend(packages[pkg])

  # Add Exclude Files
  excludeFiles.extend(conf["excludeFiles"])

  # Looking up for Dependencies
  depIncludeFiles = []
  for key in includeFiles:
    handleDeps(key, deptree, posttree, depIncludeFiles, conf["ignoreDeps"])

  depExcludeFiles = []
  for key in excludeFiles:
    handleDeps(key, deptree, posttree, depExcludeFiles, conf["ignoreDeps"])

  # Remove exclude files form include files
  for key in depExcludeFiles:
    if key in depIncludeFiles:
      depIncludeFiles.remove(key)


  #print ">>> File Include Order: "
  #print depIncludeFiles



  if conf["listFiles"]:
    print
    print "  KNOWN FILES:"
    print "***********************************************************************************************"
    for key in allfiles:
      print "  %s (%s)" % (key, allfiles[key])

  if conf["listPackages"]:
    print
    print "  KNOWN PACKAGES:"
    print "***********************************************************************************************"
    for pkg in packages:
      print "  * %s" % pkg
      for key in packages[pkg]:
        print "    - %s" % key

  if conf["listPre"]:
    print
    print "  PRE DEPENDENCIES:"
    print "***********************************************************************************************"
    for key in deptree:
      if len(deptree[key]) > 0:
        print "  * %s" % key
        for subkey in deptree[key]:
          print "    - %s" % subkey

  if conf["listPost"]:
    print
    print "  POST DEPENDENCIES:"
    print "***********************************************************************************************"
    for key in posttree:
      if len(posttree[key]) > 0:
        print "  * %s" % key
        for subkey in posttree[key]:
          print "    - %s" % subkey

  if conf["listInclude"]:
    print
    print "  INCLUDE ORDER:"
    print "***********************************************************************************************"
    for key in depIncludeFiles:
      print "  * %s" % key



  if len(depIncludeFiles) > 0 and conf["makeOptimized"]:
    print
    print "  PROCESSING FILES:"
    print "***********************************************************************************************"

    if conf["makeOptimized"] and conf["outputCombined"] != "":
      combined = ""

    for item in depIncludeFiles:
      print "  * %s" % item

      if not allfiles.has_key(item):
        print "    -> Missing ID: %s" % item
        continue

      infilename = allfiles[item]

      if conf["makeOptimized"] or conf["makeDocs"]:
        # print "Tokenizing..."
        tokenized = tokenizer(file(allfiles[item], "r").read(), infilename)

        tokenizedString = ""
        for token in tokenized:
          tokenizedString += "%s%s" % (token, "\n")

        outfilename = os.path.join(conf["outputTokenized"], item + TKEXT)

        outfile = file(outfilename, "w")
        outfile.write(tokenizedString)
        outfile.flush()
        outfile.close()


      if conf["makeOptimized"]:
        # print "Optimizing..."
        treebuilder(tokenized, item)

        outfilename = os.path.join(conf["outputXml"], item + XMLEXT)

        outfile = file(outfilename, "w")
        outfile.write(xmloutput)
        outfile.flush()
        outfile.close()

        xmloutput = ""

        optfilename = os.path.join(conf["outputCompressed"], item + JSEXT)
        os.system("/usr/bin/xsltproc -o " + optfilename + " tools/generate-dev/compile_compress.xsl " + outfilename)

        if conf["outputCombined"]:
          combined += "/* " + infilename + " */ " + file(optfilename, "r").read()

        if not conf["outputSingle"]:
          os.system("rm -f " + optfilename)



    if (conf["makeOptimized"]) and conf["outputCombined"] != "":
      print
      print "  COMBINING OUTPUT FILES"
      print "***********************************************************************************************"
      print "  Writing to: %s" % conf["outputCombined"]

      outfile = file(conf["outputCombined"], "w")
      outfile.write(combined)
      outfile.flush()
      outfile.close()


  print
  print "  DONE"
  print "***********************************************************************************************"



def helptext():
  print
  print "  HELP"
  print "***********************************************************************************************"
  print "  -h,  --help                       show this help screen"
  print
  print "  -sd, --source-directories <DIRS>  comma separated list with source directories (to search in)"
  print "  -sf, --source-files <FILES>       comma separated list with source files"
  print
  print "  -ob, --output-build <DIR>         the output directory where the standalone compressed"
  print "                                    files should be stored"
  print "  -ox, --output-xml <DIR>           the output directory where the standalone generated"
  print "                                    xml files should be stored"
  print
  print "  -go, --generate-optimized         enables the generation of optimized files"
  print "  -gd, --generate-docs              enabled the generation of a API documentation"
  print
  print "  -a,  --use-all                    include all known files"
  print "  -i,  --ignore-deps                ignore dependencies, use only given packages and files"
  print "  -cf, --combined-file <FILE>       create a combined file with the given filename"
  print "  -oc, --only-combined              do not create single compressed files (useful in"
  print "                                    combination with the previous option)"
  print
  print "  -lf, --list-files                 list known files"
  print "  -lp, --list-packages              list known packages"
  print "  -lr, --list-pre                   list computed pre dependencies"
  print "  -lo, --list-post                  list computed post dependencies"
  print "  -li, --list-include               list include order"
  print
  print "  -ip, --include-packages <PKGIDS>  comma seperated list of package IDs to include"
  print "  -if, --include-files <FILEIDS>    comma seperated list of file IDs to include"
  print "  -ep, --exclude-packages <PKGIDS>  comma seperated list of package IDs to exclude"
  print "  -ef, --exclude-files <FILEIDS>    comma seperated list of file IDs to exclude"
  print



def start():
  makeOptimized = False
  makeDocs = False

  listPackages = False
  listFiles = False
  listPre = False
  listPost = False
  listInclude = False

  includePackages = []
  includeFiles = []

  excludePackages = []
  excludeFiles = []

  outputCombined = ""
  outputSingle = True

  sourceDirectories = ["source/script", "source/themes"]
  sourceFiles = ""

  outputBuild = "build/script"
  outputXml = "xml"
  outputCompressed = "compressed"
  outputTokenized = "tokenized"

  useAll = False
  ignoreDeps = False

  if "-h" in sys.argv or "--help" in sys.argv or len(sys.argv) == 1:
    helptext()
    return

  print
  print "  INITIALISATION"
  print "***********************************************************************************************"

  i = 1
  while i < len(sys.argv):
    c = sys.argv[i]

    if c == "-sd" or c == "--source-directories":
      sourceDirectories = sys.argv[i+1].split(",")

      if "" in sourceDirectories:
        sourceDirectories.remove("")
      i += 1

    elif c == "-sf" or c == "--source-files":
      sourceFiles = sys.argv[i+1].split(",")

      if "" in sourceFiles:
        sourceFiles.remove("")
      i += 1

    elif c == "-ob" or c == "--output-build":
      outputBuild = sys.argv[i+1]
      i += 1

    elif c == "-ox" or c == "--output-xml":
      outputXml = sys.argv[i+1]
      i += 1

    elif c == "-ot" or c == "--output-tokenized":
      outputTokenized = sys.argv[i+1]
      i += 1

    elif c == "-oc" or c == "--output-compressed":
      outputCompressed = sys.argv[i+1]
      i += 1

    elif c == "-go" or c == "--generate-optimized":
      makeOptimized = True

    elif c == "-gd" or c == "--generate-docs":
      makeDocs = True

    elif c == "-cf" or c == "--combined-file":
      outputCombined = sys.argv[i+1]
      i += 1

    elif c == "-oc" or c == "--only-combined":
      outputSingle = False

    elif c == "-lp" or c == "--list-packages":
      listPackages = True

    elif c == "-lf" or c == "--list-files":
      listFiles = True

    elif c == "-lr" or c == "--list-pre":
      listPre = True

    elif c == "-lo" or c == "--list-post":
      listPost = True

    elif c == "-li" or c == "--list-include":
      listInclude = True

    elif c == "-ip" or c == "--include-packages":
      includePackages = sys.argv[i+1].split(",")
      i += 1

    elif c == "-if" or c == "--include-files":
      includeFiles = sys.argv[i+1].split(",")
      i += 1

    elif c == "-ep" or c == "--exclude-packages":
      excludePackages = sys.argv[i+1].split(",")
      i += 1

    elif c == "-ef" or c == "--exclude-files":
      excludeFiles = sys.argv[i+1].split(",")
      i += 1

    elif c == "-a" or c == "--use-all":
      useAll = True

    elif c == "-i" or c == "--ignore-deps":
      ignoreDeps = True

    else:
      print "  Unknown option: %s" % c
      helptext()
      return




    i += 1


  print "  Source Configuration"
  print "  * Directories (-sd): %s" % sourceDirectories
  print "  * Files (-sf): %s" % sourceFiles
  print "  Output Configuration"
  print "  * Build (-ob): %s" % outputBuild
  print "  * XML (-ox): %s" % outputXml
  print "  * Tokenized (-ot): %s" % outputTokenized
  print "  * Compressed (-oc): %s" % outputCompressed
  print "  Generate:"
  print "  * Optimize (-go): %s" % makeOptimized
  print "  * Docs (-gd): %s" % makeDocs
  print "  List:"
  print "  * Packages (-lp): %s" % listPackages
  print "  * Files (-lf): %s" % listFiles
  print "  * Deps (-ld): %s" % listPre
  print "  * Post (-lp): %s" % listPost
  print "  * Include (-li): %s" % listInclude
  print "  Include (By ID):"
  print "  * Packages (-ip): %s" % includePackages
  print "  * Files (-if): %s" % includeFiles
  print "  Exclude (By ID):"
  print "  * Packages (-ep): %s" % excludePackages
  print "  * Files (-ef): %s" % excludeFiles
  print "  Options:"
  print "  * Combined File (-cf): %s" % outputCombined
  print "  * Output Single Generated Files (-oc): %s" % outputSingle
  print "  * Use All Known Files (-a): %s" % useAll
  print "  * Ignore Deps (-i): %s" % ignoreDeps

  if makeOptimized == False and makeDocs == False and listPackages == False and listFiles == False and listPre == False and listPost == False and listInclude == False:
    print
    print "  NO JOB GIVEN"
    print "***********************************************************************************************"
    print
    return

  main({
    "sourceDirectories" : sourceDirectories, "sourceFiles" : sourceFiles,
    "outputBuild" : outputBuild, "outputXml" : outputXml, "outputTokenized" : outputTokenized, "outputCompressed" : outputCompressed,
    "makeOptimized" : makeOptimized, "makeDocs" : makeDocs,
    "useAll" : useAll, "ignoreDeps" : ignoreDeps, "outputCombined" : outputCombined, "outputSingle" : outputSingle,
    "listPre" : listPre, "listFiles" : listFiles, "listPackages" : listPackages, "listInclude" : listInclude, "listPost" : listPost,
    "includePackages" : includePackages, "includeFiles" : includeFiles,
    "excludePackages" : excludePackages, "excludeFiles" : excludeFiles
  })






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
