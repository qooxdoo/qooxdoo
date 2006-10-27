#!/usr/bin/env python

import sys, string, re
import config, tree



S_INLINE_COMMENT = "//.*"
R_INLINE_COMMENT = re.compile("^" + S_INLINE_COMMENT + "$")

R_INLINE_COMMENT_TIGHT = re.compile("^//\S+")
R_INLINE_COMMENT_PURE = re.compile("^//")



S_BLOCK_COMMENT = "/\*([^*]|[\n]|(\*+([^*/]|[\n])))*\*+/"
R_BLOCK_COMMENT = re.compile("^" + S_BLOCK_COMMENT + "$")

R_BLOCK_COMMENT_JAVADOC = re.compile("^/\*\*")
R_BLOCK_COMMENT_QTDOC = re.compile("^/\*!")
R_BLOCK_COMMENT_DIVIDER = re.compile("^/\*\n\s*----")
R_BLOCK_COMMENT_HEADER = re.compile("^/\* \*\*\*\*")

R_BLOCK_COMMENT_TIGHT_START = re.compile("^/\*\S+")
R_BLOCK_COMMENT_TIGHT_END = re.compile("\S+\*/$")
R_BLOCK_COMMENT_PURE_START = re.compile("^/\*")
R_BLOCK_COMMENT_PURE_END = re.compile("\*/$")


VARPREFIXES = {
  "a" : "array",
  "b" : "boolean",
  "d" : "date",
  "f" : "function",
  "i" : "int",
  "h" : "map",
  "m" : "map",
  "n" : "number",
  "o" : "object",
  "s" : "string",
  "v" : "variable",
  "w" : "widget"
}

VARNAMES = {
  "a" : "array",
  "arr" : "array",

  "e" : "event",
  "ev" : "event",
  "evt" : "event",

  "el" : "element",
  "elem" : "element",
  "elm" : "element",

  "ex" : "exception",
  "exc" : "exception",

  "f" : "function",
  "func" : "function",

  "h" : "map",
  "hash" : "map",
  "map" : "map",

  "node" : "node",

  "n" : "number",
  "num" : "number",

  "o" : "object",
  "obj" : "object",

  "s" : "string",
  "str" : "string"
}

VARDESC = {
  "propValue" : "New value of this property",
  "propOldValue" : "Previous value of this property",
  "propData" : "Configuration map of this property"
}




def outdent(source, indent):
  return re.compile("\n\s{%s}" % indent).sub("\n", source)


def indent(source, indent):
  return re.compile("\n").sub("\n" + (" " * indent), source)






def correctInline(source):
  if R_INLINE_COMMENT_TIGHT.match(source):
    return R_INLINE_COMMENT_PURE.sub("// ", source)

  return source


def correctBlock(source):
  if not getFormat(source) in [ "javadoc", "qtdoc" ]:
    if R_BLOCK_COMMENT_TIGHT_START.search(source):
      source = R_BLOCK_COMMENT_PURE_START.sub("/* ", source)

    if R_BLOCK_COMMENT_TIGHT_END.search(source):
      source = R_BLOCK_COMMENT_PURE_END.sub(" */", source)

  return source


def correct(source):
  if source.startswith("//"):
    return correctInline(source)
  else:
    return correctBlock(source)






def isMultiLine(source):
  return source.find("\n") != -1


def getFormat(source):
  if R_BLOCK_COMMENT_JAVADOC.search(source):
    return "javadoc"
  elif R_BLOCK_COMMENT_QTDOC.search(source):
    return "qtdoc"
  elif R_BLOCK_COMMENT_DIVIDER.search(source):
    return "divider"
  elif R_BLOCK_COMMENT_HEADER.search(source):
    return "header"

  return "block"






def hasThrows(node):
  if node.type == "throw":
    return True

  if node.hasChildren():
    for child in node.children:
      if hasThrows(child):
        return True

  return False


def getReturns(node, found):
  if node.type == "function":
    pass

  elif node.type == "return":
    if node.getChildrenLength(True) > 0:
      val = "variable"
    else:
      val = "undefined"

    if node.hasChild("expression"):
      expr = node.getChild("expression")
      if expr.hasChild("variable"):
        var = expr.getChild("variable")
        if var.getChildrenLength(True) == 1 and var.hasChild("identifier"):
          val = nameToType(var.getChild("identifier").get("name"))
        else:
          val = "variable"

      elif expr.hasChild("constant"):
        val = expr.getChild("constant").get("constantType")

        if val == "number":
          val = expr.getChild("constant").get("detail")

      elif expr.hasChild("array"):
        val = "array"

      elif expr.hasChild("map"):
        val = "map"

      elif expr.hasChild("function"):
        val = "function"

      elif expr.hasChild("call"):
        val = "call"

    if not val in found:
      found.append(val)

  elif node.hasChildren():
    for child in node.children:
      getReturns(child, found)

  return found






def nameToType(name):
  typ = "variable"

  # Evaluate type from name
  if name in VARNAMES:
    typ = VARNAMES[name]

  elif len(name) > 1:
    if name[1].isupper():
      if name[0] in VARPREFIXES:
        typ = VARPREFIXES[name[0]]

  return typ



def nameToDescription(name):
  desc = "TODOC"

  if name in VARDESC:
    desc = VARDESC[name]

  return desc




def fromFunction(func, member, name, alternative):
  s = "/**\n"

  #
  # open comment
  ##############################################################
  s += " * TODOC\n"
  s += " *\n"


  #
  # add @membership
  ##############################################################
  if member != None:
    s += " * @membership %s\n" % member
  else:
    s += " * @membership unknown TODOC\n"


  #
  # add @name
  ##############################################################
  if name != None:
    s += " * @name %s\n" % name

    if name.startswith("_"):
      s += " * @mode protected\n"
    else:
      s += " * @mode public\n"


  #
  # add @alternative
  ##############################################################
  if alternative:
    s += " * @alternative TODOC\n"


  #
  # add @param
  ##############################################################
  params = func.getChild("params")
  if params.hasChildren():
    for child in params.children:
      if child.type == "variable":
        pname = child.getChild("identifier").get("name")
        ptype = nameToType(pname)

        s += " * @param %s {%s} %s\n" % (pname, ptype, nameToDescription(pname))

  #
  # add @return
  ##############################################################
  returns = getReturns(func.getChild("body"), [])
  retval = "undefined"

  if len(returns) > 0:
    retval = ",".join(returns)
  elif name != None and name.startswith("is") and name[3].isupper():
    retval = "boolean"

  if retval == "undefined":
    s += " * @return {%s}\n" % retval
  else:
    s += " * @return {%s} TODOC\n" % retval


  #
  # add @throws
  ##############################################################
  if hasThrows(func):
    s += " * @throws TODOC\n"


  #
  # close comment
  ##############################################################
  s += " */"

  return s



def enhance(node):
  if node.type in [ "comment", "commentsBefore", "commentsAfter" ]:
    return

  if node.type == "function":
    target = node
    name = node.get("name", False)
    alternative = False
    member = None

    if name != None:
      member = "scope"

    # move to hook operation
    while target.parent.type in [ "first", "second", "third" ] and target.parent.parent.type == "operation" and target.parent.parent.get("operator") == "HOOK":
      alternative = True
      target = target.parent.parent

    # move comment to assignment
    while target.parent.type == "right" and target.parent.parent.type == "assignment":
      target = target.parent.parent
      if target.hasChild("left"):
        left = target.getChild("left")
        if left and left.hasChild("variable"):
          var = left.getChild("variable")
          last = var.getLastChild(False, True)
          if last and last.type == "identifier":
            name = last.get("name")
            member = "object"

          for child in var.children:
            if child.type == "identifier":
              if child.get("name") in [ "prototype", "Proto", "this" ]:
                member = "instance"
              elif child.get("name") in [ "class", "base", "Class" ]:
                member = "static"


      elif target.parent.type == "definition":
        name = target.parent.get("identifier")
        member = "definition"


    # move to definition
    if target.parent.type == "assignment" and target.parent.parent.type == "definition" and target.parent.parent.parent.getChildrenLength(True) == 1:
      target = target.parent.parent.parent
      member = "scope"


    # move comment to keyvalue
    if target.parent.type == "value" and target.parent.parent.type == "keyvalue":
      target = target.parent.parent
      name = target.get("key")
      member = "map"

      if name == "init":
        member = "constructor"

      if target.parent.type == "map" and target.parent.parent.type == "value" and target.parent.parent.parent.type == "keyvalue":
        paname = target.parent.parent.parent.get("key")

        if paname == "members":
          member = "instance"

        elif paname == "statics":
          member = "static"



    ignore = False

    if target.parent.type == "params":
      ignore = True


    if not ignore:
      # create commentsBefore
      if target.hasChild("commentsBefore"):
        commentsBefore = target.getChild("commentsBefore")

        if commentsBefore.hasChild("comment"):
          for child in commentsBefore.children:
            if child.get("detail") in [ "javadoc", "qtdoc" ]:
              ignore = True

      else:
        commentsBefore = tree.Node("commentsBefore")
        target.addChild(commentsBefore)



    # create comment node
    if not ignore:
      commentNode = tree.Node("comment")
      commentNode.set("text", fromFunction(node, member, name, alternative))
      commentNode.set("detail", "javadoc")
      commentNode.set("multiline", True)

      commentsBefore.addChild(commentNode)


  if node.hasChildren():
    for child in node.children:
      enhance(child)

