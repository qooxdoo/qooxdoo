#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2012 1&1 Internet AG, Germany, http://www.1und1.de
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

from misc        import filetool, textutil, util, json, copytool
from generator   import Context as context
from generator.config.Config    import ConfigurationError
from generator.code.Class       import CompileOptions
from generator.code.Script      import Script

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
    _handleResources(script, generator, filtered=False)
    # generate translation and CLDR files
    _handleI18N(script, generator)
    # writing the dependencies.json is a runLogDependencies job

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
    builds  = context.jobconf.get("provider/compile",  ["source"])

    for buildtype in builds:
        context.console.info("Processing %s version of classes:\t" % buildtype, False)
        if buildtype == "source":
            targetdir = approot + "/code"
            filetool.directory(targetdir)
        elif buildtype == "build":
            targetdir = approot + "/code-build"
            filetool.directory(targetdir)
            optimize = context.jobconf.get("compile-options/code/optimize", ["variables","basecalls","strings"])
            variantsettings = context.jobconf.get("variants", {})
            variantSets = util.computeCombinations(variantsettings)
        else:
            raise ConfigurationError("Unknown provider compile type '%s'" % buildtype)

        numClasses = len(script.classesObj)
        for num, clazz in enumerate(script.classesObj):
            context.console.progress(num+1, numClasses)
            # register library (for _handleResources)
            if clazz.library.namespace not in libraries:
                libraries[clazz.library.namespace] = clazz.library

            if passesOutputfilter(clazz.id, ):
                classAId   = clazz.id.replace(".","/") + ".js"
                targetpath = targetdir + "/" + classAId
                filetool.directory(os.path.dirname(targetpath))
                if buildtype == "source":
                    shutil.copy(clazz.path, targetpath)
                elif buildtype == "build":
                    compOptions = CompileOptions(optimize, variantSets[0]) # only support for a single variant set!
                    code = clazz.getCode(compOptions)
                    filetool.save(targetpath, code)

    return


##
# Copy resources -- handles both all and #asset-aware
#  - filtered -- whether #asset hints and include/exclude filter will be applied
def _handleResources(script, generator, filtered=True):

    def createResourceInfo(res, resval):
        resinfo = [ { "target": "resource", "data": { res : resval }} ]
        #filetool.save(approot+"/data/resource/" + res + ".json", json.dumpsCode(resinfo))
        return resinfo

    skip_expression = re.compile(r'%s' % '|'.join(filetool.VERSIONCONTROL_DIR_PATTS),re.I)

    def copyResource(res, library):
        if skip_expression.search(os.path.basename(res)):
            return
        sourcepath = os.path.join(library.resourcePath, res)
        targetpath = approot + "/resource/" + res
        filetool.directory(os.path.dirname(targetpath))
        shutil.copy(sourcepath, targetpath)
        #copier = copytool.CopyTool(context.console)
        #args   = ['-x', ','.join(filetool.VERSIONCONTROL_DIR_PATTS), sourcepath, targetpath]
        #copier.parse_args(args)
        #copier.do_work()
        return

    # ----------------------------------------------------------------------
    context.console.info("Processing resources: ", False)
    approot = context.jobconf.get("provider/app-root", "./provider")
    filetool.directory(approot+"/data")
    filetool.directory(approot+"/resource")
    
    # quick copy of runLogResources, for fast results
    packages   = script.packagesSorted()
    parts      = script.parts
    variants   = script.variants

    allresources = {}
    if filtered:
        generator._codeGenerator.packagesResourceInfo(script)
        for packageId, package in enumerate(packages):
            allresources.update(package.data.resources)
    else:
        # get the main library
        mainlib = [x for x in script.libraries if x.namespace == script.namespace][0]
        reslist = mainlib.getResources()
        allresources = Script.createResourceStruct(reslist, updateOnlyExistingSprites = False)

    # get resource info
    resinfos = {}
    numResources = len(allresources)
    for num,res in enumerate(allresources):
        context.console.progress(num+1, numResources)
        # fake a classId-like resourceId ("a.b.c"), for filter matching
        resId = os.path.splitext(res)[0]
        resId = resId.replace("/", ".")
        if filtered and not passesOutputfilter(resId):
            continue
        resinfos[res] = createResourceInfo(res, allresources[res])
        # extract library name space
        if isinstance(allresources[res], types.ListType): # it's an image = [14, 14, u'png', u'qx' [, u'qx/decoration/Modern/checkradio-combined.png', 0, 0]]
            library_ns = allresources[res][3]
        else: # html page etc. = "qx"
            library_ns = allresources[res]
        if library_ns:  # library_ns == '' means embedded image -> no copying
            library    = libraries[library_ns]
            copyResource(res, library)

    filetool.save(approot+"/data/resource/resources.json", json.dumpsCode(resinfos))

    return


def _handleI18N(script, generator):
    context.console.info("Processing localisation data")
    context.console.indent()
    approot = context.jobconf.get("provider/app-root", "./provider")

    # get class projection
    class_list = []
    needs_cldr = False
    for classObj in script.classesObj:
        if passesOutputfilter(classObj.id):
            class_list.append(classObj)
            if not needs_cldr and classObj.getHints('cldr'):
                needs_cldr = True

    # get i18n data
    context.console.info("Getting translations")
    trans_dat = generator._locale.getTranslationData(class_list, script.variants, script.locales, 
                                                       addUntranslatedEntries=True)
    loc_dat   = None
    if needs_cldr:
        context.console.info("Getting CLDR data")
        loc_dat   = generator._locale.getLocalizationData(class_list, script.locales)


    # write translation and cldr files
    context.console.info("Writing localisation files: ", False)
    numTrans = len(script.locales)
    for num,lang in enumerate(script.locales):
        context.console.progress(num+1, numTrans)

        # translations
        if trans_dat:
            transmap  = {}
            filename = "i18n-" + lang
            targetname = "i18n-" + lang
            if lang in trans_dat:
                translations = trans_dat[lang]
                for key in translations:
                    if translations[key]:
                        transmap[key] = [ { "target" : targetname, "data" : { key : translations[key] }} ]
                    else:
                        transmap[key] = [ ]
            filetool.save(approot+"/data/translation/"+filename+".json", json.dumpsCode(transmap))
        
        # cldr
        if loc_dat:
            localemap = {}
            filename = "locale-" + lang
            targetname = "locale-" + lang
            # sample: { "cldr" : [ { "target" : "locale-en", "data" : {"alternativeQuotationEnd":'"', "cldr_am": "AM",...}} ]}
            if lang in loc_dat:
                localekeys = loc_dat[lang]
                cldr_entry = [ { "target" : targetname, "data" : { }} ]
                for key in localekeys:
                    if localekeys[key]:
                        cldr_entry[0]['data'][key] = localekeys[key]
                localemap['cldr'] = cldr_entry
            filetool.save(approot+"/data/locale/"+filename+".json", json.dumpsCode(localemap))

    context.console.outdent()
    return
