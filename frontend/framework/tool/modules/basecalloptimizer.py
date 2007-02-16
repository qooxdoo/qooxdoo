#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1and1.org
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import re, sys
import tree
import compiler

import treegenerator
import tokenizer
import variantoptimizer

def patch(node, variantMap, fileId=""):
  patchCount = 0

  this_base_vars = variantoptimizer.findVariable(node, "this.base")
  for var in this_base_vars:
    if var.parent.type == "operand" and var.parent.parent.type == "call":
      call = var.parent.parent
      try:
        firstArgName = variantoptimizer.selectNode(call, "params/0/identifier/@name")
      except tree.NodeAccessException:
        continue
      
      if firstArgName != "arguments":
        continue
      
      newCall = compileString("arguments.callee.base.call(this)")
      newCall.replaceChild(newCall.getChild("params"), call.getChild("params"))
      variantoptimizer.selectNode(newCall, "params/0/identifier").set("name", "this")
      call.parent.replaceChild(call, newCall)
      patchCount += 1
      
  this_self_vars = variantoptimizer.findVariable(node, "this.self")
  for var in this_self_vars:
    if var.parent.type == "operand" and var.parent.parent.type == "call":
      call = var.parent.parent
      try:
        firstArgName = variantoptimizer.selectNode(call, "params/0/identifier/@name")
      except tree.NodeAccessException:
        continue
      
      if firstArgName != "arguments":
        continue
      
      newCall = compileString("arguments.callee.self")
      call.parent.replaceChild(call, newCall)
      patchCount += 1
      
      
      
  return patchCount
  
  
  
def compileString(jsString):
  return treegenerator.createSyntaxTree(tokenizer.parseStream(jsString)).getFirstChild()
  