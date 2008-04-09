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
from generator.ImageInfo import ImageInfo


class ImageClipping(object):
    def __init__(self, console, cache):
        self._console = console
        self._cache   = cache
        self._imageInfo = ImageInfo(self._console, self._cache)


    def split_grid(self, file, source, dest, border):

        source_file = os.path.join(source, file) + ".png"
        dest_file = os.path.join(dest, file)

        width, height, type = self._imageInfo.getImageInfo(source_file)

        crop_cmd = "convert %s -crop %sx%s+%s+%s +repage %s"

        # split
        os.system(crop_cmd % (source_file, border, border, 0, 0, dest_file + "-tl.png"))
        os.system(crop_cmd % (source_file, border, border, border, 0, dest_file + "-t.png"))
        os.system(crop_cmd % (source_file, border, border, width-border, 0, dest_file + "-tr.png"))

        os.system(crop_cmd % (source_file, border, height-2*border, 0, border, dest_file + "-l.png"))
        os.system(crop_cmd % (source_file, 40, height-2*border, border, border, dest_file + "-c.png"))
        os.system(crop_cmd % (source_file, border, height-2*border, width-border, border, dest_file + "-r.png"))

        os.system(crop_cmd % (source_file, border, border, 0, height-border, dest_file + "-bl.png"))
        os.system(crop_cmd % (source_file, border, border, border, height-border, dest_file + "-b.png"))
        os.system(crop_cmd % (source_file, border, border, width-border, height-border, dest_file + "-br.png"))


    def combine(self, combined, files, horizontal, config=[]):
        montage_cmd = "montage -geometry +0+0 -gravity NorthWest -tile %s -background None %s %s"
        if horizontal:
            orientation = "x1"
        else:
            orientation = "1x"

        # combine
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
                           'top': -top, 'width':width, 'height':height})
            if horizontal:
                left += width
            else:
                top += height
        os.system(montage_cmd % (orientation, " ".join(clips), combined))

        return config


    def add_file(self, file, config):
        width, height, type = self._imageInfo.getImageInfo(file)
        config.append('"%s": ["%s", 0, 0, %s, %s]' % (file, file, width, height))


    def process_buttons(self, config):
        files = [
            "button-checked-focused",
            "button-checked",
            "button-preselected-focused",
            "button-preselected",
            "button-pressed",
            "button-hovered",
            "button-focused",
            "button"
        ]

        for file in files:
            split_grid(file, "source", "form", 4)


        clips = []
        for file in files:
            for suffix in ["tl", "t" , "tr", "bl", "b", "br"]:
                clips.append("form/%s-%s.png" % (file, suffix))
        combine_images(clips, "button-tb-combined.png", False, config)

        clips = []
        for file in files:
            for suffix in ["l", "r"]:
                clips.append("form/%s-%s.png" % (file, suffix))
        combine_images(clips, "button-lr-combined.png", True, config)

        for file in files:
            add_file("form/%s-c.png" % file, config)


    def process_panes(self, config):
        split_grid("pane", "source", "pane", 6)
        clips = []
        for suffix in ["tl", "t" , "tr", "bl", "b", "br"]:
            clips.append("pane/%s-%s.png" % ("pane", suffix))
        combine_images(clips, "pane-tb-combined.png", False, config)

        clips = []
        for suffix in ["l", "r"]:
            clips.append("pane/%s-%s.png" % ("pane", suffix))
        combine_images(clips, "pane-lr-combined.png", True, config)

        add_file("pane/pane-c.png", config)


    def process_checkradio(self, config):
        files = glob.glob("form/checkbox-*.png") + glob.glob("form/radiobutton-*.png")
        combine_images(files, "checkradio-combined.png", True, config)



    def main(self):

        config = []

        process_buttons(config)
        process_panes(config)
        process_checkradio(config)

        print "        " + ",\n        ".join(config)


if __name__ == '__main__':
	ImageClipping().main()

