import sys

class PartBuilder:
    def __init__(self, console, depLoader, compiler):
        self._console = console
        self._depLoader = depLoader
        self._compiler = compiler



    def getPackages(self, partIncludes, smartExclude, classList, collapseParts, variants, minPackageSize):
        # Preprocess part data
        partBits = self._getPartBits(partIncludes)
        partDeps = self._getPartDeps(partIncludes, variants, smartExclude, classList)

        # Compute packages
        packageClasses = self._getPackageClasses(partDeps, partBits)
        packageUsers, partPackages = self._getPackageUsers(packageClasses, partBits)

        self._printPartStats(packageClasses, partPackages)

        # Collapse parts
        if len(collapseParts) > 0:
            self._collapseParts(partPackages, packageClasses, collapseParts)

        # Optimize packages
        if minPackageSize != None and minPackageSize != 0:
            self._optimizePackages(packageClasses, packageUsers, partPackages, variants, minPackageSize)

        self._printPartStats(packageClasses, partPackages)

        # Post process results
        resultParts = self._getFinalPartData(packageClasses, packageUsers, partPackages)
        resultClasses = self._getFinalClassList(packageClasses, packageUsers, variants)

        # Return
        # {Map} resultParts[partId] = [packageId1, packageId2]
        # {Array} resultClasses[packageId] = [class1, class2]
        return resultParts, resultClasses



    def _getPartBits(self, partIncludes):
        # Build bitmask ids for parts
        self._console.debug("Assigning bits to parts...")

        # References partId -> bitId of that part
        self._console.indent()
        partBits = {}
        for partPos, partId in enumerate(partIncludes):
            self._console.debug("Part #%s => %s" % (partId, 1<<partPos))
            partBits[partId] = 1<<partPos

        self._console.outdent()

        return partBits



    def _getPartDeps(self, partIncludes, variants, smartExclude, classList):
        self._console.debug("")
        self._console.info("Resolving part dependencies...")
        self._console.indent()

        partDeps = {}
        for partId in partIncludes:
            # Exclude all features of other parts
            # and handle dependencies the smart way =>
            # also exclude classes only needed by the
            # already excluded features
            partExcludes = []
            for otherPartId in partIncludes:
                if otherPartId != partId:
                    partExcludes.extend(partIncludes[otherPartId])

            # Extend with smart excludes
            partExcludes.extend(smartExclude)

            # Remove classes before checking dependencies
            for classId in partIncludes[partId]:
                if not classId in classList:
                    partIncludes[partId].remove(classId)

            # Checking part includes
            if len(partIncludes[partId]) == 0:
                self._console.info("Part #%s is ignored in current configuration" % partId)
                continue

            # Finally resolve the dependencies
            partClasses = self._depLoader.resolveDependencies(partIncludes[partId], partExcludes, variants)

            # Remove all non-included files
            # Need to work on a copy because of runtime changes
            for classId in partClasses[:]:
                if not classId in classList:
                    partClasses.remove(classId)

            # Store
            self._console.debug("Part #%s depends on %s classes" % (partId, len(partClasses)))
            partDeps[partId] = partClasses

        return partDeps




    # Returns a map with packageId -> classes of the package
    def _getPackageClasses(self, partDeps, partBits):
        # Generating list of all classes
        allClasses = {}
        for partId in partDeps:
            for classId in partDeps[partId]:
                allClasses[classId] = True

        # Detecting packageId for each class and register
        # the class into the matching data structure
        pkgClasses = {}
        for classId in allClasses.keys():
            pkgId = 0

            for partId in partDeps:
                if classId in partDeps[partId]:
                    pkgId += partBits[partId]

            if not pkgClasses.has_key(pkgId):
                pkgClasses[pkgId] = []

            pkgClasses[pkgId].append(classId)

        return pkgClasses



    # Returns a map with packageId -> number of parts using the package
    # and a map with partId -> list of package ids
    def _getPackageUsers(self, pkgClasses, partBits):
        packageUsers = {}
        partPackages = {}

        for pkgId in pkgClasses:
            partCount = 0

            for partId in partBits:
                if pkgId&partBits[partId]:
                    partCount += 1

                    if not partPackages.has_key(partId):
                        partPackages[partId] = []

                    partPackages[partId].append(pkgId)

            packageUsers[pkgId] = partCount

        # Sorting package list
        for partId in partBits:
            if partPackages.has_key(partId):
                self._sortPackages(partPackages[partId], packageUsers)

        return packageUsers, partPackages



    def _collapseParts(self, partPackages, packageClasses, collapseParts):
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

            toId = partPackages[partId][collapsePos]
            for fromId in partPackages[partId][collapsePos+1:]:
                self._console.debug("Merging package #%s into #%s" % (fromId, toId))
                self._mergePackage(fromId, toId, partPackages, packageClasses)

            self._console.outdent()
        self._console.outdent()



    def _computePackageSize(self, packageClasses, packageId, variants):
        packageSize = 0

        self._console.indent()
        for classId in packageClasses[packageId]:
            packageSize += self._compiler.getCompiledSize(classId, variants)
        self._console.outdent()

        return packageSize



    def _optimizePackages(self, packageClasses, packageUsers, partPackages, variants, minPackageSize):
        # Support for merging small packages
        # The first common package before the selected package between two
        # or more parts is allowed to merge with. As the package which should be merged
        # may have requirements, these must be solved. The easiest way to be sure regarding
        # this issue, is to look out for another common package.

        self._console.info("Optimizing package sizes...")
        self._console.indent()
        self._console.debug("Minimum size: %sKB" % minPackageSize)
        self._console.indent()

        # Start at the end with the sorted list
        # e.g. merge 4->7 etc.
        packageIds = packageClasses.keys()
        self._sortPackages(packageIds, packageUsers)
        packageIds.reverse()

        # Test and optimize 'fromId'
        for fromId in packageIds:
            packageSize = self._computePackageSize(packageClasses, fromId, variants) / 1024
            self._console.debug("Package #%s: %sKB" % (fromId, packageSize))
            if packageSize >= minPackageSize:
                continue

            toId = self._getPreviousCommonPackage(fromId, partPackages, packageUsers)
            if toId != None:
                self._console.indent()
                self._console.debug("Merge package #%s into #%s" % (fromId, toId))
                self._mergePackage(fromId, toId, partPackages, packageClasses)
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



    def _mergePackage(self, fromId, toId, partPackages, packageClasses):
        # Update part information
        for partId in partPackages:
            partContent = partPackages[partId]

            if fromId in partContent:
                if not toId in partPackages[partId]:
                    self._console.error("Could not merge these packages!")
                    sys.exit(0)

                # fromPos = partContent.index(fromId)
                # toPos = partContent.index(toId)
                # self._console.debug("Merging package at position #%s into #%s" % (fromPos, toPos))

                partPackages[partId].remove(fromId)

        # Merging package content
        packageClasses[toId].extend(packageClasses[fromId])
        del packageClasses[fromId]



    def _getFinalPartData(self, packageClasses, packageUsers, partPackages):
        packageIds = self._sortPackages(packageClasses.keys(), packageUsers)

        resultParts = {}
        for toId, fromId in enumerate(packageIds):
            for partId in partPackages:
                if fromId in partPackages[partId]:
                    if not resultParts.has_key(partId):
                        resultParts[partId] = [toId]
                    else:
                        resultParts[partId].append(toId)

        return resultParts



    def _getFinalClassList(self, packageClasses, packageUsers, variants):
        packageIds = self._sortPackages(packageClasses.keys(), packageUsers)

        resultClasses = []
        for pkgId in packageIds:
            resultClasses.append(self._depLoader.sortClasses(packageClasses[pkgId], variants))

        return resultClasses



    def _printPartStats(self, packageClasses, partPackages):
        packageIds = packageClasses.keys()
        packageIds.sort()
        packageIds.reverse()

        self._console.debug("")
        self._console.debug("Package summary")
        self._console.indent()
        for packageId in packageIds:
            self._console.debug("Package #%s contains %s classes" % (packageId, len(packageClasses[packageId])))
        self._console.outdent()

        self._console.debug("")
        self._console.debug("Part summary")
        self._console.indent()
        for partId in partPackages:
            pkgList = []
            for entry in partPackages[partId]:
                pkgList.append("#%s" % entry)

            self._console.debug("Part #%s uses these packages: %s" % (partId, ", ".join(pkgList)))

        self._console.outdent()
        self._console.debug("")
