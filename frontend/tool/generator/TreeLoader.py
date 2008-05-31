import sys

from ecmascript import tokenizer, treegenerator
from ecmascript.optimizer import variantoptimizer
from misc import filetool, idlist

class TreeLoader:
    def __init__(self, classes, cache, console):
        self._classes = classes
        self._cache = cache
        self._console = console


    def getTree(self, fileId, variants=None):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        if variants:
            cacheId = "tree-%s-%s" % (fileId, idlist.toString(variants))
        else:
            cacheId = "tree-%s" % fileId

        tree = self._cache.read(cacheId, filePath)
        if tree != None:
            return tree

        # Lookup for unoptimized tree
        if variants != None:
            tree = self._cache.read("tree-%s" % fileId, filePath)

        # Tree still undefined?, create it!
        if tree == None:
            self._console.debug("Parsing file: %s..." % fileId)
            self._console.indent()

            fileEntry = self._classes[fileId]
            fileContent = filetool.read(fileEntry["path"], fileEntry["encoding"])
            tokens = tokenizer.parseStream(fileContent, fileId)
            
            self._console.outdent()
            self._console.debug("Generating tree: %s..." % fileId)
            self._console.indent()

            try:
                tree = treegenerator.createSyntaxTree(tokens)
            except treegenerator.SyntaxException, detail:
                self._console.error("%s" % detail)
                sys.exit(1)

            self._console.outdent()
            self._console.debug("Selecting variants: %s..." % fileId)
            self._console.indent()

        # Call variant optimizer
        if variants != None:
            variantoptimizer.search(tree, variants, fileId)

        self._console.outdent()

        # Store result into cache
        self._cache.write(cacheId, tree)

        return tree
