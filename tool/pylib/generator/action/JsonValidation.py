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
from generator.config.Job import Job
from generator.config.Manifest import Manifest
from jsonschema.jsonschema import Draft4Validator

# base.json let dict
baseJsonLetDefaults = {
    "API_EXCLUDE" : ["qx.test.*", "$${APPLICATION}.theme.*", "$${APPLICATION}.test.*", "$${APPLICATION}.simulation.*"],
    "ROOT" : ".",
    "QOOXDOO_PATH" : "../../..",
    "CACHE" : "${TMPDIR}/qx${QOOXDOO_VERSION}/cache",
    "CACHE_KEY" :
    {
      "compile" : "${CACHE}",
      "downloads" : "${CACHE}/downloads",
      "invalidate-on-tool-change" : True
    },
    "QXTHEME" : "qx.theme.Modern",
    "QXICONTHEME" : ["Tango"],
    "OPTIMIZE" : [
       "basecalls",
       "comments",
       "privates",
       "strings",
       "variables",
       "variants",
       "whitespace"
    ],
    "LOCALES" : [ "en" ],
    "APPLICATION_MAIN_CLASS" : "${APPLICATION}.Application",
    "ADD_NOCACHE_PARAM" : False,
    "COMPILE_WITH_LINT" : True,
    "SOURCE_PATH" : "${ROOT}/source",
    "BUILD_PATH" : "${ROOT}/build"
}

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
    confDict = deepcopy(confObj._rawdata)

    if "let" in confDict:
        baseJsonLetDefaults.update(confDict["let"])

    schema = confObj.getSchema(confObj.getJobsList())
    if not isRootConf:
        # don't require top level keys in included configs
        del schema["required"]

    # memorize jobs which need to be 'macro expanded' later on
    def collectJobsWithMacros(d, curJob="", jobsToExpand=set()):
        for k, v in d.iteritems():
            if (isinstance(v, unicode) or isinstance(v, str)) and "${" in v:
                jobsToExpand.add(re.sub(r'^/jobs/([^/]+)(/.*$|$)', r'\1', curJob))
            if isinstance(v, dict):
                if curJob == "" and k in ["let", "config-warnings", "export", "include", "name"]:
                    # ignore global keys cause mainly jobs are interesting
                    continue

                collectJobsWithMacros(d[k], curJob+"/"+k, jobsToExpand)
        return jobsToExpand

    # replace 'None' with schema data type to enable schema checking
    def replaceNoneWithEmptyString(d):
        for k, v in d.iteritems():
            if isinstance(v, dict):
                replaceNoneWithEmptyString(d[k])
            if v is None:
                d[k] = ""
        return d

    # flatten extends for schema check
    def flattenExtendValue(d):
        if "extend" in d:
            for i, extend in enumerate(d["extend"]):
                if not (isinstance(extend, unicode) or isinstance(extend, str)):
                    d["extend"][i] = extend.name
        return d

    # remove internal props to be as close as possible to flat file
    def removeInternalProps(d):
        d.pop("__resolved__", None)
        d.pop("__override__", None)
        d.pop("config-warnings", None)
        return d

    jobsWithMacros = collectJobsWithMacros(confDict)
    for jobName in jobsWithMacros:
        jobObj = Job(jobName, confDict["jobs"][jobName], Context.console, confObj)

        if "let" in jobObj._data:
            baseJsonLetDefaults.update(jobObj._data["let"])
            jobObj._data["let"] = baseJsonLetDefaults
        else:
            jobObj._data["let"] = baseJsonLetDefaults

        jobObj.includeGlobalDefaults()
        jobObj.includeSystemDefaults()
        jobObj.resolveExtend()
        jobObj.resolveMacros()

        expandedData = removeInternalProps(jobObj._data)
        expandedData = flattenExtendValue(expandedData)
        expandedData = replaceNoneWithEmptyString(expandedData)

        confDict["jobs"][jobName] = expandedData

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
