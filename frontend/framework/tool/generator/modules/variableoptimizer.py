#!/usr/bin/env python

import tree




def search(node, map):
  if node.type == "variable" and node.parent.type == "params":
    if node.hasChildren() and len(node.children) == 1:
      first = node.getFirstChild()

      if first.type == "identifier":
        name = first.get("name")

        if not map.has_key(name):
          map[name] = 1
        else:
          map[name] += 1



  elif node.type == "definition":
    name = node.get("identifier", False)
    if name != None:
      if not map.has_key(name):
        map[name] = 1
      else:
        map[name] += 1


  elif node.type == "function":
    name = node.get("name", False)
    if name != None:
      if not map.has_key(name):
        map[name] = 1
      else:
        map[name] += 1




  if node.hasChildren():
    for child in node.children:
      search(child, map)






def sort(variableMap):
  variableList = []

  for value in variableMap:
    variableList.append({ "value" : value, "number" : variableMap[value] })

  variableList.sort(lambda x, y: y["number"]-x["number"])

  return variableList


