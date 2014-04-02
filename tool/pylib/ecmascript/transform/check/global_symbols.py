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
# Check a name against relevant jshints.
# String -> bool
#
def name_is_jsignored(name, node):
    result = []
    for hint in jshints.find_hints_upward(node):
        for cat in (('ignore',None), ('lint','ignoreUndefined')):
            if hint.ident_matches(name, cat):
                result.append(cat)
    return result

##
# Check an ident node against relevant jshints.
# Node -> bool
def test_ident_is_jsignored(node):
    var_root = treeutil.findVarRoot(node)
    name = treeutil.assembleVariable(var_root)[0]
    return name_is_jsignored(name, node)

##
# Check a node against builtin symbols.
# builtins[] -> Node -> bool
def test_ident_is_builtin(builtins=lang.GLOBALS):
    GlobalSymbolsCombinedPatt = re.compile('|'.join(r'^%s\b' % re.escape(x)
        for x in builtins + lang.QXGLOBALS))
    def test(node):
        var_root = treeutil.findVarRoot(node)
        name = treeutil.assembleVariable(var_root)[0]
        return bool(GlobalSymbolsCombinedPatt.search(name))
    return test

##
# Filter names if they match a built-in.
#
GlobalSymbolsCombinedPatt = re.compile('|'.join(r'^%s\b' % re.escape(x) for x in lang.GLOBALS + lang.QXGLOBALS))
def globals_filter_by_builtins(global_names):
    return [name for name in global_names if not GlobalSymbolsCombinedPatt.search(name)]


##
# (class_names[], name_spaces[]) -> Node -> bool
def test_ident_is_libsymbol(class_names, name_spaces):
    def test(node):
        return test_for_libsymbol(node, class_names, name_spaces)
    return test


##
# Check symbol against known classes and namespaces.
# - A known qx global is either exactly a name space, or a dotted identifier
#   that is a dotted extension of a known class.
#
def test_for_libsymbol(symbol, class_names, name_spaces):
    res_name = ''

    # node may be unicode string or Node obj => unify
    if not isinstance(symbol, unicode):
        symbol = treeutil.assembleVariable(symbol)[0]

    # check for a name space match
    if symbol in name_spaces:
        res_name = symbol
    # see if symbol is a (dot-exact) prefix of any of class_names
    else:
        for class_name in class_names:
            if (symbol.startswith(class_name) and
                    re.search(r'^%s(?=\.|$)' % re.escape(class_name), symbol)):
                    # e.g. re.search(r'^mylib.Foo(?=\.|$)', 'mylib.Foo.Bar' is
                    # true, but not with 'mylib.FooBar'
                # take the longest match
                if len(class_name) > len(res_name):
                    res_name = class_name
    return res_name
