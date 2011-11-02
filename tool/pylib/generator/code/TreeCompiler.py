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

from ecmascript.frontend import treeutil
from ecmascript.transform.optimizer import variableoptimizer, stringoptimizer, basecalloptimizer
from ecmascript.transform.optimizer import privateoptimizer, protectedoptimizer, propertyoptimizer
from ecmascript.transform.optimizer import featureoptimizer
from generator.code.Class import Class, CompileOptions
from misc import util

class TreeCompiler(object):
    def __init__(self, classes, context):
        self._classes = classes
        self._context = context
        self._cache   = context.get('cache')
        self._console = context.get('console')
        self._jobconf = context.get('jobconf')
        self._optimize   = []


    def setOptimize(self, optimize=None):  # combined getter/setter
        if optimize != None:
            self._optimize = optimize
        return self._optimize


    def compileClasses(self, classes, variants, optimize, format, ):
        if self._jobconf.get('run-time/num-processes', 0) > 0:
            return self._compileClassesMP(classes, variants, optimize, format, self._jobconf.get('run-time/num-processes'))
        else:
            return self._compileClassesXX(classes, variants, optimize, format)


    def _compileClassesXX(self, classes, variants, optimize, format_):
        content = []
        length = len(classes)
        compOptions = CompileOptions()
        compOptions.optimize = optimize
        compOptions.format = format_
        compOptions.variantset = variants
        
        for pos, classId in enumerate(classes):
            self._console.progress(pos + 1, length)
            #content.append( self.getCompiled(classId, variants, optimize, format) )
            content.append( self._classes[fileId].getCode(compOptions) )
            
        return u''.join(content)


    def _compileClassesMP(self, classes, variants, optimize, format, maxproc=8):
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

            cacheId, content = self._checkCache(classId, variants, optimize, format)
            contA[pos][CACHEID] = cacheId
            if content:
                contA[pos][CONTENT] = content
                contA[pos][INCACHE] = True
                continue
            cmd = self._getCompileCommand(classId, variants, optimize, format)
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


    def _getCompileCommand(self, fileId, variants, optimize, format):

        def getToolBinPath():
            path = sys.argv[0]
            path = os.path.abspath(os.path.normpath(os.path.dirname(path)))
            return path

        m   = {}
        cmd = ""
        toolBinPath      = getToolBinPath()
        m['compilePath'] = os.path.join(toolBinPath, "compile.py -q")
        m['filePath']    = os.path.normpath(self._classes[fileId].path)
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


    def _checkCache(self, fileId, variants, optimize, format=False):
        filePath = self._classes[fileId].path

        classVariants     = self._classes[fileId].classVariants()
        relevantVariants  = Class.projectClassVariantsToCurrent(classVariants, variants)
        variantsId = util.toString(relevantVariants)

        optimizeId = self.generateOptimizeId(optimize)

        cacheId = "compiled-%s-%s-%s-%s" % (filePath, variantsId, optimizeId, format)
        compiled, _ = self._cache.read(cacheId, filePath)

        return cacheId, compiled


    def generateOptimizeId(self, optimize):
        optimize = copy.copy(optimize)
        optimize.sort()

        return "[%s]" % ("-".join(optimize))


