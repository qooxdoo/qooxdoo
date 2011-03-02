#!/usr/bin/env python
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

import os, re, sys

from misc                         import filetool, Path
from misc.NameSpace               import NameSpace
from ecmascript.frontend          import lang
from generator.code.Class         import Class
from generator.resource.Resource  import Resource
from generator.resource.Image     import Image
from generator.resource.CombinedImage import CombinedImage
from generator                    import Context as context

##
# pickle complains when I use NameSpace!?
class C(object): pass

##
# Represents a qooxdoo library
class Library(object):
    # is called with a "library" entry from the config.json
    def __init__(self, libconfig, console):
        self._config = libconfig
        self._console = console

        self._classes = {}
        self._classesObj = []
        self._docs = {}
        self._translations = {}

        self.resources  = set()

        self._path = context.config.absPath(self._config.get("path", ""))
        self.manifest = context.config.absPath(self._config.get("manifest", ""))

        if self._path == "":
            raise ValueError("Missing path information!")

        if not os.path.exists(self._path):
            raise ValueError("Path does not exist: %s" % self._path)

        self._uri = self._config.get("uri", self._path)
        self._encoding = self._config.get("encoding", "utf-8")

        self._classPath = os.path.join(self._path, self._config.get("class","source/class"))
        self._classUri  = os.path.join(self._uri,  self._config.get("class","source/class"))

        self._translationPath = os.path.join(self._path, self._config.get("translation","source/translation"))
        self._resourcePath    = os.path.join(self._path, self._config.get("resource","source/resource"))
        #TODO: clean up the others later
        self.categories = {}
        self.categories["classes"] = {}
        self.categories["translations"] = {}
        self.categories["resources"] = {}

        self.categories["classes"]["path"]  = self._classPath
        self.categories["translations"]["path"]  = self._translationPath
        self.categories["resources"]["path"] = self._resourcePath

        self.namespace = self._config.get("namespace")
        if not self.namespace: raise RuntimeError
        self._checkNamespace(self._classPath)


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


    def mostRecentlyChangedFile(self):
        youngFiles = {}
        # for each interesting library part
        for category in self.categories:
            catPath = self.categories[category]["path"]
            if category == "translation" and not os.path.isdir(catPath):
                continue
            # find youngest file
            file, mtime = filetool.findYoungest(catPath)
            youngFiles[mtime] = file
            
        # also check the Manifest file
        file, mtime = filetool.findYoungest(self.manifest)
        youngFiles[mtime] = file
        
        # and return the maximum of those
        youngest = sorted(youngFiles.keys())[-1]

        return (youngFiles[youngest], youngest)


    _codeExpr = re.compile(r'''qx.(Bootstrap|List|Class|Mixin|Interface|Theme).define\s*\(\s*["']((?u)[^"']+)["']''', re.M)
    _illegalIdentifierExpr = re.compile(lang.IDENTIFIER_ILLEGAL_CHARS)
    _ignoredDirectories    = re.compile(r'%s' % '|'.join(filetool.VERSIONCONTROL_DIR_PATTS), re.I)
    _docFilename           = "__init__.js"


    def getClasses(self):
        return self._classes

    def getClasses1(self):
        return self._classesObj


    def getDocs(self):
        return self._docs


    def getTranslations(self):
        return self._translations


    def getNamespace(self):
        return self.namespace

    def getResources(self):
        return self.resources

    def scan(self):
        self._console.info("Scanning %s..." % self._path)
        self._console.indent()

        scanres = self._scanClassPath(self._classPath, self._classUri, self._encoding)
        self._classes = scanres[0]
        self._docs    = scanres[1]
        self._scanTranslationPath(self._translationPath)
        self._scanResourcePath(self._resourcePath)

        self._console.outdent()


    def _getCodeId(self, fileContent):
        for item in self._codeExpr.findall(fileContent):
            illegal = self._illegalIdentifierExpr.search(item[1])
            if illegal:
                raise ValueError, "Item name '%s' contains illegal character '%s'" % (item[1],illegal.group(0))
            return item[1]

        return None


    def _checkNamespace(self, path):
        if not os.path.exists(path):
            raise ValueError("The given path does not contain a class folder: %s" % path)

        ns = None
        files = os.listdir(path)

        for entry in files:
            if entry.startswith(".") or self._ignoredDirectories.match(entry):
                continue

            full = os.path.join(path, entry)
            if os.path.isdir(full):
                if ns != None:
                    raise ValueError("Multiple namespaces per library are not supported (%s,%s)" % (full, ns))

                ns = entry

        if ns == None:
            raise ValueError("Namespace could not be detected!")


    def _detectNamespace(self, path):
        if not os.path.exists(path):
            raise ValueError("The given path does not contain a class folder: %s" % path)

        ns = None
        files = os.listdir(path)

        for entry in files:
            if entry.startswith(".") or self._ignoredDirectories.match(entry):
                continue

            full = os.path.join(path, entry)
            if os.path.isdir(full):
                if ns != None:
                    raise ValueError("Multiple namespaces per library are not supported (%s,%s)" % (full, ns))

                ns = entry

        if ns == None:
            raise ValueError("Namespace could not be detected!")

        self._console.debug("Detected namespace: %s" % ns)
        self.namespace = ns



    def scanResourcePath(self):
        # path to the lib resource root
        libpath = os.path.normpath(self._resourcePath)  # normalize "./..."
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

        for root, dirs, files in filetool.walk(path):
            # filter ignored directories
            for dir in dirs:
                if self._ignoredDirectories.match(dir):
                    dirs.remove(dir)

            for file in files:
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
                
                res.id = Path.posifyPath(fpath[lib_prefix_len:])
                res.library= self

                self.resources.add(res)

        return



    def _scanClassPath(self, path, uri, encoding):
        if not os.path.exists(path):
            raise ValueError("The given class path does not exist: %s" % path)

        self._console.debug("Scanning class folder...")

        classList = {}
        docs = {}

        # Iterate...
        for root, dirs, files in filetool.walk(path):
            # Filter ignored directories
            for ignoredDir in dirs:
                if self._ignoredDirectories.match(ignoredDir):
                    dirs.remove(ignoredDir)

            # Add good directories
            currNameSpace = root[len(path+os.sep):]
            currNameSpace = currNameSpace.replace(os.sep, ".")

            # Searching for files
            for fileName in files:
                # Ignore dot files
                if fileName.startswith("."):
                    continue

                # Process path data
                filePath = os.path.join(root, fileName)
                fileRel  = filePath.replace(path + os.sep, "")
                fileExt  = os.path.splitext(fileName)[-1]
                fileSize = os.stat(filePath).st_size

                # Compute full URI from relative path
                fileUri = uri + "/" + fileRel.replace(os.sep, "/")

                # Compute identifier from relative path
                filePathId = fileRel.replace(fileExt, "").replace(os.sep, ".")

                # Extract package ID
                filePackage = filePathId[:filePathId.rfind(".")]

                # Handle doc files
                if fileName == self._docFilename:
                    fileFor = filePathId[:filePathId.rfind(".")]
                    docs[filePackage] = {
                        "relpath" : fileRel,
                        "path" : filePath,
                        "encoding" : encoding,
                        "namespace" : self.namespace,
                        "id" : filePathId,
                        "package" : filePackage,
                        "size" : fileSize
                    }

                    # Stop further processing
                    continue

                # Ignore non-script
                if os.path.splitext(fileName)[-1] != ".js":
                    continue

                # Read content
                fileContent = filetool.read(filePath, encoding)

                # Extract code ID (e.g. class name, mixin name, ...)
                try:
                    fileCodeId = self._getCodeId(fileContent)
                except ValueError, e:
                    argsList = []
                    for arg in e.args:
                        argsList.append(arg)
                    argsList[0] = argsList[0] + u' (%s)' % fileName
                    e.args = tuple(argsList)
                    raise e

                # Ignore all data files (e.g. translation, doc files, ...)
                if fileCodeId == None:
                    continue

                # Compare path and content
                if fileCodeId != filePathId:
                    self._console.error("Detected conflict between filename and classname!")
                    self._console.indent()
                    self._console.error("Classname: %s" % fileCodeId)
                    self._console.error("Path: %s" % fileRel)
                    self._console.outdent()
                    raise RuntimeError()

                # Store file data
                self._console.debug("Adding class %s" % filePathId)
                classList[filePathId] = {
                    "relpath" : fileRel,
                    "path" : filePath,
                    "encoding" : encoding,
                    "namespace" : self.namespace,
                    "id" : filePathId,
                    "package" : filePackage,
                    "size" : fileSize
                }
                # TODO: Clazz still relies on a context dict!
                contextdict = {}
                contextdict["console"] = context.console
                contextdict["cache"] = context.cache
                contextdict["jobconf"] = context.jobconf
                # TODO: currently creation of throw-away objects (unless they're .append'ed)
                clazz = Class(classList[filePathId], filePath, self, contextdict, self._classesObj)
                clazz.encoding = encoding
                clazz.size     = fileSize     # dependency logging uses this
                clazz.package  = filePackage  # Apiloader uses this
                #self._classesObj.append(clazz)

        self._console.indent()
        self._console.debug("Found %s classes" % len(classList))
        self._console.debug("Found %s docs" % len(docs))
        self._console.outdent()

        return classList, docs 



    def _scanTranslationPath(self, path):
        if not os.path.exists(path):
            self._console.warn("The given path does not contain a translation folder: %s" % path)

        self._console.debug("Scanning translation folder...")

        # Iterate...
        for root, dirs, files in filetool.walk(path):
            # Filter ignored directories
            for ignoredDir in dirs:
                if self._ignoredDirectories.match(ignoredDir):
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                # Ignore non-script and dot files
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

