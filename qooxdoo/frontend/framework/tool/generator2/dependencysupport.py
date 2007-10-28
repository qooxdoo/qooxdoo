from modules import config, treeutil, filetool
from generator2 import variantsupport

class Dependency:
    def __init__(self, classes, cache, console, treeutil, loadDeps, runDeps):
        self._classes = classes
        self._cache = cache
        self._console = console
        self._treeutil = treeutil
        self._loadDeps = loadDeps
        self._runDeps = runDeps
        
        
        
    def resolveDependencies(self, include, block, variants):
        result = {}

        for item in include:
            self._resolveDependenciesRecurser(item, block, variants, result)

        return result



    def _resolveDependenciesRecurser(self, item, block, variants, result):
        # check if already in
        if result.has_key(item):
            return

        # add self
        result[item] = True

        # reading dependencies
        deps = self.getCombinedDeps(item, variants)

        # process lists
        for subitem in deps["load"]:
            if not result.has_key(subitem) and not subitem in block:
                self._resolveDependenciesRecurser(subitem, block, variants, result)

        for subitem in deps["run"]:
            if not result.has_key(subitem) and not subitem in block:
                self._resolveDependenciesRecurser(subitem, block, variants, result)



    def getCombinedDeps(self, fileId, variants):
        # init lists
        loadFinal = []
        runFinal = []

        # add static dependencies
        static = self.getDeps(fileId, variants)
        loadFinal.extend(static["load"])
        runFinal.extend(static["run"])

        # add dynamic dependencies
        if self._loadDeps.has_key(fileId):
            loadFinal.extend(self._loadDeps[fileId])

        if self._runDeps.has_key(fileId):
            runFinal.extend(self._runDeps[fileId])

        # return dict
        return {
            "load" : loadFinal,
            "run" : runFinal
        }



    def getDeps(self, fileId, variants):
        filePath = self._classes[fileId]["path"]
        cacheId = "%s-deps-%s" % (fileId, variantsupport.generateCombinationId(variants))

        deps = self._cache.read(cacheId, filePath)
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

        self._cache.write(cacheId, deps)

        return deps



    def _readDictKey(self, data, key, default=None):
        if data.has_key(key):
            return data[key]

        return default



    def _analyzeClassDeps(self, fileId, variants):
        loadtimeDeps = []
        runtimeDeps = []

        tree = self._treeutil.getVariantsTree(fileId, variants)
        self._analyzeClassDepsNode(fileId, tree, loadtimeDeps, runtimeDeps, False)

        return loadtimeDeps, runtimeDeps



    def _analyzeClassDepsNode(self, fileId, node, loadtime, runtime, inFunction):
        if node.type == "variable":
            if node.hasChildren:
                assembled = ""
                first = True

                for child in node.children:
                    if child.type == "identifier":
                        if not first:
                            assembled += "."

                        assembled += child.get("name")
                        first = False

                        if assembled != fileId and self._classes.has_key(assembled):
                            if inFunction:
                                target = runtime
                            else:
                                target = loadtime

                            if assembled in target:
                                return

                            target.append(assembled)

                    else:
                        assembled = ""
                        break

                    # treat dependencies in defer as requires
                    if assembled == "qx.Class.define":
                        if node.parent.type == "operand" and node.parent.parent.type == "call":
                            deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
                            if deferNode != None:
                                self._analyzeClassDepsNode(fileId, deferNode, loadtime, runtime, False)

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

        for item in include:
            self._sortClassesRecurser(item, include, variants, result)

        return result



    def _sortClassesRecurser(self, fileId, available, variants, result):
        if fileId in result:
            return

        # reading dependencies
        deps = self.getCombinedDeps(fileId, variants)

        # process loadtime requirements
        for item in deps["load"]:
            if item in available and not item in result:
                self._sortClassesRecurser(item, available, variants, result)

        if fileId in result:
            return

        result.append(fileId)

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

        meta = self._cache.read(cacheId, filePath)
        if meta != None:
            return meta

        meta = {}
        category = fileEntry["category"]

        self._console.indent()
        
        if category == "qx.doc":
            pass

        elif category == "qx.locale":
            meta["loadtimeDeps"] = ["qx.locale.Locale", "qx.locale.Manager"]

        elif category == "qx.impl":
            content = filetool.read(filePath, fileEntry["encoding"])

            meta["loadtimeDeps"] = self._extractQxLoadtimeDeps(content, fileId)
            meta["runtimeDeps"] = self._extractQxRuntimeDeps(content, fileId)
            meta["optionalDeps"] = self._extractQxOptionalDeps(content)
            meta["ignoreDeps"] = self._extractQxIgnoreDeps(content)

            meta["modules"] = self._extractQxModules(content)
            meta["resources"] = self._extractQxResources(content)
            meta["embeds"] = self._extractQxEmbeds(content)

        self._console.outdent()
        self._cache.write(cacheId, meta)

        return meta


    def getOptionals(self, classes):
        opt = {}

        for id in classes:
            for sub in self.getMeta(id)["optionalDeps"]:
                if not sub in classes:
                    opt[sub] = True

        return opt
    

    def getModules(self):
        modules = {}

        self._console.info("Searching for module definitions...")
        for fileId in self._classes:
            if self._classes[fileId]["category"] == "qx.impl":
                for mod in self.getMeta(fileId)["modules"]:
                    if not modules.has_key(mod):
                        modules[mod] = []

                    modules[mod].append(fileId)

        self._console.indent()
        self._console.debug("Found %s modules" % len(modules))
        self._console.outdent()        
        self._console.debug("")
    
        return modules


    def _extractQxLoadtimeDeps(self, data, fileId):
        deps = []

        for item in config.QXHEAD["require"].findall(data):
            if item == fileId:
                self._console.error("Self-referring load dependency: %s" % item)
                sys.exit(1)
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



    def _extractQxModules(self, data):
        mods = []

        for item in config.QXHEAD["module"].findall(data):
            if not item in mods:
                mods.append(item)

        return mods



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
