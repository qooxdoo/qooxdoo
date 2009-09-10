#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Alessandro Sala (asala)
#
################################################################################

import sys, string, re
from ecmascript.frontend import lang

KEY = re.compile("^[A-Za-z0-9_$]+$")


def compileToken(name, compact=False):
    global pretty


    if name in ["INC", "DEC", "TYPEOF"]:
        pass

    elif name in ["INSTANCEOF", "IN"]:
        space()

    elif not compact and pretty:
        space()



    if name == None:
        write("=")

    elif name in ["TYPEOF", "INSTANCEOF", "IN"]:
        write(name.lower())

    else:
        for key in lang.TOKENS:
            if lang.TOKENS[key] == name:
                write(key)



    if name in ["INC", "DEC"]:
        pass

    elif name in ["TYPEOF", "INSTANCEOF", "IN"]:
        space()

    elif not compact and pretty:
        space()


def space(force=True):
    global indent
    global result
    global pretty
    global afterLine
    global afterBreak
    global afterDoc

    if not force and not pretty:
        return

    if afterDoc or afterBreak or afterLine or result[-1].endswith(" ") or result[-1].endswith("\n"):
        return

    result[-1] += " "


def write(txt=""):
    global indent
    global result
    global pretty
    global breaks
    global afterLine
    global afterBreak
    global afterDoc
    global afterDivider
    global afterArea

    # strip remaining whitespaces
    if (afterLine or afterBreak or afterDivider or afterArea) and result[-1].endswith(" "):
        result[-1] = result[-1].rstrip()

    if pretty:
        # handle new line wishes
        if afterArea:
            nr = 5
        elif afterDivider:
            nr = 5
        elif afterDoc:
            nr = 3
        elif afterBreak:
            nr = 2
        elif afterLine:
            nr = 1
        else:
            nr = 0

        while not result[-1].endswith("\n" * nr):
            result[-1] += "\n"

    elif breaks and not result[-1].endswith("\n"):
        if afterArea or afterDivider or afterDoc or afterBreak or afterLine:
            result[-1] += "\n"

    # reset
    afterLine = False
    afterBreak = False
    afterDoc = False
    afterDivider = False
    afterArea = False

    # add indent (if needed)
    if pretty and result[-1].endswith("\n"):
        #result += (" " * (INDENTSPACES * indent))
        result[-1] += (options.prettypIndentString * indent)

    # append given text
    if len(txt)<4:
        result[-1] += txt
    else:
        result.append(txt)


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
    global afterArea
    global afterDoc

    afterLine = False
    afterBreak = False
    afterDivider = False
    afterArea = False
    afterDoc = False


def semicolon():
    global result
    global breaks

    noline()

    if not (result[-1].endswith("\n") or result[-1].endswith(";")):
        write(";")

        if breaks:
            result[-1] += "\n"


def comma():
    global result
    global breaks

    noline()

    if not (result[-1].endswith("\n") or result[-1].endswith(",")):
        write(",")

        if breaks:
            result[-1] += "\n"



def inForLoop(node):
    while node:
        if node.type in ["first", "second", "third"] and node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
            return True

        if not node.hasParent():
            return False

        node = node.parent

    return False



def compileNode(node, opts, rslt, enableBreaks=False, enableVerbose=False):
    global indent
    global result
    global pretty
    global verbose
    global breaks
    global afterLine
    global afterBreak
    global afterDoc
    global afterDivider
    global afterArea
    global options
    
    result = rslt

    result       = [u""]
    pretty       = False
    verbose      = enableVerbose
    breaks       = enableBreaks
    afterLine    = False
    afterBreak   = False
    afterDoc     = False
    afterDivider = False
    afterArea    = False

    return _compileNode(node, opts, result)



def _compileNode(node,optns,result):

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
        pass


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

            # be compact in for-loops
            compact = inForLoop(node)
            compileToken(oper, compact)



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
    # OPEN: VOID
    ##################################

    elif node.type == "void":
        write("void")
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
        write("case")
        space()


    #
    # OPEN: DEFAULT
    ##################################

    elif node.type == "default":
        write("default")
        write(":")



    #
    # OPEN: TRY
    ##################################

    elif node.type == "switch":
        # Additional new line before each switch/try
        if not node.isFirstChild(True) and not node.getChild("commentsBefore", False):
            prev = node.getPreviousSibling(False, True)

            # No separation after case statements
            if prev != None and prev.type in ["case", "default"]:
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
        write("catch")


    #
    # OPEN: MAP
    ##################################

    elif node.type == "map":
        par = node.parent

        write("{")


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

        elif keyString in lang.RESERVED or not KEY.match(keyString):
            print "Warning: Auto protect key: %s" % keyString
            keyString = "\"" + keyString + "\""

        write(keyString)
        space(False)

        write(":")
        space(False)


    #
    # OPEN: BLOCK
    ##################################

    elif node.type == "block":
        write("{")


    #
    # OPEN: LOOP
    ##################################

    elif node.type == "loop":
        # Additional new line before each loop
        if not node.isFirstChild(True) and not node.getChild("commentsBefore", False):
            prev = node.getPreviousSibling(False, True)

            # No separation after case statements
            if prev != None and prev.type in ["case", "default"]:
                pass
            elif node.hasChild("elseStatement") or node.getChild("statement").hasBlockChildren():
                sep()
            else:
                line()

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
                write("while")

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
            # operation (var a = -1)
            if node.parent.get("left", False) == True:
                compileToken(node.parent.get("operator"), True)



    #
    # OPEN: SECOND
    ##################################

    elif node.type == "second":
        # for loop
        if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
            if not node.parent.hasChild("first"):
                write("(;")

        # operation
        elif node.parent.type == "operation":
            if node.isComplex():
                # (?: hook operation)
                if node.parent.get("operator") == "HOOK":
                    sep()
                else:
                    line()



    #
    # OPEN: THIRD
    ##################################

    elif node.type == "third":
        # for loop
        if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
            if not node.parent.hasChild("second"):
                if node.parent.hasChild("first"):
                    write(";")
                    space(False)
                else:
                    write("(;;")

        # operation
        elif node.parent.type == "operation":
            # (?: hook operation)
            if node.parent.get("operator") == "HOOK":
                if node.isComplex():
                    sep()


    #
    # OPEN: STATEMENT
    ##################################

    elif node.type == "statement":
        # for loop
        if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
            if node.parent.get("forVariant") == "iter":
                if not node.parent.hasChild("first") and not node.parent.hasChild("second") and not node.parent.hasChild("third"):
                    write("(;;");

                elif not node.parent.hasChild("second") and not node.parent.hasChild("third"):
                    write(";")

            write(")")

            if not node.hasChild("block"):
                space(False)



    #####################################################################################################################
    # Children content
    #####################################################################################################################

    if node.hasChildren():
        for child in node.children:
            if not node.type in ["commentsBefore", "commentsAfter"]:
                _compileNode(child,optns,result)



    #####################################################################################################################
    # Closing node
    #####################################################################################################################

    #
    # CLOSE: IDENTIFIER
    ##################################

    if node.type == "identifier":
        if node.hasParent() and node.parent.type == "variable" and not node.isLastChild(True):
            write(".")
        elif node.hasParent() and node.parent.type == "label":
            write(":")


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
            noline()
            comma()


    #
    # CLOSE: DEFINITION
    ##################################

    elif node.type == "definition":
        if node.hasParent() and node.parent.type == "definitionList" and not node.isLastChild(True):
            comma()


    #
    # CLOSE: LEFT
    ##################################

    elif node.type == "left":
        if node.hasParent() and node.parent.type == "assignment":
            oper = node.parent.get("operator", False)

            # be compact in for-loops
            compact = inForLoop(node)
            compileToken(oper, compact)






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
        if node.getChildrenLength(True) == 1:
            noline()

        write(")")


    #
    # CLOSE: VOID
    ##################################

    elif node.type == "void":
        if node.getChildrenLength(True) == 1:
            noline()

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
        write("}")


    #
    # CLOSE: SWITCH
    ##################################

    elif node.type == "switch":
        if node.get("switchType") == "case":
            write("}")


    #
    # CLOSE: CASE
    ##################################

    elif node.type == "case":
        write(":")


    #
    # CLOSE: BLOCK
    ##################################

    elif node.type == "block":
        write("}")


    #
    # CLOSE: LOOP
    ##################################

    elif node.type == "loop":
        if node.get("loopType") == "DO":
            semicolon()


    #
    # CLOSE: FUNCTION
    ##################################

    elif node.type == "function":
        pass

    #
    # CLOSE: EXPRESSION
    ##################################

    elif node.type == "expression":
        if node.parent.type == "loop":
            write(")")

            # e.g. a if-construct without a block {}
            if node.parent.getChild("statement").hasChild("block"):
                pass

            elif node.parent.getChild("statement").hasChild("emptyStatement"):
                pass

            elif node.parent.type == "loop" and node.parent.get("loopType") == "DO":
                pass

            else:
                space(False)

        elif node.parent.type == "catch":
            write(")")

        elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
            write(")")

            write("{")


    #
    # CLOSE: FIRST
    ##################################

    elif node.type == "first":
        # for loop
        if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
            if node.parent.get("forVariant") == "iter":
                write(";")

                if node.parent.hasChild("second"):
                    space(False)

        # operation
        elif node.parent.type == "operation" and node.parent.get("left", False) != True:
            oper = node.parent.get("operator")

            # be compact in for loops
            compact = inForLoop(node)
            compileToken(oper, compact)


    #
    # CLOSE: SECOND
    ##################################

    elif node.type == "second":
        # for loop
        if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
            write(";")

            if node.parent.hasChild("third"):
                space(False)

        # operation
        elif node.parent.type == "operation":
            # (?: hook operation)
            if node.parent.get("operator") == "HOOK":
                noline()
                space(False)
                write(":")
                space(False)


    #
    # CLOSE: OTHER
    ##################################

    if node.hasParent() and not node.type in ["comment", "commentsBefore", "commentsAfter"]:

        # Add comma dividers between statements in these parents
        if node.parent.type in ["array", "params", "statementList"]:
            if not node.isLastChild(True):
                comma()

        # Semicolon handling
        elif node.type in ["group", "block", "assignment", "call", "operation", "definitionList", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable", "emptyStatement"]:

            # Default semicolon handling
            if node.parent.type in ["block", "file"]:
                semicolon()

            # Special handling for switch statements
            elif node.parent.type == "statement" and node.parent.parent.type == "switch" and node.parent.parent.get("switchType") == "case":
                semicolon()

            # Special handling for loops (e.g. if) without blocks {}
            elif (
                node.parent.type in ["statement", "elseStatement"] and
                not node.parent.hasChild("block") and
                node.parent.parent.type == "loop"
            ):
                semicolon()



    return result


