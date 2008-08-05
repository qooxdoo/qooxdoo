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
from misc import Path

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
        self.width = self.height = self.type = self.mappedId = self.left = self.top = None
        # this part of the constructor supports the img format as used in the 
        # .meta files: [width, height, type [, mapped, off-x, off-y]]
        if arrspec:
            # if the constructor is called with positional arguments, these will be only one,
            # which is an array
            serialspec = arrspec[0]
            self.width     = serialspec[0]
            self.height    = serialspec[1]
            self.type      = serialspec[2]
            # see if this is part of a combined image
            if len(serialspec)>3:
                self.mappedId = serialspec[3]
                self.left      = serialspec[4]
                self.top       = serialspec[5]
            # but init those members anyway, so they are not undefined
            else:
                self.mappedId = None
                self.left      = None
                self.top       = None
        # if there are (additional) keyword args, use them
        if kwspec:
            self.__init_kw(self, **kwspec)

    def __init_kw(self,**kwspec):
        for kw in kwspec:
            if kw == 'width':
                self.width = kwspec[kw]
            elif kw == 'height':
                self.height = kwspec[kw]
            elif kw == 'type':
                self.type = kwspec[kw]
            elif kw == 'mappedId':
                self.mappedId = kwspec[kw]
            elif kw == 'left':
                self.left = kwspec[kw]
            elif kw == 'top':
                self.top = kwspec[kw]
            elif kw == 'lib':
                self.lib = kwspec[kw]
            else:
                raise NameError, "No such object member: %s" % kw

    def meta_format(self):
        # return data suitable for .meta file
        a = [self.width, self.height, self.type]
        if self.mappedId:
            a.extend([self.mappedId, self.left, self.top])
        return a

    def flatten(self):
        a = [self.width, self.height, self.type, self.lib]
        if self.mappedId:
            a.extend([Path.posifyPath(self.mappedId), self.left, self.top])
        return a

    def fromFlat(self, flatspec):
        # this method supports the format as produced in flatten() -- keep in sync!
        self.width     = flatspec[0]
        self.height    = flatspec[1]
        self.type      = flatspec[2]
        self.lib       = flatspec[3]
        # see if this is part of a combined image
        if len(flatspec)>4:
            self.mappedId  = flatspec[4]
            self.left      = flatspec[5]
            self.top       = flatspec[6]
            self.mtype     = None       # currently not used
            self.mlib      = None       # currently not used
        # but init those members anyway, so they are not undefined
        else:
            self.mappedId  = None
            self.left      = None
            self.top       = None
            self.mtype     = None
            self.mlib      = None

