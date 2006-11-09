#!/usr/bin/env python

import sys, os

# reconfigure path to import modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "../../modules"))

import tree, compiler




counter = 0



def getFunctionAssignment(func):
  if func.parent.type == "right" and func.parent.parent.type == "assignment":
    return func.parent.parent
    
  return None  


def getFunctionName(func):
  if func.get("name", False) != None:
    return func.get("name")

  ass = getFunctionAssignment(func)
   
  if ass and ass.hasChild("left"):
    left = ass.getChild("left")

    if left.hasChild("variable"):
      var = left.getChild("variable")

      # find last identifier
      last = var.getLastChild(False, True)

      if last.type == "identifier":
        return last.get("name")

  return None    
  
  
  
def getMode(func):
  ass = getFunctionAssignment(func)
    
  if ass and ass.hasChild("left"):
    left = ass.getChild("left")

    if left.hasChild("variable"):
      var = left.getChild("variable")

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
  
  
    
def createPair(key, value):
  par = tree.Node("keyvalue")
  sub = tree.Node("value")
  
  par.set("key", key)
  par.addChild(sub)
  sub.addChild(value)
  
  return par


def patch(node):
  global counter
  
  if not node.hasChildren():
    return False

  base, membersMap, staticsMap = createBase()
  
  for child in node.children:
    # Add instance and static methods
    if child.type == "assignment":
      if child.hasChild("right") and child.getChild("right").hasChild("function"):
        func = child.getChild("right").getChild("function")
        
        name = getFunctionName(func)
        mode = getMode(func)
        
        if mode == "members":
          membersMap.addChild(createPair(name, func))        
        elif mode == "statics":
          staticsMap.addChild(createPair(name, func))
        else:
          print " * Could not move function: %s" % name
          
        
        
        
        
       
  
  
  

  #print tree.nodeToXmlString(class_map)
  print compiler.compile(base)

  return counter > 0


def createClassDefineBase(name):
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



def createBase():
  fileItem = tree.Node("file")
  
  classDefine, classMap = createClassDefineBase("newClassName")  
  
  membersMap = tree.Node("map")
  membersPair = createPair("members", membersMap)
  
  staticsMap = tree.Node("map")
  staticsPair = createPair("statics", staticsMap)
  
  classMap.addChild(membersPair)
  classMap.addChild(staticsPair)
  fileItem.addChild(classDefine)    
  
  return fileItem, membersMap, staticsMap
