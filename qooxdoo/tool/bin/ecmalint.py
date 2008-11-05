#!/usr/bin/env python
# encoding: utf-8

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
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import re
import os
import sys
import qxenviron
from optparse import OptionParser

from ecmascript.frontend import treegenerator
from ecmascript.frontend import tokenizer
from ecmascript.frontend import treeutil
from ecmascript.frontend import tree
from ecmascript.frontend import lang
from ecmascript.frontend.Script import Script
from ecmascript.frontend.Scope import Scope
from misc import filetool

class ConsoleLogger:
    def __init__(self):
        pass

    def log(self, filename, row, column, msg):
        print """%s (%s,%s): %s""" % (filename, row, column, msg)


class Lint:
    def __init__(self, filename, logger=None):
        self.filename = filename
        content = filetool.read(filename)

        self.tree = treegenerator.createSyntaxTree(tokenizer.parseStream(content))
        self.script = Script(self.tree, self.filename)
        if not logger:
            self.logger = ConsoleLogger()
        else:
            self.logger = logger


    def log(self, node, msg):
        (row, column) = treeutil.getLineAndColumnFromSyntaxItem(node)
        self.logger.log(self.filename, row, column, msg)


    def checkRequiredBlocks(self):
        for node in treeutil.nodeIterator(self.tree, "loop"):
            block = treeutil.selectNode(node, "statement/block")
            if not block:
                self.log(node, "The statement of loops and conditions must be enclosed by a block in braces '{}'")


    def checkMaps(self):
        for node in treeutil.nodeIterator(self.tree, "map"):
            knownkeys = {}
            if node.hasChildren():
                for child in node.children:
                    if child.type == "keyvalue":
                        key = child.get("key")
                        if knownkeys.has_key(key):
                            self.log(child, "Map key '%s' redefined." % key)
                        else:
                            knownkeys[key] = child


    def checkFields(self):
        define = treeutil.findQxDefine(self.tree)
        if not define:
            return

        classMapNode = treeutil.selectNode(define, "params/2")
        if classMapNode is None:
            return

        classMap = treeutil.mapNodeToMap(classMapNode)
        if not classMap.has_key("members"):
            return

        members = treeutil.mapNodeToMap(classMap["members"].children[0])
        restricted = [key for key in members if key.startswith("_")]

        assignNodes = [node for node in treeutil.nodeIterator(classMap["members"], "assignment")]
        if classMap.has_key("construct"):
            for node in treeutil.nodeIterator(classMap["construct"], "assignment"):
                assignNodes.append(node)

        for node in assignNodes:
            this = treeutil.selectNode(node, "left/variable/identifier[1]/@name")
            if this != "this":
                continue

            field = treeutil.selectNode(node, "left/variable/identifier[2]/@name")
            if field is None:
                continue

            if field[0] != "_":
                continue
            elif field[1] == "_":
                prot = "private"
            else:
                prot = "protected"

            if prot == "protected":
                self.log(node, "Protected data field '%s'. Protected fields are deprecated. Better use private fileds in combination with getter and setter methods." % field)
            elif not field in restricted:
                self.log(node, "Implicit declaration of %s field '%s'. You should list this field in the members section." % (prot, field))



    def checkUnusedVariables(self):
        for scope in self.script.iterScopes():
            if scope.type != Scope.EXCEPTION:
                for var in scope.variables:
                    if len(var.uses) == 0:
                        self.log(var.node, "Unused identifier '%s'" % var.name)

    DEPRECATED_IDENTIFIER = set([
        "alert",
        "confirm",
        "debugger",
        "eval"
    ])

    def isBadGlobal(self, identifier):
        return identifier in Lint.DEPRECATED_IDENTIFIER

    KNOWN_IDENTIFIER = set(lang.GLOBALS)

    # this array has formerly been assigned to KNOWN_IDENTIFIER and can be removed later
    [

        "window", "document",

        # Java
        "java", "sun", "Packages",

        # Firefox extension: Firebug
        "console",

        # IE
        "event", "offscreenBuffering", "clipboardData", "clientInformation", "Option",
        "Image", "external", "screenTop", "screenLeft", "ActiveXObject",

        # window
        'window', 'console', 'document', 'addEventListener', '__firebug__', 'location',
        'navigator', 'Packages', 'sun', 'java', 'netscape', 'XPCNativeWrapper', 'Components',
        'parent', 'top', 'scrollbars', 'name', 'scrollX', 'scrollY', 'scrollTo', 'scrollBy',
        'getSelection', 'scrollByLines', 'scrollByPages', 'sizeToContent', 'dump', 'setTimeout',
        'setInterval', 'clearTimeout', 'clearInterval', 'setResizable', 'captureEvents',
        'releaseEvents', 'routeEvent', 'enableExternalCapture', 'disableExternalCapture',
        'prompt', 'open', 'openDialog', 'frames', 'find', 'self', 'screen', 'history',
        'content', 'menubar', 'toolbar', 'locationbar', 'personalbar', 'statusbar',
        'directories', 'closed', 'crypto', 'pkcs11', 'controllers', 'opener', 'status',
        'defaultStatus', 'innerWidth', 'innerHeight', 'outerWidth', 'outerHeight', 'screenX',
        'screenY', 'pageXOffset', 'pageYOffset', 'scrollMaxX', 'scrollMaxY', 'length',
        'fullScreen', 'alert', 'confirm', 'focus', 'blur', 'back', 'forward', 'home', 'stop',
        'print', 'moveTo', 'moveBy', 'resizeTo', 'resizeBy', 'scroll', 'close', 'updateCommands',
        'atob', 'btoa', 'frameElement', 'removeEventListener', 'dispatchEvent', 'getComputedStyle',
        'sessionStorage', 'globalStorage',

        # XML
        "DOMParser", "XMLSerializer", "XPathEvaluator", "XPathResult",
        "XMLHttpRequest",

        # Language
        "Array", "Object", "Date", "Error", "Function", "String", "RegExp", "Math",
        "Number", "Boolean",

        "decodeURI", "decodeURIComponent", "encodeURIComponent",
        "escape", "unescape",
        "parseInt", "parseFloat", "isNaN", "isFinite",

        "this", "arguments", "undefined", "NaN", "Infinity"
    ]

    def isGoodGlobal(self, identifier):
        return identifier in Lint.KNOWN_IDENTIFIER

    def checkUndefinedVariables(self, globals):
        
        # check whether this is a qooxdoo class and extract the top level namespace
        define = treeutil.findQxDefine(self.tree)
        if define:
            className = treeutil.selectNode(define, "params/1").get("value")
            globals.append(className.split(".")[0])        
        
        globalScope = self.script.getGlobalScope()
        for scope in self.script.iterScopes():
            for use in scope.uses:

                if use.name in globals:
                    continue

                if not use.definition:
                    if self.isBadGlobal(use.name):
                        self.log(use.node, "Use of deprecated global identifier '%s'" % use.name)
                    elif not self.isGoodGlobal(use.name):
                        self.log(use.node, "Use of undefined or global identifier '%s'" % use.name)

                elif use.definition.scope == globalScope:
                    self.log(use.node, "Use of global identifier '%s'" % use.name)



def main(argv=None):

    if argv is None:
        argv = sys.argv

    parser = OptionParser(description="Checks ECMAScript/JavaScript files for common errors.")
    parser.add_option(
        "--action", "-a", dest="actions", metavar="ACTION",
        choices=["ALL", "undefined_variables", "unused_variables", "maps", "blocks", "fields"], action="append", default=[],
        help="""Performs the given checks on the input files. This parameter may be supplied multiple times.
Valid arguments are: "ALL" (default): Perform all checks
"undefined_variables": Look for identifier, which are referenced in the global scope. This action can find
misspelled identifier and missing 'var' statements. You can use the '-g' flag to add valid global identifiers.
  unused_variables: Look for identifier, which are defined but never used.
"maps": Look for duplicate keys in map declarations. """
    )
    parser.add_option(
        "-g", dest="globals", help="Add an allowed global identifier GLOBAL",
        metavar="GLOBAL", type="string", action="append"
    )

    (options, args) = parser.parse_args(argv)

    if len(args) == 1:
        parser.print_help()
        sys.exit(1)

    if options.globals:
        globals = options.globals
    else:
        globals = {}

    checkAll = "ALL" in options.actions or len(options.actions) == 0

    for filename in args[1:]:
        lint = Lint(filename)

        if checkAll or "undefined_variables" in options.actions:
            lint.checkUndefinedVariables(globals)

        if checkAll or "unused_variables" in options.actions:
            lint.checkUnusedVariables()

        if checkAll or "maps" in options.actions:
            lint.checkMaps()

        if checkAll or "blocks" in options.actions:
            lint.checkRequiredBlocks()

        if checkAll or "fields" in options.actions:
            lint.checkFields()



if __name__ == "__main__":
    rc = main()
    sys.exit(rc)
