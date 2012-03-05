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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import os, sys, re, types
from misc.util import convert

#names = {}  # names = { "<classId>:<private>" : "<repl>", ...}
#used = {}   # used  = { "<private>" : [ "<classId>", ...], ...} -- only maintained for debug() function, not relevant for optimization

#privatesCacheId = "privates-%s" % self._context['config']._fname  # use path to main config file for context
privatesCacheId = "privates"  # use a site-wide privates db

#def load(data):
#    global names
#    names = data
#    
#    # Dynamically fill used data
#    for name in names:
#        (id, iden) = name.split(":")
#        if not iden in used:
#            used[iden] = [id]
#        elif not id in used[iden]:
#            used[iden].append(id)


#def get():
#    return names


def debug():
    for name in used:
        ids = used[name]
        if len(ids) > 1:
            print "Name %s used by" % name
            for id in ids:
                print "  - %s" % id
            print


def patch(tree, id, _globalPrivs=None):
    if _globalPrivs == None:
        globalPrivs = names
    else:
        globalPrivs = _globalPrivs
    # Look for privates
    privates = lookup(id, tree, {}, globalPrivs)
    
    # Fast path. Return if no privates defined
    if len(privates) == 0:
        return

    # Update existing privates with translation table
    # Also respect non-definition blocks here
    update(tree, privates)
    
    
def crypt(id, name, privmap):
    combined = "%s:%s" % (id, name)
    if combined in privmap:
        return privmap[combined]

    repl = "__%s" % convert(len(privmap))
    privmap[combined] = repl

    return repl
        
    
##
# collect privates and associate a replacement in <privates>
#
def lookup(id, node, privates, globalPrivs):
    # privates = { "<private>" : "<repl>", ... }
    name = None
    
    if node.type == "definition":
        if node.getChild("identifier", False):
            name = node.getChild("identifier").get("value", False)
        # treat node.getChild("assignment", False) later on its own

    elif node.type == "keyvalue":
        name = node.get("key", False)
        
    elif node.type == "assignment":
        left = node.getChild("first", False)
        if left:
            lval = left.children[0]
            if lval.isVar():
                if lval.type == "identifier":
                    name = lval.get("value")
                elif lval.type == "dotaccessor":
                    last = lval.getRightmostOperand()
                    name = last.get("value")
        
    if name and name.startswith("__") and not name in privates:
        privates[name] = crypt(id, name, globalPrivs)
        
        #if not name in used:
        #    used[name] = [id]
        #elif not id in used[name]:
        #    used[name].append(id)

    if node.hasChildren():
        for child in node.children:
            lookup(id, child, privates, globalPrivs)
        
    return privates


##
# replace privates occurrences with replacement
#
def update(node, privates):
    if node.hasChildren():
        for child in node.children:
            update(child, privates)
            
    name = None
            
    if node.type == "identifier":
        name = node.get("value", False)
        
    elif node.type == "keyvalue":
        name = node.get("key", False)    
    
    elif node.type == "constant" and node.get("constantType") == "string":
        name = node.get("value", False)
    
        # Replace occurrences of privates in larger strings:
        #if not name in privates:
        #    for key in privates:
        #        if key in name and re.compile(r"\b%s\b" % key).search(name):
        #            name = re.sub(r"(\b%s\b)" % key, privates[key], name)
        #            node.set("value", name)            
                        
    else:
        return
        
    if not name or name[:2] != "__":
        return
        
    if not name in privates:
        return
        
    repl = privates[name]

    if node.type in ("identifier", "constant"):
        name = node.set("value", repl)
        
    elif node.type == "keyvalue":
        name = node.set("key", repl)    


