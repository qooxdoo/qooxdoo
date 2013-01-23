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
    """ Validates Manifest and prints to stdOut.

    :param jobconf: generator.config.Job.Job
    :param confObj: generator.config.Config.Config
    """

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
            console.warn(error["msg"] + " in '%s' (JSONPath)" % __convertToJSONPath(error["path"]))
    else:
        console.log("%s validates successful against used JSON Schema." % mnfst.path)


def __convertToJSONPath(path):
    """ Converts ["info", "authors", 0, "name"] into $.info.authors[0].name (JSONPath).

    :param path: list
    :rtype: string (JSONPath)

    .. seealso:: http://goessner.net/articles/JsonPath/
    """
    jsonPath = ""

    for i, elem in enumerate(path):
        if isinstance(elem, int):
            path[i-1] = path[i-1] + "[" + str(path[i])  + "]"
            del path[i]
    jsonPath = "$." + ".".join(path)
    return jsonPath
