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
#    * Daniel Wagner (d_wagner)
#
################################################################################

import os, sys, re, types, string, copy

##
# Map class with path-like accessor
##

class ExtMap(object):
    "Map class with path-like accessor"

    def __init__(self, data=None):
        if data:
            assert isinstance(data, types.DictType)
        else:
            data = {}

        self._data = data

        
    def __getitem__(self, key):
        if key in self._data:
            return self._data[key]

        data = self._data
        splits = key.split('/')
        for part in splits:
            if part == "." or part == "":
                pass
            elif isinstance(data, types.DictType) and part in data:
                data = data[part]
            else:
                raise KeyError, key

        return data


    def get(self, key, default=None, confmap=None):
        """Returns a (possibly nested) data element from dict
        """
        if confmap:
            data = confmap
        else:
            data = self
        
        try:
            return data.__getitem__(key)
        except KeyError:
            return default
    
    
    def __setitem__(self, key, value):
        data = self._data
        if key in data:
            data[key] = value
            
        else:
            splits    = key.split('/')
            splitslen =  len(splits)
            for i in range(splitslen):
                part =  splits[i]
                if part == "." or part == "":
                    pass
                elif isinstance(data, types.DictionaryType):
                    if i == splitslen-1:  # it's the last
                        data[part] = value
                    else:
                        if part not in data:
                            data[part] = {}
                        data = data[part]
                else:  # leaf type map value
                    raise ValueError("Cannot insert entry in non-dict data value: %r" % data)

        return

    
    def __delitem__(self, key):
        data = self._data

        if key in data:
            del data[key]
        else:
            splits = key.split('/')
            splitslen = len(splits)
            for i in range(splitslen):
                part = splits[i]
                if part in (".", ""):
                    pass
                elif isinstance(data, types.DictionaryType):
                    if i == splitslen-1: # it's the last
                        del data[part]
                    else:
                        if part not in data:
                            return # nothing to delete
                        else:
                            data = data[part]
                else:  # the given key doesn't lead to a map
                    raise ValueError("Cannot delete from non-dict data value: %s" % "/".join(splits[:i+1]))


    def delete(self, key):
        self.__delitem__(key)


    def set(self, key, value):
        """Sets a (possibly nested) data element in the dict
        """
        return self.__setitem__(key, value)

    ##
    # Rename a map key.
    def rename(self, key, newkey):
        val = self.get(key)
        self.set(newkey, val)
        self.delete(key)
        return


    def __contains__(self, item):
        try:
            self.__getitem__(item)
            return True
        except KeyError:
            return False
    
    
    def extract(self, key):
        return ExtMap(self.get(key, {}))

    def getData(self):
        return self._data


