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

import sys, string, re
from ecmascript.frontend import lang
from ecmascript.frontend.treegenerator import PackerFlags as p

class Packer(object):

    @staticmethod
    def emit_tree(node, opts):

        return node.toJS(opts)

    # --------------------------------------------------------------------------
    # -- Interface Methods -----------------------------------------------------
    # --------------------------------------------------------------------------


    # This was the old 'compileNode' interface method

    @staticmethod
    def serializeNode(node, opts, rslt, enableBreaks=False, enableVerbose=False):
        p.pretty       = False
        p.breaks       = enableBreaks
        p.afterLine    = False
        p.afterBreak   = False
        p.afterDoc     = False
        p.afterDivider = False
        p.afterArea    = False

        return [ Packer.emit_tree(node, p) ]  # caller expects []


