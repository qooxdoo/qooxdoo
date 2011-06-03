#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
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

import os, sys, string, types, re, zlib, time
import urllib, urlparse, optparse, pprint

from generator.config.Lang      import Key
from generator.code.Part        import Part
from generator.code.Package     import Package
from generator.code.Class       import Class, ClassMatchList, CompileOptions
from generator.code.Script      import Script
#from generator.resource.ResourceHandler import ResourceHandler
from ecmascript.backend         import pretty
from misc                       import filetool, json, Path, securehash as sha
from misc.ExtMap                import ExtMap
from misc.Path                  import OsPath, Uri
from misc.NameSpace             import NameSpace
from misc                       import securehash as sha
        

console = None

class CodeGenerator(object):

    def __init__(self, cache_, console_, config, job, settings, locale, classes):
        global console, cache
        self._cache   = cache_
        self._console = console_
        self._config  = config
        self._job     = job
        self._settings     = settings
        self._locale     = locale
        self._classes = classes

        console = console_
        cache   = cache_


    def runCompiled(self, script, treeCompiler):

        def getOutputFile(compileType):
            filePath = compConf.get("paths/file")
            if not filePath:
                filePath = os.path.join(compileType, "script", script.namespace + ".js")
            return filePath

        def getFileUri(scriptUri):
            appfile = os.path.basename(fileRelPath)
            fileUri = os.path.join(scriptUri, appfile)  # make complete with file name
            fileUri = Path.posifyPath(fileUri)
            return fileUri

        ##
        # returns the Javascript code for the loader script as a string,
        # using the loader.tmpl template and filling its placeholders;
        # can take the code of the first ("boot") script of class code
        def generateLoader(script, compConf, globalCodes, bootCode='', ):

            self._console.info("Generating loader script...")
            result = ""
            vals   = {}

            if not self._job.get("packages/i18n-with-boot", True):
                # remove I18N info from globalCodes, so they don't go into the loader
                globalCodes["Translations"] = {}
                globalCodes["Locales"]      = {}
            else:
                if script.buildType == "build":
                    # also remove them here, as this info is now with the packages
                    globalCodes["Translations"] = {}
                    globalCodes["Locales"]      = {}

            if not script.parts:
                return result

            # stringify data in globalCodes
            for entry in globalCodes:
                globalCodes[entry] = json.dumpsCode(globalCodes[entry])
                # undo damage done by simplejson to raw strings with escapes \\ -> \
                globalCodes[entry] = globalCodes[entry].replace('\\\\\\', '\\').replace(r'\\', '\\')  # " gets tripple escaped, therefore the first .replace()

            vals.update(globalCodes)

            if script.buildType =="build":
                vals["Resources"] = json.dumpsCode({})  # TODO: undo Resources from globalCodes!!!

            # Name of the boot part
            vals["Boot"] = loaderBootName(script, compConf)

            # Code (pot.) of the boot part
            vals["BootPart"] = loaderBootPart(script, compConf, bootCode)

            # Translate part information to JavaScript
            vals["Parts"] = loaderPartsMap(script, compConf)

            # Translate URI data to JavaScript
            #vals["Uris"] = loaderScriptUris(script, compConf)

            # Translate URI data to JavaScript
            vals["Packages"] = loaderPackages(script, compConf)

            # Add potential extra scripts
            vals["UrisBefore"] = loaderUrisBefore(script, compConf)

            # Whether boot package is inline
            vals["BootIsInline"] = loaderBootInline(script, compConf)
                
            # Closure package information
            vals["ClosureParts"] = loaderClosureParts(script, compConf)

            # Package Hashes
            #vals["PackageHashes"] = loaderPackageHashes(script, compConf)

            # Script hook for qx.$$loader.decodeUris() function
            vals["DecodeUrisPlug"] = loaderDecodeUrisPlug(script, compConf)
            
            # Enable "?nocache=...." for script loading?
            vals["NoCacheParam"] = loaderNocacheParam(script, compConf)

            # Locate and load loader template
            template, templatePath = loaderTemplate(script, compConf)

            # Fill template gives result
            try:
                result = loaderFillTemplate(vals, template)
            except KeyError, e:
                raise ValueError("Unknown macro used in loader template (%s): '%s'" % 
                                 (templatePath, e.args[0])) 

            return result


        ##
        # create a map with part names as key and array of package id's and
        # return as string
        def loaderPartsMap(script, compConf):
            partData = {}
            packages = script.packagesSorted()
            #print "packages: %r" % packages
            for part in script.parts:
                #partData[part] = script.parts[part].packagesAsIndices(packages)
                partData[part] = []
                for package in script.parts[part].packages:
                    partData[part].append(package.id)
                #print "part '%s': %r" % (part, script.parts[part].packages)
            partData = json.dumpsCode(partData)

            return partData


        def loaderLibInfo(script, compConf):
            pass

        
        ##
        # Goes through all packages and returns the list of uri-like entries for
        # JS files in each package.
        #
        # @return [[package_entry]]   e.g. [["gui:gui/Application.js"],["__out__:gui.21312313.js"]]
        def loaderScriptUris(script, compConf):
            uris = packageUrisToJS(script.packagesSorted(), script.buildType)
            return json.dumpsCode(uris)

        def loaderPackages(script, compConf):
            packagemap = {}
            for package in script.packages:
                packageentry = {}
                packagemap[package.id] = packageentry
                packageentry['uris'] = package.files
            return json.dumpsCode(packagemap)


        ##
        # TODO: Replace the above function with this one when it works.
        def loaderScriptUris_1(script, compConf):
            uris = []
            for package in script.packagesSorted():
                package_scripts = []
                uris.append(package_scripts)
                for script in package:
                    script_entry = "%s:%s" % (libname, file_basename)
                    package_scripts.append(script_entry)
            return json.dumpsCode(uris)


        def loaderTranslations(script, compConf):
                pass


        def loaderResources(script, compConf):
                pass


        def loaderLocales(script, compConf):
                pass


        def loaderVariants(script, compConf):
                pass


        def loaderEnvironment(script, compConf):
                pass


        def loaderSettings(script, compConf):
                pass


        def loaderBootName(script, compConf):
            return '"%s"' % script.boot


        ##
        # Works only after all scripts have been created!
        def inlineBoot(script, compConf):

            def firstScriptCompiled(script, compConf):
                firstPackage = script.packagesSorted()[0]
                if firstPackage.has_source:
                    return False
                else:
                    return True

            # ------------------------------------------------------
            configWithBoot = self._job.get("packages/loader-with-boot", True)
            if configWithBoot and firstScriptCompiled(script, compConf):
                return True
            else:
                return False


        def loaderBootInline(script, compConf):
            return json.dumpsCode(inlineBoot(script, compConf))


        ##
        # Code of the boot package to be included with the loader
        # TODO: There must be a better way than pulling bootCode through all
        # the functions.
        def loaderBootPart(script, compConf, bootCode):
            if bootCode:
                val = bootCode
            else:
                val = ""
                # fake package data
                for key, package in enumerate(script.packagesSorted()): 
                    #val += "qx.$$packageData['%d']={};\n" % key
                    pass
            return val


        def loaderUrisBefore(script, compConf):
            urisBefore = []
            additional_scripts = self._job.get("add-script",[])
            for additional_script in additional_scripts:
                urisBefore.append(additional_script["uri"])
            return json.dumpsCode(urisBefore)


        def loaderPartsList(script, compConf):
                pass


        def loaderPackageHashes(script, compConf):
            packageHashes = {}
            for pos, package in enumerate(script.packagesSorted()):
                packageHashes[pos] = "%d" % package.id
            return json.dumpsCode(packageHashes)


        def loaderClosureParts(script, compConf):
            cParts = {}
            bootPkgId = bootPackageId(script)
            for part in script.parts.values():
                closurePackages = [isClosurePackage(p, bootPkgId) for p in part.packages if p.id != bootPkgId] # the 'boot' package may be the only non-closure package
                if closurePackages and all(closurePackages):
                    cParts[part.name] = True
            return json.dumpsCode(cParts)


        def bootPackageId(script):
            return script.parts[script.boot].packages[0].id # should only be one anyway


        ##
        # currently, we use the package key as the closure key to load
        # packages, hence the package must only contain a single script,
        # which is currently true if the package is free of source
        # scripts ("not package.has_source").
        # ---
        # theoretically, multiple scripts in a packages could be
        # supported, if they're all compiled (no source scripts) and 
        # each is assigned its own closure key.
        def isClosurePackage(package, bootPackageId):
            if not package.has_source and not package.id == bootPackageId:
                return True
            else:
                return False


        def loaderNocacheParam(script, compConf):
            return "true" if compConf.get("uris/add-nocache-param", True) else "false"


        ##
        # Return the JS snippet that is to be plugged into the decodeUris
        # function in the loader.
        def loaderDecodeUrisPlug(script, compConf):
            plugCodeFile = compConf.get("code/decode-uris-plug", False)
            plugCode = ""
            if plugCodeFile:
                plugCode = filetool.read(self._config.absPath(plugCodeFile))  # let it bomb if file can't be read
            return plugCode.strip()


        ##
        # Replace the placeholders in the loader template.
        # @throw KeyError a placeholder could not be filled from <vals>
        def loaderFillTemplate(vals, template):
            templ  = MyTemplate(template)
            result = templ.substitute(vals)
            return result

        ##
        # Translate URI data to JavaScript
        # using Package objects
        def packageUrisToJS(packages, version):

            allUris = []
            for packageId, package in enumerate(packages):
                packageUris = []
                if package.file: # build
                    namespace = "__out__"
                    fileId    = package.file
                    relpath    = OsPath(fileId)
                    shortUri   = Uri(relpath.toUri())
                    entry      = "%s:%s" % (namespace, shortUri.encodedValue())
                    packageUris.append(entry)
                    package.files.append(entry)  # TODO: make package.file obsolete
                elif package.files:  # hybrid
                    packageUris = package.files
                else: # "source" :
                    for clazz in package.classes:
                        namespace  = self._classes[clazz].library.namespace
                        relpath    = OsPath(self._classes[clazz].relpath)
                        shortUri   = Uri(relpath.toUri())
                        entry      = "%s:%s" % (namespace, shortUri.encodedValue())
                        packageUris.append(entry)
                        package.files.append(entry)  # TODO: this should done be elsewhere?!
                allUris.append(packageUris)

            return allUris


        ##
        # Find and read the loader template.
        def loaderTemplate(script, compConf):
            templatePath = compConf.get("paths/loader-template", None)
            if not templatePath:
                # use default template
                templatePath = os.path.join(filetool.root(), os.pardir, "data", "generator", "loader.tmpl.js")
            templateCont = filetool.read(templatePath)
            return templateCont, templatePath


        def getPackageData(package):
            data = {}
            data["resources"]    = package.data.resources
            data["translations"] = package.data.translations
            data["locales"]      = package.data.locales
            data = json.dumpsCode(data)
            data += ';\n'
            return data


        def compileClasses(classList, compConf, log_progress=lambda:None):
            result = []
            for clazz in classList:
                result.append(clazz.getCode(compConf))
                log_progress()
            return u''.join(result)

        ##
        # Go through a set of classes, and either compile some of them into
        # a common .js file, constructing the URI to this file, or just construct
        # the URI to the source file directly if the class matches a filter.
        # Return the list of constructed URIs.
        def compileAndWritePackage(package, compConf):

            def compiledFilename(compiled):
                hash_ = sha.getHash(compiled)[:12]
                fname = self._resolveFileName(script.baseScriptPath, script.variants, {}, "")
                fname = self._fileNameWithHash(fname, hash_)
                return fname

            def compileAndAdd(compiledClasses, packageUris, prelude='', wrap=''):
                compiled = compileClasses(compiledClasses, compOptions, log_progress)
                if wrap:
                    compiled = wrap % compiled
                if prelude:
                    compiled = prelude + compiled
                filename = compiledFilename(compiled)
                self.writePackage(compiled, filename, script)
                filename = OsPath(os.path.basename(filename))
                shortUri = Uri(filename.toUri())
                entry = "%s:%s" % ("__out__", shortUri.encodedValue())
                packageUris.append(entry)

                return packageUris

            # ------------------------------------
            packageUris = []
            optimize = compConf.get("code/optimize", [])
            format_   = compConf.get("code/format", False)
            variantSet= script.variants
            sourceFilter = ClassMatchList(compConf.get("code/except", []))
            compOptions  = CompileOptions(optimize=optimize, variants=variantSet, _format=format_)

            ##
            # This somewhat overlaps with packageUrisToJS
            compiledClasses = []
            packageData = getPackageData(package)
            packageData = ("qx.$$packageData['%s']=" % package.id) + packageData
            package_classes = [y for x in package.classes for y in script.classesObj if y.id == x] # TODO: i need to make package.classes [Class]!

            self._console.info("Package #%s:" % package.id, feed=False)
            len_pack_classes = len(package_classes)
            # helper log function, to log progress here, but also in compileClasses()
            def log_progress(c=[0]):
                c[0]+=1
                self._console.progress(c[0],len_pack_classes)

            for pos,clazz in enumerate(package_classes):
                if sourceFilter.match(clazz.id):
                    package.has_source = True
                    if packageData or compiledClasses:
                        # treat compiled classes so far
                        packageUris = compileAndAdd(compiledClasses, packageUris, packageData)
                        compiledClasses = []  # reset the collection
                        packageData = ""
                    # for a source class, just include the file uri
                    clazzRelpath = clazz.id.replace(".", "/") + ".js"
                    relpath  = OsPath(clazzRelpath)
                    shortUri = Uri(relpath.toUri())
                    entry    = "%s:%s" % (clazz.library.namespace, shortUri.encodedValue())
                    packageUris.append(entry)
                    log_progress()
                else:
                    compiledClasses.append(clazz)
            else:
                # treat remaining to-be-compiled classes
                if compiledClasses:
                    closureWrap = ''
                    if isClosurePackage(package, bootPackageId(script)):
                        closureWrap = u'''qx.Part.$$notifyLoad("%s", function() {\n%%s\n});''' % package.id
                    packageUris = compileAndAdd(compiledClasses, packageUris, packageData, closureWrap)

            package.files = packageUris
            return package
            


        ##
        # takes an array of (po-data, locale-data) dict pairs
        # merge all po data and all cldr data in a single dict each
        def mergeTranslationMaps(transMaps):
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


        # -- Main - runCompiled ------------------------------------------------

        packages   = script.packagesSorted()
        parts      = script.parts
        boot       = script.boot
        variants   = script.variants
        libraries  = script.libraries

        self._treeCompiler = treeCompiler
        self._variants     = variants
        self._script       = script

        self._console.info("Generate %s version..." % script.buildType)
        self._console.indent()

        # - Evaluate job config ---------------------
        # Compile config
        compConf = self._job.get("compile-options")
        compConf = ExtMap(compConf)

        # Whether the code should be formatted
        format = compConf.get("code/format", False)
        script.scriptCompress = compConf.get("paths/gzip", False)

        # Read optimizaitons
        optimize = compConf.get("code/optimize", [])

        # Read in settings
        settings = self.getSettings()
        script.settings = settings

        # Read libraries
        libs = self._job.get("library", [])

        # Get translation maps
        locales = compConf.get("code/locales", [])
        translationMaps = self.getTranslationMaps(packages, variants, locales)

        # Read in base file name
        fileRelPath = getOutputFile(script.buildType)
        filePath    = self._config.absPath(fileRelPath)
        script.baseScriptPath = filePath

        if script.buildType == "build":
            # read in uri prefixes
            scriptUri = compConf.get('uris/script', 'script')
            scriptUri = Path.posifyPath(scriptUri)
            fileUri   = getFileUri(scriptUri)
            # for resource list
            resourceUri = compConf.get('uris/resource', 'resource')
            resourceUri = Path.posifyPath(resourceUri)
        else:
            # source version needs place where the app HTML ("index.html") lives
            self.approot = self._config.absPath(compConf.get("paths/app-root", ""))
            resourceUri = None
            scriptUri   = None

        # Get global script data (like qxlibraries, qxresources,...)
        globalCodes = {}
        globalCodes["EnvSettings"] = self.generateVariantsCode(variants)
        # add optimizations
        for val in optimize:
            globalCodes["EnvSettings"]["qx.optimization."+val] = True
        globalCodes["Libinfo"]     = self.generateLibInfoCode(libs, format, resourceUri, scriptUri)
        # add synthetic output lib
        if scriptUri: out_sourceUri= scriptUri
        else:
            out_sourceUri = self._computeResourceUri({'class': ".", 'path': os.path.dirname(script.baseScriptPath)}, OsPath(""), rType="class", appRoot=self.approot)
            out_sourceUri = out_sourceUri.encodedValue()
        globalCodes["Libinfo"]['__out__'] = { 'sourceUri': out_sourceUri }
        globalCodes["Resources"]    = self.generateResourceInfoCode(script, settings, libraries, format)
        globalCodes["Translations"],                                      \
        globalCodes["Locales"]      = mergeTranslationMaps(translationMaps)

        # Potentally create dedicated I18N packages
        i18n_as_parts = not self._job.get("packages/i18n-with-boot", True)
        if i18n_as_parts:
            script = self.generateI18NParts(script, globalCodes)
            self.writePackages([p for p in script.packages if getattr(p, "__localeflag", False)], script)

        # ---- create script files ---------------------------------------------
        if script.buildType in ("source", "hybrid", "build"):

            # @deprecated: with 1.5
            if script.buildType in ("source", "build"):
                jobConf = ExtMap(self._job.getData())
                confkey = "compile-options/code/except"
                if jobConf.get(confkey, None) == None:
                    self._console.warn("You need to supply a '%s' key in your job configuration" % confkey)
                    if script.buildType == "source":
                        entry = ["*"]
                    elif script.buildType == "build":
                        entry = [] # this actually matches the default
                    jobConf.set(confkey, entry)
                    self._console.warn("   auto-supplying entry: '%s'" % entry)
                confkey = "compile-options/paths/app-root"
                if script.buildType == "build" and jobConf.get(confkey, None) == None:
                    self._console.warn("You need to supply a '%s' key in your job configuration" % confkey)
                    entry = "%s" % jobConf.get("let/BUILD_PATH", "build")
                    jobConf.set(confkey, entry)
                    self._console.warn("    auto-supplying entry: '%s'" % entry)
            # @deprecated-end

            # - Generating packages ---------------------
            self._console.info("Generating packages...")
            self._console.indent()

            if not len(packages):
                raise RuntimeError("No valid boot package generated.")

            for packageIndex, package in enumerate(packages):
                package = compileAndWritePackage(package, compConf)

            self._console.outdent()

            # generate loader
            if inlineBoot(script, compConf):
                # read first script file from script dir
                bfile = packages[0].files[0]  # "__out__:foo.js"
                bfile = bfile.split(':')[1]   # "foo.js"
                bfile = os.path.join(os.path.dirname(script.baseScriptPath), os.path.basename(bfile))
                bcode = filetool.read(bfile)
                os.unlink(bfile)
            else:
                bcode = ""
            loaderCode = generateLoader(script, compConf, globalCodes, bcode)
            fname = self._resolveFileName(script.baseScriptPath, script.variants, {}, "")
            self.writePackage(loaderCode, fname, script)


        self._console.outdent()

        return  # runCompiled()


    ##
    # Pretty-print set of classes.
    # Collects options and invokes ecmascript.backend.pretty
    def runPrettyPrinting(self, classesObj):
        if not isinstance(self._job.get("pretty-print", False), types.DictType):
            return

        self._console.info("Pretty-printing code...")
        self._console.indent()
        ppsettings = ExtMap(self._job.get("pretty-print"))  # get the pretty-print config settings

        # init options
        def options(): pass
        pretty.defaultOptions(options)

        # modify according to config
        if 'general/indent-string' in ppsettings:
            options.prettypIndentString = ppsettings.get('general/indent-string')
        if 'comments/block/add' in ppsettings:
            options.prettypCommentsBlockAdd = ppsettings.get('comments/trailing/keep-column')
        if 'comments/trailing/keep-column' in ppsettings:
            options.prettypCommentsTrailingKeepColumn = ppsettings.get('comments/trailing/keep-column')
        if 'comments/trailing/comment-cols' in ppsettings:
            options.prettypCommentsTrailingCommentCols = ppsettings.get('comments/trailing/comment-cols')
        if 'comments/trailing/padding' in ppsettings:
            options.prettypCommentsInlinePadding = ppsettings.get('comments/trailing/padding')
        if 'code/align-with-curlies' in ppsettings:
            options.prettypAlignBlockWithCurlies = ppsettings.get('code/align-with-curlies')
        if 'code/open-curly/newline-before' in ppsettings:
            options.prettypOpenCurlyNewlineBefore = ppsettings.get('code/open-curly/newline-before')
        if 'code/open-curly/indent-before' in ppsettings:
            options.prettypOpenCurlyIndentBefore = ppsettings.get('code/open-curly/indent-before')

        self._console.info("Pretty-printing files: ", False)
        numClasses = len(classesObj)
        for pos, classId in enumerate(classesObj):
            self._console.progress(pos+1, numClasses)
            tree = classesObj[classId].tree()
            result = [u'']
            result = pretty.prettyNode(tree, options, result)
            compiled = u''.join(result)
            filetool.save(self._classes[classId].path, compiled)

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

        if packageId != "":
            fileName = fileName.replace(".js", "-%s.js" % packageId)

        return fileName


    def _fileNameWithHash(self, fname, hash):
        filebase, fileext = os.path.splitext(fname)
        filename = filebase
        filename += "." + hash if hash else ""
        filename += fileext
        return filename


    def _computeContentSize(self, content):
        # Convert to utf-8 first
        content = unicode(content).encode("utf-8")

        # Calculate sizes
        origSize = len(content)
        compressedSize = len(zlib.compress(content, 9))

        return "%sKB / %sKB" % (origSize/1024, compressedSize/1024)


    ##
    # computes a complete resource URI for the given resource type rType, 
    # from the information given in lib and, if lib doesn't provide a
    # general uri prefix for it, use appRoot and lib path to construct
    # one
    def _computeResourceUri(self, lib, resourcePath, rType="class", appRoot=None):

        if 'uri' in lib:
            libBaseUri = Uri(lib['uri'])
        elif appRoot:
            libBaseUri = Uri(Path.rel_from_to(self._config.absPath(appRoot), lib['path']))
        else:
            raise RuntimeError, "Need either lib['uri'] or appRoot, to calculate final URI"
        #libBaseUri = Uri(libBaseUri.toUri())

        if rType in lib:
            libInternalPath = OsPath(lib[rType])
        else:
            raise RuntimeError, "No such resource type: \"%s\"" % rType

        # process the second part of the target uri
        uri = libInternalPath.join(resourcePath)
        uri = Uri(uri.toUri())

        libBaseUri.ensureTrailingSlash()
        uri = libBaseUri.join(uri)
        # strip dangling "/", e.g. when we have no resourcePath
        uri.ensureNoTrailingSlash()

        return uri


    ##
    # collect translation and locale data into dedicated parts and packages,
    # one for each language code
    def generateI18NParts(self, script, globalCodes):

        # for each locale code, collect mappings
        transKeys  = globalCodes['Translations'].keys()
        localeKeys = globalCodes['Locales'].keys()
        newParts   = {}    # language codes to part objects,    {"C": part}
        newPackages= {}    # language codes to private package objects, {"C": package}
        for localeCode in set(transKeys + localeKeys):
            # new: also provide a localeCode "part" with corresponding packages
            part = Part(localeCode)
            part.bit_mask = script.getPartBitMask()
            newParts[localeCode] = part
            package = Package(part.bit_mask)  # this might be modified later
            newPackages[localeCode] = package
            part.packages.append(package)

            data = {}
            data[localeCode] = { 'Translations': {}, 'Locales': {} }  # we want to have the locale code in the data
            if localeCode in transKeys:
                data[localeCode]['Translations']     = globalCodes['Translations'][localeCode]
                package.data.translations[localeCode] = globalCodes['Translations'][localeCode]
            if localeCode in localeKeys:
                data[localeCode]['Locales']     = globalCodes['Locales'][localeCode]
                package.data.locales[localeCode] = globalCodes['Locales'][localeCode]

            # file name and hash code
            hash_, dataS  = package.packageContent()  # TODO: this currently works only for pure data packages
            dataS        = dataS.replace('\\\\\\', '\\').replace(r'\\', '\\')  # undo damage done by simplejson to raw strings with escapes \\ -> \
            package.compiled.append(dataS)
            package.hash     = hash_
            fPath = self._resolveFileName(script.baseScriptPath, script.variants, script.settings, localeCode)
            package.file = os.path.basename(fPath)
            if self._job.get("compile-options/paths/scripts-add-hash", False):
                package.file = self._fileNameWithHash(package.file, package.hash)
            package.files = ["%s:%s" % ("__out__", package.file)]
            setattr(package,"__localeflag", True)   # TODO: temp. hack for writeI18NPackages()

        # Finalize the new packages and parts
        # - add prerequisite languages to parts; e.g. ["C", "en", "en_EN"]
        for partId, part in newParts.items():
            if newPackages["C"] not in part.packages:
                package = newPackages["C"]
                part.packages.append(package)   # all need "C"
                package.part_mask |= part.bit_mask     # adapt package's bit string
            if len(partId) > 2 and partId[2] == "_":  # it's a sub-language -> include main language
                mainlang = partId[:2]
                if mainlang not in newPackages:
                    raise RuntimeError("Locale '%s' specified, but not base locale '%s'" % (partId, mainlang))
                if newPackages[mainlang] not in part.packages:
                    part.packages.append(newPackages[mainlang])   # add main language
                    newPackages[mainlang].part_mask |= part.bit_mask     # adapt package's bit string

        # finally, sort packages
        for part in newParts.values():
            part.packagesSorted

        # - add to script object
        for partId in newParts:
            if partId in script.parts:
                raise RuntimeError("Name collison between code part and generated I18N part.")
            script.parts[partId] = newParts[partId]
        script.packages.extend(newPackages.values())

        return script


    def generateVariantsCode(self, variants):
        variats = {}

        for key in variants:
            if key in Key.META_KEYS:
                continue
            variats[key] = variants[key]

        return variats


    def getTranslationMaps(self, packages, variants, locales, addUntranslatedEntries=False):
        if "C" not in locales:
            locales.append("C")

        self._console.info("Processing translations for %s locales " % len(locales))
        self._console.indent()

        packageTranslations = []
        i18n_with_packages  = self._job.get("packages/i18n-with-boot", True)
        for pos, package in enumerate(packages):
            self._console.info("Package %s: " % pos, False)
            self._console.indent()

            pac_dat = self._locale.getTranslationData  (package.classes, variants, locales, addUntranslatedEntries) # .po data
            loc_dat = self._locale.getLocalizationData (package.classes, locales)  # cldr data
            packageTranslations.append((pac_dat,loc_dat))
            if i18n_with_packages:
                package.data.translations.update(pac_dat)
                package.data.locales.update(loc_dat)

            self._console.outdent()

        self._console.outdent()
        return packageTranslations


    def generateLibInfoCode(self, libs, format, forceResourceUri=None, forceScriptUri=None):
        qxlibs = {}

        for lib in libs:
            # add library key
            qxlibs[lib['namespace']] = {}

            # add resource root URI
            if forceResourceUri:
                resUriRoot = forceResourceUri
            else:
                resUriRoot = self._computeResourceUri(lib, OsPath(""), rType="resource", appRoot=self.approot)
                resUriRoot = resUriRoot.encodedValue()
                
            qxlibs[lib['namespace']]['resourceUri'] = "%s" % (resUriRoot,)
            
            # add code root URI
            if forceScriptUri:
                sourceUriRoot = forceScriptUri
            else:
                sourceUriRoot = self._computeResourceUri(lib, OsPath(""), rType="class", appRoot=self.approot)
                sourceUriRoot = sourceUriRoot.encodedValue()
            
            qxlibs[lib['namespace']]['sourceUri'] = "%s" % (sourceUriRoot,)
            
            # TODO: Add version, svn revision, maybe even authors, but at least homepage link, ...

            # add version info
            if 'version' in lib:
                qxlibs[lib['namespace']]['version'] = "%s" % lib['version']

        return qxlibs


    ##
    # Create a data structure to be textually included in the final script
    # that represents information about relevant resources, like images, style
    # sheets, etc. 
    # For images, this information includes pre-calculated sizes, and
    # being part of a combined image.
    def generateResourceInfoCode(self, script, settings, libraries, format=False):

        def addResourceInfoToPackages(script):
            for package in script.packages:
                package_resources = []
                # TODO: the next is a hack, since package.classes are still id's
                package_classes   = [x for x in script.classesObj if x.id in package.classes]
                for clazz in package_classes:
                    package_resources.extend(clazz.resources)
                package.data.resources = Script.createResourceStruct(package_resources, formatAsTree=resources_tree,
                                                             updateOnlyExistingSprites=True)
            return


        # -- main --------------------------------------------------------------

        compConf       = self._job.get ("compile-options")
        compConf       = ExtMap (compConf)
        resources_tree = compConf.get ("code/resources-tree", False)

        classes = Class.mapResourcesToClasses (libraries, script.classesObj,
                                            self._job.get("asset-let", {}))
        filteredResources = []
        for clazz in classes:
            filteredResources.extend(clazz.resources)
        resdata = Script.createResourceStruct (filteredResources, formatAsTree=resources_tree,
                                           updateOnlyExistingSprites=True)
        # add resource info to packages
        addResourceInfoToPackages(script)

        return resdata # end: generateResourceInfoCode()


    def packagesFileNames(self, basename, packagesLen, classPackagesOnly=False):
        loader_with_boot = self._job.get("packages/loader-with-boot", True)
        for packageId in range(packagesLen):
            suffix = packageId -1
            if suffix < 0:
                suffix = ""  # this is the loader package
                if (not loader_with_boot and classPackagesOnly):  # skip the loader package
                    continue
            packageFileName = self._resolveFileName(basename, self._variants, self._settings, suffix)
            yield packageFileName


    def writePackages(self, packages, script):

        for package in packages:
            filePath = os.path.join(os.path.dirname(self._script.baseScriptPath), package.file)
            content  = package.compiled[0]  # TODO: this is build-specific!
            self.writePackage(content, filePath, script)

        return

    
    def writePackage(self, content, filePath, script):
        console.debug("Writing script file %s" % filePath)
        if script.scriptCompress:
            filetool.gzip(filePath, content)
        else:
            filetool.save(filePath, content)




# Helper class for string.Template, to overwrite the placeholder introducing delimiter
class MyTemplate(string.Template):
    delimiter = "%"

