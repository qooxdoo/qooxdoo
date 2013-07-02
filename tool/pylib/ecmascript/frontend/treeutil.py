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

import re, types
from ecmascript.frontend import tree, tokenizer, treegenerator, Comment, lang
from ecmascript.frontend.treegenerator import PackerFlags as pp


##
# Finds the next qx.*.define call in the given tree

def findQxDefine(rootNode):
    for node in nodeIterator(rootNode, tree.NODE_VARIABLE_TYPES):
        if isQxDefine(node)[0]:
            return node.parent.parent
        
    return None


##
# Finds all the qx.*.define calls in the given tree
#
def findQxDefineR(rootNode):
    for node in nodeIterator(rootNode, tree.NODE_VARIABLE_TYPES):
        if isQxDefine(node)[0]:
            yield node.parent.parent
        

##
# Find the enclosing qx.*.define call, if any, of node.
#
def findEnclosingQxDefine(node):
    res = None
    cnode = node
    while cnode:
        if cnode.type == 'call':
            operand_node = cnode.getChild("operand").children[0]
            if isQxDefine(operand_node)[0]:
                res = cnode
                break
        cnode = cnode.parent
    return res

##
# Checks if the given node is the operand of a qx.*.define function invocation.
#
def isQxDefine(node):
    if node.type in tree.NODE_VARIABLE_TYPES:
        try:
            variableName = (assembleVariable(node))[0]
        except tree.NodeAccessException:
            return False, None, ""

        if variableName in lang.QX_CLASS_FACTORIES:
            if node.hasParentContext("call/operand"):
                className = selectNode(node, "../../arguments/1")
                if className:
                    if className.type == "constant":
                        className = className.get("value", None)
                        className = None if className == False else className
                    else:
                        className = None
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

        if variableName in lang.QX_CLASS_FACTORIES:
            className = selectNode(node, "arguments/1")
            if className and className.type == "constant":
                className = className.get("value", None)
                className = None if className == False else className
            return True, className, variableName

    return False, None, ""

##
# Copies tree.hasChildRecursive, but returns node
def findChild(node, type):
    if isinstance(type, types.StringTypes):
        if node.type == type:
            return node
    elif isinstance(type, types.ListType):
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

    def is_number(a):
        try: int(a); return True
        except ValueError: return False

    def is_indexed(a):
        return re_indexedNode.match(a)

    def is_attributed(a):
        return re_attributeNode.match(a)

    def _selectNode(node, pathParts, ignoreComments):
        if not pathParts or not node:
            return node
        else:
            # Dispatch on current selector part
            nextn = None
            part = pathParts[0]

            # parent
            if part == '..':
                nextn = node.parent 
            
            # attribute -- ends recursion
            elif part[0] == "@":
                try:
                    val = node.get(part[1:])
                    return val
                except tree.NodeAccessException:
                    return None

            # index, e.g. "2"
            elif is_number(part):
                pos = int(part) - 1
                nextn = node.getChildByPosition(pos, ignoreComments) 
            
            # indexed node, e.g. "arguments[3]"
            elif is_indexed(part):
                match = re_indexedNode.match(part)
                nodetype = match.group(1)
                index = int(match.group(2))-1
                childsOfType = node.getChildsByTypes([nodetype])
                if len(childsOfType) > index:
                    nextn = childsOfType[index]
                     
            # attributed node, e.g. "arguments[@key=val]"
            elif is_attributed(part):
                match = re_attributeNode.match(part)
                nodetype = match.group(1)
                attribName = match.group(2)
                attribValue = match.group(3)
                childsOfType = node.getChildsByTypes([nodetype])
                for cld in childsOfType:
                    if cld.get(attribName) == attribValue:
                        nextn = cld
                        break

            # type
            else:
                nextn = node.getChild(part, mandatory=False)

            return _selectNode(nextn, pathParts[1:], ignoreComments)

    # --------------------------------------------------------------------------

    pathParts = path.split("/")
    return _selectNode(node, pathParts, ignoreComments)


##
# External tree visitor.
# If <nodetypes> is non-empty, use its elements for filtering tree nodes.
def nodeIterator(node, nodetypes):
    if nodetypes:
        if node.type in nodetypes:
            yield node
    else:
        yield node

    for child in node.children[:]: # using a copy in case nodes are removed by the caller
        for fcn in nodeIterator(child, nodetypes):
            yield fcn

##
# Generator for nodes of a certain type and attribute values
#
def findNode(node, nodetypes, attribs): # attribs=[(key,val),...]
    for node in nodeIterator(node, nodetypes):
        if all([(node.get(key,not(bool(val)))==val) for key,val in attribs]):
            yield node


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


def inlineIfStatement(ifNode, conditionValue, inPlace=True):
    """
    Inline an if statement assuming that the condition of the if
    statement evaluates to "conditionValue" (True/False")
    """

    if ifNode.type != "loop" or ifNode.get("loopType") != "IF":
        raise tree.NodeAccessException("Expected the LOOP node of an if statement!", ifNode)

    replacement = None
    replacement_is_empty = False
    newDefinitions = []
    removedDefinitions = []

    if len(ifNode.children)==3:  # there is an 'else' part
        if conditionValue:
            removedDefinitions = getDefinitions(ifNode.children[2])
            newDefinitions = getDefinitions(ifNode.children[1])
            replacement = ifNode.children[1].children[0]  # <body>.children: single node, <block> or <statement>
        else:
            removedDefinitions = getDefinitions(ifNode.children[1])
            newDefinitions = getDefinitions(ifNode.children[2])
            replacement = ifNode.children[2].children[0]
    else:
        if conditionValue:
            newDefinitions = getDefinitions(ifNode.children[1])
            replacement = ifNode.children[1].children[0]
        else:
            removedDefinitions = getDefinitions(ifNode.children[1])
            # don't leave single-statement parent loops empty
            emptyBlock = treegenerator.symbol("block")()
            emptyBlock.set("line", ifNode.get("line"))
            stmts = treegenerator.symbol("statements")()
            stmts.set("line", ifNode.get("line"))
            emptyBlock.addChild(stmts)
            replacement = emptyBlock
            replacement_is_empty = True

    # Rescue var decls
    newDefinitions = [x.getDefinee().get("value") for x in newDefinitions]
    definitions = []
    for definition in removedDefinitions:
        if not definition.getDefinee().get("value") in newDefinitions:
            definitions.append(definition)

    if len(definitions) > 0:
        defList = treegenerator.symbol("var")()
        defList.set("line", ifNode.get("line"))
        defList.set("column", ifNode.get("column"))
        for definition in definitions:
            # remove initialisations
            if definition.children[0].type == "identifier":
                pass
            else: # assignment
                idf = definition.getDefinee()
                definition.children[0] = idf
            defList.addChild(definition)

        # attach defList to replacement
        if replacement.type != 'block': # treat single-statement branches
            block = treegenerator.symbol("block")()
            block.set("line", ifNode.get("line"))
            stmts = treegenerator.symbol("statements")()
            stmts.set("line", ifNode.get("line"))
            block.addChild(stmts)
            stmts.addChild(replacement)
            replacement = block
        replacement.getChild("statements").addChild(defList,0)
        replacement_is_empty = False

    # move replacement
    if inPlace:
        if (replacement_is_empty and ifNode.parent.type in ["statements"]):
            ifNode.parent.removeChild(ifNode)
        else:
            ifNode.parent.replaceChild(ifNode, replacement)

    return replacement, replacement_is_empty


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
    if variableItem.type not in tree.NODE_VARIABLE_TYPES:
        raise tree.NodeAccessException("'variableItem' is no variable node", variableItem)

    else:
        varRoot = findVarRoot(variableItem)
        return varRoot.toJS(pp), True
    #assembled = ""
    #for child in variableItem.children:
    #    if child.type == "commentsBefore":
    #        continue
    #    elif child.type == "dotaccessor":
    #        for value in child.children:
    #            if value.type == "identifier":
    #                if assembled:
    #                    assembled += "."
    #                return assembled + value.get("name"), False
    #        return assembled, False
    #    elif child.type != "identifier":
    #        # this means there is some accessor like part in the variable
    #        # e.g. foo["hello"]
    #        return assembled, False

    #    if len(assembled) != 0:
    #        assembled += "."

    #    assembled += child.get("name")

    #return assembled, True


def compileString(jsString, uniqueId=""):
    """
    Compile a string containing a JavaScript fragment into a syntax tree.
    """
    return treegenerator.createFileTree(tokenizer.Tokenizer().parseStream(jsString, uniqueId)).getFirstChild().getFirstChild()  # strip (file (statements ...) nodes


def variableOrArrayNodeToArray(node):
    """
    Normalizes a variable node or an array node containing variables
    to a python array of the variable names
    """

    arr = []
    if node.type == "array":
        if not node.children:
            raise tree.NodeAccessException("node has no children", node)
        for child in node.children:
            if child.isVar():
                arr.append(child.toJS(pp))
    elif node.isVar():
        arr.append(node.toJS(pp))
    else:
        raise tree.NodeAccessException("'node' is no variable or array node", node)
    return arr


def getFunctionName(fcnNode):

    if not fcnNode.hasParent() or not fcnNode.parent.hasParent():
        return "global"

    if fcnNode.type == "function" and fcnNode.getChild("identifier", False):
        fcnName = fcnNode.get("identifier", False)
        if fcnName:
            fcnName = fcnName.get("value")
        else:
            fcnName = None
        return fcnName

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
    line = False
    column = False

    while line is False and column is False and syntaxItem:
        line = syntaxItem.get("line", False)
        column = syntaxItem.get("column", False)

        if syntaxItem.hasParent():
            syntaxItem = syntaxItem.parent
        else:
            syntaxItem = None

    line = None if line is False else line
    column = None if column is False else column
    return line, column


def getFileFromSyntaxItem(syntaxItem):
    """
    Returns the file name of a tree node
    """
    file = False
    while file is False and syntaxItem:
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
    _checkQxDefineNode(classNode)

    # get top-level class map
    mapNode = selectNode(classNode, "arguments/map")

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


def _checkQxDefineNode(node):
    if node.type == "call":
        qxDefine = selectNode(node, "operand/dotaccessor")
        if qxDefine:
            qxDefineParts = qxDefine.toJS(pp).split('.')
        else:
            qxDefineParts = []
    else:
        qxDefineParts = []
    if (qxDefineParts and
        len(qxDefineParts) > 2 and
        qxDefineParts[0] == "qx" and
        qxDefineParts[2] == "define"
       ):
        pass  # ok
    elif (qxDefineParts == ["q", "define"]):
        pass  # ok
    elif (qxDefineParts == ["qxWeb", "define"]):
        pass  # ok
    else:
        raise tree.NodeAccessException("Expected qx define node (as from findQxDefine())", node)


##
# return the class name, given a qx.*.define() call node
#
def getClassName(classNode):

    className = u''

    # check start node
    _checkQxDefineNode(classNode)

    # get top-level class map
    nameNode = selectNode(classNode, "arguments/constant")

    if not nameNode or nameNode.type != "constant":
        raise tree.NodeAccessException("Expected a constant node!", nameNode)

    className = nameNode.get("value")

    return className



# ------------------------------------------------------------------------------
# Support for chained identifier expressions, like a.b().c[0].d()
# ------------------------------------------------------------------------------

##
# ChainParentTypes:
# These are not all types that can show up in a chained ("a.b.c")
# expression, but the ones you come across when going from an identifier
# node upwards in the tree.
ChainParentTypes = set([
    "accessor", "dotaccessor",
    "call", "operand",
    ])

##
# Find the root operator for a chained expression (like the second call in
# "a.b().c()[0].d()"), starting from any identifier *within* this
# expression.
#
def findChainRoot(node):
    current = node
    while current.hasParent() and current.parent.type in ChainParentTypes:
        current = current.parent
    return current  # this must be the chain root

##
# Find the root <dotaccessor> of a dotted variable expression
# ("a.b.c"), starting from any variable expression within this tree.
#
def findVarRoot(node):
    # node can be var or constant ('{}.toString')
    current = node
    while current.parent and current.parent.isVar():
        current = current.parent
    return current

##
# Find the root node a comment refers to.
#
# Example: Comments are always attached to the lexically next token. This might
# be the left-hand identifier of an assignment. But the comment actually scopes
# the entire statement, so the <assignment> node would be the actual commented
# root. List:
#
# - lhs of assignment -> <assignment>
# - map key -> <keyvalue>
# - 'function' keyword -> <function>
# - 'var' keyword -> <var>
#
def findCommentedRoot(node):
    if node.isVar(): # if it's a dotaccessor make sure we look at the highest dot
        node = findVarRoot(node)
    # var a=1, function(){}, ...
    if node.hasParentContext("statements"):
        return node
    # a = 1;
    elif node.hasParentContext("statements/assignment"):
        return node.parent
    # a : 1,
    elif node.type == 'keyvalue':
        return node
    # xxx(), (xxx)()
    elif node.hasParentContext("statements/call/operand"):
        return node.parent.parent
    # (xxx).call()
    elif node.hasParentContext("statements/call/operand/dotaccessor"):
        return node.parent.parent.parent
    else:
        return node


##
# Find the leftmost child downward the tree of the passed node
# 
def findLeftmostChild(node):
    child = node
    while child.hasChildren():
        c = child.getFirstChild(mandatory=False, ignoreComments=True)
        if c:
            child = c
        else:
            break
    return child


##
# Find the closest ancestor (including self) of <node> with type in <node_types>
# and in distance <radius> (radius=0 disables distance).
#
def findAncestor(node, node_types=[], radius=1):
    res = None
    lnode = node
    dist = 0
    while True:
        if radius > 0 and dist >= radius:
            break
        elif node_types and lnode.type in node_types:
            res = lnode
            break
        else:
            dist += 1
            if lnode.parent:
                lnode = lnode.parent
            else:
                break
    return res

##
# Check whether <ancestor> is an ancestor of <child>.
#
def hasAncestor(child, ancestor):
    curr = child
    res = False
    while curr:
        if curr==ancestor:
            res = True
            break
        elif curr.parent and curr in curr.parent.children:
            curr = curr.parent
        else:
            break
    return res


##
# Check if the given identifier node is the first in a chained
# expression ("a" in "a.b.c()[0].d()")
#
def checkFirstChainChild(node):
    chainRoot = findChainRoot(node)
    leftmostIdentifier = findLeftmostChild(chainRoot)
    # compare to current node
    return leftmostIdentifier == node

def findFirstChainChild(node):
    chainRoot = findChainRoot(node)
    leftmostIdentifier = findLeftmostChild(chainRoot)
    return leftmostIdentifier

##
# <node> must be the top-level .isVar.
#
def isNEWoperand(node):
    operation = None
    if node.hasParentContext("operation/call/operand"):
        operation = node.parent.parent.parent
    elif node.hasParentContext("operation"):
        operation = node.parent
    return operation and operation.type=="operation" and operation.get("operator","")=="NEW"

def isCallOperand(node):
    return (
        node.hasParentContext("call/operand") or 
        isNEWoperand(node)
    )

##
# Check if node is the (function) value of the 'defer' class member
#
def isDeferFunction(node):
    # quick check for function
    if not node.type == 'function':
        return False

    # quick check for map and map key
    if not (isKeyValue(node) and node.parent.parent.get('key') == 'defer'):
        return False

    # get enclosing qx.*.define
    qxDefine_node = findEnclosingQxDefine(node)
    class_map = getClassMap(qxDefine_node)
    # get its 'defer' section
    if 'defer' in class_map:
        defer_function = class_map['defer']
    else:
        defer_function = None
    # compare
    return defer_function == node

def isKeyValue(node):
    return node.hasParentContext("map/keyvalue/value")

##
# Check, and if not present create, a closure wrapper for the syntax tree.
#
# The resulting tree will look like 
#    (function(){ ...[passed-in trees]...})()
# (with a leading <file> node).
#
# <nodes> - [node1, node2, ...]
#           nodeX is assumed to start with a <file> node
#
wrapper_statements_path = "operand/group/function/body/block/statements"

def is_closure_wrapped(node):
    return (node.type == "call"
        and selectNode(node, wrapper_statements_path))  # if this succeeds, there is a top-level wrapper

def ensureClosureWrapper(nodes):
    if not nodes:
        return None, None
    # check if we have a closure wrapper already
    if len(nodes) == 1:
        closure_statements = is_closure_wrapped(nodes[0])
        if closure_statements:
            return nodes[0], closure_statements
    # create a closure wrapper and attach argument nodes
    new_tree = treegenerator.parse("(function(){})();").getChild("call")
    closure_statements = selectNode(new_tree, wrapper_statements_path)
    for node in nodes[:]:
        closure_statements.addChild(node)
    return new_tree, closure_statements

##
# NodeVisitor class
#
class NodeVisitor(object):

    def __init__(self, debug=False):
        self.debug = debug
        
    def visit(self, node):
        if hasattr(self, "visit_"+node.type):
            if self.debug:
                print "visiting:", node.type
            getattr(self, "visit_"+node.type)(node)
        else:
            for child in node.children:
                if self.debug:
                    print "visiting:", child.type
                self.visit(child)
