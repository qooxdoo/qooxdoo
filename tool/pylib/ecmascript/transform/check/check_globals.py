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
# Lint-derived checker specifically for unknown globals.
#
# Allows to run a dedicated check for unknown globals when it is necessary and
# a list of build classes is available.
##

import os, sys, re, types
from collections import defaultdict
from ecmascript.frontend import treeutil, lang
from ecmascript.transform.check  import lint
from ecmascript.transform.check  import scopes

##
# A visitor on a Scope() tree, but uses the same check code for globals checking
# as lint.LintChecker (hence the subclassing).
# Supposed to be faster for dedicated globals checking (when lint.LintChecker does
# all checks, and traverses the (bigger) syntax tree).
#
class GlobalsChecker(lint.LintChecker):

    def __init__(self, root_node, file_name_, opts):
        super(GlobalsChecker, self).__init__(root_node, file_name_, opts)

    def visit(self, scope_node):
        if not self.opts.ignore_undefined_globals:
            self.unknown_globals(scope_node)
        # recurse
        for cld in scope_node.children:
            self.visit(cld)

# - ---------------------------------------------------------------------------

#cnt = 0
def globals_check(node, file_name, opts):
    node = scopes.create_scopes(node)  # update scopes
    lint = GlobalsChecker(node, file_name, opts)
    #print "Globals", file_name
    lint.visit(node.scope)
    #import cProfile
    #cProfile.runctx("lint.visit(node)",globals(),locals(),
    #    "/home/thron7/tmp/prof/deps.prof"+str(cnt))
    #global cnt
    #cnt += 1
    return lint.issues
