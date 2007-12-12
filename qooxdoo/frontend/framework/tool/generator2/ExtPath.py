import os, re, sys
from modules import filetool
from generator2.QxPath import QxPath

class ExtPath(QxPath):
    _implFile1 = re.compile('([\.a-zA-Z0-9_-]+)\s*=\s*Ext\.extend\(', re.M)
    _implFile2 = re.compile('Ext\.extend\(([\.a-zA-Z0-9_-]+),')


    def getContentType(self, fileName, fileContent):
        if self.isImplFile(fileName, fileContent):
            return "impl"

        if self.isLocaleFile(fileName, fileContent):
            return "locale"

        if self.isStaticFile(fileName, fileContent):
            return "impl"

        return None
        
        
    def isImplFile(self, fileName, fileContent):
        if self._implFile1.search(fileContent):
            return True

        if self._implFile2.search(fileContent):
            return True

        return False
        
        
    def isLocaleFile(self, fileName, fileContent):
        return "ext-lang" in fileName


    def isStaticFile(self, fileName, fileContent):
        return True
        
        
    def getClassFolderName(self):
        return self._config.get("folders/class", "source")
        

    def getContentId(self, fileType, filePathId, fileContent):
        return filePathId
                