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

import os, sys, re, types

class Path (object):
    '''provide extra path functions beyond os.path'''
    def _getCommonSuffix(p1, p2):
        '''computes the common suffix of path1, path2, and returns the two different prefixes
           and the common suffix'''
        pre1 = pre2 = suffx = ""
        if (len(p1) == 0 or len(p2) == 0): return p1,p2,""
        for i in range(1,len(p1)):
            if i > len(p2):
                break
            elif p1[-i] == p2[-i]:
                suffx = p1[-i] + suffx
            else:
                break
        pre1 = p1[:-i+1]
        pre2 = p2[:-i+1]

        return pre1, pre2, suffx

    getCommonSuffix = staticmethod(_getCommonSuffix)


    def _getCommonPrefix(p1, p2):
        '''computes the common prefix of p1, p2, and returns the common prefix and the two
           different suffixes'''
        pre = sfx1 = sfx2 = ""
        if (len(p1) == 0 or len(p2) == 0): return "",p1,p2
        for i in range(len(p1)):
            if i > len(p2):
                break
            elif p1[i] == p2[i]:
                pre += p1[i]
            else:
                i -= 1  # correct i, since the loop ends differently with range() or !=
                break
        sfx1 = p1[i+1:]
        sfx2 = p2[i+1:]

        return pre,sfx1,sfx2

    getCommonPrefix = staticmethod(_getCommonPrefix)

    def _posifyPath(path):
        "replace '\' with '/' in strings"
        posix_sep = '/'
        npath = path.replace(os.sep, posix_sep)
        return npath

    posifyPath = staticmethod(_posifyPath)
