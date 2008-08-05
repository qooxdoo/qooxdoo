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
from ecmascript.frontend import comment, lang

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


def area():
    global afterArea
    afterArea = True


def divide():
    global afterDivider
    afterDivider = True


def sep():
    global afterBreak
    afterBreak = True


def doc():
    global afterDoc
    afterDoc = True


def nosep():
    global afterBreak
    afterBreak = False


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


def inc_indent():
    global indent
    indent += 1


def dec_indent():
    global indent
    indent -= 1


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


def commentNode(node):
    global pretty

    if not pretty:
        return

    commentText = ""
    commentIsInline = False

    comment = node.getChild("commentsAfter", False)

    if comment and not comment.get("inserted", False):
        for child in comment.children:
            if not child.isFirstChild():
                commentText += " "

            commentText += child.get("text")

            if child.get("detail") == "inline":
                commentIsInline = True

        if commentText != "":
            padding = getInlineCommentPadding(options, child.get("column"))
            if padding:
                commentText = padding + commentText.strip()
            else:
                space()
            ##space()
            write(commentText)

            if commentIsInline:
                line()
            else:
                space()

            comment.set("inserted", True)



def getInlineCommentPadding(options, keepColumn):
    global result

    padding = ""
    lineLength = -1

    # Retaining keepColumn?
    if options.prettypCommentsTrailingKeepColumn:

        # Find length of last line
        posReturn = result[-1].rfind("\n")
        if posReturn == -1:
            posReturn = 0
        lineLength = (len(result[-1]) - posReturn - 1)

        # Work out padding to keep column at same position
        if keepColumn > lineLength:
            padding = " " * (keepColumn - lineLength - 1)

    # Check if preferred comment columns are defined
    if not padding and options.prettypCommentsTrailingCommentCols:

        # Find length of last line, but only if not already done
        if lineLength == -1:
            posReturn = result[-1].rfind("\n")
            if posReturn == -1:
                posReturn = 0
            lineLength = (len(result[-1]) - posReturn - 1)

        # Work out preferred position of text
        for commentCol in options.prettypCommentsTrailingCommentCols:
            if commentCol > (lineLength + 1):   # leave room for a space
                padding = " " * (commentCol - lineLength - 1)
                break

    # If not retaining keepColumn or comment cols not defined or not far enough across then put in fixed padding
    if not padding and options.prettypCommentsInlinePadding:
        padding = options.prettypCommentsInlinePadding
    return padding



def postProcessMap(m):
    if m.get("maxKeyLength", False) != None:
        return

    maxKeyLength = 0
    alignValues = True

    if m.hasChildren():
        for keyvalue in m.children:
            if keyvalue.type != "keyvalue":
                continue

            currKeyLength = len(keyvalue.get("key"))

            if keyvalue.get("quote", False) != None:
                currKeyLength += 2

            if currKeyLength > maxKeyLength:
                maxKeyLength = currKeyLength

            if alignValues and keyvalue.getChild("value").isComplex():
                alignValues = False

    m.set("maxKeyLength", maxKeyLength)
    m.set("alignValues", alignValues)




def inForLoop(node):
    while node:
        if node.type in ["first", "second", "third"] and node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
            return True

        if not node.hasParent():
            return False

        node = node.parent

    return False




def compile(node, opts, enableBreaks=False, enableVerbose=False):
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

    options = opts
    options.prettypIndentString          = eval("'" + options.prettypIndentString + "'")
    options.prettypCommentsInlinePadding = eval("'" + options.prettypCommentsInlinePadding + "'")
                                                              # allow for escapes like "\t"
    # split trailing comment cols into an array
    if (options.prettypCommentsTrailingCommentCols and
        isinstance(options.prettypCommentsTrailingCommentCols, basestring)):
        options.prettypCommentsTrailingCommentCols = [int(column.strip()) for column in options.prettypCommentsTrailingCommentCols.split(",")]
        options.prettypCommentsTrailingCommentCols.sort() # make sure they are ascending!
    # or make sure it's a list of int's
    elif (isinstance(options.prettypCommentsTrailingCommentCols, list) and
        reduce(lambda y,z: y and z,
               [isinstance(x,int) for x in options.prettypCommentsTrailingCommentCols],
               True)):
        options.prettypCommentsTrailingCommentCols.sort() # make sure they are ascending!
    # or pass
    else:
        #raise TypeError, "Unsuitable type for option --pretty-print-comments-trailing-commentCols"
        pass

    indent       = 0
    result       = [u""]
    pretty       = opts.prettyPrint
    verbose      = enableVerbose
    breaks       = enableBreaks
    afterLine    = False
    afterBreak   = False
    afterDoc     = False
    afterDivider = False
    afterArea    = False

    if pretty:
        comment.fill(node)

    compileNode(node,opts)

    return u"".join(result)










def compileNode(node,optns):

    global pretty
    global indent




    #####################################################################################################################
    # Recover styling
    #####################################################################################################################

    if pretty:
        # Recover exclicit breaks
        if node.get("breakBefore", False) and not node.isFirstChild(True):
            sep()

        # Additional explicit break before complex blocks
        if node.hasParent() and not node.isFirstChild(True) and node.parent.type in ["block", "file"] and node.isComplex():
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

            if previous and previous.type in ["case", "default"]:
                inCase = True
            else:
                inCase = False

            inOperation = node.parent.type in ["first", "second", "third"] and node.parent.parent.type == "operation"

            for child in commentsBefore.children:
                docComment = child.get("detail") in ["javadoc", "qtdoc"]
                headComment = child.get("detail") == "header"
                areaComment = child.get("detail") == "area"
                divComment = child.get("detail") == "divider"
                blockComment = child.get("detail") ==  "block"
                singleLineBlock = child.get("detail") != "inline" and child.get("multiline") == False

                if not child.isFirstChild():
                    pass

                elif inCase:
                    pass

                elif singleLineBlock:
                    if child.get("begin"):
                        sep()
                    else:
                        space()

                elif areaComment and not isFirst:
                    area()

                elif divComment and not isFirst:
                    divide()

                elif not isFirst:
                    if docComment:
                        doc()
                    else:
                        if child.get("text") in ("//", "/*"):
                             nosep() # the blank comment provides a blank line, so don't put a separator in
                             line()  # make sure there is a new line after whatever has gone before
                        else:
                             sep()
 

                elif inOperation:
                    sep()

                elif not headComment:
                    line()

                # reindenting first
                text = child.get("text")

                if child.get("detail") == "qtdoc":
                    text = comment.qt2javadoc(text)

                #write(comment.indent(text, INDENTSPACES * indent))
                write(comment.indent(text, optns.prettypIndentString * indent))

                if singleLineBlock:
                    if docComment:
                        line()
                    elif child.get("end"):
                        sep()
                    else:
                        space()

                # separator after divider/head comments and after block comments which are not for documentation
                elif headComment or areaComment or divComment or blockComment:
                    sep()

                else:
                    line()
                    # the next two: bugzilla#454
                    #global result
                    #result += "\n"






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
        if pretty:
            commentText = node.get("text")
            # insert appropriate spaces before and no newline in the case of after comments
            if node.get("connection") == "after":
                noline()
                padding = getInlineCommentPadding(optns, node.get("column"))
                if padding:
                    commentText = padding + commentText.strip()
                else:
                    space()
                ##space()

            ##write(node.get("text"))
            write(commentText)

            # new line after inline comment (for example for syntactical reasons)
            #if (node.get("detail") == "inline") or (node.get("multiline") == False):
            if (node.get("detail") == "inline") or (node.get("end") == True):
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
        if pretty:
            # force double new lines
            if not node.isFirstChild() and not node.getPreviousSibling(True).type == "case":
                sep()
                dec_indent()

            line()

        write("case")
        space()


    #
    # OPEN: DEFAULT
    ##################################

    elif node.type == "default":
        if pretty:
            dec_indent()

            # force double new lines
            if (node.getPreviousSibling(False) and 
                not node.getPreviousSibling(True).type == "case"):
                sep()

        write("default")
        write(":")

        if pretty:
            inc_indent()
            line()






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
        if pretty:
            # If this statement block or the previous try were not complex, be not complex here, too
            if not node.getChild("statement").getChild("block").isComplex() and not node.parent.getChild("statement").getChild("block").isComplex():
                noline()
                space()
            # the next two: bugzilla#454
            if node.getFirstChild().type == "commentsBefore" and not result[-1].endswith("\n"):
                line()

        write("catch")







    #
    # OPEN: MAP
    ##################################

    elif node.type == "map":
        par = node.parent

        if pretty:
            postProcessMap(node)

        if pretty:
            # No break before return statement
            if node.hasParent() and node.parent.type == "expression" and node.parent.parent.type == "return":
                pass

            elif ((node.isComplex() and not (optns.prettypOpenCurlyNewlineBefore in "nN"))
                  or (optns.prettypOpenCurlyNewlineBefore in "aA")):
                line()
                if optns.prettypOpenCurlyIndentBefore:
                    inc_indent()

        write("{")

        if pretty:
            if node.isComplex():
                line()
                if not optns.prettypAlignBlockWithCurlies:
                    inc_indent()

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

        elif keyString in lang.RESERVED or not KEY.match(keyString):
            print "Warning: Auto protect key: %s" % keyString
            keyString = "\"" + keyString + "\""

        if pretty and not node.isFirstChild(True) and not node.hasChild("commentsBefore") and node.getChild("value").isComplex():
            sep()

        write(keyString)
        space(False)

        # Fill with spaces
        # Do this only if the parent is complex (many entries)
        # But not if the value itself is complex
        if pretty and node.parent.isComplex() and node.parent.get("alignValues"):
            write(" " * (node.parent.get("maxKeyLength") - len(keyString)))

        write(":")
        space(False)







    #
    # OPEN: BLOCK
    ##################################

    elif node.type == "block":
        if pretty:
            if ((node.isComplex() and not (optns.prettypOpenCurlyNewlineBefore in "nN"))
                or (optns.prettypOpenCurlyNewlineBefore in "aA")):
                line()
                nl=True
                if optns.prettypOpenCurlyIndentBefore:
                    inc_indent()
            else:
                space()
                nl=False

        write("{")

        if pretty:
            if node.hasChildren():
                line()
                if (not nl) or (nl and not optns.prettypAlignBlockWithCurlies):
                    inc_indent()


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
        if node.hasChild("commentsBefore"):
            pass

        elif pretty:
            if not node.hasChild("block") and not node.hasChild("loop"):
                pass

            elif not node.isComplex():
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
                compileNode(child,optns)









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

            if pretty:
                commentNode(node)

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
            comma()

            if pretty:
                commentNode(node)

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
        if pretty:
            if node.isComplex():
                line()
                if not optns.prettypAlignBlockWithCurlies:
                    dec_indent()

            elif node.hasChildren(True):
                space()

        write("}")

        if pretty:
            #if node.isComplex() and optns.prettypOpenCurlyIndentBefore:
            #    dec_indent()
            if node.hasParent() and node.parent.type == "expression" and node.parent.parent.type == "return":
                pass

            elif ((node.isComplex() and not (optns.prettypOpenCurlyNewlineBefore in "nN")) # means: opening "{" on new line
                or (optns.prettypOpenCurlyNewlineBefore in "aA")):
                if optns.prettypOpenCurlyIndentBefore:
                    dec_indent()




    #
    # CLOSE: SWITCH
    ##################################

    elif node.type == "switch":
        if node.get("switchType") == "case":
            if pretty:
                dec_indent()
                if not options.prettypAlignBlockWithCurlies:
                    dec_indent()
                line()

            write("}")

            if pretty:
                commentNode(node)
                line()
                if optns.prettypOpenCurlyIndentBefore:
                    dec_indent()

        # Force a additinal line feed after each switch/try
        if pretty and not node.isLastChild():
            sep()


    #
    # CLOSE: CASE
    ##################################

    elif node.type == "case":
        write(":")

        if pretty:
            commentNode(node)
            inc_indent()
            line()








    #
    # CLOSE: BLOCK
    ##################################

    elif node.type == "block":
        if pretty and node.hasChildren():
            line()
            if not optns.prettypAlignBlockWithCurlies:
                dec_indent()

        write("}")

        if pretty:
            commentNode(node)

            if node.hasChildren():
                # Newline afterwards
                if node.parent.type == "body" and node.parent.parent.type == "function":

                    # But only when this isn't a function block inside a assignment
                    if node.parent.parent.parent.type in ["right", "params"]:
                        pass

                    elif node.parent.parent.parent.type == "value" and node.parent.parent.parent.parent.type == "keyvalue":
                        pass

                    else:
                        line()

                else:
                    line()

            # to get the next statement after the block aligned with the parent of the block, you have to
            # unindent after "}" if:
            # - the opening "{" was on a new line AND was indented
            #   OR
            # - the opending "{" was inline AND align-with-curlies is active
            if ((node.isComplex()  and not (optns.prettypOpenCurlyNewlineBefore in "nN")) # means: opening "{" on new line
                or (optns.prettypOpenCurlyNewlineBefore in "aA")):
                if optns.prettypOpenCurlyIndentBefore:
                    dec_indent()
            else :
                if optns.prettypAlignBlockWithCurlies:
                    dec_indent()


    #
    # CLOSE: LOOP
    ##################################

    elif node.type == "loop":
        if node.get("loopType") == "DO":
            semicolon()

        if pretty:
            commentNode(node)

            # Force a additinal line feed after each loop
            if not node.isLastChild():
                if node.hasChild("elseStatement"):
                    sep()
                elif node.getChild("statement").hasBlockChildren():
                    sep()
                else:
                    line()


    #
    # CLOSE: FUNCTION
    ##################################

    elif node.type == "function":
        if pretty:
            commentNode(node)

            if not node.isLastChild() and node.hasParent() and node.parent.type in ["block", "file"]:
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

            if pretty:
                commentNode(node)
                line()
                if optns.prettypOpenCurlyIndentBefore:
                    inc_indent()


            write("{")

            if pretty:
                if not options.prettypAlignBlockWithCurlies:
                    inc_indent()


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

                if pretty:
                    commentNode(node)

                    if node.isComplex():
                        line()
                    else:
                        space()

        # Semicolon handling
        elif node.type in ["group", "block", "assignment", "call", "operation", "definitionList", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable", "emptyStatement"]:

            # Default semicolon handling
            if node.parent.type in ["block", "file"]:
                semicolon()

                if pretty:
                    commentNode(node)
                    line()

                    if node.isComplex() and not node.isLastChild():
                        sep()

            # Special handling for switch statements
            elif node.parent.type == "statement" and node.parent.parent.type == "switch" and node.parent.parent.get("switchType") == "case":
                semicolon()

                if pretty:
                    commentNode(node)
                    line()

                    if node.isComplex() and not node.isLastChild():
                        sep()

            # Special handling for loops (e.g. if) without blocks {}
            elif (
                node.parent.type in ["statement", "elseStatement"] and
                not node.parent.hasChild("block") and
                node.parent.parent.type == "loop"
            ):
                semicolon()

                if pretty:
                    commentNode(node)
                    line()

                    if node.isComplex() and not node.isLastChild():
                        sep()


    #
    # CLOSE: OTHER
    ##################################

    if pretty:
        # Rest of the after comments (not inserted previously)
        commentNode(node)



def addCommandLineOptions(parser):
    parser.add_option("--pretty-print-indent-string", metavar="STRING", dest="prettypIndentString", default="  ", help="String used for indenting source code; escapes possible, e.g. \"\\t\" (default: \"  \")")
    parser.add_option("--pretty-print-newline-before-open-curly", dest="prettypOpenCurlyNewlineBefore",
                      type="choice", choices=('a','A','n','N','m','M'), metavar="[aAnNmM]", default="m",
                      help="Defines whether \"{\" will always [aA] or never [nN] be on a new line; the default is mixed [mM] behaviour according to complexity of the enclosed block")
    parser.add_option("--pretty-print-indent-before-open-curly", action="store_true", dest="prettypOpenCurlyIndentBefore", default=False, help="Indent \"{\" (default: False)")
    parser.add_option("--pretty-print-indent-align-block-with-curlies", action="store_true", dest="prettypAlignBlockWithCurlies", default=False, help="Align a block of code with its surrounding curlies (obviously not with the opening curly when it is not on a new line); use in combination with --pretty-print-indent-before-open-curly, otherwise the result might look weird (default: False)")
    parser.add_option("--pretty-print-comments-trailing-keepColumn", action="store_true", dest="prettypCommentsTrailingKeepColumn", default=False, help="Keep column for trailing comments instead of just putting it after text (via pretty-print-inline-comment-padding). If code is too long, either the padding specified in --pretty-print-inline-comment-padding is inserted or the comment is moved to the next column given by --pretty-print-comments-trailing-commentCols (default: False)")
    parser.add_option("--pretty-print-comments-trailing-commentCols", metavar="\"<col1>,<col2>,..,<colN>\"", dest="prettypCommentsTrailingCommentCols", default="", help="Columns for trailing comments as a comma separated list e.g. \"50,70,90\". In this case if code length is less than 49, column 50 will be used; if between 50 and 69, column 70 will be used and so on. These apply if --pretty-print-comments-trailing-keepColumn isn't specified, or if it is specified but the code exceeds the original column (default: \"\")")
    parser.add_option("--pretty-print-inline-comment-padding", metavar="STRING", dest="prettypCommentsInlinePadding", default="  ", help="String used between the end of a statement and a trailing inline comment; escapes possible, e.g. \"\\t\" (default: \"  \"). If --pretty-print-comments-trailing-keepColumn or --pretty-print-comments-trailing-commentCols are set then they take precendence.")

