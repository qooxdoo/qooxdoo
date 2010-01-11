#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2010-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# Class -- Internal representation of a qooxdoo class
##

import os, sys, re, types, codecs
from ecmascript.frontend import treeutil

class Class(object):

    def __init__(self, id):
        __slots__       = ('name', 'file', 'source', 'ast', 'scopes', 'translations')
        self.name       = id   # qooxdoo name of class, classId
        self.file       = u''  # file path of this class
        self.source     = u''  # source code of this class
        self.ast        = None # ecmascript.frontend.tree instance
        self.scopes     = None # an ecmascript.frontend.Script instance
        self.translations = {} # map of translatable strings in this class

    def _getAst(self):
        ast = None
        return ast

    ast = property(_getAst)

    def compiled(variants):
        compiled = u''
        tree = self.optimize(self.ast)
        compiled =compiler.compile(tree)
        return compiled

# -- temp. module helper functions ---------------------------------------------


##
# only return those keys from <variantSet> that are supported
# in <classVariants>

def projectClassVariantsToCurrent(classVariants, variantSet):
    res = {}
    for key in variantSet:
        if key in classVariants:
            res[key] = variantSet[key]
    return res


##
# look for places where qx.core.Variant.select|isSet|.. are called
# and return the list of first params (the variant name)
# @cache

def getClassVariants(fileId, filePath, treeLoader, cache, console, generate=True):

    cacheId   = "class-%s" % (filePath,)
    classinfo = cache.readmulti(cacheId, filePath)
    classvariants = None
    if classinfo == None or 'svariants' not in classinfo:  # 'svariants' = supported variants
        if generate:
            classvariants = []
            tree = treeLoader.getTree(fileId, {})  # get complete tree
            getClassVariantsFromTree(tree, classvariants, console)       # get variants used in qx.core.Variant...(<variant>,...)
            if classinfo == None:
                classinfo = {}
            classinfo['svariants'] = classvariants
            cache.writemulti(cacheId, classinfo)

    return classinfo['svariants']

##
# helper that operates on ecmascript.frontend.tree
def getClassVariantsFromTree(node, classvariants, console):
    # mostly taken from ecmascript.transform.optimizer.variantoptimizer
    variants = treeutil.findVariablePrefix(node, "qx.core.Variant")
    for variant in variants:
        if not variant.hasParentContext("call/operand"):
            continue
        variantMethod = treeutil.selectNode(variant, "identifier[4]/@name")
        if variantMethod not in ["select", "isSet", "compilerIsSet"]:
            continue
        firstParam = treeutil.selectNode(variant, "../../params/1")
        if firstParam and treeutil.isStringLiteral(firstParam):
            classvariants.append(firstParam.get("value"))
        else:
            console.warn("! qx.core.Variant call without literal argument")

