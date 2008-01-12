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

import os
import sys
import re
import optparse
from elementtree import ElementTree

import filetool



DIRINFO = re.compile("dir\n([0-9]+)\nhttps://.*/svnroot/qooxdoo/([a-zA-Z0-9_-]+)/([a-zA-Z0-9_-]+)/", re.M | re.S)



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
def query(path):
    if os.path.exists(path):
        entries = os.path.join(path, ".svn", "entries")

        if os.path.exists(entries):

            # old (svn 1.3) XML style format
            try:
                tree = ElementTree.parse(entries)
                for entry in tree.findall("{svn:}entry"):
                    revision = entry.get("revision")
                    url = entry.get("url")
                    if revision != None and url != None:
                        url = url.split("/")

                        folder = url[5]
                        if folder in ["tags", "branches"]:
                            folder = url[6]

                        return revision, folder
                        #return revision
            except Exception, e:
                pass

            # new (svn 1.4) file format
            content = filetool.read(entries)

            mtch = DIRINFO.search(content)
            if mtch:
                folder = mtch.group(2)
                if folder in ["tags", "branches"]:
                    folder = mtch.group(3)

                revision = mtch.group(1)

                return revision, folder

    return None, None



def format(revision, folder):
    return "(r%s) [%s]" % (revision, folder)



if __name__ == '__main__':
    try:
        parser = optparse.OptionParser()

        (options, args) = parser.parse_args()

        revision, folder = query(args[0])
        if revision != None:
            print format(revision, folder)


    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)
