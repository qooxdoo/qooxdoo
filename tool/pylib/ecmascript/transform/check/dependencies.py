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
# Get AST dependencies (unresolved global symbols).
#
# References to global symbols in code can address different kinds of globals:
# - built-ins (built-in to runtime environments, like 'alert' in browsers
##

import os, sys, re, types
from ecmascript.frontend import treeutil, lang, Comment
from ecmascript.transform.optimize import variantoptimizer
from generator.code.DependencyItem import DependencyItem
from generator.Context import console

class DependenciesCollector(treeutil.NodeVisitor):

    def __init__(self, root_node, file_name, opts):
        super(DependenciesCollector, self).__init__()
        self.file_name = file_name
        self.root_node = root_node
        self.opts = opts
        self.deps = []

    ##
    # We can currently focus on 'function' nodes, as they are the only that create
    # (interesting) scopes ('catch' scopes only contain the catch parameter).
    # We look at the globals registered with this function scope (we might run across
    # the same global in different scopes), filter known globals, and add depsItems
    # for them to the result set.
    def visit_function(self, node):
        assert hasattr(node, 'scope'), ".scope attribute missing on function; was this tree scope-analyzed?!"
        #print "visiting", node.type
        global_syms = node.scope.globals()
        for id_, scopeVar in global_syms:
            for var_node in scopeVar.uses:
                full_name = (treeutil.assembleVariable(var_node))[0]
                if self.is_ignored_global(full_name, scopeVar): # built-ins, known name spaces, @ignore's
                    continue
                depsItem = self.depsItem_from_node(full_name, var_node)
                self.append(depsItem)
        # recurse
        for cld in node.children:
            self.visit(cld)
        
    ##
    # Get deps behind environment keys, e.g. behind "runtime.name" in a call like
    # 'qx.core.Environment.get("runtime.name")'.
    #
    def visit_call(self, node):
        #print "visiting", node.type
        if variantoptimizer.isEnvironmentCall(node):
            assert self.opts.envmappings
            key = treeutil.selectNode(node, "arguments/1")
            classname, methname = self.getClassNameFromEnvKey(key, self.opts.envmappings)
            if classname:
                depsItem = DependencyItem(classname, methname, self.file_name, 
                                          node.get('line',-1))
                depsItem.isCall = True  # treat as if actual call, to collect recursive deps
                # check phase
                functor = node.getChild("operand")  # get the "qx.core.Environment" symbol
                if self.is_static_loaddep(functor):
                    depsItem.isLoadDep = True
                    depsItem.needsRecursion = True
                self.deps.append(depsItem)
        
    def visit_TEMPLATE(self, node):
        #print "visiting", node.type
        # recurse
        for cld in node.children:
            self.visit(cld)
        

    # - ---------------------------------------------------------------------------

    ##
    # Looks up the environment key in a map that yields the full class plus
    # method name as a string.
    #
    # (duplicate from MClassDependencies.getClassNameFromEnvKey)
    def getClassNameFromEnvKey(self, key, envmappings):
        result = '','' # fullname, methname
        if key in envmappings:
            implementation = envmappings[key]
            result = implementation.rsplit(".", 1)
        return result

    def is_ignored_global(self, full_name, var_node):
        is_ignored = False
        if full_name in lang.GLOBALS:
            is_ignored = True
        return is_ignored

    def depsItem_from_node(self, full_name, var_node):
        # attribute (e.g. method)
        attribute = ''
        # requestor (class id of the current tree)
        requestor = self.file_name
        # line (where requested)
        line = var_node.get("line",-1)
        # is it a static load-time dependency?
        isLoadDep = self.is_static_loaddep(var_node)

        depsItem = DependencyItem(full_name, attribute, requestor, line, isLoadDep)

        # is the var a call operand
        var_root = treeutil.findChainRoot(var_node)
        depsItem.isCall = var_root.hasParentContext("call/operand")
        # depsItem.needsRecursion can only be set in transitive analysis

        return depsItem

    ##
    # Check whether the symbol is a static load- or run-dep
    #
    def is_static_loaddep(self, var_node):
        isLoadDep = False
        enclosing_node = var_node.scope.node
        # var_node's scope is 'file' or other non-'function'
        if enclosing_node.type != 'function':
            isLoadDep = True
        # if scope_node's node is 'function' it's still a load-dep if...
        else:
            # ... it's the value of a class' 'defer' key
            if self.node_is_defer_value(enclosing_node):
                isLoadDep = True
            # ... the function is immediately called in a load context
            elif self.func_called_in_load_context(enclosing_node):
                isLoadDep = True
        return isLoadDep

    ##
    # We're looking for the context of a
    #   function(){...}()
    # or
    #   (function(){...})()
    #
    # To see whether a function definition is immediately called in a load
    # context, we need to check for a call parent, and then traverse up to 
    # see if the outermost call is made in a load context
    #
    def func_called_in_load_context(self, func_node):
        in_load_context = False
        if func_node.type != 'function':  # this is to end recursion!
            in_load_context = True
        elif (func_node.hasParentContext("call/operand") or
            func_node.hasParentContext("call/operand/group")):
            # test parent scope, where the call is in
            in_load_context = self.func_called_in_load_context(func_node.scope.parent.node)
        return in_load_context


    ##
    # Check if <node> is a 'defer' value of a qx class map
    def node_is_defer_value(self, node):
        is_defer = False
        # find qxDefine in tree
        for qx_def_node in treeutil.findQxDefineR(self.root_node):
            class_map = treeutil.getClassMap(qx_def_node)
            if 'defer' in class_map and class_map['defer'] == node:
                is_defer = True
                break
        return is_defer


# - ---------------------------------------------------------------------------

def warn(msg, fname, node):
    emsg = "%s (%s:%s,%s)" % (msg, fname, node.get("line"), node.get("column"))
    if console:
        console.warn(emsg)
    else:
        print >>sys.stderr, emsg

##
# Get the JSDoc comments in a nested dict structure
def get_at_hints(node):
    commentAttributes = Comment.parseNode(node)  # searches comment "around" this node
    at_hints = {}
    for entry in commentAttributes:
        cat = entry['category']
        if cat not in at_hints:
            at_hints[cat] = {}
        if cat=='lint':
             # {'arguments': ['a', 'b'],
             #  'category': u'lint',
             #  'functor': u'ignoreReferenceField',
             #  'text': u'<p>ignoreReferenceField(a,b)</p>'
             # }
            functor = entry['functor']
            if functor not in at_hints['lint']:
                at_hints['lint'][functor] = set()
            at_hints['lint'][functor].update(entry['arguments'])
    return at_hints

# - ---------------------------------------------------------------------------

def collect_dependencies(node, file_name, opts):
    deps = DependenciesCollector(node, file_name, opts)
    deps.visit(node)
    return deps.deps
