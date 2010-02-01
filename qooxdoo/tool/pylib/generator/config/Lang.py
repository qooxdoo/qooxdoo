#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
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

# Config File Language Elements (keys, etc.)

import re, types

class Lang(object):

    EXTEND_KEY   = "extend"
    RUN_KEY      = "run"
    LET_KEY      = "let"
    LIBRARY_KEY  = "library"
    JOBS_KEY     = "jobs"
    RESOLVED_KEY = "__resolved__"
    OVERRIDE_KEY = "__override__"
    META_KEYS    = [ RESOLVED_KEY, OVERRIDE_KEY ]
    OVERRIDE_TAG = "="    # tag for key names, to protect on merging
    KEYS_WITH_JOB_REFS  = [RUN_KEY, EXTEND_KEY]


