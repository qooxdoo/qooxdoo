#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool, treegenerator

KEY = re.compile("^[A-Za-z0-9_]+$")



def getTokenSource(id):
  for key in config.JSTOKENS:
    if config.JSTOKENS[key] == id:
      return key

  return None


def out(txt):

  global indent
  global newline
  global needindent
  global pretty

  if newline:
    pretty += "\n"
    needindent = True
    newline = False

  if needindent:
    pretty += ("  " * indent)
    needindent = False

  pretty += txt


def line():
  global needindent
  global pretty

  # ignore if this is the first content inside the file
  if pretty == "":
    return

  pretty += "\n"

  needindent = True


def plus():
  global indent
  indent += 1


def minus():
  global indent
  indent -= 1


def semicolon():
  global pretty
  pretty += ";"


def compile(node, enableDebug=False):
  global indent
  global needindent
  global newline
  global pretty

  indent = 0
  needindent = False
  pretty = ""
  newline = False

  compileNode(node, enableDebug)

  return pretty.strip()


def compileNode(node, enableDebug=False):
  global newline

  if node.getChild("commentsBefore", False) != None:
    for comment in node.getChild("commentsBefore").children:
      newline = True
      out(comment.get("text").strip())
      newline = True






  ##################################################################
  # Opening...
  ##################################################################

  if node.type == "map":
    if node.hasChildren():
      newline = True

    out("{")

    if node.hasChildren():
      plus()
      newline = True

  elif node.type == "array":
    if node.hasChildren():
      newline = True

    out("[")

    if node.hasChildren():
      plus()
      newline = True

  elif node.type == "block":
    if node.get("compact"):
      out(" ")

    else:
      newline = True

    out("{")
    plus()
    newline = True

  elif node.type == "params":
    out("(")

  elif node.type == "group":
    out("(")

  elif node.type == "case":
    minus()
    newline = True
    out("case ")

  elif node.type == "catch":
    # If this statement block or the previous try was compact, be compact here, too
    if node.getChild("statement").getChild("block").get("compact") and node.parent.getChild("statement").getChild("block").get("compact"):
      newline = False
      out(" ")

    out("catch")

  elif node.type == "finally":
    out("finally")

  elif node.type == "delete":
    out("delete ")

  elif node.type == "break":
    out("break")

    if node.get("label", False):
      out(" " + node.get("label", False))

  elif node.type == "continue":
    out("continue")

    if node.get("label", False):
      out(" " + node.get("label", False))

  elif node.type == "elseStatement":
    # If this statement block or the previous try was compact, be compact here, too
    if node.getChild("block").get("compact") and node.parent.getChild("statement").getChild("block").get("compact"):
      newline = False
      out(" ")

    out("else")

    # This is a elseStatement without a block around (a set of {})
    if not node.hasChild("block"):
      out(" ")

  elif node.type == "switch" and node.get("switchType") == "case":
    out("switch")

  elif node.type == "switch" and node.get("switchType") == "catch":
    out("try")

  elif node.type == "throw":
    out("throw ")

  elif node.type == "instantiation":
    out("new ")

  elif node.type == "return":
    out("return")

    if node.hasChildren():
      out(" ")

  elif node.type == "definitionList":
    out("var ")

  elif node.type == "default":
    minus()
    newline = True
    out("default:")
    plus()
    newline = True






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

    out(keyString + " : ")

  elif node.type == "expression":
    if node.parent.type == "loop":
      loopType = node.parent.get("loopType")

      if loopType == "DO":
        out("while")

      # open expression block of IF/WHILE/DO-WHILE/FOR statements
      out("(")
    elif node.parent.type == "catch":
      # open expression block of CATCH statement
      out("(")
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      # open expression block of SWITCH statement
      out("(")

  elif node.type == "loop":
    loopType = node.get("loopType")
    if loopType == "IF":
      out("if")

    elif loopType == "WHILE":
      out("while")

    elif loopType == "FOR":
      out("for")

    elif loopType == "DO":
      out("do")

    elif loopType == "WITH":
      out("with")

    else:
      print "UNKNOWN LOOP TYPE: %s" % loopType

  elif node.type == "function":
    functionDeclHasParams = False
    out("function")

    functionName = node.get("name", False)
    if functionName != None:
      out(" %s" % functionName)

  elif node.type == "identifier":
    name = node.get("name", False)
    if name != None:
      out(name)

  elif node.type == "call":
    callHasParams = False

  elif node.type == "definition":
    if node.parent.type != "definitionList":
      out("var ")

    out(node.get("identifier"))

  elif node.type == "constant":
    if node.get("constantType") == "string":
      if node.get("detail") == "singlequotes":
        out("'")
      else:
        out('"')

      out(node.get("value"))

      if node.get("detail") == "singlequotes":
        out("'")
      else:
        out('"')

    else:
      out(node.get("value"))

  elif node.type == "third":
    if node.parent.type == "operation":
      if node.parent.get("operator") == "HOOK":
        out(" : ")
      else:
        print "Unknown third argument... Not a hook"

  elif node.type == "labelTerminator":
    out(":")










  ##################################################################
  # Children content
  ##################################################################

  if node.hasChildren():
    childPosition = 1
    childrenNumber = 0

    # We need to ignore comment blocks
    # childrenNumber = len(node.children)

    for child in node.children:
      if child.type == "comment" or child.type == "commentsBefore":
        pass

      else:
        childrenNumber += 1


    previousType = None


    for child in node.children:
      if child.type == "comment" or child.type == "commentsBefore":
        continue




      # Hints for close of node later
      if node.type == "call" and child.type == "params":
        callHasParams = True

      elif node.type == "function":
        if child.type == "params":
          functionDeclHasParams = True

        elif child.type == "body" and not functionDeclHasParams:
          # has no params before body, fix it here, and add body afterwards
          out("()")
          functionDeclHasParams = True

      elif node.type == "definition" and child.type == "assignment":
        oper = child.get("operator", False)

        realNode = node.parent
        inForLoop = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"

        if not inForLoop and not oper in [ "INC", "DEC" ]:
          out(" ")

        if oper != None:
          out(getTokenSource(oper))
        else:
          out("=")

        if not inForLoop and not oper in [ "INC", "DEC" ]:
          out(" ")

      elif node.type == "accessor" and child.type == "key":
        out("[")

      elif node.type == "accessor" and child.type == "right":
        out(".")

      elif node.type == "loop" and node.get("loopType") == "FOR":
        if child.type == "first":
          out("(")
        elif child.type == "statement":
          out(")")
        else:
          if child.type == "second" and node.getChild("first", False) == None:
            out("(")

          if child.type == "third" and node.getChild("first", False) == None and node.getChild("second", False) == None:
            out("(")

          if not pretty.endswith(";") and not pretty.endswith("\n"):
            out("; ")

      elif node.type == "operation" and node.get("left", False) == True:
        oper = node.get("operator")

        if oper == "TYPEOF":
          out("typeof ")
        elif oper == None:
          print "BAD OPERATOR [A]: %s" % oper
        else:
          inForLoop = False

          if node.parent.type == "statementList":
            realNode = node.parent
          else:
            realNode = node

          inForLoop = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"

          if not inForLoop and not oper in [ "INC", "DEC" ]:
            out(" ")

          out(getTokenSource(oper))

          if not inForLoop and not oper in [ "INC", "DEC" ]:
            out(" ")




      # Add child
      compileNode(child, enableDebug)









      if node.type == "operation" and child.type == "first" and node.get("left", False) != True:
        oper = node.get("operator")

        if node.parent.type == "statementList":
          realNode = node.parent
        else:
          realNode = node

        inForLoop = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"

        if not inForLoop and not oper in [ "INC", "DEC" ]:
          out(" ")

        if oper == "IN":
          out("in")
        elif oper == "INSTANCEOF":
          out("instanceof")
        elif oper == None:
          print "BAD OPERATOR [B]: %s" % oper
        else:
          out(getTokenSource(oper))

        if not inForLoop and not oper in [ "INC", "DEC" ]:
          out(" ")

      elif node.type == "assignment" and child.type == "left":
        oper = node.get("operator", False)

        if node.parent.type == "statementList":
          realNode = node.parent
        else:
          realNode = node

        inForLoop = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"

        if not inForLoop and not oper in [ "INC", "DEC" ]:
          out(" ")

        if oper != None:
          out(getTokenSource(oper))
        else:
          out("=")

        if not inForLoop and not oper in [ "INC", "DEC" ]:
          out(" ")

      elif node.type == "accessor" and child.type == "key":
        out("]")





      # Separate children in parent list
      if childPosition < childrenNumber:
        if node.type == "variable":
          out(".")

        elif node.type == "map":
          out(", ")
          newline = True

        elif node.type == "array":
          out(", ")
          newline = True

        elif node.type == "definitionList":
          out(", ")

        elif node.type == "params":
          out(", ")

        elif node.type == "statementList":
          out(", ")


      separators = [ "block", "assignment", "call", "operation", "definition", "definitionList", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable", "function" ]
      not_after = [ "case", "default" ]
      not_in = [ "definitionList", "statementList", "params", "variable", "array" ]

      if node.type in [ "block", "file", "switch" ]:
        if not previousType in not_after:
          if child.type in separators:
            semicolon()

            # not last child
            if childPosition == childrenNumber and node.type in [ "block", "switch", "file" ]:
              pass
            else:
              newline = True




      # Next...
      childPosition += 1
      previousType = child.type





  ##################################################################
  # Closing...
  ##################################################################

  if node.type == "map":
    if node.hasChildren():
      minus()
      newline = True

    out("}")

  elif node.type == "array":
    if node.hasChildren():
      minus()
      newline = True

    out("]")

  elif node.type == "block":
    minus()
    newline = True
    out("}")

    # Not it function assignment and param blocks
    if node.parent.type == "body" and node.parent.parent.type == "function" and node.parent.parent.parent.type in [ "right", "params" ]:
      pass

    else:
      newline = True

  elif node.type == "params":
    out(")")

  elif node.type == "switch" and node.get("switchType") == "case":
    minus()
    minus()
    newline = True
    out("}")
    newline = True

  elif node.type == "group":
    out(")")

  elif node.type == "case":
    out(":")
    plus()
    newline = True

  elif node.type == "call" and not callHasParams:
    out("()")

  elif node.type == "function" and not functionDeclHasParams:
    out("()")

  elif node.type == "expression":
    if node.parent.type == "loop":
      out(")")
    elif node.parent.type == "catch":
      out(")")
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      out(")")
      newline = True
      out("{")
      plus()
      plus()










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
