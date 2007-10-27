import sys, os
from modules import api, tree, filetool
from generator2 import treesupport

def getApi(entry, cache, console):
    fileId = entry["id"]
    filePath = entry["path"]

    cacheId = "api-%s" % fileId
    data = cache.read(cacheId, filePath)
    if data != None:
        return data

    tree = treesupport.getTree(entry, cache, console)

    console.debug("  - Generating API data: %s..." % fileId)
    (data, hasError) = api.createDoc(tree)

    cache.write(cacheId, data)

    return data



def storeApi(includeDict, apiPath, classes, cache, console):
    docTree = tree.Node("doctree")
    todo = includeDict.keys()
    length = len(todo)

    console.info(">>> Generating API data:", False)
    for pos, fileId in enumerate(todo):
        console.progress(pos, length)
        _mergeApiNodes(docTree, getApi(classes[fileId], cache, console))

    console.info("  - Postprocessing...")
    api.postWorkPackage(docTree, docTree)

    console.info("  - Storing...")
    packages = api.packagesToJsonString(docTree, "", "  ", "\n")
    filetool.save(os.path.join(apiPath, "apidata.js"), packages)

    for classData in api.classNodeIterator(docTree):
        classContent = tree.nodeToJsonString(classData, "", "  ", "\n")
        fileName = os.path.join(apiPath, classData.get("fullName") + ".js")
        filetool.save(fileName, classContent)

    console.info(">>> Done")



def _mergeApiNodes(target, source):
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
                identical = _findIdenticalChild(target, child)
                if identical:
                    # print "=> identical merge"
                    _mergeApiNodes(identical, child)

                else:
                    # print "=> fallback append"
                    target.addChild(child)



def _findIdenticalChild(node, search):
    if node.hasChildren():
        for child in node.children:
            if _isNodeIdentical(child, search):
                return child

    return None



def _isNodeIdentical(nodeA, nodeB):
    if nodeA.type == nodeB.type:
        if not nodeA.hasAttributes() and not nodeB.hasAttributes():
            return True

        if nodeA.type in [ "method", "param", "property", "event" ]:
            return nodeA.get("name") == nodeB.get("name")

        if nodeA.type in [ "class", "package", "interface", "mixin" ]:
            return nodeA.get("fullName") == nodeB.get("fullName")

    return False
