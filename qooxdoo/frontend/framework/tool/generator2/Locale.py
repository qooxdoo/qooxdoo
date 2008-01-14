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

import os, sys

from polib import polib
from generator2 import util
from modules import treeutil, cldr, tree

class Locale:
    def __init__(self, classes, translation, cache, console, treeLoader):
        self._classes = classes
        self._translation = translation
        self._cache = cache
        self._console = console
        self._treeLoader = treeLoader



    def getLocalizationData(self, locales):
        self._console.debug("Generating localization data...")
        self._console.indent()

        data = []
        for entry in locales:
            self._console.debug("Processing locale: %s" % entry)
            data.append(cldr.parseCldrFile("framework/tool/cldr/main/%s.xml" % entry))

        self._console.outdent()
        return "".join(data)



    def getTranslationData(self, locales, namespace):
        self._console.debug("Generating translation data for namespace %s..." % namespace)
        self._console.indent()

        data = []
        for entry in locales:
            self._console.debug("Processing locale: %s" % entry)
            # TODO

        self._console.outdent()
        return "".join(data)



    def getPotFile(self, content, variants=None):
        pot = self.createPoFile()
        strings = self.getPackageStrings(content, variants)

        for msgid in strings:
            # create poentry
            obj = polib.POEntry(msgid=msgid)
            pot.append(obj)

            # convert to polib style
            obj.occurrences = []
            for location in strings[msgid]["occurrences"]:
                obj.occurrences.append((location["file"], location["line"]))

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




    def generatePackageData(self, content, variants, locales):
        # Generate POT file to filter PO files
        self._console.debug("Compiling filter...")
        pot = self.getPotFile(content, variants)

        if len(pot) == 0:
            return {}

        # Find all influenced namespaces
        namespaces = {}
        for classId in content:
            ns = self._classes[classId]["namespace"]
            namespaces[ns] = True

        # Create a map of locale => files
        data = {}
        for namespace in namespaces:
            files = self._translation[namespace]

            for entry in locales:
                if files.has_key(entry):
                    if not data.has_key(entry):
                        data[entry] = []

                    data[entry].append(files[entry]["path"])

        # Load po files
        blocks = {}
        for entry in data:
            self._console.debug("Processing translation: %s" % entry)
            self._console.indent()

            result = {}
            for path in data[entry]:
                self._console.debug("Reading file: %s" % path)
                self._console.indent()

                po = polib.pofile(path)
                po.merge(pot)

                translated = po.translated_entries()
                percent = po.percent_translated()
                self._console.debug("%s translated entries (%s%%)" % (len(translated), percent))
                self._console.outdent()
                result.update(self.entriesToDict(translated))

            self._console.debug("Formatting %s entries" % len(result))
            blocks[entry] = self.msgfmt(result)
            self._console.outdent()

        return blocks





    def entriesToDict(self, entries):
        all = {}

        for entry in entries:
            # TODO: Plural support
            all[entry.msgid] = entry.msgstr

        return all



    def msgfmt(self, data):
        result = []

        for msgid in data:
            result.append('"%s":"%s"' % (msgid, data[msgid]))

        return "{" + ",".join(result) + "}"



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



    def getPackageStrings(self, content, variants):
        """ combines data from multiple classes into one map """

        result = {}
        for classId in content:
            strings = self.getStrings(classId, variants)

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

        self._console.debug("Package contains %s unique strings" % len(result))
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

        try:
            strings = self._findStrings(tree, [])
        except NameError, detail:
            self._console.error("Could not extract localizable strings from %s!" % fileId)
            self._console.error("%s" % detail)
            sys.exit(1)

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
                    varname = (treeutil.assembleVariable(var))[0]
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
            raise NameError("Invalid param data for localizable string method at line %s!" % node.get("line"))

        strings = []
        for child in params.children:
            if child.type == "commentsBefore":
                continue

            elif child.type == "constant" and child.get("constantType") == "string":
                strings.append(child.get("value"))

            elif child.type == "operation":
                strings.append(self._concatOperation(child))

            elif len(strings) < no:
                raise NameError("Unsupported param of type %s at line %s" % (child.type, child.get("line")))

            # Ignore remaining params (arguments)
            if len(strings) == no:
                break

        if len(strings) != no:
            raise NameError("Invalid number of parameters %s at line %s" % (len(strings), node.get("line")))

        if method == "trc":
            entry["hint"] = strings[0]
            entry["id"] = strings[1]
        else:
            entry["id"] = strings[0]

        if method == "trn":
            entry["plural"] = strings[1]

        data.append(entry)



    def _concatOperation(self, node):
        result = ""

        try:
            first = node.getChild("first").getChildByTypeAndAttribute("constant", "constantType", "string")
            result += first.get("value")

            second = node.getChild("second").getFirstChild(True, True)
            if second.type == "operation":
                result += self._concatOperation(second)
            else:
                result += second.get("value")

        except tree.NodeAccessException:
            raise NameError("Unsupported param of type at line %s" % node.get("line"))

        return result
