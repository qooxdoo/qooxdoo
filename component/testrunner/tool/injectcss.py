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
# Reads CSS from a source file, minifies it and injects it into a target file,
# replacing the macro %{Styles}
##

import sys, os, re

try:
  from cssmin import cssmin
except ImportError, e:
  sys.path.append("../../tool/pylib/cssmin")
  import cssmin

sourceFileName = sys.argv[1]
targetFileName = sys.argv[2]

css = open(sourceFileName, "r").read()
minifiedCss = cssmin.cssmin(css)
targetFile = open(targetFileName, "r")
targetFileContent = targetFile.read()
targetFile.close()

targetFile = open(targetFileName, "w+")
replaced = re.sub("%{Styles}", minifiedCss, targetFileContent)
targetFile.write(replaced)
targetFile.close()
