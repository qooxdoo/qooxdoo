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

R_SINGLECOMMENT_TIGHT = re.compile("^//(\S+)")
R_SINGLECOMMENT_PURE = re.compile("^//")


def outdent(source, indent):
  return re.compile("\n\s{%s}" % indent).sub("\n", source)


def indent(source, indent):
  return re.compile("\n").sub("\n" + (" " * indent), source)


def correctSingleLine(source):
  if R_SINGLECOMMENT_TIGHT.search(source):
    return R_SINGLECOMMENT_PURE.sub("// ", source)

  return source


def correctMultiLine(source):
  return source


def correct(source):
  if source.startswith("//"):
    return correctSingleLine(source)
  else:
    return correctMultiLine(source)



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
