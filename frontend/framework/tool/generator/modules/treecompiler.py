#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool


def indentPrint(level, text):
  print "%s%s" % ("  " * level, text)



def getTokenSource(id):
  for key in config.JSTOKENS:
    if config.JSTOKENS[key] == id:
      return key

  return None





def compile(node, level=0, enableNewLines=False):
  indentPrint(level, "%s (%s)" % (node.type, node.get("line", False)))
  compString = ""



  ##################################################################
  # Opening...
  ##################################################################

  if node.type == "map":
    compString += "{"

  elif node.type == "array":
    compString += "["

  elif node.type == "block":
    compString += "{"

  elif node.type == "params":
    compString += "("

  elif node.type == "group":
    compString += "("





  elif node.type == "case":
    compString += "case "

  elif node.type == "catch":
    compString += "catch"

  elif node.type == "finally":
    compString += "finally"

  elif node.type == "delete":
    compString += "delete "

  elif node.type == "break":
    compString += "break"

  elif node.type == "continue":
    compString += "continue"

  elif node.type == "elseStatement":
    compString += "else"

  elif node.type == "switch" and node.get("switchType") == "case":
    compString += "switch"

  elif node.type == "switch" and node.get("switchType") == "catch":
    compString += "try"

  elif node.type == "throw":
    compString += "throw "

  elif node.type == "instantiation":
    compString += "new "

  elif node.type == "return":
    compString += "return "

  elif node.type == "definitionGroup":
    compString += "var "

  elif node.type == "default":
    compString += "default:"

  elif node.type == "try":
    compString += "try:"




  elif node.type == "keyvalue":
    compString += node.get("key") + ":"

  elif node.type == "expression":
    if node.parent.type == "loop":
      # open expression block of IF/WHILE/DO-WHILE/FOR statements
      compString += "("
    elif node.parent.type == "catch":
      # open expression block of CATCH statement
      compString += "("
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      # open expression block of SWITCH statement
      compString += "("

  elif node.type == "loop":
    loopType = node.get("loopType")
    if loopType == "IF":
      if node.parent.type == "elseStatement":
        compString += " "

      compString += "if"

    elif loopType == "WHILE":
      compString += "while"

    elif loopType == "FOR":
      compString += "for"

    elif loopType == "DO":
      compString += "do"

    else:
      print "UNKNOWN LOOP TYPE: %s" % loopType

  elif node.type == "function":
    functionDeclHasParams = False
    compString += "function"

    functionName = node.get("name", False)
    if functionName != None:
      compString += " %s" % functionName

  elif node.type == "identifier":
    name = node.get("name", False)
    if name != None:
      compString += name

  elif node.type == "call":
    callHasParams = False

  elif node.type == "definition":
    if node.parent.type != "definitionGroup":
      compString += "var "

    compString += node.get("identifier")

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

  elif node.type == "third":
    if node.parent.type == "operation":
      if node.parent.get("operator") == "HOOK":
        compString += ":"
      else:
        print "Unknown third argument... Not a hook"










  ##################################################################
  # Children content
  ##################################################################

  if node.hasChildren():
    childPosition = 1
    childrenNumber = 0

    # We need to ignore comment blocks
    # childrenNumber = len(node.children)

    for child in node.children:
      if not (child.type == "commentsBefore" or child.type == "comments"):
        childrenNumber += 1

    previousType = None
    separators = [ "assignment", "call", "operation", "definition", "definitionGroup", "return", "loop", "switch", "break", "continue", "default", "case" ]
    not_after = [ "case", "default" ]


    for child in node.children:
      if child.type == "commentsBefore" or child.type == "comments":
        continue

      # Separate execution blocks
      if node.type != "definitionGroup":
        if previousType in separators and child.type in separators:
          if not previousType in not_after:
            compString += ";"

            if enableNewLines:
              compString += "\n"




      # Hints for close of node later
      if node.type == "call" and child.type == "params":
        callHasParams = True

      elif node.type == "function":
        if child.type == "params":
          functionDeclHasParams = True

        elif child.type == "body" and not functionDeclHasParams:
          # has no params before body, fix it here, and add body afterwards
          compString += "()"
          functionDeclHasParams = True

      elif node.type == "definition" and child.type == "assignment":
        compString += "="

      elif node.type == "accessor" and child.type == "key":
        compString += "["

      elif node.type == "accessor" and child.type == "right":
        compString += "."

      elif node.type == "loop" and node.get("loopType") == "FOR":
        if child.type == "first":
          compString += "("
        elif child.type == "statement":
          compString += ")"
        else:
          compString += ";"

          if enableNewLines:
            compString += "\n"

      if node.type == "operation" and node.get("left", False) == "true":
        op = node.get("operator")

        if op == "TYPEOF":
          compString += "typeof "
        elif op == None:
          print "BAD OPERATOR [A]: %s" % op
        else:
          compString += getTokenSource(op)



      # Add child
      compString += compile(child, level+1, enableNewLines)



      if node.type == "operation" and child.type == "first" and node.get("left", False) != "true":
        op = node.get("operator")

        if op == "IN":
          compString += " in "
        elif op == "INSTANCEOF":
          compString += " instanceof "
        elif op == None:
          print "BAD OPERATOR [B]: %s" % op
        else:
          compString += getTokenSource(op)

      elif node.type == "assignment" and child.type == "left":
        compString += "="

      elif node.type == "accessor" and child.type == "key":
        compString += "]"





      # Separate children in parent list
      if childPosition < childrenNumber:
        if node.type == "variable":
          compString += "."

        elif node.type == "map":
          compString += ","

          if enableNewLines:
            compString += "\n"

        elif node.type == "array":
          compString += ","

          if enableNewLines:
            compString += "\n"

        elif node.type == "definitionGroup":
          compString += ","

          if enableNewLines:
            compString += "\n"

        elif node.type == "params":
          compString += ","

          if enableNewLines:
            compString += "\n"

        elif node.type == "statementList":
          compString += ","

          if enableNewLines:
            compString += "\n"





      # Next...
      childPosition += 1
      previousType = child.type





  ##################################################################
  # Closing...
  ##################################################################

  if node.type == "map":
    compString += "}"

  elif node.type == "array":
    compString += "]"

  elif node.type == "block":
    compString += "}"

  elif node.type == "params":
    compString += ")"

  elif node.type == "switch" and node.get("switchType") == "case":
    compString += "}"

  elif node.type == "group":
    compString += ")"

  elif node.type == "case":
    compString += ":"

  elif node.type == "call" and not callHasParams:
    compString += "()"

  elif node.type == "function" and not functionDeclHasParams:
    compString += "()"

  elif node.type == "expression":
    if node.parent.type == "loop":
      compString += ")"
    elif node.parent.type == "catch":
      compString += ")"
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      compString += "){"





  return compString