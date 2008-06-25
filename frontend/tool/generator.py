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
#
################################################################################

import sys, os, optparse, string, types, pprint
from optparseext.ExtendAction import ExtendAction
from generator.Log import Log
from generator.Config import Config
from generator.Generator import Generator


def listJobs(console, jobs):
    console.info("Available jobs:")
    console.indent()
    for job in sorted(jobs):
        console.info(job)
    console.outdent()       


def main():
    parser = optparse.OptionParser(option_class=ExtendAction)

    usage_str = "%prog [options] job,..."
    parser.set_usage(usage_str)


    # Common options
    parser.add_option("-c", "--config", dest="config", metavar="FILENAME", default="config.json", help="Configuration file")
    #parser.add_option("-j", "--jobs", action="extend", dest="jobs", type="string", default=[], help="List of jobs to run")
    parser.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="Quiet output mode (Extra quiet).")
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="Verbose output mode (Extra verbose).")
    parser.add_option("-l", "--logfile", dest="logfile", metavar="FILENAME", default=None, type="string", help="Log file")
    
    # wpbasti: TODO: Add option to insert arbitrary number of macros values
    # Could also be an good replacement for the four in the following listed options

    # Dynamic options (currently not supported)
    #parser.add_option("--setting", action="extend", dest="settings", metavar="KEY:VALUE", type="string", default=[], help="Used settings")
    #parser.add_option("--variant", action="extend", dest="variants", metavar="KEY:VALUE", type="string", default=[], help="Selected variants")
    #parser.add_option("--require", action="extend", dest="require", metavar="CLASS1:CLASS2", type="string", default=[], help="Special loadtime class dependencies")
    #parser.add_option("--use", action="extend", dest="use", metavar="CLASS1:CLASS2", type="string", default=[], help="Special runtime class dependencies")

    (options, args) = parser.parse_args(sys.argv[1:])


    if not args:
        parser.print_help()
        sys.exit(1)
    else:
        options.jobs = args[0].split(',')

        
    # Initialize console
    if options.verbose:
        level = "debug"
    elif options.quiet:
        level = "warning"
    else:
        level = "info"

    console = Log(options.logfile, level)


    # Initial user feedback
    console.head("Initialization", True)
    console.info("Configuration: %s" % options.config)
    console.info("Jobs: %s" % ", ".join(options.jobs))

    # Load configuration
    config = Config(console, options.config)

    # Resolve "include"-Keys
    config.resolveIncludes()

    # Check jobs
    availableJobs = config.getJobsMap().keys()
    if len(options.jobs) == 0:
        listJobs(console, availableJobs)
        sys.exit(1)
        
    else:
        for job in options.jobs:
            if job not in availableJobs:
                console.warn("No such job: %s" % job)
                listJobs(console, availableJobs)
                sys.exit(1)

    # Resolve "extend"- and "run"-Keys
    expandedjobs = config.resolveExtendsAndRuns(options.jobs[:])

    # Resolve "let"-Keys
    config.resolveMacros(expandedjobs)

    # Resolve libs/Manifests
    config.resolveLibs(expandedjobs)

    # To see fully expanded config:
    console.debug(pprint.pformat(config.get(".")))

    # Processing jobs...
    config = Config(console, config.get("jobs"))
    for job in expandedjobs:
        console.head("Executing: %s" % job, True)
        Generator(config.extract(job), console).run()


if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)
