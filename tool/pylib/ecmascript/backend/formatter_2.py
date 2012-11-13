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
from ecmascript.backend.formatter        import FormatterOptions, FormatterState, defaultOptions

# - Interface -----------------------------------------------------------------

def formatString(string_, options):
    ts = tokenizer.Tokenizer().parseStream(string_)
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
        self.line = u''

    def _getCurrColumn(self):
        return len(self.line) + 1

    # use own currColumn instead of self.state.currColumn
    currColumn = property(_getCurrColumn)

    def append(self, el):
        self._data.append(el)

    ##
    # Returns the line-starting indent string
    #
    def indentStr(self, incColumn=False):
        indent = self.optns.prettypIndentString * self.state.indentLevel
        if incColumn:
            #self.state.currColumn += len(indent)
            pass
        return indent

    def nl(self):
        self.state.currLine += 1
        #self.state.currColumn = 1
        return '\n'

    ##
    # Increase indent
    def indent(self):
        self.state.indentLevel += 1

    ##
    # Decrease indent
    def outdent(self):
        if self.state.indentLevel > 0:
            self.state.indentLevel -= 1

    line = u''
    re_non_white = re.compile(r'\S',re.U)
    def add(self, str_):
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
                    self.line = self.indentStr() + fragment #.lstrip()
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

    ##
    # Whether the current line trails in non-white elements
    def hasLeadingContent(self):
        if not self.line:
            return False
        elif self.line == '\n':
            return False
        else:
            return True

    # --------------------------------------------------------------------------

    def format(self, tokenArr):
        self.tokenArr = tokenArr
        if self.state.indentLevel > 0:
            self.state.indentLevel -= 1
        
        for i,tok in enumerate(tokenArr):
            token = Token(tok)  # prefer objects over dicts
            self.tokenIdx = i

            # text width
            if (self.optns.prettypTextWidth and 
                token.name not in ('comment','white') and
                token.detail not in ('COMMA', 'SEMICOLON', 'RC', 'RB', 'RC') and
                len(token.value) + self.currColumn > self.optns.prettypTextWidth):
                self.add('\n')
                if not self.state.inExpression:
                    self.indent()
                    self.state.inExpression = True

            if token.value in ';\n':  # quick statement-end hack
                if self.state.inExpression:
                    self.outdent()
                    self.state.inExpression = False

            # dispatch handlers
            if hasattr(self, "format_"+token.name):
                s = getattr(self, "format_"+token.name)(token)
            else:
                s = self.format_default(token)

            si = s
            self.add(si)
            self.state.last_token = token

        self.add('\n') # add remainder in self.line
        return u''.join(self._data)


    def format_default(self, token):
        return token.value

    ##
    # 'source' line breaks
    def format_eol(self, token):
        return token.value

    def format_string(self, token):
        q = '"' if token.detail == "doublequotes" else "'"
        return q + token.value + q

    def format_comment(self, token):
        #return Comment.Text(token.value).indent(self.indentStr())
        if hasattr(self, "format_comment_"+token.detail):  # 'block', 'inline'
            return getattr(self, "format_comment_"+token.detail)(token)
        else:
            return self.format_default(token)

    def format_comment_block(self, token):
        return token.value

    re_endwhite = re.compile(r'\s*$', re.U)

    def format_comment_inline(self, token):
        res = ''
        if self.optns.prettypCommentsTrailingKeepColumn:
            if self.currColumn < token.column:
                shiftStr = ' ' * (token.column - self.currColumn)
                res += shiftStr
        elif self.optns.prettypCommentsTrailingCommentCols:
            cols = [c for c in self.optns.prettypCommentsTrailingCommentCols
                    if c > self.currColumn]
            col = cols[0] if cols else 0
            shiftStr = ' ' * (col - self.currColumn)
            res += shiftStr
        elif self.optns.prettypCommentsInlinePadding:  
            if self.hasLeadingContent():
                self.line = self.re_endwhite.sub(
                    self.optns.prettypCommentsInlinePadding, self.line)
        return res + token.value

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
        if self.optns.prettypOpenCurlyNewlineBefore not in 'nN' and self.hasLeadingContent():
            self.add('\n')
            if self.optns.prettypOpenCurlyIndentBefore:
                self.indent()
        self.add('{')
        if not self.optns.prettypAlignBlockWithCurlies:
            self.indent()
        return ''

    def format_RC(self, token):
        if not self.optns.prettypAlignBlockWithCurlies:
            self.outdent()
        if self.optns.prettypOpenCurlyIndentBefore:
            self.outdent()
        return '}'
        
    def format_LP(self, token):
        self.add('(')
        # qx.*.define hack
        if (self.tokenArr[self.tokenIdx-1]['source'] == 'define' and
            self.tokenArr[self.tokenIdx-5]['source'] == 'qx'):  # qx . * . define
                pass  # this works for qx.*.define at the beginning of a line
        else:
            self.indent()
        return ''

    def format_RP(self, token):
        self.outdent()
        return ')'
        
    def format_LB(self, token):
        self.indent()
        return '['

    def format_RB(self, token):
        self.outdent()
        return ']'


def defaultState(state, optns):
    state.indentLevel = 0
    state.currLine    = 1   # current insert line
    state.currColumn  = 1   # current insert column (where the next char will be inserted)
    state.last_token  = None
    state.inExpression = False
    state.inQxDefine = False
    return state

