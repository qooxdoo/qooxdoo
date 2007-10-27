import os, sys, copy, zlib
from modules import tokenizer, treegenerator, variantoptimizer
from generator2 import variantsupport


def getTokens(entry, cache, verbose=False, quiet=False):
    filePath = entry["path"]
    fileId = entry["id"]
    fileEncoding = entry["encoding"]
    
    cacheId = "%s-tokens" % fileId
    tokens = cache.read(cacheId, filePath)

    if tokens != None:
        return tokens

    if verbose:
        print "  - Generating tokens: %s..." % fileId
        
    tokens = tokenizer.parseFile(filePath, fileId, fileEncoding)

    cache.write(cacheId, tokens)
    return tokens



def getLength(entry, cache, verbose=False, quiet=False):
    return len(getTokens(entry, cache, verbose, quiet))



def getTree(entry, cache, verbose=False, quiet=False):
    filePath = entry["path"]
    fileId = entry["id"]
    
    cacheId = "%s-tree" % fileId
    tree = cache.read(cacheId, filePath)

    if tree != None:
        return tree

    tokens = getTokens(entry, cache)

    if verbose:
        print "  - Generating tree: %s..." % fileId
        
    tree = treegenerator.createSyntaxTree(tokens)

    cache.write(cacheId, tree)
    return tree



def getVariantsTree(entry, cache, variants, verbose=False, quiet=False):
    filePath = entry["path"]
    fileId = entry["id"]
    
    cacheId = "%s-tree-%s" % (fileId, variantsupport.generateCombinationId(variants))
    tree = cache.read(cacheId, filePath)
    
    if tree != None:
        return tree

    # Copy tree to work with
    tree = copy.deepcopy(getTree(entry, cache, verbose, quiet))

    if verbose:
        print "  - Select variants: %s..." % fileId

    # Generate map
    variantsMap = {}
    for entry in variants:
        variantsMap[entry["id"]] = entry["value"]

    # Call variant optimizer
    variantoptimizer.search(tree, variantsMap, fileId)

    # Store result into cache
    cache.write(cacheId, tree)

    return tree


