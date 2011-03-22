#!/usr/bin/env python
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

import sys, os

# reconfigure path to import own modules from modules subfolder
#sys.path.append(os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "../"))

import simplejson

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  tree.py -- providing a tree data structure
#
# SYNTAX
#  tree.py --help
#
#  or
#
#  import tree
#  result = tree.Node()
#
#  creates a new tree node
#
# DESCRIPTION
#  The main provision by this module is the Node class. This lets you create
#  arbitrary trees made out of linked nodes (parent - child relation).
#
#</pre>
##


##
# Some nice short description of Foo
#
# @param a Number of foos to bar
class NodeAccessException (Exception):
    def __init__ (self, msg, node):
        Exception.__init__(self, msg)
        self.node = node


class Node(object):

    def __init__ (self, type):
        self.type = type
        self.parent = None
        self.children = []

    def __str__(self):
        return nodeToXmlStringNR(self)


    def hasAttributes(self):
        return hasattr(self, "attributes")

    def set(self, key, value):
        """Sets an attribute"""
        if not isinstance(value, (basestring, int, long, float, complex, bool)):
            raise NodeAccessException("'value' is no string or number: " + str(value), self)
        if not self.hasAttributes():
            self.attributes = {}
        self.attributes[key] = value
        return self

    def get(self, key, mandatory = True):
        value = None
        if hasattr(self, "attributes") and key in self.attributes:
            value = self.attributes[key]

        if value != None:
            return value
        elif mandatory:
            raise NodeAccessException("Node " + self.type + " has no attribute " + key, self)

    def remove(self, key):
        if not key in self.attributes:
            return

        del self.attributes[key]
        if len(self.attributes) == 0:
            del self.attributes

    def hasParent(self):
        return self.parent

    ##
    # checks whether the node hierarchy leading to node ends with contextPath,
    # ie.  if node.parent.type == contextPath[-1], node.parent.parent.type ==
    # contextPath[-2] asf. Example: varNode.hasParentContext("call/operand")
    # checks whether varNode.parent is "operand" and varNode.parent.parent is
    # "call" type, ie. it's a function being called; the wildcard '*' is allowed
    # to indicate any type on a particular level, like "value/*/operand"
    def hasParentContext(self, contextPath):
        parents = contextPath.split('/')

        currNode = self
        for parent in reversed(parents):
            if currNode.parent:
                if parent == '*' or currNode.parent.type == parent:
                    currNode = currNode.parent
                else:
                    return False
            else:
                return False  # no parent, no match

        return True


    ##
    # return the chain of parent (types) of this node
    def getParentChain(self):
        chain = []
        currNode = self
        while currNode.parent:
            chain.append(currNode.parent.type)
            currNode = currNode.parent
        return reversed (chain)


    def hasChildren(self, ignoreComments = False):
        if not ignoreComments:
            return self.children
        else:
            return [c for c in self.children if c.type not in ("comment", "commentsBefore", "commentsAfter")]


    getChildren = hasChildren


    def addChild(self, childNode, index = None):
        if childNode:
            if childNode.parent:
                childNode.parent.removeChild(childNode)

            if index != None:
                self.children.insert(index, childNode)
            else:
                self.children.append(childNode)
            childNode.parent = self
        return self

    def removeChild(self, childNode):
        if self.children:
            self.children.remove(childNode)
            childNode.parent = None

    def replaceChild(self, oldChild, newChild):
        if self.children:
            if newChild.parent:
                newChild.parent.removeChild(newChild)

            self.children.insert(self.children.index(oldChild), newChild)
            newChild.parent = self
            self.children.remove(oldChild)

    def getChild(self, type, mandatory = True):
        if self.children:
            for child in self.children:
                if child.type == type:
                    return child
        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no child with type " + type, self)

    def hasChildRecursive(self, type):
        if isinstance(type, basestring):
            if self.type == type:
                return True
        elif isinstance(type, list):
            if self.type in type:
                return True

        if self.children:
            for child in self.children:
                if child.hasChildRecursive(type):
                    return True

        return False

    def hasChild(self, type):
        if self.children:
            for child in self.children:
                if isinstance(type, basestring):
                    if child.type == type:
                        return True
                elif isinstance(type, list):
                    if child.type in type:
                        return True

        return False

    def getChildrenLength(self, ignoreComments=False):
        if self.children:
            if ignoreComments:
                counter = 0
                for child in self.children:
                    if not child.type in ["comment", "commentsBefore", "commentsAfter"]:
                        counter += 1
                return counter

            else:
                return len(self.children)

        return 0



    def makeComplex(self):
        makeComplex = self.get("makeComplex", False)

        if makeComplex != None:
            return makeComplex

        else:
            makeComplex = False



        if self.type == "comment":
            makeComplex = True

        elif self.type == "block":
            if self.children:
                counter = 0
                for child in self.children:
                    if child.type != "commentsAfter":
                        counter += 1
                        if counter > 1:
                            makeComplex = True

        elif self.type == "loop":
            if self.get("loopType") == "IF" and self.parent and self.parent.type == "elseStatement":
                pass
            else:
                makeComplex = True

        elif self.type == "function":
            makeComplex = self.getChild("body").hasChild("block") and self.getChild("body").getChild("block").getChildrenLength() > 0

        elif self.type in ["loop", "switch"]:
            makeComplex = True

        elif self.hasChild("commentsBefore"):
            makeComplex = True



        # Final test: Ask the children (slower)
        if not makeComplex and not self.type in ["comment", "commentsBefore", "commentsAfter"]:
            makeComplex = self.isComplex()


        self.set("makeComplex", makeComplex)

        # print "makeComplex: %s = %s" % (self.type, makeComplex)

        return makeComplex



    def isComplex(self):
        isComplex = self.get("isComplex", False)

        if isComplex != None:
            return isComplex

        else:
            isComplex = False



        if not self.children:
            isComplex = False

        elif self.type == "block":
            counter = 0
            if self.children:
                for child in self.children:
                    if child.type != "commentsAfter":
                        counter += 1

                        if child.hasChild("commentsBefore"):
                            counter += 1

                        if counter > 1:
                            break

            if counter > 1:
                isComplex = True

            else:
                if self.getChildrenLength() == 0:
                    isComplex = False

                # in else, try to find the mode of the previous if first
                elif self.parent and self.parent.type == "elseStatement":
                    isComplex = self.parent.parent.getChild("statement").hasComplexBlock()

                # in if, try to find the mode of the parent if (if existent)
                elif self.parent and self.parent.type == "statement" and self.parent.parent.type == "loop" and self.parent.parent.get("loopType") == "IF":
                    if self.parent.parent.parent and self.parent.parent.parent.parent:
                        if self.parent.parent.parent.parent.type == "loop":
                            isComplex = self.parent.parent.parent.parent.getChild("statement").hasComplexBlock()

                # in catch/finally, try to find the mode of the try statement
                elif self.parent and self.parent.parent and self.parent.parent.type in ["catch", "finally"]:
                    isComplex = self.parent.parent.parent.getChild("statement").hasComplexBlock()

        elif self.type == "elseStatement":
            if self.hasComplexBlock():
                isComplex = True
            elif self.hasChild("loop") and self.getChild("loop").getChild("statement").hasComplexBlock():
                isComplex = True

        elif self.type == "array" :
            if self.getChildrenLength(True) > 5:
                isComplex = True

        elif self.type == "map" :
            ml = self.getChildrenLength(True)
            if ml > 1:
                isComplex = True

        # Final test: Ask the children (slower)
        if not (self.type == "elseStatement" and self.hasChild("loop")):
            if not isComplex and self.hasComplexChildren():
                isComplex = True

        # print self.type + " :: %s" % isComplex
        self.set("isComplex", isComplex)

        # print "isComplex: %s = %s" % (self.type, isComplex)

        return isComplex



    def hasComplexChildren(self):
        if self.children:
            for child in self.children:
                if child.makeComplex():
                    return True

        return False


    def hasComplexBlock(self):
        if self.hasChild("block"):
            return self.getChild("block").isComplex()

        return False


    def hasBlockChildren(self):
        if self.hasChild("block"):
            return self.getChild("block").hasChildren()

        return False


    def getChildPosition(self, searchedChild, ignoreComments = False):
        if self.children and searchedChild in self.children:
            if ignoreComments:
                counter = 0
                for child in self.children:
                    if child == searchedChild:
                        return counter

                    if not child.type in ["comment", "commentsBefore", "commentsAfter"]:
                        counter += 1

            else:
                return self.children.index(searchedChild)

        return -1



    def getChildByPosition(self, pos, mandatory = True, ignoreComments = False):
        if self.children:
            i = 0
            for child in self.children:
                if ignoreComments and child.type in ["comment", "commentsBefore", "commentsAfter"]:
                    continue

                if i == pos:
                    return child

                i += 1

        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no child as position %s" % pos, self)



    def getChildByAttribute(self, key, value, mandatory = True):
        if self.children:
            for child in self.children:
                if child.get(key,mandatory) == value:
                    return child

        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no child with attribute " + key + " = " + value, self)

    def getChildByTypeAndAttribute(self, type, key, value, mandatory = True):
        if self.children:
            for child in self.children:
                if child.type == type and child.get(key,mandatory) == value:
                    return child

        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no child with type " + type + " and attribute " + key + " = " + value, self)

    def getFirstChild(self, mandatory = True, ignoreComments = False):
        if self.children:
            for child in self.children:
                if ignoreComments and child.type in ["comment", "commentsBefore", "commentsAfter"]:
                    continue

                return child

        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no children", self)

    def getLastChild(self, mandatory = True, ignoreComments = False):
        if self.children:
            if not ignoreComments:
                return self.children[-1]
            else:
                pos = len(self.children) - 1
                while pos >= 0:
                    child = self.children[pos]

                    if ignoreComments and child.type in ["comment", "commentsBefore", "commentsAfter"]:
                        pos -= 1
                        continue

                    return child

        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no children", self)

    def getPreviousSibling(self, mandatory = True, ignoreComments = False):
        if self.parent:
            prev = None
            for child in self.parent.children:

                if ignoreComments and child.type in ["comment", "commentsBefore", "commentsAfter"]:
                    continue

                if child == self:
                    if prev != None:
                        return prev
                    else:
                        break

                prev = child

        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no previous sibling", self)

    def getFollowingSibling(self, mandatory = True, ignoreComments = False):
        if self.parent:
            prev = None

            for child in self.parent.children:
                if ignoreComments and child.type in ["comment", "commentsBefore", "commentsAfter"]:
                    continue

                if prev != None:
                    return child

                if child == self:
                    prev = child

        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no following sibling", self)

    def isFirstChild(self, ignoreComments = False):
        if not self.parent:
            return False

        return self.parent.getFirstChild(False, ignoreComments) == self

    def isLastChild(self, ignoreComments = False):
        if not self.parent:
            return False

        return self.parent.getLastChild(False, ignoreComments) == self

    def addListChild(self, listName, childNode):
        listNode = self.getChild(listName, False)
        if not listNode:
            listNode = Node(listName)
            self.addChild(listNode)
        listNode.addChild(childNode)

    def getListChildByAttribute(self, listName, key, value, mandatory = True):
        listNode = self.getChild(listName, False)
        if listNode:
            return listNode.getChildByAttribute(key, value, mandatory)

        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no child " + listName, self)

    def getFirstListChild(self, listName, mandatory = True):
        listNode = self.getChild(listName, False)
        if listNode:
            return listNode.getFirstChild(mandatory)

        if mandatory:
            raise NodeAccessException("Node " + self.type + " has no child " + listName, self)

    def getAllChildrenOfType(self, type):
        return self._getAllChildrenOfType(type, [])

    def _getAllChildrenOfType(self, type, found=[]):
        if self.children:
            for child in self.children:
                if child.type == type:
                    found.append(child)

                child._getAllChildrenOfType(type, found)

        return found

    def toXml(self,  prefix = "", childPrefix = "  ", newLine="\n", encoding="utf-8"):
        return nodeToXmlString(self, prefix, childPrefix, newLine, encoding)

    def toJson(self, prefix = "", childPrefix = "  ", newLine="\n"):
        return nodeToJsonString(self, prefix, childPrefix, newLine)

    def toJavascript(self):
        from ecmascript import compiler
        def options(): pass
        options.prettyPrint =  True
        options.prettypIndentString = "  "
        options.prettypCommentsInlinePadding = "  "
        options.prettypCommentsTrailingCommentCols = ""
        options.prettypOpenCurlyNewlineBefore = "m"
        options.prettypOpenCurlyIndentBefore = False
        options.prettypAlignBlockWithCurlies = False
        options.prettypCommentsTrailingKeepColumn = False

        return compiler.compile(self, options)

    def nodeIter(self):
        "A generator/iterator method, to traverse a tree and 'yield' each node"
        yield self

        if self.children:
            for child in self.children:
                for node in child.nodeIter():
                    yield node

    def nodeTreeMap(self, fn):
        """As an alternative, a pure recursion walk that applies a function fn to each node.
           This allows to control the recursion through fn's return value.
           Signature of fn: fn(node,isLeaf)."""
        if not self.children:
            rc = fn(self,True)
            return
        else:
            rc = fn(self,False)
            if rc == 0:  # != 0 means prune this subtree
                for child in self.children:
                    child.nodeTreeMap(fn)
            return


def nodeToXmlStringNR(node, prefix="", encoding="utf-8"):
    hasText = False
    asString = prefix + "<" + node.type
    if node.hasAttributes():
        for key in node.attributes:
            asString += " " + key + "=\"" + escapeXmlChars(node.attributes[key], True, encoding) + "\""
    asString += "/>"

    return asString


def nodeToXmlString(node, prefix = "", childPrefix = "  ", newLine="\n", encoding="utf-8"):
    hasText = False
    asString = prefix + "<" + node.type
    if node.hasAttributes():
        for key in node.attributes:
            if key == "text":
                hasText = True
            else:
                asString += " " + key + "=\"" + escapeXmlChars(node.attributes[key], True, encoding) + "\""

    if not node.hasChildren() and not hasText:
        asString += "/>" + newLine
    else:
        asString += ">"

        if hasText:
            asString += newLine + prefix + childPrefix
            asString += "<text>" + escapeXmlChars(node.attributes["text"], False, encoding) + "</text>" + newLine

        if node.hasChildren():
            asString += newLine
            for child in node.children:
                asString += nodeToXmlString(child, prefix + childPrefix, childPrefix, newLine, encoding)

        asString += prefix + "</" + node.type + ">" + newLine

    return asString



def nodeToJsonString(node, prefix = "", childPrefix = "  ", newLine="\n"):
    asString = prefix + '{type:"' + escapeJsonChars(node.type) + '"'

    if node.hasAttributes():
        asString += ',attributes:{'
        firstAttribute = True
        for key in node.attributes:
            if not firstAttribute:
                asString += ','
            asString += '"' + key + '":"' + escapeJsonChars(node.attributes[key]) + '"'
            firstAttribute = False
        asString += '}'

    if node.hasChildren():
        asString += ',children:[' + newLine

        firstChild = True
        prefix = prefix + childPrefix
        for child in node.children:
            asString += nodeToJsonString(child, prefix, childPrefix, newLine) + ',' + newLine
            firstChild = False

        # NOTE We remove the ',\n' of the last child
        if newLine == "":
            asString = asString[:-1] + prefix + ']'
        else:
            asString = asString[:-2] + newLine + prefix + ']'

    asString += '}'

    return asString


def getNodeData(node):
    data = {
      "type" : node.type
    }

    if node.hasAttributes():
        data["attributes"] = {}
        for key in node.attributes:
            data["attributes"][key] = node.attributes[key]

    if node.hasChildren():
        data["children"] = []

        for child in node.children:
            data["children"].append(getNodeData(child))

    return data


def escapeXmlChars(text, inAttribute, encoding="utf-8"):
    if isinstance(text, basestring):
        # http://www.w3.org/TR/xml/#dt-escape
        text = text.replace("\"", "&quot;").replace("'", "&apos;").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    elif isinstance(text, bool):
        text = str(text).lower()
    else:
        text = str(text)

    return text


def escapeJsonChars(text):
    if isinstance(text, basestring):
        # http://tools.ietf.org/html/rfc4627#section-2.5
        text = text.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t').replace('\b', '\\b').replace('\f', '\\f').replace('/', '\\/')
    elif isinstance(text, bool):
        text = str(text).lower()
    else:
        text = str(text)

    return text
