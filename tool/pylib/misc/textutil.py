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
#
################################################################################

import sys, string, re, optparse, codecs
import filetool
from ecmascript.frontend import lang



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


unicode_white_space_regex = re.compile(lang.UNICODE_CATEGORY_Zs)

def normalizeWhiteSpace(content):
    #return content.replace(ur"\u00A0", " ")
    return unicode_white_space_regex.sub(" ", content)


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


##
# a tweaked version of the above; returns a string (for better post-processing),
def toRegExpS(text):
    return "^(" + text.replace('.', '\\.').replace('*', '.*').replace('?', '.?') + ")$"


##
# quote shell command line arguments appropriatly (e.g. when containing spaces)
def quoteCommandArgs(argv):
    argv1 = []
    if sys.platform == "win32":
        for arg in argv:
            if arg.find(' ')>-1:
                argv1.append('"%s"' % arg)
            else:
                argv1.append(arg)
    else:
        argv1 = ['"%s"' % x for x in argv]  # quote argv elements
    return argv1



def main():
    allowed = ["any2Dos", "any2Mac", "any2Unix", "convertDos2Mac", "convertDos2Unix", "convertMac2Dos", "convertMac2Unix", "convertUnix2Dos", "convertUnix2Mac", "spaces2Tab", "tab2Space", "removeTrailingSpaces", "normalizeWhiteSpace"]
    
    parser = optparse.OptionParser()

    parser.add_option("-q", "--quiet", action="store_false", dest="verbose", default=False, help="Quiet output mode.")
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", help="Verbose output mode.")
    parser.add_option("-c", "--command", dest="command", help="Normalize a file")
    parser.add_option("--encoding", dest="encoding", default="utf-8", metavar="ENCODING", help="Defines the encoding expected for input files.")

    (options, args) = parser.parse_args()
    
    if not options.command in allowed:
        raise RuntimeError( "Unallowed command: %s" % options.command)

    if len(args) == 0:
        raise RuntimeError( "Needs one or more arguments (files) to modify!")
        
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
        
