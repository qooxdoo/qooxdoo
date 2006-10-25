#!/usr/bin/env python

import sys, string, re
import config


def normalize(comment, indent):
  return re.compile("\n\s{%s}" % indent).sub("\n", comment)


def indent(comment, indent):
  return re.compile("\n").sub("\n" + (" " * indent), comment)

