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

from generator.resource.Resource import CombinedImage

class ResourceHandler(object):

    def __init__(self, generatorobj, librariesObj):
        self._genobj  = generatorobj


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
    def createResourceStruct(self, resources, formatAsTree=False, updateOnlyExistingSprites=False):
        
        skippatt = re.compile(r'\.(meta|py)$', re.I)
        result = {}
        if formatAsTree:
            result = ExtMap()

        # Filter unwanted files
        for res in resources:
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
    # map resources to classes
    # works on resource and class objects
    # modifies the classes, by adding resources that are useful to the class
    def mapResourcesToClasses(self, libs, classes):
        
        ##
        # map a Resource obj against a set of resource id patterns
        def checkPatts(res, patts):
            for patt in patts:
                if patt.search(res.id):
                    return True
            return False
        # -------------------------------------
        # Resource list
        resources = []
        for libObj in libs:
            resources.extend(libObj.getResources()) # weightedness of same res id through order of script.libraries
        # remove unwanted files
        exclpatt = re.compile("\.(?:meta|py)$", re.I)
        for res in resources[:]:
            if exclpatt.search(res.id):
                resources.remove(res)
        
        # Asset pattern list
        assetMacros     = self._genobj._job.get('asset-let',{})
        assetPatts = {}  # {clazz : [assetRegex]}
        for clazz in classes:
            classAssets = clazz.getAssets(assetMacros)
            if classAssets:
                assetPatts[clazz] = classAssets

        # Go through resources and asset patterns
        for res in resources:
            for clazz, patts in assetPatts.items():
                if checkPatts(res, patts):
                    clazz.resources.add(res)
                # check embedded images
                if isinstance(res, CombinedImage):
                    for embed in res.embeds:
                        if checkPatts(embed, patts):
                            clazz.resources.add(res)  # add the combimg, if an embed matches

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

