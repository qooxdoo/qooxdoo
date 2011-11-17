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

from generator.code.Class import Class, CompileOptions
from generator.code.Script import Script
from ecmascript.frontend  import treegenerator, treeutil
from ecmascript.frontend.tree  import NodeAccessException
from ecmascript.transform.optimizer import variantoptimizer
from misc                 import util

class qcEnvClass(Class):

    def clearTreeCache(self, variantSet, treegen=treegenerator):
        relevantVariants = self.projectClassVariantsToCurrent(self.classVariants(), variantSet)
        cacheId = "tree%s-%s-%s" % (treegen.tag, self.path, util.toString(relevantVariants))
        self.context['cache'].remove(cacheId)
        return


    def optimizeTree(self, variantSet, scriptClasses, treegen=treegenerator):
        relevantVariants = self.projectClassVariantsToCurrent(self.classVariants(), variantSet)
        cacheId = "tree%s-%s-%s" % (treegen.tag, self.path, util.toString(relevantVariants))
        compOpts = CompileOptions(optimize=["variants"], variants=variantSet)
        compOpts.allClassVariants = scriptClasses

        tree = self.optimizeEnvironmentClass(compOpts)
        ## this is for the side-effect of leaving a modified tree for qx.core.Environmet
        ## in the cache!
        self.context['cache'].write(cacheId, tree, memory=True, writeToFile=False)
        ## this is for the side-effect of re-calculating the transitive dependencies
        ## of qx.core.Environment!
        _ = self.dependencies(variantSet, force=True)
        return

    def optimizeEnvironmentClass(self, compOptions):
        tree = self.tree()
        ## has to come before string optimization, or the "qx.debug", etc. args are gone
        tree = variantoptimizer.processEnvironmentClass(tree, compOptions.allClassVariants)
        if compOptions.optimize:
            tree = self.optimize(tree, compOptions.optimize)
        return tree

    def extractChecksMap(self):
        tree = self.tree()
        checksMap = None
        for node in treeutil.nodeIterator(tree, "keyvalue"):
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

