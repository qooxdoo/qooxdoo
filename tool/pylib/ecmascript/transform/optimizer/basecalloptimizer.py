#!/usr/bin/env python
# -*- coding: utf-8 -*-
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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import re, sys, types

from ecmascript.frontend import tree, treeutil
from ecmascript.frontend.treegenerator import PackerFlags as pp

##
# Run through all the qx.*.define nodes of a tree. This will cover multiple
# classes defined in single file, as well as nested calls to qx.*.define.
#
# - interface function

def patch(node):
    patchCount    = 0
    classDefNodes = list(treeutil.findQxDefineR(node))

    for classDefNode in classDefNodes:
        patchCount += optimize(classDefNode, classDefNodes)

    return patchCount


##
# Optimize a single class definition; treats 'construct' and 'member' sections

def optimize(classDefine, classDefNodes):
    patchCount    = 0

    # get class map
    try:
        classMap = treeutil.getClassMap(classDefine)
    except tree.NodeAccessException: # this might happen when the second param is not a map literal
        return 0

    if not "extend" in classMap:
        return 0
      
    if classMap["extend"].isVar():
        superClass = treeutil.assembleVariable(classMap["extend"])[0]
    else:
        return 0  # interfaces can have a list-valued "extend", but we currently don't optimize those

    if "construct" in classMap:
        patchCount = optimizeConstruct(classMap["construct"], superClass, "construct", classDefNodes)
      
    if not "members" in classMap:
        return patchCount
    
    members = classMap["members"]
    assert isinstance(members, types.DictType)
    for methodName, methodNode in members.items():
        patchCount += optimizeConstruct(methodNode, superClass, methodName, classDefNodes)

    return patchCount


##
# Optimize calls to this.base in a tree (e.g. a method); this will skip nested
# calls to qx.*.define, as they are handled on a higher level

def optimizeConstruct(node, superClass, methodName, classDefNodes):
    patchCount = 0

    # Need to run through all the nodes, to skip embedded qx.*.define(),
    # which will be treated separately

    # Handle Node

    # skip embedded qx.*.define()
    if node in classDefNodes:
        return 0

    elif node.isVar() and node.hasParentContext("call/operand"):

        varName, complete = treeutil.assembleVariable(node)
        if not (complete and varName == "this.base"):
            return 0

        call = node.parent.parent

        try:
            firstArgName = treeutil.selectNode(call, "params/1/@value")
        except tree.NodeAccessException:
            return 0

        if firstArgName != "arguments":
            return 0

        # "construct"
        if methodName == "construct":
            newCall = treeutil.compileString("%s.call()" % superClass)
        # "member"
        else:
            newCall = treeutil.compileString("%s.prototype.%s.call()" % (superClass, methodName))
        newCall.replaceChild(newCall.getChild("params"), call.getChild("params")) # replace with old arglist
        treeutil.selectNode(newCall, "params/1").set("value", "this")   # arguments -> this
        call.parent.replaceChild(call, newCall)
        patchCount += 1

    # Handle Children
    if node.hasChildren():
        for child in node.children:
            patchCount += optimizeConstruct(child, superClass, methodName, classDefNodes)

    return patchCount


if __name__ == "__main__":
    cls = """qx.Class.define("qx.Car", {
      extend: qx.core.Object,
      construct : function() {
        this.base(arguments, "2")
      },
      members : {
        foo : function() {
          return this.base(arguments)
        }
      }
    })"""
    
    node = treeutil.compileString(cls)
    patch(node)
    
    print node.toJS(pp)
    
    
