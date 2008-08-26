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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# doc__init__.py  - runs over a directory tree and adds missing
#                   package doc files ("__init__.py"), using the
#                   relative path as a package name
#
# usage: cd framework/source/class; doc__init__.py qx
##

import os, sys, re, string, types

initFName = "__init__.js"
template = ""
templString = '''\
/**
 * ${PACKAGE} package
 *
 */
'''


def createInitFile(pkg_name, path):
    # write result
    f = open(path,'w')
    f.write(template.substitute({
        "PACKAGE" : pkg_name,
        }))
    f.close()
    print "  writing: " + path

def main():
    global template
    rootDir   = sys.argv[1]
    #templFile = sys.argv[2] 
    template = string.Template(templString)
    # run through class tree
    # check for __init__.js
    # if not there, create one
    diriter = os.walk(rootDir)
    for path, directories, files in diriter:
        if '.svn' in directories:
            del directories[directories.index('.svn')]
        if '__init__.js' in files:
            continue
        else:
            pkg_name = path.replace(os.sep, ".")
            createInitFile(pkg_name, os.path.join(path, initFName))

if __name__ == "__main__":
    main()



