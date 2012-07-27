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
        # create a scope solely for the execption param
        node.scope = Scope(node)
        node.scope.parent = self.curr_scope
        self.curr_scope.children.append(node.scope)
        self.curr_scope = node.scope
        # visit only the param
        self.visit(node.getChild("params"))
        # restore old scope and visit body
        # (i think that's contradicting ECMA262, but is how js engines are implementing it)
        self.curr_scope = node.scope.parent
        self.visit(node.getChild("block"))

    def _new_scope(self, node):  # function
        # create a new scope
        node.scope = Scope(node)
        node.scope.parent = self.curr_scope
        self.curr_scope.children.append(node.scope)
        # switch to new scope and recurse
        self.curr_scope = node.scope
        for chld in node.children:
            self.visit(chld)
        # restore old scope
        self.curr_scope = node.scope.parent

    def visit_params(self, node): # formal params are like local decls
        #print "params visitor", node
        for id_node in treeutil.nodeIterator(node, ["identifier"]):
            self._new_var(id_node)

    def visit_var(self, node):  # var declaration
        #print "var decl visitor", node
        # go through the definitions
        for def_node in treeutil.nodeIterator(node, ["definition"]):
            self._new_var(def_node.getDefinee())
            if def_node.getInitialization():
                self.visit(def_node.getInitialization())  # init expr could contain var uses

    ##
    # Register a scoped symbol with current scope.
    #
    def _new_var(self, id_node):
        var_name = id_node.get('value')
        scopeVar = self.curr_scope.add_decl(var_name, id_node)  # returns the corresp. ScopeVariable()
        id_node.scope = self.curr_scope

    def visit_identifier(self, node):  # var reference
        #print "var use visitor", node
        if treeutil.checkFirstChainChild(node):  # only treat leftmost identifier (e.g. in a dotaccessor expression)
            var_name = node.get('value')
            # lookup var
            var_scope = self.curr_scope.lookup_decl(var_name)
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

    def lookup_decl(self, name):
        if name in self.vars and self.vars[name].decl:
            return self
        elif self.parent:
            return self.parent.lookup_decl(name)
        else:
            return None

    def prrnt(self, indent='  '):
        print indent, self
        for cld in self.children:
            cld.prrnt(indent=indent+'  ')

    def globals(self):
        return dict([(x,y) for x,y in self.vars.items() if not y.decl])

    ##
    # Return all nested scopes
    def scope_iterator(self):
        yield self
        for cld in self.children:
            for scope in cld.scope_iterator():
                yield scope

    ##
    # Return all the .vars members of nested scopes
    def vars_iterator(self):
        yield self.vars
        for cld in self.children:
            for vars_ in cld.vars_iterator():
                yield vars_

##
# A variable occurring in a scope has several places where it is mentioned ('uses'),
# and among those mentionings potentially one where it is declared.
#
# (If it is declared multiple times in the scope, .decl will contain multiple entries).
#
class ScopeVar(object):
    def __init__(self):
        self.decl = []    # var decl node(s)
        self.uses = []    # var occurrences (excluding decl occurrence(s))

    def add_use(self, node):
        self.uses.append(node)

    def add_decl(self, node):
        self.decl.append(node)

    def occurrences(self):
        return self.decl + self.uses


##
# NodeVisitor class
#
class NodeVisitor(object):

    def __init__(self, debug=False):
        self.debug = debug
        
    def visit(self, scope_node):
        if hasattr(self, "visit_"+scope_node.type):
            if self.debug:
                print "visiting:", scope_node.type
            getattr(self, "visit_"+scope_node.type)(scope_node)
        else:
            for child in scope_node.children:
                if self.debug:
                    print "visiting:", child.type
                self.visit(child)

# - Utilities -----------------------------------------------------------------

def find_enclosing(node):
    scope = None
    if hasattr(node, 'scope'):
        scope = node.scope
    else:
        if node.parent:
            return find_enclosing(node.parent)
    return scope

# - Interface function --------------------------------------------------------

def create_scopes(node):
    scoper = CreateScopesVisitor(node)
    scoper.visit(node)
    return node
