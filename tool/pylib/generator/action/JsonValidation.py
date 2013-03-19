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

import sys

from generator import Context
from generator.config.Config import Config
from generator.config.Manifest import Manifest
from jsonschema.jsonschema import Draft4Validator


##
# Validates Manifest and prints to stdout/stderr.
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
        errors = __validate(mnfst._manifest, Manifest.schema_v1_0())
        __printResults(console, errors, mnfst.path)


##
# Validates 'config.json' and prints to stdout/stderr.
#
# @param confObj generator.config.Config.Config
# @param isRootConf boolean
#
def validateConfig(confObj, isRootConf=True):
    confDict = confObj._rawdata
    schema = confObj.getSchema(confObj.getJobsList())
    if not isRootConf:
        # don't require top level keys in included configs
        del schema["required"]

    # process custom includes recursive
    for extConf in confObj._includedConfigs:
        extConfPath = extConf._fname

        # makes no sense to check qx base configs every time
        # maybe introduce separate dedicated job for this
        if extConfPath.endswith("base.json") or extConfPath.endswith("application.json"):
           continue

        validateConfig(extConf, isRootConf=False)

    errors = __validate(confDict, schema)
    __printResults(Context.console, errors, confObj._fname, bool(errors))


##
# Validates given dict against JSON Schema dict.
#
# @see http://json-schema.org/
# @see http://tools.ietf.org/html/draft-zyp-json-schema-04
# @see https://github.com/json-schema/json-schema
#
# @param dictToValidate
# @param schema
# @return errors list
#
def __validate(dictToValidate, schema):
    # fail fast => check schema first / shouldn't raise errors in production
    Draft4Validator.check_schema(schema)

    errors = []
    validator = Draft4Validator(schema)

    for e in validator.iter_errors(dictToValidate):
        # hack to replace 'u' before fieldname *within* string
        e.message = e.message.replace("u'", "'")
        errors.append({"msg": e.message, "path": e.path})

    return errors


##
# Print results on stderr and exit if desired

# @param console generator.context.Console
# @param errors list
# @param validatedFileName string
# @param exitOnErrors boolean
#
def __printResults(console, errors, validatedFileName, exitOnErrors=False):
    if errors:
        console.warn("Errors found in " + validatedFileName)
        console.indent()
        for error in errors:
            console.warn(error["msg"] + " in '%s' (JSON Pointer)" % __convertToJSONPointer(error["path"]))
        console.outdent()
    else:
        console.log("%s validates successful against JSON Schema." % validatedFileName)

    if exitOnErrors:
        sys.exit(1)


##
# Converts ["info", "authors", 0] into '/info/authors/0' (JSON Pointer).
#
# @see http://tools.ietf.org/html/draft-ietf-appsawg-json-pointer-09
#
# @param path list
# @return string (JSON Pointer)
def __convertToJSONPointer(path):
    jsonPointer = ""

    for i, item in enumerate(path):
        if isinstance(item, int):
            path[i] = str(path[i])
    jsonPointer = "/" + "/".join(path)
    return jsonPointer
