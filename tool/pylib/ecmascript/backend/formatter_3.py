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
# A variant of formatter that works with Concrete Syntax Trees (as provided by
# treegenerator_3)
##

import sys, os, re, types, string

from ecmascript.frontend.treegenerator_3 import method, symbol, symbol_base, SYMBOLS, identifier_regex, PackerFlags as pp
from ecmascript.frontend import lang, Comment

# ------------------------------------------------------------------------------
# Symbol methods
# ------------------------------------------------------------------------------

_ = None

# fall-back in symbol_base
def format(self, optns, state):
    if self.children:
        # only synthetic nodes should fall back to this, with no prec. comments
        for cld in self.children:
            cld.format(optns, state)
    else:
        self.commentsPretty(self.comments, optns, state)
        state.add(self.get("value", u''), self, optns)
symbol_base.format = format

def nl(self, optns, state):
    return '\n'
symbol_base.nl = nl

##
# Call state.add for each comment.
def commentsPretty(self, comments, optns, state):
    for i,comment in enumerate(comments):
        commentStr = comment.get("value")
        commentStr = comment.format(optns, state)
        state.add(commentStr, comment, optns)
    return
symbol_base.commentsPretty = commentsPretty


def infix(id_):
    def format(self, optns, state):
        self.getChild(0).format(optns, state)
        state.add(' ', _, optns)
        self.commentsPretty(self.comments, optns, state)
        state.add(self.get("value"),self, optns)
        state.add(' ',_, optns)
        self.getChild(1).format(optns, state)
    symbol(id_).format = format

for sym in SYMBOLS['infix']+SYMBOLS['infix_r']:
    infix(sym)

##
# infix "verb" operators, i.e. that need a space around themselves (like 'instanceof', 'in')
def infix_v(id_):
    def format(self, optns, state):  # adapt the output
        self.commentsPretty(self.comments, optns, state)
        self.getChild(0).format(optns, state)
        state.add(self.space(),_, optns)
        state.add(self.get("value"),self, optns)
        state.add(self.space(),_, optns)
        self.getChild(1).format(optns, state)
    symbol(id_).format = format
        
for sym in SYMBOLS['infix_v']:
    infix_v(sym)

##
# prefix "sigil" operators, like '!', '~', ...
def prefix(id_):
    def format(self, optns, state):
        self.commentsPretty(self.comments, optns, state)
        state.add(self.get("value"),self, optns)
        self.getChild(0).format(optns, state)
    symbol(id_).format = format

for sym in SYMBOLS['prefix']:
    prefix(sym)

##
# prefix "verb" operators, i.e. that need a space before their operand like 'delete'
def prefix_v(id_):
    def format(self, optns, state):
        self.commentsPretty(self.comments, optns, state)
        state.add(self.get("value"),self, optns)
        state.add(self.space(),_, optns)
        self.getChild(0).format(optns, state)
    symbol(id_).format = format

for sym in SYMBOLS['prefix_v']:
    prefix_v(sym)

# i can re-use some of this semantics for prefix-like keywords, like 'var', 'while', 'if', etc.
def prefix_keyword(id_):
    def format(self, optns, state):
        self.commentsPretty(self.comments, optns, state)
        state.add(self.get("value"),self, optns)
        state.add(self.space(),_, optns)
        for cld in self.children:
            cld.format(optns, state)
    symbol(id_).format = format

for sym in "var new throw while if for do with try catch switch case default".split():  # some of them might get overwritten later, or this list should be adjusted
    prefix_keyword(sym)

def prefix_kw_optarg(id_):  # break, continue, return
    def format(self, optns, state):
        self.commentsPretty(self.comments, optns, state)
        state.add(self.get("value"),self, optns)
        if self.children:
            state.add(self.space(),_, optns)
            for cld in self.children:
                cld.format(optns, state)
    symbol(id_).format = format

for sym in "break return continue".split():  # some of them might get overwritten later, or this list should be adjusted
    prefix_kw_optarg(sym)

def preinfix(id_):  # pre-/infix operators (+, -)
    def format(self, optns, state):  # need to handle pre/infix cases
        self.commentsPretty(self.comments, optns, state)
        op = self.get("value")
        prefix = self.get("left", 0)
        if prefix and prefix == "true":
            state.add(op,self, optns)
            self.getChild(0).format(optns, state)
        else:
            self.getChild(0).format(optns, state)
            state.add(' ' + op + ' ',self, optns)
            self.getChild(1).format(optns, state)
    symbol(id_).format = format

for sym in SYMBOLS['preinfix']:
    preinfix(sym)

def prepostfix(id_):  # pre-/post-fix operators (++, --)
    def format(self, optns, state):
        self.commentsPretty(self.comments, optns, state)
        if self.get("left", '') == "true":
            state.add(self.get("value"),self, optns)
            self.getChild(0).format(optns, state)
        else:
            self.getChild(0).format(optns, state)
            state.add(self.get("value"),self, optns)
    symbol(id_).format = format

for sym in SYMBOLS['prepostfix']:
    prepostfix(sym)


@method(symbol("constant"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    if self.get("constantType") == "string":
        quote = "'" if self.get("detail")=="singlequotes" else '"'
        state.add(self.write(quote + self.get("value") + quote),self, optns)
    else:
        state.add(self.write(self.get("value")),self, optns)

@method(symbol("identifier"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    v = self.get("value", u"")
    if v:
        state.add(self.write(v),self, optns)

@method(symbol("?"))
def format(self, optns, state):
    self.getChild(0).format(optns, state)
    state.add(' ',_, optns)
    self.commentsPretty(self.comments, optns, state)
    state.add(self.get("value", "?"),self, optns)
    state.add(' ',_, optns)
    self.getChild(1).format(optns, state)
    state.add(' ',_, optns)
    self.getChild(2).format(optns, state)
    state.add(' ',_, optns)
    self.getChild(3).format(optns, state)

#@method(symbol("dotaccessor"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    self.children[0].format(optns, state)
#    state.add('.',self, optns)
#    self.children[1].format(optns, state)
#    state.add(r,optns,self, optns)

@method(symbol("operand"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    self.children[0].format(optns, state)

#@method(symbol("group"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add([r],self, optns)
#    state.add('(',self, optns)
#    a = []
#    for c in self.children:
#        a.append(c.format(optns, state))
#    state.add(', '.join(a),self, optns)
#    state.add(')',self, optns)
#    state.add(''.join(r,optns),self, optns)

#@method(symbol("accessor"))
#def format(self, optns, state):
#    for cld in self.children:
#        cld.format(optns, state)

@method(symbol("array"))
def format(self, optns, state):
    res = []
    for cld in self.children:
        cld.format(optns, state)

#@method(symbol("key"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    self.children[0].format(optns, state)
#    state.add(r,optns,self, optns)

@method(symbol("map"))
def format(self, optns, state):
    # opening {
    self.children[0].format(optns, state)
    # keyvals
    for c in self.children[1:-1]: # without {}
        if c.id == 'keyvalue':
            c.format(optns,state)
        elif c.id == ',':
            c.format(optns,state)
            state.add(self.nl(optns,state),_, optns)
    if 1: #self.isComplex():
        state.add(self.nl(optns,state),_, optns)
    # closing }
    self.children[-1].format(optns,state)

#@method(symbol("value"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    self.children[0].format(optns, state)
#    state.add(r,optns,self, optns)

@method(symbol("keyvalue"))
def format(self, optns, state):
    # key
    self.children[0].format(optns, state)
    # :
    state.add(self.space(),_, optns)
    self.children[1].format(optns, state)
    state.add(self.space(),_, optns)
    # value
    self.children[2].format(optns, state)
    #key = self.get("key")
    #key_quote = self.get("quote", '')
    #if key_quote:
    #    quote = '"' if key_quote == 'doublequotes' else "'"
    #elif ( key in lang.RESERVED 
    #       or not identifier_regex.match(key)
    #       # TODO: or not lang.NUMBER_REGEXP.match(key)
    #     ):
    #    print "Warning: Auto protect key: %r" % key
    #    quote = '"'
    #else:
    #    quote = ''
    #value = self.getChild("value").format(optns, state)
    #state.add(r + quote + key + quote + ' : ' + value,optns,self, optns)

@method(symbol("function"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    state.add(self.write("function"),self, optns)
    if self.getChild("identifier",0):
        ident = self.getChild("identifier")
        functionName = ident.get("value")
        state.add(self.space() + self.write(functionName),ident, optns)
    self.getChild("params").format(optns, state)
    self.getChild("body").format(optns, state)

#@method(symbol("body"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state)
#    self.children[0].format(optns, state)

#@method(symbol("var"))  # this is what becomes of "var"
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add([r],self, optns)
#    state.add("var",self, optns)
#    state.add(self.space(),self, optns)
#    a = []
#    for c in self.children:
#        a.append(c.format(optns, state))
#    state.add(','.join(a),self, optns)
#    state.add(''.join(r,optns),self, optns)

#@method(symbol("definition"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    self.children[0].format(optns, state)
#    state.add(r,optns,self, optns)

#@method(symbol("for"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add([r],self, optns)
#    state.add('for',self, optns)
#    state.add(self.space(False,result=r),self, optns)
#    # cond
#    state.add('(',self, optns)
#    # for (in)
#    if self.get("forVariant") == "in":
#        self.children[0].format(optns, state)
#    # for (;;)
#    else:
#        self.children[0].children[0].format(optns, state)
#        state.add(';',self, optns)
#        self.children[0].children[1].format(optns, state)
#        state.add(';',self, optns)
#        self.children[0].children[2].format(optns, state)
#    state.add(')',self, optns)
#    # body
#    self.getChild("body").format(optns, state)
#    state.add(u''.join(r,optns),self, optns)

@method(symbol("forIterControl"))  # of 'for (;;)'
def format(self, optns, state):
    for cld in self.children:
        cld.format(optns,state)
        if cld.type == ';':
            state.add(self.space(),_, optns)

@method(symbol("in"))  # of 'for (in)'
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    self.getChild(0).format(optns, state)
    state.add(self.space()+'in'+self.space(),self, optns)
    self.getChild(1).format(optns, state)

@method(symbol("expressionList"))
def format(self, optns, state):  # WARN: this conflicts (and is overwritten) in for(;;).format
    self.commentsPretty(self.comments, optns, state)
    for c in self.children:
        c.format(optns, state)

@method(symbol(","))
def format(self, optns, state):
    state.add(self.get("value") + ' ',self, optns)

@method(symbol(";"))
def format(self, optns, state):
    state.add(self.get("value"),self, optns)

#@method(symbol("while"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add(self.write("while",self), optns)
#    state.add(self.space(False,result=r,self), optns)
#    # cond
#    state.add('(',self, optns)
#    self.children[0].format(optns, state)
#    state.add(',self, optns)')
#    # body
#    self.children[1].format(optns, state)
#    state.add(r,optns,self, optns)

#@method(symbol("with"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add([r],self, optns)
#    state.add("with",self, optns)
#    state.add(self.space(),self, optns)
#    state.add('(',self, optns)
#    self.children[0].format(optns, state)
#    state.add(')',self, optns)
#    self.children[1].format(optns, state)
#    state.add(''.join(r,optns),self, optns)

#@method(symbol("do"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add([r],self, optns)
#    state.add("do",self, optns)
#    state.add(self.space(),self, optns)
#    self.children[0].format(optns, state)
#    state.add('while',self, optns)
#    state.add('(',self, optns)
#    self.children[1].format(optns, state)
#    state.add(')',self, optns)
#    state.add(''.join(r,optns),self, optns)

#@method(symbol("if"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    # Additional new line before each loop
#    if not self.isFirstChild(True) and not self.getChild("commentsBefore", False):
#        prev = self.getPreviousSibling(False, True)

#        # No separation after case statements
#        #if prev != None and prev.type in ["case", "default"]:
#        #    pass
#        #elif self.hasChild("elseStatement") or self.getChild("statement").hasBlockChildren():
#        #    self.sep()
#        #else:
#        #    self.line()
#    state.add(self.write("if",self), optns)
#    # condition
#    state.add(self.write("(",self), optns)
#    self.children[0].format(optns, state)
#    state.add(self.write(",self), optns)")
#    # 'then' part
#    self.children[1].format(optns, state)
#    # (opt) 'else' part
#    if len(self.children) == 3:
#        state.add(self.space(,self), optns)
#        state.add(self.write("else",self), optns)
#        state.add(self.space(,self), optns)
#        self.children[2].format(optns, state)
#    state.add(self.space(False,result=r,self), optns)
#    state.add(r,optns,self, optns)

@method(symbol("else"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    state.add(self.space() + self.get("value") + self.space(),self, optns)


#@method(symbol("break"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add(self.write("break",self), optns)
#    if self.children:
#        state.add(self.space(result=r,self), optns)
#        self.write(self.children[0].format(optns, state))
#    state.add(r,optns,self, optns)

#@method(symbol("continue"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add(self.write("continue",self), optns)
#    if self.children:
#        state.add(self.space(result=r,self), optns)
#        self.write(self.children[0].format(optns, state))
#    state.add(r,optns,self, optns)

#@method(symbol("return"))
#def format(self, optns, state):
#    state.add([self.commentsPretty(self.comments, optns, state,self), optns])
#    state.add(["return"],self, optns)
#    if self.children:
#        state.add(self.space(),self, optns)
#        self.children[0].format(optns, state)
#    state.add(''.join(r,optns),self, optns)

#@method(symbol("switch"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add([r],self, optns)
#    state.add("switch",self, optns)
#    # control
#    state.add('(',self, optns)
#    self.children[0].format(optns, state)
#    state.add(')',self, optns)
#    # body
#    state.add('{',self, optns)
#    body = self.getChild("body")
#    for c in body.children:
#        c.format(optns, state)
#    state.add('}',self, optns)
#    state.add(''.join(r,optns),self, optns)


@method(symbol("case"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    state.add('case',self, optns)
    state.add(self.space(),self, optns)
    self.children[0].format(optns, state)  # label
    self.children[1].format(optns, state)  # ":"
    state.add(self.nl(optns,state), _, optns)
    if len(self.children) > 2:
        state.indent()
        for cld in self.children[2:]:
            cld.format(optns, state)
        state.outdent()


@method(symbol("default"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    state.add('default',self, optns)
    self.children[0].format(optns, state)  # ":"
    state.add(self.nl(optns,state), _, optns)
    if len(self.children) > 1:
        state.indent()
        for cld in self.children[1:]:
            cld.format(optns, state)
        state.outdent()

#@method(symbol("try"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add([r],self, optns)
#    state.add("try",self, optns)
#    self.children[0].format(optns, state)
#    catch = self.getChild("catch", 0)
#    if catch:
#        state.add(self.space(),self, optns)
#        state.add("catch",self, optns)
#        catch.children[0].format(optns, state)
#        state.add(self.space(),self, optns)
#        catch.children[1].format(optns, state)
#    finally_ = self.getChild("finally", 0)
#    if finally_:
#        state.add("finally",self, optns)
#        finally_.children[0].format(optns, state)
#    state.add(''.join(r,optns),self, optns)

#@method(symbol("throw"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add('throw',self, optns)
#    state.add(self.space(,self), optns)
#    self.children[0].format(optns, state)
#    state.add(r,optns,self, optns)

@method(symbol("(empty)"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)

@method(symbol("label"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    self.children[0].format(optns, state)  # identifier
    self.children[1].format(optns, state)  # :
    state.add(self.nl(optns, state),_, optns)
    self.children[2].format(optns, state)  # statement)

@method(symbol("{"))
def format(self, optns, state):
    
    def allowsNewline(node): # args of 'return', 'throw' may not be separated by newline
        return not (node.parent 
            and node.parent.parent 
            and node.parent.parent.type in ('return', 'throw'))
    
    def wantsNewline(node): # depending on config and complexity
        return (optns.prettypOpenCurlyNewlineBefore in 'aA' # and self.hasLeadingContent():
                or (optns.prettypOpenCurlyNewlineBefore in 'mM' and node.parent.isComplex()))
    # --------------------------------------------------------------------------

    self.commentsPretty(self.comments, optns, state)

    # handle opening 'always|never|mixed' mode
    if (allowsNewline(node=self) and wantsNewline(node=self)):
        # set indent before inserting self.nl()
        if optns.prettypOpenCurlyIndentBefore:
            state.indent()
        state.assure_nl(optns)

    # assure at least one white space before '{'
    state.assure_white()
    # '{'
    state.add(self.get("value"),self, optns)

    if 1: #self.parent.isComplex():
        state.add(self.nl(optns,state),_, optns)
    if not optns.prettypAlignBlockWithCurlies:
        state.indent()

@method(symbol("}"))
def format(self, optns, state):
    self.commentsPretty(self.comments,optns,state)
    state.outdent()
    state.add(self.get("value"),self, optns)


#@method(symbol("statements"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    state.add([r],self, optns)
#    for cld in self.children:
#        c = cld.format(optns, state)
#        state.add(c,self, optns)
#    state.add(u''.join(r,optns),self, optns)

@method(symbol("statement"))
def format(self, optns, state):
    for cld in self.children:
        cld.format(optns, state)
    state.add(self.nl(optns,state),_, optns)


#@method(symbol("block"))
#def format(self, optns, state):
#    state.add(u'',self, optns)
#    # opening {
#    self.children[0].format(optns, state)
#    # statements
#    for c in self.getChild("statements").children:
#        c.format(optns, state)  # 'statement' takes care of indentation
#    # closing }
#    self.children[-1].format(optns, state)

    #self.commentsPretty(self.comments, optns, state,self)
    #state.add(self.write("{\n",self), optns)
    #state.indentLevel += 1
    #a = []
    #for c in self.children: # should be just "statements"
    #    a.append(c.format(optns, state))
    #a_ = u''.join(a)
    #state.add(a_,self, optns)
    #if a_:
    #    state.add(self.nl(optns,state),self, optns)
    #state.indentLevel -= 1
    #indent_string = indentString(optns, state)
    #state.add(self.write(indent_string + "}",self), optns)
    #state.add(r,optns,self, optns)

@method(symbol("call"))
def format(self, optns, state):
    self.commentsPretty(self.comments, optns, state)
    self.getChild("operand").format(optns, state)
    self.getChild("arguments").format(optns, state)


##
# This is not hit by the tree recursion, as comment nodes are currently not
# part of the tree. So this method is called directly in other nodes .format
# method (currently via commentsPretty).
@method(symbol("comment"))
def format(self, optns, state):

    ##
    # Whether the previous line had text, but not the current so far.
    def has_preceding_text():
        boolean = bool(
            not state.hasLeadingContent() # no dangling comment
            and state.output # not the first line
            and state.not_all_white(state.output[-1]) # previous line is not all white
            )
        return boolean
    ##
    # Whether the comment is the first text on current indent level.
    def is_first_on_level():
        boolean = bool(
            state.lineOfLevel.current() == state.lineOfLevel.first_index
            )
        return boolean
    ##
    # Whether comment follows code on the same line.
    def is_dangling_comment(comment):
        boolean = bool(
            comment.get("connection","before") == "after"
        )
        return boolean

    # --------------------------------------------------------------------------

    comments = []
    # handle leading newline
    if (not is_dangling_comment(self)
        and has_preceding_text() 
        and not is_first_on_level()):
       comments.append('\n')
    commentStr = self.get("value")

    # terminate a comment that extends to the end of line with newline
    if self.get('end', False) == True:  # 'inline' needs terminating newline anyway
        commentStr += state.nl()
    comments.append(commentStr)
    return u''.join(comments)


#@method(symbol("file"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    self.children[0].format(optns, state)
#    state.add(r,optns,self, optns)

#@method(symbol("first"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    if self.children:  # could be empty in for(;;)
#        self.children[0].format(optns, state)
#    state.add(r,optns,self, optns)

#@method(symbol("second"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    if self.children:
#        self.children[0].format(optns, state)
#    state.add(r,optns,self, optns)

#@method(symbol("third"))
#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    if self.children:
#        self.children[0].format(optns, state)
#    state.add(r,optns,self, optns)

#def format(self, optns, state):
#    self.commentsPretty(self.comments, optns, state,self)
#    self.noline()
#    state.add(self.write("(",self), optns)
#    a = []
#    for c in self.children:
#        a.append(c.format(optns, state))
#    state.add(u', '.join(a,self), optns)
#    state.add(self.write(",self), optns)")
#    state.add(r,optns,self, optns)

#symbol("params").format = format
#symbol("arguments").format = format

# ------------------------------------------------------------------------------
# Interface functions
# ------------------------------------------------------------------------------

class FormatterState(object):
    def __init__(self):
        self.indentLevel = 0
        self.currLine    = 1   # current insert line
        self.last_token  = None
        self.inExpression = False
        self.inQxDefine = False
        self.lineOfLevel = LineStack()  # stack of line counts (or last-line numbers) of the indent levels
        self.lineOfLevel.push()   # now pointing to the 1st line of the 0th indent level; LineStack[self.indentLevel] is current line in this level
        self.output = []  # list of output lines
        self.line = u''   # current output line buffer

    ##
    # Current *insert* column (i.e. the column after the last char).
    def currColumn(self):
        return len(self.line) + 1

    def indent(self):
        assert len(self.lineOfLevel) == self.indentLevel + 1
        self.indentLevel += 1
        self.lineOfLevel.push()

    def outdent(self):
        assert len(self.lineOfLevel) == self.indentLevel + 1
        if self.indentLevel > 0:
            self.indentLevel -= 1
            self.lineOfLevel.pop()

    def incCurrLine(self):
        self.currLine += 1
        self.lineOfLevel.inc()

    def indentStr(self, optns, incColumn=False):
        indent = optns.prettypIndentString * self.indentLevel
        return indent

    def append(self, el):
        self.output.append(el)
     
    re_non_white = re.compile(r'\S',re.U)
    def not_all_white(self, s):
        return self.re_non_white.search(s)


    ##
    # strng - the string to be inserted (usually a token-level string); can be:
    #     ''  - empty, if all information is conveyed in <tokenOrArr>
    # tokenOrArr - the token object behind the string value; can be:
    #     <symbol> - token behind string
    #     None     - synthetic string, not backed by a token (usually whitespace)
    #     [symbol-comment] - an array of <comment> objects, as passed to commentsPretty
    #
    def add(self, strng, tokenOrArr, optns):

        # check dangling comments
        if isinstance(tokenOrArr, symbol_base) and tokenOrArr.type == "comment":
            comment = tokenOrArr
            if comment.get("connection", "before") == "after":
                if self.line:  # there is something the comment can dangle from
                    pass       # just process as normal
                else:
                    # "re-open" previous line
                    self.line = self.output.pop()
                    assert self.line  # let's assume here is the code the comment belongs to
                    if self.line[-1] == '\n':
                        self.line = self.line[:-1]
                    # now procede as usual, with self.line as an incomplete line
                # add a padding between code and comment
                self.line += self.make_comment_padding(comment, optns)

        while strng:
            # Add fragment to line
            if '\n' in strng:
                had_eol = True
                idx = strng.find('\n')
            else:
                had_eol = False
                idx = len(strng)
            fragment = strng[:idx]

            # statement-end hack
            if '\n' in strng and self.inExpression:
                self.outdent()
                self.inExpression = False
            
            # check text width and handle continuation lines
            self.handle_text_width(fragment, tokenOrArr, optns)

            if not self.line:
                if self.not_all_white(fragment):  # beginning of line with non-white addition
                    self.line = self.indentStr(optns) + fragment #.lstrip()
            else:
                self.line += fragment  # all-white lines will be trimmed in self.layout_line

            # Reduce
            strng = strng[idx+1:]

            # Write complete lines
            if had_eol:
                line = self.layout_line(self.line)
                self.append(line)
                self.incCurrLine()   # ???
                self.line = ''
        # postcond: rest of strng is in self.line
            
    ##
    # Return spaces to be inserted between code and dangling comment.
    def make_comment_padding(self, comment, optns):
        padding = u' '
        currColumn = self.currColumn() # is last-added-char + 1
        # check using the old comment column
        if optns.prettypCommentsTrailingKeepColumn:
            padding *= comment.get("column", 0) - currColumn
            if not padding:
                padding = optns.prettypCommentsInlinePadding
        # check using pre-defined comment columns
        elif optns.prettypCommentsTrailingCommentCols:
            next_stop = 0
            for col in optns.prettypCommentsTrailingCommentCols:
                if col > currColumn:
                    next_stop = col
                    break
            if next_stop:
                padding *= next_stop - currColumn
            else:
                padding = optns.prettypCommentsInlinePadding
        # use a fixed padding
        else:
            padding = optns.prettypCommentsInlinePadding
        return padding

    def layout_line(self, strng):
        strng = strng.rstrip() # remove trailing ws
        strng += self.nl()
        return strng

    def handle_text_width(self, strng, token, optns):
        # restricted productions in JS grammar (see "Note" in 7.9.1 ES3 "Automatic Semicolon Insertion)
        def hasUnbreakableContext(node):
            return (
                    # postfix ++/--
                    (node.type == "operation"
                    and node.get("operator", '') in ('DEC', 'INC')
                    and node.get("left", '')!="true")
                or 
                    # break/continue arguments
                    (node.parent
                    and node.parent.type in ('break', 'continue',))
                or
                    # return/throw arguments
                    (node.parent
                    and node.parent.parent
                    and node.parent.parent.type in ('return', 'throw'))
                )

        # early escape
        if not token or isinstance(token, types.ListType):
            return
        # start a multi-line
        if (optns.prettypTextWidth
            and token.type not in ('comment','white')
            and token.type not in (',', ';', '}', ']') # breaking before those is ugly
            and not hasUnbreakableContext(token)
            and len(strng) + self.currColumn() > optns.prettypTextWidth):
            self.add(('\n',_),optns)
            if not self.inExpression:
                self.indent()
                self.inExpression = True

        # terminate a multi-line
        #elif strng in ';\n':  # quick statement-end hack
        #    if self.inExpression:
        #        self.outdent()
        #        self.inExpression = False
        return

    # TODO: duplicates tree.nl() in this module
    def nl(self):
        return '\n'

    re_white = re.compile('\s', re.U)

    ##
    # Insert a space unless space/tab/nl is not already present
    def assure_white(self):
        if self.line and not self.re_white.match(self.line[-1]):
            self.line += ' '

    def assure_nl(self, optns):
        if self.hasLeadingContent(True):
            self.add(self.nl(), _, optns)

    ##
    # Whether the current line has content
    def hasLeadingContent(self, honorWhite=False):
        if honorWhite and self.line != '\n':
            return len(self.line)
        else:
            return self.re_non_white.search(self.line)


class LineStack(object):
    def __init__(self):
        self.stack = []
        self.first_index = 1

    # expose len() and [] read access
    def __len__(s):
        return len(s.stack)
    def __getitem__(s, key):
        return s.stack[key]

    ##
    # New indent level
    def push(self):
        self.stack.append(self.first_index)

    ##
    # Back to old indent level
    def pop(self):
        if self.stack:
            return self.stack.pop()

    ##
    # Increase line count on current level
    def inc(self):
        if self.stack:
            self.stack[-1] += 1
            return self.stack[-1]

    def current(self):
        if self.stack:
            return self.stack[-1]
    
    
class FormatterOptions(object): pass

def formatNode(tree, options, result):
    state = FormatterState()
    #state = defaultState(state, options)
    tree.format(options, state)
    return state.output


def defaultOptions(optns=None):
    if optns is None:
        optns = FormatterOptions()
    optns.prettyPrint = True  # turn on pretty-printing
    optns.prettypCommentsBlockAdd  = True  # comment filling
    optns.prettypIndentString      = "  "   # general indent string
    optns.prettypOpenCurlyNewlineBefore = 'm'  # mixed, dep. on complexity
    optns.prettypOpenCurlyIndentBefore  = False  # indent curly on a new line
    optns.prettypAlignBlockWithCurlies  = False  # put block on same column as curlies
    optns.prettypCommentsTrailingCommentCols = []  # put trailing comments on fixed columns
    optns.prettypCommentsTrailingKeepColumn  = False  # fix trailing comment on column of original text
    optns.prettypCommentsInlinePadding  = '  '   # space between end of code and beginning of comment
    optns.prettypTextWidth = 0
    return optns

def indentString(optns, state):
    return optns.prettypIndentString * state.indentLevel
