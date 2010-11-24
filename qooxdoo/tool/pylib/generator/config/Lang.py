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
    INCLUDE_KEY  = "include"
    JOBS_KEY     = "jobs"
    RESOLVED_KEY = "__resolved__"
    OVERRIDE_KEY = "__override__"
    META_KEYS    = [ RESOLVED_KEY, OVERRIDE_KEY ]
    OVERRIDE_TAG = "="    # tag for key names, to protect on merging
    KEYS_WITH_JOB_REFS  = [RUN_KEY, EXTEND_KEY]
    TOP_LEVEL_KEYS = {
                LET_KEY     : types.DictType,
                JOBS_KEY    : types.DictType,
                INCLUDE_KEY : types.ListType,
                "name"      : types.StringTypes,
                "export"    : types.ListType,
                "default-job" : types.StringTypes,
                }
    JOB_LEVEL_KEYS = {
                "add-script"    : types.ListType,
                "api"           : types.DictType,
                "asset-let"     : types.DictType,
                "cache"         : types.DictType,
                "clean-files"   : types.DictType,
                "collect-environment-info"  : types.DictType,
                "combine-images": types.DictType,
                "compile"       : types.DictType,
                "compile-options"  : types.DictType,
                "copy-files"    : types.DictType,
                "copy-resources"   : types.DictType,
                "dependencies"  : types.DictType,
                "desc"          : types.StringTypes,
                "exclude"       : types.ListType,
                EXTEND_KEY      : types.ListType,
                "fix-files"     : types.DictType,
                INCLUDE_KEY     : types.ListType,
                LET_KEY         : types.DictType,
                LIBRARY_KEY     : types.ListType,
                "lint-check"    : types.DictType,
                "log"           : types.DictType,
                "migrate-files" : types.DictType,
                "packages"      : types.DictType,
                "pretty-print"  : types.DictType,
                "provider"      : types.DictType,
                "require"       : types.DictType,
                RUN_KEY         : types.ListType,
                "settings"      : types.DictType,
                "shell"         : types.DictType,
                "slice-images"  : types.DictType,
                "simulate"      : types.DictType,
                "translate"     : types.DictType,
                "use"           : types.DictType,
                "variants"      : types.DictType,
                }


