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

from ecmascript.frontend import tree
from ecmascript.frontend import lang

# TODO: Any idea to make this more random while still being compact?
def mapper(found):
    counter = 0
    translations = {}
    
    for entry in found:
        repl = convert(counter)
        counter += 1
        
        while repl in found or lang.RESERVED.has_key(repl):
            repl = convert(counter)
            counter += 1
            
        translations[entry] = repl

    return translations


def convert(current):
    table = u"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    res = u""
    length = len(table) - 1

    if current / length > 0:
        res += convert(current / length)

    res += table[current % length]

    return res


def respect(name, found):
    return (name and not name in found and not name.startswith("_"))


def search(node, found=None, register=False, level=0):
    if found == None:
        found = []
    
    if node.type == "function":
        if register:
            name = node.get("name", False)
            if respect(name, found):
                found.append(name)

        openedAt = len(found)
        register = True

    # e.g. func(name1, name2);
    elif register and node.type == "variable" and node.hasChildren() and len(node.children) == 1:
        if node.parent.type == "params" and node.parent.parent.type != "call":
            first = node.getFirstChild()

            if first.type == "identifier":
                name = first.get("name")

                if respect(name, found):
                    found.append(name)

    # e.g. var name1, name2 = "foo";
    elif register and node.type == "definition":
        name = node.get("identifier", False)

        if respect(name, found):
            found.append(name)

    # Iterate over children
    if node.hasChildren():
        if node.type == "function":
            for child in node.children:
                search(child, found, register, level+1)

        else:
            for child in node.children:
                search(child, found, register, level)

    # Function closed
    if node.type == "function":
        if level==0:
            # Generate translation list
            translations = mapper(found)
            
            # Start replacement when get back to first level
            update(node, translations)
            
            # Afterwards the function is closed and we can clean-
            # up the found variables
            del found[openedAt:]


def update(node, translations):
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
            name = node.get("name", False)

            if name != None and translations.has_key(name):
                node.set("name", translations[name])

    # Handle variable definition
    elif node.type == "definition":
        name = node.get("identifier", False)

        if name != None and translations.has_key(name):
            node.set("identifier", translations[name])

    # Handle function definition
    elif node.type == "function":
        name = node.get("name", False)

        if name != None and translations.has_key(name):
            node.set("name", translations[name])

    # Iterate over children
    if node.hasChildren():
        for child in node.children:
            update(child, translations)
