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

# Config File Language Elements (keys, etc.)

import re, types, copy, string
from generator import Context

console = None

class Key(object):

    EXTEND_KEY   = "extend"
    RUN_KEY      = "run"
    LET_KEY      = "let"
    LIBRARY_KEY  = "library"
    INCLUDE_KEY  = "include"
    JOBS_KEY     = "jobs"
    CONFIG_WARNINGS = "config-warnings"
    RESOLVED_KEY = "__resolved__"
    OVERRIDE_KEY = "__override__"
    META_KEYS    = [ RESOLVED_KEY, OVERRIDE_KEY ]
    OVERRIDE_TAG = "="    # tag for key names, to protect on merging
    KEYS_WITH_JOB_REFS  = [RUN_KEY, EXTEND_KEY]
    TOP_LEVEL_KEYS = {
                LET_KEY     : types.DictType,
                JOBS_KEY    : types.DictType,
                INCLUDE_KEY : types.ListType,
                "name"      : types.StringTypes,
                "export"    : types.ListType,
                "default-job" : types.StringTypes,
                CONFIG_WARNINGS : types.DictType,
                }
    JOB_LEVEL_KEYS = {
                "add-css"       : types.ListType,
                "add-script"    : types.ListType,
                "api"           : types.DictType,
                "asset-let"     : types.DictType,
                "cache"         : types.DictType,
                "clean-files"   : types.DictType,
                "collect-environment-info"  : types.DictType,
                "combine-images": types.DictType,
                "compile"       : types.DictType,
                "compile-options"  : types.DictType,
                CONFIG_WARNINGS : types.DictType,
                "copy-files"    : types.DictType,
                "copy-resources"   : types.DictType,
                "dependencies"  : types.DictType,
                "desc"          : types.StringTypes,
                "environment"   : types.DictType,
                "exclude"       : types.ListType,
                EXTEND_KEY      : types.ListType,
                "fix-files"     : types.DictType,
                INCLUDE_KEY     : types.ListType,
                LET_KEY         : types.DictType,
                LIBRARY_KEY     : types.ListType,
                "lint-check"    : types.DictType,
                "log"           : types.DictType,
                "migrate-files" : types.DictType,
                "packages"      : types.DictType,
                "pretty-print"  : types.DictType,
                "provider"      : types.DictType,
                "require"       : types.DictType,
                RUN_KEY         : types.ListType,
                "settings"      : types.DictType,
                "shell"         : types.DictType,
                "slice-images"  : types.DictType,
                "simulate"      : types.DictType,
                "translate"     : types.DictType,
                "use"           : types.DictType,
                "variants"      : types.DictType,
                }


    @staticmethod
    def hasMacro(val):
        return val.find(r'${') > -1


##
# Class representing a map with macros (typically under the 'let' key)
#
class Let(Key):

    def __init__(self, letMap):
        global console
        assert isinstance(letMap, types.DictType)
        self._data = copy.deepcopy(letMap)
        console = Context.console

    ##
    #   do macro expansion within the "let" dict;
    #   this is a self-modifying operation, tampering self._data"""
    def expandMacrosInLet(self):

        letDict = self._data
        keys = letDict.keys()
        for k in keys:
            kval = letDict[k]
            
            # construct a temporary mini-dict of translation maps for the calls to 
            # expandMacros() further down
            if isinstance(kval, types.StringTypes):
                kdicts = {'str': {k:kval}, 'bin': {}}
            else:
                kdicts = {'str': {}, 'bin': {k:kval}}
                
            # cycle through other keys of this dict
            for k1 in keys:
                if k != k1: # no expansion with itself!
                    enew = self.expandMacros(letDict[k1], kdicts)
                    if enew != letDict[k1]:
                        console.debug("expanding: %s ==> %s" % (k1, str(enew)))
                        letDict[k1] = enew

        return letDict
        

    def expandMacros(self, dat, maps=None):
        # TODO: this code duplicates a lot of Job._expandMacrosInValues
        """ apply macro expansion on arbitrary values; takes care of recursive data like
            lists and dicts; only actually applies macros when a string is encountered on 
            the way (look for calls to _expandString());
            this is a referential transparent operation, as long as self._data is unaltered"""
        data = copy.deepcopy(dat) # make sure we return a copy of the argument data
        
        maps = maps or self._getLetMaps()

        # arrays
        if isinstance(data, types.ListType):
            for e in range(len(data)):
                enew = self.expandMacros(data[e], maps)
                if enew != data[e]:
                    console.debug("expanding: %s ==> %s" % (str(data[e]), str(enew)))
                    data[e] = enew
                    
        # dicts
        elif isinstance(data, types.DictType):
            for e in data.keys(): # have to use keys() explicitly since i modify data in place
                # expand in values
                enew = self.expandMacros(data[e], maps)
                if enew != data[e]:
                    console.debug("expanding: %s ==> %s" % (str(data[e]), str(enew)))
                    data[e] = enew

                # expand in keys
                if (isinstance(e, types.StringTypes)
                        and Key.hasMacro(e)):
                    enew = self._expandString(e, maps['str'], {}) # no bin expand here!
                    data[enew] = data[e]
                    del data[e]
                    console.debug("expanding key: %s ==> %s" % (e, enew))

        # strings
        elif isinstance(data, types.StringTypes):
            data = self._expandString(data, maps['str'], maps['bin'])

        # leave everything else alone
        else:
            pass

        return data


    def _getLetMaps(self, letMap=None):
        # TODO: this code duplicates code from Job.resolveMacros()
        '''return the let map as a pair of string - bin maps'''
        letMap = letMap or self._data

        # separate strings from other values
        letmaps = {}
        letmaps['str'] = {}
        letmaps['bin'] = {}
        for k in letMap:
            if isinstance(letMap[k], types.StringTypes):
                letmaps['str'][k] = letMap[k]
            else:
                letmaps['bin'][k] = letMap[k]
                    
        return letmaps

    def _expandString(self, s, mapstr, mapbin):
        assert isinstance(s, types.StringTypes)
        if not Key.hasMacro(s):  # optimization: no macro -> return
            return s
        macro = ""
        sub   = ""
        possiblyBin = re.match(r'^\${(.*)}$', s)   # look for '${...}' as a bin replacement
        if possiblyBin:
            macro = possiblyBin.group(1)
        if macro and (macro in mapbin.keys()):
            replval = mapbin[macro]
            if isinstance(replval, (types.DictType, types.ListType)):
                sub = copy.deepcopy(replval)  # make sure macro values are not affected during value merges later
            else:
                sub = replval
        else:
            templ = string.Template(s)
            sub = templ.safe_substitute(mapstr)
        return sub



