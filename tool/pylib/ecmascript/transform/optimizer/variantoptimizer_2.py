#!/usr/bin/env python
# -*- coding: utf-8 -*-
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

import re, sys, operator as operators, types
from ecmascript.frontend.treeutil_2 import *
from ecmascript.frontend          import treeutil_2 as treeutil
from misc                         import json

global verbose

def makeLogMessage(level, msg, node=None):
    global fileId
    str = "%s: %s" % (level, msg);
    if node != None:
        if fileId != "":
            str += " (%s:%s)" % (fileId, node.get("line", False))
        else:
            str += " (Line %s)" % node.get("line", False)
    return str

def log(level, msg, node=None):
    global verbose
    str = makeLogMessage(level, msg, node)
    if verbose:
        print >> sys.stderr, "      - " + str
    else:
        if level != "Information":
            print >> sys.stderr
            print >> sys.stderr, str


def search(node, variantMap, fileId_="", verb=False):
    if not variantMap:
        return False
    
    global verbose
    global fileId
    verbose = verb
    fileId = fileId_
    modified = False

    variantNodes = findVariantNodes(node)
    for variantNode in variantNodes:
        variantMethod = selectNode(variantNode, "identifier[4]/@name")
        if variantMethod in ["select"]:
            #modified = processVariantSelect(selectNode(variantNode, "../.."), variantMap) or modified
            modified = processVariantSelect(selectCallNode(variantNode), variantMap) or modified
        elif variantMethod in ["get"]:
            #modified = processVariantGet(selectNode(variantNode, "../.."), variantMap) or modified
            modified = processVariantGet(selectCallNode(variantNode), variantMap) or modified
        elif variantMethod in ["filter"]:
            modified = processVariantFilter(selectCallNode(variantNode), variantMap) or modified

    return modified



def selectCallNode(variableNode):
    # the call node is usually two levels up from the variable node that holds
    # the function name ("call/operator/variable")
    callNode = selectNode(variableNode, "../..")
    # also remove unnecessary grouping around the call node
    #while callNode.parent and callNode.parent.type == "group" and len(callNode.parent.children)==1:
    #    callNode = callNode.parent
    return callNode

##
# Processes qx.core.Environment.select blocks
# Destructive! re-writes the AST tree passed in <callNode> by replacing choices with
# the suitable branch.
#
# Mirror line:
# <callNode>:
# qx.core.Environment.select("qx.debug", { "on" : function(){return true;},
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
        log("Warning", "Expecting exactly two arguments for qx.core.Environment.select. Ignoring this occurrence.", params)
        return False

    # Get the variant key from the select() call
    firstParam = params.getChildByPosition(0)
    if not isStringLiteral(firstParam):
        # warning is currently covered in parsing code
        #log("Warning", "First argument must be a string literal constant! Ignoring this occurrence.", firstParam)
        return False

    variantKey = firstParam.get("value");
    # is this key covered by the current variant map?
    if variantKey in variantMap:
        variantValue = variantMap[variantKey]
    else:
        return False

    # Get the resolution map, keyed by possible variant key values (or value expressions)
    secondParam = params.getChildByPosition(1)
    default = None
    found = False
    if secondParam.type == "map":
        # map keys are always JS strings -> simulate a JS .toString() conversion
        if isinstance(variantValue, types.BooleanType):
            # this has to come first, as isinstance(True, types.IntType) is also true!
            variantValue = str(variantValue).lower()
        elif isinstance(variantValue, (types.IntType, types.FloatType)):
            variantValue = str(variantValue)
        elif variantValue == None:
            variantValue = "null"

        for node in secondParam.children:
            if node.type != "keyvalue":
                continue

            mapkey   = node.get("key")
            mapvalue = node.getChild("value").getFirstChild()
            keys = mapkey.split("|")

            # Go through individual key constants
            for key in keys:
                if (key == variantValue):
                    callNode.parent.replaceChild(callNode, mapvalue)
                    found = True
                    break
                if key == "default":
                    default = mapvalue
                    
        if not found:
            if default != None:
                callNode.parent.replaceChild(callNode, default)
            else:
                raise RuntimeError(makeLogMessage("Error", "Variantoptimizer: No matching case found for variant (%s:%s) at" % (variantKey, variantValue), callNode))
        return True

    log("Warning", "The second parameter of qx.core.Environment.select must be a map or a string literal. Ignoring this occurrence.", secondParam)
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
        # warning is currently covered in parsing code
        #log("Warning", "First argument must be a string literal! Ignoring this occurrence.", firstParam)
        return treeModified

    # skipping "relative" calls like "a.b.qx.core.Environment.get()"
    # - disabling this warning for the time being (old ast, bug#5453)
    #qxIdentifier = treeutil.selectNode(callNode, "operand/variable/identifier[1]")
    #if not treeutil.checkFirstChainChild(qxIdentifier):
    #    log("Warning", "Skipping relative qx.core.Environment.get call. Ignoring this occurrence ('%s')." % treeutil.findChainRoot(qxIdentifier).toJavascript())
    #    return treeModified

    variantKey = firstParam.get("value");
    if variantKey in variantMap:
        confValue = variantMap[variantKey]
    else:
        return treeModified

    # Replace the .get() with its value
    resultNode = reduceCall(callNode, confValue)
    treeModified = True

    # Reduce any potential operations with literals (+3, =='hugo', ?a:b, ...)
    treeMod = True
    while treeMod:
        resultNode, treeMod = reduceOperation(resultNode)

    # Reduce a potential condition
    _ = reduceLoop(resultNode)

    return treeModified


##
# 
def isDirectDescendant(child, ancestor):
    result = False
    p = nextNongroupParent(child, ancestor)
    if p == ancestor:
        result = True
    return result

def isComparisonOperand(callNode, conditionNode, capture):
    result = None
    capture[0] = None
    callParent = nextNongroupParent(callNode, conditionNode)
    if callParent.parent.type == "operation":   # e.g. callParent is operation/first
        operNode = callParent.parent
        operParent = nextNongroupParent(operNode, conditionNode)
        if operParent == conditionNode:
            result = operNode
            capture[0] = operNode
    return result

def nextNongroupParent(node, stopnode=None):
    result = stopnode
    n = node.parent
    while n and n != stopnode:
        if n.type != "group":
            result = n
            break
        else:
            n = n.parent
    return result


def getOtherOperand(opNode, oneOperand):
    operands = opNode.getChildren(True)
    if operands[0] == oneOperand.parent: # switch between "first" and "second"
        otherOperand = operands[1].getFirstChild(ignoreComments=True)
        otherPosition   = 1
    else:
        otherOperand = operands[0].getFirstChild(ignoreComments=True)
        otherPosition   = 0
    return otherOperand, otherPosition

##
# As we are potentially optimizing this expression, we can strip non-essential
# things like comments, spurious groups etc., on a copy
def normalizeExpression(node):
    simplified = node.clone()
    simplified.children = [] # fresh children
    simplified.parent = None # reset parent
    for child in node.children:
        if child.type in ["comment", "commentsBefore", "commentsAfter"]:
            continue
        child = normalizeExpression(child)
        child.parent = simplified
        simplified.children.append(child)
    if simplified.type == "group" and len(simplified.children) == 1:
        simplified = simplified.children[0]
    return simplified


def constNodeToPyValue(node):
    if node.type != "constant":
        raise ValueError("Can only intern a constant node's value")
    constvalue = node.get("value")
    consttype = node.get("constantType")
    if consttype == "number":
        constdetail = node.get("detail")
        if constdetail == "int":
            value = int(constvalue)
        elif constdetail == "float":
            value = float(constvalue)
    elif consttype == "string":
        value = constvalue
    elif consttype == "boolean":
        value = {"true":True, "false":False}[constvalue]
    elif consttype == "null":
        value = None

    return value
 


def __variantMatchKey(key, variantValue):
    for keyPart in key.split("|"):
        if variantValue == keyPart:
            return True
    return False


##
# some preps for better processing
#

##
# 1. pass:
# replace qx.c.Env.get(key) with its value, qx.core.Environment.get("foo") => 3
# handles parent relation
def reduceCall(callNode, value):
    # construct the value node
    valueNode = tree.Node("constant")
    valueNode.set("value", str(value))
    valueNode.set("line", callNode.get("line"))
    if isinstance(value, types.StringTypes):
        valueNode.set("constantType","string")
        valueNode.set("detail", "doublequotes")
    # this has to come first, as isinstance(True, types.IntType) is also true!
    elif isinstance(value, types.BooleanType):
        valueNode.set("constantType","boolean")
        valueNode.set("value", str(value).lower())
    elif isinstance(value, types.IntType):
        valueNode.set("constantType","number")
        valueNode.set("detail", "int")
    elif isinstance(value, types.FloatType):
        valueNode.set("constantType","number")
        valueNode.set("detail", "float")
    elif isinstance(value, types.NoneType):
        valueNode.set("constantType","null")
        valueNode.set("value", "null")
    else:
        raise ValueError("Illegal value for JS constant: %s" % str(value))
    # put it in place of the callNode
    #print "optimizing: .get()"
    callNode.parent.replaceChild(callNode, valueNode)
    return valueNode


##
# 2. pass:
# replace operations between literals, e.g. compares ("3 == 3" => true),
# arithmetic ("3+4" => "7"), logical ("true && false" => false)
def reduceOperation(literalNode): 

    resultNode = None
    treeModified = False

    # can only reduce with constants
    if literalNode.type != "constant":
        return literalNode, False
    else:
        literalValue = constNodeToPyValue(literalNode)

    # check if we're in an operation
    ngParent = nextNongroupParent(literalNode) # could be "first", "second" etc. in ops
    if not ngParent or not ngParent.parent or ngParent.parent.type != "operation":
        return literalNode, False
    else:
        operationNode = ngParent.parent
    # get operator
    operator = operationNode.get("operator")

    # normalize expression
    noperationNode = normalizeExpression(operationNode)
    # re-gain knownn literal node
    for node in treeutil.nodeIterator(noperationNode, [literalNode.type]):
        if literalNode.attributes == node.attributes:
            nliteralNode = node
            break

    # equal, unequal
    if operator in ["EQ", "SHEQ", "NE", "SHNE"]:
        otherOperand, _ = getOtherOperand(noperationNode, nliteralNode)
        if otherOperand.type != "constant":
            return literalNode, False
        if operator in ["EQ", "SHEQ"]:
            cmpFcn = operators.eq
        elif operator in ["NE", "SHNE"]:
            cmpFcn = operators.ne

        operands = [literalValue]
        otherVal = constNodeToPyValue(otherOperand)
        operands.append(otherVal)
         
        result = cmpFcn(operands[0],operands[1])
        resultNode = tree.Node("constant")
        resultNode.set("constantType","boolean")
        resultNode.set("value", str(result).lower())
        resultNode.set("line", noperationNode.get("line"))

    # order compares <, =<, ...
    elif operator in ["LT", "LE", "GT", "GE"]:
        otherOperand, otherPosition = getOtherOperand(noperationNode, nliteralNode)
        if otherOperand.type != "constant":
            return literalNode, False
        if operator == "LT":
            cmpFcn = operators.lt
        elif operator == "LE":
            cmpFcn = operators.le
        elif operator == "GT":
            cmpFcn = operators.gt
        elif operator == "GE":
            cmpFcn = operators.ge

        operands = {}
        operands[1 - otherPosition] = literalValue
        otherVal = constNodeToPyValue(otherOperand)
        operands[otherPosition] = otherVal

        result = cmpFcn(operands[0], operands[1])
        resultNode = tree.Node("constant")
        resultNode.set("constantType","boolean")
        resultNode.set("value", str(result).lower())
        resultNode.set("line", noperationNode.get("line"))

    # logical ! (not)
    elif operator in ["NOT"]:
        result = not literalValue
        resultNode = tree.Node("constant")
        resultNode.set("constantType","boolean")
        resultNode.set("value", str(result).lower())
        resultNode.set("line", noperationNode.get("line"))

    # logical operators &&, || -- Currently disabled, s. bug#4856
    elif False and operator in ["AND", "OR"]:
        result = None
        otherOperand, otherPosition = getOtherOperand(noperationNode, nliteralNode)
        if operator == "AND":
            #if otherPosition==1 and not literalValue:  # short circuit
            #    result = False
            #else:
            cmpFcn = (lambda x,y: x and y)
        elif operator == "OR":
            #if otherPosition==1 and literalValue:  # short circuit
            #    result = True
            #else:
            cmpFcn = (lambda x,y: x or y)

        if result == None:
            if otherOperand.type != "constant":
                return literalNode, False
            operands = {}
            operands[1 - otherPosition] = literalValue
            otherVal = constNodeToPyValue(otherOperand)
            operands[otherPosition] = otherVal
            result = cmpFcn(operands[0], operands[1])
            resultNode = {literalValue:literalNode, otherVal:otherOperand}[result]

    # hook ?: operator
    elif operator in ["HOOK"]:
        if ngParent.type == "first": # optimize a literal condition
            if bool(literalValue):
                resultNode = treeutil.selectNode(noperationNode, "second/1", True)
            else:
                resultNode = treeutil.selectNode(noperationNode, "third/1", True)

    # unsupported operation
    else:
        pass

    if resultNode != None:
        #print "optimizing: operation"
        operationNode.parent.replaceChild(operationNode, resultNode)
        treeModified = True
    else:
        resultNode = literalNode
        treeModified = False

    return resultNode, treeModified


##
# 3. pass:
# now reduce all 'if's with constant conditions "if (true)..." => <then>-branch
def reduceLoop(startNode):
    treeModified = False
    conditionNode = None
    loopType = None

    # Can only reduce constant condition expression
    if startNode.type != "constant":
        return treeModified

    # Can only reduce a condition expression,
    # i.e. a "loop/expression/..." context
    node = startNode
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
        # startNode must be only condition
        if isDirectDescendant(startNode, conditionNode):
            value = startNode.get("value")
            if startNode.get("constantType") == 'string':
                value = '"' + value + '"'
            # re-parse into an internal value
            value = json.loads(value)
            condValue = bool(value)
            #print "optimizing: if"
            treeutil.inlineIfStatement(loopNode, condValue)
            treeModified = True

    return treeModified


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
        log("Warning", "Expecting exactly two arguments for qx.core.Environment.select. Ignoring this occurrence.", params)
        return result

    # Get the variant key from the select() call
    firstParam = params.getChildByPosition(0)
    if not isStringLiteral(firstParam):
        # warning is currently covered in parsing code
        #log("Warning", "First argument must be a string literal constant! Ignoring this occurrence.", firstParam)
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


def processVariantFilter(callNode, variantMap):

    def isExcluded(mapkey, variantMap):
        return mapkey in variantMap and bool(variantMap[mapkey]) == False

    changed = False
    if callNode.type != "call":
        return changed

    params = callNode.getChild("params")
    if len(params.children) != 1:
        log("Warning", "Expecting exactly one argument for qx.core.Environment.filter. Ignoring this occurrence.", params)
        return changed

    # Get the map from the find call
    firstParam = params.getChildByPosition(0)
    if not firstParam.type == "map":
        log("Warning", "First argument must be a map! Ignoring this occurrence.", firstParam)
        return changed
    filterMap = firstParam

    for keyvalue in filterMap.getChildren(True):
        mapkey = keyvalue.get("key")
        if isExcluded(mapkey, variantMap):
            filterMap.removeChild(keyvalue)
            changed = True
        else:
            continue

    return changed


##
# Returns the filter map from calls to qx.core.Environment.filter().
# Returns e.g.
#  {
#    "module.property" : <ecmascript.frontend.tree.Node>, # e.g. qx.core.MProperty
#    "module.logging"  : <ecmascript.frontend.tree.Node>  # e.g. qx.core.MLogging
#  }
#
def getFilterMap(callNode, fileId_):
    global fileId, verbose
    verbose = True
    fileId = fileId_

    result = {}
    if callNode.type != "call":
        return result

    operand = callNode.getChild("operand")
    if operand:
        operand_string, isComplete = treeutil.assembleVariable(operand.getChildByPosition(0))
    if not operand or not isComplete or operand_string != "qx.core.Environment.filter":
        log("Warning", "Can only work on qx.core.Environment.filter call. Ignoring this occurrence.", operand)
        return result

    params = callNode.getChild("params")
    if len(params.children) != 1:
        log("Warning", "Expecting exactly one argument for qx.core.Environment.filter. Ignoring this occurrence.", params)
        return result

    # Get the map from the find call
    firstParam = params.getChildByPosition(0)
    if not firstParam.type == "map":
        log("Warning", "First argument must be a map! Ignoring this occurrence.", firstParam)
        return result
    result = treeutil.mapNodeToMap(firstParam)

    return result



##
# Selector generator that yields all nodes in tree <node> where variant-specific
# code is executed.
#
# @return {Iter<Node>} node generator
#
InterestingEnvMethods = ["select", "selectAsync", "get", "getAsync", "filter"]
def findVariantNodes(node):
    variantNodes = treeutil.findVariablePrefix(node, "qx.core.Environment")
    for variantNode in variantNodes:
        if not variantNode.hasParentContext("call/operand"):
            continue
        variantMethod = treeutil.selectNode(variantNode, "identifier[4]/@name")
        if variantMethod in InterestingEnvMethods:
            yield variantNode
        else:
            continue

def isEnvironmentCall(callNode):
    if callNode.type != "call":
        return False
    operandNode = treeutil.selectNode(callNode, "operand")
    environNodes = treeutil.findVariablePrefix(operandNode, "qx.core.Environment")
    if len(environNodes) != 1:
        return False
    environMethod = treeutil.selectNode(environNodes[0], "identifier[4]/@name")
    if environMethod in InterestingEnvMethods:
        return True
    return False
