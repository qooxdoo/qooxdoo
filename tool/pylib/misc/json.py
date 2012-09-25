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
# An abstraction layer over the Json package we're using (e.g. simplejson)
##

import sys, os, re, string, types, codecs
import simplejson as sjson
import demjson as djson

dumps = sjson.dumps
dump = sjson.dump
#loads = sjson.loads
loads = djson.decode
def load(path, **kwargs):
    s = codecs.open(path, "r", "utf-8").read()
    return loads(s, **kwargs)

DecodeError = djson.JSONDecodeError
#DecodeError = ValueError  # for sjson
EncodeError = TypeError # for sjson

##
# default compact encoding to serialize JS code
#
def dumpsCode(data, **kwargs):
    return dumps(data, sort_keys=True, ensure_ascii=False, separators=(',', ':'), **kwargs)


def dumpsPretty(data, **kwargs):
    return dumps(data, ensure_ascii=False, indent=2, separators=(', ', ' : '), **kwargs)


_eolComment = re.compile(r'(?<![a-zA-Z]:)//.*$', re.M)
_mulComment = re.compile(r'/\*.*?\*/', re.S)

def loadsStripComments_1(s, **kwargs):
    b = _eolComment.sub('',s)
    b = _mulComment.sub('',b)
    return sjson.loads(b, **kwargs)

def loadsStripComments(s, **kwargs):
    return djson.decode(s, **kwargs)

def loadStripComments(path, **kwargs):
    s = codecs.open(path, "r", "utf-8").read()
    return loadsStripComments(s, **kwargs)

