#!/usr/bin/env python
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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import os, sys, re, types
from ecmascript.frontend import treeutil

def patch(tree, id, feature_names):
    
    # get class map
    qxDefine = treeutil.findQxDefine(tree)
    classMap = treeutil.getClassMap(qxDefine)
    # go through features in 'members' and 'statics'
    for section in ("statics", "members"):
        if section in classMap:
            for key, node in classMap[section].items():
                # skip registered keys
                if key in feature_names:
                    continue
                # skip non-function attribs
                meth = None
                if node.type == 'function':
                    meth = node
                else:
                    meth = treeutil.selectNode(node, "function")
                if not meth:
                    continue
                # prune
                else:
                    parent = node.parent
                    assert parent.type == "keyvalue"
                    #print "pruning: %s#%s" % (id, key)
                    parent.parent.removeChild(parent)  # remove the entire key from the map

