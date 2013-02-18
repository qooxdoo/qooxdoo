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
from ecmascript.frontend import lang, treeutil
from misc.util import convert

counter = 0

# Create a blacklist of words to leave untouched
reservedWords = set(())
reservedWords.update(lang.GLOBALS)
reservedWords.update(lang.RESERVED.keys())

protected_globals = "eval Function".split()

class ProtectionVisitor(scopes.ScopeVisitor):

    def visit(self, scopeNode):
        if 'eval' in scopeNode.vars: # TODO: use protected_globals
            scopeNode.protect_variable_optimization = True
        for child in scopeNode.children:
            res = self.visit(child)
            scopeNode.protect_variable_optimization = ( res or
                scopeNode.protect_variable_optimization )
        return scopeNode.protect_variable_optimization


class OptimizerVisitor(scopes.ScopeVisitor):
    
    def __init__(self, check_set):
        scopes.ScopeVisitor.__init__(self)
        self.check_set = check_set

    def visit(self, scopeNode):
        for var_name in scopeNode.locals():
            new_name = mapper(var_name, self.check_set)
            self.update_occurrences(scopeNode, var_name, new_name)

    def update_occurrences(self, scopeNode, var_name, new_name):
        # patch Scope object
        assert new_name not in scopeNode.vars
        scopeVar = scopeNode.vars[var_name]
        scopeNode.vars[new_name] = scopeVar
        del scopeNode.vars[var_name]

        # go through corresp. AST nodes
        for node in scopeVar.occurrences():
            node.set("value", new_name)
        

def mapper(name, checkset):
    global counter
    repl = convert(counter)
    counter += 1
    while repl in checkset or repl in reservedWords:   # checkset is not updated, since we never generate the same repl twice
        repl = convert(counter)
        counter += 1
    return repl


def get_check_set(node):
    check_set = set()
    for scope_vars in node.scope_node.vars_iterator():
        check_set.update(scope_vars.keys())
    return check_set


# -- Interface function --------------------------------------------------------

def search(node):
    global counter
    counter = 0 # reset repl name generation
    check_set = get_check_set(node)
    var_optimizer = OptimizerVisitor(check_set)
    var_optimizer.visit(node)
