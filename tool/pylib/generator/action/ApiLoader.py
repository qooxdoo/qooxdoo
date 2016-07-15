#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#
################################################################################

##
# ApiLoader - Interface class for the generator to the API data generation back-
#             end; creates the raw Json data for the Apiviewer (using api.
#             backend.api), the search index, and is capable of checking
#             internal links.
##

import sys, os, re

from misc import filetool
from misc import json
from ecmascript.backend import api
from ecmascript.frontend import tree, treegenerator, lang
from generator import Context


class ApiLoader(object):
    def __init__(self, classesObj, docs, cache, console, job):
        self._classesObj = classesObj
        self._docs = docs
        self._cache = cache
        self._console = console
        self._job = job


    ##
    # The API doctree of a specific file/class.
    #
    def getApi(self, fileId, variantSet):
        filePath = self._classesObj[fileId].path

        cacheId = "api-%s" % filePath
        tdata, _ = self._cache.read(cacheId, filePath)
        if tdata != None:
            return tdata

        self._console.debug("Extracting API data: %s..." % fileId)

        self._console.indent()
        tree_ = self._classesObj[fileId].tree(treegenerator)
        optimize = self._job.get("compile-options/code/optimize", [])
        if "variants" in optimize:
            tree_ = self._classesObj[fileId].optimize(tree_, ["variants"], variantSet)
        (data, hasError, attachMap) = api.createDoc(tree_)
        self._console.outdent()

        if hasError:
            self._console.error("Error in API data of class: %s" % fileId)
            data = None

        self._cache.write(cacheId, (data, attachMap))
        return data, attachMap


    def getPackageApi(self, packageId):
        if not packageId in self._docs:
            if packageId:  # don't complain empty root namespace
                self._console.warn("Missing package docs: %s" % packageId)
            return None

        packageEntry = self._docs[packageId]

        text = filetool.read(packageEntry["path"])
        node = api.createPackageDoc(text, packageId)

        return node


    def storeApi(self, include, apiPath, variantSet, jobConf):
        self._console.info("Generating API data...")
        self._console.indent()

        docTree = tree.Node("doctree")
        docTree.set("fullName", "")
        docTree.set("name", "")
        docTree.set("packageName", "")
        length = len(include)

        self._console.info("Loading class docs...", False)
        self._console.indent()

        packages = []
        AttachMap = {}
        hasErrors = False
        for pos, fileId in enumerate(include):
            self._console.progress(pos+1, length)
            fileApi, attachMap = self.getApi(fileId, variantSet)
            if fileApi == None:
                hasErrors = True

            # Only continue merging if there were no errors
            if not hasErrors:
                # update AttachMap
                for cls in attachMap: # 'qx.Class', 'qx.core.Object', 'q', ...
                    if cls not in AttachMap:
                        AttachMap[cls] = attachMap[cls]
                    else:
                        for section in attachMap[cls]:  # 'statics', 'members'
                            if section not in AttachMap[cls]:
                                AttachMap[cls][section] = attachMap[cls][section]
                            else:
                                for method in attachMap[cls][section]:  # 'define', 'showToolTip', ...
                                    if method not in AttachMap[cls][section]:
                                        AttachMap[cls][section][method] = attachMap[cls][section][method]
                                    else:
                                        self._console.warn("Multiple @attach for same target '%s::%s#%s'." % (cls, section, method))

                self._mergeApiNodes(docTree, fileApi)
                pkgId = self._classesObj[fileId].package
                # make sure all parent packages are included
                nsparts = pkgId.split('.')
                for i in range(len(nsparts)+1):
                    parentPkg = ".".join(nsparts[0:i])
                    if not parentPkg in packages:
                        packages.append(parentPkg)

        self._console.outdent()

        if hasErrors:
            self._console.error("Found erroneous API information. Please see above. Stopping!")
            return

        self._console.info("Loading package docs...")
        self._console.indent()

        packages.sort()
        for pkgId in packages:
            self._mergeApiNodes(docTree, self.getPackageApi(pkgId))

        self._console.outdent()

        self._console.info("Connecting classes...  ", feed=False)
        api.connectPackage(docTree, docTree)
        self._console.dotclear()

        self._console.info("Generating search index...")
        index = self.docTreeToSearchIndex(docTree, "", "", "")

        if "verify" in jobConf:
            if "links" in jobConf["verify"]:
                api.verifyLinks(docTree, index)
            if "types" in jobConf["verify"]:
                api.verifyTypes(docTree, index)

        if "warnings" in jobConf and "output" in jobConf["warnings"]:
            api.logErrors(docTree, jobConf["warnings"]["output"])

        if "verify" in jobConf:
            if "statistics" in jobConf["verify"]:
                api.verifyDocPercentage(docTree)

        self._console.info("Saving data...", False)
        self._console.indent()

        packageData = api.getPackageData(docTree)
        packageJson = json.dumps(packageData)
        filetool.save(os.path.join(apiPath, "apidata.json"), packageJson)

        # apply the @attach information
        for classData in api.classNodeIterator(docTree):
            className = classData.get("fullName")
            if className in AttachMap:
                self._applyAttachInfo(className, classData, AttachMap[className])

        # write per-class .json to disk
        length = 0
        for classData in api.classNodeIterator(docTree):
            length += 1

        links = []

        pos = 0
        for classData in api.classNodeIterator(docTree):
            pos += 1
            self._console.progress(pos, length)
            nodeData = tree.getNodeData(classData)
            nodeJson = json.dumps(nodeData)
            className = classData.get("fullName")
            fileName = os.path.join(apiPath, className + ".json")
            filetool.save(fileName, nodeJson)

            sitemap = False
            if "sitemap" in jobConf:
                sitemap = jobConf["sitemap"]
                if "link-uri" in sitemap:
                    links.append(sitemap["link-uri"] % className)

            #import pdb; pdb.set_trace()
            #for type in ["method", "method-static", "event", "property", "constant"]:
            #  for item in classData.getAllChildrenOfType(type):
            #      itemName = className + "~" + item.attributes["name"]
            #      link = linkPrefix + itemName

        self._console.outdent()

        # write apiindex.json
        self._console.info("Saving index...")
        indexContent = json.dumps(index, separators=(', ', ':'), sort_keys=True)  # compact encoding
        filetool.save(os.path.join(apiPath, "apiindex.json"), indexContent)

        # save sitemap
        if sitemap and len(links) > 0:
            self._console.info("Saving XML sitemap...")
            sitemapData = self.getSitemap(links)
            if "file" in sitemap:
                sitemapFile = sitemap["file"]
            else:
                sitemapFile = os.path.join(apiPath, "sitemap.xml")
            filetool.save(sitemapFile, sitemapData)

        self._console.outdent()
        self._console.info("Done")



    def _mergeApiNodes(self, target, source):
        if not target or not source:
            return

        if source.hasAttributes():
            attr = source.attributes
            for key in attr:
                # Special handling for attributes which stores a list (this is BTW quite ugly)
                if key in ["childClasses", "includer", "mixins", "implementations"] and target.get(key, False) != False:
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



    @staticmethod
    def docTreeToSearchIndex(tree, prefix = "", childPrefix = "  ", newline="\n"):
        types = []
        fullNames = []
        indexs = {}
        currClass = [0]

        def processNode(node,isLeaf):
            # filters
            if not node.hasAttributes():
                return 0  # continue traversal
            if node.type in ['state', 'param', 'see']:  # skip those currently
                return 0
            if "isCtor" in node.attributes and node.attributes["isCtor"]:
                return 0

            # construct a name string
            if 'fullName' in node.attributes:
                longestName = node.attributes['fullName']
            elif 'name' in node.attributes :
                longestName = node.attributes['name']
            else: # cannot handle unnamed entities
                return 0

            if longestName in fullNames:  # don't treat a node twice
                return 0

            # construct type string
            if node.type == "method":
                sfx = ""
                if 'access' in node.attributes:
                    acc = node.attributes['access']
                    if acc == "public":
                        sfx = "_pub"
                    elif acc == 'protected':
                        sfx = '_prot'
                    elif acc == 'private':
                        sfx = '_priv'
                    elif acc == 'internal':
                        sfx = '_intl'
                    else:
                        sfx = '_pub'  # there seem to be methods with weird access attribs
                else:
                    sfx = "_pub"  # force unqualified to public
                n_type = node.type + sfx
            elif node.type == "property":
                sfx = "_pub"
                n_type = node.type + sfx
            else:
                n_type = node.type

            # add type?
            if n_type not in types:
                types.append(n_type)
            tyx = types.index(n_type)

            if node.type in ['class','interface','package','mixin']:
                # add to fullNames - assuming uniqueness
                fullNames.append(longestName)
                fnx = fullNames.index(longestName)
                # commemorate current container
                currClass[0] = fnx
            else:  # must be a class feature
                longestName = '#' + longestName
                fnx = currClass[0]

            # maintain index
            if longestName in indexs:
                indexs[longestName].append([tyx, fnx])
            else:
                indexs[longestName]=[[tyx, fnx]]

            return 0

        tree.nodeTreeMap(processNode)

        index = { "__types__" : types,
                  "__fullNames__" : fullNames,
                  "__index__" : indexs }

        return index

    ##
    # Apply collected @attach info to a specific class doc
    #
    def _applyAttachInfo(self, className, classDoc, classAttachInfo):
        node_types = {"statics" : "methods-static", "members" : "methods"}

        ##
        # get or create a section node
        def get_section_node(classDoc, section):
            section_node = None
            for node in api.docTreeIterator(classDoc, node_types[section]):
                section_node = node  # first should be only
                break
            if not section_node:
                section_node = tree.Node(node_types[section])
                classDoc.addChild(section_node)
            return section_node


        def has_method(section_node, method):
            for method in api.methodNodeIterator(section_node):
                if method.get("name") == method_name:
                    return True
            return False

        def add_meth_doc(methDoc, section_node):
            section_node.addChild(methDoc)

        # -----------------------------------------------------------------

        for section in ('statics', 'members'):
            if not classAttachInfo[section]:
                continue
            section_node = get_section_node(classDoc, section)
            for method_name in classAttachInfo[section]:
                if has_method(section_node, method_name):
                    self._console.warn("Attempt to attach already existing method '%s::%s#%s'" % (className, section, method_name))
                else:
                    add_meth_doc(classAttachInfo[section][method_name], section_node)


    def getSitemap(self, links):
        sitemapTemplate = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  %s
</urlset>
"""

        urlTemplate = """  <url>
    <loc>%s</loc>
  </url>"""

        for i, link in enumerate(links):
            links[i] = urlTemplate %link

        return sitemapTemplate %"\n".join(links)



def runApiData(jobconf, configObj, script, docs):
    apiPath = jobconf.get("api/path")
    if not apiPath:
        return

    console = Context.console
    cache = Context.cache
    apiPath   = configObj.absPath(apiPath)
    apiLoader = ApiLoader(script.classesAll, docs, cache, console, jobconf)

    classList = jobconf.get("let/ARGS", [])
    if not classList:
        classList = script.classes

    apiLoader.storeApi(classList,
                             apiPath,
                             script.variants,
                             jobconf.get("api", []))

    return


