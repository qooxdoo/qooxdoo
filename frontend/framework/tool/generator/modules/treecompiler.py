#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool


def indentout(level, text):
  print "%s%s" % ("  " * level, text)



def compile(node, level=0, enableNewLines=False):
  indentout(level, node.type)

  compString = ""

  if node.type == "map":
    compString += "{"

  elif node.type == "identifier":
    compString += node.get("name")

  elif node.type == "operand":
    pass

  elif node.type == "constant":
    if node.get("constantType") == "string":
      if node.get("detail") == "singlequotes":
        compString += "'"
      else:
        compString += '"'

      compString += node.get("value")

      if node.get("detail") == "singlequotes":
        compString += "'"
      else:
        compString += '"'

    else:
      compString += node.get("value")

  elif node.type == "keyvalue":
    compString += node.get("key") + ":"

  elif node.type == "value":
    # use children content: constant, ...
    pass


  # Generate code for children
  if node.hasChildren():
    pos = 0
    length = len(node.children)

    for child in node.children:
      pos += 1
      compString += compile(child, level+1, enableNewLines)

      if pos < length:
        if node.type == "variable":
          compString += "."

        elif node.type == "map":
          compString += ","


  # Closing stuff
  if node.type == "map":
    compString += "}"

  elif node.type == "value":
    # use children content
    pass


  return compString