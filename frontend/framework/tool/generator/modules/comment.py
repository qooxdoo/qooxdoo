#!/usr/bin/env python

import sys, string, re
import config

S_MULTICOMMENT = "/\*([^*]|[\n]|(\*+([^*/]|[\n])))*\*+/"
R_MULTICOMMENT = re.compile("^" + S_MULTICOMMENT + "$")

S_SINGLECOMMENT = "//.*"
R_SINGLECOMMENT = re.compile("^" + S_SINGLECOMMENT + "$")

R_MULTICOMMENT_JAVADOC = re.compile("^/\*\*")
R_MULTICOMMENT_QTDOC = re.compile("^/\*!")
R_MULTICOMMENT_DIVIDER = re.compile("^/\*\n\s*----")
R_MULTICOMMENT_HEADER = re.compile("^/\* \*\*\*\*")

R_SINGLECOMMENT_TIGHT = re.compile("^//\S+")
R_SINGLECOMMENT_PURE = re.compile("^//")

R_MULTICOMMENT_TIGHT_START = re.compile("^/\*\S+")
R_MULTICOMMENT_TIGHT_END = re.compile("\S+\*/$")
R_MULTICOMMENT_PURE_START = re.compile("^/\*")
R_MULTICOMMENT_PURE_END = re.compile("\*/$")

def outdent(source, indent):
  return re.compile("\n\s{%s}" % indent).sub("\n", source)


def indent(source, indent):
  return re.compile("\n").sub("\n" + (" " * indent), source)


def correctInline(source):
  if R_SINGLECOMMENT_TIGHT.match(source):
    return R_SINGLECOMMENT_PURE.sub("// ", source)

  return source


def correctBlock(source):
  if not getFormat(source) in [ "javadoc", "qtdoc" ]:
    if R_MULTICOMMENT_TIGHT_START.search(source):
      source = R_MULTICOMMENT_PURE_START.sub("/* ", source)

    if R_MULTICOMMENT_TIGHT_END.search(source):
      source = R_MULTICOMMENT_PURE_END.sub(" */", source)

  return source


def correct(source):
  if source.startswith("//"):
    return correctInline(source)
  else:
    return correctBlock(source)



def isMultiLine(source):
  return source.find("\n") != -1


def getFormat(source):
  if R_MULTICOMMENT_JAVADOC.search(source):
    return "javadoc"
  elif R_MULTICOMMENT_QTDOC.search(source):
    return "qtdoc"
  elif R_MULTICOMMENT_DIVIDER.search(source):
    return "divider"
  elif R_MULTICOMMENT_HEADER.search(source):
    return "header"

  return "block"
