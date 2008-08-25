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
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import os, sys, re, types, string, copy
import simplejson
from generator.config.Job import Job
from generator.runtime.ShellCmd import ShellCmd
from generator.action.ContribLoader import ContribLoader

console = None

class Config:

    global console

    def __init__(self, console_, data, path=""):
        global console
        # init members
        self._console  = console_
        self._data     = None
        self._fname    = None
        self._shellCmd = ShellCmd()

        console = console_
        
        # dispatch on argument
        if isinstance(data, (types.DictType, types.ListType)):
            self.__init__data(data, path)
        elif isinstance(data, types.StringTypes):
            self.__init_fname(data)
        else:
            raise TypeError, str(data)

        # make sure there is at least an empty jobs map (for later filling)
        if isinstance(self._data, types.DictType) and self.JOBS_KEY not in self._data:
            self._data[self.JOBS_KEY] = {}

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
        data = simplejson.loads(jsonstr)
        obj.close()

        self._data  = data
        self._fname = os.path.abspath(fname)
        self._dirname = os.path.dirname(self._fname)

    NS_SEP            = "/"    # this is to reference jobs from nested configs
    COMPOSED_NAME_SEP = "::"   # this is to construct composed job names
    JOBS_KEY          = "jobs"

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
        

    def getJob(self, job, default=None):
        ''' takes jobname or job object ref, and returns job object ref or default '''

        if isinstance(job, Job): # you already found it :)
            return job

        assert isinstance(job, types.StringTypes)
        if ~job.find(self.NS_SEP):  # nested job?
            part, rest = job.split(self.NS_SEP, 1)
            if part == "." or part == "":
                return default
            else:
                if not 'include' in self._data:
                    return default
                for incSpec in self._data['include']:
                    if (incSpec.has_key('as') and incSpec['as'] == part):
                        return incSpec['config'].getJob(rest)
                else:
                    return default
        # local job?
        elif self._data.has_key(self.JOBS_KEY) and self._data[self.JOBS_KEY].has_key(job):
            jobEntry = self._data[self.JOBS_KEY][job]
            if isinstance(jobEntry, Job):
                # make sure it has link to this config
                if not jobEntry.getConfig():
                    jobEntry.setConfig(self)
                return jobEntry
            else:
                # create Job object
                jobObj = Job(job, jobEntry, self._console, self)
                self._data[self.JOBS_KEY][job] = jobObj # overwrite map with obj
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
        if self.JOBS_KEY in self._data:
            return self._data[self.JOBS_KEY]
        else:
            return default
        
    def getJobsList(self):
        return self.getJobsMap([]).keys()

    def getExportedJobsList(self):
        expList = self.get('export', False)  # is there a dedicated list of exported jobs?
        if isinstance(expList, types.ListType):
            return expList
        else:
            return self.getJobsList()



    def resolveIncludes(self, includeTrace=[]):

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

                econfig = Config(self._console, fpath)
                econfig.resolveIncludes(includeTrace)   # recursive include
                incspec['config'] = econfig  # save external config for later reference
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


    def _integrateExternalConfig(self, extConfig, namespace, importJobsList=None, blockJobsList=None):
        # jobs of external config are spliced into current job list
        if namespace:
            namepfx = namespace + self.COMPOSED_NAME_SEP # job names will be namespace'd
        else:
            namepfx = ""         # job names will not be namespace'd

        # get the list of jobs to import
        extJobsList = extConfig.getExportedJobsList()
        for extJobEntry in extJobsList:
            if importJobsList and extJobEntry not in importJobsList:
                continue
            if blockJobsList and extJobEntry in blockJobsList:
                continue
            newjobname = namepfx + extJobEntry  # create a job name
            if self.hasJob(newjobname):
                raise KeyError, "Job already exists: \"%s\"" % newjobname
            else:
                # take essentially the external job into the local joblist
                extJob = extConfig.getJob(extJobEntry)  # fetch this job
                if not extJob:
                    raise RuntimeError, "No such job: \"%s\" while including config: \"%s\")" % (extJobEntry, extConfig._fname)
                newJob = Job(newjobname, {}, self._console, self) # fake as local job, for _includeGlobalLet to run locally
                newJob.includeGlobalLet()  # have to draw in local let before all the external let's are processed
                newJob.mergeJob(extJob)    # now merge in the external guy
                newJob.setConfig(extJob.getConfig()) # retain link to external config
                # patch job references in 'run', 'extend', ... keys
                for key in Job.KEYS_WITH_JOB_REFS:
                    if newJob.hasFeature(key):
                        newlist = []
                        oldlist = newJob.getFeature(key)
                        for jobname in oldlist:
                            newlist.append(extConfig.getJob(jobname))
                        newJob.setFeature(key, newlist)
                self.addJob(newjobname, newJob)         # and add it
        return


    def resolveExtendsAndRuns(self, jobList):
        console = self._console
        console.info("Resolving jobs...")
        console.indent()

        # while there are still 'run' jobs or unresolved jobs in the job list...
        while ([x for x in jobList if self.getJob(x).hasFeature('run')] or 
               [y for y in jobList if not self.getJob(y).hasFeature('resolved')]):
            self._resolveExtends(jobList)
            self._resolveRuns(jobList)

        console.outdent()
        return jobList


    ##
    # _resolveExtends  -- resolve potential 'extend' keys for list of job names
    #
    # @param self self
    # @param jobs    list of job names
    def _resolveExtends(self, jobNames):
        for jobName in jobNames:
            job = self.getJob(jobName)
            if not job:
                raise RuntimeError, "No such job: %s" % jobname
            else:
                job.resolveExtend()


    ##                                                                              
    # _resolveRuns -- resolve the 'run' key in jobs
    #                                                                               
    # @param     self     (IN) self
    # @param     jobs     (IN/OUT) list of names of jobs that will be run
    # @return             None
    # @exception RuntimeError  'resolved' key missing in a job
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
    #  - in the job list, the original job is replaced by the list of new jobs
    def _resolveRuns(self, jobNames):

        # this is a bit of weird looping since we are modifying the array
        # we are interating over
        i,j = 0, len(jobNames)  # iterate over jobNames, i loop counter, j upper bound
        while i<j:
            jobName = jobNames[i]
            job     = self.getJob(jobName)
            if job.hasFeature("run"):
                sublist = []
                listOfNewJobs = []
                for subjob in job.getFeature("run"):
                    
                    subjobObj = self.getJob(subjob)
                    if not subjobObj:
                        raise RuntimeError, "No such job: %s" % subjob
                    # make new job map job::subjob as copy of job, but extend[subjob]
                    newjobname = jobName + self.COMPOSED_NAME_SEP + \
                                 subjobObj.name.replace(self.NS_SEP, self.COMPOSED_NAME_SEP)
                    newjob     = job.clone()
                    newjob.name= newjobname
                    newjob.removeFeature('run')       # remove 'run' key
                    
                    # we assume the initial 'run' job has already been resolved, so
                    # we reset it here and set the 'extend' to the subjob
                    if newjob.hasFeature('resolved'): 
                        newjob.removeFeature('resolved')
                    else:
                        raise RuntimeError, "Cannot resolve 'run' key before 'extend' key"
                    newjob.setFeature('extend', [subjobObj]) # extend subjob
                    
                    # add to config
                    self.addJob(newjobname, newjob)
                    
                    # add to job list
                    sublist.append(newjobname)
                    listOfNewJobs.append(newjob)
                    
                job.setFeature('run', listOfNewJobs)   # overwrite with list of Jobs (instead of Strings)

                jobNames[i:i+1] = sublist     # replace old job by subjobs list
                j               = j + len(sublist) - 1  # correct job list length

            # continue with next job
            # in case we have just expanded a 'run' key, this would go over the newly
            # added jobs; but since they don't have 'run' keys this doesn't matter
            # so we just head on
            i += 1


    def resolveLibs(self, jobs):
        config  = self.get("jobs")
        console = self._console

        console.info("Resolving libs/manifests...")
        console.indent()

        for job in jobs:
            if not config.has_key(job):
                console.warn("No such job: %s" % job)
                sys.exit(1)
            else:
                jobObj = self.getJob(job)
                if jobObj.hasFeature('library'):
                    newlib = jobObj.getFeature('library')
                    for lib in newlib:
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
                            self._download_contrib(newlib, contrib, contribCachePath)
                            manifest = os.path.join(contribCachePath, contrib, manifile)
                            lib['manifest'] = manifest  # patch 'manifest' entry to download path
                        else:  # patch the path which is local to the current config
                            pass # TODO: use manidir and config._dirname, or fix it when including the config
                            
                        # get the local Manifest
                        manifest = Manifest(self.absPath(manifest))
                        lib = manifest.patchLibEntry(lib)
                        # absolutize paths (this might not be the best place to do that)
                        for entry in ('path',):
                            lib[entry] = self.absPath(lib[entry])
                        # patch uri: set it to 'path' here, let Generator.scanLib append suffix for classes
                        # and correct it in Generator.runSource, which knows the prefix and relativizes the
                        # result
                        lib['uri'] = lib['path']

        console.outdent()


    def resolveMacros(self, jobs):
        console = self._console
        jobsMap  = self.get("jobs")

        console.info("Resolving macros...")
        console.indent()

        for job in jobs:
            jobObj = self.getJob(job)
            jobObj.resolveMacros()

        console.outdent()


    def _stripComments(self,jsonstr):
        eolComment = re.compile(r'(?<![a-zA-Z]:)//.*$', re.M)
        mulComment = re.compile(r'/\*.*?\*/', re.S)
        result = eolComment.sub('',jsonstr)
        result = mulComment.sub('',result)
        return result


    def _download_contrib(self, libs, contrib, contribCache):

        self._console.info("Downloading contrib: %s" % contrib)
        self._console.indent()

        dloader = ContribLoader()
        dloader.download(contrib, contribCache)

        self._console.info("done")
        self._console.outdent()
        return

    def getConfigDir(self):
        if self._fname:
            return os.path.dirname(self._fname)
        else:
            return None

    def absPath(self, path):
        'Take a path relative to config file location, and return it absolute'
        if os.path.isabs(path):
            return path
        elif not self.getConfigDir():
            raise RuntimeError, "Cannot absolutize path without a config file path."
        else:
            p = os.path.normpath(os.path.abspath(
                    os.path.join(self.getConfigDir(), path)))
            return p



# wpbasti: TODO: Put into separate file
class Manifest(object):
    def __init__(self, path):
        mf = open(path)
        manifest = simplejson.loads(mf.read())
        mf.close()
        self._manifest = manifest

    def patchLibEntry(self, libentry):
        '''Patches a "library" entry with the information from Manifest'''
        libinfo   = self._manifest['provides']
        #uriprefix = libentry['uri']
        uriprefix = ""
        libentry['class']         = os.path.join(uriprefix,libinfo['class'])
        libentry['resource']      = os.path.join(uriprefix,libinfo['resource'])
        libentry['translation']   = os.path.join(uriprefix,libinfo['translation'])
        libentry['encoding']    = libinfo['encoding']
        if 'namespace' not in libentry:
            libentry['namespace']   = libinfo['namespace']
        libentry['type']        = libinfo['type']
        libentry['path']        = os.path.dirname(libentry['manifest']) or '.'

        return libentry


class ExtMap(object):
    "Map class with path-like accessor"

    def __init__(self, data):
        assert isinstance(data, types.DictType)

        self._data = data

    def get(self, key, default=None, confmap=None):
        """Returns a (possibly nested) data element from dict
        """
        
        if confmap:
            data = confmap
        else:
            data = self._data
            
        if data.has_key(key):
            return data[key]

        splits = key.split('/')
        for part in splits:
            if part == "." or part == "":
                pass
            elif isinstance(data, types.DictType) and data.has_key(part):
                data = data[part]
            else:
                return default

        return data


    def extract(self, key):
        return ExtMap(self.get(key, {}))

    def getData(self):
        return self._data
