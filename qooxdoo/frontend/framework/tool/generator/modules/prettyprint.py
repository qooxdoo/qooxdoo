#!/usr/bin/env python

import sys, string, re, os, random, optparse
import config, tokenizer, filetool, treegenerator


KEY = re.compile("^[A-Za-z0-9_]+$")



def getTokenSource(id):
  for key in config.JSTOKENS:
    if config.JSTOKENS[key] == id:
      return key

  return None



def line():

  global indent
  global pretty

  pretty += "\n%s" % ("  " * indent)



def plus():

  global indent
  global pretty

  indent += 1



def minus():

  global indent
  global pretty


  indent -= 1



def semicolon():

  global indent
  global pretty

  pretty += ";"



def compile(node, enableDebug=False):

  global indent
  global pretty

  indent = 0
  pretty = ""

  compileNode(node, enableDebug)

  return pretty




def compileNode(node, enableDebug=False):

  global indent
  global pretty


  if node.getChild("commentsBefore", False) != None:
    for comment in node.getChild("commentsBefore").children:
      # Additional new lines before big comment
      if comment.get("detail", False) == "multi":
        line()
        line()

      pretty += comment.get("text")
      line()



  ##################################################################
  # Opening...
  ##################################################################

  if node.type == "map":
    pretty += "{"

    if node.hasChildren():
      plus()
      line()

  elif node.type == "array":
    pretty += "["

    if node.hasChildren():
      plus()
      line()

  elif node.type == "block":
    line()
    pretty += "{"
    plus()
    line()

  elif node.type == "params":
    pretty += "("

  elif node.type == "group":
    pretty += "("

  elif node.type == "case":
    minus()
    line()
    pretty += "case "

  elif node.type == "catch":
    pretty += "catch"

  elif node.type == "finally":
    pretty += "finally"

  elif node.type == "delete":
    pretty += "delete "

  elif node.type == "break":
    pretty += "break"

    if node.get("label", False):
      pretty += " " + node.get("label", False)

  elif node.type == "continue":
    pretty += "continue"

    if node.get("label", False):
      pretty += " " + node.get("label", False)

  elif node.type == "elseStatement":
    # This was a (if)statement without a block around (a set of {})
    #if not node.parent.getChild("statement").hasChild("block"):
    #  if not pretty.endswith(";") and not pretty.endswith("\n"):
    #    pretty += ";"

    pretty += "else"

    # This is a elseStatement without a block around (a set of {})
    if not node.hasChild("block"):
      pretty += " "

  elif node.type == "switch" and node.get("switchType") == "case":
    # Additional line before switch statement
    line()
    pretty += "switch"

  elif node.type == "switch" and node.get("switchType") == "catch":
    # Additional line before try statement
    line()
    pretty += "try"

  elif node.type == "throw":
    line()
    pretty += "throw "

  elif node.type == "instantiation":
    pretty += "new "

  elif node.type == "return":
    line()
    pretty += "return"

    if node.hasChildren():
      pretty += " "

  elif node.type == "definitionList":
    pretty += "var "

  elif node.type == "default":
    minus()
    line()
    pretty += "default:"
    plus()
    line()






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

    pretty += keyString + ":"

  elif node.type == "expression":
    if node.parent.type == "loop":
      loopType = node.parent.get("loopType")

      if loopType == "DO":
        pretty += "while"

      # open expression block of IF/WHILE/DO-WHILE/FOR statements
      pretty += "("
    elif node.parent.type == "catch":
      # open expression block of CATCH statement
      pretty += "("
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      # open expression block of SWITCH statement
      pretty += "("

  elif node.type == "loop":
    loopType = node.get("loopType")
    if loopType == "IF":
      pretty += "if"

    elif loopType == "WHILE":
      pretty += "while"

    elif loopType == "FOR":
      pretty += "for"

    elif loopType == "DO":
      pretty += "do"

    elif loopType == "WITH":
      pretty += "with"

    else:
      print "UNKNOWN LOOP TYPE: %s" % loopType

  elif node.type == "function":
    functionDeclHasParams = False
    pretty += "function"

    functionName = node.get("name", False)
    if functionName != None:
      pretty += " %s" % functionName

  elif node.type == "identifier":
    name = node.get("name", False)
    if name != None:
      pretty += name

  elif node.type == "call":
    callHasParams = False

  elif node.type == "definition":
    if node.parent.type != "definitionList":
      pretty += "var "

    pretty += node.get("identifier")

  elif node.type == "constant":
    if node.get("constantType") == "string":
      if node.get("detail") == "singlequotes":
        pretty += "'"
      else:
        pretty += '"'

      pretty += node.get("value")

      if node.get("detail") == "singlequotes":
        pretty += "'"
      else:
        pretty += '"'

    else:
      pretty += node.get("value")

  elif node.type == "third":
    if node.parent.type == "operation":
      if node.parent.get("operator") == "HOOK":
        pretty += " : "
      else:
        print "Unknown third argument... Not a hook"

  elif node.type == "labelTerminator":
    pretty += ":"










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
          pretty += "()"
          functionDeclHasParams = True

      elif node.type == "definition" and child.type == "assignment":
        oper = child.get("operator", False)

        pretty += " "

        if oper != None:
          pretty += getTokenSource(oper)
        else:
          pretty += "="

        pretty += " "

      elif node.type == "accessor" and child.type == "key":
        pretty += "["

      elif node.type == "accessor" and child.type == "right":
        pretty += "."

      elif node.type == "loop" and node.get("loopType") == "FOR":
        if child.type == "first":
          pretty += "("
        elif child.type == "statement":
          pretty += ")"
        else:
          if child.type == "second" and node.getChild("first", False) == None:
            pretty += "("

          if child.type == "third" and node.getChild("first", False) == None and node.getChild("second", False) == None:
            pretty += "("

          if not pretty.endswith(";") and not pretty.endswith("\n"):
            pretty += ";"

      elif node.type == "operation" and node.get("left", False) == "true":
        op = node.get("operator")

        if op == "TYPEOF":
          pretty += "typeof "
        elif op == None:
          print "BAD OPERATOR [A]: %s" % op
        else:
          pretty += getTokenSource(op)





      # Add child
      compileNode(child, enableDebug)









      if node.type == "operation" and child.type == "first" and node.get("left", False) != "true":
        op = node.get("operator")

        if op == "IN":
          pretty += " in "
        elif op == "INSTANCEOF":
          pretty += " instanceof "
        elif op == None:
          print "BAD OPERATOR [B]: %s" % op
        else:
          pretty += " "
          pretty += getTokenSource(op)
          pretty += " "

      elif node.type == "assignment" and child.type == "left":
        oper = node.get("operator", False)

        pretty += " "

        if oper != None:
          pretty += getTokenSource(oper)
        else:
          pretty += "="

        pretty += " "

      elif node.type == "accessor" and child.type == "key":
        pretty += "]"





      # Separate children in parent list
      if childPosition < childrenNumber:
        if node.type == "variable":
          pretty += "."

        elif node.type == "map":
          pretty += ", "

        elif node.type == "array":
          pretty += ", "

        elif node.type == "definitionList":
          pretty += ", "

        elif node.type == "params":
          pretty += ", "

        elif node.type == "statementList":
          pretty += ", "


      separators = [ "block", "assignment", "call", "operation", "definition", "definitionList", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable", "function" ]
      not_after = [ "case", "default" ]
      not_in = [ "definitionList", "statementList", "params", "variable", "array" ]

      if node.type in [ "block", "file", "switch" ]:
        if not previousType in not_after:
          if child.type in separators:
            # pretty += "[[SEMI]]"
            semicolon()

            # not last child
            if childPosition == childrenNumber and node.type in [ "block", "switch", "file" ]:
              pass
            else:
              # pretty += "[[LINE]]"
              line()




      # Next...
      childPosition += 1
      previousType = child.type





  ##################################################################
  # Closing...
  ##################################################################

  if node.type == "map":
    if node.hasChildren():
      minus()
      line()

    pretty += "}"

  elif node.type == "array":
    if node.hasChildren():
      minus()
      line()

    pretty += "]"

  elif node.type == "block":
    minus()
    line()
    pretty += "}"

  elif node.type == "loop":
    if node.parent.type != "block":
      line()

  elif node.type == "params":
    pretty += ")"

  elif node.type == "switch" and node.get("switchType") == "case":
    minus()
    minus()
    line()
    pretty += "}"

    # additional new line
    line()
    line()

  elif node.type == "group":
    pretty += ")"

  elif node.type == "case":
    pretty += ":"
    plus()
    line()

  elif node.type == "call" and not callHasParams:
    pretty += "()"

  elif node.type == "function" and not functionDeclHasParams:
    pretty += "()"

  elif node.type == "expression":
    if node.parent.type == "loop":
      pretty += ")"
    elif node.parent.type == "catch":
      pretty += ")"
    elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
      pretty += ")"
      line()
      pretty += "{"
      plus()
      plus()

  elif node.type == "case":
    plus()
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
