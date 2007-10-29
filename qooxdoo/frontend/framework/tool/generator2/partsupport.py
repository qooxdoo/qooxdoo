class PartUtil:
    def __init__(self, classes, console, deputil, treeutil):
        self._classes = classes
        self._console = console
        self._deputil = deputil
        self._treeutil = treeutil
        

    def getPackages(self, partClasses, partBits, includeDict, variants, collapseParts, optimizeLatency):
        self._console.debug("")
        self._console.info("Resolving part dependencies...")
        self._console.indent()
        
        partDeps = {}
        length = len(partClasses.keys())
        for pos, partId in enumerate(partClasses.keys()):
            # Exclude all features of other parts
            # and handle dependencies the smart way =>
            # also exclude classes only needed by the
            # already excluded features
            partExcludes = []
            for subPartId in partClasses:
                if subPartId != partId:
                    partExcludes.extend(partClasses[subPartId])

            # Finally resolve the dependencies
            localDeps = self._deputil.resolveDependencies(partClasses[partId], partExcludes, variants)


            # Remove all dependencies which are not included in the full list
            if len(includeDict) > 0:
              depKeys = localDeps.keys()
              for dep in depKeys:
                  if not dep in includeDict:
                      del localDeps[dep]

            self._console.debug("Part #%s needs %s classes" % (partId, len(localDeps)))

            partDeps[partId] = localDeps
        
        self._console.outdent()


        # Assign classes to packages
        self._console.debug("")
        self._console.debug("Assigning classes to packages...")

        # References packageId -> class list
        packageClasses = {}

        # References packageId -> bit number e.g. 4=1, 5=2, 6=2, 7=3
        packageBitCounts = {}

        for classId in self._classes:
            packageId = 0
            bitCount = 0

            # Iterate through the parts use needs this class
            for partId in partClasses:
                if classId in partDeps[partId]:
                    packageId += partBits[partId]
                    bitCount += 1

            # Ignore unused classes
            if packageId == 0:
                continue

            # Create missing data structure
            if not packageClasses.has_key(packageId):
                packageClasses[packageId] = []
                packageBitCounts[packageId] = bitCount

            # Finally store the class to the package
            packageClasses[packageId].append(classId)




        # Assign packages to parts
        self._console.debug("Assigning packages to parts...")
        partPackages = {}

        for partId in partClasses:
            partBit = partBits[partId]

            for packageId in packageClasses:
                if packageId&partBit:
                    if not partPackages.has_key(partId):
                        partPackages[partId] = []

                    partPackages[partId].append(packageId)

            # Be sure that the part package list is in order to the package priorit
            self._sortPackageIdsByPriority(partPackages[partId], packageBitCounts)




        # User feedback
        self._printPartStats(packageClasses, partPackages)



        # Support for package collapsing
        # Could improve latency when initial loading an application
        # Merge all packages of a specific part into one (also supports multiple parts)
        # Hint: Part packages are sorted by priority, this way we can
        # easily merge all following packages with the first one, because
        # the first one is always the one with the highest priority
        if len(collapseParts) > 0:
            self._console.debug("")
            self._console.info("Collapsing packages...")
            self._console.indent()
            
            collapsePos = 0
            for partId in collapseParts:
                self._console.debug("Package %s(%s)..." % (partId, collapsePos))

                collapsePackage = partPackages[partId][collapsePos]
                self._console.indent()
                for packageId in partPackages[partId][collapsePos+1:]:
                    self._console.debug("Merge #%s into #%s" % (packageId, collapsePackage))
                    self._mergePackage(packageId, collapsePackage, partClasses, partPackages, packageClasses)
            
                self._console.outdent()
                collapsePos += 1

            self._console.outdent()
        
            # User feedback
            self._printPartStats(packageClasses, partPackages)


        # Support for merging small packages
        # Hint1: Based on the token length which is a bit strange but a good
        # possibility to get the not really correct filesize in an ultrafast way
        # More complex code and classes generally also have more tokens in them
        # Hint2: The first common package before the selected package between two
        # or more parts is allowed to merge with. As the package which should be merged
        # may have requirements these must be solved. The easiest way to be sure regarding
        # this issue, is to look out for another common package. The package for which we
        # are looking must have requirements in all parts so these must be solved by all parts
        # so there must be another common package. Hardly to describe... hope this makes some sense
        if optimizeLatency != None and optimizeLatency != 0:
            smallPackages = []

            # Start at the end with the priority sorted list
            sortedPackageIds = self._sortPackageIdsByPriority(self._dictToHumanSortedList(packageClasses), packageBitCounts)
            sortedPackageIds.reverse()

            self._console.debug("")
            self._console.info("Analysing package sizes...")
            self._console.indent()
            self._console.debug("Optimize at %s tokens" % optimizeLatency)

            for packageId in sortedPackageIds:
                packageLength = 0
                self._console.indent()

                for classId in packageClasses[packageId]:
                    packageLength += self._treeutil.getLength(classId)

                if packageLength >= optimizeLatency:
                    self._console.debug("Package #%s has %s tokens" % (packageId, packageLength))
                    self._console.outdent()
                    continue
                else:
                    self._console.debug("Package #%s has %s tokens => trying to optimize" % (packageId, packageLength))

                collapsePackage = self._getPreviousCommonPackage(packageId, partPackages, packageBitCounts)

                self._console.indent()
                if collapsePackage != None:
                    self._console.debug("Merge package #%s into #%s" % (packageId, collapsePackage))
                    self._mergePackage(packageId, collapsePackage, partClasses, partPackages, packageClasses)

                self._console.outdent()
                self._console.outdent()

            # User feedback
            self._printPartStats(packageClasses, partPackages)



        # Return
        sortedPackageIds = self._sortPackageIdsByPriority(self._dictToHumanSortedList(packageClasses), packageBitCounts)
        return sortedPackageIds, packageClasses, partPackages



    def _sortPackageIdsByPriority(self, packageIds, packageBitCounts):
        def _cmpPackageIds(pkgId1, pkgId2):
            if packageBitCounts[pkgId2] > packageBitCounts[pkgId1]:
                return 1
            elif packageBitCounts[pkgId2] < packageBitCounts[pkgId1]:
                return -1

            return pkgId2 - pkgId1

        packageIds.sort(_cmpPackageIds)

        return packageIds



    def _getPreviousCommonPackage(self, searchId, partPackages, packageBitCounts):
        relevantParts = []
        relevantPackages = []

        for partId in partPackages:
            packages = partPackages[partId]
            if searchId in packages:
                relevantParts.append(partId)
                relevantPackages.extend(packages[:packages.index(searchId)])

        # Sorted by priority, but start from end
        self._sortPackageIdsByPriority(relevantPackages, packageBitCounts)
        relevantPackages.reverse()

        # Check if a package is available identical times to the number of parts
        for packageId in relevantPackages:
            if relevantPackages.count(packageId) == len(relevantParts):
                return packageId

        return None



    def _printPartStats(self, packageClasses, partPackages):
        packageIds = self._dictToHumanSortedList(packageClasses)

        self._console.debug("")
        self._console.debug("Content of packages(%s):" % len(packageIds))
        self._console.indent()
        for packageId in packageIds:
            self._console.debug("Package #%s contains %s classes" % (packageId, len(packageClasses[packageId])))
        self._console.outdent()

        self._console.debug("")
        self._console.debug("Content of parts(%s):" % len(partPackages))
        self._console.indent()
        for partId in partPackages:
            self._console.debug("Part #%s uses these packages: %s" % (partId, self._intListToString(partPackages[partId])))
        self._console.outdent()



    def _dictToHumanSortedList(self, input):
        output = []
        for key in input:
            output.append(key)
        output.sort()
        output.reverse()

        return output



    def _mergePackage(self, replacePackage, collapsePackage, partClasses, partPackages, packageClasses):
        # Replace other package content
        for partId in partClasses:
            partContent = partPackages[partId]

            if replacePackage in partContent:
                # Store collapse package at the place of the old value
                partContent[partContent.index(replacePackage)] = collapsePackage

                # Remove duplicate (may be, but only one)
                if partContent.count(collapsePackage) > 1:
                    partContent.reverse()
                    partContent.remove(collapsePackage)
                    partContent.reverse()

        # Merging collapsed packages
        packageClasses[collapsePackage].extend(packageClasses[replacePackage])
        del packageClasses[replacePackage]



    def _intListToString(self, input):
        result = ""
        for entry in input:
            result += "#%s, " % entry

        return result[:-2]

