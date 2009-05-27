#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
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

import os, sys, string, types, re, zlib
import urllib, urlparse, optparse
import simplejson
from misc import filetool, Path
from ecmascript import compiler
from generator.action.ImageInfo import ImageInfo, ImgInfoFmt
from misc.ExtMap import ExtMap
from generator.config.Lang import Lang

console = None

class CodeGenerator(object):

    def __init__(self, cache, console_, config, job, settings, locale, resourceHandler, classes):
        global console
        self._cache   = cache
        self._console = console_
        self._config  = config
        self._job     = job
        self._settings     = settings
        self._locale     = locale
        self._resourceHandler = resourceHandler
        self._classes = classes

        console = console_



    def runCompiled(self, parts, packages, boot, variants, treeCompiler, classList):
        if not self._job.get("compile-dist", False):
            return

        self._treeCompiler = treeCompiler
        self._classList    = classList

        compConf = ExtMap(self._job.get("compile-dist"))

        def getAppName(memo={}):
            if not 'appname' in memo:
                appname = self._job.get("let/APPLICATION")
                if not appname:
                    raise RuntimeError, "Need an application name in config (key let/APPLICATION)"
                else:
                    memo['appname'] = appname
            return memo['appname']

        def getOutputFile():
            filePath = compConf.get("paths/file")
            if not filePath:
                filePath = os.path.join("build", "script", getAppName() + ".js")
            return filePath

        def getFileUri(scriptUri):
            appfile = os.path.basename(fileRelPath)
            fileUri = os.path.join(scriptUri, appfile)  # make complete with file name
            fileUri = Path.posifyPath(fileUri)
            return fileUri

        def generateBootScript(bootPackage=""):
            self._console.info("Generating boot script...")
            bootBlocks = []

            # For resource list
            resourceUri = compConf.get('uris/resource', 'resource')
            resourceUri = Path.posifyPath(resourceUri)

            globalCodes = self.generateGlobalCodes(libs, translationMaps, settings, variants, format, resourceUri, scriptUri)

            bootBlocks.append(self.generateBootCode(fileUri, parts, packages, boot, variants, settings, bootPackage, globalCodes, format))

            if format:
                bootContent = "\n\n".join(bootBlocks)
            else:
                bootContent = "".join(bootBlocks)

            return bootContent

        def writePackages(compiledPackages, startId=0):
            for packageId, content in enumerate(compiledPackages):
                writePackage(content, startId + packageId)
            return

        def writePackage(content, packageId=""):
            # Construct file name
            resolvedFilePath = self._resolveFileName(filePath, variants, settings, packageId)

            # Save result file
            filetool.save(resolvedFilePath, content)

            if compConf.get("paths/gzip"):
                filetool.gzip(resolvedFilePath, content)

            self._console.debug("Done: %s" % self._computeContentSize(content))
            self._console.debug("")

            return

        # Read in base file name
        fileRelPath = getOutputFile()
        filePath    = self._config.absPath(fileRelPath)

        # Read in uri prefixes
        scriptUri = compConf.get('uris/script', 'script')
        scriptUri = Path.posifyPath(scriptUri)
        fileUri = getFileUri(scriptUri)

        # Read in compiler options
        optimize = compConf.get("code/optimize", [])

        # Whether the code should be formatted
        format = compConf.get("code/format", False)

        # Read in settings
        settings = self.getSettings()

        # Get translation maps
        locales = compConf.get("code/locales", [])
        translationMaps = self.getTranslationMaps(packages, variants, locales)

        libs = self._job.get("library", [])

        # Generating packages
        self._console.info("Generating packages...")
        self._console.indent()

        bootPackage = ""
        compiledPackages = []
        for packageId, classes in enumerate(packages):
            self._console.info("Compiling package #%s:" % packageId, False)
            self._console.indent()

            # Compile file content
            compiledContent = self._treeCompiler.compileClasses(classes, variants, optimize, format)
            compiledPackages.append(compiledContent)

            self._console.debug("Done: %s" % self._computeContentSize(compiledContent))
            self._console.outdent()

        self._console.outdent()

        # Generating boot script
        if not len(compiledPackages):
            raise RuntimeError("No valid boot package generated.")

        if self._job.get("packages/loader-with-boot", True):
            content = generateBootScript(compiledPackages[0])
            writePackage(content)
            writePackages(compiledPackages[1:], 1)
        else:
            content = generateBootScript()
            writePackage(content)
            writePackages(compiledPackages)

        return


    def runSource(self, parts, packages, boot, variants, classList, libs, classes):
        if not self._job.get("compile-source/file"):
            return

        self._console.info("Generate source version...")
        self._console.indent()

        self._classList = classList
        self._libs      = libs
        self._classes   = classes

        # Read in base file name
        filePath = self._job.get("compile-source/file")
        #if variants:
        #    filePath = self._makeVariantsName(filePath, variants)
        filePath = self._config.absPath(filePath)

        # Whether the code should be formatted
        format = self._job.get("compile-source/format", False)

        # The place where the app HTML ("index.html") lives
        self.approot = self._config.absPath(self._job.get("compile-source/root", ""))

        # Read in settings
        settings = self.getSettings()

        # Get resource list
        libs = self._job.get("library", [])

        # Get translation maps
        locales = self._job.get("compile-source/locales", [])
        translationMaps = self.getTranslationMaps(packages, variants, locales)

        # Add data from settings, variants and packages
        sourceBlocks = []
        globalCodes = self.generateGlobalCodes(libs, translationMaps, settings, variants, format)
        sourceBlocks.append(self.generateSourcePackageCode(parts, packages, boot, globalCodes, format))

        # TODO: Do we really need this optimization here. Could this be solved
        # with less resources just through directly generating "good" code?
        self._console.info("Generating boot loader...")
        if format:
            sourceContent = "\n\n".join(sourceBlocks)
        else:
            #sourceContent = self._optimizeJavaScript("".join(sourceBlocks))
            sourceContent = "".join(sourceBlocks)

        # Construct file name
        resolvedFilePath = self._resolveFileName(filePath, variants, settings)

        # Save result file
        filetool.save(resolvedFilePath, sourceContent)

        if self._job.get("compile-source/gzip"):
            filetool.gzip(resolvedFilePath, sourceContent)

        self._console.outdent()
        self._console.debug("Done: %s" % self._computeContentSize(sourceContent))
        self._console.outdent()


    def runSource1(self):

        # Source Generation

        # Insert new part which only contains the loader stuff
        injectLoader(parts)

        # Compute packages
        parts, packages = self._partBuilder.getPackages(partIncludes, smartExclude, classList, collapseCfg, variants, sizeCfg)

        # Compile first part
        compiled = self._generateSourcePackageCode(part, packages)
        for part in parts:
            for pkg in part:
                compiled += self.compileClasses(pkgClasses, variants)
                break
            break

        writeFile(fileName, boot + compiled)



    def runPrettyPrinting(self, classes, treeLoader):
        "Gather all relevant config settings and pass them to the compiler"

        if not isinstance(self._job.get("pretty-print", False), types.DictType):
            return

        self._console.info("Pretty-printing code...")
        self._console.indent()
        ppsettings = ExtMap(self._job.get("pretty-print"))  # get the pretty-print config settings

        # init options
        parser  = optparse.OptionParser()
        compiler.addCommandLineOptions(parser)
        (options, args) = parser.parse_args([])

        # modify according to config
        setattr(options, 'prettyPrint', True)  # turn on pretty-printing
        if ppsettings.get('general/indent-string',False):
            setattr(options, 'prettypIndentString', ppsettings.get('general/indent-string'))
        if ppsettings.get('comments/trailing/keep-column',False):
            setattr(options, 'prettypCommentsTrailingKeepColumn', ppsettings.get('comments/trailing/keep-column'))
        if ppsettings.get('comments/trailing/comment-cols',False):
            setattr(options, 'prettypCommentsTrailingCommentCols', ppsettings.get('comments/trailing/comment-cols'))
        if ppsettings.get('comments/trailing/padding',False):
            setattr(options, 'prettypCommentsInlinePadding', ppsettings.get('comments/trailing/padding'))
        if ppsettings.get('blocks/align-with-curlies',False):
            setattr(options, 'prettypAlignBlockWithCurlies', ppsettings.get('blocks/align-with-curlies'))
        if ppsettings.get('blocks/open-curly/newline-before',False):
            setattr(options, 'prettypOpenCurlyNewlineBefore', ppsettings.get('blocks/open-curly/newline-before'))
        if ppsettings.get('blocks/open-curly/indent-before',False):
            setattr(options, 'prettypOpenCurlyIndentBefore', ppsettings.get('blocks/open-curly/indent-before'))

        self._console.info("Pretty-printing files: ", False)
        numClasses = len(classes)
        for pos, classId in enumerate(classes):
            self._console.progress(pos, numClasses)
            tree = treeLoader.getTree(classId)
            compiled = compiler.compile(tree, options)
            filetool.save(self._classes[classId]['path'], compiled)

        self._console.outdent()

        return


    def getSettings(self):
        # TODO: Runtime settings support is currently missing
        settings = {}
        settingsConfig = self._job.get("settings", {})
        settingsRuntime = self._settings

        for key in settingsConfig:
            settings[key] = settingsConfig[key]

        for key in settingsRuntime:
            settings[key] = settingsRuntime[key]

        return settings


    def _resolveFileName(self, fileName, variants=None, settings=None, packageId=""):
        if variants:
            for key in variants:
                pattern = "{%s}" % key
                fileName = fileName.replace(pattern, str(variants[key]))

        if settings:
            for key in settings:
                pattern = "{%s}" % key
                fileName = fileName.replace(pattern, str(settings[key]))

        if packageId != "":
            fileName = fileName.replace(".js", "-%s.js" % packageId)

        return fileName


    def _computeContentSize(self, content):
        # Convert to utf-8 first
        content = unicode(content).encode("utf-8")

        # Calculate sizes
        origSize = len(content)
        compressedSize = len(zlib.compress(content, 9))

        return "%sKB / %sKB" % (origSize/1024, compressedSize/1024)


    def _computeResourceUri(self, lib, resourcePath, rType="class", appRoot=None):
        '''computes a complete resource URI for the given resource type rType, 
           from the information given in lib and, if lib doesn't provide a
           general uri prefix for it, use appRoot and lib path to construct
           one'''
        
        if 'uri' in lib:
            liburi = lib['uri']
        elif appRoot:
            liburi = Path.rel_from_to(self._config.absPath(appRoot), lib['path'])
        else:
            raise RuntimeError, "Need either lib['uri'] or appRoot, to calculate final URI"

        if rType in lib:
            libInternalPath = lib[rType]
        else:
            raise RuntimeError, "No such resource type: \"%s\"" % rType

        # process parts that are known to have path character or even stem from file system
        uri = os.path.join(libInternalPath, resourcePath)
        uri = os.path.normpath(uri)
        uri = Path.posifyPath(uri)

        # process lib prefix - might be complete with scheme etc.
        if not re.search(r'^[a-zA-Z]+://', liburi): # it is without 'http://'
            liburi = Path.posifyPath(liburi)  # have to apply path normalization
        if not liburi.endswith('/'):  # if liburi is only a path, basejoin needs a trailing '/'
            liburi += '/'

        # put them together
        uri = urllib.basejoin(liburi, uri)

        return uri


    def _encodeUri(self, uri):
        # apply urllib.quote, but only to path part of uri
        parts = urlparse.urlparse(uri)
        nparts= []
        for i in range(len(parts)):
            if i<=1:   # skip schema and netlock parts
                nparts.append(parts[i])
            else:
                nparts.append(urllib.quote(parts[i]))
        nuri  = urlparse.urlunparse(nparts)
        return nuri


    # wpbasti: TODO: Clean up compiler. Maybe split-off pretty-printing. These hard-hacked options, the pure
    # need of them is bad. Maybe options could be stored easier in a json-like config map instead of command line
    # args. This needs a rework of the compiler which is not that easy.
    def _optimizeJavaScript(self, code):
        restree = treegenerator.createSyntaxTree(tokenizer.parseStream(code))
        variableoptimizer.search(restree)

        # Emulate options
        parser = optparse.OptionParser()
        parser.add_option("--p1", action="store_true", dest="prettyPrint", default=False)
        parser.add_option("--p2", action="store_true", dest="prettypIndentString", default="  ")
        parser.add_option("--p3", action="store_true", dest="prettypCommentsInlinePadding", default="  ")
        parser.add_option("--p4", action="store_true", dest="prettypCommentsTrailingCommentCols", default="")

        (options, args) = parser.parse_args([])

        return compiler.compile(restree, options)


    def _makeVariantsName(self, pathName, variants):
        (newname, ext) = os.path.splitext(pathName)
        for key in variants:
            newname += "_%s:%s" % (str(key), str(variants[key]))
        newname += ext
        return newname


    def generateGlobalCodes(self, libs, translationMaps, settings, variants, format=False, resourceUri=None, scriptUri=None):
        # generate the global codes like qxlibraries, qxresources, ...
        # and collect them in a common structure

        def mergeTranslationMaps(transMaps):
            # translationMaps is a pair (po-data, cldr-data) per package:
            # translationMaps = [({'C':{},..},{'C':{},..}), (.,.), ..]
            # this function merges all [0] elements into a common dict, and
            # all [1] elements:
            # return = ({'C':{},..}, {'C':{},..})
            poData = {}
            cldrData = {}

            for pac_dat, loc_dat in transMaps:
                for loc in pac_dat:
                    if loc not in poData:
                        poData[loc] = {}
                    poData[loc].update(pac_dat[loc])
                for loc in loc_dat:
                    if loc not in cldrData:
                        cldrData[loc] = {}
                    cldrData[loc].update(loc_dat[loc])

            return (poData, cldrData)


        globalCodes  = {}

        globalCodes["Settings"] = simplejson.dumps(settings, ensure_ascii=False)

        variantInfo = self.generateVariantsCode(variants)
        globalCodes["Variants"] = simplejson.dumps(variantInfo,ensure_ascii=False)

        mapInfo = self.generateLibInfoCode(libs,format, resourceUri, scriptUri)
        globalCodes["Libinfo"] = simplejson.dumps(mapInfo,ensure_ascii=False)

        mapInfo = self.generateResourceInfoCode(settings, libs, format)
        globalCodes["Resources"] = simplejson.dumps(mapInfo,ensure_ascii=False)

        locData = mergeTranslationMaps(translationMaps)
        globalCodes["Translations"] = simplejson.dumps(locData[0],ensure_ascii=False) # 0: .po data
        globalCodes["Locales"]      = simplejson.dumps(locData[1],ensure_ascii=False) # 1: cldr data

        return globalCodes


    def generateVariantsCode(self, variants):
        variats = {}

        for key in variants:
            if key in Lang.META_KEYS:
                continue
            variats[key] = variants[key]

        return variats


    def getTranslationMaps(self, packages, variants, locales):
        if "C" not in locales:
            locales.append("C")

        self._console.info("Processing translation for %s locales..." % len(locales))
        self._console.indent()

        packageTranslation = []
        for pos, classes in enumerate(packages):
            self._console.debug("Package: %s" % pos)
            self._console.indent()

            # wpbasti: TODO: This code includes localization in every package. Bad idea.
            # This needs further work

            # Another thing: Why not generate both structures in different js-objects
            # It's totally easy in JS to build a wrapper.
            # [thron7] means: generate different data structs for locales and translations
            pac_dat = self._locale.generatePackageData(classes, variants, locales) # .po data
            loc_dat = self._locale.getLocalizationData(locales)  # cldr data
            packageTranslation.append((pac_dat,loc_dat))

            self._console.outdent()

        self._console.outdent()
        return packageTranslation


    def generateLibInfoCode(self, libs, format, forceResourceUri=None, forceScriptUri=None):
        qxlibs = {}

        for lib in libs:
            # add library key
            qxlibs[lib['namespace']] = {}

            # add resource root URI
            if forceResourceUri:
                resUriRoot = forceResourceUri
            else:
                resUriRoot = self._computeResourceUri(lib, "", rType="resource", appRoot=self.approot)
                
            qxlibs[lib['namespace']]['resourceUri'] = "%s" % self._encodeUri(resUriRoot)
            
            # add code root URI
            if forceScriptUri:
                sourceUriRoot = forceScriptUri
            else:
                sourceUriRoot = self._computeResourceUri(lib, "", rType="class", appRoot=self.approot)
            
            qxlibs[lib['namespace']]['sourceUri'] = "%s" % self._encodeUri(sourceUriRoot)
            
            # TODO: Add version, svn revision, maybe even authors, but at least homepage link, ...

            # add version info
            if 'version' in lib:
                qxlibs[lib['namespace']]['version'] = "%s" % lib['version']

        return qxlibs


    def generateResourceInfoCode(self, settings, libs, format=False):
        """Pre-calculate image information (e.g. sizes)"""
        data    = {}
        resdata = data
        imgpatt  = re.compile(r'\.(png|jpeg|jpg|gif)$', re.I)
        skippatt = re.compile(r'\.(meta|py)$', re.I)

        self._console.info("Analysing assets...")
        self._console.indent()

        self._imageInfo      = ImageInfo(self._console, self._cache)

        # some helper functions

        def replaceWithNamespace(imguri, liburi, libns):
            pre,libsfx,imgsfx = Path.getCommonPrefix(liburi, imguri)
            if imgsfx[0] == os.sep: imgsfx = imgsfx[1:]  # strip leading '/'
            imgshorturi = os.path.join("${%s}" % libns, imgsfx)
            return imgshorturi

        def extractAssetPart(libresuri, imguri):
            pre,libsfx,imgsfx = Path.getCommonPrefix(libresuri, imguri) # split libresuri from imguri
            if imgsfx[0] == os.sep: imgsfx = imgsfx[1:]  # strip leading '/'
            return imgsfx                # use the bare img suffix as its asset Id

        def normalizeImgUri(uriFromMetafile, trueCombinedUri, combinedUriFromMetafile):
            # normalize paths (esp. "./x" -> "x")
            (uriFromMetafile, trueCombinedUri, combinedUriFromMetafile) = map(os.path.normpath,(uriFromMetafile, trueCombinedUri, combinedUriFromMetafile))
            # get the "wrong" prefix (in mappedUriPrefix)
            trueUriPrefix, mappedUriPrefix, sfx = Path.getCommonSuffix(trueCombinedUri, combinedUriFromMetafile)
            # ...and strip it from contained image uri, to get a correct suffix (in uriSuffix)
            pre, mappedUriSuffix, uriSuffix = Path.getCommonPrefix(mappedUriPrefix, uriFromMetafile)
            # ...then compose the correct prefix with the correct suffix
            normalUri = os.path.normpath(os.path.join(trueUriPrefix, uriSuffix))
            return normalUri

        def processCombinedImg(data, meta_fname, cimguri, cimgshorturi, cimgfmt):
            assert cimgfmt.lib, cimgfmt.type
            # read meta file
            cacheId = "imgcomb-%s" % meta_fname
            imgDict = self._cache.read(cacheId, meta_fname)
            if imgDict == None:
                mfile = open(meta_fname)
                imgDict = simplejson.loads(mfile.read())
                mfile.close()
                self._cache.write(cacheId, imgDict)
            for mimg, mimgs in imgDict.items():
                # sort of like this: mimg : [width, height, type, combinedUri, off-x, off-y]
                mimgspec = ImgInfoFmt(mimgs)
                # have to normalize the uri's from the meta file
                # cimguri is relevant, like: "../../framework/source/resource/qx/decoration/Modern/panel-combined.png"
                # mimg is an uri from when the meta file was generated, like: "./source/resource/qx/decoration/Modern/..."
                mimguri = normalizeImgUri(mimg, cimguri, mimgspec.mappedId)
                ## replace lib uri with lib namespace in mimguri
                ##mimgshorturi = replaceWithNamespace(mimguri, libresuri, cimgfmt.lib)
                #mimgshorturi = extractAssetPart(libresuri, mimguri)
                mimgshorturi = extractAssetPart(librespath, mimguri)
                mimgshorturi = Path.posifyPath(mimgshorturi)

                mimgspec.mappedId = cimgshorturi        # correct the mapped uri of the combined image
                mimgspec.lib      = cimgfmt.lib
                mimgspec.mtype    = cimgfmt.type
                mimgspec.mlib     = cimgfmt.lib
                data[mimgshorturi] = mimgspec.flatten()  # this information takes precedence over existing


        # main

        resourceFilter= self._resourceHandler.getResourceFilterByAssets(self._classList)

        for lib in libs:
            #libresuri = self._computeResourceUri(lib, "", rType='resource', appRoot=self.approot)
            librespath = os.path.normpath(os.path.join(lib['path'], lib['resource']))
            resourceList = self._resourceHandler.findAllResources([lib], resourceFilter)
            # resourceList = [[file1,uri1],[file2,uri2],...]
            for resource in resourceList:
                ##assetId = replaceWithNamespace(imguri, libresuri, lib['namespace'])
                #assetId = extractAssetPart(libresuri, resource[1])
                assetId = extractAssetPart(librespath,resource)
                assetId = Path.posifyPath(assetId)

                if imgpatt.search(resource): # handle images
                    imgpath= resource
                    #imguri = resource[1]
                    imguri = resource
                    imageInfo = self._imageInfo.getImageInfo(imgpath, assetId)

                    # use an ImgInfoFmt object, to abstract from flat format
                    imgfmt = ImgInfoFmt()
                    imgfmt.lib = lib['namespace']
                    if not 'type' in imageInfo:
                        raise RuntimeError, "Unable to get image info from file: %s" % imgpath
                    imgfmt.type = imageInfo['type']

                    # check for a combined image and process the contained images
                    meta_fname = os.path.splitext(imgpath)[0]+'.meta'
                    if os.path.exists(meta_fname):  # add included imgs
                        processCombinedImg(data, meta_fname, imguri, assetId, imgfmt)

                    # add this image directly
                    # imageInfo = {width, height, filetype}
                    if not 'width' in imageInfo or not 'height' in imageInfo:
                        raise RuntimeError, "Unable to get image info from file: %s" % imgpath
                    imgfmt.width, imgfmt.height, imgfmt.type = (
                        imageInfo['width'], imageInfo['height'], imageInfo['type'])
                    # check if img is already registered as part of a combined image
                    if assetId in data:
                        x = ImgInfoFmt()
                        x.fromFlat(data[assetId])
                        if x.mappedId:
                            continue  # don't overwrite the combined entry
                    data[assetId] = imgfmt.flatten()

                elif skippatt.search(resource[0]):
                    continue

                else:  # handle other resources
                    resdata[assetId] = lib['namespace']


        # wpbasti: Image data is not part relevant yet.

        self._console.outdent()

        return resdata


    # wpbasti: This needs a lot of work. What's about the generation of a small bootstrap script
    # from normal qooxdoo classes (include io2.ScriptLoader) and starting the variant selection etc.
    # from there. This would be somewhat comparable to the GWT way.
    # Finally "loader.js" should be completely removed.
    def generateSourcePackageCode(self, parts, packages, boot, globalCodes, format=False):
        if not parts:
            return ""

        # Translate part information to JavaScript
        partData = "{"
        for partId in parts:
            partData += '"%s":' % (partId)
            partData += ('%s,' % parts[partId]).replace(" ", "")

        partData=partData[:-1] + "}"

        # Translate URI data to JavaScript
        allUris = []
        allUrisSmall = []
        for packageId, package in enumerate(packages):
            packageUris = []
            packageUrisSmall = []
            for fileId in package:
                #cUri = Path.rel_from_to(self.approot, self._classes[fileId]["relpath"])
                namespace = self._classes[fileId]["namespace"]
                relpath   = self._classes[fileId]["relpath"]
                lib       = self._libs[namespace]

                cUri = self._computeResourceUri(lib, relpath, rType='class', appRoot=self.approot)
                cUri = self._encodeUri(cUri)

                sUri = relpath
                sUri = os.path.normpath(sUri)
                sUri = Path.posifyPath(sUri)
                sUri = self._encodeUri(sUri)
                sUri = '%s:%s' % (namespace, sUri)

                packageUris.append('"%s"' % cUri)
                packageUrisSmall.append('"%s"' % sUri)

            allUris.append("[" + ",".join(packageUris) + "]")
            allUrisSmall.append("[" + ",".join(packageUrisSmall) + "]")

        uriData = "[" + ",\n".join(allUris) + "]"
        uriDataSmall = "[" + ",\n".join(allUrisSmall) + "]"

        # Locate and load loader basic script
        loaderFile = os.path.join(filetool.root(), os.pardir, "data", "generator", "loader-source.tmpl.js")
        result = filetool.read(loaderFile)

        # Replace string.template macros
        rmap = {}
        rmap.update(globalCodes)
        rmap["Parts"] = partData
        rmap["Uris"]  = uriData
        rmap["Uris2"] = uriDataSmall
        rmap["Boot"]  = '"%s"' % boot

        templ  = MyTemplate(result)
        result = templ.safe_substitute(rmap)

        return result


    def generateBootCode(self, fileName, parts, packages, boot, variants, settings, bootCode, globalCodes, format=False):
        if not parts:
            return ""

        # Translate part information to JavaScript
        partData = "{"
        for partId in parts:
            partData += '"%s":' % (partId)
            partData += ('%s,' % parts[partId]).replace(" ", "")

        partData=partData[:-1] + "}"

        # Translate URI data to JavaScript
        allUris = []
        for packageId, packages in enumerate(packages):
            packageFileName = self._resolveFileName(fileName, variants, settings, packageId)
            allUris.append('["' + packageFileName + '"]')

        uriData = "[" + ",\n".join(allUris) + "]"

        # Locate and load loader basic script
        if bootCode:
            loaderFile = os.path.join(filetool.root(), os.pardir, "data", "generator", "loader-build.tmpl.js")
        else:
            loaderFile = os.path.join(filetool.root(), os.pardir, "data", "generator", "loader-source.tmpl.js")
        result = filetool.read(loaderFile)

        # Replace string.template macros
        rmap = {}
        rmap.update(globalCodes)
        rmap["Parts"] = partData
        rmap["Uris"]  = uriData
        rmap["Uris2"]  = '""'
        rmap["Boot"]  = '"%s"' % boot
        rmap["BootPart"] = bootCode

        templ  = MyTemplate(result)
        result = templ.safe_substitute(rmap)

        return result


# Helper class for string.Template, to overwrite the placeholder introducing delimiter
class MyTemplate(string.Template):
    delimiter = "%"



