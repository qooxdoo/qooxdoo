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
#
################################################################################

##
# NAME
#  Manifest  -- class that represents a Manifest.json file, with operations
#
##

import os, sys, re, types, string, copy, codecs
from misc import json
from generator.config.ConfigurationError import ConfigurationError


class Manifest(object):
    def __init__(self, path):
        self.path = path
        mf = codecs.open(path, "r", "utf-8")
        manifest = json.loads(mf.read())
        mf.close()
        self._manifest = manifest
        self.libinfo       = self._manifest['info']
        self.libprovides   = self._manifest['provides']
        self.classpath = self.libprovides['class']
        self.translation = self.libprovides['translation']
        self.namespace = self.libprovides['namespace']
        self.encoding = self.libprovides['encoding']
        self.resource = self.libprovides['resource']
        self.type = self.libprovides['type']

    def patchLibEntry(self, libentry):
        '''Patches a "library" entry with the information from Manifest'''
        libinfo       = self._manifest['info']
        libprovides   = self._manifest['provides']
        #uriprefix = libentry['uri']
        uriprefix = ""
        libentry['class']         = os.path.join(uriprefix,libprovides['class'])
        libentry['resource']      = os.path.join(uriprefix,libprovides['resource'])
        libentry['translation']   = os.path.join(uriprefix,libprovides['translation'])
        if 'translation' in libprovides:
            libentry['translation']   = os.path.join(uriprefix,libprovides['translation'])
        libentry['encoding']    = libprovides['encoding']
        if 'namespace' in libentry:
            if libentry['namespace'] != libprovides['namespace']:
                raise ConfigurationError("Mismatch between Manifest namespace and directory namespaces")
        else:
            libentry['namespace']   = libprovides['namespace']
        libentry['type']        = libprovides['type']
        libentry['path']        = os.path.dirname(libentry['manifest']) or '.'

        # from the 'info' section
        if 'version' in libinfo:
            libentry['version'] = libinfo['version']
        if 'qooxdoo-versions' in libinfo:
            libentry['qooxdoo-versions'] = libinfo['qooxdoo-versions']
        if 'sourceViewUri' in libinfo:
            libentry['sourceViewUri'] = libinfo['sourceViewUri']

        return libentry


