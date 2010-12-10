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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# NAME
#  bumpqxversion.py <version-string> -- set various version strings in the
#                                       framework to <version-string>
##

import sys, os, re, string, types, codecs

qxversion_regexp = r'[\w\.-]+'

# Files to change: { "path_from_QXROOT": [<regex_to_replace>] }

Files = {
    "./version.txt" : [r'^(.*)$'],
    "./index.html"  : [r'var qxversion = "(%s)"' % qxversion_regexp],
    "./readme.txt"  : [ r'manual.qooxdoo.org/(%s)\b' % qxversion_regexp ],
    "./framework/Manifest.json" : [
        r'"version"\s*:\s*"(%s)"' % qxversion_regexp,
        r'"qooxdoo-versions"\s*:\s*\["(%s)"\]' % qxversion_regexp,
    ],
    "./documentation/manual/source/conf.py" : [
        r'^\s*version\s*=\s*[\'"](%s)[\'"]' % qxversion_regexp,
        r'^\s*release\s*=\s*[\'"](%s)[\'"]' % qxversion_regexp,
    ],
    "./application/demobrowser/source/demo/welcome.html" : [
        r'var qxversion = "(%s)"' % qxversion_regexp],
}

def patch(mo): 
    rel_start1 = mo.start(1) - mo.start(0)
    rel_end1   = mo.end(1)   - mo.start(0)
    repl = mo.group(0)[:rel_start1] + new_vers + mo.group(0)[rel_end1:]
    return repl

def main(new_vers):
    for f in Files:
        print "patching qooxdoo version in: %s" % f
        cont = codecs.open(f, 'rU', 'utf-8').read()
        for patt in Files[f]:
            cont = re.sub(patt, patch, cont)
        codecs.open(f, 'w', 'utf-8').write(cont)

if __name__ == "__main__":
    if len(sys.argv) >1 and len(sys.argv[1]) > 0:
        new_vers = sys.argv[1]
        main(new_vers)
    else:
        print "usage: %s <version-string>" % os.path.basename(sys.argv[0])
