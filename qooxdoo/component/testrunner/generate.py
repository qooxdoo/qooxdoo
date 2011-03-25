#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 - 2009 1&1 Internet AG, Germany, http://www.1und1.de
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
# This is a stub proxy for the real generator.py
##

import sys, os, re, subprocess

CMD_PYTHON = 'python'
QOOXDOO_PATH = '../..'

def getQxPath():
    path = QOOXDOO_PATH
    # try updating from config file
    if os.path.exists('config.json'):
        # "using QOOXDOO_PATH from config.json"
        qpathr=re.compile(r'"QOOXDOO_PATH"\s*:\s*"([^"]*)"\s*,?')
        conffile = open('config.json')
        aconffile = conffile.readlines()
        for line in aconffile:
            mo = qpathr.search(line)
            if mo:
                path = mo.group(1)
                break # assume first occurrence is ok
    path = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), path))

    return path

os.chdir(os.path.dirname(os.path.abspath(sys.argv[0])))  # switch to skeleton dir
qxpath = getQxPath()
REAL_GENERATOR = os.path.join(qxpath, 'tool', 'bin', 'generator.py')

if not os.path.exists(REAL_GENERATOR):
    print "Cannot find real generator script under: \"%s\"; aborting" % REAL_GENERATOR
    sys.exit(1)

argList = []
argList.append(CMD_PYTHON)
argList.append(REAL_GENERATOR)
argList.extend(sys.argv[1:])
if sys.platform == "win32":
    argList1=[]
    for arg in argList:
        if arg.find(' ')>-1:
            argList1.append('"%s"' % arg)
        else:
            argList1.append(arg)
    argList = argList1
else:
    argList = ['"%s"' % x for x in argList]  # quote argv elements
    
cmd = " ".join(argList)
retval = subprocess.call(cmd, shell=True)
sys.exit(retval)
