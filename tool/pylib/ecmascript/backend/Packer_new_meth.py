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
# !!!
# This is just a copy of an initial pretty_new_meth.py, when it reproduced the 
# .toJS() functionality from treegenerator.py.
# rename .toPretty to .toJS, and reduce the arguements to self, and you should
# have the .toJS() functionality from treegenerator.py in a stand-alone module
# - not tested!
# !!!
##

import sys, os, re, types, string

from ecmascript.frontend.treegenerator import method, symbol, symbol_base, SYMBOLS, identifier_regex
from ecmascript.frontend import lang

def prettyNode(tree, options, result):
    return [tree.toPretty(options, {})]


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

# fall-back in symbol_base
def toPretty(self, optns, state):
    return self.get("value", u'')
symbol_base.toPretty = toPretty


def infix(id_):
    def toPretty(self, optns, state):
        r = u''
        r += self.getChild("first").toPretty(optns, state)
        r += self.get("value")
        r += self.getChild("second").toPretty(optns, state)
        return r
    symbol(id_).toPretty = toPretty

for sym in SYMBOLS['infix']+SYMBOLS['infix_r']:
    infix(sym)

##
# infix "verb" operators, i.e. that need a space around themselves (like 'instanceof', 'in')
def infix_v(id_):
    def toPretty(self, optns, state):  # adapt the output
        r = u''
        r += self.getChild("first").toPretty(optns, state)
        r += self.space()
        r += self.get("value")
        r += self.space()
        r += self.getChild("second").toPretty(optns, state)
        return r
    symbol(id_).toPretty = toPretty
        
for sym in SYMBOLS['infix_v']:
    infix_v(sym)

##
# prefix "sigil" operators, like '!', '~', ...
def prefix(id_):
    def toPretty(self, optns, state):
        r = u''
        r += self.get("value")
        r += self.getChild("first").toPretty(optns, state)
        return r
    symbol(id_).toPretty = toPretty

for sym in SYMBOLS['prefix']:
    prefix(sym)

##
# prefix "verb" operators, i.e. that need a space before their operand like 'delete'
def prefix_v(id_):
    def toPretty(self, optns, state):
        r = u''
        r += self.get("value")
        r += self.space()
        r += self.getChild("first").toPretty(optns, state)
        return r
    symbol(id_).toPretty = toPretty

for sym in SYMBOLS['prefix_v']:
    prefix_v(sym)

def preinfix(id_):  # pre-/infix operators (+, -)
    def toPretty(self, optns, state):  # need to handle pre/infix cases
        r = []
        first = self.getChild("first").toPretty(optns, state)
        op = self.get("value")
        prefix = self.get("left", 0)
        if prefix and prefix == "true":
            r = [op, first]
        else:
            second = self.getChild("second").toPretty(optns, state)
            r = [first, op, second]
        return ''.join(r)
    symbol(id_).toPretty = toPretty

for sym in SYMBOLS['preinfix']:
    preinfix(sym)

def prepostfix(id_):  # pre-/post-fix operators (++, --)
    def toPretty(self, optns, state):
        r = u''
        operator = self.get("value")
        operand = self.getChild("first").toPretty(optns, state)
        r += self.get("value")
        if self.get("left", '') == "true":
            r = [operator, operand]
        else:
            r = [operand, operator]
        return u''.join(r)
    symbol(id_).toPretty = toPretty

for sym in SYMBOLS['prepostfix']:
    prepostfix(sym)


@method(symbol("constant"))
def toPretty(self, optns, state):
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


@method(symbol("identifier"))
def toPretty(self, optns, state):
    r = u''
    v = self.get("value", u"")
    if v:
        r = self.write(v)
    return r

@method(symbol("?"))
def toPretty(self, optns, state):
    r = []
    r.append(self.getChild("first").toPretty(optns, state))
    r.append('?')
    r.append(self.getChild("second").toPretty(optns, state))
    r.append(':')
    r.append(self.getChild("third").toPretty(optns, state))
    return ''.join(r)

@method(symbol("dotaccessor"))
def toPretty(self, optns, state):
    r = self.children[0].toPretty(optns, state)
    r += '.'
    r += self.children[1].toPretty(optns, state)
    return r

@method(symbol("operand"))
def toPretty(self, optns, state):
    return self.children[0].toPretty(optns, state)

@method(symbol("group"))
def toPretty(self, optns, state):
    r = []
    r.append('(')
    a = []
    for c in self.children:
        a.append(c.toPretty(optns, state))
    r.append(','.join(a))
    r.append(')')
    return ''.join(r)

@method(symbol("accessor"))
def toPretty(self, optns, state):
    r = u''
    r += self.children[0].toPretty(optns, state)
    r += '['
    r += self.children[1].toPretty(optns, state)
    r += ']'
    return r

@method(symbol("array"))
def toPretty(self, optns, state):
    r = []
    for c in self.children:
        r.append(c.toPretty(optns, state))
    return '[' + u','.join(r) + ']'

@method(symbol("key"))
def toPretty(self, optns, state):
    return self.children[0].toPretty(optns, state)

@method(symbol("map"))
def toPretty(self, optns, state):
    r = u''
    r += self.write("{")
    a = []
    for c in self.children:
        a.append(c.toPretty(optns, state))
    r += ','.join(a)
    r += self.write("}")
    return r

@method(symbol("value"))
def toPretty(self, optns, state):
    return self.children[0].toPretty(optns, state)

@method(symbol("keyvalue"))
def toPretty(self, optns, state):
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
    value = self.getChild("value").toPretty(optns, state)
    return quote + key + quote + ':' + value

@method(symbol("block"))
def toPretty(self, optns, state):
    r = []
    r.append('{')
    r.append(self.children[0].toPretty(optns, state))
    r.append('}')
    return u''.join(r)

@method(symbol("function"))
def toPretty(self, optns, state):
    r = self.write("function")
    functionName = self.get("name",0)
    if functionName != None:
        r += self.space(result=r)
        r += self.write(functionName)
    # params
    r += self.getChild("params").toPretty(optns, state)
    # body
    r += self.getChild("body").toPretty(optns, state)
    return r

@method(symbol("params"))
def toPretty(self, optns, state):
    r = []
    r.append('(')
    a = []
    for c in self.children:
        a.append(c.toPretty(optns, state))
    r.append(u','.join(a))
    r.append(')')
    return u''.join(r)


@method(symbol("body"))
def toPretty(self, optns, state):
    r = []
    r.append(self.children[0].toPretty(optns, state))
    # 'if', 'while', etc. can have single-statement bodies
    if self.children[0].id != 'block':
        r.append(';')
    return u''.join(r)

@method(symbol("var"))  # this is what becomes of "var"
def toPretty(self, optns, state):
    r = []
    r.append("var")
    r.append(self.space())
    a = []
    for c in self.children:
        a.append(c.toPretty(optns, state))
    r.append(','.join(a))
    return ''.join(r)

@method(symbol("definition"))
def toPretty(self, optns, state):
    return self.children[0].toPretty(optns, state)

@method(symbol("for"))
def toPretty(self, optns, state):
    r = []
    r.append('for')
    r.append(self.space(False,result=r))
    # cond
    r.append('(')
    # for (in)
    if self.get("forVariant") == "in":
        r.append(self.children[0].toPretty(optns, state))
    # for (;;)
    else:
        r.append(self.children[0].children[0].toPretty(optns, state))
        r.append(';')
        r.append(self.children[0].children[1].toPretty(optns, state))
        r.append(';')
        r.append(self.children[0].children[2].toPretty(optns, state))
    r.append(')')
    # body
    r.append(self.getChild("body").toPretty(optns, state))
    return u''.join(r)

@method(symbol("in"))  # of 'for (in)'
def toPretty(self, optns, state):
    r = u''
    r += self.getChild("first").toPretty(optns, state)
    r += self.space()
    r += 'in'
    r += self.space()
    r += self.getChild("second").toPretty(optns, state)
    return r

@method(symbol("expressionList"))
def toPretty(self, optns, state):  # WARN: this conflicts (and is overwritten) in for(;;).toPretty
    r = []
    for c in self.children:
        r.append(c.toPretty(optns, state))
    return ','.join(r)

@method(symbol("while"))
def toPretty(self, optns, state):
    r = u''
    r += self.write("while")
    r += self.space(False,result=r)
    # cond
    r += '('
    r += self.children[0].toPretty(optns, state)
    r += ')'
    # body
    r += self.children[1].toPretty(optns, state)
    return r

@method(symbol("do"))
def toPretty(self, optns, state):
    r = []
    r.append("do")
    r.append(self.space())
    r.append(self.children[0].toPretty(optns, state))
    r.append('while')
    r.append('(')
    r.append(self.children[1].toPretty(optns, state))
    r.append(')')
    return ''.join(r)

@method(symbol("if"))
def toPretty(self, optns, state):
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
    r += self.children[0].toPretty(optns, state)
    r += self.write(")")
    # 'then' part
    r += self.children[1].toPretty(optns, state)
    # (opt) 'else' part
    if len(self.children) == 3:
        r += self.write("else")
        r += self.space()
        r += self.children[2].toPretty(optns, state)
    r += self.space(False,result=r)
    return r

@method(symbol("loop"))
def toPretty(self, optns, state):
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
    #    r += self.children[0].toPretty(optns, state)
    #    r += ')'
    #    # then
    #    r += self.children[1].toPretty(optns, state)
    #    # else
    #    if len(self.children) == 3:
    #        r += self.write("else")
    #        r += self.children[2].toPretty(optns, state)
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

@method(symbol("break"))
def toPretty(self, optns, state):
    r = self.write("break")
    if self.children:
        r += self.space(result=r)
        r += self.write(self.children[0].toPretty(optns, state))
    return r

@method(symbol("continue"))
def toPretty(self, optns, state):
    r = self.write("continue")
    if self.children:
        r += self.space(result=r)
        r += self.write(self.children[0].toPretty(optns, state))
    return r

@method(symbol("return"))
def toPretty(self, optns, state):
    r = ["return"]
    if self.children:
        r.append(self.space())
        r.append(self.children[0].toPretty(optns, state))
    return ''.join(r)

@method(symbol("switch"))
def toPretty(self, optns, state):
    r = []
    r.append("switch")
    # control
    r.append('(')
    r.append(self.children[0].toPretty(optns, state))
    r.append(')')
    # body
    r.append('{')
    body = self.getChild("body")
    for c in body.children:
        r.append(c.toPretty(optns, state))
    r.append('}')
    return ''.join(r)


@method(symbol("case"))
def toPretty(self, optns, state):
    r = []
    r.append('case')
    r.append(self.space())
    r.append(self.children[0].toPretty(optns, state))
    r.append(':')
    if len(self.children) > 1:
        r.append(self.children[1].toPretty(optns, state))
    return ''.join(r)


@method(symbol("default"))
def toPretty(self, optns, state):
    r = []
    r.append('default')
    r.append(':')
    if len(self.children) > 0:
        r.append(self.children[0].toPretty(optns, state))
    return ''.join(r)

@method(symbol("try"))
def toPretty(self, optns, state):
    r = []
    r.append('try')
    r.append(self.children[0].toPretty(optns, state))
    catch = self.getChild("catch", 0)
    if catch:
        r.append('catch')
        r.append('(')
        r.append(catch.children[0].toPretty(optns, state))
        r.append(')')
        r.append(catch.children[1].toPretty(optns, state))
    finally_ = self.getChild("finally", 0)
    if finally_:
        r.append('finally')
        r.append(finally_.children[0].toPretty(optns, state))
    return ''.join(r)

@method(symbol("throw"))
def toPretty(self, optns, state):
    r = u''
    r += 'throw'
    r += self.space()
    r += self.children[0].toPretty(optns, state)
    return r

@method(symbol("(empty)"))
def toPretty(self, optns, state):
    return u''

@method(symbol("label"))
def toPretty(self, optns, state):
    r = []
    r += [self.get("value")]  # identifier
    r += [":"]
    r += [self.children[0].toPretty(optns, state)]
    return ''.join(r)

@method(symbol("statements"))
def toPretty(self, optns, state):
    r = []
    for cld in self.children:
        c = cld.toPretty(optns, state)
        r.append(c)
        if not c or c[-1] != ';':
            r.append(';')
    return u''.join(r)

@method(symbol("block"))
def toPretty(self, optns, state):
    r = '{'
    for c in self.children:
        r += c.toPretty(optns, state)
    r += '}'
    r += '\n' # TODO: tmp. fix for line breaks
    return r

@method(symbol("call"))
def toPretty(self, optns, state):
    r = u''
    r += self.getChild("operand").toPretty(optns, state)
    r += self.getChild("params").toPretty(optns, state)
    return r

@method(symbol("comment"))
def toPretty(self, optns, state):
    r = u''
    return r

@method(symbol("commentsAfter"))
def toPretty(self, optns, state):
    r = u''
    return r

@method(symbol("commentsBefore"))
def toPretty(self, optns, state):
    r = u''
    return r

@method(symbol("file"))
def toPretty(self, optns, state):
    return self.children[0].toPretty(optns, state)

@method(symbol("first"))
def toPretty(self, optns, state):
    r = u''
    if self.children:  # could be empty in for(;;)
        r = self.children[0].toPretty(optns, state)
    return r

@method(symbol("second"))
def toPretty(self, optns, state):
    r = u''
    if self.children:
        r = self.children[0].toPretty(optns, state)
    return r

@method(symbol("third"))
def toPretty(self, optns, state):
    r = u''
    if self.children:
        r = self.children[0].toPretty(optns, state)
    return r

@method(symbol("params"))
def toPretty(self, optns, state):
    r = u''
    self.noline()
    r += self.write("(")
    a = []
    for c in self.children:
        a.append(c.toPretty(optns, state))
    r += ','.join(a)
    r += self.write(")")
    return r
