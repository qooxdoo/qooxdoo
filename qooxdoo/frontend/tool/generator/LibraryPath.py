import os, re, sys

from misc import filetool

class LibraryPath:
    def __init__(self, config, console):
        self._config = config
        self._console = console
        self._classes = {}
        self._translations = {}

        self.scan()


    _codeFile = re.compile('qx.(Bootstrap|List|Class|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)
    _ignoredDirectories = [".svn", "CVS"]
    _classFolder = "class"
    _translationFolder = "translation"
    

    def getClasses(self):
        return self._classes


    def getTranslations(self):
        return self._translations


    def getNamespace(self):
        return self._namespace


    def getContentType(self, fileContent):
        if self._codeFile.search(fileContent):
            return "code"

        return "data"


    def getCodeId(self, fileContent):
        for item in self._codeFile.findall(fileContent):
            return item[1]


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
        codeNumber = 0
        dataNumber = 0

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
                fileType = self.getContentType(fileContent)

                # Read content identifier (class name)
                if fileType == "code":
                    codeNumber += 1
                    fileCodeId = self.getCodeId(fileContent)
                    
                    # Compare path and content
                    if fileCodeId != filePathId:
                        self._console.error("Detected conflict between filename and classname. Please correct!")
                        self._console.indent()
                        self._console.error("Classname: %s" % fileCodeId)
                        self._console.error("Path: %s" % fileRel)
                        self._console.outdent()
                        sys.exit(1)
                
                else:
                    dataNumber += 1

                # Store file data
                self._classes[filePathId] = {
                    "relpath" : fileRel,
                    "path" : filePath,
                    "uri" : fileUri,
                    "encoding" : encoding,
                    "namespace" : ns,
                    "type" : fileType,
                    "id" : filePathId
                }

        self._console.indent()
        self._console.debug("Added %s files (+%s data files)" % (codeNumber, dataNumber))
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
                self._translations[fileLocale] = {
                    "path" : filePath,
                    "id" : fileLocale,
                    "parent" : parent,
                    "variant" : variant,
                    "namespace" : ns
                }

        self._console.indent()
        self._console.debug("Added translation for %s locales" % number)
        self._console.outdent()
