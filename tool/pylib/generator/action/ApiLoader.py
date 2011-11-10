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
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
from ecmascript.frontend import tree



class ApiLoader(object):
    def __init__(self, classesObj, docs, cache, console, ):
        self._classesObj = classesObj
        self._docs = docs
        self._cache = cache
        self._console = console


    def getApi(self, fileId, variantSet):
        filePath = self._classesObj[fileId].path

        cacheId = "api-%s" % filePath
        data, _ = self._cache.read(cacheId, filePath)
        if data != None:
            return data

        self._console.debug("Extracting API data: %s..." % fileId)

        self._console.indent()
        #tree = self._treeLoader.getTree(fileId)
        tree = self._classesObj[fileId].tree()
        (data, hasError) = api.createDoc(tree)
        self._console.outdent()
        
        if hasError:
            self._console.error("Error in API data of class: %s" % fileId)
            data = None
        
        self._cache.write(cacheId, data)
        return data


    def getPackageApi(self, packageId):
        if not packageId in self._docs:
            self._console.debug("Missing package docs: %s" % packageId)
            return None
            
        packageEntry = self._docs[packageId]
        
        text = filetool.read(packageEntry["path"])
        node = api.createPackageDoc(text, packageId)
        
        return node
        

    def storeApi(self, include, apiPath, variantSet):
        self._console.info("Generating API data...")
        self._console.indent()

        docTree = tree.Node("doctree")
        length = len(include)

        self._console.info("Loading class docs...", False)
        self._console.indent()

        packages = []
        hasErrors = False
        for pos, fileId in enumerate(include):
            self._console.progress(pos+1, length)
            fileApi = self.getApi(fileId, variantSet)
            if fileApi == None:
                hasErrors = True
            
            # Only continue merging if there were no errors
            if not hasErrors:
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

        self._console.info("Connecting classes...")
        api.connectPackage(docTree, docTree)

        self._console.info("Generating search index...")
        indexContent = self.docTreeToSearchIndex(docTree, "", "", "")
        
        self._console.info("Saving data...", False)
        self._console.indent()

        packageData = api.getPackageData(docTree)
        packageJson = json.dumps(packageData)
        filetool.save(os.path.join(apiPath, "apidata.json"), packageJson)
        
        length = 0
        for classData in api.classNodeIterator(docTree):
            length += 1
            
        pos = 0
        for classData in api.classNodeIterator(docTree):
            pos += 1
            self._console.progress(pos, length)
            nodeData = tree.getNodeData(classData)
            nodeJson = json.dumps(nodeData)
            fileName = os.path.join(apiPath, classData.get("fullName") + ".json")
            filetool.save(fileName, nodeJson)
            
        self._console.outdent()
            
        self._console.info("Saving index...")
        filetool.save(os.path.join(apiPath, "apiindex.json"), indexContent)            

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
        asString = json.dumps(index, separators=(',',':'), sort_keys=True) # compact encoding

        return asString



    def verifyLinks(self, include, apiPath):
        self._console.info("Verifying links...")
        import re
        self._linkRegExp = re.compile("\{\s*@link\s*([\w#-_\.]*)[\W\w\d\s]*?\}")
        
        self._console.indent()
        self._console.info("Loading class docs...")
        targets = []
        links = []
        mixinUsage = {}
        
        # Open APIdata files and get the needed information
        dirwalker   = os.walk(apiPath)
        files = []
        for (path, dirlist, filelist) in dirwalker:
            for file in filelist:
                if file[-5:] == ".json" and not "apiindex" in file:
                    files.append(os.path.join(path,file))
        
        for file in files:
            classDocFile = open(file)
            doc = json.load(classDocFile)

            try:
                fullName = doc["attributes"]["fullName"]
            except KeyError:
                fullName = "doctree"
            (classTargets,classLinks,classMixinUsage) = self._getDocNodes(doc, fullName)
            targets += classTargets
            links += classLinks
            mixinUsage.update(classMixinUsage)
        
        # Get mixin members and add them to the classes that use them
        newTargets = []
        for clazz in mixinUsage:
            mixinList = mixinUsage[clazz]
            for mixin in mixinList:
                for target in targets:
                    if mixin + "#" in target:
                        memberName = target[target.find("#"):]
                        newTargets.append(clazz + memberName)
        targets += newTargets            
        
        self._console.outdent()
        self._console.info("Checking links...")
        self._console.indent()  
        
        self._checkLinks(links,targets)
        
        self._console.outdent()
        self._console.info("Finished checking links")
        

    def _getDocNodes(self,node, packageName = "", className = "", itemName = "", paramName = "", parentNodeType = ""):
        targets = []
        links = []
        mixinUsage = {}
        
        nodeType = node["type"]
          
        if nodeType == "package":
            packageName = node["attributes"]["fullName"]
            if packageName not in targets:
                targets.append(packageName)
        
        elif nodeType == "class":
            packageName = node["attributes"]["packageName"]
            className = node["attributes"]["name"]            
            fullName = "%s.%s" %(packageName,className)
            targets.append(fullName)
            if packageName not in targets:
                targets.append(packageName)
            
            if "mixins" in node["attributes"]:
                mixinUsage[fullName] = node["attributes"]["mixins"].split(",")
        
        elif nodeType in ["event", "property", "method", "constant"]:
            itemName = node["attributes"]["name"]        
            targets.append("%s.%s#%s" %(packageName,className,itemName))
        
        elif nodeType in ["param"]:
            paramName = node["attributes"]["name"]
            pass
          
        elif nodeType == "desc":
            if "@link" in node["attributes"]["text"]:
                match = self._linkRegExp.findall(node["attributes"]["text"])
                if match:
                    internalLinks = []
                    for link in match:
                        if not "<a" in link:
                            internalLinks.append(link)
                    
                    if len(internalLinks) > 0:
                      link = {
                          "nodeType" : parentNodeType,
                          "packageName" : packageName,
                          "className" : className,
                          "itemName" : itemName,
                          "paramName" : paramName,
                          "links" : internalLinks
                      }
      
                      links.append(link)
        
        if "children" in node:
            for child in node["children"]:
                (childTargets,childLinks,childMixinUsage) = self._getDocNodes(child, packageName, className, itemName, paramName, nodeType)
                targets += childTargets
                links += childLinks
                mixinUsage.update(childMixinUsage)
        
        return(targets,links,mixinUsage)


    def _checkLinks(self,links,targets):    
        namespaceReg = re.compile("(.*?)\.[\w\d_\-]+$")
        
        for link in links:
            for ref in link["links"]:              
                # Remove parentheses from method references
                if ref[-2:] == "()":
                    ref = ref[:-2]
                # Get the target's full name for members (starting with '#')
                if ref[0] == "#":
                    ref = "%s.%s%s" %(link["packageName"],link["className"],ref)
                
                # Class references with no namespace point to the current namespace
                elif not "." in ref:
                    ref = link["packageName"] + "." + ref                     
                            
                if ref not in targets:
                    nodeType = link["nodeType"]
                    if nodeType == "package":
                        #TODO: Fix this
                        linkNode = link["packageName"]
                    elif nodeType == "class":
                        linkNode = "%s.%s" %(link["packageName"],link["className"]) 
                    elif nodeType == "param":
                        if link["itemName"] == "ctor":
                            nodeType = ""
                            linkNode = "the constructor parameter %s of %s.%s" %(link["paramName"],link["packageName"],link["className"])
                        else:
                            nodeType = "parameter"
                            linkNode = "%s.%s#%s %s" %(link["packageName"],link["className"],link["itemName"],link["paramName"])
                    elif link["itemName"] == "ctor":
                        nodeType = "constructor"
                        linkNode = "%s.%s" %(link["packageName"],link["className"]) 
                    else:
                        linkNode = "%s.%s#%s" %(link["packageName"],link["className"],link["itemName"])
                    
                    self._console.info("The %s documentation for %s contains a broken link to %s" %(nodeType,linkNode,ref))
            
