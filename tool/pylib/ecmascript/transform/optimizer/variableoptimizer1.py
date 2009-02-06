#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#    * Sebastian Werner (wpbasti)
#
################################################################################

import sys, os, re, types

from ecmascript.frontend.Script import Script
from ecmascript.frontend import lang

counter = 0

# Create a blacklist of words to leave untouched
reservedWords = set(())
reservedWords.update(lang.GLOBALS)
reservedWords.update(lang.RESERVED.keys())


def convert(current):
    table = u"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    res = u""
    length = len(table) - 1

    if current / length > 0:
        res += convert(current / length)

    res += table[current % length]

    return res


def mapper(name, checkset):
    global counter
    repl = convert(counter)
    counter += 1
    while repl in checkset or repl in reservedWords:   # checkset is not updated, since we never generate the same repl twice
        repl = convert(counter)
        counter += 1
    return repl


def update(node, newname):

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
            name = node.get("name", False)

            if name != None:
                node.set("name", newname)

    # Handle variable definition
    elif node.type == "definition":
        name = node.get("identifier", False)

        if name != None:
            node.set("identifier", newname)

    # Handle function definition
    elif node.type == "function":
        name = node.get("name", False)

        if name != None:
            node.set("name", newname)


# -- Interface function --------------------------------------------------------

def search(node):

    # Collect the set of all used variables
    script = Script(node)
    varset = set([])

    def isReservedWord(word):
        return word in reservedWords

    for scope in script.iterScopes():
        varset.update((x.name for x in scope.variables))

    # loop through declared vars of scopes
    for scope in script.iterScopes():
        for var in scope.variables:

            if isReservedWord(var.name) or len(var.name)<2:
                continue

            print "-- replacing: ", var.name
            # Define mappings for local var
            newname = mapper(var.name, varset)

            # Replace variable definition
            update(var.node, newname)

            # Replace variable references
            for varUse in var.uses:  # varUse is a VariableUse object
                update(varUse.node, newname)


