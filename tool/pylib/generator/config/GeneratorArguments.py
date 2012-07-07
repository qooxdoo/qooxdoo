#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import optparse

##
# A subclass of optparse.OptionParser, to add all our generator options
## 

class GeneratorArguments(optparse.OptionParser):

    def __init__(self, *args, **kwargs):
        optparse.OptionParser.__init__(self, *args, **kwargs)

        usage_str = '''%prog [options] job,...

Arguments:
  job,...               a list of jobs (like 'source' or 'copy-files',
                        without the quotes) to run
  x                     use 'x' (or some undefined job name) to get a 
                        list of all available jobs from the configuration file'''
        self.set_usage(usage_str)


        # Common options
        self.add_option("-c", "--config", dest="config", metavar="CFGFILE", default="config.json", help="path to configuration file containing job definitions (default: %default)")
        self.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="quiet output mode (extra quiet)")
        self.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="verbose output mode of job processing")
        self.add_option("-w", "--config-verbose", action="store_true", dest="config_verbose", default=False, help="verbose output mode of configuration processing")
        self.add_option("-l", "--logfile", dest="logfile", metavar="FILENAME", default=None, type="string", help="log file")
        self.add_option("-s", "--stacktrace", action="store_true", dest="stacktrace", default=False, help="enable stack traces on fatal exceptions")
        self.add_option("-m", "--macro", dest="letmacros", metavar="KEY:VAL", action="map", type="string", default={}, help="define/overwrite a global 'let' macro KEY with value VAL")
        self.add_option("-d", "--daemon", dest="daemon", action="store_true", default=False, help="(EXPERIMENTAL - DON'T USE) puts the generator in daemon mode")
        self.add_option("--no-progress-indicator", dest="show_progress_indicator", action="store_false", default=True, help="suppress animated progress indication")
        
        # Dynamic options (currently not supported)
        #self.add_option("--setting", action="extend", dest="settings", metavar="KEY:VALUE", type="string", default=[], help="Used settings")
        #self.add_option("--variant", action="extend", dest="variants", metavar="KEY:VALUE", type="string", default=[], help="Selected variants")
        #self.add_option("--require", action="extend", dest="require", metavar="CLASS1:CLASS2", type="string", default=[], help="Special loadtime class dependencies")
        #self.add_option("--use", action="extend", dest="use", metavar="CLASS1:CLASS2", type="string", default=[], help="Special runtime class dependencies")

