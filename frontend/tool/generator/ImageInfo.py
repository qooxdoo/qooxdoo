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

memcache = {}

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
            imgInfo = ImgInfo(img).getImageInfo()
            if imgInfo:
                result[img] = {'width': imgInfo[0], 'height': imgInfo[1], 'type': imgInfo[2]}

        return result

    def getImageInfo(self, fileName):
        img = fileName
        
        if memcache.has_key(img):
            return memcache[img]
        
        self._console.debug("Analysing image: %s" % img)
        #mo = self.imgpatt.search(img)
        imgInfo = ImgInfo(img).getInfo()
        if imgInfo:
            result = memcache[img] = {'width': imgInfo[0], 'height': imgInfo[1], 'type': imgInfo[2]}
        else:
            result = {}

        return result


class ImgInfoFmt(object):
    "Class to hide image meta info encoding"
    def __init__(self, *arrspec, **kwspec):
        self.width = self.height = self.type = self.mappeduri = self.left = self.top = None
        if arrspec:
            serialspec = arrspec[0]
            self.width     = serialspec[0]
            self.height    = serialspec[1]
            self.type      = serialspec[2]
            if len(serialspec)>3:
                self.mappeduri = serialspec[3]
                self.left      = serialspec[4]
                self.top       = serialspec[5]
            else:
                self.mappeduri = None
                self.left      = None
                self.top       = None
        if kwspec:
            self.__init_kw(self, **kwspec)

    def __init_kw(self,**kwspec):
        for kw in kwspec:
            if kw == 'width':
                self.width = kwspec[kw]
            elif kw == 'height':
                self.width = kwspec[kw]
            elif kw == 'type':
                self.width = kwspec[kw]
            elif kw == 'mappeduri':
                self.width = kwspec[kw]
            elif kw == 'left':
                self.width = kwspec[kw]
            elif kw == 'top':
                self.width = kwspec[kw]
            else:
                raise NameError, "No such object member: %s" % kw

    def flatten(self):
        #return [self.mappeduri, self.left, self.top, self.width, self.height, self.type]
        a = [self.width, self.height, self.type]
        if self.mappeduri:
            a.extend([self.mappeduri, self.left, self.top])
        return a
