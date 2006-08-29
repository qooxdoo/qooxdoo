#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool


def indentout(level, text):
  print "%s%s" % ("  " * level, text)



def compile(node, level=0, enableNewLines=False):
  indentout(level, "%s (%s)" % (node.type, node.get("line", False)))

  compString = ""



  ##################################################################
  # Opening...
  ##################################################################

  if node.type == "map":
    compString += "{"

  elif node.type == "body":
    compString += "{"

  elif node.type == "function":
    functionDeclHasParams = False
    compString += "function"

  elif node.type == "identifier":
    name = node.get("name", False)
    if name != None:
      compString += name

  elif node.type == "call":
    callHasParams = False

  elif node.type == "params":
    compString += "("

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
      if previousType == "call" or previousType == "function":
        compString += ";"

      # Hints for close of node later
      if node.type == "call" and child.type == "params":
        callHasParams = True

      elif node.type == "function" and child.type == "params":
        functionDeclHasParams = True

      # Add child
      compString += compile(child, level+1, enableNewLines)

      # Separate children in parent list
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

  elif node.type == "body":
    compString += "}"

  elif node.type == "params":
    compString += ")"

  elif node.type == "call":
    if not callHasParams:
      compString += "()"

  elif node.type == "function":
    if not functionDeclHasParams:
      compString += "()"




  return compString