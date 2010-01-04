#!/usr/bin/env python
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
#  Library  -- class for the internal represantation of a qooxdoo library
#
##

import os, sys, re, types, string, copy
from misc import json


class Library(object):

    def __init__(self, map):
        self.namespace      = map.get('namespace')
        self.path           = map.get('path')
        self.type           = map.get('type')
        self.encoding       = map.get('encoding')
        self.version        = map.get('version')
        self.qooxdoo_versions = map.get('qooxdoo-versions')
        self.scriptUri      = map.get('class')
        self.resourceUri    = map.get('resource')
        self.translationUri = map.get('translation')

    def getData(self):
        return self.__dict__

    def getMap(self):
        map = {}
        for elem, value in self.getData().items():
            if value == None:
                continue
            elif elem == "scriptUri":
                map['class'] = value
            elif elem == "resourceUri":
                map['resource'] = value
            elif elem =="translationUri":
                map['translation'] = value
            elif elem == "qooxdoo_versions":
                map['qooxdoo-versions'] = value
            else:
                map[elem] = value
        return map



