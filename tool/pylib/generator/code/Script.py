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
# Script -- Internal representation of all script code comprising an
#           application / library
##

class Script(object):

    def __init__(self, ):
        self.classes    = []   # classes making up the application / library
        self.variants   = []
        self.parts      = {}   # parts defined by the configuration (if any)
        self.packages   = {}   # .js files for this application / library
        self.boot       = "boot"
        self.packageIdsSorted = []  # the keys of self.packages sorted in load order

    ##
    # return old-style array of arrays of classIds in self.packageIdsSorted order
    def packagesArraySorted(self):
        assert self.packageIdsSorted
        assert self.packages is not None
        packageClasses = []
        for pkgId in self.packageIdsSorted:
            packageClasses.append(self.packages[pkgId].classes)
        return packageClasses


