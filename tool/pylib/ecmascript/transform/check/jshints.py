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
# Scope walker to produce a list of global identifier nodes (unfiltered).
#
##

import os, sys, re, types
from ecmascript.frontend import treeutil, Comment
from ecmascript.transform.check.lint import LintChecker
from generator.code.HintArgument import HintArgument

##
# A visitor on a Scope() tree to collect identifier nodes with global scope.
#
class CreateHintsVisitor(treeutil.NodeVisitor):

    def __init__(self, tree):
        self.curr_hint = Hint() # provide an inital, empty top-level Hint() object
        tree.hint = self.curr_hint

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

        if node.comments:
            commentsArray = Comment.parseNode(node)
            if any(commentsArray):
                hint = Hint()
                # maintain hint tree
                self.curr_hint.children.append(hint)
                hint.parent = self.curr_hint
                # fill hint from commentAttributes
                hint = self.commentAttributes_to_hint(commentsArray, hint)
                # get main node from node
                main_node = treeutil.findCommentedRoot(node)
                # cross-link hint and node
                main_node.hint = hint
                hint.node = main_node # node?!
                # scope nested hints
                self.curr_hint = hint
        for cld in node.children:
            self.visit(cld)

    def commentAttributes_to_hint(self, commentsArray, hintObj):
        hint = hintObj
        for commentAttributes in commentsArray:
            for entry in commentAttributes:
                cat = entry['category']
                if cat not in ('ignore', 'lint'):
                    continue
                functor = entry.get('functor') # will be None for @ignore
                hint.add_entries((cat,functor), entry['arguments'])  # hint.hints['lint']['ignoreUndefined']{'foo','bar'}
                                                                     # hint.hints['ignore'][None]{'foo','bar'}
        return hint


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

# - ---------------------------------------------------------------------------

##
# Assumes a hint tree has been created already.
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
    hintsCollector = CreateHintsVisitor(tree)
    hintsCollector.visit(tree)
    return tree
