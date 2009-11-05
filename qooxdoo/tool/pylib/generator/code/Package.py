#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
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
# Package -- Internal representation of a script package
##

from misc.securehash import sha_construct
from misc import json

class Package(object):

    def __init__(self, id):
        self.id         = id   # int representing bit mask for each using part turned on
        self.classes    = []   # list of classes in this package
        self.part_count = 0    # number of parts using this package
        self.parts      = []   # list of parts using this package
        self.resources  = {}   # {resourceId: resourceInfo}
        self.packageDeps= set(()) # set packages this package depends on


    ##
    # return the package as string, so it can be saved in a file and used
    # implements the package format:
    #
    #   +-------------+
    #   |   DATA      |
    #   +-------------+
    #   |   Class1    |
    #   |   Class2    |
    #   |   ...       |
    #   +-------------+
    #

    def packageCode(self):
        def getDataString():
            data  = {}
            return json.dumpsCode(data)  # TODO

        def getClassesString():
            result = u''
            for clazz in self.classes:
                result += clazz.compiled()  # TODO
            return result

        def getHash(buffer):
            hashCode = sha_construct(buffer).hexdigest()
            return hashCode

        # ----------------------------------------------------------------------
        packageContent  = u''
        dataString      = getDataString()
        classesString   = getClassesString()
        contentHash     = getHash(dataString + classesString)
        packageContent += 'qx.$$packageData[' + contentHash + ']=' + dataString + ';'
        packageContent += classesString
        return contentHash, packageContent

