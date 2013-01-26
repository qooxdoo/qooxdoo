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
# A variant of treegenerator.py that constructs a Concrete Syntax Tree (for 
# pretty-printing).
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
#
# CAVEATS
##

import sys, os, re, types, string, itertools as itert
from ecmascript.frontend.SyntaxException import SyntaxException
from ecmascript.frontend.tree            import Node
from ecmascript.frontend.Scanner         import IterObject, LQueue, LimLQueue, is_last_escaped
from ecmascript.frontend                 import lang, tokenizer
from misc                                import filetool
from misc.NameSpace                      import NameSpace

tag = 3  # to discriminate tree generators

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

STATEMENT_NODE_TYPES = "loop var continue break return switch throw try".split()

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


    ##
    # Main transformer function, consuming a scanner token and producing a tree
    # node.
    def _symbolFromToken(self, tok):
        s = None

        # TODO: Stuff for another refac:
        # The following huge dispatch could be avoided if the tokenizer already
        # provided the tokens with the right attributes (esp. name, detail).

        # tok isinstanceof Token()
        if tok.name == "white":
            #s = symbol_table.get(tok.name)()  # grammar doesn't provide for 'white' currently
            pass
        elif tok.name == 'comment':
            s = symbol_table.get(tok.name)()
            s.set('connection', tok.connection)  # relates to preceding or subsequent code
            s.set('begin', tok.begin)  # first non-white on line
            s.set('end', tok.end)   # last non-white on line
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
            # debug hook
            if 0 and tok.value == "pydb":  # to activate, enter "pydb;" in JS code
                import pydb; pydb.debugger()
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
        self.commentsIn    = []
        self.commentsAfter = []

    ##
    # thin wrapper around .children, to maintain .parent in them
    def childappend(self, child):
        self.children.append(child)
        child.parent = self

    def pfix(self):
        raise SyntaxException("Syntax error %r (pos %r)." % (self.id, (self.get("line"), self.get("column"))))

    def ifix(self, left):
        raise SyntaxException("Unknown operator %r in infix position (pos %r)." % (self.id, (self.get("line"), self.get("column"))))

    def isVar(self):
        return self.type in ("dotaccessor", "identifier")

    def isPrefixOp(self):
        return ( self.type in STATEMENT_NODE_TYPES or
            ( self.type == "operation" and self.get("left", False)=="true"))

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

    # serialization to list of nodes
    def toListG(self):
        if self.children:
            for e in itert.chain(*[c.toListG() for c in self.children]):
                yield e
        else:
            yield self


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


    def isComplex(self):
        isComplex = self.get("isComplex", ())

        if isComplex != ():
            return isComplex
        else:
            isComplex = False

        if not self.children:
            isComplex = False

        elif self.type == "block":
            counter = 0
            for child in self.children:
                if child.isComplex():
                    isComplex = True
                    break
                elif child.type in '{}':
                    pass
                else:
                    counter += 1
                if child.comments:
                    counter += 1
                if counter > 1:
                    break

            if not isComplex and counter > 1:
                isComplex = True

            else:
                # in else, try to find the mode of the previous if first
                if (self.parent and self.parent.type == "body"):
                    preSib = self.parent.getPreviousSibling(False)
                    if (preSib and preSib.type == "else" and preSib.getPreviousSibling(False)):
                        isComplex = preSib.getPreviousSibling().isComplex()

                ## in if, try to find the mode of the parent if (if existent)
                #elif (self.parent and self.parent.type == "body" 
                #    and self.parent.parent.type == "loop" and self.parent.parent.get("loopType") == "IF")
                #    and self.parent.parent.get()==self.parent
                #    ):
                #    if self.parent.parent.parent and self.parent.parent.parent.parent:
                #        if self.parent.parent.parent.parent.type == "loop":
                #            isComplex = self.parent.parent.parent.parent.getChild("statement").hasComplexBlock()

                ## in catch/finally, try to find the mode of the try statement
                #elif self.parent and self.parent.parent and self.parent.parent.type in ["catch", "finally"]:
                #    isComplex = self.parent.parent.parent.getChild("statement").hasComplexBlock()

        #elif self.type == "elseStatement":
        #    if self.hasComplexBlock():
        #        isComplex = True
        #    elif self.hasChild("loop") and self.getChild("loop").getChild("statement").hasComplexBlock():
        #        isComplex = True

        elif self.type == "array" :
            if self.getChildrenLength(True) > 7:
                isComplex = True

        elif self.type == "map" :
            ml = self.getChildrenLength(True)
            if ml >= 5: # 2 elems in map
                isComplex = True

        elif self.type == "statements":
            if self.getChildrenLength(True) > 1:
                isComplex = True

        elif self.children:
            for cld in self.children:
                if cld.isComplex():
                    isComplex = True
                    break

        ## Final test: Ask the children (slower)
        #if not (self.type == "elseStatement" and self.hasChild("loop")):
        #    if not isComplex and self.hasComplexChildren():
        #        isComplex = True

        # print self.type + " :: %s" % isComplex
        self.set("isComplex", isComplex)

        # print "isComplex: %s = %s" % (self.type, isComplex)

        return isComplex



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
        self.childappend(left)
        self.childappend(expression(bp))
        return self
    symbol(id_, bp).ifix = ifix

    def toJS(self, opts):
        r = u''
        r += self.children[0].toJS(opts)
        r += self.get("value")
        r += self.children[1].toJS(opts)
        return r
    symbol(id_).toJS = toJS

    def toListG(self):
        for e in itert.chain(self.children[0].toListG(), [self], self.children[1].toListG()):
            yield e
    symbol(id_).toListG = toListG


##
# infix "verb" operators, i.e. that need a space around themselves (like 'instanceof', 'in')
def infix_v(id_, bp):
    infix(id_, bp)   # make it a normal infix op

    def toJS(self, opts):  # adapt the output
        r = u''
        r += self.children[0].toJS(opts)
        r += self.space()
        r += self.get("value")
        r += self.space()
        r += self.children[1].toJS(opts)
        return r
    symbol(id_).toJS = toJS
        

##
# right-associative infix (all assignment ops)
# (mind "bp-1", cf. Lundh's TDOP paper, p.6)
def infix_r(id_, bp):
    infix(id_, bp)

    def ifix(self, left):
        self.childappend(left)
        self.childappend(expression(bp-1))
        return self
    symbol(id_, bp).ifix = ifix


##
# prefix "sigil" operators, like '!', '~', ...
def prefix(id_, bp):
    def pfix(self):
        self.childappend(expression(bp-1)) # right-associative
        return self
    symbol(id_, bp).pfix = pfix

    def toJS(self, opts):
        r = u''
        r += self.get("value")
        r += self.children[0].toJS(opts)
        return r
    symbol(id_).toJS = toJS

    def toListG(self):
        for e in itert.chain([self], self.children[0].toListG()):
            yield e
    symbol(id_).toListG = toListG


##
# prefix "verb" operators, i.e. that need a space before their operand like 'delete'
def prefix_v(id_, bp):
    def pfix(self):
        self.childappend(expression(bp-1)) # right-associative
        return self
    symbol(id_, bp).pfix = pfix

    def toJS(self, opts):
        r = u''
        r += self.get("value")
        r += self.space()
        r += self.children[0].toJS(opts)
        return r
    symbol(id_).toJS = toJS


def preinfix(id_, bp):  # pre-/infix operators (+, -)
    infix(id_, bp)   # init as infix op

    ##
    # give them a pfix() for prefix pos
    def pfix(self):
        self.set("left", "true")  # mark prefix position
        self.childappend(expression(130)) # need to use prefix rbp!
        return self
    symbol(id_).pfix = pfix

    def toJS(self, opts):  # need to handle pre/infix cases
        r = []
        first = self.children[0].toJS(opts)
        op = self.get("value")
        prefix = self.get("left", 0)
        if prefix and prefix == "true":
            r = [op, first]
        else:
            second = self.children[1].toJS(opts)
            r = [first, op, second]
        return ''.join(r)
    symbol(id_).toJS = toJS

    def toListG(self):
        prefix = self.get("left",0)
        if prefix and prefix == 'true':
            r = [[self], self.children[0].toListG()]
        else:
            r = [self.children[0].toListG(), [self], self.children[1].toListG()]
        for e in itert.chain(*r):
            yield e
    symbol(id_).toListG = toListG


def prepostfix(id_, bp):  # pre-/post-fix operators (++, --)
    def pfix(self):  # prefix
        self.set("left", "true")
        self.childappend(expression())  # overgenerating! only lvals allowed
        return self
    symbol(id_, bp).pfix = pfix

    def ifix(self, left): # postfix
        # assert(left, lval)
        self.childappend(left)
        return self
    symbol(id_).ifix = ifix

    def toJS(self, opts):
        operator = self.get("value")
        operand = self.children[0].toJS(opts)
        if self.get("left", 0) == "true":
            r = [operator, operand]
        else:
            r = [operand, operator]
        return u''.join(r)
    symbol(id_).toJS = toJS

    def toListG(self):
        if self.get("left",0) == 'true':
            r = [[self], self.children[0].toListG()]
        else:
            r = [self.children[0].toListG(), [self]]
        for e in itert.chain(*r):
            yield e
    symbol(id_).toListG = toListG


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

@method(symbol("constant"))
def toListG(self):
    yield self

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

@method(symbol("identifier"))
def toListG(self):
    yield self


# This should never be used, as regexp literals are already provided by the
# tokenizer.
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
    self.childappend(left)
    # second
    self.childappend(expression())
    # ":"
    self.childappend(token)
    advance(":")
    # third
    self.childappend(expression())
    return self


@method(symbol("?"))
def toJS(self, opts):
    r = []
    r.append(self.children[0].toJS(opts))
    r.append('?')
    r.append(self.children[1].toJS(opts))
    r.append(self.children[2].toJS(opts))  # :
    r.append(self.children[3].toJS(opts))
    return ''.join(r)

@method(symbol("?"))
def toListG(self):
    for e in itert.chain(self.children[0].toListG(), [self], self.children[1].toListG(), self.children[2].toListG()):
        yield e


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
    accessor = symbol("dotaccessor")(token.get("line"), token.get("column"))
    accessor.childappend(left)
    accessor.childappend(self)  # "."
    accessor.childappend(expression(symbol(".").bind_left)) 
        # i'm providing the rbp to expression() here explicitly, so "foo.bar(baz)" gets parsed
        # as (call (dotaccessor ...) (param baz)), and not (dotaccessor foo
        # (call bar (param baz))).
    return accessor


symbol("dotaccessor")

@method(symbol("dotaccessor"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return u''.join(r)

@method(symbol("dotaccessor"))
def toListG(self):
    for e in itert.chain(self.children[0].toListG(), [self], self.children[1].toListG()):
        yield e

##
# walk down to find the "left-most" identifier ('a' in 'a.b().c')
@method(symbol("dotaccessor"))
def getLeftmostOperand(self):
    ident = self.children[0]
    while ident.type not in ("identifier", "constant"):  # e.g. 'dotaccessor', 'first', 'call', 'accessor', ...
        ident =ident.children[0]
    return ident

##
# walk down to find the "right-most" identifier ('c' in a.b.c)
@method(symbol("dotaccessor"))
def getRightmostOperand(self):
    ident = self.children[1]
    return ident # "left-leaning" syntax tree (. (. a b) c)

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

symbol("("), symbol(")"), symbol("arguments")

@method(symbol("("))  # <call>
def ifix(self, left):
    call = symbol("call")(token.get("line"), token.get("column"))
    # operand
    operand = symbol("operand")(token.get("line"), token.get("column"))
    call.childappend(operand)
    operand.childappend(left)
    # "("
    #call.childappend(self)
    # arguments - parse as group
    arguments = symbol("arguments")(token.get("line"), token.get("column"))
    call.childappend(arguments)
    group = self.pfix()
    for c in group.children:
        arguments.childappend(c)
    return call

symbol("operand")

@method(symbol("operand"))
def toJS(self, opts):
    return self.children[0].toJS(opts)

@method(symbol("operand"))
def toListG(self):
    for e in self.children[0].toListG():
        yield e


@method(symbol("("))  # <group>
def pfix(self):
    # There is sometimes a one-to-one replacement of the symbol instance from
    # <token> and a different symbol created in the parsing method (here
    # "symbol-(" vs. "symbol-group"). But there are a lot of attributes you want to
    # retain from the token, like "line", "column", .comments, and maybe others.
    # The reason for not retaining the token itself is that the replacement is
    # more specific (as here "(" which could be "group", "call" etc.). Just
    # re-writing .type would be enough for most tree traversing routines. But
    # the parsing methods themselves are class-based.
    group = symbol("group")()
    self.patch(group) # for "line", "column", .comments, etc.
    group.childappend(self)
    if token.id != ")":
        while True:
            if token.id == ")":
                break
            group.childappend(expression())
            if token.id != ",":
                break
            group.childappend(token)
            advance(",")
    # ")"
    group.childappend(token)
    advance(")")
    return group

@method(symbol("group"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("group"))
def toListG(self):
    for e in itert.chain([self], [c.toListG() for c in self.children]):
        yield e


symbol("]")

@method(symbol("["))             # "foo[0]", "foo[bar]", "foo['baz']"
def ifix(self, left):
    accessor = symbol("accessor")()
    self.patch(accessor)
    # identifier
    accessor.childappend(left)
    # '['
    accessor.childappend(self)
    # selector
    key = symbol("key")(token.get("line"), token.get("column"))
    accessor.childappend(key)
    key.childappend(expression())
    # ']'
    accessor.childappend(token)
    advance("]")
    return accessor

@method(symbol("["))             # "[1, 2, 3]"
def pfix(self):
    arr = symbol("array")()
    self.patch(arr)
    # '['
    arr.childappend(self)
    while True:
        if token.id == "]":
            break
        elif token.id == ",":  # elision
            arr.childappend(token)
            advance(",")
        else:
            arr.childappend(expression())
    # ']'
    arr.childappend(token)
    advance("]")
    return arr

symbol("accessor")

@method(symbol("accessor"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("accessor"))
def toListG(self):
    for e in itert.chain(self.children[0].toListG(), [self], self.children[1].toListG()):
        yield e


symbol("array")

@method(symbol("array"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return u''.join(r)

@method(symbol("array"))
def toListG(self):
    for c in self.children:
        for e in c.toListG():
            yield e


symbol("key")

@method(symbol("key"))
def toJS(self, opts):
    return self.children[0].toJS(opts)

@method(symbol("key"))
def toListG(self):
    for e in self.children[0].toListG():
        yield e


symbol("}")

@method(symbol("{"))                    # object literals
def pfix(self):
    mmap = symbol("map")()
    self.patch(mmap)
    mmap.childappend(self)
    if token.id != "}":
        is_after_comma = 0
        while True:
            if token.id == "}":
                if is_after_comma:  # prevent dangling comma '...,}' (bug#6210)
                    raise SyntaxException("Illegal dangling comma in map (pos %r)" % ((token.get("line"),token.get("column")),))
                break
            elif token.id == ",":
                mmap.childappend(token)
                advance(",")
            else: # key:val
                is_after_comma = 0
                # key
                keyname = expression()
                map_item = symbol("keyvalue")(token.get("line"), token.get("column"))
                # the <keyname> node is not entered into the ast, but resolved into <keyvalue>
                mmap.childappend(map_item)
                map_item.childappend(keyname)
                # ":"
                map_item.childappend(token)
                advance(":")
                # value
                keyval = expression()
                val = symbol("value")(token.get("line"), token.get("column"))
                val.childappend(keyval)
                map_item.childappend(val)  # <value> is a child of <keyvalue>
    mmap.childappend(token)
    advance("}")
    return mmap

@method(symbol("{"))                    # blocks
def std(self):
    block = symbol("block")()
    block.childappend(self)
    advance('{')
    block.childappend(statements())
    block.childappend(token)
    advance("}")
    return block

symbol("map")

@method(symbol("map"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

#@method(symbol("map"))
#def toListG(self):
#    for e in itert.chain([self], *[c.toListG() for c in self.children]):
#        yield e

@method(symbol("value"))
def toJS(self, opts):
    return self.children[0].toJS(opts)

@method(symbol("value"))
def toListG(self):
    for e in self.children[0].toListG():
        yield e

symbol("keyvalue")

@method(symbol("keyvalue"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

#@method(symbol("keyvalue"))
#def toListG(self):
#    for e in itert.chain([self], self.children[0].toListG()):
#        yield e


##
# The next is a shallow wrapper around "{".std, to have a more explicit rule to
# call for constructs that have blocks, like "for", "while", etc.

def block():
    # token.id == '{'
    return token.std()

symbol("block")

@method(symbol("block"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

#@method(symbol("block"))
#def toListG(self):
#    for e in itert.chain([self], self.children[0].toListG()):
#        yield e

symbol("function")

@method(symbol("function"))
def pfix(self):
    # optional name
    opt_name = None
    if token.id == "identifier":
        self.childappend(token)
        advance()
    # params
    assert token.id == "("
    params = symbol("params")()
    token.patch(params)
    self.childappend(params)
    group = expression()  # group parsing as helper
    for c in group.children:
        params.childappend(c)
    #params.children = group.children # nope - retains group as parent!
    # body
    body = symbol("body")()
    token.patch(body)
    self.childappend(body)
    if token.id == "{":
        body.childappend(block())
    else:
        body.childappend(statement())
    return self

@method(symbol("function"))
def toJS(self, opts):
    r = self.write("function")
    if self.getChild("identifier",0):
        functionName = self.getChild("identifier",0).get("value")
        r += self.space(result=r)
        r += self.write(functionName)
    # params
    r += self.getChild("params").toJS(opts)
    # body
    r += self.getChild("body").toJS(opts)
    return r

@method(symbol("function"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e

def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

symbol("params").toJS = toJS
symbol("arguments").toJS = toJS  # same here

#def toListG(self):
#    for e in itert.chain([self], *[c.toListG() for c in self.children]):
#        yield e

#symbol("params").toListG = toListG
#symbol("arguments").toListG = toListG  # same here

@method(symbol("body"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

#@method(symbol("body"))
#def toListG(self):
#    for e in itert.chain([self], *[c.toListG() for c in self.children]):
#        yield e


# -- statements ------------------------------------------------------------

symbol("var")

@method(symbol("var"))
def pfix(self):
    while True:
        defn = symbol("definition")(token.get("line"), token.get("column"))
        self.childappend(defn)
        ident = token
        if ident.id != "identifier":
            raise SyntaxException("Expected a new variable name (pos %r)" % ((token.get("line"), token.get("column")),))
        advance()
        # initialization
        if token.id == "=":
            t = token
            advance()
            elem = t.ifix(ident)
        # plain identifier
        else:
            elem = ident
        defn.childappend(elem)
        if token.id != ",":
            break
        else:
            self.childappend(token)
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
    r.append(''.join(a))
    return ''.join(r)

@method(symbol("var"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e

@method(symbol("definition"))
def toJS(self, opts):
    return self.children[0].toJS(opts)

@method(symbol("definition"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e

##
# returns the identifier node of the defined symbol
#
@method(symbol("definition"))
def getDefinee(self):
    dfn = self.children[0]  # (definition (identifier a)) or (definition (assignment (identifier a)(const 3)))
    if dfn.type == "identifier":
        return dfn
    elif dfn.type == "assignment":
        return dfn.children[0]
    else:
        raise SyntaxTreeError("Child of a 'definition' symbol must be in ('identifier', 'assignment')")

##
# returns the initialization of the defined symbol, if any
#
@method(symbol("definition"))
def getInitialization(self):
    dfn = self.children[0]
    if dfn.type == "assignment":
        return dfn.children[1]
    else:
        return None

symbol("for"); symbol("in")

@method(symbol("for"))
def std(self):
    self.type = "loop" # compat with Node.type
    self.set("loopType", "FOR")
    
    # condition
    self.childappend(token)
    advance("(")
    # try to consume the first part of a (pot. longer) condition
    if token.id != ";":
        chunk = expression()
    else:
        chunk = None

    # for (in)
    if chunk and chunk.id == 'in':
        self.set("forVariant", "in")
        condition = symbol("forInControl")(token.get("line"), token.get("column"))
        self.childappend(condition)
        condition.childappend(chunk)

    # for (;;) [mind: all three subexpressions are optional]
    else:
        self.set("forVariant", "iter")
        condition = symbol("forIterControl")(token.get("line"), token.get("column"))
        self.childappend(condition)
        # init part
        first = symbol("first")(token.get("line"), token.get("column"))
        condition.childappend(first)
        if chunk is None:       # empty init expr
            pass
        else:  # at least one init expr
            exprList = symbol("expressionList")(token.get("line"), token.get("column"))
            first.childappend(exprList)
            exprList.childappend(chunk)
            if token.id == ',':  # multiple inits
                exprList.childappend(token)
                advance(',')
                lst = init_list()
                for assgn in lst:
                    exprList.childappend(assgn)
        condition.childappend(token)
        advance(";")
        # condition part 
        second = symbol("second")(token.get("line"), token.get("column"))
        condition.childappend(second)
        if token.id != ";":
            exprList = symbol("expressionList")(token.get("line"), token.get("column"))
            second.childappend(exprList)
            while token.id != ';':
                expr = expression (0)
                exprList.childappend(expr)
                if token.id == ',':
                    exprList.childappend(token)
                    advance(',')
        condition.childappend(token)
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
                    exprList.childappend(token)
                    advance(',')
            third.childappend(exprList)

    # body
    self.childappend(token)
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
    for c in self.children:
        r.append(c.toJS(opts))
    return u''.join(r)

@method(symbol("forInControl"))
def toJS(self, opts):
    return self.children[0].toJS(opts)

@method(symbol("forIterControl"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)
    

@method(symbol("for"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e

@method(symbol("in"))  # of 'for (in)'
def toJS(self, opts):
    r = u''
    r += self.children[0].toJS(opts)
    r += self.space()
    r += 'in'
    r += self.space()
    r += self.children[1].toJS(opts)
    return r

@method(symbol("in"))
def toListG(self):
    for e in itert.chain(self.children[0].toListG(), [self], self.children[1].toListG()):
        yield e


@method(symbol("expressionList"))
def toJS(self, opts):  # WARN: this conflicts (and is overwritten) in for(;;).toJS
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ','.join(r)

@method(symbol("expressionList"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e


symbol("while")

@method(symbol("while"))
def std(self):
    self.type = "loop" # compat with Node.type
    self.set("loopType", "WHILE")
    self.childappend(token)
    advance("(")
    self.childappend(expression())
    self.childappend(token)
    advance(")")
    body = symbol("body")(token.get("line"), token.get("column"))
    body.childappend(statementOrBlock())
    self.childappend(body)
    return self

@method(symbol("while"))
def toJS(self, opts):
    r = []
    r.append(self.write("while"))
    r.append(self.space(False,result=r))
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("while"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e

symbol("do")

@method(symbol("do"))
def std(self):
    self.type = "loop" # compat with Node.type
    self.set("loopType", "DO")
    body = symbol("body")(token.get("line"), token.get("column"))
    body.childappend(statementOrBlock())
    self.childappend(body)
    self.childappend(token)
    advance("while")
    self.childappend(token)
    advance("(")
    self.childappend(expression(0))
    self.childappend(token)
    advance(")")
    return self

@method(symbol("do"))
def toJS(self, opts):
    r = []
    r.append("do")
    r.append(self.space())
    for c in self.children:
        r.append(c.toJS(opts))
        # we can afford to just juxtapose the 'while' child, without need to insert a space
        # as the preceding token must be a '}' or ';' (otherwise the parse was already ungrammatical)
    return ''.join(r)

@method(symbol("do"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e


symbol("with")

@method(symbol("with"))
def std(self):
    self.type = "loop" # compat. with Node.type
    self.set("loopType", "WITH")
    self.childappend(token)
    advance("(")
    self.childappend(expression(0))
    self.childappend(token)
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
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("with"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e


symbol("if"); symbol("else")

@method(symbol("if"))
def std(self):
    self.type = "loop" # compat with Node.type (i'd rather use explicit 'if', 'for', etc.)
    self.set("loopType", "IF")
    self.childappend(token)
    advance("(")
    self.childappend(expression(0))
    self.childappend(token)
    advance(")")
    then_part = symbol("body")(token.get("line"), token.get("column"))
    then_part.childappend(statementOrBlock())
    self.childappend(then_part)
    if (token.id == "else"):
        self.childappend(token)
        advance("else")
        else_part = symbol("body")(token.get("line"), token.get("column"))
        else_part.childappend(statementOrBlock())
        self.childappend(else_part)
    return self

@method(symbol("if"))
def toJS(self, opts):
    r = ['if']
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("if"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e

@method(symbol("else"))  # to make sure trailing space
def toJS(self, opts):
    return 'else '


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

@method(symbol("break"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e


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

@method(symbol("continue"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e


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

@method(symbol("return"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e


@method(symbol("new"))  # need to treat 'new' explicitly, for the awkward 'new Foo()' "call" syntax
def pfix(self):
    arg = expression(self.bind_left-1)  # first, parse a normal expression (this excludes '()')
    if token.id == '(':  # if the next token indicates a call
        t = token
        advance("(")
        arg = t.ifix(left=arg)   # invoke '('.ifix, with class name as <left> arg
    self.childappend(arg)
    return self


symbol("switch"); symbol("case"); symbol("default")

@method(symbol("switch"))
def std(self):
    self.childappend(token)
    advance("(")
    self.childappend(expression(0))
    self.childappend(token)
    advance(")")
    body = symbol("body")(token.get("line"), token.get("column"))
    self.childappend(body)
    block = symbol("block")(token.get("line"), token.get("column"))
    body.childappend(block)
    block.childappend(token)
    advance("{")
    while True:
        if token.id == "}": break
        elif token.id == "case":
            case = token  # make 'case' the root node (instead e.g. ':')
            block.childappend(case)
            advance("case")
            case.childappend(expression(0))
            case.childappend(token)
            advance(":")
            if token.id in ("case", "default") : # fall-through
                pass
            else:
                case.childappend(case_block())
        elif token.id == "default":
            case = token
            block.childappend(token)
            advance("default")
            case.childappend(token)
            advance(":")
            if token.id in ("case",) : # fall-through
                pass
            else:
                case.childappend(case_block())
    block.childappend(token)
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
    r = ['switch']
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("switch"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e

@method(symbol("case"))
def toJS(self, opts):
    r = ['case']
    r.append(self.space())
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("case"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e

@method(symbol("default"))
def toJS(self, opts):
    r = ['default']
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("default"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e


symbol("try"); symbol("catch"); symbol("finally")

@method(symbol("try"))
def std(self):
    self.childappend(block())
    if token.id == "catch":
        catch = token
        self.childappend(catch)
        advance("catch")
        # insert "params" node, par. to function.pfix
        assert token.id == "("
        #catch.childappend(token)
        params = symbol("params")(token.get("line"), token.get("column"))
        catch.childappend(params)
        group = expression()  # group parsing as helper
        for c in group.children:
            params.childappend(c)  # to have params as parent of group's children
        # the closing ')' is probably swallowed in group
        catch.childappend(block())
    if token.id == "finally":
        finally_ = token
        self.childappend(finally_)
        advance("finally")
        finally_.childappend(block())
    return self

@method(symbol("try"))
def toJS(self, opts):
    r = ['try']
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("catch"))
def toJS(self, opts):
    r = ['catch']
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("finally"))
def toJS(self, opts):
    r = ['finally']
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("try"))
def toListG(self):
    for e in itert.chain([self], *[c.toListG() for c in self.children]):
        yield e


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
    statmnt = symbol("statement")(token.get("line"), token.get("column"))
    # labeled statement
    if token.type == "identifier" and tokenStream.peek(1).id == ":": # label
        s = symbol("label")(token.get("line"), token.get("column"))
        s.childappend(token)
        advance()
        s.childappend(token)
        advance(":")
        s.childappend(statement())
    # normal SourceElement
    else:
        n = token
        s = None 
        # function declaration, doesn't need statementEnd
        if token.id == 'function' and tokenStream.peek(1).type == 'identifier':
            advance()
            s = n.pfix()
            if token.id == ';':  # consume dangling semi
                s.childappend(token)
                advance()
        # statement
        else:
            if getattr(token, 'std', None):
                advance()
                s = n.std()
            elif token.id == ';': # empty statement
                s = symbol("(empty)")()
                s.childappend(token)
            elif token.type != 'eol': # it's not an empty line
                s = expression()
                # Crockford's too tight here
                #if not (s.id == "=" or s.id == "("):
                #    raise SyntaxException("Bad expression statement (pos %r)" % ((token.get("line"), token.get("column")),))

                # handle expression lists
                # (REFAC: somewhat ugly here, expression lists should be treated generically,
                # but there is this conflict between ',' as an operator infix(",", 5)
                # and a stock symbol(",", 0) that terminates every expression() parse, like for
                # arrays, maps, etc.).
                if token.id == ',':
                    s1 = symbol("expressionList")(token.get("line"), token.get("column"))
                    s1.childappend(s)
                    s = s1
                    while token.id == ',':
                        s.childappend(token)
                        advance(',')
                        s.childappend(expression())
            # Tentatively removing the statementEnd check. It's an assertion anyway, so doesn't do
            # anything. But the idea is that each statement type as treated above ('var' statement,
            # function decl, loop, expression, ...) determines each own end by its parsing rules.
            # So a dedicated check for a statement end might be unnecessary, and in fact breaking
            # the parsing of dense code, like "for(..){...}a=1" (bug#7156).
            #statementEnd()
    statmnt.childappend(s)
    if token.id == ';':
        statmnt.childappend(token)
        advance(';')
    return statmnt

@method(symbol("statement"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    res = u''.join(r)
    if res[-1] != ';':  # check result, as a statement might have a nested statement (see 'label')
        res += ';'
    return res

@method(symbol("(empty)"))
def toJS(self, opts):
    return u''

@method(symbol("label"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)


def statementEnd():
    if token.id in (";","}"):
        pass
    elif token.id == "eof":
    #    return token  # ok as stmt end, but don't just skip it (bc. comments)
        pass
    elif tokenStream.eolBefore:
        pass # that's ok as statement end
    else:
        raise SyntaxException("Unterminated statement (pos %r)" % ((token.get("line"), token.get("column")),))

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


##
# Parse a list of initializers (e.g. in 'var', 'for', ...)
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
            lst.append(token)
            advance(",")
    return lst


# - Output/Packer methods for AST nodes ----------------------------------------

# 'opening'/'closing' methods for output generation.
# This section includes additional node types (e.g. 'accessor'), as such are introduced
# when creating the AST.


symbol("block")

@method(symbol("block"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    if opts.breaks:
        r.append('\n')
    return ''.join(r)

symbol("call")

@method(symbol("call"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("call"))
def toListG(self):
    for e in itert.chain(*[c.toListG() for c in self.children]):
        yield e


# Comments are usually not hit by a tree traversion, as they are not part of the syntax
# tree but properties of tree nodes; so these methods are probably never used. Serializing
# of comments is usually done by pretty-printing.

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
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)


@method(symbol("first"))
def toJS(self, opts):
    r = []
    for c in self.children:  # could be empty in for(;;)
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("second"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)

@method(symbol("third"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)


symbol("params")

@method(symbol("params"))
def toJS(self, opts):
    r = []
    for c in self.children:
        r.append(c.toJS(opts))
    return ''.join(r)


# - Helpers --------------------------------------------------------------------

##
# Add the comments of node2 to node1's commentsAfter
def affix_comments(node1_list, node2):
    node1_list.extend(node2.comments)


# - Class Frontend for the Grammar Infrastructure ------------------------------

class TreeGenerator(object):

    ##
    # To pass a tokenArr rather than a text string is due to the current usage
    # in the generator, which does the tokenization on its own, and then calls
    # 'createFileTree'.
    def parse(self, tokenArr, expr=False):
        global token, next, tokenStream
        tokenStream = TokenStream(tokenArr) # TODO: adapt TokenStream to token array arg
        next   = iter(tokenStream).next
        token  = next()
        if expr:
            return expression()
        else:
            return statements()


# - Interface -----------------------------------------------------------------

def createFileTree(tokenArr, fileId=''):
    fileNode = symbol("file")(0,0)
    fileNode.set("file", fileId)
    fileNode.set("treegenerator_tag", tag)
    fileNode.childappend(TreeGenerator().parse(tokenArr))
    return fileNode

def createFileTree_from_string(string_, fileId=''):
    ts = tokenizer.Tokenizer().parseStream(string_)
    return createFileTree(ts, fileId)

# quick high-level frontend
def parse(string_, expr=False):
    ts = tokenizer.Tokenizer().parseStream(string_)
    return TreeGenerator().parse(ts,expr)

# - Main ----------------------------------------------------------------------

def test(x, program):
    global token, next, tokenStream
    print ">>>", program
    tokenArr = tokenizer.Tokenizer().parseStream(program)
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
        tokenArr = tokenizer.Tokenizer().parseStream(text)
        print p.parse(tokenArr).toXml()
    else:
        execfile (os.path.normpath(os.path.join(__file__, "../../../../test/compiler/treegenerator.py"))) # __file__ doesn't seem to work in pydb
        for t in tests:
            test(*t)

