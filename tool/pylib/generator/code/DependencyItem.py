#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
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

import types

##
## 
class DependencyItem(object):
    def __init__(self, name, attribute, requestor, line=-1, isLoadDep=False):
        self.name           = name       # "qx.Class" [dependency to (class)]
        assert isinstance(name, types.StringTypes)
        self.attribute      = attribute  # "methodA"   [dependency to (class.attribute)]
        self.requestor      = requestor  # "gui.Application" [the one depending on this item]
        self.line           = line       # 147        [source line in dependent's file]
        self.isLoadDep      = isLoadDep  # True       [load or run dependency]
        self.needsRecursion = False      # this is a load-time dep that draws in external deps recursively
        self.isCall         = False      # whether the reference is a function call
    def __repr__(self):
        return "<DepItem>:" + self.name + "#" + self.attribute
    def __str__(self):
        return self.name + "#" + self.attribute
    def __eq__(self, other):
        return (self.name == other.name and self.attribute == other.attribute
                and self.requestor == other.requestor and self.line == other.line
                )
    def __hash__(self):
        return hash(self.name + self.attribute)


