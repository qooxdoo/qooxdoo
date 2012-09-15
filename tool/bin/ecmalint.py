#!/usr/bin/env python
# encoding: utf-8

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
#    * Fabian Jakobs (fjakobs)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import re, os, sys, codecs
import qxenviron
from optparse import OptionParser
from ecmascript.frontend import treegenerator
from ecmascript.transform.check import scopes, lint
from generator import Context
from generator.runtime.Log import Log

def main(argv=None):

    # init Context module
    Context.console = Log()
    Context.jobconf = {}

    if argv is None:
        argv = sys.argv

    parser = OptionParser(description="Checks ECMAScript/JavaScript files for common errors.")
    parser.add_option(
        "--action", "-a", dest="actions", metavar="ACTION",
        choices=["ALL", "undefined_variables", "unused_variables", "multidefined_variables", "maps", "blocks", "fields"], action="append", default=[],
        help="""Performs the given checks on the input files. This parameter may be supplied multiple times.
Valid arguments are: "ALL" (default): Perform all checks
"undefined_variables": Look for identifier, which are referenced in the global scope. This action can find
misspelled identifier and missing 'var' statements. You can use the '-g' flag to add valid global identifiers.
  "unused_variables": Look for identifier, which are defined but never used.
  "multidefined_variables": Look for identifier, which are defined multiple times.
  "blocks" : Look for single statments in bodies of if's and loops that are not enclosed by braces.
  "fields" : Look for class attributes, checking definedness, privates and protected fields.
  "maps": Look for duplicate keys in map declarations. """
    )
    parser.add_option(
        "-g", dest="globals", help="Add an allowed global identifier GLOBAL",
        metavar="GLOBAL", action="append", default=[]
    )

    (options, args) = parser.parse_args(argv)

    if len(args) == 1:
        parser.print_help()
        sys.exit(1)

    if options.globals:
        globals_ = options.globals
    else:
        globals_ = []

    checkAll = "ALL" in options.actions or len(options.actions) == 0

    # construct opts argument for lint_check
    keys_map ={  # map cli 'action' keys to lint.options
        "undefined_variables"    : ["ignore_undefined_globals"], 
        "unused_variables"       : ["ignore_unused_variables", "ignore_unused_parameter"],
        "multidefined_variables" : ["ignore_multiple_vardecls"], 
        "maps"   : ["ignore_multiple_mapkeys"], 
        "blocks" : ["ignore_no_loop_block"], 
        "fields" : ["ignore_reference_fields", "ignore_undeclared_privates"],
    }
    opts = lint.defaultOptions()
    opts.allowed_globals = options.globals
    for opt in (o for o in vars(opts) if o.startswith("ignore_")):
        if checkAll:
            setattr(opts, opt, False)
        else:
            for argopt in keys_map:
                if argopt in options.actions and opt in keys_map[argopt]:
                    setattr(opts, opt, False)
                    break
            else:
                setattr(opts, opt, True)


    for filename in args[1:]:
        tree_ = treegenerator.createFileTree_from_string(codecs.open(filename, "r", "utf-8").read())
        tree_ = scopes.create_scopes(tree_)
        lint.lint_check(tree_, filename, opts)

    return ## TODO: rc


if __name__ == "__main__":
    rc = main()
    sys.exit(rc)
