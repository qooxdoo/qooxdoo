#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2012 1&1 Internet AG, Germany, http://www.1und1.de
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
# Actions dealing with Resources (Images, etc.).
##

import sys, os, re, types, string, glob
from misc import Path, filetool, json
from generator import Context
from generator.resource.Image        import Image
from generator.resource.ImageClipping    import ImageClipping

def runImageSlicing(jobconf, confObj):
    """Go through a list of images and slice each one into subimages"""
    if not jobconf.get("slice-images", False):
        return

    console = Context.console
    cache = Context.cache
    imageClipper = ImageClipping(console, cache, jobconf)

    images = jobconf.get("slice-images/images", {})
    for image, imgspec in images.iteritems():
        image = confObj.absPath(image)
        # wpbasti: Rename: Border => Inset as in qooxdoo JS code
        prefix       = imgspec['prefix']
        border_width = imgspec['border-width']
        if 'trim-width' in imgspec:
            trim_width = imgspec['trim-width']
        else:
            trim_width = True
        imageClipper.slice(image, prefix, border_width, trim_width)


##
# Go through a list of images and create them as combination of other images
def runImageCombining(jobconf, confObj):

    def extractFromPrefixSpec(prefixSpec):
        prefix = altprefix = ""
        if not prefixSpec or not isinstance(prefixSpec, types.ListType):
            if jobconf.get("config-warnings/combine-images", True):
                console.warn("Missing or incorrect prefix spec, might lead to incorrect resource id's.")
        elif len(prefixSpec) == 2 :  # prefixSpec = [ prefix, altprefix ]
            prefix, altprefix = prefixSpec
        elif len(prefixSpec) == 1:
            prefix            = prefixSpec[0]
            altprefix         = ""
        return prefix, altprefix

    ##
    # strip prefix - if available - from imagePath, and replace by altprefix
    def getImageId(imagePath, prefixSpec):
        prefix, altprefix = extractFromPrefixSpec(prefixSpec)
        imageId = imagePath # init
        _, imageId, _ = Path.getCommonPrefix(imagePath, prefix) # assume: imagePath = prefix "/" imageId
        if altprefix:
            imageId   = altprefix + "/" + imageId

        imageId = Path.posifyPath(imageId)
        return imageId

    ##
    # create a dict with the clipped image file path as key, and prefix elements as value
    def getClippedImagesDict(imageSpec):
        imgDict = {}
        inputStruct = imageSpec['input']
        for group in inputStruct:
            prefixSpec = group.get('prefix', [])
            prefix, altprefix = extractFromPrefixSpec(prefixSpec)
            if prefix:
                prefix = confObj.absPath(prefix)
            for filepatt in group['files']:
                num_files = 0
                for file in glob.glob(confObj.absPath(filepatt)):  # resolve file globs - TODO: can be removed in generator.action.ImageClipping
                    console.debug("adding image %s" % file)
                    imgDict[file]    = [prefix, altprefix]
                    num_files       += 1
                if num_files == 0:
                    raise ValueError("Non-existing file spec: %s" % filepatt)

        return imgDict

    # ----------------------------------------------------------------------

    if not jobconf.get("combine-images", False):
        return
    
    console = Context.console
    cache = Context.cache

    console.info("Combining images...")
    console.indent()
    imageClipper = ImageClipping(console, cache, jobconf)

    images = jobconf.get("combine-images/images", {})
    for image, imgspec in images.iteritems():
        console.info("Creating image %s" % image)
        console.indent()
        imageId= getImageId(image, imgspec.get('prefix', []))
        image  = confObj.absPath(image)  # abs output path
        config = {}

        # create a dict of clipped image objects - for later look-up
        clippedImages = getClippedImagesDict(imgspec)

        # collect list of all input files, no matter where they come from
        input = sorted(clippedImages.keys())

        # collect layout property
        if 'layout' in imgspec:
            layout = imgspec['layout'] == "horizontal"
        else:
            layout = "horizontal" == "horizontal" # default horizontal=True

        # get type of combined image (png, base64, ...)
        combtype = "base64" if image.endswith(".b64.json") else "extension"

        # create the combined image
        subconfigs = imageClipper.combine(image, input, layout, combtype)

        # for the meta information, go through the list of returned subconfigs (one per clipped image)
        for sub in subconfigs:
            x = Image()
            x.combId, x.left, x.top, x.width, x.height, x.format = (
               imageId, sub['left'], sub['top'], sub['width'], sub['height'], sub['type'])
            subId = getImageId(sub['file'], clippedImages[sub['file']])
            config[subId] = x.toMeta()

        # store meta data for this combined image
        bname = os.path.basename(image)
        ri = bname.rfind('.')
        if ri > -1:
            bname = bname[:ri]
        bname += '.meta'
        meta_fname = os.path.join(os.path.dirname(image), bname)
        console.debug("writing meta file %s" % meta_fname)
        filetool.save(meta_fname, json.dumps(config, ensure_ascii=False, sort_keys=True))
        console.outdent()

        # handle base64 type, need to write "combined image" to file
        if combtype == "base64":
            combinedMap = {}
            for sub in subconfigs:
                subMap = {}
                subId  = getImageId(sub['file'], clippedImages[sub['file']])
                subMap['width']    = sub['width']
                subMap['height']   = sub['height']
                subMap['type']     = sub['type']
                subMap['encoding'] = sub['encoding']
                subMap['data']     = sub['data']
                combinedMap[subId] = subMap
            filetool.save(image, json.dumpsCode(combinedMap))

    console.outdent()

    return


