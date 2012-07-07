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

import os, sys, re, types, string, copy
import simplejson

from misc.ExtMap import ExtMap
from generator.config.Lang import Key
from generator.config.Defaults import Defaults
from generator.config.Lang import Let

console = None

class Job(object):

    # some constants
    OVERRIDE_TAG_REGEXP = re.compile(r'^\%s(.*)$' % Key.OVERRIDE_TAG)  # identify tag and extract orig. key
    MACRO_SPANNING_REGEXP = re.compile(r'^\$\{\w+\}$')  # e.g. "${PATH}"
    JSON_SCALAR_TYPES   = (types.StringTypes, types.IntType, types.LongType, types.FloatType,
                           types.BooleanType, types.NoneType)


    def __init__(self, name, data, console_, config=None):
        global console
        self.name    = name
        self._console= console_
        self._data   = data
        self._config = config

        console      = console_


    def __repr__(self):
        return "<%s:%s>" % (self.__class__.__name__, self.name)


    def raiseConfigError(self, basemsg):
        msg = basemsg + " (%s#%s)" % (self._config._fname, self.name)
        raise ValueError(msg)

    def warnConfigError(self, basemsg):
        msg = basemsg + " (%s#%s)" % (self._config._fname, self.name)
        self._console.warn(msg)

    def mergeJob(self, sourceJob):
        "merges another job into self"

        sData = sourceJob.getData()
        tData = self.getData()

        self.deepJsonMerge(sData, tData)


    def mergeValues(self, source, target):
        '''merges source into target;
           assumes no JobMergeValue be passed, all macros expanded'''

        if isinstance(target, types.ListType):
            if not isinstance(source, (types.ListType,)):
                return self.listMerge([source], target)
            else:
                return self.listMerge(source, target)
        elif isinstance(target, types.DictType):
            return self.deepJsonMerge(source, target)
        else:  # scalar value
            return target  # first val overrules
        

    def fixNameTags(self):
        
        visitor = self.getDataVisitor()
        for map in visitor:
            for key in map.keys():
                mo = Job.OVERRIDE_TAG_REGEXP.search(key)
                if mo:
                    # remove tag from key
                    cleankey = mo.group(1)  # pick the original key
                    map[cleankey] = map[key]
                    del map[key]
                    # add to override key
                    if not Key.OVERRIDE_KEY in map:
                        map[Key.OVERRIDE_KEY] = []
                    map[Key.OVERRIDE_KEY].append(cleankey)


    ##
    # clean up any artifacts in job definitions (e.g. __override__ synthetic keys in maps)

    def cleanUpJob(self):

        visitor = self.getDataVisitor()
        for map in visitor:
            for synthKey in Key.META_KEYS:
                if synthKey in map:
                    del map[synthKey]

    ##
    # do some schema checking on the job data

    def checkSchema(self, checkTypes=False):
        jobconf = self.getData()
        ignored_job_keys = self.get("config-warnings/job-unknown-keys", [])
        for key in jobconf.keys():
            # does key exist?
            if key not in Key.JOB_LEVEL_KEYS.keys() + Key.META_KEYS:
                if key not in ignored_job_keys:
                    self.warnConfigError("! Unknown job config key \"%s\" - ignored." % key)
            # does it have a correct value type?
            if checkTypes:
                if key in Key.JOB_LEVEL_KEYS.keys() and not isinstance(jobconf[key], Key.JOB_LEVEL_KEYS[key]):
                    self.raiseConfigError("Incorrect value for job config key \"%s\" (expected %s)" % (key, Key.JOB_LEVEL_KEYS[key]))


    def resolveExtend(self, entryTrace=[], cfg=None):
        # resolve the 'extend' entry of a job
        config = cfg or self._config

        if self.hasFeature(Key.RESOLVED_KEY):
            return

        #self.includeGlobalLet() # make sure potential global let is included first
        self.includeGlobalDefaults() # make sure potential global let is included first

        if self.hasFeature("extend"):
            # prepare a Let object for potential macro expansion
            letObj = Let(self.get(Key.LET_KEY, {}))
            letObj.expandMacrosInLet()              # do self-expansion of macros
            # loop through 'extend' entries
            extends = self.getFeature("extend")
            self._console.indent()
            for entry in extends:
                # make best effort on macro expansion
                if isinstance(entry, types.StringTypes):
                    if Key.hasMacro(entry):
                        entry = letObj.expandMacros(entry)
                
                entryJob = self._getJob(entry, config)
                if not entryJob:
                    raise RuntimeError, "No such job: \"%s\" (trace: %s)" % (entry, entryTrace+[self.name])
                if entryJob.name in entryTrace: # cycle check
                    raise RuntimeError, "Extend entry already seen: %s" % str(entryTrace+[self.name, entryJob.name])

                self._console.debug('Including "%s" into "%s"' % (entryJob.name, self.name))
                # make sure this entry job is fully resolved in its context
                entryJob.resolveExtend(entryTrace + [self.name], config)

                # now merge the fully expanded job into the current job
                self.mergeJob(entryJob)
            self._console.outdent()

        self.setFeature(Key.RESOLVED_KEY, True)


    ##                                                                              
    # resolveRun -- resolve the 'run' key in jobs
    #                                                                               
    # @param     self     (IN) self
    # @return    joblist  (OUT) list of replacement jobs
    # @exception RuntimeError  Key.RESOLVED_KEY key missing in a job
    #
    # DESCRIPTION
    #  The 'run' key of a job is a list of jobs to be run in its place, e.g.
    #  'run' : ['jobA', 'jobB']. This indicates how the resolution of the key is
    #  done:
    #  - for each job in the 'run' list, a new job is created ("synthetic jobs")
    #  - the original job serves as a template so the new jobs get all the
    #    settings of the original job (apart from the 'run' key)
    #  - an 'extend' key is set with the particular subjob as its
    #    only member (assuming any original 'extend' key has already been
    #    resolved). - This way all the new jobs can be run as regular jobs,
    #    essentially performing the task of the referenced subjob.
    #  - in the list of synthetic jobs is returned
    #
    # CAVEAT
    #  Unlike other 'resolve*' methods in this class (which are self-modifying),
    #  this one is functional and non-destructive (ok, it objectifies the 'run' list)!
    ##
    def resolveRun(self, cfg=None):
        config = cfg or self._config
        subJobs = []
        
        job     = self
        if not job.hasFeature("run"):
            return [job]
        else:
            # prepare a Let object for potential macro expansion
            letObj = Let(self.get(Key.LET_KEY, {}))
            letObj.expandMacrosInLet()              # do self-expansion of macros

            for subjob in job.getFeature("run"):
                
                # make best effort on macro expansion
                if isinstance(subjob, types.StringTypes):
                    if Key.hasMacro(subjob):
                        subjob = letObj.expandMacros(subjob)
                # get job object
                subjobObj = self._getJob(subjob, config)
                if not subjobObj:
                    raise RuntimeError, "No such job: \"%s\"" % subjob
                # make new job map job::subjob as copy of job, but extend[subjob]
                newjobname = self.name + self._config.COMPOSED_NAME_SEP + \
                             subjobObj.name.replace(self._config.NS_SEP, self._config.COMPOSED_NAME_SEP)
                newjob     = job.clone()
                newjob.name= newjobname
                newjob.removeFeature('run')       # remove 'run' key
                
                # we assume the initial 'run' job has already been resolved, so
                # we reset it here and set the 'extend' to the subjob
                if newjob.hasFeature(Key.RESOLVED_KEY): 
                    newjob.removeFeature(Key.RESOLVED_KEY)
                else:
                    raise RuntimeError, "Cannot resolve 'run' key before 'extend' key"
                newjob.setFeature('extend', [subjobObj]) # extend subjob
                
                # add to config
                self._config.addJob(newjobname, newjob)  # TODO: why not config.addJob(...) ?!                
                # add to job list
                subJobs.append(newjob)
                
            job.setFeature('run', subJobs)   # overwrite with list of Jobs (instead of Strings)

        return subJobs


    def resolveMacros(self):
        #self.includeGlobalLet() # make sure potential global let is included
        self.includeGlobalDefaults() # make sure potential global let is included
        if self.hasFeature(Key.LET_KEY):
            # exand macros in the let
            letMap = self.getFeature(Key.LET_KEY)
            letObj = Let(letMap)
            letMap = letObj.expandMacrosInLet()
            self.setFeature(Key.LET_KEY, letMap)
            
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
            newdata = self._expandMacrosInValues(self._data, letmaps)
            self._data = newdata


    def includeGlobalDefaults(self):
        global_defaults = {}
        global_defaults[Key.LET_KEY] = self._config.get(Key.LET_KEY, {})
        global_defaults[Key.CONFIG_WARNINGS] = self._config.get(Key.CONFIG_WARNINGS, {})
        global_defaults = ExtMap(global_defaults) # using ExtMap to fake a Job
        self.mergeJob(global_defaults)


    def includeGlobalLet(self, additionalLet=None):
        newlet = self.mapMerge(self.getFeature(Key.LET_KEY,{}),{}) # init with local let
        if additionalLet:
            newlet = self.mapMerge(additionalLet, newlet)
        global_let = self._config.get(Key.LET_KEY,False)
        if global_let:
            newlet = self.mapMerge(global_let, newlet)
        if newlet:
            self.setFeature(Key.LET_KEY, newlet) # set cumulative let value

    
    def includeSystemDefaults(self, ):
        # Add system supplied features to Job
        # call this on fully expanded jobs *before* macro expansion is called,
        # so default let macros can take effect

        # add default let macros
        defaultLet = Defaults.let
        if defaultLet:
            mylet = self.getFeature(Key.LET_KEY, {})
            mylet = self.mergeValues(defaultLet, mylet) # existing values in mylet will take precedence
            self.setFeature(Key.LET_KEY, mylet)



    def _getJob(self, job, cfg=None):
        '''search a job in given, then in original config'''
        config = cfg or self._config
        entryJob = config.getJob(job)  # Config.getJob() handles string/Job polymorphism of 'entry' and returns Job object
        if not entryJob:
            if config != self._config:  # try own config
                entryJob = self._config.getJob(job)

        return entryJob

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
            if isinstance(replval, types.DictType):
                sub = copy.deepcopy(replval)  # make sure macro values are not affected during value merges later
            else:
                sub = replval   # array references are ok for now
        else:
            templ = string.Template(s)
            #sub = templ.safe_substitute(mapstr)
            try:
                sub = templ.substitute(mapstr)
            except KeyError, e:
                raise ValueError("Macro left undefined in job (%s): '%s'\n(might be from an included config)" % (self.name, e.args[0]))
        return sub


    ##
    # apply macro expansion on arbitrary values; takes care of recursive data like
    # lists and dicts; only actually applies macros when a string is encountered on 
    # the way (look for calls to _expandString()); returns a *new* data
    # structure that holds the expanded version (so the input data is unchanged)

    def _expandMacrosInValues(self, data, maps):
        
        # arrays
        if isinstance(data, types.ListType):
            result = []
            for e in range(len(data)):
                enew = self._expandMacrosInValues(data[e], maps)
                if enew != data[e]:
                    console.debug("expanding: %r ==> %r" % (data[e], enew))
                    #data[e] = enew
                result.append(enew)
                    
        # dicts
        elif isinstance(data, types.DictType):
            result = {}
            for e in data.keys(): # have to use keys() explicitly since i modify data in place
                # expand in values
                enew = self._expandMacrosInValues(data[e], maps)
                if enew != data[e]:
                    console.debug("expanding: %r ==> %r" % (data[e], enew))
                    #data[e] = enew
                result[e] = enew

                # expand in keys
                if (isinstance(e, types.StringTypes)
                        and Key.hasMacro(e)):
                    enew = self._expandString(e, maps['str'], {}) # no bin expand here!
                    if enew == e:
                        #self._console.warn("! Empty expansion for macro in config key: \"%s\"" % e)
                        pass  # TODO: the above warning produces too many false positives
                    else:
                        result[enew] = result[e]
                        del result[e]
                        console.debug("expanding key: %s ==> %s" % (e, enew))

        # JobMergeValues
        elif isinstance(data, JobMergeValue):
            # macro-expand and merge further
            source = self._expandMacrosInValues(data.val1, maps)
            target = self._expandMacrosInValues(data.val2, maps)
            result = self.mergeValues(source, target)

        # strings
        elif isinstance(data, types.StringTypes):
            if Key.hasMacro(data):
                result = self._expandString(data, maps['str'], maps['bin'])
                if result == data:
                    #self._console.warn("! Empty expansion for macro in config value: \"%s\"" % data)
                    pass # TODO: see other Empty expansion warning
            else:
                result = data

        # leave everything else alone
        else:
            result = data

        return result


    def getData(self):
        return self._data

    def getDataVisitor(self):
        data = self.getData()
        assert isinstance(data, types.DictType)

        def visitor(map):
            yield map
            for key in map:
                if isinstance(map[key], types.DictType):
                    for map1 in visitor(map[key]):
                        yield map1

        return visitor(data)


    def getConfig(self):
        return self._config

    def setConfig(self, config):
        self._config = config
    
    def copyData(self):
        data = {}
        for key, val in self._data.iteritems():
            if key in [Key.EXTEND_KEY, Key.RUN_KEY]:
                # don't do deepcopy on job references
                data[key] = copy.copy(val)
            else:
                data[key] = copy.deepcopy(val)
        return data

    def clone(self):
        #return Job(self.name, copy.deepcopy(self._data), self._console, self._config)
        return Job(self.name, self.copyData(), self._console, self._config)

    def hasFeature(self, feature):
        return feature in self._data

    def setFeature(self, feature, value):
        self._data[feature]=value

    def get(self, feature, default=None):
        return self.getFeature(feature, default)

    def getFeature(self, feature, default=None):
        dataMap = ExtMap(self._data)
        return dataMap.get(feature, default)

    def removeFeature(self, feature):
        if feature in self._data:
            del self._data[feature]


    def deepJsonMerge(self, source, target):

        def isString(s):
            return isinstance(s, types.StringTypes)

        def isSpanningMacro(m):
            return self.MACRO_SPANNING_REGEXP.search(m)

        def isProtected(key, amap):
            if Key.OVERRIDE_KEY in amap and key in amap[Key.OVERRIDE_KEY]:
                return True
            else:
                return False

        def listAdd(target, listKey, element):
            # make sure there is at least an empty list to add to
            if listKey not in target:
                target[listKey] = []
            target[listKey].append(element)
            return target[listKey]

        # -- deepJsonMerge -------------------------------------------------------

        if not isinstance(source, types.DictType):
            raise TypeError, "Wrong argument to deepJsonMerge (must be Dict)"

        # create a quick-access var
        override_keys = []
        if Key.OVERRIDE_KEY in target:
            override_keys = target[Key.OVERRIDE_KEY]
            assert isinstance(override_keys, types.ListType)

        for key in source:
            # pass here - these are treated when their corresponding key is treated
            if key == Key.OVERRIDE_KEY:
                pass

            # merge values
            elif key in target:
                # skip protected keys
                if key in override_keys:
                    continue

                # treat spanning macros (which can represent data structures), and JobMergeValues
                elif ((isString(source[key]) and isSpanningMacro(source[key]))
                      or (isString(target[key]) and isSpanningMacro(target[key]))
                      or isinstance(source[key], JobMergeValue)
                      or isinstance(target[key], JobMergeValue)
                     ):
                    # insert an intermediate object, which is resolved when macros are resolved
                    target[key] = JobMergeValue(source[key], target[key])

                # treat "let" specially
                # cruft: this should actually be done in mergeJob(), but it's easier here
                elif key == Key.LET_KEY:
                    target[key] = self.mapMerge(source[key], target[key])

                # merge arrays rather than shadowing
                elif isinstance(target[key], types.ListType):
                    # equality problem: in two arbitrary lists, i have no way of telling 
                    # whether any pair of elements is somehow related (e.g. specifies the
                    # same library), and i can't do recursive search here, with some 
                    # similarity reasoning, can i. therefore: non-equal elements are just
                    # considered unrelated.
                    if not isinstance(source[key], types.ListType):
                        target[key] = self.listMerge([source[key]],target[key])
                    else:
                        target[key] = self.listMerge(source[key],target[key])
                
                # merge dicts rather than shadowing
                elif isinstance(target[key], types.DictType):
                    # assuming schema-conformance of source[key] as well
                    # recurse on the sub-dicts
                    self.deepJsonMerge(source[key], target[key])
                    #target[key] = self.mapMerge(source[key],target[key])

                else:
                    pass  # leave target key alone

            # add new key
            else:
                if isinstance(source[key], types.ListType):
                    s1 = source[key][:]
                elif isinstance(source[key], types.DictType):
                    s1 = source[key].copy()
                else:
                    s1 = source[key]
                target[key] = s1
                # carry over override protection:
                # only add protection for new keys - don't add protection for keys that
                # alreay exist in the target but are unprotected
                if isProtected(key, source):
                    target[Key.OVERRIDE_KEY] = listAdd(target, Key.OVERRIDE_KEY, key)

        return target


    def mapMerge(self, source, target):
        """merge source map into target, but don't overwrite existing
           keys in target (unlike target.update(source))"""
        t = source.copy()
        t.update(target)  # target keys take precedence
        return t


    def listMerge(self, source, target):
        """merge source list with target list (currently append),
           avoiding duplicates"""
        t = []
        for e in source:
            if not e in target:
                if isinstance(e, types.ListType):
                    e1 = e[:]
                elif isinstance(e, types.DictType):
                    e1 = e.copy()
                else:
                    e1 = e
                t.append(e1) # make sure we have our own copy of container types
        return target + t



# -- a helper class to represent delayed merge values --------------------------

class JobMergeValue(object):

    def __init__(self, val1, val2):
        self.val1 = val1
        self.val2 = val2



