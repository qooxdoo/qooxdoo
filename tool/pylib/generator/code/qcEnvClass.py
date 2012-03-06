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

class qcEnvClass(Class):

    def extractChecksMap(self):
        tree = self.tree()
        checksMap = None
        for node in treeutil.nodeIterator(tree, "keyvalue"):
            if node.get("key", mandatory=False) == "_checksMap":
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

