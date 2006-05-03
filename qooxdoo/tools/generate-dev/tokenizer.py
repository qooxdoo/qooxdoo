#!/usr/bin/env python

import sys, string, re, os, random
import config

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
  return s.replace("__$ESCAPE1$__", "\\\"").replace("__$ESCAPE2__", "\\'").replace("__$ESCAPE3__", "\/")



def parseElement(nameContent):
  global tokenizerId
  global tokenizerLine

  if config.JSPROTECTED.has_key(nameContent):
    # print "PROTECTED: %s" % PROTECTED[nameContent]
    return { "type" : "protected", "detail" : config.JSPROTECTED[nameContent], "source" : nameContent, "line" : tokenizerLine, "file" : tokenizerId }

  elif nameContent in config.JSBUILTIN:
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




def parsePart(partContent):
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
          if config.JSTOKENS.has_key(char):
            if temp != "":
              if R_NONWHITESPACE.search(temp):
                result.append(parseElement(temp))

              temp = ""

            result.append({ "type" : "token", "detail" : config.JSTOKENS[char], "source" : char, "line" : tokenizerLine, "file" : tokenizerId })

          else:
            temp += char

        if temp != "":
          if R_NONWHITESPACE.search(temp):
            result.append(parseElement(temp))

          temp = ""

  return result




def parseStream(fileContent, uniqueId):
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
        tokenized.extend(parsePart(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "comment", "detail" : "multi", "source" : recoverEscape(fragment), "file" : tokenizerId, "line" : tokenizerLine })

      tokenizerLine += len(fragment.split("\n")) - 1

    elif R_SINGLECOMMENT.match(fragment):
      # print "Type:SingleComment"

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(parsePart(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "comment", "detail" : "single", "source" : recoverEscape(fragment), "file" : tokenizerId, "line" : tokenizerLine })

    elif R_STRING_A.match(fragment):
      # print "Type:StringA: %s" % fragment

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(parsePart(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "string", "detail" : "singlequotes", "source" : recoverEscape(fragment)[1:-1], "file" : tokenizerId, "line" : tokenizerLine })

    elif R_STRING_B.match(fragment):
      # print "Type:StringB: %s" % fragment

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(parsePart(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "string", "detail" : "doublequotes", "source" : recoverEscape(fragment)[1:-1], "file" : tokenizerId, "line" : tokenizerLine })

    elif R_FLOAT.match(fragment):
      # print "Type:Float: %s" % fragment

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(parsePart(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "number", "detail" : "float", "source" : fragment, "file" : tokenizerId, "line" : tokenizerLine })

    elif R_OPERATORS.match(fragment):
      # print "Type:Operator: %s" % fragment

      pos = fileContent.find(fragment)
      if pos > 0:
        tokenized.extend(parsePart(recoverEscape(fileContent[0:pos])))

      fileContent = fileContent[pos+len(fragment):]
      tokenized.append({ "type" : "token", "detail" : config.JSTOKENS[fragment], "source" : fragment, "file" : tokenizerId, "line" : tokenizerLine })

    else:
      fragresult = R_REGEXP.search(fragment)
      if fragresult:
        # print "Type:RegExp: %s" % fragresult.group(0)

        pos = fileContent.find(fragresult.group(0))
        if pos > 0:
          tokenized.extend(parsePart(recoverEscape(fileContent[0:pos])))

        fileContent = fileContent[pos+len(fragresult.group(0)):]
        tokenized.append({ "type" : "regexp", "detail" : "", "source" : recoverEscape(fragresult.group(0)), "file" : tokenizerId, "line" : tokenizerLine })

      else:
        print "Type:None!"


  tokenized.extend(parsePart(recoverEscape(fileContent)))

  tokenized.append({ "type" : "eof", "source" : "", "detail" : "", "line" : tokenizerLine, "file" : tokenizerId })

  return tokenized



def parseFile(fileName, uniqueId):
  return parseStream(file(fileName, "r").read(), uniqueId)

