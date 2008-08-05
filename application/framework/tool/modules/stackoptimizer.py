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

import sys, optparse
import treegenerator, tokenizer, tree, treeutil


def parseOperationVariable(vari):
    last = vari.getLastChild()
    incr = ""
    
    for child in vari.children:
        if child.type == "identifier":
            if child != last:
                incr += child.get("name") + "."
                
        else:
            return None, last.get("name")
            
    incr = incr[:-1]
    
    return incr, last.get("name")

            


def callScan(node):
    data = {}
    callScanRec(node, data)
    return data
    
    
    
def callScanRec(node, data):
    
    if node.type == "call":
        complex = node.parent and node.parent.type == "right" and node.parent.parent.type == "accessor"            
        oper = node.getChild("operand")
        
        if oper:
            vari = oper.getChild("variable")
            
            if vari:
                (obj, func) = parseOperationVariable(vari)
              
                msg = "    - exec %s()" % func
                
                if obj != None and obj != "":
                    msg += " on object: %s" % obj
                    
                if complex:
                    msg += " on complex accessor"
                    
                print msg
                
                
    if node.hasChildren():
        for child in node.children:
            callScanRec(child, data)




def mapScan(node):
    names = {}

    for child in node.children:
        if child.type == "keyvalue": 
            print "  - method: %s()" % child.get("key")
            
            func = child.getChild("value").getChild("function", False)
            
            if func:
                callScan(func)           
        
    return names



def track(node):
    if node.type == "file":
        node = node.getChild("call")

    if node.type == "call":
        isClass = False
            
        oper = node.getChild("operand", False)
        if oper:
            vari = oper.getChild("variable", False)
            
            if vari:
                isClass = (treeutil.assembleVariable(vari))[0] == "qx.Class.define"
                    
        if not isClass: 
            return        
                
        classname = node.getChild("params").getChild("constant").get("value")
               
        print "Found class: %s" % classname    
 
        config = node.getChild("params").getChild("map")
        
        for entry in config.children:
            if entry.get("key") == "statics":
                print "Scanning statics..."
                statics = mapScan(entry.getChild("value").getChild("map"))
        
            if entry.get("key") == "members":
                print "Scanning members..."
                members = mapScan(entry.getChild("value").getChild("map"))
        




def main():
    global options

    parser = optparse.OptionParser()

    parser.add_option("--encoding", dest="encoding", default="utf-8", metavar="ENCODING", help="Defines the encoding expected for input files.")

    (options, args) = parser.parse_args()

    if len(args) == 0:
        print "Needs one or more arguments (files) to compile!"
        sys.exit(1)

    for fileName in args:
        print "Processing %s" % (fileName)

        restree = treegenerator.createSyntaxTree(tokenizer.parseFile(fileName, fileName, options.encoding))    
        
        track(restree)
      

  
  

if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)
        
