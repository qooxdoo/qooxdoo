#!/usr/bin/env python

import sys, string, re, os, random
import config, tokenizer

def compile(tokens, enableNewLines=False):
  compString = ""
  lastSource = ""

  for token in tokens:
    if token["type"] == "comment" or token["type"] == "eol":
      continue

    # Fix end of file if it ends with a '}'
    if token["type"] == "eof":
      if lastSource == "}":
        compString += ";"

      continue

    # Special handling for some protected names
    if token["type"] == "protected":
      if token["detail"] in config.JSSPACE_BEFORE:
        compString += " "

    # Add quotes for strings
    if token["type"] == "string":
      if token["detail"] == "doublequotes":
        compString += "\""
      else:
        compString += "'"

    # Special if-else handling
    elif token["source"] == "if" and lastSource == "else":
      compString += " "

    # We need to seperate special blocks (could also be a new line)
    if lastSource == "}" and (token["type"] == "name" or token["source"] == "var"):
      compString += ";"

    # Add source
    compString += token["source"]

    # Add quotes for strings
    if token["type"] == "string":
      if token["detail"] == "doublequotes":
        compString += "\""
      else:
        compString += "'"

    # Special handling for some protected names
    if token["type"] == "protected":
      if token["detail"] in config.JSSPACE_AFTER:
        compString += " "



    # Add new lines (if enabled)
    if enableNewLines and token["source"] == ";":
      compString += "\n"



    lastSource = token["source"]

  return compString






def main():
  if len(sys.argv) >= 2:
    compiledString = compile(tokenizer.parseFile(sys.argv[1]))
    if len(sys.argv) >= 3:
      compiledFile = file(sys.argv[2], "w")
      compiledFile.write(compiledString)
      compiledFile.flush()
      compiledFile.close()
    else:
      print compiledString

  else:
    print "compile.py input.js [output.js]"
    print "First Argument should be a JavaScript file."
    print "Outputs compiled javascript to stdout if the second argument (the target file) is missing."



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
