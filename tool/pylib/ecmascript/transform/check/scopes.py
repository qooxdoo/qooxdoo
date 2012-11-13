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

##
# Scope visitor that goes through a tree of Scope()'s, invoking an AST visitor on
# corresponding AST nodes.
#
class ScopesVisitor(object):

    def visit(self, scopeNode):
        scope_type = scopeNode.node.type
        if hasattr(self, "visit_"+scope_type):
            getattr(self, "visit_"+scope_type)(scopeNode)
        else:
            varsCollector = AssignScopeVarsVisitor(scopeNode)
            varsCollector.visit(scopeNode.node)
            for child in scopeNode.children:
                self.visit(child)

    def visit_function(self, scopeNode):
        node = scopeNode.node
        # handle function name that goes into the function scope
        if node.getChild("identifier",0) and not node.isStatement():
            name_node = node.getChild("identifier")
            fname = name_node.get("value")
            scopeNode.add_decl(fname, name_node)
            name_node.scope = scopeNode

        # handle params
        paramCollector = AssignScopeVarsVisitor(scopeNode)
        paramCollector.visit(node.getChild("params"))
        # mark as params (true params and internal function name (the latter re. bug#5759)
        for scopeVar in scopeNode.vars.values():
            scopeVar.is_param = True
        # handle body
        bodyCollector = AssignScopeVarsVisitor(scopeNode)
        bodyCollector.visit(node.getChild("body"))

        for child in scopeNode.children:
            self.visit(child)

    def visit_catch(self, scopeNode):
        astNode = scopeNode.node
        # Now this is tricky (and i think it violates ECMA262, but is how JS
        # engines are implementing it): Only the catch param is locally scoped,
        # all other 'var's leak into the parent scope.

        # handle params
        paramCollector = AssignScopeVarsVisitor(scopeNode)
        paramCollector.visit(astNode.getChild("params"))
        catch_param_id = scopeNode.vars.keys()[0]  # must be exactly one
        catch_param = scopeNode.vars[catch_param_id]
        catch_param.is_param = True
        # handle body, first collecting into catch scope (so catch param is recognized as scoped)
        bodyCollector = AssignScopeVarsVisitor(scopeNode)
        bodyCollector.visit(astNode.getChild("block"))

        # now move scopeVars up the scope chain (realizing the "leak")
        for id_, scopeVar in scopeNode.vars.items():
            if id_ != catch_param_id:
                scopeNode.parent.add_scope_var(id_, scopeVar)

        # restore old scope and visit body
        for child in scopeNode.children:
            self.visit(child)


##
# AST visitor that assigns vardecl and varuses to a given Scope (and pot. its 
# parents), but doesn't descend into subscopes ("breadth-only search").
#
class AssignScopeVarsVisitor(treeutil.NodeVisitor):

    def __init__(self, curr_scope):
        super(AssignScopeVarsVisitor, self).__init__()
        self.curr_scope = curr_scope

    def visit_function(self, node):
        # handle pot. function name that goes into this scope
        if node.getChild("identifier",0) and node.isStatement():
            name_node = node.getChild("identifier")
            fname = name_node.get("value")
            self.curr_scope.add_decl(fname, name_node)
            name_node.scope = self.curr_scope
        # that's it, don't recurse here ("breadth-only")

    def visit_catch(self, node):
        return

    def visit_params(self, node): # formal params are like local decls
        #print "params visitor", node
        for id_node in node.children:
            self._new_var(id_node)

    def visit_var(self, node):  # var declaration
        #print "var decl visitor", node
        # go through the definitions
        for def_node in node.children:
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
            #if var_name == "Stack":
            #    import pydb; pydb.debugger()
            var_scope = self.curr_scope.lookup_decl(var_name)
            if not var_scope: # it's a global reference
                self.curr_scope.add_use(var_name, node)
                node.scope = self.curr_scope
            else: # it's a scoped variable
                var_scope.add_use(var_name, node)
                node.scope = var_scope
        # pass on everything else


##
# AST visitor that only creates the Scope() tree for this AST, but doesn't
# assign var occurrences to scopes.
#
class CreateScopesVisitor(treeutil.NodeVisitor):

    def __init__(self, root_node):
        super(CreateScopesVisitor, self).__init__()
        self.root_node = root_node
        self.global_scope = Scope(root_node)
        root_node.scope = self.global_scope
        self.curr_scope = self.global_scope

    def visit_function(self, node):
        #print "function visitor", node
        node.scope = Scope(node)
        node.scope.parent = self.curr_scope
        self.curr_scope.children.append(node.scope)

        # switch to function scope and get nested scopes
        self.curr_scope = node.scope
        for child in node.children:
            self.visit(child)
        # and restore old scope
        self.curr_scope = node.scope.parent

    def visit_catch(self, node):
        #print "catch visitor", node
        # create a scope solely for the execption param
        node.scope = Scope(node)
        node.scope.parent = self.curr_scope
        self.curr_scope.children.append(node.scope)

        # switch to function scope and get nested scopes
        self.curr_scope = node.scope
        for child in node.children:
            self.visit(child)
        # restore old scope
        self.curr_scope = node.scope.parent

    # 'with' does not introduce a nested scope, although ECMA262 says that the
    # object expression in 'with(...)' is pushed in front of the scope chain.
    # but all browsers implement it as a normal non-scope introducing statement.
    # E.g. "with(o){var b=7;}" => b appears in the parent scope of the 'with'.
    #def visit_with(self, node)

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

    def add_scope_var(self, name, scopeVar):
        assert scopeVar is not None
        if name not in self.vars:
            self.vars[name] = scopeVar
        else:
            self.vars[name] = self.vars[name].merge(scopeVar)

    def lookup_decl(self, name):
        if name in self.vars and self.vars[name].decl:
            return self
        elif self.parent:
            return self.parent.lookup_decl(name)
        else:
            return None

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
        self.is_param = False # is var decl'ed as parameter?

    def add_use(self, node):
        self.uses.append(node)

    def add_decl(self, node):
        self.decl.append(node)

    def occurrences(self):
        return self.decl + self.uses

    def merge(self, other):
        for decl in other.decl:
            if decl not in self.decl:
                self.decl.append(decl)
        for use in other.uses:
            if use not in self.uses:
                self.uses.append(use)
        return self


# - Utilities -----------------------------------------------------------------

def find_enclosing(node):
    # recurse upwards to enclosing function/root scope
    def get_enclosing_scope(node):
        scope = None
        if hasattr(node, 'scope'):
            scope = node.scope
        elif node.parent:
            scope = get_enclosing_scope(node.parent)
        return scope
    # ---------------------------------------------
    # have to distinguish if i need recursion
    scope = None
    if hasattr(node, 'scope'):
        if node.isVar():  # scope-referencing nodes (vardecl, varuse)
            scope = node.scope
        else:  # scope-defining nodes (function, catch, ...)
            scope = node.scope.parent
    else:
        scope = get_enclosing_scope(node)
    return scope

# - Interface function --------------------------------------------------------

def create_scopes(node):
    # check we're scoping a matching tree
    file_node = node.getRoot()
    treegen = file_node.get("treegenerator_tag", ())
    if treegen == () or treegen != 1:
        # TODO: console.debug("Not creating scopes for unsuitable tree")
        return node # silently do nothing

    # create only the scope tree for this ast
    scopeCollector = CreateScopesVisitor(node)
    scopeCollector.visit(node)
    # now go through the scopes and collect vars into it
    varCollector = ScopesVisitor()
    varCollector.visit(node.scope)

    return node
