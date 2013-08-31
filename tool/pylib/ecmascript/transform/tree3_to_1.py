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
# A tree_3 to tree_1 transformer, as external visitor.
##

import os, sys, re, types, itertools
from collections import defaultdict
from ecmascript.frontend import treeutil, lang, Comment
from ecmascript.frontend import tree, treegenerator
from ecmascript.transform.optimizer import variantoptimizer
from ecmascript.transform.check  import scopes
from ecmascript.transform.check  import jshints
from ecmascript.transform.check  import global_symbols as gs
from generator.runtime.CodeIssue import CodeIssue

class Tree3ToTree1(treeutil.NodeVisitor):

    def visit(self, node):
        if hasattr(self, "visit_" + node.type):
            nnode = getattr(self, "visit_" + node.type)(node)
        else:
            nnode = node.clone()
            nnode.children = []
            for child in node.children:
                nchild = self.visit(child)
                if nchild:
                    nnode.childappend(nchild)
        return nnode

    ##
    # 'statement' nodes are replaced by their single child
    def visit_statement(self, node):
        pass



# - ---------------------------------------------------------------------------

def tree3_to_1(node):
    file_node = node.getRoot()
    treegen = file_node.get("treegenerator_tag", ())
    assert treegen == 3
    tree_transformer = Tree3ToTree1(node)
    new_node = tree_transformer.visit()
    return new_node

