
######################################################################
#  CORE: CACHE SUPPORT
######################################################################
import os, sys, cPickle

script_path = os.path.dirname(os.path.abspath(sys.argv[0]))
sys.path.insert(0, os.path.join(script_path, "../modules"))

import filetool

# Improved version of the one in filetool module

def readCache(id, segment, dep, cachePath):

    if not cachePath.endswith(os.sep):
        cachePath += os.sep

    filetool.directory(cachePath)

    fileModTime = os.stat(dep).st_mtime

    try:
        cacheModTime = os.stat(cachePath + id + "-" + segment).st_mtime
    except OSError:
        cacheModTime = 0

    # Out of date check
    if fileModTime > cacheModTime:
        return None

    try:
        return cPickle.load(open(cachePath + id + "-" + segment, 'rb'))

    except (IOError, EOFError, cPickle.PickleError, cPickle.UnpicklingError):
        print ">>> Could not read cache from %s" % cachePath
        return None



def writeCache(id, segment, content, cachePath):

    if not cachePath.endswith(os.sep):
        cachePath += os.sep

    filetool.directory(cachePath)

    try:
        cPickle.dump(content, open(cachePath + id + "-" + segment, 'wb'), 2)

    except (IOError, EOFError, cPickle.PickleError, cPickle.PicklingError):
        print ">>> Could not store cache to %s" % cachePath
        sys.exit(1)







