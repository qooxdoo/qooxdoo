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
# A jsbeautifier-style formatter, formatting tokens directly without constructing
#   AST
##

import sys, os, re, types, string, itertools as itert
from ecmascript.frontend.SyntaxException import SyntaxException
from ecmascript.frontend.tree            import Node
from ecmascript.frontend.treegenerator   import method, symbol, symbol_base, SYMBOLS, identifier_regex, TokenStream, Token
from ecmascript.frontend.Scanner         import IterObject, LQueue, LimLQueue, is_last_escaped
from ecmascript.frontend                 import lang, tokenizer, Comment
from misc                                import filetool
from misc.NameSpace                      import NameSpace
from ecmascript.backend.formatter        import FormatterOptions, FormatterState, defaultState, defaultOptions, indentString

# - Interface -----------------------------------------------------------------

def formatString(string_, options):
    ts = tokenizer.parseStream(string_)
    return formatStream(ts, options)

def formatStream(tokenArr, options):
    state = FormatterState()
    state = defaultState(state, options)
    return Formatter(options, state).format(tokenArr)

# - ---------------------------------------------------------------------------

class Formatter(object):

    def __init__(self, optns, state):
        self._data = []
        self.optns = optns
        self.state = state

    def append(self, el):
        self._data.append(el)

    def format(self, tokenArr):
        global tokenStream
        tokenStream = TokenStream(tokenArr)
        
        for tok in tokenArr:
            token = Token(tok)  # prefer objects over dicts

            self.state.currColumn += len(token.value)

            if hasattr(self, "format_"+token.name):
                s = getattr(self, "format_"+token.name)(token)
            else:
                s = self.format_default(token)
            self.append(s)
            self.state.last_token = token

        return u''.join(self._data)


    def format_default(self, token):
        return token.value

    def format_eol(self, token):
        self.state.currLine += 1
        #indent = indentString(self.optns, self.state)
        #self.state.currColumn = 1 + len(indent)
        #return '\n' + indent
        self.state.indentLevel = 0
        return '\n'

    def format_string(self, token):
        q = '"' if token.detail == "doublequotes" else "'"
        return q + token.value + q

    def format_comment(self, token):
        #return Comment.Text(token.value).indent(u' '*(self.state.currColumn-1))
        return Comment.Text(token.value).indent(indentString(self.optns, self.state))

    def format_white(self, token):
        if self.state.last_token == None or self.state.last_token.name == 'eol':
            self.state.indentLevel = 1
            self.optns.prettypIndentString = token.value
        return token.value

    #def format_token(self, token):
    #    if hasattr(self, "format_"+token.detail):  # LP, RP, LC, RC, ...
    #        return getattr(self, "format_"+token.detail)(token)
    #    else:
    #        return self.format_default(token)

    #def format_LC(self, token):
    #    if self.state.optns.prettypOpenCurlyNewlineBefore in 'nN':
    #        s = ' {'
    #    else:
    #        s = '\n' + indentString(self.optns, self.state) + '{'
    #    self.state.indentLevel += 1
    #    return s

    #def format_RC(self, token):
    #    self.state.indentLevel -= 1
    #    return indentString(self.optns, self.state) + '}'
        

