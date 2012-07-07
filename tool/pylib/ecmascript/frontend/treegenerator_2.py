#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#
################################################################################

from ecmascript.frontend                 import tree
from ecmascript.frontend.SyntaxException import SyntaxException

tag = 2  # to discriminate tree generators

ATOMS = ["string", "number", "identifier"]

SINGLE_LEFT_OPERATORS = ["NOT", "BITNOT", "ADD", "SUB", "INC", "DEC"]

SINGLE_RIGHT_OPERATORS = ["INC", "DEC"]

MULTI_TOKEN_OPERATORS = ["HOOK", "ADD", "SUB", "MUL", "DIV", "MOD", \
    "LT", "LE", "GT", "GE", "EQ", "NE", "SHEQ", "SHNE", \
    "AND", "OR", "BITOR", "BITXOR", "BITAND", "POWEROF", \
    "LSH", "RSH", "URSH"]

MULTI_PROTECTED_OPERATORS = ["INSTANCEOF", "IN"]

ASSIGN_OPERATORS = ["ASSIGN", "ASSIGN_ADD", "ASSIGN_SUB", "ASSIGN_MUL", \
    "ASSIGN_DIV", "ASSIGN_MOD", "ASSIGN_BITOR", "ASSIGN_BITXOR", "ASSIGN_BITAND", \
    "ASSIGN_LSH", "ASSIGN_RSH", "ASSIGN_URSH"]

LOOP_KEYWORDS = ["WHILE", "IF", "FOR", "WITH"]


##
# Represents the tokens of a file as a stream.
#
class TokenStream(object):
    ##
    # Some nice short description of foo(); this can contain html and
    # {@link #foo Links} to items in the current file.
    #
    # @param     tokens   Array of Tokenizer.token that will be represented by
    #                     the new object
    # @return             The new object instance
    # @defreturn          TokenStream
    #
    def __init__ (self, tokens):
        self.tokens = tokens
        self.length = len(self.tokens)
        self.commentsBefore = []
        self.parsepos = -1
        self.eolBefore = False

    def curr (self):
        """Returns the current token."""
        return self._curr

    def currType (self):
        return self._curr["type"]

    def currDetail (self):
        return self._curr["detail"]

    def currSource (self):
        return self._curr["source"]

    def currLine (self):
        return self._curr["line"]

    def currColumn (self):
        return self._curr["column"]

    def currMultiline (self):
        return self._curr["multiline"]

    def currConnection (self):
        return self._curr["connection"]

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

    ##
    # Iterator that returns the next token. Also takes special care if the next
    # token is a comment.
    #
    # @param     item     a tree.Node item (might be used to attach comment nodes)
    # @param     after    ??
    # @return             the next (non-comment) token or the EOF token
    # @defreturn          tokenizer.token
    #
    def next (self, item=None, after=False):
        self.eolBefore = False
        self.breakBefore = False

        token = None
        while self.parsepos < self.length - 1:
            self.parsepos += 1
            self._curr     = self.tokens[self.parsepos]
            token          = self._curr

            # EOL treatment
            if token["type"] == "eol":
                if self.eolBefore:
                    self.breakBefore = True

                self.eolBefore = True
                # ignore end of line
                pass

            #
            # Special treatment of comments
            #
            elif token["type"] == "comment":
                # After current item
                if token["connection"] == "after":
                    if "inserted" not in token or not token["inserted"]:
                        if item:
                            # Generating new tree node
                            commentNode = createCommentNode(token)
                            # Attach the new node to current position in tree
                            if after:
                                item.addListChild("commentsAfter", commentNode)
                            else:
                                item.addChild(commentNode)

                            self.eolBefore = False
                            self.breakBefore = False

                        else:
                            print "Found unresolved after comment in line %s, column %s" % (token["line"], token["column"])
                            print token["source"]
                            pass

                # Documentation and Block comments of next item
                else:  # token["connection"] != "after"
                    # Generating new tree node
                    commentNode = createCommentNode(token)
                    # Store the new node with this generator (TokenStream) instance
                    self.commentsBefore.append(commentNode)

                    self.eolBefore = False
                    self.breakBefore = False

            else:
                break

        #print "next token: " + str(token)

        if token == None:
            # return end of file token
            return self.tokens[self.length - 1]
        else:
            return token

    ##
    # Alternative to use, when we want to check if the next token
    # is a comment, but are not able to use next() because if there is
    # no comment we want to stay in the current position
    #
    def comment (self, item, after=False):
        token = None
        pos = self.parsepos

        while pos < self.length - 1:
            pos += 1
            token = self.tokens[pos]

            if token["type"] == "comment" and token["connection"] == "after" and ("inserted" not in token or not token["inserted"]):

                commentNode = createCommentNode(token)
                token["inserted"] = True
                if after:
                    item.addListChild("commentsAfter", commentNode)
                else:
                    item.addChild(commentNode)

            else:
                break

        return

    def hadEolBefore(self):
        return self.eolBefore

    def hadBreakBefore(self):
        return self.breakBefore

    def clearCommentsBefore(self):
        commentsBefore = self.commentsBefore
        self.commentsBefore = []
        return commentsBefore



def createItemNode(type, stream):
    # print "CREATE %s" % type

    node = tree.Node(type)
    node.set("line", stream.currLine())
    node.set("column", stream.currColumn())

    commentsBefore = stream.clearCommentsBefore()
    for comment in commentsBefore:
        node.addListChild("commentsBefore", comment)

    return node

##
# Creates a new comment tree node from token
#
def createCommentNode(token):
    commentNode = tree.Node("comment")
    commentNode.set("line", token["line"])
    commentNode.set("column", token["column"])
    commentNode.set("text", token["source"])
    commentNode.set("detail", token["detail"])
    commentNode.set("multiline", token["multiline"])
    commentNode.set("connection", token["connection"])
    commentNode.set("begin", token["begin"])
    commentNode.set("end", token["end"])

    return commentNode


def raiseSyntaxException (token, expectedDesc = None):
    if expectedDesc:
        msg = "Expected " + expectedDesc + " but found "
    else:
        msg = "Unexpected "

    msg += token["type"]

    if token["detail"]:
        msg += "/" + token["detail"]

    msg += ": '" + token["source"] + "'. file:" + \
        token["id"] + ", line:" + str(token["line"]) + \
        ", column:" + str(token["column"])

    raise SyntaxException(msg)



##
# Main worker; creates AST from token array
#
# @param     tokenArr array of JavaScript tokens, as generated by tokenizer.py
# @return             tree.Node - the root node of the AST
#
def createSyntaxTree (tokenArr, fileId=''):

    stream = TokenStream(tokenArr)
    stream.next()

    #from pprint import pprint
    #pprint([(x['detail'],x['source']) for x in tokenArr])
    #pprint([x for x in tokenArr if x['type']=="comment"])

    rootBlock = tree.Node("file")
    rootBlock.set("file", stream.curr()["id"])

    while not stream.finished():
        rootBlock.addChild(readStatement(stream))

    # collect prob. pending comments
    for c in stream.commentsBefore: 
        rootBlock.addChild(c)

    return rootBlock



def readExpression (stream, **kwargs):
    if not 'inStatementList' in kwargs:
        kwargs['inStatementList'] = True  # this means: allow list expressions .. , ..
    return readStatement(stream, True, **kwargs)



def readStatement (stream, expressionMode = False, overrunSemicolon = True, inStatementList = False):
    item = None

    eolBefore = stream.hadEolBefore()
    breakBefore = stream.hadBreakBefore()

    # print "PROGRESS: %s - %s (%s) [expr=%s]" % (stream.currType(), stream.currDetail(), stream.currLine(), expressionMode)

    if currIsIdentifier(stream, True):
        # statement starts with an identifier
        variable = readVariable(stream, True)
        variable = readObjectOperation(stream, variable)

        if stream.currIsType("token", ASSIGN_OPERATORS):
            # This is an assignment
            item = createItemNode("assignment", stream)
            item.set("operator", stream.currDetail())
            stream.next(item)

            item.addListChild("left", variable)
            item.addListChild("right", readExpression(stream))
        elif stream.currIsType("token", "COLON") and not expressionMode:
            # This is a label
            item = variable
            item.type = "label"
            stream.next(variable)
        else:
            # Something else comes after the variable -> It's a sole variable
            item = variable

        # Any comments found for the variable belong to the extracted item
        commentsChild = variable.getChild("commentsBefore", False)
        if item and commentsChild != None:
            variable.removeChild(commentsChild)
            item.addChild(commentsChild, 0)

    elif stream.currIsType("reserved", "FUNCTION"):
        item = createItemNode("function", stream)
        stream.next(item)

        # Read optional function name
        if stream.currIsType("name") or stream.currIsType("builtin"):
            item.set("name", stream.currSource())
            stream.next(item)

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
    elif stream.currIsType("reserved", "VOID"):
        item = createItemNode("void", stream)
        item.set("left", True)
        stream.next(item)
        item.addListChild("first", readExpression(stream))
    elif stream.currIsType("token", "LP"):
        igroup = createItemNode("group", stream)
        stream.next(igroup)
        igroup.addChild(readStatement(stream, expressionMode))
        #igroup.addChild(readExpression(stream, ))   # -- should be like this, but it doesn't work!?
        stream.expectCurrType("token", "RP")
        stream.next(igroup, True)
        oper = readObjectOperation(stream, igroup)

        # supports e.g. (this.editor.object || this.editor.iframe).style.marginTop = null;
        if stream.currIsType("token", ASSIGN_OPERATORS):
            # This is an assignment
            item = createItemNode("assignment", stream)
            item.set("operator", stream.currDetail())
            stream.next(item)

            item.addListChild("left", oper)
            item.addListChild("right", readExpression(stream))
        else:
            # Something else comes after the variable -> It's a sole variable
            item = oper

    elif stream.currIsType("string"):
        item = createItemNode("constant", stream)
        item.set("constantType", "string")
        item.set("value", stream.currSource())
        item.set("detail", stream.currDetail())
        stream.next(item, True)
        # This is a member accessor (E.g. "bla.blubb")
        item = readObjectOperation(stream, item)
    elif stream.currIsType("number"):
        item = createItemNode("constant", stream)
        item.set("constantType", "number")
        item.set("value", stream.currSource())
        item.set("detail", stream.currDetail())
        stream.next(item, True)
        # This is a member accessor (E.g. "bla.blubb")
        item = readObjectOperation(stream, item)
    elif stream.currIsType("regexp"):
        item = createItemNode("constant", stream)
        item.set("constantType", "regexp")
        item.set("value", stream.currSource())
        stream.next(item, True)
        # This is a member accessor (E.g. "bla.blubb")
        item = readObjectOperation(stream, item)
    elif expressionMode and (stream.currIsType("reserved", "TRUE") or stream.currIsType("reserved", "FALSE")):
        item = createItemNode("constant", stream)
        item.set("constantType", "boolean")
        item.set("value", stream.currSource())
        stream.next(item, True)
    elif expressionMode and stream.currIsType("reserved", "NULL"):
        item = createItemNode("constant", stream)
        item.set("constantType", "null")
        item.set("value", stream.currSource())
        stream.next(item, True)
    elif expressionMode and stream.currIsType("token", "LC"):
        item = readMap(stream)
        if stream.currIsType("token", "LB") or stream.currIsType("token", "DOT"):  # {...}[] or {...}.___
            item = readObjectOperation(stream, item)
    #elif expressionMode and stream.currIsType("token", "LB"):
    elif stream.currIsType("token", "LB"):
        item = readArray(stream)
        if stream.currIsType("token", "LB"):
            item = readObjectOperation(stream, item)
    elif stream.currIsType("token", SINGLE_LEFT_OPERATORS):
        item = createItemNode("operation", stream)
        item.set("operator", stream.currDetail())
        item.set("left", True)
        stream.next(item)
        item.addListChild("first", readExpression(stream))
    elif stream.currIsType("reserved", "TYPEOF"):
        item = createItemNode("operation", stream)
        item.set("operator", "TYPEOF")
        item.set("left", True)
        stream.next(item)
        item.addListChild("first", readExpression(stream))
    elif stream.currIsType("reserved", "NEW"):
        item = readInstantiation(stream)
        item = readObjectOperation(stream, item)
    elif not expressionMode and stream.currIsType("reserved", "VAR"):
        item = createItemNode("definitionList", stream)
        stream.next(item)
        finished = False
        while not finished:
            if not currIsIdentifier(stream, False):
                raiseSyntaxException(stream.curr(), "identifier")

            childitem = createItemNode("definition", stream)
            childitem.set("identifier", stream.currSource())
            stream.next(childitem)
            if stream.currIsType("token", "ASSIGN"):
                assign = createItemNode("assignment", stream)
                childitem.addChild(assign)
                stream.next(assign)
                assign.addChild(readExpression(stream))

            item.addChild(childitem)

            # Check whether anothe definition follows, e.g. "var a, b=1, c=4"
            if stream.currIsType("token", "COMMA"):
                stream.next(item)
            else:
                finished = True

        stream.comment(item, True)

    elif not expressionMode and stream.currIsType("reserved", LOOP_KEYWORDS):
        item = readLoop(stream)
    elif not expressionMode and stream.currIsType("reserved", "DO"):
        item = readDoWhile(stream)
    elif not expressionMode and stream.currIsType("reserved", "SWITCH"):
        item = readSwitch(stream)
    elif not expressionMode and stream.currIsType("reserved", "TRY"):
        item = readTryCatch(stream)
    elif not expressionMode and stream.currIsType("token", "LC"):
        item = readBlock(stream)
    elif not expressionMode and stream.currIsType("reserved", "RETURN"):
        item = createItemNode("return", stream)
        stream.next(item)
        # NOTE: The expression after the return keyword is optional
        if not stream.currIsType("token", "SEMICOLON") and not stream.currIsType("token", "RC"):
            item.addListChild("expression", readExpression(stream))
            stream.comment(item, True)
    elif not expressionMode and stream.currIsType("reserved", "THROW"):
        item = createItemNode("throw", stream)
        stream.next(item)
        item.addListChild("expression", readExpression(stream))
        stream.comment(item, True)
    elif stream.currIsType("reserved", "DELETE"):
        # this covers both statement and expression context!
        item = createItemNode("delete", stream)
        item.set("left", True)
        stream.next(item)
        item.addListChild("expression", readExpression(stream))
        stream.comment(item, True)
    elif not expressionMode and stream.currIsType("reserved", "BREAK"):
        item = createItemNode("break", stream)
        stream.next(item)
        # NOTE: The label after the break keyword is optional
        if not stream.hadEolBefore() and stream.currIsType("name"):
            item.set("label", stream.currSource())
            # As the label is an attribute, we need to put following comments into after
            # to differenciate between comments before and after the label
            stream.next(item, True)
    elif not expressionMode and stream.currIsType("reserved", "CONTINUE"):
        item = createItemNode("continue", stream)
        stream.next(item)
        # NOTE: The label after the continue keyword is optional
        if not stream.hadEolBefore() and stream.currIsType("name"):
            item.set("label", stream.currSource())
            stream.next(item, True)

    if not item:
        if stream.currIsType("token", "SEMICOLON") and not expressionMode:
            # This is an empty statement
            item = createItemNode("emptyStatement", stream)
            stream.next(item)
        else:
            if expressionMode:
                expectedDesc = "expression"
            else:
                expectedDesc = "statement"
            raiseSyntaxException(stream.curr(), expectedDesc)

    advanced = False # currently unused - I wanted to use this to detect recursive processing, but it somehow doesn't work
    # check whether this is an operation
    if (stream.currIsType("token", MULTI_TOKEN_OPERATORS) 
    or stream.currIsType("reserved", MULTI_PROTECTED_OPERATORS) 
    or (stream.currIsType("token", SINGLE_RIGHT_OPERATORS) and not stream.hadEolBefore())):
        advanced = True
        # its an operation -> We've already parsed the first operand (in item)
        parsedItem = item

        oper = stream.currDetail()

        item = createItemNode("operation", stream)
        item.addListChild("first", parsedItem)
        item.set("operator", oper)
        stream.next(item)

        if oper in MULTI_TOKEN_OPERATORS or oper in MULTI_PROTECTED_OPERATORS:
            # It's a multi operator -> There must be a second argument
            item.addListChild("second", readExpression(stream))
            if oper == "HOOK":
                # It's a "? :" operation -> There must be a third argument
                stream.expectCurrType("token", "COLON")
                stream.next(item)
                item.addListChild("third", readExpression(stream))

        # Deep scan on single right operators e.g. if(i-- > 4)
        if oper in SINGLE_RIGHT_OPERATORS and stream.currIsType("token", MULTI_TOKEN_OPERATORS) and expressionMode:
            paroper = stream.currDetail()

            paritem = createItemNode("operation", stream)
            paritem.addListChild("first", item)
            paritem.set("operator", paroper)
            stream.next(item)

            if paroper in MULTI_TOKEN_OPERATORS or paroper in MULTI_PROTECTED_OPERATORS:
                # It's a multi operator -> There must be a second argument
                paritem.addListChild("second", readExpression(stream))
                if paroper == "HOOK":
                    # It's a "? :" operation -> There must be a third argument
                    stream.expectCurrType("token", "COLON")
                    stream.next(item)
                    paritem.addListChild("third", readExpression(stream))

            # return parent item
            item = paritem



    # check whether this is a combined statement, e.g. "bla(), i++"
    if stream.currIsType("token", "COMMA"):
        advanced = True
        if not inStatementList:  # only create a list node if this is the beginning
            expressionList = createItemNode("expressionList", stream)
            expressionList.addChild(item)
            while stream.currIsType("token", "COMMA"):
                stream.next(expressionList)
                if expressionMode:
                    expressionList.addChild(readStatement(stream, True, False, True))
                else:
                    expressionList.addChild(readStatement(stream, False, False, True))
            item = expressionList

    # go over the optional semicolon
    if  stream.currIsType("token", "SEMICOLON") and not expressionMode and overrunSemicolon:
        advanced = True
        stream.next(item, True)

    #if expressionMode and not advanced: # we have an item but couldn't use the next token in stream
    if expressionMode and stream.currType() in ATOMS : # we have an item but couldn't use the next token in stream
        # must be an invalid expression
        raiseSyntaxException(stream.curr(), "operator or terminator")


    item.set("eolBefore", eolBefore)
    item.set("breakBefore", breakBefore)

    return item



def currIsIdentifier (stream, allowThis):
    det = stream.currDetail()
    return (stream.currIsType("name") or stream.currIsType("builtin")
        or (stream.currIsType("reserved") and allowThis and det == "THIS")
    )



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
        stream.next(identifier)

        if allowArrays:
            while stream.currIsType("token", "LB"):
                accessor = createItemNode("accessor", stream)
                stream.next(accessor)
                accessor.addChild(identifier)
                accessor.addListChild("key", readExpression(stream))

                stream.expectCurrType("token", "RB")
                stream.next(accessor, True)

                identifier = accessor

        item.addChild(identifier)

        firstIdentifier = False

        if stream.currIsType("token", "DOT"):
            stream.next(item)
        else:
            done = True

    return item



def readObjectOperation(stream, operand, onlyAllowMemberAccess = False):
    if stream.currIsType("token", "DOT"):
        # This is a member accessor (E.g. "bla.blubb")
        item = createItemNode("accessor", stream)
        stream.next(item)
        item.addListChild("left", operand)

        # special mode for constants which should be assigned to an accessor first
        if operand.type == "constant":
            item.addListChild("right", readVariable(stream, False))
            item = readObjectOperation(stream, item)
        else:
            item.addListChild("right", readObjectOperation(stream, readVariable(stream, False)))

    elif stream.currIsType("token", "LP"):
        # This is a function call (E.g. "bla(...)")
        item = createItemNode("call", stream)
        item.addListChild("operand", operand)
        readParamList(item, stream)
        item = readObjectOperation(stream, item)
    elif stream.currIsType("token", "LB"):
        # This is an array access (E.g. "bla[...]")
        item = createItemNode("accessor", stream)
        stream.next(item)
        item.addListChild("identifier", operand)
        item.addListChild("key", readExpression(stream))

        stream.expectCurrType("token", "RB")
        stream.next(item, True)
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

    params = createItemNode("params", stream)
    node.addChild(params)

    stream.next(params)

    firstParam = True
    lastExpr = None
    while not stream.currIsType("token", "RP"):
        if firstParam:
            firstParam = False
        else:
            stream.expectCurrType("token", "COMMA")
            stream.next(lastExpr, True)

        lastExpr = readExpression(stream)
        params.addChild(lastExpr)

    # Has an end defined by the loop above
    # This means that all comments following are after item
    stream.next(params, True)

    return


##
# Parses a block of source code. Most work is delegated to stream.next() and
# readStatement(). Handles opening and closing \"{}\".
#
# @param     stream   TokenStream to parse
# @return             tokenizer.token - next item after the closing \"}\"
#
def readBlock(stream):
    stream.expectCurrType("token", "LC")
    item = createItemNode("block", stream)

    # Iterate through children
    stream.next(item)
    while not stream.currIsType("token", "RC"):
        item.addChild(readStatement(stream))

    # Has an end defined by the loop above
    # This means that all comments following are after item
    stream.next(item, True)

    return item


def readMap(stream):
    stream.expectCurrType("token", "LC")

    item = createItemNode("map", stream)
    stream.next(item)

    # NOTE: We use our own flag for checking whether the array already has entries
    #       and not item.hasChildren(), because item.hasChildren() is also true
    #       when there are comments before the array
    hasEntries = False

    while not stream.currIsType("token", "RC"):
        if hasEntries:
            stream.expectCurrType("token", "COMMA")
            stream.next(item)

        if not currIsIdentifier(stream, True) and not stream.currIsType("string") and not stream.currIsType("number"):
            raiseSyntaxException(stream.curr(), "map key (identifier, string or number)")

        keyvalue = createItemNode("keyvalue", stream)
        keyvalue.set("key", stream.currSource())

        if stream.currIsType("string"):
            keyvalue.set("quote", stream.currDetail())

        stream.next(keyvalue)
        stream.expectCurrType("token", "COLON")
        stream.next(keyvalue, True)
        keyvalue.addListChild("value", readExpression(stream))

        item.addChild(keyvalue)

        hasEntries = True

    # Has an end defined by the loop above
    # This means that all comments following are after item
    stream.next(item, True)

    return item



def readArray(stream):
    stream.expectCurrType("token", "LB")

    item = createItemNode("array", stream)
    stream.next(item)

    # NOTE: We use our own flag for checking whether the array already has entries
    #       and not item.hasChildren(), because item.hasChildren() is also true
    #       when there are comments before the array
    hasEntries = False
    while not stream.currIsType("token", "RB"):
        if hasEntries:
            stream.expectCurrType("token", "COMMA")
            stream.next(item)

        item.addChild(readExpression(stream))
        hasEntries = True

    # Has an end defined by the loop above
    # This means that all comments following are after item
    stream.next(item, True)

    # Support constructs like ["foo", "bar" ].join("")
    item = readObjectOperation(stream, item)

    return item



def readInstantiation(stream):
    stream.expectCurrType("reserved", "NEW")

    item = createItemNode("instantiation", stream)
    stream.next(item)

    # Could be a simple variable or a just-in-time function declaration (closure)
    # Read this as expression
    stmnt = readStatement(stream, True, False, True)
    item.addListChild("expression", stmnt)

    return item



def readLoop(stream):
    stream.expectCurrType("reserved", LOOP_KEYWORDS)

    loopType = stream.currDetail()

    item = createItemNode("loop", stream)
    item.set("loopType", loopType)

    stream.next(item)
    stream.expectCurrType("token", "LP")

    if loopType == "FOR":
        stream.next(item)

        if not stream.currIsType("token", "SEMICOLON"):
            # Read the optional first statement
            first = createItemNode("first", stream)
            item.addChild(first)
            first.addChild(readStatement(stream, expressionMode=False, overrunSemicolon=False))
            stream.comment(first, True)

        if stream.currIsType("token", "SEMICOLON"):
            # It's a for (;;) loop
            item.set("forVariant", "iter")

            stream.next(item)
            if not stream.currIsType("token", "SEMICOLON"):
                # Read the optional second expression
                second = createItemNode("second", stream)
                item.addChild(second)
                second.addChild(readStatement(stream, expressionMode=True, inStatementList=False))
                stream.comment(second, True)

            stream.expectCurrType("token", "SEMICOLON")
            stream.next(item)

            if not stream.currIsType("token", "RP"):
                # Read the optional third statement
                third = createItemNode("third", stream)
                item.addChild(third)
                third.addChild(readStatement(stream, expressionMode=False, overrunSemicolon=False))
                stream.comment(third, True)

        elif stream.currIsType("token", "RP"):
            # It's a for ( in ) loop
            item.set("forVariant", "in")
            pass

        else:
            raiseSyntaxException(stream.curr(), "semicolon or in")

        stream.expectCurrType("token", "RP")

    else:
        expr = createItemNode("expression", stream)
        stream.next(expr)
        expr.addChild(readExpression(stream))
        item.addChild(expr)
        stream.comment(expr, True)
        stream.expectCurrType("token", "RP")

    # comments should be already completed from the above code
    stmnt = createItemNode("statement", stream)
    item.addChild(stmnt)
    stream.next()
    stmnt.addChild(readStatement(stream))

    if loopType == "IF" and stream.currIsType("reserved", "ELSE"):
        elseStmnt = createItemNode("elseStatement", stream)
        item.addChild(elseStmnt)
        stream.next(elseStmnt)
        elseStmnt.addChild(readStatement(stream))

    return item



def readDoWhile(stream):
    stream.expectCurrType("reserved", "DO")

    item = createItemNode("loop", stream)
    item.set("loopType", "DO")
    stream.next(item)

    stmnt = createItemNode("statement", stream)
    item.addChild(stmnt)
    stmnt.addChild(readStatement(stream))

    stream.expectCurrType("reserved", "WHILE")
    stream.next(item)

    stream.expectCurrType("token", "LP")

    expr = createItemNode("expression", stream)
    item.addChild(expr)
    stream.next(expr)

    expr.addChild(readExpression(stream))

    stream.expectCurrType("token", "RP")
    stream.next(item, True)

    return item


def readSwitch(stream):
    stream.expectCurrType("reserved", "SWITCH")

    item = createItemNode("switch", stream)
    item.set("switchType", "case")

    stream.next(item)
    stream.expectCurrType("token", "LP")

    expr = createItemNode("expression", stream)
    stream.next(expr)
    item.addChild(expr)
    expr.addChild(readExpression(stream))

    stream.expectCurrType("token", "RP")
    stream.next(expr, True)

    stream.expectCurrType("token", "LC")
    stmnt = createItemNode("statement", stream)
    item.addChild(stmnt)
    stream.next(stmnt)

    while not stream.currIsType("token", "RC"):
        if stream.currIsType("reserved", "CASE"):
            caseItem = createItemNode("case", stream)
            stream.next(caseItem)
            caseItem.addListChild("expression", readExpression(stream))
            stmnt.addChild(caseItem)

            stream.expectCurrType("token", "COLON")
            stream.next(caseItem, True)

        elif stream.currIsType("reserved", "DEFAULT"):
            defaultItem = createItemNode("default", stream)
            stmnt.addChild(defaultItem)
            stream.next(defaultItem)

            stream.expectCurrType("token", "COLON")
            stream.next(defaultItem, True)

        else:
            raiseSyntaxException(stream.curr(), "case or default")

        while not stream.currIsType("token", "RC") and not stream.currIsType("reserved", "CASE") and not stream.currIsType("reserved", "DEFAULT"):
            stmnt.addChild(readStatement(stream))

    stream.next(stmnt, True)

    return item


def readTryCatch(stream):
    stream.expectCurrType("reserved", "TRY")

    item = createItemNode("switch", stream)
    item.set("switchType", "catch")
    stream.next(item)

    item.addListChild("statement", readStatement(stream))

    while stream.currIsType("reserved", "CATCH"):
        catchItem = createItemNode("catch", stream)
        stream.next(catchItem)

        stream.expectCurrType("token", "LP")

        exprItem = createItemNode("expression", stream)
        catchItem.addChild(exprItem)
        stream.next(exprItem)
        exprItem.addChild(readExpression(stream))

        stream.expectCurrType("token", "RP")
        stream.next(exprItem, True)

        stmnt = createItemNode("statement", stream)
        catchItem.addChild(stmnt)
        stmnt.addChild(readStatement(stream))

        item.addChild(catchItem)

    if stream.currIsType("reserved", "FINALLY"):
        finallyItem = createItemNode("finally", stream)
        stream.next(finallyItem)

        stmnt = createItemNode("statement", stream)
        finallyItem.addChild(stmnt)
        stmnt.addChild(readStatement(stream))

        item.addChild(finallyItem)

    return item


# - Main ----------------------------------------------------------------------

def test(x, program):
    global token, next, tokenStream
    print ">>>", program
    tokenArr = tokenizer.parseStream(program)
    from pprint import pprint
    #pprint (tokenArr)
    tokenStream = TokenStream(tokenArr)
    #next = iter(tokenStream).next
    #token = next()
    tokenStream.next()
    if x == e:
        res = readExpression(tokenStream)
        print res.toXml()
    elif x == s:
        res = readStatement(tokenStream)
        print res.toXml()
    elif x == b:
        res = readBlock(tokenStream)
        print res.toXml()
    else:
        raise RuntimeError("Wrong test parameter: %s" % x)


if __name__ == "__main__":
    import sys, os
    from ecmascript.frontend import tokenizer
    if len(sys.argv)>1:
        arg1 = sys.argv[1]
        p = TreeGenerator()
        if os.path.isfile(arg1):
            text = filetool.read(sys.argv[1])
        else:
            text = arg1
        tokenArr = tokenizer.parseStream(text)
        print p.parse(tokenArr).toXml()
    else:
        execfile (os.path.normpath(os.path.join(__file__, "../../../../test/compiler/treegenerator.py")))
        for t in tests:
            try:
                test(*t)
            except SyntaxException:
                print "PARSE FAILED:", repr(t)

