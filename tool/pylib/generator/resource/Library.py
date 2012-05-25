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

import os, re, sys, unicodedata as unidata

from misc                         import filetool, Path
from ecmascript.frontend          import lang, treeutil
from generator.code.Class         import Class
from generator.code.qcEnvClass    import qcEnvClass
from generator.resource.Resource  import Resource
from generator.resource.Image     import Image
from generator.resource.CombinedImage    import CombinedImage
from generator.action.ContribLoader      import ContribLoader
from generator.config.Manifest    import Manifest
from generator.config.ConfigurationError import ConfigurationError
from generator                    import Context as context

##
# pickle complains when I use NameSpace!?
class C(object): pass

##
# Represents a qooxdoo library
class Library(object):
    # is called with a "library" entry from the config.json
    def __init__(self, libconfig, console):

        self._console = console

        self._classes = []
        self._docs = {}
        self._translations = {}
        self.resources  = set()

        #self._init_from_manifest(libconfig)
        self._libconfig = libconfig
        self.manipath = libconfig['manifest'] # init self.manipath for compares
        if not self.manipath.startswith("contrib://"):
            self.manipath = context.config.absPath(self.manipath)

        #TODO: clean up the others later
        self.assets = {}
        self.assets["classes"] = {}
        self.assets["translations"] = {}
        self.assets["resources"] = {}
        
        self.__youngest = (None, None) # to memoize youngest file in lib


    def _init_from_manifest(self, libconfig=None):

        if libconfig is None:
            libconfig = self._libconfig

        self.manipath = libconfig['manifest']

        # check contrib:// URI
        if self.manipath.startswith("contrib://"):
            newmanipath = self._download_contrib(self.manipath)
            if not newmanipath:
                raise RuntimeError("Unable to get contribution from internet: %s" % self.manipath)
            else:
                self.manipath = newmanipath

        self.manipath = context.config.absPath(os.path.normpath(self.manipath))
        manifest = Manifest(self.manipath)
        self.manifest = manifest
        
        self.path = os.path.dirname(self.manipath)
        self.uri = libconfig.get("uri", None)
        self.encoding = manifest.encoding
        self.classPath = manifest.classpath
        self.classUri  = manifest.classpath # TODO: ???
        self.resourcePath = manifest.resource
        self.namespace = manifest.namespace

        self.assets["classes"]["path"]  = self.classPath
        self.assets["translations"]["path"]  = manifest.translation
        self.assets["resources"]["path"] = self.resourcePath

        if not self.namespace: 
            raise RuntimeError

        # ensure translation dir
        transPath = os.path.join(self.path, self.assets['translations']["path"])
        if not os.path.isdir(transPath):
            os.makedirs(transPath)


    def __repr__(self):
        return "<Library:%s>" % ((
            self.manifest.path if hasattr(self, 'manifest')
            else self._libconfig['manifest']),)

    def __str__(self):
        return repr(self)


    def __eq__(self, other):
        return self.manipath == other.manipath


    def _download_contrib(self, contribUri):
        manifest = contribUri.replace("contrib://", "")
        contrib  = os.path.dirname(manifest)
        manifile = os.path.basename(manifest)
        cacheMap = context.jobconf.getFeature("cache")
        if cacheMap and 'downloads' in cacheMap:
            contribCachePath = cacheMap['downloads']
            contribCachePath = context.config.absPath(contribCachePath)
        else:
            contribCachePath = "cache-downloads"

        self._console.info("Checking network-based contrib: %s" % contribUri)
        self._console.indent()

        dloader = ContribLoader()
        (updatedP, revNo) = dloader.download(contrib, contribCachePath)

        if updatedP:
            self._console.info("downloaded contrib: %s" % contrib)
        else:
            self._console.debug("using cached version")
        self._console.outdent()

        manipath = os.path.join(contribCachePath, contrib, manifile)

        return manipath


    ##
    # pickling: provide state
    def __getstate__(self):
        d = self.__dict__.copy()
        # the Log object (the StreamWriter for a potential log file) makes
        # problems on unpickling
        del d['_console']
        return d


    ##
    # unpickling: update state
    def __setstate__(self, d):
        d['_console']      = context.console
        self.__dict__ = d


    def mostRecentlyChangedFile(self, force=False):
        if self.__youngest != (None,None) and not force:
            return self.__youngest

        youngFiles = {} # {timestamp: "filepath"}
        # for each interesting library part
        for category in self.assets:
            catPath = os.path.join(self.path, self.assets[category]["path"])
            if category == "translations" and not os.path.isdir(catPath):
                continue
            # find youngest file
            file_, mtime = filetool.findYoungest(catPath)
            youngFiles[mtime] = file_

        # also check the Manifest file
        file_, mtime = filetool.findYoungest(self.manipath)
        youngFiles[mtime] = file_

        # and return the maximum of those
        youngest = sorted(youngFiles.keys())[-1]
        self.__youngest = (youngFiles[youngest], youngest) # ("filepath", mtime)

        return self.__youngest


    _codeExpr = re.compile(r'''(q|(qx.Bootstrap|qx.Class|qx.Mixin|qx.Interface|qx.Theme)).define\s*\(\s*["']((?u)[^"']+)["']''', re.M)
    _illegalIdentifierExpr = re.compile(lang.IDENTIFIER_ILLEGAL_CHARS)
    _ignoredDirEntries = re.compile(r'%s' % '|'.join(filetool.VERSIONCONTROL_DIR_PATTS), re.I)
    _docFilename = "__init__.js"


    def getClasses(self):
        return self._classes

    def getDocs(self):
        return self._docs

    def getTranslations(self):
        return self._translations

    def translationPathSuffix(self):
        return self.assets['translations']['path']

    def getNamespace(self):
        return self.namespace

    def getResources(self):
        return self.resources

    def scan(self, timeOfLastScan=0):
        self._console.debug("Scanning %s..." % self.path)
        self._console.indent()

        scanres = self._scanClassPath(timeOfLastScan)
        self._classes = scanres[0]
        self._docs    = scanres[1]
        self._scanTranslationPath(os.path.join(self.path, self.assets['translations']['path']))
        self._scanResourcePath(os.path.join(self.path, self.resourcePath))

        self._console.outdent()


    def _getCodeId1(self, fileContent):
        for item in self._codeExpr.findall(fileContent):
            illegal = self._illegalIdentifierExpr.search(item[1])
            if illegal:
                raise ValueError, "Item name '%s' contains illegal character '%s'" % (item[1],illegal.group(0))
            #print "found", item[1]
            return item[1]

        return None


    def _getCodeId(self, clazz):
        className = None  # not-found return value
        tree     = clazz.tree()
        qxDefine = treeutil.findQxDefine (tree)
        if qxDefine:
            className = treeutil.getClassName (qxDefine)
            if not className:  # might be u''
                className = None
            else:
                illegal = self._illegalIdentifierExpr.search(className)
                if illegal:
                    raise ValueError, "Item name '%s' contains illegal character '%s'" % (className,illegal.group(0))

        return className


    def _checkNamespace(self, path=''):
        if not path:
            path = os.path.join(self.path, self.classPath)
        if not os.path.exists(path):
            raise ValueError("The given path does not contain a class folder: %s" % path)

        ns = None
        files = os.listdir(path)

        for entry in files:
            if entry.startswith(".") or self._ignoredDirEntries.match(entry):
                continue

            full = os.path.join(path, entry)
            if os.path.isdir(full):
                if ns != None:
                    raise ValueError("Multiple namespaces per library are not supported (%s,%s)" % (full, ns))

                ns = entry

        if ns == None:
            raise ValueError("Namespace could not be detected!")

        return ns


    def scanResourcePath(self):
        # path to the lib resource root
        libpath = os.path.normpath(self.resourcePath)  # normalize "./..."
        liblist = filetool.find(libpath)  # liblist is a generator
        return liblist


    def _scanResourcePath(self, path):
        if not os.path.exists(path):
            raise ValueError("The given resource path does not exist: %s" % path)

        self._console.debug("Scanning resource folder...")

        path = os.path.abspath(path)
        lib_prefix_len = len(path)
        if not path.endswith(os.sep):
            lib_prefix_len += 1

        self.resources = set()
        for root, dirs, files in filetool.walk(path):
            # filter ignored directories
            for dir in dirs:
                if self._ignoredDirEntries.match(dir):
                    dirs.remove(dir)

            for file in files:
                if self._ignoredDirEntries.match(file):
                    continue
                fpath = os.path.join(root, file)
                fpath = os.path.normpath(fpath)
                if Image.isImage(fpath):
                    if CombinedImage.isCombinedImage(fpath):
                        res = CombinedImage(fpath)
                    else:
                        res = Image(fpath)
                    res.analyzeImage()
                else:
                    res = Resource(fpath)
                
                res.set_id(Path.posifyPath(fpath[lib_prefix_len:]))
                res.library= self

                self.resources.add(res)

        self._console.indent()
        self._console.debug("Found %s resources" % len(self.resources))
        self._console.outdent()
        return



    def _scanClassPath(self, timeOfLastScan=0):

        ##
        # provide a default context dict
        def get_contextdict():
            contextdict = {}
            contextdict["console"] = context.console
            contextdict["cache"] = context.cache
            contextdict["jobconf"] = context.jobconf
            contextdict["envchecksmap"] = {}
            return contextdict

        ##
        # check class path is on file system
        def check_class_path(classRoot):
            if not os.path.isdir(classRoot):
                raise ConfigurationError("Class path from Manifest doesn't exist: %s" % self.classPath)

        ##
        # check single subdirectory from class path
        def check_multiple_namespaces(classRoot):
            try:
                self._checkNamespace(classRoot)
            except ValueError:
                self._console.warn ("The class path should contain exactly one namespace: '%s'" % (classRoot,))

        ##
        # check manifest namespace is on file system
        def check_manifest_namespace(classRoot):
            nsPrefix    = self.namespace.replace(".", os.sep)
            classNSRoot = os.path.join(classRoot, nsPrefix)
            if not os.path.isdir(classNSRoot):
                raise ValueError ("Manifest namespace does not exist on file system:  '%s'" % (classNSRoot))

        # ----------------------------------------------------------------------

        codeIdFromTree = True  # switch between regex- and tree-based codeId search
        classList = []
        existClassIds = dict([(x.id,x) for x in self._classes])  # if we scanned before
        docs = {}
        contextdict = get_contextdict() # TODO: Clazz() still relies on a context dict!
        classRoot   = os.path.join(self.path, self.classPath)

        check_class_path(classRoot)
        check_multiple_namespaces(classRoot)
        check_manifest_namespace(classRoot)
            
        self._console.debug("Scanning class folder...")

        # Iterate...
        for root, dirs, files in filetool.walk(classRoot):
            # Filter ignored directories
            for ignoredDir in dirs:
                if self._ignoredDirEntries.match(ignoredDir):
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                # ignore dot files
                if fileName.startswith(".") or self._ignoredDirEntries.match(fileName):
                    continue
                self._console.dot()

                # basic attributes
                filePath = os.path.join(root, fileName)    # /foo/bar/baz/source/class/my/space/AppClass.js
                fileRel  = filePath.replace(classRoot + os.sep, '')  # my/space/AppClass.js
                fileExt  = os.path.splitext(fileName)[-1]  # "js"
                filePathId = fileRel.replace(fileExt, "").replace(os.sep, ".") # my.space.AppClass
                filePathId = unidata.normalize("NFC", filePathId) # o" -> ö
                filePackage = filePathId[:filePathId.rfind(".")] if "." in filePathId else ""  # my.space
                fileStat = os.stat(filePath)
                fileSize = fileStat.st_size
                fileMTime= fileStat.st_mtime

                # ignore non-script
                if fileExt != ".js":
                    continue

                # check if known and fresh
                if (filePathId in existClassIds
                    and fileMTime < timeOfLastScan):
                    classList.append(existClassIds[filePathId])
                    continue # re-use known class

                # handle doc files
                if fileName == self._docFilename:
                    docs[filePackage] = {
                        "relpath"   : fileRel,
                        "path"      : filePath,
                        "encoding"  : self.encoding,
                        "namespace" : self.namespace,
                        "id"        : filePathId,
                        "package"   : filePackage,
                        "size"      : fileSize
                    }
                    # stop further processing
                    continue

                if filePathId == "qx.core.Environment":
                    clazz = qcEnvClass(filePathId, filePath, self, contextdict)
                else:
                    clazz = Class(filePathId, filePath, self, contextdict)

                # extract code ID (e.g. class name, mixin name, ...)
                try:
                    if codeIdFromTree:
                        fileCodeId = self._getCodeId(clazz)
                    else:
                        # use regexp
                        fileContent = filetool.read(filePath, self.encoding)
                        fileCodeId = self._getCodeId1(fileContent)
                except ValueError, e:
                    argsList = []
                    for arg in e.args:
                        argsList.append(arg)
                    argsList[0] = argsList[0] + u' (%s)' % fileName
                    e.args = tuple(argsList)
                    raise e

                # ignore all data files (e.g. translation, doc files, ...)
                if fileCodeId == None:
                    continue

                # compare path and content
                if fileCodeId != filePathId:
                    errmsg = [
                        u"Detected conflict between filename and classname!\n",
                        u"    Classname: %s\n" % fileCodeId,
                        u"    Path: %s\n" % filePath,
                    ]
                    raise RuntimeError(u''.join(errmsg))

                # store file data
                self._console.debug("Adding class %s" % filePathId)
                clazz.encoding = self.encoding
                clazz.size     = fileSize     # dependency logging uses this
                clazz.package  = filePackage  # Apiloader uses this
                clazz.relpath  = fileRel       # Locale uses this
                clazz.m_time_  = fileStat.st_mtime
                classList.append(clazz)

        self._console.indent()
        self._console.debug("Found %s classes" % len(classList))
        self._console.debug("Found %s docs" % len(docs))
        self._console.outdent()

        #return classList, docs 
        return classList, docs 



    def _scanTranslationPath(self, path):
        self._translations = {}  # reset
        if not os.path.exists(path):
            self._console.warn("The given path does not contain a translation folder: %s" % path)

        self._console.debug("Scanning translation folder...")

        # Iterate...
        for root, dirs, files in filetool.walk(path):
            # Filter ignored directories
            for ignoredDir in dirs:
                if self._ignoredDirEntries.match(ignoredDir):
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                # Ignore non-po and dot files
                if os.path.splitext(fileName)[-1] != ".po" or fileName.startswith("."):
                    continue

                filePath = os.path.join(root, fileName)
                fileLocale = os.path.splitext(fileName)[0]

                self._translations[fileLocale] = self.translationEntry(fileLocale, filePath, self.namespace)

        self._console.indent()
        self._console.debug("Found %s translations" % len(self._translations))
        self._console.outdent()


    @staticmethod
    def translationEntry(fileLocale, filePath, namespace):

        if "_" in fileLocale:
            split = fileLocale.index("_")
            parent = fileLocale[:split]
            variant = fileLocale[split+1:]

        else:
            parent = "C"
            variant = ""

        return {
            "path" : filePath,
            "id" : fileLocale,
            "parent" : parent,
            "variant" : variant,
            "namespace" : namespace
        }

