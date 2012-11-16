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
# Annotate AST scopes with a flag whether their symbols are evaluated at load
# time.
##

from ecmascript.frontend        import treeutil
from ecmascript.transform.check import scopes

class LoadTimeAnnotator(scopes.ScopeVisitor):

    def visit_file(self, scopeNode):
        scopeNode.is_load_time = True
        for cld in scopeNode.children:
            self.visit(cld)

    def visit_function(self, scopeNode):
        node = scopeNode.node

        # immediate-call functions are load-time = <inherit>
        if (node.hasParentContext("call/operand") or
            node.hasParentContext("call/operand/group")):
                scopeNode.is_load_time = scopeNode.parent.is_load_time if scopeNode.parent else False

        # 'defer' function is load-time = True
        elif treeutil.isDeferFunction(node):
            scopeNode.is_load_time = True
            scopeNode.is_defer = True

        else:
            scopeNode.is_load_time = False

        for cld in scopeNode.children:
            self.visit(cld)
        # ideally, we would traverse the ast of this scope, identify call sites
        # of local functions, and propagate the own load-time info to the scope
        # of those functions.  this might become interesting for code
        # outside the qx closed form.


# - ---------------------------------------------------------------------------

def load_time_check(scope_node):
    load_time_checker = LoadTimeAnnotator()
    scope_node.is_load_time = True  # assume this is file-level
    load_time_checker.visit(scope_node)
