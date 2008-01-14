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

import sys, os
from modules import api, tree, filetool


class ApiLoader:
    def __init__(self, classes, cache, console, treeutil):
        self._classes = classes
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

        self._console.debug("Generating API data: %s..." % fileId)

        self._console.indent()
        tree = self._treeLoader.getTree(fileId)
        (data, hasError) = api.createDoc(tree)
        self._console.outdent()

        self._cache.write(cacheId, data)

        return data



    def storeApi(self, include, apiPath):
        self._console.info("Generating API data:", False)
        self._console.indent()

        docTree = tree.Node("doctree")
        length = len(include)

        self._console.debug("Loading class data...")
        self._console.indent()

        for pos, fileId in enumerate(include):
            self._console.progress(pos, length)
            self._mergeApiNodes(docTree, self.getApi(fileId))

        self._console.outdent()

        self._console.info("Connecting class data...")
        api.postWorkPackage(docTree, docTree)

        self._console.info("Generating search index...")
        indexContent = tree.nodeToIndexString(docTree, "", "", "")
        
        self._console.info("Saving basic data...")
        packages = api.packagesToJsonString(docTree, "", "  ", "\n")
        filetool.save(os.path.join(apiPath, "apidata.js"), packages)

        self._console.info("Saving class data...")
        for classData in api.classNodeIterator(docTree):
            classContent = tree.nodeToJsonString(classData, "", "  ", "\n")
            fileName = os.path.join(apiPath, classData.get("fullName") + ".js")
            filetool.save(fileName, classContent)
            
        self._console.info("Saving search index...")
        filetool.save(os.path.join(apiPath, "apiindex.js"), indexContent)            

        self._console.outdent()
        self._console.info("Done")



    def _mergeApiNodes(self, target, source):
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
