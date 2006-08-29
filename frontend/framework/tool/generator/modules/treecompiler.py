#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool


def indentout(level, text):
  print "%s%s" % ("  " * level, text)



def compile(node, level=0, enableNewLines=False):
  indentout(level, node.type)

  compString = ""



  ##################################################################
  # Opening...
  ##################################################################

  if node.type == "map":
    compString += "{"

  elif node.type == "identifier":
    compString += node.get("name")

  elif node.type == "call":
    callHasParams = False
    pass

  elif node.type == "operand":
    pass

  elif node.type == "params":
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




  ##################################################################
  # Children content
  ##################################################################

  if node.hasChildren():
    childPosition = 1
    childrenNumber = len(node.children)
    previousType = None

    for child in node.children:
      if previousType == "call":
        compString += ";"




      if node.type == "call" and child.type == "params":
        compString += "("
        callHasParams = True

      compString += compile(child, level+1, enableNewLines)

      if node.type == "call" and child.type == "params":
        compString += ")"

      if childPosition < childrenNumber:
        if node.type == "variable":
          compString += "."

        elif node.type == "map":
          compString += ","

        elif node.type == "params":
          compString += ","



      # Next...
      childPosition += 1
      previousType = child.type





  ##################################################################
  # Closing...
  ##################################################################

  if node.type == "map":
    compString += "}"

  elif node.type == "call":
    if not callHasParams:
      compString += "()"






  return compString