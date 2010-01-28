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
#    * Sebastian Werner (wpbasti)
#
################################################################################

import sys

from ecmascript.frontend import tokenizer, treegenerator
from ecmascript.transform.optimizer import variantoptimizer
from misc import filetool, util
from generator.code import Class

class TreeLoader(object):
    def __init__(self, classes, cache, console):
        self._classes = classes
        self._cache = cache
        self._console = console


    def _getSourceTree(self, cacheId, fileId):
        fileEntry = self._classes[fileId]
        filePath  = fileEntry["path"]
        tradeSpaceForSpeed = False

        # Lookup for unoptimized tree
        tree = self._cache.read(cacheId, filePath, memory=tradeSpaceForSpeed)

        # Tree still undefined?, create it!
        if tree == None:
            self._console.debug("Parsing file: %s..." % fileId)
            self._console.indent()

            fileContent = filetool.read(fileEntry["path"], fileEntry["encoding"])
            tokens = tokenizer.parseStream(fileContent, fileId)
            
            self._console.outdent()
            self._console.debug("Generating tree: %s..." % fileId)
            self._console.indent()
            tree = treegenerator.createSyntaxTree(tokens)  # allow exceptions to propagate

            # store unoptimized tree
            #print "Caching %s" % cacheId
            self._cache.write(cacheId, tree, memory=tradeSpaceForSpeed, writeToFile=True)

            self._console.outdent()
        return tree



    def getTree(self, fileId, variants={}):
        fileEntry          = self._classes[fileId]
        filePath           = fileEntry["path"]
        tradeSpaceForSpeed = False  # Caution: setting this to True seems to make builds slower, at least on some platforms!?

        # Construct the right cache id
        unoptCacheId     = "tree-%s-%s" % (filePath, util.toString({}))

        classVariants    = []
        tree             = None
        classVariants    = Class.getClassVariants(fileId, filePath, None, self._cache, self._console, generate=False) # just check the cache
        if classVariants == None:
            tree = self._getSourceTree(unoptCacheId, fileId)
            classVariants= Class.getClassVariantsFromTree(tree, self._console)

        relevantVariants = Class.projectClassVariantsToCurrent(classVariants, variants)
        cacheId          = "tree-%s-%s" % (filePath, util.toString(relevantVariants))

        # Get the right tree to return
        if cacheId == unoptCacheId and tree:  # early return optimization
            return tree

        opttree = self._cache.read(cacheId, filePath, memory=tradeSpaceForSpeed)
        if not opttree:
            # start from source tree
            if tree:
                opttree = tree
            else:
                opttree = self._getSourceTree(unoptCacheId, fileId)
            # do we have to optimze?
            if cacheId == unoptCacheId:
                return opttree
            else:
                self._console.debug("Selecting variants: %s..." % fileId)
                self._console.indent()
                variantoptimizer.search(opttree, variants, fileId)
                self._console.outdent()
                # store optimized tree
                #print "Caching %s" % cacheId
                self._cache.write(cacheId, opttree, memory=tradeSpaceForSpeed, writeToFile=True)

        return opttree
