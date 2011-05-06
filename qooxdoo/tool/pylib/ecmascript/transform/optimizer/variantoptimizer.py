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

import re, sys, operator as operators, types
from ecmascript.frontend.treeutil import *
from ecmascript.frontend          import treeutil
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
        print "      - " + str
    else:
        if level != "Information":
            print
            print str


def search(node, variantMap, fileId_="", verb=False):
    if variantMap == None:
        return False
    
    global verbose
    global fileId
    verbose = verb
    fileId = fileId_
    modified = False

    #if fileId_ == "qx.core.Environment":
    #    modified = processEnvironmentClass(node, variantMap)

    variantNodes = findVariantNodes(node)
    for variantNode in variantNodes:
        variantMethod = selectNode(variantNode, "identifier[4]/@name")
        if variantMethod in ["select"]:
            #modified = processVariantSelect(selectNode(variantNode, "../.."), variantMap) or modified
            modified = processVariantSelect(selectCallNode(variantNode), variantMap) or modified
        elif variantMethod == "isSet":
            #modified = processVariantIsSet(selectNode(variantNode, "../.."), variantMap) or modified
            modified = processVariantIsSet(selectCallNode(variantNode), variantMap) or modified
        elif variantMethod == "compilerIsSet":
            #modified = processVariantIsSet(selectNode(variantNode, "../.."), variantMap) or modified
            modified = processVariantIsSet(selectCallNode(variantNode), variantMap) or modified
        elif variantMethod in ["get"]:
            #modified = processVariantGet(selectNode(variantNode, "../.."), variantMap) or modified
            modified = processVariantGet(selectCallNode(variantNode), variantMap) or modified

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
    #variantValue = variantMap[variantKey]
    variantValue, found = __keyLookup(variantKey, variantMap)
    if not found:
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
                if (key == variantValue
                    # @deprecated
                    or (key in ["on","true"] and variantValue in ["on","true",True])
                    # @deprecated
                    or (key in ["off","false"] and variantValue in ["off","false",False])
                    ):
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
    confValue, found  = __keyLookup(variantKey, variantMap)
    #if not variantKey in variantMap.keys():
    if not found:
        return False

    secondParam = params.getChildByPosition(1)

    if isStringLiteral(secondParam):
        ifcondition =  secondParam.parent.parent.parent

        # normal if then else
        if ifcondition.type == "expression" and ifcondition.getChildrenLength(True) == 1 and ifcondition.parent.type == "loop":
            loop = ifcondition.parent
            variantValue = secondParam.get("value")
            inlineIfStatement(loop, __variantMatchKey(variantValue, confValue))

        # ternary operator  ?:
        elif (
            ifcondition.type == "first" and
            ifcondition.getChildrenLength(True) == 1 and
            ifcondition.parent.type == "operation" and
            ifcondition.parent.get("operator") == "HOOK"
        ):
            variantValue = secondParam.get("value")
            if __variantMatchKey(variantValue, confValue):
                replacement = selectNode(ifcondition, "../second")
            else:
                replacement = selectNode(ifcondition, "../third")
            replaceChildWithNodes(ifcondition.parent.parent, ifcondition.parent, replacement.children)

        else:
            variantValue = secondParam.get("value")
            constantNode = tree.Node("constant")
            constantNode.set("value", str(__variantMatchKey(variantValue, confValue)).lower())
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

    # skipping "relative" calls like "a.b.qx.core.Environment.get()"
    qxIdentifier = treeutil.selectNode(callNode, "operand/variable/identifier[1]")
    if not treeutil.checkFirstChainChild(qxIdentifier):
        log("Warning", "Skipping relative qx.core.Environment.get call. Ignoring this occurrence ('%s')." % treeutil.findChainRoot(qxIdentifier).toJavascript())
        return treeModified

    variantKey = firstParam.get("value");
    confValue, found = __keyLookup(variantKey, variantMap)
    if not found:
        return treeModified

    # @deprecated
    # patch "on"/"off"
    confValue = patchValue(confValue)

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
# qx.core.Environment gets special treatment, as it uses a pseudo-method,
# to indicate optimizable code
#
def processEnvironmentClass(node, variantMap):
    
    def myVariantNodes(node):
        variantNodes = treeutil.findVariablePrefix(node, "this.useCheck")
        for variantNode in variantNodes:
            print variantNode.toXml()
            if not variantNode.hasParentContext("call/operand"):
                continue
            else:
                yield variantNode

    treeModified = False

    #TODO: use myVariantNodes()

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
    variantValue, found = __keyLookup(variantKey, variantMap)
    #if not variantKey in variantMap.keys():
    if not found:
        return treeModified
    #else:
    #    variantValue = variantMap[variantKey]

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
            #TODO: variantValue is not interesting, only if variantKey is in variantMap (!?)
            treeutil.inlineIfStatement(loopNode, bool(variantValue)) # take the truth val of the key value
            treeModified = True

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
# @deprecated
def __keyLookup(key, variantMap):
    try:
        return variantMap[key], True
    except KeyError:
        try:
            return variantMap['<env>:'+key], True
        except KeyError:
            return None, False


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


def patchValue(val):
    if isinstance(val, types.StringTypes) and val in ["on","off"]:
        val = {"on":True,"off":False}[val]
    return val


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
        # @deprecated
        literalValue = patchValue(literalValue)

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
        # @deprecated
        otherVal = patchValue(otherVal)
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
        # @deprecated
        otherVal = patchValue(otherVal)
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
            # @deprecated
            otherVal = patchValue(otherVal)
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
            # @deprecated
            if value in ["off", "false"]:
                condValue = False
            else:
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
    variantNodes = treeutil.findVariablePrefix(node, "qx.core.Variant")
    variantNodes.extend(treeutil.findVariablePrefix(node, "qx.core.Environment"))
    for variantNode in variantNodes:
        if not variantNode.hasParentContext("call/operand"):
            continue
        variantMethod = treeutil.selectNode(variantNode, "identifier[4]/@name")
        if variantMethod not in ["select", "isSet", "compilerIsSet", "get"]:
            continue
        else:
            yield variantNode

