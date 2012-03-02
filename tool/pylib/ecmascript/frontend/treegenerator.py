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
from ecmascript.frontend.Scanner         import IterObject, LQueue, LimLQueue, is_last_escaped
from ecmascript.frontend                 import lang, tokenizer
from misc                                import filetool
from misc.NameSpace                      import NameSpace

tag = 1  # to discriminate tree generators

identifier_regex =re.compile(lang.IDENTIFIER_REGEXP)

PackerFlags = NameSpace()  # the global prettyprint flags (pretty, afterLine, afterBreak, ...)
pp = PackerFlags
pp.pretty        = None
pp.breaks        = None
pp.afterLine     = None
pp.afterBreak    = None
pp.afterDoc      = None
pp.afterDivider  = None
pp.afterArea     = None


ATOMS = ["string", "number", "identifier"]

PREFIX_VERB_OPERATORS = ["NEW", "TYPEOF", "DELETE", "VOID"]

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

StmntTerminatorTokens = ("eol", ";", "}")

class SyntaxTreeError(SyntaxError): pass

##
# the main purpose of this class is to instantiate parser symbol objects from
# low-level tokens
class TokenStream(IterObject):

    def __init__(self, inData):
        self.line       = 0
        self.tpos       = 0  # token position in stream
        self.max_look_behind = 10
        self.outData    = LimLQueue(self.max_look_behind)
        super(TokenStream, self).__init__(inData)

    def resetIter(self):
        self.tokenStream= LQueue(iter(self.inData))
        self.tok_stream = iter(self.tokenStream)
        super(TokenStream, self).resetIter()

    ##
    # Peek n tokens ahead
    def peek(self, n=1):
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

    ##
    # Peek n tokens behind
    def lookbehind(self, n=1):
        if n>self.max_look_behind:
            raise SyntaxException("TokenStream: can only look %d elements behind" % self.max_look_behind)
        return self.outData[n]


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
            pass # don't yield this (yet)
            #s = symbol_table.get("eol")()
        # 'operation' nodes
        elif tok.detail in (
            MULTI_TOKEN_OPERATORS
            + MULTI_PROTECTED_OPERATORS
            + SINGLE_RIGHT_OPERATORS
            + SINGLE_LEFT_OPERATORS
            + PREFIX_VERB_OPERATORS
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
            s.set('constantType', 'boolean')
        elif tok.name in ('name', 'builtin'):
            s = symbol_table["identifier"]()
        else:
            # TODO: token, reserved
            # name or operator
            if tok.value == "this":
                # unfortunately, this comes as tok.name=='reserved' like operators
                # re-labeling this as identifier
                s = symbol_table["identifier"]()
            else:
                symbol = symbol_table.get(tok.value)
                if symbol:
                    s = symbol()
                else:
                    raise SyntaxError("Unknown operator %r (pos %r)" % (tok.value, (tok.line,tok.column)))
                    #s = symbol_table['(unknown)']()

        if s:
            s.set('value', tok.value)
            s.set('column', tok.column)
            s.set('line', tok.line)

        # SPY-POINT
        #print tok
        return s

    ##
    # yields syntax nodes as "tokens" (kind of a misnomer)
    def __iter__(self):
        for i,t in enumerate(self.tok_stream):
            self.tpos = i
            tok = Token(t)
            s = self._symbolFromToken(tok)
            if not s:
                continue
            self.outData.appendleft(s)
            yield s


class Token(object):
    def __init__(tok, t):
        tok.begin = t.get( "begin")
        tok.column = t.get( "column")
        tok.connection = t.get( "connection")
        tok.detail = t.get( "detail")
        tok.end = t.get( "end")
        tok.id = t["id"]
        tok.line = t.get( "line")
        tok.multiline = t.get( "multiline")
        tok.name = t["type"] if t["type"]!="token" else "operator" # i hate the token "token"
        tok.value = t["source"]
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

    def __init__(self, line=None, column=None):  # to override Node.__init__(self,type)
        #self.attributes = {}  # compat with Node.attributes
        #self.children   = []  # compat with Node.children
        Node.__init__(self, self.__class__.id)
        if line:
            self.set("line", line)
        if column:
            self.set("column", column)

    ##
    # thin wrapper around .children, to maintain .parent in them
    def childappend(self, child):
        self.children.append(child)
        child.parent = self

    def nud(self):
        raise SyntaxError("Syntax error %r (pos %r)." % (self.id, (self.get("line"), self.get("column"))))

    def led(self, left):
        raise SyntaxError("Unknown operator %r (pos %r)." % (self.id, (self.get("line"), self.get("column"))))

    def isVar(self):
        return self.type in ("dotaccessor", "identifier")

    def __repr__(self):
        if self.id == "identifier" or self.id == "constant":
            return "(%s %r)" % (self.id, self.get("value"))
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
        #raise NotImplementedError("%s.toJs() needs to be implemented" % (self.id,))
        return self.get("value", u'')


    def compileToken(self, name, compact=False):
        s = u''

        if name in ["INC", "DEC", "TYPEOF"]:
            pass
        elif name in ["INSTANCEOF", "IN"]:
            s += self.space(result=s)
        elif not compact and pp.pretty:
            s += self.space(result=s)
        if name == None:
            s += self.write("=")
        elif name in ["TYPEOF", "INSTANCEOF", "IN"]:
            s += self.write(name.lower())
        else:
            for key in lang.TOKENS:
                if lang.TOKENS[key] == name:
                    s += self.write(key)
        if name in ["INC", "DEC"]:
            pass
        elif name in ["TYPEOF", "INSTANCEOF", "IN"]:
            s += self.space(result=s)
        elif not compact and pp.pretty:
            s += self.space(result=s)

        return s


    def space(self, force=True, result=u''):
        s = u''

        if not force and not pp.pretty:
            return s

        if pp.afterDoc or pp.afterBreak or pp.afterLine or result and (result.endswith(" ") or result.endswith("\n")):
            return s
        else:
            return u' '


    def write(self, txt=u""):
        result = u""

        if pp.breaks:
            if pp.afterArea or pp.afterDivider or pp.afterDoc or pp.afterBreak or pp.afterLine:
                result += "\n"

        # reset
        pp.afterLine = False
        pp.afterBreak = False
        pp.afterDivider = False
        pp.afterArea = False

        result += txt

        return result


    def sep(self):
        pp.afterBreak = True


    def line(self):
        afterLine = True


    def noline(self):

        pp.afterLine = False
        pp.afterBreak = False
        pp.afterDivider = False
        pp.afterArea = False
        pp.afterDoc = False


    def semicolon(self, result=u''):
        s = u''

        self.noline()

        if not result or not (result.endswith("\n") or result.endswith(";")):
            s += self.write(";")

            if pp.breaks:
                s += "\n"
        return s


    def comma(self, result):
        s = u''

        self.noline()
        if not result or not (result.endswith("\n") or result.endswith(",")):
            s += self.write(",")
            if pp.breaks:
                result += "\n"

        return s


    def inForLoop(self):
        while node:
            if self.type in ["first", "second", "third"] and self.parent.type == "loop" and self.parent.get("loopType") == "FOR":
                return True

            if not self.hasParent():
                return False

            node = self.parent

        return False


    # end: symbol_base(Node)


# -- class factory ------------------

def symbol(id_, lbp=0):
    try:
        s = symbol_table[id_]
    except KeyError:
        class s(symbol_base):
            pass
        s.__name__ = "symbol-" + id_ # for debugging
        s.type     = id_  # compat with Node.type
        s.id       = id_
        s.value    = None
        s.lbp      = lbp
        symbol_table[id_] = s
        globals()[s.__name__] = s  # ALERT: this is a devious hack to make Pickle pickle the symbol classes.
                                   # To unpickle, it is necessary to have this module loaded, so the classes
                                   # are ready.
    else:
        s.lbp = max(lbp, s.lbp)
    return s

# helpers

def infix(id_, bp):
    def led(self, left):
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(left)
        s = symbol("second")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression(bp))
        return self
    symbol(id_, bp).led = led

    def toJS(self):
        r = u''
        r += self.getChild("first").toJS()
        r += self.get("value")
        r += self.getChild("second").toJS()
        return r
    symbol(id_).toJS = toJS


##
# infix "verb" operators, i.e. that need a space around themselves (like 'instanceof', 'in')
def infix_v(id_, bp):
    infix(id_, bp)   # make it a normal infix op

    def toJS(self):  # adapt the output
        r = u''
        r += self.getChild("first").toJS()
        r += self.space()
        r += self.get("value")
        r += self.space()
        r += self.getChild("second").toJS()
        return r
    symbol(id_).toJS = toJS
        

##
# right-associative infix (all assignment ops)
# (mind "bp-1", cf. Lundh's TDOP paper, p.6)
def infix_r(id_, bp):
    infix(id_, bp)

    def led(self, left):
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(left)
        s = symbol("second")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression(bp-1))
        return self
    symbol(id_, bp).led = led


##
# prefix "sigil" operators, like '!', '~', ...
def prefix(id_, bp):
    def nud(self):
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression(bp-1)) # right-associative
        return self
    symbol(id_, bp).nud = nud

    def toJS(self):
        r = u''
        r += self.get("value")
        r += self.getChild("first").toJS()
        return r
    symbol(id_).toJS = toJS


##
# prefix "verb" operators, i.e. that need a space before their operand like 'delete'
def prefix_v(id_, bp):
    def nud(self):
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression(bp-1)) # right-associative
        return self
    symbol(id_, bp).nud = nud


    def toJS(self):
        r = u''
        r += self.get("value")
        r += self.space()
        r += self.getChild("first").toJS()
        return r
    symbol(id_).toJS = toJS


def preinfix(id_, bp):  # pre-/infix operators (+, -)
    infix(id_, bp)   # init as infix op

    ##
    # better give them a nud() for prefix pos
    def nud(self):
        self.set("left", "true")  # mark prefix position
        first = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(first)
        first.childappend(expression())
        return self
    symbol(id_).nud = nud

    def toJS(self):  # need to handle pre/infix cases
        r = []
        first = self.getChild("first").toJS()
        op = self.get("value")
        prefix = self.get("left", 0)
        if prefix and prefix == "true":
            r = [op, first]
        else:
            second = self.getChild("second").toJS()
            r = [first, op, second]
        return ''.join(r)
    symbol(id_).toJS = toJS


def prepostfix(id_, bp):  # pre-/post-fix operators (++, --)
    def nud(self):  # prefix
        self.set("left", "true")
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression())  # overgenerating! only lvals allowed
        return self
    symbol(id_, bp).nud = nud

    def led(self, left): # postfix
        # assert(left, lval)
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(left)
        return self
    symbol(id_).led = led

    def toJS(self):
        r = u''
        operator = self.get("value")
        operand = self.getChild("first").toJS()
        r += self.get("value")
        if self.get("left", '') == "true":
            r = [operator, operand]
        else:
            r = [operand, operator]
        return u''.join(r)
    symbol(id_).toJS = toJS


def advance(id_=None):
    global token
    if id_ and token.id != id_:
        raise SyntaxError("Expected %r (pos %r)" % (id_, (token.get("line"),token.get("column"))))
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
prefix_v("new", 160)

symbol("(", 150)

prepostfix("++", 140); prepostfix("--", 140)  # pre/post increment (unary)

prefix("-",  130); prefix("+",  130); prefix("~", 130); prefix("!", 130)
prefix_v("delete", 130); prefix_v("typeof", 130); prefix_v("void", 130)

prefix("/",  130)  # regexp


infix("*",  120); infix("/", 120); infix("%", 120)

#infix("+",  110); infix("-", 110)      # '+' addition, concatenation
preinfix("+",  110); preinfix("-", 110)      # '+' addition, concatenation

infix("<<", 100); infix(">>", 100); infix(">>>", 100)

infix("<",  90); infix("<=", 90)
infix(">",  90); infix(">=", 90)
infix_v("in", 90); infix_v("instanceof", 90)

infix("!=",  80); infix("==",  80)      # (in)equality
infix("!==", 80); infix("===", 80)      # (non-)identity

infix("&",  70)
infix("^",  60)
infix("|",  50)
infix("&&", 40)
infix("||", 30)

symbol("?", 20)   # ternary operator (.led takes care of ':')

infix_r("=",  10)   # assignment
infix_r("<<=",10); infix_r("-=", 10); infix_r("+=", 10); infix_r("*=", 10)
infix_r("/=", 10); infix_r("%=", 10); infix_r("|=", 10); infix_r("^=", 10)
infix_r("&=", 10); infix_r(">>=",10); infix_r(">>>=",10)

symbol(":", 0) #infix(":", 15)    # ?: and {1:2,...} and label:

symbol(",", 0) # infix(",", 5) -- good for expression lists, but problematic for parsing arrays, maps

symbol(";", 0)
symbol("*/", 0)  # have to register this in case a regexp ends in this string
symbol("\\", 0)  # escape char in strings ("\")


symbol("(unknown)").nud = lambda self: self
symbol("eol")
symbol("eof")


symbol("constant").nud = lambda self: self

@method(symbol("constant"))
def toJS(self):
    r = u''
    if self.get("constantType") == "string":
        if self.get("detail") == "singlequotes":
            r += self.write("'")
        else:
            r += self.write('"')
        r += self.write(self.get("value"))
        if self.get("detail") == "singlequotes":
            r += self.write("'")
        else:
            r += self.write('"')
    else:
        r += self.write(self.get("value"))
    return r


symbol("identifier")

@method(symbol("identifier"))
def nud(self):
    return self

@method(symbol("identifier"))
def toJS(self):
    r = u''
    v = self.get("value", u"")
    if v:
        r = self.write(v)
    if self.hasParent() and self.parent.type == "variable" and not self.isLastChild(True):
        r += self.write(".")
    elif self.hasParent() and self.parent.type == "label":
        r += self.write(":")
    return r


@method(symbol("/"))   # regexp literals
def nud(self):
    # problem: "/".led() and "/".nud() return similar ASTs, e.g. with "/" as root
    # and 2 childs; it is not clear from this AST whether it is division or literal regexp,
    # and the types of the childs have to be inspected to decide this.

    rexp = ""
    while True:
        rexp += token.get("value")      # accumulate token strings
        if rexp.endswith("/"):   # check for end of regexp
            # make sure "/" is not escaped, ie. preceded by an odd number of "\"
            if not is_last_escaped(rexp):
                rexp = rexp[:-1] # remove closing "/"
                break
        advance()
    advance()  # this might be either advance("/") or advance("*/")
    s       = (symbol_table["constant"])()  # create a symbol object for the regexp
    s.value = rexp
    self.childappend(s)
    if token.id == "identifier":   # pick up regexp modifiers
        self.childappend(token)
        advance()
    return self


# ternary op ?:
@method(symbol("?"))
def led(self, left):
    # first
    first = symbol("first")(token.get("line"), token.get("column"))
    first.childappend(left)
    self.childappend(first)
    # second
    second = symbol("second")(token.get("line"), token.get("column"))
    second.childappend(expression())
    self.childappend(second)
    advance(":")
    # third
    third = symbol("third")(token.get("line"), token.get("column"))
    third.childappend(expression())
    self.childappend(third)
    return self


@method(symbol("?"))
def toJS(self):
    r = []
    r.append(self.getChild("first").toJS())
    r.append('?')
    r.append(self.getChild("second").toJS())
    r.append(':')
    r.append(self.getChild("third").toJS())
    return ''.join(r)


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
        SyntaxError("Expected an attribute name (pos %r)." % ((token.get("line"), token.get("column")),))
    #variable = symbol("variable")(token.get("line"), token.get("column"))
    #variable.childappend(left.getChild("identifier")) # unwrap from <variable/>
    #variable.childappend(left)
    #while True:
    #    #variable.childappend(expression().getChildByPosition(0)) # unwrap from <variable/>
    #    variable.childappend(expression())
    #    if token.id != ".":
    #        break
    #    advance(".")
    accessor = symbol("dotaccessor")(token.get("line"), token.get("column"))
    s = symbol("first")(token.get("line"), token.get("column"))
    accessor.childappend(s)
    s.childappend(left)
    s = symbol("second")(token.get("line"), token.get("column"))
    accessor.childappend(s)
    s.childappend(expression(symbol(".").lbp)) 
        # i'm providing the rbp to expression() here explicitly, so "foo.bar(baz)" gets parsed
        # as (call (dotaccessor ...) (param baz)), and not (dotaccessor foo
        # (call bar (param baz))).
    return accessor


symbol("dotaccessor")

@method(symbol("dotaccessor"))
def toJS(self):
    r = self.children[0].toJS()
    r += '.'
    r += self.children[1].toJS()
    return r

##
# walk down to find the "left-most" identifier ('a' in 'a.b().c')
@method(symbol("dotaccessor"))
def getLeftmostOperand(self):
    ident = self.getChild("first")
    while ident.type not in ("identifier", "constant"):  # e.g. 'dotaccessor', 'first', 'call', 'accessor', ...
        ident =ident.children[0]
    return ident

##
# walk down to find the "right-most" identifier ('c' in a.b.c)
@method(symbol("dotaccessor"))
def getRightmostOperand(self):
    ident = self.getChild("second").children[0]
    return ident # "left-leaning syntax tree (. (. a b) c)


##
# get the highest (in the tree) dotaccessor parent of a pure '.' expression
@method(symbol("dotaccessor"))
def getHighestPureDotParent(self):
    highestDot = self
    while highestDot.hasParentContext("dotaccessor/*"):
        highestDot = highestDot.parent.parent
    return highestDot


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

symbol("("), symbol(")")

@method(symbol("("))  # <call>
def led(self, left):
    call = symbol("call")(token.get("line"), token.get("column"))
    # operand
    operand = symbol("operand")(token.get("line"), token.get("column"))
    call.childappend(operand)
    operand.childappend(left)
    # params - parse as group
    params = symbol("params")(token.get("line"), token.get("column"))
    call.childappend(params)
    group = self.nud()
    for c in group.children:
        params.childappend(c)
    return call

symbol("operand")

@method(symbol("operand"))
def toJS(self):
    return self.children[0].toJS()


@method(symbol("("))  # <group>
def nud(self):
    comma = False
    group = symbol("group")(token.get("line"), token.get("column"))
    if token.id != ")":
        while True:
            if token.id == ")":
                break
            group.childappend(expression())
            if token.id != ",":
                break
            advance(",")
    advance(")")
    return group

@method(symbol("group"))
def toJS(self):
    r = []
    r.append('(')
    a = []
    for c in self.children:
        a.append(c.toJS())
    r.append(','.join(a))
    r.append(')')
    return ''.join(r)


symbol("]")

@method(symbol("["))             # "foo[0]", "foo[bar]", "foo['baz']"
def led(self, left):
    accessor = symbol("accessor")(token.get("line"), token.get("column"))
    # identifier
    accessor.childappend(left)
    # selector
    key = symbol("key")(token.get("line"), token.get("column"))
    accessor.childappend(key)
    key.childappend(expression())
    advance("]")
    return accessor

@method(symbol("["))
def nud(self):
    arr = symbol("array")(token.get("line"), token.get("column"))
    if token.id != "]":
        while True:
            if token.id == "]":
                break
            arr.childappend(expression())
            if token.id != ",":
                break
            advance(",")
    advance("]")
    return arr

symbol("accessor")

@method(symbol("accessor"))
def toJS(self):
    r = u''
    r += self.children[0].toJS()
    r += '['
    r += self.children[1].toJS()
    r += ']'
    return r


symbol("array")

@method(symbol("array"))
def toJS(self):
    r = []
    for c in self.children:
        r.append(c.toJS())
    return '[' + u','.join(r) + ']'


symbol("key")

@method(symbol("key"))
def toJS(self):
    return self.children[0].toJS()


symbol("}")

@method(symbol("{"))                    # object literals
def nud(self):
    mmap = symbol("map")(token.get("line"), token.get("column"))
    if token.id != "}":
        while True:
            if token.id == "}":
                break
            # key
            keyname = expression()
            key = symbol("keyvalue")(token.get("line"), token.get("column"))
            key.set("key", keyname.get("value"))
            quote_type = keyname.get("detail", False)
            key.set("quote", quote_type if quote_type else '')
            mmap.childappend(key)
            advance(":")
            # value
            keyval = expression()
            val = symbol("value")(token.get("line"), token.get("column"))
            val.childappend(keyval)
            key.childappend(val)  # <value> is a child of <keyvalue>
            if token.id != ",":
                break
            advance(",")
    advance("}")
    return mmap

@method(symbol("{"))                    # blocks
def std(self):
    a = statements()
    advance("}")
    return a

symbol("map")

@method(symbol("map"))
def toJS(self):
    r = u''
    r += self.write("{")
    a = []
    for c in self.children:
        a.append(c.toJS())
    r += ','.join(a)
    r += self.write("}")
    return r

@method(symbol("value"))
def toJS(self):
    return self.children[0].toJS()

symbol("keyvalue")

@method(symbol("keyvalue"))
def toJS(self):
    key = self.get("key")
    key_quote = self.get("quote", '')
    if key_quote:
        quote = '"' if key_quote == 'doublequotes' else "'"
    elif ( key in lang.RESERVED 
           or not identifier_regex.match(key)
           # TODO: or not lang.NUMBER_REGEXP.match(key)
         ):
        print "Warning: Auto protect key: %r" % key
        quote = '"'
    else:
        quote = ''
    value = self.getChild("value").toJS()
    return quote + key + quote + ':' + value


##
# The next is a shallow wrapper around "{".std, to have a more explicit rule to
# call for constructs that have blocks, like "for", "while", etc.

def block():
    t = token
    advance("{")
    s = symbol("block")(token.get("line"), token.get("column"))
    s.childappend(t.std())  # the "{".std takes care of closing "}"
    return s

symbol("block")

@method(symbol("block"))
def toJS(self):
    r = []
    r.append('{')
    r.append(self.children[0].toJS())
    r.append('}')
    return u''.join(r)

symbol("function")

@method(symbol("function"))
def nud(self):
    # optional name
    if token.id == "identifier":
        #self.childappend(token.get("value"))
        #self.childappend(token)
        self.set("name", token.get("value"))
        advance()
    # params
    assert token.id == "("
    params = symbol("params")(token.get("line"), token.get("column"))
    self.childappend(params)
    group = expression()  # group parsing as helper
    for c in group.children:
        params.childappend(c)
    params.children = group.children
    # body
    body = symbol("body")(token.get("line"), token.get("column"))
    self.childappend(body)
    if token.id == "{":
        body.childappend(block())
    else:
        body.childappend(statement())
    return self

@method(symbol("function"))
def toJS(self):
    r = self.write("function")
    functionName = self.get("name",0)
    if functionName != None:
        r += self.space(result=r)
        r += self.write(functionName)
    # params
    r += self.getChild("params").toJS()
    # body
    r += self.getChild("body").toJS()
    return r

@method(symbol("params"))
def toJS(self):
    r = []
    r.append('(')
    a = []
    for c in self.children:
        a.append(c.toJS())
    r.append(u','.join(a))
    r.append(')')
    return u''.join(r)


@method(symbol("body"))
def toJS(self):
    r = []
    r.append(self.children[0].toJS())
    # 'if', 'while', etc. can have single-statement bodies
    if self.children[0].id != 'block':
        r.append(';')
    return u''.join(r)


# -- statements ------------------------------------------------------------

symbol("var")

##
# TODO: deviation from old ast
# This does (for "var a=1")
#  <definitionList>
#    <definition>
#      <assignment>
#        <first>
#          <identifier>
#        <second>
#          <constant>
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
    vardecl = symbol("definitionList")(token.get("line"), token.get("column"))
    while True:
        var = symbol("definition")(token.get("line"), token.get("column"))
        vardecl.childappend(var)
        defn = expression()
        if defn.type not in ("identifier", "assignment"):
            raise SyntaxError("Expected a new variable or assignment (pos %r)" % ((token.get("line"), token.get("column")),))
        var.childappend(defn)
        if token.id != ",":
            break
        else:
            advance(",")
    return vardecl


# but "var" also needs a nud method, since it can appear in expressions
symbol("var").nud = symbol("var").std

#@method(symbol("var"))
#def nud(self):
#    while True:
#        n = token
#        if n.id != "identifier":
#            raise SyntaxError("Expected a new variable name (pos %r)" % ((token.get("line"), token.get("column")),))
#        advance()
#        if token.id == "=":  # initialization
#            t = token
#            advance("=")
#            t.childappend(n)
#            t.childappend(expression())
#            self.childappend(t)
#        if token.id != ",":
#            break
#        advance(",")
#    if len(self.children) != 1:
#        return self
#    else:
#        return self.children[0]


@method(symbol("definitionList"))  # this is what becomes of "var"
def toJS(self):
    r = []
    r.append("var")
    r.append(self.space())
    a = []
    for c in self.children:
        a.append(c.toJS())
    r.append(','.join(a))
    return ''.join(r)

@method(symbol("definition"))
def toJS(self):
    return self.children[0].toJS()

##
# returns the identifier node of the defined symbol
@method(symbol("definition"))
def getDefinee(self):
    dfn = self.children[0]
    if dfn.type == "identifier":
        return dfn
    elif dfn.type == "assignment":
        return dfn.getChild("first").children[0]
    else:
        raise SyntaxTreeError("Child of a 'definition' symbol must be in ('identifier', 'assignment')")


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
        operation = symbol("in")(token.get("line"), token.get("column"))
        operation.type = "operation"
        operation.set("operator", "IN")
        operation.set("value", "in")
        self.childappend(operation)
        op_first = symbol("first")(token.get("line"), token.get("column"))
        operation.childappend(op_first)
        if token.id == "var":
            var_s = symbol("definitionList")(token.get("line"), token.get("column"))
            op_first.childappend(var_s)
            advance("var")
            defn = symbol("definition")(token.get("line"), token.get("column"))
            var_s.childappend(defn)
            defn.childappend(expression(95))  # lbp higher than "in"
        else:
            ident = symbol("identifier")(token.get("line"), token.get("column"))
            op_first.childappend(ident)
            ident.set("value", token.get("value"))
            advance("identifier")
        advance("in")
        op_second = symbol("second")(token.get("line"), token.get("column"))
        operation.childappend(op_second)
        op_second.childappend(expression())
        
    # for (;;)
    else:
        self.set("forVariant", "iter")
        condition = symbol("expressionList")(token.get("line"), token.get("column"))
        self.childappend(condition)
        # init part
        init_part = None
        var_s = None
        if token.id == "var":
            t = token
            advance()
            init_part = t.std() # parse it like a 'var' stmt
        else:
            exprList = symbol("expressionList")(token.get("line"), token.get("column"))
            init_part = exprList
            lst = init_list()
            for assgn in lst:
                exprList.childappend(assgn)
        condition.childappend(init_part)
        # condition part 
        advance(";")
        condition.childappend(expression())
        # update part
        advance(";")
        exprList = symbol("expressionList")(token.get("line"), token.get("column"))
        while token.id != ')':
            expr = expression(0)
            exprList.childappend(expr)
            if token.id == ',':
                advance(',')
        condition.childappend(exprList)

    # body
    advance(")")
    body = symbol("body")(token.get("line"), token.get("column"))
    body.childappend(statementOrBlock())
    self.childappend(body)
    return self

@method(symbol("for"))
def toJS(self):
    r = []
    r.append('for')
    r.append(self.space(False,result=r))
    # cond
    r.append('(')
    # for (in)
    if self.get("forVariant") == "in":
        r.append(self.children[0].toJS())
    # for (;;)
    else:
        r.append(self.children[0].children[0].toJS())
        r.append(';')
        r.append(self.children[0].children[1].toJS())
        r.append(';')
        r.append(self.children[0].children[2].toJS())
    r.append(')')
    # body
    r.append(self.getChild("body").toJS())
    return u''.join(r)

@method(symbol("in"))  # of 'for (in)'
def toJS(self):
    r = u''
    r += self.getChild("first").toJS()
    r += self.space()
    r += 'in'
    r += self.space()
    r += self.getChild("second").toJS()
    return r


@method(symbol("expressionList"))
def toJS(self):  # WARN: this conflicts (and is overwritten) in for(;;).toJS
    r = []
    for c in self.children:
        r.append(c.toJS())
    return ','.join(r)


symbol("while")

@method(symbol("while"))
def std(self):
    self.type = "loop" # compat with Node.type
    self.set("loopType", "WHILE")
    advance("(")
    self.childappend(expression())
    advance(")")
    body = symbol("body")(token.get("line"), token.get("column"))
    body.childappend(statementOrBlock())
    self.childappend(body)
    return self

@method(symbol("while"))
def toJS(self):
    r = u''
    r += self.write("while")
    r += self.space(False,result=r)
    # cond
    r += '('
    r += self.children[0].toJS()
    r += ')'
    # body
    r += self.children[1].toJS()
    return r

symbol("do")

@method(symbol("do"))
def std(self):
    self.type = "loop" # compat with Node.type
    self.set("loopType", "DO")
    body = symbol("body")(token.get("line"), token.get("column"))
    body.childappend(statementOrBlock())
    self.childappend(body)
    advance("while")
    advance("(")
    self.childappend(expression(0))
    advance(")")
    return self

@method(symbol("do"))
def toJS(self):
    r = []
    r.append("do")
    r.append(self.space())
    r.append(self.children[0].toJS())
    r.append('while')
    r.append('(')
    r.append(self.children[1].toJS())
    r.append(')')
    return ''.join(r)


symbol("with")

#TODO: 'with' loops

symbol("if"); symbol("else")

@method(symbol("if"))
def std(self):
    self.type = "loop" # compat with Node.type (i'd rather use explicit 'if', 'for', etc.)
    self.set("loopType", "IF")
    advance("(")
    self.childappend(expression(0))
    advance(")")
    then_part = symbol("body")(token.get("line"), token.get("column"))
    then_part.childappend(statementOrBlock())
    self.childappend(then_part)
    if (token.id == "else"):
        advance("else")
        else_part = symbol("body")(token.get("line"), token.get("column"))
        else_part.childappend(statementOrBlock())
        self.childappend(else_part)
    return self


@method(symbol("if"))
def toJS(self):
    r = u''
    # Additional new line before each loop
    if not self.isFirstChild(True) and not self.getChild("commentsBefore", False):
        prev = self.getPreviousSibling(False, True)

        # No separation after case statements
        #if prev != None and prev.type in ["case", "default"]:
        #    pass
        #elif self.hasChild("elseStatement") or self.getChild("statement").hasBlockChildren():
        #    self.sep()
        #else:
        #    self.line()
    r += self.write("if")
    # condition
    r += self.write("(")
    r += self.children[0].toJS()
    r += self.write(")")
    # 'then' part
    r += self.children[1].toJS()
    # (opt) 'else' part
    if len(self.children) == 3:
        r += self.write("else")
        r += self.space()
        r += self.children[2].toJS()
    r += self.space(False,result=r)
    return r

symbol("loop")

@method(symbol("loop"))
def toJS(self):
    r = u''
    # Additional new line before each loop
    if not self.isFirstChild(True) and not self.getChild("commentsBefore", False):
        prev = self.getPreviousSibling(False, True)

        # No separation after case statements
        if prev != None and prev.type in ["case", "default"]:
            pass
        elif self.hasChild("elseStatement") or self.getChild("statement").hasBlockChildren():
            self.sep()
        else:
            self.line()

    loopType = self.get("loopType")

    if loopType == "IF":
        pass
    #    r += self.write("if")
    #    r += self.space(False,result=r)
    #    # condition
    #    r += '('
    #    r += self.children[0].toJS()
    #    r += ')'
    #    # then
    #    r += self.children[1].toJS()
    #    # else
    #    if len(self.children) == 3:
    #        r += self.write("else")
    #        r += self.children[2].toJS()
    #    r += self.space(False,result=r)

    elif loopType == "WHILE":
        r += self.write("while")
        r += self.space(False,result=r)

    elif loopType == "FOR":
        r += self.write("for")
        r += self.space(False,result=r)

    elif loopType == "DO":
        r += self.write("do")
        r += self.space(False,result=r)

    elif loopType == "WITH":
        r += self.write("with")
        r += self.space(False,result=r)

    else:
        print "Warning: Unknown loop type: %s" % loopType
    return r


symbol("break")

@method(symbol("break"))
def std(self):
    if token.id not in StmntTerminatorTokens:
        self.childappend(expression(0))   # this is over-generating! (should be 'label')
    #advance(";")
    return self

@method(symbol("break"))
def toJS(self):
    r = self.write("break")
    if self.children:
        r += self.space(result=r)
        r += self.write(self.children[0].toJS())
    return r


symbol("continue")

@method(symbol("continue"))
def std(self):
    if token.id not in StmntTerminatorTokens:
        self.childappend(expression(0))   # this is over-generating! (should be 'label')
    #advance(";")
    return self

@method(symbol("continue"))
def toJS(self):
    r = self.write("continue")
    if self.children:
        r += self.space(result=r)
        r += self.write(self.children[0].toJS())
    return r


symbol("return")

@method(symbol("return"))
def std(self):
    if token.id not in StmntTerminatorTokens:
        self.childappend(expression(0))
    return self

@method(symbol("return"))
def toJS(self):
    r = ["return"]
    if self.children:
        r.append(self.space())
        r.append(self.children[0].toJS())
    return ''.join(r)


@method(symbol("new"))  # need to treat 'new' explicitly, for the awkward 'new Foo()' "call" syntax
def nud(self):
    s = symbol("first")(token.get("line"), token.get("column"))
    self.childappend(s)
    arg = expression(self.lbp-1)  # first, parse a normal expression (this excludes '()')
    if token.id == '(':  # if the next token indicates a call
        t = token
        advance("(")
        arg = t.led(left=arg)   # invoke '('.led, with class name as <left> arg
    s.childappend(arg)
    return self


symbol("switch"); symbol("case"); symbol("default")

@method(symbol("switch"))
def std(self):
    advance("(")
    self.childappend(expression(0))
    advance(")")
    advance("{")
    body = symbol("body")(token.get("line"), token.get("column"))
    self.childappend(body)
    while True:
        if token.id == "}": break
        elif token.id == "case":
            case = token  # make 'case' the root node (instead e.g. ':')
            advance("case")
            case.childappend(expression(0))
            advance(":")
            if token.id in ("case", "default") : # fall-through
                pass
            else:
                case.childappend(case_block())
        elif token.id == "default":
            case = token
            advance("default")
            advance(":")
            case.childappend(statements())
        body.childappend(case)
    advance("}")
    return self

def case_block():
    # we assume here that there is at least one statement to parse
    s = symbol("statements")(token.get("line"), token.get("column"))
    while True:
        if token.id in ("case", "default", "}"):
            break
        s.childappend(statement())
    return s


@method(symbol("switch"))
def toJS(self):
    r = []
    r.append("switch")
    # control
    r.append('(')
    r.append(self.children[0].toJS())
    r.append(')')
    # body
    r.append('{')
    body = self.getChild("body")
    for c in body.children:
        r.append(c.toJS())
    r.append('}')
    return ''.join(r)


@method(symbol("case"))
def toJS(self):
    r = []
    r.append('case')
    r.append(self.space())
    r.append(self.children[0].toJS())
    r.append(':')
    if len(self.children) > 1:
        r.append(self.children[1].toJS())
    return ''.join(r)


@method(symbol("default"))
def toJS(self):
    r = []
    r.append('default')
    r.append(':')
    r.append(self.children[0].toJS())
    return ''.join(r)


symbol("try"); symbol("catch"); symbol("finally")

@method(symbol("try"))
def std(self):
    self.childappend(block())
    if token.id == "catch":
        catch = token
        self.childappend(catch)
        advance("catch")
        advance("(")
        catch.childappend(expression(0))
        advance(")")
        catch.childappend(block())
    if token.id == "finally":
        finally_ = token
        advance("finally")
        self.childappend(finally_)
        finally_.childappend(block())
    return self

@method(symbol("try"))
def toJS(self):
    r = []
    r.append('try')
    r.append(self.children[0].toJS())
    catch = self.getChild("catch", 0)
    if catch:
        r.append('catch')
        r.append('(')
        r.append(catch.children[0].toJS())
        r.append(')')
        r.append(catch.children[1].toJS())
    finally_ = self.getChild("finally", 0)
    if finally_:
        r.append('finally')
        r.append(finally_.children[0].toJS())
    return ''.join(r)


symbol("throw")

@method(symbol("throw"))
def std(self):
    if token.id not in ("eol",  ";"):
        self.childappend(expression(0))
    #advance(";")
    return self

@method(symbol("throw"))
def toJS(self):
    r = u''
    r += 'throw'
    r += self.space()
    r += self.children[0].toJS()
    return r


symbol("with")

@method(symbol("with"))
def std(self):
    advance("(")
    self.childappend(expression(0))
    advance(")")
    self.childappend(block())
    
    
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


symbol("label")

def statement():
    # labeled statement
    if token.type == "identifier" and tokenStream.peek(1).id == ":": # label
        s = symbol("label")(token.get("line"), token.get("column"))
        s.attributes = token.attributes
        advance()
        advance(":")
        s.childappend(statement())
    # normal statement
    else:
        n = token
        s = None
        if getattr(token, 'std', None):
            advance()
            s = n.std()
        elif token.type != 'eol': # it's not an empty line
            s = expression()
            # Crockford's too tight here
            #if not (s.id == "=" or s.id == "("):
            #    raise SyntaxError("Bad expression statement (pos %r)" % ((token.get("line"), token.get("column")),))

            # handle expression lists
            # (REFAC: somewhat ugly here, expression lists should be treated generically,
            # but there is this conflict between ',' as an operator ('infix(",", 5)')
            # and a stock symbol("infix",0) that terminates every expression() parse, like for
            # arrays, maps, etc.).
            if token.id == ',':
                s1 = symbol("expressionList")(token.get("line"), token.get("column"))
                s1.childappend(s)
                s = s1
                while token.id == ',':
                    advance(',')
                    s.childappend(expression())
        statementEnd()
    return s

@method(symbol("label"))
def toJS(self):
    r = []
    r += [self.get("value")]  # identifier
    r += [":"]
    r += [self.children[0].toJS()]
    return ''.join(r)


def statementEnd():
    if token.id in (";",):
        advance()
    #if token.id in ("eof", 
    #    "eol", # these are not yielded by the TokenStream currently
    #    ";", 
    #    "}"  # it's the last statement in a block
    #    ):
    #    advance()
    #else:
    #    ltok = tokenStream.lookbehind()
    #    if ltok.id == '}':  # it's a statement ending with a block ('if' etc.)
    #        pass
    #    else:
    #        raise SyntaxError("Unterminated statement (pos %r)" % ((token.get("line"), token.get("column")),))


def statementOrBlock(): # for 'if', 'while', etc. bodies
    if token.id == '{':
        return block()
    else:
        return statement()

def statements():  # plural!
    s = symbol("statements")(token.get("line"), token.get("column"))
    while True:
        if token.id == "}" or token.id == "eof":
            break
        st = statement()
        if st:
            s.childappend(st)
    return s


@method(symbol("statements"))
def toJS(self):
    r = []
    for cld in self.children:
        c = cld.toJS()
        r.append(c)
        if c[-1] != ';':
            r.append(';')
    return u''.join(r)


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
            SyntaxError("Expected an argument name (pos %r)." % ((token.get("line"), token.get("column")),))
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


symbol("block")

@method(symbol("block"))
def toJS(self):
    r = '{'
    for c in self.children:
        r += c.toJS()
    r += '}'
    r += '\n' # TODO: tmp. fix for line breaks
    return r

symbol("call")

@method(symbol("call"))
def toJS(self):
    r = u''
    r += self.getChild("operand").toJS()
    r += self.getChild("params").toJS()
    return r


symbol("comment")

@method(symbol("comment"))
def toJS(self):
    r = u''
    return r

symbol("commentsAfter")

@method(symbol("commentsAfter"))
def toJS(self):
    r = u''
    return r

symbol("commentsBefore")

@method(symbol("commentsBefore"))
def toJS(self):
    r = u''
    return r


symbol("file")

@method(symbol("file"))
def toJS(self):
    return self.children[0].toJS()


@method(symbol("first"))
def toJS(self):
    return self.children[0].toJS()

@method(symbol("second"))
def toJS(self):
    return self.children[0].toJS()

@method(symbol("third"))
def toJS(self):
    return self.children[0].toJS()


symbol("params")

@method(symbol("params"))
def toJS(self):
    r = u''
    self.noline()
    r += self.write("(")
    a = []
    for c in self.children:
        a.append(c.toJS())
    r += ','.join(a)
    r += self.write(")")
    return r


symbol("variable")

@method(symbol("variable"))
def toJS(self):
    return self.children[0].toJS()



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

def createSyntaxTree(tokenArr, fileId=''):
    fileNode = symbol("file")(0,0)
    fileNode.set("file", fileId)
    fileNode.childappend(TreeGenerator().parse(tokenArr))
    return fileNode


# quick high-level frontend
def parse(string_):
    ts = tokenizer.parseStream(string_)
    return TreeGenerator().parse(ts)

# - Main ----------------------------------------------------------------------

def test(x, program):
    global token, next, tokenStream
    print ">>>", program
    tokenArr = tokenizer.parseStream(program)
    #from pprint import pprint
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

