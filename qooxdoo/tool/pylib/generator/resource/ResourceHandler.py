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
from generator import Context

class ResourceHandler(object):

    def __init__(self, generatorobj, librariesObj):
        global console
        self._genobj  = generatorobj
        console  = Context.console



    ##
    # Create a resource structure suitable for serializing. The main simpli-
    # fication is that no resource *selection* is done in this method. It basi-
    # cally just takes a lists of resources and creates an info structure for
    # them. Combined images are honored.
    #
    # Takes:
    #   [resourceObj1,...]
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
    # Map resources to classes.
    # Takes a list of Library's and a list of Class'es, and modifies the
    # classes' .resources member to hold suitable resources from the Libs.
    def mapResourcesToClasses(self, libs, classes):
        
        ##
        # map a Resource obj against a set of resource id patterns
        def checkPatts(res, hints):
            for hint in hints:
                if hint.regex.search(res.id):
                    hint.seen = True  # mark asset hint as fullfilled by a resource
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
        
        # Asset pattern list  -- this is basically an optimization, to condense
        # asset patterns
        assetMacros     = self._genobj._job.get('asset-let',{})
        assetPatts = {}  # {clazz : [assetRegex]}
        for clazz in classes:
            classAssets = clazz.getAssets(assetMacros)  # [AssetHint]
            if classAssets:
                assetPatts[clazz] = classAssets

        # Go through resources and asset patterns
        for res in resources:
            for clazz, hints in assetPatts.items():
                if checkPatts(res, hints):
                    clazz.resources.add(res)
                # check embedded images
                if isinstance(res, CombinedImage):
                    for embed in res.embeds:
                        if checkPatts(embed, hints):
                            clazz.resources.add(res)  # add the combimg, if an embed matches

        # Now that the resource mapping is done, check if we have unfullfilled hints
        for clazz, hints in assetPatts.items():
            for hint in hints:
                if not hint.seen:
                    console.warn("Warning: Unfullfilled #asset hint '%s' (%s)" % (hint.source, clazz.id))
        
        return classes

