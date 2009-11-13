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
# Part -- Internal representation of an application part
##

class Part(object):
    def __init__(self, name):
        self.name      = name
        self.bit_mask  = -1   # power of 2 identifying this part
        self.initial_deps = []   # initial deps, as defined in config
        self.deps      = []   # list of classes this part depends on, with defining classes from other parts excluded
        self.packages  = []   # list of packages constituting this part
        #self.packageIdsSorted = [] # list of sorted package id's of this part
        self.no_merge_private_package = False # whether the specific package in this part should be protected from merging

    def __repr__(self):
        return "<%s:%s>" % (self.__class__.__name__,self.name)

    ##
    # returns a list of the packages of this part, as indices into the provided
    # list of package Id's

    def packagesAsIndices(self, packageIdsSorted):
        result = []
        for package in self.packages:
            result.append(packageIdsSorted.index(package.id))
        return result

    def _sortPackages(self,):  # packages: [Package]
        def cmpFunc (x, y):
            if x.part_count != y.part_count:
                return cmp(x.part_count, y.part_count)
            else:
                if x in y.packageDeps:  # y needs x, so x is "larger" (must be earlier)
                    return 1
                elif y in x.packageDeps: # other way round
                    return -1
                else:
                    return 0

        packages = self.packages[:]
        #packages.sort(key=lambda x: x.part_count, reverse=True)
        packages.sort(cmp=cmpFunc, reverse=True)
        return packages

    def _setPackageIdsSorted(self, value):
        pass # ignore the value - will be generated on get

    packageIdsSorted = property(_sortPackages, _setPackageIdsSorted)


