#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
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

##
# A variant of the classical treegenerator.py that uses TDOP parsing for
# efficiency and correct precedences, delivering an improved syntax tree.
#
# Part of this code is based on Frederik Lundh's article about TDOP parsing, which
# is at http://effbot.org/zone/simple-top-down-parsing.htm and is
#                  Copyright (c) 1995-2008 by Fredrik Lundh
# See http://effbot.org/zone/copyright.htm for accompanying license text
#
# Part of this code is inspired by Douglas Crockford's article about TDOP parsing
# which is at http://javascript.crockford.com/tdop/tdop.html
# Since Douglas' code is in Javascript, the code here is at times a re-formulation
# of his code in Python (much like Frederik did in his article). Since neither
# anywhere on his web site, nor in the code files accompanying the article I
# could find any kind of copyright notice, I believe it is fine to use his code
# in such a manner. Also, O'Reilly's "Beautiful Code", edited by Andy Oram and
# Greg Wilson, O'Reilly Media Inc. 2007, which reproduces Douglas' online
# article verbatim, states that readers are free to use the code from the book
# for their own programming without prior permission (p.xx).
##

import sys, os, re, types, string
from ecmascript.frontend.SyntaxException import SyntaxException
from ecmascript.frontend.tree            import Node
from ecmascript.frontend.Scanner         import IterObject, LQueue, is_last_escaped
from misc                                import filetool

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

StmntTerminatorTokens = ("eol", ";")

##
# the main purpose of this class is to instantiate parser symbol objects from
# low-level tokens
class TokenStream(IterObject):

    def __init__(self, inData):
        self.line       = 0
        self.spos       = 0  # current char pos
        self.sol        = 0  # last start-of-line char pos
        super(TokenStream, self).__init__(inData)

    def resetIter(self):
        self.tokenStream= LQueue(iter(self.inData))
        self.tok_stream = iter(self.tokenStream)
        super(TokenStream, self).resetIter()

    def peek(self, n=1):
        "peek n tokens ahead"
        toks = []
        cnt  = 0

        # get the desired token
        while cnt < n:
            t = self.tok_stream.next()
            toks.append(t)
            if t['type'] == "eof":
                break
            while self._nonGrammaticalToken(t):
                t = self.tok_stream.next()
                toks.append(t)
            cnt += 1

        # put all retrieved tokens back
        for t in toks[::-1]:
            self.tokenStream.putBack(t)

        return self._symbolFromToken(Token(toks[-1]))

    def _nonGrammaticalToken(self, tok):
        return tok['type'] in ['white', 'comment', 'eol']


    def _symbolFromToken(self, tok):
        s = None

        # TODO: Stuff for another refac:
        # The following huge dispatch could be avoided if the tokenizer already
        # provided the tokens with the right attributes (esp. name, detail).

        # tok isinstanceof Token()
        if (tok.name == "white" # TODO: 'white'?!
            or tok.name == 'comment'):
            pass
        elif tok.name == "eof":
            symbol = symbol_table.get("eof")
            s = symbol()
            s.value = ""
        elif tok.name == "eol":
            self.line += 1                  # increase line count
            self.sol  = tok.spos + tok.len  # char pos of next line start
            self.spos = tok.spos
            pass # don't yield this (yet)
            #s = symbol_table.get("eol")()
        # 'operation' nodes
        elif tok.detail in (
            MULTI_TOKEN_OPERATORS
            + MULTI_PROTECTED_OPERATORS
            + SINGLE_RIGHT_OPERATORS
            + SINGLE_LEFT_OPERATORS
            ):
            s = symbol_table[tok.value]()
            s.type = "operation"
            s.set('operator', tok.detail)
        # 'assignment' nodes
        elif tok.detail in ASSIGN_OPERATORS:
            s = symbol_table[tok.value]()
            s.type = "assignment"
            s.set('operator', tok.detail)
        # 'constant' nodes
        elif tok.name in ('number', 'string', 'regexp'):
            symbol = symbol_table["constant"]
            s = symbol()
            s.set('value', tok.value)
            if tok.name == 'number':
                s.set('constantType', 'number')
                s.set('detail', tok.detail)
            elif tok.name == 'string':
                s.set('constantType', 'string')
                s.set('detail', tok.detail)
            elif tok.name == 'regexp':
                s.set('constantType', 'regexp')
        elif tok.name in ('reserved',) and tok.detail in ("TRUE", "FALSE"):
            symbol = symbol_table["constant"]
            s = symbol()
            s.set('value', tok.value)
            s.set('constantType', 'boolean')
        elif tok.name in ('name',):
            s = symbol_table["identifier"]()
            s.set('value', tok.value)
        else:
            # TODO: token, reserved, builtin
            # name or operator
            symbol = symbol_table.get(tok.value)
            if symbol:
                s = symbol()
                s.value = tok.value
            else:
                # don't make assumptions about correct tokens here, as we might be in the
                # middle of a regexp
                #raise SyntaxError("Unknown operator %r (pos %d)" % (tok.value, tok.spos))
                symbol = symbol_table['(unknown)']
                s = symbol()
                s.value = tok.value

        if s:
            s.value = tok.value
            s.set('column', tok.column)
            s.set('line', tok.line)

        # SPY-POINT
        #print tok
        return s

    ##
    # yields syntax nodes as "tokens" (kind of a misnomer)
    def __iter__(self):
        for t in self.tok_stream:
            tok = Token(t)
            s = self._symbolFromToken(tok)
            if not s:
                continue
            self.spos = tok.spos
            s.spos    = tok.spos
            yield s


class Token(object):
    def __init__(tok, t):
        tok.name = t["type"]
        tok.value = t["source"]
        tok.detail = t.get( "detail")
        tok.line = t.get( "line")
        tok.column = t.get( "column")
        tok.spos = tok.column
        tok.multiline = t.get( "multiline")
        tok.connection = t.get( "connection")
        tok.begin = t.get( "begin")
        tok.end = t.get( "end")
        tok.len = len(tok.value)

    def __str__(s):
        return "(%s[\"%s...\"](%s:%s))" % (s.name, s.value[:10],s.line, s.column)

    __repr__ = __str__

# - Grammar Infrastructure -------------------------------------------------


# symbol (token type) registry
symbol_table = {}
next = None   # produce next node into 'token'
token= None   # current symbol_base() node
tokenStream = None # stream of symbol_base() nodes


class symbol_base(Node):

    # TODO: I should remove those.
    id = None
    value = None
    first = second = third = None

    def __init__(self):  # to override Node.__init__(self,type)
        #self.attributes = {}  # compat with Node.attributes
        #self.children   = []  # compat with Node.children
        Node.__init__(self, self.__class__.id)

    def nud(self):
        raise SyntaxError("Syntax error %r (pos %d)." % (self.id, self.spos))

    def led(self, left):
        raise SyntaxError("Unknown operator %r (pos %d)." % (self.id, self.spos))

    def isVar(self):
        return self.type in ("dotaccessor", "identifier")

    def __repr__(self):
        if self.id == "identifier" or self.id == "constant":
            return "(%s %r)" % (self.id, self.value)
        id  = self.id
        if hasattr(self, 'optype'):
            id += '('+self.optype+')'
        #out = [id, self.first, self.second, self.third]
        out = [id] + self.children
        out = map(repr, filter(None, out))
        return "(" + " ".join(out) + ")"

    def __toXml(self):  # don't override Node.toXml()
        if self.id == "identifier" or self.id == "constant":
            return "<%s value=\"%r\"/>" % (self.id[1:-1], self.value)
        out = "<%s" % self.id
        if hasattr(self, 'optype'):
            out += " optype=\"%s\"" % self.optype
        out += ">"
        for child in filter(None, self.children):
            if isinstance(child, (types.ListType, types.TupleType)):
                for e in child:
                    out += e.toXml()
            elif isinstance(child, symbol_base):
                out += child.toXml()
            else:
                raise RuntimeError("Cannot toXml %s" % self)
        out += "</%s>" % self.id
        return out

    # Packer stuff (serialization to JS)
    def toJS(self):
        r = u''
        r += self.opening()
        for c in self.children:
            r += c.toJS()
        r += self.closing()
        return r

    def opening(self): return u''

    def closing(self): return u''

# -- class factory ------------------

def symbol(id, lbp=0):
    try:
        s = symbol_table[id]
    except KeyError:
        class s(symbol_base):
            pass
        s.__name__ = "symbol-" + id # for debugging
        s.type     = id  # compat with Node.type
        s.id       = id
        s.value    = None
        s.lbp      = lbp
        symbol_table[id] = s
    else:
        s.lbp = max(lbp, s.lbp)
    return s

# helpers

def infix(id, bp):
    def led(self, left):
        s = symbol("first")()
        self.children.append(s)
        s.children.append(left)
        s = symbol("second")()
        self.children.append(s)
        s.children.append(expression(bp))
        return self
    symbol(id, bp).led = led

def infix_r(id, bp):
    def led(self, left):
        self.children.append(left)
        self.children.append(expression(bp-1))
        return self
    symbol(id, bp).led = led

def prefix(id, bp):
    def nud(self):
        s = symbol("first")()
        self.children.append(s)
        s.children.append(expression(bp))
        return self
    symbol(id).nud = nud

def advance(id=None):
    global token
    if id and token.id != id:
        raise SyntaxError("Expected %r (pos %d)" % (id, token.spos))
    if token.id != "eof":
        token = next()

# decorator

def method(s):
    assert issubclass(s, symbol_base)
    def bind(fn):
        setattr(s, fn.__name__, fn)
        #fn.__name__ = "%s.%s" % (s.id, fn.__name__)
    return bind

# - Grammar ----------------------------------------------------------------

# from https://developer.mozilla.org/en/JavaScript/Reference/Operators/Operator_Precedence
# (but comp. Flanagan, "Javascript Pocket Reference" 2nd, p.10f !)

symbol(".",   160); symbol("[", 160)
prefix("new", 160)

symbol("(", 150)

symbol("++", 140); symbol("--", 140)  # pre/post increment (unary)

prefix("-",  130); prefix("+",  130); prefix("~", 130); prefix("!", 130)
prefix("delete", 130); prefix("typeof", 130); prefix("void", 130)

prefix("/",  130)  # regexp


infix("*",  120); infix("/", 120); infix("%", 120)

infix("+",  110); infix("-", 110)      # '+' addition, concatenation

infix("<<", 100); infix(">>", 100); infix(">>>", 100)

infix("<",  90); infix("<=", 90)
infix(">",  90); infix(">=", 90)
infix("in", 90); infix("instanceof", 90)

infix("!=",  80); infix("==",  80)      # (in)equality
infix("!==", 80); infix("===", 80)      # (non-)identity

infix("&",  70)
infix("^",  60)
infix("|",  50)
infix("&&", 40)
infix("||", 30)

symbol("?", 20)   # ternary operator (.nud takes care of ':')

infix("=",  10)   # assignment
infix("<<=",10); infix("-=", 10); infix("+=", 10); infix("*=", 10)
infix("/=", 10); infix("%=", 10); infix("|=", 10); infix("^=", 10)
infix("&=", 10); infix(">>=",10); infix(">>>=",10)

symbol(":", 0) #infix(":", 15)    # ?: and {1:2,...}
prefix("function", 15)

symbol(",", 0) #infix(",",  10)
symbol(";", 0)
symbol("*/", 0)  # have to register this in case a regexp ends in this string
symbol("\\", 0)  # escape char in strings ("\")


symbol("(unknown)").nud = lambda self: self
symbol("eol")
symbol("eof")


symbol("constant").nud = lambda self: self

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


symbol("identifier")

@method(symbol("identifier"))
def nud(self):
    return self

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


@method(symbol("/"))   # regexp literals
def nud(self):
    # problem: "/".led() and "/".nud() return similar ASTs, e.g. with "/" as root
    # and 2 childs; it is not clear from this AST whether it is division or literal regexp,
    # and the types of the childs have to be inspected to decide this.

    rexp = ""
    while True:
        rexp += token.value      # accumulate token strings
        if rexp.endswith("/"):   # check for end of regexp
            # make sure "/" is not escaped, ie. preceded by an odd number of "\"
            if not is_last_escaped(rexp):
                rexp = rexp[:-1] # remove closing "/"
                break
        advance()
    advance()  # this might be either advance("/") or advance("*/")
    s       = (symbol_table["constant"])()  # create a symbol object for the regexp
    s.value = rexp
    self.children.append(s)
    if token.id == "identifier":   # pick up regexp modifiers
        self.children.append(token)
        advance()
    return self


# ternary op ?:
@method(symbol("?"))
def led(self, left):
    # first
    first = symbol("first")()
    first.children.append(left)
    self.children.append(first)
    # second
    second = symbol("second")()
    second.children.append(expression())
    self.children.append(second)
    advance(":")
    # third
    third = symbol("third")()
    third.children.append(expression())
    self.children.append(third)
    return self


##
# The case of <variable>:
# <variable> is an important node in the old ast, I think because as it mainly
# guides dependency analysis, which has to look for variable names. So it might
# be a good trap to have a <variable> node wrapper on all interesting places.
#   I'm keeping it here for the "." (dotaccessor) and for the <identifier>'s,
# because these are the interesting nodes that contain variable names. I'm not
# keeping it for the "[" (accessor) construct, as "foo[bar]" seems more naturally
# divided into the variable part "foo", and something else in the selector.
# Dep.analysis has then just to parse <dotaccessor> and <identifier> nodes.
# Nope.
# I revert. I remove the <variable> nodes. Later when parsing the ast, I will
# either check for ("dotaccessor", "identifier"), or, maybe better, provide a
# Node.isVar() method that returns true for those two node types.

@method(symbol("."))
def led(self, left):
    if token.id != "identifier":
        SyntaxError("Expected an attribute name (pos %d)." % self.spos)
    #variable = symbol("variable")()
    #variable.children.append(left.getChild("identifier")) # unwrap from <variable/>
    #variable.children.append(left)
    #while True:
    #    #variable.children.append(expression().getChildByPosition(0)) # unwrap from <variable/>
    #    variable.children.append(expression())
    #    if token.id != ".":
    #        break
    #    advance(".")
    accessor = symbol("dotaccessor")()
    accessor.children.append(left)
    accessor.children.append(expression(symbol(".").lbp)) 
        # i'm providing the rbp to expression() here explicitly, so "foo.bar(baz)" gets parsed
        # as (call (dotaccessor ...) (param baz)), and not (dotaccessor foo
        # (call bar (param baz))).
    return accessor

# pre-/postfix ops

@method(symbol("++")) # prefix
def nud(self):
    self.set("left", "true")
    s = symbol("first")()
    self.children.append(s)
    s.children.append(expression())  # overgenerating! only lvals allowed
    return self

@method(symbol("++")) # postfix
def led(self, left):
    # assert(left, lval)
    s = symbol("first")()
    self.children.append(s)
    s.children.append(left)
    return self

@method(symbol("--")) # prefix
def nud(self):
    self.set("left", "true")
    s = symbol("first")()
    self.children.append(s)
    s.children.append(expression())  # overgenerating! only lvals allowed
    return self

@method(symbol("--")) # postfix
def led(self, left):
    # assert(left, lval)
    s = symbol("first")()
    self.children.append(s)
    s.children.append(left)
    return self


# constants

def constant(id):
    @method(symbol(id))
    def nud(self):
        self.id = "constant"
        self.value = id
        return self

constant("null")
constant("true")
constant("false")

# bracket expressions

symbol(")")

@method(symbol("("))  # <call>
def led(self, left):
    call = symbol("call")()
    # operand
    operand = symbol("operand")()
    call.children.append(operand)
    operand.children.append(left)
    # params
    params = symbol("params")()
    call.children.append(params)
    if token.id != ")":
        while True:
            params.children.append(expression())
            if token.id != ",":
                break
            advance(",")
    advance(")")
    return call

@method(symbol("("))  # <group>
def nud(self):
    comma = False
    group = symbol("group")()
    if token.id != ")":
        while True:
            if token.id == ")":
                break
            group.children.append(expression())
            if token.id != ",":
                break
            comma = True
            advance(",")
    advance(")")
    return group

symbol("]")

@method(symbol("["))             # "foo[0]", "foo[bar]", "foo['baz']"
def led(self, left):
    accessor = symbol("accessor")()
    # identifier
    accessor.children.append(left)
    # selector
    key = symbol("key")()
    accessor.children.append(key)
    key.children.append(expression())
    advance("]")
    return accessor

@method(symbol("["))
def nud(self):
    arr = symbol("array")()
    if token.id != "]":
        while True:
            if token.id == "]":
                break
            arr.children.append(expression())
            if token.id != ",":
                break
            advance(",")
    advance("]")
    return arr

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


symbol("}")

@method(symbol("{"))                    # object literals
def nud(self):
    mmap = symbol("map")()
    if token.id != "}":
        while True:
            if token.id == "}":
                break
            # key
            keyname = expression()
            key = symbol("keyvalue")()
            key.set("key", keyname.get("value"))
            mmap.children.append(key)
            advance(":")
            # value
            keyval = expression()
            val = symbol("value")()
            val.children.append(keyval)
            key.children.append(val)  # <value> is a child of <keyvalue>
            if token.id != ",":
                break
            advance(",")
    advance("}")
    return mmap

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


@method(symbol("{"))                    # blocks
def std(self):
    a = statements()
    advance("}")
    return a

##
# The next is a shallow wrapper around "{".std, to have a more explicit rule to
# call for constructs that have blocks, like "for", "while", etc.

def block():
    t = token
    advance("{")
    s = symbol("block")()
    s.children.append(t.std())  # the "{".std takes care of closing "}"
    return s

symbol("function")

@method(symbol("function"))
def nud(self):
    # optional name
    if token.id == "identifier":
        #self.children.append(token.value)
        #self.children.append(token)
        self.set("name", token.value)
        advance()
    # params
    assert isinstance(token, symbol("("))
    params = symbol("params")()
    self.children.append(params)
    group = expression()
    params.children = group.children
    # body
    body = symbol("body")()
    self.children.append(body)
    if token.id == "{":
        body.children.append(block())
    else:
        body.children.append(statement())
    return self

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



# -- statements ------------------------------------------------------------

symbol("var")

##
# TODO: deviation from old ast
# This does (for "var a=1")
#  <definitionList>
#    <definition>
#      <assignment>
#        <identifier>
#        <constant>
# (with assignment/2)
# which seems more sane than the older
#  <definitionList>
#    <definition>
#      <assignment identifier=a>
#        <constant>
# (with assignment/1, where it is /2 elsewhere)
#
@method(symbol("var"))
def std(self):
    vardecl = symbol("definitionList")()
    while True:
        var = symbol("definition")()
        vardecl.children.append(var)
        n = token
        if n.id != "identifier":
            raise SyntaxError("Expected a new variable name (pos %d)" % self.spos)
        advance()
        if token.id == "=":  # initialization
            t = token
            advance("=")
            t.children.append(n)
            t.children.append(expression())
            var.children.append(t)
        else:
            var.children.append(n)
        if token.id != ",":
            break
        else:
            advance(",")
    #advance(";")
    return vardecl


# but "var" also needs a nud method, since it can appear in expressions
@method(symbol("var"))
def nud(self):
    while True:
        n = token
        if n.id != "identifier":
            raise SyntaxError("Expected a new variable name (pos %d)" % self.spos)
        advance()
        if token.id == "=":  # initialization
            t = token
            advance("=")
            t.children.append(n)
            t.children.append(expression())
            self.children.append(t)
        if token.id != ",":
            break
        advance(",")
    if len(self.children) != 1:
        return self
    else:
        return self.children[0]


symbol("while")

@method(symbol("while"))
def std(self):
    advance("(")
    self.children.append(expression())
    advance(")")
    self.children.append(block())
    return self


symbol("do")

@method(symbol("do"))
def std(self):
    self.children.append(block())
    advance("while")
    advance("(")
    self.children.append(expression(0))
    advance(")")
    #advance(";")


symbol("if"); symbol("else")

@method(symbol("if"))
def std(self):
    advance("(")
    self.children.append(expression(0))
    advance(")")
    self.children.append(block())
    if (token.id == "else"):
        advance("else")
        if token.id == "if":
            self.children.append(statement())
        else:
            self.children.append(block())
    return self


symbol("break")

@method(symbol("break"))
def std(self):
    if token.id not in ("eol",  ";"):
        self.children.append(expression(0))   # this is over-generating! (should be 'label')
    #advance(";")
    return self


symbol("continue")

@method(symbol("continue"))
def std(self):
    if token.id not in ("eol",  ";"):
        self.children.append(expression(0))   # this is over-generating! (should be 'label')
    #advance(";")
    return self


symbol("return")

@method(symbol("return"))
def std(self):
    if token.id not in StmntTerminatorTokens:
        self.children.append(expression(0))
    return self


symbol("for"); symbol("in")

@method(symbol("for"))
def std(self):
    self.type = "loop" # compat with Node.type
    self.set("loopType", "FOR")
    # condition
    advance("(")
    
    # for (.. in ..)
    if tokenStream.peek(2 if token.id=="var" else 1).id == "in":
        self.set("forVariant", "in")
        var_s = None
        first = symbol("first")()
        self.children.append(first)
        operation = symbol("operation")()
        operation.set("operator", "IN")
        first.children.append(operation)
        op_first = symbol("first")()
        operation.children.append(op_first)
        if token.id == "var": # "var" or ident
            var_s = symbol("definitionList")()
            op_first.children.append(var_s)
            advance("var")
            defn = symbol("definition")()
            var_s.children.append(defn)
        if var_s:
            defn.set("identifier", token.value)
        else:
            variable = symbol("variable")()
            op_first.children.append(variable)
            ident = symbol("identifier")()
            ident.set("name", token.value)
            variable.children.append(ident)
        advance("identifier")
        advance("in")
        op_second = symbol("second")()
        operation.children.append(op_second)
        op_second.children.append(expression())
        
    # for (;;)
    else:
        self.set("forVariant", "iter")
        first = symbol("first")()
        var_s = None
        if token.id == "var":
            var_s = symbol("definitionList")()
            first.children.append(var_s)
            advance("var")
        lst = init_list()
        if var_s:
            for assgn in lst:
                defn = symbol("definition")()
                # have to decompose result element from init_list
                if assgn.id != "=":
                    raise SyntaxError("Must initialize element")
                else:
                    assignment = symbol("assignment")()
                    assignment.children.append(assgn.children[1])  # the left operand of '='
                    defn.children.append(assignment)
                var_s.children.append(defn)
        else:
            exprList = symbol("expressionList")()
            first.children.append(exprList)
            for assgn in lst:
                exprList.children.append(assgn)
                
        # ;
        advance(";")
        second = symbol("second")()
        second.children.append(expression())
        # ;
        advance(";")
        third = symbol("third")()
        third.children.append(expression())
        self.children.extend([first, second,third])

    # block
    advance(")")
    statement = symbol("statement")()
    statement.children.append(block())
    self.children.append(statement)
    return self


symbol("switch"); symbol("case"); symbol("default")

@method(symbol("switch"))
def std(self):
    advance("(")
    self.children.append(expression(0))
    advance(")")
    advance("{")
    while True:
        if token.id == "}": break
        if token.id == "case":
            advance("case")
            c_exp = expression(0)
            advance(":")
            c_stm = statements()
            self.children.append((c_exp, c_stm))   # TODO: do I want this?
        if token.id == "default":
            c_exp = token
            advance("default")
            advance(":")
            c_stm = statements()
            self.children.append((c_exp, c_stm))   # TODO: do I want this?
    advance("}")
    return self


symbol("try"); symbol("catch"); symbol("finally")

@method(symbol("try"))
def std(self):
    self.children.append(block())
    if token.id == "catch":
        advance("catch")
        advance("(")
        self.children.append(expression(0))
        advance(")")
        self.children.append(block()   )# TODO: cannot assign to self.second twice!
    if token.id == "finally":
        self.children.append(block())
    return self

symbol("throw")

@method(symbol("throw"))
def std(self):
    if token.id not in ("eol",  ";"):
        self.children.append(expression(0))
    #advance(";")
    return self

symbol("with")

@method(symbol("with"))
def std(self):
    advance("(")
    self.children.append(expression(0))
    advance(")")
    self.children.append(block())
    
    
def expression(rbp=0):
    global token
    t = token
    token = next()
    left = t.nud()
    while rbp < token.lbp:
        t = token
        token = next()
        left = t.led(left)
    return left


def statement():
    n = token
    s = None
    if getattr(token, 'std', None):
        advance()
        s = n.std()
    elif token.type != 'eol': # it's not an empty line
        s = expression()
        # Crockford's too tight here
        #if not (s.id == "=" or s.id == "("):
        #    raise SyntaxError("Bad expression statement (pos %d)" % token.spos)
    semicolonOrLineEnd()
    return s


def semicolonOrLineEnd():
    try:
        advance("eof")
    except:
        try:
            advance("eol")
        except:
            advance(";")
    

def statements():  # plural!
    s = symbol("statements")()
    while True:
        if token.id == "}" or token.id == "eof":
            break
        st = statement()
        if st:
            s.children.append(st)
    return s


def init_list():  # parse anything from "i" to "i, j=3, k,..."
    lst = []
    while True:
        if token.id != "identifier":
            break
        elem = expression()
        lst.append(elem)
        if token.id != ",":
            break
        else:
            advance(",")
    return lst

# next is not used!
def argument_list(list):
    while 1:
        if token.id != "identifier":
            SyntaxError("Expected an argument name (pos %d)." % token.spos)
        list.append(token)
        advance()
        if token.id == "=":
            advance()
            list.append(expression())
        else:
            list.append(None)
        if token.id != ",":
            break
        advance(",")



# - Output/Packer methods for AST nodes ----------------------------------------

# 'opening'/'closing' methods for output generation.
# This section includes additional node types (e.g. 'accessor'), as such are introduced
# when creating the AST.


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
    r = u''
    return r

@method(symbol("comment"))
def closing(s, node):
    return u""


symbol("commentsAfter")

@method(symbol("commentsAfter"))
def opening(s, node):
    r = u''
    return r

@method(symbol("commentsAfter"))
def closing(s, node):
    return u""


symbol("commentsBefore")

@method(symbol("commentsBefore"))
def opening(s, node):
    r = u''
    return r

@method(symbol("commentsBefore"))
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
    if node.parent.type != "definitionList":
        r += cls.write("var")
        r += cls.space(result=r)
    r += cls.write(node.get("identifier"))
    return r

@method(symbol("definition"))
def closing(s, node):
    r = u''
    if node.hasParent() and node.parent.type == "definitionList" and not node.isLastChild(True):
        r += cls.comma(r)
    return r


symbol("definitionList")

@method(symbol("definitionList"))
def opening(s, node):
    r = cls.write("var")
    r += cls.space(result=r)
    return r

@method(symbol("definitionList"))
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



symbol("instantiation")

@method(symbol("instantiation"))
def opening(s, node):
    r = cls.write("new")
    r += cls.space(result=r)
    return r


@method(symbol("instantiation"))
def closing(s, node):
    return u""



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





# - Class Frontend for the Grammar Infrastructure ------------------------------

class TreeGenerator(object):

    ##
    # To pass a tokenArr rather than a text string is due to the current usage
    # in the generator, which does the tokenization on its own, and then calls
    # 'createSyntaxTree'.
    def parse(self, tokenArr):
        global token, next, tokenStream
        tokenStream = TokenStream(tokenArr) # TODO: adapt TokenStream to token array arg
        next   = iter(tokenStream).next
        token  = next()
        return statements()



# - Interface -----------------------------------------------------------------

createSyntaxTree = TreeGenerator().parse


# - Main ----------------------------------------------------------------------

def test(x, program):
    global token, next, tokenStream
    print ">>>", program
    tokenArr = tokenizer.parseStream(program)
    from pprint import pprint
    #pprint (tokenArr)
    tokenStream = TokenStream(tokenArr)
    next = iter(tokenStream).next
    token = next()
    if x == e:
        res =  expression()
        #import pydb; pydb.debugger()
        print res.toXml()
        #print repr(res)
    elif x == s:
        res =  statements()
        print res.toXml()
        #print repr(res)
    elif x == b:
        res = block()
        print res.toXml()
        #print repr(res)
    else:
        raise RuntimeError("Wrong test parameter: %s" % x)


if __name__ == "__main__":
    from ecmascript.frontend import tokenizer
    if len(sys.argv)>1:
        arg1 = sys.argv[1]
        p = TreeGenerator()
        if os.path.isfile(arg1):
            text = filetool.read(sys.argv[1])
        else:
            text = arg1.decode('unicode_escape')  # 'string_escape' would work too
        tokenArr = tokenizer.parseStream(text)
        print p.parse(tokenArr).toXml()
    else:
        #execfile (os.path.normpath(os.path.join(os.environ["QOOXDOO_PATH"], "tool/test/compiler/treegenerator.py")))
        execfile (os.path.normpath(os.path.join(__file__, "../../../../test/compiler/treegenerator.py"))) # __file__ doesn't seem to work in pydb
        for t in tests:
            test(*t)




##
# A plan for the new parser:
#
#  - main::tests must pass
#  - check the astlet's!
#  - if all is well, activate treegenerator_new_ast in compile.py
#  - compile single files (from skeleton Application.js to qx/Class.js), checken results
#  - if all is well, activate treegenerator_new_ast for *compile* jobs:
#    - 'source' - check dependencies, check app runs (this also checks the
#      class list)
#    - 'build' - check app runs (this also checks compression)

