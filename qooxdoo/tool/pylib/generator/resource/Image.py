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

##
# Base image class
##

import re, os, sys, types

from misc import filetool, Path, json
from misc.imginfo import ImgInfo
from generator import Context
from generator.resource.Resource import Resource


class Image(Resource):
    
    def __init__(self, path=None):
        super(Image, self).__init__(path)
        self.format = None
        self.width  = None
        self.height = None
        self.combId  = None
        self.combImg = None
        self.top     = None
        self.left    = None

    imgpatt = re.compile(r'\.(png|jpeg|jpg|gif)$', re.I)

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


    ##
    # Set properties from keyword dict
    def __init_kw(self,**kwspec):
        for kw in kwspec:
            if kw in ('width', 'height', 'format', 'combId', 'top', 'left', 'lib'):
                setattr(self, kw, kwspec[kw])
            else:
                raise NameError, "No such object member: %s" % kw

    ##
    # Set object properties via array and keyword arguments;
    # supports the property format as used in .meta files: 
    # [width, height, type [, mapped, off-x, off-y]]
    def fromMeta(self, serialspec, **kwspec):
        if serialspec:
            # if the constructor is called with positional arguments, these will be only one,
            # which is an array
            self.width     = serialspec[0]
            self.height    = serialspec[1]
            self.format      = serialspec[2]
            # see if this is part of a combined image
            if len(serialspec)>3:
                self.combId = serialspec[3]
                self.left      = serialspec[4]
                self.top       = serialspec[5]
            # but init those members anyway, so they are not undefined
            else:
                self.combId  = None
                self.left      = None
                self.top       = None
        # if there are (additional) keyword args, use them
        if kwspec:
            self.__init_kw(self, **kwspec)

        return self

    ##
    # Serialize to .meta format
    def toMeta(self):
        # return data suitable for .meta file
        a = [self.width, self.height, self.format]
        if self.combId:
            a.extend([self.combId, self.left, self.top])
        return a

    ##
    # Set properties from a list spec, as used in resource info maps of generated scripts;
    # mind the additional "lib" spec over the .meta format
    # this method supports the format as produced in toResinfo() -- keep in sync!
    # (currently not used)
    def fromResinfo(self, flatspec):
        self.width     = flatspec[0]
        self.height    = flatspec[1]
        self.format    = flatspec[2]
        self.library   = flatspec[3]
        # see if this is part of a combined image
        if len(flatspec)>4:
            self.combId    = flatspec[4]
            self.left      = flatspec[5]
            self.top       = flatspec[6]
        # but init those members anyway, so they are not undefined
        else:
            self.combId    = None
            self.left      = None
            self.top       = None

        return self

    ##
    # Serialize to a format as used in resource info maps of generated scripts
    def toResinfo(self):
        a = [self.width, self.height, self.format, self.library.namespace if self.library else ""]
        if self.combId:
            a.extend([self.combId, self.left, self.top])
        elif self.combImg:
            a.extend([self.combImg.id, self.left, self.top])
        return a

    ##
    # Establish relation to combined image
    def attachCombinedImage(self, combImg):
        self.combImg = combImg
        # extract offsets in combImg
        embImg = [x for x in combImg.embeds if x.id == self.id]
        if embImg:
            self.left = embImg[0].left
            self.top  = embImg[0].top



    @staticmethod
    def isImage(fpath):
        return Image.imgpatt.search(fpath)

