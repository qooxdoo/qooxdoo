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
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# Wrapper proxy for tool/bin/create-application.py
##

import sys, os
scriptDir = os.path.dirname(os.path.abspath(__file__))
scriptDir += "/tool/bin"
sys.path.insert(0, scriptDir)
filename = scriptDir+"/create-application.py"
exec(compile(open(filename).read(), filename, "exec"))
