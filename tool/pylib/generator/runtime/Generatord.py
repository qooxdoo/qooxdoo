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

##
# Generatord  -- Generator Daemon Module
#
#   Allows to run generator.py in daemon mode.
##

import sys, os, re, string, types, copy

from generator import Context
from generator.Generator import Generator
from generator.code.Class import Class
from generator.runtime.Cache import Cache

# -- BaseHTTPServer stuff ----
import BaseHTTPServer, cgi

# -- Pyro stuff ----
import Pyro.core, Pyro.naming

generator_context = None

class Generatord(object):

    def __init__(self, context, num=0):
        global generator_context
        generator_context = context
        self.num = num
        generator_context['cache'] = Cache("/tmp/qx1.5/cache", **generator_context) # TODO: cache path
        #self.servAddr = ('',8008)
        #self.serv = BaseHTTPServer.HTTPServer(self.servAddr, httpServerHandler)
        generator_context['interruptRegistry'].register(self.shut_down)

    def serve(self):
        #self.serv.serve_forever()
        daemon = Pyro.core.Daemon()
        self.daemon = daemon
        ns = Pyro.naming.NameServerLocator().getNS()
        daemon.useNameServer(ns)
        uri = daemon.connect(GeneratordWorker(self.num), "genworker"+str(self.num))
        daemon.requestLoop()

    def shut_down(self):
        self.daemon.shutdown(True)


# This is adopted from the standard Pyro example
class GeneratordWorker(Pyro.core.ObjBase):

    def __init__(self, num):
        Pyro.core.ObjBase.__init__(self)
        self.num = num
        self.job = generator_context['jobconf']
        self.classList = self._scanLibs(self.job)

    def _scanLibs(self, job):
        genobj = Generator(generator_context)
        (ns,classes,d,tr,lib) = genobj.scanLibrary(job.get("library", []))
        return classes


    def joke(self,name):
        return "sorry "+name+", I don't know any jokes!"

    def tree(self, classId, classPath, variantSet):
        c = Class(classId, classPath, None, generator_context, {})
        t = c.tree()
        return t

    def dependencies(self, classId, classPath, variantSet, force=False):
        print "\nrunning on Pyro server", str(self.num)
        c = Class(classId, classPath, None, generator_context, self.classList)
        d, cached = c.dependencies(variantSet, force)
        return d, cached
        
    def run(self, jobname):
        print "\nrunning on Pyro server", str(self.num), ":", jobname
        config = generator_context['config']
        console = generator_context['console']
        expjobs = config.resolveExtendsAndRuns([jobname])
        config.includeSystemDefaults(expjobs)
        config.resolveMacros(expjobs)
        config.resolveLibs(expjobs)
        config.checkSchema(expjobs, checkJobTypes=True)
        config.cleanUpJobs(expjobs)
        console.resetFilter()
        for jobn in expjobs:
            console.head("Executing: %s" % jobn, True)
            job = generator_context['config'].getJob(jobn)
            assert job is not None
            job_context = copy.copy(generator_context)
            job_context.update({'jobconf':job})
            genobj = Generator(job_context)
            genobj.run()
        

# This is from B.Dayley's "Python Phrasebook"
class httpServerHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    
    def do_POST(self):
        self.query_string = self.rfile.read(int(self.headers['Content-Length']))
        self.args = dict(cgi.parse_qsl(self.query_string))
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        sys.stdout = self.wfile
        self.wfile.write("<h2>Handling Post</h2><p>")
        self.wfile.write("<li>Location: <b>%s</b>" % (self.path,))
        self.wfile.write("<li>Arguments: <b>%s</b><hr>" % (self.args,))
        #execfile(self.path, self.args)




