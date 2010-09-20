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

import re, string, types, sys, os, collections
import functools

from generator.code.Library import Library
from misc import Path
from generator.resource.ImageInfo import CombinedImage as CombImage, ImgInfoFmt
from generator.resource.Resource import CombinedImage

class ResourceHandler(object):

    def __init__(self, generatorobj, librariesObj):
        self._genobj  = generatorobj
        self._assetList = []
        self._assetsOfClass = {}  # {classId : set(assetRegex)}
        self._libraries = librariesObj


    ##
    # returns a function that takes a resource path and return true if one
    # of the <classes> needs it
    def getResourceFilterByAssets(self, classes):

        #if not self._assetList:
        #    self._assetList, self._assetsOfClass = self._getResourcelistFromClasslist(classes)  # get consolidated resource list
        #    self._assetList = [re.compile(x) for x in self._assetList]  # convert to regexp's
        #    for classId in self._assetsOfClass:
        #        self._assetsOfClass[classId] = set(re.compile(x) for x in self._assetsOfClass[classId])

        if not self._assetList:
            assetMacros = self._genobj._job.get('asset-let',{})
            for clazz in classes:
                classAssets = clazz.getAssets(assetMacros)
                self._assetList.extend(classAssets)
                self._assetsOfClass[clazz.id] = set(classAssets)

        def filter(respath):
            respath = Path.posifyPath(respath)
            for assetPatt in self._assetList:
                mo = assetPatt.search(respath)  # this might need a better 'match' algorithm
                if mo:
                    return True
            return False

        return filter, self._assetsOfClass


    ##
    # Create a resource structure suitable for serializing (like CodeGenerator.
    # generateResourceInfoCode, but with simpler input params). The main simpli-
    # fication is that no resource *selection* is done in this method. It basi-
    # cally just takes lists of resource paths and creates an info structure for
    # them. Combined images are honored.
    #
    # Takes:
    #   [(libObj, ["resourcePath"]),...]
    #   formatAsTree = True/False
    # returns:
    #   resource structure {"gui/test.png" : [32, 32, "png", "gui"], ...}
    # or:
    #   {"gui" : {"test.png" : [32, 32, "png", "gui"], ...}, ...}
    def createResourceStruct(self, libsAndResources, formatAsTree=False, updateOnlyExistingSprites=False):
        
        skippatt = re.compile(r'\.(meta|py)$', re.I)
        result = {}
        if formatAsTree:
            result = ExtMap()

        # Create a flat result from libsAndResources
        for libObj, resList in libsAndResources:
            for res in resList:
                if skippatt.search(res.path):
                    continue
                result[res.id] = res

        # Update simple images
        for combImg in (x for x in result.values() if isinstance(x, CombinedImage)):
            for embImg in combImg.embeds:
                if embImg.id in result:
                    result[embImg.id].attachCombinedImage(combImg)
                elif not updateOnlyExistingSprites:
                    embImg.attachCombinedImage(combImg)
                    result[embImg.id] = embImg

        # Flatten out the resource representation
        for resid, res in result.items():
            result[resid] = res.toResinfo()

        # ExtMap returns nested maps
        if formatAsTree:
            result = result.getData()

        return result
            
    ##
    # check if sprites in a combined image occur in a resource list
    def embedsInList(self, combObj, resList):
        matchingEmbeds = []
        for embed in combObj.embeds: # embed = Image()
            if embed in resList:
                matchingEmbeds.append(embed)
        return matchingEmbeds


    ##
    # map resources to classes
    # works on resource and class objects
    # modifies the classes, by adding resources that are useful to the class
    def mapResourcesToClasses(self, resources, classes):
        assetMacros     = self._genobj._job.get('asset-let',{})
        assetPatts = {}
        for clazz in classes:
            assetPatts[clazz] = clazz.getAssets(assetMacros)
        for res in resources:
            for clazz, patts in assetPatts.items():
                for patt in patts:
                    if patt.search(res.id):
                        clazz.resources.add(res)
                        break
            #for clazz in classes:
            #    if clazz.needsResource(res, expandMacroFunc):
            #        clazz.resources.add(res) 
            #    # check for embedded images
            #    if isinstance(res, CombinedImage):
            #        for embed in res.embeds:
            #            if clazz.needsResource(embed, expandMacroFunc):
            #                clazz.resources.add(res)
            #                break
        
        return classes



