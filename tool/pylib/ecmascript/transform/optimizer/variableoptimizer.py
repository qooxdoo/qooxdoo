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
# A variable optimizer based on the new scopes
# (ecmascript.transform.check.scopes.Scope)
##

import sys, os, re, types

from ecmascript.transform.check import scopes
from ecmascript.frontend import lang
from misc.util import convert

# Create a blacklist of words to leave untouched
reservedWords = set(())
reservedWords.update(lang.GLOBALS)
reservedWords.update(lang.RESERVED.keys())

class ProtectionVisitor(scopes.ScopeVisitor):
    
    ##
    # If code of scope contains 'eval()'
    def has_eval_call(self, scopeNode):
        return 'eval' in scopeNode.vars

    ##
    # If code of scope contains 'new Function()'
    def has_new_Function(self, scopeNode):
        if 'Function' not in scopeNode.vars:
            return False
        scopeVar = scopeNode.vars['Function']
        if scopeVar.is_scoped(): # eliminate scoped vars
            return False
        # check for 'new' use
        for use_node in scopeVar.uses:
            if ( use_node.hasParentContext("operation/call/operand")
                and use_node.parent.parent.parent.get("operator","") == "NEW" ):
                return True
        return False

    ##
    # If code of scope contains 'with()'
    def has_with_stmt(self, scopeNode):
        code = scopeNode.node
        res = code.getChildByTypeAndAttribute("loop", "loopType", "WITH", mandatory=False, recursive=True)
        return bool(res)


    def visit(self, scopeNode):
        # Inspect current scope
        # eval()
        if self.has_eval_call(scopeNode):
            scopeNode.protect_variable_optimization = True
        # new Function()
        elif self.has_new_Function(scopeNode):
            scopeNode.protect_variable_optimization = True
        # with()
        elif self.has_with_stmt(scopeNode):
            scopeNode.protect_variable_optimization = True

        # Trickle up value from child scopes
        for child in scopeNode.children:
            res = self.visit(child)
            scopeNode.protect_variable_optimization = ( res or
                scopeNode.protect_variable_optimization )
        return scopeNode.protect_variable_optimization


class OptimizerVisitor(scopes.ScopeVisitor):
    
    def __init__(self, node, check_set=None):
        scopes.ScopeVisitor.__init__(self)
        self.check_set = check_set or self.get_check_set(node)
        self.counter = 0

    def visit(self, scopeNode):
        if not scopeNode.protect_variable_optimization:
            for var_name in scopeNode.locals():
                if var_name in reservedWords or len(var_name) < 2:
                    continue
                new_name = self.mapper(var_name, self.check_set)
                self.update_occurrences(scopeNode, var_name, new_name)
        # there might still be child scopes that can be optimized
        for child in scopeNode.children:
            self.visit(child)

    def update_occurrences(self, scopeNode, var_name, new_name):
        # patch Scope object
        scopeVar = scopeNode.vars[var_name]
        scopeNode.vars[new_name] = scopeVar
        del scopeNode.vars[var_name]
        # go through corresp. AST nodes
        for node in scopeVar.occurrences():
            node.set("value", new_name)
        
    def get_check_set(self, node):
        check_set = set()
        for scope_vars in node.scope.vars_iterator():
            check_set.update(scope_vars.keys())
        return check_set

    # TODO: re-implement using NameMapper class
    def mapper(self, name, checkset):
        repl = convert(self.counter)
        self.counter += 1
        while repl in checkset or repl in reservedWords:   # checkset is not updated, since we never generate the same repl twice
            repl = convert(self.counter)
            self.counter += 1
        return repl


# -- Interface function --------------------------------------------------------

def search(node):
    # we have to scope-analyze again, as other optimizations might have
    # changed the original tree (variants, strings, ... optimizations)
    node = scopes.create_scopes(node)
    # protect certain scopes from optimization
    protect_visitor = ProtectionVisitor()
    protect_visitor.visit(node.scope)
    # optimize scopes
    var_optimizer = OptimizerVisitor(node)
    var_optimizer.visit(node.scope)
