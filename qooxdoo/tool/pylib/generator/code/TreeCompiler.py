#!/usr/bin/env python
# -*- coding: utf-8 -*-
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
#    * Sebastian Werner (wpbasti)
#
################################################################################

import os, sys, re, types, copy, optparse, codecs
import time

from ecmascript import compiler
from ecmascript.frontend import treeutil
from ecmascript.transform.optimizer import variableoptimizer, stringoptimizer, basecalloptimizer
from ecmascript.transform.optimizer import privateoptimizer, protectedoptimizer, propertyoptimizer
from ecmascript.transform.optimizer import featureoptimizer
from generator.code.Class import Class
from misc import util

class TreeCompiler(object):
    def __init__(self, classes, classesObj, context):
        self._classes = classes
        self._classesObj = classesObj
        self._context = context
        self._cache   = context.get('cache')
        self._console = context.get('console')
        self._jobconf = context.get('jobconf')
        self._optimize   = []

        #self._loadPrivateFields()


    def _loadPrivateFields(self):
        cacheId  = privateoptimizer.privatesCacheId
        privates, _ = self._cache.read(cacheId, keepLock=True)
        #privates, _ = self._cache.read(cacheId)
        if privates != None:
            #self._console.info("Loaded %s private fields" % len(privates))
            #privateoptimizer.load(privates)
            pass
        else:
            privates = {}
        return privates

        #cacheId = "protected-%s" % self._context['config']._fname
        #protected, _ = self._cache.read(cacheId)
        #if protected != None:
        #    self._console.info("Loaded %s protected fields" % len(protected))
        #    protectedoptimizer.load(protected)


    def setOptimize(self, optimize=None):  # combined getter/setter
        if optimize != None:
            self._optimize = optimize
        return self._optimize


    def _storePrivateFields(self, _globalprivs=None):
        #cacheId = "privates-%s" % self._context['config']._fname  # use path to main config file for context
        cacheId  = privateoptimizer.privatesCacheId
        if _globalprivs:
            globalprivs = _globalprivs
        else:
            globalprivs = privateoptimizer.get()
        self._cache.write(cacheId, globalprivs)  # removes lock by default


    def _storeProtectedFields(self):
        cacheId = "protected-%s" % self._context['config']._fname  # use path to main config file for context
        self._cache.write(cacheId, protectedoptimizer.get())


    def compileClasses(self, classes, variants, optimize, format, ):
        if self._jobconf.get('run-time/num-processes', 0) > 0:
            return self.compileClassesMP(classes, variants, optimize, format, self._jobconf.get('run-time/num-processes'))
        else:
            return self.compileClassesXX(classes, variants, optimize, format)


    #def compileClasses(self, classes, variants, optimize, format):
    def compileClassesXX(self, classes, variants, optimize, format):
        content = []
        length = len(classes)
        
        for pos, classId in enumerate(classes):
            self._console.progress(pos + 1, length)
            content.append( self.getCompiled(classId, variants, optimize, format) )
            
        return u''.join(content)


    def compileClassesMP(self, classes, variants, optimize, format, maxproc=8):
        # experimental
        # improve by incorporating cache handling, as done in getCompiled()
        # hangs on Windows in the last call to reap_processes from the main loop
        import subprocess
        contA = {}
        CACHEID = 0
        INCACHE = 1
        CONTENT = 2
        processes = {}
        length = len(classes)

        self._console.debug("Compiling classes using %d sub-processes" % maxproc)

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

        # go through classes, start individual compiles, collect results
        for pos, classId in enumerate(classes):
            self._console.progress(pos+1, length)
            contA[pos] = {}
            contA[pos][INCACHE] = False
            if len(processes) > maxproc:
                reap_processes()  # collect finished processes' results to make room

            cacheId, content = self.checkCache(classId, variants, optimize, format)
            contA[pos][CACHEID] = cacheId
            if content:
                contA[pos][CONTENT] = content
                contA[pos][INCACHE] = True
                continue
            cmd = self.getCompileCommand(classId, variants, optimize, format)
            #print cmd
            tf = os.tmpfile()
            #print "-- starting process for class: %s" % classId
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

    def getCompileCommand(self, fileId, variants, optimize, format):

        def getToolBinPath():
            path = sys.argv[0]
            path = os.path.abspath(os.path.normpath(os.path.dirname(path)))
            return path

        m   = {}
        cmd = ""
        toolBinPath      = getToolBinPath()
        m['compilePath'] = os.path.join(toolBinPath, "compile.py -q")
        m['filePath']    = os.path.normpath(self._classes[fileId]["path"])
        # optimizations
        optis = []
        for opti in optimize:
            optis.append("--" + opti)
        m['optimizations'] = " ".join(optis)
        # variants
        varis = []
        for vari in variants:
            varis.append("--variant=" + vari + ":" + variants[vari])
        m['variants'] = " ".join(varis)
        # cache
        #m['cache'] = "-c " + self._cache._path  # Cache needs context object, interrupt handler,...
        m['cache'] = ""
        #m['privateskey'] = "--privateskey " + '"privates-' + self._context['config']._fname + '"'
        m['privateskey'] = "--privateskey " + '"' + privateoptimizer.privatesCacheId + '"'

        cmd = "%(compilePath)s %(optimizations)s %(variants)s %(cache)s %(privateskey)s %(filePath)s" % m
        return cmd


    def checkCache(self, fileId, variants, optimize, format=False):
        filePath = self._classes[fileId]["path"]

        classVariants     = self._classesObj[fileId].classVariants()
        relevantVariants  = Class.projectClassVariantsToCurrent(classVariants, variants)
        variantsId = util.toString(relevantVariants)

        optimizeId = self.generateOptimizeId(optimize)

        cacheId = "compiled-%s-%s-%s-%s" % (filePath, variantsId, optimizeId, format)
        compiled, _ = self._cache.read(cacheId, filePath)

        return cacheId, compiled


    def getCompiled(self, fileId, variants, optimize, format=False):

        cacheId, compiled = self.checkCache(fileId, variants, optimize, format)
        if compiled != None:
            return compiled

        #tree = self._treeLoader.getTree(fileId, variants)
        tree = self._classesObj[fileId].tree(variants)

        if len(optimize) > 0:
            # Protect original before optimizing
            #tree = copy.deepcopy(tree)  # not! - it costs a lot of time and doesn't seem necessary at the moment (Bug#3073)

            self._console.debug("Optimizing tree: %s..." % fileId)
            self._console.indent()
            self._optimizeHelper(tree, fileId, variants, optimize)
            self._console.outdent()

        self._console.debug("Compiling tree: %s..." % fileId)
        compiled = self.compileTree(tree, format)
        self._console.indent()
        self._console.debug("Size: %d" % len(compiled))
        self._console.outdent()

        self._cache.write(cacheId, compiled)
        return compiled


    def getCompiledSize(self, fileId, variants, optimize=None, recompile=True):
        if optimize == None:
            optimize = self._optimize      # use object setting as default
        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]

        variantsId = util.toString(variants)
        if optimize:
            optimizeId = self.generateOptimizeId(optimize)
            cacheId = "compiledsize-%s-%s-%s" % (filePath, variantsId, optimizeId)
        else:
            cacheId = "compiledsize-%s-%s" % (filePath, variantsId)

        size, _ = self._cache.readmulti(cacheId, filePath)
        if size != None:
            return size

        if recompile == False:
            return -1

        self._console.debug("Computing compiled size: %s..." % fileId)
        #tree = self._treeLoader.getTree(fileId, variants)
        #compiled = self.compileTree(tree)
        compiled = self.getCompiled(fileId, variants, optimize, format=True) # TODO: format=True is a hack here, since it is most likely
        size = len(compiled)

        self._cache.writemulti(cacheId, size)
        return size


    def compileTree(self, restree, format=False):
        # Emulate options
        parser = optparse.OptionParser()
        parser.add_option("--p1", action="store_true", dest="prettyPrint", default=False)
        parser.add_option("--p2", action="store_true", dest="prettypIndentString", default="  ")
        parser.add_option("--p3", action="store_true", dest="prettypCommentsInlinePadding", default="  ")
        parser.add_option("--p4", action="store_true", dest="prettypCommentsTrailingCommentCols", default="")

        (options, args) = parser.parse_args([])

        return compiler.compile(restree, options, format)


    def _optimizeHelper(self, fileTree, fileId, variants, optimize):
        # 'statics' has to come before 'privates', as it needs the original key names in tree
        if "statics" in optimize:
            self._console.debug("Optimize static methods...")
            self._staticMethodsHelper(fileTree, fileId, variants)

        if "basecalls" in optimize:
            self._console.debug("Optimize base calls...")
            self._baseCallOptimizeHelper(fileTree, fileId, variants)

        if "privates" in optimize:
            self._console.debug("Crypting private fields...")
            self._privateOptimizeHelper(fileTree, fileId, variants)

        #if "protected" in optimize:
        #    self._console.debug("Crypting protected fields...")
        #    self._protectedOptimizeHelper(fileTree, fileId, variants)

        if "strings" in optimize:
            self._console.debug("Optimizing strings...")
            self._stringOptimizeHelper(fileTree, fileId, variants)

        if "variables" in optimize:
            self._console.debug("Optimizing local variables...")
            self._variableOptimizeHelper(fileTree, fileId, variants)

        if "properties" in optimize:
            self._console.debug("Optimize properties...")
            self._propertyOptimizeHelper(fileTree, fileId, variants)
            
        return fileTree


    def generateOptimizeId(self, optimize):
        optimize = copy.copy(optimize)
        optimize.sort()

        return "[%s]" % ("-".join(optimize))


    def _baseCallOptimizeHelper(self, tree, id, variants):
        basecalloptimizer.patch(tree)


    def _variableOptimizeHelper(self, tree, id, variants):
        variableoptimizer.search(tree)


    def _privateOptimizeHelper(self, tree, id, variants):
        globalprivs = self._loadPrivateFields()
        #globalprivs = None
        privateoptimizer.patch(tree, id, globalprivs)
        # the next line also ensures privates consistency across runs, when already
        # optimized classes are re-used in the build
        self._storePrivateFields(globalprivs)


    def _protectedOptimizeHelper(self, tree, id, variants):
        protectedoptimizer.patch(tree, id)
        self._storeProtectedFields()


    def _propertyOptimizeHelper(self, tree, id, variants):
        propertyoptimizer.patch(tree, id)
        
    
    def _staticMethodsHelper(self, tree, id, variants):
        if self._classesObj[id].type == 'static':
            featureoptimizer.patch(tree, id, self._featureMap[id])


    def _stringOptimizeHelper(self, tree, id, variants):
        stringMap = stringoptimizer.search(tree)

        if len(stringMap) == 0:
            return

        stringList = stringoptimizer.sort(stringMap)
        stringoptimizer.replace(tree, stringList)

        # Build JS string fragments
        stringStart = "(function(){"
        stringReplacement = stringoptimizer.replacement(stringList)
        stringStop = "})();"

        # Compile wrapper node
        wrapperNode = treeutil.compileString(stringStart+stringReplacement+stringStop, id + "||stringopt")

        # Reorganize structure
        funcBody = wrapperNode.getChild("operand").getChild("group").getChild("function").getChild("body").getChild("block")
        if tree.hasChildren():
            for child in copy.copy(tree.children):
                tree.removeChild(child)
                funcBody.addChild(child)

        # Add wrapper to tree
        tree.addChild(wrapperNode)
