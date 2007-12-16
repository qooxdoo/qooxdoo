import os, tempfile, subprocess

from polib import polib
from generator2 import util
from modules import treeutil

class Locale:
    def __init__(self, classes, translation, cache, console, treeLoader):
        self._classes = classes
        self._translation = translation
        self._cache = cache
        self._console = console
        self._treeLoader = treeLoader
        self._native = False
        
    
    def getPotFile(self, packageContent, variants=None, sort=True):
        pot = self.createPoFile()
        strings = self.getPackageStrings(packageContent, variants)
        
        for entry in strings:
            obj = polib.POEntry(msgid=entry)
            occ = []
            for location in strings[entry]:
                occ.append((location["file"], location["line"]))
            
            obj.occurrences = occ            
            pot.append(obj)
            
        if sort:
            pot.sort()
            
        self._console.debug("File contains %s items" % len(pot))
        
        return pot
        
        

    def updatePoFiles(self, namespace, locales, content, sort=True):
        self._console.debug("Generating pot file...")
        pot = self.getPotFile(content)
        if sort: pot.sort()
        
        self._console.debug("Process po files...")
        self._console.indent()
        
        files = self._translation[namespace]
        
        for name in locales:
            if not name in files:
                self._console.debug("Creating: %s" % name)
                pot.save(entry["path"])
                
        for name in files:
            self._console.debug("Updating: %s" % name)
            
            entry = files[name]
            po = polib.pofile(entry["path"])
            po = self.msgmerge(po, pot)
            if sort: po.sort()            
            po.save(entry["path"])
            
        self._console.outdent()                
        
        
        
    def msgmerge(self, po, pot):
        # Native implementation
        if self._native:
            poname = tempfile.NamedTemporaryFile().name
            potname = tempfile.NamedTemporaryFile().name

            po.save(poname)
            pot.save(potname)
        
            ret = subprocess.call(["msgmerge", "--update", "-q", poname, potname])        
            if ret != 0:
                raise NameError("Could not update po file!")

            po = polib.pofile(poname)
        
            os.unlink(potname)
            os.unlink(poname)        

        # Polib implementation
        else:
            po.merge(pot)
        
        return po
        
      
        
    def createPoFile(self):
        po = polib.POFile()
        
        po.metadata['Project-Id-Version'] = '1.0'
        po.metadata['Report-Msgid-Bugs-To'] = 'you@qooxdoo.org'
        po.metadata['POT-Creation-Date'] = '2007-10-18 14:00+0100'
        po.metadata['PO-Revision-Date'] = '2007-10-18 14:00+0100'
        po.metadata['Last-Translator'] = 'you <you@qooxdoo.org>'
        po.metadata['Language-Team'] = 'Team <yourteam@qooxdoo.org>'
        po.metadata['MIME-Version'] = '1.0'
        po.metadata['Content-Type'] = 'text/plain; charset=utf-8'
        po.metadata['Content-Transfer-Encoding'] = '8bit'
        
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

        
        
    def getStrings(self, fileId, variants):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]
        
        variantsId = util.generateId(variants)

        cacheId = "%s-locale-%s" % (fileId, variantsId)
        
        strings = self._cache.read(cacheId, filePath)
        if strings != None:
            return strings
            
        self._console.debug("Looking for localizable strings: %s..." % fileId)
        self._console.indent()

        tree = self._treeLoader.getVariantsTree(fileId, variants)

        strings = self._findStrings(tree, {})
        if len(strings) > 0:
            self._console.debug("Found %s localizable strings" % len(strings))

        self._console.outdent()
        self._cache.write(cacheId, strings)
        
        return strings
        

        
    def _findStrings(self, node, strings):
        if node.type == "call":
            oper = node.getChild("operand", False)
            if oper:
                var = oper.getChild("variable", False)
                if var:
                    varname = treeutil.assembleVariable(var)
                    for entry in [ ".tr", ".trn", ".trc", ".marktr" ]:
                        if varname.endswith(entry):
                            self._addString(entry[1:], strings, node, var)
                            break
            
        if node.hasChildren():
            for child in node.children:
                self._findStrings(child, strings)
        
        return strings
        
        
        
    def _addString(self, method, strings, node, var):
        try:
            string = node.getChild("params").getChildByTypeAndAttribute("constant", "constantType", "string", True)
        except NodeAccessException:
            raise NameError("Found locale element with invalid content: " % node.get("line"))
        
        value = string.get("value")
        
        entry = {
            "method" : method,
            "line" : node.get("line"),
            "column" : node.get("column")
        }

        if method == "trn":
            next = string.getFollowingSibling(True, True)
            if next.type == "constant" and next.get("constantType") == "string":
                entry["plural"] = next.get("value")
            else:
                raise NameError("Found locale element with invalid content: " % node.get("line"))

        if not strings.has_key(value):
            strings[value] = []
            
        strings[value].append(entry)
