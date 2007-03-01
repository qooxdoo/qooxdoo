#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1and1.org
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

"""
This module contains a collection of helper functions to work with the
JavaScript syntax tree.
"""

import re
import tree
import tokenizer
import treegenerator


def selectNode(node, path):
    """
    Selects a node using a XPath like path expresseion.
    This function returns None if no matching node was found.

    Warning: This function usys a depth first search without backtracking!!

    ".."          navigates to the parent node
    "nodeName"    navigates to the first child node of type nodeName
    "nodeName[3]" navigates to the third child node of type nodeName
    "nodeName[@key='members'] navigates to the first child node of type
                              nodeName with the attribute "key" equals "member"
    "4"           navigates to the fourth child node
    "@key"        returns the value of the attribute "key" of the current node.
                  This must be the last statement.

    Example: "../../params/1/keyvalue[@key='defer']/value/function/body/block"

    """
    re_indexedNode = re.compile("^(.*)\[(\d+)\]$")
    re_attributeNode = re.compile("^(.*)\[@(.+)=\'(.*)\'\]$")

    try:
            pathParts = path.split("/")
            for part in pathParts:
                # parent node
                if part == "..":
                    node = node.parent
                else:
                    # only index
                    try:
                        position = int(part)-1
                        node = node.getChildByPosition(position)
                        continue
                    except ValueError:
                        pass

                    # indexed node
                    match = re_indexedNode.match(part)
                    if match:
                        type = match.group(1)
                        index = int(match.group(2))-1
                        i = 0
                        found = False
                        for child in node.children:
                            if child.type == type:
                                if index == i:
                                    node = child
                                    found = True
                                    break
                                i += 1
                        if not found:
                            return None

                    match = re_attributeNode.match(part)
                    if match:
                        type = match.group(1)
                        attribName = match.group(2)
                        attribType = match.group(3)
                        found = False
                        if node.hasChildren():
                            for child in node.children:
                                if child.type == type:
                                    if child.get(attribName) == attribType:
                                        node = child
                                        found = True
                        if not found:
                            return None


                    # attribute
                    elif part[0] == "@":
                        return node.get(part[1:])
                    # normal node
                    else:
                        node = node.getChild(part)

    except tree.NodeAccessException:
            return None

    return node


def findVariablePrefix(node, namePrefix, varNodes=None):
    """
    Search "node" for all variables starting with "namePrefix"
    """
    if varNodes == None:
        varNodes = []

    if node.type == "variable":
        try:
            nameParts = []
            for child in node.children:
                if child.type == "identifier":
                    nameParts.append(child.get("name"))
        except tree.NodeAccessException:
            nameParts = []
        i = 0
        found = True
        prefixParts = namePrefix.split(".")
        if len(prefixParts) <= len (nameParts):
            for prefixPart in prefixParts:
                if prefixPart != nameParts[i]:
                    found = False
                    break
                i += 1
        else:
            found = False
        if found:
            varNodes.append(node)
            return varNodes

    if node.hasChildren():
        for child in node.children:
            varNodes = findVariablePrefix(child, namePrefix, varNodes)

    return varNodes


def findVariable(node, varName, varNodes=None):
    """
    Return a list of all variable definitions inside "node" of name "varName".
    """
    if varNodes == None:
        varNodes = []

    if node.type == "variable":
        try:
            nameParts = []
            for child in node.children:
                if child.type == "identifier":
                    nameParts.append(child.get("name"))
                name = u".".join(nameParts)
        except tree.NodeAccessException:
            name = ""
        if name == varName:
            varNodes.append(node)
            return varNodes

    if node.hasChildren():
        for child in node.children:
            varNodes = findVariable(child, varName, varNodes)

    return varNodes


def mapNodeToMap(mapNode):
    """
    convert a "map" tree node into a python map.
    """
    if mapNode.type != "map":
        raise tree.NodeAccessException("Expected a map node!", mapNode)

    keys = {}
    for child in mapNode.children:
        if child.type == "keyvalue":
            keys[child.get("key")] = child.getChild("value")

    return keys


def inlineIfStatement(ifNode, conditionValue):
    """
    Inline an if statement assuming that the condition of the if
    statement evaluates to "conditionValue" (True/False")
    """

    if ifNode.type != "loop" or ifNode.get("loopType") != "IF":
        raise tree.NodeAccessException("Expected a the LOOP node of an if statement!", mapNode)

    replacement = []
    newDefinitions = []
    reovedDefinitions = []

    if ifNode.getChild("elseStatement", False):
        if conditionValue:
            log("Information", "Remove else case,", ifNode)
            reovedDefinitions = getDefinitions(ifNode.getChild("elseStatement"))
            newDefinitions = getDefinitions(ifNode.getChild("statement"))
            replacement = ifNode.getChild("statement").children
        else:
            log("Information", "Remove if case", ifNode)
            reovedDefinitions = getDefinitions(ifNode.getChild("statement"))
            newDefinitions = getDefinitions(ifNode.getChild("elseStatement"))
            replacement = ifNode.getChild("elseStatement").children
    else:
        if conditionValue:
            log("Information", "Remove else case", ifNode)
            newDefinitions = getDefinitions(ifNode.getChild("statement"))
            replacement = ifNode.getChild("statement").children
        else:
            log("Information", "Remove if case", ifNode)
            reovedDefinitions = getDefinitions(ifNode.getChild("statement"))

    newDefinitions = map(lambda x: x.get("identifier"), newDefinitions)
    definitions = []
    for definition in reovedDefinitions:
        if not definition.get("identifier") in newDefinitions:
            definitions.append(definition)

    if len(definitions) > 0:
        defList = tree.Node("definitionList")
        defList.set("line", ifNode.get("line"))
        for definition in definitions:
            if definition.hasChildren():
                del definition.children
            defList.addChild(definition)
        replacement.append(defList)
        log("Information", "Generating var statements.", ifNode)

    if replacement != []:
        replaceChildWithNodes(ifNode.parent, ifNode, replacement)
    else:
        emptyBlock = tree.Node("block");
        emptyBlock.set("line", ifNode.get("line"))
        ifNode.parent.replaceChild(ifNode, emptyBlock)


def replaceChildWithNodes(node, oldChild, newChildren):
    """
    Replace the child node "oldNode" of the node "node" with a
    list of new children ("newChildren")
    """
    index = getNodeIndex(node, oldChild)
    node.removeChild(oldChild)
    # copy list
    children = newChildren[:]
    for child in children:
        node.addChild(child, index)
        index += 1


def getNodeIndex(parent, node):
    """
    Returns the index of a node.
    TODO: mode to tree?
    """
    return parent.children.index(node)


def isStringLiteral(node):
    """
    Whether a node is a string literal
    """
    return node.type == "constant" and node.get("constantType") == "string"


def assembleVariable(variableItem):
    """
    Return the full variable name from a variable node"
    """
    if variableItem.type != "variable":
        raise tree.NodeAccessException("'variableItem' is no variable node", variableItem)

    assembled = ""
    for child in variableItem.children:
        if len(assembled) != 0:
            assembled += "."
        assembled += child.get("name")

    return assembled


def compileString(jsString):
    """
    Compile a string containing a JavaScript fragment into a syntax tree.
    """
    return treegenerator.createSyntaxTree(tokenizer.parseStream(jsString)).getFirstChild()