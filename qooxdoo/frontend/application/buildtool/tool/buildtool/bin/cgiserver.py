#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
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
# NAME
#   cgiserver.py -- thin wrapper around CGIHTTPServer module, to specify CGI
#                   path
#
# SYNTAX
#   python cgiserver.py
#
##


import CGIHTTPServer
import BaseHTTPServer

import os, sys


class Handler(CGIHTTPServer.CGIHTTPRequestHandler):
    cgi_directories = ["/tool/buildtool/bin"]


PORT = 8000

httpd = BaseHTTPServer.HTTPServer(("", PORT), Handler)
# fix PATH on cygwin
if sys.platform == 'cygwin':
    os.environ['PATH'] = '/usr/bin:'+os.environ['PATH']
print "serving at port", PORT
httpd.serve_forever()
