
######################################################################
#  TOKEN/TREE SUPPORT
######################################################################

import os, sys, copy

script_path = os.path.dirname(os.path.abspath(sys.argv[0]))
sys.path.insert(0, os.path.join(script_path, "../modules"))
sys.path.insert(0, os.path.join(script_path, ".."))

import tokenizer, treegenerator, variantoptimizer
import gen_cachesupport, generator2

class TreeSupport(object):

    def __init__(self, classes, cachePath, verbose=False):
        self.classes        = classes
        self.cachePath      = cachePath
        self.verbose        = verbose


    def getTokens(self, id):

        cache = gen_cachesupport.readCache(id, "tokens", self.classes[id]["path"], self.cachePath)
        if cache != None:
            return cache

        if self.verbose:
            print "  - Generating tokens: %s..." % id
        tokens = tokenizer.parseFile(self.classes[id]["path"], id, self.classes[id]["encoding"])

        gen_cachesupport.writeCache(id, "tokens", tokens, self.cachePath)
        return tokens



    def getLength(self, id):
        return len(self.getTokens(id))



    def getTree(self, id):

        cache = gen_cachesupport.readCache(id, "tree", self.classes[id]["path"], self.cachePath)
        if cache != None:
            return cache

        tokens = self.getTokens(id)

        if self.verbose:
            print "  - Generating tree: %s..." % id
        tree = treegenerator.createSyntaxTree(tokens)

        gen_cachesupport.writeCache(id, "tree", tree, self.cachePath)
        return tree



    def getVariantsTree(self, id, variants):

        # TODO: gen_compiledpkg.py
        variantsId = generator2.generateVariantCombinationId(variants)

        if variantsId != "":
            variantsId = "-" + variantsId

        cache = gen_cachesupport.readCache(id, "tree" + variantsId, self.classes[id]["path"], self.cachePath)
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
        gen_cachesupport.writeCache(id, "tree" + variantsId, tree, self.cachePath)

        return tree


