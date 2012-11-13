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
# Just a tiny wrapper around demjson/jsonlint, to extend PYTHONPATH
##

import sys, os, subprocess
import qxenviron

new_environ = os.environ.copy()
new_environ['PYTHONPATH'] = qxenviron.QXPYLIB + (
    (os.pathsep + new_environ['PYTHONPATH']) if 'PYTHONPATH' in new_environ else ''
)
args = [sys.executable, '%s/demjson/jsonlint' % qxenviron.QXPYLIB, '-S', '-v'] + sys.argv[1:]
        # -S non-strict, e.g. allow comments
        # -v print to stdout (without it's only $?)
p = subprocess.Popen(args, shell=False, env=new_environ,)
sys.exit( p.wait() )

