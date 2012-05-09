#!/usr/bin/env python
# encoding: utf-8

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
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import re
import os
import sys
import qxenviron
from optparse import OptionParser

from ecmascript.frontend import treegenerator_2 as treegenerator
from ecmascript.frontend import tokenizer
from ecmascript.frontend import treeutil_2 as treeutil
from ecmascript.frontend import tree
from ecmascript.frontend import lang
from ecmascript.frontend import Comment_2 as Comment
from ecmascript.frontend.Script_2 import Script
from ecmascript.frontend.Scope_2 import Scope
from misc import filetool

class ConsoleLogger:
    def __init__(self):
        pass

    def log(self, filename, row, column, msg):
        print """%s (%s,%s): %s""" % (filename, row, column, msg.encode("ascii", "replace"))


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
                self.log(node, "The statement of loops and conditions should be enclosed by a block in braces '{}'")
        for node in treeutil.nodeIterator(self.tree, "elseStatement"):
            block = treeutil.selectNode(node, "block")
            if not block:
                block = treeutil.selectNode(node, "loop[@loopType='IF']")
            if not block:
                self.log(node, "The statement of loops and conditions should be enclosed by a block in braces '{}'")


    def checkMaps(self):
        for node in treeutil.nodeIterator(self.tree, "map"):
            knownkeys = {}
            if node.hasChildren():
                for child in node.children:
                    if child.type == "keyvalue":
                        key = child.get("key")
                        if key in knownkeys:
                            self.log(child, "Map key '%s' redefined." % key)
                        else:
                            knownkeys[key] = child


    def checkFields(self):

        def getVariables():
            # get all variable nodes from 'members' and (pot.) 'construct'
            variables = []
            if "members" in classMap:
                variables.extend([node for node in treeutil.nodeIterator(classMap["members"], ["variable"])])
            if "construct" in classMap:
                variables.extend([node for node in treeutil.nodeIterator(classMap["construct"], ["variable"])])
            return variables

        def checkPrivate(allVars):

            privateElement = re.compile(r'\b__')

            def findPrivate(allVars):
                variables = []
                for node in allVars:
                    fullName, isComplete = treeutil.assembleVariable(node)
                    if privateElement.search(fullName):
                        variables.append(node)
                return variables

            def isLocalPrivate(var, fullName):
                allIdentifier = fullName.split('.')
                first = second = None
                if len(allIdentifier) > 0:
                    first  = allIdentifier[0]
                if len(allIdentifier) > 1:
                    second = allIdentifier[1]
                return (first and
                        (first == "this" or first == "that") and 
                        second and
                        privateElement.match(second))
                
            variables = findPrivate(allVars)
            for var in variables:
                fullName = treeutil.assembleVariable(var)[0]
                if isLocalPrivate(var, fullName) and fullName.split('.')[1] not in restricted: # local privates are ok, as long as they are declared
                    self.log(var, "Undeclared private data field '%s'. You should list this field in the members section." % fullName)
            return

        def checkProtected(allVars):

            protectedElement = re.compile(r'\b_[^_]')

            def findProtected(allVars):
                variables = []
                for node in allVars:
                    # only check protected in lval position
                    if (node.hasParent() and node.parent.type == "left" and
                        node.parent.hasParent() and node.parent.parent.type == "assignment" and
                        protectedElement.search(treeutil.assembleVariable(node)[0])):
                        variables.append(node)
                return variables

            def protectedIsLastVarChild(var):
                lastChild  = var.getLastChild(ignoreComments=True)  # like "this.a.b" -> b
                if lastChild.type != "identifier":  # rules out this.a._prot[0] which isn't a call anyway
                    return False
                name = treeutil.selectNode(lastChild, "@name")
                if name and protectedElement.match(name):
                    return True
                else:
                    return False

            variables = findProtected(allVars)
            for var in variables:
                # check call with protected "..._protected()..."
                #if (
                #    protectedIsLastVarChild(var) and   # like "this.a.b._protected()", not "this.a._protected.b()"
                #    var.hasParent() and var.parent.type == "operand" and  # parent is "operand"
                #    var.parent.hasParent() and var.parent.parent.type == "call"  # grandparent is "call"
                #    ):   # it's ok as method call
                #    pass
                #else:
                #self.log(var, "Protected data field in '%s'. Protected data fields are deprecated. Better use private fields in combination with getter and setter methods." % treeutil.assembleVariable(var)[0])
                pass  # protected data fields are ok
            return

        def checkImplicit(allVars):

            def hasUndeclaredMember(fullName):
                allIdentifier = fullName.split('.')
                first = second = None
                if len(allIdentifier) > 0:
                    first  = allIdentifier[0]
                if len(allIdentifier) > 1:
                    second = allIdentifier[1]
                return (first and
                        (first == "this" or first == "that") and 
                        second and
                        second not in restricted)     # <- this is bogus, too narrow
                
            for var in allVars:
                fullName = treeutil.assembleVariable(var)[0]
                if hasUndeclaredMember(fullName):
                    self.log(var, "Undeclared local data field in '%s'! You should list this field in the member section." % fullName)

            return

        def checkAll():

            def findVariables(rootNode):
                variables = []
                for node in treeutil.nodeIterator(rootNode, ["assignment", "call"]):
                    if node.type == "assignment":
                        variables.append(node.getChild("left"))
                    elif node.type == "call":
                        variables.append(node.getChild("operand"))
                return variables

            variables = findVariables(classMap["members"])
            if "construct" in classMap:
                variables.extend(findVariables(classMap["construct"]))

            for node in variables:
                this = treeutil.selectNode(node, "variable/identifier[1]/@name")
                if this != "this":
                    continue

                field = treeutil.selectNode(node, "variable/identifier[2]/@name")
                if field is None:
                    continue

                if field[0] != "_":
                    continue
                elif field[1] == "_":
                    prot = "private"
                else:
                    prot = "protected"

                if prot == "protected":
                    #self.log(node, "Protected data field '%s'. Protected fields are deprecated. Better use private fields in combination with getter and setter methods." % field)
                    pass # protected data fields are ok
                elif not field in restricted:
                    self.log(node, "Implicit declaration of %s field '%s'. You should list this field in the members section." % (prot, field))

        classMap   = self._getClassMap()
        #print self.tree.toXml()
        if len(classMap) == 0:
            return
        restricted = [key for key in self._getMembersMap() if key.startswith("_")]
        allVars    = getVariables()
        
        #checkImplicit(allVars)  # this check is overgenerating, doesn't honor all members/statics, nor inherited
        checkPrivate(allVars)
        checkProtected(allVars)
        #checkAll()


    def checkReferenceFields(self):
        members = self._getMembersMap()
        for name in members:
            valueNode = members[name].children[0]
            if valueNode.type in ["map", "instantiation", "array"]:
                if self._shouldPrintReferenceFieldWarning(valueNode, name):
                    self.log(
                        valueNode,
                        ("Data field '%s' has a reference value. " +
                        "If data fields are initialized in the members map with " +
                        "reference values like arrays or maps they will be shared " + 
                        "between all instances of the class. Usually it is better " +
                        "to set the value to 'null' and initialize it in the constructor") % name
                    )
        

    def _getClassMap(self):
        define = treeutil.findQxDefine(self.tree)
        if not define:
            return {}

        classMapNode = treeutil.selectNode(define, "params/2")
        if classMapNode is None:
            return {}

        classMap = treeutil.mapNodeToMap(classMapNode)
        return classMap
        

    def _getMembersMap(self):
        classMap = self._getClassMap()
        if not "members" in classMap:
            return {}

        members = treeutil.mapNodeToMap(classMap["members"].children[0])
        return members
        

    def checkUnusedVariables(self):
        for scope in self.script.iterScopes():
            if scope.type != Scope.EXCEPTION:
                for var in scope.variables:
                    if len(var.uses) == 0:
                        for node in var.nodes:
                            if self._shouldPrintUnusedWarning(node, var.name):
                                self.log(node, "Unused identifier '%s'" % var.name)

    
    def checkMultiDefinedVariables(self):
        for scope in self.script.iterScopes():
            if scope.type != Scope.EXCEPTION:
                for var in scope.variables:
                    if len(var.nodes) > 1:
                        for node in var.nodes:
                            self.log(node, "Multiply declared identifier '%s'" % var.name)


    DEPRECATED_IDENTIFIER = set([
        "alert",
        "confirm",
        "debugger",
        "eval"
    ])

    def isBadGlobal(self, identifier):
        return identifier in Lint.DEPRECATED_IDENTIFIER

    KNOWN_IDENTIFIER = set(lang.GLOBALS)

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
                    if self.isBadGlobal(use.name) and self._shouldPrintDeprecatedWarning(use.node, use.name):
                        self.log(use.node, "Use of deprecated global identifier '%s'" % use.name)
                    elif not self.isBadGlobal(use.name) and not self.isGoodGlobal(use.name) and self._shouldPrintUndefinedWarning(use.node, use.name):
                        self.log(use.node, "Use of undefined or global identifier '%s'" % use.name)

                elif use.definition.scope == globalScope and self._shouldPrintUndefinedWarning(use.node, use.name):
                    self.log(use.node, "Use of global identifier '%s'" % use.name)


    def _shouldPrintDeprecatedWarning(self, node, name):
        return self._shouldPrintVariableWarning(node, "ignoreDeprecated", name)
    
    def _shouldPrintUndefinedWarning(self, node, name):
        return self._shouldPrintVariableWarning(node, "ignoreUndefined", name)
        
    def _shouldPrintUnusedWarning(self, node, name):
        return self._shouldPrintVariableWarning(node, "ignoreUnused", name)
    
    def _shouldPrintReferenceFieldWarning(self, node, name):
        return self._shouldPrintVariableWarning(node, "ignoreReferenceField", name)
    
    def _shouldPrintVariableWarning(self, node, docCommand, variableName):
        comments = Comment.findComment(node)
        if comments is None:
            return True
        
        lintAttribs = [x for x in comments if x["category"] == "lint"]
        
        unused_re = re.compile("<p>\s*%s\s*\(\s*((?:[\w\$]+)\s*(?:,\s*(?:[\w\$]+)\s*)*)\)" % docCommand)
        for attrib in lintAttribs:
            match = unused_re.match(attrib["text"])
            if match:
                variables = [var.strip() for var in match.group(1).split(",")]
                return not variableName in variables            
        return True
            

def main(argv=None):

    if argv is None:
        argv = sys.argv

    parser = OptionParser(description="Checks ECMAScript/JavaScript files for common errors.")
    parser.add_option(
        "--action", "-a", dest="actions", metavar="ACTION",
        choices=["ALL", "undefined_variables", "unused_variables", "multidefined_variables", "maps", "blocks", "fields"], action="append", default=[],
        help="""Performs the given checks on the input files. This parameter may be supplied multiple times.
Valid arguments are: "ALL" (default): Perform all checks
"undefined_variables": Look for identifier, which are referenced in the global scope. This action can find
misspelled identifier and missing 'var' statements. You can use the '-g' flag to add valid global identifiers.
  "unused_variables": Look for identifier, which are defined but never used.
  "multidefined_variables": Look for identifier, which are defined multiple times.
  "blocks" : Look for single statments in bodies of if's and loops that are not enclosed by braces.
  "fields" : Look for class attributes, checking definedness, privates and protected fields.
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
        globals = []

    checkAll = "ALL" in options.actions or len(options.actions) == 0

    for filename in args[1:]:
        lint = Lint(filename)

        if checkAll or "undefined_variables" in options.actions:
            lint.checkUndefinedVariables(globals)

        if checkAll or "unused_variables" in options.actions:
            lint.checkUnusedVariables()

        if "multidefined_variables" in options.actions:
            lint.checkMultiDefinedVariables()

        if checkAll or "maps" in options.actions:
            lint.checkMaps()

        if checkAll or "blocks" in options.actions:
            lint.checkRequiredBlocks()

        if checkAll or "fields" in options.actions:
            lint.checkFields()
            lint.checkReferenceFields()



if __name__ == "__main__":
    rc = main()
    sys.exit(rc)
