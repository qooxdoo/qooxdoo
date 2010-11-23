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

from generator.resource.CombinedImage import CombinedImage
from generator import Context

class ResourceHandler(object):

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
    @staticmethod
    def createResourceStruct(resources, formatAsTree=False, updateOnlyExistingSprites=False):
        
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
    @staticmethod
    def mapResourcesToClasses(libs, classes, assetMacros={}):
        
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
        #assetMacros = self._genobj._job.get('asset-let',{})
        assetHints  = []
        for clazz in classes:
            assetHints.extend(clazz.getAssets(assetMacros))

        # Go through resources and asset patterns
        for res in resources:
            for hint in assetHints:
                # add direct matches
                if hint.regex.match(res.id):
                    hint.seen = True
                    hint.clazz.resources.add(res)
                # add matches of embedded images
                if isinstance(res, CombinedImage):
                    for embed in res.embeds:
                        if hint.regex.match(embed.id):
                            hint.seen = True
                            hint.clazz.resources.add(res)

        # Now that the resource mapping is done, check if we have unfullfilled hints
        for hint in assetHints:
            if not hint.seen:
                Context.console.warn("No resource matched #asset(%s) (%s)" % (hint.source, hint.clazz.id))
        
        return classes

