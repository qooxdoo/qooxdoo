#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2013 1&1 Internet AG, Germany, http://www.1und1.de
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
# A class to represent an issue found in JS source code.
#
##

import re, os, sys, types

class CodeIssue(object):

    def __init__(self):
        self.msg = ""   # might contain placeholders for args
        self.args = ()  # such that 'self.msg % self.args' gives a nice, expressive message
        self.line = -1
        self.column = -1
