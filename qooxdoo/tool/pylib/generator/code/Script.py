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
# Script -- Internal representation of all script code comprising an
#           application / library
##

from generator.code.Package import Package

class Script(object):

    def __init__(self, ):
        self.classes    = []   # classes making up the application / library
        self.variants   = []
        self.parts      = {}   # parts defined by the configuration (if any); {part.name : part}
        self.packages   = {}   # .js files for this application / library;  {package.id : package}
        self.boot       = "boot"
        self.packageIdsSorted = []  # the keys of self.packages sorted in load order
        self.buildType  = ""   # "source"/"build"

    ##
    # return old-style array of arrays of classIds in self.packageIdsSorted order
    def packagesArraySorted(self):
        assert self.packageIdsSorted
        assert self.packages is not None
        packageClasses = []
        for pkgId in self.packageIdsSorted:
            packageClasses.append(self.packages[pkgId].classes)
        return packageClasses


    ##
    # sort the packages in all parts
    
    def sortParts(self):
        for part in self.parts.values():
            part.packagesSorted
            
    ##
    # return sorted array of script's packages
    
    def packagesSortedSimple(self):
        return Package.simpleSort(self.packages.values())

    ##
    # generates a sequence of consecutive powers of 2: 1, 2, 4, 8, ...
     
    def getPartBitMask(self, c=[0]):
        bitmask = 1L<<c[0]
        c[0] += 1
        return bitmask



