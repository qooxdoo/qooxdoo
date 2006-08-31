#!/usr/bin/env python

import sys, string, re, os, random, optparse, codecs
import config, filetool

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

S_OPERATORS_2 = r"(==)|(!=)|(\+\+)|(--)|(-=)|(\+=)|(\*=)|(/=)|(%=)|(&&)|(\|\|)|(\>=)|(\<=)|(>>)|(<<)|(\^\|)|(\|=)|(\^=)|(&=)|(::)|(\.\.)"
S_OPERATORS_3 = r"(===)|(!==)|(\<\<=)|(\>\>=)"
S_OPERATORS_4 = r"(\>\>\>=)"
S_OPERATORS = "(" + S_OPERATORS_4 + "|" + S_OPERATORS_3 + "|" + S_OPERATORS_2 + ")"

S_REGEXP = "(\/[^\t\n\r\f\v]+?\/[mgi]*)"
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




parseLine = 0
parseUniqueId = ""



def protectEscape(s):
  return s.replace("\\\\", "__$ESCAPE0$__").replace("\\\"", "__$ESCAPE1$__").replace("\\\'", "__$ESCAPE2__").replace("\/", "__$ESCAPE3__")



def recoverEscape(s):
  return s.replace("__$ESCAPE0$__", "\\\\").replace("__$ESCAPE1$__", "\\\"").replace("__$ESCAPE2__", "\\'").replace("__$ESCAPE3__", "\/")



def parseElement(content):
  global parseUniqueId
  global parseLine

  if config.JSPROTECTED.has_key(content):
    # print "PROTECTED: %s" % PROTECTED[content]
    return { "type" : "protected", "detail" : config.JSPROTECTED[content], "source" : content, "line" : parseLine, "id" : parseUniqueId }

  elif content in config.JSBUILTIN:
    # print "BUILTIN: %s" % content
    return { "type" : "builtin", "detail" : "", "source" : content, "line" : parseLine, "id" : parseUniqueId }

  elif R_NUMBER.search(content):
    # print "NUMBER: %s" % content
    return { "type" : "number", "detail" : "int", "source" : content, "line" : parseLine, "id" : parseUniqueId }

  elif content.startswith("_"):
    # print "PRIVATE NAME: %s" % content
    return { "type" : "name", "detail" : "private", "source" : content, "line" : parseLine, "id" : parseUniqueId }

  elif len(content) > 0:
    # print "PUBLIC NAME: %s" % content
    return { "type" : "name", "detail" : "public", "source" : content, "line" : parseLine, "id" : parseUniqueId }




def parsePart(content):
  global parseUniqueId
  global parseLine

  tokens = []
  temp = ""

  for line in R_NEWLINE.split(content):
    if line == "\n":
      tokens.append({ "type" : "eol", "source" : "", "detail" : "", "line" : parseLine, "id" : parseUniqueId })
      parseLine += 1

    else:
      for item in R_WHITESPACE.split(line):
        for char in item:
          if config.JSTOKENS.has_key(char):
            if temp != "":
              if R_NONWHITESPACE.search(temp):
                tokens.append(parseElement(temp))

              temp = ""

            tokens.append({ "type" : "token", "detail" : config.JSTOKENS[char], "source" : char, "line" : parseLine, "id" : parseUniqueId })

          else:
            temp += char

        if temp != "":
          if R_NONWHITESPACE.search(temp):
            tokens.append(parseElement(temp))

          temp = ""

  return tokens



def parseFragmentLead(content, fragment, tokens):
  pos = content.find(fragment)

  if pos > 0:
    tokens.extend(parsePart(recoverEscape(content[0:pos])))

  return content[pos+len(fragment):]



def parseStream(content, uniqueId):
  # make global variables available
  global parseLine
  global parseUniqueId

  # reset global stuff
  parseLine = 1
  parseUniqueId = uniqueId

  # prepare storage
  tokens = []
  content = protectEscape(content)

  # print "      * searching for patterns..."
  all = R_ALL.findall(content)

  # print "      * structuring..."
  for item in all:
    fragment = item[0]

    # print fragment

    if R_MULTICOMMENT.match(fragment):
      # print "Type:MultiComment"
      content = parseFragmentLead(content, fragment, tokens)
      tokens.append({ "type" : "comment", "detail" : "multi", "source" : recoverEscape(fragment), "id" : parseUniqueId, "line" : parseLine })

      parseLine += len(fragment.split("\n")) - 1

    elif R_SINGLECOMMENT.match(fragment):
      # print "Type:SingleComment"
      content = parseFragmentLead(content, fragment, tokens)
      tokens.append({ "type" : "comment", "detail" : "single", "source" : recoverEscape(fragment), "id" : parseUniqueId, "line" : parseLine })

    elif R_STRING_A.match(fragment):
      # print "Type:StringA: %s" % fragment
      content = parseFragmentLead(content, fragment, tokens)
      tokens.append({ "type" : "string", "detail" : "singlequotes", "source" : recoverEscape(fragment)[1:-1], "id" : parseUniqueId, "line" : parseLine })

    elif R_STRING_B.match(fragment):
      # print "Type:StringB: %s" % fragment
      content = parseFragmentLead(content, fragment, tokens)
      tokens.append({ "type" : "string", "detail" : "doublequotes", "source" : recoverEscape(fragment)[1:-1], "id" : parseUniqueId, "line" : parseLine })

    elif R_FLOAT.match(fragment):
      # print "Type:Float: %s" % fragment
      content = parseFragmentLead(content, fragment, tokens)
      tokens.append({ "type" : "number", "detail" : "float", "source" : fragment, "id" : parseUniqueId, "line" : parseLine })

    elif R_OPERATORS.match(fragment):
      # print "Type:Operator: %s" % fragment
      content = parseFragmentLead(content, fragment, tokens)
      tokens.append({ "type" : "token", "detail" : config.JSTOKENS[fragment], "source" : fragment, "id" : parseUniqueId, "line" : parseLine })

    else:
      fragresult = R_REGEXP.search(fragment)
      if fragresult:
        # print "Type:RegExp: %s" % fragresult.group(0)
        content = parseFragmentLead(content, fragresult.group(0), tokens)
        tokens.append({ "type" : "regexp", "detail" : "", "source" : recoverEscape(fragresult.group(0)), "id" : parseUniqueId, "line" : parseLine })

      else:
        print "Type:None!"

  tokens.extend(parsePart(recoverEscape(content)))
  tokens.append({ "type" : "eof", "source" : "", "detail" : "", "line" : parseLine, "id" : parseUniqueId })

  return tokens



def parseFile(fileName, uniqueId=None, encoding="utf-8"):
  return parseStream(codecs.open(fileName, "r", encoding).read(), uniqueId)




def convertTokensToString(tokens):
  tokenizedString = ""

  for token in tokens:
    tokenizedString += "%s%s" % (token, "\n")

  return tokenizedString





def main():
  parser = optparse.OptionParser()

  parser.add_option("-w", "--write", action="store_true", dest="write", default=False, help="Writes file to incoming fileName + EXTENSION.")
  parser.add_option("-e", "--extension", dest="extension", metavar="EXTENSION", help="The EXTENSION to use", default=".tokenized")

  (options, args) = parser.parse_args()

  if len(args) == 0:
    print "Needs one or more arguments (files) to tokenize!"
    sys.exit(1)

  for fileName in args:
    print "Compiling %s => %s%s" % (fileName, fileName, options.extension)

    tokenString = convertTokensToString(parseFile(fileName))
    if options.write:
      filetool.save(fileName + options.extension, tokenString)

    else:
      print tokenString




if __name__ == '__main__':
  try:
    main()

  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)
