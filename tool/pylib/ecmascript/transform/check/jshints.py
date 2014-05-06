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

import os, sys, re, types, itertools
from ecmascript.frontend import treeutil, Comment
from generator.code.HintArgument import HintArgument
from generator import Context as context

##
# A visitor on a syntax tree to create a tree of Hint() objects from JSDoc comments.
#
class CreateHintsVisitor(treeutil.NodeVisitor):

    def __init__(self, tree):
        hint = self.process_comments(tree)
        if not hint:
            hint = Hint() # provide an inital, empty top-level Hint() object
        self.curr_hint = hint
        tree.hint = hint
        hint.node = tree

    @staticmethod
    def find_enclosing_hint(node):
        while True:
            if hasattr(node, 'hint'):
                return node.hint
            elif node.parent:
                node = node.parent
            else:
                return None

    # -----------------------------------------------------------------

    def visit(self, node):

        hint = self.process_comments(node)
        if hint:
            # maintain hint tree
            self.curr_hint.children.append(hint)
            hint.parent = self.curr_hint
            # get main node from node
            main_node = treeutil.findCommentedRoot(node)
            # cross-link hint and node
            main_node.hint = hint
            hint.node = main_node # node?!
            # scope nested hints
            self.curr_hint = hint
        for cld in node.children:
            self.visit(cld)

    def _key_is_ignored(self, at_key, hint_node):
        for hint in itertools.chain([hint_node], self.curr_hint.search_upward() 
                if hasattr(self,'curr_hint') else []  # self.curr_hint might not be initialized yet, see __init__
            ):
            if hint.ident_matches(at_key, ('lint', 'ignoreJsdocKey')):
                return True
        return False

    def process_comments(self, node):
        hint = None
        if node.comments:
            commentsArray = Comment.parseNode(node, process_txt=False, want_errors=True)
            if any(commentsArray):
                hint = Hint()
                # fill hint from commentAttributes
                for commentAttributes in commentsArray:
                    for entry in commentAttributes:
                        # errors treated later
                        if 'error' in entry:
                            continue
                        # add interesting entries to tree
                        cat = entry['category']
                        if cat not in ('ignore', 'lint', 'require', 'use', 'asset', 'cldr'):
                            continue
                        else:
                            functor = entry.get('functor') # will be None for non-functor keys like @ignore, @require, ...
                            hint.add_entries((cat,functor), entry['arguments'])  # hint.hints['lint']['ignoreUndefined']{'foo','bar'}
                                                                         # hint.hints['ignore'][None]{'foo','bar'}

                # loop again for error logging (here, so you can ignore error entries in the same comment)
                #
                # TODO: separation of concerns -  it's a kludge to be outputting warnings here; they should
                # be returned to the caller of the module, together with the genuine result. the caller
                # should decide how to handle warnings. if he handles them warnings should be transformed
                # into a generic format and passed to a dedicated handler, e.g. the Log module. this handler
                # might in turn consult the hint tree, to check for ignore hints.
                for commentAttributes in commentsArray:
                    for entry in commentAttributes:
                        if 'error' in entry:
                            if self._key_is_ignored(entry['category'], hint):
                                continue
                            else:
                                msg = "%s (%s): %s" % (entry['filename'], entry['lineno'], entry['message'])
                                msg += (": %s" % entry['text']) if 'text' in entry and entry['text'] else ''
                                context.console.warn(msg)

        return hint


##
# Hint.hints = {
#    'lint' : {
#        'ignoreUndefined' : set('foo', 'bar') },
#    'ignore' : {
#        None : set('foo', 'bar') },
# }
class Hint(object):
    def __init__(self):
        self.hints = {}
        self.node = None   # link to ast node
        self.parent = None
        self.children = []

    def search_upward(self):
        yield self
        if self.parent:
            for hint in self.parent.search_upward():
                yield hint

    def ident_matches(self, name, cat_and_sub):
        cat, subcat = cat_and_sub
        if cat not in self.hints:
            return False
        elif subcat not in self.hints[cat]:
            return False
        elif [hint for hint in self.hints[cat][subcat] if hint==name]: # HintArgument.__eq__ does the matching
            return True
        return False

    ##
    # Add ['foo'] to hints[lint][ignoreUndefined], turning each into a 
    # HintArgument().
    #
    def add_entries(self, cat_and_subcat, entries):
        cat, subcat = cat_and_subcat
        if cat not in self.hints:
            self.hints[cat] = {}
        if subcat not in self.hints[cat]:
            self.hints[cat][subcat] = set()
        for entry in entries:
            self.hints[cat][subcat].add(HintArgument(entry))

    def iterator(self):
        yield self
        for cld in self.children:
            for hint in cld.iterator():
                yield hint

# - ---------------------------------------------------------------------------

##
# Returns an iterator for the Hint() nodes above this AST node.
#
# (Assumes a hint tree has been created already.)
#
def find_hints_upward(node):
    hint_node = CreateHintsVisitor.find_enclosing_hint(node)
    if hint_node:
        return hint_node.search_upward()
    else:
        return iter([])


##
# Create a tree of Hint() objects, attached to corresp. nodes of tree.
#
def create_hints_tree(tree):
    treeHintColltor = CreateHintsVisitor(tree)
    # Special case: top-level sequence of statements:
    # tie the hint trees of all subsequent tl statements to the first
    # (as the first statement gets the very first jsdoc comment which should scope over all)
    if tree.type=='statements' or (len(tree.children)==1 and tree.children[0].type=='statements'):
        if tree.type=='statements':
            root_node = tree
        elif tree.children[0].type=='statements':
            root_node = tree.children[0]
        first_cld = True
        for cld in root_node.children:
            cldColltor = CreateHintsVisitor(cld)
            cldColltor.visit(cld)
            if first_cld:
                first_cld = False
                first = cld
                first.hint.parent = tree.hint
                tree.hint.children.append(first.hint)
            else:
                first.hint.children.append(cld.hint)
                cld.hint.parent = first.hint
    else:
        treeHintColltor.visit(tree)
    return tree

