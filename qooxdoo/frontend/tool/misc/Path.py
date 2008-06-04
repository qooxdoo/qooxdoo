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

'''provide extra path functions beyond os.path'''
def getCommonSuffix1(p1, p2):
    '''computes the common suffix of path1, path2, and returns the two different prefixes
       and the common suffix'''
    pre1 = pre2 = suffx = ""
    if (len(p1) == 0 or len(p2) == 0): return p1,p2,""
    for i in range(1,len(p1)):
        if i >= len(p2):
            break
        elif p1[-i] == p2[-i]:
            suffx = p1[-i] + suffx
        else:
            break
    pre1 = p1[:-i+1]
    pre2 = p2[:-i+1]

    return pre1, pre2, suffx


def getCommonPrefix1(p1, p2):
    '''computes the common prefix of p1, p2, and returns the common prefix and the two
       different suffixes'''
    pre = sfx1 = sfx2 = ""
    if (len(p1) == 0 or len(p2) == 0): return "",p1,p2
    for i in range(len(p1)):
        if i >= len(p2):
            break
        elif p1[i] == p2[i]:
            pre += p1[i]
        else:
            i -= 1  # correct i, since the loop ends differently with range() or !=
            break
    sfx1 = p1[i+1:]
    sfx2 = p2[i+1:]

    return pre,sfx1,sfx2


def _getCommonPrefixA1(pa1, pa2):
    '''comparing lists of strings'''
    prea = sfx1a = sfx2a = []
    if (len(pa1) == 0 or len(pa2) == 0): return [],pa1,pa2
    for i in range(len(pa1)):
        if i >= len(pa2):
            break
        elif pa1[i] == pa2[i]:
            prea.append(pa1[i])
        else:
            break
    else:
        i += 1  # correct i, since the loop ends differently with range() or break
    sfx1a = pa1[i:]
    sfx2a = pa2[i:]

    return prea, sfx1a, sfx2a


def _getCommonPrefixA(pa1, pa2):
    '''comparing lists of strings, returning common head list and separate tail lists'''
    def getCommonPrefixRec(pre, sfx1, sfx2):
        if sfx1 == [] or sfx2 == []:
            return pre, sfx1, sfx2
        if sfx1[0] == sfx2[0]:
            pre.append(sfx1[0])
            return getCommonPrefixRec(pre, sfx1[1:], sfx2[1:])
        else:
            return pre, sfx1, sfx2

    return getCommonPrefixRec([], pa1, pa2)


def getCommonPrefix(p1, p2):
    '''treat directory names atomic, so that "a/b.1/c" and "a/b.2/d" will have
       ("a", "b.1/c", "b.2/d") and not ("a/b.", "1/c", "2/d")'''
    
    if (len(p1) == 0 or len(p2) == 0): return "",p1,p2
    pa1 = p1.split(os.sep)
    pa2 = p2.split(os.sep)
    prea, sfx1a, sfx2a = _getCommonPrefixA(pa1, pa2)

    # the lambda is necessary to coerce a single array argument into a varargs list for join()
    # (through *x), and to catch the empty list corner case, since join chokes on empty
    # argument lists
    return map(lambda x: ((len(x)>0 and os.path.join(*x)) or ""), (prea, sfx1a, sfx2a))


def getCommonSuffix(p1, p2):
    '''uses _getCommonPrefixA as well by reversing arguments and return values; such a pitty that
       there is no functional equivalent to array.reverse(), which is destructive :-('''
    
    if (len(p1) == 0 or len(p2) == 0): return p1,p2,""
    pa1 = p1.split(os.sep)
    pa1.reverse()
    pa2 = p2.split(os.sep)
    pa2.reverse()
    sfxa, pre1a, pre2a = _getCommonPrefixA(pa1, pa2)
    pre1a.reverse()
    pre2a.reverse()
    sfxa.reverse()

    return map(lambda x: ((len(x)>0 and os.path.join(*x)) or ""), (pre1a, pre2a, sfxa))


def posifyPath(path):
    "replace '\' with '/' in strings"
    posix_sep = '/'
    npath = path.replace(os.sep, posix_sep)
    return npath


def rel_from_to(fromdir, todir, commonroot=None):
    def part_to_ups (part):
        #"../.."
        a1 = part.split(os.sep)
        s  = []
        for i in a1:           
          s.append( "..")
        return os.sep.join(s) or ""

    if not os.path.isabs(fromdir):
        fromdir = os.path.abspath(fromdir)
    if not os.path.isabs(todir):
        todir   = os.path.abspath(todir)
    pre,sfx1,sfx2 = getCommonPrefix(fromdir,todir)
    ups = part_to_ups(sfx1)

    return os.path.join(ups,sfx2)



