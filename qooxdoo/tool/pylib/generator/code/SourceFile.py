#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
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
# Class -- Internal representation of a qooxdoo class/file
##

import os, sys, re, types, codecs

class SourceFile(object):

    def __init__(self, id):
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

