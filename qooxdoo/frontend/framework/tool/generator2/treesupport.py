import os, sys, copy, zlib
from modules import tokenizer, treegenerator, variantoptimizer
from generator2 import variantsupport

class TreeUtil:
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



    def getLength(self, fileId):
        return len(self.getTokens(fileId))



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



    def getVariantsTree(self, fileId, variants):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]
    
        cacheId = "%s-tree-%s" % (fileId, variantsupport.generateCombinationId(variants))
        tree = self._cache.read(cacheId, filePath)
        if tree != None:
            return tree

        self._console.debug("Select variants: %s..." % fileId)
        self._console.indent()

        # Copy tree to work with
        tree = copy.deepcopy(self.getTree(fileId))
        
        # Generate map
        variantsMap = {}
        for entry in variants:
            variantsMap[entry["id"]] = entry["value"]

        # Call variant optimizer
        variantoptimizer.search(tree, variantsMap, fileId)

        self._console.outdent()        

        # Store result into cache
        self._cache.write(cacheId, tree)

        return tree
        