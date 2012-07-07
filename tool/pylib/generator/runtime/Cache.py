#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import os, sys, time, functools, gc, zlib
import cPickle as pickle
from misc import filetool
from misc.securehash import sha_construct
from generator.runtime.ShellCmd import ShellCmd
from generator.runtime.Log import Log

memcache  = {} # {key: {'content':content, 'time': (time.time()}}
check_file     = u".cache_check_file"
CACHE_REVISION = 0xb0b9a9c # set this to a unique value (e.g. commit hash prefix)
                           # when existing caches need clearing

class Cache(object):


    ##
    # kwargs:
    #  'console' : Log()
    #  'cache/downloads' : path
    #  'interruptRegistry' : generator.runtime.InterruptRegistry (mandatory)
    #  'cache/invalidate-on-tool-change' : True|False
    #
    def __init__(self, path, **kwargs):
        self._cache_revision = CACHE_REVISION
        self._path           = path
        self._context        = kwargs
        self._console        = kwargs.get('console', Log())
        self._downloads      = kwargs.get("cache/downloads", path+"/downloads")
        self._check_file     = os.path.join(self._path, check_file)
        self._console.debug("Initializing cache...")
        self._console.indent()
        self._check_path(self._path)
        self._locked_files   = set(())
        self._context['interruptRegistry'].register(self._unlock_files)
        self._assureCacheIsValid()  # checks and pot. clears existing cache
        self._console.outdent()
        return


    def __getstate__(self):
        raise pickle.PickleError("Never pickle generator.runtime.Cache.")


    def _assureCacheIsValid(self, ):
        self._toolChainIsNewer = self._checkToolsNewer()
        if self._toolChainIsNewer:
            if self._context.get("cache/invalidate-on-tool-change", False):
                self._console.info("Cleaning compile cache, as tool chain has changed")
                self.cleanCompileCache()  # will also remove checkFile
            else:
                self._console.warn("! Detected changed tool chain; you might want to clear the cache.")
        self._update_checkfile()
        return


    def _update_checkfile(self, ):
        fd  = os.open(self._check_file, os.O_CREAT|os.O_RDWR, 0666)  # open or create (portable form of os.mknod)
        numbytes = os.write(fd, str(self._cache_revision))
        os.close(fd)
        if numbytes < 1:
            raise IOError("Cannot write cache check file '%s'" % check_file)
        return

    def _checkToolsNewer(self, ):
        cacheRevision = self.getCacheFileVersion()
        if not cacheRevision:
            return True
        elif self._cache_revision != cacheRevision:
            return True  # current caches rev is different from that of the Cache class
        else:
            return False


    ##
    # returns the number in the check file on disk, if existent, None otherwise

    def getCacheFileVersion(self):
        if not os.path.isfile(self._check_file):
            return None
        else:
            cacheRevision = open(self._check_file, "r").read()
            try:
                cacheRevision = int(cacheRevision)
            except:
                return None
            return cacheRevision


    ##
    # predicate to check for files in the 'tool' path that are newer than the
    # cache check file

    def _checkToolsNewer_1(self, path, checkFile, context):
        if not os.path.isfile(checkFile):
            return True
        checkFileMTime = os.stat(checkFile).st_mtime
        # find youngst tool file
        _, toolCheckMTime = filetool.findYoungest(os.path.dirname(filetool.root()))
        # compare
        if checkFileMTime < toolCheckMTime:
            return True
        else:
            return False
        

    ##
    # delete the files in the compile cache

    def cleanCompileCache(self):
        self._check_path(self._path)
        self._console.info("Deleting compile cache")
        for f in os.listdir(self._path):   # currently, just delete the files in the top-level dir
            file = os.path.join(self._path, f)
            if os.path.isfile(file):
                os.unlink(file)
        self._update_checkfile()


    def cleanDownloadCache(self):
        if self._downloads:
            downdir = self._downloads
            if os.path.splitdrive(downdir)[1] == os.sep:
                raise RuntimeError, "I'm not going to delete '/' recursively!"
            self._console.info("Deleting download cache")
            ShellCmd().rm_rf(downdir)


    ##
    # make sure there is a cache directory to work with (no r/w test currently)

    def _check_path(self, path):
        self._console.indent()
        self._console.debug("Checking path '%s'" % path)
        if not os.path.exists(path):
            self._console.debug("Creating non-existing cache directory")
            filetool.directory(path)
            self._update_checkfile()
        elif not os.path.isdir(path):
            raise RuntimeError, "The cache path is not a directory: %s" % path
        else: # it's an existing directory
            # defer read/write access test to the first call of read()/write()
            self._console.debug("Using existing directory")
            pass
        self._console.outdent()

    ##
    # clean up lock files interrupt handler

    def _unlock_files(self):
        for file_ in self._locked_files:
            try:
                filetool.unlock(file_)
                os.unlink(file_)  # remove file, as write might be corrupted
                self._console.debug("Cleaned up lock and file: %r" % file_)
            except: # file might not exists since adding to _lock_files and actually locking is not atomic
                pass   # no sense to do much fancy in an interrupt handler


    ##
    # warn about newer tool chain interrupt handler

    def _warn_toolchain(self):
        if self._toolChainIsNewer:
            self._console.warn("Detected newer tool chain; you might want to run 'generate.py distclean', then re-run this job.")


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
        
        
    ##
    # Read an object from cache.
    # 
    # @param dependsOn  file name to compare cache file against
    # @param memory     if read from disk keep value also in memory; improves subsequent access
    def read(self, cacheId, dependsOn=None, memory=False, keepLock=False):
        if dependsOn:
            dependsModTime = os.stat(dependsOn).st_mtime

        # Mem cache
        if cacheId in memcache:
            memitem = memcache[cacheId]
            if not dependsOn or dependsModTime < memitem['time']:
                return memitem['content'], memitem['time']

        # File cache
        cacheFile = os.path.join(self._path, self.filename(cacheId))

        try:
            cacheModTime = os.stat(cacheFile).st_mtime
        except OSError:
            return None, None

        # out of date check
        if dependsOn and dependsModTime > cacheModTime:
                return None, cacheModTime

        try:
            try:
                if not cacheFile in self._locked_files:
                    self._locked_files.add(cacheFile)
                    filetool.lock(cacheFile)

                fobj = open(cacheFile, 'rb')
                fcontent = fobj.read().decode('zlib')
                fobj.close()
            finally:
                if not keepLock:
                    filetool.unlock(cacheFile)
                    self._locked_files.remove(cacheFile)

        except (IOError, zlib.error):
            self._console.warn("Could not read cache object %s" % cacheFile)
            return None, cacheModTime

        try:
            gc.disable()
            try:
                content = pickle.loads(fcontent)
            finally:
                gc.enable()

            if memory:
                memcache[cacheId] = {'content':content, 'time': time.time()}

            #print "read cacheId: %s" % cacheId
            return content, cacheModTime

        except (EOFError, pickle.PickleError, pickle.UnpicklingError):
            self._console.warn("Could not unpickle cache object %s" % cacheFile)
            return None, cacheModTime


    ##
    # Write an object to cache.
    #
    # @param memory         keep value also in memory; improves subsequent access
    # @param writeToFile    write value to disk
    def write(self, cacheId, content, memory=False, writeToFile=True, keepLock=False):
        cacheFile = os.path.join(self._path, self.filename(cacheId))

        if writeToFile:
            try:
                if not cacheFile in self._locked_files:
                    self._locked_files.add(cacheFile)  # this is not atomic with the next one!
                    filetool.lock(cacheFile)

                fobj = open(cacheFile, 'wb')
                fobj.write(pickle.dumps(content, 2).encode('zlib'))
                fobj.close()

                if not keepLock:
                    filetool.unlock(cacheFile)
                    self._locked_files.remove(cacheFile)  # not atomic with the previous one!

            except (IOError, EOFError, pickle.PickleError, pickle.PicklingError), e:
                try:
                    os.unlink(cacheFile) # try remove cache file, Pickle might leave incomplete files
                except:
                    e.args = ("Cache file might be crippled.\n" % self._path + e.args[0], ) + e.args[1:]
                e.args = ("Could not store cache to %s.\n" % self._path + e.args[0], ) + e.args[1:]
                raise e

        if memory:
            memcache[cacheId] = {'time': time.time(), 'content':content}


    def remove(self, cacheId, writeToFile=False):
        if cacheId in memcache:
           entry = memcache[cacheId]
           del memcache[cacheId]
           return entry['content'], entry['time']
        else:
            return None, None


##
# Caching decorator
def caching(cacheobj, keyfn):
    def realdecorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            cacheId = keyfn(*args, **kwargs)
            res = cacheobj.read(cacheId)
            if not res:
                res = fn(*args, **kwargs)
                cacheobj.write(cacheId, res)
            return res
        return wrapper
    return realdecorator
