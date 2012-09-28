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
from ecmascript.backend.formatter        import FormatterOptions, FormatterState, defaultState, defaultOptions

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

    ##
    # Returns the line-starting indent string
    #
    def indent(self):
        ident = self.optns.prettypIndentString * self.state.indentLevel
        return ident

    def maybe_indent(self):
        if self.state.last_token and self.state.last_token.name=='eol':
            return self.indent()
        else:
            return ''

    def format(self, tokenArr):
        
        for tok in tokenArr:
            token = Token(tok)  # prefer objects over dicts
            # skip leading source white space
            if token.name=="white" and self.state.last_token.name=='eol':
                continue

            if hasattr(self, "format_"+token.name):
                s = getattr(self, "format_"+token.name)(token)
            else:
                s = self.format_default(token)
            si = self.maybe_indent() + s
            #import pydb; pydb.debugger()
            self.append(si)
            self.state.last_token = token
            self.state.currColumn += len(si)

        return u''.join(self._data)


    def format_default(self, token):
        return token.value

    ##
    # 'source' line breaks
    def format_eol(self, token):
        self.state.currLine += 1
        self.state.currColumn = 1
        return '\n'

    def format_string(self, token):
        q = '"' if token.detail == "doublequotes" else "'"
        return q + token.value + q

    def format_comment(self, token):
        return Comment.Text(token.value).indent(self.indent())

    def format_white(self, token):
        if self.state.last_token == None or self.state.last_token.name == 'eol':
            return ''
        else:
            return token.value

    def format_operator(self, token):
        if hasattr(self, "format_"+token.detail):  # LP, RP, LC, RC, ...
            return getattr(self, "format_"+token.detail)(token)
        else:
            return self.format_default(token)

    def format_LC(self, token):
        if self.optns.prettypOpenCurlyNewlineBefore in 'nN':
            s = ' {'
        else:
            s = '\n' + self.indent() + '{'
        self.state.indentLevel += 1
        #import pydb; pydb.debugger()
        return s

    def format_RC(self, token):
        self.state.indentLevel -= 1
        return '}'
        

