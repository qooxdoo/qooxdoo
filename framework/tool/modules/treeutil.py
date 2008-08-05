#!/usr/bin/env python
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
#
################################################################################

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  module.py -- module short description
#
# SYNTAX
#  module.py --help
#
#  or
#
#  import module
#  result = module.func()
#
# DESCRIPTION
#  The module module does blah.
#
# CAVEATS
#
# KNOWN ISSUES
#  There are no known issues.
#</pre>
##

"""
This module contains a collection of helper functions to work with the
JavaScript syntax tree.
"""

import re
import tree
import tokenizer
import treegenerator


##
# Some nice short description of foo(); this can contain html and
# {@link #foo Links} to items in the current file.
#
# @param     a        Describe a positional parameter
# @keyparam  b        Describe a keyword parameter
# @def       foo(name)    # overwrites auto-generated function signature
# @param     name     Describe aliased parameter
# @return             Description of the things returned
# @defreturn          The return type
# @exception IOError  The error it throws
#
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
                        else:
                            continue

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


def getDefinitions(node, definitions=None):
  if definitions == None:
    definitions = []

  if node.type == "definition":
    definitions.append(node)

  if node.hasChildren():
    for child in node.children:
      if child.type != "function":
        definitions = getDefinitions(child, definitions)

  return definitions


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
    if mapNode.hasChildren():
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
            reovedDefinitions = getDefinitions(ifNode.getChild("elseStatement"))
            newDefinitions = getDefinitions(ifNode.getChild("statement"))
            replacement = ifNode.getChild("statement").children
        else:
            reovedDefinitions = getDefinitions(ifNode.getChild("statement"))
            newDefinitions = getDefinitions(ifNode.getChild("elseStatement"))
            replacement = ifNode.getChild("elseStatement").children
    else:
        if conditionValue:
            newDefinitions = getDefinitions(ifNode.getChild("statement"))
            replacement = ifNode.getChild("statement").children
        else:
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
    Return the full variable name from a variable node, and an isComplete flag if the name could
    be assembled completely.
    """
    if variableItem.type != "variable":
        raise tree.NodeAccessException("'variableItem' is no variable node", variableItem)

    assembled = ""
    for child in variableItem.children:
        if child.type == "commentsBefore":
            continue
        elif child.type != "identifier":
            # this means there is some accessor like part in the variable
            # e.g. foo["hello"]
            return assembled, False

        if len(assembled) != 0:
            assembled += "."

        assembled += child.get("name")

    return assembled, True


def compileString(jsString, uniqueId=""):
    """
    Compile a string containing a JavaScript fragment into a syntax tree.
    """
    return treegenerator.createSyntaxTree(tokenizer.parseStream(jsString, uniqueId)).getFirstChild()


def variableOrArrayNodeToArray(node):
    """
    Normalizes a variable node or an array node containing variables
    to a python array of the variable names
    """

    arr = []
    if node.type == "array":
        for child in node.children:
            if child.type == "variable":
                arr.append((assembleVariable(child))[0])
    elif node.type == "variable":
        arr.append((assembleVariable(node))[0])
    else:
        raise tree.NodeAccessException("'node' is no variable or array node", node)
    return arr


def getLineAndColumnFromSyntaxItem(syntaxItem):
    """
    Returns a tupel of the line and the column of a tree node.
    """
    line = None
    column = None

    while line == None and column == None and syntaxItem:
        line = syntaxItem.get("line", False)
        column = syntaxItem.get("column", False)

        if syntaxItem.hasParent():
            syntaxItem = syntaxItem.parent
        else:
            syntaxItem = None

    return line, column


def getFileFromSyntaxItem(syntaxItem):
    """
    Returns the file name of a tree node
    """
    file = None
    while file == None and syntaxItem:
        file = syntaxItem.get("file", False)
        if hasattr(syntaxItem, "parent"):
            syntaxItem = syntaxItem.parent
        else:
            syntaxItem = None
    return file


def createPair(key, value, commentParent=None):
    par = tree.Node("keyvalue")
    sub = tree.Node("value")

    par.set("key", key)
    par.addChild(sub)
    sub.addChild(value)

    if commentParent and commentParent.hasChild("commentsBefore"):
        par.addChild(commentParent.getChild("commentsBefore"))

    return par


def createConstant(type, value):
    constant = tree.Node("constant")
    constant.set("constantType", type)
    constant.set("value", value)

    if type == "string":
        constant.set("detail", "doublequotes")

    return constant


def createVariable(l):
    var = tree.Node("variable")

    for name in l:
        iden = tree.Node("identifier")
        iden.set("name", name)
        var.addChild(iden)

    return var


def createBlockComment(txt):
    l = "*****************************************************************************"

    s = ""
    s += "/*\n"
    s += "%s\n" % l
    s += "   %s\n" % txt.upper()
    s += "%s\n" % l
    s += "*/"

    bef = tree.Node("commentsBefore")
    com = tree.Node("comment")

    bef.addChild(com)

    com.set("multiline", True)
    com.set("connection", "before")
    com.set("text", s)
    com.set("detail", comment.getFormat(s))

    return bef
