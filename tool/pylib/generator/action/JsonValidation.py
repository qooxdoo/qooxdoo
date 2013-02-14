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

##
# Validates Manifest and prints to stdOut.
#
# @param jobconf generator.config.Job.Job
# @param confObj generator.config.Config.Config
#
def validateManifest(jobObj, confObj):
    errors = []
    console = Context.console

    manifests = []

    # detect manifest path(s) as cli arg, ...
    global_let = confObj.get("let")
    if "ARGS" in global_let and len(global_let["ARGS"]) == 1:
        manifests.append(Manifest(global_let["ARGS"][0]))
    else:
      # ... from base.json ...
      libs = jobObj.get("library")
      for lib in libs:
          manifests.append(Manifest(lib.manipath))

      # ... or default location.
      if not manifests:
          manifests.append(Manifest("Manifest.json"))

    for mnfst in manifests:
        errors = mnfst.validateAgainst(Manifest.schema_v1_0())

        if errors:
            console.warn("Errors found in " + mnfst.path)
            console.indent()
            for error in errors:
                console.warn(error["msg"] + " in '%s' (JSONPath)" % __convertToJSONPath(error["path"]))
            console.outdent()
        else:
            console.log("%s validates successful against used JSON Schema." % mnfst.path)


##
# Converts ["info", "authors", 0, "name"] into $.info.authors[0].name (JSONPath).
#
# @param path list
# @return string (JSONPath)
# @see http://goessner.net/articles/JsonPath/
#
def __convertToJSONPath(path):
    jsonPath = ""

    for i, elem in enumerate(path):
        if isinstance(elem, int):
            path[i-1] = path[i-1] + "[" + str(path[i])  + "]"
            del path[i]
    jsonPath = "$." + ".".join(path)
    return jsonPath
