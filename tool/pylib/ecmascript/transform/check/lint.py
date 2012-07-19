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
from ecmascript.frontend import treeutil, lang, Comment
from generator.Context import console

class LintChecker(treeutil.NodeVisitor):

    def __init__(self, root_node, file_name, opts):
        super(LintChecker, self).__init__()
        self.root_node = root_node
        self.file_name = file_name  # it's a warning module, so i need a proper file name
        self.opts = opts

    def visit_map(self, node):
        #print "visiting", node.type
        self.map_unique_keys(node)

        # recurse
        for cld in node.children:
            self.visit(cld)

    def visit_function(self, node):
        #print "visiting", node.type
        self.function_known_globals(node)
        self.function_unused_vars(node)
        self.function_used_deprecated(node)
        # recurse
        for cld in node.children:
            self.visit(cld)
        
    def visit_TEMPLATE(self, node):
        #print "visiting", node.type
        # recurse
        for cld in node.children:
            self.visit(cld)
        

    # - ---------------------------------------------------------------------------

    DEPRECATED_IDENTIFIER = set([
        "alert",
        "confirm",
        "debugger",
        "eval"
    ])

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
                    and full_name in self.DEPRECATED_IDENTIFIER
                    ):
                    ok = False
                    # check full_name against @ignore hints
                    at_hints = get_at_hints(funcnode)
                    if at_hints:
                        if ( 'lint' in at_hints and 
                             'ignoreDeprecated' in at_hints['lint'] and
                             full_name in at_hints['lint']['ignoreDeprecated']
                            ):
                            ok = True

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
                # check full_name against @ignore hints
                at_hints = get_at_hints(funcnode)
                if at_hints:
                    if ( 'lint' in at_hints and 
                         'ignoreUndefined' in at_hints['lint'] and
                         full_name in at_hints['lint']['ignoreUndefined']
                        ):
                        ok = True

                if not ok:
                    warn("Unknown global symbol used: %s" % full_name, self.file_name, var_node)
                    
    def function_unused_vars(self, funcnode):
        scope = funcnode.scope
        unused_vars = dict([(id_, scopeVar) for id_, scopeVar in scope.vars.items() if (
            scopeVar.decl # it's a var declared in this scope
            and len(scopeVar.uses)==1 # .uses has only the decl
        )])
        for var_name,scopeVar in unused_vars.items():
            ok = False
            # check @ignore hints
            if funcnode.comments:
                at_hints = get_at_hints(funcnode)
                if at_hints:
                    if ( 'lint' in at_hints and 
                         'ignoreUnused' in at_hints['lint'] and
                         var_name in at_hints['lint']['ignoreUnused']
                        ):
                        ok = True
            if not ok:
                warn("Unused local variable: %s" % var_name, self.file_name, scopeVar.decl)

    def map_unique_keys(self, node):
        # all children are .type "keyvalue", with .get(key) = <identifier>
        entries = [(keyval.get("key"), keyval) for keyval in node.children]
        seen = set()
        for key,keyval in entries:
            if key in seen:
                warn("Duplicate use of map key", self.file_name, keyval)
            seen.add(key)

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

def lint_check(node, file_name, opts):
    lint = LintChecker(node, file_name, opts)
    lint.visit(node)
