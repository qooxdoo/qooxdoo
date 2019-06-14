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
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# SYNTAX
#  bumpqxversion.py <version-string> -- set various version strings in the
#                                       framework to <version-string> (or parts thereof)
#
# EXAMPLES
#  bumpqxversion.py 2.0
#  bumpqxversion.py 2.1.4-pre
#
# DESCRIPTION
#  Run through a set of files (maintained in this script) and replace occurrences of
#  version strings with the new string from the command-line.
#
# NOTE
#  Add new files to the 'Files' map (see further in the "Config section").
##

import sys, os, re, string, types, codecs, functools, subprocess as sub

qxversion_regexp = r'\d+(?:\.\d+)+(?:-\w+)?'  # rough regexp, to capture a qooxdoo version like '1.4.3' or '1.4-pre'
vMajor_regexp = r'\d+'
vMinor_regexp = r'[\w-]+'
vPatch_regexp = r'[\w-]*'
vers_parts_regexp = r'(%s)\.(%s)\.?(%s)' % (vMajor_regexp, vMinor_regexp, vPatch_regexp)  # to split up <version-string> into major - minor - patch part
git_branch_regexp = r'[\w-]+'

def gitBranch():
    # mirror line:
    # "* master            98df6b4 [ahead 3] [BUG #5706] minor comments"
    branch_list = sub.Popen(['git', 'branch', '-v'], stdout=sub.PIPE).communicate()[0]
    branch_list = branch_list.split('\n')
    curr_branch = [x for x in branch_list if x.startswith('*')][0]
    branch_name = curr_branch.split()[1]
    return branch_name

git_branch = gitBranch()

##
# npm wants always 3 elements, so supply '0' if necessary
def npm_version_string(vers_parts):
    v = "%s.%s.%s" % (vers_parts[0], vers_parts[1],
        vers_parts[2] if vers_parts[2] else '0')
    return v

# - Config section -------------------------------------------------------------

##
# Files to change:
#
# Files = {
#     "path_from_QXROOT": [
#         <regex_to_replace>,
#         (<regex_to_replace>, <version_part>),
#         ...
#         ],
#     ...
# }
#
# Each entry for a file is an arry of regexes or tuples of (regex, version_part).
# The regexes will be used to match part of the file, to identify the location of
# the old version string. If only the regex is given, the replacement will be the
# entire new version string, as passed in the command-line argument.
# If it is a tuple of (regex, number), the matched location will be replaced with
# only the corresponding *part* of the new version string (see further). This
# allows you to only replace the major, minor or patch number.
#
# <regex_to_replace> -- provide a regexp that captures some occurrences of the
#                       version string in that particular file, with a bit of
#                       context, and put parens around the place where the
#                       old version string is; this will be replaced.
# <version_part>     -- identify the replacement string as part of the new version string:
#                       0=major, 1=minor, 2=patch
#
#
Files = {
    "./package.json": [
        (r'"version"\s*:\s*"(%s)"' % qxversion_regexp, npm_version_string),
        ],
    "./Manifest.json" : [
        r'"version"\s*:\s*"(%s)"'              % qxversion_regexp,
        r'"@qooxdoo/framework"\s*:\s*"(%s)"'   % qxversion_regexp,
        ],
    "./application/demobrowser/package.json": [
        (r'"version"\s*:\s*"(%s)"' % qxversion_regexp, npm_version_string),
        ],
    "./application/demobrowser/source/demo/welcome.html" : [
        r'var qxversion = "(%s)"'    % qxversion_regexp,
        ],
    "./application/websitewidgetbrowser/package.json": [
        (r'"version"\s*:\s*"(%s)"' % qxversion_regexp, npm_version_string),
        ],
    "./component/skeleton/server/readme.txt" : [
        r'qx-oo-(%s).min.js' % qxversion_regexp,
        ],
    "./component/skeleton/website/index.html" : [
        r'q-(%s).min.js' % qxversion_regexp,
        ],
    "./component/skeleton/website/readme.txt" : [
        r'q-(%s).js' % qxversion_regexp,
        r'q-(%s).min.js' % qxversion_regexp,
        ],
    "./component/standalone/server/npm/package.json" : [
        (r'"version"\s*:\s*"(%s)"' % qxversion_regexp, npm_version_string),
        r'"main"\s*:\s*"qx-oo-(%s)"' % qxversion_regexp,
        r'"homepage"\s*:\s*"http://manual.qooxdoo.org/(%s)/pages/core.html"' % qxversion_regexp,
        ],
    "./component/standalone/website/package.json": [
        (r'"version"\s*:\s*"(%s)"' % qxversion_regexp, npm_version_string),
        ],
    "./documentation/manual/source/conf.py" : [
        r'^\s*version\s*=\s*[\'"](%s)[\'"]' % qxversion_regexp,
        r'^\s*release\s*=\s*[\'"](%s)[\'"]' % qxversion_regexp,
        (r'^\s*vMajor\s*=\s*[\'"](%s)[\'"]' % vMajor_regexp, 0),  # number will be used as an index into vers_parts
        (r'^\s*vMinor\s*=\s*[\'"](%s)[\'"]' % vMinor_regexp, 1),
        (r'^\s*vPatch\s*=\s*[\'"](%s)[\'"]' % vPatch_regexp, 2),
#        (r'^\s*git_branch\s*=\s*[\'"](%s)[\'"]' % git_branch_regexp, git_branch),
        ],
    "./documentation/tech_manual/source/conf.py" : [
        r'^\s*version\s*=\s*[\'"](%s)[\'"]' % qxversion_regexp,
        r'^\s*release\s*=\s*[\'"](%s)[\'"]' % qxversion_regexp,
        (r'^\s*vMajor\s*=\s*[\'"](%s)[\'"]' % vMajor_regexp, 0),  # number will be used as an index into vers_parts
        (r'^\s*vMinor\s*=\s*[\'"](%s)[\'"]' % vMinor_regexp, 1),
        (r'^\s*vPatch\s*=\s*[\'"](%s)[\'"]' % vPatch_regexp, 2),
#        (r'^\s*git_branch\s*=\s*[\'"](%s)[\'"]' % git_branch_regexp, git_branch),
        ],
    "./framework/Manifest.json" : [
        r'"version"\s*:\s*"(%s)"'              % qxversion_regexp,
        r'"qooxdoo-versions"\s*:\s*\["(%s)"\]' % qxversion_regexp,
        ],
    "./framework/package.json" : [
        (r'"version"\s*:\s*"(%s)"' % qxversion_regexp, npm_version_string),
        ],
    "./index.html"  : [
        r'var qxversion = "(%s)"'    % qxversion_regexp
        ],
    "./README.md"  : [
        r'manual.qooxdoo.org/(%s)\b' % qxversion_regexp,
        r'api.qooxdoo.org/(%s)\b' % qxversion_regexp,
        r'qooxdoo.org/project/release_notes/(%s)\b' % qxversion_regexp
        ],
    "./tool/admin/release/index.html" : [
        r'qx-oo-(%s).js' % qxversion_regexp,
        r'qx-oo-(%s).min.js' % qxversion_regexp,
        r'q-(%s).js' % qxversion_regexp,
        r'q-(%s).min.js' % qxversion_regexp,
        r'q-[a-z]+-(%s).js' % qxversion_regexp,
        r'q-[a-z]+-(%s).min.js' % qxversion_regexp,
        ],
    "./tool/admin/release/test_plans/utils.js"  : [
        r'var qxversion = "(%s)"'    % qxversion_regexp
        ],
    "./tool/data/generator/active_reload.js" : [
        r'qooxdoo v(%s) \|' % qxversion_regexp,
        ],
    "./tool/data/generator/copyright.include.js" : [
        r'qooxdoo v(%s) \|' % qxversion_regexp,
        ],
    "./tool/grunt/package.json" : [
        (r'"version"\s*:\s*"(%s)"' % qxversion_regexp, npm_version_string)
        ],
    "./version.txt" : [
        r'^(.+)$'
        ],
}

# - End config -----------------------------------------------------------------

def patch(repl, mo):
    rel_start1 = mo.start(1) - mo.start(0)
    rel_end1   = mo.end(1)   - mo.start(0)
    repl = mo.group(0)[:rel_start1] + repl + mo.group(0)[rel_end1:]
    return repl

def main(new_vers):
    # extract major/minor/patch parts
    mo = re.match(vers_parts_regexp, new_vers)
    assert mo, "%s doesn't look like a proper version string" % new_vers
    vers_parts = mo.groups()  # e.g. ('2', '0', '4-pre') or ('1', '7', '')

    # loop through files
    for f in Files:
        print "patching qooxdoo version in: %s" % f
        cont = codecs.open(f, 'rU', 'utf-8').read()
        for entry in Files[f]:
            if isinstance(entry, types.TupleType) and isinstance(entry[1], types.IntType):
                (patt, repl) = entry[0], vers_parts[entry[1]]  # use only part of the version string
            elif isinstance(entry, types.TupleType) and isinstance(entry[1], types.StringTypes):
                (patt, repl) = entry[0], entry[1]  # take the replacement from the config directly
            elif isinstance(entry, types.TupleType) and isinstance(entry[1], types.FunctionType):
                (patt, repl) = entry[0], entry[1](vers_parts, *entry[2:])  # call a function to return the replacement
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
