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

global inclregexps, exclregexps

def runProvider(script, generator):
    global inclregexps, exclregexps
    inclregexps = context.jobconf.get("provider/include", ["*"])
    exclregexps = context.jobconf.get("provider/exclude", [])
    inclregexps = map(textutil.toRegExp, inclregexps)
    exclregexps = map(textutil.toRegExp, exclregexps)
    # copy class files
    _handleCode(script, generator)
    # generate resource info
    _handleResources(script, generator)
    # generate translation and CLDR files
    _handleI18N(script, generator)

    return



##
# check resId (classId, ...) against include, exclude expressions
def passesOutputfilter(resId, ):
    # must match some include expressions
    if not filter(None, [x.search(resId) for x in inclregexps]):  # [None, None, _sre.match, None, _sre.match, ...]
        return False
    # must not match any exclude expressions
    if filter(None, [x.search(resId) for x in exclregexps]):
        return False
    return True

libraries = {}

def _handleCode(script, generator):

    approot = context.jobconf.get("provider/app-root", "./provider")
    filetool.directory(approot + "/code")

    for clazz in script.classesObj:
        # register library (for _handleResources)
        if clazz.library['namespace'] not in libraries:
            libraries[clazz.library['namespace']] = clazz.library

        if passesOutputfilter(clazz.id, ):
            classAId   = clazz.id.replace(".","/") + ".js"
            sourcepath = os.path.join(clazz.library['path'], clazz.library['class'], classAId) # TODO: this should be a class method
            targetpath = approot + "/code/" + classAId
            filetool.directory(os.path.dirname(targetpath))
            shutil.copy(sourcepath, targetpath)
    return

def _handleResources(script, generator):

    def createResourceInfo(res, resval):
        resinfo = [ { "target": "resource", "data": { res : resval }} ]
        #filetool.save(approot+"/data/resource/" + res + ".json", json.dumpsCode(resinfo))
        return resinfo

    def copyResource(res, library):
        sourcepath = os.path.join(library['path'], library['resource'], res)
        targetpath = approot + "/resource/" + res
        filetool.directory(os.path.dirname(targetpath))
        shutil.copy(sourcepath, targetpath)
        return

    # ----------------------------------------------------------------------
    approot = context.jobconf.get("provider/app-root", "./provider")
    filetool.directory(approot+"/data")
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
    
    resinfos = {}
    for res in allresources:
        # fake a classId-like resourceId ("a.b.c"), for filter matching
        resId = os.path.splitext(res)[0]
        resId = resId.replace("/", ".")
        if passesOutputfilter(resId):
            resinfos[res] = createResourceInfo(res, allresources[res])
            # extract library name space
            if isinstance(allresources[res], types.ListType): # it's an image = [14, 14, u'png', u'qx' [, u'qx/decoration/Modern/checkradio-combined.png', 0, 0]]
                library_ns = allresources[res][3]
            else: # html page etc. = "qx"
                library_ns = allresources[res]
            library    = libraries[library_ns]
            copyResource(res, library)

    filetool.save(approot+"/data/resource/resources.json", json.dumpsCode(resinfos))

    return


def _handleI18N(script, generator):
    approot = context.jobconf.get("provider/app-root", "./provider")

    # get class projection
    class_list = []
    needs_cldr = False
    for classObj in script.classesObj:
        if passesOutputfilter(classObj.id):
            class_list.append(classObj.id)
            if not needs_cldr and classObj.getMeta('cldr'):
                needs_cldr = True

    # get i18n data
    trans_dat = generator._locale.getTranslationData_1(class_list, script.variants, script.locales, 
                                                       addUntranslatedEntries=True)
    loc_dat   = None
    if needs_cldr:
        loc_dat   = generator._locale.getLocalizationData(class_list, script.locales)


    # write translation and cldr files
    for lang in trans_dat:
        filename = "i18n-" + lang

        # translations
        transmap  = {}
        translations = trans_dat[lang]
        for key in translations:
            if translations[key]:
                transmap[key] = [ { "target" : "i18n", "data" : { key : translations[key] }} ]
            else:
                transmap[key] = [ ]
        filetool.save(approot+"/data/translation/"+filename+".json", json.dumpsCode(transmap))
        
        # cldr
        localemap = {}
        if loc_dat:
            localekeys = loc_dat[lang]
            for key in localekeys:
                if localekeys[key]:
                    localemap[key] = [ { "target" : "i18n", "data" : { key : localekeys[key] }} ]
                else:
                    localemap[key] = [ ]
            filetool.save(approot+"/data/locale/"+filename+".json", json.dumpsCode(localemap))

    return
