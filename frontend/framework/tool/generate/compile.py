#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool

def compile(tokens, enableNewLines=False):
  compString = ""
  lastSource = ""
  lastNeedsSpace = False

  for token in tokens:
    if token["type"] == "comment" or token["type"] == "eol":
      continue

    # Fix end of file if it ends with a '}'
    if token["type"] == "eof":
      if lastSource == "}":
        compString += ";"

      continue

    # Advanced check for for previous token and the space needs
    if lastNeedsSpace:
      # If a token follows a function or return statement, we need no additional space
      if token["type"] == "token" and (lastSource == "function" or lastSource == "return"):
        pass

      else:
        compString += " "

    # Special handling for some protected names
    if token["type"] == "protected":
      if token["detail"] in config.JSSPACE_BEFORE:
        compString += " "

    # Add quotes for strings
    if token["type"] == "string":
      if token["detail"] == "compressed":
        pass
      elif token["detail"] == "doublequotes":
        compString += "\""
      else:
        compString += "'"

    # Special if-else handling
    elif token["source"] == "if" and lastSource == "else":
      compString += " "

    # We need to seperate special blocks (could also be a new line)
    if lastSource == "}" and token["type"] != "token" and (token["type"] != "protected" or not token["detail"] in config.JSPARANTHESIS_BEFORE):
      compString += ";"





    # Add source
    compString += "%s" % token["source"]




    # Add quotes for strings
    if token["type"] == "string":
      if token["detail"] == "compressed":
        pass
      elif token["detail"] == "doublequotes":
        compString += "\""
      else:
        compString += "'"

    # Reset
    lastNeedsSpace = False

    # Special handling for some protected names
    if token["type"] == "protected":
      if token["detail"] in config.JSSPACE_AFTER:
        compString += " "

      elif token["detail"] in config.JSSPACE_AFTER_USAGE:
        lastNeedsSpace = True


    # Add new lines (if enabled)
    if enableNewLines and token["source"] == ";":
      compString += "\n"



    lastSource = token["source"]

  return compString






def main():
  parser = optparse.OptionParser()

  parser.add_option("-w", "--write", action="store_true", dest="write", default=False, help="Writes file to incoming fileName + EXTENSION.")
  parser.add_option("-e", "--extension", dest="extension", metavar="EXTENSION", help="The EXTENSION to use", default=".compiled")

  (options, args) = parser.parse_args()

  if len(args) == 0:
    print "Needs one or more arguments (files) to compile!"
    sys.exit(1)

  for fileName in args:
    print "Compiling %s => %s%s" % (fileName, fileName, options.extension)

    compiledString = compile(tokenizer.parseFile(fileName))
    if options.write:
      filetool.save(fileName + options.extension, compiledString)

    else:
      print compiledString



if __name__ == '__main__':
  try:
    main()

  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)
