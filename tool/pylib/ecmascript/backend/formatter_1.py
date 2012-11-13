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
# External visitor for formatted/pretty output of AST
##

import sys, os, re, types, string

from ecmascript.frontend.treegenerator import method, symbol, symbol_base, SYMBOLS, identifier_regex, PackerFlags as pp
from ecmascript.frontend import lang, Comment, treeutil

# ------------------------------------------------------------------------------
# Interface functions
# ------------------------------------------------------------------------------

class FormatterState(object): pass

def formatNode(tree, options, result):
    state = FormatterState()
    state = defaultState(state, options)
    formatter = Formatter(tree, options, state)
    return [formatter.visit()]


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

def defaultState(state, optns):
    state.indentLevel = 0
    return state

# ------------------------------------------------------------------------------
# Helper
# ------------------------------------------------------------------------------

def indentString(optns, state):
    return optns.prettypIndentString * state.indentLevel

# ------------------------------------------------------------------------------
# Formatter Visitor
# ------------------------------------------------------------------------------

class Formatter(treeutil.NodeVisitor):

    def __init__(self, root_node, options, state):
        super(Formatter, self).__init__()
        self.root_node = root_node
        self.optns = options
        self.state = state

    def visit(self, node):
        r = []
        r += [self.commentsPretty(node.comments)]
        if hasattr(self, "visit_"+node.type):
            if self.debug: print "visiting:", node.type
            getattr(self, "visit_"+node.type)(node)
        elif node.children:
            for child in node.children:
                r.append(self.visit(child))
        else:
            r += [self.get("value", u'')]
        r += [self.commentsPretty(node.commentsAfter)]
        return u''.join(r)

    def commentsPretty(self, comments):
        res = []
        for i,commentNode in enumerate(comments):
            commentStr = self.visit(commentNode)
            res.append(commentStr)
            # handle additional line breaks between comments
            if i>0:
                pass
                #curr_start = commentNode.get("line")
                #prev_start = comments[i-1].get("line")
                #prev_lines = res[i-1].count('\n')
                #addtl_lb = curr_start - prev_start + prev_lines
                #res[i-1] += addtl_lb * '\n'
        return u''.join(res)


    def infix(id_):
        def visit_(self, optns, state):
            r = self.commentsPretty(self.comments, optns, state)
            r += self.getChild(0).format(optns, state)
            r += ' '
            r += self.get("value")
            r += ' '
            r += self.getChild(1).format(optns, state)
            return r
        symbol(id_).format = format

    for sym in SYMBOLS['infix']+SYMBOLS['infix_r']:
        infix(sym)

    ##
    # infix "verb" operators, i.e. that need a space around themselves (like 'instanceof', 'in')
    def infix_v(id_):
        def visit_(self, optns, state):  # adapt the output
            r = self.commentsPretty(self.comments, optns, state)
            r += self.getChild(0).format(optns, state)
            r += self.space()
            r += self.get("value")
            r += self.space()
            r += self.getChild(1).format(optns, state)
            return r
        symbol(id_).format = format
            
    for sym in SYMBOLS['infix_v']:
        infix_v(sym)

    ##
    # prefix "sigil" operators, like '!', '~', ...
    def prefix(id_):
        def visit_(self, optns, state):
            r = self.commentsPretty(self.comments, optns, state)
            r += self.get("value")
            r += self.getChild(0).format(optns, state)
            return r
        symbol(id_).format = format

    for sym in SYMBOLS['prefix']:
        prefix(sym)

    ##
    # prefix "verb" operators, i.e. that need a space before their operand like 'delete'
    def prefix_v(id_):
        def visit_(self, optns, state):
            r = self.commentsPretty(self.comments, optns, state)
            r += self.get("value")
            r += self.space()
            r += self.getChild(0).format(optns, state)
            return r
        symbol(id_).format = format

    for sym in SYMBOLS['prefix_v']:
        prefix_v(sym)

    def preinfix(id_):  # pre-/infix operators (+, -)
        def visit_(self, optns, state):  # need to handle pre/infix cases
            r = self.commentsPretty(self.comments, optns, state)
            r = [r]
            first = self.getChild(0).format(optns, state)
            op = self.get("value")
            prefix = self.get("left", 0)
            if prefix and prefix == "true":
                r = [op, first]
            else:
                second = self.getChild(1).format(optns, state)
                r = [first, ' ', op, ' ', second]
            return ''.join(r)
        symbol(id_).format = format

    for sym in SYMBOLS['preinfix']:
        preinfix(sym)

    def prepostfix(id_):  # pre-/post-fix operators (++, --)
        def visit_(self, optns, state):
            r = self.commentsPretty(self.comments, optns, state)
            operator = self.get("value")
            operand = self.getChild(0).format(optns, state)
            r += self.get("value")
            if self.get("left", '') == "true":
                r = [operator, operand]
            else:
                r = [operand, operator]
            return u''.join(r)
        symbol(id_).format = format

    for sym in SYMBOLS['prepostfix']:
        prepostfix(sym)


    def visit_constant(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
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


    def visit_identifier(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        v = self.get("value", u"")
        if v:
            r += self.write(v)
        return r

    def visit_hook(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append(self.getChild(0).format(optns, state))
        r.append(' ')
        r.append('?')
        r.append(' ')
        r.append(self.getChild(1).format(optns, state))
        r.append(' ')
        r.append(':')
        r.append(' ')
        r.append(self.getChild(2).format(optns, state))
        return ''.join(r)

    def visit_dotaccessor(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.children[0].format(optns, state)
        r += '.'
        r += self.children[1].format(optns, state)
        return r

    def visit_operand(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.children[0].format(optns, state)
        return r

    def visit_group(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append('(')
        a = []
        for c in self.children:
            a.append(c.format(optns, state))
        r.append(', '.join(a))
        r.append(')')
        return ''.join(r)

    def visit_accessor(self, optns, state):
        r = self.children[0].format(optns, state)
        r += self.commentsPretty(self.comments, optns, state)
        r += '['
        r += self.children[1].format(optns, state)
        r += ']'
        return r

    def visit_array(self, optns, state):
        cmnts = self.commentsPretty(self.comments, optns, state)
        r = []
        for c in self.children:
            r.append(c.format(optns, state))
        return cmnts + '[' + u', '.join(r) + ']'

    def visit_key(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.children[0].format(optns, state)
        r += self.commentsPretty(self.commentsAfter, optns, state)
        return r

    def visit_map(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.write("{\n")
        state.indentLevel += 1
        indent = indentString(optns, state)
        a = []
        for c in self.children:
            a.append(indent + c.format(optns, state))
        r += (',\n').join(a)
        state.indentLevel -= 1
        if len(self.children):
            r += '\n'
        r += self.write("%s}"%indentString(optns, state))
        return r

    def visit_value(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.children[0].format(optns, state)
        return r

    def visit_keyvalue(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
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
        value = self.getChild("value").format(optns, state)
        return r + quote + key + quote + ' : ' + value

    def visit_block(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append('{')
        r.append(self.children[0].format(optns, state))
        r.append('}')
        return u''.join(r)

    def visit_function(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.write("function")
        if self.getChild("identifier",0):
            functionName = self.getChild("identifier").get("value")
            r += self.space(result=r)
            r += self.write(functionName)
        # params
        r += self.getChild("params").format(optns, state)
        # body
        r += self.getChild("body").format(optns, state)
        return r

    def visit_body(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append(self.children[0].format(optns, state))
        # 'if', 'while', etc. can have single-statement bodies
        if self.children[0].id != 'block':
            r.append(';')
        return u''.join(r)

    def visit_var(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append("var")
        r.append(self.space())
        a = []
        for c in self.children:
            a.append(c.format(optns, state))
        r.append(','.join(a))
        return ''.join(r)

    def visit_definition(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.children[0].format(optns, state)
        return r

    def visit_for(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append('for')
        r.append(self.space(False,result=r))
        # cond
        r.append('(')
        # for (in)
        if self.get("forVariant") == "in":
            r.append(self.children[0].format(optns, state))
        # for (;;)
        else:
            r.append(self.children[0].children[0].format(optns, state))
            r.append(';')
            r.append(self.children[0].children[1].format(optns, state))
            r.append(';')
            r.append(self.children[0].children[2].format(optns, state))
        r.append(')')
        # body
        r.append(self.getChild("body").format(optns, state))
        return u''.join(r)

    def visit_in(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.getChild(0).format(optns, state)
        r += self.space()
        r += 'in'
        r += self.space()
        r += self.getChild(1).format(optns, state)
        return r

    def visit_expressionList(self, optns, state):  # WARN: this conflicts (and is overwritten) in for(;;).format
        cmnts = self.commentsPretty(self.comments, optns, state)
        r = []
        for c in self.children:
            r.append(c.format(optns, state))
        return cmnts + ','.join(r)

    def visit_while(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.write("while")
        r += self.space(False,result=r)
        # cond
        r += '('
        r += self.children[0].format(optns, state)
        r += ')'
        # body
        r += self.children[1].format(optns, state)
        return r

    def visit_with(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append("with")
        r.append(self.space())
        r.append('(')
        r.append(self.children[0].format(optns, state))
        r.append(')')
        r.append(self.children[1].format(optns, state))
        return ''.join(r)

    def visit_do(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append("do")
        r.append(self.space())
        r.append(self.children[0].format(optns, state))
        r.append('while')
        r.append('(')
        r.append(self.children[1].format(optns, state))
        r.append(')')
        return ''.join(r)

    def visit_if(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
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
        r += self.children[0].format(optns, state)
        r += self.write(")")
        # 'then' part
        r += self.children[1].format(optns, state)
        # (opt) 'else' part
        if len(self.children) == 3:
            r += self.space()
            r += self.write("else")
            r += self.space()
            r += self.children[2].format(optns, state)
        r += self.space(False,result=r)
        return r

    def visit_loop(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
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
        #    r += self.children[0].format(optns, state)
        #    r += ')'
        #    # then
        #    r += self.children[1].format(optns, state)
        #    # else
        #    if len(self.children) == 3:
        #        r += self.write("else")
        #        r += self.children[2].format(optns, state)
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

    def visit_break(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.write("break")
        if self.children:
            r += self.space(result=r)
            r += self.write(self.children[0].format(optns, state))
        return r

    def visit_continue(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.write("continue")
        if self.children:
            r += self.space(result=r)
            r += self.write(self.children[0].format(optns, state))
        return r

    def visit_return(self, optns, state):
        r = [self.commentsPretty(self.comments, optns, state)]
        r += ["return"]
        if self.children:
            r.append(self.space())
            r.append(self.children[0].format(optns, state))
        return ''.join(r)

    def visit_switch(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append("switch")
        # control
        r.append('(')
        r.append(self.children[0].format(optns, state))
        r.append(')')
        # body
        r.append('{')
        body = self.getChild("body")
        for c in body.children:
            r.append(c.format(optns, state))
        r.append('}')
        return ''.join(r)


    def visit_case(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append('case')
        r.append(self.space())
        r.append(self.children[0].format(optns, state))
        r.append(':')
        if len(self.children) > 1:
            r.append(self.children[1].format(optns, state))
        return ''.join(r)


    def visit_default(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append('default')
        r.append(':')
        if len(self.children) > 0:
            r.append(self.children[0].format(optns, state))
        return ''.join(r)

    def visit_try(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r.append("try")
        r.append(self.children[0].format(optns, state))
        catch = self.getChild("catch", 0)
        if catch:
            r.append(self.space())
            r.append("catch")
            r.append(catch.children[0].format(optns, state))
            r.append(self.space())
            r.append(catch.children[1].format(optns, state))
        finally_ = self.getChild("finally", 0)
        if finally_:
            r.append("finally")
            r.append(finally_.children[0].format(optns, state))
        return ''.join(r)

    def visit_throw(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += 'throw'
        r += self.space()
        r += self.children[0].format(optns, state)
        return r

    def visit_empty(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        return r

    def visit_label(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        r += [self.get("value")]  # identifier
        r += [":"]
        r += [self.children[0].format(optns, state)]
        return ''.join(r)

    def visit_statements(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r = [r]
        indent = indentString(optns, state)
        for cld in self.children:
            l = [indent]
            c = cld.format(optns, state)
            l.append(c)
            if not c or c[-1] != ';':
                l.append(';')
            r.append(u''.join(l))
        return u'\n'.join(r)

    def visit_block(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.write("{\n")
        state.indentLevel += 1
        a = []
        for c in self.children: # should be just "statements"
            a.append(c.format(optns, state))
        a_ = u''.join(a)
        r += a_
        if a_:
            r += "\n"
        state.indentLevel -= 1
        indent_string = indentString(optns, state)
        r += self.write(indent_string + "}")
        return r

    def visit_call(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.getChild("operand").format(optns, state)
        r += self.getChild("arguments").format(optns, state)
        return r

    def visit_comment(self, optns, state):
        r = self.get("value")
        r = Comment.Text(r).indent(indentString(optns, state))
        if self.get('end', False) == True:  # 'inline' needs terminating newline anyway
            r += '\n'
        r += indentString(optns, state)  # to pass on the indentation that was set ahead of the comment
        return r

    def visit_commentsAfter(self, optns, state):
        r = self.toJS(pp)
        return r

    def visit_commentsBefore(self, optns, state):
        r = self.toJS(pp)
        return r

    def visit_file(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        r += self.children[0].format(optns, state)
        return r

    def visit_first(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        if self.children:  # could be empty in for(;;)
            r = self.children[0].format(optns, state)
        return r

    def visit_second(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        if self.children:
            r = self.children[0].format(optns, state)
        return r

    def visit_third(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        if self.children:
            r += self.children[0].format(optns, state)
        return r

    def visit_(self, optns, state):
        r = self.commentsPretty(self.comments, optns, state)
        self.noline()
        r += self.write("(")
        a = []
        for c in self.children:
            a.append(c.format(optns, state))
        r += u', '.join(a)
        r += self.write(")")
        return r

    symbol("params").format = format
    symbol("arguments").format = format

