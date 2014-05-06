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

import sys, re

from copy import deepcopy

from generator import Context
from generator.config.Manifest import Manifest

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
        if libs:
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
def validateConfig(confObj, schema):
    confDict = deepcopy(confObj._rawdata)
    global_let = confObj.get("let")
    jobname = ""

    # check only provided jobname (cli arg)
    if "ARGS" in global_let and len(global_let["ARGS"]) == 1:
        jobname = global_let["ARGS"][0]

        if "jobs" in confDict and jobname in confDict["jobs"]:
            jobToCheck = confDict["jobs"][jobname].copy()
            confDict["jobs"] = {}
            confDict["jobs"][jobname] = jobToCheck
        else:
            Context.console.warn("Given job '" +jobname+ "' doesn't exist. Aborting.")
            sys.exit(1)
    # check whole config (and included configs)
    else:
        # process custom includes recursive
        for extConf in confObj._includedConfigs:
            validateConfig(extConf, schema)

    errors = __validate(confDict, schema)
    __printResults(Context.console, errors, confObj._fname, jobname)

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
    # lazy import for earlier python2.6+ check
    from jsonschema.jsonschema import Draft4Validator

    # fail fast => check schema first / shouldn't raise errors in production
    Draft4Validator.check_schema(schema)

    errors = []
    validator = Draft4Validator(schema)

    for e in validator.iter_errors(dictToValidate):
        # hack to replace 'u' before fieldname *within* string
        e.message = e.message.replace("u'", "'")

        if __isUnexpandedMacrosError(e.message):
            continue

        errors.append({"msg": e.message, "path": e.path})

    return errors


##
# Originates error message from unexpanded macro
# (e.g. '${LOCALES}' is not of type array)?
#
# @param msg string
# @return boolean
#
def __isUnexpandedMacrosError(msg):
    return bool(re.search(r"^'\$\{[^}]+\}' is not (one of|of type).*", msg))


##
# Print results on stderr and exit if desired
#
# @param console generator.context.Console
# @param errors list
# @param validatedFileName string
# @param jobname string
# @param exitOnErrors boolean
#
def __printResults(console, errors, validatedFileName, jobname=""):
    if errors:
        console.warn("Errors found in " + validatedFileName+":")
        console.indent()
        for error in errors:
            console.warn(error["msg"] + " in '%s'." % __convertToJSONPointer(error["path"]))
        console.outdent()
    else:
        if jobname:
            console.log("Job '"+jobname+"' in %s successfully validated." % validatedFileName)
        else:
            console.log("%s successfully validated." % validatedFileName)


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
