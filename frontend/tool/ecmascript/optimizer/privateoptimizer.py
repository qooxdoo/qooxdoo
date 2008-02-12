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

import sha
import zlib

def patch(tree, id):
    # Look for privates
    privates = lookup(id, tree, {})
    
    # Fast path. Return if no privates defined
    if len(privates) == 0:
        return

    # Update existing privates with translation table
    # Also respect non-definition blocks here
    update(tree, privates)
    

def crypt(id, name):
    return "CRYPT_%s_%s" % (id.replace(".", "_"), name[2:])
    
    
def lookup(id, node, privates):
    name = None
    
    if node.type == "definition":
        name = node.get("identifier", False)

    elif node.type == "identifier":
        name = node.get("name", False)
        
    elif node.type == "keyvalue":
        name = node.get("key", False)
        
    if name and name.startswith("__") and not privates.has_key(name):
        privates[name] = crypt(id, name)

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
    
    if not name:
        return
        
    elif not privates.has_key(name):
        if node.type == "constant":
            for key in privates:
                if key in name:
                    print "Problematic private use as part of a string: %s" % key
                    
        if name.startswith("__"):
            print "Ignored private %s" % name  
            
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
