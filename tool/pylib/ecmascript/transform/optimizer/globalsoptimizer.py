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

from misc.NameMapper import NameMapper
from ecmascript.transform.check import scopes
from ecmascript.frontend import lang, treeutil, treegenerator

class GlobalsMap(types.DictType, NameMapper):

    def __init__(self, template='%s', check_set=None):
        types.DictType.__init__(self)
        NameMapper.__init__(self, check_set)
        self.template = template

    def __setitem__(self, key, value):
        raise NotImplementedError, "Use GlobalsMap.add() instead"

    def add(self, key):
        if key not in self:
            repl = self.mapper(key)
            #print repl
            types.DictType.__setitem__(self, key, self.template % repl)

    ##
    # Return best match honoring namespace boundaries.
    #
    # TODO: This is basically a copy of global_symbols.test_for_libsymbol
    def longest_match(self, key):
        best_match = ''
        if key in self:  # short cut
            best_match = key
        elif "." in key:
            for entryId in self.keys():
                if key.startswith(entryId) and re.match(r'%s\b' % entryId, key):
                    if len(entryId) > len(best_match): # take the longest match
                        best_match = entryId
        return best_match


class GlobalsOptimizer(scopes.ScopeVisitor):
    
    def __init__(self, globals_map):
        self.globals_map = globals_map
        self.new_qx_classes = []

    def visit(self, scopeNode):
        # go through globals
        for name,scopeVar in scopeNode.globals().iteritems():
            # name might be as little as 'qx'
            for node in scopeVar.occurrences():
                # assemble var
                var_node = treeutil.findVarRoot(node)
                var_name = var_node.toJS(None) # e.g. "qx.util.ResourceManager.getInstance"
                if var_name in lang.QX_CLASS_FACTORIES: # capture qx.*.define() calls
                    succ, class_name, _ = treeutil.isQxDefine(var_node)
                    if succ and class_name: self.new_qx_classes.append(class_name)
                # lookup in globals_map
                sKnown_global = self.globals_map.longest_match(var_name)  # -> "qx.util.ResourceManager"
                if sKnown_global:
                    sReplacement = self.globals_map[sKnown_global]
                    # find node in tree
                    dot_number = sKnown_global.count(".")
                    uptimes = u'/'.join(['..'] * dot_number)
                    source_node = treeutil.selectNode(node, uptimes) if uptimes else node
                    # construct replacement
                    repl_node = treegenerator.parse(sReplacement, expr=True)  # could be "foo.bar" or "qx.$g['bNq']"
                    # replace known symbol in tree
                    source_node.parent.replaceChild(source_node, repl_node)
                    # update scopeVar.occurrences??!!

        for child in scopeNode.children:
            self.visit(child)

def propagate_new_globals(node, new_symbols, globals_map):
    #  assuming a container <node>, like <file> or <block>
    # make sure there is a wrapping closure
    stmtsNode = node.getChild("statements")
    new_node, closure_block = treeutil.ensureClosureWrapper(stmtsNode.children)
    stmtsNode.removeAllChildren()
    stmtsNode.addChild(new_node)

    # add new statements at end
    for new_symbol in new_symbols:
        # construct statement
        stmt = "%s = %s;" % (globals_map[new_symbol], new_symbol)
        # compile to JS
        stmt_tree = treegenerator.parse(stmt).getFirstChild()  # unwrap from 'statments' node
        # attach to node tree
        closure_block.addChild(stmt_tree)  # does append by default
    return node

def operands_of_calls(call_nodes):
    names = []
    for node in call_nodes:
        # get name from call node
        cname_node = node.getChild("arguments").getFirstChild()  # qx.Class.define("foo.Bar",...)
        name = cname_node.get("value")
        names.append(name)
    return names

##
# This is just a toy function, to play with built-in globals.
def seed_globals_map(check_set=None, globals_map=None):
    checkset = check_set or set()
    gmap = globals_map or GlobalsMap(template='qx.$$g["%s"]', check_set=checkset)
    #for symbol in lang.BUILTIN:
    for symbol in universal_globals:
        gmap.add(symbol)
    return gmap

##
# Global values that may be aliased and are available cross-browser.
#
# these make actually only sense if the alias is not longer as the original symbol!
universal_globals = [
    'window',
    'Boolean',
    'Array',
    'document',
    'Date',
    'Error',
    'Event',
    'Function',
    'Math',
    'Number',
    'Object',
    'RegExp',
    'String',
    'undefined',
]
def reverse_globals_map():
    gmap = GlobalsMap(template='%s')
    for symbol in universal_globals:
        gmap.add(symbol)
    rmap = dict([[y,x] for x,y in gmap.items()])
    return rmap

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
#                method to create a fresh unused symbol for new mappings.
#

gmap = GlobalsMap(template='qx.$$g.%s', check_set = set(
    lang.RESERVED.keys()  # treegenerator wouldn't parse e.g. 'qx.$$g.do'
))
#gmap = seed_globals_map()

def process(node, globals_map_=None):
    #print "globals optimization:", str(node)
    #globals_map = globals_map_ or seed_globals_map()
    #import pydb; pydb.debugger()
    globals_map = globals_map_ or gmap
    # make sure we have a current scope tree
    node = scopes.create_scopes(node)
    # replace globals in tree
    globals_optimizer = GlobalsOptimizer(globals_map)
    globals_optimizer.visit(node.scope)
    # get new globals from tree
    new_names = globals_optimizer.new_qx_classes
    # add to globals_map
    for new_name in new_names:
        globals_map.add(new_name)  # this will create replacements if they're new
    # add defining code lines to closure
    node = propagate_new_globals(node, new_names, globals_map)
    return node
