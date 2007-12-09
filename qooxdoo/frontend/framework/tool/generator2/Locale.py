import variantutil

class Locale:
    def __init__(self, classes, cache, console, treeutil):
        self._classes = classes
        self._cache = cache
        self._console = console
        self._treeutil = treeutil
        
        
    def getStrings(self, fileId, variants):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]
        
        variantsId = variantutil.generateId(variants)

        cacheId = "%s-locale-%s" % (fileId, variantsId)
        
        strings = self._cache.read(cacheId, filePath)
        if strings != None:
            return strings
            
        tree = self._treeutil.getVariantsTree(fileId, variants)

        self._console.debug("Looking for localisable strings: %s..." % fileId)
        strings = self._findStrings(tree)

        self._cache.write(cacheId, strings)
        return strings
        

    def _findStrings(self, tree):
        strings = {}
        
        # TODO: query
        
        return strings
        
        