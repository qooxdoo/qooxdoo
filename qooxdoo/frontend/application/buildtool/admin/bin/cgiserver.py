#!/usr/bin/env python

import CGIHTTPServer
import BaseHTTPServer

import os, sys


class Handler(CGIHTTPServer.CGIHTTPRequestHandler):
    cgi_directories = ["/admin/bin"]


PORT = 8000

httpd = BaseHTTPServer.HTTPServer(("", PORT), Handler)
# fix PATH on cygwin
if sys.platform == 'cygwin':
    os.environ['PATH'] = '/usr/bin:'+os.environ['PATH']
print "serving at port", PORT
httpd.serve_forever()
