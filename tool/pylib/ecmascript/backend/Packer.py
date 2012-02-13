#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
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

import sys, string, re
from ecmascript.frontend import lang

class Packer(object):

    @staticmethod
    def emit_tree(node):

        return node.toJS()

    # --------------------------------------------------------------------------
    # -- Interface Methods -----------------------------------------------------
    # --------------------------------------------------------------------------


    # This was the old 'compileNode' interface method

    @staticmethod
    def serializeNode(node, opts, rslt, enableBreaks=False, enableVerbose=False):
        global pretty
        global breaks
        global afterLine
        global afterBreak
        global afterDoc
        global afterDivider
        global afterArea
        
        pretty       = False
        breaks       = enableBreaks
        afterLine    = False
        afterBreak   = False
        afterDoc     = False
        afterDivider = False
        afterArea    = False

        return [ Packer.emit_tree(node) ]  # caller expects []


