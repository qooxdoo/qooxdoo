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
# 
# TODO: These options would also be nice:
#
# * generate an API file
# * fix the file for tabs vs. spaces etc.
# * ecmalint the file
#
##

import sys, os, optparse, string, types, pprint, copy
import qxenviron

from optparseext.ExtendAction import ExtendAction
from ecmascript import compiler
from ecmascript.frontend import tokenizer, treegenerator, treeutil
from ecmascript.backend.optimizer import basecalloptimizer, privateoptimizer, stringoptimizer, variableoptimizer, variantoptimizer, inlineoptimizer
from misc import filetool

            
def main():
    parser = optparse.OptionParser(option_class=ExtendAction)

    usage_str = '''%prog [options] file.js,...'''
    parser.set_usage(usage_str)
    
    # General flags
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="verbose output mode (extra verbose)")

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
    
    
    #
    # Process arguments
    #
    (options, args) = parser.parse_args(sys.argv[1:])

    print ">>> Parsing file..."
    fileName = args[0]
    fileContent = filetool.read(fileName, "utf-8")
    fileId = "xxx"
    tokens = tokenizer.parseStream(fileContent, fileName)
    
    print ">>> Creating tree..."
    tree = treegenerator.createSyntaxTree(tokens)
    
    
    #
    # Optimizing tree
    #
    
    if len(options.variants) > 0:
        print ">>> Selecting variants..."
        variantoptimizer.search(tree, options.variants, fileId)
    
    if options.all or options.basecalls:
        print ">>> Optimizing basecalls..."
        basecalloptimizer.patch(tree)   

    if options.all or options.inline:
        print ">>> Optimizing inline..."
        inlineoptimizer.patch(tree)   

    if options.all or options.strings:
        print ">>> Optimizing strings..."
        _optimizeStrings(tree, fileId)

    if options.all or options.variables:
        print ">>> Optimizing variables..."
        variableoptimizer.search(tree)

    if options.all or options.privates:
        print ">>> Optimizing privates..."
        privateoptimizer.patch(tree, fileId)
         
         
    #
    # Output the result
    #
    
    if options.tree:
        print ">>> Printing out tree..."
        print tree.toXml()
        
    else:
        print ">>> Compiling..."
        compiled = _compileTree(tree, options.pretty)
        print compiled
            

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