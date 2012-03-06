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

##
# Part -- Internal representation of an application part
##

from generator.code.Package import Package

class Part(object):
    def __init__(self, name):
        self.name      = name
        self.bit_mask  = -1   # power of 2 identifying this part
        self.initial_deps = []   # initial deps, as defined in config
        self.deps      = []   # list of classIds this part depends on, with defining classes from other parts excluded
        self.packages  = []   # list of Packages constituting this part
        self.no_merge_private_package = False # whether the specific package in this part should be protected from merging
        self.is_ignored= False      # a part might get ignored, e.g. if it is empty

    def __repr__(self):
        return "<%s:%s>" % (self.__class__.__name__,self.name)

    ##
    # returns a list of the packages of this part, as indices into the provided
    # list of package Id's

    def packagesAsIndices(self, packagesSorted):
        result = []
        for package in self.packages:
            result.append(packagesSorted.index(package))
        return result

    def _sortPackages(self, packages_=None):  # packages: [Package]

        if packages_:
            packages = packages_
        else:
            packages = self.packages

        packages.sort(cmp=Package.compareWithDeps, reverse=True)
        return packages

    packagesSorted   = property(_sortPackages)


