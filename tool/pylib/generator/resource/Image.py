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
#    MIT: https://opensource.org/licenses/MIT
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
import xml.etree.cElementTree as et

from misc import filetool, json
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

    FILE_EXTENSIONS = "png jpeg jpg gif svg b64.json".split()
    FILE_EXTENSIONPATT = re.compile(r'\.(%s)$' % "|".join(FILE_EXTENSIONS), re.I)

    def analyzeImage(self):

        if self.format and self.width and self.height:
            return

        # imgInfo = (width, height, format/type)
        imgInfo = self.getInfo()
        if not imgInfo:
            raise RuntimeError, "Unable to get file info from file: %s" % self.path
        if not imgInfo[0] or not imgInfo[1] or not imgInfo[2]:
            raise RuntimeError, "Unable to get image size from file: %s" % self.path

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


class SvgFile(Image):
    DPI = 72

    def __init__(self, path):
        super(self.__class__, self).__init__(path)
        self.fp = open(self.path, "r")

    def __del__(self):
        self.fp.close()

    def type(self):
        return "svg"

    def verify(self):
        tag = None
        try:
            for event, el in et.iterparse(self.fp, ('start',)):
                tag = el.tag
                break
        except (struct.error, IOError, SyntaxError):
            # SyntaxError: seems to be no valid XML (or XML at all)
            pass
        return tag == '{http://www.w3.org/2000/svg}svg'

    def convert_to_pixels(self, str_value):
        value = -1

        if len(str_value) > 0:
            str_value = re.sub(r"[ ,]", "", str_value)
            str_value = str_value.replace(' ', '').replace(',', '')
            data = re.compile('(\d+(?:\.\d+)?)(\%|em|ex|px|cm|mm|in|pt|pc)?').match(str_value)

            if data:
                data = data.groups()

                if data[0]:
                    value = float(data[0])

                if data[1]:
                    unit = data[1]

                    if unit == 'cm':
                        value = value * SvgFile.DPI / 2.54
                    elif unit == 'mm':
                        value = value * SvgFile.DPI / 25.4
                    elif unit == 'in':
                        value = value * SvgFile.DPI
                    elif unit == 'pt':
                        value = value * SvgFile.DPI / 72
                    elif unit == 'pc':
                        value = value * SvgFile.DPI / 6
                    elif unit != 'px':
                        value = -1

        return int(round(value))

    def size(self):
        self.fp.seek(0)
        tag = None
        width = -1
        height = -1
        try:
            for event, el in et.iterparse(self.fp, ('start',)):
                tag = el.tag
                width = self.convert_to_pixels(el.attrib["width"])
                height = self.convert_to_pixels(el.attrib["height"])
                break
        except (struct.error, IOError, KeyError):
            pass
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

    sof_range = tuple(range(0xffc0,0xffc3+1) + range(0xffc9,0xffcb+1))  # SOFn according to spec.(ITU T.81)
    segments = {
        # (http://en.wikipedia.org/wiki/Jpeg)
        (0xffd8,) : 0,  # soi - no length bytes, no payload
        sof_range : 2,  # sofN - 2 length bytes - N is someOf(0..f) (low-nibble of marker)
        (0xffc4,) : 2,  # dht - 2 len byte
        (0xffdb,) : 2,  # dqt - 2 len byte
        (0xffdd,) : 2,  # dri - 2 len byte (value always 4)
        (0xffda,) : 2,  # sos
        tuple(range(0xffd0,0xffd7)) : 0,  # rstN - N is oneOf(0..7)
        tuple(range(0xffe0,0xffef)) : 2,  # appN - N is oneOf(0..f)
        (0xfffe,) : 2,  # com
        (0xffd9,) : 0,  # eoi - no payload, no length
    }
    def SegmentIterator(self, cont):
        pos = 0
        clen = len(cont)
        while pos<clen-1:
            segmarker, = struct.unpack("!H", cont[pos:pos+2])
            # assert segmarker & 0xff00 == 0xff00  # markers have to start with 0xff
            for range_,lengthlen_ in self.segments.items():
                if segmarker in range_:
                    lengthlen = lengthlen_
                    break
            if lengthlen == 2:
                paylen, = struct.unpack("!H", cont[pos+2:pos+2+lengthlen])
                paystart = pos + 2 + lengthlen
            else:
                paylen = 0
                paystart = pos + 2
            yield (segmarker, paystart, paylen)
            pos += 2 + paylen  # paylen includes lengthlen

    def size(self):
        self.fp.seek(0)
        cont = self.fp.read()
        for segmarker,paystart,paylen in self.SegmentIterator(cont):
            # try both Baseline DCT Start-of-frame marker (SOF0)
            # and Progressive DCT Start-of-frame marker (SOF2)
            if segmarker in self.sof_range:
                (precision, height, width) = struct.unpack("!BHH", cont[paystart:paystart+5])
                return (width, height)
        return None

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
        except (UnicodeDecodeError,json.DecodeError):
            isB64 = False
        return isB64


    ##
    # not really applicable for textual images
    def size(self):
        (width, height) = -1,-1
        return (width, height)


##
# Filling Image's child classes list when those classes exist
Image.CHILD_CLASSES = [PngFile, GifFile, JpegFile, SvgFile, Base64File]
