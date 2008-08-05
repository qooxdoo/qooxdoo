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

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  module.py -- module short description
#
# SYNTAX
#  module.py --help
#
#  or
#
#  import module
#  result = module.func()
#
# DESCRIPTION
#  The module module does blah.
#
# CAVEATS
#
# KNOWN ISSUES
#  There are no known issues.
#</pre>
##

import sys, string, re, optparse, codecs
import config, filetool, comment




##                                                                              
# Some nice short description of foo(); this can contain html and 
# {@link #foo Links} to items in the current file.
#                                                                               
# @param     a        Describe a positional parameter
# @keyparam  b        Describe a keyword parameter
# @def       foo(name)    # overwrites auto-generated function signature
# @param     name     Describe aliased parameter
# @return             Description of the things returned
# @defreturn          The return type
# @exception IOError  The error it throws
#
def convertMac2Unix(content):
    return content.replace("\r", "\n")

def convertMac2Dos(content):
    return content.replace("\r", "\r\n")

def convertDos2Unix(content):
    return content.replace("\r\n", "\n")

def convertDos2Mac(content):
    return content.replace("\r\n", "\r")

def convertUnix2Dos(content):
    return content.replace("\n", "\r\n")

def convertUnix2Mac(content):
    return content.replace("\n", "\r")




def any2Unix(content):
    # DOS must be first, because it is a combination of Unix & Mac
    return convertMac2Unix(convertDos2Unix(content))

def any2Dos(content):
    # to protect old DOS breaks first, we need to convert to
    # a line ending with single character first e.g. Unix
    return convertUnix2Dos(any2Unix(content))

def any2Mac(content):
    # to protect old DOS breaks first, we need to convert to
    # a line ending with single character first e.g. Unix
    return convertUnix2Mac(any2Unix(content))



def getLineEndingName(content):
    if "\r\n" in content:
        return "dos"

    if "\r" in content:
        return "mac"

    # defaults to unix
    return "unix"

def getLineEndingSequence(content):
    if "\r\n" in content:
        return "\r\n"

    if "\r" in content:
        return "\r"

    # defaults to unix
    return "\n"



def tab2Space(content, spaces=2):
    return content.replace("\t", " " * spaces)

def spaces2Tab(content, spaces=2):
    return content.replace(" " * spaces, "\t")



def removeTrailingSpaces(content):
    ending = getLineEndingSequence(content)
    lines = content.split(ending)
    length = len(lines)
    pos = 0

    while pos < length:
        lines[pos] = lines[pos].rstrip()
        pos += 1

    return ending.join(lines)


def toRegExp(text):
    return re.compile("^(" + text.replace('.', '\\.').replace('*', '.*').replace('?', '.?') + ")$")











def main():
    allowed = ["any2Dos", "any2Mac", "any2Unix", "convertDos2Mac", "convertDos2Unix", "convertMac2Dos", "convertMac2Unix", "convertUnix2Dos", "convertUnix2Mac", "spaces2Tab", "tab2Space"]
    
    parser = optparse.OptionParser()

    parser.add_option("-q", "--quiet", action="store_false", dest="verbose", default=False, help="Quiet output mode.")
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", help="Verbose output mode.")
    parser.add_option("-c", "--command", dest="command", help="Normalize a file")
    parser.add_option("--encoding", dest="encoding", default="utf-8", metavar="ENCODING", help="Defines the encoding expected for input files.")

    (options, args) = parser.parse_args()
    
    if not options.command in allowed:
        print "Unallowed command: %s" % options.command
        sys.exit(1)

    if len(args) == 0:
        print "Needs one or more arguments (files) to modify!"
        sys.exit(1)
        
    for fileName in args:
        if options.verbose:
            print "  * Running %s on: %s" % (options.command, fileName)
        
        ref = codecs.open(fileName, encoding=options.encoding, mode="r")
        origFileContent = ref.read()
        ref.close()        

        patchedFileContent = eval(options.command + "(origFileContent)")
        
        if patchedFileContent != origFileContent:
            if options.verbose:
                print "  * Store modifications..."
                
            filetool.save(fileName, patchedFileContent, options.encoding)





if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)
        
