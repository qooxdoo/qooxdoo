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

import tree

def search(node, targetBrowser, verbose=False):
  calls = findCalls(node, u"qx.Clazz.define", [])
  for call in calls:
    members = getMembers(call)
    if members == None:
        continue
    methods = getMethods(members)
    for methodName in methods:
      if "$" in methodName:
        nameParts = methodName.split("$")
        baseName = nameParts[0]
        switched = False
        if targetBrowser in nameParts[1:]:
          print "take: %s" % methodName
          switchMethod(methods[baseName], methods[methodName])
          switched = True
        if switched:
          continue
        for part in nameParts[1:]:
          if part in ["mshtml", "gecko", "opera", "webkit"]:
            removeFunction(methods[methodName])
            print "remove: %s" % methodName
            break

  variables = findVariable(node, "qx.BROWSER_OPTIMIZED", [])
  for var in variables:
    removeSurroundingIf(var)

 
def findCalls(node, methodName, callNodes):
  
  if node.type == "call":
    try:
      nameNode = node.getChild("operand").getChild("variable")
      nameParts = []
      for child in nameNode.children:
        if child.type == "identifier":
          nameParts.append(child.get("name"))
        name = u".".join(nameParts)
    except tree.NodeAccessException:
      name = ""
    if name == methodName:
      callNodes.append(node)
      return callNodes
  
  if node.hasChildren():
    for child in node.children:
      callNodes = findCalls(child, methodName, callNodes)
      #if call
  
  return callNodes


def getMembers(callNode):
  if callNode.type != "call":
    return None
  try:
    secondParam = callNode.getChild("params").getChildByPosition(1);
    if secondParam.type != "map":
      return None
    for child in secondParam.children:
      if child.get("key") == "members":
          return child.getFirstChild().getFirstChild()
  except tree.NodeAccessException:
    return None


def getMethods(mapNode):
  if mapNode.type != "map":
    return {}
  methods = {}
  for child in mapNode.children:
    key = child.get("key")
    value = child.getChild("value").getFirstChild()
    if value.type == "function":
        methods[key] = value
  return methods
  
def switchMethod(oldFunctionNode, newFunctionNode):
  newFunctionParent = newFunctionNode.parent
  
  oldFunctionParent = oldFunctionNode.parent
  oldFunctionParent.replaceChild(oldFunctionNode, newFunctionNode)

  # remove old method definition
  keyValue = newFunctionParent.parent
  map = keyValue.parent
  map.removeChild(keyValue)

def removeFunction(functionNode):
  keyValue = functionNode.parent.parent
  map = keyValue.parent
  map.removeChild(keyValue)
  
      
def findVariable(node, varName, varNodes):
  
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
      #if call
  
  return varNodes
  
  
def removeSurroundingIf(node):
  while node.type != 'loop':
    node = node.parent
  node.parent.removeChild(node)