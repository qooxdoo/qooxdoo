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
from generator.ShellCmd import ShellCmd

class Config:
    def __init__(self, console, data, path=""):
        # init members
        self._console  = console
        self._data     = None
        self._fname    = None
        self._shellCmd = ShellCmd()
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
        jsonstr = obj.read()
        jsonstr = self._stripComments(jsonstr)
        data = simplejson.loads(jsonstr)
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
        

    def set(self, key, content, AddKeys=False, confmap=None):
        """Sets a (possibly nested) data element in dict <conf>
        """
        if confmap:
            container = confmap
        else:
            container = self._data
        splits = key.split("/")

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
            for namespace, fname in config['include'].iteritems():
                #cycle check
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
                jobsmap[namespace] = econfig.getData() # external config becomes namespace'd entry in jobsmap

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
                # merge 'library' key rather than shadowing
                if key == 'library'and target.has_key(key):
                    target[key] = _listPrepend(source[key],target[key])
                
                # merge 'settings' and 'let' key rather than shadowing
                if (key in ['variants','settings','let']) and target.has_key(key):
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


    def _resolveExtends1(self, console, config, jobs):
        # <jobs> is a list of names
        for job in jobs:
            #_resolveEntry(console, config, job)
            jobdata = self.get(job)
            jjob = Job(jobdata, self)  # create a job object
            jjob.resolveExtend(console, config, entryTrace=[]) # manipulate it
            self.set(job, jjob.getData())  # put the data back into the config


    def resolveMacros(self, jobs):
        console = self._console
        config  = self.getJobsMap()

        def _expandString(s, mapstr, mapbin):
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

        def _expandMacrosInValues(configElem, maps):
            """ apply macro expansion on arbitrary values; takes care of recursive data like
                lists and dicts; only actually applies macros when a string is encountered on 
                the way (look for calls to _expandString())"""
            result = configElem  # intialize result
            # arrays
            if isinstance(configElem, types.ListType):
                for e in range(len(configElem)):
                    enew = _expandMacrosInValues(configElem[e], maps)
                    if enew != configElem[e]:
                        console.debug("expanding: %s ==> %s" % (str(configElem[e]), str(enew)))
                        configElem[e] = enew
            # dicts
            elif isinstance(configElem, types.DictType):
                for e in configElem:
                    # expand in values
                    enew = _expandMacrosInValues(configElem[e], maps)
                    if enew != configElem[e]:
                        console.debug("expanding: %s ==> %s" % (str(configElem[e]), str(enew)))
                        configElem[e] = enew

                    # expand in keys
                    if ((isinstance(e, types.StringTypes) and
                            e.find(r'${')>-1)):
                        enew = _expandString(e, maps['str'], {}) # no bin expand here!
                        configElem[enew] = configElem[e]
                        del configElem[e]
                        console.debug("expanding key: %s ==> %s" % (e, enew))

            # strings
            elif isinstance(configElem, types.StringTypes):
                result = _expandString(configElem, maps['str'], maps['bin'])

            # leave everything else alone
            else:
                result = configElem

            return result


        def _expandMacrosInLet(letDict):
            """ do macro expansion within the "let" dict """

            keys = letDict.keys()
            for k in keys:
                kval = letDict[k]
                # construct a temp. dict of translation maps, for later calls to _expand* funcs
                if isinstance(kval, types.StringTypes):
                    kdicts = {'str': {k:kval}, 'bin': {}}
                else:
                    kdicts = {'str': {}, 'bin': {k:kval}}
                # cycle through other keys of this dict
                for k1 in keys:
                    if k != k1: # no expansion with itself!
                        enew = _expandMacrosInValues(letDict[k1], kdicts)
                        if enew != letDict[k1]:
                            console.debug("expanding: %s ==> %s" % (k1, str(enew)))
                            letDict[k1] = enew
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
                    cfglet = config[job]['let']
                    # separate strings from other values
                    letmaps = {}
                    letmaps['str'] = {}
                    letmaps['bin'] = {}
                    for k in cfglet:
                        if isinstance(cfglet[k], types.StringTypes):
                            letmaps['str'][k] = cfglet[k]
                        else:
                            letmaps['bin'][k] = cfglet[k]
                    # apply dict to other values
                    _expandMacrosInValues(config[job], letmaps)

        console.outdent()


    def _stripComments(self,jsonstr):
        eolComment = re.compile(r'//.*$', re.M)
        mulComment = re.compile(r'/\*.*?\*/', re.S)
        result = eolComment.sub('',jsonstr)
        result = mulComment.sub('',result)
        return result


    def resolveLibs(self, jobs):
        config  = self.getJobsMap()
        console = self._console

        console.info("Resolving libs/manifests...")
        console.indent()

        for job in jobs:
            if not config.has_key(job):
                console.warn("No such job: %s" % job)
                sys.exit(1)
            else:
                if config[job].has_key('library'):
                    newlib = config[job]['library']
                    for lib in newlib:
                        # handle downloads
                        manifest = lib['manifest']
                        manipath = os.path.dirname(manifest)
                        manifile = os.path.basename(manifest)
                        if manipath.startswith("contrib://"): # it's a contrib:// lib
                            contrib = manipath.replace("contrib://","")
                            if config[job].has_key('cache-downloads'):
                                contribCachePath = config[job]['cache-downloads']['path']
                            else:
                                contribCachePath = "cache-downloads"
                            self._download_contrib(newlib, contrib, contribCachePath)
                            manifest = os.path.join(contribCachePath, contrib, manifile)
                            lib['manifest'] = manifest  # patch 'manifest' entry to download path
                        else:  # patch the path which is local to the current config
                            pass # TODO: use manipath and config._dirname, or fix it when including the config
                        # get the local Manifest
                        manifest = Manifest(manifest)
                        lib = manifest.patchLibEntry(lib)

        console.outdent()


    def _download_contrib(self, libs, contrib, contribCache):
        # try to find $FRAMEWORK/tool/modules/download-contrib.py
        dl_script    = "download-contrib.py"
        self._console.info("Downloading contribs...")
        self._console.indent()
        for lib in libs:
            path = os.path.dirname(lib['manifest'])
            pathToScript = os.path.join(path, "tool", "modules", dl_script)
            self._console.info("trying download script: " + pathToScript)
            if os.path.exists(pathToScript):
                break
        else:
            self._console.warn("Unable to locate download script for contribs: " + dl_script)
            sys.exit(1)
            
        cmd = "python %s --contrib %s --contrib-cache %s" % tuple(
                    x.replace(" ","\ ") for x in (pathToScript, contrib, contribCache))
        rc = self._shellCmd.execute(cmd)
        self._console.outdent()
        return rc




class Job(object):
    def __init__(self, data, config=None):
        self._data   = data
        self._config = config

    def getData(self):
        return self._data

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


    def resolveExtend(self, console, config, entryTrace=[]):
        # cyclic check for recursive extends?? - done
        # is this expanding nested jobs in their own context?? - yes! (see jobcontext and parent)
        if not self.get(job,False,config):
            console.warn("No such job: %s" % job)
            sys.exit(1)

        data = self.getData()

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
        return self



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


