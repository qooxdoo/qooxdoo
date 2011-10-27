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
# A simple Trie data type (http://en.wikipedia.org/wiki/Trie), for "." separated
# strings (like class names)
##

##
# Naive implementation using dicts
class Trie(object):
    def __init__(self, sep="."):
        self._data = {}
        self._sep  = sep

    def add(self, name):
        nameparts = name.split(self._sep)
        p = self._data
        for part in nameparts:
            if part not in p:
                p[part] = {}
            p = p[part]

    def data(self):
        return self._data

    def longestMatch(self, name):
        longestmatch = u''
        parts = name.split(self._sep)
        p = self._data
        found = []
        for part in parts:
            if part in p:
                found.append(part)
                p = p[part]
            else:
                break
        if found:
            longestmatch = ".".join(found)

        return longestmatch

    def traverse(self):
        return self._traverse(u'', self._data)

    def _traverse(self, prefix, data):
        for part in data:
            if len(prefix):
                curr = self._sep.join((prefix,part))
            else:
                curr = part
            yield curr
            for el in self._traverse(curr, data[part]):
                yield el

    def __iter__(self):
        return self.traverse()


