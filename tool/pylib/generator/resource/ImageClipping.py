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
from generator.config.ConfigurationError  import ConfigurationError


class ImageClipping(object):
    def __init__(self, console, cache, job):
        self._console = console
        self._cache   = cache
        self._job     = job


    def slice(self, source, dest_prefix, border, trim_width):

        #convert_cmd = "convert %s -crop %sx%s+%s+%s +repage %s"
        #convert_cmd = "convert %(infile)s -crop %(xoff)sx%(yoff)s+%(xorig)s+%(yorig)s +repage %(outfile)s"
        convert_cmd = self._job.get("slice-images/convert-cmd", "")
        if not convert_cmd:
            raise ConfigurationError("You need to specify a command template for the \"convert\" command (in slice-images/convert-cmd)")

        source_file = source
        dest_file   = os.path.join(os.path.dirname(source), dest_prefix)

        imginf        = Image(source_file).getInfoMap()
        width, height = imginf['width'], imginf['height']
        
        if isinstance(border, int):
            single_border = True
        elif not isinstance(border, list) or (isinstance(border, list) and not (len(border) == 4)):
            raise RuntimeError, "Border must be one integer or an array with four integers"
        else:
            single_border = False

        # Split borders and corners from source image

        # Single width for all borders
        if single_border:
            # top-left corner 
            #os.system(convert_cmd % (source_file, border, border, 0, 0, dest_file + "-tl.png"))
            os.system(convert_cmd % {'infile': source_file, 
                                  'outfile': dest_file + "-tl.png",
                                  'xoff': border, 
                                  'yoff': border, 
                                  'xorig': 0, 
                                  'yorig': 0, })
            # top border
            #os.system(convert_cmd % (source_file, border, border, border, 0, dest_file + "-t.png"))
            os.system(convert_cmd % {'infile': source_file, 
                                  'outfile': dest_file + "-t.png",
                                  'xoff': border, 
                                  'yoff': border, 
                                  'xorig': border, 
                                  'yorig': 0, })
            # top-right corner
            #os.system(convert_cmd % (source_file, border, border, width-border, 0, dest_file + "-tr.png"))
            os.system(convert_cmd % {'infile': source_file, 
                                  'outfile': dest_file + "-tr.png",
                                  'xoff': border, 
                                  'yoff': border, 
                                  'xorig': width - border, 
                                  'yorig': 0, })
    
            # left border
            #os.system(convert_cmd % (source_file, border, height-2*border, 0, border, dest_file + "-l.png"))
            os.system(convert_cmd % {'infile': source_file, 
                                  'outfile': dest_file + "-l.png",
                                  'xoff': border, 
                                  'yoff': height - 2*border, 
                                  'xorig': 0, 
                                  'yorig': border, })
            # center piece
            if trim_width:
                #os.system(convert_cmd % (source_file, min(20, width-2*border), height-2*border, border, border, dest_file + "-c.png"))            
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-c.png",
                                      'xoff': min(20, width-2*border), 
                                      'yoff': height-2*border, 
                                      'xorig': border, 
                                      'yorig': border, })
            else:
                #os.system(convert_cmd % (source_file, width-2*border, height-2*border, border, border, dest_file + "-c.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-c.png",
                                      'xoff': width-2*border, 
                                      'yoff': height-2*border, 
                                      'xorig': border, 
                                      'yorig': border, })
            # right border
            #os.system(convert_cmd % (source_file, border, height-2*border, width-border, border, dest_file + "-r.png"))
            os.system(convert_cmd % {'infile': source_file, 
                                  'outfile': dest_file + "-r.png",
                                  'xoff': border, 
                                  'yoff': height-2*border, 
                                  'xorig': width-border, 
                                  'yorig': border, })
    
            # bottom-left corner
            #os.system(convert_cmd % (source_file, border, border, 0, height-border, dest_file + "-bl.png"))
            os.system(convert_cmd % {'infile': source_file, 
                                  'outfile': dest_file + "-bl.png",
                                  'xoff': border, 
                                  'yoff': border, 
                                  'xorig': 0, 
                                  'yorig': height-border, })
            # bottom border
            #os.system(convert_cmd % (source_file, border, border, border, height-border, dest_file + "-b.png"))
            os.system(convert_cmd % {'infile': source_file, 
                                  'outfile': dest_file + "-b.png",
                                  'xoff': border, 
                                  'yoff': border, 
                                  'xorig': border, 
                                  'yorig': height-border, })
            # bottom-right corner
            #os.system(convert_cmd % (source_file, border, border, width-border, height-border, dest_file + "-br.png"))
            os.system(convert_cmd % {'infile': source_file, 
                                  'outfile': dest_file + "-br.png",
                                  'xoff': border, 
                                  'yoff': border, 
                                  'xorig': width-border, 
                                  'yorig': height-border, })
        
        # Individual borders
        else:
            if border[0] > 0 and border[3] > 0:
                # top-left corner
                #os.system(convert_cmd % (source_file, border[3], border[0], 0, 0, dest_file + "-tl.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-tl.png",
                                      'xoff': border[3], 
                                      'yoff': border[0], 
                                      'xorig': 0, 
                                      'yorig': 0, })
            if border[0] > 0:
                # top border
                #os.system(convert_cmd % (source_file, width - border[3] - border[1], border[0], border[3], 0, dest_file + "-t.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-t.png",
                                      'xoff': width - border[3] - border[1], 
                                      'yoff': border[0], 
                                      'xorig': border[3], 
                                      'yorig': 0, })
            if border[0] > 0 and border[1] > 0:
                # top-right corner
                #os.system(convert_cmd % (source_file, border[1], border[0], width - border[1], 0, dest_file + "-tr.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-tr.png",
                                      'xoff': border[1], 
                                      'yoff': border[0], 
                                      'xorig': width - border[1], 
                                      'yorig': 0, })
            if border[3] > 0:            
                # left border
                #os.system(convert_cmd % (source_file, border[3], height - border[0] - border[2], 0, border[0], dest_file + "-l.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-l.png",
                                      'xoff': border[3], 
                                      'yoff': height - border[0] - border[2], 
                                      'xorig': 0, 
                                      'yorig': border[0], })
            # center piece
            if trim_width:
                #os.system(convert_cmd % (source_file, min(20, width- border[3] - border[1]), height - border[0] - border[2], border[3], border[0], dest_file + "-c.png"))            
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-c.png",
                                      'xoff': min(20, width- border[3] - border[1]), 
                                      'yoff': height - border[0] - border[2], 
                                      'xorig': border[3], 
                                      'yorig': border[0], })
            else:
                #os.system(convert_cmd % (source_file, width- border[3] - border[1], height - border[0] - border[2], border[3], border[0], dest_file + "-c.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-c.png",
                                      'xoff': width- border[3] - border[1], 
                                      'yoff': height - border[0] - border[2], 
                                      'xorig': border[3], 
                                      'yorig': border[0], })
            if border[1] > 0:
                # right border
                #os.system(convert_cmd % (source_file, border[1], height - border[0] - border[2], width - border[1], border[0], dest_file + "-r.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-r.png",
                                      'xoff': border[1], 
                                      'yoff': height - border[0] - border[2], 
                                      'xorig': width - border[1], 
                                      'yorig': border[0], })
            if border[2] > 0 and border[3] > 0:
                # bottom-left corner
                #os.system(convert_cmd % (source_file, border[3], border[2], 0, height - border[2], dest_file + "-bl.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-bl.png",
                                      'xoff': border[3], 
                                      'yoff': border[2], 
                                      'xorig': 0, 
                                      'yorig': height - border[2], })
            if border[2] > 0:
                # bottom border
                #os.system(convert_cmd % (source_file, width- border[3] - border[1], border[2], border[3], height - border[2], dest_file + "-b.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-b.png",
                                      'xoff': width- border[3] - border[1], 
                                      'yoff': border[2], 
                                      'xorig': border[3], 
                                      'yorig': height - border[2], })
            if border[2] > 0 and border[1] > 0:
                # bottom-right corner
                #os.system(convert_cmd % (source_file, border[1], border[2], width - border[1], height - border[2], dest_file + "-br.png"))
                os.system(convert_cmd % {'infile': source_file, 
                                      'outfile': dest_file + "-br.png",
                                      'xoff': border[1], 
                                      'yoff': border[2], 
                                      'xorig': width - border[1], 
                                      'yorig': height - border[2], })
        
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
        montage_cmd = self._job.get("combine-images/montage-cmd", "")
        if not montage_cmd:
            raise ConfigurationError("You need to specify a command template for the \"montage\" command (in combine-images/montage-cmd)")
        (fileDescriptor, tempPath) = tempfile.mkstemp(text=True, dir=os.curdir)
        temp = os.fdopen(fileDescriptor, "w")
        temp.write("\n".join(clips))
        temp.close()
        cmd = montage_cmd % {"orientation": orientation, "tempfile": os.path.basename(tempPath), "combinedfile": combined}
        print cmd
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

