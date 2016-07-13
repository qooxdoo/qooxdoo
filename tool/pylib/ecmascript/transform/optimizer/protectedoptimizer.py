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
#    * Sebastian Werner (wpbasti)
#
################################################################################

import re
from misc.util import convert

names = {}

def load(data):
    global names
    names = data


def get():
    return names


def patch(tree, id):
    # Update existing protected with translation table
    # Also respect non-definition blocks here
    update(tree, names)
    
    
def process(classes, loader):
    for id in classes:
        node = loader.getTree(id)
        lookup(id, node, names)
    
    
def crypt(name):
    if name in names:
        return names[name]

    repl = "_%s" % convert(len(names))
    names[name] = repl

    return repl
        
    
def lookup(id, node, protected):
    name = None
    
    if node.type == "definition":
        name = node.get("identifier", False)

    elif node.type == "identifier":
        name = node.get("name", False)
        
    elif node.type == "keyvalue":
        name = node.get("key", False)
        
    if name and name.startswith("_") and not name.startswith("__") and not name in protected:
        protected[name] = crypt(name)
        
    if node.hasChildren():
        for child in node.children:
            lookup(id, child, protected)
        
    return protected


def update(node, protected):
    if node.hasChildren():
        for child in node.children:
            update(child, protected)
            
    name = None
    valid = False
            
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
        if not name in protected:
            for key in protected:
                if key in name and re.compile(r"\b%s\b" % key).search(name):
                    name = re.sub(r"(\b%s\b)" % key, protected[key], name)
                    node.set("value", name)            

    else:
        return

    if not name or not name.startswith("_") or name.startswith("__"):
        return
    
    if not name in protected:
        return
        
    repl = protected[name]

    if node.type == "definition":
        name = node.set("identifier", repl)

    elif node.type == "identifier":
        name = node.set("name", repl)
        
    elif node.type == "keyvalue":
        name = node.set("key", repl)    
    
    elif node.type == "constant":
        name = node.set("value", repl)    
