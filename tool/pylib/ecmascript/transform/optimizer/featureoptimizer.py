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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import os, sys, re, types
from misc import json
from ecmascript.frontend import treeutil, treegenerator

cacheId = "features"  # use a site-wide privates db

def debug(features):
    print
    print json.dumps(features)
    print

##
# Remove features (mainly methods) from a class
##

def patch(tree, classObj, featureMap):

    # change this to 'False' if you want logging instead of function removal
    prune_dont_log = True

    optimized_features = {}
    feature_names = featureMap[classObj.id]
    # get class map
    qxDefine = treeutil.findQxDefine(tree)
    classMap = treeutil.getClassMap(qxDefine)

    # go through features in 'members' and 'statics'
    for section in ("statics", "members"):
        if section in classMap:
            for feature, node in classMap[section].items():
                # skip registered and used keys
                if feature in feature_names and feature_names[feature].hasref():
                    continue
                else:
                    parent = node.parent
                    assert parent.type == "keyvalue"

                    # print "static optimizing: %s#%s" % (classObj.id, feature)
                    if classObj.id not in optimized_features:
                        optimized_features[classObj.id] = []
                    optimized_features[classObj.id].append(feature);

                    if prune_dont_log:
                        # remove sub tree
                        parent.parent.removeChild(parent)  # remove the entire feature from the map
                        # remove from featureMap
                        if feature in feature_names:
                            del featureMap[classObj.id][feature]
                        # decrease the ref counts of the contained dependees
                        decrementFromCode(classObj, node, featureMap)
                    else:
                        # OR: only add runtime logging to functions
                        block = treeutil.selectNode(node, 'function/body/block/statements')
                        if block:
                            LogStmt = treegenerator.parse("console.warn('Static optimization would have removed: " + classObj.id + '#' + feature + "');")
                            block.addChild(LogStmt, 0)

    return optimized_features

##
# Use this if a syntax tree is being removed from the build, to decrement its
# dependencies.
#
def decrementFromCode(classObj, node, featureMap):
    deps = []
    classObj._analyzeClassDepsNode(node, deps, inLoadContext=False)
        # TODO: this is expensive (re-calculating deps)!
        #   and it doesn't honor #ignores, so might decrease ref count of ignored
        #   items! (which could lead to inconsistencies)
        #   also, i'm calling a protected method outside the class hierarchy.
    for depItem in deps:
        if depItem.name in featureMap and depItem.attribute in featureMap[depItem.name]:
            depFeature = featureMap[depItem.name][depItem.attribute]
            res = depFeature.decref(depItem.requestor, depItem.line)  # decrease reference count
            if not res:
                #print "Warning could not remove '%s:%s' from '%s:%s'" % (depItem.requestor, depItem.line, depItem.name, depItem.attribute)
                pass
