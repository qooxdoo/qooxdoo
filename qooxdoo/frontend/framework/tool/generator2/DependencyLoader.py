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

import sys, re

from modules import config, treeutil, filetool
from generator2 import util

class DependencyLoader:
    def __init__(self, classes, cache, console, treeLoader, require, use):
        self._classes = classes
        self._cache = cache
        self._console = console
        self._treeLoader = treeLoader
        self._require = require
        self._use = use


    def getClassList(self, include, block, explicitInclude, explicitExclude, variants):
        # Resolve intelli include depdendencies
        if len(include) == 0 and len(explicitInclude) > 0:
            if len(block) > 0:
                self._console.error("Blocking is not supported when only explicit includes are defined!");
                sys.exit(1)

            result = []
        else:
            result = self.resolveDependencies(include, block, variants)


        # Explicit include/exclude
        if len(explicitInclude) > 0 or len(explicitExclude) > 0:
            self._console.info("Processing explicitely configured includes/excludes...")
            for entry in explicitInclude:
                if not entry in result:
                    result.append(entry)

            for entry in explicitExclude:
                if entry in result:
                    result.remove(entry)


        # Debug optional classes
        if self._console.inDebugMode():
            self._console.debug("Looking out for optional classes...")
            optionals = self.getOptionals(result)
            if len(optionals) > 0:
                self._console.debug("Found these optional classes:")
                self._console.indent()
                for entry in optionals:
                    self._console.debug("%s" % entry)
                self._console.outdent()


        # Sort classes
        self._console.info("Sorting %s classes..." % len(result))
        result = self.sortClasses(result, variants)


        # Return list
        return result



    def resolveDependencies(self, include, block, variants):
        if len(include) == 0:
            self._console.info("Including all known classes")
            result = self._classes.keys()

            # In this case the block works like an exclicit exclude
            # because all classes are included like an explicit include.
            for classId in block:
                result.remove(classId)

        else:
            result = []
            for item in include:
                try:
                    self._resolveDependenciesRecurser(item, block, variants, result)

                except NameError, detail:
                    self._console.error("Dependencies resolving failed for %s with: \n%s" % (item, detail))
                    sys.exit(1)

        return result



    def _resolveDependenciesRecurser(self, item, block, variants, result):
        # check if already in
        if item in result:
            return

        # add self
        result.append(item)

        # reading dependencies
        try:
            deps = self.getCombinedDeps(item, variants)
        except NameError, detail:
            raise NameError("Could not resolve dependencies of class: %s\n%s" % (item, detail))

        # process lists
        try:
          for subitem in deps["load"]:
              if not subitem in result and not subitem in block:
                  self._resolveDependenciesRecurser(subitem, block, variants, result)

          for subitem in deps["run"]:
              if not subitem in result and not subitem in block:
                  self._resolveDependenciesRecurser(subitem, block, variants, result)

        except NameError, detail:
            raise NameError("Could not resolve dependencies of class: %s \n%s" % (item, detail))



    def getCombinedDeps(self, fileId, variants):
        # print "Get combined deps: %s" % fileId

        # init lists
        loadFinal = []
        runFinal = []

        # add static dependencies
        static = self.getDeps(fileId, variants)
        loadFinal.extend(static["load"])
        runFinal.extend(static["run"])

        # add dynamic dependencies
        if self._require.has_key(fileId):
            loadFinal.extend(self._require[fileId])

        if self._use.has_key(fileId):
            runFinal.extend(self._use[fileId])

        # return dict
        return {
            "load" : loadFinal,
            "run" : runFinal
        }



    def getDeps(self, fileId, variants):
        if not self._classes.has_key(fileId):
            raise NameError("Could not find class to fulfil dependency: %s" % fileId)

        filePath = self._classes[fileId]["path"]
        cacheId = "%s-deps-%s" % (fileId, util.generateId(variants))

        # print "Read from cache: %s" % fileId

        deps = self._cache.read(cacheId, filePath, True)
        if deps != None:
            return deps

        # Notes:
        # load time = before class = require
        # runtime = after class = use

        load = []
        run = []

        self._console.debug("Gathering dependencies: %s" % fileId)
        self._console.indent()

        # Read meta data
        meta = self.getMeta(fileId)
        metaLoad = self._readDictKey(meta, "loadtimeDeps", [])
        metaRun = self._readDictKey(meta, "runtimeDeps", [])
        metaOptional = self._readDictKey(meta, "optionalDeps", [])
        metaIgnore = self._readDictKey(meta, "ignoreDeps", [])

        # Process meta data
        load.extend(metaLoad)
        run.extend(metaRun)

        # Read content data
        (autoLoad, autoRun) = self._analyzeClassDeps(fileId, variants)

        # Process content data
        if not "auto-require" in metaIgnore:
            for item in autoLoad:
                if item in metaOptional:
                    pass
                elif item in load:
                    self._console.warn("#require(%s) is auto-detected" % item)
                else:
                    load.append(item)

        if not "auto-use" in metaIgnore:
            for item in autoRun:
                if item in metaOptional:
                    pass
                elif item in load:
                    pass
                elif item in run:
                    self._console.warn("#use(%s) is auto-detected" % item)
                else:
                    run.append(item)

        self._console.outdent()

        # Build data structure
        deps = {
            "load" : load,
            "run" : run
        }

        self._cache.write(cacheId, deps, True)

        return deps



    def _readDictKey(self, data, key, default=None):
        if data.has_key(key):
            return data[key]

        return default



    def _analyzeClassDeps(self, fileId, variants):
        loadtimeDeps = []
        runtimeDeps = []

        tree = self._treeLoader.getVariantsTree(fileId, variants)
        self._analyzeClassDepsNode(fileId, tree, loadtimeDeps, runtimeDeps, False)

        return loadtimeDeps, runtimeDeps



    def _analyzeClassDepsNode(self, fileId, node, loadtime, runtime, inFunction):
        if node.type == "variable":
            assembled = (treeutil.assembleVariable(node))[0]

            # treat dependencies in defer as requires
            if assembled == "qx.Class.define":
                if node.parent.type == "operand" and node.parent.parent.type == "call":
                    deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
                    if deferNode != None:
                        self._analyzeClassDepsNode(fileId, deferNode, loadtime, runtime, False)


            # try to reduce to a class name
            assembledId = None
            if self._classes.has_key(assembled):
                assembledId = assembled

            elif "." in assembled:
                for entryId in self._classes:
                    if assembled.startswith(entryId) and re.match("%s\W" % entryId, assembled):
                        assembledId = entryId
                        break

            if assembledId and assembledId != fileId and self._classes.has_key(assembledId):
                if inFunction:
                    target = runtime
                else:
                    target = loadtime

                if not assembledId in target:
                    target.append(assembledId)

        elif node.type == "body" and node.parent.type == "function":
            inFunction = True

        if node.hasChildren():
            for child in node.children:
                self._analyzeClassDepsNode(fileId, child, loadtime, runtime, inFunction)





    ######################################################################
    #  CLASS SORT SUPPORT
    ######################################################################

    def sortClasses(self, include, variants):
        result = []

        for classId in include:
            self._sortClassesRecurser(classId, include, variants, result)

        return result



    def _sortClassesRecurser(self, classId, available, variants, result):
        if classId in result:
            return

        # reading dependencies
        deps = self.getCombinedDeps(classId, variants)

        # process loadtime requirements
        for item in deps["load"]:
            if item in available and not item in result:
                self._sortClassesRecurser(item, available, variants, result)

        if classId in result:
            return

        # print "Add: %s" % classId
        result.append(classId)

        # process runtime requirements
        for item in deps["run"]:
            if item in available and not item in result:
                self._sortClassesRecurser(item, available, variants, result)






    ######################################################################
    #  META DATA SUPPORT
    ######################################################################

    def getMeta(self, fileId):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]
        cacheId = "%s-meta" % fileId

        meta = self._cache.read(cacheId, filePath, True)
        if meta != None:
            return meta

        meta = {}
        category = fileEntry["type"]

        self._console.indent()

        if category == "doc":
            pass

        elif category == "impl" or category == "locale":
            content = filetool.read(filePath, fileEntry["encoding"])

            meta["loadtimeDeps"] = self._extractQxLoadtimeDeps(content, fileId)
            meta["runtimeDeps"] = self._extractQxRuntimeDeps(content, fileId)
            meta["optionalDeps"] = self._extractQxOptionalDeps(content)
            meta["ignoreDeps"] = self._extractQxIgnoreDeps(content)

            meta["resources"] = self._extractQxResources(content)
            meta["embeds"] = self._extractQxEmbeds(content)

        self._console.outdent()

        self._cache.write(cacheId, meta, True)

        return meta


    def getOptionals(self, include):
        result = []

        for classId in include:
            try:
                for optional in self.getMeta(classId)["optionalDeps"]:
                    if not optional in include and not optional in result:
                        result.append(optional)

            # Not all meta data contains optional infos
            except KeyError:
                continue

        return result



    def _extractQxLoadtimeDeps(self, data, fileId):
        deps = []

        for item in config.QXHEAD["require"].findall(data):
            if item == fileId:
                raise NameError("Self-referring load dependency: %s" % item)
            else:
                deps.append(item)

        return deps



    def _extractQxRuntimeDeps(self, data, fileId):
        deps = []

        for item in config.QXHEAD["use"].findall(data):
            if item == fileId:
                self._console.error("Self-referring runtime dependency: %s" % item)
            else:
                deps.append(item)

        return deps



    def _extractQxOptionalDeps(self, data):
        deps = []

        # Adding explicit requirements
        for item in config.QXHEAD["optional"].findall(data):
            if not item in deps:
                deps.append(item)

        return deps



    def _extractQxIgnoreDeps(self, data):
        ignores = []

        # Adding explicit requirements
        for item in config.QXHEAD["ignore"].findall(data):
            if not item in ignores:
                ignores.append(item)

        return ignores



    def _extractQxResources(self, data):
        res = []

        for item in config.QXHEAD["resource"].findall(data):
            res.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

        return res



    def _extractQxEmbeds(self, data):
        emb = []

        for item in config.QXHEAD["embed"].findall(data):
            emb.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

        return emb
