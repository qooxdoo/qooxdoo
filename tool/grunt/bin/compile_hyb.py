#!/usr/bin/env python

##
# syntax: $0 <file.js> -- parse JS file and write it to console again
# 
# An experimental hybrid deserializer-serializer that uses 'esparse' to parse
# the JS, then uses a Moz AST to treegenerator_1 AST transformer, and writes out
# the resulting tree.
## 

import re, os, sys, types, codecs
QOOXDOO_PATH = os.path.abspath(os.path.dirname(__file__) + "/../../../..")
execfile(QOOXDOO_PATH + "/tool/bin/qxenviron.py")
from ecmascript.transform import moztree_to_tree1
from generator.runtime.ShellCmd import ShellCmd
from misc import json

shell = ShellCmd()
cmd = "esparse --raw --loc " + sys.argv[1]
#print cmd
rcode, stdout, errout = (
    shell.execute_piped(cmd))
if rcode != 0:
    print errout
    sys.exit(1)
tree_json = json.loads(stdout)
node = moztree_to_tree1.esprima_to_tree1(tree_json)
#print node.toXml()
#import pydb; pydb.debugger()
def opts():pass
opts.breaks = False
print node.toJS(opts)
