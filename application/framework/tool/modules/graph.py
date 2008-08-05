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
#    * Fabian Jakobs (fjakobs)
#
################################################################################

# Write dependencies to a Graphviz compatible file (http://www.graphviz.org/)

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


import os
import math
import filetool

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
def foo(a,b):
 
    ##
    # This comment provides documentation for the following
    # variable.
    variable = value
def dotLine(fileDb, fileId, depEntry, largetFileSize):
    file = fileId.split(".")
    dep = depEntry.split(".")
    weight = 1

    for i in range(len(file)):
        if file[i] == dep[i]:
            weight += 1
        else:
            break

    size = os.path.getsize(fileDb[fileId]["path"])

    content = '  "%s" [color="%s %s 1.000"];\n' % (fileId, math.log(size)/math.log(largetFileSize), math.log(size)/math.log(largetFileSize))
    content += '  "%s" -> "%s" [weight=%s];\n' % (fileId, depEntry, weight)

    return content


def store(fileDb, sortedIncludeList, options):
    content = '''digraph "qooxdoo" {
node [style=filled];
'''

    largest = 0
    for fileId in sortedIncludeList:
            size = os.path.getsize(fileDb[fileId]["path"])
            if size > largest:
                    largest = size

    for fileId in sortedIncludeList:
        if len(fileDb[fileId]["loadtimeDeps"]) > 0:
            for depEntry in fileDb[fileId]["loadtimeDeps"]:
                content += dotLine(fileDb, fileId, depEntry, largest)

        if len(fileDb[fileId]["runtimeDeps"]) > 0:
            for depEntry in fileDb[fileId]["runtimeDeps"]:
                content += dotLine(fileDb, fileId, depEntry, largest)

    content += '}'
    filetool.save(options.depDotFile, content)
