import copy, optparse
from modules import compiler, variableoptimizer, stringoptimizer, basecalloptimizer, privateoptimizer, treeutil
from generator2 import variantsupport

class Compiler:
    def __init__(self, classes, cache, console, treeutil):
        self._classes = classes
        self._cache = cache
        self._console = console
        self._treeutil = treeutil


    def compileClasses(self, todo, variants, optimize, format):
        content = ""
        length = len(todo)

        for pos, fileId in enumerate(todo):
            self._console.progress(pos, length)
            content += self.getCompiled(fileId, variants, optimize, format)

        return content


    def getCompiled(self, fileId, variants, optimize, format=False):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        variantsId = variantsupport.generateId(variants)
        optimizeId = self.generateOptimizeId(optimize)

        cacheId = "%s-compiled-%s-%s-%s" % (fileId, variantsId, optimizeId, format)

        compiled = self._cache.read(cacheId, filePath)
        if compiled != None:
            return compiled

        tree = copy.deepcopy(self._treeutil.getVariantsTree(fileId, variants))

        if len(optimize) > 0:
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

        variantsId = variantsupport.generateId(variants)
        cacheId = "%s-compiled-size-%s" % (fileId, variantsId)

        size = self._cache.read(cacheId, filePath)
        if size != None:
            return size

        tree = self._treeutil.getVariantsTree(fileId, variants)

        self._console.debug("Computing compiled size: %s..." % fileId)
        compiled = self.compileTree(tree)
        size = len(compiled)

        self._cache.write(cacheId, size)
        return size


    def cleanCompiled(self, fileId, variants, optimize, format=False):
        variantsId = variantsupport.generateId(variants)
        optimizeId = self.generateOptimizeId(variants)

        cacheId = "%s-compiled-%s-%s-%s" % (fileId, variantsId, optimizeId, format)

        self._cache.clean(cacheId)


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

        if "variables" in optimize:
            self._console.debug("Optimize local variables...")
            self._variableOptimizeHelper(fileTree, fileId, variants)

        if "privates" in optimize:
            self._console.debug("Optimize privates...")
            self._privateOptimizeHelper(fileTree, fileId, variants)

        if "strings" in optimize:
            self._console.debug("Optimize strings...")
            self._stringOptimizeHelper(fileTree, fileId, variants)

        return fileTree


    def generateOptimizeId(self, optimize):
        optimize = copy.copy(optimize)
        optimize.sort()

        return "[%s]" % ("-".join(optimize))


    def _baseCallOptimizeHelper(self, tree, id, variants):
        basecalloptimizer.patch(tree)


    def _variableOptimizeHelper(self, tree, id, variants):
        variableoptimizer.search(tree, [], 0, 0, "$")


    def _privateOptimizeHelper(self, tree, id, variants):
        # TODO: Try to find a solution to have a small unique-like ID
        unique = zlib.adler32(id)
        privateoptimizer.patch(unique, tree, {})


    def _stringOptimizeHelper(self, tree, id, variants):
        # Do not optimize strings for non-mshtml clients
        if variants.has_key("qx.client"):
            clientValue = variants["qx.client"]
            if clientValue != None and clientValue != "mshtml":
                return

        # TODO: Customize option for __SS__

        stringMap = stringoptimizer.search(tree)
        stringList = stringoptimizer.sort(stringMap)

        if len(stringList) == 0:
            return

        stringoptimizer.replace(tree, stringList, "__SS__")

        # Build JS string fragments
        stringStart = "(function(){"
        stringReplacement = "var " + stringoptimizer.replacement(stringList, "__SS__")
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