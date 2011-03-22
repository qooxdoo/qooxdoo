#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
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

import re, sys, operator
from ecmascript.frontend.treeutil import *
from ecmascript.frontend          import treeutil

global verbose

def makeLogMessage(level, msg, node=None):
    global file
    str = "%s: %s" % (level, msg);
    if node != None:
        if file != "":
            str += " (%s:%s)" % (file, node.get("line", False))
        else:
            str += " (Line %s)" % node.get("line", False)
    return str

def log(level, msg, node=None):
    global verbose
    str = makeLogMessage(level, msg, node)
    if verbose:
        print "      - " + str
    else:
        if level != "Information":
            print
            print str


def search(node, variantMap, fileId="", verb=False):
    if variantMap == None:
        return False
    
    global verbose
    global file
    verbose = verb
    file = fileId
    variants = findVariantNodes(node)
    modified = False
    for variant in variants:
        variantMethod = selectNode(variant, "identifier[4]/@name")
        if variantMethod in ["select", "selectAsync"]:
            modified = processVariantSelect(selectNode(variant, "../.."), variantMap) or modified
        elif variantMethod == "isSet":
            modified = processVariantIsSet(selectNode(variant, "../.."), variantMap) or modified
        elif variantMethod == "compilerIsSet":
            modified = processVariantIsSet(selectNode(variant, "../.."), variantMap) or modified
        elif variantMethod == "get":
            modified = processVariantGet(selectNode(variant, "../.."), variantMap) or modified
            pass

    return modified


##
# Processes qx.core.[Environment|Variant].select blocks
# Destructive! re-writes the AST tree passed in <callNode> by replacing choices with
# the suitable branch.
#
# Mirror line:
# <callNode>:
# qx.core.[Environment|Variant].select("qx.debug", { "on" : function(){return true;},
#                                      "off": function(){return false;}})
# <variantMap>:
# {
#   "qx.debug" : "on"
# }

def processVariantSelect(callNode, variantMap):
    if callNode.type != "call":
        return False
        
    params = callNode.getChild("params")
    if len(params.children) != 2:
        log("Warning", "Expecting exactly two arguments for qx.core.[Environment|Variant].select. Ignoring this occurrence.", params)
        return False

    # Get the variant key from the select() call
    firstParam = params.getChildByPosition(0)
    if not isStringLiteral(firstParam):
        log("Warning", "First argument must be a string literal constant! Ignoring this occurrence.", firstParam)
        return False

    variantKey = firstParam.get("value");
    # is this key covered by the current variant map?
    if not variantKey in variantMap.keys():
        return False

    # Get the resolution map, keyed by possible variant key values (or value expressions)
    secondParam = params.getChildByPosition(1)
    default = None
    found = False
    variantValue = variantMap[variantKey]
    if secondParam.type == "map":
        # map keys are always JS strings -> simulate a JS .toString() conversion
        if isinstance(variantValue, (types.IntType, types.FloatType)):
            variantValue = str(variantValue)
        elif isinstance(variantValue, types.BooleanType):
            variantValue = str(variantValue).lower()
        elif variantValue == None:
            variantValue = "null"

        for node in secondParam.children:
            if node.type != "keyvalue":
                continue

            fullKey = node.get("key")
            value = node.getChild("value").getFirstChild()
            keys = fullKey.split("|")

            # Go through individual value constants
            for key in keys:
                if key == variantValue:
                    callNode.parent.replaceChild(callNode, value)
                    found = True
                    break
                if key == "default":
                    default = value
                    
        if not found:
            if default != None:
                callNode.parent.replaceChild(callNode, default)
            else:
                raise RuntimeError(makeLogMessage("Error", "Variantoptimizer: No matching case found for variant (%s:%s) at" % (variantKey, variantValue), callNode))
        return True

    log("Warning", "The second parameter of qx.core.[Environment|Variant].select must be a map or a string literal. Ignoring this occurrence.", secondParam)
    return False


##
# processes qx.core.Variant.isSet() calls;
# destructive! re-writes the AST tree passed in [callNode] by replacing choices with
# the suitable branch
#
def processVariantIsSet(callNode, variantMap):
    if callNode.type != "call":
        return False
        
    params = callNode.getChild("params")
    if len(params.children) != 2:
        log("Warning", "Expecting exactly two arguments for qx.core.Variant.isSet. Ignoring this occurrence.", params)
        return False

    firstParam = params.getChildByPosition(0)
    if not isStringLiteral(firstParam):
        log("Warning", "First argument must be a string literal! Ignoring this occurrence.", firstParam)
        return False

    variantKey = firstParam.get("value");
    if not variantKey in variantMap.keys():
        return False

    secondParam = params.getChildByPosition(1)

    if isStringLiteral(secondParam):
        ifcondition =  secondParam.parent.parent.parent

        # normal if then else
        if ifcondition.type == "expression" and ifcondition.getChildrenLength(True) == 1 and ifcondition.parent.type == "loop":
            loop = ifcondition.parent
            variantValue = secondParam.get("value")
            inlineIfStatement(loop, __variantMatchKey(variantValue, variantMap, variantKey))

        # ternery operator  .. ? .. : ..
        elif (
            ifcondition.type == "first" and
            ifcondition.getChildrenLength(True) == 1 and
            ifcondition.parent.type == "operation" and
            ifcondition.parent.get("operator") == "HOOK"
        ):
            variantValue = secondParam.get("value")
            if __variantMatchKey(variantValue, variantMap, variantKey):
                repleacement = selectNode(ifcondition, "../second")
            else:
                repleacement = selectNode(ifcondition, "../third")
            replaceChildWithNodes(ifcondition.parent.parent, ifcondition.parent, repleacement.children)

        else:
            variantValue = secondParam.get("value")
            constantNode = tree.Node("constant")
            constantNode.set("value", str(__variantMatchKey(variantValue, variantMap, variantKey)).lower())
            constantNode.set("constantType", "boolean")
            constantNode.set("line", callNode.get("line"))
            callNode.parent.replaceChild(callNode, constantNode)
            #log("Warning", "Only processing qx.core.Variant.isSet directly inside of an if condition. Ignoring this occurrence.", secondParam)

        return True

    log("Warning", "The second parameter of qx.core.Variant.isSet must be a string literal. Ignoring this occurrence.", secondParam)
    return False



##
# Process calls to qx.core.Environment.get().
# Remove dead branches of 'if' etc. constructs, if conditions can be decided.
# Currently, optimizes if 
# - the qx.core.Environment.get() call is the only condition
# - the call is part of a simple compare with literals
#   (e.g."qx.core.Environment.get("foo") == 3").
#
def processVariantGet(callNode, variantMap):

    treeModified = False

    # Simple sanity checks
    params = callNode.getChild("params")
    if len(params.children) != 1:
        log("Warning", "Expecting exactly one argument for qx.core.Environment.get. Ignoring this occurrence.", params)
        return treeModified

    firstParam = params.getChildByPosition(0)
    if not isStringLiteral(firstParam):
        log("Warning", "First argument must be a string literal! Ignoring this occurrence.", firstParam)
        return treeModified

    variantKey = firstParam.get("value");
    if not variantKey in variantMap.keys():
        return treeModified
    else:
        variantValue = variantMap[variantKey]

    # Processing
    # are we in a if/loop condition expression, i.e. a "loop/expression/..." context?
    conditionNode = None
    loopType = None
    node = callNode
    while (node):
        if node.type == "expression" and node.parent and node.parent.type == "loop":
            conditionNode = node
            break
        node = node.parent

    if not conditionNode:
        return treeModified

    # handle "if" statements
    if conditionNode.parent.get("loopType") == "IF":
        loopNode = conditionNode.parent
        # get() call is only condition
        if callNode.parent == conditionNode:
            treeutil.inlineIfStatement(loopNode, bool(variantValue)) # take the truth val of the key value
            treeModified = True
        # a single comparison is the condition
        elif (callNode.parent.parent.type == "operation"
              and callNode.parent.parent.parent == conditionNode):
            cmpNode = callNode.parent.parent
            # check operator
            cmpOp  = cmpNode.get("operator")
            if cmpOp in ["EQ", "SHEQ"]:
                cmpFcn = operator.eq
            elif cmpOp in ["NE", "SHNE"]:
                cmpFcn = operator.ne
            else: # unsupported compare
                cmpFcn = None
            if cmpFcn:
                # get other compare operand
                cmpOperands = cmpNode.getChildren(True)
                if cmpOperands[0] == callNode.parent: # switch between "first" and "second"
                    otherValue = cmpOperands[1].getFirstChild(ignoreComments=True)
                else:
                    otherValue = cmpOperands[0].getFirstChild(ignoreComments=True)
                if otherValue.type == "constant":
                    constType = otherValue.get("constantType")
                    if constType == "number":
                        op1 = variantValue
                        op2 = int(otherValue.get("value"))
                    elif constType == "string":
                        op1 = variantValue
                        op2 = otherValue.get("value")
                    elif constType == "boolean":
                        op1 = variantValue
                        op2 = {"true":True, "false":False}[otherValue.get("value")]
                    elif constType == "null":
                        op1 = variantValue
                        op2 = None
                    # compare result
                    if constType in ("number", "string", "boolean"):
                        treeutil.inlineIfStatement(loopNode, cmpFcn(op1,op2))
                        treeModified = True

    return treeModified



def __variantMatchKey(key, variantMap, variantKey):
    for keyPart in key.split("|"):
        if variantMap[variantKey] == keyPart:
            return True
    return False


##
# Returns e.g.
#   ( "qx.debug", 
#     {
#       "on"  : <ecmascript.frontend.tree.Node>, 
#       "off" : <ecmascript.frontend.tree.Node>
#     }
#   )
def getSelectParams(callNode):
    result = (None, None)
    if callNode.type != "call":
        return result
        
    params = callNode.getChild("params")
    if len(params.children) != 2:
        log("Warning", "Expecting exactly two arguments for qx.core.[Environment|Variant].select. Ignoring this occurrence.", params)
        return result

    # Get the variant key from the select() call
    firstParam = params.getChildByPosition(0)
    if not isStringLiteral(firstParam):
        log("Warning", "First argument must be a string literal constant! Ignoring this occurrence.", firstParam)
        return result
    variantKey = firstParam.get("value");

    # Get the resolution map, keyed by possible variant key values (or value expressions)
    secondParam = params.getChildByPosition(1)
    branchMap   = {}
    if secondParam.type == "map":
        for node in secondParam.children:
            if node.type != "keyvalue":
                continue
            branchKey = node.get("key")
            value     = node.getChild("value").getFirstChild()
            branchMap[branchKey] = value

    return variantKey, branchMap


##
# Selector generator that yields all nodes in tree <node> where variant-specific
# code is executed.
#
# @return {Iter<Node>} node generator
#
def findVariantNodes(node):
    callNodes = set([])
    variantNodes = treeutil.findVariablePrefix(node, "qx.core.Variant")
    variantNodes.extend(treeutil.findVariablePrefix(node, "qx.core.Environment"))
    for variantNode in variantNodes:
        if not variantNode.hasParentContext("call/operand"):
            continue
        variantMethod = treeutil.selectNode(variantNode, "identifier[4]/@name")
        if variantMethod not in ["select", "selectAsync", "isSet", "compilerIsSet", "get"]:
            continue
        else:
            yield variantNode

