#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
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
# This module contains a collection of helper functions to work with the
# JavaScript syntax tree.
##

import re
from ecmascript.frontend import tree, tokenizer, treegenerator_2 as treegenerator, Comment_2 as Comment

##
# Finds the next qx.*.define in the given tree

def findQxDefine(rootNode):
    for node in nodeIterator(rootNode, ["variable"]):
        if isQxDefine(node)[0]:
            return node.parent.parent
        
    return None


##
# Finds all the qx.*.define in the given tree

def findQxDefineR(rootNode):
    for node in nodeIterator(rootNode, ["variable"]):
        if isQxDefine(node)[0]:
            yield node.parent.parent
        

##
# Checks if the given node is a qx.*.define function invocation

DefiningClasses = "q qx.Bootstrap qx.Class qx.Interface qx.Mixin qx.List qx.Theme".split()

def isQxDefine(node):
    if node.type == "variable":
        try:
            variableName = (assembleVariable(node))[0]
        except tree.NodeAccessException:
            return False, None, ""

        if variableName in [x+".define" for x in DefiningClasses]:
            if node.hasParentContext("call/operand"):
                className = selectNode(node, "../../params/1")
                if className and className.type == "constant":
                    className = className.get("value", None)
                return True, className, variableName

    return False, None, ""


##
# Alternative isQxDefine predicate that works directly on the 'call' node (so
# the node is immediately usable for getClassMap()), and, on success, returns
# more information (class name being defined (string), and function being used,
# like 'qx.Class.define').
def isQxDefineParent(node):
    if node.type == "call":
        funcname = selectNode(node, "operand/variable")
        if funcname is None: # it's not a named function call
            return False, None, ""

        try:
            variableName = assembleVariable(funcname)[0]
        except tree.NodeAccessException:
            return False, None, ""

        if variableName in [x+".define" for x in DefiningClasses]:
            className = selectNode(node, "params/1")
            if className and className.type == "constant":
                className = className.get("value", None)
            return True, className, variableName

    return False, None, ""

##
# Copies tree.hasChildRecursive, but returns node
def findChild(node, type):
    if isinstance(type, types.StringTypes):
        if node.type == type:
            return node
    elif isinstance(type, type.ListType):
        if node.type in type:
            return node

    if node.hasChildren():
        for child in node.children:
            return findChild(child, type)
    return None
        
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
def selectNode(node, path, ignoreComments=False):
    """
    Selects a node using a XPath like path expression.
    This function returns None if no matching node was found.
    The <path> argument is always anchored to the <node> argument
    (think 're.match' in Python).

    Warning: This function uses a depth first search without backtracking!!

    ".."          navigates to the parent node
    "nodeType"    navigates to the first child node of type nodeType
    "nodeType[3]" navigates to the third child node of type nodeType
    "nodeType[@key='value'] navigates to the first child node of type
                              nodeType with the attribute "key" equals "value"
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
                        node = node.getChildByPosition(position, ignoreComments)
                        continue
                    except ValueError:
                        pass

                    # indexed node "[1]"
                    match = re_indexedNode.match(part)
                    if match:
                        nodetype = match.group(1)
                        index = int(match.group(2))-1
                        i = 0
                        found = False
                        for child in node.children:
                            if child.type == nodetype:
                                if index == i:
                                    node = child
                                    found = True
                                    break
                                i += 1
                        if not found:
                            return None
                        else:
                            continue

                    # attributed node "[@key=val]"
                    match = re_attributeNode.match(part)
                    if match:
                        nodetype = match.group(1)
                        attribName = match.group(2)
                        attribValue = match.group(3)
                        found = False
                        for child in node.children:
                            if child.type == nodetype:
                                if child.get(attribName) == attribValue:
                                    node = child
                                    found = True
                                    break
                        if not found:
                            return None

                    # attribute
                    elif part[0] == "@":
                        return node.get(part[1:])

                    # type
                    else:
                        node = node.getChild(part)

    except tree.NodeAccessException:
            return None

    return node


def nodeIterator(node, nodetypes):
    if node.type in nodetypes:
        yield node

    for child in node.children[:]: # using a copy in case nodes are removed by the caller
        for fcn in nodeIterator(child, nodetypes):
            yield fcn


from collections import deque

##
# Non-recursive vesion of nodeIterator()
#
# Uses an agenda-style search, with a deque to sequence node children. Supports
# bread-first and depth-first searches.

def nodeIteratorNonRec(snode, nodetypes=[], mode='df'):  # df=depth-first, bf=breadth-first
    agenda = deque()
    agenda.append((u'', snode)) # put the first element in

    while True:
        try:
            parent_types, node = agenda.popleft()
        except IndexError:
            break
        try:
            cld = node.children
        except AttributeError:
            cld = []
        cparent_types = "/".join((parent_types, node.type))
        cld = [(cparent_types, x) for x in cld]
        if mode == 'bf':
            agenda.extend(cld)
        else:
            agenda.extendleft(cld)
        if nodetypes:
            if node.type in nodetypes:
                yield parent_types, node
        else:
            yield parent_types, node



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
        raise tree.NodeAccessException("Expected the LOOP node of an if statement!", mapNode)

    replacement = []
    newDefinitions = []
    removedDefinitions = []

    if ifNode.getChild("elseStatement", False):
        if conditionValue:
            removedDefinitions = getDefinitions(ifNode.getChild("elseStatement"))
            newDefinitions = getDefinitions(ifNode.getChild("statement"))
            replacement = ifNode.getChild("statement").children
        else:
            removedDefinitions = getDefinitions(ifNode.getChild("statement"))
            newDefinitions = getDefinitions(ifNode.getChild("elseStatement"))
            replacement = ifNode.getChild("elseStatement").children
    else:
        if conditionValue:
            newDefinitions = getDefinitions(ifNode.getChild("statement"))
            replacement = ifNode.getChild("statement").children
        else:
            removedDefinitions = getDefinitions(ifNode.getChild("statement"))

    newDefinitions = map(lambda x: x.get("identifier"), newDefinitions)
    definitions = []
    for definition in removedDefinitions:
        if not definition.get("identifier") in newDefinitions:
            definitions.append(definition)

    if len(definitions) > 0:
        defList = tree.Node("definitionList")
        defList.set("line", ifNode.get("line"))
        for definition in definitions:
            if definition.hasChildren():
                #del definition.children
                definition.children = []
            defList.addChild(definition)

        # move defList to higher node
        node = ifNode
        while node.type != "block":
            if node.hasParent():
                node = node.parent
            else:
                break
        node.addChild(defList,0)

    # move replacement
    if replacement:
        replacement = replacement[:] # retain copy for return value
        replaceChildWithNodes(ifNode.parent, ifNode, replacement)
    else:
        emptyBlock = tree.Node("block");
        emptyBlock.set("line", ifNode.get("line"))
        # TODO: experimental bug#4734: is this enough?
        if (ifNode.parent.type in ["block", "file"]):
            ifNode.parent.removeChild(ifNode)
        else:
            # don't leave single-statement parent loops empty
            ifNode.parent.replaceChild(ifNode, emptyBlock)
        replacement = [emptyBlock]

    return replacement


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
        elif child.type == "accessor":
            for value in child.children:
                if value.type == "identifier":
                    if assembled:
                        assembled += "."
                    return assembled + value.get("name"), False
            return assembled, False
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
        if not node.hasChildren():
            raise tree.NodeAccessException("node has no children", node)
        for child in node.children:
            if child.type == "variable":
                arr.append((assembleVariable(child))[0])
    elif node.type == "variable":
        arr.append((assembleVariable(node))[0])
    else:
        raise tree.NodeAccessException("'node' is no variable or array node", node)
    return arr


def getFunctionName(fcnNode):

    if not fcnNode.hasParent() or not fcnNode.parent.hasParent():
        return "global"

    if fcnNode.type == "function" and fcnNode.get("name", False):
        return fcnNode.get("name", False)

    if fcnNode.parent.parent.type == "keyvalue":
        return fcnNode.parent.parent.get("key")

    if fcnNode.parent.type == "right" and fcnNode.parent.parent.type == "assignment":
        return fcnNode.parent.parent.getFirstChild().getFirstChild().toJavascript().strip()

    if fcnNode.parent.type == "assignment" and fcnNode.parent.parent.type == "definition":
        return fcnNode.parent.parent.get("identifier")

    return "unknown"


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
    com.set("detail", Comment.Comment(s).getFormat())

    return bef


def getClassMap(classNode):
    # return a map {'extend':..., 'include':..., 'members':...}, with nested keys present in the map,
    # and code given as a tree nodes
    classMap = {}

    # check start node
    if classNode.type == "call":
        qxDefine = selectNode(classNode, "operand/variable")
        if qxDefine:
            qxDefineParts = qxDefine.children
    else:
        qxDefineParts = []
    if (qxDefineParts and 
        len(qxDefineParts) > 2 and
        qxDefineParts[0].get('name') == "qx" and
        qxDefineParts[2].get('name') == "define"
       ):
        pass  # ok
    else:
        raise tree.NodeAccessException("Expected qx define node (as from findQxDefine())", classNode)

    # get top-level class map
    mapNode = selectNode(classNode, "params/map")

    if not mapNode or mapNode.type != "map":
        raise tree.NodeAccessException("Expected a map node!", mapNode)

    if mapNode.hasChildren():
        for child in mapNode.children:
            if child.type == "keyvalue":
                keyvalue = child.getChild("value").getFirstChild(True, True)
                if keyvalue.type == "map":
                    keyvalue = mapNodeToMap(keyvalue)
                classMap[child.get("key")] = keyvalue

    return classMap


##
# return the class name, given a qx.*.define() call node
#
def getClassName(classNode):

    className = u''

    # check start node
    if classNode.type == "call":
        qxDefine = selectNode(classNode, "operand/variable")
        if qxDefine:
            qxDefineParts = qxDefine.children
    else:
        qxDefineParts = []
    if (qxDefineParts and 
        len(qxDefineParts) > 2 and
        qxDefineParts[0].get('name') == "qx" and
        qxDefineParts[2].get('name') == "define"
       ):
        pass  # ok
    else:
        raise tree.NodeAccessException("Expected qx define node (as from findQxDefine())", classNode)

    # get top-level class map
    nameNode = selectNode(classNode, "params/constant")

    if not nameNode or nameNode.type != "constant":
        raise tree.NodeAccessException("Expected a constant node!", nameNode)

    className = nameNode.get("value")

    return className



# ------------------------------------------------------------------------------
# Support for chained identifier expressions, like a.b().c[0].d()
#
# TODO: this currently duplicates code from ecmascript.frontend.Scope
# ------------------------------------------------------------------------------

ChainTypes = set([
    "identifier",
    "accessor",
    "left", "right",
    "call", "operand",
    "variable",
    ])

def findChainRoot(node):
    # find the root node for a chained expression like a.b().c()[0].d()
    current = node

    while current.hasParent() and current.parent.type in ChainTypes:
        current = current.parent

    return current  # this must be the chain root

def findLeftmostChainIdentifier(node):
    # find the leftmost child, assumed to be an identifier
    child = node

    while child.hasChildren():
        c = child.getFirstChild(mandatory=False, ignoreComments=True)
        if c:
            child = c
        else:
            break
    #assert child.type == "identifier"

    return child

def checkFirstChainChild(node):
    # check if the given identifier is the first in a chained expression "a.b.c().d[]"
    chainRoot = findChainRoot(node)
    leftmostIdentifier = findLeftmostChainIdentifier(chainRoot)

    # compare to current node
    if leftmostIdentifier == node:
        return True
    else:
        return False




