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
    #_handleI18N()

    return


def _handleCode(script):
    filetool.directory("./provider/code")
    for clazz in script.classes:
        classId = clazz.replace(".","/") + ".js"
        filetool.directory("provider/code/"+os.path.dirname(classId))
        shutil.copy("source/class/"+classId, "provider/code/"+classId)
    return

def _handleResources(script, generator):
    def createResourceInfo(res, resval):
        resinfo = [ { "target": "resource", "data": { res : resval }} ]
        filetool.save("provider/data/resource/" + res + ".json", json.dumpsCode(resinfo))
        return

    def copyResource(res):
        filetool.directory("provider/resource/"+os.path.dirname(res))
        shutil.copy("source/resource/"+res, "provider/resource/"+res)
        return

    # ----------------------------------------------------------------------
    filetool.directory("./provider/data/resource")
    filetool.directory("./provider/resource")
    
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


def _handleI18N():
    filetool.directory("./provider/data/translation")
    for lang in locales:
        filename = "i18n-" + lang
        filemap  = {}
        for key in translations[lang]:
            filemap[key] = [ { "target" : "i18n", "data" : { key : translations[lang][key] }} ]
        # add: CLDR data!?

        filetool.save("provider/data/translation/"+filename, json.dumpsCode(filemap))
    return
