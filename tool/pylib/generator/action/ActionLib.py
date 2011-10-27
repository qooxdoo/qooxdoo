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

import re, os, sys, types, glob

from generator.runtime.ShellCmd import ShellCmd

##
# Library that contains various functions that implement Generator job actions
# (aka. 'triggers')
#

class ActionLib(object):
    def __init__(self, config, console_):
        self._config   = config
        self._console  = console_
        self._shellCmd = ShellCmd()

    def clean(self, cleanMap):
        assert isinstance(cleanMap, types.DictType)
        for item in cleanMap:
            self._console.info(item)
            for file in cleanMap[item]:
                file = self._config.absPath(file) 
                # resolve file globs
                for entry in glob.glob(file):
                    # safety first
                    if os.path.splitdrive(entry)[1] == os.sep:
                        raise RuntimeError, "!!! I'm not going to delete '/' recursively !!!"
                    self._shellCmd.rm_rf(entry)
