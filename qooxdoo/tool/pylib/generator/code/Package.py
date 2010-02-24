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
# Package -- Internal representation of a script package
#
# Responsibilities:
# - represent a package for part calculation
# - support package (code) generation
#
# Ideally, the Package class can handle both
# - source packages, being a list of class files
# - build packages, where each package has to be generated, with compiled
#   code, data, etc.
##

from generator import Context
from misc.securehash import sha_construct
from misc import json
from misc.NameSpace import NameSpace

class Package(object):

    def __init__(self, id):
        self.id         = id   # int representing bit mask for each using part turned on
        self.file       = ""   # an optional file name, to store the package in, if desired
        self.classes    = []   # list of classes in this package
        self.part_count = 0    # number of parts using this package
        self.parts      = []   # list of parts using this package
        self.data       = NameSpace() # an extensible container
        self.data.resources    = {}   # {resourceId: resourceInfo}
        self.data.locales      = {}   # {"en" : {"cldr_am" : "AM"}}
        self.data.translations = {}   # {"en" : {"Hello"   : "Hallo"}}
        self.packageDeps= set(()) # set packages this package depends on


    def __repr__(self):
        return "<%s:%r>" % (self.__class__.__name__, self.id)


    # --------------------------------------------------------------------------
    #    Code Generating Functions                                              
    # --------------------------------------------------------------------------

    ##
    # for build version:
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

    def packageContent(self):
        def getDataString():
            data  = self.packageData()
            return json.dumpsCode(data)

        def getCodeString():
            return self.packageCode()

        def getHash(buffer):
            hashCode = sha_construct(buffer).hexdigest()
            return hashCode

        # ----------------------------------------------------------------------
        packageContent = u''
        dataString     = getDataString()
        classesString  = getCodeString()
        contentHash    = getHash(dataString + classesString)
        packageContent = u'''qx.$$packageData["%s"]=%s;
qx.Part.$$notifyLoad("%s", function() {
%s
});''' % (contentHash, dataString, contentHash, classesString)
        return contentHash, packageContent


    ##
    # return a code string containing the code of classes associated with this
    # package (self.classes)
    #
    # This routine (will) define(s) the structure of the code part of a 
    # package!

    def packageCode(self):
        result = u''
        for clazz in self.classes:
            result += clazz.compiled()  # TODO
        return result
    ##
    # return data associated with this package (resource info, locales,
    # translations)
    #
    # This routine (will) define(s) the structure of the data part of a 
    # package!

    def packageData(self):
        pkgdata = {}

        # Resources
        pkgdata["resources"] = self.data.resources

        # Locales
        pkgdata["locales"]   = self.data.locales

        # Translations
        pkgdata["translations"]  = self.data.translations

        return pkgdata


    # --------------------------------------------------------------------------
    #    Comparing and Sorting Packages                                         
    # --------------------------------------------------------------------------

    ##
    # this is to replace PartBuilder._sortPackages

    @classmethod
    def simpleSort(clazz, packages=[]):
        return sorted(packages, cmp=clazz.compareByPartCount, reverse=True)


    ##
    # a simple sort(cmp=) function, comparing only by part_count

    @staticmethod
    def compareByPartCount(a, b):
        return cmp(a.part_count, b.part_count)


    ##
    # a complex sort(cmp=) function, comparing by part_count and dependencies
    # (I would like to use this throughout, eliminating compareByPartCount)

    @staticmethod
    def compareWithDeps(a, b):
        if a.part_count != b.part_count:
            return cmp(a.part_count, b.part_count)
        else:
            if a not in b.packageDeps and b not in a.packageDeps:  # unrelated, either is fine
                return 0
            if a in b.packageDeps and b not in a.packageDeps:  # b needs a, so a is "larger" (must be earlier)
                return 1
            elif b in a.packageDeps and a not in b.packageDeps: # other way round
                return -1
            else:
                msg = "Circular dependencies between packages: #%d - #%d" % (a.id, b.id)
                console.warn("! "+msg)
                return 0

