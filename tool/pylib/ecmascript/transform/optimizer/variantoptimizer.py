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
#    * Sebastian Werner (wpbasti)
#    * Fabian Jakobs (fjakobs)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import os, sys, re, types
from ecmascript.frontend                import treeutil
from ecmascript.frontend.treegenerator  import symbol, PackerFlags as pp
from ecmascript.transform.optimizer     import reducer

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


##
# Process calls to qx.core.Environment.get().
#
# Replace qx.core.Environment.get() calls with their value in the tree if
# possible.
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

    return treeModified


##
# Processes calls to qx.core.Environment.select().
#
# Destructive re-writes the AST tree passed in <callNode> by replacing choices
# with the suitable branch.
#
# Mirror line:
# <callNode>:
# qx.core.Environment.select("qx.debug", { "on" : function(){return true;},
#                                          "off": function(){return false;}})
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
# Process calls to qx.core.Environment.filter().
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
# replace qx.c.Env.get(key) with its value, qx.core.Environment.get("foo") => 3
# handles parent relation
def reduceCall(callNode, value):
    # construct the value node
    valueNode = symbol("constant")(
            callNode.get("line"), callNode.get("column"))
    valueNode = reducer.set_node_type_from_value(valueNode, value)
    # put it in place of the callNode
    #print "optimizing: .get()"
    callNode.parent.replaceChild(callNode, valueNode)
    return valueNode


##
# Selector generator that yields all nodes in tree <node> where variant-specific
# code is executed.
#
# @return {Iter<Node>} node generator
#
InterestingEnvMethods = ["select", "selectAsync", "get", "getAsync", "filter"]
InterestingEnvClasses = ["qx.core.Environment", "qxWeb.env"]

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
    elif environParts[0] not in InterestingEnvClasses:
        return False
    elif environParts[1] not in InterestingEnvMethods:
        return False
    else:
        return operand


# -- Interface methods ---------------------------------------------------------

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
# Interface method.
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

    # reduce decidable subtrees
    if modified:
        for cld in node.children[:]:
            new_cld = reducer.ast_reduce(cld)
            node.replaceChild(cld, new_cld)

    return modified

