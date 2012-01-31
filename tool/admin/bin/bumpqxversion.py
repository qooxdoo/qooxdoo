#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
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
#  - add new files in the 'Files' map
##

import sys, os, re, string, types, codecs, functools

# - Config section -------------------------------------------------------------

qxversion_regexp = r'[\w\.-]+'  # rough regexp, to capture a qooxdoo version like '1.4' or '1.4-pre'
vMajor_regexp = r'\d+'
vMinor_regexp = r'[\w-]+'
vPatch_regexp = r'[\w-]*'
vers_parts_regexp = r'(%s)\.(%s)\.?(%s)' % (vMajor_regexp, vMinor_regexp, vPatch_regexp)  # to split up <version-string> into major - minor - patch part

# Files to change: { "path_from_QXROOT": [<regex_to_replace>, ...] }
# <regex_to_replace> -- provide a regexp that captures some occurrences of the
#                       version string in that particular file, with a bit of
#                       context, and put parens around the place where the
#                       version string itself is; this will be replaced.
# ! If you add files here, also update http://qooxdoo.org/documentation/general/how_to_build_a_release
Files = {
    "./version.txt" : [
        r'^(.*)$'
        ],
    "./index.html"  : [
        r'var qxversion = "(%s)"'    % qxversion_regexp
        ],
    "./readme.rst"  : [ 
        r'manual.qooxdoo.org/(%s)\b' % qxversion_regexp 
        ],
    "./framework/Manifest.json" : [
        r'"version"\s*:\s*"(%s)"'              % qxversion_regexp,
        r'"qooxdoo-versions"\s*:\s*\["(%s)"\]' % qxversion_regexp,
        ],
    "./documentation/manual/source/conf.py" : [
        r'^\s*version\s*=\s*[\'"](%s)[\'"]' % qxversion_regexp,
        r'^\s*release\s*=\s*[\'"](%s)[\'"]' % qxversion_regexp,
        (r'^\s*vMajor\s*=\s*[\'"](%s)[\'"]' % vMajor_regexp, 0),  # number will be used as an index into vers_parts
        (r'^\s*vMinor\s*=\s*[\'"](%s)[\'"]' % vMinor_regexp, 1),
        (r'^\s*vPatch\s*=\s*[\'"](%s)[\'"]' % vPatch_regexp, 2),
        ],
    "./application/demobrowser/source/demo/welcome.html" : [
        r'var qxversion = "(%s)"'    % qxversion_regexp,
        ],
    "./tool/admin/release/release-matrix-utils.js"  : [
        r'var qxversion = "(%s)"'    % qxversion_regexp
        ],
}

# - End config -----------------------------------------------------------------

def patch(repl, mo): 
    rel_start1 = mo.start(1) - mo.start(0)
    rel_end1   = mo.end(1)   - mo.start(0)
    repl = mo.group(0)[:rel_start1] + repl + mo.group(0)[rel_end1:]
    return repl

def main(new_vers):
    mo = re.match(vers_parts_regexp, new_vers)
    assert mo, "%s doesn't look like a proper version string" % new_vers
    vers_parts = mo.groups()  # e.g. ('2', '0', '4-pre') or ('1', '7', '')
    for f in Files:
        print "patching qooxdoo version in: %s" % f
        cont = codecs.open(f, 'rU', 'utf-8').read()
        for entry in Files[f]:
            if isinstance(entry, types.TupleType):
                (patt, repl) = entry[0], vers_parts[entry[1]]  # use only part of the version string
            else:
                (patt, repl) = entry, new_vers
            fn = functools.partial(patch, repl) # bind replacement string
            cont, cnt = re.subn(re.compile(patt, re.M), fn, cont) # compiling patt allows to add re.M
        codecs.open(f, 'w', 'utf-8').write(cont)

if __name__ == "__main__":
    if len(sys.argv) >1 and len(sys.argv[1]) > 0:
        new_vers = sys.argv[1]
        main(new_vers)
    else:
        print "usage: %s <version-string>" % os.path.basename(sys.argv[0])
