import sys

from ecmascript import tokenizer, treegenerator
from ecmascript.optimizer import variantoptimizer
from misc import filetool, idlist

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


        self._console.debug("Opening file: %s..." % fileId)
        fileContent = filetool.read(filePath, fileEncoding)

        self._console.debug("Generating tokens: %s..." % fileId)
        tokens = tokenizer.parseStream(fileContent, fileId)

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

        cacheId = "%s-tree-%s" % (fileId, idlist.toString(variants))
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
