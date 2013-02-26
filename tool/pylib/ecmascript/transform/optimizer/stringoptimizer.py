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
#    *Thomas Herchenroeder (thron7)
#
################################################################################

import operator
from misc.NameMapper import NameMapper
from ecmascript.frontend import treeutil, lang
from ecmascript.transform.check import scopes

def search(node, verbose=False):
    return search_loop(node, {}, verbose)

##
# Returns {"code_string" : ["", [constant_node,...]]}, {}[0] being a placeholder for the var_name
def search_loop(node, stringMap={}, verbose=False):
    if node.type == "constant" and node.get("constantType") == "string":
        code_string = node.toJS(None)
        if code_string in stringMap:
            stringMap[code_string][1].append(node)
        else:
            stringMap[code_string] = ['',[node]]
        if verbose:
            print "      - Found: '%s'" % code_string.encode("utf-8")

    #if check(node, verbose):
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

        if nx.isVar():

            if nx != None:
                cu = nx

            all_ = cu.getAllChildrenOfType("identifier")

            for ch in all_:
                if ch.get("value", '') in ["debug", "info", "warn", "error", "fatal", "Error", "alert"]:
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

                if last.type == "identifier" and last.get("value").isupper():
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


def replace(node, stringMap, check_set=set(), verbose=False):
    mapper = NameMapper(check_set)
    for cstring,value in stringMap.items():
        var_name = mapper.mapper(cstring)
        value[0] = var_name  # memoize var_name in stringMap
        for node in value[1]:
            repl_ident = treeutil.compileString(var_name)
            repl_ident.set("line", node.get("line"))
            repl_ident.set("column", node.get("column"))
            node.parent.replaceChild(node, repl_ident)


def replacement(stringMap):
    repl = ['var ']
    a = []
    for cstring, (repl_name,_) in stringMap.items():
        a.append('%s=%s' % (repl_name,cstring))
    repl += [','.join(a)]
    repl += [';']
    return u''.join(repl)

##
# Interface function.
#
def process(tree, id_):
    # refresh scopes to get a check-set
    tree = scopes.create_scopes(tree)
    check_set = tree.scope.all_var_names()
    check_set.update(lang.RESERVED.keys())

    # assuming a <file> or <block> node
    statementsNode = tree.getChild("statements")

    # create a map for strings to var names
    stringMap = search(statementsNode, verbose=False)
    if len(stringMap) == 0:
        return tree

    # apply the vars
    #stringList = sort(stringMap)
    replace(statementsNode, stringMap, check_set)

    # create a 'var' decl for the string vars
    stringReplacement = replacement(stringMap)
    repl_tree = treeutil.compileString(stringReplacement, id_ + "||stringopt")

    # ensure a wrapping closure
    closure, closure_block = treeutil.ensureClosureWrapper(statementsNode.children)
    statementsNode.removeAllChildren()
    statementsNode.addChild(closure)

    # add 'var' decl to closure
    closure_block.addChild(repl_tree, 0)  # 'var ...'; decl to front of statement list

    return tree


