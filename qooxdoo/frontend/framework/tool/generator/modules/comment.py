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





def fromFunction(func):
  s = "/**\n"

  s += " * @brief\n"
  s += " * TODO\n"
  s += " *\n"
  s += " * @param %s {type}\n"
  s += " */"

  return s



def enhance(tree):
  print "  * Enhancing tree..."

  enhanceNode(tree)



def enhanceNode(node):

  if node.type in [ "comment", "commentsBefore", "commentsAfter" ]:
    return


  print ">>> %s" % node.type

  if node.type == "function":
    commentNode = tree.Node("comment")
    commentNode.set("source", fromFunction(node))
    commentNode.set("text", fromFunction(node))
    commentNode.set("detail", "block")
    commentNode.set("multiline", True)

    commentsBefore = tree.Node("commentsBefore")
    commentsBefore.addChild(commentNode)

    if node.parent.type == "right":
      pass

    else:
      node.addChild(commentsBefore, 0)


  if node.hasChildren():
    for child in node.children:
      enhanceNode(child)

