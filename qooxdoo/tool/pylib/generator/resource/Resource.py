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

import re, os, sys, types

from misc import filetool, Path, json
from misc.imginfo import ImgInfo
from generator import Context


class Resource(object):
    
    def __init__(self, path=None):
        self.id     = None
        self.path   = path
        self.lib    = None

    def __str__(self):
        return self.id

    def __eq__(self, other):
        return self.id == other.id


class Image(Resource):
    
    def __init__(self, path=None):
        super(Image, self).__init__(path)
        self.format = None
        self.width  = None
        self.height = None
        self.combImg = None
        self.top     = None
        self.left    = None

    imgpatt = re.compile(r'\.(png|jpeg|gif)$', re.I)

    def analyzeImage(self):

        if self.format and self.width and self.height:
            return

        # imgInfo = (width, height, format/type)
        imgInfo = ImgInfo(self.path).getInfo()
        if not imgInfo or not imgInfo[0] or not imgInfo[1] or not imgInfo[2]:
            raise RuntimeError, "Unable to get image info from file: %s" % self.path 

        self.width  = imgInfo[0]
        self.height = imgInfo[1]
        self.format = imgInfo[2]

        return


    def setProperties(self, *arrspec, **kwspec):
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
                self.mappedId  = None
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

##
# Class to represent a combined image to the generator, i.e. essentially
# the information of the .meta file without exposing its file layout.

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
            imageObject = imageObject.setProperties(imageSpec_)
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

