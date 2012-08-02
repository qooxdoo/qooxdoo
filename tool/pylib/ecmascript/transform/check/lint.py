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
# AST checking, for unknown globals etc.
##

import os, sys, re, types
from collections import defaultdict
from ecmascript.frontend import treeutil, lang, Comment
from generator.Context import console

class LintChecker(treeutil.NodeVisitor):

    def __init__(self, root_node, file_name, opts):
        super(LintChecker, self).__init__()
        self.root_node = root_node
        self.file_name = file_name  # it's a warning module, so i need a proper file name
        self.opts = opts

    def visit_file(self, node):
        # we can run the basic scope checks as with function nodes
        self.function_known_globals(node)
        self.function_unused_vars(node)
        self.function_used_deprecated(node)
        self.function_multiple_var_decls(node)
        # this is also good to check class map integrity
        for class_defn in treeutil.findQxDefineR(node):
            self.class_declared_privates(class_defn)
            self.class_reference_fields(class_defn)
        # recurse
        for cld in node.children:
            self.visit(cld)

    def visit_map(self, node):
        #print "visiting", node.type
        self.map_unique_keys(node)
        # recurse
        for cld in node.children:
            self.visit(cld)

    def visit_loop(self, node):
        #print "visiting", node.type
        self.loop_body_block(node.getChild("body")) # all "loops" have at least one body
        if node.get("loopType")=="IF" and len(node.children)>2:  # there is an "else"
            self.loop_body_block(node.children[2])
        # recurse
        for cld in node.children:
            self.visit(cld)
        
    def visit_function(self, node):
        #print "visiting", node.type
        self.function_known_globals(node)
        self.function_unused_vars(node)
        self.function_used_deprecated(node)
        self.function_multiple_var_decls(node)
        # recurse
        for cld in node.children:
            self.visit(cld)
        
    def visit_TEMPLATE(self, node):
        #print "visiting", node.type
        # recurse
        for cld in node.children:
            self.visit(cld)
        

    # - ---------------------------------------------------------------------------

    def function_used_deprecated(self, funcnode):
        # take advantage of Scope() objects
        scope = funcnode.scope
        for id_, scopeVar in scope.globals().items():
            # id_ might be an incomplete class id, like "qx" 
            # let's look at the var uses
            for var_node in scopeVar.uses:
                full_name = (treeutil.assembleVariable(var_node))[0]
                ok = True
                if (full_name in lang.GLOBALS # JS built-ins ('alert' etc.)
                        and full_name in lang.DEPRECATED):
                    ok = False
                    at_hints = get_at_hints(funcnode) # check full_name against @ignore hints
                    if at_hints:
                        ok = not self.is_name_lint_filtered(full_name, at_hints, "ignoreDeprecated")
                if not ok:
                    warn("Unknown global symbol used: %s" % full_name, self.file_name, var_node)
                    
    def function_known_globals(self, funcnode):
        # take advantage of Scope() objects
        scope = funcnode.scope
        for id_, scopeVar in scope.globals().items():
            # id_ might be an incomplete class id, like "qx" 
            # let's look at the var uses
            for var_node in scopeVar.uses:
                full_name = (treeutil.assembleVariable(var_node))[0]
                ok = False
                if full_name in lang.GLOBALS: # JS built-ins ('alert' etc.)
                    ok = True
                if full_name in self.opts.library_classes: # known classes (classList)
                    ok = True
                at_hints = get_at_hints(funcnode) # check full_name against @ignore hints
                if at_hints:
                    ok = not self.is_name_lint_filtered(full_name, at_hints, "ignoreUndefined")
                if not ok:
                    warn("Unknown global symbol used: %s" % full_name, self.file_name, var_node)
                    
    def function_unused_vars(self, funcnode):
        scope = funcnode.scope
        unused_vars = dict([(id_, scopeVar) for id_, scopeVar in scope.vars.items() 
                                if self.var_unused(scopeVar)])

        for var_name,scopeVar in unused_vars.items():
            should_print = True
            at_hints = get_at_hints(funcnode) # check @ignore hints
            if at_hints:
                should_print = not self.is_name_lint_filtered(var_name, at_hints, "ignoreUnused")
            if should_print:
                warn("Declared but unused variable or parameter '%s'" % var_name, self.file_name, scopeVar.decl[0])

    ##
    # Checks the @lint hints in <at_hints> if the given <var_name> is filtered
    # under the <filter_key> (e.g. "ignoreUndefined" in *@lint ignoreUndefined(<var_name>))
    #
    def is_name_lint_filtered(var_name, at_hints, filter_key):
        filtered = False
        if at_hints:
            filtered = ( 'lint' in at_hints and 
                filter_key in at_hints['lint'] and
                var_name in at_hints['lint'][filter_key]
            )
        return filtered


    ##
    # Check if a map only has unique keys.
    #
    def map_unique_keys(self, node):
        # all children are .type "keyvalue", with .get(key) = <identifier>
        entries = [(keyval.get("key"), keyval) for keyval in node.children]
        seen = set()
        for key,keyval in entries:
            if key in seen:
                warn("Duplicate use of map key", self.file_name, keyval)
            seen.add(key)

    def function_multiple_var_decls(self, node):
        scope_node = node.scope
        for id_, var_node in scope_node.vars.items():
            if self.multiple_var_decls(var_node):
                warn("Multiple declarations of variable '%s' (%r)" % (
                    id_, [(n.get("line",0) or -1) for n in var_node.decl]), self.file_name, None)

    def multiple_var_decls(self, scopeVar):
        return len(scopeVar.decl) > 1

    def var_unused(self, scopeVar):
        return len(scopeVar.decl) > 0 and len(scopeVar.uses) == 0

    def loop_body_block(self, body_node):
        if not body_node.getChild("block",0):
            warn("Loop or condition statement without a block as body", self.file_name, body_node)

    ##
    # Check that no privates are used in code that are not declared as a class member
    #
    this_aliases = ('this', 'that')
    reg_privs = re.compile(r'\b__')

    def class_declared_privates(self, class_def_node):
        class_map = treeutil.getClassMap(class_def_node)

        # statics
        private_keys = set()
        # collect all privates
        for key in class_map['statics']:
            if self.reg_privs.match(key):
                private_keys.add(key)
        # go through uses of 'this' and 'that' that reference a private
        for key,val in class_map['statics'].items():
            if val.type == 'function':
                function_privs = self.function_uses_local_privs(val)
                for priv, node in function_privs:
                    if priv not in private_keys:
                        warn("Using an undeclared private class feature: '%s'" % priv, self.file_name, node)
        
        # members
        private_keys = set()
        # collect all privates
        for key in class_map['members']:
            if self.reg_privs.match(key):
                private_keys.add(key)
        # go through uses of 'this' and 'that' that reference a private
        for key,val in class_map['members'].items():
            if val.type == 'function':
                function_privs = self.function_uses_local_privs(val)
                for priv, node in function_privs:
                    if priv not in private_keys:
                        warn("Using an undeclared private class feature: '%s'" % priv, self.file_name, node)


    ##
    # Warn about reference types in map values, as they are shared across instances.
    #
    def class_reference_fields(self, class_def_node):
        class_map = treeutil.getClassMap(class_def_node)
        # only check members
        members_map = class_map['members'] if 'members' in class_map else {}

        for key, value in members_map.items():
            if (value.type in ("map", "array") or
               (value.type == "operation" and value.get("operator")=="NEW")):
               warn("Reference values are shared across all instances: '%s'" % key, self.file_name, value)


    def function_uses_local_privs(self, func_node):
        function_privs = set()
        reg_this_aliases = re.compile(r'\b%s' % "|".join(self.this_aliases))
        scope = func_node.scope
        for id_,scopeVar in scope.vars.items():
            if reg_this_aliases.match(id_):
                for var_use in scopeVar.uses:
                    full_name = treeutil.assembleVariable(var_use)[0]
                    name_parts = full_name.split(".")
                    if len(name_parts) > 1 and self.reg_privs.match(name_parts[1]):
                        function_privs.add((name_parts[1],var_use))
        return function_privs

# - ---------------------------------------------------------------------------

def warn(msg, fname, node):
    if node:
        emsg = "%s (%s,%s): %s" % (fname, node.get("line"), node.get("column"), msg)
    else:
        emsg = "%s: %s" % (fname, msg)
    if console:
        console.warn(emsg)
    else:
        print >>sys.stderr, emsg

##
# Get the JSDoc comments in a nested dict structure
def get_at_hints(node):
    commentAttributes = Comment.parseNode(node)  # searches comment "around" this node
    at_hints = defaultdict(dict)
    for entry in commentAttributes:
        cat = entry['category']
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


def defaultOptions():
    class C(object): pass
    opts = C()
    opts.library_classes = []
    return opts

# - ---------------------------------------------------------------------------

def lint_check(node, file_name, opts):
    lint = LintChecker(node, file_name, opts)
    lint.visit(node)
