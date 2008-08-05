import copy, optparse

from ecmascript import compiler
from ecmascript.frontend import treeutil
from ecmascript.backend.optimizer import variableoptimizer, stringoptimizer, basecalloptimizer
from ecmascript.backend.optimizer import privateoptimizer, protectedoptimizer, propertyoptimizer
from misc import idlist

class TreeCompiler:
    def __init__(self, classes, cache, console, treeLoader):
        self._classes = classes
        self._cache = cache
        self._console = console
        self._treeLoader = treeLoader

        self._loadFiles()


    def _loadFiles(self):
        privates = self._cache.read("privates")
        if privates != None:
            self._console.info("Loaded %s private fields" % len(privates))
            privateoptimizer.load(privates)

        #protected = self._cache.read("protected")
        #if protected != None:
        #    self._console.info("Loaded %s protected fields" % len(protected))
        #    protectedoptimizer.load(protected)


    def _storePrivateFields(self):
        self._cache.write("privates", privateoptimizer.get())


    def _storeProtectedFields(self):
        self._cache.write("protected", protectedoptimizer.get())


    def compileClasses(self, classes, variants, optimize, format):
        content = ""
        length = len(classes)

        for pos, classId in enumerate(classes):
            self._console.progress(pos, length)
            content += self.getCompiled(classId, variants, optimize, format)

        return content


    def getCompiled(self, fileId, variants, optimize, format=False):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        variantsId = idlist.toString(variants)
        optimizeId = self.generateOptimizeId(optimize)

        cacheId = "compiled-%s-%s-%s-%s" % (fileId, variantsId, optimizeId, format)

        compiled = self._cache.read(cacheId, filePath)
        if compiled != None:
            return compiled

        tree = self._treeLoader.getTree(fileId, variants)

        if len(optimize) > 0:
            # Protect original before optimizing
            tree = copy.deepcopy(tree)

            self._console.debug("Optimizing tree: %s..." % fileId)
            self._console.indent()
            self._optimizeHelper(tree, fileId, variants, optimize)
            self._console.outdent()

        self._console.debug("Compiling tree: %s..." % fileId)
        compiled = self.compileTree(tree, format)

        self._cache.write(cacheId, compiled)
        return compiled


    def getCompiledSize(self, fileId, variants):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        variantsId = idlist.toString(variants)
        cacheId = "compiledsize-%s-%s" % (fileId, variantsId)

        size = self._cache.readmulti(cacheId, filePath)
        if size != None:
            return size

        tree = self._treeLoader.getTree(fileId, variants)

        self._console.debug("Computing compiled size: %s..." % fileId)
        compiled = self.compileTree(tree)
        size = len(compiled)

        self._cache.writemulti(cacheId, size)
        return size


    def compileTree(self, restree, format=False):
        # Emulate options
        parser = optparse.OptionParser()
        parser.add_option("--p1", action="store_true", dest="prettyPrint", default=False)
        parser.add_option("--p2", action="store_true", dest="prettypIndentString", default="  ")
        parser.add_option("--p3", action="store_true", dest="prettypCommentsInlinePadding", default="  ")
        parser.add_option("--p4", action="store_true", dest="prettypCommentsTrailingCommentCols", default="")

        (options, args) = parser.parse_args([])

        return compiler.compile(restree, options, format)


    def _optimizeHelper(self, fileTree, fileId, variants, optimize):
        if "basecalls" in optimize:
            self._console.debug("Optimize base calls...")
            self._baseCallOptimizeHelper(fileTree, fileId, variants)

        if "privates" in optimize:
            self._console.debug("Crypting private fields...")
            self._privateOptimizeHelper(fileTree, fileId, variants)

        #if "protected" in optimize:
        #    self._console.debug("Crypting protected fields...")
        #    self._protectedOptimizeHelper(fileTree, fileId, variants)

        if "strings" in optimize:
            self._console.debug("Optimizing strings...")
            self._stringOptimizeHelper(fileTree, fileId, variants)

        if "variables" in optimize:
            self._console.debug("Optimizing local variables...")
            self._variableOptimizeHelper(fileTree, fileId, variants)

        if "properties" in optimize:
            self._console.debug("Optimize properties...")
            self._propertyOptimizeHelper(fileTree, fileId, variants)

        return fileTree


    def generateOptimizeId(self, optimize):
        optimize = copy.copy(optimize)
        optimize.sort()

        return "[%s]" % ("-".join(optimize))


    def _baseCallOptimizeHelper(self, tree, id, variants):
        basecalloptimizer.patch(tree)


    def _variableOptimizeHelper(self, tree, id, variants):
        variableoptimizer.search(tree)


    def _privateOptimizeHelper(self, tree, id, variants):
        privateoptimizer.patch(tree, id)
        self._storePrivateFields()


    def _protectedOptimizeHelper(self, tree, id, variants):
        protectedoptimizer.patch(tree, id)
        self._storeProtectedFields()


    def _propertyOptimizeHelper(self, tree, id, variants):
        propertyoptimizer.patch(tree, id)


    def _stringOptimizeHelper(self, tree, id, variants):
        stringMap = stringoptimizer.search(tree)

        if len(stringMap) == 0:
            return

        stringList = stringoptimizer.sort(stringMap)
        stringoptimizer.replace(tree, stringList)

        # Build JS string fragments
        stringStart = "(function(){"
        stringReplacement = stringoptimizer.replacement(stringList)
        stringStop = "})();"

        # Compile wrapper node
        wrapperNode = treeutil.compileString(stringStart+stringReplacement+stringStop, id + "||stringopt")

        # Reorganize structure
        funcBody = wrapperNode.getChild("operand").getChild("group").getChild("function").getChild("body").getChild("block")
        if tree.hasChildren():
            for child in copy.copy(tree.children):
                tree.removeChild(child)
                funcBody.addChild(child)

        # Add wrapper to tree
        tree.addChild(wrapperNode)
