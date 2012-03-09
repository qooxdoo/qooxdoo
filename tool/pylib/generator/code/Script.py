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
# Script -- Internal representation of all script code comprising an
#           application / library
##

import re

from misc                   import util
from misc.Trie              import Trie
from misc.ExtMap            import ExtMap
from generator.code.Package import Package
from generator.resource.CombinedImage import CombinedImage

class Script(object):

    def __init__(self, ):
        self.baseScriptPath = "" # path to the script that will be loaded by HTML
        self.classes    = []   # classes making up the build, [str]
        self.classesObj = []   # temp. alternative list of class objects, [generator.code.Class, ...]
        self.classesAll = {}   # all known classes, from all involved libs, {"cid":generator.code.Class}
        self.jobconfig  = None # Job() config object
        self.variants   = {}   # current variant set
        self.environment= {}   # dito. i know, shame for violating DRY, but the above is to control compilation, this one is not
        self.optimize   = []   # optimize settings
        self.parts      = {}   # parts defined by the configuration (if any); {part.name : Part()}
        self.packages   = []   # .js files for this application / library;  [Package()]
        self.boot       = "boot"
        self.packageIdsSorted = []  # the keys of self.packages sorted in load order
        self.buildType  = ""   # "source"/"build"
        self.locales    = []   # supported locales, e.g. ["de", "de_DE", "en"]
        self.libraries  = []   # involved libraries [generator.code.Library, ...]
        self.namespace  = u""  # the main name space (config macro "APPLICATION")

        # adding these methods on instance level, so the counters are fresh
        self.getPartBitMask   = util.powersOfTwoSequence().next  # generator for part bitmasks
        self.getPackageNumber = util.numberSequence().next  # generator for e.g. package numbers

    ##
    # return old-style array of arrays of classIds in self.packageIdsSorted order
    def packagesArraySorted(self):
        assert self.packageIdsSorted
        assert self.packages is not None
        packageClasses = []
        for pkgId in self.packageIdsSorted:
            packageClasses.append(self.packages[pkgId].classes)
        return packageClasses


    ##
    # sort the packages in all parts
    def sortParts(self):
        for part in self.parts.values():
            part.packagesSorted
            
    ##
    # return sorted array of script's packages
    def packagesSortedSimple(self):
        return Package.simpleSort(self.packages)
    
    
    def packagesSorted(self):
        return Package.sort(self.packages)

    ##
    # Create a resource structure suitable for serializing. The main simpli-
    # fication is that no resource *selection* is done in this method. It basi-
    # cally just takes a lists of resources and creates an info structure for
    # them. Combined images are honored.
    #
    # Takes:
    #   [resourceObj1,...]
    #   formatAsTree = True/False
    # returns:
    #   resource structure {"gui/test.png" : [32, 32, "png", "gui"], ...}
    # or:
    #   {"gui" : {"test.png" : [32, 32, "png", "gui"], ...}, ...}
    @staticmethod
    def createResourceStruct(resources, formatAsTree=False, updateOnlyExistingSprites=False):
        
        skippatt = re.compile(r'\.(meta|py)$', re.I)
        result = {}
        if formatAsTree:
            result = ExtMap()

        # Filter unwanted files
        for res in resources:
            if skippatt.search(res.path):
                continue
            result[res.id] = res

        # Update simple images
        for combImg in (x for x in result.values() if isinstance(x, CombinedImage)):
            for embImg in combImg.embeds:
                if embImg.id in result:
                    result[embImg.id].attachCombinedImage(combImg)
                elif not updateOnlyExistingSprites:
                    embImg.attachCombinedImage(combImg)
                    result[embImg.id] = embImg

        # Flatten out the resource representation
        for resid, res in result.items():
            result[resid] = res.toResinfo()

        # ExtMap returns nested maps
        if formatAsTree:
            result = result.getData()

        return result
            

    ##
    # Namespaces as Trie
    def createTrie1(self, classesObj=[]):
        trie = {}
        classes = classesObj if classesObj else self.classesObj
        for classid in (x.id for x in classes):
            nameparts = classid.split(".")
            p = trie
            for part in nameparts:
                if part not in p:
                    p[part] = {}
                p = p[part]

        return trie

    ##
    # This version is only interested in the pure name spaces, i.e. id's without
    # the final class name.
    def createTrie(self, classesObj=[]):
        sep  = "."
        trie = Trie(sep)
        classes = classesObj if classesObj else self.classesObj
        for classid in (x.id for x in classes):
            #strip classname
            nsindex = classid.rfind(sep)
            if nsindex == -1:
                continue  # not interested in bare class names
            classNamespace = classid[:nsindex]
            trie.add(classNamespace)

        return trie
        
    ##
    # Version that uses linked nodes as data structure
    # - supposedly less memory, but maybe slower lookups
    def createTrie1(self, classesObj=[]):
        class TrieNode(object):
            __slots__ = ('value', 'children')
            def __init__(self, value=None, children=None):
                self.value = value
                self.children = children
            def add(self, child):
                if not self.children:
                    self.children = []
                self.children.append(child)
            def lookup(self, name):
                if not self.children:
                    return None
                for c in self.children:
                    if c.value == name:
                        return c
                return None
        
        trie = TrieNode()
        classes = classesObj if classesObj else self.classesObj
        for classid in (x.id for x in classes):
            nameparts = classid.split(".")
            p = trie
            for part in nameparts:
                child = p.lookup(part)
                if not child:
                    child = TrieNode(part)
                    p.add(child)
                p = child
                
        return trie
                


    ##
    # Not much use memoizing the result of this function, as various class lists
    # can be passed in during a single run (think parts), and I'd need to key
    # the results with the input classes (e.g. using a hash over the set's
    # element hashes). But it shouldn't incure a big penalty anyway, as the
    # individual class' variants are always cached.
    def classVariants(self, classesObj=[]):
        allVariants = set()
        classes = classesObj if classesObj else self.classesObj
        for clazz in classes:
            allVariants.update(clazz.classVariants())
        return allVariants


