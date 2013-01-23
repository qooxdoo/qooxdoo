#!/usr/bin/env python
# -*- coding: utf-8 -*-
###########################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2013 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Richard Sternagel (rsternagel)
#
###########################################################################

from generator import Context
from generator.config.Manifest import Manifest

def validateManifest(jobconf, confObj):
    errors = []
    console = Context.console

    mnfst = None
    global_let = confObj.get("let")
    if "ARGS" in global_let and len(global_let["ARGS"]) == 1:
        mnfst = Manifest(global_let["ARGS"][0])
    else:
        mnfst = Manifest("Manifest.json")

    errors = mnfst.validateAgainst(Manifest.schema_v1_0())

    if errors:
        for error in errors:
            error["path"] = __convertToJSONPath(error["path"])
            console.warn(error["msg"] + " in '$.%s' (JSONPath)" % ".".join(error["path"]))
    else:
        console.log("%s validates successful against used JSON Schema." % mnfst.path)

def __convertToJSONPath(path):
    for i, elem in enumerate(path):
        if isinstance(elem, int):
            path[i-1] = path[i-1] + "[" + str(path[i])  + "]"
            del path[i]
    return path
