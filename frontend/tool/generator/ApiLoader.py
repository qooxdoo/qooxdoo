import sys, os

from misc import filetool
from ecmascript.backend import api
from ecmascript.frontend import tree



class ApiLoader:
    def __init__(self, classes, docs, cache, console, treeutil):
        self._classes = classes
        self._docs = docs
        self._cache = cache
        self._console = console
        self._treeLoader = treeutil


    def getApi(self, fileId):
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        cacheId = "api-%s" % fileId
        data = self._cache.read(cacheId, filePath)
        if data != None:
            return data

        self._console.debug("Extracting API data: %s..." % fileId)

        self._console.indent()
        tree = self._treeLoader.getTree(fileId)
        (data, hasError) = api.createDoc(tree)
        self._console.outdent()
        
        if hasError:
            self._console.error("Error in API data of class: %s" % fileId)
            data = None
        
        self._cache.write(cacheId, data)
        return data


    def getPackageApi(self, packageId):
        if not self._docs.has_key(packageId):
            self._console.debug("Missing package docs: %s" % packageId)
            return None
            
        packageEntry = self._docs[packageId]
        
        text = filetool.read(packageEntry["path"])
        node = api.createPackageDoc(text, packageId)
        
        return node
        

    def storeApi(self, include, apiPath):
        self._console.info("Generating API data...")
        self._console.indent()

        docTree = tree.Node("doctree")
        length = len(include)

        self._console.info("Loading class docs...", False)
        self._console.indent()

        packages = []
        hasErrors = False
        for pos, fileId in enumerate(include):
            self._console.progress(pos, length)
            fileApi = self.getApi(fileId)
            if fileApi == None:
                hasErrors = True
            
            # Only continue merging if there were no errors
            if not hasErrors:
                self._mergeApiNodes(docTree, fileApi)
                pkgId = self._classes[fileId]["package"]
                if not pkgId in packages:
                    packages.append(pkgId)

        self._console.outdent()

        if hasErrors:
            self._console.error("Found errornous API information. Please see above. Stopping!")
            return
                
        self._console.info("Loading package docs...")
        self._console.indent()
        
        packages.sort()
        for pkgId in packages:
            self._mergeApiNodes(docTree, self.getPackageApi(pkgId))

        self._console.outdent()

        self._console.info("Connecting classes...")
        api.connectPackage(docTree, docTree)

        self._console.info("Generating search index...")
        indexContent = tree.nodeToIndexString(docTree, "", "", "")
        
        self._console.info("Saving data...", False)
        self._console.indent()

        packages = api.packagesToJsonString(docTree, "", "", "")
        filetool.save(os.path.join(apiPath, "apidata.js"), packages)
        
        length = 0
        for classData in api.classNodeIterator(docTree):
            length += 1
            
        pos = 0
        for classData in api.classNodeIterator(docTree):
            pos += 1
            self._console.progress(pos, length)
            classContent = tree.nodeToJsonString(classData, "", "", "")
            fileName = os.path.join(apiPath, classData.get("fullName") + ".js")
            filetool.save(fileName, classContent)
            
        self._console.outdent()
            
        self._console.info("Saving index...")
        filetool.save(os.path.join(apiPath, "apiindex.js"), indexContent)            

        self._console.outdent()
        self._console.info("Done")



    def _mergeApiNodes(self, target, source):
        if not target or not source:
            return
        
        if source.hasAttributes():
            attr = source.attributes
            for key in attr:
                # Special handling for attributes which stores a list (this is BTW quite ugly)
                if key in ["childClasses", "includer", "mixins", "implementations"] and target.get(key, False) != None:
                    target.set(key, "%s,%s" % (target.get(key), attr[key]))
                else:
                    target.set(key, attr[key])


        if source.hasChildren():
            # copy to keep length while iterating
            children = source.children[:]

            for child in children:
                # print "Child: %s" % child.type

                # no such type => append
                if not target.hasChild(child.type):
                    # print "=> direct append"
                    target.addChild(child)

                else:
                    # looking for identical child (e.g. equal name etc.)
                    identical = self._findIdenticalChild(target, child)
                    if identical:
                        # print "=> identical merge"
                        self._mergeApiNodes(identical, child)

                    else:
                        # print "=> fallback append"
                        target.addChild(child)



    def _findIdenticalChild(self, node, search):
        if node.hasChildren():
            for child in node.children:
                if self._isNodeIdentical(child, search):
                    return child

        return None



    def _isNodeIdentical(self, nodeA, nodeB):
        if nodeA.type == nodeB.type:
            if not nodeA.hasAttributes() and not nodeB.hasAttributes():
                return True

            if nodeA.type in [ "method", "param", "property", "event" ]:
                return nodeA.get("name") == nodeB.get("name")

            if nodeA.type in [ "class", "package", "interface", "mixin" ]:
                return nodeA.get("fullName") == nodeB.get("fullName")

        return False
