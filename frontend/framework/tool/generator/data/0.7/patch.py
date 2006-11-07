#!/usr/bin/env python

import sys, os

# reconfigure path to import modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "../../modules"))

import tree, compiler




counter = 0

virt = tree.Node("file")

class_map = tree.Node("map")

virt.addChild(class_map)

members_key = tree.Node("keyvalue")
members_val = tree.Node("value")
members_map = tree.Node("map")

statics_key = tree.Node("keyvalue")
statics_val = tree.Node("value")
statics_map = tree.Node("map")

class_map.addChild(members_key)
class_map.addChild(statics_key)

members_key.set("key", "members")
members_key.addChild(members_val)
members_val.addChild(members_map)

statics_key.set("key", "statics")
statics_key.addChild(statics_val)
statics_val.addChild(statics_map)




def patch(node):
  global counter

  patchNode(node)

  #print tree.nodeToXmlString(class_map)
  print compiler.compile(class_map)

  return counter > 0


def patchNode(node):
  global counter

  if node.type == "function":
    if node.parent.type != "right":
      return

    if node.parent.parent.type != "assignment":
      return

    if node.parent.parent.parent.type != "file":
      return

    ass = node.parent.parent

    if ass.hasChild("left"):
      left = ass.getChild("left")

      if left.hasChild("variable"):
        var = left.getChild("variable")

        # find last identifier
        last = var.getLastChild(True, False)

        if last.type == "identifier":
          print "Found: %s" % last.get("name")

          key = tree.Node("keyvalue")
          val = tree.Node("value")

          key.set("key", last.get("name"))
          key.addChild(val)

          node.parent.removeChild(node)
          val.addChild(node)

          members_map.addChild(key)


  elif node.hasChildren():
    for child in node.children:
      patchNode(child)
