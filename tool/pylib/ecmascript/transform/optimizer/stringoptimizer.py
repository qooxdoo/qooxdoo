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
#    * Sebastian Werner (wpbasti)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import operator
from ecmascript.frontend import treeutil

def search(node, verbose=False):
    return search_loop(node, {}, verbose)


def search_loop(node, stringMap={}, verbose=False):
    #if stringMap is None:
    #    stringMap = {}
    if node.type == "constant" and node.get("constantType") == "string":
        if verbose:
            pvalue = node.get("value")
            if isinstance(pvalue, unicode):
                pvalue = pvalue.encode("utf-8")
            print "      - Found: '%s'" % pvalue

        if node.get("detail") == "singlequotes":
            quote = "'"
        elif node.get("detail") == "doublequotes":
            quote = '"'
        value = "%s%s%s" % (quote, node.get("value"), quote)

        if value in stringMap:
            stringMap[value] += 1  # occurrence count?!
        else:
            stringMap[value] = 1

    if check(node, verbose):
        for child in node.children:
            search_loop(child, stringMap, verbose)

    return stringMap



##
# This function declines string optimization for the following contexts:
# - arguments of output built-ins (debug, info, alert, ...)
# - when the last part of an identifier is all-uppercase ("foo.BAR")
# - all-uppercase keys in maps ({FOO:'bar'})
#
# I don't see a striking reason to *not* string-optimize those too,
# so the whole thing might be obsolete.
#
def check(node, verbose=True):
    # Needs children
    if not node.hasChildren():
        return False

    # Try to find all output statements
    if node.type == "call":
        cu = node
        nx = cu.getChild("operand", False)

        if nx != None:
            cu = nx

        all_ = cu.getAllChildrenOfType("identifier")

        for ch in all_:
            if ch.get("name", False) in ["debug", "info", "warn", "error", "fatal", "Error", "alert"]:
                if verbose:
                    print "      - Ignore output statement at line: %s" % ch.get("line")
                return False

    # Try to find all constant assignments (ns.UPPER = string)
    elif node.type == "assignment":
        left = node.getChild("left", False)
        if left != None:
            var = left.getChild("variable", False)

            if var != None:
                last = var.getLastChild()

                if last.type == "identifier" and last.get("name").isupper():
                    if verbose:
                        print "      - Ignore constant assignment at line: %s" % last.get("line")
                    return False

    # Try to find all constant assignments from Maps ({ UPPER : string })
    elif node.type == "keyvalue":
        if node.get("key").isupper():
            if verbose:
                print "      - Ignore constant key value at line: %s" % node.get("line")
            return False

    return True


def sort(stringMap):
    stringList = [{"value":x, "number":y} for x,y in stringMap.items()]
    return sorted(stringList, key=operator.itemgetter("number"))


def replace(node, stringList, var="$", verbose=False):
    if node.type == "constant" and node.get("constantType") == "string":
        if node.get("detail") == "singlequotes":
            quote = "'"
        elif node.get("detail") == "doublequotes":
            quote = '"'
        oldvalue = "%s%s%s" % (quote, node.get("value"), quote)

        for pos,item in enumerate(stringList):
            if item["value"] == oldvalue:
                newvalue = "%s[%s]" % (var, pos)  # this is only for output, and is bogus

                if verbose:
                    poldvalue = oldvalue
                    if isinstance(poldvalue, unicode):
                        poldvalue = poldvalue.encode("utf-8")
                    print "    - Replace: %s => %s" % (poldvalue, newvalue)

                line = node.get("line")


                # generate identifier
                replacement_ident = treeutil.compileString("SSSS_%s" % pos)
                replacement_ident.set("line", node.get("line"))
                replacement_ident.set("column", node.get("column"))

                # replace node
                node.parent.replaceChild(node, replacement_ident)
                break

    if check(node, verbose):
        for child in node.children:
            replace(child, stringList, var, verbose)



def replacement(stringList):
    if len(stringList) == 0:
        return ""

    repl = []
    repl += ["var "]
    a = [('SSSS_%s=%s' % (pos, item["value"])) for pos, item in enumerate(stringList)]
    repl += [','.join(a)]
    repl += [';']

    return ''.join(repl)
