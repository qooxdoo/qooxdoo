################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 1&1 Internet AG, Germany, http://www.1und1.de
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

import os, sys, copy, zlib
from modules import tokenizer, treegenerator, variantoptimizer
from generator2 import util

class TreeLoader:
    def __init__(self, classes, cache, console):
        self._classes = classes
        self._cache = cache
        self._console = console


    def getTokens(self, fileId):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]
        fileEncoding = fileEntry["encoding"]

        cacheId = "%s-tokens" % fileId
        tokens = self._cache.read(cacheId, filePath)
        if tokens != None:
            return tokens

        self._console.debug("Generating tokens: %s..." % fileId)

        tokens = tokenizer.parseFile(filePath, fileId, fileEncoding)

        self._cache.write(cacheId, tokens)
        return tokens


    def getTree(self, fileId):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        cacheId = "%s-tree" % fileId
        tree = self._cache.read(cacheId, filePath)
        if tree != None:
            return tree

        self._console.debug("Generating tree: %s..." % fileId)
        self._console.indent()

        tokens = self.getTokens(fileId)

        try:
            tree = treegenerator.createSyntaxTree(tokens)
        except treegenerator.SyntaxException, detail:
            self._console.error("%s" % detail)
            sys.exit(1)

        self._console.outdent()

        self._cache.write(cacheId, tree)
        return tree


    def getVariantsTree(self, fileId, variants=None):
        if variants == None or len(variants) == 0:
            return self.getTree(fileId)

        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        cacheId = "%s-tree-%s" % (fileId, util.generateId(variants))
        tree = self._cache.read(cacheId, filePath)
        if tree != None:
            if tree == "unmodified":
                return self.getTree(fileId)

            return tree

        tree = self.getTree(fileId)

        self._console.debug("Select variants: %s..." % fileId)
        self._console.indent()

        # Call variant optimizer
        modified = variantoptimizer.search(tree, variants, fileId)

        if not modified:
            self._console.debug("Store unmodified hint.")

        self._console.outdent()

        # Store result into cache
        if modified:
            self._cache.write(cacheId, tree)
        else:
            self._cache.write(cacheId, "unmodified")

        return tree
