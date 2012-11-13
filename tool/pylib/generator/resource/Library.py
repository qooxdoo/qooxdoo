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
    def __init__(self, manipath, console):

        self.manipath = manipath  # manipath is absPath
        self._console = console
        self._classes = []
        self._docs = {}
        self._translations = {}
        self.resources  = set()
        self.uri = None

        self.assets = {}
        self.assets["classes"] = {}
        self.assets["translations"] = {}
        self.assets["resources"] = {}
        
        self.__youngest = (None, None) # to memoize youngest file in lib


    def _init_from_manifest(self):

        # check contrib:// URI
        if self.manipath.startswith("contrib://"):
            newmanipath = self._download_contrib(self.manipath)
            if not newmanipath:
                raise RuntimeError("Unable to get contribution from internet: %s" % self.manipath)
            else:
                self.manipath = context.config.absPath(os.path.normpath(newmanipath))

        manifest = Manifest(self.manipath)
        self.manifest = manifest
        
        self.path = os.path.dirname(self.manipath)
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
        #transPath = os.path.join(self.path, self.assets['translations']["path"])
        #if not os.path.isdir(transPath):
        #    os.makedirs(transPath)


    def __repr__(self):
        return "<Library:%s>" % self.manipath

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
        # also check the Manifest file
        file_, mtime = filetool.findYoungest(self.manipath)
        youngFiles[mtime] = file_

        # for each interesting library part
        for category in self.assets:
            catsuffix = self.assets[category]['path']
            if catsuffix is None:  # if this changed recently, the Manifest reflects it
                continue
            if not os.path.isdir(os.path.join(self.path, catsuffix)):
                # this might be a recent change reflected in the parent dirs
                for sepIdx in [0] + [mo.start() for mo in re.finditer("/", catsuffix)]: # check self.path, self.path + "/foo", self.path + "/foo/bar", ...
                    pardir = os.path.join(self.path, catsuffix[:sepIdx])
                    if not os.path.isdir(pardir):
                        break
                    else:
                        mtime = os.stat(pardir).st_mtime
                        youngFiles[mtime] = pardir
            else:
                catPath = os.path.join(self.path, catsuffix)
                # find youngest file
                file_, mtime = filetool.findYoungest(catPath)
                youngFiles[mtime] = file_

        # and return the maximum of those
        youngest = sorted(youngFiles.keys())[-1]
        self.__youngest = (youngFiles[youngest], youngest) # ("filepath", mtime)

        return self.__youngest


    _codeExpr = re.compile(r'''(q|qxWeb|(qx.Bootstrap|qx.Class|qx.Mixin|qx.Interface|qx.Theme)).define\s*\(\s*["']((?u)[^"']+)["']''', re.M)
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
        self._translations = self._scanTranslationPath()
        self.resources = self._scanResourcePath()

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


    def _scanResourcePath(self):
        resources = set()
        if self.resourcePath is None or not os.path.isdir(
                os.path.join(self.path,self.resourcePath)):
            self._console.info("Lib<%s>: Skipping non-existing resource path" % self.namespace)
            return resources

        path = os.path.join(self.path,self.resourcePath)
        self._console.debug("Scanning resource folder...")

        path = os.path.abspath(path)
        lib_prefix_len = len(path)
        if not path.endswith(os.sep):
            lib_prefix_len += 1

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

                resources.add(res)

        self._console.indent()
        self._console.debug("Found %s resources" % len(resources))
        self._console.outdent()
        return resources



    def _scanClassPath(self, timeOfLastScan=0):

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

        classList = []
        docs = {}
        if self.classPath is None or not os.path.isdir(
                os.path.join(self.path,self.classPath)):
            self._console.info("Lib<%s>: Skipping non-existend class path" % self.namespace)
            return classList, docs

        existClassIds = dict([(x.id,x) for x in self._classes])  # if we scanned before
        classRoot   = os.path.join(self.path, self.classPath)

        check_multiple_namespaces(classRoot)
        check_manifest_namespace(classRoot)
            
        self._console.debug("Scanning class folder...")

        # Iterate...
        #for root, dirs, files in filetool.walk(classRoot):
        #    # Filter ignored directories
        #    for ignoredDir in dirs:
        #        if self._ignoredDirEntries.match(ignoredDir):
        #            dirs.remove(ignoredDir)

        #    # Searching for files
        #    for fileName in files:
        #        # ignore dot files
        #        if fileName.startswith(".") or self._ignoredDirEntries.match(fileName):
        #            continue
        for filePathId, filePath in self.classPathIterator():
                self._console.dot()

                # basic attributes
                #filePath = os.path.join(root, fileName)    # /foo/bar/baz/source/class/my/space/AppClass.js
                #filePathId = filePath.replace(classRoot + os.sep, '')  # my/space/AppClass.js
                filePathId = os.path.splitext(filePathId)[0]  # strip pot. ".js" etc.
                filePathId = filePathId.replace(os.sep, ".") # my.space.AppClass

                p = self.getFileProps(filePathId, filePath)

                # ignore non-script
                if p.fileExt != ".js":
                    continue

                # check if known and fresh
                if (p.filePathId in existClassIds
                    and p.fileMTime < timeOfLastScan):
                    classList.append(existClassIds[filePathId])
                    continue # re-use known class

                # handle doc files
                if os.path.basename(filePath) == self._docFilename:
                    docs[p.filePackage] = {
                        "relpath"   : p.fileRel,
                        "path"      : p.filePath,
                        "encoding"  : p.fileEncoding,
                        "namespace" : self.namespace,
                        "id"        : p.filePathId,
                        "package"   : p.filePackage,
                        "size"      : p.fileSize
                    }
                    # stop further processing
                    continue

                clazz, fileCodeId = self.makeClassObj(p.filePathId, p.filePath, p)

                # ignore all data files (e.g. translation, doc files, ...)
                if fileCodeId == None:
                    continue

                # store file data
                self._console.debug("Adding class %s" % p.filePathId)
                classList.append(clazz)

        self._console.indent()
        self._console.debug("Found %s classes" % len(classList))
        self._console.debug("Found %s docs" % len(docs))
        self._console.outdent()

        #return classList, docs 
        return classList, docs 


    def _scanTranslationPath(self):
        translations = {}  # reset
        if self.assets['translations']['path'] is None or not os.path.isdir(
                os.path.join(self.path,self.assets['translations']['path'])):
            self._console.info("Lib<%s>: Skipping non-existing translation path" % self.namespace)
            return translations

        path = os.path.join(self.path,self.assets['translations']['path'])
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

                translations[fileLocale] = self.translationEntry(fileLocale, filePath, self.namespace)

        self._console.indent()
        self._console.debug("Found %s translations" % len(translations))
        self._console.outdent()

        return translations


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

    
    ##
    # Given a dottedExpr ("foo.bar.baz.a.b.c"), check if there is a matching
    # file (e.g. "foo/bar/baz.js") or directory ("foo/bar") and return the path,
    # otherwise ''.
    #
    def findClass(self, dottedExpr, includeNamespaces=False):

        def findClassR(nameParts, inDir, pathParts):
            if not nameParts:
                if includeNamespaces:
                    return pathParts
                else:
                    return []
            osListDir = os.listdir(inDir)
            if nameParts[0] + ".js" in osListDir:
                return pathParts + [nameParts[0] + ".js"]
            elif nameParts[0] in osListDir:
                return findClassR(nameParts[1:], os.path.join(inDir,nameParts[0]), 
                    pathParts + [nameParts[0]])
            else:
                return []  # no matching class in this tree


        # ----------------------------------------------------------------------

        if self.classPath is None:
            return '',''

        classParts = dottedExpr.split(".")
        classRoot = os.path.join(self.path, self.classPath)

        classPathA = findClassR(classParts, classRoot, []) # e.g. ['qx','core','Object.js']
        if not classPathA:
            return ('','')
        else:
            classId = ".".join(classPathA)
            if classId.endswith(".js"):
                classId = classId[:-3]
            return (classId, os.path.join(classRoot,*classPathA))


    def makeClassObj(self, filePathId, filePath, props):
        ##
        # provide a default context dict
        def get_contextdict():
            contextdict = {}
            contextdict["console"] = context.console
            contextdict["cache"] = context.cache
            contextdict["jobconf"] = context.jobconf
            contextdict["envchecksmap"] = {}
            return contextdict

        # -----------------------------------------------------------------------
        contextdict = get_contextdict() # TODO: Clazz() still relies on a context dict!
        if filePathId == "qx.core.Environment":
            clazz = qcEnvClass(filePathId, filePath, self, contextdict)
        else:
            clazz = Class(filePathId, filePath, self, contextdict)

        # extract code ID (e.g. class name, mixin name, ...)
        #fileCodeId = self.checkClassId(clazz, filePathId)  # involves parsing

        clazz.encoding = props.fileEncoding
        clazz.size     = props.fileSize     # dependency logging uses this
        clazz.package  = props.filePackage  # Apiloader uses this
        clazz.relpath  = props.fileRel       # Locale uses this
        clazz.m_time_  = props.fileStat.st_mtime

        return clazz, filePathId

    def checkClassId(self, classObj, filePathId):
        fileCodeId = u''
        try:
            fileCodeId = self._getCodeId(classObj)
            ## use regexp
            #fileContent = filetool.read(filePath, self.encoding)
            #fileCodeId = self._getCodeId1(fileContent)
        except ValueError, e:
            argsList = []
            for arg in e.args:
                argsList.append(arg)
            argsList[0] = argsList[0] + u' (%s)' % props.fileName
            e.args = tuple(argsList)
            raise # raises e
        # compare path and content
        if fileCodeId and fileCodeId != filePathId:
            errmsg = [
                u"Detected conflict between filename and classname!\n",
                u"    Classname: %s\n" % fileCodeId,
                u"    Path: %s\n" % filePathId,
            ]
            raise RuntimeError(u''.join(errmsg))
        return fileCodeId

    def getFileProps(self, filePathId, filePath):
        def p(): pass
        p.filePathId = unidata.normalize("NFC", filePathId) # o" -> ö
        p.filePath = filePath
        p.fileEncoding = self.encoding
        p.fileExt  = os.path.splitext(filePath)[-1]  # ".js"
        p.fileRel  = p.filePathId.replace(".", "/") + p.fileExt  # my/space/AppClass.js
        p.filePackage = p.filePathId[:p.filePathId.rfind(".")] if "." in p.filePathId else ""  # my.space
        p.fileStat = os.stat(p.filePath)
        p.fileSize = p.fileStat.st_size
        p.fileMTime= p.fileStat.st_mtime
        return p

    ##
    # Iterate over fileId's in class path, (my/space/AppClass.js, ...)
    #
    def classPathIterator(self):
        if self.classPath is None:
            return
        classRoot = os.path.join(self.path, self.classPath)
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
                filePath = os.path.join(root, fileName)
                filePathId = filePath.replace(classRoot + os.sep, '')
                yield (filePathId, filePath)

