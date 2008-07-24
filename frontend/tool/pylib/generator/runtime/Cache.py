import os, sys, sha, time, cPickle
from misc import filetool

memcache = {}

class Cache:
    def __init__(self, config, console):
        self._path = config.get("compile", "cache")
        self._console = console


    def filename(self, cacheId):
        splittedId = cacheId.split("-")
        
        if len(splittedId) == 1:
            return cacheId
                
        baseId = splittedId.pop(0)
        digestId = sha.new("-".join(splittedId)).hexdigest()

        return "%s-%s" % (baseId, digestId)
        
        
    def readmulti(self, cacheId, dependsOn=None):
        splittedId = cacheId.split("-")
        baseId = splittedId.pop(0)
        contentId = "-".join(splittedId)
        multiId = "multi" + baseId
        
        saved = self.read(multiId, None, True)
        if saved and saved.has_key(contentId):
            temp = saved[contentId]
            
            if os.stat(dependsOn).st_mtime > temp["time"]:
                return None
            
            return temp["content"]
            
        return None
        
        
    def writemulti(self, cacheId, content):
        splittedId = cacheId.split("-")
        baseId = splittedId.pop(0)
        contentId = "-".join(splittedId)
        multiId = "multi" + baseId

        saved = self.read(multiId, None, True)
        if not saved:
            saved = {}
        
        saved[contentId] = {"time":time.time(), "content":content}
        self.write(multiId, saved, True)


    def read(self, cacheId, dependsOn=None, memory=False):
        if memcache.has_key(cacheId):
            return memcache[cacheId]

        filetool.directory(self._path)
        cacheFile = os.path.join(self._path, self.filename(cacheId))

        try:
            cacheModTime = os.stat(cacheFile).st_mtime
        except OSError:
            return None

        # Out of date check
        if dependsOn:
            fileModTime = os.stat(dependsOn).st_mtime
            if fileModTime > cacheModTime:
                return None

        try:
            content = cPickle.load(open(cacheFile, 'rb'))

            if memory:
                memcache[cacheId] = content

            return content

        except (IOError, EOFError, cPickle.PickleError, cPickle.UnpicklingError):
            self._console.error("Could not read cache from %s" % self._path)
            return None


    def write(self, cacheId, content, memory=False, writeToFile=True):
        filetool.directory(self._path)
        cacheFile = os.path.join(self._path, self.filename(cacheId))

        if writeToFile:
            try:
                cPickle.dump(content, open(cacheFile, 'wb'), 2)
    
            except (IOError, EOFError, cPickle.PickleError, cPickle.PicklingError):
                self._console.error("Could not store cache to %s" % self._path)
                sys.exit(1)

        if memory:
            memcache[cacheId] = content
