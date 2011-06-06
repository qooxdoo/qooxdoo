#!/usr/bin/env python
# -*- coding: utf-8 -*-

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

##
# Class to represent a combined image to the generator, i.e. essentially
# the information of the .meta file without exposing its file layout.
##

import re, os, sys, types

from misc                     import filetool, Path, json
from generator                import Context
from generator.resource.Image import Image


class CombinedImage(Image):

    def __init__(self, path=None):
        super(CombinedImage, self).__init__(path)
        self.embeds = []  # embedded images
        if path:
            self.parseMetaFile(path)

    def parseMetaFile(self, path):
        # Read the .meta file
        # it doesn't seem worth to apply caching here
        meta_fname   = os.path.splitext(path)[0]+'.meta'
        meta_content = filetool.read(meta_fname)
        imgDict      = json.loads(meta_content)

        # Loop through the images of the .meta file
        for imageId, imageSpec_ in imgDict.items():
            # sort of like this: imageId : [width, height, type, combinedUri, off-x, off-y]
            imageObject = Image()
            imageObject.id = imageId
            imageObject = imageObject.fromMeta(imageSpec_)
            self.embeds.append(imageObject)
        return

    def getEmbeddedImages(self):
        result = {}
        for img, imgObj in self.embeds.items():
            result[img] = imgObj
        return result

    @staticmethod
    def isCombinedImage(fpath):
        i = fpath.rfind(".")
        meta_fname = fpath[:i] + '.meta'
        return os.path.exists(meta_fname)


    ##
    # @overloaded
    def toResinfo(self):
        result = super(self.__class__, self).toResinfo()
        if self.format == "b64" and self.path:
            cont = filetool.read(self.path)
            cont = json.loads(cont)
            result.append(cont)
        return result
