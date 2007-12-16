import os, tempfile

from polib.polib import *
from generator2 import util
from modules import treeutil

class Locale:
    def __init__(self, classes, translation, cache, console, treeLoader):
        self._classes = classes
        self._translation = translation
        self._cache = cache
        self._console = console
        self._treeLoader = treeLoader
        
        
    
    def getPotFile(self, packageContent, variants=None):
        pot = POFile()
        strings = self.getPackageStrings(packageContent, variants)
        
        for entry in strings:
            obj = POEntry(msgid=entry)
            occ = []
            for location in strings[entry]:
                occ.append((location["file"], location["line"]))
            
            obj.occurrences = occ            
            pot.append(obj)
            
        return pot
        
        

    def updatePoFiles(self, namespace, locales, content):
        self._console.debug("Generating pot file...")
        pot = self.getPotFile(content)

        self._console.debug("Process po files...")
        self._console.indent()
        
        files = self._translation[namespace]
        
        for name in locales:
            if not name in files:
                self._console.debug("Creating: %s" % name)
                
        for name in files:
            self._console.debug("Updating: %s" % name)
            
            entry = files[name]
            po = pofile(entry["path"])
            po = self.msgmergeNative(pot, po)
            po.save(entry["path"])
            
            
        self._console.outdent()                
        
        
        
    def msgmergeCustom(self, pot, po):
        for entry in pot:
            print po.find(entry.msgid)
        
        # TODO
        

    def msgmergeNative(self, pot, po):
        potname = tempfile.NamedTemporaryFile().name
        poname = tempfile.NamedTemporaryFile().name
        
        pot.save(potname)
        po.save(poname)
        
        os.spawnl(os.P_WAIT, "msgmerge", "--update", "-v", poname, potname)

        po = pofile(poname)
        
        os.unlink(potname)
        os.unlink(poname)        
        
        return po
        

        
        
    def getPackageStrings(self, packageContent, variants):
        result = {}
        
        # combines data from multiple classes into one map
        for classId in packageContent:
            strings = self.getStrings(classId, variants)        
            
            for entry in strings:
                if not result.has_key(entry):
                    result[entry] = []
                
                for location in strings[entry]:
                    result[entry].append({
                      "file" : classId,
                      "line" : location["line"],
                      "column" : location["column"]
                    })
        
        return result 
        
    
    def getPackageStrings(self, packageContent, variants):
        result = {}
        
        # combines data from multiple classes into one map
        for classId in packageContent:
            strings = self.getStrings(classId, variants)        
            
            for entry in strings:
                if not result.has_key(entry):
                    result[entry] = []
                
                for location in strings[entry]:
                    result[entry].append({
                      "file" : classId,
                      "line" : location["line"],
                      "column" : location["column"]
                    })
        
        return result          

        
    def getStrings(self, fileId, variants):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]
        
        variantsId = util.generateId(variants)

        cacheId = "%s-locale-%s" % (fileId, variantsId)
        
        strings = self._cache.read(cacheId, filePath)
        if strings != None:
            return strings
            
        tree = self._treeLoader.getVariantsTree(fileId, variants)

        self._console.debug("Looking for localizable strings: %s..." % fileId)
        strings = self._findStrings(tree)
        if len(strings) > 0:
            self._console.debug("Found %s localizable strings" % len(strings))

        self._cache.write(cacheId, strings)
        return strings
        

    def _findStrings(self, tree):
        return self._findStringsRec(tree, {})
        
        
    def _findStringsRec(self, node, strings):
        if node.type == "call":
            oper = node.getChild("operand", False)
            if oper:
                var = oper.getChild("variable", False)
                if var:
                    varname = treeutil.assembleVariable(var)
                    for entry in [ ".tr", ".trn", ".trc", ".marktr" ]:
                        if varname.endswith(entry):
                            self._addString(strings, node, var)
                            break
            
        if node.hasChildren():
            for child in node.children:
                self._findStringsRec(child, strings)
        
        return strings
        
        
    def _addString(self, strings, node, var):
        try:
            string = node.getChild("params").getChildByTypeAndAttribute("constant", "constantType", "string", True)
        except NodeAccessException:
            raise NameError("Found locale element with invalid content: " % node.get("line"))
        
        value = string.get("value")
        
        if not strings.has_key(value):
            strings[value] = []
            
        strings[value].append({
            "line" : node.get("line"),
            "column" : node.get("column")
        })
        
            
        
        