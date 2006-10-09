#!/usr/bin/env python

class NodeAccessException (Exception):
  def __init__ (self, msg, node):
    Exception.__init__(self, msg)
    self.node = node


class Node:
  def __init__ (self, type):
    self.type = type

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
    del self.attributes[key]
    if len(self.attributes) == 0:
      del self.attributes

  def hasParent(self):
    return hasattr(self, "parent")

  def hasChildren(self, ignoreComments = False):
    if not ignoreComments:
      return hasattr(self, "children")
    else:
      if not hasattr(self, "children"):
        return False

      for child in self.children:
        if child.type != "comment" and child.type != "commentsBefore":
          return True

  def addChild(self, childNode, index = None):
    if childNode:
      if not self.hasChildren():
        self.children = []
      if index != None:
        self.children.insert(index, childNode)
      else:
        self.children.append(childNode)
      childNode.parent = self
    return self

  def removeChild(self, childNode):
    if self.hasChildren():
      self.children.remove(childNode)
      childNode.parent = None
      if len(self.children) == 0:
        del self.children

  def replaceChild(self, oldChild, newChild):
    if self.hasChildren():
      self.children.insert(self.children.index(oldChild), newChild)
      self.children.remove(oldChild)

  def getChild(self, type, mandatory = True):
    if self.hasChildren():
      for child in self.children:
        if child.type == type:
          return child
    if mandatory:
      raise NodeAccessException("Node " + self.type + " has no child with type " + type, self)

  def hasChild(self, type):
    if self.hasChildren():
      for child in self.children:
        if child.type == type:
          return True

    return False

  def getChildByAttribute(self, key, value, mandatory = True):
    if self.hasChildren():
      for child in self.children:
        if child.get(key) == value:
          return child

    if mandatory:
      raise NodeAccessException("Node " + self.type + " has no child with attribute " + key + " = " + value, self)

  def getFirstChild(self, mandatory = True, ignoreComments = False):
    if self.hasChildren():
      for child in self.children:
        if not ignoreComments or (child.type != "comment" and child.type != "commentsBefore"):
          return child

    if mandatory:
      raise NodeAccessException("Node " + self.type + " has no children", self)

  def getLastChild(self, mandatory = True, ignoreComments = False):
    if self.hasChildren():
      if not ignoreComments:
        return self.children[-1]
      else:
        pos = len(self.children) - 1
        while pos >= 0:
          child = self.children[pos]

          if child.type != "comment" and child.type != "commentsBefore":
            return child

          pos -= 1

    if mandatory:
      raise NodeAccessException("Node " + self.type + " has no children", self)

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
    if self.hasChildren():
      for child in self.children:
        if child.type == type:
          found.append(child)

        child._getAllChildrenOfType(type, found)

    return found




def nodeToXmlString(node, prefix = "", childPrefix = "  ", newLine="\n"):
  hasText = False
  asString = prefix + "<" + node.type
  if node.hasAttributes():
    for key in node.attributes:
      if key == "text":
        hasText = True
      else:
        asString += " " + key + "=\"" + escapeXmlChars(node.attributes[key], True) + "\""

  if not node.hasChildren() and not hasText:
    asString += "/>" + newLine
  else:
    asString += ">"

    if hasText:
      if node.hasChildren():
        asString += newLine + prefix + childPrefix
      asString += "<text>" + escapeXmlChars(node.attributes["text"], False) + "</text>" + newLine

    if node.hasChildren():
      asString += newLine
      for child in node.children:
        asString += nodeToXmlString(child, prefix + childPrefix, childPrefix, newLine)

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



def escapeXmlChars(text, inAttribute):
  text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
  if inAttribute:
    text = text.replace("\"", "&quot;")
  return text



def escapeJsonChars(text):
  return text.replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r')
