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

'''provide extra path functions beyond os.path'''

import os, sys, re, types

def getCommonSuffix(p1, p2):
    return getCommonSuffixS(p1, p2)  # dispatch to real implementation


def getCommonPrefix(p1, p2):
    return getCommonPrefixS(p1, p2)  # dispatch to real implementation

# -- string-based versions ----------------------------------------------------

def _getCommonPrefixS(p1, p2):  # String-based
    '''computes the common prefix of p1, p2, and returns the common prefix and the two
       different suffixes'''
    pre = sfx1 = sfx2 = ""

    # catch corner cases
    if (len(p1) == 0 or len(p2) == 0): return "",p1,p2
    if p1 == p2: return p1,"",""

    # treat the others
    len_p1 = len(p1)
    len_p2 = len(p2)
    # compare paths char by char
    for i in range(len_p1):
        k = i      # k will keep the last common index - i don't trust 'i' after the for loop
        if i >= len_p2:
            k -= 1 # correct to last common index (a value of -1 is fine)
            break
        elif p1[i] == p2[i]:
            continue
        else:
            k -= 1 # correct to last common index
            break
    # assert: 'k' points to last common char of the operands, -1 means no commonality

    # make sure path elements are treated atomic (no split in the middle of a dir name)
    # check whether the commonality did not end in a dir boundary
    if (k==-1): # there is no commonality
        pass
    elif (((k+1 < len_p1)  # we're not at the end of p1
         and (p1[k] != os.sep))  # the last common char was not a '/'
         and (k+1 < len_p2)): 
        # calculate backwards to the last encountered os.sep or the beginning of the string
        #print ">>> searching backward"
        j = p1.rfind(os.sep,0,k)
        if j >-1:
            k = j 
        else: # there is no os.sep in the commen prefix so use start of string
            k = j  # this complies with the suffix "[k+1:]" slice later
    # assert: 'k' points to dir boundary (os.sep or EOS)

    # assign results
    #print ">>> k+1: ", k+1
    pre  = p1[0:k+1]
    sfx1 = p1[k+1:]
    sfx2 = p2[k+1:]

    return pre,sfx1,sfx2


def getCommonPrefixS(p1, p2):  # String-based
    p1, p2 = map(os.path.normpath, (p1, p2))
    p = [p1, p2]
    # undo normpath abnormalities
    if p1=='.':
        p1=''
    if p2=='.':
        p2=''
    pre,sfx1,sfx2 = _getCommonPrefixS(p1, p2)

    # fix surrounding os.sep's
    # the intention here is to clear unnecessary trailing separators, and 
    # artificial leading separators that stem from the splitting
    if len(pre)>1:        # only if there's a real prefix (not '' or just '/')
        if pre.endswith(os.sep): # clear trailing '/'
            pre  = pre[:-len(os.sep)]
        if len(sfx1)>1 and sfx1.startswith(os.sep): # clear leading '/'
            sfx1 = sfx1[len(os.sep):]
        if len(sfx2)>1 and sfx2.startswith(os.sep): # clear leading '/'
            sfx2 = sfx2[len(os.sep):]

    return pre,sfx1,sfx2


def getCommonSuffixS(p1, p2):  # String-based
    'use getCommonPrefixS, but with reversed arguments and return values'
    p1, p2 = map(os.path.normpath, (p1, p2))
    p = [p1, p2]
    # undo normpath abnormalities
    if p1=='.':
        p1=''
    if p2=='.':
        p2=''

    p1r = p1[::-1]  # this is string reverse in Python
    p2r = p2[::-1]
    sfx, pre1, pre2 = _getCommonPrefixS(p1r, p2r)
    sfx  = sfx[::-1]
    pre1 = pre1[::-1]
    pre2 = pre2[::-1]

    # fix surrounding os.sep's
    if (len(pre1)==0 and len(pre2)==0):  # leave ('','',sfx) alone
        pass
    elif sfx.startswith(os.sep):  # don't return a real suffix that looks like an absolute path
        sfx = sfx[len(os.sep):]   # skip the leading os.sep
        if pre1=='': pre1 += os.sep    # and push it to the prefixes
        if pre2=='': pre2 += os.sep
    if len(pre1)>1 and pre1.endswith(os.sep):
        pre1 = pre1[:-len(os.sep)]
    if len(pre2)>1 and pre2.endswith(os.sep):
        pre2 = pre2[:-len(os.sep)]

    return pre1, pre2, sfx

# -- array-based versions ----------------------------------------------------

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


def getCommonPrefixA(p1, p2):  # Array-based
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


def getCommonSuffixA(p1, p2):  # Array-based
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

# -- other helpers ------------------------------------------------------------

def posifyPath(path):
    "replace '\' with '/' in strings"
    posix_sep = '/'
    npath = path.replace(os.sep, posix_sep)
    return npath


def rel_from_to(fromdir, todir, commonroot=None):
    def part_to_ups (part):
        #"../.."
        if part == '': return "."
        a1 = part.split(os.sep)
        s  = []
        for i in a1:           
          s.append( "..")
        return os.sep.join(s)

    if not os.path.isabs(fromdir):
        fromdir = os.path.abspath(fromdir)
    if not os.path.isabs(todir):
        todir   = os.path.abspath(todir)
    pre,sfx1,sfx2 = getCommonPrefix(fromdir,todir)
    ups = part_to_ups(sfx1)

    return os.path.join(ups,sfx2)

# -- test functions -----------------------------------------------------------

def _testCP():
    'test getCommonPrefix()'
    tests = [
        (('', ''), ('','','')),
        (('a', ''), ('','a','')),
        (('/a', ''), ('','/a','')),
        (('', 'a'), ('','','a')),
        (('', '/a'), ('','','/a')),
        (('/a', 'e/f/g'), ('','/a','e/f/g')),
        (('/a/b/c', '/a/b/c/d/e'), ('/a/b/c','','d/e')),
        (('/a/b/c', '/a/b/c/d/'), ('/a/b/c','','d')),
        (('/a/b/c', '/a/b/c/d'), ('/a/b/c','','d')),
        (('/a/b/c', '/a/b/c/'), ('/a/b/c','','')),
        (('/a/b/c', '/a/b/c'), ('/a/b/c','','')),
        (('/a/b/c', '/a/b/'), ('/a/b','c','')),
        (('/a/b/c', '/a/b'), ('/a/b','c','')),
        (('/a/b/c', '/a/'), ('/a','b/c','')),
        (('/a/b/c', '/a'), ('/a','b/c','')),
        (('/a/b/c', '/'), ('/','a/b/c','')),
        (('/a/b/x.1/c', '/a/b/x.2/c'),   ('/a/b','x.1/c','x.2/c')),
        (('x.1/a/b/c', 'x.2/a/b/c/d'), ('','x.1/a/b/c','x.2/a/b/c/d')),
        (('a/b/./c', 'a/b/c/d'), ('a/b/c','','d')),
        (('a/b/c', 'a/b/c/././d'), ('a/b/c','','d')),
        (('a/b/../c', 'a/c/d'), ('a/c','','d')),
        (('a/b/c', 'a/b/c/../d'), ('a/b','c','d')),
        (('../../../a/b/c', '../../a/b/c/d'), ('../..','../a/b/c','a/b/c/d')),
        (('../../../a/b/c', '../../x/y/../z/../../../a/b/c/d'), ('../../../a/b/c','','d')),
    ]

    for t in tests:
        x = getCommonPrefix(*t[0])
        assert x == t[1], "%r != %r" % (x, t[1])


def _testCS():
    'test getCommonSuffix()'
    tests = [
        (('', ''), ('','','')),
        (('a', ''), ('a','','')),
        (('/a', ''), ('/a','','')),
        (('', 'a'), ('','a','')),
        (('', '/a'), ('','/a','')),
        (('/a', 'e/f/g'), ('/a','e/f/g','')),
        (('a/b/c','a/b/c'), ('','','a/b/c')),
        (('/a/b/c','/a/b/c'), ('','','/a/b/c')),
        (('x/y/a/b/c','/a/b/c'), ('x/y','/','a/b/c')),
        (('/y/a/b/c','/a/b/c'), ('/y','/','a/b/c')),
        (('y/a/b/c','/a/b/c'), ('y','/','a/b/c')),
        (('/a/b/c','/a/b/c'), ('','','/a/b/c')),
        (('a/b/c','/a/b/c'), ('','/','a/b/c')),
        (('/b/c','/a/b/c'), ('/','/a','b/c')),
        (('b/c','/a/b/c'), ('','/a','b/c')),
        (('/c','/a/b/c'), ('/','/a/b','c')),
        (('c','/a/b/c'), ('','/a/b','c')),
        (('','/a/b/c'), ('','/a/b/c','')),
    ]

    for t in tests:
        x = getCommonSuffix(*t[0])
        assert x == t[1], "%r != %r" % (x, t[1])

