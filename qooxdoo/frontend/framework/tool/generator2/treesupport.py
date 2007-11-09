import os, sys, copy, zlib
from modules import tokenizer, treegenerator, variantoptimizer
from generator2 import variantsupport

class TreeUtil:
    def __init__(self, classes, cache, console):
        self._classes = classes
        self._cache = cache
        self._console = console


    def cleanTokens(self, fileId):
        cacheId = "%s-tokens" % fileId
        self._cache.clean(cacheId)


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


    def getLength(self, fileId):
        return len(self.getTokens(fileId))


    def cleanTree(self, fileId):
        cacheId = "%s-tree" % fileId
        self._cache.clean(cacheId)


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
        tree = treegenerator.createSyntaxTree(tokens)

        self._console.outdent()

        self._cache.write(cacheId, tree)
        return tree


    def cleanVariantsTree(self, fileId, variants):
        cacheId = "%s-tree-%s" % (fileId, variantsupport.generateId(variants))
        self._cache.clean(cacheId)


    def getVariantsTree(self, fileId, variants):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        cacheId = "%s-tree-%s" % (fileId, variantsupport.generateId(variants))
        tree = self._cache.read(cacheId, filePath)
        if tree != None:
            return tree

        self._console.debug("Select variants: %s..." % fileId)
        self._console.indent()

        # Copy tree to work with
        tree = copy.deepcopy(self.getTree(fileId))

        # Call variant optimizer
        variantoptimizer.search(tree, variants, fileId)

        self._console.outdent()

        # Store result into cache
        self._cache.write(cacheId, tree)

        return tree
