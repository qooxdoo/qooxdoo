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
#
################################################################################

from ecmascript.frontend import treeutil

def patch(tree, id):
    define = treeutil.findQxDefine(tree)    
    if define == None:
        return
        
    mainChildren = define.getChild("params").children
    
    if len(mainChildren) <= 1:
        return
        
    mainBlock = mainChildren[1].children
    properties = None
    members = None

    for entry in mainBlock:
        key = entry.get("key")
        
        if key == "properties":
            properties = entry.getChild("value").getFirstChild()
        
        if key == "members":
            members = entry.getChild("value").getFirstChild()
            
    if properties and members:
        transfer(id, properties, members)
    
        
def transfer(id, properties, members):
    # print "Transfer properties of %s" % id
    
    for propName, value in treeutil.mapNodeToMap(properties).items():
        keyvalue = value.parent
        value = value.getFirstChild()

        if value.type != "map":
            continue

        propDefinition = treeutil.mapNodeToMap(value)
    
        if "group" in propDefinition:
            continue

        if propDefinition.get("refine", False) != "true":
            generateProperty(propName, propDefinition, members, "set")
            generateProperty(propName, propDefinition, members, "get")
            generateProperty(propName, propDefinition, members, "init")
            generateProperty(propName, propDefinition, members, "reset")
            
            if propDefinition.get("check", False) == "Boolean":
                generateProperty(propName, propDefinition, members, "toggle")
                generateProperty(propName, propDefinition, members, "is")
                
                    
def generateProperty(name, config, members, method):
    if not method in ["get", "is"]:
        return
    
    # print "Generate %s for %s" % (method, name)
    
    code = "function(){"
    
    if "inheritable" in config:
        code += 'if(this.$$inherit_' + name + '!==undefined)'
        code += 'return this.$$inherit_' + name + ';'
        code += 'else '

    code += 'if(this.$$user_' + name + '!==undefined)'
    code += 'return this.$$user_' + name + ';'

    if "themeable" in config:
        code += 'else if(this.$$theme_' + name + '!==undefined)'
        code += 'return this.$$theme_' + name + ';'

    if not "init" in config and "deferredInit" in config:
        code += 'else if(this.$$init_' + name + '!==undefined)'
        code += 'return this.$$init_' + name + ';'

    code += 'else '

    if "init" in config:
        code += 'return this.$$init_' + name + ';'
    else:
        code += 'return null;'
        
    code += "}"

    func = treeutil.compileString(code)
    pair = treeutil.createPair(method + name[0].upper() + name[1:], func)
    
    members.addChild(pair)
