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

##
# An abstraction layer over the Json package we're using (e.g. simplejson)
##

import simplejson as json

dumps = json.dumps
dump = json.dump
loads = json.loads
load = json.load


##
# default compact encoding to serialize JS code
#

def dumpsCode(data):
    return dumps(data, sort_keys=True, ensure_ascii=False, separators=(',', ':'))

