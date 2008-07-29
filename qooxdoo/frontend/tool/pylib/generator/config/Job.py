#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
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

import os, sys, re, types, string, copy

#from generator.config.Config import ExtMap

console = None

class Job(object):

    # keys of the job data map
    EXTEND_KEY   = "extend"
    RUN_KEY      = "run"
    LET_KEY      = "let"
    RESOLVED_KEY = "resolved"
    KEYS_WITH_JOB_REFS = [RUN_KEY, EXTEND_KEY]

    def __init__(self, name, data, console_, config=None):
        global console
        self.name    = name
        self._console= console_
        self._data   = data
        self._config = config

        console      = console_


    def mergeJob(self, sourceJob):
        sData = sourceJob.getData()
        target= self.getData()
        for key in sData:
            # merge 'library' key rather than shadowing
            if key == 'library'and target.has_key(key):
                target[key] = sData[key] + target[key]
            
            # merge 'settings' and 'let' key rather than shadowing
            # wpbasti: variants listed here, but missing somewhere else. Still missing use and require keys.
            if (key in ['variants','settings','let']) and target.has_key(key):
                target[key] = self._mapMerge(sData[key],target[key])
            if not target.has_key(key):
                target[key] = sData[key]


    def _mapMerge(self, source, target):
        """merge source map into target, but don't overwrite existing
           keys in target (unlike .update())"""
        # wpbasti: Why not just use update() in reversed order (maybe copy target first)???
        t = target.copy()
        for (k,v) in source.items():
            if not t.has_key(k):
                t[k] = v
        return t


    def resolveExtend(self, entryTrace=[]):
        # resolve the 'extend' entry of a job
        config = self._config

        if self.hasFeature(self.RESOLVED_KEY):
            return

        self.includeGlobalLet() # make sure potential global let is included first

        if self.hasFeature("extend"):
            # loop through 'extend' entries
            extends = self.getFeature("extend")
            for entry in extends:
                # cyclic check: have we seen this already?
                if entry in entryTrace:
                    raise RuntimeError, "Extend entry already seen: %s" % str(entryTrace+[self.name,entry])
                
                entryJob = config.getJob(entry)  # getJob() handles string/Job polymorphism of 'entry' and returns Job object
                if not entryJob:
                    raise RuntimeError, "No such job: \"%s\" (trace: %s)" % (entry, entryTrace+[self.name])

                # make sure this entry job is fully resolved in its context
                entryJob.resolveExtend(entryTrace + [self.name])

                # now merge the fully expanded job into the current job
                self.mergeJob(entryJob)

        self.setFeature(self.RESOLVED_KEY, True)


    def resolveMacros(self):
        self.includeGlobalLet() # make sure potential global let is included
        if self.hasFeature('let'):
            # exand macros in the let
            letMap = self.getFeature('let')
            letMap = self._expandMacrosInLet(letMap)
            self.setFeature('let', letMap)
            
            # separate strings from other values
            letmaps = {}
            letmaps['str'] = {}
            letmaps['bin'] = {}
            for k in letMap:
                if isinstance(letMap[k], types.StringTypes):
                    letmaps['str'][k] = letMap[k]
                else:
                    letmaps['bin'][k] = letMap[k]
                    
            # apply dict to other values
            self._expandMacrosInValues(self._data, letmaps)


    def includeGlobalLet(self, additionalLet=None):
        newlet = self._mapMerge(self.getFeature('let',{}),{}) # init with local let
        if additionalLet:
            newlet = self._mapMerge(additionalLet, newlet)
        global_let = self._config.get('let',False)
        if global_let:
            newlet = self._mapMerge(global_let, newlet)

        if newlet:
            self.setFeature('let', newlet) # set cumulative let value


    def _expandString(self, s, mapstr, mapbin):
        assert isinstance(s, types.StringTypes)
        if s.find(r'${') == -1:  # optimization: no macro -> return
            return s
        macro = ""
        sub   = ""
        possiblyBin = re.match(r'^\${(.*)}$', s)   # look for '${...}' as a bin replacement
        if possiblyBin:
            macro = possiblyBin.group(1)
        if macro and (macro in mapbin.keys()):
            sub = mapbin[macro]
        else:
            templ = string.Template(s)
            sub = templ.safe_substitute(mapstr)
        return sub

    def _expandMacrosInValues(self, data, maps):
        """ apply macro expansion on arbitrary values; takes care of recursive data like
            lists and dicts; only actually applies macros when a string is encountered on 
            the way (look for calls to _expandString())"""
        result = data  # intialize result
        
        # arrays
        if isinstance(data, types.ListType):
            for e in range(len(data)):
                enew = self._expandMacrosInValues(data[e], maps)
                if enew != data[e]:
                    console.debug("expanding: %s ==> %s" % (str(data[e]), str(enew)))
                    data[e] = enew
                    
        # dicts
        elif isinstance(data, types.DictType):
            for e in data.keys(): # have to use keys() explicitly since i modify data in place
                # expand in values
                enew = self._expandMacrosInValues(data[e], maps)
                if enew != data[e]:
                    console.debug("expanding: %s ==> %s" % (str(data[e]), str(enew)))
                    data[e] = enew

                # expand in keys
                if ((isinstance(e, types.StringTypes) and
                        e.find(r'${')>-1)):
                    enew = self._expandString(e, maps['str'], {}) # no bin expand here!
                    data[enew] = data[e]
                    del data[e]
                    console.debug("expanding key: %s ==> %s" % (e, enew))

        # strings
        elif isinstance(data, types.StringTypes):
            result = self._expandString(data, maps['str'], maps['bin'])

        # leave everything else alone
        else:
            result = data

        return result


    def _expandMacrosInLet(self, letDict):
        """ do macro expansion within the "let" dict """

        keys = letDict.keys()
        for k in keys:
            kval = letDict[k]
            
            # construct a temp. dict of translation maps, for later calls to _expand* funcs
            # wpbasti: Crazy stuff: Could be find some better variable names here. Seems to be optimized for size already ;)
            if isinstance(kval, types.StringTypes):
                kdicts = {'str': {k:kval}, 'bin': {}}
            else:
                kdicts = {'str': {}, 'bin': {k:kval}}
                
            # cycle through other keys of this dict
            for k1 in keys:
                if k != k1: # no expansion with itself!
                    enew = self._expandMacrosInValues(letDict[k1], kdicts)
                    if enew != letDict[k1]:
                        console.debug("expanding: %s ==> %s" % (k1, str(enew)))
                        letDict[k1] = enew
        return letDict


    def getData(self):
        return self._data

    def getConfig(self):
        return self._config

    def setConfig(self, config):
        self._config = config


    def clone(self):
        return Job(self.name, self._data.copy(), self._console, self._config)

    def hasFeature(self, feature):
        return self._data.has_key(feature)

    def setFeature(self, feature, value):
        self._data[feature]=value

    def getFeature(self, feature, default=None):
        if self._data.has_key(feature):
            return self._data[feature]
        else:
            return default

    def removeFeature(self, feature):
        if feature in self._data:
            del self._data[feature]


