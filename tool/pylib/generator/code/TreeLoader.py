import sys

from ecmascript.frontend import tokenizer, treegenerator
from ecmascript.transform.optimizer import variantoptimizer
from misc import filetool, util

class TreeLoader(object):
    def __init__(self, classes, cache, console):
        self._classes = classes
        self._cache = cache
        self._console = console


    def getTree(self, fileId, variants=None):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        if variants:
            cacheId = "tree-%s-%s" % (filePath, util.toString(variants))
        else:
            cacheId = "tree-%s" % filePath

        tradeSpaceForSpeed = False  # Caution: setting this to True seems to make builds slower, at least on some platforms!?

        tree = self._cache.read(cacheId, filePath, memory=tradeSpaceForSpeed)
        if tree != None:
            return tree

        # Lookup for unoptimized tree
        if variants != None:
            tree = self._cache.read("tree-%s" % fileId, filePath, memory=tradeSpaceForSpeed)

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
            self._cache.write("tree-%s" % fileId, tree, memory=tradeSpaceForSpeed, writeToFile=True)

            self._console.outdent()

        # Call variant optimizer
        if variants != None:
            self._console.debug("Selecting variants: %s..." % fileId)
            self._console.indent()
            variantoptimizer.search(tree, variants, fileId)
            self._console.outdent()
            # store optimized tree
            self._cache.write(cacheId, tree, memory=tradeSpaceForSpeed, writeToFile=True)

        return tree
