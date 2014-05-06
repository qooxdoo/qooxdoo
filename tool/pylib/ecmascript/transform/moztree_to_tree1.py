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

import os, sys, re, types, copy
from ecmascript.frontend.treegenerator import method, symbol, symbol_base, SYMBOLS
from ecmascript.frontend               import treegenerator, lang
from ecmascript.transform.optimizer import reducer

##
# The Mozilla tree is not normalized (i.e. there is no standard way to access
# children of a node), so there is no generic 'visit' method, only node
# type-specific methods.
#
class EsprimaToTree1(object):

    def __init__(self, tree_root=None):
        pass

    def visit_Program(self, enode):
        nnode = new_symbol('file', enode)
        nnode.set("treegenerator_tag", 1)
        s = new_symbol('statements', enode)
        nnode.childappend(s)
        # TODO: self.add_location(nnode, enode)
        for child in enode["body"]:
            nchild = self.visit_Statement(child)
            if nchild:
                s.childappend(nchild)
        return nnode

    def visit_Function(self, enode):
        nnode = new_symbol('function', enode)
        nnode.set("value", "function")
        if enode["id"] != None:
            id_node = new_symbol('identifier', enode)
            id_node.set("value", enode["id"]['name'])
            nnode.childappend(id_node)
        # params
        params_node = new_symbol('params', enode)
        nnode.childappend(params_node)
        for param in enode["params"]:
            assert param['type'] == 'Identifier'
            p_node = new_symbol('identifier', param)
            p_node.set("value", param['name'])
            params_node.childappend(p_node)
        # body
        body = new_symbol("body", enode["body"])
        nnode.childappend(body)
        nchild = getattr(self, "visit_"+enode["body"]["type"])(enode["body"]) # 'BlockStatement' or 'Expression'
        body.childappend(nchild)
        return nnode

    ##
    # all the 'statement' types
    def visit_Statement(self, enode):
        return getattr(self, "visit_"+enode["type"])(enode)

    def visit_EmptyStatement(self, enode):
        return symbol('(empty)')()

    def visit_BlockStatement(self, enode):
        n = new_symbol("block", enode)
        s = new_symbol("statements", enode)
        n.childappend(s)
        for child in enode["body"]:
            nchild = self.visit_Statement(child)
            if nchild:
                s.childappend(nchild)
        return n

    def visit_ExpressionStatement(self, enode):
        return self.visit_Expression(enode["expression"])

    def visit_IfStatement(self, enode):
        n = new_symbol("if", enode)
        n.type = 'loop'
        n.set('loopType', "IF")
        n.set("value", "if")
        # cond
        n.childappend(self.visit_Expression(enode["test"]))
        # then
        b = new_symbol("body", enode["consequent"])
        b.childappend(self.visit_Statement(enode["consequent"]))
        n.childappend(b)
        # else
        if enode["alternate"] != None:
            b = new_symbol("body", enode["alternate"])
            b.childappend(self.visit_Statement(enode["alternate"]))
            n.childappend(b)
        return n

    def visit_LabeledStatement(self, enode):
        n = new_symbol("label", enode)
        n.set("value", enode["label"])
        n.childappend(self.visit_Statement(enode["body"]))
        return n

    def visit_BreakStatement(self, enode):
        n = new_symbol("break", enode)
        n.set("value", "break")
        if enode["label"] != None:
            n.childappend(self.visit_Identifier(enode["label"]))
        return n

    def visit_ContinueStatement(self, enode):
        n = new_symbol("continue", enode)
        n.set("value", "continue")
        if enode["label"] != None:
            n.childappend(self.visit_Identifier(enode["label"]))
        return n

    def visit_WithStatement(self, enode):
        n = new_symbol("with", enode)
        n.type = 'loop'
        n.set('loopType', "WITH")
        n.set("value", "with")
        n.childappend(self.visit_Expression(enode["object"]))
        n.childappend(self.visit_Statement(enode["body"]))
        return n

    def visit_SwitchStatement(self, enode):
        n = new_symbol("switch", enode)
        n.set("value", "switch")
        n.childappend(self.visit_Expression(enode["discriminant"]))
        b = new_symbol("body", enode)
        n.childappend(b)
        for child in enode["cases"]:
            nchild = self.visit_SwitchCase(child)
            if nchild:
                b.childappend(nchild)
        return n

    def visit_ReturnStatement(self, enode):
        n = new_symbol("return", enode)
        n.set("value", "return")
        if enode["argument"] != None:
            n.childappend(self.visit_Expression(enode["argument"]))
        return n

    def visit_ThrowStatement(self, enode):
        n = new_symbol("throw", enode)
        n.set("value", "throw")
        n.childappend(self.visit_Expression(enode["argument"]))
        return n

    def visit_TryStatement(self, enode):
        n = new_symbol("try", enode)
        n.set("value", "try")
        n.childappend(self.visit_BlockStatement(enode["block"]))
        # ALERT: This is Esprima; the Moz spec has 'handler' and 'guardedHandlers',
        # Esprima uses 'handlers' and 'guardedHandlers' is always empty(!?)
        for child in enode["handlers"]:
            nchild = self.visit_CatchClause(child)
            if nchild:
                n.childappend(nchild)
            break  # tree1 only handles a single 'catch' clause; multiple 'catch' clauses are SpiderMonkey-specific
        if enode["finalizer"] != None:
            f = new_symbol("finally", enode["finalizer"])
            f.set("value", "finally")
            n.childappend(f)
            f.childappend(self.visit_BlockStatement(enode["finalizer"]))
        return n

    def visit_WhileStatement(self, enode):
        n = new_symbol("while", enode)
        n.type = 'loop'
        n.set("loopType", "WHILE")
        n.set("value", "while")
        n.childappend(self.visit_Expression(enode["test"])) # TODO: visit_Expression needs to return an expressionList!
        b = new_symbol("body", enode["body"])
        n.childappend(b)
        b.childappend(self.visit_Statement(enode["body"]))
        return n

    def visit_DoWhileStatement(self, enode):
        n = new_symbol("do", enode)
        n.type = 'loop'
        n.set("value", "do")
        n.set("loopType", "DO")
        b = new_symbol("body", enode)
        n.childappend(b)
        b.childappend(self.visit_Statement(enode["body"]))
        n.childappend(self.visit_Expression(enode["test"]))
        return n

    def visit_ForStatement(self, enode):  # for (;;)
        n = new_symbol("for", enode)
        n.type = 'loop'
        n.set("value", "for")
        n.set("loopType", "FOR")
        n.set("forVariant", "iter")
        cond = new_symbol("expressionList", enode)
        n.childappend(cond)
        # Condition
        # first
        f = new_symbol("first", enode)
        cond.childappend(f)
        el = new_symbol("expressionList", enode)
        if enode['init'] == None:
            pass
        elif enode["init"]["type"] == "VariableDeclaration":
            el.childappend(self.visit_VariableDeclaration(enode["init"]))
        elif enode['init']['type'] == 'SequenceExpression':
            el = self.visit_SequenceExpression(enode["init"])  # visit_SequenceExpression already creates an <expressionList>
        else:
            el.childappend(self.visit_Expression(enode["init"]))
        f.childappend(el)
        # second
        s = new_symbol("second", enode)
        cond.childappend(s)
        el = new_symbol("expressionList", enode)
        if enode["test"] == None:
            pass
        elif enode['test']['type'] == 'SequenceExpression':
            el = self.visit_SequenceExpression(enode["test"])  # visit_SequenceExpression already creates an <expressionList>
        else:
            el.childappend(self.visit_Expression(enode["test"]))
        s.childappend(el)
        # third
        t = new_symbol("third", enode)
        cond.childappend(t)
        el = new_symbol("expressionList", enode)
        if enode["update"] == None:
            pass
        elif enode['update']['type'] == 'SequenceExpression':
            el = self.visit_SequenceExpression(enode["update"])  # visit_SequenceExpression already creates an <expressionList>
        else:
            el.childappend(self.visit_Expression(enode["update"]))
        t.childappend(el)
        # body
        b = new_symbol("body", enode['body'])
        n.childappend(b)
        b.childappend(self.visit_Statement(enode["body"]))
        return n

    def visit_ForInStatement(self, enode):
        n = new_symbol("for", enode)
        n.type = 'loop'
        n.set("loopType", "FOR")
        n.set("forVariant", "in")
        n.set("value", "for")
        i = new_symbol("operation", enode)
        i.set("operator", "IN")
        i.set("value", "in")
        n.childappend(i)
        if enode["left"]["type"] == "VariableDeclaration":
            i.childappend(self.visit_VariableDeclaration(enode["left"]))
        elif enode["left"]["type"] == "Expression":
            i.childappend(self.visit_Expression(enode["left"]))
        i.childappend(self.visit_Expression(enode["right"]))
        # body
        b = new_symbol("body", enode['body'])
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
        n = new_symbol("var", enode)
        n.set("value", "var")
        for child in enode["declarations"]:
            n.childappend(self.visit_VariableDeclarator(child))
        return n

    def visit_VariableDeclarator(self, enode):
        n = new_symbol("definition", enode)
        if enode["init"]:
            el = new_symbol("=", enode['id'])
            el.type = "assignment"
            el.set("operator", lang.TOKENS["="])
            el.set("value", "=")
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
        # convert to simple 'this' identifier
        m = copy.deepcopy(enode)
        m['type'] = 'Identifier'
        m['name'] = 'this'
        n = self.visit_Identifier(m)
        return n

    def visit_ArrayExpression(self, enode): # array literal
        n = new_symbol("array", enode)
        for child in enode["elements"]:
            if child is None:
                n.childappend(symbol("(empty)")())
            else:
                n.childappend(self.visit_Expression(child))
        return n

    def visit_ObjectExpression(self, enode): # map
        n = new_symbol("map", enode)
        for child in enode["properties"]:
            item = new_symbol("keyvalue", child)
            n.childappend(item)
            # key  
            if child['key']['type'] == 'Literal':
                if isinstance(child['key']['value'], types.StringTypes):
                    item.set("key", child['key']['value'])
                    item.set("quote", "doublequotes")  # TODO: the 'raw' member includes the actual quotes
                else: # Number
                    item.set("key", str(child['key']['value']))
                    item.set("quote", "")
            else: # 'Identifier'
                item.set("key", child['key']['name'])
            # value
            val = new_symbol("value", child['value'])
            item.childappend(val)
            val.childappend(self.visit_Expression(child['value']))
        return n

    def visit_FunctionExpression(self, enode):
        return self.visit_Function(enode)

    def visit_ArrowExpression(self, enode):
        raise NotImplementedError("'arrow' expressions are not yet supported")

    def visit_SequenceExpression(self, enode): # '1,2,3;'
        n = new_symbol("expressionList", enode)
        for child in enode["expressions"]:
            n.childappend(self.visit_Expression(child))
        return n

    def visit_UnaryExpression(self, enode): # -, +, !, ~, typeof, void, delete
        n = new_symbol(enode["operator"], enode)
        n.type = "operation"
        try:
            n.set("operator", lang.TOKENS[enode["operator"]])  # -, +, ..
        except KeyError:
            n.set("operator", lang.RESERVED[enode["operator"]]) # typeof, void, delete
        n.set("value", enode["operator"])
        if enode["prefix"]:
            n.set("left", "true")
        n.childappend(self.visit_Expression(enode["argument"]))
        return n

    def visit_BinaryExpression(self, enode): # <, <=, ...
        n = new_symbol(enode["operator"], enode)
        n.type = "operation"
        try:
            n.set("operator", lang.TOKENS[enode["operator"]])  # <, <=, ...
        except KeyError:
            n.set("operator", lang.RESERVED[enode["operator"]]) # instanceof
        n.set("value", enode["operator"])
        n.childappend(self.visit_Expression(enode["left"]))
        n.childappend(self.visit_Expression(enode["right"]))
        return n

    def visit_AssignmentExpression(self, enode): # =, +=, ...
        n = new_symbol(enode["operator"], enode)
        n.type = "assignment"
        n.set("value", enode["operator"])
        n.set("operator", lang.TOKENS[enode["operator"]])
        n.childappend(self.visit_Expression(enode["left"]))
        n.childappend(self.visit_Expression(enode["right"]))
        return n

    def visit_UpdateExpression(self, enode): # --, ++
        n = new_symbol(enode["operator"], enode)
        n.type = "operation"
        n.set("operator", lang.TOKENS[enode["operator"]])
        n.set("value", enode["operator"])
        if enode["prefix"]:
            n.set("left", "true")
        n.childappend(self.visit_Expression(enode["argument"]))
        return n

    def visit_LogicalExpression(self, enode): # ||, &&
        n = new_symbol(enode["operator"], enode)
        n.type = "operation"
        n.set("operator", lang.TOKENS[enode["operator"]])
        n.set("value", enode["operator"])
        n.childappend(self.visit_Expression(enode["left"]))
        n.childappend(self.visit_Expression(enode["right"]))
        return n

    def visit_ConditionalExpression(self, enode): # .. ? .. : .. (hook)
        n = new_symbol("?", enode)
        n.type = "operation"
        n.set("operator", lang.TOKENS["?"])
        n.set("value", "?")
        n.childappend(self.visit_Expression(enode["test"]))
        n.childappend(self.visit_Expression(enode["consequent"]))
        n.childappend(self.visit_Expression(enode["alternate"]))
        return n

    def visit_NewExpression(self, enode):
        n = new_symbol("operation", enode)
        n.set("operator", "NEW")
        n.set("value", "new")
        if enode["arguments"]: # have to coerce two members into a single 'call' tree
            arg = new_symbol("call", enode['callee'])
            arg.set("value", "(")
            operand = new_symbol("operand", enode['callee'])
            operand.childappend(self.visit_Expression(enode["callee"]))
            arg.childappend(operand)
            cargs = new_symbol("arguments", enode['callee'])
            for child in enode["arguments"]:
                cargs.childappend(self.visit_Expression(child))
            arg.childappend(cargs)
        else:
            arg = self.visit_Expression(enode["callee"])
        n.childappend(arg)
        return n

    def visit_CallExpression(self, enode): # 'foo()'
        n = new_symbol("call", enode)
        operand = new_symbol("operand", enode)
        operand.childappend(self.visit_Expression(enode["callee"]))
        n.childappend(operand)
        params = new_symbol("arguments", enode)
        n.childappend(params)
        for child in enode["arguments"]:
            nchild = self.visit_Expression(child)
            params.childappend(nchild)
        return n

    def visit_MemberExpression(self, enode): # 'a.b', 'a[b]'
        if enode["computed"]: # a[b]
            n = new_symbol("accessor", enode)
            n.set("value", "[")
        else:                 # a.b
            n = new_symbol("dotaccessor", enode)
            n.set("value", ".")
        # left/object
        n.childappend(self.visit_Expression(enode["object"]))
        # right/property
        if enode["computed"]:
            key = new_symbol("key", enode)
            n.childappend(key)
            p = key
        else:
            p = n
        if enode["property"]["type"] == 'Identifier':
            p.childappend(self.visit_Identifier(enode["property"]))
        else:
            p.childappend(self.visit_Expression(enode["property"]))
        return n

    def visit_YieldExpression(self, enode):
        raise NotImplementedError("'yield' expressions are not yet supported")

    def visit_ComprehensionExpression(self, enode):
        raise NotImplementedError("'comprehension' expressions are not yet supported")

    def visit_GeneratorExpression(self, enode):
        raise NotImplementedError("'generator' expressions are not yet supported")

    def visit_GraphExpression(self, enode):
        raise NotImplementedError("'graph' expressions are not yet supported")

    def visit_GraphIndexExpression(self, enode):
        raise NotImplementedError("'graph index' expressions are not yet supported")

    def visit_LetExpression(self, enode):
        raise NotImplementedError("'let' expressions are not yet supported")

    # Patterns (destructuring assignment and binding forms)
    # TBD

    # Clauses

    def visit_SwitchCase(self, enode):
        if enode["test"] != None:
            n = new_symbol("case", enode)
            n.childappend(self.visit_Expression(enode["test"]))
        else:
            n = new_symbol("default", enode)
        stmts = new_symbol("statements", enode)
        n.childappend(stmts)
        for child in enode["consequent"]:
            stmts.childappend(self.visit_Statement(child))
        return n

    def visit_CatchClause(self, enode):
        n = new_symbol("catch", enode)
        n.set("value", "catch")
        p = new_symbol("params", enode['param'])
        n.childappend(p)
        p.childappend(self.visit_Identifier(enode["param"])) # Moz API has "Pattern" i.p.o. Identifier
        # Skipped: enode["guard", spidermonkey-specific
        n.childappend(self.visit_BlockStatement(enode["body"]))
        return n

    def visit_ComprehensionBlock(self, enode):
        raise NotImplementedError("'comprehension' blocks are not yet supported")

    def visit_Identifier(self, enode):
        n = new_symbol("identifier", enode)
        n.set("value", enode["name"])
        return n

    def visit_Literal(self, enode):
        n = new_symbol("constant", enode)
        # have to sort out RegExp literals
        if enode["value"] == {}: 
            # Esprima 1.0.4 represents regexp's as empty map in Json!, so i have
            # to fall back to the "raw" property.
            # the online demo esprima.org/demo/parse.html has the regex as a
            # string in "value" directly!?
            n = treegenerator.parse(enode["raw"], expr=True)  # need esparse --raw here!!
        else:
            n = reducer.set_node_type_from_value(n, enode["value"])
        return n


# - -- helpers ----------------------------------------------------------------

def new_symbol(typ, enode):
    loc = enode['loc']['start']
    n = symbol(typ)(loc['line'], loc['column']+1)
    return n

# - ---------------------------------------------------------------------------

def esprima_to_tree1(etree):
    tree_transformer = EsprimaToTree1(etree)
    new_node = tree_transformer.visit_Program(etree)
    return new_node

