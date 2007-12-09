import os, sys, sha, cPickle
from modules import filetool

class Cache:
    def __init__(self, path, console):
        self._path = path
        self._console = console


    def clean(self, cacheId):
        cacheFile = os.path.join(self._path, sha.new(cacheId).hexdigest())
        filetool.remove(cacheFile)


    def read(self, cacheId, dependsOn):
        filetool.directory(self._path)
        fileModTime = os.stat(dependsOn).st_mtime
        cacheFile = os.path.join(self._path, sha.new(cacheId).hexdigest())

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
            self._console.error("Could not read cache from %s" % self._path)
            return None


    def write(self, cacheId, content):
        filetool.directory(self._path)
        cacheFile = os.path.join(self._path, sha.new(cacheId).hexdigest())

        try:
            cPickle.dump(content, open(cacheFile, 'wb'), 2)

        except (IOError, EOFError, cPickle.PickleError, cPickle.PicklingError):
            self._console.error("Could not store cache to %s" % self._path)
            sys.exit(1)

