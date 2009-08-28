#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
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

import os, sys, re, types, string, copy, tempfile

def getQooxdooVersion():
    versionFile = os.path.join(os.path.dirname(__file__), "../../../../version.txt")   # TODO: get rid of hard-coded path
    version = open(versionFile).read()
    version = version.strip()
    return version

class Defaults(object):

    let = {
        "TMPDIR"          : tempfile.gettempdir(),
        "QOOXDOO_VERSION" : getQooxdooVersion()
    }
