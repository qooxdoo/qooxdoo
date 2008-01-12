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
#    * Sebastian Werner (wpbasti)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  module.py -- module short description
#
# SYNTAX
#  module.py --help
#
#  or
#
#  import module
#  result = module.func()
#
# DESCRIPTION
#  The module module does blah.
#
# CAVEATS
#
# KNOWN ISSUES
#  There are no known issues.
#</pre>
##

import tree, treeutil


##                                                                              
# Some nice short description of foo(); this can contain html and 
# {@link #foo Links} to items in the current file.
#                                                                               
# @param     a        Describe a positional parameter
# @keyparam  b        Describe a keyword parameter
# @def       foo(name)    # overwrites auto-generated function signature
# @param     name     Describe aliased parameter
# @return             Description of the things returned
# @defreturn          The return type
# @exception IOError  The error it throws
#
def search(node, verbose=False):
    return search_loop(node, {}, verbose)


def search_loop(node, stringMap={}, verbose=False):
    if node.type == "call":
        oper = node.getChild("operand", False)

        if oper:
            variable = oper.getChild("variable", False)

            if variable:
                try:
                    variableName = (treeutil.assembleVariable(variable))[0]
                except tree.NodeAccessException:
                    variableName = None

                # Don't extract from locales
                if variableName == "qx.Locale.define":
                    return stringMap

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
            stringMap[value] += 1
        else:
            stringMap[value] = 1

    if check(node, verbose):
        for child in node.children:
            search_loop(child, stringMap, verbose)

    return stringMap



def check(node, verbose=False):
    # Needs children
    if not node.hasChildren():
        return False

    # Try to find all output statements
    if node.type == "call":
        cu = node
        nx = cu.getChild("operand", False)

        if nx != None:
            cu = nx

        all = cu.getAllChildrenOfType("identifier")

        for ch in all:
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
    stringList = []

    for value in stringMap:
        stringList.append({ "value" : value, "number" : stringMap[value] })

    stringList.sort(lambda x, y: y["number"]-x["number"])

    return stringList




def replace(node, stringList, var="$", verbose=False):
    if node.type == "constant" and node.get("constantType") == "string":
        if node.get("detail") == "singlequotes":
            quote = "'"
        elif node.get("detail") == "doublequotes":
            quote = '"'

        oldvalue = "%s%s%s" % (quote, node.get("value"), quote)

        pos = 0
        for item in stringList:
            if item["value"] == oldvalue:
                newvalue = "%s[%s]" % (var, pos)

                if verbose:
                    poldvalue = oldvalue
                    if isinstance(poldvalue, unicode):
                        poldvalue = poldvalue.encode("utf-8")
                    print "    - Replace: %s => %s" % (poldvalue, newvalue)

                line = node.get("line")


                # GENERATE IDENTIFIER

                newidentifier = tree.Node("identifier")
                newidentifier.set("line", line)

                childidentifier = tree.Node("identifier")
                childidentifier.set("line", line)
                childidentifier.set("name", var)

                newidentifier.addChild(childidentifier)



                # GENERATE KEY

                newkey = tree.Node("key")
                newkey.set("line", line)

                newconstant = tree.Node("constant")
                newconstant.set("line", line)
                newconstant.set("constantType", "number")
                newconstant.set("value", "%s" % pos)

                newkey.addChild(newconstant)



                # COMBINE CHILDREN

                newnode = tree.Node("accessor")
                newnode.set("line", line)
                newnode.set("optimized", True)
                newnode.set("original", oldvalue)
                newnode.addChild(newidentifier)
                newnode.addChild(newkey)


                # REPLACE NODE

                node.parent.replaceChild(node, newnode)
                break

            pos += 1

    if check(node, verbose):
        for child in node.children:
            replace(child, stringList, var, verbose)



def replacement(stringList, var="$"):
    if len(stringList) == 0:
        return ""

    repl = "%s=[" % var

    for item in stringList:
        repl += "%s," % (item["value"])

    repl = repl[:-1] + "];"

    return repl
