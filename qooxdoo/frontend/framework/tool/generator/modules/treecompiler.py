#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool, treegenerator


KEY = re.compile("^[A-Za-z0-9_]+$")


def indentPrint(level, text):
  print "%s%s" % ("  " * level, text)



def getTokenSource(id):
  for key in config.JSTOKENS:
    if config.JSTOKENS[key] == id:
      return key

  return None




def compile(node, enableNewLines=False, enableDebug=False):
  return compileNode(node, 0, enableNewLines, enableDebug)




def compileNode(node, level=0, enableNewLines=False, enableDebug=False):

  if enableDebug:
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

    if node.get("label", False):
      compString += " " + node.get("label", False)

  elif node.type == "continue":
    compString += "continue"

    if node.get("label", False):
      compString += " " + node.get("label", False)

  elif node.type == "elseStatement":
    # This was a (if)statement without a block around (a set of {})
    if not node.parent.getChild("statement").hasChild("block"):
      if not compString.endswith(";") and not compString.endswith("\n"):
        compString += ";"

        if enableNewLines:
          compString += "\n"

    compString += "else"

    # This is a elseStatement without a block around (a set of {})
    if not node.hasChild("block"):
      compString += " "

  elif node.type == "switch" and node.get("switchType") == "case":
    compString += "switch"

  elif node.type == "switch" and node.get("switchType") == "catch":
    compString += "try"

  elif node.type == "throw":
    compString += "throw "

  elif node.type == "instantiation":
    compString += "new "

  elif node.type == "return":
    compString += "return"

    if node.hasChildren():
      compString += " "

  elif node.type == "definitionList":
    compString += "var "

  elif node.type == "default":
    compString += "default:"




  elif node.type == "keyvalue":
    keyString = node.get("key")
    keyQuote = node.get("quotation", False)

    if keyQuote != None:
      # print "USE QUOTATION"
      if keyQuote == "doublequotes":
        keyString = '"' + keyString + '"'
      else:
        keyString = "'" + keyString + "'"

    elif keyString in config.JSPROTECTED or not KEY.match(keyString):
      print "ATTENTION: Auto protect key: %s" % keyString
      keyString = "\"" + keyString + "\""

    compString += keyString + ":"

  elif node.type == "expression":
    if node.parent.type == "loop":
      loopType = node.parent.get("loopType")

      if loopType == "DO":
        compString += "while"

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
      compString += "if"

    elif loopType == "WHILE":
      compString += "while"

    elif loopType == "FOR":
      compString += "for"

    elif loopType == "DO":
      compString += "do"

    elif loopType == "WITH":
      compString += "with"

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
    if node.parent.type != "definitionList":
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

  elif node.type == "labelTerminator":
    compString += ":"










  ##################################################################
  # Children content
  ##################################################################

  if node.hasChildren():
    childPosition = 1
    childrenNumber = 0

    # We need to ignore comment blocks
    # childrenNumber = len(node.children)

    for child in node.children:
      if not (child.type == "commentsBefore" or child.type == "comment"):
        childrenNumber += 1

    previousType = None
    separators = [ "block", "assignment", "call", "operation", "definition", "definitionList", "return", "loop", "switch", "break", "continue", "default", "case", "delete", "accessor", "instantiation", "throw", "variable", "function" ]
    not_after = [ "case", "default" ]
    not_in = [ "definitionList", "statementList", "params", "variable", "array" ]



    for child in node.children:
      if child.type == "commentsBefore" or child.type == "comment":
        continue






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
        oper = child.get("operator", False)

        if oper != None:
          compString += getTokenSource(oper)
        else:
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
          if child.type == "second" and node.getChild("first", False) == None:
            compString += "("

          if child.type == "third" and node.getChild("first", False) == None and node.getChild("second", False) == None:
            compString += "("

          if not compString.endswith(";") and not compString.endswith("\n"):
            compString += ";"

            if enableNewLines:
              compString += "\n"

      elif node.type == "operation" and node.get("left", False) == "true":
        op = node.get("operator")

        if op == "TYPEOF":
          compString += "typeof "
        elif op == None:
          print "BAD OPERATOR [A]: %s" % op
        else:
          compString += getTokenSource(op)


      # Separate execution blocks
      elif not node.type in not_in:
        if previousType in separators and child.type in separators:
          if not previousType in not_after:
            if not compString.endswith(";") and not compString.endswith("\n"):
              if enableDebug:
                compString += ";/*[Parent:%s|Previous:%s|Child:%s]*/" % (node.type, previousType, child.type)
              else:
                compString += ";"

              if enableNewLines:
                compString += "\n"



      # Add child
      compString += compileNode(child, level+1, enableNewLines, enableDebug)



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
        oper = node.get("operator", False)

        if oper != None:
          compString += getTokenSource(oper)
        else:
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

        elif node.type == "definitionList":
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






def main():
  parser = optparse.OptionParser()

  parser.add_option("-w", "--write", action="store_true", dest="write", default=False, help="Writes file to incoming fileName + EXTENSION.")
  parser.add_option("-e", "--extension", dest="extension", metavar="EXTENSION", help="The EXTENSION to use", default=".compiled")

  (options, args) = parser.parse_args()

  if len(args) == 0:
    print "Needs one or more arguments (files) to compile!"
    sys.exit(1)

  for fileName in args:
    if options.write:
      print "Compiling %s => %s%s" % (fileName, fileName, options.extension)
    else:
      print "Compiling %s => stdout" % fileName

    compiledString = compile(treegenerator.createSyntaxTree(tokenizer.parseFile(fileName)))
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

