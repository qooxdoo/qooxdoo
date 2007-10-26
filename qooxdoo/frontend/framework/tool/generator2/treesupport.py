import os, sys, copy, zlib
from modules import tokenizer, treegenerator, variantoptimizer
from generator2 import cachesupport, variantsupport

class TreeSupport(object):
    def __init__(self, classes, cachePath, verbose=False):
        self.classes        = classes
        self.cachePath      = cachePath
        self.verbose        = verbose


    def getTokens(self, id):
        cacheId = "%s-tokens" % id
        cache = cachesupport.readCache(cacheId, self.classes[id]["path"], self.cachePath)
        if cache != None:
            return cache

        if self.verbose:
            print "  - Generating tokens: %s..." % id
        tokens = tokenizer.parseFile(self.classes[id]["path"], id, self.classes[id]["encoding"])

        cachesupport.writeCache(cacheId, tokens, self.cachePath)
        return tokens



    def getLength(self, id):
        return len(self.getTokens(id))



    def getTree(self, id):
        cacheId = "%s-tree" % id
        cache = cachesupport.readCache(cacheId, self.classes[id]["path"], self.cachePath)
        if cache != None:
            return cache

        tokens = self.getTokens(id)

        if self.verbose:
            print "  - Generating tree: %s..." % id
        tree = treegenerator.createSyntaxTree(tokens)

        cachesupport.writeCache(cacheId, tree, self.cachePath)
        return tree



    def getVariantsTree(self, id, variants):
        cacheId = "%s-tree-%s" % (id, zlib.adler32(variantsupport.generateCombinationId(variants)))

        cache = cachesupport.readCache(cacheId, self.classes[id]["path"], self.cachePath)
        if cache != None:
            return cache

        # Generate map
        variantsMap = {}
        for entry in variants:
            variantsMap[entry["id"]] = entry["value"]

        # Copy tree to work with
        tree = copy.deepcopy(self.getTree(id))

        if self.verbose:
            print "  - Select variants: %s..." % id

        # Call variant optimizer
        variantoptimizer.search(tree, variantsMap, id)

        # Store result into cache
        cachesupport.writeCache(cacheId, tree, self.cachePath)

        return tree


