#!/usr/bin/env python

import sys, string, re
import config

S_MULTICOMMENT = "/\*([^*]|[\n]|(\*+([^*/]|[\n])))*\*+/"
S_MULTICOMMENT_JAVADOC = "/\*\*"
S_MULTICOMMENT_QTDOC = "/\*!"
S_MULTICOMMENT_DIVIDER = "/\*\n\s*----"
S_MULTICOMMENT_HEADER = "/\* \*\*\*\*"

R_MULTICOMMENT = re.compile("^" + S_MULTICOMMENT + "$")
R_MULTICOMMENT_JAVADOC = re.compile("^" + S_MULTICOMMENT_JAVADOC)
R_MULTICOMMENT_QTDOC = re.compile("^" + S_MULTICOMMENT_QTDOC)
R_MULTICOMMENT_DIVIDER = re.compile("^" + S_MULTICOMMENT_DIVIDER)
R_MULTICOMMENT_HEADER = re.compile("^" + S_MULTICOMMENT_HEADER)



S_SINGLECOMMENT = "//.*"
S_SINGLECOMMENT_TIGHT = "^//(\S+)"
S_SINGLECOMMENT_PURE = "^//"

R_SINGLECOMMENT = re.compile("^" + S_SINGLECOMMENT + "$")
R_SINGLECOMMENT_TIGHT = re.compile(S_SINGLECOMMENT_TIGHT)
R_SINGLECOMMENT_PURE = re.compile(S_SINGLECOMMENT_PURE)


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
