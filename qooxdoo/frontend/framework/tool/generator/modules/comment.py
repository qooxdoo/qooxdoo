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




def getReturns(node):
  l = []
  addReturns(node.getChild("body"), l)
  return l


def addReturns(node, found):
  if node.type == "function":
    return

  elif node.type == "return":
    val = "variable"
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

    if not val in found:
      found.append(val)

  elif node.hasChildren():
    for child in node.children:
      addReturns(child, found)



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




def fromFunction(func, name):
  s = "/**\n"

  # open comment
  s += " * TODOC\n"

  # add parameters
  params = func.getChild("params")
  if params.hasChildren():
    s += " *\n"
    for child in params.children:
      if child.type == "variable":
        pname = child.getChild("identifier").get("name")
        ptype = nameToType(pname)

        s += " * @param %s {%s} TODOC\n" % (pname, ptype)

  # add return
  returns = getReturns(func)
  if len(returns) > 0:
    s += " *\n"
    s += " * @return {%s} TODOC\n" % ",".join(returns)
  elif name != None and name.startswith("is"):
    s += " *\n"
    s += " * @return {%s} TODOC\n" % "boolean"

  # close comment
  s += " */"

  return s



def enhance(node):
  if node.type in [ "comment", "commentsBefore", "commentsAfter" ]:
    return

  if node.type == "function":
    target = node
    name = node.get("name", False)

    # move comment to assignment
    while target.parent.type == "right" and target.parent.parent.type == "assignment":
      target = target.parent.parent
      if target.hasChild("left"):
        left = target.getChild("left")
        if left and left.hasChild("variable"):
          last = left.getChild("variable").getLastChild(False, True)
          if last and last.type == "identifier":
            name = last.get("name")

      elif target.parent.type == "definition":
        name = target.parent.get("identifier")

    # move comment to keyvalue
    if target.parent.type == "value" and target.parent.parent.type == "keyvalue":
      target = target.parent.parent
      name = target.get("key")


    if target.hasChild("commentsBefore"):
      commentsBefore = target.getChild("commentsBefore")
    else:
      commentsBefore = tree.Node("commentsBefore")
      target.addChild(commentsBefore)

    ignore = False

    if commentsBefore.hasChild("comment"):
      for child in commentsBefore.children:
        if child.get("detail") in [ "javadoc", "qtdoc" ]:
          ignore = True

    # create comment node
    if not ignore:
      commentNode = tree.Node("comment")
      commentNode.set("text", fromFunction(node, name))
      commentNode.set("detail", "javadoc")
      commentNode.set("multiline", True)

      commentsBefore.addChild(commentNode)


  if node.hasChildren():
    for child in node.children:
      enhance(child)

