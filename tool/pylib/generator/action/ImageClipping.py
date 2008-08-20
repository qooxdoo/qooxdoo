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

import sys, os, glob
from generator.action.ImageInfo import ImageInfo


class ImageClipping(object):
    def __init__(self, console, cache):
        self._console = console
        self._cache   = cache
        self._imageInfo = ImageInfo(self._console, self._cache)


    def slice(self, source, dest_prefix, border):

        source_file = source
        dest_file   = os.path.join(os.path.dirname(source), dest_prefix)

        imginf        = self._imageInfo.getImageInfo(source_file)
        width, height = imginf['width'], imginf['height']

        crop_cmd = "convert %s -crop %sx%s+%s+%s +repage %s"

        # split
        os.system(crop_cmd % (source_file, border, border, 0, 0, dest_file + "-tl.png"))
        os.system(crop_cmd % (source_file, border, border, border, 0, dest_file + "-t.png"))
        os.system(crop_cmd % (source_file, border, border, width-border, 0, dest_file + "-tr.png"))

        os.system(crop_cmd % (source_file, border, height-2*border, 0, border, dest_file + "-l.png"))
        os.system(crop_cmd % (source_file, min(20, width-2*border), height-2*border, border, border, dest_file + "-c.png"))
        os.system(crop_cmd % (source_file, border, height-2*border, width-border, border, dest_file + "-r.png"))

        os.system(crop_cmd % (source_file, border, border, 0, height-border, dest_file + "-bl.png"))
        os.system(crop_cmd % (source_file, border, border, border, height-border, dest_file + "-b.png"))
        os.system(crop_cmd % (source_file, border, border, width-border, height-border, dest_file + "-br.png"))


    def combine(self, combined, files, horizontal):
        montage_cmd = "montage -geometry +0+0 -gravity NorthWest -tile %s -background None %s %s"
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
        for file in allfiles:
            clips.append(file)
            imginfo = self._imageInfo.getImageInfo(file)
            width, height = imginfo['width'], imginfo['height']
            config.append({'file':file, 'combined':combined, 'left': -left,
                           'top': -top, 'width':width, 'height':height, 'type':imginfo['type']})
            if horizontal:
                left += width
            else:
                top += height
        os.system(montage_cmd % (orientation, " ".join(clips), combined))

        return config


