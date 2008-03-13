#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
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

import re, os, sys, types

from misc import filetool
from misc.imginfo import ImgInfo

class ImageInfo(object):
    def __init__(self, console, cache):
        self._console = console
        self._cache = cache

    imgpatt = re.compile(r'\.(png|jpeg|gif)$', re.I)

    def getImageInfos(self, rootDir):
        result = {}

        for img in filetool.find(rootDir, imgpatt):
            self._console.debug("Analysing image: %s" % img)
            #mo = self.imgpatt.search(img)
            imgInfo = ImgInfo(img).getInfo()
            if imgInfo:
                result[img] = {'width': imgInfo[0], 'height': imgInfo[1], 'filetype': imgInfo[2]}

        return result

    def getImageInfo(self, fileName):
        result = {}
        img    = fileName
        
        self._console.debug("Analysing image: %s" % img)
        #mo = self.imgpatt.search(img)
        imgInfo = ImgInfo(img).getInfo()
        if imgInfo:
            result = {'width': imgInfo[0], 'height': imgInfo[1], 'filetype': imgInfo[2]}

        return result
