#!/usr/bin/env python
# -*- coding: utf-8 -*-

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

import os, sys, string, types, re, zlib, time, codecs
import urllib, copy
import graph

from generator.config.Lang      import Key
from generator.code.Part        import Part
from generator.code.Package     import Package
from generator.code.Class       import Class, ClassMatchList, CompileOptions
from generator.code.Script      import Script
import generator.resource.Library # just need the .Library type
from ecmascript.frontend        import tokenizer, treegenerator, treegenerator_2
from ecmascript.backend         import pretty
#from ecmascript.backend         import pretty_new as pretty
from ecmascript.backend.Packer  import Packer
from ecmascript.transform.optimizer    import privateoptimizer
from misc                       import filetool, json, Path, securehash as sha, util
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


    def runCompiled(self, script):

        def removeDuplicatLibs(libs):
            l = []
            for lib in libs:  # relying on Library.__eq__
                if lib not in l: l.append(lib)
            return l

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

            self._console.info("Generate loader script")
            result = ""
            vals   = {}

            if not script.parts:
                return result

            # stringify data in globalCodes
            for entry in globalCodes:
                globalCodes[entry] = json.dumpsCode(globalCodes[entry])
                # undo damage done by simplejson to raw strings with escapes \\ -> \
                globalCodes[entry] = globalCodes[entry].replace('\\\\\\', '\\').replace(r'\\', '\\')  # " gets tripple escaped, therefore the first .replace()

            vals.update(globalCodes)

            vals["Resources"]    = json.dumpsCode({})  # just init with empty map
            vals["Translations"] = json.dumpsCode(dict((l,None) for l in script.locales))  # init with configured locales
            vals["Locales"]      = json.dumpsCode(dict((l,None) for l in script.locales))

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

            # Add potential extra css
            vals["CssBefore"] = loaderCssBefore(script, compConf)

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

            # Compress it
            if False: # - nope; this is taking around 14s on my box, with parsing being 10s  :(
                resTokens = tokenizer.parseStream(result, templatePath)
                resTree = treegenerator.createSyntaxTree(resTokens, templatePath)
                [result] = Packer().serializeNode(resTree, None, None, compConf.get('code/format', False))

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
            configWithBoot = not self._job.get("packages/separate-loader", False)
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


        def loaderCssBefore(script, compConf):
            cssBefore = []
            additional_csses = self._job.get("add-css",[])
            for additional_css in additional_csses:
                cssBefore.append(additional_css["uri"])
            return json.dumpsCode(cssBefore)


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
                package_uris = []
                if package.file: # build
                    namespace = "__out__"
                    fileId    = package.file
                    relpath    = OsPath(fileId)
                    shortUri   = Uri(relpath.toUri())
                    entry      = "%s:%s" % (namespace, shortUri.encodedValue())
                    package_uris.append(entry)
                    package.files.append(entry)  # TODO: make package.file obsolete
                elif package.files:  # hybrid
                    package_uris = package.files
                else: # "source" :
                    for clazz in package.classes:
                        namespace  = clazz.library.namespace
                        relpath    = OsPath(clazz.relpath)
                        shortUri   = Uri(relpath.toUri())
                        entry      = "%s:%s" % (namespace, shortUri.encodedValue())
                        package_uris.append(entry)
                        package.files.append(entry)  # TODO: this should done be elsewhere?!
                allUris.append(package_uris)

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
            if not self._job.get("packages/i18n-as-parts", False):
                data["translations"] = package.data.translations
                data["locales"]      = package.data.locales
            data = json.dumpsCode(data)
            data += ';\n'
            return data


        # - _compileClassesMP stuff --------------------------------------

        def _compileClassesMP(classes, compConf, log_progress, maxproc=8):
            # experimental
            # improve by incorporating cache handling, as done in getCompiled()
            # hangs on Windows in the last call to reap_processes from the main loop

            def reap_processes(wait=False):
                # reap the current processes (wait==False: if they are finished)
                #print "-- entering reap_processes with len: %d" % len(processes)
                reaped  = False
                counter = 0
                while True:
                    for pos, pid in enumerate(processes.keys()):
                        if not wait and pid.poll() == None:  # None = process hasn't terminated
                            #print pid.poll()
                            continue
                        #print "checking pos: %d" % pos
                        #self._console.progress(pos, length)
                        output, errout = pid.communicate()
                        rcode = pid.returncode
                        cpos = processes[pid][0]
                        if rcode == 0:
                            #tf   = processes[pid][1].read()
                            #print output[:30]
                            #print tf[:30]
                            contA[cpos][CONTENT] = output.decode('utf-8')
                            #contA[cpos] = tf
                        else:
                            raise RuntimeError("Problems compiling %s: %s" % (classes[cpos], errout))
                        #print "-- terminating process for class: %s" % classes[cpos]
                        del processes[pid]
                        reaped = True

                    if reaped: break
                    else:
                        #print "-- waiting for some process to terminate"
                        if counter > 100: # arbitrary limit, to break deadlocks because of full pipes
                            #print "-- switching to wait=True"
                            wait = True
                        else:
                            counter += 1
                        time.sleep(.050)

                #print "-- leaving reap_processes with len: %d" % len(processes)
                return

            # -----------------------------------------------------------------

            variants = compConf.variantset
            optimize = compConf.optimize
            format_  = compConf.format
            import subprocess
            contA = {}
            CACHEID = 0
            INCACHE = 1
            CONTENT = 2
            processes = {}
            length = len(classes)

            #self._console.debug("Compiling classes using %d sub-processes" % maxproc)

            # go through classes, start individual compiles, collect results
            for pos, clazz in enumerate(classes):
                log_progress()
                contA[pos] = {}
                contA[pos][INCACHE] = False
                if len(processes) > maxproc:
                    reap_processes()  # collect finished processes' results to make room

                cacheId, content = _checkCache(clazz, variants, optimize, format_)
                contA[pos][CACHEID] = cacheId
                if content:
                    contA[pos][CONTENT] = content
                    contA[pos][INCACHE] = True
                    continue
                cmd = _getCompileCommand(clazz, variants, optimize, format_)
                #print cmd
                tf = os.tmpfile()
                #print "-- starting process for class: %s" % clazz
                pid = subprocess.Popen(
                            cmd, shell=True,
                            stdout=subprocess.PIPE,
                            #stdout=tf,
                            stderr=subprocess.PIPE,
                            universal_newlines=True)
                processes[pid] = (pos, tf)

            # collect outstanding processes
            if len(processes):
                #print "++ cleaning up processes"
                reap_processes(wait=True)

            # join single results in one string
            content = u''
            for i in sorted(contA.keys()):
                #print i, contA[i][:30]
                classStuff = contA[i]
                content += classStuff[CONTENT]
                if not classStuff[INCACHE]:
                    self._cache.write(classStuff[CACHEID], classStuff[CONTENT])

            return content


        def _getCompileCommand(clazz, variants, optimize, format_):

            def getToolBinPath():
                path = sys.argv[0]
                path = os.path.abspath(os.path.normpath(os.path.dirname(path)))
                return path

            m   = {}
            cmd = ""
            toolBinPath      = getToolBinPath()
            m['compilePath'] = os.path.join(toolBinPath, "compile.py -q")
            m['filePath']    = os.path.normpath(clazz.path)
            # optimizations
            optis = []
            for opti in optimize:
                optis.append("--" + opti)
            m['optimizations'] = " ".join(optis)
            # variants
            varis = []
            for vari in variants:
                varis.append("--variant=" + vari + ":" + json.dumps(variants[vari]))
            m['variants'] = " ".join(varis)
            m['cache'] = "-c " + self._cache._path  # Cache needs context object, interrupt handler,...
            # compile.py could read the next from privateoptimizer module directly
            m['privateskey'] = "--privateskey " + '"' + privateoptimizer.privatesCacheId + '"'

            cmd = "%(compilePath)s %(optimizations)s %(variants)s %(cache)s %(privateskey)s %(filePath)s" % m
            return cmd


        def _checkCache(clazz, variants, optimize, format_=False):
            filePath = clazz.path

            classVariants     = clazz.classVariants()
            relevantVariants  = Class.projectClassVariantsToCurrent(classVariants, variants)
            variantsId = util.toString(relevantVariants)

            optimizeId = generateOptimizeId(optimize)

            cacheId = "compiled-%s-%s-%s-%s" % (filePath, variantsId, optimizeId, format_)
            compiled, _ = self._cache.read(cacheId, filePath)

            return cacheId, compiled


        def generateOptimizeId(optimize):
            optimize = copy.copy(optimize)
            optimize.sort()
            return "[%s]" % ("-".join(optimize))

        # - end: _compileClassesMP stuff --------------------------------

        ##
        # process "statics" optimization
        #
        def optimizeDeadCode(classList, featureMap, compConf, treegen, log_progress):
            
            ##
            # define a criterion when optimization is saturated
            # (here: when nullrefs hasn't changed in 4 times)
            def atLimit(featureMap, lmin=[]):
                # array of (class.id, feature) the feature ref count of which is 0
                nullrefs = [(cls, feat) for cls in featureMap 
                                for feat in featureMap[cls] if not featureMap[cls][feat].hasref()]
                cmin = len(nullrefs)
                lmin.append(cmin)
                # use the last 4 length values
                if len(lmin)>3 and all([x==cmin for x in lmin[-4:]]):
                    return True
                else:
                    return False

            ##
            # print features with external usages
            def debugFeatureMap(featureMap):
                for key in featureMap:
                    print key
                    features =  featureMap[key]
                    for feat in features:
                        ext_refs = set(["%s:%s" % (ref.requestor, ref.line) for ref in features[feat]._refs if ref.requestor != key])
                        print "\t", feat, ":", features[feat]._ref_cnt, "%r" % list(ext_refs)

            # a class list that skips the head classes
            def classlistiter():
                for c in classList:
                    if c.id not in head_classes:
                        yield c

            def external_use(clazz, featureMap):
                ext_use = False
                class_features = featureMap[clazz.id]
                for feat in class_features:
                    if not class_features[feat].hasref():
                        continue
                    else:
                        external_classes = [x for x in class_features[feat]._refs if x.requestor != clazz.id]
                        if external_classes:
                            ext_use = True
                            break
                return ext_use

            def remove_class_refs(clazz, featureMap):
                for key in featureMap:
                    for feat in featureMap[key]:
                        uf = featureMap[key][feat]
                        for ref in uf._refs[:]:
                            if ref.requestor == clazz.id:
                                uf.decref(clazz.id)

            def check_reachability_graph(head_classes, featureMap, classList):
                gr = graph.digraph()
                [gr.add_node(s) for s in featureMap.keys()]  # assert featureMap.keys() == [classList.id's]
                # add "using" edges (featureMap is a used-by mapping)
                for cls in featureMap:
                    other_using = [dep.name for x in featureMap for y in featureMap[x] for dep in featureMap[x][y]._refs if dep.requestor==cls and dep.name!=cls]
                    for other in other_using:
                        gr.add_edge(cls, other)
                        log_progress()
                access_matrix = gr.accessibility()
                reachable_nodes = set()
                for head_class in head_classes:
                    reachable_nodes.update(access_matrix[head_class])
                # purge unreachable nodes
                for cls in classList[:]:
                    if cls.id not in reachable_nodes:
                        classList.remove(cls)
                        #self._console.info("removing %s" % cls.id)
                    log_progress()

            # ------------------------------------------------------------

            # collect all head classes, so they are not removed
            head_classes = []
            [head_classes.extend(x.initial_deps) for x in script.parts.values()]

            # seed Class._tmp_tree with the right tree
            for clazz in classList:
                log_progress()
                clazz._tmp_tree = clazz.tree(treegen)
                if "variants" in compConf.optimize:
                    clazz._tmp_tree = clazz.optimize(None, ["variants"], compConf.variantset) # using None allows us to re-used a cached tree

            # then, prune as long as we have ref counts == 0 on features
            while True:
                # break the loop if we are not making any more progress ("fixed point")
                if atLimit(featureMap):
                    break

                # (a) first, let clazz.optimize remove those features
                for clazz in classlistiter():
                    clazz._tmp_tree = clazz.optimize(clazz._tmp_tree, ["statics"], featureMap=featureMap)
                    log_progress()

                # (b) then, remove entire unused classes from classlist
                for clazz in classlistiter():
                    if clazz.id in featureMap:
                        if (not featureMap[clazz.id]   # no feature is used
                            or not external_use(clazz, featureMap)  # features only used by the class itself
                           ):
                            classList.remove(clazz)
                            del featureMap[clazz.id]
                            remove_class_refs(clazz, featureMap) # remove all the class's UsedFeature entries as well
                            log_progress()
                            #self._console.info("removing %s" % clazz.id)

                # removing entire classes might remove dependencies of construct, defer, extend, etc,
                # so this might have again zero'ed usage counts of remaining features, so we have to loop

            # Lastly, when we cannot reduce anymore by looking at feature usage,
            # check reachability graph of head classes
            check_reachability_graph(head_classes, featureMap, classList)

            # debug hook
            if 0: debugFeatureMap(featureMap)

            # logging
            self._console.dotclear()
            self._console.indent()
            for cls in classList:
                self._console.info(cls.id)
            self._console.info("Number of classes after static optimization: %d" % len(classList))
            for clazz in featureMap:
                self._console.debug("'%s': used features: %r" % (clazz, featureMap[clazz].keys()))
            self._console.outdent()

            return classList


        ##
        # If variants optimization is done and environment/qx.AllowUrlSettings:true,
        # overriding other config env keys with URL parameters will not work, as the corresponding
        # calls in the code are optimized away.
        def warn_if_qxAllowUrlSettings(jobObj, compConf):
            env = jobObj.get("environment", {})
            qxAllowUrlSettings = bool(env.get("qx.allowUrlSettings", False))
            optimizeVariants   = "variants" in compConf.optimize
            dont_warn_this = "variants-and-url-settings" in jobObj.get("config-warnings/environment", [])
            if qxAllowUrlSettings and optimizeVariants and not dont_warn_this:
                self._console.warn(
                    "Doing variants optimization with qx.allowUrlSettings:true is partly contradictory! " +
                    "You will not be able to URL-override these environment keys:\n%s" % sorted(env.keys())
                    )


        def compileClasses(classList, compConf, log_progress=lambda:None):
            num_proc = self._job.get('run-time/num-processes', 0)
            result = []
            # warn qx.allowUrlSettings - variants optim. conflict (bug#6141)
            if "variants" in compConf.optimize:
                warn_if_qxAllowUrlSettings(self._job, compConf)
            # do "statics" optimization out of line
            if "statics" in compConf.optimize:
                tmp_optimize = compConf.optimize[:]
                #classList = optimizeDeadCode(classList, script._featureMap, compConf, treegen=treegenerator, log_progress=log_progress)
                tmp_optimize.remove("statics")
                if "variants" in tmp_optimize:
                    tmp_optimize.remove("variants") # has been done in optimizeDeadCode
                # do the rest
                for clazz in classList:
                    tree = clazz.optimize(clazz._tmp_tree, tmp_optimize)
                    code = clazz.serializeTree(tree, tmp_optimize, compConf.format)
                    result.append(code)
                    #clazz._tmp_tree = None # reset _tmp_tree
                    log_progress()
                result = u''.join(result)
            else:
                if num_proc == 0:
                    for clazz in classList:
                        #code = clazz.getCode(compConf, treegen=treegenerator_new_ast) # choose parser frontend
                        code = clazz.getCode(compConf, treegen=treegenerator, featuremap=script._featureMap) # choose parser frontend
                        result.append(code)
                        log_progress()
                    result =  u''.join(result)
                else:
                    # multi-core version
                    result =  _compileClassesMP(classList, compConf, log_progress, num_proc)

            return result


        ##
        # helper log function, to log progress here, but also in compileClasses()
        def log_progress(c=[0]):
            c[0]+=1
            self._console.dot()

        ##
        # Go through a set of classes, and either compile some of them into
        # a common .js file, constructing the URI to this file, or just construct
        # the URI to the source file directly if the class matches a filter.
        # Return the list of constructed URIs.
        def compileAndWritePackage(package, compConf, allClassVariants, per_file_prefix):

            def compileAndAdd(compiled_classes, package_uris, prelude='', wrap=''):
                compiled = compileClasses(compiled_classes, compOptions, log_progress)
                if wrap:
                    compiled = wrap % compiled
                if prelude:
                    compiled = prelude + compiled
                filename = self._computeFilePath(script, sha.getHash(compiled)[:12])
                self.writePackage(compiled, filename, script)
                filename = OsPath(os.path.basename(filename))
                shortUri = Uri(filename.toUri())
                entry = "%s:%s" % ("__out__", shortUri.encodedValue())
                package_uris.append(entry)

                return package_uris

            ##
            # Write the package data and the compiled class code in so many
            # .js files, skipping source files.
            def write_uris(package_data, package_classes, per_file_prefix):
                sourceFilter = ClassMatchList(compConf.get("code/except", []))
                compiled_classes = []  # to accumulate classes that are compiled and can go into one .js file
                package_uris = []      # the uri's of the .js files of this package
                for pos,clazz in enumerate(package_classes):

                    # class is taken from the source file
                    if sourceFilter.match(clazz.id):
                        package.has_source = True  # indicate that this package has source files

                        # before processing the source class, cat together data and accumulated classes, if any
                        if package_data or compiled_classes:
                            if per_file_prefix:
                                package_data = per_file_prefix + package_data
                            # treat compiled classes so far
                            package_uris = compileAndAdd(compiled_classes, package_uris, package_data)
                            compiled_classes = []  # reset the collection
                            package_data = ""

                        # now, for a source class, just include the file uri
                        clazzRelpath = clazz.id.replace(".", "/") + ".js"
                        relpath  = OsPath(clazzRelpath)
                        shortUri = Uri(relpath.toUri())
                        entry    = "%s:%s" % (clazz.library.namespace, shortUri.encodedValue())
                        package_uris.append(entry)
                        log_progress()

                    # register it to be lumped together with other classes
                    else:
                        compiled_classes.append(clazz)

                # finally, treat remaining to be concat'ed classes
                else:
                    if compiled_classes:
                        closureWrap = ''
                        if isClosurePackage(package, bootPackageId(script)):
                            closureWrap = u'''qx.Part.$$notifyLoad("%s", function() {\n%%s\n});''' % package.id
                        if per_file_prefix:
                            package_data = per_file_prefix + package_data
                        package_uris = compileAndAdd(compiled_classes, package_uris, package_data, closureWrap)
                
                return package_uris

            # ------------------------------------
            optimize = compConf.get("code/optimize", [])
            format_   = compConf.get("code/format", False)
            variantSet= script.variants
            compOptions  = CompileOptions(optimize=optimize, variants=variantSet, _format=format_)
            compOptions.allClassVariants = allClassVariants
            #self._console.info("Package #%s:" % package.id, feed=False)

            ##
            # This somewhat overlaps with packageUrisToJS
            package_data = getPackageData(package)
            package_data = ("qx.$$packageData['%s']=" % package.id) + package_data
            package_classes = package.classes

            ##
            # Here's the meat
            package.files = write_uris(package_data, package_classes, per_file_prefix)

            return package
            


        # -- Main - runCompiled ------------------------------------------------

        packages   = script.packagesSorted()
        parts      = script.parts
        boot       = script.boot
        variants   = script.variants
        libraries  = script.libraries

        self._variants     = variants
        self._script       = script

        self._console.info("Generate application")
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
        libs = removeDuplicatLibs(libs)  # before generateLibInfoCode() I need to make sure
                                         # duplicates of a library are removed, so the first wins

        # Get translation maps
        locales = compConf.get("code/locales", [])

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

        # Get prefix content for generated files
        prefix_file = compConf.get("paths/file-prefix", None)
        if prefix_file:
            prefix_file = self._config.absPath(prefix_file)
            per_file_prefix = codecs.open(prefix_file, "r", "utf-8").read()
        else:
            per_file_prefix = u''

        # Get global script data (like qxlibraries, qxresources,...)
        globalCodes = {}
        globalCodes["EnvSettings"] = self.generateVariantsCode(script.environment)
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
        self.packagesResourceInfo(script) # attach resource info to packages
        self.packagesI18NInfo(script)     # attach I18N info to packages

        # Potentally create dedicated I18N packages
        if self._job.get("packages/i18n-as-parts", False):
            script = self.generateI18NParts(script, locales, per_file_prefix)
            self.writePackages([p for p in script.packages if getattr(p, "__localeflag", False)], script)

        # ---- create script files ---------------------------------------------
        if script.buildType in ("source", "hybrid", "build"):

            # - Generating packages ---------------------
            self._console.info("Generate packages  ", feed=False)
            #self._console.indent()

            if not len(packages):
                raise RuntimeError("No valid boot package generated.")

            variantKeys      = set(script.variants.keys())
            allClassVariants = script.classVariants()
            allClassVariants.difference_update(variantKeys)
            
            # do "statics" optimization out of line (needs script.classes)
            # communicates with compileAndWritePackage via Class._tmp_tree
            compOpts = CompileOptions(compConf.get("code/optimize",[]), script.variants, compConf.get("code/format",False)) 
            if "statics" in compOpts.optimize:
                script.classesObj = optimizeDeadCode(script.classesObj, script._featureMap, 
                    compOpts, treegen=treegenerator, log_progress=log_progress)
                # make package.classes consistent with script.classesObj
                for package in packages:
                    for clz in package.classes[:]:
                        if clz not in script.classesObj:
                            package.classes.remove(clz)

            # write packages to disk
            for packageIndex, package in enumerate(packages):
                package = compileAndWritePackage(package, compConf, allClassVariants, per_file_prefix)

            #self._console.outdent()
            self._console.dotclear()

            # generate loader
            if inlineBoot(script, compConf):
                # read first script file from script dir
                bfile = packages[0].files[0]  # "__out__:fo%c3%b6bar.js"
                bfile = bfile.split(':')[1]   # "fo%c3%b6bar.js"
                bfile = urllib.unquote(bfile) # "foöbar.js"
                bfile = os.path.join(os.path.dirname(script.baseScriptPath), os.path.basename(bfile))
                if bfile.endswith(".gz"):  # code/path/gzip:true
                    bcode = filetool.gunzip(bfile)
                else:
                    bcode = filetool.read(bfile)
                os.unlink(bfile)
            else:
                bcode = u''
            loaderCode = generateLoader(script, compConf, globalCodes, bcode)
            loaderCode = per_file_prefix + loaderCode
            fname = self._computeFilePath(script, isLoader=1)
            self.writePackage(loaderCode, fname, script, isLoader=1)


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
            tree = classesObj[classId].tree(treegenerator_2)
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


    def _computeFilePath(self, script, hash_=None, packageId="", isLoader=0):

        filepath = script.baseScriptPath
        variants = script.variants

        # replace environment placeholders
        if variants:
            for key in variants:
                pattern = "{%s}" % key
                filepath = filepath.replace(pattern, str(variants[key]))

        # insert a package id
        if packageId != "":
            filepath = filepath.replace(".js", "-%s.js" % packageId)

        # hash component
        #if hash_ and self._job.get("compile-options/paths/scripts-add-hash", False):
        if hash_ :
            filebase, fileext = os.path.splitext(filepath)
            filepath = filebase
            filepath += "." + hash_
            filepath += fileext

        # gzip component
        if script.scriptCompress and not isLoader:
            filepath += ".gz"

        return filepath


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
    def _computeResourceUri(self, lib_, resourcePath, rType="class", appRoot=None):

        # i still use dict-type lib representation to create _output_ pseudo-lib
        if isinstance(lib_, generator.resource.Library.Library):
            lib = {
                'class' : lib_.classPath,
                'uri'   : lib_.uri,
                'path'  : lib_.path,
                'resource' : lib_.resourcePath,
            }
        else:
            lib = lib_

        if 'uri' in lib and lib['uri'] is not None:
            libBaseUri = Uri(lib['uri'])
        elif appRoot:
            libBaseUri = Uri(Path.rel_from_to(self._config.absPath(appRoot), lib['path']))
        else:
            raise RuntimeError, "Need either lib.uri or appRoot, to calculate final URI"
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
    def generateI18NParts(self, script, locales, per_file_prefix):

        ##
        # collect translation and locale info from the packages
        def getTranslationMaps(packages):
            packageTranslations = []
            for package in packages:
                trans_dat = package.data.translations
                loc_dat   = package.data.locales
                packageTranslations.append((trans_dat,loc_dat))
            return packageTranslations

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

        # ----------------------------------------------------------------------

        translationMaps = getTranslationMaps(script.packages)
        translationData ,                                      \
        localeData      = mergeTranslationMaps(translationMaps)
        # for each locale code, collect mappings
        transKeys  = translationData.keys()
        localeKeys = localeData.keys()
        newParts   = {}    # language codes to part objects,    {"C": part}
        newPackages= {}    # language codes to private package objects, {"C": package}
        for localeCode in set(transKeys + localeKeys):
            # also provide a localeCode "part" with corresponding packages
            intpart = Part(localeCode)
            intpart.bit_mask = script.getPartBitMask()
            newParts[localeCode] = intpart
            intpackage = Package(intpart.bit_mask)  # this might be modified later
            newPackages[localeCode] = intpackage
            intpart.packages.append(intpackage)

            data = {}
            data[localeCode] = { 'Translations': {}, 'Locales': {} }  # we want to have the locale code in the data
            if localeCode in transKeys:
                data[localeCode]['Translations']     = translationData[localeCode]
                intpackage.data.translations[localeCode] = translationData[localeCode]
            if localeCode in localeKeys:
                data[localeCode]['Locales']     = localeData[localeCode]
                intpackage.data.locales[localeCode] = localeData[localeCode]

            # file name and hash code
            hash_, dataS  = intpackage.packageContent()  # TODO: this currently works only for pure data packages
            dataS        = dataS.replace('\\\\\\', '\\').replace(r'\\', '\\')  # undo damage done by simplejson to raw strings with escapes \\ -> \
            dataS = per_file_prefix + dataS
            intpackage.compiled.append(dataS)
            intpackage.hash     = hash_
            filepath = self._computeFilePath(script, intpackage.hash, localeCode)
            intpackage.file = os.path.basename(filepath)
            intpackage.files = ["%s:%s" % ("__out__", intpackage.file)]
            setattr(intpackage,"__localeflag", True)   # TODO: temp. hack for writeI18NPackages()

        # Finalize the new packages and parts
        # - add prerequisite languages to parts; e.g. ["C", "en", "en_EN"]
        for partId, intpart in newParts.items():
            if newPackages["C"] not in intpart.packages:
                intpackage = newPackages["C"]
                intpart.packages.append(intpackage)   # all need "C"
                intpackage.part_mask |= intpart.bit_mask     # adapt package's bit string
            if len(partId) > 2 and partId[2] == "_":  # it's a sub-language -> include main language
                mainlang = partId[:2]
                if mainlang not in newPackages:
                    raise RuntimeError("Locale '%s' specified, but not base locale '%s'" % (partId, mainlang))
                if newPackages[mainlang] not in intpart.packages:
                    intpart.packages.append(newPackages[mainlang])   # add main language
                    newPackages[mainlang].part_mask |= intpart.bit_mask     # adapt package's bit string

        # finally, sort packages
        for intpart in newParts.values():
            intpart.packagesSorted

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


    ##
    # Get translation and locale data from all involved classes, and attach it
    # to the corresponding packages.
    def packagesI18NInfo(self, script, addUntranslatedEntries=False):
        locales = script.locales

        if "C" not in locales:
            locales.append("C")

        self._console.info("Processing %s locales  " % len(locales), feed=False)
        self._console.indent()

        for pos, package in enumerate(script.packages):
            self._console.debug("Package %s: " % pos, False)

            pac_dat = self._locale.getTranslationData(package.classes, script.variants, locales, addUntranslatedEntries) # .po data
            loc_dat = self._locale.getLocalizationData(package.classes, locales)  # cldr data
            package.data.translations.update(pac_dat)
            package.data.locales.update(loc_dat)

        self._console.outdent()
        return



    def generateLibInfoCode(self, libs, format, forceResourceUri=None, forceScriptUri=None):
        qxlibs = {}

        for lib in libs:
            # add library key
            qxlibs[lib.namespace] = {}

            # add resource root URI
            if forceResourceUri:
                resUriRoot = forceResourceUri
            else:
                resUriRoot = self._computeResourceUri(lib, OsPath(""), rType="resource", appRoot=self.approot)
                resUriRoot = resUriRoot.encodedValue()
                
            qxlibs[lib.namespace]['resourceUri'] = "%s" % (resUriRoot,)
            
            # add code root URI
            if forceScriptUri:
                sourceUriRoot = forceScriptUri
            else:
                sourceUriRoot = self._computeResourceUri(lib, OsPath(""), rType="class", appRoot=self.approot)
                sourceUriRoot = sourceUriRoot.encodedValue()
            
            qxlibs[lib.namespace]['sourceUri'] = "%s" % (sourceUriRoot,)
            
            # TODO: Add version, svn revision, maybe even authors, but at least homepage link, ...

            # add version info
            if hasattr(lib, 'version'):
                qxlibs[lib.namespace]['version'] = "%s" % lib.version
            if 'sourceViewUri' in lib.manifest.libinfo:
                qxlibs[lib.namespace]['sourceViewUri'] = "%s" % lib.manifest.libinfo['sourceViewUri']

        return qxlibs


    ##
    # For every package, calculate its needed resources and attach the info to
    # the package.
    #
    # The created data structure is in the form suitable for inclusion in the
    # generated scripts.For images, the information includes pre-calculated 
    # sizes, and being part of a combined image.
    def packagesResourceInfo(self, script):
        classes = Class.mapResourcesToClasses (script.libraries, script.classesObj,
                                            self._job.get("asset-let", {}))

        for package in script.packages:
            package_resources = []
            package_classes   = package.classes
            for clazz in package_classes:
                package_resources.extend(clazz.resources)
            package.data.resources = Script.createResourceStruct(package_resources, formatAsTree=False,
                                                         updateOnlyExistingSprites=True)
        return script
    

    def writePackages(self, packages, script):

        for package in packages:
            filePath = os.path.join(os.path.dirname(self._script.baseScriptPath), package.file)
            content  = package.compiled[0]  # TODO: this is build-specific!
            self.writePackage(content, filePath, script)

        return

    
    def writePackage(self, content, filePath, script, isLoader=0):
        console.debug("Writing script file %s" % filePath)
        if script.scriptCompress and not isLoader:
            filetool.gzip(filePath, content)
        else:
            filetool.save(filePath, content)




# Helper class for string.Template, to overwrite the placeholder introducing delimiter
class MyTemplate(string.Template):
    delimiter = "%"

