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
from ecmascript.frontend                 import tree, lang, tokenizer
from ecmascript.frontend.SyntaxException import SyntaxException
from ecmascript.frontend.tree            import Node
from ecmascript.frontend.Scanner         import IterObject, LQueue, is_last_escaped
from misc                                import filetool

tag = 2  # to discriminate tree generators


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
        # tok isinstanceof Token()
        if (tok.name == 'white' # TODO: 'white'?!
            or tok.name == 'comment'):
            pass
        elif tok.name == 'eof':
            symbol = symbol_table.get('(eof)')
            s = symbol()
            s.value = ""
        elif tok.name == 'eol':
            self.line += 1                  # increase line count
            self.sol  = tok.spos + tok.len  # char pos of next line start
            self.spos = tok.spos
            pass # don't yield this (yet)
        elif tok.name in ('number','string'):
            symbol = symbol_table["(literal)"]
            s = symbol()
            s.value = tok.value
        else:
            # TODO: regexp, token, reserved, builtin
            # name or operator
            symbol = symbol_table.get(tok.value)
            if symbol:
                s = symbol()
                s.value = tok.value
            elif tok.name == "name":
                symbol = symbol_table['(ident)']
                s = symbol()
                s.value = tok.value
            else:
                # don't make assumptions about correct tokens here, as we might be in the
                # middle of a regexp
                #raise SyntaxError("Unknown operator %r (pos %d)" % (tok.value, tok.spos))
                symbol = symbol_table['(unknown)']
                s = symbol()
                s.value = tok.value

        return s

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
        tok.detail = getattr(t, "detail", None)
        tok.line = getattr(t, "line", None)
        tok.column = getattr(t, "column", None)
        tok.spos = tok.column
        tok.multiline = getattr(t, "multiline", None)
        tok.connection = getattr(t, "connection", None)
        tok.begin = getattr(t, "begin", None)
        tok.end = getattr(t, "end", None)

# - Grammar Infrastructure -------------------------------------------------


# symbol (token type) registry
symbol_table = {}
next = None
token= None
tokenStream = None


class symbol_base(Node):

    id = None
    value = None
    first = second = third = None

    def __init__(self):  # to override Node.__init__(self,type)
        self.attributes = {}  # compat with Node.attributes
        self.children   = []  # compat with Node.children

    def nud(self):
        raise SyntaxError("Syntax error %r (pos %d)." % (self.id, self.spos))

    def led(self, left):
        raise SyntaxError("Unknown operator %r (pos %d)." % (self.id, self.spos))

    def __repr__(self):
        if self.id == "(ident)" or self.id == "(literal)":
            return "(%s %r)" % (self.id[1:-1], self.value)
        id  = self.id
        if hasattr(self, 'optype'):
            id += '('+self.optype+')'
        out = [id, self.first, self.second, self.third]
        out = map(repr, filter(None, out))
        return "(" + " ".join(out) + ")"

    def __toXml(self):  # don't override Node.toXml()
        if self.id == "(ident)" or self.id == "(literal)":
            return "<%s value=\"%r\"/>" % (self.id[1:-1], self.value)
        out = "<%s" % self.id
        if hasattr(self, 'optype'):
            out += " optype=\"%s\"" % self.optype
        out += ">"
        for child in filter(None, [self.first, self.second, self.third]):
            if isinstance(child, (types.ListType, types.TupleType)):
                for e in child:
                    out += e.toXml()
            elif isinstance(child, symbol_base):
                out += child.toXml()
            else:
                raise RuntimeError("Cannot toXml %s" % self)
        out += "</%s>" % self.id
        return out

# -- class factory ------------------

def symbol(id, bp=0):
    try:
        s = symbol_table[id]
    except KeyError:
        class s(symbol_base):
            pass
        s.__name__ = "symbol-" + id # for debugging
        s.type     = id  # compat with Node.type
        s.id       = id
        s.value    = None
        s.lbp      = bp
        symbol_table[id] = s
    else:
        s.lbp = max(bp, s.lbp)
    return s

# helpers

def infix(id, bp):
    def led(self, left):
        self.first = left
        self.second = expression(bp)
        return self
    symbol(id, bp).led = led

def infix_r(id, bp):
    def led(self, left):
        self.first = left
        self.second = expression(bp-1)
        return self
    symbol(id, bp).led = led

def prefix(id, bp):
    def nud(self):
        self.first = expression(bp)
        return self
    symbol(id).nud = nud

def advance(id=None):
    global token
    if id and token.id != id:
        raise SyntaxError("Expected %r (pos %d)" % (id, token.spos))
    token = next()

# decorator

def method(s):
    assert issubclass(s, symbol_base)
    def bind(fn):
        setattr(s, fn.__name__, fn)
    return bind

# - Grammar ----------------------------------------------------------------

# from Flanagan, "Javascript Pocket Reference" 2nd, p.10f

symbol(".",   150); symbol("[", 150); symbol("(", 150)
prefix("new", 150)

symbol("++", 140); symbol("--", 140)  # pre/post increment (unary)
prefix("-",  140); prefix("+",  140); prefix("~", 140); prefix("!", 140)
prefix("/",  140)

prefix("delete", 140); prefix("typeof", 140); prefix("void", 140)

infix("*",  130); infix("/", 130); infix("%", 130)

infix("+",  120); infix("-", 120)      # '+' addition, concatenation

infix("<<", 110); infix(">>", 110); infix(">>>", 110)

infix("<",  100); infix("<=", 100)
infix(">",  100); infix(">=", 100)
infix("in", 100); infix("instanceof", 100)

infix("!=",  90); infix("==",  90)      # (in)equality
infix("!==", 90); infix("===", 90)      # (non-)identity

infix("&",  80)
infix("^",  70)
infix("|",  60)
infix("&&", 50)
infix("||", 40)

symbol("?", 30)   # ternary operator (.nud takes care of ':')

infix("=",  20)   # assignment
infix("<<=",20); infix("-=", 20); infix("+=", 20); infix("*=", 20)
infix("/=", 20); infix("%=", 20); infix("|=", 20); infix("^=", 20)
infix("&=", 20); infix(">>=",20); infix(">>>=",20)

symbol(":") #infix(":", 15)    # ?: and {1:2,...}
prefix("function", 15)

symbol(",") #infix(",",  10)
symbol(";")
symbol("*/")  # have to register this in case a regexp ends in this string
symbol("\\")  # escape char in strings ("\")



# additional behaviour

symbol("(ident)").nud   = lambda self: self
symbol("(literal)").nud = lambda self: self
symbol("(unknown)").nud = lambda self: self
symbol("(eof)")

#@method(symbol(",", 10))   # parse any kind of lists into array
#def led(self, left):
#    result = []
#    result.extend(left if isinstance(left, types.ListType) else (left,))
#    result.extend(expression(10))
#    self.first = result
#    return result

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
    s       = (symbol_table["(literal)"])()  # create a symbol object for the regexp
    s.value = rexp
    self.first  = s
    if token.id == "(ident)":   # pick up regexp modifiers
        self.second = token
        advance()
    return self


# ternary op ?:
@method(symbol("?"))
def led(self, left):
    self.first = left
    self.second = expression()
    advance(":")
    self.third = expression()
    return self

@method(symbol("."))
def led(self, left):
    if token.id != "(ident)":
        SyntaxError("Expected an attribute name (pos %d)." % self.spos)
    self.first = left
    self.second = token
    advance()
    return self

# pre-/postfix ops

@method(symbol("++"))
def nud(self):
    self.optype = "pre"
    self.first = expression()  # overgenerating! only lvals allowed
    return self

@method(symbol("++"))
def led(self, left):
    # assert(left, lval)
    self.optype = "post"
    self.first = left
    return self

@method(symbol("--"))
def nud(self):
    self.optype = "pre"
    self.first = expression()  # overgenerating! only lvals allowed
    return self

@method(symbol("--"))
def led(self, left):
    # assert(left, lval)
    self.optype = "post"
    self.first = left
    return self


# constants

def constant(id):
    @method(symbol(id))
    def nud(self):
        self.id = "(literal)"
        self.value = id
        return self

constant("null")
constant("true")
constant("false")

# bracket expressions

symbol(")")

@method(symbol("("))
def led(self, left):
    self.first = left
    self.second = []
    if token.id != ")":
        while True:
            self.second.append(expression())
            if token.id != ",":
                break
            advance(",")
    advance(")")
    return self

@method(symbol("("))
def nud(self):
    self.first = []
    comma = False
    if token.id != ")":
        while True:
            if token.id == ")":
                break
            self.first.append(expression())
            if token.id != ",":
                break
            comma = True
            advance(",")
    advance(")")
    if not self.first or comma:
        return self # tuple
    else:
        return self.first[0]

symbol("]")

@method(symbol("["))
def led(self, left):
    self.first = left
    self.second = expression()
    advance("]")
    return self

@method(symbol("["))
def nud(self):
    self.first = []
    if token.id != "]":
        while True:
            if token.id == "]":
                break
            self.first.append(expression())
            if token.id != ",":
                break
            advance(",")
    advance("]")
    return self

symbol("}")

@method(symbol("{"))                    # object literals
def nud(self):
    self.first = []
    if token.id != "}":
        while True:
            if token.id == "}":
                break
            key = expression()
            advance(":")
            val = expression()
            #self.first.append((key, val))
            s = symbol(":")()  # this is an attempt to add a true symbol instance (for .toXml)
            s.left = key
            s.right= val
            self.first.append(s)
            if token.id != ",":
                break
            advance(",")
    advance("}")
    return self

@method(symbol("function"))
def nud(self):
    # optional name
    if token.id == "(ident)":
        #self.third = token.value
        self.third = token
        advance()
    # params
    assert isinstance(token, symbol("("))
    self.first = expression()
    # body
    advance("{")
    self.second = statements()
    advance("}")
    return self


# -- statements ------------------------------------------------------------

@method(symbol("{"))                    # blocks
def std(self):
    a = statements()
    advance("}")
    return a

symbol("var")

@method(symbol("var"))
def std(self):
    self.first = []
    while True:
        n = token
        if n.id != "(ident)":
            raise SyntaxError("Expected a new variable name (pos %d)" % self.spos)
        advance()
        if token.id == "=":  # initialization
            t = token
            advance("=")
            t.first = n
            t.second = expression()
            self.first.append(t)
        if token.id != ",":
            break
        advance(",")
    advance(";")
    if len(self.first) != 1:
        return self
    else:
        return self.first[0]


# but "var" also needs a nud method, since it can appear in expressions
@method(symbol("var"))
def nud(self):
    self.first = []
    while True:
        n = token
        if n.id != "(ident)":
            raise SyntaxError("Expected a new variable name (pos %d)" % self.spos)
        advance()
        if token.id == "=":  # initialization
            t = token
            advance("=")
            t.first = n
            t.second = expression()
            self.first.append(t)
        if token.id != ",":
            break
        advance(",")
    if len(self.first) != 1:
        return self
    else:
        return self.first[0]


symbol("while")

@method(symbol("while"))
def std(self):
    advance("(")
    self.first = expression()
    advance(")")
    self.second = block()
    return self


symbol("do")

@method(symbol("do"))
def std(self):
    self.first = block()
    advance("while")
    advance("(")
    self.second = expression(0)
    advance(")")
    advance(";")


symbol("if"); symbol("else")

@method(symbol("if"))
def std(self):
    advance("(")
    self.first = expression(0)
    advance(")")
    self.second = block()
    if (token.id == "else"):
        advance("else")
        if token.id == "if":
            self.third = statement()
        else:
            self.third = block()
    else:
        self.third = None
    return self


symbol("break")

@method(symbol("break"))
def std(self):
    if token.id != ";":
        self.first = expression(0)   # this is over-generating! (should be 'label')
    advance(";")
    return self


symbol("continue")

@method(symbol("continue"))
def std(self):
    if token.id != ";":
        self.first = expression(0)   # this is over-generating! (should be 'label')
    advance(";")
    return self


symbol("return")

@method(symbol("return"))
def std(self):
    if token.id != ";":
        self.first = expression(0)
    if token.id != "}":
      advance(";")
    if token.id != "}":
        token.error("Unreachable statement")
    return self


symbol("for"); symbol("in")

@method(symbol("for"))
def std(self):
    advance("(")
    self.first = []
    var_s = None
    if tokenStream.peek(2 if token.id=="var" else 1).id == "in":   # for (.. in ..)
        elem = token    # "var" or ident
        if elem.id == "var":
            elem.first = []
            advance("var")
            elem.first.append(token)
        advance("(ident)")
        op = token      # "in"
        advance("in")
        op.first = elem
        op.second= expression()
    else:                                                     # for (;;)
        lst = []
        var_s = None
        if token.id == "var":
            var_s = token
            advance("var")
        lst = init_list()
        op  = token    #  ";"
        if var_s:
            var_s.first = lst
            op.first = var_s
        else:
            op.first = lst
        advance(";")
        op.second = expression()
        advance(";")
        op.third  = expression()
    advance(")")
    self.first  = op
    self.second = block()
    return self


symbol("switch"); symbol("case"); symbol("default")

@method(symbol("switch"))
def std(self):
    advance("(")
    self.first = expression(0)
    advance(")")
    advance("{")
    self.second = []
    while True:
        if token.id == "}": break
        if token.id == "case":
            advance("case")
            c_exp = expression(0)
            advance(":")
            c_stm = statements()
            self.second.append((c_exp, c_stm))   # TODO: do I want this?
        if token.id == "default":
            c_exp = token
            advance("default")
            advance(":")
            c_stm = statements()
            self.second.append((c_exp, c_stm))   # TODO: do I want this?
    advance("}")
    return self


symbol("try"); symbol("catch"); symbol("finally")

@method(symbol("try"))
def std(self):
    self.first = block()
    if token.id == "catch":
        advance("catch")
        advance("(")
        self.second = expression(0)
        advance(")")
        self.second = block()   # TODO: cannot assign to self.second twice!
    if token.id == "finally":
        self.third = block()
    return self

symbol("throw")

@method(symbol("throw"))
def std(self):
    if token.id != ";":
        self.first = expression(0)
    advance(";")
    return self

symbol("with")

@method(symbol("with"))
def std(self):
    advance("(")
    self.first = expression(0)
    advance(")")
    self.second = block()
    
    
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
    if getattr(token, 'std', None):
        advance()
        s = n.std()
    else:
        s = expression()
        # Crockford's too tight here
        #if not (s.id == "=" or s.id == "("):
        #    raise SyntaxError("Bad expression statement (pos %d)" % token.spos)
        advance(";")
    return s

def statements():  # plural!
    s = symbol("{")()
    s.first = []
    a = s.first
    while True:
        if (token.id == "}" or token.id == "(eof)"):
            break
        s = statement()
        if s:
            a.append(s)
    #if len(a) == 0:
    #    return None
    #elif len(a) == 1:
    #    return a[0]
    #else:
    #    return a
    return s

def block():
    t = token
    advance("{")
    return t.std()

def init_list():  # parse anything from "i" to "i, j=3, k,..."
    lst = []
    while True:
        if token.id != "(ident)":
            break
        elem = token
        advance("(ident)")
        if token.id == "=":
            t    = elem
            elem = token
            elem.first = t
            advance("=")
            elem.second= expression()
        lst.append(elem)
        if token.id != ",":
            break
        else:
            advance(",")
    return lst

# next is not used!
def argument_list(list):
    while 1:
        if token.id != "(ident)":
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


# - Class Frontend for the Grammar Infrastructure ------------------------------

class TreeGenerator(object):

    def parse(self, tokenArr):
        global token, next, tokenStream
        tokenStream = TokenStream(tokenArr) # TODO: adapt TokenStream to token array arg
        next   = iter(tokenStream).next
        token  = next()
        return statements()



# - Interface -----------------------------------------------------------------

createSyntaxTree = TreeGenerator().parse


# - Main ----------------------------------------------------------------------

e = 0
s = 1
b = 2

def test(x, program):
    global token, next, tokenStream
    print ">>>", program
    tokenArr = tokenizer.parseStream(program)
    tokenStream = TokenStream(tokenArr)
    next = iter(tokenStream).next
    token = next()
    if x == e:
        res =  expression()
        #import pydb; pydb.debugger()
        #print res.toXml()
        print repr(res)
    elif x == s:
        res =  statements()
        #print res.toXml()
        print repr(res)
    elif x == b:
        res = block()\
        #print res.toXml()
        print repr(res)
    else:
        raise RuntimeError("Wrong test parameter: %s" % x)


if __name__ == "__main__":
    if len(sys.argv)>1:
        arg1 = sys.argv[1]
        p = TreeGenerator()
        if os.path.isfile(arg1):
            text = filetool.read(sys.argv[1])
        else:
            text = arg1
        print p.parse(text).toXml()
    else:
        test(e,"1")
        test(e,"+1")
        test(e,"-1")
        test(e,"1+2")
        test(e,"1+2+3")
        test(e,"1+2*3")
        test(e,"(1+2)*3")
        test(e,"(1)")
        test(e,"{}")
        test(e,"1 ? 2 : 3")
        test(e,"{1: 'one', 2: 'two'}")
        test(e,"{1: 'one', 2: 'two', 3: 'three'}")
        test(e,"(1,)")
        test(e,"(1, 2)")
        test(e,"[1, 2, 3]")
        test(e,"1.0*2+3")
        test(e,"'hello'+'world'")
        test(e,"1 and 2")
        test(e,"foo.bar")
        test(e,"1 + hello")
        test(e,"'hello'[0]")
        test(e,"hello()")
        test(e,"hello(1,2,3)")
        test(e,"function () { a = 1; }")
        test(e,"function foo() { a = 1; }")
        test(e,"function foo(a,b) { a = 1; }")
        test(e,"function foo(a,b) { a = 1; b = 2;}")
        test(e,"([dojo._listener, del, node_listener][listener]).remove(obj, event, handle);") # from bug#2178
        # statements
        test(s,"var a = 1, b;")
        test(s,"var a = 'foo \\' bar';")                 # scanner has to provide "foo ' bar" literal
        test(s,"while(a<10){ b.append(a); }")
        test(e,"i=2")
        test(e,"2")
        test(s,"for(i=0; i<j; i++){ a=3; }")
        test(s,"for(i=0, j=a; i<j; i++){ a=3; }")
        test(s,"for(var i=0, j=a; i<j; i++){ a=3; }")
        test(s,"for(var key in config){process(key);}")
        # regexp literals
        test(s,"var a = /123/;")
        test(s,"var a = /123/mgi;")
        test(e,"foo(1, /a.*b/mgi)")
        test(s,"var a = /a.*/;")
        test(s,r"var a = /^ab.*?[f-g]+x\/yz[^\.\/]?a.*\\/;")
        test(s,r"var a = /^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;")  # from bug#2180
        test(s,"var a = 10/123/2;")
        # pre-/post-ops
        test(e,"++i")
        test(e,"i++")
        test(e,"++a[0]")
        test(e,"a[0]++")
        test(e,"++(a[0])")
        test(e,"(a[0])++")
        test(e,"--i")
        test(e,"i--")
