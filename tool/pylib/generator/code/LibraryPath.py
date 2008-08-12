import os, re, sys

from misc import filetool

class LibraryPath:
    # is called with a "library" entry from the json config
    def __init__(self, libconfig, console):
        self._config = libconfig
        self._console = console

        self._classes = {}
        self._docs = {}
        self._translations = {}

        self.scan()


    _codeExpr = re.compile('qx.(Bootstrap|List|Class|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)
    _ignoredDirectories = [".svn", "CVS"]
    _classFolder = "class"
    _translationFolder = "translation"
    _docFilename = "__init__.js"


    def getClasses(self):
        return self._classes


    def getDocs(self):
        return self._docs


    def getTranslations(self):
        return self._translations


    def getNamespace(self):
        return self._namespace


    def scan(self):
        path = self._config.get("path", "")

        if path == "":
            self._console.error("Missing path information!")
            sys.exit(1)

        if not os.path.exists(path):
            self._console.error("Path does not exist: %s" % path)
            sys.exit(1)

        self._console.info("Scanning %s..." % path)
        self._console.indent()

        uri = self._config.get("uri", path)
        encoding = self._config.get("encoding", "utf-8")

        # wpbasti: What exactly happens here. How exactly is the overriding?
        
        #classPath = os.path.join(path, self._classFolder)
        classPath = os.path.join(path, self._config.get("class",""))
        #classUri = uri + "/" + self._classFolder
        classUri  = os.path.join(uri, self._config.get("class",""))

        #translationPath = os.path.join(path, self._translationFolder)
        translationPath = os.path.join(path, self._config.get("translation",""))

        self._detectNamespace(classPath)
        self._scanClassPath(classPath, classUri, encoding)
        self._scanTranslationPath(translationPath)

        self._console.outdent()


    def _getCodeId(self, fileContent):
        for item in self._codeExpr.findall(fileContent):
            return item[1]

        return None


    def _detectNamespace(self, path):
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

        self._console.debug("Detected namespace: %s" % ns)
        self._namespace = ns



    def _scanClassPath(self, path, uri, encoding):
        if not os.path.exists(path):
            self._console.error("The given path does not contains a class folder: %s" % path)
            sys.exit(1)

        self._console.debug("Scanning class folder...")

        # Iterate...
        for root, dirs, files in os.walk(path):
            # Filter ignored directories
            for ignoredDir in self._ignoredDirectories:
                if ignoredDir in dirs:
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                # Ignore dot files
                if fileName.startswith("."):
                    continue

                # Process path data
                filePath = os.path.join(root, fileName)
                fileRel = filePath.replace(path + os.sep, "")
                fileExt = os.path.splitext(fileName)[-1]

                # Compute full URI from relative path
                fileUri = uri + "/" + fileRel.replace(os.sep, "/")

                # Compute identifier from relative path
                filePathId = fileRel.replace(fileExt, "").replace(os.sep, ".")

                # Extract package ID
                filePackage = filePathId[:filePathId.rfind(".")]

                # Handle doc files
                if fileName == self._docFilename:
                    fileFor = filePathId[:filePathId.rfind(".")]
                    self._docs[filePackage] = {
                        "relpath" : fileRel,
                        "path" : filePath,
                        "encoding" : encoding,
                        "namespace" : self._namespace,
                        "id" : filePathId,
                        "package" : filePackage
                    }

                    # Stop further processing
                    continue

                # Ignore non-script
                if os.path.splitext(fileName)[-1] != ".js":
                    continue

                # Read content
                fileContent = filetool.read(filePath, encoding)

                # Extract code ID (e.g. class name, mixin name, ...)
                fileCodeId = self._getCodeId(fileContent)

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
                    sys.exit(1)

                # Store file data
                self._classes[filePathId] = {
                    "relpath" : fileRel,
                    "path" : filePath,
                    "uri" : fileUri,
                    "encoding" : encoding,
                    "namespace" : self._namespace,
                    "id" : filePathId,
                    "package" : filePackage
                }

        self._console.indent()
        self._console.debug("Found %s classes" % len(self._classes))
        self._console.debug("Found %s docs" % len(self._docs))
        self._console.outdent()



    def _scanTranslationPath(self, path):
        if not os.path.exists(path):
            self._console.error("The given path does not contain a translation folder: %s" % path)
            sys.exit(1)

        self._console.debug("Scanning translation folder...")

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

                self._translations[fileLocale] = self.translationEntry(fileLocale, filePath, self._namespace)

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
