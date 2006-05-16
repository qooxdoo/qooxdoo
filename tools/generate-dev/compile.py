#!/usr/bin/env python

import sys, string, re, os, random
import config

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
