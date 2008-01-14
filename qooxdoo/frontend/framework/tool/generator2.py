#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
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

import sys, os, optparse, simplejson

from modules import optparseext

from generator2.Log import Log
from generator2.Config import Config
from generator2.Generator import Generator



def main():
    parser = optparse.OptionParser(option_class=optparseext.ExtendAction)

    parser.add_option("-c", "--config", dest="config", metavar="FILENAME", help="Configuration file")
    parser.add_option("-j", "--jobs", action="extend", dest="jobs", metavar="DIRECTORY", type="string", default=[], help="Selected jobs")
    parser.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="Quiet output mode (Extra quiet).")
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="Verbose output mode (Extra verbose).")
    parser.add_option("-l", "--logfile", dest="logfile", metavar="FILENAME", default="", type="string", help="Log file")

    # runtime addons
    parser.add_option("--setting", action="extend", dest="settings", metavar="KEY:VALUE", type="string", default=[], help="Used settings")
    parser.add_option("--variant", action="extend", dest="variants", metavar="KEY:VALUE", type="string", default=[], help="Selected variants")
    parser.add_option("--require", action="extend", dest="require", metavar="CLASS1:CLASS2", type="string", default=[], help="Special loadtime class dependencies")
    parser.add_option("--use", action="extend", dest="use", metavar="CLASS1:CLASS2", type="string", default=[], help="Special runtime class dependencies")
    parser.add_option("--featureset", action="extend", dest="featuresets", metavar="NAMESPACE:FILE", type="string", default=[], help="Featureset files to load")

    if len(sys.argv[1:]) == 0:
        basename = os.path.basename(sys.argv[0])
        print "usage: %s [options]" % basename
        print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
        sys.exit(1)

    (options, args) = parser.parse_args(sys.argv[1:])

    # Initialize console
    if options.verbose:
        console = Log(options.logfile, "debug")
    elif options.quiet:
        console = Log(options.logfile, "warning")
    else:
        console = Log(options.logfile, "info")

    # Initial user feedback
    console.head("Initialization", True)
    console.info("Processing...")
    console.indent()
    console.debug("Configuration: %s" % options.config)
    console.debug("Jobs: %s" % ", ".join(options.jobs))
    console.outdent()

    # Load from json configuration
    obj = open(options.config)
    config = simplejson.loads(obj.read())
    obj.close()

    # Resolve "extend"-Keys
    _resolveExtends(console, config, options.jobs)

    # Convert into Config class instance
    config = Config(config)

    # Processing feature sets
    variants, settings, require, use = _executeFeatureSets(console, options)

    # Processing jobs...
    for job in options.jobs:
        console.head("Executing: %s" % job, True)
        Generator(config.split(job), console, variants, settings, require, use)



def _resolveExtends(console, config, jobs):
    def _mergeEntry(target, source):
        for key in source:
            if not target.has_key(key):
                target[key] = source[key]

    def _resolveEntry(console, config, job):
        if not config.has_key(job):
            console.warn("No such job: %s" % job)
            sys.exit(1)

        data = config[job]

        if data.has_key("resolved"):
            return

        if data.has_key("extend"):
            includes = data["extend"]

            for entry in includes:
                _resolveEntry(console, config, entry)
                _mergeEntry(config[job], config[entry])

        data["resolved"] = True

    console.info("Resolving jobs...")
    console.indent()

    for job in jobs:
        _resolveEntry(console, config, job)

    console.outdent()



def _executeFeatureSets(console, options):
    def _variantToSet(data):
        for key in data:
            if data[key] == "on":
                data[key] = True
            elif data[key] == "off":
                data[key] = False

        return data

    def _variantFromSet(data):
        for key in data:
            if data[key] == True:
                data[key] = "on"
            elif data[key] == False:
                data[key] = "off"
            elif not isinstance(data[key], basestring):
                data[key] = "%s" % data[key]

        return data

    def _settingToSet(data):
        for key in data:
            if data[key] == "true":
                data[key] = True
            elif data[key] == "false":
                data[key] = False

        return data

    def _settingFromSet(data):
        for key in data:
            if data[key] == True:
                data[key] = "true"
            elif data[key] == False:
                data[key] = "false"
            elif not isinstance(data[key], basestring):
                data[key] = "%s" % data[key]

        return data

    def _splitSingle(data, divider=":"):
        result = {}
        for entry in data:
            splitted = entry.split(divider)
            result[splitted[0]] = splitted[1]

        return result

    def _splitMulti(data, divider=":"):
        result = {}
        for entry in data:
            splitted = entry.split(divider)
            key = splitted[0]
            value = splitted[1]

            if not result.has_key(key):
                result[key] = []

            result[key].append(value)

        return result

    sets = options.featuresets
    variants = _splitSingle(options.variants)
    settings = _splitSingle(options.settings)
    require = _splitMulti(options.require)
    use = _splitMulti(options.use)

    runtime = {
      "variant" : _variantToSet(variants),
      "setting" : _settingToSet(settings),
      "require" : require,
      "use" : use
    }

    for fileName in sets:
        console.debug("Executing feature set: %s" % fileName)
        execfile(fileName, {}, runtime)

    # Convert to useable variants and settings
    variants = _variantFromSet(runtime["variant"])
    settings = _settingFromSet(runtime["setting"])

    return variants, settings, require, use



if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)
