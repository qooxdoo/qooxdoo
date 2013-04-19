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
# Scope visitor that dispatches on the type of the linked AST node.
#
class ScopeVisitor(object):

    def visit(self, scopeNode):
        scope_type = scopeNode.node.type
        if hasattr(self, "visit_"+scope_type):
            getattr(self, "visit_"+scope_type)(scopeNode)
        else:
            for child in scopeNode.children:
                self.visit(child)

##
# Scope visitor that goes through a tree of Scope()'s, invoking an AST visitor on
# corresponding AST nodes.
#
class VarsCollector(ScopeVisitor):

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
                scopeNode.mv_scope_var(id_, scopeVar, scopeNode.parent)

        # restore old scope and visit body
        for child in scopeNode.children:
            self.visit(child)


##
# AST visitor that assigns vardecl and varuses to a given Scope (and pot. its 
# parents), but doesn't descend into subscopes ("breadth-only search").
#
# Registering of identifiers (head symbols):
#
# - 'declaring' occurrence (in 'var' statements): 
#   - register with (pot. new) ScopeVar in enclosing Scope
#
# - 'use' occurrence (any other occurrence):
#   - register with ScopeVar in enclosing Scope, it is also declared in this
#     Scope
#   - else search the Scope chain upward for the declaring ScopeVar, register it
#     there when found
#   - else if no declaring ScopeVar is found it is a global symbol, register it
#     with the Scope where the occurrence *was found*
#     (this means global symbols are currently not propagated to the top-level
#     Scope or something; this retains globals where they are used across tree
#     transformations)
#
class AssignScopeVarsVisitor(treeutil.NodeVisitor):

    def __init__(self, curr_scope):
        super(AssignScopeVarsVisitor, self).__init__()
        self.curr_scope = curr_scope

    ##
    # "function foo(){}" declaration.
    #
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

    ##
    # Formal params are treated like local vars.
    #
    def visit_params(self, node):
        for id_node in node.children:
            self._new_var(id_node)

    ##
    # "var foo;" declaration.
    #
    def visit_var(self, node):
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

    ##
    # "foo" symbol reference.
    #
    def visit_identifier(self, node):  
        # only treat leftmost identifier (e.g. in a dotaccessor expression)
        if treeutil.checkFirstChainChild(node):
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
        self.protect_variable_optimization = False # some scopes need to be protected (bug#1966)
        self.is_load_time = False # whether this scope's symbols are evaluated at load time
        self.is_defer = False # whether this is the scope of a 'defer' function (is checked in load_time.py anyway)
                              # the information goes beyond is_load_time, as e.g. 'statics' references the class name
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

    ##
    # Move a scopeVar object from one scope to another.
    #
    # - updates scope pointers of tree nodes
    # - TODO: It might be better to link to the ScopeVar() object directly from the tree nodes,
    #   instead of to the Scope() object, so relocation of ScopeVar() objects is transparent
    #   to the tree nodes; would require to maintain a link from ScopeVar to its Scope object.
    def mv_scope_var(self, var_name, scopeVar, other):
        other.add_scope_var(var_name, scopeVar)
        del self.vars[var_name]
        for var_occur in scopeVar.occurrences():
            var_occur.scope = other

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
        return dict([(x,y) for x,y in self.vars.items() if y.is_global()])

    def locals(self):
        return dict([(x,y) for x,y in self.vars.items() if y.is_scoped()])

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
    # Return a collection of all the var names of nested scopes
    def all_var_names(self):
        all_vars = set()
        for var_map in self.vars_iterator():
            all_vars.update(var_map.keys())
        return all_vars

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

    ##
    # Is in a lexical scope
    def is_scoped(self):
        return bool(self.decl)

    ##
    # Is in the global scope
    def is_global(self):
        return not self.is_scoped()

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
    varCollector = VarsCollector()
    varCollector.visit(node.scope)

    return node
