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
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# SYNTAX
#  $0 <update.log> -- check that the time stamps in <update.log> are consecutive.
#
#  Prints "missing" if no update has been entered for a given day, otherwise
#  "ok". If ok, but all data set values were undefined (U), appends "(U)".
##

import sys, os, re, string, types
import datetime, time

def print_appnames():
    print "Apps:", ["feedreader","demobrowser","showcase","framework-tests","playground","apiviewer","widgetbrowser","mobileshowcase"]

print_appnames()
oneday = datetime.timedelta(days=1)
cmptime = None

for line in open(sys.argv[1],"r").readlines():
    # mirror line:
    # rrdtool update nightly_builds.rrd 1296594002:250:3086:222:447:454:176:123:245
    cmd = line.split()
    ds  = cmd[3].split(":")
    tstamp = ds[0]
    currtime = datetime.datetime.fromtimestamp(float(tstamp))
    if cmptime:
        cmptime = cmptime + oneday
    else:
        cmptime = currtime
    while currtime.date() > cmptime.date():
        print cmptime.ctime(), ": missing"
        cmptime = cmptime + oneday
    buildtimes = map(lambda x: ("%d.%.2d" % (int(x)/60, int(x) % 60)) if re.match(r'\d+',x) else x, ds[1:])
    if not filter(lambda x:x!='U', buildtimes):
        buildtimes = ['U']
    print currtime.ctime(), ": ok", "%r" % buildtimes
    cmptime = currtime

print_appnames()
