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

from misc import util

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
        self.class_list = []   # list of classes in this package
        self.part_count = 0    # number of parts using this package


class PartBuilder:
    def __init__(self, console, depLoader, compiler):
        self._console = console
        self._depLoader = depLoader
        self._compiler = compiler


    def getPackages(self, partIncludes, smartExclude, classList, collapseParts, variants, jobContext):
        # Get config settings
        jobConfig = jobContext["jobconf"]
        minPackageSize = jobConfig.get("packages/sizes/min-package", 0)
        minPackageSizeForUnshared = jobConfig.get("packages/sizes/min-package-unshared", None)

        parts = {}  # map of Parts

        # Preprocess part data
        parts    = self._getParts(partIncludes)
        parts    = self._getPartDeps(parts, variants, smartExclude, classList)

        packages = {}  # map of Packages

        # Compute packages
        packages        = self._getPackageClasses(parts)
        packages, parts = self._getPackageUsers(packages, parts)

        self._printPartStats(packages, parts)

        # Collapse parts
        if len(collapseParts) > 0:
            self._collapseParts(parts, packages, collapseParts)

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
        return resultParts, resultClasses


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

    def _getPackageClasses(self, parts):
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
                package.part_count = util.countBitsOn(pkgId)
                packages[pkgId]    = package

            packages[pkgId].class_list.append(classId)

        # which packages does a part use?
        for package in packages.values():
            for part in parts.values():
                if package.id & part.bit_mask:
                    part.packages.append(package.id)

        return packages


    def _getPackageUsers(self, packages, parts):

        # Sorting package list
        for part in parts.values():
            part.packages = self._sortPackages1(part.packages, packages)

        return packages, parts



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
            self._console.debug("Part %s..." % (partId))
            self._console.indent()

            toId = parts[partId].packages[collapsePos]
            for fromId in parts[partId].packages[collapsePos+1:]:
                self._console.debug("Merging package #%s into #%s" % (fromId, toId))
                self._mergePackage1(fromId, toId, parts, packages, collapseParts)

            self._console.outdent()
        self._console.outdent()



    def _computePackageSize(self, packageClasses, packageId, variants):
        packageSize = 0

        self._console.indent()
        for classId in packageClasses[packageId]:
            packageSize += self._compiler.getCompiledSize(classId, variants)
        self._console.outdent()

        return packageSize



    def _optimizePackages(self, packages, parts, variants, minPackageSize, minPackageSizeForUnshared):
        # Support for merging small packages
        # The first common package before the selected package between two
        # or more parts is allowed to merge with. As the package which should be merged
        # may have requirements, these must be solved. The easiest way to be sure regarding
        # this issue, is to look out for another common package.

        self._console.debug("")
        self._console.info("Optimizing package sizes...")
        self._console.indent()
        self._console.debug("Minimum size: %sKB" % minPackageSize)
        self._console.indent()
        
        if minPackageSizeForUnshared == None:
            minPackageSizeForUnshared = minPackageSize

        # Start at the end with the sorted list
        # e.g. merge 4->7 etc.
        #packageIds = packages.keys()
        packageUsers = dict([(x.id,x.part_count) for x in packages.values()])
        #self._sortPackages(packageIds, packageUsers)
        packageIds = self._sortPackages1(packages.keys(), packages)
        packageIds.reverse()

        packageClasses = dict([(x.id,x.class_list) for x in packages.values()])

        # Test and optimize 'fromId'
        for fromId in packageIds:
            packageSize = self._computePackageSize(packageClasses, fromId, variants) / 1024
            self._console.debug("Package #%s: %sKB" % (fromId, packageSize))
            if (packageUsers[fromId] == 1) and (packageSize >= minPackageSizeForUnshared):
                continue
            if (packageUsers[fromId] > 1) and (packageSize >= minPackageSize):
                continue

            partPackages = dict([(x.name, x.packages) for x in parts.values()])
            toId = self._getPreviousCommonPackage(fromId, partPackages, packageUsers)
            #toId = self._getPreviousCommonPackage1(fromId, parts, packages)
            if toId != None:
                self._console.indent()
                self._console.debug("Merge package #%s into #%s" % (fromId, toId))
                self._mergePackage1(fromId, toId, parts, packages, None)
                self._console.outdent()

        self._console.outdent()
        self._console.outdent()



    def _sortPackages(self, packageIds, packageUsers):
        def _cmpPackageIds(pkgId1, pkgId2):
            if packageUsers[pkgId2] > packageUsers[pkgId1]:
                return 1
            elif packageUsers[pkgId2] < packageUsers[pkgId1]:
                return -1

            return pkgId2 - pkgId1

        packageIds.sort(_cmpPackageIds)

        return packageIds


    def _sortPackages1(self, packageIds, packages):
        def _cmpPackageIds(pkgId1, pkgId2):
            if packages[pkgId2].part_count > packages[pkgId1].part_count:
                return 1
            elif packages[pkgId2].part_count < packages[pkgId1].part_count:
                return -1

            return pkgId2 - pkgId1
            
        def keyFunc (pkgId):
            return packages[pkgId].part_count

        print "xxx sorting..."
        #packageIds.sort(_cmpPackageIds)
        packageIds.sort(key=keyFunc, reverse=True)

        return packageIds




    def _getPreviousCommonPackage(self, searchId, partPackages, packageUsers):
        relevantParts = []
        relevantPackages = []

        for partId in partPackages:
            packages = partPackages[partId]
            if searchId in packages:
                relevantParts.append(partId)
                relevantPackages.extend(packages[:packages.index(searchId)])

        # Sorted by priority, but start from end
        self._sortPackages(relevantPackages, packageUsers)
        relevantPackages.reverse()

        # Check if a package is available identical times to the number of parts
        for packageId in relevantPackages:
            if relevantPackages.count(packageId) == len(relevantParts):
                return packageId

        return None


    def _getPreviousCommonPackage1(self, searchId, parts, packages):
        relevantParts = []
        relevantPackages = []

        for partId in partPackages:
            packages = partPackages[partId]
            if searchId in packages:
                relevantParts.append(partId)
                relevantPackages.extend(packages[:packages.index(searchId)])

        # Sorted by priority, but start from end
        self._sortPackages(relevantPackages, packageUsers)
        relevantPackages.reverse()

        # Check if a package is available identical times to the number of parts
        for packageId in relevantPackages:
            if relevantPackages.count(packageId) == len(relevantParts):
                return packageId

        return None



    def _mergePackage(self, fromId, toId, partPackages, packageClasses, collapseParts=None):
        # Update part information
        for partId in partPackages:
            partContent = partPackages[partId]

            if fromId in partContent:
                # When collapsing parts, check if the toId is available in the packages of
                # the parts that should be collapsed. In all other parts beside the parts 
                # that should be collapsed, the toId is allowed to be not available.
                if collapseParts != None and partId in collapseParts and not toId in partPackages[partId]:
                    self._console.error("Could not merge these packages!")
                    sys.exit(0)

                # fromPos = partContent.index(fromId)
                # toPos = partContent.index(toId)
                # self._console.debug("Merging package at position #%s into #%s" % (fromPos, toPos))

                partPackages[partId].remove(fromId)

        # Merging package content
        packageClasses[toId].extend(packageClasses[fromId])
        del packageClasses[fromId]


    def _mergePackage1(self, fromPackageName, toPackageName, parts, packages, collapseParts=None):
        # Update part information
        for part in parts.values():
            partContent = part.packages

            if fromPackageName in partContent:
                # When collapsing parts, check if the toPackageName is available in the packages of
                # the parts that should be collapsed. In all other parts beside the parts 
                # that should be collapsed, the toPackageName is allowed to be not available.
                if collapseParts != None and part.name in collapseParts and not toPackageName in part.packages:
                    self._console.error("Could not merge these packages!")
                    sys.exit(0)

                # fromPos = partContent.index(fromPackageName)
                # toPos = partContent.index(toPackageName)
                # self._console.debug("Merging package at position #%s into #%s" % (fromPos, toPos))

                part.packages.remove(fromPackageName)

        # Merging package content
        packages[toPackageName].class_list.extend(packages[fromPackageName].class_list)
        del packages[fromPackageName]



    def _getFinalPartData(self, packages, parts):
        #packageUsers = dict([(x.id, x.part_count) for x in packages.values()])
        #packageIds = self._sortPackages(packages.keys(), packageUsers)
        packageIds = self._sortPackages1(packages.keys(), packages)

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
        #packageUsers = dict([(x.id, x.part_count) for x in packages.values()])
        #packageIds = self._sortPackages(packages.keys(), packageUsers)
        packageIds = self._sortPackages1(packages.keys(), packages)

        resultClasses = []
        for pkgId in packageIds:
            resultClasses.append(self._depLoader.sortClasses(packages[pkgId].class_list, variants))

        return resultClasses



    def _printPartStats(self, packages, parts):
        packageIds = packages.keys()
        packageIds.sort()
        packageIds.reverse()

        self._console.debug("")
        self._console.debug("Package summary")
        self._console.indent()
        for packageId in packageIds:
            self._console.debug("Package #%s contains %s classes" % (packageId, len(packages[packageId].class_list)))
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
