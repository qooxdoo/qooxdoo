import os, sys, re, types, string
import simplejson

class Config:
    def __init__(self, console, data, path=""):
        # init members
        self._console = console
        self._data    = None
        self._fname   = None
        # dispatch on argument
        if isinstance(data, (types.DictType, types.ListType)):
            self.__init__data(data, path)
        elif isinstance(data, types.StringTypes):
            self.__init_fname(data)
        else:
            raise TypeError, str(data)

    def __init__data(self, data, path):
        self._data = data
        if path:
            self._dirname = os.path.abspath(path)
        else:
            self._dirname = os.getcwd()

    def __init_fname(self, fname):
        obj = open(fname)
        data = simplejson.loads(obj.read())
        obj.close()

        self._data  = data
        self._fname = os.path.abspath(fname)
        self._dirname = os.path.dirname(self._fname)

    def getData(self):
        if self._data:
            return self._data
        else:
            return None

    def get(self, key, default=None, confmap=None):
        """Returns a (possibly nested) data element from dict <conf>
        """
        if confmap:
            data = confmap
        else:
            data = self._data
        splits = key.split("/")

        for item in splits:
            if isinstance(data, types.DictType) and data.has_key(item):
                data = data[item]
            else:
                return self._normalizeConfig(default)

        return self._normalizeConfig(data)
        

    def iter(self):
        result = []
        for item in self._data:
            result.append(Config(self._console, item))
        
        return result
        
        
    def extract(self, key):
        return Config(self._console, self.get(key, {}), self._dirname)
        
    
    def _normalizeConfig(self, value):
        if hasattr(value, "lower"):
            if value.lower() in [ "1", "on", "true", "yes", "enabled" ]:
                return True

            if value.lower() in [ "0", "off", "false", "no", "disabled" ]:
                return False

        return value
        
    def getJobsMap(self, default=None):
        if 'jobs' in self._data:
            return self._data['jobs']
        else:
            return default

    def resolveIncludes(self, includeTrace=[]):
        config  = self._data
        jobsmap = self.getJobsMap()
        if self._fname:   # we stem from a file
            includeTrace.append(self._fname)   # expand the include trace
        if config.has_key('include'):
            for cfgfile in config['include']:
                #cycle check
                fname = cfgfile[1]
                if os.path.abspath(fname) in includeTrace:
                    self._console.warn("Include config already seen: %s" % str(includeTrace+[os.path.abspath(fname)]))
                    sys.exit(1)
                
                # calculate path relative to config file if necessary
                if not os.path.isabs(fname):
                    fpath = os.path.normpath(os.path.join(self._dirname, fname))
                else:
                    fpath = fname
                econfig = Config(self._console, fpath)
                econfig.resolveIncludes(includeTrace)   # recursive include
                #for ejob in econfig['jobs']:
                #    _resolveEntry(console, econfig['jobs'], ejob)
                jobsmap[cfgfile[0]] = econfig.getData() # external config becomes namespace'd entry in jobsmap

    def resolveExtendsAndRuns(self, joblist):
        jobsmap = self.getJobsMap()
        console = self._console
        console.info("Resolving jobs...")
        console.indent()

        # while there are still 'run' jobs or unresolved jobs in the job list...
        while ([x for x in joblist if jobsmap[x].has_key('run')] or 
               [y for y in joblist if not jobsmap[y].has_key('resolved')]):
            self._resolveExtends(self._console, jobsmap, joblist)
            self._resolveRuns(self._console, jobsmap, joblist)

        console.outdent()
        return joblist

    def _mapMerge(self, source, target):
        """merge source map into target, but don't overwrite existing
           keys in target (unlike .update())"""
        t = target.copy()
        for (k,v) in source.items():
            if not t.has_key(k):
                t[k] = v
        return t


    def _resolveRuns(self, console, jobsmap, jobs):
        i,j = 0, len(jobs)
        while i<j:
            job = jobs[i]
            entry = jobsmap[job]
            if entry.has_key("run"):
                sublist = []
                for subjob in entry["run"]:
                    # make new job map job::subjob as copy of job, but extend[subjob]
                    newjobname = job + '::' + subjob.replace('/','::')
                    newjob = entry.copy()
                    del newjob['run']       # remove 'run' key
                    # we assume the initial 'run' job has already been resolved, so
                    # we reset it here and set the 'extend' to the subjob
                    if newjob.has_key('resolved'): del newjob['resolved']
                    newjob['extend'] = [subjob] # extend subjob
                    # add to config
                    jobsmap[newjobname] = newjob
                    # add to job list
                    sublist.append(newjobname)
                jobs[i:i+1] = sublist  # replace old job by subjobs list
                j = j + len(sublist) - 1
            i += 1


    def _resolveExtends(self, console, config, jobs):
        def _listPrepend(source, target):
            """returns new list with source prepended to target"""
            l = target[:]
            for i in range(len(source)-1,-1,-1):
                l.insert(0,source[i])
            return l

        def _mergeEntry(target, source):
            for key in source:
                # merge 'let' key rather than shadowing
                #if key == 'let'and target.has_key(key):
                #    target[key] = _listPrepend(source[key],target[key])
                
                # merge 'settings' and 'let' key rather than shadowing
                if (key in ['settings','let']) and target.has_key(key):
                    target[key] = self._mapMerge(source[key],target[key])
                if not target.has_key(key):
                    target[key] = source[key]

        def _resolveEntry(console, config, job, entryTrace=[]):
            # cyclic check for recursive extends?? - done
            # is this expanding nested jobs in their own context?? - yes! (see jobcontext and parent)
            if not self.get(job,False,config):
                console.warn("No such job: %s" % job)
                sys.exit(1)

            data = self.get(job,None,config)

            if data.has_key("resolved"):
                return

            if data.has_key("extend"):
                extends = data["extend"]
                if job.rfind('/')>-1:
                    parent = job[:job.rfind('/')]
                    jobcontext = self.get(parent,None,config) # job context has the 'parent' key
                else:
                    parent = None
                    jobcontext = config  # we are top-level

                for entry in extends:
                    # cyclic check
                    if entry in entryTrace:
                        console.warn("Extend entry already seen: %s" % str(entryTrace+[job,entry]))
                        sys.exit(1)

                    pjob = self.get(entry, None, jobcontext )
                    # resolve 'extend'
                    _resolveEntry(console, jobcontext, entry, entryTrace + [job])
                    # prepare for 'run'
                    if pjob.has_key('run') and entry.rfind('/')>-1:
                        # prefix job names
                        eparent = entry[:entry.rfind('/')]
                        pjob['run'] = ["/".join([eparent,x]) for x in pjob['run']]
                    _mergeEntry(data, pjob)

            data["resolved"] = True

        for job in jobs:
            _resolveEntry(console, config, job)


    def resolveMacros(self, jobs):
        console = self._console
        config  = self.getJobsMap()

        def _expandString(s, map):
            templ = string.Template(s)
            sub = templ.safe_substitute(map)
            return sub

        def _expandMacrosInValues(configElem, macroMap):
            """ apply macro expansion in strings recursively """
            # arrays
            if isinstance(configElem, types.ListType):
                for e in range(len(configElem)):
                    if ((isinstance(configElem[e], types.StringTypes) and
                            configElem[e].find(r'${')>-1)):
                        old = configElem[e]
                        configElem[e] = _expandString(configElem[e], macroMap)
                        console.debug("expanding: %s ==> %s" % (old, configElem[e]))
                    elif isinstance(configElem[e], (types.DictType, types.ListType)):
                        _expandMacrosInValues(configElem[e], macroMap)
            # dicts
            elif isinstance(configElem, types.DictType):
                for e in configElem:
                    # expand in values
                    if ((isinstance(configElem[e], types.StringTypes) and
                            configElem[e].find(r'${')>-1)):
                        configElem[e] = _expandString(configElem[e], macroMap)
                        console.debug("expanding: %s ==> %s" % (str(e), configElem[e]))
                    elif isinstance(configElem[e], (types.DictType, types.ListType)):
                        _expandMacrosInValues(configElem[e], macroMap)

                    # expand in keys
                    if ((isinstance(e, types.StringTypes) and
                            e.find(r'${')>-1)):
                        enew = _expandString(e, macroMap)
                        configElem[enew] = configElem[e]
                        del configElem[e]
                        console.debug("expanding key: %s ==> %s" % (e, enew))

            # leave everything else alone
            else:
                pass


        def _expandMacrosInLet(letDict):
            """ takes dict with macro definitions and expands all of them within the dict"""

            keys = letDict.keys()
            for k in keys:
                kval = letDict[k]
                for k1 in keys:
                    if k != k1 and letDict[k1].find(r'${')>-1:
                        letDict[k1] = _expandString(letDict[k1], {k:kval})
                        console.debug("expanding: %s ==> %s" % (k1, letDict[k1]))
            return letDict


        console.info("Resolving macros...")
        console.indent()

        for job in jobs:
            if not config.has_key(job):
                console.warn("No such job: %s" % job)
                sys.exit(1)
            else:
                if config[job].has_key('let'):
                    # exand macros in the let
                    config[job]['let'] = _expandMacrosInLet(config[job]['let'])
                    # apply dict to other values
                    _expandMacrosInValues(config[job], config[job]['let'])

        console.outdent()


