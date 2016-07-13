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
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# Miscellaneous Helper Functions
##

import time, datetime, math, types, functools
from warnings import warn

##
# create a suitable date and time string of now
def nowString():
    # we want something like '2007-10-18 14:00+0100'
    mytz="%+4.4d" % (time.timezone / -(60*60) * 100) # time.timezone counts westwards!
    dt  = datetime.datetime.now()
    dts = dt.strftime('%Y-%m-%d %H:%M')  # %Z (timezone) would be empty
    nowstring="%s%s" % (dts,mytz)
    return nowstring

ctable  = u"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
clength = len(ctable) - 1

##
# convert a non-negative integer into a short string
def convert(index):
    res = u""
    if index / clength > 0:
        res += convert(index / clength)
    res += ctable[index % clength]
    return res

def toString(data):
    if data == None:
        return ""

    sortedList = _getSortedCopy(data)

    sortedString = []
    for entry in sortedList:
        sortedString.append("%s_%s" % (entry["id"], entry["value"]))

    return "|".join(sortedString)


def computeCombinations(variants):
    # convert dict to list
    variantPossibilities = []
    for variantId in variants:
        innerList = []
        for variantValue in variants[variantId]:
            innerList.append({"id" : variantId, "value" : variantValue})
        variantPossibilities.append(innerList)

    combinations = _findCombinations(variantPossibilities)
    result = []

    # convert to dict[]
    for pos, entry in enumerate(combinations):
        result.append({})
        for item in entry:
            result[pos][item["id"]] = item["value"]

    return result


def _findCombinations(a):
    result = [[]]

    for x in a:
        t = []
        for y in x:
            for i in result:
                t.append(i+[y])
        result = t

    return result


def _getSortedCopy(entries):
    # Convert dict to array
    result = []
    for key in entries:
        result.append({ "id" : key, "value" : entries[key] })

    def _compare(x, y):
        if x["id"] > y["id"]:
            return 1

        if x["id"] < y["id"]:
            return -1

        return 0

    result.sort(_compare)

    return result


##
# count bits in an int - long seems to work fine too

def countBitsOn(x):
    b   = 0
    bit = 1
    while bit <= x:
        b += int(x & bit > 0)
        bit = bit << 1

    return b

##
# detect powers of 2

def is2pow(i):
    #l = math.log(i, 2)  # inaccurate for e.g. log(2**31,2) = 31.00000004
    #return int(l) == l
    return countBitsOn(i) == 1

##
# convert a dict of ints into a list

def dictToList(d):
    keys = sorted(d.keys())
    if keys != range(max(keys)+1):  # make sure it's a contiguous, 0-based list
        warn("dict keys: %r" % keys)
    return [d[x] for x in keys]

##
# get the OS name and version
def getPlatformInfo():
    import platform
    osPlatform = platform.system()
    osVersion = "Unknown version"

    winVer = platform.win32_ver()
    macVer = platform.mac_ver()
    try:
        linVer = platform.linux_distribution()
    except AttributeError:
        linVer = platform.dist()

    if winVer[0] != "":
        osVersion = "%s %s %s" % (winVer[0], winVer[1], winVer[2])

    if macVer[0] != "":
        osVersion = "%s %s" % (macVer[0], macVer[2])

    if linVer[0] != "":
        osVersion = "%s %s" % (linVer[0], linVer[1])

    return (osPlatform,osVersion)


##
# generates a sequence of consecutive powers of 2: 1, 2, 4, 8, ...
def powersOfTwoSequence(c=0):
    while True:
        bitmask = 1L<<c
        yield bitmask
        c += 1


##
# generates a sequence of natural numbers: 0, 1, 2, 3, ...
def numberSequence(c=0):
    while True:
        yield c
        c += 1


FinSequenceTypes = (types.ListType, types.TupleType)

##
# JS-like parseInt(), a wrapper of Python's int().
def parseInt(s=''):
    v = None
    if len(s)>1:
        if s[0]=='0':
            # 0xfa23cd
            if s[1] in "xX":
                v = int(s, 16) # if it starts with '0x' and isn't a hex let it bomb
            # 0132
            else:
                try:
                    v = int(s, 8)
                except ValueError:
                    pass       # re-try as int10
    # 4711
    if v is None:
        v = int(s) # let exceptions propagate
    return v

##
# Pipeline - compose functions where the return value of one is the argument
# to the next, starting with the <seed> data.
# Ex.:
# pipeline(
#   [1,2,3,4]
#   , even
#   , reverse
# )  => [4,2]
def pipeline(seed, *funcs):
    return reduce(lambda accu,func: func(accu), funcs, seed)

##
# Bind - alias for 'partial'
bind = functools.partial

##
# Curry2 - curry second to first argument
#
# Curry is like the inverse to bind/partial, in that it binds arguments from right
# to left (where bind/partial binds from left to right). As Python functions can
# have variable number of arguments, one solution is to use curry functions that
# deal with a fixed number of arguments.
# (In contrast to e.g. Fogus,96, providing the final argument doesn't call the
# original function, but returns a fully bound closure ("thunk").)
def curry2(fun, arg2):
    def curry1_f(arg1):
        return fun(arg1, arg2)
    return curry1_f

##
# Curry3 - curry third to first argument
def curry3(fun, arg3):
    def curry2_f(arg2):
        def curry1_f(arg1):
          return fun(arg1, arg2, arg3)
        return curry1_f
    return curry2_f

##
# Inverse - return a function that inverses the <predicate>
# ('complement' in FunJS)
def inverse(pred):
    return lambda x: not(pred(x))
