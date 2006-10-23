#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool, treegenerator

KEY = re.compile("^[A-Za-z0-9_]+$")



def compileToken(name, compact=False):
  global pretty


  ret = ""

  if name in [ "INC", "DEC", "TYPEOF" ]:
    pass

  elif name in [ "INSTANCEOF", "IN" ]:
    ret += " "

  elif not compact and pretty:
    ret += " "



  if name == None:
    ret += "="

  elif name in [ "TYPEOF", "INSTANCEOF", "IN" ]:
    ret += name.lower()

  else:
    for key in config.JSTOKENS:
      if config.JSTOKENS[key] == name:
        ret += key



  if name in [ "INC", "DEC" ]:
    pass

  elif name in [ "TYPEOF", "INSTANCEOF", "IN" ]:
    ret += " "

  elif not compact and pretty:
    ret += " "

  return ret


def space(force=True):
  global indent
  global result
  global pretty
  global afterLine
  global afterBreak

  if not force and not pretty:
    return

  if afterBreak or afterLine or result.endswith(" ") or result.endswith("\n"):
    return

  result += " "


def write(txt=""):
  global indent
  global result
  global pretty
  global breaks
  global afterLine
  global afterBreak
  global afterDivider

  # strip remaining whitespaces
  if (afterLine or afterBreak or afterDivider) and result.endswith(" "):
    result = result.rstrip()

  if pretty:
    # handle new line wishes
    if afterDivider:
      nr = 6
    elif afterBreak:
      nr = 2
    elif afterLine:
      nr = 1
    else:
      nr = 0

    while not result.endswith("\n" * nr):
      result += "\n"

  elif breaks:
    if afterDivider or afterBreak or afterLine:
      result += "\n"

  # reset
  afterLine = False
  afterBreak = False
  afterDivider = False

  if pretty:
    # add indent (if needed)
    if result.endswith("\n"):
      result += ("  " * indent)

  # append given text
  result += txt


def divide():
  global afterDivider
  afterDivider = True


def sep():
  global afterBreak
  afterBreak = True


def line():
  global afterLine
  afterLine = True


def noline():
  global afterLine
  global afterBreak
  global afterDivider

  afterLine = False
  afterBreak = False
  afterDivider = False


def plus():
  global indent
  indent += 1


def minus():
  global indent
  indent -= 1


def semicolon():
  global result

  noline()

  if not (result.endswith("\n") or result.endswith(";")):
    write(";")


def comment(node):
  global pretty

  if not pretty:
    return

  commentText = ""
  commentIsInline = False

  afterDivider = node.getChild("commentsAfter", False)

  if afterDivider and not afterDivider.get("inserted", False):
    for child in afterDivider.children:
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

      afterDivider.set("inserted", True)








def compile(node, enablePretty=True, enableBreaks=False, enableDebug=False):
  global indent
  global result
  global pretty
  global debug
  global breaks
  global afterLine
  global afterBreak
  global afterDivider

  indent = 0
  result = ""
  pretty = enablePretty
  debug = enableDebug
  breaks = enableBreaks
  afterLine = False
  afterBreak = False
  afterDivider = False

  compileNode(node)

  if not pretty:
    optimize()

  return result






def optimize():
  global result

  result = result.replace(";}", "}")





def compileNode(node):

  global pretty




  #####################################################################################################################
  # Recover styling
  #####################################################################################################################

  if pretty:
    # Recover exclicit breaks
    if node.get("breakBefore", False) and not node.isFirstChild(True):
      sep()





  #####################################################################################################################
  # Insert comments before
  #####################################################################################################################

  if pretty:
    if node.getChild("commentsBefore", False) != None:
      commentCounter = 0
      commentsBefore = node.getChild("commentsBefore")
      isFirst = node.isFirstChild()
      previous = node.getPreviousSibling(False, True)

      if previous and previous.type in [ "case", "default" ]:
        inCase = True
      else:
        inCase = False

      for child in commentsBefore.children:
        docComment = child.get("detail") in [ "javadoc", "qtdoc" ]
        headComment = child.get("detail") == "header"
        divComment = child.get("detail") == "divider"
        blockComment = child.get("detail") ==  "block"

        if not child.isFirstChild():
          pass

        elif inCase:
          pass

        elif divComment:
          divide()

        elif not isFirst:
          sep()

        elif not headComment:
          line()

        write(child.get("text"))

        # separator after divider/head comments and after block comments which are not for documentation
        if headComment or divComment or blockComment:
          sep()

        else:
          line()






  #####################################################################################################################
  # Opening...
  #####################################################################################################################

  #
  # OPEN: FINALLY
  ##################################

  if node.type == "finally":
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
  # OPEN: LABEL
  ##################################

  elif node.type == "labelTerminator":
    write(":")


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
  # OPEN: COMMENT
  ##################################

  elif node.type == "comment":
    if pretty:
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
  # OPEN: RIGHT
  ##################################

  elif node.type == "right":
    if node.parent.type == "accessor":
      write(".")






  #
  # OPEN: ASSIGNMENT
  ##################################

  elif node.type == "assignment":
    if node.parent.type == "definition":
      oper = node.get("operator", False)

      realNode = node.parent.parent

      # be compact in for-loops
      compact = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"
      write(compileToken(oper, compact))





  #
  # OPEN: KEY
  ##################################

  elif node.type == "key":
    if node.parent.type == "accessor":
      write("[")


  #
  # OPEN: GROUP
  ##################################

  elif node.type == "group":
    write("(")


  #
  # OPEN: ARRAY
  ##################################

  elif node.type == "array":
    write("[")

    if node.hasChildren(True):
      space(False)


  #
  # OPEN: PARAMS
  ##################################

  elif node.type == "params":
    noline()
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
  # OPEN: CATCH
  ##################################

  elif node.type == "catch":
    if pretty:
      # If this statement block or the previous try were not complex, be not complex here, too
      if not node.getChild("statement").getChild("block").isComplex() and not node.parent.getChild("statement").getChild("block").isComplex():
        noline()
        space()

    write("catch")







  #
  # OPEN: MAP
  ##################################

  elif node.type == "map":
    par = node.parent

    if pretty:
      # No break before return statement
      if node.hasParent() and node.parent.type == "expression" and node.parent.parent.type == "return":
        pass

      elif node.isComplex():
        line()

    write("{")

    if pretty:
      if node.isComplex():
        line()
        plus()

      elif node.hasChildren(True):
        space()


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

    if pretty and node.getChild("value").isComplex() and not node.isFirstChild(True):
      sep()

    write(keyString)
    space(False)

    # Fill with spaces
    # Do this only if the parent is complex (many entries)
    # But not if the value itself is complex
    if pretty and node.parent.isComplex() and not node.getChild("value").isComplex():
      write(" " * (node.parent.get("maxKeyLength") - len(keyString)))

    write(":")
    space(False)







  #
  # OPEN: BLOCK
  ##################################

  elif node.type == "block":
    if pretty:
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

    if pretty:
      if node.hasChildren():
        plus()
        line()


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
      space(False)

    elif loopType == "WHILE":
      write("while")
      space(False)

    elif loopType == "FOR":
      write("for")
      space(False)

    elif loopType == "DO":
      write("do")
      space(False)

    elif loopType == "WITH":
      write("with")
      space(False)

    else:
      print "Warning: Unknown loop type: %s" % loopType



  #
  # OPEN: ELSE
  ##################################

  elif node.type == "elseStatement":
    if node.hasChild("commentsBefore"):
      pass

    elif pretty:
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
  # OPEN: EXPRESSION
  ##################################

  elif node.type == "expression":
    if node.parent.type == "loop":
      loopType = node.parent.get("loopType")

      # only do-while loops
      if loopType == "DO":
        if pretty:
          stmnt = node.parent.getChild("statement")
          compact = stmnt.hasChild("block") and not stmnt.getChild("block").isComplex()

          if compact:
            noline()
            space()

        write("while")

        if pretty:
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
  # OPEN: FIRST
  ##################################

  elif node.type == "first":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      write("(")

    # operation
    elif node.parent.type == "operation":
      if node.parent.get("left", False) == True:
        write(compileToken(node.parent.get("operator")))


  #
  # OPEN: SECOND
  ##################################

  elif node.type == "second":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      if not node.parent.hasChild("first"):
        write("(;")
        space(False)


  #
  # OPEN: THIRD
  ##################################

  elif node.type == "third":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      if not node.parent.hasChild("second"):
        if node.parent.hasChild("first"):
          write(";")
        else:
          write("(;;")

        space(False)


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
        space(False)













  #####################################################################################################################
  # Children content
  #####################################################################################################################

  if node.hasChildren():
    for child in node.children:
      if not node.type in [ "commentsBefore", "commentsAfter" ]:
        compileNode(child)









  #####################################################################################################################
  # Closing node
  #####################################################################################################################

  #
  # CLOSE: IDENTIFIER
  ##################################

  if node.type == "identifier":
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

      if pretty:
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

      if pretty:
        comment(node)

        if node.hasComplexChildren():
          line()
        else:
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

      # be compact in for-loops
      compact = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"
      write(compileToken(oper, compact))






  #
  # CLOSE: KEY
  ##################################

  elif node.type == "key":
    if node.hasParent() and node.parent.type == "accessor":
      write("]")


  #
  # CLOSE: GROUP
  ##################################

  elif node.type == "group":
    write(")")


  #
  # CLOSE: ARRAY
  ##################################

  elif node.type == "array":
    if node.hasChildren(True):
      space(False)

    write("]")



  #
  # CLOSE: PARAMS
  ##################################

  elif node.type == "params":
    write(")")




  #
  # CLOSE: MAP
  ##################################

  elif node.type == "map":
    if pretty:
      if node.isComplex():
        line()
        minus()

      elif node.hasChildren(True):
        space()

    write("}")






  #
  # CLOSE: SWITCH
  ##################################

  elif node.type == "switch":
    if node.get("switchType") == "case":
      if pretty:
        minus()
        minus()
        line()

      write("}")

      if pretty:
        comment(node)
        line()

    # Force a additinal line feed after each switch/try
    if pretty and not node.isLastChild():
      sep()


  #
  # CLOSE: CASE
  ##################################

  elif node.type == "case":
    write(":")

    if pretty:
      comment(node)
      plus()
      line()








  #
  # CLOSE: BLOCK
  ##################################

  elif node.type == "block":
    if pretty and node.hasChildren():
      minus()
      line()

    write("}")

    if pretty:
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
  # CLOSE: LOOP
  ##################################

  elif node.type == "loop":
    if node.get("loopType") == "DO":
      semicolon()

    if pretty:
      comment(node)

      # Force a additinal line feed after each loop
      if not node.isLastChild():
        sep()


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
        space(False)

    elif node.parent.type == "catch":
      write(")")

    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      write(")")

      if pretty:
        comment(node)
        line()

      write("{")

      if pretty:
        plus()
        plus()


  #
  # CLOSE: FIRST
  ##################################

  elif node.type == "first":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      if node.parent.hasChild("second") or node.parent.hasChild("third"):
        write(";")

        if node.parent.hasChild("second"):
          space(False)

    # operation
    elif node.parent.type == "operation" and node.parent.get("left", False) != True:
      oper = node.parent.get("operator")

      if node.parent.parent.type == "statementList":
        realNode = node.parent.parent
      else:
        realNode = node.parent

      compact = realNode.hasParent() and realNode.parent.type in [ "first", "second", "third" ] and realNode.parent.parent.type == "loop" and realNode.parent.parent.get("loopType") == "FOR"
      write(compileToken(oper, compact))


  #
  # CLOSE: SECOND
  ##################################

  elif node.type == "second":
    # for loop
    if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
      write(";")
      space(False)

    # (?: operation)
    elif node.parent.type == "operation" and node.parent.get("operator") == "HOOK":
      space(False)
      write(":")
      space(False)









  #
  # CLOSE: OTHER
  ##################################

  if node.hasParent() and not node.type in [ "comment", "commentsBefore", "commentsAfter" ]:

    # Add comma dividers between statements in these parents
    if node.parent.type in [ "array", "params", "statementList" ]:
      if not node.isLastChild(True):
        write(",")

        if pretty:
          comment(node)

          if node.isComplex():
            line()
          else:
            space()

    # Semicolon handling
    elif node.type in [ "block", "assignment", "call", "operation", "definitionList", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable" ]:

      # Default semicolon handling
      if node.parent.type in [ "block", "file" ]:
        semicolon()

        if pretty:
          comment(node)
          line()

          if node.isComplex() and not node.isLastChild():
            sep()

      # Special handling for switch statements
      elif node.parent.type == "statement" and node.parent.parent.type == "switch" and node.parent.parent.get("switchType") == "case":
        semicolon()

        if pretty:
          comment(node)
          line()

          if node.isComplex() and not node.isLastChild():
            sep()

      # Special handling for loops (e.g. if) without blocks {}
      elif node.parent.type in [ "statement", "elseStatement" ] and not node.parent.hasChild("block") and node.parent.parent.type == "loop":
        semicolon()

        if pretty:
          comment(node)
          line()

          if node.isComplex() and not node.isLastChild():
            sep()


  #
  # CLOSE: OTHER
  ##################################

  if pretty:
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
