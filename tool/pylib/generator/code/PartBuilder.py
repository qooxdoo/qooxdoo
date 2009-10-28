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
from misc                   import util
from generator.code.Part    import Part
from generator.code.Package import Package

class PartBuilder(object):

    def __init__(self, console, depLoader, compiler):
        self._console   = console
        self._depLoader = depLoader
        self._compiler  = compiler


    def getPackages(self, partIncludes, smartExclude, jobContext, script):
        # Get config settings
        jobConfig                 = jobContext["jobconf"]
        self._jobconf             = jobConfig
        minPackageSize            = jobConfig.get("packages/sizes/min-package", 0)
        minPackageSizeForUnshared = jobConfig.get("packages/sizes/min-package-unshared", None)
        partsCfg                  = jobConfig.get("packages/parts", {})
        collapseCfg               = jobConfig.get("packages/collapse", [])
        boot                      = jobConfig.get("packages/init", "boot")

        script.boot               = boot

        # Automatically add boot part to collapse list
        if boot in partsCfg and not boot in collapseCfg:
            collapseCfg.append(boot)

        # Preprocess part data
        script.parts    = {}  # map of Parts
        script.parts    = self._getParts(partIncludes, partsCfg)
        script.parts    = self._getPartDeps(script, smartExclude)

        # Compute packages
        script.packages = {}  # map of Packages
        script.packages = self._getPackages(script)

        self._printPartStats(script)

        # Collapse parts by collapse order
        self.collapsePartsByOrder(script)

        # Collapse parts by package size
        self.collapsePartsBySize(script, minPackageSize, minPackageSizeForUnshared)

        self._printPartStats(script)

        # Post process results
        resultParts = self._getFinalPartData(script)

        #resultClasses = self._getFinalClassList(script)
        script = self._getFinalClassList1(script)
        #resultClasses = util.dictToList(resultClasses) # turn map into list, easier for upstream methods

        #script.parts    = resultParts
        #script.packages = resultClasses

        # Return
        # {Map}   resultParts[partId] = [packageId1, packageId2]
        # {Array} resultClasses[packageId] = [class1, class2]
        #return boot, resultParts, resultClasses
        return resultParts, script


    ##
    # create the set of parts, each part with a unique single-bit bit mask
    # @returns {Map} parts = { partName : Part() }

    def _getParts(self, partIncludes, partsCfg):
        self._console.debug("Creating part structures...")

        self._console.indent()
        parts = {}
        for partPos, partId in enumerate(partIncludes):
            npart          = Part(partId)    # create new Part object
            npart.bit_mask = 1<<partPos      # add unique bit
            npart.initial_deps = partIncludes[partId][:]  # defining classes from config
            npart.deps     = partIncludes[partId][:]  # initialize dependencies with defining classes
            if 'expected-load-order' in partsCfg[partId]:
                npart.collapse_index = partsCfg[partId]['expected-load-order']
            parts[partId]  = npart
            self._console.debug("Part #%s => %s" % (partId, npart.bit_mask))

        self._console.outdent()

        return parts


    ##
    # create the complete list of class dependencies for each part

    def _getPartDeps(self, script, smartExclude):
        parts    = script.parts
        variants = script.variants
        classList= script.classes

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
            partClasses = self._depLoader.classlistFromInclude(part.deps, partExcludes, variants)

            # Remove all unknown classes
            for classId in partClasses[:]:  # need to work on a copy because of changes in the loop
                if not classId in classList:
                    partClasses.remove(classId)

            # Store
            self._console.debug("Part #%s depends on %s classes" % (part.name, len(partClasses)))
            part.deps = partClasses

        self._console.outdent()
        return parts


    ##
    # cut an initial set of packages out of the set of classes needed by the parts
    # @returns {Map} { packageId : Package }

    def _getPackages(self, script):
        parts = script.parts
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
                    #part.packages.append(package.id)
                    part.packages.append(package)
                    #package.parts.append(part.name)
                    package.parts.append(part)
                    
            package.part_count = len(package.parts)

        # Sorting packages of parts
        for part in parts.values():
            part.packageIdsSorted = self._sortPackages([x.id for x in part.packages], packages)
            # re-map sorting to part.packages
            packObjs = []
            for pkgId in part.packageIdsSorted:
                packObjs.append(packages[pkgId])
            part.packages = packObjs
         
        return packages


    def _computePackageSize(self, package, variants):
        packageSize = 0

        self._console.indent()
        for classId in package.classes:
            packageSize += self._compiler.getCompiledSize(classId, variants)
        self._console.outdent()

        return packageSize


    ##
    # Support for merging small packages.
    #
    # Small (as specified in the config) packages are detected, starting with 
    # those that are used by the least parts, and are merged into packages that
    # are used by the same and more parts.

    def collapsePartsBySize(self, script, minPackageSize, minPackageSizeForUnshared):

        if minPackageSize == None or minPackageSize == 0:
            return

        packages  = script.packages
        parts     = script.parts
        variants  = script.variants
        self._console.debug("")
        self._console.info("Collapsing parts by package sizes...")
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
            self._mergePackage(fromPackage, parts, packages)

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
        self._console.debug("Search a target package for package #%s" % (searchId,))
        allPackages         = reversed(self._sortPackages(packages.keys(), packages))
                                # sorting and reversing assures we try "smaller" package id's first

        for packageId in allPackages:
            package = packages[packageId]
            if isCommonAndGreaterPackage(searchId, package):
                yield package

        yield None


    ##
    # Support for collapsing parts along their expected load order
    #
    # Packages are merged in parts that define an expected load order, starting
    # with the boot part and continuing with groups of parts that have the same
    # load index, in increasing order. Within a group, packages are merged from
    # least used to more often used, and with packages unique to one of the parts
    # in the group to packages that are common to all parts.
    # Target packages for one group are blocked for the merge process of the next,
    # to avoid merging all packages into one "monster" package that all parts
    # share eventually.

    def collapsePartsByOrder(self, script):
        
        def getCollapseGroupsOrdered(parts, packages):
            # returns dict of parts grouped by collapse index
            # { 0 : set('boot'), 1 : set(part1, part2), 2 : ... }
            collapseGroups    = {}
            # boot part is always collapse index 0
            boot              = self._jobconf.get("packages/init", "boot")
            collapseGroups[0] = set((parts[boot],))

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

            return collapseGroups

        def isUnique(package, collapse_group):
            seen = 0
            for part in collapse_group:
                if package in part.packageIdsSorted:
                    seen += 1
                    if seen > 1:
                        return False
            return True

        def isCommon(package, collapse_group):
            seen = 0
            for part in collapse_group:
                if package in part.packageIdsSorted:
                    seen += 1
            return seen == len(collapse_group)

        def getUniquePackages(part, collapse_group, packages):
            uniques = {}
            #for packId in part.packages:
            #    package = packages[packId]
            for package in part.packages:
                if isUnique(package.id, collapse_group):
                    uniques[package.id] = package
            return uniques

        getUniquePackages.key = 'unique'

        def getCommonPackages(part, collapse_group, packages):
            commons = {}
            #for packId in part.packages:
            #    package = packages[packId]
            for package in part.packages:
                if isCommon(package.id, collapse_group):
                    commons[package.id] = package
            return commons

        getCommonPackages.key = 'common'


        def mergeGroupPackages(selectFunc, collapse_group, parts, packages, seen_targets):
            self._console.debug("collapsing %s packages..." % selectFunc.key)
            self._console.indent()
            curr_targets = set(())

            for part in collapse_group:
                selected_packages = selectFunc(part, collapse_group, packages)
                #print "xxx selecteds: %r" % selected_packages
                #for packId in reversed(part.packages):   # start with "smallest" package
                #    package = packages[packId]
                for package in reversed(part.packages):   # start with "smallest" package
                    if package.id in selected_packages:
                        mergedPackage, targetPackage = self._mergePackage(package, parts, selected_packages, seen_targets)
                        if mergedPackage:  # on success == package
                            del packages[package.id]  # since we didn't pass in the whole packages struct to _mergePackage
                            curr_targets.add(targetPackage)

            seen_targets.update(curr_targets)
            self._console.outdent()
            return parts, packages
        
        # ---------------------------------------------------------------------

        parts    = script.parts
        packages = script.packages

        self._console.debug("")
        self._console.info("Collapsing parts by collapse order...")
        self._console.indent()

        collapse_groups = getCollapseGroupsOrdered(parts, packages)
        seen_targets    = set(())

        for collidx in sorted(collapse_groups.keys()): # go through groups in load order
            collgrp         = collapse_groups[collidx]
            self._console.debug("Collapse group %d %r" % (collidx, [x.name for x in collgrp]))
            self._console.indent()

            parts, packages = mergeGroupPackages(getUniquePackages, collgrp, parts, packages, seen_targets)
            parts, packages = mergeGroupPackages(getCommonPackages, collgrp, parts, packages, seen_targets)

            self._console.outdent()

        self._console.outdent()
        return


    def _mergePackage(self, fromPackage, parts, packages, seen_targets=None):
        # find toPackage
        toPackage = None
        for toPackage in self._getPreviousCommonPackage(fromPackage, parts, packages):
            if toPackage == None:
                break
            elif seen_targets != None:
                if toPackage not in seen_targets:
                    break
            else:
                break
        if toPackage == None:
            return None, None
        self._console.debug("Merge package #%s into #%s" % (fromPackage.id, toPackage.id))

        # Update part information
        for part in parts.values():
            #if fromPackage.id in part.packages:
            if fromPackage in part.packages:
                part.packages.remove(fromPackage)

        # Merging package content
        toPackage.classes.extend(fromPackage.classes)
        del packages[fromPackage.id]
        
        return fromPackage, toPackage  # to allow caller check for merging and further clean-up fromPackage



    def _getFinalPartData(self, script):
        packages   = script.packages
        parts      = script.parts
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



    def _getFinalClassList(self, script):
        packages   = script.packagesArraySorted()
        variants   = script.variants
        packageIds = self._sortPackages(packages.keys(), packages)

        #resultClasses = {}
        resultClasses = []
        for pkgId in packageIds:
            #resultClasses[pkgId] = self._depLoader.sortClasses(packages[pkgId].classes, variants)
            resultClasses.append(self._depLoader.sortClasses(packages[pkgId].classes, variants))

        return resultClasses



    def _getFinalClassList1(self, script):
        packages   = script.packages
        variants   = script.variants
        packageIds = self._sortPackages(packages.keys(), packages)

        for pkgId in packageIds:
            packages[pkgId].classes = self._depLoader.sortClasses(packages[pkgId].classes, variants)

        script.packageIdsSorted = packageIds

        return script



    def _printPartStats(self, script):
        packages = script.packages
        parts    = script.parts

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
            self._console.debug("Part #%s packages(%d): %s" % (part.name, len(part.packages), ", ".join('#'+str(x.id) for x in part.packages)))

        self._console.outdent()
        self._console.debug("")
