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
from __future__ import print_function

import sys, os, string, types, pprint
import qxenviron
from misc.ExtendAction import ExtendAction
from generator import Context
from generator.Generator import Generator
from generator.config.Config import Config
from generator.config.GeneratorArguments import GeneratorArguments
from generator.runtime.Log import Log
from generator.runtime.InterruptRegistry import InterruptRegistry

#import warnings
#warnings.filterwarnings("error") # turn warnings into errors - e.g. for UnicodeWarning

# - Config section -------------------------------------------------------------

# for the '_all_' job, skip jobs that require manual intervention
_ALL_SKIP_JOBS = set('migration watch watch-scss source-server source-server-reload simulation-run'.split())

# - Config end -----------------------------------------------------------------

## TODO: The next on is a hack, and should be removed once all string handling is
## properly done in unicode; it is advisable to comment out the call to setdefaultencoding()
## when working on string handling in other parts of the generator
reload(sys)
sys.setdefaultencoding('utf-8')
sys.setrecursionlimit(3500)  # due to bug#2922; increased with bug#5265

# Fix for Jython
if os.name == 'java':
  # Java GC cannot be disabled, see http://bugs.jython.org/issue1175
  import gc
  try:
    gc.disable()
    gc.enable()
  except NotImplementedError:
    gc.disable = gc.enable

interruptRegistry = InterruptRegistry()

qxUserHome = os.path.expanduser(os.path.join("~", ".qooxdoo"))

def interruptCleanup():
    for func in interruptRegistry.Callbacks:
        try:
            func()
        except Error as e:
            print(e, file=sys.stderr)  # just keep on with the others

##
# This can be used with sys.settrace(). It records the max. stack size during
# exection. Slows the whole thing down, of course.
maxstacki = 0
def stacktrace(frame, event, arg):
    global maxstacki
    currstacki = 0
    f = frame
    while f.f_back:
        currstacki += 1
        f = f.f_back
    if currstacki > maxstacki:
        maxstacki = currstacki


def listJobs(console, jobs, config):
    console.info("Available jobs:")
    console.indent()
    jobsAndDesc = getJobsDesc(jobs, config)
    for jname in sorted(jobsAndDesc.iterkeys()):
        jdesc = jobsAndDesc[jname]
        console.info(jname + (" \t -- " + jdesc if jdesc else ""))
    console.outdent()

def getJobsDesc(jobs, config):
    jobsAndDesc = {}
    for jname in jobs:
        jdesc = config.getJob(jname).getFeature("desc", "")
        jobsAndDesc[jname] = jdesc

    return jobsAndDesc

def getUserConfig(config):
    generatorPrefsPath = os.path.join(qxUserHome, "generator.json")
    if os.path.exists(generatorPrefsPath):
        # treat the user file like an initial include
        includes = config.get("include", [])
        includes.insert(0, {"path": generatorPrefsPath})
        config.set("include", includes)

    return config

def getAdditonalArgs(config, args):
    if len(args):
        globallet = config.get("let", {})
        globallet[u"ARGS"] = args
        config.set("let", globallet)

    return config

def initConfig(console, options, args):
   # Load application configuration
   config = Config(console, options.config, **options.letmacros)

   # Load user configuration (preferences)
   config = getUserConfig(config)

   # Insert remaining command line args
   config = getAdditonalArgs(config, args[1:])

   return config;


def main():
    global options
    (options, args) = GeneratorArguments(option_class=ExtendAction).parse_args(sys.argv[1:])

    if args:
        options.jobs = args[0].split(',')
    else:
        options.jobs = []

    # Save cli options to Context
    gen_opts = [x for x in sys.argv[1:] if x not in args]  # cli options without jobs list
    Context.generator_opts = gen_opts  # as list

    # Initialize console
    if options.verbose:
        level = "debug"
    elif options.quiet:
        level = "warning"
    else:
        level = "info"

    console = Log(options.logfile, level)
    Context.console = console

    # Grunt compat: Print list of jobs as json
    if options.listjobs:
        config = initConfig(console, options, args)
        config.resolveIncludes()
        from misc import json
        print(json.dumpsPretty(getJobsDesc(config.getExportedJobsList(), config)))
        sys.exit(0)

    # Treat verbosity of pre-job processing
    if options.config_verbose:
        console.setLevel("debug")
        console.setFilter(["generator.config.*"])
    else:
        console.setLevel("info")

    # Show progress indicator?
    console.progress_indication = options.show_progress_indicator

    # Initial user feedback
    appname = ((os.path.dirname(os.path.abspath(options.config)).split(os.sep)))[-1]
    console.head(u"Initializing: %s" % appname.decode('utf-8'), True)
    console.info(u"Processing configuration")
    console.debug(u"    file: %s" % options.config)

    config = initConfig(console, options, args);

    # Early check for log filter -- doesn't work as there is no job selected yet
    #console.setFilter(config.get("log/filter/debug", []))

    # Resolve "include"-Keys
    console.debug("Resolving config includes...")
    console.indent()
    config.resolveIncludes()
    console.outdent()

    # Check jobs
    availableJobs = config.getExportedJobsList()
    if len(options.jobs) == 0:
        default_job = config.get("default-job", "")
        if default_job:
            options.jobs.append(default_job)
        else:
            listJobs(console, availableJobs, config)
            sys.exit(1)

    elif '_all_' in options.jobs:
        options.jobs = []
        for job in availableJobs:
            if job not in _ALL_SKIP_JOBS:
                options.jobs.append(job)
    else:
        for job in options.jobs:
            if job not in availableJobs:
                console.warn("No such job: %s" % job)
                listJobs(console, availableJobs, config)
                sys.exit(1)

    console.debug(u"Jobs: %s" % ", ".join(options.jobs))
    context = {'config': config, 'console':console, 'jobconf':None, 'interruptRegistry':interruptRegistry}
    Context.config = config # TODO: clean up overlap between context dict and Context module

    # Resolve "extend"- and "run"-Keys
    expandedjobs = config.resolveExtendsAndRuns(options.jobs[:])

    # Include system defaults
    config.includeSystemDefaults(expandedjobs)

    # Resolve "let"-Keys
    config.resolveMacros(expandedjobs)

    # Resolve libs/Manifests
    config.resolveLibs(expandedjobs)

    # To see fully expanded config:
    # console.info(pprint.pformat(config.get(".")))

    # Do some config schema checking
    config.checkSchema(expandedjobs, checkJobTypes=True)

    # Clean-up config
    config.cleanUpJobs(expandedjobs)

    # Reset console level
    console.setLevel(level)
    console.resetFilter()

    # Processing jobs...
    for job in expandedjobs:
        console.head("Executing: %s" % job.name, True)
        if options.config_verbose:
            console.setLevel("debug")
            console.debug("Expanded job config:")
            console.debug(pprint.pformat(config.getJob(job).getData()))
            console.setLevel(level)

        ctx = context.copy()
        ctx['jobconf'] = config.getJob(job)
        Context.jobconf = ctx['jobconf']

        generatorObj = Generator(ctx)
        generatorObj.run()

    return


if __name__ == '__main__':
    options = None
    try:
        #sys.settrace(stacktrace)
        main()

    except KeyboardInterrupt:
        print()
        print("Keyboard interrupt!")
        interruptCleanup()
        sys.exit(2)

    except Exception as e:
        interruptCleanup()
        if (options == None or            # do a stack trace if we fail when parsing options
           (hasattr(options, "stacktrace") and options.stacktrace)):  # or when 'stacktrace' is enabled
            raise
        else:
            err = ''
            try:
                err = str(e)
            except:
                pass
            if err: # there's something to print
                print(type(e), ":", file=sys.stderr)
                for el in e.args:
                    print(str(el)[:300], file=sys.stderr)
            else:
                msg = "\nTerminating on {0}; please re-run with -s.".format(type(e))
                print(msg, file=sys.stderr)
            sys.exit(1)
