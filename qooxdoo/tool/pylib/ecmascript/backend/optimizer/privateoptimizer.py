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
#
################################################################################

import os, sys, re, types

names = {}
used = {}


def load(data):
    global names
    names = data
    
    # Dynamically fill used data
    for name in names:
        (id, iden) = name.split(":")
        if not used.has_key(iden):
            used[iden] = [id]
        elif not id in used[iden]:
            used[iden].append(id)


def get():
    return names


def debug():
    for name in used:
        ids = used[name]
        if len(ids) > 1:
            print "Name %s used by" % name
            for id in ids:
                print "  - %s" % id
            print


def patch(tree, id):
    # Look for privates
    privates = lookup(id, tree, {})
    
    # Fast path. Return if no privates defined
    if len(privates) == 0:
        return

    # Update existing privates with translation table
    # Also respect non-definition blocks here
    update(tree, privates)
    
    
def convert(current):
    table = u"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    res = u""
    length = len(table) - 1

    if current / length > 0:
        res += convert(current / length)

    res += table[current % length]

    return res
        

def crypt(id, name):
    combined = "%s:%s" % (id, name)
    if names.has_key(combined):
        return names[combined]

    repl = "__%s" % convert(len(names))
    names[combined] = repl

    return repl
        
    
def lookup(id, node, privates):
    name = None
    
    if node.type == "definition":
        name = node.get("identifier", False)

    elif node.type == "keyvalue":
        name = node.get("key", False)
        
    elif node.type == "assignment":
        left = node.getChild("left", False)
        if left:
            var = left.getChild("variable", False)
            if var:
                last = var.getLastChild()
                if last.type == "identifier":
                    name = last.get("name")
        
    if name and name.startswith("__") and not privates.has_key(name):
        privates[name] = crypt(id, name)
        
        if not used.has_key(name):
            used[name] = [id]
        elif not id in used[name]:
            used[name].append(id)

    if node.hasChildren():
        for child in node.children:
            lookup(id, child, privates)
        
    return privates


def update(node, privates):
    if node.hasChildren():
        for child in node.children:
            update(child, privates)
            
    name = None
            
    if node.type == "definition":
        name = node.get("identifier", False)

    elif node.type == "identifier":
        name = node.get("name", False)
        
    elif node.type == "keyvalue":
        name = node.get("key", False)    
    
    elif node.type == "constant" and node.get("constantType") == "string":
        name = node.get("value", False)
    
        # Try it a bit more compex
        # Look whether the found string contains any of the
        if not privates.has_key(name):
            for key in privates:
                if key in name and re.compile(r"\b%s\b" % key).search(name):
                    name = re.sub(r"(\b%s\b)" % key, privates[key], name)
                    node.set("value", name)            
                        
    else:
        return
        
    if not name or not name.startswith("__"):
        return
        
    if not privates.has_key(name):
        return
        
    repl = privates[name]

    if node.type == "definition":
        name = node.set("identifier", repl)

    elif node.type == "identifier":
        name = node.set("name", repl)
        
    elif node.type == "keyvalue":
        name = node.set("key", repl)    
    
    elif node.type == "constant":
        name = node.set("value", repl)    
