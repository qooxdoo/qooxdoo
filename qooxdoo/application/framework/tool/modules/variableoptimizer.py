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
#    * Alessandro Sala (asala)
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

import tree, mapper

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
def skip(name, prefix):
    return len(prefix) > 0 and name[:len(prefix)] == prefix

def search(node, found, counter, level=0, prefix="$", skipPrefix="", register=False, verbose=False):
    if node.type == "function":
        if register:
            name = node.get("name", False)
            if name != None and not name in found:
                # print "Name: %s" % name
                found.append(name)

        foundLen = len(found)
        register = True

        if verbose:
            print "\n%s<scope line='%s'>" % (("  " * level), node.get("line"))

    # e.g. func(name1, name2);
    elif register and node.type == "variable" and node.hasChildren() and len(node.children) == 1:
        if node.parent.type == "params" and node.parent.parent.type != "call":
            first = node.getFirstChild()

            if first.type == "identifier":
                name = first.get("name")

                if not name in found:
                    # print "Name: %s" % name
                    found.append(name)

    # e.g. var name1, name2 = "foo";
    elif register and node.type == "definition":
        name = node.get("identifier", False)

        if name != None:
            if not name in found:
                # print "Name: %s" % name
                found.append(name)

    # Iterate over children
    if node.hasChildren():
        if node.type == "function":
            for child in node.children:
                counter += search(child, found, 0, level+1, prefix, skipPrefix, register, verbose)

        else:
            for child in node.children:
                counter += search(child, found, 0, level, prefix, skipPrefix, register, verbose)

    # Function closed
    if node.type == "function":

        # Debug
        if verbose:
            for item in found:
                print "  %s<item>%s</item>" % (("  " * level), item)
            print "%s</scope>" % ("  " * level)

        # Iterate over content
        # Replace variables in current scope
        # (only used from top-level functions, to avoid variable capture)
        if level==0:
            counter += update(node, found, 0, prefix, skipPrefix, verbose)
            # this breaks the index in cases where variables are defined after
            # the declaration of an inner function and used in this function.
            # (really?)
            del found[foundLen:]

    return counter


def update(node, found, counter, prefix="$", skipPrefix="", verbose=False):
    # Handle all identifiers
    if node.type == "identifier":
        isFirstChild = False
        isVariableMember = False

        if node.parent.type == "variable":
            isVariableMember = True
            varParent = node.parent.parent

            # catch corner case: a().b(); var b;
            if varParent.type == "operand" and varParent.parent.type == "call" and varParent.parent.parent.type == "right" and varParent.parent.parent.parent.type == "accessor":
                varParent = varParent.parent.parent

            if not (varParent.type == "right" and varParent.parent.type == "accessor"):
                isFirstChild = node.parent.getFirstChild(True, True) == node

        # used in foo.bar.some[thing] where "some" is the identifier
        elif node.parent.type == "accessor":
            isVariableMember = True
            accessor = node.parent
            isFirstChild = accessor.parent.getFirstChild(True, True) == accessor

        # inside a variable parent only respect the first member
        if not isVariableMember or isFirstChild:
            idenName = node.get("name", False)

            if idenName != None and idenName in found and not skip(idenName, skipPrefix):
                replName = "%s%s" % (prefix, mapper.convert(found.index(idenName)))
                node.set("name", replName)
                counter += 1

                if verbose:
                    print "  - Replaced '%s' with '%s'" % (idenName, replName)

    # Handle variable definition
    elif node.type == "definition":
        idenName = node.get("identifier", False)

        if idenName != None and idenName in found and not skip(idenName, skipPrefix):
            replName = "%s%s" % (prefix, mapper.convert(found.index(idenName)))
            node.set("identifier", replName)
            counter += 1

            if verbose:
                print "  - Replaced '%s' with '%s'" % (idenName, replName)

    # Handle function definition
    elif node.type == "function":
        idenName = node.get("name", False)

        if idenName != None and idenName in found and not skip(idenName, skipPrefix):
            replName = "%s%s" % (prefix, mapper.convert(found.index(idenName)))
            node.set("name", replName)
            counter += 1

            if verbose:
                print "  - Replaced '%s' with '%s'" % (idenName, replName)

    # Iterate over children
    if node.hasChildren():
        for child in node.children:
            counter += update(child, found, 0, prefix, skipPrefix, verbose)

    return counter
