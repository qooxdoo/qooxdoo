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

## TODO: The next on is a hack, and should be removed once all string handling is
## properly done in unicode; it is advisable to comment out the call to setdefaultencoding()
## when working on string handling in other parts of the generator
reload(sys)
sys.setdefaultencoding('utf-8')
sys.setrecursionlimit(3500)  # due to bug#2922; increased with bug#5265

interruptRegistry = InterruptRegistry()

qxUserHome = os.path.expanduser(os.path.join("~", ".qooxdoo"))

def interruptCleanup():
    for func in interruptRegistry.Callbacks:
        try:
            func()
        except Error, e:
            print >>sys.stderr, e  # just keep on with the others
    
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
    for job in sorted(jobs):
        jdesc = config.getJob(job).getFeature("desc", "")
        if jdesc:
            jdesc = " \t -- %s" % (jdesc,)
        console.info(job + jdesc)
    console.outdent()       

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


def main():
    global options
    (options, args) = GeneratorArguments(option_class=ExtendAction).parse_args(sys.argv[1:])

    if args:
        options.jobs = args[0].split(',')
    else:
        options.jobs = []

        
    # Initialize console
    if options.verbose:
        level = "debug"
    elif options.quiet:
        level = "warning"
    else:
        level = "info"

    console = Log(options.logfile, level)
    Context.console = console

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

    # Load application configuration
    config = Config(console, options.config, **options.letmacros)

    # Load user configuration (preferences)
    config = getUserConfig(config)

    # Insert remaining command line args
    config = getAdditonalArgs(config, args[1:])

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
            if not options.daemon:
                listJobs(console, availableJobs, config)
                sys.exit(1)
        
    else:
        for job in options.jobs:
            if job not in availableJobs:
                console.warn("No such job: %s" % job)
                listJobs(console, availableJobs, config)
                sys.exit(1)

    console.debug(u"Jobs: %s" % ", ".join(options.jobs))
    context = {'config': config, 'console':console, 'jobconf':None, 'interruptRegistry':interruptRegistry}
    Context.config = config # TODO: clean up overlap between context dict and Context module

    # CLI mode
    if not options.daemon:
        # Resolve "extend"- and "run"-Keys
        expandedjobs = config.resolveExtendsAndRuns(options.jobs[:])

        # Include system defaults
        config.includeSystemDefaults(expandedjobs)
        
        # Resolve "let"-Keys
        config.resolveMacros(expandedjobs)

        # Resolve libs/Manifests
        config.resolveLibs(expandedjobs)

        # To see fully expanded config:
        #console.info(pprint.pformat(config.get(".")))

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

    # Daemon mode
    else: 
        from generator.runtime.Generatord import Generatord
        console.head("Executing: Daemon Mode", True)
        generatord = Generatord(context)
        console.info("Opening port %s on %s, serving in background..." % (generatord.servAddr[1], 
            generatord.servAddr[0] if generatord.servAddr[0] else 'localhost')
        )
        generatord.serve()


if __name__ == '__main__':
    options = None
    try:
        #sys.settrace(stacktrace)
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        interruptCleanup()
        sys.exit(2)

    except Exception, e:
        interruptCleanup()
        if (options == None or            # do a stack trace if we fail when parsing options
           (hasattr(options, "stacktrace") and options.stacktrace)):  # or when 'stacktrace' is enabled
            raise
        else:
            if str(e): # there's something to print
                print >> sys.stderr, e
            else:
                print >> sys.stderr, "Terminating on terminal exception (%r)" % e
            sys.exit(1)
