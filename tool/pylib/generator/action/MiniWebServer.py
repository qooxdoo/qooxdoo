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

##
# Start a Mini Web Server to export applications and their libraries.
##

import sys, os, re, types, codecs
import BaseHTTPServer, CGIHTTPServer

from misc import Path
from generator import Context

default_server_port = 8080

log_levels = {
  "debug"   : 10,
  "info"    : 20,
  "warning" : 30,
  "error"   : 40,
  "fatal"   : 50,
}
log_level = "error"



class RequestHandler(CGIHTTPServer.CGIHTTPRequestHandler):
    # idea: restrict access from 'localhost' only (parse RequestHandler.request), 
    # to prevent exposing the local file system to outsiders

    # @overridden from BaseHTTPServer
    def log_request(self, code='-', size='-'):
        if log_levels[log_level] <= log_levels['info']:
            self.log_message('"%s" %s %s', self.requestline, str(code), str(size))

    # @overridden from BaseHTTPServer
    def log_error(self, format, *args):
        if log_levels[log_level] <= log_levels['error']:
            self.log_message(format, *args)


def get_doc_root(jobconf, confObj):
    libs = jobconf.get("library", [])
    lib_paths = []
    for lib in libs:
        lib_paths.append(confObj.absPath(lib.path))
    croot = os.path.dirname(os.path.commonprefix(lib_paths))
    return croot

def from_doc_root_to_app_root(jobconf, confObj, doc_root):
    japp_root = jobconf.get("compile-options/paths/app-root", "source")
    app_root = os.path.normpath(os.path.join(confObj.absPath(japp_root), 'index.html'))
    _, _, url_path = Path.getCommonPrefix(doc_root, app_root)
    url_path = Path.posifyPath(url_path)
    return url_path

def runWebServer(jobconf, confObj):
    global log_level
    console = Context.console
    owd = os.getcwdu()
    log_level = jobconf.get("web-server/log-level", "error")
    server_port = jobconf.get("web-server/server-port", default_server_port)
    if jobconf.get("web-server/allow-remote-access", False):
        server_interface = ""
    else:
        server_interface = "localhost"

    libs = jobconf.get("library", [])
    # return if not libs
    for lib in libs:
        lib._init_from_manifest()

    doc_root = get_doc_root(jobconf, confObj)
    app_web_path = from_doc_root_to_app_root(jobconf, confObj, doc_root)
    os.chdir(doc_root)

    server = BaseHTTPServer.HTTPServer(
        (server_interface, server_port), RequestHandler)
    console.info("Starting web server on port '%d', document root is '%s'" % (server_port, doc_root))
    if server_interface == 'localhost':
        console.info("For security reasons, connections are only allowed from 'localhost'")
    else:
        console.warn("This server allows remote file access and indexes for the document root and beneath!")
    console.info("Access your source application under 'http://localhost:%d/%s'" % (server_port, app_web_path))
    console.info("Terminate the web server with Ctrl-C")
    server.serve_forever()
