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

from ecmascript.frontend    import treeutil
from ecmascript.backend     import formatter_3 as formatter
from ecmascript.frontend.treegenerator_3  import symbol
from ecmascript.frontend    import treegenerator_3

defaultOptions = formatter.defaultOptions()

def assembleVar(node):
    assert node.isVar()
    var_root = treeutil.findVarRoot(node)
    return var_root.toJS(defaultOptions)

def stringTrim(fileId, parseTree):
    modified = False
    # look for matching node
    for trim_node in treeutil.findNode(parseTree, ["identifier"], [("value","trim")]):
        # check qx.lang.String.trim() call
        var_root = treeutil.findVarRoot(trim_node)
        #var_name, _ = treeutil.assembleVariable(trim_node)
        var_name = assembleVar(trim_node)
        if not (var_root.hasParentContext("call/operand")
            and var_name == "qx.lang.String.trim"): 
            continue
        else:
            call_node = var_root.parent.parent
        call_arg = getCallArg(call_node)
        new_node = makeTrimReplace(call_arg)
        replaceNode(call_node, new_node)
        modified = True
    return modified

def getCallArg(call_node):
    assert call_node.type == "call"
    return call_node.getChild("arguments").children[1]

##
# foo -> (foo).trim()
def makeTrimReplace(trim_arg):
    lin, col = trim_arg.get("line",-1), trim_arg.get("column", -1)
    str_replacement_tmpl = "().trim()"
    new_tree = treegenerator_3.parse(str_replacement_tmpl)
    new_tree = treeutil.findChild(new_tree, "call")  # get rid of "statements/statement"
    # inject trim_arg into the empty group
    group_node = treeutil.findChild(new_tree, "group")
    assert group_node
    group_node.addChild(trim_arg, 1)
    return new_tree

def replaceNode(old_node, new_node):
    old_node.parent.replaceChild(old_node, new_node)
    # remove "qx" from scope
    qx_node = None
    for node in treeutil.findNode(old_node, ["identifier"], [("value","qx")]):
        qx_node = node
        break
    if qx_node and hasattr(qx_node,"scope") and qx_node.scope:
        scope_node = qx_node.scope.vars["qx"]
        scope_node.uses.remove(qx_node)
        if not scope_node.uses and not scope_node.decl:
            del qx_node.scope.vars["qx"]


##
# Interface function
def patch(fileId, parseTree):
    modified = False
    modified = stringTrim(fileId, parseTree)
    return modified
