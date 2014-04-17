#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
# qooxdoo - the new era of web development
#
# http://qooxdoo.org
#
# Copyright:
#   2014 1&1 Internet AG, Germany, http://www.1und1.de
#
# License:
# LGPL: http://www.gnu.org/licenses/lgpl.html
# EPL: http://www.eclipse.org/org/documents/epl-v10.php
# See the LICENSE file in the project's top-level directory for details.
#
# Authors:
# * Richard Sternagel (rsternagel)
#
################################################################################

##
# scss.py -- a .scss to .css compiler
#
# Command-line wrapper around the pyScss module (SCSS compiler)
##

import sys

# BUG #7997
# @deprecated {4.0}
msg = ("Error: SCSS-compilation is no longer supported. " +
       "Please install Sass, the reference implementation for SCSS, instead.")
sys.exit(msg)
