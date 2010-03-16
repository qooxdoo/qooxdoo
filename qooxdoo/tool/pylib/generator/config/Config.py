#!/usr/bin/env python

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
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import os, sys, re, types, string, copy
import simplejson
from generator.config.Manifest import Manifest
from generator.config.Lang import Lang
from generator.runtime.ShellCmd import ShellCmd
from generator.action.ContribLoader import ContribLoader
from misc.NameSpace import NameSpace
# see late imports at the bottom of this file

console = None

class Config(object):

    global console

    def __init__(self, console_, data, path="", **letKwargs):
        global console
        # init members
        self._console  = console_
        self._data     = None
        self._fname    = None
        self._shellCmd = ShellCmd()
        self._includedConfigs = []  # to record included configs
        self._shadowedJobs    = {}  # to record shadowed jobs, of the form {<shadowed_job_obj>: <shadowing_job_obj>}

        console = console_
        
        # dispatch on argument
        if isinstance(data, (types.DictType, types.ListType)):
            #self._console.debug("Creating config from data")
            self.__init__data(data, path)
        elif isinstance(data, types.StringTypes):
            #self._console.debug("Reading config file \"%s\"" % data)
            self.__init_fname(data)
        else:
            raise TypeError, str(data)

        # make sure there is at least an empty jobs map (for later filling)
        if isinstance(self._data, types.DictType) and Lang.JOBS_KEY not in self._data:
            self._data[Lang.JOBS_KEY] = {}
            
        # incorporate let macros from letkwargs
        if letKwargs:
            if not Lang.LET_KEY in self._data:
                self._data[Lang.LET_KEY] = {}
            self._data[Lang.LET_KEY].update(letKwargs)
                

        # expand macros for some top-level keys
        if Lang.LET_KEY in self._data:
            letObj = Let(self._data[Lang.LET_KEY])  # create a Let object from let map
            letObj.expandMacrosInLet()              # do self-expansion of macros
            for key in self._data:
                if key == Lang.JOBS_KEY:            # skip 'jobs'; they expand later
                    continue
                elif key == Lang.LET_KEY:           # macro definitions have to remain re-evaluable
                    continue
                else:
                    dat = letObj.expandMacros(self._data[key])
                    self._data[key] = dat

        # fix job key tags (like "=key")
        self.fixJobsTags()

        return

    def __init__data(self, data, path):
        self._data = data
        if path:
            self._dirname = os.path.abspath(path)
        else:
            self._dirname = os.getcwd()

    def __init_fname(self, fname):
        obj = open(fname)
        jsonstr = obj.read()
        jsonstr = self._stripComments(jsonstr)
        try:
            data = simplejson.loads(jsonstr)
        except ValueError, e:
            #e.args = (e.message + "\nFile: %s" % fname,)
            e.args = (e.args[0] + "\nFile: %s" % fname,) + e.args[1:]
            raise e
            
        obj.close()

        self._data  = data
        self._fname = os.path.abspath(fname)
        self._dirname = os.path.dirname(self._fname)

    # some constants
    NS_SEP            = "/"    # this is to reference jobs from nested configs
    COMPOSED_NAME_SEP = "::"   # this is to construct composed job names
    SHADOW_PREFIX     = "XXX"  # this is a fall-back prefix for shadowed jobs
    OVERRIDE_TAG_REGEXP = re.compile(r'^\%s(.*)$' % Lang.OVERRIDE_TAG)  # identify tag and extract orig. key

    def get(self, key, default=None, confmap=None):
        """Returns a (possibly nested) data element from dict <conf>
        """
        
        if confmap:
            data = confmap
        else:
            data = self._data
            
        if data.has_key(key):
            return data[key]

        splits = key.split(self.NS_SEP)
        for part in splits:
            if part == "." or part == "":
                pass
            elif isinstance(data, types.DictType) and data.has_key(part):
                data = data[part]
            else:
                return default

        return data


    def set(self, key, content, AddKeys=False, confmap=None):
        """Sets a (possibly nested) data element in dict <conf>
        """
        if confmap:
            container = confmap
        else:
            container = self._data
        splits = key.split(self.NS_SEP)

        # wpbasti: What should this do?
        for item in splits[:-1]:
            if isinstance(container, types.DictType):
                if container.has_key(item):
                    container = container[item]
                else:
                    if AddKeys:
                        container[item] = {}
                        container       = container[item]
                    else:
                        raise KeyError, key
            else:
                raise TypeError, "Missing map for descend"

        container[splits[-1]] = content
        return True
        

    def getJob(self, job, withIncludes=False, default=None):
        ''' takes jobname or job object ref, and returns job object ref or default;
            searches recursively through imported configs'''

        if isinstance(job, Job): # you already found it :)
            return job

        assert isinstance(job, types.StringTypes)

        # local job?
        # this also finds imported jobs, namespaced or not
        if self._data.has_key(Lang.JOBS_KEY) and self._data[Lang.JOBS_KEY].has_key(job):
            jobEntry = self._data[Lang.JOBS_KEY][job]
            if isinstance(jobEntry, Job):
                # make sure it has link to this config
                if not jobEntry.getConfig():
                    jobEntry.setConfig(self)
                return jobEntry
            else:
                # create Job object
                jobObj = Job(job, jobEntry, self._console, self)
                self._data[Lang.JOBS_KEY][job] = jobObj # overwrite map with obj
                return jobObj
        # job from included config? (to find required, but blocked jobs (e.g. through 'block' key)
        elif withIncludes:
            if not 'include' in self._data:
                return default
            else:
                for econfig in self._includedConfigs:
                    jobObj = econfig.getJob(job)
                    if jobObj:
                        return jobObj

        return default


    def addJob(self, jobname, value):
        assert isinstance(jobname, types.StringTypes)
        self.get('jobs')[jobname] = value


    def hasJob(self,jobname):
        if self.getJob(jobname):
            return True
        else:
            return False
        
    def getJobsMap(self, default=None):
        if Lang.JOBS_KEY in self._data:
            return self._data[Lang.JOBS_KEY]
        else:
            return default
        
    def getJobsList(self):
        jM = self.getJobsMap([])
        return [x for x in jM.keys() if isinstance(jM[x], (types.DictType, Job))]

    def getExportedJobsList(self):
        expList = self.get('export', False)  # is there a dedicated list of exported jobs?
        if isinstance(expList, types.ListType):
            netList = []
            for job in expList:
                if self.getJob(job) == None:
                    self._console.warn("! Skipping unknown 'export' job: \"%s\"" % job)
                else:
                    netList.append(job)
            return netList
        else:
            return self.getJobsList()



    ##
    # fix tags (markers, like prefix '=') in Jobs, so they will we compatible with
    # normal jobs processing (e.g. the keys have to be compareable)

    def fixJobsTags(self):
        jobNames = self.getJobsList()
        for jobName in jobNames:
            job = self.getJob(jobName)
            if not job:
                raise RuntimeError, "No such job: \"%s\"" % jobname
            else:
                job.fixNameTags()

        # fix the job names themselves
        jobsMap = self.getJobsMap()
        for jobName in jobNames:
            mo = self.OVERRIDE_TAG_REGEXP.search(jobName)
            if mo:
                # remove tag from job name
                cleankey = mo.group(1)
                jobsMap[cleankey] = jobsMap[jobName]
                del jobsMap[jobName]
                # add to override key
                if not Lang.OVERRIDE_KEY in jobsMap:
                    jobsMap[Lang.OVERRIDE_KEY] = []
                jobsMap[Lang.OVERRIDE_KEY].append(cleankey)
                # fix Job object property
                if isinstance(jobsMap[cleankey], Job):
                    jobsMap[cleankey].name = cleankey


    ##
    # clean up any artifacts in job definitions (e.g. __override__ synthetic keys in maps)

    def cleanUpJobs(self, jobList):
        for jobName in jobList:
            job = self.getJob(jobName)
            if not job:
                raise RuntimeError, "No such job: \"%s\"" % jobname
            else:
                job.cleanUpJob()



    def resolveIncludes(self, includeTrace=[]):

        console.debug("including %s" % (self._fname.decode('utf-8') or "<unknown>",))
        config  = self._data
        jobsmap = self.getJobsMap({})

        if self._fname:   # we stem from a file
            includeTrace.append(self._fname)   # expand the include trace
            
        if config.has_key('include'):
            for incspec in config['include']:
                # analyse value of ['include'][key]
                if isinstance(incspec, types.StringTypes):
                    fname = incspec
                elif isinstance(incspec, types.DictType):
                    fname = incspec['path']
                else:
                    raise RuntimeError, "Unknown include spec: %s" % repr(incspec)

                fname = fname.encode('utf-8')

                # cycle check
                if os.path.abspath(fname) in includeTrace:
                    raise RuntimeError, "Include config already seen: %s" % str(includeTrace+[os.path.abspath(fname)])
                
                # calculate path relative to config file if necessary
                if not os.path.isabs(fname):
                    fpath = os.path.normpath(os.path.join(self._dirname, fname))
                else:
                    fpath = fname
        
                # see if we use a namespace prefix for the imported jobs
                if isinstance(incspec, types.DictType) and incspec.has_key('as'):
                    namespace = incspec['as']
                else:
                    namespace = ""

                econfig = Config(self._console, fpath.decode('utf-8'))
                econfig.resolveIncludes(includeTrace)   # recursive include
                # check include/import
                if incspec.has_key('import'):
                    importList = incspec['import']
                else:
                    importList = None
                # check include/block
                if incspec.has_key('block'):
                    blockList = incspec['block']
                else:
                    blockList = None
                self._integrateExternalConfig(econfig, namespace, importList, blockList)
                self._includedConfigs.append(econfig)  # save external config for later reference


    def _integrateExternalConfig(self, extConfig, namespace, impJobsList=None, blockJobsList=None):
        '''jobs of external config are spliced into current job list'''
        if namespace:
            namepfx = namespace + self.COMPOSED_NAME_SEP # job names will be namespace'd
        else:
            namepfx = ""         # job names will not be namespace'd

        renamedJobs = {}         # map for job renamings - done after all jobs have been imported
        l           = NameSpace()  # for out-params of nested functions

        # Construct a map of import symbols (better lookup, esp. when aliased)
        importJobsList = {}
        if impJobsList:
            for e in impJobsList:
                if isinstance(e, types.StringTypes):
                    importJobsList[e]=None
                elif isinstance(e, types.DictType):  # {name: <name>, as: <alias>}
                    importJobsList[e['name']] = {'as': e['as']}
                else:
                    raise TypeError, "Illegal import entry: %s (Config: %s)" % (str(e), self._fname)

        # Some helper functions
        def createNewJobName(extJobEntry):
            # Construct new job name for the imported job
            if (importJobsList and extJobEntry in importJobsList 
                and isinstance(importJobsList[extJobEntry], types.DictType)):
                newjobname = namepfx + importJobsList[extJobEntry]['as']
            else:
                newjobname = namepfx + extJobEntry  # create a job name
            return newjobname

        def clashPrepare(newjobname):
            '''do some householding and return a new job name'''
            l.hasClash = True
            l.clashname = newjobname
            # import external job under different name
            console.warn("! Shadowing job \"%s\" with local one" % newjobname)
            # construct a name prefix
            extConfigName = extConfig._fname or self.SHADOW_PREFIX
            extConfigName = os.path.splitext(os.path.basename(extConfigName))[0]
            # TODO: this might not be unique enough! (user could use extConfigName in 'as' param for other include)
            newjobname = extConfigName + self.COMPOSED_NAME_SEP + newjobname
            return newjobname

        def clashProcess():
            # check whether the local job is protected
            jobMap = self.getJobsMap()
            if ((Lang.OVERRIDE_KEY not in jobMap) or
                (l.clashname not in jobMap[Lang.OVERRIDE_KEY])):
                # put shaddowed job in the local 'extend'
                if not newJob:
                    raise Error, "unsuitable new job"
                localjob = self.getJob(l.clashname)
                extList = localjob.getFeature('extend', [])
                extList.append(newJob)
                localjob.setFeature('extend', extList)
                # add to config's shadowed list
                self._shadowedJobs[newJob] = localjob


        # Go through the list of jobs to import
        newList     = []
        extJobsList = extConfig.getExportedJobsList()
        for extJobEntry in extJobsList:
            # Checks and preparations
            if importJobsList and extJobEntry not in importJobsList:
                continue
            if blockJobsList and extJobEntry in blockJobsList:
                continue
            newjobname = createNewJobName(extJobEntry)
            
            # Check for name clashes
            l.hasClash   = False
            if self.hasJob(newjobname):
                newjobname = clashPrepare(newjobname)

            # Now process the external job
            #   take essentially the external job into the local joblist
            extJob = extConfig.getJob(extJobEntry)  # fetch this job
            if not extJob:
                raise RuntimeError, "No such job: \"%s\" while including config: \"%s\")" % (extJobEntry, extConfig._fname)
            newJob = Job(newjobname, {}, self._console, self) # fake as local job, for _includeGlobalLet to run locally
            newJob.includeGlobalLet()  # have to draw in local let before all the external let's are processed
            newJob.mergeJob(extJob)    # now merge in the external guy
            newJob.setConfig(extJob.getConfig()) # retain link to original config
            if (newjobname != extJobEntry  # adapt modified names; otherwise, delay name resolution until resolveExtendsAndRun()
                and not l.hasClash):       # keep job references if there is shadowing
                renamedJobs[extJobEntry] = newjobname  # keep string reference for later binding
            self.addJob(newjobname, newJob)         # and add it
            newList.append(newJob)         # memorize jobs added from extConfig for later

            # Now process a possible name clash
            if l.hasClash:
                clashProcess()
        

        # Fix job references, but only for the jobs from the just imported config
        #   helper function
        def patchFeature(job, key, renamedJobs):
            newlist = []
            oldlist = job.getFeature(key)
            for jobentry in oldlist:
                if (isinstance(jobentry, types.StringTypes)
                    and jobentry in renamedJobs):
                    newlist.append(renamedJobs[jobentry])
                else:
                    newlist.append(jobentry)
            job.setFeature(key, newlist)

        # go through the list of just added jobs again
        for job in newList:  # there is no easy way to get newList from other data
            # patch job references in 'run', 'extend', ... keys
            for key in Lang.KEYS_WITH_JOB_REFS:
                if job.hasFeature(key):
                    patchFeature(job, key, renamedJobs)
        
        return


    def resolveExtendsAndRuns(self, jobList):
        console = self._console
        console.info("Resolving jobs...")
        console.indent()

        # while there are still 'run' jobs or unresolved jobs in the job list...
        while ([x for x in jobList if self.getJob(x).hasFeature(Lang.RUN_KEY)] or 
               [y for y in jobList if not self.getJob(y).hasFeature(Lang.RESOLVED_KEY)]):
            jobList = self._resolveExtends(jobList)
            jobList = self._resolveRuns(jobList)

        console.outdent()
        return jobList


    ##
    # _resolveExtends  -- resolve potential 'extend' keys for list of job names
    #
    # @param     self self
    # @param     jobs    (IN)  list of job names
    # @return    jobs    (OUT) to have a similar interface as _resolveRuns, 
    #                    although the list is actually not modified here
    ##
    def _resolveExtends(self, jobNames):
        for jobName in jobNames:
            job = self.getJob(jobName)
            if not job:
                raise RuntimeError, "No such job: \"%s\"" % jobname
            else:
                job.resolveExtend(cfg=self)
        
        return jobNames    # return list unchanged


    ##                                                                              
    # _resolveRuns -- resolve the 'run' key in jobs
    #                                                                               
    # @param     self     (IN) self
    # @param     jobs     (IN) list of names of jobs that might be 'run'-extended
    # @return    newjobs  (OUT) new list of jobs to run
    # @exception RuntimeError  Lang.RESOLVED_KEY key missing in a job
    #
    # DESCRIPTION
    #  The 'run' key of a job is a list of jobs to be run in its place, e.g.
    #  'run' : ['jobA', 'jobB']. 
    #  If a job in the input list has an 'run' key this is done:
    #  - for each subjob in the 'run' list, a new job is created ("synthetic jobs")
    #  - the original job serves as a template for the synthetic job
    #  - the subjob is added to the 'extend' list of the corresponding synthetic job
    #  - in the result list, the original job is replaced by the list of synthetic jobs
    def _resolveRuns(self, jobNames):

        newJobList = []
        for jobName in jobNames:
            job = self.getJob(jobName)
            if not job.hasFeature(Lang.RUN_KEY):
                newJobList.append(job)
            else:
                sublist = job.resolveRun(cfg=self)
                newJobList.extend(sublist)

        return newJobList



    def resolveLibs(self, jobs):
        config  = self.get("jobs")
        console = self._console

        console.info("Resolving libs/manifests...")
        console.indent()

        for job in jobs:
            if not self.getJob(job):
                raise RuntimeError, "No such job: \"%s\"" % job
            else:
                jobObj = self.getJob(job)
                console.debug("job '%s'" % jobObj.name)
                console.indent()
                if jobObj.hasFeature('library'):
                    newlib = []
                    seen   = []
                    oldlib = jobObj.getFeature('library')
                    for lib in oldlib:
                        # handle downloads
                        manifest = lib['manifest']
                        manidir = os.path.dirname(manifest)
                        manifile = os.path.basename(manifest)
                        
                        # wpbasti: Seems a bit crazy to handle this here
                        # What's about to process all "remote" manifest initially on file loading?
                        if manidir.startswith("contrib://"): # it's a contrib:// lib
                            contrib = manidir.replace("contrib://","")
                            cacheMap = jobObj.getFeature('cache')
                            if cacheMap and cacheMap.has_key('downloads'):
                                contribCachePath = cacheMap['downloads']
                                contribCachePath = self.absPath(contribCachePath)
                            else:
                                contribCachePath = "cache-downloads"
                            self._download_contrib(oldlib, contrib, contribCachePath)
                            manifest = os.path.normpath(os.path.join(contribCachePath, contrib, manifile))
                            lib['manifest'] = manifest  # patch 'manifest' entry to download path
                        else:  # patch the path which is local to the current config
                            pass # TODO: use manidir and config._dirname, or fix it when including the config
                        lib['manifest'] = self.absPath(lib['manifest'])  # abs manifest path
                            
                        # get the local Manifest
                        manifest = Manifest(self.absPath(manifest))
                        lib = manifest.patchLibEntry(lib)
                        # absolutize paths (this might not be the best place to do that)
                        for entry in ('path',):
                            lib[entry] = self.absPath(lib[entry])
                        # retain uri setting here
                        # add to newlib
                        if lib['namespace'] not in seen:  # enforce uniqueness
                            seen.append(lib['namespace'])
                            newlib.append(lib)
                        else:
                            self._console.debug("Skipping duplicate library \"%s\"" % lib['namespace'])

                    jobObj.setFeature('library', newlib)

                console.outdent()

        console.outdent()


    def includeSystemDefaults(self, jobs):
        console = self._console

        console.info("Incorporating job defaults...")
        console.indent()

        for job in jobs:
            jobObj = self.getJob(job)
            jobObj.includeSystemDefaults()

        console.outdent()


    def resolveMacros(self, jobs):
        console = self._console

        console.info("Resolving macros...")
        console.indent()

        for job in jobs:
            jobObj = self.getJob(job)
            console.debug("for job: %s" % jobObj.name)
            console.indent()
            jobObj.resolveMacros()
            console.outdent()

        console.outdent()


    def _stripComments(self,jsonstr):
        eolComment = re.compile(r'(?<![a-zA-Z]:)//.*$', re.M)
        mulComment = re.compile(r'/\*.*?\*/', re.S)
        result = eolComment.sub('',jsonstr)
        result = mulComment.sub('',result)
        return result


    def _download_contrib(self, libs, contrib, contribCache):

        self._console.debug("Checking network-based contrib: %s" % contrib)
        self._console.indent()

        dloader = ContribLoader()
        (updatedP, revNo) = dloader.download(contrib, contribCache)

        if updatedP:
            self._console.info("downloaded contrib: %s" % contrib)
        else:
            self._console.debug("using cached version")
        self._console.outdent()
        return


    def getConfigDir(self):
        if self._fname:
            return os.path.dirname(self._fname)
        else:
            return None


    def absPath(self, path):
        'Take a path relative to config file location, and return it absolute'
        assert isinstance(path, types.StringTypes)
        #path = path.encode('utf-8')
        if os.path.isabs(path):
            return path
        elif not self.getConfigDir():
            raise RuntimeError, "Cannot absolutize path without a config file path."
        else:
            p = os.path.normpath(os.path.abspath(
                    os.path.join(self.getConfigDir(), path)))
            #return p.decode('utf-8')
            return p


    def findKey(self, keyPatt, mode):
        '''iterator for keys matching keyPatt; yields key (mode=="rel") or key path (mode=="abs")'''
        if mode not in ("rel", "abs"):
            raise ValueError("mode must be one of (rel|abs)")
        keyRegex = re.compile(keyPatt)

        for path, key in self.walk(self._data, "."):
            if keyRegex.match(key):    
                if mode=="rel":
                    yield key
                else:
                    if path:
                        yield "/".join((path, key))
                    else:
                        yield key
        return

    def walk(self, data, path):
        if isinstance(data, Job):
            data = data.getData()
        if isinstance(data, types.DictType):
            for child in data.keys():
                yield path, child
                for path1, key in self.walk(data[child], "/".join((path, child))):
                    yield path1, key



class Let(object):
    '''Class representing a map with macros (typically under the 'let' key)'''

    def __init__(self, letMap):
        assert isinstance(letMap, types.DictType)
        self._data = copy.deepcopy(letMap)

    def expandMacrosInLet(self):
        # TODO: this code duplicates a lot of Job._expandMacrosInLet
        """ do macro expansion within the "let" dict;
            this is a self-modifying operation, tampering self._data"""

        letDict = self._data
        keys = letDict.keys()
        for k in keys:
            kval = letDict[k]
            
            # construct a temporary mini-dict of translation maps for the calls to 
            # expandMacros() further down
            # wpbasti: Crazy stuff: Could be find some better variable names here. Seems to be optimized for size already ;)
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
                if ((isinstance(e, types.StringTypes) and
                        e.find(r'${')>-1)):
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
        if s.find(r'${') == -1:  # optimization: no macro -> return
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


# Late imports, for cross-importing
from generator.config.Job import Job
