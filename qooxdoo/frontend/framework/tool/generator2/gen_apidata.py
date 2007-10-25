import sys, os

script_path = os.path.dirname(os.path.abspath(sys.argv[0]))
sys.path.insert(0, os.path.join(script_path, "../modules"))

import api, tree, filetool
import gen_cachesupport, gen_progress, gen_treesupport

######################################################################
#  API: DATA SUPPORT
######################################################################

def getApi(id, classes, cachePath, treesupport, verbose=False):

    entry = classes[id]
    path = entry["path"]

    cache = gen_cachesupport.readCache(id, "api", path, cachePath)
    if cache != None:
        return cache

    tree = treesupport.getTree(id)

    if verbose:
        print "  - Generating API data: %s..." % id

    (apidata, hasError) = api.createDoc(tree)

    gen_cachesupport.writeCache(id, "api", apidata, cachePath)

    return apidata



def storeApi(includeDict, dynLoadDeps, dynRunDeps, apiPath, classes, cachePath, treesupport, quiet, verbose):
    docTree = tree.Node("doctree")
    todo = includeDict.keys()
    length = len(todo)

    sys.stdout.write(">>> Generating API data:")
    sys.stdout.flush()
    for pos, id in enumerate(todo):
        gen_progress.printProgress(pos, length, quiet)
        _mergeApiNodes(docTree, getApi(id, classes, cachePath, treesupport, verbose))

    print "  - Postprocessing..."
    api.postWorkPackage(docTree, docTree)

    print "  - Storing..."
    packages = api.packagesToJsonString(docTree, "", "  ", "\n")
    filetool.save(os.path.join(apiPath, "apidata.js"), packages)

    for classData in api.classNodeIterator(docTree):
        classContent = tree.nodeToJsonString(classData, "", "  ", "\n")
        fileName = os.path.join(apiPath, classData.get("fullName") + ".js")
        filetool.save(fileName, classContent)

    print ">>> Done"



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







