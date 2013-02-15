#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2009 Sebastian Werner, sebastian-werner.net
#    2010 - 2013 1&1 Internet AG, Germany, http://www.1und1.de
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

##
#
# Single-file Compile Interface for the qooxdoo Tool Chain.
#
#   Command-line utility to invoke compiling, pretty-printing, linting, AST
# output, etc. on a single JS file.
#
##

import sys, os, optparse, string, types, pprint, copy
import qxenviron

from argparser import argparse
from misc.ExtendAction import ExtendAction
from ecmascript.backend.Packer      import Packer
from ecmascript.backend             import formatter_3 as formatter
from ecmascript.frontend import tokenizer, treeutil
from ecmascript.frontend import treegenerator, treegenerator_3
from ecmascript.transform.optimizer import basecalloptimizer, privateoptimizer, stringoptimizer, variableoptimizer, variantoptimizer, inlineoptimizer
from ecmascript.backend import api
from misc import filetool
from generator import Context
from generator.runtime.Log import Log
from generator.runtime.Cache import Cache
from generator.runtime.InterruptRegistry import InterruptRegistry
from generator.config.Config import Config
from generator.runtime.Log import Log

#sys.setrecursionlimit(1500)

            
#        
# A copy from the TreeCompiler module            
#

def _optimizeStrings(tree, id):
    stringMap = stringoptimizer.search(tree)

    if len(stringMap) == 0:
        return

    stringList = stringoptimizer.sort(stringMap)
    stringoptimizer.replace(tree, stringList)

    # Build JS string fragments
    stringStart = "(function(){"
    stringReplacement = stringoptimizer.replacement(stringList)
    stringStop = "})();"

    # Compile wrapper node
    wrapperNode = treeutil.compileString(stringStart+stringReplacement+stringStop, id + "||stringopt")

    # Reorganize structure
    funcBody = wrapperNode.getChild("operand").getChild("group").getChild("function").getChild("body").getChild("block")
    if tree.hasChildren():
        for child in copy.copy(tree.children):
            tree.removeChild(child)
            funcBody.addChild(child)

    # Add wrapper to tree
    tree.addChild(wrapperNode)     


           
def interruptCleanup(interruptRegistry):
    for func in interruptRegistry.Callbacks:
        try:
            func()
        except Error, e:
            print >>sys.stderr, e  # just keep on with the others
    

def get_args_1():
    parser = optparse.OptionParser(option_class=ExtendAction)

    usage_str = '''%prog [options] [main_action] file.js,...
    
Default action is to compress the JS code. All output is written to STDOUT.
'''
    parser.set_usage(usage_str)
    
    # General flags
    option_group = optparse.OptionGroup(parser, "General Options")
    option_group.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="verbose output mode (extra verbose)")
    option_group.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="quiet output")
    option_group.add_option("-c", "--config", dest="config", metavar="CONFIGFILE", type="string", default="", help="path to a config.json file (opt.)")
    option_group.add_option("--cache", dest="cache", metavar="CACHEPATH", type="string", default="", help="path to cache directory")
    parser.add_option_group(option_group)

    # Optimization flags
    option_group = optparse.OptionGroup(parser, "Compile Options")
    option_group.add_option("-n", "--variables", action="store_true", dest="variables", default=False, help="optimize variables")
    option_group.add_option("-s", "--strings", action="store_true", dest="strings", default=False, help="optimize strings")
    option_group.add_option("-p", "--privates", action="store_true", dest="privates", default=False, help="optimize privates")
    option_group.add_option("--privateskey", dest="privateskey", metavar="CACHEKEY", type="string", default="", help="cache key for privates")
    option_group.add_option("-b", "--basecalls", action="store_true", dest="basecalls", default=False, help="optimize basecalls")            
    #option_group.add_option("-i", "--inline", action="store_true", dest="inline", default=False, help="optimize inline")
    option_group.add_option("-r", "--variants", action="store_true", dest="variantsopt", default=False, help="optimize variants")
    option_group.add_option("--variant", action="extend", dest="variants", metavar="KEY:VALUE", type="string", default=[], help="Selected variants")
    option_group.add_option("-m", "--comments", action="store_true", dest="comments", default=False, help="optimize comments")
    option_group.add_option("--all", action="store_true", dest="all", default=False, help="optimize all")            
    parser.add_option_group(option_group)
    
    # Action modifier
    option_group = optparse.OptionGroup(parser, "Main Actions")
    option_group.add_option("--pretty", action="store_true", dest="pretty", default=False, help="print out pretty printed")            
    option_group.add_option("--tree", action="store_true", dest="tree", default=False, help="print out tree")
    option_group.add_option("--lint", action="store_true", dest="lint", default=False, help="ecmalint the file")
    option_group.add_option("--deps", action="store_true", dest="dependencies", default=False, help="unresolved symbols of file")
    parser.add_option_group(option_group)

    #
    # Process arguments
    #
    (options, args) = parser.parse_args(sys.argv[1:])
    return options, args

def get_args():
    usage_str = '''%(prog)s [options] [main_action] file.js,...
    
Default action is to compress the JS code. All output is written to STDOUT.
'''
    parser = argparse.ArgumentParser()
    #parser = argparse.ArgumentParser(usage=usage_str)
    
    # General flags
    parser.add_argument("-v", "--verbose", action="store_true", dest="verbose", default=False, help="verbose output mode (extra verbose)")
    parser.add_argument("-q", "--quiet", action="store_true", dest="quiet", default=False, help="quiet output")
    parser.add_argument("-c", "--config", dest="config", metavar="CONFIGFILE", type=str, default="", help="path to a config.json file (opt.)")
    parser.add_argument("--cache", dest="cache", metavar="CACHEPATH", type=str, default="", help="path to cache directory")

    # Optimization flags
    parser.add_argument("-n", "--variables", action="store_true", dest="variables", default=False, help="optimize variables")
    parser.add_argument("-s", "--strings", action="store_true", dest="strings", default=False, help="optimize strings")
    parser.add_argument("-p", "--privates", action="store_true", dest="privates", default=False, help="optimize privates")
    parser.add_argument("--privateskey", dest="privateskey", metavar="CACHEKEY", type=str, default="", help="cache key for privates")
    parser.add_argument("-b", "--basecalls", action="store_true", dest="basecalls", default=False, help="optimize basecalls")            
    #parser.add_argument("-i", "--inline", action="store_true", dest="inline", default=False, help="optimize inline")
    parser.add_argument("-r", "--variants", action="store_true", dest="variantsopt", default=False, help="optimize variants")
    parser.add_argument("--variant", dest="variants", metavar="KEY:VALUE", type=str, default=[], help="Selected variants")
    parser.add_argument("-m", "--comments", action="store_true", dest="comments", default=False, help="optimize comments")
    parser.add_argument("--all", action="store_true", dest="all", default=False, help="optimize all")            
    
    # Action modifier
    parser.add_argument("--pretty", action="store_true", dest="pretty", default=False, help="print out pretty printed")            
    parser.add_argument("--tree", action="store_true", dest="tree", default=False, help="print out tree")
    parser.add_argument("--lint", action="store_true", dest="lint", default=False, help="ecmalint the file")
    parser.add_argument("--deps", action="store_true", dest="dependencies", default=False, help="unresolved symbols of file")

    # Arguments
    parser.add_argument("args", nargs='*')

    #
    # Process arguments
    #
    options = parser.parse_args(sys.argv[1:])
    return options, options.args

##
# You can supply a config.json via '-c|--config' to the program. The config will
# be parsed and a default job will be expanded (as if this were the job to run
# for the generator). This job's settings can then be exploited in the actions
# (e.g. pretty-print options, lint options, compile options).
#
def read_config(options):
    Context.console = Log()  # some module down the way looks for Context.console...
    config = Config(Context.console, options.config)
    config.resolveIncludes()
    default_job = config.get("default-job", "default")
    expandedjobs = config.resolveExtendsAndRuns([default_job])
    config.includeSystemDefaults(expandedjobs)
    config.resolveLibs(expandedjobs)
    config.checkSchema(expandedjobs, checkJobTypes=True)
    config.cleanUpJobs(expandedjobs)
    options.config = config
    return


def run_lint(fileName, fileContent, options, args):
    if not options.quiet:
        print ">>> Executing ecmalint..."
    print "Needs implementation"

def run_tree(fileName, fileContent, options, args):
    tokens = tokenizer.Tokenizer().parseStream(fileContent, fileName)
    if not options.quiet: print ">>> Creating tree..."
    tree = treegenerator.createFileTree(tokens)
    if not options.quiet: print ">>> Printing out tree..."
    print tree.toXml().encode('utf-8')
    return

def run_pretty(fileName, fileContent, options, args):
    #elif options.pretty:  # for testing formatter_2
    #    options = formatter.FormatterOptions()
    #    options = formatter.defaultOptions(options)
    #    print formatter.formatStream(tokens, options)
    tokens = tokenizer.Tokenizer().parseStream(fileContent, fileName)
    tree = treegenerator_3.createFileTree(tokens) # use special tree
    optns = formatter.defaultOptions()
    optns.prettypCommentsBlockAdd = False
    result = [u'']
    result = formatter.formatNode(tree, optns, result)
    result = u''.join(result)
    print result
    return

def run_dependencies(fileName, fileContent, options, args):
    pass

def run_compile(fileName, fileContent, options, args):
    fileId = fileName
    tokens = tokenizer.Tokenizer().parseStream(fileContent, fileName)
    if not options.quiet:
        print ">>> Creating tree..."
    tree = treegenerator.createFileTree(tokens)
    
    # optimizing tree
    if len(options.variants) > 0:
        if not options.quiet:
            print ">>> Selecting variants..."
        varmap = {}
        for entry in options.variants:
            pos = entry.index(":")
            varmap[entry[0:pos]] = entry[pos+1:]
            
        variantoptimizer.search(tree, varmap, fileId)
    
    if options.all or options.basecalls:
        if not options.quiet:
            print ">>> Optimizing basecalls..."
        basecalloptimizer.patch(tree)   

    #if options.all or options.inline:
    #    if not options.quiet:
    #        print ">>> Optimizing inline..."
    #    inlineoptimizer.patch(tree)   

    if options.all or options.strings:
        if not options.quiet:
            print ">>> Optimizing strings..."
        _optimizeStrings(tree, fileId)

    if options.all or options.variables:
        if not options.quiet:
            print ">>> Optimizing variables..."
        variableoptimizer.search(tree)

    if options.all or options.privates:
        if not options.quiet:
            print ">>> Optimizing privates..."
        privates = {}
        if options.cache:
            cache = Cache(options.cache, 
                interruptRegistry=interruptRegistry
            )
            privates, _ = cache.read(options.privateskey)
            if privates == None:
                privates = {}
        privateoptimizer.patch(tree, fileId, privates)
        if options.cache:
            cache.write(options.privateskey, privates)
         
    if not options.quiet:
        print ">>> Compiling..."
    result = [u'']
    result = Packer().serializeNode(tree, None, result, True)
    result = u''.join(result)
    print result.encode('utf-8')
    
    return


def main():
    (options, args) = get_args()
    
    if len(args) == 0:
        print ">>> Missing filename!"
        return

    for fileName in args:
        if not options.quiet:
            print fileName, ":"
            print ">>> Parsing file..."
        fileContent = filetool.read(fileName, "utf-8")

        if options.config:
            read_config(options)

        if options.lint:
            run_lint(fileName, fileContent, options, args)
        elif options.pretty:
            run_pretty(fileName, fileContent, options, args)
        elif options.tree:
            run_tree(fileName, fileContent, options, args)
        elif options.dependencies:
            run_dependencies(fileName, fileContent, options, args)
        else:
            run_compile(fileName, fileContent, options, args)
         
    return
            

# ------------------------------------------------------------------------------

interruptRegistry = InterruptRegistry()
            
if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        interruptCleanup(interruptRegistry)
        sys.exit(1)
