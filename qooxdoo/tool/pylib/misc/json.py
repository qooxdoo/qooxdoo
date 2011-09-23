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

import sys, os, re, string, types, codecs
import simplejson as json

dumps = json.dumps
dump = json.dump
loads = json.loads
load = json.load


##
# default compact encoding to serialize JS code
#
def dumpsCode(data, **kwargs):
    return dumps(data, sort_keys=True, ensure_ascii=False, separators=(',', ':'), **kwargs)


def dumpsPretty(data, **kwargs):
    return dumps(data, ensure_ascii=False, indent=2, separators=(', ', ' : '), **kwargs)


_eolComment = re.compile(r'(?<![a-zA-Z]:)//.*$', re.M)
_mulComment = re.compile(r'/\*.*?\*/', re.S)

def loadsStripComments(s, **kwargs):
    b = _eolComment.sub('',s)
    b = _mulComment.sub('',b)
    return loads(b, **kwargs)

def loadStripComments(path, **kwargs):
    s = codecs.open(path, "r", "utf-8").read()
    return loadsStripComments(s, **kwargs)

