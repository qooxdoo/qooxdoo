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

from misc                   import util
from misc.Trie              import Trie
from generator.code.Package import Package

class Script(object):

    def __init__(self, ):
        self.baseScriptPath = "" # path to the script that will be loaded by HTML
        self.classes    = []   # classes making up the build
        self.classesObj = []   # temp. alternative list of class objects, [generator.code.Class, ...]
        self.jobconfig  = None # Job() config object
        self.variants   = []
        self.envsettings= {}
        self.parts      = {}   # parts defined by the configuration (if any); {part.name : part}
        self.packages   = []   # .js files for this application / library;  {package.id : package}
        self.boot       = "boot"
        self.packageIdsSorted = []  # the keys of self.packages sorted in load order
        self.buildType  = ""   # "source"/"build"
        self.locales    = []   # supported locales, e.g. ["de", "de_DE", "en"]
        self.libraries  = []   # involved libraries [generator.code.Library, ...]
        self.namespace  = u""  # the main name space (config macro "APPLICATION")

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
    # generates part bitmasks
    getPartBitMask  = util.powersOfTwoSequence().next

    ##
    # generates consecutive package numbers
    getPackageNumber = util.numberSequence().next

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
                


