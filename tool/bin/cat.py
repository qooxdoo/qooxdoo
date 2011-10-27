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
# NAME
#  cat.py -- a 'cat'/'type' in Python
#
# SYNTAX
#  python cat.py file1 file2 ...  -- print the contents of file1 file2 ... to 
#                                    STDOUT
##

import sys, os

for f in sys.argv[1:]:
    if not os.path.isfile(f):
        raise IOError("not a regular file: %s" % f)
    print open(f, "rb").read()
