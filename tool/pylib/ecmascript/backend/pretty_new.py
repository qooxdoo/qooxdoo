#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2012 1&1 Internet AG, Germany, http://www.1und1.de
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
from ecmascript.frontend import Comment, lang

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
                    str += cls.emit(child)
            if n:
                str += n.closing(node)

            # some other stuff
            if node.hasParent() and not node.type in ["comment", "commentsBefore", "commentsAfter"]:

                # Add comma dividers between statements in these parents
                if node.parent.type in ["array", "params", "expressionList"]:
                    if not node.isLastChild(True):
                        str += Packer.comma(str)
                    else:
                        # close the last child of a file/block-level expressionList with semicolon
                        if node.parent.type == "expressionList" and node.parent.parent.type in ["file", "block"]:
                            str += Packer.semicolon(str)

                # Semicolon handling
                elif node.type in ["group", "block", "assignment", "call", "operation", "var", "return", "break", "continue", "delete", "accessor", "instantiation", "throw", "variable", "emptyStatement"]:

                    # Default semicolon handling
                    if node.parent.type in ["block", "file"]:
                        str += Packer.semicolon(str)

                    # Special handling for switch statements
                    elif node.parent.type == "statement" and node.parent.parent.type == "switch" and node.parent.parent.get("switchType") == "case":
                        str += Packer.semicolon(str)

                    # Special handling for loops (e.g. if) without blocks {}
                    elif (
                        node.parent.type in ["statement", "elseStatement"] and
                        not node.parent.hasChild("block") and
                        node.parent.parent.type == "loop"
                    ):
                        str += Packer.semicolon(str)

            return str

        # tokens -> string
        def opening(self, node):
            raise NotImplementedError("You need to override 'opening' method")

        def closing(self, node):
            raise NotImplementedError("You need to override 'closing' method")

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
            Packer.symbol_table[id] = s
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
        def opening(s, node):         # 's' is 'self'
            r = u''
            return r

        @method(symbol("accessor"))
        def closing(s, node):
            r = u''
            if node.hasParent() and node.parent.type == "variable" and not node.isLastChild(True):
                r += cls.write(".")
            return r


        symbol("array")

        @method(symbol("array"))
        def opening(s, node):
            r = u''
            r += cls.write("[")
            if node.hasChildren(True):
                r += cls.space(False,r)
            return r

        @method(symbol("array"))
        def closing(s, node):
            r = u''
            if node.hasChildren(True):
                r += cls.space(False,r)

            r += cls.write("]")
            return r


        symbol("assignment")

        @method(symbol("assignment"))
        def opening(s, node):
            r = u''
            if node.parent.type == "definition":
                oper = node.get("operator", False)
                # be compact in for-loops
                compact = cls.inForLoop(node)
                r += cls.compileToken(oper, compact)
            return r

        @method(symbol("assignment"))
        def closing(s, node):
            return u""


        symbol("block")

        @method(symbol("block"))
        def opening(s, node):
            return cls.write("{")

        @method(symbol("block"))
        def closing(s, node):
            return cls.write("}")


        symbol("break")

        @method(symbol("break"))
        def opening(s, node):
            r = cls.write("break")
            if node.get("label", False):
                r += cls.space(result=r)
                r += cls.write(node.get("label", False))
            return r

        @method(symbol("break"))
        def closing(s, node):
            return u""


        symbol("call")

        @method(symbol("call"))
        def opening(s, node):
            r = u''
            return r

        @method(symbol("call"))
        def closing(s, node):
            return u""


        symbol("case")

        @method(symbol("case"))
        def opening(s, node):
            r = u''
            r += cls.write("case")
            r += cls.space(result=r)
            return r

        @method(symbol("case"))
        def closing(s, node):
            return cls.write(":")


        symbol("catch")

        @method(symbol("catch"))
        def opening(s, node):
            r = u''
            r += cls.write("catch")
            return r

        @method(symbol("catch"))
        def closing(s, node):
            return u""


        symbol("comment")

        @method(symbol("comment"))
        def opening(s, node):
            r = node.get('text')
            r += '\n'
            return r

        @method(symbol("comment"))
        def closing(s, node):
            return u""


        symbol("commentsAfter")

        @method(symbol("commentsAfter"))
        def opening(s, node):
            #r = []
            #for child in node.children:
            #    r.append(child.get('text'))
            #return u''.join(r)
            return u""

        @method(symbol("commentsAfter"))
        def closing(s, node):
            return u""


        symbol("commentsBefore")

        @method(symbol("commentsBefore"))
        def opening(s, node):
            #r = []
            #for child in node.children:
            #    r.append(child.get('text'))
            #return u''.join(r)
            return u""

        @method(symbol("commentsBefore"))
        def closing(s, node):
            return u""


        symbol("constant")

        @method(symbol("constant"))
        def opening(s, node):
            r = u''
            if node.get("constantType") == "string":
                if node.get("detail") == "singlequotes":
                    r += cls.write("'")
                else:
                    r += cls.write('"')
                r += cls.write(node.get("value"))
                if node.get("detail") == "singlequotes":
                    r += cls.write("'")
                else:
                    r += cls.write('"')
            else:
                r += cls.write(node.get("value"))
            return r

        @method(symbol("constant"))
        def closing(s, node):
            return u""


        symbol("continue")

        @method(symbol("continue"))
        def opening(s, node):
            r = cls.write("continue")
            if node.get("label", False):
                r += cls.space(result=r)
                r += cls.write(node.get("label", False))
            return r

        @method(symbol("continue"))
        def closing(s, node):
            return u""


        symbol("default")

        @method(symbol("default"))
        def opening(s, node):
            r = u''
            r += cls.write("default")
            r += cls.write(":")
            return r

        @method(symbol("default"))
        def closing(s, node):
            return u""


        symbol("definition")

        @method(symbol("definition"))
        def opening(s, node):
            r = u''
            if node.parent.type != "var":
                r += cls.write("var")
                r += cls.space(result=r)
            r += cls.write(node.get("identifier"))
            return r

        @method(symbol("definition"))
        def closing(s, node):
            r = u''
            if node.hasParent() and node.parent.type == "var" and not node.isLastChild(True):
                r += cls.comma(r)
            return r


        symbol("var")

        @method(symbol("var"))
        def opening(s, node):
            r = cls.write("var")
            r += cls.space(result=r)
            return r

        @method(symbol("var"))
        def closing(s, node):
            return u""


        symbol("delete")

        @method(symbol("delete"))
        def opening(s, node):
            r = cls.write("delete")
            r += cls.space(result=r)
            return r

        @method(symbol("delete"))
        def closing(s, node):
            return u""


        symbol("elseStatement")

        @method(symbol("elseStatement"))
        def opening(s, node):
            r = u''
            r += cls.write("else")

            # This is a elseStatement without a block around (a set of {})
            if not node.hasChild("block"):
                r += cls.space(result=r)
            return r

        @method(symbol("elseStatement"))
        def closing(s, node):
            return u""


        symbol("emptyStatement")

        @method(symbol("emptyStatement"))
        def opening(s, node):
            r = u''
            return r

        @method(symbol("emptyStatement"))
        def closing(s, node):
            return u""


        symbol("expression")

        @method(symbol("expression"))
        def opening(s, node):
            r = u''
            if node.parent.type == "loop":
                loopType = node.parent.get("loopType")

                # only do-while loops
                if loopType == "DO":
                    r += cls.write("while")

                # open expression block of IF/WHILE/DO-WHILE/FOR statements
                r += cls.write("(")

            elif node.parent.type == "catch":
                # open expression block of CATCH statement
                r += cls.write("(")

            elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
                # open expression block of SWITCH statement
                r += cls.write("(")
            return r

        @method(symbol("expression"))
        def closing(s, node):
            r = u''
            if node.parent.type == "loop":
                r += cls.write(")")

                # e.g. a if-construct without a block {}
                if node.parent.getChild("statement").hasChild("block"):
                    pass

                elif node.parent.getChild("statement").hasChild("emptyStatement"):
                    pass

                elif node.parent.type == "loop" and node.parent.get("loopType") == "DO":
                    pass

                else:
                    r += cls.space(False,result=r)

            elif node.parent.type == "catch":
                r += cls.write(")")

            elif node.parent.type == "switch" and node.parent.get("switchType") == "case":
                r += cls.write(")")

                r += cls.write("{")
            return r


        symbol("file")

        @method(symbol("file"))
        def opening(s, node):
            return u''

        @method(symbol("file"))
        def closing(s, node):
            return u''


        symbol("finally")

        @method(symbol("finally"))
        def opening(s, node):
            return cls.write("finally")

        @method(symbol("finally"))
        def closing(s, node):
            return u""


        symbol("first")

        @method(symbol("first"))
        def opening(s, node):
            r = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                r += cls.write("(")

            # operation
            elif node.parent.type == "operation":
                # operation (var a = -1)
                if node.parent.get("left", False) == True:
                    r += cls.compileToken(node.parent.get("operator"), True)
            return r

        @method(symbol("first"))
        def closing(s, node):
            r = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                if node.parent.get("forVariant") == "iter":
                    r += cls.write(";")

                    if node.parent.hasChild("second"):
                        r += cls.space(False,result=r)

            # operation
            elif node.parent.type == "operation" and node.parent.get("left", False) != True:
                oper = node.parent.get("operator")

                # be compact in for loops
                compact = cls.inForLoop(node)
                r += cls.compileToken(oper, compact)
            return r


        symbol("function")

        @method(symbol("function"))
        def opening(s, node):
            r = cls.write("function")
            functionName = node.get("name", False)
            if functionName != None:
                r += cls.space(result=r)
                r += cls.write(functionName)
            return r

        @method(symbol("function"))
        def closing(s, node):
            return u""


        symbol("group")

        @method(symbol("group"))
        def opening(s, node):
            return cls.write("(")

        @method(symbol("group"))
        def closing(s, node):
            r = u''
            if node.getChildrenLength(True) == 1:
                cls.noline()

            r += cls.write(")")
            return r


        symbol("identifier")

        @method(symbol("identifier"))
        def opening(s, node):
            name = node.get("name", False)
            if name != None:
                return cls.write(name)
            return u""

        @method(symbol("identifier"))
        def closing(s, node):
            r = u''
            if node.hasParent() and node.parent.type == "variable" and not node.isLastChild(True):
                r += cls.write(".")
            elif node.hasParent() and node.parent.type == "label":
                r += cls.write(":")
            return r


        symbol("instantiation")

        @method(symbol("instantiation"))
        def opening(s, node):
            r = cls.write("new")
            r += cls.space(result=r)
            return r


        @method(symbol("instantiation"))
        def closing(s, node):
            return u""


        symbol("key")

        @method(symbol("key"))
        def opening(s, node):
            r = u''
            if node.parent.type == "accessor":
                r += cls.write("[")
            return r

        @method(symbol("key"))
        def closing(s, node):
            r = u''
            if node.hasParent() and node.parent.type == "accessor":
                r += cls.write("]")
            return r


        symbol("keyvalue")

        @method(symbol("keyvalue"))
        def opening(s, node):
            r = u''
            keyString = node.get("key")
            keyQuote = node.get("quote", False)

            if keyQuote != None:
                # print "USE QUOTATION"
                if keyQuote == "doublequotes":
                    keyString = '"' + keyString + '"'
                else:
                    keyString = "'" + keyString + "'"

            elif keyString in lang.RESERVED or not KEY.match(keyString):
                print "Warning: Auto protect key: %r" % keyString
                keyString = "\"" + keyString + "\""

            r += cls.write(keyString)
            r += cls.space(False,result=r)

            r += cls.write(":")
            r += cls.space(False,result=r)
            return r

        @method(symbol("keyvalue"))
        def closing(s, node):
            r = u''
            if node.hasParent() and node.parent.type == "map" and not node.isLastChild(True):
                cls.noline()
                r += cls.comma(r)
            return r



        symbol("left")

        @method(symbol("left"))
        def opening(s, node):
            r = u''
            return r

        @method(symbol("left"))
        def closing(s, node):
            r = u''
            if node.hasParent() and node.parent.type == "assignment":
                oper = node.parent.get("operator", False)

                # be compact in for-loops
                compact = cls.inForLoop(node)
                r += cls.compileToken(oper, compact)
            return r


        symbol("loop")

        @method(symbol("loop"))
        def opening(s, node):
            r = u''
            # Additional new line before each loop
            if not node.isFirstChild(True) and not node.getChild("commentsBefore", False):
                prev = node.getPreviousSibling(False, True)

                # No separation after case statements
                if prev != None and prev.type in ["case", "default"]:
                    pass
                elif node.hasChild("elseStatement") or node.getChild("statement").hasBlockChildren():
                    cls.sep()
                else:
                    cls.line()

            loopType = node.get("loopType")

            if loopType == "IF":
                r += cls.write("if")
                r += cls.space(False,result=r)

            elif loopType == "WHILE":
                r += cls.write("while")
                r += cls.space(False,result=r)

            elif loopType == "FOR":
                r += cls.write("for")
                r += cls.space(False,result=r)

            elif loopType == "DO":
                r += cls.write("do")
                r += cls.space(False,result=r)

            elif loopType == "WITH":
                r += cls.write("with")
                r += cls.space(False,result=r)

            else:
                print "Warning: Unknown loop type: %s" % loopType
            return r

        @method(symbol("loop"))
        def closing(s, node):
            r = u''
            if node.get("loopType") == "DO":
                r += cls.semicolon()
            return r


        symbol("map")

        @method(symbol("map"))
        def opening(s, node):
            r = u''
            r += cls.write("{")
            return r

        @method(symbol("map"))
        def closing(s, node):
            return cls.write("}")


        symbol("operand")

        @method(symbol("operand"))
        def opening(s, node):
            return u""

        @method(symbol("operand"))
        def closing(s, node):
            return u""


        symbol("operation")

        @method(symbol("operation"))
        def opening(s, node):
            r = u''
            return r

        @method(symbol("operation"))
        def closing(s, node):
            return u""


        symbol("params")

        @method(symbol("params"))
        def opening(s, node):
            r = u''
            cls.noline()
            r += cls.write("(")
            return r

        @method(symbol("params"))
        def closing(s, node):
            return cls.write(")")


        symbol("return")

        @method(symbol("return"))
        def opening(s, node):
            r = cls.write("return")
            if node.hasChildren():
                r += cls.space(result=r)
            return r

        @method(symbol("return"))
        def closing(s, node):
            return u""


        symbol("right")

        @method(symbol("right"))
        def opening(s, node):
            r = u''
            if node.parent.type == "accessor":
                r += cls.write(".")
            return r

        @method(symbol("right"))
        def closing(s, node):
            return u""


        symbol("second")

        @method(symbol("second"))
        def opening(s, node):
            r = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                if not node.parent.hasChild("first"):
                    r += cls.write("(;")

            # operation
            #elif node.parent.type == "operation":
            #    if node.isComplex():
            #        # (?: hook operation)
            #        if node.parent.get("operator") == "HOOK":
            #            cls.sep()
            #        else:
            #            cls.line()

            return r

        @method(symbol("second"))
        def closing(s, node):
            r = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                r += cls.write(";")

                if node.parent.hasChild("third"):
                    r += cls.space(False,result=r)

            # operation
            elif node.parent.type == "operation":
                # (?: hook operation)
                if node.parent.get("operator") == "HOOK":
                    cls.noline()
                    r += cls.space(False,result=r)
                    r += cls.write(":")
                    r += cls.space(False,result=r)
            return r


        symbol("statement")

        @method(symbol("statement"))
        def opening(s, node):
            r = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                if node.parent.get("forVariant") == "iter":
                    if not node.parent.hasChild("first") and not node.parent.hasChild("second") and not node.parent.hasChild("third"):
                        r += cls.write("(;;");

                    elif not node.parent.hasChild("second") and not node.parent.hasChild("third"):
                        r += cls.write(";")

                r += cls.write(")")

                if not node.hasChild("block"):
                    r += cls.space(False,result=r)
            return r

        @method(symbol("statement"))
        def closing(s, node):
            return u""


        symbol("switch")

        @method(symbol("switch"))
        def opening(s, node):
            r = u''
            # Additional new line before each switch/try
            if not node.isFirstChild(True) and not node.getChild("commentsBefore", False):
                prev = node.getPreviousSibling(False, True)
                # No separation after case statements
                if prev != None and prev.type in ["case", "default"]:
                    pass
                else:
                    cls.sep()
            if node.get("switchType") == "catch":
                r += cls.write("try")
            elif node.get("switchType") == "case":
                r += cls.write("switch")
            return r

        @method(symbol("switch"))
        def closing(s, node):
            r = u''
            if node.get("switchType") == "case":
                r += cls.write("}")
            return r


        symbol("third")

        @method(symbol("third"))
        def opening(s, node):
            r = u''
            # for loop
            if node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                if not node.parent.hasChild("second"):
                    if node.parent.hasChild("first"):
                        r += cls.write(";")
                        r += cls.space(False,result=r)
                    else:
                        r += cls.write("(;;")

            # operation
            #elif node.parent.type == "operation":
            #    # (?: hook operation)
            #    if node.parent.get("operator") == "HOOK":
            #        if node.isComplex():
            #            cls.sep()

            return r

        @method(symbol("third"))
        def closing(s, node):
            return u""


        symbol("throw")

        @method(symbol("throw"))
        def opening(s, node):
            r = cls.write("throw")
            r += cls.space(result=r)
            return r


        @method(symbol("throw"))
        def closing(s, node):
            return u""


        symbol("variable")

        @method(symbol("variable"))
        def opening(s, node):
            r = u''
            return r

        @method(symbol("variable"))
        def closing(s, node):
            return u""


        symbol("void")

        @method(symbol("void"))
        def opening(s, node):
            r = u''
            r += cls.write("void")
            r += cls.write("(")
            return r

        @method(symbol("void"))
        def closing(s, node):
            r = u''
            if node.getChildrenLength(True) == 1:
                cls.noline()

            r += cls.write(")")
            return r

    #end:init_symtab()


    # --------------------------------------------------------------------------
    # -- Helper for symbol methods ---------------------------------------------
    # --------------------------------------------------------------------------


    @staticmethod
    def compileToken(name, compact=False):
        s = u''

        if name in ["INC", "DEC", "TYPEOF"]:
            pass

        elif name in ["INSTANCEOF", "IN"]:
            s += Packer.space(result=s)

        elif not compact and pretty:
            s += Packer.space(result=s)

        if name == None:
            s += Packer.write("=")

        elif name in ["TYPEOF", "INSTANCEOF", "IN"]:
            s += Packer.write(name.lower())

        else:
            for key in lang.TOKENS:
                if lang.TOKENS[key] == name:
                    s += Packer.write(key)

        if name in ["INC", "DEC"]:
            pass

        elif name in ["TYPEOF", "INSTANCEOF", "IN"]:
            s += Packer.space(result=s)

        elif not compact and pretty:
            s += Packer.space(result=s)

        return s


    @staticmethod
    def space(force=True, result=u''):
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


    @staticmethod
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


    @staticmethod
    def sep():
        global afterBreak
        afterBreak = True


    @staticmethod
    def line():
        global afterLine
        afterLine = True


    @staticmethod
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


    @staticmethod
    def semicolon(result=u''):
        global breaks
        s = u''

        Packer.noline()

        if not result or not (result.endswith("\n") or result.endswith(";")):
            s += Packer.write(";")

            if breaks:
                s += "\n"
        return s


    @staticmethod
    def comma(result):
        global breaks
        s = u''

        Packer.noline()

        if not result or not (result.endswith("\n") or result.endswith(",")):
            s += Packer.write(",")

            if breaks:
                result += "\n"

        return s


    @staticmethod
    def inForLoop(node):
        while node:
            if node.type in ["first", "second", "third"] and node.parent.type == "loop" and node.parent.get("loopType") == "FOR":
                return True

            if not node.hasParent():
                return False

            node = node.parent

        return False

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

        options = opts
        opts.prettypIndentString          = eval("'" + opts.prettypIndentString + "'")
        opts.prettypCommentsInlinePadding = eval("'" + opts.prettypCommentsInlinePadding + "'")
                                                                  # allow for escapes like "\t"
        # split trailing comment cols into an array
        if (opts.prettypCommentsTrailingCommentCols and
            isinstance(opts.prettypCommentsTrailingCommentCols, basestring)):
            opts.prettypCommentsTrailingCommentCols = [int(column.strip()) for column in opts.prettypCommentsTrailingCommentCols.split(",")]
            opts.prettypCommentsTrailingCommentCols.sort() # make sure they are ascending!
        # or make sure it's a list of int's
        elif (isinstance(opts.prettypCommentsTrailingCommentCols, list) and
            reduce(lambda y,z: y and z,
                   [isinstance(x,int) for x in opts.prettypCommentsTrailingCommentCols],
                   True)):
            opts.prettypCommentsTrailingCommentCols.sort() # make sure they are ascending!
        # or pass
        else:
            #raise TypeError, "Unsuitable type for option --pretty-print-comments-trailing-commentCols"
            pass

        if opts.prettypCommentsBlockAdd:
            Comment.fill(node)

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

        return [ Packer.symbol_base.emit(node) ]  # caller expects []


def prettyNode(tree, options, result):
    result =  Packer().serializeNode(tree, options, result)
    return result



def defaultOptions(optns):
    optns.prettyPrint = True  # turn on pretty-printing
    optns.prettypCommentsBlockAdd  = True  # comment filling
    optns.prettypIndentString      = "  "   # general indent string
    optns.prettypOpenCurlyNewlineBefore = 'm'  # mixed, dep. on complexity
    optns.prettypOpenCurlyIndentBefore  = False  # indent curly on a new line
    optns.prettypAlignBlockWithCurlies  = False  # put block on same column as curlies
    optns.prettypCommentsTrailingCommentCols = ''  # put trailing comments on fixed columns
    optns.prettypCommentsTrailingKeepColumn  = False  # fix trailing comment on column of original text
    optns.prettypCommentsInlinePadding  = '  '   # space between end of code and beginning of comment
    return optns
