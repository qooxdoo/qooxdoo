#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2016 GONICUS GmbH, Germany, http://www.gonicus.de
#
#  License:
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Cajus Pollmeier (cajus)
#
################################################################################

##
# Class to represent a font map the generator, i.e. essentially the
# information of the .meta file without exposing its file layout.
##

import re, os, sys, types

from misc                        import filetool, json
from generator.resource.Resource import Resource

class FontMap(Resource):

    def __init__(self, path=None):
        super(FontMap, self).__init__(path)
        self.width = None
        self.alias = None
        self.mapping = {}
        if path:
            self.parseMetaFile(path)

    FILE_EXTENSIONS = "ttf woff woff2 eot otf".split()
    FILE_EXTENSIONPATT = re.compile(r'\.(%s)$' % "|".join(FILE_EXTENSIONS), re.I)

    def parseMetaFile(self, path):
        # Read the .meta file
        # it doesn't seem worth to apply caching here
        meta_fname   = os.path.splitext(path)[0]+'.meta'
        try:
            meta_content = filetool.read(meta_fname)
            fontDict      = json.loads(meta_content)
        except Exception, e:
            msg = "Reading of .meta file failed: '%s'" % meta_fname + (
                "\n%s" % e.args[0] if e.args else ""
                )
            e.args = (msg,) + e.args[1:]
            raise

        self.width = self.height = fontDict["size"]
        self.alias = fontDict["alias"]
        self.mapping = fontDict["mapping"]
        return


    @staticmethod
    def isFontMap(fpath):
        if FontMap.FILE_EXTENSIONPATT.search(fpath):
            i = fpath.rfind(".")
            meta_fname = fpath[:i] + '.meta'
            return os.path.exists(meta_fname)

        return False


    ##
    # @overloaded
    def toResinfo(self):
        a = [self.alias, self.width, self.height, self.library.namespace if self.library else "", self.mapping]
        return a
