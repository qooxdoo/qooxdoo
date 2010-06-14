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

import re, os, sys, zlib, optparse, types, string, glob, shutil
import functools, codecs, operator

from misc import filetool, textutil, util, Path, PathType, json, copytool
from misc.PathType import PathType
from generator import Context as context


def runProvider(script, generator):
    # copy class files
    _handleCode(script)
    # generate resource info
    _handleResources(script, generator)
    # generate translation files
    _handleI18N(script, generator)

    return


def _handleCode(script):
    approot = context.jobconf.get("provider/app-root", "./provider")
    filetool.directory(approot + "/code")
    for clazz in script.classes:
        classId = clazz.replace(".","/") + ".js"
        filetool.directory(approot+"/code/"+os.path.dirname(classId))
        shutil.copy("source/class/"+classId, approot+"/code/"+classId)
    return

def _handleResources(script, generator):

    def createResourceInfo(res, resval):
        resinfo = [ { "target": "resource", "data": { res : resval }} ]
        filetool.save(approot+"/data/resource/" + res + ".json", json.dumpsCode(resinfo))
        return

    def copyResource(res):
        filetool.directory(approot+"/resource/"+os.path.dirname(res))
        shutil.copy("source/resource/"+res, approot+"/resource/"+res)
        return

    # ----------------------------------------------------------------------
    approot = context.jobconf.get("provider/app-root", "./provider")
    filetool.directory(approot+"/data/resource")
    filetool.directory(approot+"/resource")
    
    # quick copy of runLogResources, for fast results
    packages   = script.packagesSortedSimple()
    parts      = script.parts
    variants   = script.variants

    allresources = {}
    # get resource info
    # -- the next call is fake, just to populate package.data.resources!
    _ = generator._codeGenerator.generateResourceInfoCode(script, generator._settings, context.jobconf.get("library",[]))
    for packageId, package in enumerate(packages):
        allresources.update(package.data.resources)
    
    for res in allresources:
        createResourceInfo(res, allresources[res])
        copyResource(res)
    return


def _handleI18N(script, generator):
    approot = context.jobconf.get("provider/app-root", "./provider")
    filetool.directory(approot+"/data/translation")
    translationMaps = generator._codeGenerator.getTranslationMaps(script.packages, script.variants, script.locales)

    data_by_lang = {}

    for trans_dat, loc_dat in translationMaps:  # (trans_dat, loc_dat) is per package
        for lang in trans_dat:  # key = "en", "fr", ...
            if lang not in data_by_lang:
                data_by_lang[lang] = {}
            data_by_lang[lang].update(trans_dat[lang])
        for lang in loc_dat:  # key = "en", "fr", ...
            if lang not in data_by_lang:
                data_by_lang[lang] = {}
            data_by_lang[lang].update(loc_dat[lang])  # we merge .po and cldr data in one map

    for lang in data_by_lang:
        filename = "i18n-" + lang
        filemap  = {}
        for key in data_by_lang[lang]:
            filemap[key] = [ { "target" : "i18n", "data" : { key : data_by_lang[lang][key] }} ]
        # add: CLDR data!?

        filetool.save(approot+"/data/translation/"+filename+".json", json.dumpsCode(filemap))

    return
