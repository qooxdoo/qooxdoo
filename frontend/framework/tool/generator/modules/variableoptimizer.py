#!/usr/bin/env python

import tree, mapper

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

  # File closed, update global code
  elif node.type == "file":
    # Iterate over content
    # Replace variables in current scope

    # update(node, list, prefix, True)
    # We don't want to replace global variables
    pass


def update(node, list, prefix="$", debug=False):
  # Handle all identifiers
  if node.type == "identifier":

    isFirstChild = False
    isVariableMember = False

    if node.parent.type == "variable":
      isVariableMember = True
      varParent = node.parent.parent
      if not (varParent.type == "right" and varParent.parent.type == "accessor"):
        isFirstChild = node.parent.getFirstChild(True, True) == node
    elif node.parent.type == "identifier" and node.parent.parent.type == "accessor":
        isVariableMember = True
        accessor = node.parent.parent
        isFirstChild = accessor.parent.getFirstChild(True, True) == accessor

    # inside a variable parent only respect the first member
    if not isVariableMember or isFirstChild:
      idenName = node.get("name", False)

      if idenName != None and idenName in list:
        replName = "%s%s" % (prefix, mapper.convert(list.index(idenName)))
        node.set("name", replName)

        if debug:
          print "  - Replaced '%s' with '%s'" % (idenName, replName)

  # Handle variable definition
  elif node.type == "definition":
    idenName = node.get("identifier", False)

    if idenName != None and idenName in list:
      replName = "%s%s" % (prefix, mapper.convert(list.index(idenName)))
      node.set("identifier", replName)

      if debug:
        print "  - Replaced '%s' with '%s'" % (idenName, replName)

  # Handle function definition
  elif node.type == "function":
    idenName = node.get("name", False)

    if idenName != None and idenName in list:
      replName = "%s%s" % (prefix, mapper.convert(list.index(idenName)))
      node.set("name", replName)

      if debug:
        print "  - Replaced '%s' with '%s'" % (idenName, replName)

  # Iterate over children
  if node.hasChildren():
    for child in node.children:
      update(child, list, prefix, debug)
