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
# An optimizer for global symbols (qx.core.Object, ...)
##

import sys, os, re, types

from ecmascript.transform.check import scopes
from ecmascript.frontend import lang, treeutil, treegenerator

class GlobalsOptimizer(scopes.ScopeVisitor):
    
    def __init__(self, globals_map):
        self.globals_map = globals_map

    def visit(self, scopeNode):
        # go through globals
        for scopeVar in scopeNode.globals():
            # this might be as little as 'qx'
            for node in scopeVar.occurrences():
                # assemble var
                var_node = treeutil.findVarRoot(node)
                var_name = var_node.toJS() # e.g. "qx.util.ResourceManager.getInstance"
                # lookup in globals_map
                known_global, replacement = (
                    self.global_map.longest_match(var_name))  # -> "qx.util.ResourceManager"
                # find node in tree
                dot_number = 0 # TODO
                uptimes = u'/'.join(['..'] * dot_number)
                source_node = treeutil.selectNode(node, uptimes)
                # construct replacement
                repl_node = treegenerator.parse(replacement)  # could be "foo.bar" or "qx.$g['bNq']"
                # replace known symbol in tree
                source_node.parent.replaceChild(source_node, repl_node)
                # update scopeVar.occurrences??!!

def propagate_new_globals(node, new_symbols, globals_map):
    # make sure there is a wrapping closure
    node, closure_block = treeutil.ensureClosureWrapper(node)

    # add new statements at end
    for new_symbol in new_symbols:
        # construct statement
        stmt = "%s = %s;" % (globals_map[new_symbol], new_symbol)
        # compile to JS
        stmt_tree = treegenerator.parse(stmt)
        # attach to node tree
        closure_block.addChild(stmt_tree)  # does append by default

def operands_of_calls(call_nodes):
    names = []
    for node in call_nodes:
        # get name from call node
        name_node = node.getChild("operand").getFirstChild()  # call/operand/<isVar>
        name = name_node.toJS()
        names.append(name)
    return names

# -- Interface function --------------------------------------------------------

##
# Replace global symbols with a (short) replacement symbol.
# E.g.
#   qx.util.ResourceManager  --> qx.$g.bN4
#
# Add an assignment to a wrapping closure that propagates the symbol from the
# current class, being defined in <node>.
# E.g.
#   qx.$g.xfR = qx.ui.core.EventHandler (if that's the class being defined)
#
# and update <globals_map> with the new mapping.
#
# <node>        - A sntax tree, pot. with qx factory calls (qx.Class.define,
#                 ...)
# <globals_map> - A map-like object that holds known mappings of global symbols,
#                like {"qx.util.ResourceManager" : "qx.$g.bN4"}; also exposes a
#                method to create an fresh unused symbol for new mappings.
#
def process(node, globals_map):
    # make sure we have current scope tree
    node = scopes.create_scopes(node)
    # replace globals in tree
    globals_optimizer = GlobalsOptimizer(globals_map)
    globals_optimizer.visit(node.scope)
    # get new globals from tree
    new_symbols = list(treeutil.findQxDefineR(node))
    new_names = operands_of_calls(new_symbols)
    # add to globals_map
    for new_name in new_names:
        globals_map.add(new_name)  # this will create replacements if they're new
    # add defining code lines to closure
    propagate_new_globals(node, new_names, globals_map)
