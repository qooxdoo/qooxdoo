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
msg = ("Error: The SCSS-compiler, which was formerly shipped with the SDK, is no longer supported. " +
       "Please install and use Sass, the reference implementation for SCSS-compilation, instead.\n" +
       "If you are running the 'watch-scss' job you have to adapt its configuration in order to use Sass. " +
       "Create a new app with 'create-application.py' and copy the new 'watch-scss' job definition from the 'config.json' over. " +
       "Also copy the 'compile-scss' job which triggers a one-shot compilation. Don't forget to adapt the config exports.\n"
       "More details: http://manual.qooxdoo.org/current/pages/mobile/theming.html")
sys.exit(msg)
