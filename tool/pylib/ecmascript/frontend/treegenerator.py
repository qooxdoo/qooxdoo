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
#
# For reference with the original algorithm:
#   led => ifix
#   nud => pfix
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

StmntTerminatorTokens = ("eol", ";", "}", "eof")

SYMBOLS = {
    "infix" : "* / % << >> >>> < <= > >= != == !== === & ^ | && ||".split(),
    "infix_v" : "in instanceof".split(),
    "infix_r" : "= <<= -= += *= /= %= |= ^= &= >>= >>>=".split(),
    "prefix"  : "~ !".split(),  # '/' left out, as never seen by the parser as prefix op (but regexp constant)
    "prefix_v": "new  delete typeof void".split(),
    "prepostfix" : "++ --".split(),
    "preinfix": "+ -".split(),
}

def expressionTerminated():
    return token.id in StmntTerminatorTokens or tokenStream.eolBefore

class SyntaxTreeError(SyntaxException): pass

##
# the main purpose of this class is to instantiate parser symbol objects from
# low-level tokens
class TokenStream(IterObject):

    def __init__(self, inData):
        self.line       = 0
        self.tpos       = 0  # token position in stream
        self.max_look_behind = 10
        self.outData    = LimLQueue(self.max_look_behind)  # limited record of yielded tokens
        self.eolBefore  = False
        self.comments   = []                               # temp. store for comment nodes
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
        if tok.name == "white":
            s = symbol_table.get(tok.name)()
        elif tok.name == 'comment':
            s = symbol_table.get(tok.name)()
            #s.set('connection', tok.connection)  # before/after(!?)
            #s.set('detail', "inline" if tok.value[:2]=="//" else "block") # tok.detail is javadoc/qtdoc/area/divider/header/block
            s.set('detail', tok.detail)
            s.set('multiline', tok.multiline)  # true/false
            self.comments.append(s)         # keep comments in temp. store
        elif tok.name == "eol":
            self.line += 1                  # increase line count
            #pass # don't yield this (yet)
            s = symbol_table.get("eol")()

        elif tok.name == "eof":
            symbol = symbol_table.get("eof")
            s = symbol()
            s.value = ""
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
        elif tok.name in ('reserved',) and tok.detail in ("TRUE", "FALSE", "NULL"):
            symbol = symbol_table["constant"]
            s = symbol()
            if tok.detail in ("TRUE", "FALSE"):
                s.set('constantType', 'boolean')
            elif tok.detail == "NULL":
                s.set('constantType', 'null')
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
                    raise SyntaxException("Unknown operator %r (pos %r)" % (tok.value, (tok.line,tok.column)))
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
            elif s.type in ("white", "comment"):  # currently these are handled in _symbolFromToken
                continue
            elif s.type == "eol":
                self.eolBefore = 1
                continue
            else:
                self.eolBefore = 2 if self.eolBefore == 1 else 0
                    # the next token after 'eol' sees eolBefore==1, but must not reset
                    # it before it has been yielded, so the parser can react on it; the
                    # token after next will then reset it
                self.outData.appendleft(s)
                # handle comments
                if self.comments:
                    s.comments = self.comments
                    self.comments = []
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
        self.comments = []   # [Node(comment)] of comments preceding the node ("commentsBefore")

    ##
    # thin wrapper around .children, to maintain .parent in them
    def childappend(self, child):
        self.children.append(child)
        child.parent = self

    def pfix(self):
        raise SyntaxException("Syntax error %r (pos %r)." % (self.id, (self.get("line"), self.get("column"))))

    def ifix(self, left):
        raise SyntaxException("Unknown operator %r (pos %r)." % (self.id, (self.get("line"), self.get("column"))))

    def isVar(self):
        return self.type in ("dotaccessor", "identifier")

    def __repr__(self):
        if self.id == "identifier" or self.id == "constant":
            return "(%s %r)" % (self.id, self.get("value"))
        id_  = self.id
        if hasattr(self, 'optype'):
            id_ += '('+self.optype+')'
        #out = [id_, self.first, self.second, self.third]
        out = map(repr, filter(None, self.children))
        out = ["%s"%id_] + out
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
    def toJS(self, opts):
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

def symbol(id_, bind_left=0):
    try:
        s = symbol_table[id_]
    except KeyError:
        class s(symbol_base):
            pass
        s.__name__ = "symbol-" + id_ # for debugging
        s.type     = id_  # compat with Node.type
        s.id       = id_
        s.value    = None
        s.bind_left      = bind_left
        symbol_table[id_] = s
        globals()[s.__name__] = s  # ALERT: this is a devious hack to make Pickle pickle the symbol classes.
                                   # To unpickle, it is necessary to have this module loaded, so the classes
                                   # are ready.
    else:
        s.bind_left = max(bind_left, s.bind_left)
    return s

# helpers

def infix(id_, bp):
    def ifix(self, left):
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(left)
        s = symbol("second")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression(bp))
        return self
    symbol(id_, bp).ifix = ifix

    def toJS(self, opts):
        r = u''
        r += self.getChild("first").toJS(opts)
        r += self.get("value")
        r += self.getChild("second").toJS(opts)
        return r
    symbol(id_).toJS = toJS


##
# infix "verb" operators, i.e. that need a space around themselves (like 'instanceof', 'in')
def infix_v(id_, bp):
    infix(id_, bp)   # make it a normal infix op

    def toJS(self, opts):  # adapt the output
        r = u''
        r += self.getChild("first").toJS(opts)
        r += self.space()
        r += self.get("value")
        r += self.space()
        r += self.getChild("second").toJS(opts)
        return r
    symbol(id_).toJS = toJS
        

##
# right-associative infix (all assignment ops)
# (mind "bp-1", cf. Lundh's TDOP paper, p.6)
def infix_r(id_, bp):
    infix(id_, bp)

    def ifix(self, left):
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(left)
        s = symbol("second")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression(bp-1))
        return self
    symbol(id_, bp).ifix = ifix


##
# prefix "sigil" operators, like '!', '~', ...
def prefix(id_, bp):
    def pfix(self):
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression(bp-1)) # right-associative
        return self
    symbol(id_, bp).pfix = pfix

    def toJS(self, opts):
        r = u''
        r += self.get("value")
        r += self.getChild("first").toJS(opts)
        return r
    symbol(id_).toJS = toJS


##
# prefix "verb" operators, i.e. that need a space before their operand like 'delete'
def prefix_v(id_, bp):
    def pfix(self):
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression(bp-1)) # right-associative
        return self
    symbol(id_, bp).pfix = pfix

    def toJS(self, opts):
        r = u''
        r += self.get("value")
        r += self.space()
        r += self.getChild("first").toJS(opts)
        return r
    symbol(id_).toJS = toJS


def preinfix(id_, bp):  # pre-/infix operators (+, -)
    infix(id_, bp)   # init as infix op

    ##
    # give them a pfix() for prefix pos
    def pfix(self):
        self.set("left", "true")  # mark prefix position
        first = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(first)
        first.childappend(expression(130)) # need to use prefix rbp!
        return self
    symbol(id_).pfix = pfix

    def toJS(self, opts):  # need to handle pre/infix cases
        r = []
        first = self.getChild("first").toJS(opts)
        op = self.get("value")
        prefix = self.get("left", 0)
        if prefix and prefix == "true":
            r = [op, first]
        else:
            second = self.getChild("second").toJS(opts)
            r = [first, op, second]
        return ''.join(r)
    symbol(id_).toJS = toJS


def prepostfix(id_, bp):  # pre-/post-fix operators (++, --)
    def pfix(self):  # prefix
        self.set("left", "true")
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(expression())  # overgenerating! only lvals allowed
        return self
    symbol(id_, bp).pfix = pfix

    def ifix(self, left): # postfix
        # assert(left, lval)
        s = symbol("first")(token.get("line"), token.get("column"))
        self.childappend(s)
        s.childappend(left)
        return self
    symbol(id_).ifix = ifix

    def toJS(self, opts):
        r = u''
        operator = self.get("value")
        operand = self.getChild("first").toJS(opts)
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
        raise SyntaxException("Expected %r (pos %r)" % (id_, (token.get("line"),token.get("column"))))
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

prefix("~", 130); prefix("!", 130)
#prefix("+", 130); prefix("-", 130)  # higher than infix position! handled in preinfix.pfix()
prefix_v("delete", 130); prefix_v("typeof", 130); prefix_v("void", 130)

prefix("/",  130)  # regexp

infix("*",  120); infix("/", 120); infix("%", 120)

preinfix("+",  110); preinfix("-", 110)      # pre/infix '+', '-'

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

symbol("?", 20)   # ternary operator (.ifix takes care of ':')

infix_r("=",  10)   # assignment
infix_r("<<=",10); infix_r("-=", 10); infix_r("+=", 10); infix_r("*=", 10)
infix_r("/=", 10); infix_r("%=", 10); infix_r("|=", 10); infix_r("^=", 10)
infix_r("&=", 10); infix_r(">>=",10); infix_r(">>>=",10)

symbol(":", 0) #infix(":", 15)    # ?: and {1:2,...} and label:

symbol(",", 0) # infix(",", 5) -- good for expression lists, but problematic for parsing arrays, maps

symbol(";", 0)
symbol("*/", 0)  # have to register this in case a regexp ends in this string
symbol("\\", 0)  # escape char in strings ("\")


symbol("(unknown)").pfix = lambda self: self
symbol("eol")
symbol("eof")


symbol("constant").pfix = lambda self: self

@method(symbol("constant"))
def toJS(self, opts):
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
def pfix(self):
    return self

@method(symbol("identifier"))
def toJS(self, opts):
    r = u''
    v = self.get("value", u"")
    if v:
        r = self.write(v)
    return r


@method(symbol("/"))   # regexp literals
def pfix(self):
    # problem: "/".ifix() and "/".pfix() return similar ASTs, e.g. with "/" as root
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
def ifix(self, left):
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
def toJS(self, opts):
    r = []
    r.append(self.getChild("first").toJS(opts))
    r.append('?')
    r.append(self.getChild("second").toJS(opts))
    r.append(':')
    r.append(self.getChild("third").toJS(opts))
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
def ifix(self, left):
    if token.id != "identifier":
        SyntaxException("Expected an attribute name (pos %r)." % ((token.get("line"), token.get("column")),))
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
    s.childappend(expression(symbol(".").bind_left)) 
        # i'm providing the rbp to expression() here explicitly, so "foo.bar(baz)" gets parsed
        # as (call (dotaccessor ...) (param baz)), and not (dotaccessor foo
        # (call bar (param baz))).
    return accessor


symbol("dotaccessor")

@method(symbol("dotaccessor"))
def toJS(self, opts):
    r = self.children[0].toJS(opts)
    r += '.'
    r += self.children[1].toJS(opts)
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

def constant(id_):
    @method(symbol(id_))
    def pfix(self):
        self.id = "constant"
        self.value = id_
        return self

constant("null")
constant("true")
constant("false")

# bracket expressions

symbol("("), symbol(")")

@method(symbol("("))  # <call>
def ifix(self, left):
    call = symbol("call")(token.get("line"), token.get("column"))
    # operand
    operand = symbol("operand")(token.get("line"), token.get("column"))
    call.childappend(operand)
    operand.childappend(left)
    # params - parse as group
    params = symbol("params")(token.get("line"), token.get("column"))
    call.childappend(params)
    group = self.pfix()
    for c in group.children:
        params.childappend(c)
    return call

symbol("operand")

@method(symbol("operand"))
def toJS(self, opts):
    return self.children[0].toJS(opts)


@method(symbol("("))  # <group>
def pfix(self):
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
def toJS(self, opts):
    r = []
    r.append('(')
    a = []
    for c in self.children:
        a.append(c.toJS(opts))
    r.append(','.join(a))
    r.append(')')
    return ''.join(r)


symbol("]")

@method(symbol("["))             # "foo[0]", "foo[bar]", "foo['baz']"
def ifix(self, left):
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
def pfix(self):
    arr = symbol("array")(token.get("line"), token.get("column"))
    if token.id != "]":
        is_after_comma = 0
        while True:
            if token.id == "]":
                if is_after_comma:  # preserve dangling comma (bug#6210)
                    arr.childappend(symbol("(empty)")())
                break
            elif token.id == ",":  # elision
                arr.childappend(symbol("(empty)")())
            else:
                arr.childappend(expression())
            if token.id != ",":
                break
            else:
                is_after_comma = 1
                advance(",")
    advance("]")
    return arr

symbol("accessor")

@method(symbol("accessor"))
def toJS(self, opts):
    r = u''
    r += self.children[0].toJS(opts)
    r += '['
    r += self.children[1].toJS(opts)
    r += ']'
    return r


symbol("array")

@method(symbol("array"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return '[' + u','.join(r) + ']'


symbol("key")

@method(symbol("key"))
def toJS(self, opts):
    return self.children[0].toJS(opts)


symbol("}")

@method(symbol("{"))                    # object literals
def pfix(self):
    mmap = symbol("map")(token.get("line"), token.get("column"))
    if token.id != "}":
        is_after_comma = 0
        while True:
            if token.id == "}":
                if is_after_comma:  # prevent dangling comma '...,}' (bug#6210)
                    raise SyntaxException("Illegal dangling comma in map (pos %r)" % ((token.get("line"),token.get("column")),))
                break
            is_after_comma = 0
            # key
            keyname = expression()
            map_item = symbol("keyvalue")(token.get("line"), token.get("column"))
            # the <keyname> node is not entered into the ast, but resolved into <keyvalue>
            mmap.childappend(map_item)
            map_item.set("key", keyname.get("value"))
            quote_type = keyname.get("detail", False)
            map_item.set("quote", quote_type if quote_type else '')
            map_item.comments = keyname.comments
            advance(":")
            # value
            keyval = expression()
            val = symbol("value")(token.get("line"), token.get("column"))
            val.childappend(keyval)
            map_item.childappend(val)  # <value> is a child of <keyvalue>
            if token.id != ",":
                break
            else:
                is_after_comma = 1
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
def toJS(self, opts):
    r = u''
    r += self.write("{")
    a = []
    for c in self.children:
        a.append(c.toJS(opts))
    r += ','.join(a)
    r += self.write("}")
    return r

@method(symbol("value"))
def toJS(self, opts):
    return self.children[0].toJS(opts)

symbol("keyvalue")

@method(symbol("keyvalue"))
def toJS(self, opts):
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
    value = self.getChild("value").toJS(opts)
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
def toJS(self, opts):
    r = []
    r.append('{')
    r.append(self.children[0].toJS(opts))
    r.append('}')
    return u''.join(r)

symbol("function")

@method(symbol("function"))
def pfix(self):
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
def toJS(self, opts):
    r = self.write("function")
    functionName = self.get("name",0)
    if functionName != None:
        r += self.space(result=r)
        r += self.write(functionName)
    # params
    r += self.getChild("params").toJS(opts)
    # body
    r += self.getChild("body").toJS(opts)
    return r

@method(symbol("params"))
def toJS(self, opts):
    r = []
    r.append('(')
    a = []
    for c in self.children:
        a.append(c.toJS(opts))
    r.append(u','.join(a))
    r.append(')')
    return u''.join(r)


@method(symbol("body"))
def toJS(self, opts):
    r = []
    r.append(self.children[0].toJS(opts))
    # 'if', 'while', etc. can have single-statement bodies
    if self.children[0].id != 'block':
        r.append(';')
    return u''.join(r)


# -- statements ------------------------------------------------------------

symbol("var")

@method(symbol("var"))
def pfix(self):
    while True:
        defn = symbol("definition")(token.get("line"), token.get("column"))
        self.childappend(defn)
        n = token
        if n.id != "identifier":
            raise SyntaxException("Expected a new variable name (pos %r)" % ((token.get("line"), token.get("column")),))
        advance()
        # initialization
        if token.id == "=":
            t = token
            advance()
            elem = t.ifix(n)
        # plain identifier
        else:
            elem = n
        defn.childappend(elem)
        if token.id != ",":
            break
        else:
            advance(",")
    return self

@method(symbol("var"))
def toJS(self, opts):
    r = []
    r.append("var")
    r.append(self.space())
    a = []
    for c in self.children:
        a.append(c.toJS(opts))
    r.append(','.join(a))
    return ''.join(r)

@method(symbol("definition"))
def toJS(self, opts):
    return self.children[0].toJS(opts)

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
    # try to consume the first part of a (pot. longer) condition
    if token.id != ";":
        chunk = expression()
    else:
        chunk = None

    # for (in)
    if chunk and chunk.id == 'in':
        self.set("forVariant", "in")
        self.childappend(chunk)

    # for (;;) [mind: all three subexpressions are optional]
    else:
        self.set("forVariant", "iter")
        condition = symbol("expressionList")(token.get("line"), token.get("column"))
        self.childappend(condition)
        # init part
        first = symbol("first")(token.get("line"), token.get("column"))
        condition.childappend(first)
        if chunk is None:       # empty init expr
            pass
        elif token.id == ';':   # single init expr
            first.childappend(chunk)
        elif token.id == ',':   # multiple init expr
            advance()
            exprList = symbol("expressionList")(token.get("line"), token.get("column"))
            first.childappend(exprList)
            exprList.childappend(chunk)
            lst = init_list()
            for assgn in lst:
                exprList.childappend(assgn)
        advance(";")
        # condition part 
        second = symbol("second")(token.get("line"), token.get("column"))
        condition.childappend(second)
        if token.id != ";":
            second.childappend(expression())
        advance(";")
        # update part
        third = symbol("third")(token.get("line"), token.get("column"))
        condition.childappend(third)
        if token.id != ")":
            exprList = symbol("expressionList")(token.get("line"), token.get("column"))
            while token.id != ')':
                expr = expression(0)
                exprList.childappend(expr)
                if token.id == ',':
                    advance(',')
            third.childappend(exprList)

    # body
    advance(")")
    body = symbol("body")(token.get("line"), token.get("column"))
    body.childappend(statementOrBlock())
    self.childappend(body)
    return self

@method(symbol("for"))
def toJS(self, opts):
    r = []
    r.append('for')
    r.append(self.space(False,result=r))
    # cond
    r.append('(')
    # for (in)
    if self.get("forVariant") == "in":
        r.append(self.children[0].toJS(opts))
    # for (;;)
    else:
        r.append(self.children[0].children[0].toJS(opts))
        r.append(';')
        r.append(self.children[0].children[1].toJS(opts))
        r.append(';')
        r.append(self.children[0].children[2].toJS(opts))
    r.append(')')
    # body
    r.append(self.getChild("body").toJS(opts))
    return u''.join(r)

@method(symbol("in"))  # of 'for (in)'
def toJS(self, opts):
    r = u''
    r += self.getChild("first").toJS(opts)
    r += self.space()
    r += 'in'
    r += self.space()
    r += self.getChild("second").toJS(opts)
    return r


@method(symbol("expressionList"))
def toJS(self, opts):  # WARN: this conflicts (and is overwritten) in for(;;).toJS
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
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
def toJS(self, opts):
    r = u''
    r += self.write("while")
    r += self.space(False,result=r)
    # cond
    r += '('
    r += self.children[0].toJS(opts)
    r += ')'
    # body
    r += self.children[1].toJS(opts)
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
def toJS(self, opts):
    r = []
    r.append("do")
    r.append(self.space())
    r.append(self.children[0].toJS(opts))
    r.append('while')
    r.append('(')
    r.append(self.children[1].toJS(opts))
    r.append(')')
    return ''.join(r)


symbol("with")

@method(symbol("with"))
def std(self):
    self.type = "loop" # compat. with Node.type
    self.set("loopType", "WITH")
    advance("(")
    self.childappend(expression(0))
    advance(")")
    body = symbol("body")(token.get("line"), token.get("column"))
    body.childappend(statementOrBlock())
    self.childappend(body)
    return self

# the next one - like with other loop types - is *used*, as dispatch is by class, 
# not obj.type (cf. "loop".toJS(opts))
@method(symbol("with"))
def toJS(self, opts):
    r = []
    r += ["with"]
    r += ["("]
    r += [self.children[0].toJS(opts)]
    r += [")"]
    r += [self.children[1].toJS(opts)]
    return u''.join(r)


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
def toJS(self, opts):
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
    r += self.children[0].toJS(opts)
    r += self.write(")")
    # 'then' part
    r += self.children[1].toJS(opts)
    # (opt) 'else' part
    if len(self.children) == 3:
        r += self.write("else")
        r += self.space()
        r += self.children[2].toJS(opts)
    r += self.space(False,result=r)
    return r

symbol("loop")

@method(symbol("loop"))
def toJS(self, opts):
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
    #    r += self.children[0].toJS(opts)
    #    r += ')'
    #    # then
    #    r += self.children[1].toJS(opts)
    #    # else
    #    if len(self.children) == 3:
    #        r += self.write("else")
    #        r += self.children[2].toJS(opts)
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
    #if token.id not in StmntTerminatorTokens:
    if not expressionTerminated():
        self.childappend(expression(0))   # this is over-generating! (should be 'label')
    #advance(";")
    return self

@method(symbol("break"))
def toJS(self, opts):
    r = self.write("break")
    if self.children:
        r += self.space(result=r)
        r += self.write(self.children[0].toJS(opts))
    return r


symbol("continue")

@method(symbol("continue"))
def std(self):
    #if token.id not in StmntTerminatorTokens:
    if not expressionTerminated():
        self.childappend(expression(0))   # this is over-generating! (should be 'label')
    #advance(";")
    return self

@method(symbol("continue"))
def toJS(self, opts):
    r = self.write("continue")
    if self.children:
        r += self.space(result=r)
        r += self.write(self.children[0].toJS(opts))
    return r


symbol("return")

@method(symbol("return"))
def std(self):
    #if token.id not in StmntTerminatorTokens:
    if not expressionTerminated():
        self.childappend(expression(0))
    return self

@method(symbol("return"))
def toJS(self, opts):
    r = ["return"]
    if self.children:
        r.append(self.space())
        r.append(self.children[0].toJS(opts))
    return ''.join(r)


@method(symbol("new"))  # need to treat 'new' explicitly, for the awkward 'new Foo()' "call" syntax
def pfix(self):
    s = symbol("first")(token.get("line"), token.get("column"))
    self.childappend(s)
    arg = expression(self.bind_left-1)  # first, parse a normal expression (this excludes '()')
    if token.id == '(':  # if the next token indicates a call
        t = token
        advance("(")
        arg = t.ifix(left=arg)   # invoke '('.ifix, with class name as <left> arg
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
            if token.id in ("case",) : # fall-through
                pass
            else:
                case.childappend(case_block())
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
def toJS(self, opts):
    r = []
    r.append("switch")
    # control
    r.append('(')
    r.append(self.children[0].toJS(opts))
    r.append(')')
    # body
    r.append('{')
    body = self.getChild("body")
    for c in body.children:
        r.append(c.toJS(opts))
    r.append('}')
    return ''.join(r)


@method(symbol("case"))
def toJS(self, opts):
    r = []
    r.append('case')
    r.append(self.space())
    r.append(self.children[0].toJS(opts))
    r.append(':')
    if len(self.children) > 1:
        r.append(self.children[1].toJS(opts))
    return ''.join(r)


@method(symbol("default"))
def toJS(self, opts):
    r = []
    r.append('default')
    r.append(':')
    if len(self.children) > 0:
        r.append(self.children[0].toJS(opts))
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
def toJS(self, opts):
    r = []
    r.append('try')
    r.append(self.children[0].toJS(opts))
    catch = self.getChild("catch", 0)
    if catch:
        r.append('catch')
        r.append('(')
        r.append(catch.children[0].toJS(opts))
        r.append(')')
        r.append(catch.children[1].toJS(opts))
    finally_ = self.getChild("finally", 0)
    if finally_:
        r.append('finally')
        r.append(finally_.children[0].toJS(opts))
    return ''.join(r)


symbol("throw")

@method(symbol("throw"))
def std(self):
    if token.id not in ("eol",  ";"):
        self.childappend(expression(0))
    #advance(";")
    return self

@method(symbol("throw"))
def toJS(self, opts):
    r = u''
    r += 'throw'
    r += self.space()
    r += self.children[0].toJS(opts)
    return r

def expression(bind_right=0):
    global token
    t = token
    token = next()
    left = t.pfix()
    while token.bind_left > bind_right:
        t = token
        token = next()
        left = t.ifix(left)
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
        elif token.id == ';': # empty statement
            s = symbol("(empty)")()
        elif token.type != 'eol': # it's not an empty line
            s = expression()
            # Crockford's too tight here
            #if not (s.id == "=" or s.id == "("):
            #    raise SyntaxException("Bad expression statement (pos %r)" % ((token.get("line"), token.get("column")),))

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

@method(symbol("(empty)"))
def toJS(self, opts):
    return u''

@method(symbol("label"))
def toJS(self, opts):
    r = []
    r += [self.get("value")]  # identifier
    r += [":"]
    r += [self.children[0].toJS(opts)]
    return ''.join(r)


def statementEnd():
    if token.id in (";",):
        advance()
    #elif token.id == "eof":
    #    return token  # ok as stmt end, but don't just skip it (bc. comments)
    elif tokenStream.eolBefore:
        pass # that's ok as statement end
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
    #        raise SyntaxException("Unterminated statement (pos %r)" % ((token.get("line"), token.get("column")),))


@method(symbol("eof"))
def toJS(self, opts):
    return u''

def statementOrBlock(): # for 'if', 'while', etc. bodies
    if token.id == '{':
        return block()
    else:
        return statement()

def statements():  # plural!
    s = symbol("statements")(token.get("line"), token.get("column"))
    while True:
        if token.id == "}" or token.id == "eof":
            if token.id == "eof" and token.comments:
                s.childappend(token)  # keep eof for pot. comments
            break
        st = statement()
        if st:
            s.childappend(st)
    return s


@method(symbol("statements"))
def toJS(self, opts):
    r = []
    for cld in self.children:
        c = cld.toJS(opts)
        r.append(c)
        if not c or c[-1] != ';':
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
            SyntaxException("Expected an argument name (pos %r)." % ((token.get("line"), token.get("column")),))
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
def toJS(self, opts):
    r = '{'
    for c in self.children:
        r += c.toJS(opts)
    r += '}'
    if opts.breaks:
        r += '\n'
    return r

symbol("call")

@method(symbol("call"))
def toJS(self, opts):
    r = u''
    r += self.getChild("operand").toJS(opts)
    r += self.getChild("params").toJS(opts)
    return r


symbol("comment")

@method(symbol("comment"))
def toJS(self, opts):
    r = self.get("value")
    if self.get("detail") == "inline":
        r += '\n'  # force newline after inline comment
    return r

symbol("commentsAfter")

@method(symbol("commentsAfter"))
def toJS(self, opts):
    r = u''
    return r

symbol("commentsBefore")

@method(symbol("commentsBefore"))
def toJS(self, opts):
    r = u''
    return r


symbol("file")

@method(symbol("file"))
def toJS(self, opts):
    return self.children[0].toJS(opts)


@method(symbol("first"))
def toJS(self, opts):
    r = u''
    if self.children:  # could be empty in for(;;)
        r = self.children[0].toJS(opts)
    return r

@method(symbol("second"))
def toJS(self, opts):
    r = u''
    if self.children:
        r = self.children[0].toJS(opts)
    return r

@method(symbol("third"))
def toJS(self, opts):
    r = u''
    if self.children:
        r = self.children[0].toJS(opts)
    return r


symbol("params")

@method(symbol("params"))
def toJS(self, opts):
    r = u''
    self.noline()
    r += self.write("(")
    a = []
    for c in self.children:
        a.append(c.toJS(opts))
    r += ','.join(a)
    r += self.write(")")
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

def createSyntaxTree(tokenArr, fileId=''):
    fileNode = symbol("file")(0,0)
    fileNode.set("file", fileId)
    fileNode.set("treegenerator_tag", tag)
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
    tokenStream = TokenStream(tokenArr)
    next = iter(tokenStream).next
    token = next()
    if x == e:
        res =  expression()
        print res.toXml()
    elif x == s:
        res =  statements()
        print res.toXml()
    elif x == b:
        res = block()
        print res.toXml()
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
        execfile (os.path.normpath(os.path.join(__file__, "../../../../test/compiler/treegenerator.py"))) # __file__ doesn't seem to work in pydb
        for t in tests:
            test(*t)

