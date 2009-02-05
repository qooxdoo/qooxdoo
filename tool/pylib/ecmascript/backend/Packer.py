#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import sys, string, re
from ecmascript.frontend import lang

KEY = re.compile("^[A-Za-z0-9_$]+$")

class Packer(object):

    symbol_table = {}

    def __init__(self):
        Packer.init_symtab()

    # -- class symbol_base -----------------------------------------------------

    class symbol_base(object):

        @classmethod
        def emit(cls, node):
            str = u""
            n   = None
            if node.type in Packer.symbol_table:
                n = Packer.symbol_table[node.type]()
                str += n.opening(node)
            if node.hasChildren():
                for child in node.children:
                    if not node.type in ["commentsBefore", "commentsAfter"]:
                        str += cls.emit(child)
            if n:
                str += n.closing(node)

            # some other stuff
            if node.hasParent() and not node.type in ["comment", "commentsBefore", "commentsAfter"]:

                # Add comma dividers between statements in these parents
                if node.parent.type in ["array", "params", "statementList"]:
                    if not node.isLastChild(True):
                        str += comma(str)

                # Semicolon handling
                elif node.type in ["group", "block", "assignment", "call", "operation", "definitionList", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable", "emptyStatement"]:

                    # Default semicolon handling
                    if node.parent.type in ["block", "file"]:
                        str += semicolon(str)

                    # Special handling for switch statements
                    elif node.parent.type == "statement" and node.parent.parent.type == "switch" and node.parent.parent.get("switchType") == "case":
                        str += semicolon(str)

                    # Special handling for loops (e.g. if) without blocks {}
                    elif (
                        node.parent.type in ["statement", "elseStatement"] and
                        not node.parent.hasChild("block") and
                        node.parent.parent.type == "loop"
                    ):
                        str += semicolon(str)

            return str

        # tokens -> string
        def opening(self, node):
            raise RuntimeError("You need to override 'opening' method")

        def closing(self, node):
            raise RuntimeError("You need to override 'closing' method")

    # -- end symbol_base -------------------------------------------------------


    # -- class factory ------------------

    @staticmethod
    def symbol(id, bp=0):
        try:
            s = Packer.symbol_table[id]
        except KeyError:
            class s(Packer.symbol_base):
                pass
            s.__name__ = "symbol-" + id # for debugging
            s.id = id
            s.value = None
            s.lbp = bp
            Packer.symbol_table[id] = s
        else:
            s.lbp = max(bp, s.lbp)
        return s

    # decorator

    @staticmethod
    def method(s):
        assert issubclass(s, Packer.symbol_base)
        def bind(fn):
            setattr(s, fn.__name__, fn)
        return bind

    # - Grammar ----------------------------------------------------------------

    @classmethod
    def init_symtab(cls):
        symbol = cls.symbol
        method = cls.method

        symbol("accessor")

        @method(symbol("accessor"))
        def opening(self, node):
            s = u''
            return s

        @method(symbol("accessor"))
        def closing(self, node):
            s = u''
            if node.hasParent() and node.parent.type == "variable" and not node.isLastChild(True):
                s += write(".")
            return s


        symbol("array")

        @method(symbol("array"))
        def opening(self, node):
            s = u''
            s += write("[")
            if node.hasChildren(True):
                s += space(False,s)
            return s

        @method(symbol("array"))
        def closing(self, node):
            s = u''
            if node.hasChildren(True):
                s += space(False,s)

            s += write("]")
            return s


        symbol("assignment")

        @method(symbol("assignment"))
        def opening(self, node):
            s = u''
            if node.parent.type == "definition":
                oper = node.get("operator", False)
                # be compact in for-loops
                compact = inForLoop(node)
                s += compileToken(oper, compact)
            return s

        @method(symbol("assignment"))
        def closing(self, node):
            return u""


        symbol("block")

        @method(symbol("block"))
        def opening(self, node):
            return write("{")

        @method(symbol("block"))
        def closing(self, node):
            return write("}")


        symbol("break")

        @method(symbol("break"))
        def opening(self, node):
            s = write("break")
            if node.get("label", False):
                s += space(result=s)
                s += write(node.get("label", False))
            return s

        @method(symbol("break"))
        def closing(self, node):
            return u""


        symbol("call")

        @method(symbol("call"))
        def opening(self, node):
            s = u''
            return s

        @method(symbol("call"))
        def closing(self, node):
            return u""


        symbol("case")

        @method(symbol("case"))
        def opening(self, node):
            s = u''
            s += write("case")
            s += space(result=s)
            return s

        @method(symbol("case"))
        def closing(self, node):
            return write(":")


        symbol("catch")

        @method(symbol("catch"))
        def opening(self, node):
            s = u''
            s += write("catch")
            return s

        @method(symbol("catch"))
        def closing(self, node):
            return u""


        symbol("comment")

        @method(symbol("comment"))
        def opening(self, node):
            s = u''
            return s

        @method(symbol("comment"))
        def closing(self, node):
            return u""


        symbol("commentsAfter")

        @method(symbol("commentsAfter"))
        def opening(self, node):
            s = u''
            return s

        @method(symbol("commentsAfter"))
        def closing(self, node):
            return u""


        symbol("commentsBefore")

        @method(symbol("commentsBefore"))
        def opening(self, node):
            s = u''
            return s

        @method(symbol("commentsBefore"))
        def closing(self, node):
            return u""


        symbol("constant")

        @method(symbol("constant"))
        def opening(self, node):
            s = u''
            if node.get("constantType") == "string":
                if node.get("detail") == "singlequotes":
                    s += write("'")
                else:
                    s += write('"')
                s += write(node.get("value"))
                if node.get("detail") == "singlequotes":
                    s += write("'")
                else:
                    s += write('"')
            else:
                s += write(node.get("value"))
            return s

        @method(symbol("constant"))
        def closing(self, node):
            return u""


        symbol("continue")

        @method(symbol("continue"))
        def opening(self, node):
            s = write("continue")
            if node.get("label", False):
                s += space(result=s)
                s += write(node.get("label", False))
            return s

        @method(symbol("continue"))
        def closing(self, node):
            return u""


        symbol("default")

        @method(symbol("default"))
        def opening(self, node):
            s = u''
            s += write("default")
            s += write(":")
            return s

        @method(symbol("default"))
        def closing(self, node):
            return u""


        symbol("definition")

        @method(symbol("definition"))
        def opening(self, node):
            s = u''
            if node.parent.type != "definitionList":
                s += write("var")
                s += space(result=s)
            s += write(node.get("identifier"))
            return s

        @method(symbol("definition"))
        def closing(self, node):
            s = u''
            if node.hasParent() and node.parent.type == "definitionList" and not node.isLastChild(True):
                s += comma(s)
            return s


        symbol("definitionList")

        @method(symbol("definitionList"))
        def opening(self, node):
            s = write("var")
            s += space(result=s)
            return s

        @method(symbol("definitionList"))
        def closing(self, node):
            return u""


        symbol("delete")

        @method(symbol("delete"))
        def opening(self, node):
            s = write("delete")
            s += space(result=s)
            return s

        @method(symbol("delete"))
        def closing(self, node):
            return u""


        symbol("elseStatement")

        @method(symbol("elseStatement"))
        def opening(self, node):
            s = u''
            s += write("else")

            # This is a elseStatement without a block around (a set of {})
            if not node.hasChild("block"):
                s += space(result=s)
            return s

        @method(symbol("elseStatement"))
        def closing(self, node):
            return u""


        symbol("emptyStatement")

        @method(symbol("emptyStatement"))
        def opening(self, node):
            s = u''
            return s

        @method(symbol("emptyStatement"))
        def closing(self, node):
            return u""


        symbol("expression")

        @method(symbol("expression"))
        def opening(self, node):
            s = u''
            if node.parent.type == "loop":
                loopType = node.parent.get("loopType")

                # only do-while loops
                if loopType == "DO":
                    s += write("while")

                # open expression block of IF/WHILE/DO-WHILE/FOR statements
                s += write("(")

            elif node.parent.type == "catch":
                # open expression block of CATCH statement
                s += write("(")

            elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
                # open expression block of SWITCH statement
                s += write("(")
            return s

        @method(symbol("expression"))
        def closing(self, node):
            s = u''
            if node.parent.type == "loop":
                s += write(")")

                # e.g. a if-construct without a block {}
                if node.parent.getChild("statement").hasChild("block"):
                    pass

                elif node.parent.getChild("statement").hasChild("emptyStatement"):
                    pass

                elif node.parent.type == "loop" and node.parent.get("loopType") == "DO":
                    pass

                else:
                    s += space(False,result=s)

            elif node.parent.type == "catch":
                s += write(")")

            elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
                s += write(")")

                s += write("{")
            return s


        symbol("file")

        @method(symbol("file"))
        def opening(self, node):
            return u''

        @method(symbol("file"))
        def closing(self, node):
            return u''


        symbol("finally")

        @method(symbol("finally"))
        def opening(self, node):
            return write("finally")

        @method(symbol("finally"))
        def closing(self, node):
            return u""


        symbol("first")

        @method(symbol("first"))
        def opening(self, node):
            s = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                s += write("(")

            # operation
            elif node.parent.type == "operation":
                # operation (var a = -1)
                if node.parent.get("left", False) == True:
                    s += compileToken(node.parent.get("operator"), True)
            return s

        @method(symbol("first"))
        def closing(self, node):
            s = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                if node.parent.get("forVariant") == "iter":
                    s += write(";")

                    if node.parent.hasChild("second"):
                        s += space(False,result=s)

            # operation
            elif node.parent.type == "operation" and node.parent.get("left", False) != True:
                oper = node.parent.get("operator")

                # be compact in for loops
                compact = inForLoop(node)
                s += compileToken(oper, compact)
            return s


        symbol("function")

        @method(symbol("function"))
        def opening(self, node):
            s = write("function")
            functionName = node.get("name", False)
            if functionName != None:
                s += space(result=s)
                s += write(functionName)
            return s

        @method(symbol("function"))
        def closing(self, node):
            return u""


        symbol("group")

        @method(symbol("group"))
        def opening(self, node):
            return write("(")

        @method(symbol("group"))
        def closing(self, node):
            s = u''
            if node.getChildrenLength(True) == 1:
                noline()

            s += write(")")
            return s


        symbol("identifier")

        @method(symbol("identifier"))
        def opening(self, node):
            name = node.get("name", False)
            if name != None:
                return write(name)
            return u""

        @method(symbol("identifier"))
        def closing(self, node):
            s = u''
            if node.hasParent() and node.parent.type == "variable" and not node.isLastChild(True):
                s += write(".")
            elif node.hasParent() and node.parent.type == "label":
                s += write(":")
            return s


        symbol("instantiation")

        @method(symbol("instantiation"))
        def opening(self, node):
            s = write("new")
            s += space(result=s)
            return s


        @method(symbol("instantiation"))
        def closing(self, node):
            return u""


        symbol("key")

        @method(symbol("key"))
        def opening(self, node):
            s = u''
            if node.parent.type == "accessor":
                s += write("[")
            return s

        @method(symbol("key"))
        def closing(self, node):
            s = u''
            if node.hasParent() and node.parent.type == "accessor":
                s += write("]")
            return s


        symbol("keyvalue")

        @method(symbol("keyvalue"))
        def opening(self, node):
            s = u''
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

            s += write(keyString)
            s += space(False,result=s)

            s += write(":")
            s += space(False,result=s)
            return s

        @method(symbol("keyvalue"))
        def closing(self, node):
            s = u''
            if node.hasParent() and node.parent.type == "map" and not node.isLastChild(True):
                noline()
                s += comma(s)
            return s



        symbol("left")

        @method(symbol("left"))
        def opening(self, node):
            s = u''
            return s

        @method(symbol("left"))
        def closing(self, node):
            s = u''
            if node.hasParent() and node.parent.type == "assignment":
                oper = node.parent.get("operator", False)

                # be compact in for-loops
                compact = inForLoop(node)
                s += compileToken(oper, compact)
            return s


        symbol("loop")

        @method(symbol("loop"))
        def opening(self, node):
            s = u''
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
                s += write("if")
                s += space(False,result=s)

            elif loopType == "WHILE":
                s += write("while")
                s += space(False,result=s)

            elif loopType == "FOR":
                s += write("for")
                s += space(False,result=s)

            elif loopType == "DO":
                s += write("do")
                s += space(False,result=s)

            elif loopType == "WITH":
                s += write("with")
                s += space(False,result=s)

            else:
                print "Warning: Unknown loop type: %s" % loopType
            return s

        @method(symbol("loop"))
        def closing(self, node):
            s = u''
            if node.get("loopType") == "DO":
                s += semicolon()
            return s


        symbol("map")

        @method(symbol("map"))
        def opening(self, node):
            s = u''
            s += write("{")
            return s

        @method(symbol("map"))
        def closing(self, node):
            return write("}")


        symbol("operand")

        @method(symbol("operand"))
        def opening(self, node):
            return u""

        @method(symbol("operand"))
        def closing(self, node):
            return u""


        symbol("operation")

        @method(symbol("operation"))
        def opening(self, node):
            s = u''
            return s

        @method(symbol("operation"))
        def closing(self, node):
            return u""


        symbol("params")

        @method(symbol("params"))
        def opening(self, node):
            s = u''
            noline()
            s += write("(")
            return s

        @method(symbol("params"))
        def closing(self, node):
            return write(")")


        symbol("return")

        @method(symbol("return"))
        def opening(self, node):
            s = write("return")
            if node.hasChildren():
                s += space(result=s)
            return s

        @method(symbol("return"))
        def closing(self, node):
            return u""


        symbol("right")

        @method(symbol("right"))
        def opening(self, node):
            s = u''
            if node.parent.type == "accessor":
                s += write(".")
            return s

        @method(symbol("right"))
        def closing(self, node):
            return u""


        symbol("second")

        @method(symbol("second"))
        def opening(self, node):
            s = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                if not node.parent.hasChild("first"):
                    s += write("(;")

            # operation
            elif node.parent.type == "operation":
                if node.isComplex():
                    # (?: hook operation)
                    if node.parent.get("operator") == "HOOK":
                        sep()
                    else:
                        line()
            return s

        @method(symbol("second"))
        def closing(self, node):
            s = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                s += write(";")

                if node.parent.hasChild("third"):
                    s += space(False,result=s)

            # operation
            elif node.parent.type == "operation":
                # (?: hook operation)
                if node.parent.get("operator") == "HOOK":
                    noline()
                    s += space(False,result=s)
                    s += write(":")
                    s += space(False,result=s)
            return s


        symbol("statement")

        @method(symbol("statement"))
        def opening(self, node):
            s = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                if node.parent.get("forVariant") == "iter":
                    if not node.parent.hasChild("first") and not node.parent.hasChild("second") and not node.parent.hasChild("third"):
                        s += write("(;;");

                    elif not node.parent.hasChild("second") and not node.parent.hasChild("third"):
                        s += write(";")

                s += write(")")

                if not node.hasChild("block"):
                    s += space(False,result=s)
            return s

        @method(symbol("statement"))
        def closing(self, node):
            return u""


        symbol("switch")

        @method(symbol("switch"))
        def opening(self, node):
            s = u''
            # Additional new line before each switch/try
            if not node.isFirstChild(True) and not node.getChild("commentsBefore", False):
                prev = node.getPreviousSibling(False, True)
                # No separation after case statements
                if prev != None and prev.type in ["case", "default"]:
                    pass
                else:
                    sep()
            if node.get("switchType") == "catch":
                s += write("try")
            elif node.get("switchType") == "case":
                s += write("switch")
            return s

        @method(symbol("switch"))
        def closing(self, node):
            s = u''
            if node.get("switchType") == "case":
                s += write("}")
            return s


        symbol("third")

        @method(symbol("third"))
        def opening(self, node):
            s = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                if not node.parent.hasChild("second"):
                    if node.parent.hasChild("first"):
                        s += write(";")
                        s += space(False,result=s)
                    else:
                        s += write("(;;")

            # operation
            elif node.parent.type == "operation":
                # (?: hook operation)
                if node.parent.get("operator") == "HOOK":
                    if node.isComplex():
                        sep()
            return s

        @method(symbol("third"))
        def closing(self, node):
            return u""


        symbol("throw")

        @method(symbol("throw"))
        def opening(self, node):
            s = write("throw")
            s += space(result=s)
            return s


        @method(symbol("throw"))
        def closing(self, node):
            return u""


        symbol("variable")

        @method(symbol("variable"))
        def opening(self, node):
            s = u''
            return s

        @method(symbol("variable"))
        def closing(self, node):
            return u""


        symbol("void")

        @method(symbol("void"))
        def opening(self, node):
            s = u''
            s += write("void")
            s += write("(")
            return s

        @method(symbol("void"))
        def closing(self, node):
            s = u''
            if node.getChildrenLength(True) == 1:
                noline()

            s += write(")")
            return s

    #end:init_symtab()


    # --------------------------------------------------------------------------
    # -- Interface Methods -----------------------------------------------------
    # --------------------------------------------------------------------------


    # This was the old 'compileNode' interface method

    @staticmethod
    def serializeNode(node, opts, rslt, enableBreaks=False, enableVerbose=False):
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

        return [ Packer.symbol_base.emit(node) ]  # caller expects []



if True:

    # --------------------------------------------------------------------------
    # -- Helper for symbol methods ---------------------------------------------
    # --------------------------------------------------------------------------


    def compileToken(name, compact=False):
        s = u''

        if name in ["INC", "DEC", "TYPEOF"]:
            pass

        elif name in ["INSTANCEOF", "IN"]:
            s += space(result=s)

        elif not compact and pretty:
            s += space(result=s)

        if name == None:
            s += write("=")

        elif name in ["TYPEOF", "INSTANCEOF", "IN"]:
            s += write(name.lower())

        else:
            for key in lang.TOKENS:
                if lang.TOKENS[key] == name:
                    s += write(key)

        if name in ["INC", "DEC"]:
            pass

        elif name in ["TYPEOF", "INSTANCEOF", "IN"]:
            s += space(result=s)

        elif not compact and pretty:
            s += space(result=s)

        return s


    def space(force=True, result=u''):
        global indent
        global pretty
        global afterLine
        global afterBreak
        global afterDoc
        s = u''

        if not force and not pretty:
            return s

        if afterDoc or afterBreak or afterLine or result and (result.endswith(" ") or result.endswith("\n")):
            return s
        else:
            return u' '


    def write(txt=u""):
        result = u""
        global breaks
        global afterLine
        global afterBreak
        global afterDoc
        global afterDivider
        global afterArea

        if breaks:
            if afterArea or afterDivider or afterDoc or afterBreak or afterLine:
                result += "\n"

        # reset
        afterLine = False
        afterBreak = False
        afterDoc = False
        afterDivider = False
        afterArea = False

        result += txt

        return result


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


    def semicolon(result=u''):
        global breaks
        s = u''

        noline()

        if not result or not (result.endswith("\n") or result.endswith(";")):
            s += write(";")

            if breaks:
                s += "\n"
        return s


    def comma(result):
        global breaks
        s = u''

        noline()

        if not result or not (result.endswith("\n") or result.endswith(",")):
            s += write(",")

            if breaks:
                result += "\n"

        return s



    def inForLoop(node):
        while node:
            if node.type in ["first", "second", "third"] and node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                return True

            if not node.hasParent():
                return False

            node = node.parent

        return False

