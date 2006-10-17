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

  # strip remaining whitespaces
  if (afterBreak or onNewLine) and result.endswith(" "):
    result = result.rstrip()

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


def noline():
  global onNewLine
  onNewLine = False


def plus():
  global indent
  indent += 1


def minus():
  global indent
  indent -= 1


def semicolon():
  global result

  if not (result.endswith("\n") or result.endswith(";")):
    write(";")


def comment(node):
  commentText = ""
  commentIsInline = False

  afterBlock = node.getChild("commentsAfter", False)

  if afterBlock and not afterBlock.get("inserted", False):
    for child in afterBlock.children:
      if not child.isFirstChild():
        commentText += " "

      commentText += child.get("text")

      if child.get("detail") == "inline":
        commentIsInline = True

    if commentText != "":
      space()
      write(commentText)

      if commentIsInline:
        line()
      else:
        space()

      afterBlock.set("inserted", True)




def computeConstantLength(node):
  length = len(node.get("value"))

  if node.get("constantType") == "string":
    length += 2

  return length


def computeVariableLength(node):
  length = 0

  for child in node.children:
    if child.type in [ "comment", "commentsBefore", "commentsAfter" ]:
      pass

    elif child.type == "identifier":
      length += len(child.get("name"))

    elif child.type == "accessor":
      iden = child.getChild("identifier")
      if iden.hasChild("identifier"):
        iden = iden.getChild("identifier")

      name = iden.get("name", False)
      if name != None:
        length += len(name)

      key = child.getChild("key")
      if key.hasChild("variable"):
        length += computeVariableLength(key.getChild("variable"))
      elif key.hasChild("constant"):
        length += computeConstantLength(key.getChild("constant"))
      else:
        print
        print "Unsupported key"

    else:
      print
      print "Problematic var member: %s" % child.type

    if not child.isLastChild():
      length += 1

  return length


def getItemLengths(node):
  if hasattr(node, "itemLengths"):
    return node.itemsLength

  lengths = []

  if node.hasChildren(True):
    for child in node.children:
      if child.type == "variable":
        length = computeVariableLength(child)

      elif child.type == "constant":
        length = computeConstantLength(child)

      # try to split other things elsewhere, ...
      else:
        length = 0

      lengths.append(length)

  node.itemsLength = lengths
  return lengths


def getLineLength():
  global result

  return len(result.split("\n")[-1])







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

  if node.type in [ "commentsBefore", "commentsAfter" ]:
    return



  if node.get("breakBefore", False) and not node.isFirstChild(True):
    sep()



  if node.getChild("commentsBefore", False) != None:
    commentCounter = 0
    commentsBefore = node.getChild("commentsBefore")
    isFirst = node.isFirstChild()
    previous = node.getPreviousSibling(False, True)

    if previous and previous.type == "case":
      inCase = True
    else:
      inCase = False

    for child in commentsBefore.children:
      docComment = child.get("detail") in [ "javadoc", "qtdoc" ]
      headComment = child.get("detail") in [ "header" ]
      divComment = child.get("detail") in [ "divider" ]

      if not child.isFirstChild():
        pass

      elif inCase:
        pass

      elif not isFirst:
        sep()

      elif not headComment:
        line()

      write(child.get("text"))

      # separator after divider/head comments
      if divComment or headComment:
        sep()

      # separator after block comments which are not for documentation
      elif child.get("detail") == "block" and not docComment:
        sep()

      else:
        line()






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

    elif node.isComplex():
      line()

    write("{")

    if node.isComplex():
      line()
      plus()

    elif node.hasChildren(True):
      space()


  #
  # OPEN: ARRAY
  ##################################

  elif node.type == "array":
    write("[")

    if node.hasChildren(True):
      space()


  #
  # OPEN: BLOCK
  ##################################

  elif node.type == "block":
    if node.hasChildren():
      if node.isComplex():
        line()

      # in else, try to find the mode of the previous if first
      elif node.hasParent() and node.parent.type == "elseStatement":
        stmnt = node.parent.parent.getChild("statement")

        if stmnt.getChild("block", False) and stmnt.getChild("block", False).isComplex():
          line()

        else:
          space()

      # in if, try to find the mode of the parent if (if existent)
      elif node.hasParent() and node.parent.type == "statement" and node.parent.parent.type == "loop" and node.parent.parent.get("loopType") == "IF":
        if node.parent.parent.hasParent() and node.parent.parent.parent.type == "elseStatement":
          stmnt = node.parent.parent.parent.parent.getChild("statement")

          if stmnt.getChild("block", False) and stmnt.getChild("block", False).isComplex():
            line()

          else:
            space()

        else:
          space()

      # in catch/finally, try to find the mode of the try statement
      elif node.hasParent() and node.parent.hasParent() and node.parent.parent.type in [ "catch", "finally" ]:
        if node.parent.parent.parent.getChild("statement").getChild("block").isComplex():
          line()

        else:
          space()

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
    noline()
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
      sep()

    minus()
    line()
    write("case")
    space()


  #
  # OPEN: CATCH
  ##################################

  elif node.type == "catch":
    # If this statement block or the previous try were not complex, be not complex here, too
    if not node.getChild("statement").getChild("block").isComplex() and not node.parent.getChild("statement").getChild("block").isComplex():
      noline()
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
    if node.hasChild("commentsBefore"):
      pass

    else:
      # If this statement block and the previous were not complex, be not complex here, too
      inner = node.getChild("block", False)

      # Find inner IF statement (e.g. if; else if)
      if not inner and node.hasChild("loop"):
        inner = node.getChild("loop").getChild("statement").getChild("block", False)

      selfSimple = not inner or not inner.isComplex()

      prev = node.parent.getChild("statement")
      prevSimple = not prev.hasChild("block") or not prev.getChild("block").isComplex()

      if selfSimple and prevSimple and inner:
        noline()
        space()

    write("else")

    # This is a elseStatement without a block around (a set of {})
    if not node.hasChild("block"):
      space()


  #
  # OPEN: TRY
  ##################################

  elif node.type == "switch":
    # Additional new line before each switch/try
    if not node.isFirstChild(True) and not node.getChild("commentsBefore", False):
      prev = node.getPreviousSibling(False, True)

      # No separation after case statements
      if prev != None and prev.type in [ "case", "default" ]:
        pass
      else:
        sep()

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
    sep()
    write("default")
    write(":")
    plus()
    line()


  #
  # OPEN: KEYVALUE
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

    if node.getChild("value").isComplex() and not node.isFirstChild(True):
      sep()

    write(keyString)
    space()

    # Fill with spaces
    # Do this only if the parent is complex (many entries)
    # But not if the value itself is complex
    if node.parent.isComplex() and not node.getChild("value").isComplex():
      write(" " * (node.parent.get("maxKeyLength") - len(keyString)))

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
        stmnt = node.parent.getChild("statement")
        compact = stmnt.hasChild("block") and not stmnt.getChild("block").isComplex()

        if compact:
          noline()
          space()

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
      prev = node.getPreviousSibling(False, True)

      # No separation after case statements
      if prev != None and prev.type in [ "case", "default" ]:
        pass
      else:
        sep()

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
  # OPEN: STATEMENT
  ##################################

  elif node.type == "statement":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      if not node.parent.hasChild("first") and not node.parent.hasChild("second") and not node.parent.hasChild("third"):
        write("(");

      if node.parent.get("forVariant") == "iter":
        if not node.parent.hasChild("third"):
          write(";")

          if not node.parent.hasChild("second"):
            write(";")

      write(")")

      if not node.hasChild("block"):
        space()


  #
  # OPEN: FIRST
  ##################################

  elif node.type == "first":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      write("(")

    # operation
    elif node.parent.type == "operation":
      if node.parent.get("left", False) == True:
        oper = node.parent.get("operator")

        if oper == "TYPEOF":
          write("typeof")
          space()
        else:
          write(getTokenSource(oper))


  #
  # OPEN: SECOND
  ##################################

  elif node.type == "second":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      if not node.parent.hasChild("first"):
        write("(;")
        space()


  #
  # OPEN: THIRD
  ##################################

  elif node.type == "third":
    # (?: operation)
    if node.parent.type == "operation":
      if node.parent.get("operator") == "HOOK":
        space()
        write(":")
        space()

    # for loop
    elif node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      if not node.parent.hasChild("second"):
        if node.parent.hasChild("first"):
          write(";")
        else:
          write("(;;")

        space()






  #
  # OPEN: LABEL
  ##################################

  elif node.type == "labelTerminator":
    write(":")


  #
  # OPEN: COMMENT
  ##################################

  elif node.type == "comment":
    # insert a space before and no newline in the case of after comments
    if node.get("connection") == "after":
      noline()
      space()

    write(node.get("text"))

    # new line after inline comment (for example for syntactical reasons)
    if node.get("detail") == "inline":
      line()

    else:
      space()


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








  #####################################################################################################################
  # Children content
  #####################################################################################################################

  if node.hasChildren():
    for child in node.children:
      compileNode(child)









  #####################################################################################################################
  # Closing node
  #####################################################################################################################

  #
  # CLOSE: MAP
  ##################################

  if node.type == "map":
    if node.isComplex():
      line()
      minus()

    elif node.hasChildren(True):
      space()

    write("}")

    # If this thing was indented (to much content for one line)
    if hasattr(node, "indented") and node.indented:
      minus()


  #
  # CLOSE: ARRAY
  ##################################

  elif node.type == "array":
    if node.hasChildren(True):
      space()

    write("]")

    # If this thing was indented (to much content for one line)
    if hasattr(node, "indented") and node.indented:
      minus()


  #
  # CLOSE: STATEMENT LIST
  ##################################

  elif node.type == "statementList":
    # If this thing was indented (to much content for one line)
    if hasattr(node, "indented") and node.indented:
      minus()


  #
  # CLOSE: KEY
  ##################################

  elif node.type == "key":
    if node.hasParent() and node.parent.type == "accessor":
      write("]")


  #
  # CLOSE: PARAMS
  ##################################

  elif node.type == "params":
    write(")")

    # If this thing was indented (to much content for one line)
    if hasattr(node, "indented") and node.indented:
      minus()


  #
  # CLOSE: BLOCK
  ##################################

  elif node.type == "block":
    if node.hasChildren():
      minus()
      line()

    write("}")
    comment(node)

    if node.hasChildren():
      # Newline afterwards
      if node.parent.type == "body" and node.parent.parent.type == "function":

        # But only when this isn't a function block inside a assignment
        if node.parent.parent.parent.type in [ "right", "params" ]:
          pass

        elif node.parent.parent.parent.type == "value" and node.parent.parent.parent.parent.type == "keyvalue":
          pass

        else:
          line()

      else:
        line()


  #
  # CLOSE: SWITCH
  ##################################

  elif node.type == "switch":
    if node.get("switchType") == "case":
      minus()
      minus()
      line()
      write("}")
      comment(node)
      line()

    # Force a additinal line feed after each switch/try
    if not node.isLastChild():
      sep()


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
    comment(node)
    plus()
    line()


  #
  # CLOSE: EXPRESSION
  ##################################

  elif node.type == "expression":
    if node.parent.type == "loop":
      write(")")

      # e.g. a if-construct without a block {}
      if node.parent.getChild("statement").hasChild("block"):
        pass

      elif node.parent.type == "loop" and node.parent.get("loopType") == "DO":
        pass

      else:
        space()

    elif node.parent.type == "catch":
      write(")")

    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      write(")")
      comment(node)
      line()
      write("{")
      plus()
      plus()


  #
  # CLOSE: LOOP
  ##################################

  elif node.type == "loop":
    if node.get("loopType") == "DO":
      semicolon()

    comment(node)

    # Force a additinal line feed after each loop
    if not node.isLastChild():
      sep()


  #
  # CLOSE: FIRST
  ##################################

  elif node.type == "first":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      if node.parent.hasChild("second") or node.parent.hasChild("third"):
        write(";")

        if node.parent.hasChild("second"):
          space()

    # operation
    elif node.parent.type == "operation" and node.parent.get("left", False) != True:
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
  # CLOSE: SECOND
  ##################################

  elif node.type == "second":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      write(";")
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
  # CLOSE: IDENTIFIER
  ##################################

  elif node.type == "identifier":
    if node.hasParent() and node.parent.type == "variable" and not node.isLastChild(True):
      write(".")


  #
  # CLOSE: ACCESSOR
  ##################################

  elif node.type == "accessor":
    if node.hasParent() and node.parent.type == "variable" and not node.isLastChild(True):
      write(".")


  #
  # CLOSE: KEYVALUE
  ##################################

  elif node.type == "keyvalue":
    if node.hasParent() and node.parent.type == "map" and not node.isLastChild(True):
      write(",")
      comment(node)

      if node.getChild("value").isComplex():
        sep()
      elif node.parent.isComplex():
        line()
      else:
        space()


  #
  # CLOSE: DEFINITION
  ##################################

  elif node.type == "definition":
    if node.hasParent() and node.parent.type == "definitionList" and not node.isLastChild(True):
      write(",")
      comment(node)

      if node.hasComplexChildren():
        line()
      else:
        space()






  #
  # CLOSE: OTHER
  ##################################

  if node.hasParent() and not node.type in [ "comment", "commentsBefore", "commentsAfter" ]:

    # Add comma dividers between statements in these parents
    if node.parent.type in [ "array", "params", "statementList" ]:
      if not node.isLastChild(True):
        write(",")
        comment(node)

        if not node.isLastChild(True):
          currentLength = getLineLength()
          nextPos = node.parent.getChildPosition(node.getFollowingSibling())
          nextLength = getItemLengths(node.parent)[nextPos]

          # auto-wrap at 80
          if nextLength != 0 and currentLength + nextLength > 80:
            line()

            if not hasattr(node.parent, "indented"):
              plus()

            node.parent.indented = True

        if node.isComplex():
          line()
        else:
          space()

    # Semicolon handling
    elif node.type in [ "block", "assignment", "call", "operation", "definitionList", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable" ]:

      # Default semicolon handling
      if node.parent.type in [ "block", "file" ]:
        semicolon()
        comment(node)
        line()

        if node.isComplex() and not node.isLastChild():
          sep()

      # Special handling for switch statements
      elif node.parent.type == "statement" and node.parent.parent.type == "switch" and node.parent.parent.get("switchType") == "case":
        semicolon()
        comment(node)
        line()

        if node.isComplex() and not node.isLastChild():
          sep()

      # Special handling for loops (e.g. if) without blocks {}
      elif node.parent.type in [ "statement", "elseStatement" ] and not node.parent.hasChild("block") and node.parent.parent.type == "loop":
        semicolon()
        comment(node)
        line()

        if node.isComplex() and not node.isLastChild():
          sep()


  #
  # CLOSE: COMMENT
  ##################################

  # Rest of the after comments (not inserted previously)
  comment(node)











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
