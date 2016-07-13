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
#    MIT: https://opensource.org/licenses/MIT
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
from __future__ import print_function

import sys, os

for f in sys.argv[1:]:
    if not os.path.isfile(f):
        raise IOError("not a regular file: %s" % f)
    print(open(f, "rb").read())
