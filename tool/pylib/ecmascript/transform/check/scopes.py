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
# Scope analysis of AST
##

from ecmascript.frontend import treeutil

class CreateScopesVisitor(treeutil.NodeVisitor):

    def __init__(self, root_node):
        super(CreateScopesVisitor, self).__init__()
        self.root_node = root_node
        self.global_scope = Scope(root_node)
        root_node.scope = self.global_scope
        self.curr_scope = self.global_scope

    def visit_function(self, node):
        #print "function visitor", node
        self._new_scope(node)

    def visit_catch(self, node):
        #print "catch visitor", node
        self._new_scope(node)

    def _new_scope(self, node):  # function, catch
        # create a new scope
        node.scope = Scope(node)
        node.scope.parent = self.curr_scope
        self.curr_scope.children.append(node.scope)
        # switch to new scope and recurse
        old_scope = self.curr_scope
        self.curr_scope = node.scope
        for chld in node.children:
            self.visit(chld)
        # restore old scope
        self.curr_scope = old_scope

    def visit_params(self, node): # formal params are like local decls
        #print "params visitor", node
        self.visit_var(node)  # can use this method, as it utilizes treeutil.nodeIterator("identifier")

    def visit_var(self, node):  # var declaration
        #print "var decl visitor", node
        # go through the identifiers
        for id_node in treeutil.nodeIterator(node, ["identifier"]):
            # new decl
            var_name = id_node.get('value')
            scopeVar = self.curr_scope.add_decl(var_name, id_node)
            # attach scope
            node.scope = self.curr_scope
            # add var_use
            scopeVar.add_use(id_node)

    def visit_identifier(self, node):  # var reference
        #print "var use visitor", node
        if treeutil.checkFirstChainChild(node):  # only treat leftmost identifier (e.g. in a dotaccessor expression)
            var_name = node.get('value')
            #print var_name
            #import pydb; pydb.debugger()
            # lookup var
            var_scope = self.curr_scope.lookup(var_name)
            if not var_scope: # it's a global reference
                self.curr_scope.add_use(var_name, node)
                node.scope = self.curr_scope
            else: # it's a scoped variable
                var_scope.add_use(var_name, node)
                node.scope = var_scope
        # pass on everything else


# - Scope class ---------------------------------------------------------------

class Scope(object):
    def __init__(self, node):
        self.parent = None
        self.node = node
        self.children = []  # nested scopes
        self.vars = {}   # vars used in this scope, {"<varname>" : ScopeVar() }
                         # either locally declared, or global (.decl==None)
                         # missing: those of a parent scope that are referenced here

    def add_use(self, name, node):
        if name not in self.vars:
            self.vars[name] = ScopeVar()
        self.vars[name].add_use(node)
        return self.vars[name]
            
    def add_decl(self, name, node):
        if name not in self.vars:
            self.vars[name] = ScopeVar()
        self.vars[name].add_decl(node)
        return self.vars[name]

    def add_global(self, name, node):
        if name not in self.globals:
            self.globals[name] = ScopeVar()
        self.globals[name].add_use(node)
        return self.globals[name]

    def lookup(self, name):
        if name in self.vars:
            return self
        elif self.parent:
            return self.parent.lookup(name)
        else:
            return None

    def prrnt(self, indent='  '):
        print indent, self
        for cld in self.children:
            cld.prrnt(indent=indent+'  ')

    def globals(self):
        return dict([(x,y) for x,y in self.vars.items() if y.decl==None])

##
# A variable occurring in a scope has several places where it is mentioned ('uses'),
# and among those mentionings potentially one where it is declared.
#
# (If it is declared multiple times in the scope, the last of those will be recorded).
#
class ScopeVar(object):
    def __init__(self):
        self.decl = None  # var decl node
        self.uses = []    # var occurrences; includes the decl occurrence

    def add_use(self, node):
        self.uses.append(node)

    def add_decl(self, node):
        self.decl = node


# - ---------------------------------------------------------------------------

def create_scopes(node):
    scoper = CreateScopesVisitor(node)
    scoper.visit(node)
    return node
