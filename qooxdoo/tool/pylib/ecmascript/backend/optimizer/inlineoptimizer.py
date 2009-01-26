#!/usr/bin/env python

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

from ecmascript.frontend import treeutil


def patch(tree):
    qxnode = treeutil.findQxDefine(tree)
    staticsNode = treeutil.selectNode(qxnode, "params/map/keyvalue[@key='statics']/value/map")
    membersNode = treeutil.selectNode(qxnode, "params/map/keyvalue[@key='members']/value/map")
    
    if staticsNode and staticsNode.hasChildren():
        staticCalls = {}
        statics = {}
        


    if membersNode and membersNode.hasChildren():
        memberCalls = {}
        memberDefs = {}
        
        print ">>> Looking for definitions..."
        collectDefs(membersNode, memberDefs)
        print memberDefs.keys()

        print ">>> Looking for calls..."
        collectCalls(membersNode, memberCalls)
        print memberCalls.keys()
        
        for defName in memberDefs:
            print ">>> Analysing method %s()" % defName
            func = memberDefs[defName]
            funcCalls = {}
            collectCalls(func, funcCalls)
            for useName in funcCalls:
                print "  - Calls %s()" % useName
            
                
                
                
            
            
        
        

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
            name = detect(var)
            if name:
                calls[name] = True
                    
    
                
                
def detect(node):
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
            