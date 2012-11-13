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
# This formatter also works with Concrete Syntax Trees (as provided by
# treegenerator_3), but serializes the tokens before producing strings from
# them.
#
# (This allows for a central "format" method that inspects tokens before they
# get stringified, e.g. to handle max. text width in the output).
##

import sys, os, re, types, string

from ecmascript.frontend.treegenerator_3 import method, symbol, symbol_base, SYMBOLS, identifier_regex, PackerFlags as pp
from ecmascript.frontend import lang, Comment
from ecmascript.frontend.Scanner         import IterObject, LQueue, LimLQueue, is_last_escaped
from ecmascript.frontend.SyntaxException import SyntaxException

# ------------------------------------------------------------------------------
# TreeSerializer
# ------------------------------------------------------------------------------

##
# Makes the input tree serialize itself, and provides the token nodes through
# an LQueue, and maintains an LimLQueue for look-behind.
#
class TreeSerializer(IterObject):

    def __init__(self, tree):
        self.max_look_behind = 10
        super(TreeSerializer, self).__init__(tree)

    def resetIter(self):
        self.outData = LimLQueue(self.max_look_behind)  # limited record of yielded tokens
        self.tokenStream = LQueue(self.inData.toListG())
        self.tokenStreamIterable = iter(self.tokenStream)
        super(TreeSerializer, self).resetIter()

    ##
    # Peek n tokens behind
    def lookbehind(self, n=1):
        if n>self.max_look_behind:
            raise SyntaxException("TokenStream: can only look %d elements behind" % self.max_look_behind)
        return self.outData[n]

    ##
    # Peek n tokens ahead
    # 
    # peek needs to circumvent __iter__ and access the LQueue directly
    def peek(self, n=1):
        toks = []
        cnt  = 0
        # get the desired token
        while cnt < n:
            t = self.tokenStreamIterable.next()
            toks.append(t)
            if t['type'] == "eof":
                break
            cnt += 1
        # put all retrieved tokens back
        for t in toks[::-1]:
            self.tokenStream.putBack(t)
        return toks[-1]


    def __iter__(self):
        for tok in self.tokenStreamIterable:
            self.outData.appendleft(tok)
            yield tok


# ------------------------------------------------------------------------------
# Formatter
# ------------------------------------------------------------------------------

##
# Visitor consuming the tokens from TreeSerializer in a central 'format' method, pot.
# dispatching to more specialized format_ methods.
#
class Formatter(object):

    def __init__(self, optns, state):
        self.optns = optns
        self.state = state

    ##
    # Single-call driver for stringifying a tree
    def format(self, tokenStream):
        self.tokenStream = tokenStream

        for token in self.tokenStream:

            ## text width
            #self.handle_text_width(token)


            # dispatch handlers
            if hasattr(self, "format_"+token.type):
                s = getattr(self, "format_"+token.type)(token)
            else:
                s = self.format_default(token)
            #print ">%s<" % s
            self.state.add(s,self.optns)
            self.state.last_token = token

        self.state.add('\n',self.optns)
        return u''.join(self.state.output)
            

    def format_default(self, token):
        r = u''
        if token.get("value", False):
            #r += ' ' + token.get("value") + ' ' # for testing
            r += token.get("value")
        else:
            r += u''
        if self.is_statement_end(token):
            r += '\n'
        return r

    ##
    # To capture end of function definition
    def format_function(self, token):
        r = token.get("value")
        for tok in token.toListG():
            self.format(tok)
        self.state.add('\n')
        return r

    def is_statement_end(self, token):
        if (token.parent.type == "statement" and 
            token.parent.children[-1] is token):
            return True
        else:
            return False

    def handle_text_width(self, token):
        # start a multi-line
        if (self.optns.prettypTextWidth and 
            token.type not in ('comment','white') and
            token.type not in (',', ';', '}', ']') and
            len(token.get("value")) + self.currColumn > self.optns.prettypTextWidth):
            self.state.add('\n')
            if not self.state.inExpression:
                self.state.indent()
                self.state.inExpression = True

        # terminate a multi-line
        elif token.value in ';\n':  # quick statement-end hack
            if self.state.inExpression:
                self.outdent()
                self.state.inExpression = False
        return


    # fall-back in symbol_base
    def format__(self, optns, state):
        if self.children:
            # only synthetic nodes should fall back to this, with no prec. comments
            for cld in self.children:
                cld.format(optns, state)
        else:
            state.add(self.commentsPretty(self.comments, optns, state),optns)
            state.add(self.get("value", u''),optns)
    symbol_base.format = format

    def nl(self, optns, state):
        return '\n'
    symbol_base.nl = nl

    def commentsPretty(self, commentsA, optns, state):
        comments = []
        for i,comment in enumerate(commentsA):
            commentStr = comment.get("value")
            commentStr = Comment.Text(commentStr).indent(indentString(optns, state))
            if comment.get('end', False) == True:  # 'inline' needs terminating newline anyway
                commentStr += self.nl(optns,state)
            commentStr += state.indentStr(optns)  # to pass on the indentation that was set ahead of the comment
            comments.append(commentStr)
            # handle additional line breaks between comments
            if i>0:
                pass
                #curr_start = comment.get("line")
                #prev_start = commentsA[i-1].get("line")
                #prev_lines = comments[i-1].count('\n')
                #addtl_lb = curr_start - prev_start + prev_lines
                #comments[i-1] += addtl_lb * '\n'
        return u''.join(comments)
    symbol_base.commentsPretty = commentsPretty


    def infix(id_):
        def format(self, optns, state):
            self.getChild(0).format(optns, state)
            state.add(' ',optns)
            self.commentsPretty(self.comments, optns, state)
            state.add(self.get("value"),optns)
            state.add(' ',optns)
            self.getChild(1).format(optns, state)
        symbol(id_).format = format

    for sym in SYMBOLS['infix']+SYMBOLS['infix_r']:
        infix(sym)

    ##
    # infix "verb" operators, i.e. that need a space around themselves (like 'instanceof', 'in')
    def infix_v(id_):
        def format(self, optns, state):  # adapt the output
            state.add(self.commentsPretty(self.comments, optns, state),optns)
            self.getChild(0).format(optns, state)
            state.add(self.space(),optns)
            state.add(self.get("value"),optns)
            state.add(self.space(),optns)
            self.getChild(1).format(optns, state)
        symbol(id_).format = format
            
    for sym in SYMBOLS['infix_v']:
        infix_v(sym)

    ##
    # prefix "sigil" operators, like '!', '~', ...
    def prefix(id_):
        def format(self, optns, state):
            state.add(self.commentsPretty(self.comments, optns, state),optns)
            state.add(self.get("value"),optns)
            self.getChild(0).format(optns, state)
        symbol(id_).format = format

    for sym in SYMBOLS['prefix']:
        prefix(sym)

    ##
    # prefix "verb" operators, i.e. that need a space before their operand like 'delete'
    def prefix_v(id_):
        def format(self, optns, state):
            state.add(self.commentsPretty(self.comments, optns, state),optns)
            state.add(self.get("value"),optns)
            state.add(self.space(),optns)
            self.getChild(0).format(optns, state)
        symbol(id_).format = format

    for sym in SYMBOLS['prefix_v']:
        prefix_v(sym)

    # i can re-use some of this semantics for prefix-like keywords, like 'var', 'while', 'if', etc.
    def prefix_keyword(id_):
        def format(self, optns, state):
            state.add(self.commentsPretty(self.comments, optns, state),optns)
            state.add(self.get("value"),optns)
            state.add(self.space(),optns)
            for cld in self.children:
                cld.format(optns, state)
        symbol(id_).format = format

    for sym in "var new throw while if for do with try catch switch case default".split():  # some of them might get overwritten later, or this list should be adjusted
        prefix_keyword(sym)

    def prefix_kw_optarg(id_):  # break, continue, return
        def format(self, optns, state):
            state.add(self.commentsPretty(self.comments, optns, state),optns)
            state.add(self.get("value"),optns)
            if self.children:
                state.add(self.space(),optns)
                for cld in self.children:
                    cld.format(optns, state)
        symbol(id_).format = format

    for sym in "break return continue".split():  # some of them might get overwritten later, or this list should be adjusted
        prefix_kw_optarg(sym)

    def preinfix(id_):  # pre-/infix operators (+, -)
        def format(self, optns, state):  # need to handle pre/infix cases
            state.add(self.commentsPretty(self.comments, optns, state),optns)
            op = self.get("value")
            prefix = self.get("left", 0)
            if prefix and prefix == "true":
                state.add(op,optns)
                self.getChild(0).format(optns, state)
            else:
                self.getChild(0).format(optns, state)
                state.add(' ' + op + ' ',optns)
                self.getChild(1).format(optns, state)
        symbol(id_).format = format

    for sym in SYMBOLS['preinfix']:
        preinfix(sym)

    def prepostfix(id_):  # pre-/post-fix operators (++, --)
        def format(self, optns, state):
            state.add(self.commentsPretty(self.comments, optns, state),optns)
            if self.get("left", '') == "true":
                state.add(self.get("value"),optns)
                self.getChild(0).format(optns, state)
            else:
                self.getChild(0).format(optns, state)
                state.add(self.get("value"),optns)
        symbol(id_).format = format

    for sym in SYMBOLS['prepostfix']:
        prepostfix(sym)


    @method(symbol("constant"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        if self.get("constantType") == "string":
            quote = "'" if self.get("detail")=="singlequotes" else '"'
            state.add(self.write(quote + self.get("value") + quote),optns)
        else:
            state.add(self.write(self.get("value")),optns)

    @method(symbol("identifier"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        v = self.get("value", u"")
        if v:
            state.add(self.write(v),optns)

    @method(symbol("?"))
    def format_(self, optns, state):
        self.getChild(0).format(optns, state)
        state.add(' ',optns)
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        state.add(self.get("value", "?"),optns)
        state.add(' ',optns)
        self.getChild(1).format(optns, state)
        state.add(' ',optns)
        self.getChild(2).format(optns, state)
        state.add(' ',optns)
        self.getChild(3).format(optns, state)

    #@method(symbol("dotaccessor"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    self.children[0].format(optns, state)
    #    state.add('.',optns)
    #    self.children[1].format(optns, state)
    #    state.add(r,optns,optns)

    @method(symbol("operand"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        self.children[0].format(optns, state)

    #@method(symbol("group"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    state.add('(',optns)
    #    a = []
    #    for c in self.children:
    #        a.append(c.format(optns, state))
    #    state.add(', '.join(a),optns)
    #    state.add(')',optns)
    #    state.add(''.join(r,optns),optns)

    @method(symbol("accessor"))
    def format_(self, optns, state):
        state.add([],optns)
        for cld in self.children:
            cld.format(optns, state)

    @method(symbol("array"))
    def format_(self, optns, state):
        res = []
        for cld in self.children:
            cld.format(optns, state)

    #@method(symbol("key"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    self.children[0].format(optns, state)
    #    state.add(r,optns,optns)

    @method(symbol("map"))
    def format_(self, optns, state):
        # opening {
        self.children[0].format(optns, state)
        indent = state.indentStr(optns)
        # keyvals
        for c in self.children[1:-1]: # without {}
            if c.id == 'keyvalue':
                state.add(indent,optns)
                c.format(optns,state)
            elif c.id == ',':
                c.format(optns,state)
                state.add(self.nl(optns,state),optns)
        state.add(self.nl(optns,state),optns)
        # closing }
        self.children[-1].format(optns,state)

    #@method(symbol("value"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    self.children[0].format(optns, state)
    #    state.add(r,optns,optns)

    @method(symbol("keyvalue"))
    def format_(self, optns, state):
        # key
        self.children[0].format(optns, state)
        # :
        state.add(self.space(),optns)
        self.children[1].format(optns, state)
        state.add(self.space(),optns)
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
        #state.add(r + quote + key + quote + ' : ' + value,optns,optns)

    @method(symbol("function"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        state.add(self.write("function") + self.space(),optns)
        if self.getChild("identifier",0):
            functionName = self.getChild("identifier").get("value")
            state.add(self.write(functionName),optns)
        # params
        self.getChild("params").format(optns, state)
        state.add(self.space(),optns)
        # body
        self.getChild("body").format(optns, state)

    @method(symbol("body"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        self.children[0].format(optns, state)
        # 'if', 'while', etc. can have single-statement bodies
        if self.children[0].id != 'block':
            state.add(';',optns)

    #@method(symbol("var"))  # this is what becomes of "var"
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    state.add("var",optns)
    #    state.add(self.space(),optns)
    #    a = []
    #    for c in self.children:
    #        a.append(c.format(optns, state))
    #    state.add(','.join(a),optns)
    #    state.add(''.join(r,optns),optns)

    #@method(symbol("definition"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    self.children[0].format(optns, state)
    #    state.add(r,optns,optns)

    #@method(symbol("for"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    state.add('for',optns)
    #    state.add(self.space(False,result=r),optns)
    #    # cond
    #    state.add('(',optns)
    #    # for (in)
    #    if self.get("forVariant") == "in":
    #        self.children[0].format(optns, state)
    #    # for (;;)
    #    else:
    #        self.children[0].children[0].format(optns, state)
    #        state.add(';',optns)
    #        self.children[0].children[1].format(optns, state)
    #        state.add(';',optns)
    #        self.children[0].children[2].format(optns, state)
    #    state.add(')',optns)
    #    # body
    #    self.getChild("body").format(optns, state)
    #    state.add(u''.join(r,optns),optns)

    @method(symbol("in"))  # of 'for (in)'
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        self.getChild(0).format(optns, state)
        state.add(self.space()+'in'+self.space(),optns)
        self.getChild(1).format(optns, state)

    @method(symbol("expressionList"))
    def format_(self, optns, state):  # WARN: this conflicts (and is overwritten) in for(;;).format
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        for c in self.children:
            c.format(optns, state)

    @method(symbol(","))
    def format_(self, optns, state):
        state.add(self.get("value"),optns)

    @method(symbol(";"))
    def format_(self, optns, state):
        state.add(self.get("value"),optns)

    #@method(symbol("while"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add(self.write("while",optns))
    #    state.add(self.space(False,result=r,optns))
    #    # cond
    #    state.add('(',optns)
    #    self.children[0].format(optns, state)
    #    state.add(',optns)')
    #    # body
    #    self.children[1].format(optns, state)
    #    state.add(r,optns,optns)

    #@method(symbol("with"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    state.add("with",optns)
    #    state.add(self.space(),optns)
    #    state.add('(',optns)
    #    self.children[0].format(optns, state)
    #    state.add(')',optns)
    #    self.children[1].format(optns, state)
    #    state.add(''.join(r,optns),optns)

    #@method(symbol("do"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    state.add("do",optns)
    #    state.add(self.space(),optns)
    #    self.children[0].format(optns, state)
    #    state.add('while',optns)
    #    state.add('(',optns)
    #    self.children[1].format(optns, state)
    #    state.add(')',optns)
    #    state.add(''.join(r,optns),optns)

    #@method(symbol("if"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
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
    #    state.add(self.write("if",optns))
    #    # condition
    #    state.add(self.write("(",optns))
    #    self.children[0].format(optns, state)
    #    state.add(self.write(",optns)"))
    #    # 'then' part
    #    self.children[1].format(optns, state)
    #    # (opt) 'else' part
    #    if len(self.children) == 3:
    #        state.add(self.space(,optns))
    #        state.add(self.write("else",optns))
    #        state.add(self.space(,optns))
    #        self.children[2].format(optns, state)
    #    state.add(self.space(False,result=r,optns))
    #    state.add(r,optns,optns)

    #@method(symbol("break"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add(self.write("break",optns))
    #    if self.children:
    #        state.add(self.space(result=r,optns))
    #        self.write(self.children[0].format(optns, state))
    #    state.add(r,optns,optns)

    #@method(symbol("continue"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add(self.write("continue",optns))
    #    if self.children:
    #        state.add(self.space(result=r,optns))
    #        self.write(self.children[0].format(optns, state))
    #    state.add(r,optns,optns)

    #@method(symbol("return"))
    #def format(self, optns, state):
    #    state.add([self.commentsPretty(self.comments, optns, state,optns)])
    #    state.add(["return"],optns)
    #    if self.children:
    #        state.add(self.space(),optns)
    #        self.children[0].format(optns, state)
    #    state.add(''.join(r,optns),optns)

    #@method(symbol("switch"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    state.add("switch",optns)
    #    # control
    #    state.add('(',optns)
    #    self.children[0].format(optns, state)
    #    state.add(')',optns)
    #    # body
    #    state.add('{',optns)
    #    body = self.getChild("body")
    #    for c in body.children:
    #        c.format(optns, state)
    #    state.add('}',optns)
    #    state.add(''.join(r,optns),optns)


    #@method(symbol("case"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    state.add('case',optns)
    #    state.add(self.space(),optns)
    #    self.children[0].format(optns, state)
    #    state.add(':',optns)
    #    if len(self.children) > 1:
    #        self.children[1].format(optns, state)
    #    state.add(''.join(r,optns),optns)


    #@method(symbol("default"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    state.add('default',optns)
    #    state.add(':',optns)
    #    if len(self.children) > 0:
    #        self.children[0].format(optns, state)
    #    state.add(''.join(r,optns),optns)

    #@method(symbol("try"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    state.add("try",optns)
    #    self.children[0].format(optns, state)
    #    catch = self.getChild("catch", 0)
    #    if catch:
    #        state.add(self.space(),optns)
    #        state.add("catch",optns)
    #        catch.children[0].format(optns, state)
    #        state.add(self.space(),optns)
    #        catch.children[1].format(optns, state)
    #    finally_ = self.getChild("finally", 0)
    #    if finally_:
    #        state.add("finally",optns)
    #        finally_.children[0].format(optns, state)
    #    state.add(''.join(r,optns),optns)

    #@method(symbol("throw"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add('throw',optns)
    #    state.add(self.space(,optns))
    #    self.children[0].format(optns, state)
    #    state.add(r,optns,optns)

    @method(symbol("(empty)"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments, optns, state),optns)

    @method(symbol("label"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        self.children[0].format(optns, state,optns)  # identifier
        self.children[1].format(optns, state,optns)  # :
        state.add(self.nl(optns, state),optns)
        self.children[2].format(optns, state,optns)  # statement)

    @method(symbol("{"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments,optns, state),optns)
        if optns.prettypOpenCurlyNewlineBefore not in 'nN': # and self.hasLeadingContent():
            if optns.prettypOpenCurlyIndentBefore:
                state.indent()
            state.add(self.nl(optns,state) + state.indentStr(optns),optns)
        state.add(self.get("value") + self.nl(optns,state),optns)
        if not optns.prettypAlignBlockWithCurlies:
            state.indent()

    @method(symbol("}"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments,optns,state), optns)
        state.outdent()
        state.add(state.indentStr(optns) + self.get("value"),optns)


    #@method(symbol("statements"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    state.add([r],optns)
    #    for cld in self.children:
    #        c = cld.format(optns, state)
    #        state.add(c,optns)
    #    state.add(u''.join(r,optns),optns)

    @method(symbol("statement"))
    def format_(self, optns, state):
        indent = indentString(optns, state)
        state.add(indent,optns)
        for cld in self.children:
            cld.format(optns, state)
        state.add(self.nl(optns,state),optns)


    #@method(symbol("block"))
    #def format(self, optns, state):
    #    state.add(u'',optns)
    #    # opening {
    #    self.children[0].format(optns, state)
    #    # statements
    #    for c in self.getChild("statements").children:
    #        c.format(optns, state)  # 'statement' takes care of indentation
    #    # closing }
    #    self.children[-1].format(optns, state)

        #state.add(self.commentsPretty(self.comments, optns, state,optns))
        #state.add(self.write("{\n",optns))
        #state.indentLevel += 1
        #a = []
        #for c in self.children: # should be just "statements"
        #    a.append(c.format(optns, state))
        #a_ = u''.join(a)
        #state.add(a_,optns)
        #if a_:
        #    state.add(self.nl(optns,state),optns)
        #state.indentLevel -= 1
        #indent_string = indentString(optns, state)
        #state.add(self.write(indent_string + "}",optns))
        #state.add(r,optns,optns)

    @method(symbol("call"))
    def format_(self, optns, state):
        state.add(self.commentsPretty(self.comments, optns, state),optns)
        self.getChild("operand").format(optns, state)
        self.getChild("arguments").format(optns, state)

    ##
    #@method(symbol("comment"))
    #def format(self, optns, state):
    #    r = self.get("value")
    #    r = Comment.Text(r,optns).indent(indentString(optns, state))
    #    if self.get('end', False) == True:  # 'inline' needs terminating newline anyway
    #        state.add(self.nl(optns,state),optns)
    #    state.add(indentString(optns, state),optns)  # to pass on the indentation that was set ahead of the comment
    #    return r

    #@method(symbol("commentsAfter"))
    #def format(self, optns, state):
    #    state.add(self.toJS(pp,optns))
    #    state.add(r,optns,optns)

    #@method(symbol("commentsBefore"))
    #def format(self, optns, state):
    #    state.add(self.toJS(pp,optns))
    #    state.add(r,optns,optns)

    #@method(symbol("file"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    self.children[0].format(optns, state)
    #    state.add(r,optns,optns)

    #@method(symbol("first"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    if self.children:  # could be empty in for(;;)
    #        self.children[0].format(optns, state)
    #    state.add(r,optns,optns)

    #@method(symbol("second"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    if self.children:
    #        self.children[0].format(optns, state)
    #    state.add(r,optns,optns)

    #@method(symbol("third"))
    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    if self.children:
    #        self.children[0].format(optns, state)
    #    state.add(r,optns,optns)

    #def format(self, optns, state):
    #    state.add(self.commentsPretty(self.comments, optns, state,optns))
    #    self.noline()
    #    state.add(self.write("(",optns))
    #    a = []
    #    for c in self.children:
    #        a.append(c.format(optns, state))
    #    state.add(u', '.join(a,optns))
    #    state.add(self.write(",optns)"))
    #    state.add(r,optns,optns)

    #symbol("params").format = format
    #symbol("arguments").format = format

# ------------------------------------------------------------------------------
# Interface functions
# ------------------------------------------------------------------------------

class FormatterState(object):
    def __init__(self):
        self.indentLevel = 0
        self.currLine    = 1   # current insert line
        self.currColumn  = 1   # current insert column (where the next char will be inserted)
        self.last_token  = None
        self.inExpression = False
        self.inQxDefine = False
        self.output = []  # list of output lines
        self.line = u''   # current output line buffer

    def indent(self):
        self.indentLevel += 1

    def outdent(self):
        if self.indentLevel > 0:
            self.indentLevel -= 1

    def indentStr(self, optns, incColumn=False):
        indent = optns.prettypIndentString * self.indentLevel
        if incColumn:
            self.currColumn += len(indent)
        return indent

    def append(self, el):
        self.output.append(el)
     
    re_non_white = re.compile(r'\S',re.U)
    def add(self, str_, optns):
        def not_all_white(s):
            return self.re_non_white.search(s)

        while str_:
            # Add fragment to line
            if '\n' in str_:
                had_eol = True
                idx = str_.find('\n')
            else:
                had_eol = False
                idx = len(str_)
            fragment = str_[:idx]
            if not self.line:
                if not_all_white(fragment):  # beginning of line with non-white addition
                    self.line = self.indentStr(optns) + fragment #.lstrip()
            else:
                self.line += fragment  # all-white lines will be trimmed in self.layout_line

            # Reduce
            str_ = str_[idx+1:]

            # Write complete lines
            if had_eol:
                line = self.layout_line(self.line)
                self.append(line)
                self.line = ''
        # postcond: rest of str_ is in self.line
            
    def layout_line(self, str_):
        str_ = str_.rstrip() # remove trailing ws
        str_ += self.nl()
        return str_

    # TODO: duplicates tree.nl() in this module
    def nl(self):
        return '\n'

    ##
    # Whether the current line has content
    def hasLeadingContent(self, honorWhite=False):
        if honorWhite and self.line != '\n':
            return len(self.line)
        else:
            return self.re_non_white.search(self.line)


class FormatterOptions(object): pass

def formatNode(tree, options, result):
    state = FormatterState()
    tokenStream = TreeSerializer(tree)
    formatter = Formatter(options, state)
    s = formatter.format(tokenStream)
    return s


def defaultOptions(optns):
    optns.prettyPrint = True  # turn on pretty-printing
    optns.prettypCommentsBlockAdd  = True  # comment filling
    optns.prettypIndentString      = "  "   # general indent string
    optns.prettypOpenCurlyNewlineBefore = 'n'  # mixed, dep. on complexity
    optns.prettypOpenCurlyIndentBefore  = False  # indent curly on a new line
    optns.prettypAlignBlockWithCurlies  = False  # put block on same column as curlies
    optns.prettypCommentsTrailingCommentCols = ''  # put trailing comments on fixed columns
    optns.prettypCommentsTrailingKeepColumn  = False  # fix trailing comment on column of original text
    optns.prettypCommentsInlinePadding  = '  '   # space between end of code and beginning of comment
    optns.prettypTextWidth = 80 # 0
    return optns

def indentString(optns, state):
    return optns.prettypIndentString * state.indentLevel
