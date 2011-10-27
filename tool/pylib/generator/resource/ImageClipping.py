#!/usr/bin/env python
# encoding: utf-8
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
#    * Fabian Jakobs (fjakobs)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  ImageClipping.py -- clip and combine image files
#
# DESCRIPTION
#  The module module has two main functions:
#  - clip a larger image into smaller pieces (e.g. a button image into its 9 components)
#  - create a combined image file from various separate images
#</pre>
##

import sys, os, glob, shutil, tempfile

from misc                      import filetool
from generator.resource.Image  import Image


class ImageClipping(object):
    def __init__(self, console, cache):
        self._console = console
        self._cache   = cache


    def slice(self, source, dest_prefix, border, trim_width):

        source_file = source
        dest_file   = os.path.join(os.path.dirname(source), dest_prefix)

        imginf        = Image(source_file).getInfoMap()
        width, height = imginf['width'], imginf['height']

        crop_cmd = "convert %s -crop %sx%s+%s+%s +repage %s"
        
        if isinstance(border, int):
            single_border = True
        elif not isinstance(border, list) or (isinstance(border, list) and not (len(border) == 4)):
            raise RuntimeError, "Border must be one integer or an array with four integers"
        else:
            single_border = False

        # split
        if single_border:
            os.system(crop_cmd % (source_file, border, border, 0, 0, dest_file + "-tl.png"))
            os.system(crop_cmd % (source_file, border, border, border, 0, dest_file + "-t.png"))
            os.system(crop_cmd % (source_file, border, border, width-border, 0, dest_file + "-tr.png"))
    
            os.system(crop_cmd % (source_file, border, height-2*border, 0, border, dest_file + "-l.png"))
            if trim_width:
                os.system(crop_cmd % (source_file, min(20, width-2*border), height-2*border, border, border, dest_file + "-c.png"))            
            else:
                os.system(crop_cmd % (source_file, width-2*border, height-2*border, border, border, dest_file + "-c.png"))
            os.system(crop_cmd % (source_file, border, height-2*border, width-border, border, dest_file + "-r.png"))
    
            os.system(crop_cmd % (source_file, border, border, 0, height-border, dest_file + "-bl.png"))
            os.system(crop_cmd % (source_file, border, border, border, height-border, dest_file + "-b.png"))
            os.system(crop_cmd % (source_file, border, border, width-border, height-border, dest_file + "-br.png"))
        else:
            if border[0] > 0 and border[3] > 0:
                os.system(crop_cmd % (source_file, border[3], border[0], 0, 0, dest_file + "-tl.png"))
            if border[0] > 0:
                os.system(crop_cmd % (source_file, width - border[3] - border[1], border[0], border[3], 0, dest_file + "-t.png"))
            if border[0] > 0 and border[1] > 0:
                os.system(crop_cmd % (source_file, border[1], border[0], width - border[1], 0, dest_file + "-tr.png"))
            if border[3] > 0:            
                os.system(crop_cmd % (source_file, border[3], height - border[0] - border[2], 0, border[0], dest_file + "-l.png"))
            if trim_width:
                os.system(crop_cmd % (source_file, min(20, width- border[3] - border[1]), height - border[0] - border[2], border[3], border[0], dest_file + "-c.png"))            
            else:
                os.system(crop_cmd % (source_file, width- border[3] - border[1], height - border[0] - border[2], border[3], border[0], dest_file + "-c.png"))
            if border[1] > 0:
                os.system(crop_cmd % (source_file, border[1], height - border[0] - border[2], width - border[1], border[0], dest_file + "-r.png"))
            if border[2] > 0 and border[3] > 0:
                os.system(crop_cmd % (source_file, border[3], border[2], 0, height - border[2], dest_file + "-bl.png"))
            if border[2] > 0:
                os.system(crop_cmd % (source_file, width- border[3] - border[1], border[2], border[3], height - border[2], dest_file + "-b.png"))
            if border[2] > 0 and border[1] > 0:
                os.system(crop_cmd % (source_file, border[1], border[2], width - border[1], height - border[2], dest_file + "-br.png"))
        
        # for css3, the original images are used
        shutil.copyfile(source_file, dest_file + ".png")


    def combine(self, combined, files, horizontal, type="extension"):
        self._console.indent()
        if horizontal:
            orientation = "x1"
        else:
            orientation = "1x"

        # combine
        config = []
        clips = []
        top = 0
        left = 0
        allfiles = []
        for file in files:
            allfiles.extend(glob.glob(file))
        #self._console.debug("Combining the following images: %r" % allfiles)
        for file in allfiles:
            if not os.path.exists(file):
                self._console.warn("Non-existing file spec, skipping: %s" % file)
                continue
            clips.append(file)
            imginfo = Image(file).getInfoMap()
            width, height = imginfo['width'], imginfo['height']
            config.append({'file':file, 'combined':combined, 'left': -left,
                           'top': -top, 'width':width, 'height':height, 'type':imginfo['type']})
            if horizontal:
                left += width
            else:
                top += height

        if len(clips) == 0:
            self._console.warn("No images to combine; skipping")
        else:
            filetool.directory(os.path.dirname(combined))
            if type == "extension":
                self.combineImgMagick(clips, combined, orientation)
            elif type == "base64":
                self.combineBase64(config)

        self._console.outdent()
        return config


    def combineImgMagick(self, clips, combined, orientation):
        montage_cmd = "montage -geometry +0+0 -gravity NorthWest -tile %s -background None %s %s"
        (fileDescriptor, tempPath) = tempfile.mkstemp(text=True, dir=os.curdir)
        temp = os.fdopen(fileDescriptor, "w")
        temp.write("\n".join(clips))
        temp.close()
        cmd = montage_cmd % (orientation, "@" + os.path.basename(tempPath), combined)
        rc = os.system(cmd)
        os.unlink(tempPath)
        if rc != 0:
            raise RuntimeError, "The montage command (%s) failed with the following return code: %d" % (cmd, rc)


    ##
    # Put the base64 data into the imgInfos structures, which will be read
    # by the caller (Generator) and written to file (as the caller has the
    # proper resource id's).
    def combineBase64(self, imgInfos):
        for imgInfo in imgInfos:
            base64dat = Image(imgInfo['file']).toBase64()
            imgInfo['encoding'] =  "base64"
            imgInfo['data'] = base64dat

