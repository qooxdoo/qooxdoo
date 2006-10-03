#!/usr/bin/env python

import tree

# HEX
# table = "0123456789abcdef"

# Numbers and Characters
table = "0123456789abcdefghijklmnopqrstuvwxyz"

def search(node, list, level=0, prefix="$"):
  if node.type == "function":
    # print "%s<scope line='%s'>" % (("  " * level), node.get("line"))

    funcName = node.get("name", False)
    if funcName != None:
      # print "Name: %s" % funcName
      list.append(funcName)

    # TODO: better copy method?
    newlist = []
    for item in list:
      newlist.append(item)
    list = newlist

  # e.g. func(name1, name2);
  elif node.type == "variable" and node.hasChildren() and len(node.children) == 1:
    if node.parent.type == "params" and node.parent.parent.type != "call":
      first = node.getFirstChild()

      if first.type == "identifier":
        name = first.get("name")

        if not name in list:
          list.append(name)

  # e.g. var name1, name2 = "foo";
  elif node.type == "definition":
    name = node.get("identifier", False)
    if name != None:
      if not name in list:
        list.append(name)

  # Iterate over children
  if node.hasChildren():
    for child in node.children:
      search(child, list, level+1, prefix)

  # Function closed
  if node.type == "function":

    # Debug
    # for item in list:
    #   print "  %s<item>%s</item>" % (("  " * level), item)
    # print "%s</scope>" % ("  " * level)

    # Iterate over content
    # Replace variables in current scope
    update(node, list, prefix)



def update(node, list, prefix="$"):
  # Handle all identifiers
  if node.type == "identifier":
    # inside a variable parent only respect the first member
    if node.parent.type != "variable" or node.parent.getFirstChild(True, True) == node:
      idenName = node.get("name", False)

      if idenName != None and idenName in list:
        replName = "%s%s" % (prefix, mapper(list.index(idenName)))
        node.set("name", replName)

        # print "  - Replaced '%s' with '%s'" % (idenName, replName)

  # Handle variable definition
  elif node.type == "definition":
    idenName = node.get("identifier", False)

    if idenName != None and idenName in list:
      replName = "%s%s" % (prefix, mapper(list.index(idenName)))
      node.set("identifier", replName)

      # print "  - Replaced '%s' with '%s'" % (idenName, replName)

  # Iterate over children
  if node.hasChildren():
    for child in node.children:
      update(child, list, prefix)



def mapper(current):
  # Possibilities with each character
  # 1: 36 = 36
  # 2: 36*36 = 1296
  # 3: 36*36*36 = 46656

  res = ""
  length = len(table) - 1

  if current / length > 0:
    res += mapper(current / length)

  res += table[current % length]

  return res

