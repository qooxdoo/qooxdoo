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
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# PartBuilder -- create packages and associates parts to packages, from parts configuration and class list
#
# Interface:
# - PartBuilder.getPackages()
##

import sys

class Part(object):
    def __init__(self, name):
        self.name      = name
        self.bit_mask  = -1   # power of 2 identifying this part
        self.initial_deps = []   # initial deps, as defined in config
        self.deps      = []   # list of classes this part depends on, with defining classes from other parts excluded
        self.packages  = []   # list of packages constituting this part

class Package(object):
    def __init__(self, id):
        self.id         = id   # int representing bit mask for each using part turned on
        self.classes    = []   # list of classes in this package
        self.part_count = 0    # number of parts using this package
        self.parts      = []


class PartBuilder:
    def __init__(self, console, depLoader, compiler):
        self._console   = console
        self._depLoader = depLoader
        self._compiler  = compiler


    def getPackages(self, partIncludes, smartExclude, classList, variants, jobContext):
        # Get config settings
        jobConfig                 = jobContext["jobconf"]
        minPackageSize            = jobConfig.get("packages/sizes/min-package", 0)
        minPackageSizeForUnshared = jobConfig.get("packages/sizes/min-package-unshared", None)
        partsCfg                  = jobConfig.get("packages/parts", {})
        collapseCfg               = jobConfig.get("packages/collapse", [])
        boot                      = jobConfig.get("packages/init", "boot")

        # Automatically add boot part to collapse list
        if boot in partsCfg and not boot in collapseCfg:
            collapseCfg.append(boot)

        # Preprocess part data
        parts    = {}  # map of Parts
        parts    = self._getParts(partIncludes)
        parts    = self._getPartDeps(parts, variants, smartExclude, classList)

        # Compute packages
        packages = {}  # map of Packages
        packages = self._getPackages(parts)

        self._printPartStats(packages, parts)

        # Collapse parts
        if len(collapseCfg) > 0:
            self._collapseParts(parts, packages, collapseCfg)

        # Optimize packages
        if minPackageSize != None and minPackageSize != 0:
            self._optimizePackages(packages, parts, variants, minPackageSize, minPackageSizeForUnshared)

        self._printPartStats(packages, parts)

        # Post process results
        resultParts = self._getFinalPartData(packages, parts)

        resultClasses = self._getFinalClassList(packages, variants)

        # Return
        # {Map}   resultParts[partId] = [packageId1, packageId2]
        # {Array} resultClasses[packageId] = [class1, class2]
        return boot, resultParts, resultClasses


    ##
    # create the set of parts, each part with a unique single-bit bit mask
    # @returns {Map} parts = { partName : Part() }

    def _getParts(self, partIncludes):
        self._console.debug("Creating part structures...")

        self._console.indent()
        parts = {}
        for partPos, partId in enumerate(partIncludes):
            npart          = Part(partId)    # create new Part object
            npart.bit_mask = 1<<partPos      # add unique bit
            npart.initial_deps = partIncludes[partId][:]  # defining classes from config
            npart.deps     = partIncludes[partId][:]  # initialize dependencies with defining classes
            parts[partId]  = npart
            self._console.debug("Part #%s => %s" % (partId, npart.bit_mask))

        self._console.outdent()

        return parts


    ##
    # create the complete list of class dependencies for each part

    def _getPartDeps(self, parts, variants, smartExclude, classList):
        self._console.debug("")
        self._console.info("Resolving part dependencies...")
        self._console.indent()

        for part in parts.values():
            # Exclude initial classes of other parts
            partExcludes = []
            for otherPartId in parts:
                if otherPartId != part.name:
                    partExcludes.extend(parts[otherPartId].initial_deps)

            # Extend with smart excludes
            partExcludes.extend(smartExclude)

            # Remove unknown classes before checking dependencies
            for classId in part.deps:
                if not classId in classList:
                    part.deps.remove(classId)

            # Checking we have something to include
            if len(part.deps) == 0:
                self._console.info("Part #%s is ignored in current configuration" % part.name)
                continue

            # Finally resolve the dependencies
            partClasses = self._depLoader.resolveDependencies(part.deps, partExcludes, variants)

            # Remove all unknown classes
            for classId in partClasses[:]:  # need to work on a copy because of changes in the loop
                if not classId in classList:
                    partClasses.remove(classId)

            # Store
            self._console.debug("Part #%s depends on %s classes" % (part.name, len(partClasses)))
            part.deps = partClasses

        return parts


    ##
    # cut an initial set of packages out of the set of classes needed by the parts
    # @returns {Map} { packageId : Package }

    def _getPackages(self, parts):
        # Generating list of all classes
        allClasses = {}
        for part in parts.values():
            for classId in part.deps:
                allClasses[classId] = True

        # Check for each class which part is using it;
        # create a package for each set of classes which
        # are used by the same combination of parts;
        # track how many parts are using a particular package
        packages = {}
        for classId in allClasses.keys():
            pkgId     = 0

            for part in parts.values():
                if classId in part.deps:
                    pkgId     |= part.bit_mask

            if not packages.has_key(pkgId):
                package            = Package(pkgId)
                packages[pkgId]    = package

            packages[pkgId].classes.append(classId)

        # Which packages does a part use - and vice versa
        for package in packages.values():
            for part in parts.values():
                if package.id & part.bit_mask:
                    part.packages.append(package.id)
                    package.parts.append(part.name)
                    
            package.part_count = len(package.parts)

        # Sorting packages of parts
        for part in parts.values():
            part.packages = self._sortPackages(part.packages, packages)

        return packages


    def _collapseParts(self, parts, packages, collapseParts):
        # Support for package collapsing
        # Could improve latency when initial loading an application
        # Merge all packages of a specific part into one (also supports multiple parts)
        # Hint: Part packages are sorted by priority, this way we can
        # easily merge all following packages with the first one, because
        # the first one is always the one with the highest priority
        self._console.debug("")
        self._console.info("Collapsing part packages...")
        self._console.indent()

        for collapsePos, partId in enumerate(collapseParts):
            part = parts[partId]
            self._console.debug("Part %s..." % (partId))
            self._console.indent()

            toId = part.packages[collapsePos]  # TODO: why shifting the 'to' position with each part??
            for fromId in part.packages[collapsePos+1:]:
                self._console.debug("Merging package #%s into #%s" % (fromId, toId))
                self._mergePackage(packages[fromId], packages[toId], parts, packages, collapseParts)

            # creates:
            # part#1 : [package]
            # part#2 : [package, package]
            # part#3 : [package, package, package]
            # ...
            self._console.outdent()
        self._console.outdent()



    def _computePackageSize(self, package, variants):
        packageSize = 0

        self._console.indent()
        for classId in package.classes:
            packageSize += self._compiler.getCompiledSize(classId, variants)
        self._console.outdent()

        return packageSize



    def _optimizePackages(self, packages, parts, variants, minPackageSize, minPackageSizeForUnshared):
        # Support for merging small packages
        # The first common package before the selected package between two
        # or more parts is allowed to merge with. As the package which should be merged
        # may have requirements, these must be solved. The easiest way to be sure regarding
        # this issue, is to look out for another common package. (TODO: ???)

        self._console.debug("")
        self._console.info("Optimizing package sizes...")
        self._console.indent()
        self._console.debug("Minimum size: %sKB" % minPackageSize)
        self._console.indent()
        
        if minPackageSizeForUnshared == None:
            minPackageSizeForUnshared = minPackageSize

        # Start at the end with the sorted list
        # e.g. merge 4->7 etc.
        allPackages = self._sortPackages(packages.keys(), packages)
        allPackages.reverse()

        # Test and optimize 'fromId'
        for fromId in allPackages:
            fromPackage = packages[fromId]
            packageSize = self._computePackageSize(fromPackage, variants) / 1024
            self._console.debug("Package #%s: %sKB" % (fromPackage.id, packageSize))
            # check selectablility
            if (fromPackage.part_count == 1) and (packageSize >= minPackageSizeForUnshared):
                continue
            if (fromPackage.part_count > 1) and (packageSize >= minPackageSize):
                continue

            # assert: the package is shared and smaller than minPackageSize
            #     or: the package is unshared and smaller than minPackageSizeForUnshared
            self._console.indent()
            self._console.debug("Search a target package for package #%s" % (fromPackage.id,))
            toPackage = self._getPreviousCommonPackage(fromPackage, parts, packages)
            if toPackage != None:
                self._console.debug("Merge package #%s into #%s" % (fromPackage.id, toPackage.id))
                self._mergePackage(fromPackage, toPackage, parts, packages, None)

            self._console.outdent()

        self._console.outdent()
        self._console.outdent()



    def _sortPackages(self, packageIds, packages):
        def keyFunc (pkgId):
            return packages[pkgId].part_count

        packageIds.sort(key=keyFunc, reverse=True)

        return packageIds


    def _getPreviousCommonPackage(self, searchPackage, parts, packages):
        # get the "smallest" package (in the sense of _sortPackages()) that is 
        # in all parts searchPackage is in, and is earlier in the corresponding
        # packages lists

        def isCommonAndGreaterPackage(searchId, package):  
            # the same package is not "greater"
            if package.id == searchId:
                return False
            # the next takes advantage of the fact that the package id encodes
            # the parts a package is used by. if another package id has the
            # same bits turned on, it is in the same packages. this is only
            # true for the searchId package itself and package id's that have
            # more bits turned on (ie. are "greater"); hence, and due to 
            # _sortPackages, they are earlier in the packages list of the
            # corresponding parts
            if searchId & package.id == searchId:
                return True
            return False

        searchId            = searchPackage.id
        allPackages         = reversed(self._sortPackages(packages.keys(), packages))
                                # sorting and reversing assures we try "smaller" package id's first

        for packageId in allPackages:
            package = packages[packageId]
            if isCommonAndGreaterPackage(searchId, package):
                return package

        return None


    def collapsePartsByOrder(parts, packages):

        def getCollapseGroupsOrdered():
            # returns list of parts grouped by collapse index
            collapsGroups = {}
            # boot part is always collapse index 0
            collapseGroups[0] = set((parts['boot'],))

            for partname in parts:
                part = parts[partname]
                collidx = getattr(part, 'collapse_index', None)
                if collidx:
                    if collidx < 1 :  # not allowed
                        raise RuntimeError, "Collapse index must be 1 or greater (Part: %s)" % partname
                    else:
                        if collidx not in collapseGroups:
                            collapseGroups[collidx] = set(())
                        collapseGroups[collidx].add(part)

            return

        def mergeUniquePackages(collapse_group, parts, packages):
            for part in collapse_group:
                pass
            return parts, packages

        def mergeCommonPackages(collapse_group, parts, packages):
            return parts, packages

        collapse_groups = getCollapseGroupsOrdered(parts, packages)

        for collgrp in collapse_groups:
            parts, packages = mergeUniquePackages(collgrp, parts, packages)
            parts, packages = mergeCommonPackages(collgrp, parts, packages)

        return


    def _mergePackage(self, fromPackage, toPackage, parts, packages, collapseParts=None):

        # Update part information
        for part in parts.values():
            if fromPackage.id in part.packages:
                # when collapsing parts, check if the toPackage.id is available in the packages of
                # the parts that should be collapsed. In all other parts, the toPackage.id is allowed
                # to be not available.
                # TODO: Why is that so?! Aren't you loosing dependency information that way?!
                if (collapseParts != None 
                    and part.name in collapseParts 
                    and not toPackage.id in part.packages
                   ):
                    raise RuntimeError, "Could not merge these packages (%s, %s)!" % (fromPackage.id, toPackage.id)
                # remove package
                part.packages.remove(fromPackage.id)

        # Merging package content
        toPackage.classes.extend(fromPackage.classes)
        del packages[fromPackage.id]



    def _getFinalPartData(self, packages, parts):
        packageIds = self._sortPackages(packages.keys(), packages)

        resultParts = {}
        for toId, fromId in enumerate(packageIds):
            for partId in parts:
                if fromId in parts[partId].packages:
                    if not resultParts.has_key(partId):
                        resultParts[partId] = [toId]
                    else:
                        resultParts[partId].append(toId)

        return resultParts



    def _getFinalClassList(self, packages, variants):
        packageIds = self._sortPackages(packages.keys(), packages)

        resultClasses = []
        for pkgId in packageIds:
            resultClasses.append(self._depLoader.sortClasses(packages[pkgId].classes, variants))

        return resultClasses



    def _printPartStats(self, packages, parts):
        packageIds = packages.keys()
        packageIds.sort()
        packageIds.reverse()

        self._console.debug("")
        self._console.debug("Package summary")
        self._console.indent()
        for packageId in packageIds:
            self._console.debug("Package #%s contains %s classes" % (packageId, len(packages[packageId].classes)))
        self._console.outdent()

        self._console.debug("")
        self._console.debug("Part summary")
        self._console.indent()
        for part in parts.values():
            pkgList = []
            for entry in part.packages:
                pkgList.append("#%s" % entry)

            self._console.debug("Part #%s uses these packages: %s" % (part.name, ", ".join(pkgList)))

        self._console.outdent()
        self._console.debug("")
