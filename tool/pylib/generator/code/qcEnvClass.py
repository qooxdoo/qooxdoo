#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# A specialized class for qx.core.Environment
##

from generator.code.Class import Class
from ecmascript.frontend  import treeutil
from ecmascript.frontend.tree  import NodeAccessException
from ecmascript.frontend.treegenerator import PackerFlags as pp

class qcEnvClass(Class):

    def init_checksMap(self):
        self.checksMap = self.extractChecksMap()

    def extractChecksMap(self):
        tree = self.tree()
        checksMap = None
        for node in treeutil.nodeIterator(tree, ["keyvalue"]):
            if node.get("key", "") == "_checksMap":
                checksMap = node
                break
        assert checksMap
        assert checksMap.hasParentContext("keyvalue/value/map") # 'statics/_checksMap'
        checksMap = treeutil.selectNode(checksMap, "value/map")
        checksMap = treeutil.mapNodeToMap(checksMap)
        # stringify map values
        for key in checksMap:
            try:
                checksMap[key] = checksMap[key].children[0].get("value")
            except NodeAccessException:
                raise ValueError(("Error extracting checks map from %s: " +
                                  "expected string value for key '%s' (found %s)") %
                                  (self.id, key, checksMap[key].children[0].type))
        return checksMap

    def init_envKeyProviderIndex(self, classesAll):
        self.envKeyProviderIndex = self.createEnvKeyProviderIndex(classesAll)

    def createEnvKeyProviderIndex(self, classesAll):
        envProviders = {}
        providingEnvClasses = [className for className in classesAll.keys() if className.startswith("qx.bom.client")]
        for className in providingEnvClasses:
            tree = classesAll[className].tree()
            for callnode in list(treeutil.nodeIterator(tree, ['call'])):
                if callnode.toJS(pp).startswith("qx.core.Environment.add"):
                    envKey = treeutil.selectNode(callnode, "arguments/constant/@value")
                    envProviders[envKey] = className

        return envProviders

    def classNameFromEnvKeyByIndex(self, key):
        result = ''
        if key in self.envKeyProviderIndex:
            result = self.envKeyProviderIndex[key]
        return result

    ##
    # Looks up the environment key in a map that yields the full class plus
    # method name as a string.
    def classNameFromEnvKey(self, key):
        result = '',''
        if key in self.checksMap:
            implementation = self.checksMap[key]
            fullname, methname = implementation.rsplit(".", 1)
            result = fullname, methname
        return result



