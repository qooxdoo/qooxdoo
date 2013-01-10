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
from ecmascript.backend     import formatter as formatter
from ecmascript.frontend.treegenerator  import symbol

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
        #import pydb; pydb.debugger()
        call_arg = getCallArg(call_node)
        new_node = makeTrimReplace(call_arg)
        replaceNode(call_node, new_node)
        modified = True
    return modified

def getCallArg(call_node):
    assert call_node.type == "call"
    return call_node.getChild("arguments").children[0]

##
# foo -> (foo).trim()
def makeTrimReplace(trim_arg):
    lin, col = trim_arg.get("line",-1), trim_arg.get("column", -1)
    # guard orig. argument with "()"
    group_node = symbol("group")(lin,col)
    group_node.childappend(trim_arg)
    # construct new call tree
    dot_node = symbol("dotaccessor")(lin,col)
    oper_node = symbol("operand")(lin,col)
    call_node = symbol("call")(lin,col)
    args_node = symbol("arguments")(lin,col)
    id_node = symbol("identifier")(lin,col)
    id_node.set("value", "trim")
    call_node.childappend(oper_node)
    call_node.childappend(args_node)
    oper_node.childappend(dot_node)
    dot_node.childappend(group_node)
    dot_node.childappend(id_node)
    return call_node

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
