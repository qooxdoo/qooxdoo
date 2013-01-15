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

repl_table = [

    ("qx.bom.element.Overflow.getX",
        1, "qx.bom.element.Style.get(%(1)s, 'overflowX')" ),
    ("qx.bom.element.Overflow.setX",
        2, "qx.bom.element.Style.set(%(1)s, 'overflowX', %(2)s)" ),
    ("qx.bom.element.Overflow.resetX",
        1, "qx.bom.element.Style.reset(%(1)s, 'overflowX')" ),
    ("qx.bom.element.Overflow.compileX",
        1, "qx.bom.element.Style.get({'overflowX' : %(1)s})" ),

    ("qx.bom.element.Overflow.getY",
        1, "qx.bom.element.Style.get(%(1)s, 'overflowY')" ),
    ("qx.bom.element.Overflow.setY",
        2, "qx.bom.element.Style.set(%(1)s, 'overflowY', %(2)s)" ),
    ("qx.bom.element.Overflow.resetY",
        1, "qx.bom.element.Style.reset(%(1)s, 'overflowY')" ),
    ("qx.bom.element.Overflow.compileY",
        1, "qx.bom.element.Style.get({'overflowY' : %(1)s})" ),

    ("qx.lang.String.trim",
        1, "(%(1)s).trim()" ),

    ("qx.Bootstrap.getKeys",
        1, "Object.keys(%(1)s)" ),
    ("qx.lang.Object.getKeys",
        1, "Object.keys(%(1)s)" ),

    ("qx.lang.Array.toArray",
        1, "qx.lang.Array.cast(%(1)s, Array)" ),
    ("qx.lang.Array.toArray",
        2, "qx.lang.Array.cast(%(1)s, Array, %(2)s)" ),
    ("qx.lang.Array.fromCollection",
        1, "Array.prototype.slice.call(%(1)s, 0)" ),

    ("qx.lang.Object.hasMinLength",
        2, "(%(1)s.length >= %(2)s)" ),
    ("qx.Bootstrap.getKeysAsString",
        1, '''('"' + qx.Bootstrap.keys(%(1)s).join('\", "') + '"')''' ),
    ("qx.lang.Object.getKeysAsString",
        1, '''('"' + qx.Bootstrap.keys(%(1)s).join('\", "') + '"')''' ),
    ("qx.lang.Object.select",
        2, "%(2)s[%(1)s]" ),
    ("qx.lang.Object.carefullyMergeWith",
        2, "qx.lang.Object.mergeWith(%(1)s, %(2)s, false)" ),
]

defaultOptions = formatter.defaultOptions(formatter.FormatterOptions())

def assembleVar(node):
    assert node.isVar()
    var_root = treeutil.findVarRoot(node)
    return var_root.toJS(defaultOptions)

##
# Search through <node> and yield call nodes where <key> is the operand.
def findCallNodes(node, key):
    for call_node in treeutil.nodeIterator(node, ["call"]):
        oper_node = call_node.getChild("operand").getChild(0)
        if not oper_node.isVar():
            continue
        oper_str = assembleVar(oper_node)
        if oper_str == key:
            yield call_node

def getArgs(count, call_node):
    assert call_node.type == 'call'
    res = []
    cnt = count
    for chld in call_node.getChild("arguments").children:
        if chld.type in ('(', ')', ','):
            continue
        else:
            res.append(chld)
    return res


def replaceNode(old_node, new_node):
    old_node.parent.replaceChild(old_node, new_node)
    # carry over comments, at least from the head symbol
    new_node.toListG().next().comments = old_node.toListG().next().comments
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
# Patch a single call.
def patch_call(node, key, args_num, repl_tmpl):
    modified = False
    for call_node in findCallNodes(node, key):
        args = getArgs(args_num, call_node)
        if len(args) != args_num:
            continue  # some replacements depend on the number of args, see qx.lang.Array.toArray
        args_str = {}
        for pos,arg in enumerate(args):
            args_str[str(pos+1)] = arg.toJS(defaultOptions)
        repl_str = repl_tmpl % args_str
        repl_node = treegenerator_3.parse(repl_str, expr=True)
        #repl_node = repl_node.children[0].children[0] # get rid of "statements/statement" wrapping
        replaceNode(call_node, repl_node)
        modified = True
    return modified

##
# Go through repl_table
def patch_calls(fileId, node):
    modified = False
    for entry in repl_table:
        modified = (patch_call(node, entry[0], entry[1], entry[2]) 
            or modified)
    return modified

##
# Interface function
def patch(fileId, parseTree):
    modified = False
    modified = patch_calls(fileId, parseTree)
    return modified
