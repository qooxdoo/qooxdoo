#!/usr/bin/env python

import sys, os

# reconfigure path to import modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "../../modules"))

import tree, compiler




counter = 0



def getAssignment(elem):
  if elem.parent.type == "right" and elem.parent.parent.type == "assignment":
    return elem.parent.parent

  return None


def getName(elem):
  # find last identifier
  last = elem.getLastChild(False, True)

  if last.type == "identifier":
    return last.get("name")


def getNameOfAssignment(elem):
  name = None

  if elem.hasChild("left"):
    left = elem.getChild("left")

    if left.hasChild("variable"):
      name = getName(left.getChild("variable"))

  return name


def getMode(var):
  # find last identifier
  last = var.getLastChild(False, True)
  prev = last.getPreviousSibling(False, True)

  if prev.type == "identifier":
    mode = prev.get("name")

    if mode == "Proto":
      return "members"
    elif mode == "Class":
      return "statics"

  return None



def getModeOfAssignment(elem):
  mode = None

  if elem.hasChild("left"):
    left = elem.getChild("left")

    if left.hasChild("variable"):
      var = left.getChild("variable")
      mode = getMode(var)

  return mode



def createPair(key, value, commentParent=None):
  par = tree.Node("keyvalue")
  sub = tree.Node("value")

  par.set("key", key)
  par.addChild(sub)
  sub.addChild(value)

  if commentParent and commentParent.hasChild("commentsBefore"):
    par.addChild(commentParent.getChild("commentsBefore"))

  return par


def patch(node):
  global counter

  if not node.hasChildren():
    return False

  classDefine, membersMap, staticsMap = createClassDefine()

  pos = 0

  while pos < len(node.children):
    child = node.children[pos]
    pos += 1

    # Add instance and static methods
    if child.type == "assignment":
      if child.hasChild("right"):
        right = child.getChild("right")
        elem = right.getFirstChild(True, True)

        name = getNameOfAssignment(child)
        mode = getModeOfAssignment(child)

        if mode == "members":
          membersMap.addChild(createPair(name, elem, child))

        elif mode == "statics":
          staticsMap.addChild(createPair(name, elem, child))

        node.removeChild(child)
        pos -= 1

    elif child.type == "call":
      print ">>> CALL"


    if child.parent == node:
      print " * Could not move element: %s" % child.type


  # Add new class definition
  node.addChild(classDefine)

  # Debug
  print compiler.compile(node)

  return counter > 0


def createClassDefineCore(name):
  call = tree.Node("call")
  oper = tree.Node("operand")
  var = tree.Node("variable")
  id1 = tree.Node("identifier")
  id2 = tree.Node("identifier")
  id3 = tree.Node("identifier")
  para = tree.Node("params")
  con = tree.Node("constant")
  args = tree.Node("map")

  id1.set("name", "qx")
  id2.set("name", "Clazz")
  id3.set("name", "define")

  con.set("detail", "doublequotes")
  con.set("value", name)
  con.set("constantType", "string")

  call.addChild(oper)
  call.addChild(para)

  oper.addChild(var)
  var.addChild(id1)
  var.addChild(id2)
  var.addChild(id3)

  para.addChild(con)
  para.addChild(args)

  return call, args



def createClassDefine():
  classDefine, classMap = createClassDefineCore("newClassName")

  membersMap = tree.Node("map")
  membersPair = createPair("members", membersMap)

  staticsMap = tree.Node("map")
  staticsPair = createPair("statics", staticsMap)

  classMap.addChild(membersPair)
  classMap.addChild(staticsPair)

  return classDefine, membersMap, staticsMap
