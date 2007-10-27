import os, sys, cPickle
from modules import filetool
from generator2 import hashcode


class Cache:
    def __init__(self, path):
        self.path = path
    
    
    def read(self, id, dep):
        filetool.directory(self.path)
        fileModTime = os.stat(dep).st_mtime
        cacheFile = os.path.join(self.path, hashcode.convert(id))

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
            print ">>> Could not read cache from %s" % self.path
            return None


    def write(self, id, content):
        filetool.directory(self.path)
        cacheFile = os.path.join(self.path, hashcode.convert(id))

        try:
            cPickle.dump(content, open(cacheFile, 'wb'), 2)

        except (IOError, EOFError, cPickle.PickleError, cPickle.PicklingError):
            print ">>> Could not store cache to %s" % self.path
            sys.exit(1)







