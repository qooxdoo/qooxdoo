#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 - 20121&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Daniel Wagner (danielwagner)
#
################################################################################

##
# Reads CSS from one or more source files, minifies it and injects it into a 
# target file, # replacing the macro %{Styles}
##

import sys, os, re, optparse

parser = optparse.OptionParser()

parser.add_option(
    "-q", "--qooxdoo-dir", dest="qooxdooDir", default="../..", type="string",
    help="qooxdoo framework directory"
)

parser.add_option(
    "-t", "--inject-target", dest="target", default=None, type="string",
    help="File to inject optimized CSS into"
)

(options, args) = parser.parse_args()

try:
  from cssmin import cssmin
except ImportError, e:
  modulePath = os.path.join(options.qooxdooDir, "tool/pylib/cssmin")
  sys.path.append(modulePath)
  import cssmin

if len(args) < 2:
  print "At least two arguments needed"
  sys.exit(1)

minifiedCss = ""
for sourceFileName in args:
  css = open(sourceFileName, "r").read()
  minifiedCss += cssmin.cssmin(css)

targetFile = open(options.target, "r")
targetFileContent = targetFile.read()
targetFile.close()

minifiedCss = minifiedCss.replace("'", r"\'")
replaced = re.sub("%{Styles}", minifiedCss, targetFileContent)
targetFile = open(options.target, "w+")
targetFile.write(replaced)
targetFile.close()
