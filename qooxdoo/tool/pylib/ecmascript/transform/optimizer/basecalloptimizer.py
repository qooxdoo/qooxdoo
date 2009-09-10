#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import re, sys

from ecmascript.frontend import treeutil

def patch(node):
    patchCount = 0

    this_base_vars = treeutil.findVariable(node, "this.base")
    for var in this_base_vars:
        if var.parent.type == "operand" and var.parent.parent.type == "call":
            call = var.parent.parent
            try:
                firstArgName = treeutil.selectNode(call, "params/1/identifier/@name")
            except tree.NodeAccessException:
                continue

            if firstArgName != "arguments":
                continue

            newCall = treeutil.compileString("arguments.callee.base.call(this)")
            newCall.replaceChild(newCall.getChild("params"), call.getChild("params"))
            treeutil.selectNode(newCall, "params/1/identifier").set("name", "this")
            call.parent.replaceChild(call, newCall)
            patchCount += 1

    this_self_vars = treeutil.findVariable(node, "this.self")
    for var in this_self_vars:
        if var.parent.type == "operand" and var.parent.parent.type == "call":
            call = var.parent.parent
            try:
                firstArgName = treeutil.selectNode(call, "params/1/identifier/@name")
            except tree.NodeAccessException:
                continue

            if firstArgName != "arguments":
                continue

            newCall = treeutil.compileString("arguments.callee.self")
            call.parent.replaceChild(call, newCall)
            patchCount += 1

    return patchCount


