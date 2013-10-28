#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2013 1&1 Internet AG, Germany, http://www.1und1.de
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
# A Mozilla Parser API / Esprima AST to tree1 transformer.
#
# https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
##

import os, sys, re, types, itertools
from ecmascript.frontend.treegenerator import method, symbol, symbol_base, SYMBOLS

##
# The Mozilla tree is not normalized (i.e. there is no standard way to access
# children of a node), so there is no generic 'visit' method, only node
# type-specific methods.
#
class EsprimaToTree1(object):

    def visit_Program(self, enode):
        nnode = symbol('file')()
        # TODO: self.add_location(nnode, enode)
        for child in enode["body"]:
            nchild = self.visit_Statement(child)
            if nchild:
                nnode.childappend(nchild)
        return nnode

    def visit_Function(self, enode):
        nnode = symbol('function')()
        if enode["id"] != None:
            id_node = symbol('identifier')()
            nnode.childappend(id_node)
        params_node = symbol('params')()
        for param in enode["params"]:
            p_node = symbol('identifier')()
            params_node.childappend(p_node)
        for child in enode["body"]:
            nchild = getattr(self, "visit_"+child["type"])(child) # 'BlockStatement' or 'Expression'
            if nchild:
                nnode.childappend(nchild)
        return nnode

    ##
    # all the 'statement' types
    def visit_Statement(self, enode):
        return getattr(self, "visit_"+enode["type"])(enode)

    def visit_EmptyStatement(self, enode):
        return symbol('(empty)')()

    def visit_BlockStatement(self, enode):
        n = symbol("block")()
        for child in enode["body"]:
            nchild = self.visit_Statement(child)
            if nchild:
                n.childappend(nchild)
        return n

    def visit_ExpressionStatement(self, enode):
        return self.visit_Expression(enode)

    def visit_IfStatement(self, enode):
        n = symbol("loop")()
        n.set('loopType', "IF")
        # cond
        n.childappend(self.visit_Expression(enode["test"]))
        # then
        n.childappend(self.visit_Statement(enode["consequent"]))
        # else
        if enode["alternate"] != None:
            n.childappend(self.visit_Statement(enode["alternate"]))
        return n

    def visit_LabeledStatement(self, enode):
        n = symbol("label")()
        n.set("value", enode["label"])
        n.childappend(self.visit_Statement(enode["body"]))
        return n

    def visit_BreakStatement(self, enode):
        n = symbol("break")()
        if enode["label"] != None:
            n.childappend(self.visit_Identifier(enode["label"]))
        return n

    def visit_ContinueStatement(self, enode):
        n = symbol("continue")()
        if enode["label"] != None:
            n.childappend(self.visit_Identifier(enode["label"]))
        return n

    def visit_WithStatement(self, enode):
        n = symbol("loop")()
        n.set('loopType', "WITH")
        n.childappend(self.visit_Expression(enode["object"]))
        n.childappend(self.visit_Statement(enode["body"]))
        return n

    def visit_SwitchStatement(self, enode):
        n = symbol("switch")()
        n.childappend(self.visit_Expression(enode["discriminant"]))
        b = symbol("body")()
        n.childappend(b)
        for child in enode["cases"]:
            nchild = self.visit_SwitchCase(child)
            if nchild:
                b.childappend(nchild)
        return n

    def visit_ReturnStatement(self, enode):
        n = symbol("return")()
        if enode["argument"] != None:
            n.childappend(self.visit_Expression(enode["argument"]))
        return n

    def visit_ThrowStatement(self, enode):
        n = symbol("throw")()
        n.childappend(self.visit_Expression(enode["argument"]))
        return n

    def visit_TryStatement(self, enode):
        n = symbol("try")()
        n.childappend(self.visit_BlockStatement(enode["block"]))
        # ALERT: This is Esprima; the Moz spec has 'handler' and 'guardedHandlers',
        # Esprima uses 'handlers' and 'guardedHandlers' is always empty(!?)
        for child in enode["handlers"]:
            nchild = self.visit_CatchClause(child)
            if nchild:
                n.childappend(nchild)
            break  # tree1 only handles a single 'catch' clause; multiple 'catch' clauses are SpiderMonkey-specific
        if enode["finalizer"] != None:
            f = symbol("finally")()
            n.childappend(f)
            f.childappend(self.visit_BlockStatement(enode["finalizer"]))
        return n

    def visit_WhileStatement(self, enode):
        n = symbol("loop")()
        n.set("loopType", "WHILE")
        n.childappend(self.visit_Expression(enode["test"])) # TODO: visit_Expression needs to return an expressionList!
        b = symbol("body")()
        n.childappend(b)
        b.childappend(self.visit_Statement(enode["body"]))
        return n

    def visit_DoWhileStatement(self, enode):
        n = symbol("loop")()
        n.set("loopType", "DO")
        b = symbol("body")()
        n.childappend(b)
        b.childappend(self.visit_Statement(enode["body"]))
        n.childappend(self.visit_Expression(enode["test"]))
        return n

    def visit_ForStatement(self, enode):
        n = symbol("loop")()
        n.set("loopType", "FOR")
        n.set("forVariant", "iter")
        cond = symbol("expressionList")()
        n.childappend(cond)
        # for (;;)
        f = symbol("first")()
        cond.childappend(f)
        if enode["init"].type == "VariableDeclaration":
            f.childappend(self.visit_VariableDeclaration(enode["init"]))
        elif enode["init"].type == "Expression":
            f.childappend(self.visit_Expression(enode["init"]))
        s = symbol("second")()
        cond.childappend(s)
        if enode["test"] != None:
            s.childappend(self.visit_Expression(enode["test"]))
        t = symbol("third")()
        cond.childappend(t)
        if enode["update"] != None:
            t.childappend(self.visit_Expression(enode["update"]))
        # body
        b = symbol("body")()
        n.childappend(b)
        b.childappend(self.visit_Statement(enode["body"]))
        return n

    def visit_ForInStatement(self, enode):
        n = symbol("loop")()
        n.set("loopType", "FOR")
        n.set("forVariant", "in")
        i = symbol("operation")()
        i.set("operator", "IN")
        i.set("value", "in")      # TODO: maybe i need to set "value" with all the others, besides line/column
        n.childappend(i)
        if enode["left"].type == "VariableDeclaration":
            i.childappend(self.visit_VariableDeclaration(enode["left"]))
        elif enode["left"].type == "Expression":
            i.childappend(self.visit_Expression(enode["left"]))
        i.childappend(self.visit_Expression(enode["right"]))
        # body
        b = symbol("body")()
        n.childappend(b)
        b.childappend(self.visit_Statement(enode["body"]))
        return n

    def visit_ForOfStatement(self, enode):
        raise NotImplementedError("'for/of' statements are not yet supported")

    def visit_LetStatement(self, enode):
        raise NotImplementedError("'let' statements are not yet supported")

    # Declarations are statements, too

    def visit_FunctionDeclaration(self, enode):
        assert enode["id"]
        return self.visit_Function(enode)

    def visit_VariableDeclaration(self, enode):
        n = symbol("var")()
        for child in enode["declarations"]:
            n.childappend(self.visit_VariableDeclarator(child))
        return n

    def visit_VariableDeclarator(self, enode):
        n = symbol("definition")()
        if enode["init"]:
            el = symbol("=")()
            el.childappend(self.visit_Identifier(enode["id"]))
            el.childappend(self.visit_Expression(enode["init"]))
        else:
            el = self.visit_Identifier(enode["id"])
        n.childappend(el)
        return n


    # Expressions

    def visit_Expression(self, enode):
        return getattr(self, "visit_"+enode["type"])(enode)

    def visit_ThisExpression(self, enode):
        n = self.visit_Identifier({
            "name": 'this',
            'type': 'Identifier'
        });
        return n

    def visit_ArrayExpression(self, enode): # array literal
        n = symbol("array")()
        for child in enode["elements"]:
            if child is None:
                n.childappend(symbol("(empty)")())
            else:
                n.childappend(self.visit_Expression(child))
        return n

    def visit_ObjectExpression(self, enode): # map
        n = symbol("map")()
        for child in enode["properties"]:
            item = symbol("keyvalue")()
            n.childappend(item)
            # key  
            if child['key']['type'] == 'Literal':
                item.set("key", child['key']['value'])
                if isinstance(child['key']['value'], types.StringTypes):
                    item.set("quote", "doublequotes")  # TODO: this is fake, but distinguishes between number and string
                else: # Number
                    item.set("quote", "")
            else: # 'Identifier'
                item.set("key", child['key']['name'])
            # value
            val = symbol("value")()
            item.childappend(val)
            val.childappend(self.visit_Expression(child['value']))
        return n

    def visit_FunctionExpression(self, enode):
        return self.visit_Function(enode)

    def visit_ArrowExpression(self, enode):
        raise NotImplementedError("'arrow' expressions are not yet supported")

    def visit_SequenceExpression(self, enode): # '1,2,3;'
        n = symbol("expressionList")()
        for child in enode["expressions"]:
            n.childappend(self.visit_Expression(child))
        return n

    def visit_UnaryExpression(self, enode): # -, +, !, ~, typeof, void, delete
        n = symbol(enode["operator"])()
        if enode["prefix"]:
            n.set("left", "true")
        n.childappend(self.visit_Expression(enode["argument"]))
        return n

    def visit_BinaryExpression(self, enode): # <, <=, ...
        n = symbol(enode["operator"])()
        n.childappend(self.visit_Expression(enode["left"]))
        n.childappend(self.visit_Expression(enode["right"]))
        return n

    def visit_AssignmentExpression(self, enode): # =, +=, ...
        n = symbol(enode["operator"])()
        n.childappend(self.visit_Expression(enode["left"]))
        n.childappend(self.visit_Expression(enode["right"]))
        return n

    def visit_UpdateExpression(self, enode): # --, ++
        n = symbol(enode["operator"])()
        if enode["prefix"]:
            n.set("left", "true")
        n.childappend(self.visit_Expression(enode["argument"]))
        return n

    def visit_LogicalExpression(self, enode): # ||, &&
        n = symbol(enode["operator"])()
        n.childappend(self.visit_Expression(enode["left"]))
        n.childappend(self.visit_Expression(enode["right"]))
        return n

    def visit_ConditionalExpression(self, enode): # .. ? .. : .. (hook)
        n = symbol("?")()
        n.childappend(self.visit_Expression(enode["test"]))
        n.childappend(self.visit_Expression(enode["consequent"]))
        n.childappend(self.visit_Expression(enode["alternate"]))
        return n

    def visit_NewExpression(self, enode):
        n = symbol("new")()
        if enode["arguments"]: # have to coerce two members into a single 'call' tree
            arg = symbol("call")()
            operand = symbol("operand")()
            operand.childappend(self.visit_Expression(enode["callee"]))
            arg.childappend(operand)
            cargs = symbol("arguments")()
            for child in enode["arguments"]:
                cargs.childappend(self.visit_Expression(child))
            arg.childappend(cargs)
        else:
            arg = self.visit_Expression(enode["callee"])
        n.childappend(arg)
        return n





# - ---------------------------------------------------------------------------

def esprima_to_tree1(etree):
    tree_transformer = EsprimaToTree1(etree)
    new_node = tree_transformer.visit_Program()
    return new_node

