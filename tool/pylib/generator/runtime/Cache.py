#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#
################################################################################

import os, sys, time
import cPickle as pickle
from misc import filetool
from misc.securehash import sha_construct

memcache = {}

class Cache:
    def __init__(self, path, console):
        self._path = path
        self._check_path(self._path)
        self._lock_file = self._lock_cache(self._path)
        if not self._lock_file:
            raise RuntimeError, "The cache is currently in use by another process"
        self._console = console

    def __del__(self):
        self._unlock_cache(self._lock_file)

    def _check_path(self, path):
        if not os.path.exists(path):
            filetool.directory(path)
        elif not os.path.isdir(path):
            raise RuntimeError, "The cache path is not a directory: %s" % path
        else: # it's an existing directory
            # defer read/write access to the first call of read()/write()
            pass


    def _unlock_cache(self, path):
        #filetool.unlock(path)
        if path and os.path.exists(path):
            #print "xxx releasing cache lock"
            os.unlink(path)

    def _lock_cache(self, path):
        #print "xxx creating cache lock"
        lockfile = os.path.join(path, "lock-generator")
        try:
            fd = os.open(lockfile, os.O_CREAT|os.O_EXCL|os.O_RDWR)
        except:
            return None
        if fd:
            os.close(fd)
            return lockfile
        else:
            return None

    def filename(self, cacheId):
        cacheId = cacheId.encode('utf-8')
        splittedId = cacheId.split("-")
        
        if len(splittedId) == 1:
            return cacheId
                
        baseId = splittedId.pop(0)
        digestId = sha_construct("-".join(splittedId)).hexdigest()

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


    ##
    # Read an object from cache.
    # 
    # @param dependsOn  file name to compare cache file against
    # @param memory     if read from disk keep value also in memory; improves subsequent access
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
            fobj = open(cacheFile, 'rb')
            #filetool.lock(fobj.fileno())

            content = pickle.load(fobj)

            #filetool.unlock(fobj.fileno())
            fobj.close()

            if memory:
                memcache[cacheId] = content

            return content

        except (IOError, EOFError, pickle.PickleError, pickle.UnpicklingError):
            self._console.error("Could not read cache from %s" % self._path)
            return None


    ##
    # Write an object to cache.
    #
    # @param memory         keep value also in memory; improves subsequent access
    # @param writeToFile    write value to disk
    def write(self, cacheId, content, memory=False, writeToFile=True):
        filetool.directory(self._path)
        cacheFile = os.path.join(self._path, self.filename(cacheId))

        if writeToFile:
            try:
                fobj = open(cacheFile, 'wb')
                #filetool.lock(fobj.fileno(), write=True)

                pickle.dump(content, fobj, 2)

                #filetool.unlock(fobj.fileno())
                fobj.close()

            except (IOError, EOFError, pickle.PickleError, pickle.PicklingError):
                self._console.error("Could not store cache to %s" % self._path)
                sys.exit(1)

        if memory:
            memcache[cacheId] = content
