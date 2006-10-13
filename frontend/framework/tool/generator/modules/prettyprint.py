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
  global result

  if afterBreak or onNewLine or result.endswith(" "):
    return

  result += " "


def write(txt=""):

  global indent
  global onNewLine
  global afterBreak
  global result

  # handle new line wishes
  if afterBreak:
    if result.endswith("\n\n"):
      pass
    elif result.endswith("\n"):
      result += "\n"
    else:
      result += "\n\n"

  elif onNewLine:
    if not result.endswith("\n"):
      result += "\n"

  # reset
  onNewLine = False
  afterBreak = False

  # add indent (if needed)
  if result.endswith("\n"):
    result += ("  " * indent)

  # append given text
  result += txt


def sep():
  global afterBreak
  afterBreak = True


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
  global result

  if not (result.endswith("\n") or result.endswith(";")):
    result += ";"










def compile(node):
  global indent
  global onNewLine
  global afterBreak
  global result

  indent = 0
  result = ""
  onNewLine = False
  afterBreak = False

  compileNode(node)

  return result









def compileNode(node):
  global onNewLine
  global afterBreak
  global result


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
      result += "\n"

      # additional lines before divider comments
      if divComment:
        result += "\n\n\n\n"

      write(comment.get("text"))

      # new line after all comments
      result += "\n"

      # additional line after divider comments
      if divComment:
        result += "\n"

      # additional new line after block comments (not for documentation)
      elif comment.get("detail") == "block" and not docComment:
        result += "\n"







  #####################################################################################################################
  # Opening...
  #####################################################################################################################

  #
  # OPEN: MAP
  ##################################

  if node.type == "map":
    par = node.parent

    # No break before return statement
    if node.hasParent() and node.parent.type == "expression" and node.parent.parent.type == "return":
      pass

    elif node.get("complex"):
      line()

    write("{")

    if node.get("complex"):
      line()
      plus()

    elif node.hasChildren(True):
      space()


  #
  # OPEN: ARRAY
  ##################################

  elif node.type == "array":
    write("[")

    if node.get("complex"):
      line()
      plus()

    elif node.hasChildren(True):
      space()


  #
  # OPEN: BLOCK
  ##################################

  elif node.type == "block":
    if node.hasChildren():
      if node.get("complex"):
        line()

      else:
        space()

    else:
      space()

    write("{")

    if node.hasChildren():
      plus()
      line()


  #
  # OPEN: PARAMS
  ##################################

  elif node.type == "params":
    write("(")


  #
  # OPEN: GROUP
  ##################################

  elif node.type == "group":
    write("(")


  #
  # OPEN: CASE
  ##################################

  elif node.type == "case":
    # force double new lines
    if not node.isFirstChild() and not node.getPreviousSibling(True).type == "case":
      result += "\n\n"

    minus()
    line()
    write("case")
    space()


  #
  # OPEN: CATCH
  ##################################

  elif node.type == "catch":
    # If this statement block or the previous try were not complex, be not complex here, too
    if not node.getChild("statement").getChild("block").get("complex") and not node.parent.getChild("statement").getChild("block").get("complex"):
      onNewLine = False
      space()

    write("catch")


  #
  # OPEN: BREAK
  ##################################

  elif node.type == "break":
    write("break")

    if node.get("label", False):
      space()
      write(node.get("label", False))


  #
  # OPEN: CONTINUE
  ##################################

  elif node.type == "continue":
    write("continue")

    if node.get("label", False):
      space()
      write(node.get("label", False))


  #
  # OPEN: ELSE
  ##################################

  elif node.type == "elseStatement":
    # If this statement block and the previous if were not complex, be not complex here, too
    child = node.getChild("block", False)

    if child == None:
      child = node.getChild("loop", False)

      if child != None:
        child = child.getChild("statement").getChild("block")

    if not child.get("complex") and not node.parent.getChild("statement").getChild("block").get("complex"):
      onNewLine = False
      space()

    write("else")

    # This is a elseStatement without a block around (a set of {})
    if not node.hasChild("block"):
      space()


  #
  # OPEN: TRY
  ##################################

  elif node.type == "switch":
    if node.get("switchType") == "catch":
      write("try")
    elif node.get("switchType") == "case":
      write("switch")


  #
  # OPEN: FINALLY
  ##################################

  elif node.type == "finally":
    write("finally")


  #
  # OPEN: DELETE
  ##################################

  elif node.type == "delete":
    write("delete")
    space()


  #
  # OPEN: THROW
  ##################################

  elif node.type == "throw":
    write("throw")
    space()

  #
  # OPEN: NEW
  ##################################

  elif node.type == "instantiation":
    write("new")
    space()


  #
  # OPEN: RETURN
  ##################################

  elif node.type == "return":
    write("return")

    if node.hasChildren():
      space()


  #
  # OPEN: DEFINITION LIST
  ##################################

  elif node.type == "definitionList":
    write("var")
    space()


  #
  # OPEN: DEFAULT
  ##################################

  elif node.type == "default":
    minus()

    # force double new lines
    result += "\n\n"
    write("default")
    write(":")
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
      print "Warning: Auto protect key: %s" % keyString
      keyString = "\"" + keyString + "\""

    write(keyString)
    space()
    write(":")
    space()


  #
  # OPEN: KEY
  ##################################

  elif node.type == "key":
    if node.parent.type == "accessor":
      write("[")


  #
  # OPEN: RIGHT
  ##################################

  elif node.type == "right":
    if node.parent.type == "accessor":
      write(".")


  #
  # OPEN: EXPRESSION
  ##################################

  elif node.type == "expression":
    if node.parent.type == "loop":
      loopType = node.parent.get("loopType")

      if loopType == "DO":
        write("while")
        space()

      # open expression block of IF/WHILE/DO-WHILE/FOR statements
      write("(")
    elif node.parent.type == "catch":
      # open expression block of CATCH statement
      write("(")
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      # open expression block of SWITCH statement
      write("(")


  #
  # OPEN: LOOP
  ##################################

  elif node.type == "loop":
    # Additional new line before each loop
    if not node.isFirstChild(True) and not node.getChild("commentsBefore", False):
      line()

    loopType = node.get("loopType")

    if loopType == "IF":
      write("if")
      space()

    elif loopType == "WHILE":
      write("while")
      space()

    elif loopType == "FOR":
      write("for")
      space()

    elif loopType == "DO":
      write("do")
      space()

    elif loopType == "WITH":
      write("with")
      space()

    else:
      print "Warning: Unknown loop type: %s" % loopType


  #
  # OPEN: FUNCTION
  ##################################

  elif node.type == "function":
    write("function")

    functionName = node.get("name", False)
    if functionName != None:
      space()
      write(functionName)


  #
  # OPEN: IDENTIFIER
  ##################################

  elif node.type == "identifier":
    name = node.get("name", False)
    if name != None:
      write(name)


  #
  # OPEN: DEFINITION
  ##################################

  elif node.type == "definition":
    if node.parent.type != "definitionList":
      write("var")
      space()

    write(node.get("identifier"))


  #
  # OPEN: CONSTANT
  ##################################

  elif node.type == "constant":
    if node.get("constantType") == "string":
      if node.get("detail") == "singlequotes":
        write("'")
      else:
        write('"')

      write(node.get("value"))

      if node.get("detail") == "singlequotes":
        write("'")
      else:
        write('"')

    else:
      write(node.get("value"))


  #
  # OPEN: THIRD (?: operation)
  ##################################

  elif node.type == "third":
    if node.parent.type == "operation":
      if node.parent.get("operator") == "HOOK":
        space()
        write(":")
        space()


  #
  # OPEN: LABEL
  ##################################

  elif node.type == "labelTerminator":
    write(":")


  #
  # OPEN: BODY
  ##################################

  elif node.type == "body":
    if not node.parent.getChild("params"):
      write("()")


  #
  # OPEN: COMMENT
  ##################################

  elif node.type == "comment":
    # after = space before
    if node.get("connection") == "after":
      space()

    write(node.get("text"))

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
        write(getTokenSource(oper))
      else:
        write("=")

      if not inForLoop and not oper in [ "INC", "DEC" ]:
        space()


  #
  # INSIDE: FOR LOOP
  ##################################

  if node.hasParent() and node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
    if node.type == "first":
      write("(")
    elif node.type == "statement":
      write(")")
    else:
      if node.type == "second" and not node.parent.hasChild("first"):
        write("(")

      if node.type == "third" and not node.parent.hasChild("first") and not node.parent.hasChild("second"):
        write("(")

      if not result.endswith(";") and not result.endswith("\n"):
        semicolon()


  #
  # INSIDE: OPERATION
  ##################################

  if node.hasParent() and node.parent.type == "operation":
    if node.parent.get("left", False) == True:
      oper = node.parent.get("operator")

      if oper == "TYPEOF":
        write("typeof")
        space()
      else:
        write(getTokenSource(oper))









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
  commentIsInline = False
  if node.getChild("commentsAfter", False):
    for comment in node.getChild("commentsAfter").children:
      if not comment.isFirstChild():
        commentText += " "

      commentText += comment.get("text")

      if comment.get("detail") == "inline":
        commentIsInline = True







  #####################################################################################################################
  # Closing node
  #####################################################################################################################

  #
  # CLOSE: MAP
  ##################################

  if node.type == "map":
    if node.get("complex"):
      line()
      minus()

    elif node.hasChildren(True):
      space()

    write("}")


  #
  # CLOSE: ARRAY
  ##################################

  elif node.type == "array":
    if node.get("complex"):
      line()
      minus()

    elif node.hasChildren(True):
      space()

    write("]")


  #
  # CLOSE: KEY
  ##################################

  elif node.type == "key":
    if node.hasParent() and node.parent.type == "accessor":
      write("]")


  #
  # CLOSE: BLOCK
  ##################################

  elif node.type == "block":
    if node.hasChildren():
      minus()
      line()

    write("}")

    if commentText != "":
      space()
      write(commentText)
      commentText = ""

      if commentIsInline:
        line()

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
    write(")")


  #
  # CLOSE: SWITCH
  ##################################

  elif node.type == "switch":
    if node.get("switchType") == "case":
      minus()
      minus()
      line()
      write("}")

      if commentText != "":
        space()
        write(commentText)
        commentText = ""

        if commentIsInline:
          line()

      line()


  #
  # CLOSE: GROUP
  ##################################

  elif node.type == "group":
    write(")")


  #
  # CLOSE: CASE
  ##################################

  elif node.type == "case":
    write(":")

    if commentText != "":
      space()
      write(commentText)
      commentText = ""

      if commentIsInline:
        line()

    plus()
    line()


  #
  # CLOSE: CALL
  ##################################

  elif node.type == "call":
    if not node.getChild("params", False):
      write("()")


  #
  # CLOSE: FUNCTION
  ##################################

  elif node.type == "function":
    if not node.getChild("params", False):
      write("()")


  #
  # CLOSE: EXPRESSION
  ##################################

  elif node.type == "expression":
    if node.parent.type == "loop":
      write(")")
    elif node.parent.type == "catch":
      write(")")
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      write(")")

      if commentText != "":
        space()
        write(commentText)
        commentText = ""

        if commentIsInline:
          line()

      line()
      write("{")
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
        write(commentText)
        commentText = ""

        if commentIsInline:
          line()

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
        space()
        write("in")
        space()
      elif oper == "INSTANCEOF":
        space()
        write("instanceof")
        space()
      else:
        if not inForLoop and not oper in [ "INC", "DEC" ]:
          space()

        write(getTokenSource(oper))

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
        write(getTokenSource(oper))
      else:
        write("=")

      if not inForLoop and not oper in [ "INC", "DEC" ]:
        space()






  #
  # CLOSE: OTHER
  ##################################

  if node.hasParent() and not node.type in [ "comment", "commentsBefore", "commentsAfter" ]:
    needsSeparation = node.type in [ "block", "assignment", "call", "operation", "definitionList", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable", "function" ]

    if not node.isLastChild(True):
      if node.type == "identifier":
        if node.parent.type == "variable":
          write(".")
        elif node.parent.type == "accessor":
          pass
        else:
          print "Error: Identifier outside a variable/accessor"
          print node.parent.type

      elif node.type == "accessor":
        if node.parent.type == "variable":
          write(".")

      elif node.type == "keyvalue":
        if node.parent.type == "map":
          write(",")

          if node.parent.get("complex"):
            line()
          else:
            space()
        else:
          print "Error: KeyValue outside a map"
          print node.parent.type

      elif node.type == "definition":
        if node.parent.type == "definitionList":
          write(",")
          space()
        else:
          print "Error: Definition outside definionlist"
          print node.parent.type

      # These could have any child object, so we have no realistic chance to
      # detect them with the child type
      if node.parent.type in [ "array", "params", "statementList" ]:
        write(",")
        space()

    # Semicolon handling
    if node.parent.type in [ "block", "file" ] and needsSeparation:
      semicolon()
      line()

    elif node.parent.type == "statement" and node.parent.parent.type == "switch" and node.parent.parent.get("switchType") == "case" and needsSeparation:
      semicolon()
      line()

  # Insert after comments
  if commentText != "":
    space()
    write(commentText)
    space()

    if commentIsInline:
      line()











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
