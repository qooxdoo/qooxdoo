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

class RequestHandler(CGIHTTPServer.CGIHTTPRequestHandler):
    pass
    # idea: restrict access from 'localhost' only (parse RequestHandler.request), 
    # to prevent exposing the local file system to outsiders

def get_doc_root(jobconf, confObj):
    libs = jobconf.get("library", [])
    lib_paths = []
    for lib in libs:
        lib_paths.append(confObj.absPath(lib.path))
    croot = os.path.commonprefix(lib_paths)
    return croot

def from_doc_root_to_app_root(jobconf, confObj, doc_root):
    japp_root = jobconf.get("compile-options/paths/app-root", "source")
    app_root = os.path.normpath(os.path.join(confObj.absPath(japp_root), 'index.html'))
    _, _, url_path = Path.getCommonPrefix(doc_root, app_root)
    return url_path

def runWebServer(jobconf, confObj):
    console = Context.console
    owd = os.getcwdu()
    server_port = default_server_port

    libs = jobconf.get("library", [])
    # return if not libs
    for lib in libs:
        lib._init_from_manifest()

    doc_root = get_doc_root(jobconf, confObj)
    app_web_path = from_doc_root_to_app_root(jobconf, confObj, doc_root)
    os.chdir(doc_root)

    server = BaseHTTPServer.HTTPServer(
        ("", server_port), RequestHandler)
    console.info("Starting web server on port '%d', document root is '%s'" % (server_port, doc_root))
    console.info("Access your source application under 'http://localhost:%d/%s'" % (server_port, app_web_path))
    console.info("Terminate the web server with Ctrl-C")
    server.serve_forever()
