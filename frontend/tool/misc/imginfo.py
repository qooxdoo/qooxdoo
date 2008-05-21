#!/usr/bin/env python
# encoding: utf-8

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
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import sys
import os
import struct


class ImgFile(object):
    def __init__(self, filename):
        self.fp = open(filename, "rb")

    def verify(self):
        raise NotImplementedError, "%s: %s" % (self.__class__, "verify()")

    def type(self):
        raise NotImplementedError, "%s: %s" % (self.__class__, "type()")

    def size(self):
        raise NotImplementedError, "%s: %s" % (self.__class__, "size()")

    def close(self):
        self.fp.close()

    def __del__(self):
        self.close()


# http://www.w3.org/Graphics/GIF/spec-gif89a.txt
class GifFile(ImgFile):
    def verify(self):
        self.fp.seek(0)
        header = self.fp.read(6)
        signature = struct.unpack("3s3s", header[:6])
        isGif = signature[0] == "GIF" and signature[1] in ["87a", "89a"]
        return isGif

    def type(self):
        return "gif"

    def size(self):
        self.fp.seek(0)
        header = self.fp.read(6+6)
        (width, height) = struct.unpack("<HH", header[6:10])
        return width, height


# http://www.libmng.com/pub/png/spec/1.2/png-1.2-pdg.html#Structure
class PngFile(ImgFile):
    def __init__(self, filename):
        ImgFile.__init__(self, filename)

    def type(self):
        return "png"

    def verify(self):
        self.fp.seek(0)
        header = self.fp.read(8)
        signature = struct.pack("8B", 137, 80, 78, 71, 13, 10, 26, 10)
        isPng = header[:8] == signature
        return isPng


    def size(self):
        self.fp.seek(0)
        header = self.fp.read(8+4+4+13+4)
        ihdr = struct.unpack("!I4s", header[8:16])
        data = struct.unpack("!II5B", header[16:29])
        (width, height, bitDepth, colorType, compressionMethod, filterMethod, interleaceMethod) = data
        return (width, height)


# http://www.obrador.com/essentialjpeg/HeaderInfo.htm
class JpegFile(ImgFile):
    def verify(self):
        self.fp.seek(0)
        signature = struct.unpack("!H", self.fp.read(2))
        isJpeg = signature[0] == 0xFFD8
        return isJpeg

    def type(self):
        return "jpeg"

    def size(self):
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


class ImgInfo(object):
    def __init__(self, filename):
        self.__filename = filename

    classes = [PngFile, GifFile, JpegFile]

    def getSize(self):
        ''' Returns the image sizes of png, gif and jpeg files as
            (width, height) tuple '''
        filename = self.__filename
        classes = self.classes

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
        filename = self.__filename
        classes = self.classes
        
        for cls in classes:
            img = cls(filename)
            if img.verify():
                size = img.size()
                if size is not None:
                    return size + (img.type(),)

        return None


def main(filename):
    print ImgInfo(filename).getInfo()


if __name__ == '__main__':
    main(sys.argv[1])

