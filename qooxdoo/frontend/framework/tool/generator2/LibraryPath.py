################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 1&1 Internet AG, Germany, http://www.1und1.de
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

import os, re, sys
from modules import filetool

class LibraryPath:
    def __init__(self, config, console):
        self._config = config
        self._console = console
        self._classes = {}
        self._translation = {}

        self.scan()


    _implFile = re.compile('qx.(Bootstrap|List|Class|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)
    _localeFile = re.compile('qx.locale.Locale.define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)


    def getClasses(self):
        return self._classes


    def getTranslation(self):
        return self._translation


    def getNamespace(self):
        return self._namespace


    def isDocFile(self, fileName, fileContent):
        return fileName == "__init__.js"



    def isImplFile(self, fileName, fileContent):
        if self._implFile.search(fileContent):
            return True

        return False



    def isLocaleFile(self, fileName, fileContent):
        for item in self._localeFile.findall(fileContent):
            return True

        return False



    def getContentType(self, fileName, fileContent):
        if self.isImplFile(fileName, fileContent):
            return "impl"

        if self.isLocaleFile(fileName, fileContent):
            return "locale"

        if self.isDocFile(fileName, fileContent):
            return "doc"

        return None



    def getContentId(self, fileType, filePathId, fileContent):
        if fileType == "impl":
            for item in self._implFile.findall(fileContent):
                return item[1]

        elif fileType == "locale":
            return filePathId

        elif fileType == "doc":
            return filePathId

        return None



    # Normally there is no need to overwrite this one!
    def scan(self):
        path = self._config.get("path", "")

        if path == "":
            self._console.error("Missing path information!")
            sys.exit(1)

        if not os.path.exists(path):
            self._console.error("Path does not exist: %s" % path)
            sys.exit(1)

        uri = self._config.get("uri", path)
        encoding = self._config.get("encoding", "utf-8")

        classPath = os.path.join(path, self._classFolder)
        classUri = uri + "/" + self._classFolder

        translationPath = os.path.join(path, self._translationFolder)

        self.detectNamespace(classPath)
        self.scanClassPath(classPath, classUri, encoding)
        self.scanTranslationPath(translationPath)




    _ignoredDirectories = [".svn", "CVS"]
    _classFolder = "class"
    _translationFolder = "translation"



    def detectNamespace(self, path):
        if not os.path.exists(path):
            self._console.error("The given path does not contains a class folder: %s" % path)
            sys.exit(1)

        ns = None

        files = os.listdir(path)

        for entry in files:
            if entry.startswith(".") or entry in self._ignoredDirectories:
                continue

            full = os.path.join(path, entry)
            if os.path.isdir(full):
                if ns != None:
                    self._console.error("Multi namespaces per library are not supported!")
                    sys.exit(1)

                ns = entry

        if ns == None:
            self._console.error("Namespace could not be detected!")
            sys.exit(1)

        self._console.debug("Auto detected namespace: %s" % ns)
        self._namespace = ns



    def scanClassPath(self, path, uri, encoding):
        if not os.path.exists(path):
            self._console.error("The given path does not contains a class folder: %s" % path)
            sys.exit(1)

        self._console.debug("Scanning class folder: %s" % path)

        # Initialize counters
        implNumber = 0
        docNumber = 0
        localeNumber = 0

        # Shorten namespace
        ns = self._namespace

        # Iterate...
        for root, dirs, files in os.walk(path):
            # Filter ignored directories
            for ignoredDir in self._ignoredDirectories:
                if ignoredDir in dirs:
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                # Ignore non-script and dot files
                if os.path.splitext(fileName)[-1] != ".js" or fileName.startswith("."):
                    continue

                # Process path data
                filePath = os.path.join(root, fileName)
                fileRel = filePath.replace(path + os.sep, "")

                # Compute full URI from relative path
                fileUri = uri + "/" + fileRel.replace(os.sep, "/")

                # Compute identifier from relative path
                filePathId = fileRel.replace(".js", "").replace(os.sep, ".")

                # Read content
                fileContent = filetool.read(filePath, encoding)

                # Extract type
                fileType = self.getContentType(fileName, fileContent)

                # Read content identifier (class name)
                fileContentId = self.getContentId(fileType, filePathId, fileContent)

                # Check return value
                if fileContentId == None:
                    self._console.error("Could not extract content ID from %s (%s)!" % (fileRel, fileType))
                    sys.exit(1)

                # Compare path and content
                if fileContentId != filePathId:
                    self._console.error("Detected conflict between filename and classname. Please correct!")
                    self._console.indent()
                    self._console.error("Classname: %s" % fileContentId)
                    self._console.error("Path: %s" % fileRel)
                    self._console.outdent()
                    sys.exit(1)

                # Increment counter
                if fileType == "impl":
                    implNumber += 1
                elif fileType == "doc":
                    docNumber += 1
                elif fileType == "locale":
                    localeNumber += 1

                # Store file data
                self._classes[filePathId] = {
                    "path" : filePath,
                    "uri" : fileUri,
                    "encoding" : encoding,
                    "namespace" : ns,
                    "type" : fileType,
                    "id" : filePathId
                }

        self._console.indent()
        self._console.debug("Added classes: %s impl, %s doc, %s locale" % (implNumber, docNumber, localeNumber))
        self._console.outdent()



    def scanTranslationPath(self, path):
        if not os.path.exists(path):
            self._console.error("The given path does not contains a translation folder: %s" % path)
            sys.exit(1)

        self._console.debug("Scanning translation folder: %s" % path)

        number = 0
        ns = self._namespace

        # Iterate...
        for root, dirs, files in os.walk(path):
            # Filter ignored directories
            for ignoredDir in self._ignoredDirectories:
                if ignoredDir in dirs:
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                # Ignore non-script and dot files
                if os.path.splitext(fileName)[-1] != ".po" or fileName.startswith("."):
                    continue

                filePath = os.path.join(root, fileName)
                fileLocale = os.path.splitext(fileName)[0]
                number += 1

                if "_" in fileLocale:
                    split = fileLocale.index("_")
                    parent = fileLocale[:split]
                    variant = fileLocale[split+1:]

                else:
                    parent = "C"
                    variant = ""

                # Store file data
                self._translation[fileLocale] = {
                    "path" : filePath,
                    "id" : fileLocale,
                    "parent" : parent,
                    "variant" : variant,
                    "namespace" : ns
                }

        self._console.indent()
        self._console.debug("Added translation: %s locales" % number)
        self._console.outdent()
