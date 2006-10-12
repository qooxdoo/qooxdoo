#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool, treegenerator

KEY = re.compile("^[A-Za-z0-9_]+$")



def getTokenSource(id):
  for key in config.JSTOKENS:
    if config.JSTOKENS[key] == id:
      return key

  return None


def space():

  global indent
  global onNewLine
  global afterBreak
  global needsIndent
  global pretty

  if afterBreak or onNewLine or pretty.endswith(" "):
    return

  pretty += " "


def out(txt=""):

  global indent
  global onNewLine
  global afterBreak
  global needsIndent
  global pretty

  if afterBreak:
    if pretty.endswith("\n"):
      pretty += "\n"
    else:
      pretty += "\n\n"

    needsIndent = True
    onNewLine = False
    afterBreak = False

  elif onNewLine:
    if not pretty.endswith("\n"):
      pretty += "\n"

    needsIndent = True
    onNewLine = False

  if needsIndent:
    pretty += ("  " * indent)
    needsIndent = False

  pretty += txt


def line():
  global onNewLine
  onNewLine = True


def plus():
  global indent
  indent += 1


def minus():
  global indent
  indent -= 1


def semicolon():
  global pretty

  if not (pretty.endswith("\n") or pretty.endswith(";")):
    pretty += ";"


def compile(node):
  global indent
  global needsIndent
  global onNewLine
  global afterBreak
  global pretty

  indent = 0
  needsIndent = False
  pretty = ""
  onNewLine = False
  afterBreak = False

  compileNode(node)

  return pretty









def compileNode(node):
  global onNewLine
  global afterBreak
  global pretty


  if node.type in [ "commentsBefore", "commentsAfter" ]:
    return



  if node.get("breakBefore", False) and not node.isFirstChild(True):
    afterBreak = True



  if node.getChild("commentsBefore", False) != None:
    commentCounter = 0

    for comment in node.getChild("commentsBefore").children:
      docComment = comment.get("detail") in [ "javadoc", "qtdoc" ]
      headComment = comment.get("detail") in [ "header" ]
      divComment = comment.get("detail") in [ "divider" ]

      # new line above all comments
      pretty += "\n"

      # additional lines before divider comments
      if divComment:
        pretty += "\n\n\n\n"

      out(comment.get("text"))

      # new line after all comments
      pretty += "\n"

      # additional line after divider comments
      if divComment:
        pretty += "\n"

      # additional new line after block comments (not for documentation)
      elif comment.get("detail") == "block" and not docComment:
        pretty += "\n"







  #####################################################################################################################
  # Opening...
  #####################################################################################################################

  #
  # OPEN: MAP
  ##################################

  if node.type == "map":
    if (node.hasChildren() and node.getChildrenLength(True) > 2) or node.hasComplexChildren():
      line()

      #maxKeyLength = 0
      #for child in node.children:
      #  if child.type == "keyvalue":
      #    if len(child.get("key")) > maxKeyLength:
      #      maxKeyLength = len(child.get("key"))
      #print "KEY-MAX: %s" % maxKeyLength

    out("{")

    if (node.hasChildren() and node.getChildrenLength(True) > 2) or node.hasComplexChildren():
      plus()
      line()
    elif node.hasChildren():
      space()


  #
  # OPEN: ARRAY
  ##################################

  elif node.type == "array":
    if (node.hasChildren() and node.getChildrenLength(True) > 5) or node.hasComplexChildren():
      line()

    out("[")

    if (node.hasChildren() and node.getChildrenLength(True) > 5) or node.hasComplexChildren():
      plus()
      line()
    elif node.hasChildren():
      space()


  #
  # OPEN: BLOCK
  ##################################

  elif node.type == "block":
    if node.hasChildren():
      if node.get("compact"):
        space()

      else:
        line()

    else:
      space()

    out("{")

    if node.hasChildren():
      plus()
      line()


  #
  # OPEN: PARAMS
  ##################################

  elif node.type == "params":
    out("(")


  #
  # OPEN: GROUP
  ##################################

  elif node.type == "group":
    out("(")


  #
  # OPEN: CASE
  ##################################

  elif node.type == "case":
    # force double new lines
    if not node.isFirstChild() and not node.getPreviousSibling(True).type == "case":
      pretty += "\n\n"

    minus()
    line()
    out("case ")


  #
  # OPEN: CATCH
  ##################################

  elif node.type == "catch":
    # If this statement block or the previous try were compact, be compact here, too
    if node.getChild("statement").getChild("block").get("compact") and node.parent.getChild("statement").getChild("block").get("compact"):
      onNewLine = False
      space()

    out("catch")


  #
  # OPEN: BREAK
  ##################################

  elif node.type == "break":
    out("break")

    if node.get("label", False):
      space()
      out(node.get("label", False))


  #
  # OPEN: CONTINUE
  ##################################

  elif node.type == "continue":
    out("continue")

    if node.get("label", False):
      space()
      out(node.get("label", False))


  #
  # OPEN: ELSE
  ##################################

  elif node.type == "elseStatement":
    # If this statement block and the previous if were compact, be compact here, too
    child = node.getChild("block", False)

    if child == None:
      child = node.getChild("loop", False)

      if child != None:
        child = child.getChild("statement").getChild("block")

    if child.get("compact") and node.parent.getChild("statement").getChild("block").get("compact"):
      onNewLine = False
      space()

    out("else")

    # This is a elseStatement without a block around (a set of {})
    if not node.hasChild("block"):
      space()


  #
  # OPEN: TRY
  ##################################

  elif node.type == "switch":
    if node.get("switchType") == "catch":
      out("try")
    elif node.get("switchType") == "case":
      out("switch")


  #
  # OPEN: FINALLY
  ##################################

  elif node.type == "finally":
    out("finally")


  #
  # OPEN: DELETE
  ##################################

  elif node.type == "delete":
    out("delete ")


  #
  # OPEN: THROW
  ##################################

  elif node.type == "throw":
    out("throw ")

  #
  # OPEN: NEW
  ##################################

  elif node.type == "instantiation":
    out("new ")


  #
  # OPEN: RETURN
  ##################################

  elif node.type == "return":
    if node.parent.type == "block" and not node.parent.get("compact"):
      if node.isLastChild() and not node.isFirstChild():
        line()

    out("return")

    if node.hasChildren():
      space()


  #
  # OPEN: DEFINITION LIST
  ##################################

  elif node.type == "definitionList":
    out("var ")


  #
  # OPEN: DEFAULT
  ##################################

  elif node.type == "default":
    minus()

    # force double new lines
    pretty += "\n\n"
    out("default:")
    plus()
    line()


  #
  # OPEN: KEY-VALUE
  ##################################

  elif node.type == "keyvalue":
    keyString = node.get("key")
    keyQuote = node.get("quote", False)

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


  #
  # OPEN: KEY
  ##################################

  elif node.type == "key":
    if node.parent.type == "accessor":
      out("[")


  #
  # OPEN: RIGHT
  ##################################

  elif node.type == "right":
    if node.parent.type == "accessor":
      out(".")


  #
  # OPEN: EXPRESSION
  ##################################

  elif node.type == "expression":
    if node.parent.type == "loop":
      loopType = node.parent.get("loopType")

      if loopType == "DO":
        out("while ")

      # open expression block of IF/WHILE/DO-WHILE/FOR statements
      out("(")
    elif node.parent.type == "catch":
      # open expression block of CATCH statement
      out("(")
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      # open expression block of SWITCH statement
      out("(")


  #
  # OPEN: LOOP
  ##################################

  elif node.type == "loop":
    # Additional new line before each loop
    if not node.isFirstChild(True) and not node.getChild("commentsBefore", False):
      line()

    loopType = node.get("loopType")

    if loopType == "IF":
      out("if ")

    elif loopType == "WHILE":
      out("while ")

    elif loopType == "FOR":
      out("for ")

    elif loopType == "DO":
      out("do ")

    elif loopType == "WITH":
      out("with ")

    else:
      print "UNKNOWN LOOP TYPE: %s" % loopType


  #
  # OPEN: FUNCTION
  ##################################

  elif node.type == "function":
    out("function")

    functionName = node.get("name", False)
    if functionName != None:
      out(" %s" % functionName)


  #
  # OPEN: IDENTIFIER
  ##################################

  elif node.type == "identifier":
    name = node.get("name", False)
    if name != None:
      out(name)


  #
  # OPEN: DEFINITION
  ##################################

  elif node.type == "definition":
    if node.parent.type != "definitionList":
      out("var ")

    out(node.get("identifier"))


  #
  # OPEN: CONSTANT
  ##################################

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


  #
  # OPEN: THIRD (?: operation)
  ##################################

  elif node.type == "third":
    if node.parent.type == "operation":
      if node.parent.get("operator") == "HOOK":
        out(" : ")


  #
  # OPEN: LABEL
  ##################################

  elif node.type == "labelTerminator":
    out(":")


  #
  # OPEN: BODY
  ##################################

  elif node.type == "body":
    if not node.parent.getChild("params"):
      out("()")


  #
  # OPEN: COMMENT
  ##################################

  elif node.type == "comment":
    # after = space before
    if node.get("connection") == "after":
      space()

    out(node.get("text"))

    # new line after inline comment (for example for syntactical reasons)
    if node.get("detail") == "inline":
      line()


  #
  # OPEN: ASSIGNMENT
  ##################################

  elif node.type == "assignment":
    if node.parent.type == "definition":
      oper = node.get("operator", False)

      realNode = node.parent.parent
      inForLoop = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"

      if not inForLoop and not oper in [ "INC", "DEC" ]:
        space()

      if oper != None:
        out(getTokenSource(oper))
      else:
        out("=")

      if not inForLoop and not oper in [ "INC", "DEC" ]:
        space()


  #
  # INSIDE: FOR LOOP
  ##################################

  if node.hasParent() and node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
    if node.type == "first":
      out("(")
    elif node.type == "statement":
      out(")")
    else:
      if node.type == "second" and not node.parent.hasChild("first"):
        out("(")

      if node.type == "third" and not node.parent.hasChild("first") and not node.parent.hasChild("second"):
        out("(")

      if not pretty.endswith(";") and not pretty.endswith("\n"):
        semicolon()


  #
  # INSIDE: OPERATION
  ##################################

  if node.hasParent() and node.parent.type == "operation":
    if node.parent.get("left", False) == True:
      oper = node.get("operator")

      if oper == "TYPEOF":
        out("typeof ")
      else:
        out(getTokenSource(oper))









  #####################################################################################################################
  # Children content
  #####################################################################################################################

  if node.hasChildren():
    for child in node.children:
      compileNode(child)









  #####################################################################################################################
  # Prepare after comment...
  #####################################################################################################################

  commentText = ""
  if node.getChild("commentsAfter", False):
    for comment in node.getChild("commentsAfter").children:
      if not node.isFirstChild() and comment.get("connection") == "after":
        commentText += " "

      commentText += comment.get("text")







  #####################################################################################################################
  # Closing node
  #####################################################################################################################

  #
  # CLOSE: MAP
  ##################################

  if node.type == "map":
    if (node.hasChildren() and node.getChildrenLength(True) > 2) or node.hasComplexChildren():
      minus()
      line()
    elif node.hasChildren():
      space()

    out("}")


  #
  # CLOSE: ARRAY
  ##################################

  elif node.type == "array":
    if (node.hasChildren() and node.getChildrenLength(True) > 5) or node.hasComplexChildren():
      minus()
      line()
    elif node.hasChildren():
      space()

    out("]")


  #
  # CLOSE: KEY
  ##################################

  elif node.type == "key":
    if node.hasParent() and node.parent.type == "accessor":
      out("]")


  #
  # CLOSE: BLOCK
  ##################################

  elif node.type == "block":
    if node.hasChildren():
      minus()
      line()

    out("}")

    if commentText != "":
      space()
      out(commentText)
      commentText = ""

    if node.hasChildren():
      # Not in function assignment and param blocks
      if node.parent.type == "body" and node.parent.parent.type == "function" and node.parent.parent.parent.type in [ "right", "params" ]:
        pass

      else:
        line()


  #
  # CLOSE: PARAMS
  ##################################

  elif node.type == "params":
    out(")")


  #
  # CLOSE: SWITCH
  ##################################

  elif node.type == "switch":
    if node.get("switchType") == "case":
      minus()
      minus()
      line()
      out("}")

      if commentText != "":
        space()
        out(commentText)
        commentText = ""

      line()


  #
  # CLOSE: GROUP
  ##################################

  elif node.type == "group":
    out(")")


  #
  # CLOSE: CASE
  ##################################

  elif node.type == "case":
    out(":")

    if commentText != "":
      space()
      out(commentText)
      commentText = ""

    plus()
    line()


  #
  # CLOSE: CALL
  ##################################

  elif node.type == "call":
    if not node.getChild("params", False):
      out("()")


  #
  # CLOSE: FUNCTION
  ##################################

  elif node.type == "function":
    if not node.getChild("params", False):
      out("()")


  #
  # CLOSE: EXPRESSION
  ##################################

  elif node.type == "expression":
    if node.parent.type == "loop":
      out(")")
    elif node.parent.type == "catch":
      out(")")
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      out(")")

      if commentText != "":
        space()
        out(commentText)
        commentText = ""

      line()
      out("{")
      plus()
      plus()


  #
  # CLOSE: LOOP
  ##################################

  elif node.type == "loop":
    # Force a additinal line feed after each loop
    if not node.isLastChild():
      if commentText != "":
        space()
        out(commentText)
        commentText = ""

      line()


  #
  # CLOSE: FIRST
  ##################################

  elif node.type == "first":
    if node.hasParent() and node.parent.type == "operation" and node.parent.get("left", False) != True:
      oper = node.parent.get("operator")

      if node.parent.parent.type == "statementList":
        realNode = node.parent.parent
      else:
        realNode = node.parent

      inForLoop = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"

      if oper == "IN":
        out(" in ")
      elif oper == "INSTANCEOF":
        out(" instanceof ")
      else:
        if not inForLoop and not oper in [ "INC", "DEC" ]:
          space()

        out(getTokenSource(oper))

        if not inForLoop and not oper in [ "INC", "DEC" ]:
          space()


  #
  # CLOSE: LEFT
  ##################################

  elif node.type == "left":
    if node.hasParent() and node.parent.type == "assignment":
      oper = node.parent.get("operator", False)

      if node.parent.parent.type == "statementList":
        realNode = node.parent.parent
      else:
        realNode = node.parent

      inForLoop = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"

      if not inForLoop and not oper in [ "INC", "DEC" ]:
        space()

      if oper != None:
        out(getTokenSource(oper))
      else:
        out("=")

      if not inForLoop and not oper in [ "INC", "DEC" ]:
        space()








  if node.hasParent() and not node.type in [ "comment", "commentsBefore", "commentsAfter" ]:
    needsSeparation = node.type in [ "block", "assignment", "call", "operation", "definitionList", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable", "function" ]

    if not node.isLastChild(True):
      if node.type == "identifier":
        if node.parent.type == "variable":
          out(".")
          space()
        else:
          print "Error: Identifier outside a variable"

      elif node.type == "keyvalue":
        if node.parent.type == "map":
          out(",")
          space()
        else:
          print "Error: KeyValue outside a map"

      elif node.type == "definition":
        if node.parent.type == "definitionList":
          out(",")
          space()
        else:
          print "Error: Definition outside definionlist"

      # These could have any child object, so we have no realistic chance to
      # detect them with the child type
      elif node.parent.type in [ "array", "params", "statementList" ]:
        out(",")
        space()

    # Semicolon handling
    if node.parent.type in [ "block", "file" ] and needsSeparation:
      semicolon()
      line()

    elif node.parent.type == "statement" and node.parent.parent.type == "switch" and node.parent.parent.get("switchType") == "case" and needsSeparation:
      semicolon()
      line()










  #####################################################################################################################
  # POST CONTENT ...
  #####################################################################################################################

  # Insert after comments
  if commentText != "":
    space()
    out(commentText)
    space()













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
