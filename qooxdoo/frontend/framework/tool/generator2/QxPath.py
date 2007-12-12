import os, re, sys
from modules import filetool

class QxPath:
    def __init__(self, config, classes, console):
        self._config = config
        self._classes = classes
        self._console = console

        self.scan()

    
    _implFile = re.compile('qx.(Bootstrap|List|Class|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)
    _localeFile = re.compile('qx.locale.Locale.define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)


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


    def getClassFolderName(self):
        return self._config.get("folders/class", "class")


    def getResourceFolderName(self):
        return self._config.get("folders/resource", "resource")


    def getTranslationFolder(self):
        return self._config.get("folders/translation", "translation")


    # Normally there is no need to overwrite this one!
    def scan(self):
        path = self._config.get("path", "")
        uri = self._config.get("uri", path)
        encoding = self._config.get("encoding", "utf-8")

        classFolder = self.getClassFolderName()
        # resourceFolder = self.getResourceFolderName()
        # translationFolder = self.getTranslationFolderName()

        if path == "":
            self._console.error("Missing path information!")
            sys.exit(1)

        if not os.path.exists(path):
            self._console.error("Path does not exist: %s" % path)
            sys.exit(1)

        classPath = os.path.join(path, classFolder)

        if not os.path.exists(classPath):
            self._console.error("The given path does not contains a class folder: %s" % path)
            sys.exit(1)


        self._console.debug("Scanning class folder: %s" % classPath)

        # Initialize counters
        implNumber = 0
        docNumber = 0
        localeNumber = 0

        # Iterate...
        for root, dirs, files in os.walk(classPath):
            # Filter ignored directories
            for ignoredDir in [".svn", "CVS"]:
                if ignoredDir in dirs:
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                # Ignore non-script and dot files
                if os.path.splitext(fileName)[-1] != ".js" or fileName.startswith("."):
                    continue

                # Process path data
                filePath = os.path.join(root, fileName)
                fileRel = filePath.replace(classPath + os.sep, "")

                # Compute full URI from relative path
                fileUri = uri + "/" + classFolder + "/" + fileRel.replace(os.sep, "/")

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
                    "type" : fileType,
                    "id" : filePathId
                }

        self._console.debug("Added: %s impl, %s doc, %s locale" % (implNumber, docNumber, localeNumber))
        