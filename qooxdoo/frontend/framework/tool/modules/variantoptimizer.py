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

import re, sys
import tree
import compiler

global verbose

def log(level, msg, node=None):
  global verbose
  global file
  str = "%s: %s" % (level, msg);
  if node != None:
    if file != "":
      str += " (%s:%s)" % (file, node.get("line", False))
    else:
      str += " (Line %s)" % node.get("line", False)
  if verbose:
    print "      - " + str
  else:
    if level != "Information":
      print
      print str

def search(node, variantMap, fileId="", verb=False):
  global verbose
  global file
  verbose = verb
  file = fileId
  variants = findVariablePrefix(node, "qx.core.Variant")
  modified = False
  for variant in variants:
    variantMethod = selectNode(variant, "identifier[3]/@name")
    if variantMethod == "select":
      modified = processVariantSelect(selectNode(variant, "../.."), variantMap) or modified
    elif variantMethod == "set":
      modified = processVariantSet(selectNode(variant, "../.."), variantMap) or modified
  return modified


def processVariantSelect(callNode, variantMap):
  if callNode.type != "call":
    return False
  params = callNode.getChild("params")
  if len(params.children) != 2:
    log("Warning", "Expecting exactly two arguments for qx.core.Variant.select. Ignoring this occurrence.", params)
    return False

  firstParam = params.getChildByPosition(0)
  if not isStringLiteral(firstParam):
    log("Warning", "First argument must be a string literal constant! Ignoring this occurrence.", firstParam)
    return False
  
  variantGroup = firstParam.get("value");
  if not variantGroup in variantMap.keys():
    return False

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
      if default != None:
        callNode.parent.replaceChild(callNode, default)
      else:
        log("Error", "No default case found!", callNode)
        sys.exit(1) 
    return True
    
  elif isStringLiteral(secondParam):
    ifcondition =  secondParam.parent.parent.parent

    # normal if then else
    if ifcondition.type == "expression" and ifcondition.getChildrenLength(True) == 1 and ifcondition.parent.type == "loop":
      loop = ifcondition.parent
      variantValue = secondParam.get("value")
      inlineIfStatement(loop, __variantMatchKey(variantValue, variantMap, variantGroup))

    # ternery operator  .. ? .. : ..
    elif (
      ifcondition.type == "first" and
      ifcondition.getChildrenLength(True) == 1 and
      ifcondition.parent.type == "operation" and
      ifcondition.parent.get("operator") == "HOOK"
    ):
      variantValue = secondParam.get("value")
      if __variantMatchKey(variantValue, variantMap, variantGroup):
        repleacement = selectNode(ifcondition, "../second")
      else:
        repleacement = selectNode(ifcondition, "../third")
      replaceChildWithNodes(ifcondition.parent.parent, ifcondition.parent, repleacement.children)  
  
    else:
      log("Warning", "Only processing qx.core.Variant.select directly inside of an if condition. Ignoring this occurrence.", secondParam)
      return False
        
    return True

  log("Warning", "The second parameter of qx.core.Variant.select must be a map or a string literal. Ignoring this occurrence.", secondParam)
  return False


def __variantMatchKey(key, variantMap, variantGroup):
  for keyPart in key.split("|"):
    if variantMap[variantGroup] == keyPart:
      return True
  return False
  
  
def processVariantSet(callNode, variantMap):
  if callNode.type != "call":
    return False
  
  params = callNode.getChild("params")
  arg1 = params.getChildByPosition(0)
  if not isStringLiteral(arg1):
    log("Warning", "First argument must be a string literal constant! Ignoring this occurrence.", arg1)
    return False
  variantGroup = arg1.get("value");

  arg2 = params.getChildByPosition(1)
  try:
    if variantMap[variantGroup]:
      newNode = tree.Node("constant")
      newNode.set("isComplex", "false")
      newNode.set("detail", "doublequotes")
      newNode.set("value", variantMap[variantGroup])
      newNode.set("constantType", "string")
      newNode.set("makeComplex", "false")
      newNode.set("line", arg2.get("line"))
      
      arg2.parent.replaceChild(arg2, newNode)
      return True
  except KeyError:
    return False
  
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
  index = getNodeIndex(node, oldChild)
  node.removeChild(oldChild)
  # copy list
  children = newChildren[:]
  for child in children:
    node.addChild(child, index)
    index += 1
  

def getNodeIndex(parent, node):
  return parent.children.index(node)
  

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