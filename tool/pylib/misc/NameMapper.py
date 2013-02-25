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
# Mixin to generate unique short strings.
##

from misc.util import convert
from ecmascript.frontend import lang

class NameMapper(object):

    def __init__(self, check_set=None):
        self.check_set = check_set or set()
        self.check_set.update(lang.RESERVED.keys())  # make sure these are in
        self.counter = 0

    def mapper(self, name, check_set=None):
        checkset = check_set or self.check_set
        repl = convert(self.counter)
        self.counter += 1
        while repl in checkset:   # checkset is not updated, since we never generate the same repl twice
            repl = convert(self.counter)
            self.counter += 1
        return repl

