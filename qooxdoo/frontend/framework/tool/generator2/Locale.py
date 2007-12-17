import os, tempfile, subprocess

from polib import polib
from generator2 import util
from modules import treeutil, cldr

class Locale:
    def __init__(self, classes, translation, cache, console, treeLoader):
        self._classes = classes
        self._translation = translation
        self._cache = cache
        self._console = console
        self._treeLoader = treeLoader
        self._native = False


    def getLocalizationData(self, locales):
        self._console.debug("Generating localization data...")
        self._console.indent()
        
        data = []
        for locale in locales:
            self._console.debug("Processing locale: %s" % locale)
            data.append(cldr.parseCldrFile("framework/tool/cldr/main/%s.xml" % locale))
            
        self._console.outdent()
        return "".join(data)
        
        
    def getTranslationData(self, locales, namespace):
        self._console.debug("Generating translation data for namespace %s..." % namespace)
        self._console.indent()

        data = []
        for locale in locales:
            self._console.debug("Processing locale: %s" % locale)        
        
        self._console.outdent()
        return "".join(data)


    def getPotFile(self, packageContent, variants=None):
        pot = self.createPoFile()
        strings = self.getPackageStrings(packageContent, variants)

        for msgid in strings:
            # create poentry
            obj = polib.POEntry(msgid=msgid)
            pot.append(obj)

            # convert to polib style
            obj.occurrences = []
            for location in strings[msgid]["occurrences"]:
                obj.occurrences.append((location["file"], location["line"]))

        self._console.debug("File contains %s items" % len(pot))
        pot.sort()

        return pot



    def updatePoFiles(self, namespace, content):
        self._console.debug("Generating pot file...")
        pot = self.getPotFile(content)
        pot.sort()

        self._console.debug("Process po files...")
        self._console.indent()

        files = self._translation[namespace]

        for name in files:
            self._console.debug("Updating: %s" % name)

            entry = files[name]
            po = polib.pofile(entry["path"])
            po.merge(pot)
            po.sort()
            po.save(entry["path"])

        self._console.outdent()



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
        """ combines data from multiple classes into one map """

        result = {}
        counter = 0
        for classId in packageContent:
            strings = self.getStrings(classId, variants)
            counter += len(strings)

            for source in strings:
                msgid = source["id"]

                if result.has_key(msgid):
                    target = result[msgid]
                else:
                    target = result[msgid] = {
                      "occurrences" : []
                    }

                    if source.has_key("plural"):
                        target["plural"] = source["plural"]

                    if source.has_key("hint"):
                        target["hint"] = source["hint"]

                target["occurrences"].append({
                    "file" : classId,
                    "line" : source["line"],
                    "column" : source["column"]
                })

        self._console.debug("Package contains %s strings (from %s individual ones)" % (len(result), counter))
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

        strings = self._findStrings(tree, [])
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



    def _addString(self, method, data, node, var):
        entry = {
            "method" : method,
            "line" : node.get("line"),
            "column" : node.get("column")
        }

        # tr(msgid, args)
        # trn(msgid, msgid_plural, count, args)
        # trc(hint, msgid, args)
        # marktr(msgid)

        if method == "trn" or method == "trc": no=2
        else: no=1

        params = node.getChild("params", False)
        if not params or not params.hasChildren():
            raise NameError("Invalid param data for localizable string method!")

        strings = []
        for child in params.children:
            if child.type == "commentsBefore":
                continue

            elif child.type == "constant" and child.get("constantType") == "string":
                strings.append(child.get("value"))

            elif len(strings) < no:
                raise NameError("Unsupported children type: %s" % child.type)

            else:
                break

        if len(strings) != no:
            raise NameError("Invalid number of parameters")

        if method == "trc":
            entry["hint"] = strings[0]
            entry["id"] = strings[1]
        else:
            entry["id"] = strings[0]

        if method == "trn":
            entry["plural"] = strings[1]

        data.append(entry)
