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


class AssetHint(object):
    __slots__ = ("source", "expanded", "regex", "clazz", "seen")

    def __init__ (self, source=""):
        self.source   = source  # "qx/icon/${qx.icontheme}/32/*"
        self.expanded = u""   # "qx/icon/Tango/32/.*"
        self.regex    = None  # re.compile("qx/icon/Tango/32/.*")
        self.clazz    = None  # classObj that uses this hint
        self.seen     = False # whether a resource has matched this hint

    def __eq__ (self, other):
        return self.expanded == other.expanded
