#!/usr/bin/env python
# encoding: utf-8
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import sys
import os
import optparse


def main():

    parser = optparse.OptionParser("usage: %prog [options] PROFILE.dat INCLUDES.dat")

    parser.add_option("-s", "--source-version", action="store_true", dest="sourceVersion", default=False, help="Generate source version.")
    (options, args) = parser.parse_args()

    profileFile = args[0]
    includeFile = args[1]
    sourceVersion = False

    for line in iter(open(profileFile)):
        line = line.strip()
        if line.startswith("include") or line.startswith("exclude"):
            continue
        print line

    for line in iter(open(includeFile)):
        line = line.strip()
        if not line.startswith("qx."):
            continue
        print "include = %s" % line

    if options.sourceVersion:
        print "generate-source-script"
        print "source-script-file = build/script/qx.js"
    else:
        print "generate-compiled-script"
        print "compiled-script-file = build/script/qx.js"



if __name__ == '__main__':
    main()
