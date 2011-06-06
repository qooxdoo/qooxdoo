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

'''a path-like data type, ie. things of the form <component1><sep><component2><sep>...<componentN>'''

import os, sys, re, types, operator

class PathType(object):

    def __init__(self, initVal, sep):

        def init_str(str, sep):
            components = str.split(sep)     # CAVEAT: this does not honor '\' escapes!
            return components

        def init_list(list, sep):
            assert self._isComponentsList(list)
            return list

        assert isinstance(sep, types.StringTypes)

        if isinstance(initVal, types.StringTypes):
            self._components = init_str(initVal, sep)
        elif isinstance(initVal, types.ListType):
            self._components = init_list(initVal, sep)
        else:
            raise TypeError, str(initVal)

        self._sep        = sep
        self._initval    = initVal

    def _isComponentsList(val):
        # it's a list
        result = isinstance(altcomps, types.ListType)
        # ...of strings
        if result:
            result = reduce(operator.and_, 
                            [isinstance(x,types.StringTypes) for x in  altcomps],
                            True)
        return result

    def __repr__(self):
        return self._sep.join(self._components)

    def toString(self, altsep=None):
        if altsep:
            assert isinstance(altsep, types.StringTypes)
            return altsep.join(self._components)
        else:
            return repr(self)

    def components(self, altcomps=None):
        if altcomps:
            assert self._isComponentsList(altcomps)
            self._components = altcomps
        return self._components

    def separator(self, altsep=None):
        if altsep:
            assert isinstance(altsep, types.StringTypes)
            self._sep = altsep
        return self._sep

    ##
    # convenience function to return what's after the first sep
    # this is similar to matchobject mo.group() method: None or 0 returns entire match,
    # 1.. return specific submatch
    def subkey(self, idx=None): 
        if not idx and len(self._components)>1:
            return self._sep.join(self._components[1:])
        elif idx: # allow IndexErrors
            return self._components[idx]



