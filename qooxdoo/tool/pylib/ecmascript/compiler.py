#!/usr/bin/env python
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
#    * Alessandro Sala (asala)
#
################################################################################

import sys, string, re
from ecmascript.frontend import comment
from ecmascript.backend import pretty as prettyM
from ecmascript.backend.Packer import Packer

def compile(node, opts, enableBreaks=False, enableVerbose=False):

    options = opts
    options.prettypIndentString          = eval("'" + options.prettypIndentString + "'")
    options.prettypCommentsInlinePadding = eval("'" + options.prettypCommentsInlinePadding + "'")
                                                              # allow for escapes like "\t"
    # split trailing comment cols into an array
    if (options.prettypCommentsTrailingCommentCols and
        isinstance(options.prettypCommentsTrailingCommentCols, basestring)):
        options.prettypCommentsTrailingCommentCols = [int(column.strip()) for column in options.prettypCommentsTrailingCommentCols.split(",")]
        options.prettypCommentsTrailingCommentCols.sort() # make sure they are ascending!
    # or make sure it's a list of int's
    elif (isinstance(options.prettypCommentsTrailingCommentCols, list) and
        reduce(lambda y,z: y and z,
               [isinstance(x,int) for x in options.prettypCommentsTrailingCommentCols],
               True)):
        options.prettypCommentsTrailingCommentCols.sort() # make sure they are ascending!
    # or pass
    else:
        #raise TypeError, "Unsuitable type for option --pretty-print-comments-trailing-commentCols"
        pass

    result       = [u""]

    if opts.prettyPrint:
        comment.fill(node)
        result = prettyM.prettyNode(node, opts, result)
    else:
        packer = Packer()
        result = packer.serializeNode(node, opts, result, enableBreaks)

    return u"".join(result)



def addCommandLineOptions(parser):
    parser.add_option("--pretty-print-indent-string", metavar="STRING", dest="prettypIndentString", default="  ", help="String used for indenting source code; escapes possible, e.g. \"\\t\" (default: \"  \")")
    parser.add_option("--pretty-print-newline-before-open-curly", dest="prettypOpenCurlyNewlineBefore",
                      type="choice", choices=('a','A','n','N','m','M'), metavar="[aAnNmM]", default="m",
                      help="Defines whether \"{\" will always [aA] or never [nN] be on a new line; the default is mixed [mM] behaviour according to complexity of the enclosed block")
    parser.add_option("--pretty-print-indent-before-open-curly", action="store_true", dest="prettypOpenCurlyIndentBefore", default=False, help="Indent \"{\" (default: False)")
    parser.add_option("--pretty-print-indent-align-block-with-curlies", action="store_true", dest="prettypAlignBlockWithCurlies", default=False, help="Align a block of code with its surrounding curlies (obviously not with the opening curly when it is not on a new line); use in combination with --pretty-print-indent-before-open-curly, otherwise the result might look weird (default: False)")
    parser.add_option("--pretty-print-comments-trailing-keepColumn", action="store_true", dest="prettypCommentsTrailingKeepColumn", default=False, help="Keep column for trailing comments instead of just putting it after text (via pretty-print-inline-comment-padding). If code is too long, either the padding specified in --pretty-print-inline-comment-padding is inserted or the comment is moved to the next column given by --pretty-print-comments-trailing-commentCols (default: False)")
    parser.add_option("--pretty-print-comments-trailing-commentCols", metavar="\"<col1>,<col2>,..,<colN>\"", dest="prettypCommentsTrailingCommentCols", default="", help="Columns for trailing comments as a comma separated list e.g. \"50,70,90\". In this case if code length is less than 49, column 50 will be used; if between 50 and 69, column 70 will be used and so on. These apply if --pretty-print-comments-trailing-keepColumn isn't specified, or if it is specified but the code exceeds the original column (default: \"\")")
    parser.add_option("--pretty-print-inline-comment-padding", metavar="STRING", dest="prettypCommentsInlinePadding", default="  ", help="String used between the end of a statement and a trailing inline comment; escapes possible, e.g. \"\\t\" (default: \"  \"). If --pretty-print-comments-trailing-keepColumn or --pretty-print-comments-trailing-commentCols are set then they take precendence.")

