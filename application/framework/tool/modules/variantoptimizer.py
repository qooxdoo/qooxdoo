#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
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

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  module.py -- module short description
#
# SYNTAX
#  module.py --help
#
#  or
#
#  import module
#  result = module.func()
#
# DESCRIPTION
#  The module module does blah.
#
# CAVEATS
#
# KNOWN ISSUES
#  There are no known issues.
#</pre>
##

import re, sys
import tree
import compiler
from treeutil import *

global verbose

##
# Some nice short description of foo(); this can contain html and
# {@link #foo Links} to items in the current file.
#
# @param     a        Describe a positional parameter
# @keyparam  b        Describe a keyword parameter
# @def       foo(name)    # overwrites auto-generated function signature
# @param     name     Describe aliased parameter
# @return             Description of the things returned
# @defreturn          The return type
# @exception IOError  The error it throws
#
def log(level, msg, node=None):
    global verbose
    global file
    str = "%s: %s" % (level, msg);
    if node != None:
        if file != "":
            str += " (%s:%s)" % (file, node.get("line", False))
        else:
            str += " (Line %s)" % node.get("line", False)
    if verbose:
        print "      - " + str
    else:
        if level != "Information":
            print
            print str


def search(node, variantMap, fileId="", verb=False):
    if variantMap == None:
        return False
    
    global verbose
    global file
    verbose = verb
    file = fileId
    variants = findVariablePrefix(node, "qx.core.Variant")
    modified = False
    for variant in variants:
        variantMethod = selectNode(variant, "identifier[4]/@name")
        if variantMethod == "select":
            modified = processVariantSelect(selectNode(variant, "../.."), variantMap) or modified
        elif variantMethod == "isSet":
            modified = processVariantIsSet(selectNode(variant, "../.."), variantMap) or modified
        elif variantMethod == "compilerIsSet":
            modified = processVariantIsSet(selectNode(variant, "../.."), variantMap) or modified

    return modified


def processVariantSelect(callNode, variantMap):
    if callNode.type != "call":
        return False
        
    params = callNode.getChild("params")
    if len(params.children) != 2:
        log("Warning", "Expecting exactly two arguments for qx.core.Variant.select. Ignoring this occurrence.", params)
        return False

    firstParam = params.getChildByPosition(0)
    if not isStringLiteral(firstParam):
        log("Warning", "First argument must be a string literal constant! Ignoring this occurrence.", firstParam)
        return False

    variantGroup = firstParam.get("value");
    if not variantGroup in variantMap.keys():
        return False

    secondParam = params.getChildByPosition(1)
    default = None
    found = False
    if secondParam.type == "map":
        for node in secondParam.children:
            if node.type != "keyvalue":
                continue

            fullKey = node.get("key")
            value = node.getChild("value").getFirstChild()
            keys = fullKey.split("|")
            for key in keys:
                if key == variantMap[variantGroup]:
                    callNode.parent.replaceChild(callNode, value)
                    found = True
                    break
                if key == "default":
                    default = value
        if not found:
            if default != None:
                callNode.parent.replaceChild(callNode, default)
            else:
                log("Error", "No default case found!", callNode)
                sys.exit(1)
        return True

    log("Warning", "The second parameter of qx.core.Variant.select must be a map or a string literal. Ignoring this occurrence.", secondParam)
    return False


def processVariantIsSet(callNode, variantMap):
    if callNode.type != "call":
        return False
        
    params = callNode.getChild("params")
    if len(params.children) != 2:
        log("Warning", "Expecting exactly two arguments for qx.core.Variant.isSet. Ignoring this occurrence.", params)
        return False

    firstParam = params.getChildByPosition(0)
    if not isStringLiteral(firstParam):
        log("Warning", "First argument must be a string literal! Ignoring this occurrence.", firstParam)
        return False

    variantGroup = firstParam.get("value");
    if not variantGroup in variantMap.keys():
        return False

    secondParam = params.getChildByPosition(1)

    if isStringLiteral(secondParam):
        ifcondition =  secondParam.parent.parent.parent

        # normal if then else
        if ifcondition.type == "expression" and ifcondition.getChildrenLength(True) == 1 and ifcondition.parent.type == "loop":
            loop = ifcondition.parent
            variantValue = secondParam.get("value")
            inlineIfStatement(loop, __variantMatchKey(variantValue, variantMap, variantGroup))

        # ternery operator  .. ? .. : ..
        elif (
            ifcondition.type == "first" and
            ifcondition.getChildrenLength(True) == 1 and
            ifcondition.parent.type == "operation" and
            ifcondition.parent.get("operator") == "HOOK"
        ):
            variantValue = secondParam.get("value")
            if __variantMatchKey(variantValue, variantMap, variantGroup):
                repleacement = selectNode(ifcondition, "../second")
            else:
                repleacement = selectNode(ifcondition, "../third")
            replaceChildWithNodes(ifcondition.parent.parent, ifcondition.parent, repleacement.children)

        else:
            variantValue = secondParam.get("value")
            constantNode = tree.Node("constant")
            constantNode.set("value", str(__variantMatchKey(variantValue, variantMap, variantGroup)).lower())
            constantNode.set("constantType", "boolean")
            constantNode.set("line", callNode.get("line"))
            callNode.parent.replaceChild(callNode, constantNode)
            #log("Warning", "Only processing qx.core.Variant.isSet directly inside of an if condition. Ignoring this occurrence.", secondParam)

        return True

    log("Warning", "The second parameter of qx.core.Variant.isSet must be a string literal. Ignoring this occurrence.", secondParam)
    return False


def __variantMatchKey(key, variantMap, variantGroup):
    for keyPart in key.split("|"):
        if variantMap[variantGroup] == keyPart:
            return True
    return False
