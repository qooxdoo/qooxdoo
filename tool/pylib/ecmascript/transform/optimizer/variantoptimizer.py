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
from ecmascript.frontend          import treeutil
from ecmascript.frontend.treegenerator  import symbol, PackerFlags as pp
from ecmascript.transform.evaluate  import evaluate
from ecmascript.transform.optimizer import reducer

global verbose

def makeLogMessage(level, msg, node=None):
    global fileId
    str = "%s: %s" % (level, msg);
    if node != None:
        if fileId != "":
            str += " (%s:%s)" % (fileId, node.get("line", -1))
        else:
            str += " (Line %s)" % node.get("line", -1)
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
        variantMethod = variantNode.toJS(pp).rsplit('.',1)[1]
        callNode = treeutil.selectNode(variantNode, "../..")
        if variantMethod in ["select"]:
            modified = processVariantSelect(callNode, variantMap) or modified
        elif variantMethod in ["get"]:
            modified = processVariantGet(callNode, variantMap) or modified
        elif variantMethod in ["filter"]:
            modified = processVariantFilter(callNode, variantMap) or modified

    return modified


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
        
    params = callNode.getChild("arguments")
    if len(params.children) != 2:
        log("Warning", "Expecting exactly two arguments for qx.core.Environment.select. Ignoring this occurrence.", params)
        return False

    # Get the variant key from the select() call
    firstParam = params.getChildByPosition(0)
    if not treeutil.isStringLiteral(firstParam):
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
    params = callNode.getChild("arguments")
    if len(params.children) != 1:
        return treeModified

    firstParam = params.getChildByPosition(0)
    if not treeutil.isStringLiteral(firstParam):
        return treeModified

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

def __variantMatchKey(key, variantValue):
    for keyPart in key.split("|"):
        if variantValue == keyPart:
            return True
    return False


##
# some preps for better processing
#

##
# Take a Python value and init a constant node with it, setting the node's "constantType"
#
def set_node_type_from_value(valueNode, value):
    valueNode.set("value", str(value))  # init value attrib
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
    return valueNode

##
# 1. pass:
# replace qx.c.Env.get(key) with its value, qx.core.Environment.get("foo") => 3
# handles parent relation
def reduceCall(callNode, value):
    # construct the value node
    valueNode = symbol("constant")(
            callNode.get("line"), callNode.get("column"))
    valueNode = set_node_type_from_value(valueNode, value)
    # put it in place of the callNode
    #print "optimizing: .get()"
    callNode.parent.replaceChild(callNode, valueNode)
    return valueNode


##
# 2. pass:
# replace operations between literals, e.g. compares ("3 == 3" => true),
# arithmetic ("3+4" => "7"), logical ("true && false" => false)
def reduceOperation(literalNode): 

    resultNode = literalNode
    treeModified = False

    # can only reduce with constants
    if literalNode.type != "constant":
        return literalNode, False

    # check if we're in an operation
    ngParent = nextNongroupParent(literalNode) # could be operand in ops
    if not ngParent or ngParent.type != "operation":
        return literalNode, False
    else:
        operationNode = ngParent

    # try to evaluate expr
    operationNode = evaluate.evaluate(operationNode)
    if operationNode.evaluated != (): # we have a value
        # create replacement
        resultNode = symbol("constant")(
            operationNode.get("line"), operationNode.get("column"))
        resultNode = set_node_type_from_value(resultNode, operationNode.evaluated)
        # modify tree
        operationNode.parent.replaceChild(operationNode, resultNode)
        treeModified = True

    return resultNode, treeModified


##
# 3. pass:
# now reduce all 'if's with constant conditions "if (true)..." => <then>-branch
def reduceLoop(startNode):
    treeModified = False
    conditionNode = None

    # find the loop's condition node
    node = startNode
    while(node):
        if node.parent and node.parent.type == "loop" and node.parent.getFirstChild(ignoreComments=True)==node:
            conditionNode = node
            break
        node = node.parent
    if not conditionNode:
        return treeModified

    # handle "if" statements
    if conditionNode.parent.get("loopType") == "IF":
        loopNode = conditionNode.parent
        evaluate.evaluate(conditionNode)
        if conditionNode.evaluated!=():
            reducer.reduce(loopNode)
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
        
    params = callNode.getChild("arguments")
    if len(params.children) != 2:
        log("Warning", "Expecting exactly two arguments for qx.core.Environment.select. Ignoring this occurrence.", params)
        return result

    # Get the variant key from the select() call
    firstParam = params.getChildByPosition(0)
    if not treeutil.isStringLiteral(firstParam):
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

    params = callNode.getChild("arguments")
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

    params = callNode.getChild("arguments")
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
    for callnode in list(treeutil.nodeIterator(node, ['call'])): # enforce eagerness so nodes that are moved are still handled
        if isEnvironmentCall(callnode):
            yield treeutil.selectNode(callnode, "operand").getFirstChild()
        else:
            continue

def isEnvironmentCall(callNode):
    if callNode.type != "call":
        return False
    operandNode = treeutil.selectNode(callNode, "operand")
    operand = operandNode.toJS(pp)
    environParts = operand.rsplit('.',1)
    if len(environParts) != 2:
        return False
    elif environParts[0] != "qx.core.Environment":
        return False
    elif environParts[1] not in InterestingEnvMethods:
        return False
    else:
        return operand
