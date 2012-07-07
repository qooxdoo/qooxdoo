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
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import os, sys, re, types, string, copy
import graph
from generator.config.Lang import Key, Let
from generator.resource.Library import Library
from generator.runtime.ShellCmd import ShellCmd
from generator.action.ContribLoader import ContribLoader
from generator.config.ConfigurationError import ConfigurationError
from misc.NameSpace import NameSpace
from misc import json
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
        if isinstance(self._data, types.DictType) and Key.JOBS_KEY not in self._data:
            self._data[Key.JOBS_KEY] = {}
        
        # incorporate let macros from letkwargs
        if letKwargs:
            if not Key.LET_KEY in self._data:
                self._data[Key.LET_KEY] = {}
            self._data[Key.LET_KEY].update(letKwargs)

        # expand macros for some top-level keys
        self.expandTopLevelKeys()

        # fix job key tags (like "=key")
        self.fixJobsTags()

        # do some schema sanity checking
        # - off for bug#4441, it's called for the job in generator.py anyway
        #self.checkSchema()

        return

    def __init__data(self, data, path):
        self._data = data
        if path:
            self._dirname = os.path.abspath(path)
        else:
            self._dirname = os.getcwd()

    def __init_fname(self, fname):
        try:
            data = json.loadStripComments(fname)
        except ValueError, e:
            e.args = (e.args[0] + "\nFile: %s" % fname,) + e.args[1:]
            raise e

        self._data  = data
        self._fname = os.path.abspath(fname)
        self._dirname = os.path.dirname(self._fname)

    
    def expandTopLevelKeys(self):
        if Key.LET_KEY in self._data:
            letDict = self._data[Key.LET_KEY]
        else:
            letDict = self._data[Key.LET_KEY] = {}
        #letDict.update(os.environ)             # include OS env - this is permanent!
        if "QOOXDOO_PATH" in os.environ:
            letDict["QOOXDOO_PATH"] = os.environ["QOOXDOO_PATH"]
        letObj = Let(letDict)                  # create a Let object from let map
        letObj.expandMacrosInLet()             # do self-expansion of macros
        for key in self._data:
            if key == Key.JOBS_KEY:            # skip 'jobs'; they expand later
                continue
            elif key == Key.LET_KEY:           # macro definitions have to remain re-evaluable
                continue
            else:
                dat = letObj.expandMacros(self._data[key])
                self._data[key] = dat

        return


    def raiseConfigError(self, basemsg):
        msg = basemsg
        if self._fname:
            msg += " (%s)" % self._fname
        raise ConfigurationError(msg)


    def warnConfigError(self, basemsg):
        msg = basemsg
        if self._fname:
            msg += " (%s)" % self._fname
        self._console.warn(msg)


    # some constants
    NS_SEP            = "/"    # this is to reference jobs from nested configs
    COMPOSED_NAME_SEP = "::"   # this is to construct composed job names
    SHADOW_PREFIX     = "XXX"  # this is a fall-back prefix for shadowed jobs
    OVERRIDE_TAG_REGEXP = re.compile(r'^\%s(.*)$' % Key.OVERRIDE_TAG)  # identify tag and extract orig. key

    def get(self, key, default=None, confmap=None):
        """Returns a (possibly nested) data element from dict <conf>
        """
        
        if confmap:
            data = confmap
        else:
            data = self._data
            
        if key in data:
            return data[key]

        splits = key.split(self.NS_SEP)
        for part in splits:
            if part == "." or part == "":
                pass
            elif isinstance(data, types.DictType) and part in data:
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
                if item in container:
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
        if Key.JOBS_KEY in self._data and job in self._data[Key.JOBS_KEY]:
            jobEntry = self._data[Key.JOBS_KEY][job]
            if isinstance(jobEntry, Job):
                # make sure it has link to this config
                if not jobEntry.getConfig():
                    jobEntry.setConfig(self)
                return jobEntry
            else:
                # create Job object
                jobObj = Job(job, jobEntry, self._console, self)
                self._data[Key.JOBS_KEY][job] = jobObj # overwrite map with obj
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
        if Key.JOBS_KEY in self._data:
            return self._data[Key.JOBS_KEY]
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
                if not Key.OVERRIDE_KEY in jobsMap:
                    jobsMap[Key.OVERRIDE_KEY] = []
                jobsMap[Key.OVERRIDE_KEY].append(cleankey)
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

    ##
    # do some schema checking on a config

    def checkSchema(self, joblist=[], checkJobTypes=False):
        configMap = self._data
        # check top-level
        tl_keys = configMap.keys()
        tl_ignored_keys = self.get("config-warnings/tl-unknown-keys", [])
        for key in tl_keys:
            # does key exist?
            if key not in Key.TOP_LEVEL_KEYS.keys():
                if key not in tl_ignored_keys:
                    self._console.warn("! Unknown top-level config key \"%s\" - ignored." % key)
                #raise RuntimeError("! Unknown top-level config key \"%s\" - ignored." % key)
            # does it have a correct value type?
            elif not isinstance(configMap[key], Key.TOP_LEVEL_KEYS[key]):
                self.raiseConfigError("Incorrect value for top-level config key \"%s\" (expected %s)" % (key, Key.TOP_LEVEL_KEYS[key]))

        # check job-level
        jobEntries = configMap[Key.JOBS_KEY]
        jobType    = types.DictType
        for jobentry in jobEntries:
            if not isinstance(jobEntries[jobentry], (jobType, Job)):
                self.warnConfigError("! Not a valid job definition: \"%s\" - ignored." % jobentry)
                continue
            job = self.getJob(jobentry, withIncludes=False) # don't search included configs
            if job:
                if joblist and job not in joblist:
                    continue
                job.checkSchema(checkJobTypes)

        return



    ##
    # Import the jobs of the configs listed with this config's top-level
    # "include" key, so their jobs are locally available.
    #
    # Only jobs are imported, but global "let" keys are honored. Jobs can be
    # imported with a prefix for their names (a "name space"), to avoid clashes
    # with already existing job names.
    # For each imported job, a synthetic local "ghost" is created, to do some
    # pre-processing, and then the external job is merged into it. As all
    # external config are kept in a member of the current config, all their jobs
    # are available in their original form for later perusal (e.g. reference
    # lookup).
    def resolveIncludes(self, includeTree=graph.digraph()):

        console.debug("including %s" % (self._fname.decode('utf-8') or "<unknown>",))
        config  = self._data
        jobsmap = self.getJobsMap({})

        if self._fname:   # we stem from a file
            if self._fname not in includeTree:
                includeTree.add_node(self._fname) # only for the top-level config - others will be inserted by the parent
            
        if 'include' in config:
            for i in range(len(config['include'])):
                incspec = config['include'][i] # need this indirection so that later macro expansions in config['inlcude'] take effect
                # analyse value of ['include'][key]
                if isinstance(incspec, types.StringTypes):
                    fname = incspec
                elif isinstance(incspec, types.DictType):
                    fname = incspec['path']
                else:
                    raise RuntimeError, "Unknown include spec: %s" % repr(incspec)

                fname = fname.encode('utf-8')
                fapath = self.absPath(fname) # calculate path relative to config file

                # cycle check
                includeTree.add_node(fapath)  # add the child
                includeTree.add_edge(self._fname, fapath) # add edge to child
                cycle_nodes = includeTree.find_cycle()
                if cycle_nodes:
                    raise RuntimeError("Detected circular inclusion of config files: %r" % cycle_nodes)
        
                # see if we use a namespace prefix for the imported jobs
                if isinstance(incspec, types.DictType) and 'as' in incspec:
                    namespace = incspec['as']
                else:
                    namespace = ""

                econfig = Config(self._console, fapath.decode('utf-8'))
                econfig.resolveIncludes(includeTree)   # recursive include
                # check include/import
                if 'import' in incspec:
                    importList = incspec['import']
                else:
                    importList = None
                # check include/block
                if 'block' in incspec:
                    blockList = incspec['block']
                else:
                    blockList = None
                self._integrateExternalConfig(econfig, namespace, importList, blockList)
                self._includedConfigs.append(econfig)  # save external config for later reference


    ##
    # Jobs of external config are spliced into current job list
    def _integrateExternalConfig(self, extConfig, namespace, impJobsList=None, blockJobsList=None):

        # Some helper functions
        
        ##
        # Construct new job name for the imported job
        def createNewJobName(extJobEntry):
            if (importJobsList and extJobEntry in importJobsList 
                and isinstance(importJobsList[extJobEntry], types.DictType)):
                newjobname = namepfx + importJobsList[extJobEntry]['as']
            else:
                newjobname = namepfx + extJobEntry  # create a job name
            return newjobname

        ##
        # In case of a name collision, do some householding and return an
        # alternate job name.
        def clashPrepare(jobname):
            # import external job under different name
            jobs_ignored_shadowing = self.get("config-warnings/job-shadowing", [])
            if jobname not in jobs_ignored_shadowing:
                console.warn("! Shadowing job \"%s\" with local one" % jobname)
            # construct a name prefix
            extConfigName = extConfig._fname or self.SHADOW_PREFIX
            extConfigName = os.path.splitext(os.path.basename(extConfigName))[0]
            # TODO: this might not be unique enough! (user could use extConfigName in 'as' param for other include)
            newjobname = extConfigName + self.COMPOSED_NAME_SEP + jobname
            return newjobname

        def clashProcess(clashCase):
            # check whether the local job is protected
            jobMap = self.getJobsMap()
            if ((Key.OVERRIDE_KEY not in jobMap) or
                (clashCase.name not in jobMap[Key.OVERRIDE_KEY])):
                # put shaddowed job in the local 'extend'
                if not newJob:
                    raise Error, "unsuitable new job"
                localjob = self.getJob(clashCase.name)
                extList = localjob.getFeature('extend', [])
                extList.append(newJob)
                localjob.setFeature('extend', extList)
                # add to config's shadowed list
                self._shadowedJobs[newJob] = localjob
            return

        ##
        # Fix job references, but only for the jobs from the just imported config
        def patchJobReferences(job, key, renamedJobs):
            newlist = []
            oldlist = job.getFeature(key)
            for jobentry in oldlist:
                # it's a string reference
                if isinstance(jobentry, types.StringTypes):
                    if Key.hasMacro(jobentry) and renamedJobs:
                        console.warn("Potential pitfall: Cannot rename job reference containing macros (%s#%s[\"%s\"]:%s)" \
                                        % (extConfig._fname, extJob.name, key, oldlist))
                    if jobentry in renamedJobs:
                        newlist.append(renamedJobs[jobentry])
                    else:
                        newlist.append(jobentry)
                # it's a Job() object
                else:
                    newlist.append(jobentry)
            job.setFeature(key, newlist)

        # -- Main --------------------------------------------------------------

        if namespace:
            namepfx = namespace + self.COMPOSED_NAME_SEP # job names will be namespace'd
        else:
            namepfx = ""         # job names will not be namespace'd

        renamedJobs = {}         # map for job renamings - done after all jobs have been imported
        clashCase   = NameSpace()  # to record a single clashing job name

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

        # Merge global "let" -- currently disabled, see Bug#4126
        #extLet = extConfig.get(Key.LET_KEY, False)
        #if extLet:
        #    tmp = extLet.copy()
        #    tmp.update(self.get(Key.LET_KEY, {}))  # this should probably be deepMerge
        #    self.set(Key.LET_KEY, tmp)
        #    self.expandTopLevelKeys()  # we're making macro expansion in selected top-level keys eager

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
            if self.hasJob(newjobname):
                clashCase.name_clashed = True
                clashCase.name = newjobname
                newjobname = clashPrepare(newjobname)
            else:
                clashCase.name_clashed = False  # reset

            # Now process the external job
            #   take essentially the external job into the local joblist
            extJob = extConfig.getJob(extJobEntry)  # fetch this job
            if not extJob:
                raise RuntimeError, "No such job: \"%s\" while including config: \"%s\")" % (extJobEntry, extConfig._fname)
            newJob = Job(newjobname, {}, self._console, self) # fake as local job, for _includeGlobalLet to run locally
            #newJob.includeGlobalLet()  # have to draw in local let before all the external let's are processed
            newJob.includeGlobalDefaults()  # have to draw in local let before all the external let's are processed
            newJob.mergeJob(extJob)    # now merge in the external guy
            newJob.setConfig(extJob.getConfig()) # retain link to original config
            if (newjobname != extJobEntry  # adapt modified names; otherwise, delay name resolution until resolveExtendsAndRun()
                and not clashCase.name_clashed):       # keep job references if there is shadowing
                renamedJobs[extJobEntry] = newjobname  # keep string reference for later binding
            self.addJob(newjobname, newJob)         # and add it
            newList.append(newJob)         # memorize jobs added from extConfig for later

            # Now process a possible name clash
            if clashCase.name_clashed:
                clashProcess(clashCase)
        
        # Fix job references, but only for the jobs from the just imported config
        # go through the list of just added jobs again
        for job in newList:  # there is no easy way to get newList from other data
            # patch job references in 'run', 'extend', ... keys
            for key in Key.KEYS_WITH_JOB_REFS:
                if job.hasFeature(key):
                    patchJobReferences(job, key, renamedJobs)
        
        return


    def resolveExtendsAndRuns(self, jobList):
        console = self._console
        console.debug("Resolving jobs...")
        console.indent()

        # while there are still 'run' jobs or unresolved jobs in the job list...
        while ([x for x in jobList if self.getJob(x).hasFeature(Key.RUN_KEY)] or 
               [y for y in jobList if not self.getJob(y).hasFeature(Key.RESOLVED_KEY)]):
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
                raise RuntimeError, "No such job: \"%s\"" % jobName
            else:
                job.resolveExtend(cfg=self)
        
        return jobNames    # return list unchanged


    ##                                                                              
    # _resolveRuns -- resolve the 'run' key in jobs
    #                                                                               
    # @param     self     (IN) self
    # @param     jobs     (IN) list of names of jobs that might be 'run'-extended
    # @return    newjobs  (OUT) new list of jobs to run
    # @exception RuntimeError  Key.RESOLVED_KEY key missing in a job
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
            if not job.hasFeature(Key.RUN_KEY):
                newJobList.append(job)
            else:
                sublist = job.resolveRun(cfg=self)
                newJobList.extend(sublist)

        return newJobList



    def resolveLibs(self, jobs):
        config  = self.get("jobs")
        console = self._console

        console.debug("Resolving libs/manifests...")
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
                        libObj = Library(lib, self._console)
                        newlib.append(libObj)

                    jobObj.setFeature('library', newlib)

                console.outdent()

        console.outdent()


    def includeSystemDefaults(self, jobs):
        console = self._console

        console.debug("Incorporating job defaults...")
        console.indent()

        for job in jobs:
            jobObj = self.getJob(job)
            jobObj.includeSystemDefaults()

        console.outdent()


    def resolveMacros(self, jobs):
        console = self._console

        console.debug("Resolving macros...")
        console.indent()

        for job in jobs:
            jobObj = self.getJob(job)
            console.debug("for job: %s" % jobObj.name)
            console.indent()
            jobObj.resolveMacros()
            console.outdent()

        console.outdent()


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


    ##
    # iterator for keys matching keyPatt; yields key (mode=="rel") or key path (mode=="abs")
    def findKey(self, keyPatt, mode):
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


# Late imports, for cross-importing
from generator.config.Job import Job
