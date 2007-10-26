import os, sys, cPickle
from modules import filetool
from generator2 import hashcode

def readCache(id, dep, cachePath):
    filetool.directory(cachePath)
    fileModTime = os.stat(dep).st_mtime
    cacheFile = os.path.join(cachePath, hashcode.convert(id))

    try:
        cacheModTime = os.stat(cacheFile).st_mtime
    except OSError:
        cacheModTime = 0

    # Out of date check
    if fileModTime > cacheModTime:
        return None

    try:
        return cPickle.load(open(cacheFile, 'rb'))

    except (IOError, EOFError, cPickle.PickleError, cPickle.UnpicklingError):
        print ">>> Could not read cache from %s" % cachePath
        return None



def writeCache(id, content, cachePath):
    filetool.directory(cachePath)
    cacheFile = os.path.join(cachePath, hashcode.convert(id))

    try:
        cPickle.dump(content, open(cacheFile, 'wb'), 2)

    except (IOError, EOFError, cPickle.PickleError, cPickle.PicklingError):
        print ">>> Could not store cache to %s" % cachePath
        sys.exit(1)







