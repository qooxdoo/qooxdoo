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
    def __init__(self, console):
        self._console = console

    def getImageInfos(self, rootDir):
        result = {}
        imgpatt = re.compile(r'\.(png|jpeg|gif)$', re.I)

        for img in filetool.find(rootDir, imgpatt):
            self._console.debug("analysing image: %s" % img)
            mo = imgpatt.search(img)
            imgInfo = ImgInfo(img).getSize()
            if imgInfo:
                result[img] = {'width': imgInfo[0], 'height': imgInfo[1], 'filetype': mo.group(1)}

        return result
