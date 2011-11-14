#!/usr/bin/env python
# -*- coding: utf-8 -*-

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

import os, sys, re, types, string, codecs, copy, tempfile
from misc.ExtendAction import ExtendAction
from generator.runtime.ShellCmd import ShellCmd
from generator.config.GeneratorArguments import GeneratorArguments

def getQooxdooVersion():
    versionFile = os.path.join(os.path.dirname(__file__), "../../../../version.txt")   # TODO: get rid of hard-coded path
    version = codecs.open(versionFile,"r", "utf-8").read()
    version = version.strip()
    return version

##
# Don't return a real value currently, so to enforce setting this macro explicitly
# (e.g. via command line option). This makes it easier to switch between devel and
# release builds.
def getQooxdooRevision():
    result =  ""
    return result
        

def getUserHome(default=""):
    if sys.platform == "win32":
        home = os.getenv("HOMEDRIVE", "") + os.getenv("HOMEPATH", "")
    else:
        home = os.getenv("HOME", "")
    if home:
        return home
    else:
        return default

def getGenOpts():
    opts_string = ""
    sysargv = sys.argv[1:]
    _,args = GeneratorArguments(option_class=ExtendAction).parse_args(sysargv[:])
    opts = [x for x in sysargv if x not in args] # remove the jobs list
    opts_string = u" ".join(opts)
    return opts_string

class Defaults(object):

    let = {
        ##
        # GENERATOR_OPTS
        # You can use the generator options string returned here for the invocation
        # of child generator (or other, of course) processes. Putting this macro
        # first you can override options subsequently, like
        # "generate.py ${GENERATOR_OPTS} -c otherconfig.json -m FOO:baz"
        # will insert all options passed to this generator invocation, but
        # overriding the config file and the FOO macro.
        u"GENERATOR_OPTS"  : getGenOpts(),
        u"HOME"            : getUserHome("."),
        u"PYTHON_CMD"      : sys.executable,
        u"TMPDIR"          : tempfile.gettempdir(),
        u"QOOXDOO_VERSION" : getQooxdooVersion(),
        u"QOOXDOO_REVISION": getQooxdooRevision(),
        u"USERNAME"        : os.getenv("USERNAME"),
    }

