#!/usr/bin/env python

import tree




def search(node, map):
  if node.type == "variable":
    if node.hasChildren() and len(node.children) == 1:

      first = node.getFirstChild()

      if first.type == "identifier":
        name = first.get("name")

        if not map.has_key(name):
          print "Identifier: %s" % name
          map[name] = 1
        else:
          map[name] += 1






  elif node.hasChildren():
    for child in node.children:
      search(child, map)


