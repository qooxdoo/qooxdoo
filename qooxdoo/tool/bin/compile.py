#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2009 Sebastian Werner, sebastian-werner.net
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

##
#
# Operates on single file basis to do one of the following actions:
#
# * compile the file
# * pretty print the file
# * generate the abstract syntax tree
# * generate an API file
# * ecmalint the file
#
##

import sys, os, optparse, string, types, pprint, copy
import qxenviron

from misc.ExtendAction import ExtendAction
from ecmascript import compiler
from ecmascript.frontend import tokenizer, treegenerator, treeutil
from ecmascript.transform.optimizer import basecalloptimizer, privateoptimizer, stringoptimizer, variableoptimizer, variantoptimizer, inlineoptimizer
from ecmascript.backend import api
from misc import filetool
from generator.runtime.Log import Log
from generator.runtime.Cache import Cache

            
def main():
    parser = optparse.OptionParser(option_class=ExtendAction)

    usage_str = '''%prog [options] file.js,...'''
    parser.set_usage(usage_str)
    
    # General flags
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="verbose output mode (extra verbose)")
    parser.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="quiet output")

    # Optimization flags
    parser.add_option("-n", "--variables", action="store_true", dest="variables", default=False, help="optimize variables")
    parser.add_option("-s", "--strings", action="store_true", dest="strings", default=False, help="optimize strings")
    parser.add_option("-p", "--privates", action="store_true", dest="privates", default=False, help="optimize privates")
    parser.add_option("-b", "--basecalls", action="store_true", dest="basecalls", default=False, help="optimize basecalls")            
    parser.add_option("-i", "--inline", action="store_true", dest="inline", default=False, help="optimize inline")
    parser.add_option("--all", action="store_true", dest="all", default=False, help="optimize all")            

    # Variant support
    parser.add_option("--variant", action="extend", dest="variants", metavar="KEY:VALUE", type="string", default=[], help="Selected variants")
    
    # Action modifier
    parser.add_option("--pretty", action="store_true", dest="pretty", default=False, help="print out pretty printed")            
    parser.add_option("--tree", action="store_true", dest="tree", default=False, help="print out tree")
    parser.add_option("--lint", action="store_true", dest="lint", default=False, help="ecmalint the file")

    # Cache support
    parser.add_option("-c", "--cache", dest="cache", metavar="CACHEPATH", type="string", default="", help="path to cache directory")
    parser.add_option("--privateskey", dest="privateskey", metavar="CACHEKEY", type="string", default="", help="cache key for privates")
    
    
    #
    # Process arguments
    #
    (options, args) = parser.parse_args(sys.argv[1:])
    
    if len(args) == 0:
        print ">>> Missing filename!"
        return

    if not options.quiet:
        print ">>> Parsing file..."
    fileName = args[0]
    fileContent = filetool.read(fileName, "utf-8")
    fileId = "xxx"
    tokens = tokenizer.parseStream(fileContent, fileName)
    
    if not options.quiet:
        print ">>> Creating tree..."
    tree = treegenerator.createSyntaxTree(tokens)
    
    
    #
    # Optimizing tree
    #
    
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

    if options.all or options.inline:
        if not options.quiet:
            print ">>> Optimizing inline..."
        inlineoptimizer.patch(tree)   

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
        if options.cache:
            cache = Cache(options.cache, Log())
            privates, _ = cache.read(options.privateskey)
            if privates != None:
                privateoptimizer.load(privates)
        privateoptimizer.patch(tree, fileId)
        if options.cache:
            cache.write(options.privateskey, privateoptimizer.get())
         
         
    #
    # Output the result
    #
            
    if options.lint:
        if not options.quiet:
            print ">>> Executing ecmalint..."
        print "Needs implementation"
    
    elif options.tree:
        if not options.quiet:
            print ">>> Printing out tree..."
        print tree.toXml().encode('utf-8')
        
    else:
        if not options.quiet:
            print ">>> Compiling..."
        compiled = _compileTree(tree, options.pretty)
        print compiled.encode('utf-8')
            

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


           
#
# Wrapper around the ugly compiler interface            
#

def _compileTree(tree, pretty):
    # Emulate options
    parser = optparse.OptionParser()
    parser.add_option("-a", action="store_true", dest="prettyPrint", default=pretty)
    parser.add_option("-b", action="store_true", dest="prettypIndentString", default="  ")
    parser.add_option("-c", action="store_true", dest="prettypCommentsInlinePadding", default="  ")
    parser.add_option("-d", action="store_true", dest="prettypCommentsTrailingCommentCols", default="")
    parser.add_option("-e", action="store_true", dest="prettypOpenCurlyNewlineBefore", default="")
    parser.add_option("-f", action="store_true", dest="prettypOpenCurlyIndentBefore", default="")
    parser.add_option("-g", action="store_true", dest="prettypCommentsTrailingKeepColumn", default=False)
    parser.add_option("-i", action="store_true", dest="prettypAlignBlockWithCurlies", default=False)

    (options, args) = parser.parse_args([])

    return compiler.compile(tree, options, True)
     

#
# Main routine
#            
            
if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)
