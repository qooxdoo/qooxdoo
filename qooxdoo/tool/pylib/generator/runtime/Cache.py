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

    _check_file = u".cache_check_file"

    def __init__(self, path, context):
        self._path         = path
        self._check_path(self._path)
        self._console      = context['console']
        self._locked_files = set(())
        context['interruptRegistry'].register(self._unlock_files)
        # invalidate on tool change
        check_file = os.path.join(path, self._check_file)
        if context['jobconf'].get("cache/invalidate-on-tool-change", False):
            if self._checkToolsNewer(path, check_file, context):
                context['console'].info("Cleaning compile cache, as tool chain is newer")
                self._cleanCompileCache()  # will also remove checkFile
        # assure check_file
        if not os.path.isfile(check_file):
            os.mknod(check_file, 0666)

    ##
    # predicate to check for files in the 'tool' path that are newer than the
    # cache check file

    def _checkToolsNewer(self, path, checkFile, context):
        if not os.path.isfile(checkFile):
            return True
        checkFileMTime = os.stat(checkFile).st_mtime
        # find youngst tool file
        qooxdoo_path = context['config'].get("let/QOOXDOO_PATH", None)
        if not qooxdoo_path:
            raise RuntimeError("Cannot check changes to tool chain without QOOXDOO_PATH config macro")
        toolCheck, toolCheckMTime = filetool.findYoungest(os.path.join(qooxdoo_path, "tool"))
        # compare
        if checkFileMTime < toolCheckMTime:
            return True
        else:
            return False
        

    ##
    # delete the files in the compile cache

    def _cleanCompileCache(self):
        self._check_path(self._path)
        for f in os.listdir(self._path):   # currently, just delete the files in the top-level dir
            file = os.path.join(self._path, f)
            if os.path.isfile(file):
                os.unlink(file)


    ##
    # make sure there is a cache directory to work with (no r/w test currently)

    def _check_path(self, path):
        if not os.path.exists(path):
            filetool.directory(path)
        elif not os.path.isdir(path):
            raise RuntimeError, "The cache path is not a directory: %s" % path
        else: # it's an existing directory
            # defer read/write access to the first call of read()/write()
            pass

    ##
    # clean up lock files interrupt handler

    def _unlock_files(self):
        for file in self._locked_files:
            try:
                filetool.unlock(file)
                self._console.debug("Cleaned up lock for file: %r" % file)
            except: # file might not exists since adding to _lock_files and actually locking is not atomic
                pass   # no sense to do much fancy in an interrupt handler


    ##
    # create a file name from a cacheId

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
            self._locked_files.add(cacheFile)
            filetool.lock(cacheFile)

            fobj = open(cacheFile, 'rb')
            #filetool.lock(fobj.fileno())

            content = pickle.load(fobj)

            #filetool.unlock(fobj.fileno())
            fobj.close()
            filetool.unlock(cacheFile)
            self._locked_files.remove(cacheFile)

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
                self._locked_files.add(cacheFile)  # this is not atomic with the next one!
                filetool.lock(cacheFile)
                fobj = open(cacheFile, 'wb')

                pickle.dump(content, fobj, 2)

                fobj.close()
                filetool.unlock(cacheFile)
                self._locked_files.remove(cacheFile)  # not atomic with the previous one!

            except (IOError, EOFError, pickle.PickleError, pickle.PicklingError):
                self._console.error("Could not store cache to %s" % self._path)
                sys.exit(1)

        if memory:
            memcache[cacheId] = content
