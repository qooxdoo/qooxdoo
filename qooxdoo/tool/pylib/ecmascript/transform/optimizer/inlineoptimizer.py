#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2009 Sebastian Werner, sebastian-werner.net
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#
################################################################################

##
#
# The idea of this module is to inline the code of functionA into functionB
# to improve performance.
#
# This is highly experimental to date and will be worked on as time allows.
#
##

import copy
from ecmascript.frontend import tree, treeutil


def patch(tree):
    qxnode = treeutil.findQxDefine(tree)
    
    processBlock(treeutil.selectNode(qxnode, "params/map/keyvalue[@key='statics']/value/map"))
    processBlock(treeutil.selectNode(qxnode, "params/map/keyvalue[@key='members']/value/map"))

            
def processBlock(block):
    if not block or not block.hasChildren():
        return
    
    print ">>> Looking for definitions..."
    defs = {}
    collectDefs(block, defs)
    print defs.keys()

    print ">>> Looking for calls..."
    calls = {}
    collectCalls(block, calls)
    print calls.keys()
    
    for name in defs:
        print ">>> Analysing method %s()" % name
        analyseFunction(name, defs)                
            

def analyseFunction(name, defined):
    func = defined[name]
    
    # Looking out for functions each member is calling
    calls = {}
    collectCalls(func, calls)
    
    # Iterate through these functions and try to inline them
    for callName in calls:
        if callName != name and name in defined:
            print "  - Inlining %s() called by %s() (%sx occurrences)" % (callName, name, len(calls[callName]))
            
            for occurrence in calls[callName]:
                inlineFunction(occurrence, defined[name])
            

def inlineFunction(callNode, funcNode):
    params = funcNode.getChild("params")
    body = copy.copy(funcNode.getChild("body"))
    
    # Without params is a lot easier
    if params.hasChildren():
        print "  - TODO: With parameters"            
        
    else:
        print "  - Call without params"

    # TODO: This is the tricky part doing the transformation from normal to inline
        
    replNode = tree.Node("block")
    callNode.parent.replaceChild(callNode, replNode)
        







def collectDefs(node, defs):
    for child in node.getAllChildrenOfType("keyvalue"):
        func = treeutil.selectNode(child, "value/function")
        if func:
            defs[child.get("key")] = func


def collectCalls(node, calls):
    if node.hasChildren():
        for child in node.children:
            collectCalls(child, calls)    
            
    # looking out for classic function calls like
    # this.foo() or obj.hello(). Interesting here are
    # all methods which are called on "this".
    if node.type == "call":
        var = treeutil.selectNode(node, "operand/variable")
        if var:
            name = detectCallName(var)
            if name:
                if name in calls:
                    calls[name].append(node)
                else:
                    calls[name] = [node]
                    
                
def detectCallName(node):
    children = node.children
    
    thisFound = False
    nameFound = False
    
    for child in children:
        if child.type == "identifier":
            if nameFound:
                return False

            iden = child.get("name")
            
            if iden == "this":
                thisFound = True
                
            elif thisFound:
                nameFound = iden
            
        else:
            return False
    
    return nameFound
            