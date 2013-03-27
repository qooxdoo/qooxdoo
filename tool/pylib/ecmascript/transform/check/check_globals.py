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
# AST checking, for unknown globals etc.
##

import os, sys, re, types
from collections import defaultdict
from ecmascript.frontend import treeutil, lang, Comment
from ecmascript.frontend import tree, treegenerator
from ecmascript.transform.optimizer import variantoptimizer
from ecmascript.transform.evaluate  import evaluate
from ecmascript.transform.check  import scopes
from generator import Context
from generator.runtime.CodeIssue import CodeIssue

class GlobalsChecker(scopes.ScopeVisitor):

    def __init__(self, root_node, file_name_, opts):
        super(GlobalsChecker, self).__init__()
        self.root_node = root_node
        self.file_name = file_name_  # it's a warning module, so i need a proper file name
        self.opts = opts
        self.issues = []
        self.known_globals_bases = (
            self.opts.library_classes + self.opts.allowed_globals + lang.QXGLOBALS )
        global file_name
        file_name = file_name_

    def visit(self, node):
        # we can run the basic scope checks as with function nodes
        #print "visiting", node.node.type
        if not self.opts.ignore_undefined_globals:
            self.unknown_globals(node)
        # recurse
        for cld in node.children:
            self.visit(cld)


    # - ---------------------------------------------------------------------------


    def unknown_globals(self, scope):
        # take advantage of Scope() objects
        for id_, scopeVar in scope.globals().items():
            if id_ in self.opts.allowed_globals:
                continue
            elif id_ in lang.GLOBALS: # JS built-ins ('alert' etc.)
                continue
            else:
                # we want to be more specific than just the left-most symbol,
                # like "qx", so let's look at the var uses
                for var_node in scopeVar.uses:
                    var_top = treeutil.findVarRoot(var_node)
                    full_name = (treeutil.assembleVariable(var_top))[0]
                    ok = False
                    if extension_match_in(full_name, self.known_globals_bases, 
                        self.opts.class_namespaces): # known classes (classList + their namespaces)
                        ok = True
                    else:
                        at_hints = get_at_hints(var_node) # check full_name against @ignore hints
                        if at_hints:
                            ok = ( self.is_name_ignore_filtered(full_name, at_hints)
                                or self.is_name_lint_filtered(full_name, at_hints, "ignoreUndefined")) # /**deprecated*/
                    if not ok:
                        issue = warn("Unknown global symbol used: '%s'" % full_name, self.file_name, var_node)
                        self.issues.append(issue)

    ##
    # <name> is an extension match of <prefix> .iff. <prefix> is a prefix of <name>
    #
    # taking object boundaries (".") into account, i.e.
    # "a" is a prefix match of "a" and "a.b", but not of "ab"
    #
    @staticmethod
    def extension_match(name, prefix):
        return re.match(r"%s(?:\.|$)" % re.escape(prefix), name)

    ##
    # Checks the @lint hints in <at_hints> if the given <var_name> is filtered
    # under the <filter_key> (e.g. "ignoreUndefined" in *@lint ignoreUndefined(<var_name>))
    #
    def is_name_lint_filtered(self, var_name, at_hints, filter_key):
        filtered = False
        if at_hints:
            if ( 'lint' in at_hints and
                filter_key in at_hints['lint']):
                if any([self.extension_match(var_name, x) for x in at_hints['lint'][filter_key]]):
                    filtered = True
        return filtered


    ##
    # Checks @ignore(...)
    #
    def is_name_ignore_filtered(self, var_name, at_hints):
        return ('ignore' in at_hints and 
            any([self.extension_match(var_name, x) for x in at_hints['ignore']]))

# - ---------------------------------------------------------------------------

def warn(msg, fname, node):
    issue = CodeIssue()
    issue.msg = msg
    if node:
        issue.line, issue.column = node.get("line"), node.get("column")
    return issue

##
# Get the JSDoc comments in a nested dict structure
def get_at_hints(node, at_hints=None):
    if at_hints is None:
        at_hints = defaultdict(dict)
    commentsArray = Comment.parseNode(node)  # searches comment "around" this node
    for commentAttributes in commentsArray:
        for entry in commentAttributes:
             # {'arguments': ['a', 'b'],
             #  'category': u'lint',
             #  'functor': u'ignoreReferenceField',
             #  'text': u'<p>ignoreReferenceField(a,b)</p>'
             # }
            cat = entry['category']
            if cat=='lint':
                functor = entry['functor']
                if functor not in at_hints[cat]:
                    at_hints[cat][functor] = set()
                at_hints[cat][functor].update(entry['arguments']) 
            elif cat=="ignore":
                if cat not in at_hints:
                    at_hints[cat] = set()
                at_hints[cat].update(entry['arguments'])
    # include @hints of parent scopes
    scope = scopes.find_enclosing(node)
    if scope:
        at_hints = get_at_hints(scope.node, at_hints)
    return at_hints


##
# A known qx global is either exactly a name space, or a dotted identifier that
# is a dotted extension of a known class.
#
# (This is a copy of MClassDependencies._splitQxClass).
#
def extension_match_in(name, name_list, name_spaces):
    res_name = ''
    res_attribute = ''
    # check for a name space match
    if name in name_spaces:
        res_name = name
    # see if name is a (dot-exact) prefix of any of name_list
    else:
        for class_name in name_list:
            if (name.startswith(class_name) and 
                    re.search(r'^%s\b' % re.escape(class_name), name)): 
                        # re.escape for e.g. the '$' in 'qx.$$'
                        # '\b' so that 'mylib.Foo' doesn't match 'mylib.FooBar'
                if len(class_name) > len(res_name): # take the longest match (?!)
                    res_name = class_name
                    ## compute the 'attribute' suffix
                    #res_attribute = name[ len(class_name) +1:]  # skip class_name + '.'
                    ## see if res_attribute is chained, too
                    #dotidx = res_attribute.find(".")
                    #if dotidx > -1:
                    #    res_attribute = res_attribute[:dotidx]    # only use the first component

    return res_name

# - ---------------------------------------------------------------------------

#cnt = 0
def globals_check(node, file_name, opts):
    node = scopes.create_scopes(node)  # update scopes
    lint = GlobalsChecker(node.scope, file_name, opts)
    #print "Globals", file_name
    lint.visit(node.scope)
    #import cProfile
    #cProfile.runctx("lint.visit(node)",globals(),locals(),
    #    "/home/thron7/tmp/prof/deps.prof"+str(cnt))
    #global cnt
    #cnt += 1
    return lint.issues
