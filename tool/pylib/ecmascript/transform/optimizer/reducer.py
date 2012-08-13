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
# Reduce conditional expressions that are decidable. Requires .evaluated.
# Modifies tree structure.
##

import os, sys, re, types, operator, functools as func
from ecmascript.frontend import treeutil, treegenerator

class ConditionReducer(treeutil.NodeVisitor):

    def __init__(self, root_node):
        super(ConditionReducer, self).__init__()
        self.root_node = root_node


    def visit_loop(self, node):
        loop_type = node.get("loopType")
        if loop_type == "IF":
            cond_node = node.children[0]
            if hasattr(cond_node, "evaluated") and cond_node.evaluated!=():
                #self._rewrite_if(node, bool(cond_node.evaluated))
                treeutil.inlineIfStatement(node, bool(cond_node.evaluated))
        for child in node.children:
            self.visit(child)

    def visit_operation(self, node): # catch HOOK operations
        op_type = node.get("operator")
        if op_type == "HOOK":
            cond_node = node.children[0]
            if hasattr(cond_node, "evaluated") and cond_node.evaluated!=():
                self._rewrite_hook(node, bool(cond_node.evaluated))
        for child in node.children:
            self.visit(child)


    def _rewrite_if(self, if_node, cond_val):
        if cond_val:
            # use then branch
            replacement = if_node.children[1] 
            # rescue vardecl's from else branch, so these vars don't become global
            # if used elsewhere, but *don't* rescue their init's.
            if len(if_node.children) == 3:
                extracted_vars = extract_vars(if_node.children[2])
                add_vars(replacement, extracted_vars)
        else:
            # use else branch or empty
            if len(if_node.children) == 3:
                replacement = if_node.children[2]
            else:
                # don't leave single-statement parent loops empty (if_node.parent.type not in ("block", "file")
                replacement = treegenerator.symbol("block")(if_node.get("line"), if_node.get("column"))
            # rescue vardecl's from then branch
            extracted_vars = extract_vars(if_node.children[1])
            add_vars(replacement, extracted_vars)
        if_node.parent.replaceChild(if_node, replacement)

    def _rewrite_hook(self, hook_node, cond_val):
        if cond_val: # use then expr
            replacement = hook_node.children[1]
        else: # use else expr
            replacement = hook_node.children[2]
        hook_node.parent.replaceChild(hook_node, replacement)

# - ---------------------------------------------------------------------------

def reduce(node):
    reducer = ConditionReducer(node)
    reducer.visit(node)
