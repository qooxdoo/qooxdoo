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
# Scope walker to produce a list of global identifier nodes (unfiltered).
#
##

import os, sys, re, types
from ecmascript.frontend   import lang, treeutil
from ecmascript.transform.check  import scopes, jshints

##
# A visitor on a Scope() tree to collect identifier nodes with global scope.
#
class GlobalsExtractor(scopes.ScopeVisitor):

    def __init__(self, scope_node):
        super(GlobalsExtractor, self).__init__(scope_node)
        self.global_nodes = []

    def visit(self, scope_node):
        self.global_nodes.extend(scope_node.globals().values())
        # recurse
        for cld in scope_node.children:
            self.visit(cld)

# - ---------------------------------------------------------------------------

##
# Extract global identifiers from the Scope() tree.
#
def scope_globals(node):
    node = scopes.create_scopes(node)  # update scopes
    globals_getter = GlobalsExtractor(node)
    globals_getter.visit(node.scope)
    return globals_getter.global_nodes

# - ---------------------------------------------------------------------------

##
# Checks the Hint() objects in the hints chain for ignore matches of node.
#
# Assumes Hint() tree is present.
#
def ident_is_ignored(name, node):
    result = []
    for hint in jshints.find_hints_upward(node):
        for cat in (('ignore',None), ('lint','ignoreUndefined')):
            if hint.ident_matches(name, cat):
                result.append(cat)
    return result

##
# Filter nodes of tree if there is a matching 'ignore' hint.
#
def globals_filter_by_hints(global_nodes, tree):
    result = []
    tree = jshints.create_hints_tree(tree)
    for node in global_nodes:
        if not ident_is_ignored(node):
            result.append(node)
    return result

##
# Filter names if they match a built-in.
#
GlobalSymbolsCombinedPatt = re.compile('|'.join(r'^%s\b' % re.escape(x) for x in lang.GLOBALS + lang.QXGLOBALS))
def globals_filter_by_builtins(global_names):
    return [name for name in global_names if not GlobalSymbolsCombinedPatt.search(name)]

##
# Filter names if they match a library class.
#
def globals_filter_by_libclasses(global_names, lib_classes):
    result = []
    for name in global_names:
        if name not in lib_classes:  # TODO: fork out test?!
            result.append(name)
    return result

