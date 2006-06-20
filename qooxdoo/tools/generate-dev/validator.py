#!/usr/bin/env python

import sys, string, re, os, random
import config, tokenizer



def missing_semicolon_error(line, begin, end):
  print "Missing semicolon at line %i between '%s' and '%s'" % (line, begin, end)

def double_semicolon_error(line, begin, end):
  print "Double semicolon at line %i: '%s' before '%s'" % (line, begin, end)

def parenthesis_error(line, begin, end):
  print "Parenthesis error at line %i: '%s' before '%s'" % (line, begin, end)



def validate(tokens):
  lastSource = ""
  lastLine = 0
  lastType = ""

  for token in tokens:
    # print token

    currentSource = token["source"]
    currentLine = token["line"]
    currentType = token["type"]
    currentDetail = token["detail"]

    if currentType == "comment" or currentType == "eol":
      # don't store as last one
      continue

    elif currentType == "name" or currentType == "protected" or currentType == "builtin":
      if currentDetail in config.JSSPACE_BEFORE:
        pass

      elif lastType == "name":
        missing_semicolon_error(lastLine, lastSource, currentSource)

      elif lastType == "protected" or lastType == "builtin":
        if lastDetail in config.JSSPACE_AFTER:
          pass

        elif currentDetail == "IF" and lastDetail == "ELSE":
          pass

        else:
          missing_semicolon_error(lastLine, lastSource, currentSource)

    elif currentType == "token":
      if currentDetail == "SEMICOLON":
        if lastDetail == "SEMICOLON":
          double_semicolon_error(lastLine, lastSource, currentSource)

      elif currentDetail == "SEMICOLON" or lastDetail == "SEMICOLON":
        pass

      # Klammern-Folgen
      elif currentDetail == "LC" or currentDetail == "RC" or currentDetail == "LP" or currentDetail == "RP" or currentDetail == "LB" or currentDetail == "RB":
        if lastDetail == "LC" and (currentDetail == "RP" or currentDetail == "RB"):
          parenthesis_error(lastLine, lastSource, currentSource)
        elif lastDetail == "LP" and (currentDetail == "RC" or currentDetail == "RB"):
          parenthesis_error(lastLine, lastSource, currentSource)
        elif lastDetail == "LB" and (currentDetail == "RC" or currentDetail == "RP"):
          parenthesis_error(lastLine, lastSource, currentSource)

      elif lastDetail == "LC" or lastDetail == "RC" or lastDetail == "LP" or lastDetail == "RP" or lastDetail == "LB" or lastDetail == "RB":
        pass

      elif lastType == "token":
        if currentDetail == "NOT" or currentDetail == "SUB" or currentDetail == "COMMA" or currentDetail == "INC" or currentDetail == "DEC":
          pass

        else:
          missing_semicolon_error(lastLine, lastSource, currentSource)



    # Store last token
    lastSource = currentSource
    lastLine = currentLine
    lastType = currentType
    lastDetail = currentDetail





def main():
  if len(sys.argv) >= 2:
    validate(tokenizer.parseFile(sys.argv[1]))

  else:
    print "validator.py input.js"
    print "First Argument should be a JavaScript file."
    print "Outputs warnings and errors to stdout."



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
