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

import sys, os, re, string, types

from generator import Context
from generator.code.Class import Class
from generator.runtime.Cache import Cache

# -- BaseHTTPServer stuff ----
import BaseHTTPServer, cgi

# -- Pyro stuff ----
import Pyro.core, Pyro.naming

generator_context = None

class Generatord(object):

    def __init__(self, context):
        global generator_context
        generator_context = context
        generator_context['cache'] = Cache("/tmp/qx1.5/cache", **generator_context) # TODO: cache path
        self.servAddr = ('',8008)
        #self.serv = BaseHTTPServer.HTTPServer(self.servAddr, httpServerHandler)

    def serve(self):
        #self.serv.serve_forever()
        daemon = Pyro.core.Daemon()
        ns = Pyro.naming.NameServerLocator().getNS()
        daemon.useNameServer(ns)
        uri = daemon.connect(JokeGen(), "jokegen")
        daemon.requestLoop()


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


# This is adopted from the standard Pyro example
class JokeGen(Pyro.core.ObjBase):
    def joke(self,name):
        return "sorry "+name+", I don't know any jokes!"

    def tree(self, classId, classPath, variantSet):
        c = Class(classId, classPath, None, generator_context, {})
        t = c.tree(variantSet)
        return t




