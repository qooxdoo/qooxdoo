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
#    * Fabian Jakobs (fjakobs)
#
################################################################################

##
# Base image class
##

import re, os, sys, types, base64, struct, codecs

from misc import filetool, Path, json
from generator import Context
from generator.resource.Resource import Resource

class Image(Resource):
    
    def __init__(self, path=None):
        global console
        super(Image, self).__init__(path)
        self.format = None
        self.width  = None
        self.height = None
        self.combId  = None
        self.combImg = None
        self.top     = None
        self.left    = None

        console = Context.console

    FILE_EXTENSIONS = "png jpeg jpg gif b64.json".split()
    FILE_EXTENSIONPATT = re.compile(r'\.(%s)$' % "|".join(FILE_EXTENSIONS), re.I)

    def analyzeImage(self):

        if self.format and self.width and self.height:
            return

        # imgInfo = (width, height, format/type)
        imgInfo = self.getInfo()
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

    ##
    # Return the base64 encoded string of the image
    def toBase64(self):
        return base64.b64encode(open(self.path, "rb").read())


    @staticmethod
    def isImage(fpath):
        return Image.FILE_EXTENSIONPATT.search(fpath)

    # --------------------------------------------------------------------------
    # Methods using the child-classes GifFile, ...
    # --------------------------------------------------------------------------
    
    CHILD_CLASSES = []

    def getSize(self):
        ''' Returns the image sizes of png, gif and jpeg files as
            (width, height) tuple '''
        filename = self.__filename
        classes = self.CHILD_CLASSES

        for cls in classes:
            img = cls(filename)
            if img.verify():
                size = img.size()
                if size is not None:
                    img.close()
                    return size
            img.close()

        return None
    
    def getInfo(self):
        ''' Returns (width, height, "type") of the image'''
        filename = self.path
        classes = self.CHILD_CLASSES
        
        for cls in classes:
            img = cls(filename)
            if img.verify():
                size = img.size()
                if size is not None:
                    return size + (img.type(),)

        return None

    ##
    # Like getInfo, but returns a map
    def getInfoMap(self):
        console.debug("Analysing image: %s" % self.path)
        imgInfo = self.getInfo()
        if imgInfo:
            result = {'width': imgInfo[0], 'height': imgInfo[1], 'type': imgInfo[2]}
        else:
            result = {}

        return result



##
# Child classes for specific image file formats

# http://www.w3.org/Graphics/GIF/spec-gif89a.txt
class GifFile(Image):
    def __init__(self, path):
        super(self.__class__, self).__init__(path)
        self.fp = open(self.path, "rb")

    def __del__(self):
        self.fp.close()

    def verify(self):
        self.fp.seek(0)
        try:
            header = self.fp.read(6)
            signature = struct.unpack("3s3s", header[:6])
            isGif = signature[0] == "GIF" and signature[1] in ["87a", "89a"]
        except (struct.error, IOError):
            isGif = False
        return isGif

    def type(self):
        return "gif"

    def size(self):
        self.fp.seek(0)
        header = self.fp.read(6+6)
        (width, height) = struct.unpack("<HH", header[6:10])
        return width, height


# http://www.libmng.com/pub/png/spec/1.2/png-1.2-pdg.html#Structure
class PngFile(Image):
    def __init__(self, path):
        super(self.__class__, self).__init__(path)
        self.fp = open(self.path, "rb")

    def __del__(self):
        self.fp.close()

    def type(self):
        return "png"

    def verify(self):
        self.fp.seek(0)
        try:
            header = self.fp.read(8)
            signature = struct.pack("8B", 137, 80, 78, 71, 13, 10, 26, 10)
            isPng = header[:8] == signature
        except (struct.error, IOError):
            isPng = False
        return isPng


    def size(self):
        self.fp.seek(0)
        header = self.fp.read(8+4+4+13+4)
        ihdr = struct.unpack("!I4s", header[8:16])
        data = struct.unpack("!II5B", header[16:29])
        (width, height, bitDepth, colorType, compressionMethod, filterMethod, interleaceMethod) = data
        return (width, height)


# http://www.obrador.com/essentialjpeg/HeaderInfo.htm
class JpegFile(Image):
    def __init__(self, path):
        super(self.__class__, self).__init__(path)
        self.fp = open(self.path, "rb")

    def __del__(self):
        self.fp.close()

    def verify(self):
        self.fp.seek(0)
        try:
            signature = struct.unpack("!H", self.fp.read(2))
            isJpeg = signature[0] == 0xFFD8
        except (struct.error, IOError):
            isJpeg = False
        return isJpeg

    def type(self):
        return "jpeg"

    def size1(self):
        self.fp.seek(2)

        while True:
            try:
                marker, length = struct.unpack("!HH", self.fp.read(4))
            except struct.error:
                return None

            if marker == 0xFFC0:
                (precision, height, width) = struct.unpack("!BHH", self.fp.read(5))
                return (width, height)
            elif marker == 0xFFD9:
                return None

            self.fp.seek(length-2, 1)  # 1 = SEEK_CUR (2.5)

    def size(self):
        self.fp.seek(2)
        
        # find FFC0 marker
        cont = self.fp.read()
        # try Baseline DCT Start-of-frame marker (SOF0) (http://en.wikipedia.org/wiki/Jpeg)
        pos  = cont.find("\xFF\xC0")
        if pos < 0:
            # try Progressive DCT Start-of-frame marker (SOF2)
            pos  = cont.find("\xFF\xC2")
        if pos < 0:  # no SOF found - give up
            return None
        pos += 4 # skip marker and length
        
        # extract values from SOF payload
        try:
            (precision, height, width) = struct.unpack("!BHH", cont[pos:pos+5])
        except struct.error:
            return None
        return (width, height)


##
# This is pseudo-image, a combined image with some base64-encoded real images
class Base64File(Image):
    def __init__(self, path):
        super(self.__class__, self).__init__(path)
        self.fp = codecs.open(self.path, "rb", encoding='utf-8')

    def __del__(self):
        self.fp.close()

    def type(self):
        return "b64"

    ##
    # has to be a valid Json object
    def verify(self):
        self.fp.seek(0)
        try:
            cont = self.fp.read()
            json.loads(cont)
            isB64 = True
        except (UnicodeDecodeError,ValueError):
            isB64 = False
        return isB64


    ##
    # not really applicable for textual images
    def size(self):
        (width, height) = -1,-1
        return (width, height)


##
# Filling Image's child classes list when those classes exist
Image.CHILD_CLASSES = [PngFile, GifFile, JpegFile, Base64File]
