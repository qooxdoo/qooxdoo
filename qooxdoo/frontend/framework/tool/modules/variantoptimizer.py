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

import re
import tree
import compiler

def search(node, variantMap, verbose=False):
  variants = findVariablePrefix(node, "qx.core.Variant")
  for variant in variants:
    variantMethod = selectNode(variant, "identifier[3]/@name")
    if variantMethod == "select":
      processVariantSelect(selectNode(variant, "../.."), variantMap)
    elif variantMethod == "set":
      processVariantSet(selectNode(variant, "../.."), variantMap)


def processVariantSelect(callNode, variantMap):
  if callNode.type != "call":
    return
  params = callNode.getChild("params")
  if len(params.children) != 2:
    print "Warning: Expecting exactly two arguments for qx.core.Variant.select. Ignoring this occurrence."
    return

  firstParam = params.getChildByPosition(0)
  if not isStringLiteral(firstParam):
    print "Warning! First argument must be a string literal constant! Ignoring this occurrence."
    return
  
  variantGroup = firstParam.get("value");
  if not variantGroup in variantMap.keys():
    return

  secondParam = params.getChildByPosition(1)
  default = None
  found = False
  if secondParam.type == "map":
    for node in secondParam.children:
      fullKey = node.get("key")
      value = node.getChild("value").getFirstChild()
      keys = fullKey.split("|")
      for key in keys:
        if key == variantMap[variantGroup]:
          callNode.parent.replaceChild(callNode, value)
          found = True
          break
        if key == "none":
          default = value
    if not found:
      callNode.parent.replaceChild(callNode, default)
    return
    
  elif isStringLiteral(secondParam):
    ifcondition =  secondParam.parent.parent.parent
    if ifcondition.type != "expression" or len(ifcondition.children) != 1 or ifcondition.parent.type != "loop":
      print "Warning! Only processing qx.core.Variant.select directly inside of an if condition. Ignoring this occurrence."
      return

    loop = ifcondition.parent

    #print
    #print "--- pre ---"
    #print loop.parent.toJavascript()
    
    variantValue = secondParam.get("value")
    inlineIfStatement(loop, variantValue != variantMap[variantGroup])

    #print
    #print "--- post ---"
    #print loop.parent.toJavascript()
    #print
    return

  print "Warning: The second parameter of qx.core.Variant.select must be a map or a string literal. Ignoring this occurrence."


def processVariantSet(callNode, variantMap):
  if callNode.type != "call":
    return False
  
  params = callNode.getChild("params")
  arg1 = params.getChildByPosition(0)
  if not isStringLiteral(arg1):
    print "Warning! First argument must be a string literal constant! Ignoring this occurrence."
    return
  variantGroup = arg1.get("value");

  arg2 = params.getChildByPosition(1)
  if variantMap[variantGroup]:
    newNode = tree.Node("constant")
    newNode.set("isComplex", "false")
    newNode.set("detail", "doublequotes")
    newNode.set("value", variantMap[variantGroup])
    newNode.set("constantType", "string")
    newNode.set("makeComplex", "false")
    
    arg2.parent.replaceChild(arg2, newNode)
    return True
  return False
  
  
def isStringLiteral(node):
  return node.type == "constant" and node.get("constantType") == "string"
  
    
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
  

def selectNode(node, path):
  re_indexedNode = re.compile("^(.*)\[(\d+)\]$")
  
  pathParts = path.split("/")
  for part in pathParts:
    # parent node
    if part == "..":
      node = node.parent
    else:
      # indexed node
      match = re_indexedNode.match(part)
      if match:
        type = match.group(1)
        index = int(match.group(2))
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
      # attribute
      elif part[0] == "@":
        return node.get(part[1:])
      # normal node
      else:
        node = node.getChild(part)
        
  return node  
  

def findVariablePrefix(node, namePrefix, varNodes=None):
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


def inlineIfStatement(ifNode, conditionValue):
  if ifNode.type != "loop" or ifNode.get("loopType") != "IF":
    return False
  if conditionValue:
    #print "remove if case"
    ifNode.parent.replaceChild(ifNode, ifNode.getChild("elseStatement").getFirstChild())
  else:
    #print "remove else case"
    if ifNode.getChild("elseStatement"):
      ifNode.parent.replaceChild(ifNode, ifNode.getChild("statement").getFirstChild())
  