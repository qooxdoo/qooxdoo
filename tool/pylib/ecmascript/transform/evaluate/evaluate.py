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
# Evaluate expressions
##

import os, sys, re, types, operator, functools as func
from ecmascript.frontend import treeutil

class OperationEvaluator(treeutil.NodeVisitor):

    def __init__(self, root_node):
        super(OperationEvaluator, self).__init__()
        self.root_node = root_node
        self.operations = self._init_operations()

    def _init_operations(self):
        operations = {}
        types_Number = (types.IntType, types.FloatType, types.BooleanType)

        def opr(operation, op1, op2):
            if all([isinstance(x, types_Number) for x in (op1, op2)]):
                return operation(op1, op2)
            else:
                return ()
        operations['SUB'] = func.partial(opr, operator.sub)
        operations['MUL'] = func.partial(opr, operator.mul)
        operations['DIV'] = func.partial(opr, operator.div)
        operations['MOD'] = func.partial(opr, operator.mod)

        def opr(op1, op2):
            if all([isinstance(x, types_Number) for x in (op1, op2)]):
                return op1 + op2
            elif all([isinstance(x, types.StringTypes) for x in (op1, op2)]):
                return op1 + op2
            else:
                return ()
        operations['ADD'] = opr

        operations['EQ']   = operator.eq
        operations['SHEQ'] = operator.eq
        operations['NE']   = operator.ne
        operations['SHNE'] = operator.ne

        operations['LT'] = operator.lt
        operations['LE'] = operator.le
        operations['GT'] = operator.gt
        operations['GE'] = operator.ge

        operations['NOT'] = operator.not_
        operations['AND'] = lambda x,y: x and y
        operations['OR']  = lambda x,y: x or y

        def opr(op1, op2, op3):
            return op2 if bool(op1) else op3
        operations['HOOK'] = opr

        return operations
        # end:_init_operations

    ##
    # Provide a default for .evaluated
    def visit(self, node):
        node.evaluated = ()  # not evaluated; might get overwritten later
        super(OperationEvaluator, self).visit(node)

    def visit_operation(self, node):
        operator = node.get("operator")
        arity = len(node.children)
        if arity == 1:
            self._visit_monadic(node, operator)
        elif arity == 2:
            self._visit_dyadic(node, operator)
        elif arity == 3:
            self._visit_triadic(node, operator)

    def visit_group(self, node):
        self.visit(node.children[0])
        node.evaluated = node.children[0].evaluated

    ##
    # Convert a 'constant' tree node to it's (primitive) Python value.
    #
    def visit_constant(self, node):
        constvalue = node.get("value")
        consttype = node.get("constantType")
        value = ()  # the empty tuple indicates unevaluated
        if consttype == "number":
            constdetail = node.get("detail")
            if constdetail == "int":
                value = int(constvalue)
            elif constdetail == "float":
                value = float(constvalue)
        elif consttype == "string":
            value = constvalue
        elif consttype == "boolean":
            value = {"true":True, "false":False}[constvalue]
        elif consttype == "null":
            value = None
        node.evaluated = value


    ##
    # Currently, this is only HOOK, so this method is specific to HOOK.
    #
    def _visit_triadic(self, node, operator):
        op1 = node.children[0]
        op2 = node.children[1]
        op3 = node.children[2]
        self.visit(op1)
        self.visit(op2)
        self.visit(op3)
        # to evaluate HOOK, it is enough to evaluate the condition
        if operator == "HOOK" and all([(op.evaluated != ()) for op in (op1,op2,op3)]):
            node.evaluated = self.operations[operator](op1.evaluated, op2.evaluated, op3.evaluated)
        else:
            node.evaluated = ()

    def _visit_dyadic(self, node, operator):
        op1 = node.children[0]
        op2 = node.children[1]
        self.visit(op1)
        self.visit(op2)
        if all([(x.evaluated != ()) for x in (op1, op2)]):  # () indicates unevaluated (empty tuple)
            node.evaluated = self.operations[operator](op1.evaluated, op2.evaluated)
        else:
            node.evaluated = ()


    def _visit_monadic(self, node, operator):
        op1 = node.children[0]
        self.visit(op1)
        if op1.evaluated != ():
            node.evaluated = self.operations[operator](op1.evaluated)
        else:
            node.evaluated = ()

# - ---------------------------------------------------------------------------

def evaluate(node):
    evaluator = OperationEvaluator(node)
    evaluator.visit(node)
    return node
