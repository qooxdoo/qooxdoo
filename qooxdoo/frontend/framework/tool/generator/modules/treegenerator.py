#!/usr/bin/env python

import sys, compile, tree


SINGLE_LEFT_OPERATORS = [ "NOT", "BITNOT", "SUB", "INC", "DEC" ]

SINGLE_RIGHT_OPERATORS = [ "INC", "DEC" ]

MULTI_TOKEN_OPERATORS = [ "HOOK", "ADD", "SUB", "MUL", "DIV", "MOD", \
  "LT", "LE", "GT", "GE", "EQ", "NE", "SHEQ", "SHNE", \
  "AND", "OR", "BITOR", "BITXOR", "BITAND", "POWEROF", \
  "LSH", "RSH", "URSH" ]

MULTI_PROTECTED_OPERATORS = [ "INSTANCEOF", "IN" ]

ASSIGN_OPERATORS = [ "ASSIGN", "ASSIGN_ADD", "ASSIGN_SUB", "ASSIGN_MUL", \
  "ASSIGN_DIV", "ASSIGN_MOD", "ASSIGN_BITOR", "ASSIGN_BITXOR", "ASSIGN_BITAND", \
  "ASSIGN_LSH", "ASSIGN_RSH", "ASSIGN_URSH" ]

LOOP_KEYWORDS = [ "WHILE", "IF", "FOR", "WITH" ]


class TokenStream:
  def __init__ (self, tokens):
    self.tokens = tokens
    self.commentsBefore = None
    self.parsepos = -1

  def curr (self):
    """Returns the current token."""
    return self.tokens[self.parsepos]

  def currType (self):
    return self.curr()["type"]

  def currDetail (self):
    return self.curr()["detail"]

  def currSource (self):
    return self.curr()["source"]

  def currLine (self):
    return self.curr()["line"]

  def currIsType (self, tokenType, tokenDetail = None):
    if self.currType() != tokenType:
      return False
    else:
      if tokenDetail == None:
        return True
      elif type(tokenDetail) == list:
        return self.currDetail() in tokenDetail
      else:
        return self.currDetail() == tokenDetail

  def expectCurrType (self, tokenType, tokenDetail = None):
    if not self.currIsType(tokenType, tokenDetail):
      expectedDesc = tokenType
      if type(tokenDetail) == str:
        expectedDesc += "/" + tokenDetail
      raiseSyntaxException(self.curr(), expectedDesc)

  def finished (self):
    # NOTE: the last token is end of file
    return self.parsepos >= len(self.tokens) - 1

  def next (self):
    length = len(self.tokens)
    commentsBefore = None

    token = None
    while self.parsepos < length - 1:
      self.parsepos += 1

      token = self.tokens[self.parsepos]
      if token["type"] == "eol":
        # ignore end of line
        pass
      elif token["type"] == "comment":
        if not self.commentsBefore:
          self.commentsBefore = []

        self.commentsBefore.append(token)
      else:
        break

    #print "next token: " + str(token)

    if token == None:
      # return end of file token
      return self.tokens[length - 1]
    else:
      return token

  def clearCommentsBefore(self):
    commentsBefore = self.commentsBefore
    self.commentsBefore = None
    return commentsBefore



class SyntaxException (Exception):
  pass



def createItemNode(type, stream):
  node = tree.Node(type)
  node.set("line", str(stream.currLine()))

  comments = stream.clearCommentsBefore()
  if comments:
    for comment in comments:
      commentNode = tree.Node("comment")
      commentNode.set("line", str(comment["line"]))
      commentNode.set("text", comment["source"])
      node.addListChild("commentsBefore", commentNode)

  return node



def raiseSyntaxException (token, expectedDesc = None):
  if expectedDesc:
    msg = "Expected " + expectedDesc + " but found "
  else:
    msg = "Unexpected "
  msg += token["type"]
  if token["detail"]:
    msg += "/" + token["detail"]
  msg += ": '" + token["source"] + "'. file " + \
    token["id"] + " line " + str(token["line"])
  raise SyntaxException(msg)



def createSyntaxTree (tokenArr):
  """Creates a syntax tree from a token stream.

  tokens: the token stream."""

  stream = TokenStream(tokenArr)

  rootBlock = tree.Node("file")
  stream.next()

  while not stream.finished():
    rootBlock.addChild(readStatement(stream))

  return rootBlock



def readExpression (stream):
  return readStatement(stream, True)



def readStatement (stream, expressionMode = False, overrunSemicolon = True):
  item = None

  if currIsIdentifier(stream, True):
    # statement starts with an identifier
    variable = readVariable(stream, True)
    variable = readObjectOperation(stream, variable)

    if stream.currIsType("token", ASSIGN_OPERATORS):
      # This is an assignment
      item = createItemNode("assignment", stream)
      item.set("operator", stream.currDetail())
      stream.next()

      item.addListChild("left", variable)
      item.addListChild("right", readExpression(stream))
    else:
      # Something else comes after the variable -> It's a sole variable
      item = variable

    # Any comments found for the variable belong to the extracted item
    commentsChild = variable.getChild("commentsBefore", False)
    if item and commentsChild != None:
      variable.removeChild(commentsChild)
      item.addChild(commentsChild, 0)
  elif stream.currIsType("protected", "FUNCTION"):
    stream.next()

    item = createItemNode("function", stream)

    # Read optional function name
    if not expressionMode and stream.currIsType("name"):
      item.set("name", stream.currSource())
      stream.next()

    readParamList(item, stream)
    item.addListChild("body", readBlock(stream))

    # Check for direct execution: function() {}()
    if stream.currIsType("token", "LP"):
      # The function is executed directly
      functionItem = item
      item = createItemNode("call", stream)
      item.addListChild("operand", functionItem)
      readParamList(item, stream)
      item = readObjectOperation(stream, item)
  elif stream.currIsType("token", "LP"):
    stream.next()
    item = createItemNode("group", stream)
    if expressionMode:
      item.addChild(readExpression(stream))
    else:
      item.addChild(readStatement(stream))
    stream.expectCurrType("token", "RP")
    stream.next()
    item = readObjectOperation(stream, item)
  elif expressionMode and stream.currIsType("string"):
    item = createItemNode("constant", stream)
    item.set("constantType", "string")
    item.set("value", stream.currSource())
    item.set("detail", stream.currDetail())
    stream.next()
    # Allow function calls for strings. E.g.: "a string".match(...)
    item = readObjectOperation(stream, item, True)
  elif expressionMode and stream.currIsType("number"):
    item = createItemNode("constant", stream)
    item.set("constantType", "number")
    item.set("value", stream.currSource())
    stream.next()
  elif expressionMode and stream.currIsType("regexp"):
    item = createItemNode("constant", stream)
    item.set("constantType", "regexp")
    item.set("value", stream.currSource())
    stream.next()
    item = readObjectOperation(stream, item)
  elif expressionMode and (stream.currIsType("protected", "TRUE") or stream.currIsType("protected", "FALSE")):
    item = createItemNode("constant", stream)
    item.set("constantType", "boolean")
    item.set("value", stream.currSource())
    stream.next()
  elif expressionMode and stream.currIsType("protected", "NULL"):
    item = createItemNode("constant", stream)
    item.set("constantType", "null")
    item.set("value", stream.currSource())
    stream.next()
  elif expressionMode and stream.currIsType("token", "LC"):
    item = readMap(stream)
  elif expressionMode and stream.currIsType("token", "LB"):
    item = readArray(stream)
  elif stream.currIsType("token", SINGLE_LEFT_OPERATORS):
    item = createItemNode("operation", stream)
    item.set("operator", stream.currDetail())
    item.set("left", "true")
    stream.next()
    item.addListChild("first", readExpression(stream))
  elif stream.currIsType("protected", "TYPEOF"):
    item = createItemNode("operation", stream)
    item.set("operator", "TYPEOF")
    item.set("left", "true")
    stream.next()
    item.addListChild("first", readExpression(stream))
  elif stream.currIsType("protected", "NEW"):
    item = readInstantiation(stream)
    item = readObjectOperation(stream, item)
  elif not expressionMode and stream.currIsType("protected", "VAR"):
    item = createItemNode("definitionGroup", stream)
    stream.next()
    finished = False
    while not finished:
      if not currIsIdentifier(stream, False):
        raiseSyntaxException(stream.curr(), "identifier")

      childitem = createItemNode("definition", stream)
      childitem.set("identifier", stream.currSource())
      stream.next()
      if stream.currIsType("token", "ASSIGN"):
        stream.next()
        childitem.addListChild("assignment", readExpression(stream))

      item.addChild(childitem)

      # Check whether anothe definition follows, e.g. "var a, b=1, c=4"
      if stream.currIsType("token", "COMMA"):
        stream.next()
      else:
        finished = True
  elif not expressionMode and stream.currIsType("protected", LOOP_KEYWORDS):
    item = readLoop(stream)
  elif not expressionMode and stream.currIsType("protected", "DO"):
    item = readDoWhile(stream)
  elif not expressionMode and stream.currIsType("protected", "SWITCH"):
    item = readSwitch(stream)
  elif not expressionMode and stream.currIsType("protected", "TRY"):
    item = readTryCatch(stream)
  elif not expressionMode and stream.currIsType("token", "LC"):
    item = readBlock(stream)
  elif not expressionMode and stream.currIsType("protected", "RETURN"):
    item = createItemNode("return", stream)
    stream.next()
    # NOTE: The expression after the return keyword is optional
    if not stream.currIsType("token", "SEMICOLON") and not stream.currIsType("token", "RC"):
      item.addListChild("expression", readExpression(stream))
  elif not expressionMode and stream.currIsType("protected", "THROW"):
    item = createItemNode("throw", stream)
    stream.next()
    item.addListChild("expression", readExpression(stream))
  elif not expressionMode and stream.currIsType("protected", "DELETE"):
    item = createItemNode("delete", stream)
    stream.next()
    item.addListChild("expression", readExpression(stream))
  elif not expressionMode and stream.currIsType("protected", "BREAK"):
    item = createItemNode("break", stream)
    stream.next()
  elif not expressionMode and stream.currIsType("protected", "CONTINUE"):
    item = createItemNode("continue", stream)
    stream.next()

  if not item:
    if stream.currIsType("token", "SEMICOLON") and not expressionMode:
      # This is an empty statement
      item = createItemNode("emptyStatement", stream)
      stream.next()
    else:
      if expressionMode:
        expectedDesc = "expression"
      else:
        expectedDesc = "statement"
      raiseSyntaxException(stream.curr(), expectedDesc)

  # check whether this is an operation
  if stream.currIsType("token", MULTI_TOKEN_OPERATORS) or stream.currIsType("protected", MULTI_PROTECTED_OPERATORS) or stream.currIsType("token", SINGLE_RIGHT_OPERATORS):
    # its an operation -> We've already parsed the first operand (in item)
    parsedItem = item

    operator = stream.currDetail()

    item = createItemNode("operation", stream)
    item.addListChild("first", parsedItem)
    item.set("operator", operator)
    stream.next()
    if operator in MULTI_TOKEN_OPERATORS or operator in MULTI_PROTECTED_OPERATORS:
      # It's a multi operator -> There must be a second argument
      item.addListChild("second", readExpression(stream))
      if operator == "HOOK":
        # It's a "? :" operation -> There must be a third argument
        stream.expectCurrType("token", "COLON")
        stream.next()
        item.addListChild("third", readExpression(stream))

  # check whether this is a combined statement, e.g. "bla(), i++"
  if not expressionMode and stream.currIsType("token", "COMMA"):
    statementList = createItemNode("statementList", stream)
    statementList.addChild(item)
    while stream.currIsType("token", "COMMA"):
      stream.next()
      statementList.addChild(readStatement(stream, False, False))
    item = statementList

  # go over the optional semicolon
  if not expressionMode and overrunSemicolon and stream.currIsType("token", "SEMICOLON"):
    stream.next()

  return item



def currIsIdentifier (stream, allowThis):
  det = stream.currDetail()
  return stream.currIsType("name") or stream.currIsType("builtin") \
    or (stream.currIsType("protected") and \
       (det == "INFINITY" or det == "PROTOTYPE" or det == "CALL" or \
        det == "APPLY" or (allowThis and det == "THIS")))



def readVariable (stream, allowArrays):
  # Note: keywords may be used as identifiers, too
  item = createItemNode("variable", stream)

  done = False
  firstIdentifier = True
  while not done:
    if not currIsIdentifier(stream, firstIdentifier):
      raiseSyntaxException(stream.curr(), "identifier")

    identifier = createItemNode("identifier", stream)
    identifier.set("name", stream.currSource())
    stream.next()

    if allowArrays:
      while stream.currIsType("token", "LB"):
        accessor = createItemNode("accessor", stream)
        stream.next()
        accessor.addListChild("identifier", identifier)
        accessor.addListChild("key", readExpression(stream))

        stream.expectCurrType("token", "RB")
        stream.next()

        identifier = accessor

    item.addChild(identifier)

    firstIdentifier = False

    if stream.currIsType("token", "DOT"):
      stream.next()
    else:
      done = True

  return item



def readObjectOperation(stream, operand, onlyAllowMemberAccess = False):
  if stream.currIsType("token", "DOT"):
    # This is a member accessor (E.g. "bla.blubb")
    item = createItemNode("accessor", stream)
    stream.next()
    item.addListChild("left", operand)
    variable = readVariable(stream, False)
    item.addListChild("right", readObjectOperation(stream, variable))
  elif stream.currIsType("token", "LP"):
    # This is a function call (E.g. "bla(...)")
    item = createItemNode("call", stream)
    item.addListChild("operand", operand)
    readParamList(item, stream)
    item = readObjectOperation(stream, item)
  elif stream.currIsType("token", "LB"):
    # This is an array access (E.g. "bla[...]")
    item = createItemNode("accessor", stream)
    stream.next()
    item.addListChild("identifier", operand)
    item.addListChild("key", readExpression(stream))

    stream.expectCurrType("token", "RB")
    stream.next()
    item = readObjectOperation(stream, item)
  else:
    item = operand

  # Any comments found for the operand belong to the item
  if operand != item:
    commentsChild = operand.getChild("commentsBefore", False)
    if commentsChild != None:
      operand.removeChild(commentsChild)
      item.addChild(commentsChild, 0)

  return item



def readParamList (node, stream):
  stream.expectCurrType("token", "LP")
  stream.next()

  firstParam = True
  while not stream.currIsType("token", "RP"):
    if firstParam:
      firstParam = False
    else:
      stream.expectCurrType("token", "COMMA")
      stream.next()

    node.addListChild("params", readExpression(stream))

  stream.next()



def readBlock(stream):
  #return readBlock_simple(stream)
  return readBlock_real(stream)



def readBlock_real(stream):
  stream.expectCurrType("token", "LC")
  stream.next()

  item = createItemNode("block", stream)
  while not stream.currIsType("token", "RC"):
    item.addChild(readStatement(stream))

  stream.next()

  return item



def readBlock_simple(stream):
  stream.expectCurrType("token", "LC")
  stream.next()

  level = 1
  while not stream.finished() and level != 0:
    if stream.currIsType("token", "LC"):
      level += 1
    elif stream.currIsType("token", "RC"):
      level -= 1
    stream.next()

  return createItemNode("block", stream)



def readMap(stream):
  stream.expectCurrType("token", "LC")
  item = createItemNode("map", stream)

  stream.next()

  while not stream.currIsType("token", "RC"):
    if item.hasChildren():
      stream.expectCurrType("token", "COMMA")
      stream.next()

    if not currIsIdentifier(stream, True) and not stream.currIsType("string") and not stream.currIsType("number"):
      raiseSyntaxException(stream.curr(), "map key (identifier, string or number)")

    keyvalue = createItemNode("keyvalue", stream)
    keyvalue.set("key", stream.currSource())
    stream.next()
    stream.expectCurrType("token", "COLON")
    stream.next()
    keyvalue.addListChild("value", readExpression(stream))

    item.addChild(keyvalue)

  stream.next()

  return item



def readArray(stream):
  stream.expectCurrType("token", "LB")
  stream.next()

  item = createItemNode("array", stream)
  # NOTE: We use our own flag for checking whether the array already has entries
  #       and not item.hasChildren(), because item.hasChildren() is also true
  #       when there are comments before the array
  hasEntries = False
  while not stream.currIsType("token", "RB"):
    if hasEntries:
      stream.expectCurrType("token", "COMMA")
      stream.next()

    item.addChild(readExpression(stream))
    hasEntries = True

  stream.next()

  return item



def readInstantiation(stream):
  stream.expectCurrType("protected", "NEW")
  stream.next()

  item = createItemNode("instantiation", stream)

  variable = readVariable(stream, False)
  if stream.currIsType("token", "LP"):
    callItem = createItemNode("call", stream)
    callItem.addListChild("variable", variable)
    readParamList(callItem, stream)
    item.addListChild("expression", callItem)
  else:
    item.addListChild("expression", variable)

  return item



def readLoop(stream):
  stream.expectCurrType("protected", LOOP_KEYWORDS)

  loopType = stream.currDetail()

  item = createItemNode("loop", stream)
  item.set("loopType", loopType)

  stream.next()

  stream.expectCurrType("token", "LP")
  stream.next()

  if loopType == "FOR":
    if not stream.currIsType("token", "SEMICOLON"):
      # Read the optional first statement
      item.addListChild("first", readStatement(stream, False, False))

    if stream.currIsType("token", "SEMICOLON"):
      # It's a for (;;) loop
      stream.next()
      if not stream.currIsType("token", "SEMICOLON"):
        # Read the optional second expression
        item.addListChild("second", readExpression(stream))
      stream.expectCurrType("token", "SEMICOLON")
      stream.next()
      if not stream.currIsType("token", "RP"):
        # Read the optional third statement
        item.addListChild("third", readStatement(stream, False, False))
    elif stream.currIsType("token", "RP"):
      # It's a for ( in ) loop
      pass
    else:
      raiseSyntaxException(stream.curr(), "semicolon or in")
  else:
    item.addListChild("expression", readExpression(stream))

  stream.expectCurrType("token", "RP")
  stream.next()

  item.addListChild("statement", readStatement(stream))

  if loopType == "IF" and stream.currIsType("protected", "ELSE"):
    stream.next()
    item.addListChild("elseStatement", readStatement(stream))

  return item



def readDoWhile(stream):
  stream.expectCurrType("protected", "DO")

  item = createItemNode("loop", stream)
  item.set("loopType", "DO")
  stream.next()

  item.addListChild("statement", readStatement(stream))

  stream.expectCurrType("protected", "WHILE")
  stream.next()

  stream.expectCurrType("token", "LP")
  stream.next()

  item.addListChild("expression", readExpression(stream))

  stream.expectCurrType("token", "RP")
  stream.next()

  return item


def readSwitch(stream):
  stream.expectCurrType("protected", "SWITCH")

  item = createItemNode("switch", stream)
  item.set("switchType", "case")

  stream.next()
  stream.expectCurrType("token", "LP")
  stream.next()

  item.addListChild("expression", readExpression(stream))

  stream.expectCurrType("token", "RP")
  stream.next()
  stream.expectCurrType("token", "LC")
  stream.next()

  while not stream.currIsType("token", "RC"):
    if stream.currIsType("protected", "CASE"):
      caseItem = createItemNode("case", stream)
      stream.next()
      caseItem.addListChild("expression", readExpression(stream))
      item.addChild(caseItem)
    elif stream.currIsType("protected", "DEFAULT"):
      defaultItem = createItemNode("default", stream)
      item.addChild(defaultItem)
      stream.next()
    else:
      raiseSyntaxException(stream.curr(), "case or default")
    stream.expectCurrType("token", "COLON")
    stream.next()

    while not stream.currIsType("token", "RC") and not stream.currIsType("protected", "CASE") and not stream.currIsType("protected", "DEFAULT"):
      item.addChild(readStatement(stream))

  stream.next()

  return item


def readTryCatch(stream):
  stream.expectCurrType("protected", "TRY")

  item = createItemNode("switch", stream)
  item.set("switchType", "catch")
  stream.next()

  item.addListChild("statement", readStatement(stream))

  while stream.currIsType("protected", "CATCH"):
    catchItem = createItemNode("catch", stream)
    stream.next()

    stream.expectCurrType("token", "LP")
    stream.next()
    catchItem.addListChild("expression", readExpression(stream))
    stream.expectCurrType("token", "RP")
    stream.next()

    catchItem.addListChild("statement", readStatement(stream))

    item.addChild(catchItem)

  if stream.currIsType("protected", "FINALLY"):
    finallyItem = createItemNode("finally", stream)
    stream.next()

    finallyItem.addListChild("statement", readStatement(stream))

    item.addChild(finallyItem)

  return item
