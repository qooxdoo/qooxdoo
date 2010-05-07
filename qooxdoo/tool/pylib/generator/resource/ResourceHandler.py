#!/usr/bin/env python

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

import re, string, types, sys, os

from generator.code.LibraryPath import LibraryPath
from misc import Path
from generator.resource.ImageInfo import CombinedImage

class ResourceHandler(object):
    def __init__(self, generatorobj):
        self._genobj  = generatorobj
        self._resList = None


    def findAllResources(self, libraries, filter=None):
        """Find relevant resources/assets, implementing shaddowing of resources.
           Returns a list of resources, each a pair of [file_path, uri]"""

        # - Helpers -----------------------------------------------------------

        def getCache(lib):
            cacheId = "resinlib-%s" % lib._path
            liblist = self._genobj._cache.read(cacheId, dependsOn=None, memory=True)
            return liblist, cacheId

        def isSkipFile(f):
            if [x for x in map(lambda x: re.search(x, f), ignoredFiles) if x!=None]:
                return True
            else:
                return False

        def resourceValue(r):
            # create a pair res = [path, uri] for this resource...
            rsource = os.path.normpath(r)  # normalize "./..."
            relpath = (Path.getCommonPrefix(libObj._resourcePath, rsource))[2]
            if relpath[0] == os.sep:  # normalize "/..."
                relpath = relpath[1:]
            ruri = (self._genobj._computeResourceUri(lib, relpath, rType='resource', 
                                                        appRoot=self._genobj.approot))

            return (rsource, ruri)

            
        # - Main --------------------------------------------------------------

        result       = []
        cacheList    = []  # to poss. populate cache
        cacheId      = ""  # will be filled in getCache()
        ignoredFiles = [r'\.meta$',]  # files not considered as resources
        libs         = libraries[:]
        #libs.reverse()     # this is to search the 'important' libs first

        # go through all libs (weighted) and collect necessary resources
        for lib in libs:
            # create wrapper object
            libObj = LibraryPath(lib, self._genobj._console)
            # retrieve list of library resources
            libList, cacheId = getCache(libObj)
            if libList:
                inCache = True
            else:
                libList = libObj.scanResourcePath()
                inCache = False

            # go through list of library resources and add suitable
            for resource in libList:
                # scanResourcePath() yields absolute paths to a resource, but
                # we only want to match against the 'resource' part of it
                resourcePart = Path.getCommonPrefix(libObj._resourcePath, resource)[2]
                if not inCache:
                    cacheList.append(resource)
                if isSkipFile(resource):
                    continue
                elif (filter and not filter(resourcePart)):
                    continue
                else:
                    result.append(resource)

            if not inCache:
                # cache write
                self._genobj._cache.write(cacheId, cacheList, memory=True, writeToFile=False)

        return result

                        
        

    ##
    # Find relevant resources/assets, implementing shaddowing of resources.
    # Yields resources [file_path1, ...]
    # includes necessary combined images, unless useCombImgs=False
    # filter is a positivie filter (ie. the things you *want*)
    def findAllResources1(self, libraries, filter=None, useCombImgs=True):

        combinedImages    = set(())

        # go through all libs (weighted) and collect necessary resources
        for lib in libraries:
            for resource in self.findLibResources(lib, ):
                if self.isCombinedImage(resource):
                    combinedImages.add(resource)
                if (filter and not filter(resource)):
                    continue
                else:
                    yield resource

        # go through the combined images
        if filter:
            for combpath in combinedImages:
                combimg = CombinedImage(combpath)
                for embimg in combimg.getEmbeddedImages():
                    if filter(embimg):
                        yield combpath
                        break  # one match is enough
        else: 
            # if there is no filter, the comb. images have been added in the 
            # first loop
            pass

        return


    ##
    # checks whether the image is a combined image, by looking for a
    # .meta file
    def isCombinedImage(self, resourcePath):
        meta_fname = os.path.splitext(resourcePath)[0]+'.meta'
        return os.path.exists(meta_fname)


    ##
    # Yield the resources of a single lib
    def findLibResources(self, lib, filter=None):

        def getCache(lib):
            cacheId = "resinlib-%s" % lib._path
            liblist = self._genobj._cache.read(cacheId, dependsOn=None, memory=True)
            return liblist, cacheId

        def isSkipFile(f):
            if [x for x in map(lambda x: re.search(x, f), ignoredFiles) if x!=None]:
                return True
            else:
                return False

        # - Main --------------------------------------------------------------
        cacheList    = []  # to poss. populate cache
        cacheId      = ""  # will be filled in getCache()
        ignoredFiles = [r'\.meta$',]  # files not considered as resources

        # create wrapper object
        libObj = LibraryPath(lib, self._genobj._console)
        # retrieve list of library resources
        libList, cacheId = getCache(libObj)
        if libList:
            inCache = True
        else:
            libList = libObj.scanResourcePath()
            inCache = False

        # go through list of library resources and add suitable
        for resource in libList:
            # scanResourcePath() yields absolute paths to a resource, but
            # we only want to match against the 'resource' part of it
            resourcePart = Path.getCommonPrefix(libObj._resourcePath, resource)[2]
            if not inCache:
                cacheList.append(resource)
            if isSkipFile(resource):
                continue
            elif (filter and not filter(resourcePart)):
                continue
            else:
                yield resource

        if not inCache:
            # cache write
            self._genobj._cache.write(cacheId, cacheList, memory=True, writeToFile=False)

        return

                        
        

    def getResourceFilterByAssets(self, classes):
        # returns a function that takes a resource path and return true if one
        # of the <classes> needs it

        if not self._resList:
            self._resList, self._assetsOfClass = self._getResourcelistFromClasslist(classes)  # get consolidated resource list
            self._resList = [re.compile(x) for x in self._resList]  # convert to regexp's
            for classId in self._assetsOfClass:
                self._assetsOfClass[classId] = set(re.compile(x) for x in self._assetsOfClass[classId])

        def filter(respath):
            respath = Path.posifyPath(respath)
            for res in self._resList:
                mo = res.search(respath)  # this might need a better 'match' algorithm
                if mo:
                    return True
            return False

        return filter, self._assetsOfClass


    def getResourceFilterByFilepath(self, filepatt=None, inversep=lambda x: x):
        """Returns a filter function that takes a resource path and returns
           True/False, depending on whether the resource should be included.
           <filepatt> pattern to match against a resource path, <inversep> if
           the match result should be reversed (for exclusions); example:
               getResourceFilterByFilepath(re.compile(r'.*/qx/icon/.*'), lambda x: not x)
           returns only res paths that do *not* match '/qx/icon/'"""
        if not filepatt:
            #filepatt = re.compile(r'\.(?:png|jpeg|gif)$', re.I)
            filepatt = re.compile(r'.*/resource/.*')

        def filter(respath):
            if inversep(re.search(filepatt,respath)):
                return True
            else:
                return False

        return filter


    def _getResourcelistFromClasslist(self, classList):
        """Return a consolidated list of resource fileId's of all classes in classList;
           handles meta info."""
        result   = []  # list of needed resourceIds
        classMap = {}  # map of resourceIds per class {classId : set(resourceIds)}

        self._genobj._console.info("Compiling resource list...")
        self._genobj._console.indent()
        for clazz in classList:
            classMap[clazz] = set(())
            classRes = (self._genobj._depLoader.getMeta(clazz))['assetDeps'][:]
            iresult  = []
            for res in classRes:
                # here it might need some massaging of 'res' before lookup and append
                # expand file glob into regexp
                res = re.sub(r'\*', ".*", res)
                # expand macros
                if res.find('${')>-1:
                    expres = self._expandMacrosInMeta(res)
                else:
                    expres = [res]
                for r in expres:
                    classMap[clazz].add(r)
                    if r not in result + iresult:
                        iresult.append(r)
            self._genobj._console.debug("%s: %s" % (clazz, repr(iresult)))
            result.extend(iresult)

        self._genobj._console.outdent()
        return result, classMap


    # wpbasti: Isn't this something for the config class?
    # Do we have THE final solution for these kind of variables yet?
    # The support for macros, themes, variants and all the types of variables make me somewhat crazy.
    # Makes it complicated for users as well.
    def _expandMacrosInMeta(self, res):
        themeinfo = self._genobj._job.get('asset-let',{})

        def expMacRec(rsc):
            if rsc.find('${')==-1:
                return [rsc]
            result = []
            nres = rsc[:]
            mo = re.search(r'\$\{(.*?)\}',rsc)
            if mo:
                themekey = mo.group(1)
                if themekey in themeinfo:
                    # create an array with all possibly variants for this replacement
                    iresult = []
                    for val in themeinfo[themekey]:
                        iresult.append(nres.replace('${'+themekey+'}', val))
                    # for each variant replace the remaining macros
                    for ientry in iresult:
                        result.extend(expMacRec(ientry))
                else:
                    nres = nres.replace('${'+themekey+'}','') # just remove '${...}'
                    #nres = os.path.normpath(nres)     # get rid of '...//...'
                    nres = nres.replace('//', '/')    # get rid of '...//...'
                    result.append(nres)
                    self._genobj._console.warn("Empty replacement of macro '%s' in asset spec." % themekey)
            else:
                raise SyntaxError, "Non-terminated macro in string: %s" % rsc
            return result

        result = expMacRec(res)
        return result

