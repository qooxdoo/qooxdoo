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

import sys, os, optparse, string, types, pprint
import qxenviron
from misc.ExtendAction import ExtendAction
from generator import Context
from generator.Generator import Generator
from generator.config.Config import Config
from generator.runtime.Log import Log
from generator.runtime.InterruptRegistry import InterruptRegistry

#import warnings
#warnings.filterwarnings("error") # turn warnings into errors - e.g. for UnicodeWarning

## TODO: The next on is a hack, and should be removed once all string handling is
## properly done in unicode; it is advisable to comment out the call to setdefaultencoding()
## when working on string handling in other parts of the generator
reload(sys)
sys.setdefaultencoding('utf-8')
sys.setrecursionlimit(1500)  # due to bug#2922; maybe this can be removed later

interruptRegistry = InterruptRegistry()

qxUserHome = os.path.expanduser(os.path.join("~", ".qooxdoo"))

def interruptCleanup():
    for func in interruptRegistry.Callbacks:
        try:
            func()
        except Error, e:
            print >>sys.stderr, e  # just keep on with the others
    
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
    parser = optparse.OptionParser(option_class=ExtendAction)

    usage_str = '''%prog [options] job,...

Arguments:
  job,...               a list of jobs (like 'source' or 'copy-files',
                        without the quotes) to run
  x                     use 'x' (or some undefined job name) to get a 
                        list of all available jobs from the configuration file'''
    parser.set_usage(usage_str)


    # Common options
    parser.add_option("-c", "--config", dest="config", metavar="CFGFILE", default="config.json", help="path to configuration file containing job definitions (default: %default)")
    parser.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="quiet output mode (extra quiet)")
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="verbose output mode of job processing")
    parser.add_option("-w", "--config-verbose", action="store_true", dest="config_verbose", default=False, help="verbose output mode of configuration processing")
    parser.add_option("-l", "--logfile", dest="logfile", metavar="FILENAME", default=None, type="string", help="log file")
    parser.add_option("-s", "--stacktrace", action="store_true", dest="stacktrace", default=False, help="enable stack traces on fatal exceptions")
    parser.add_option("-m", "--macro", dest="letmacros", metavar="KEY:VAL", action="map", type="string", default={}, help="define/overwrite a global 'let' macro KEY with value VAL")
    
    # Dynamic options (currently not supported)
    #parser.add_option("--setting", action="extend", dest="settings", metavar="KEY:VALUE", type="string", default=[], help="Used settings")
    #parser.add_option("--variant", action="extend", dest="variants", metavar="KEY:VALUE", type="string", default=[], help="Selected variants")
    #parser.add_option("--require", action="extend", dest="require", metavar="CLASS1:CLASS2", type="string", default=[], help="Special loadtime class dependencies")
    #parser.add_option("--use", action="extend", dest="use", metavar="CLASS1:CLASS2", type="string", default=[], help="Special runtime class dependencies")

    (options, args) = parser.parse_args(sys.argv[1:])

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

    # Initial user feedback
    appname = ((os.path.dirname(os.path.abspath(options.config)).split(os.sep)))[-1]
    console.head(u"Initializing: %s" % appname.decode('utf-8'), True)
    console.info(u"Configuration: %s" % options.config)

    # Load application configuration
    config = Config(console, options.config, **options.letmacros)

    # Load user configuration (preferences)
    config = getUserConfig(config)

    # Insert remaining command line args
    config = getAdditonalArgs(config, args[1:])

    # Early check for log filter -- doesn't work as there is no job selected yet
    #console.setFilter(config.get("log/filter/debug", []))

    # Resolve "include"-Keys
    console.info("Resolving config includes...")
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
        
    else:
        for job in options.jobs:
            if job not in availableJobs:
                console.warn("No such job: %s" % job)
                listJobs(console, availableJobs, config)
                sys.exit(1)

    console.info(u"Jobs: %s" % ", ".join(options.jobs))

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
    context = {'config': config, 'console':console, 'jobconf':None, 'interruptRegistry':interruptRegistry}
    for job in expandedjobs:
        console.head("Executing: %s" % job.name, True)
        if options.config_verbose:
            console.setLevel("debug")
            console.debug("Expanded job config:")
            console.debug(pprint.pformat(config.getJob(job).getData()))
            console.setLevel(level)

        ctx = context.copy()
        ctx['jobconf'] = config.getJob(job)

        generatorObj = Generator(ctx)
        generatorObj.run()


if __name__ == '__main__':
    options = None
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        interruptCleanup()
        sys.exit(2)

    except Exception, e:
        if (options == None or            # do a stack trace if we fail when parsing options
           (hasattr(options, "stacktrace") and options.stacktrace)):  # or when 'stacktrace' is enabled
            raise
        else:
            if str(e): # there's something to print
                print >> sys.stderr, e
            else:
                print >> sys.stderr, "Terminating on terminal exception (%r)" % e
            sys.exit(1)
