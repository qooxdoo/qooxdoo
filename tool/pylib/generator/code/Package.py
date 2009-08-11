#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
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
# Package -- Internal representation of a script package
##

class Package(object):
    def __init__(self, id):
        self.id         = id   # int representing bit mask for each using part turned on
        self.classes    = []   # list of classes in this package
        self.part_count = 0    # number of parts using this package
        self.parts      = []


