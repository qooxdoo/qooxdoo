#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
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
from optparse import OptionParser

from modules import treegenerator
from modules import tokenizer
from modules import treeutil
from modules import filetool
from modules import tree


def getFunctionName(fcnNode):

    if not fcnNode.hasParent() or not fcnNode.parent.hasParent():
        return "global"

    if fcnNode.type == "function" and fcnNode.get("name", False):
        return fcnNode.get("name", False)

    if fcnNode.parent.parent.type == "keyvalue":
        return fcnNode.parent.parent.get("key")

    if fcnNode.parent.type == "right" and fcnNode.parent.parent.type == "assignment":
        return fcnNode.parent.parent.getFirstChild().getFirstChild().toJavascript().strip()

    if fcnNode.parent.type == "assignment" and fcnNode.parent.parent.type == "definition":
        return fcnNode.parent.parent.get("identifier")

    return "unknown"


def nodeIterator(node, nodetypes):
    if node.type in nodetypes:
        yield node

    if node.hasChildren():
        for child in node.children:
            for fcn in nodeIterator(child, nodetypes):
                yield fcn



class Script:
    def __init__(self, rootNode, filename=""):
        self.root = rootNode
        self.filename = filename
        self.scopes = self._buildScopes()
        self._computeVariableUses()

    def _buildScopes(self):
        scopes = {}
        self.globalScope = Scope(self.root, self)
        scopes[self.root] = self.globalScope

        for node in nodeIterator(self.root, ["function", "catch"]):
            scope = Scope(node, self)
            scopes[node] = scope

        return scopes

    def _computeVariableUses(self):
        for scope in self.scopes.itervalues():
            scope.computeVariableUses()

    def getScope(self, functionNode):
        if self.scopes.has_key(functionNode):
            return self.scopes[functionNode]
        else:
            return None

    def getGlobalScope(self):
        return self.globalScope

    def iterScopes(self):
        for scope in self.scopes.itervalues():
            yield scope

    def getVariableDefinition(self, variableName, scope):
        while True:
            definition = scope.getLocalDefinition(variableName)
            if definition is not None:
                return definition
            scope = scope.getParentScope()
            if scope is None:
                return None


class Scope:
    def __init__(self, node, script):
        self.node = node
        self.script = script
        self.type = self._getType()

        if self.type == Scope.EXCEPTION:
            self.variables = self._getExceptionVariables()
        else:
            self.variables = self._getDeclaredVariables()

        self.arguments = self._getArguments()
        self.parentScopeNode = self._getParentScopeNode()
        self.uses = []

    GLOBAL = "global"
    FUNCTION = "function"
    EXCEPTION = "exception"

    def __str__(self):
        arguments = ", ".join([s.__str__() for s in self.arguments])
        variables = ", ".join([s.__str__() for s in self.variables])
        uses = ", ".join([s.__str__() for s in self.uses])

        return """
Function %s(%s):
  - Defined variables: %s
  - Used Variables: %s""" % (
            getFunctionName(self.node),
            arguments, variables, uses
        )


    def computeVariableUses(self):
        self.uses = []

        if self.type == Scope.GLOBAL:
            startNode = self.node
        elif self.type == Scope.FUNCTION:
            startNode = self.node.getChild("body")
        elif self.type == Scope.EXCEPTION:
            startNode = self.node.getChild("statement")

        for (name, node) in Scope.usedVariablesIterator(startNode):
            self.uses.append(VariableUse(name, node, self))


    def getParentScope(self):
        if self.parentScopeNode:
            return self.script.getScope(self.parentScopeNode)
        else:
            if self.type == Scope.FUNCTION:
                return self.script.getGlobalScope()
            else:
                return None


    def getLocalDefinition(self, variableName):
        for var in self.variables:
            if var.name == variableName:
                return var

        for arg in self.arguments:
            if arg.name == variableName:
                return arg

        return None


    def _getType(self):
        if self.node.type == "function":
            return Scope.FUNCTION
        elif self.node.type == "catch":
            return Scope.EXCEPTION
        else:
            return Scope.GLOBAL


    def _getArguments(self):
        paramsNode = self.node.getChild("params", False)
        if not paramsNode:
            return []

        arguments = []

        if paramsNode.hasChildren():
            for child in paramsNode.children:
                if child.type == "variable":
                    name = child.getChild("identifier").get("name")
                    arguments.append(VariableDefinition(name, child, True, self))

        return arguments


    def _getExceptionVariables(self):
        identifier = treeutil.selectNode(self.node, "expression/variable/identifier/@name")
        return [VariableDefinition(identifier, self.node, False, self)]


    def _getParentScopeNode(self):
        node = self.node
        while node.hasParent():
            node = node.parent
            if node.type in ["function", "catch"]:
                return node
        return None


    def _getDeclaredVariables(self):
        variables = {}

        if self.type == Scope.GLOBAL:
            startNode = self.node
        elif self.type == Scope.FUNCTION:
            startNode = self.node.getChild("body")

        for (name, node) in Scope.declaredVariablesIterator(startNode):
            variables[name] = VariableDefinition(name, node, False, self)

        return variables.values()


    def declaredVariablesIterator(node):
        if node.type == "function":
            name = node.get("name", False)
            if name:
                yield (name, node)
            return

        if node.hasChildren():
            for child in node.children:

                if child.type == "definitionList":
                    for definition in child.children:
                        if definition.type == "definition":
                            yield (definition.get("identifier"), definition)

                for (var, node) in Scope.declaredVariablesIterator(child):
                    yield (var, node)

    declaredVariablesIterator = staticmethod(declaredVariablesIterator)


    def usedVariablesIterator(node):
        if node.type in ["function", "catch"]:
            return

        # skip the identifier of catch clauses, e.g. the 'e' in 'catch(e)'
        if node.type == "expression" and node.parent.type == "catch":
            return

        # Handle all identifiers
        if node.type == "identifier":
            isFirstChild = False
            isVariableMember = False

            if node.parent.type == "variable":
                isVariableMember = True
                varParent = node.parent.parent

                # catch corner case: a().b(); var b;
                if (
                    varParent.type == "operand" and
                    varParent.parent.type == "call" and
                    varParent.parent.parent.type == "right" and
                    varParent.parent.parent.parent.type == "accessor"
                ):
                    varParent = varParent.parent.parent

                # catch corner case a().b().length
                if (
                    varParent.type == "operand" and
                    varParent.parent.type == "call" and
                    varParent.parent.parent.type == "left" and
                    varParent.parent.parent.parent.type == "accessor" and
                    varParent.parent.parent.parent.parent.type == "right"
                ):
                    varParent = varParent.parent.parent.parent.parent

                # catch corner case a().b()[0]
                if (
                    varParent.type == "operand" and
                    varParent.parent.type == "call" and
                    varParent.parent.parent.type == "identifier" and
                    varParent.parent.parent.parent.type == "accessor" and
                    varParent.parent.parent.parent.parent.type == "right"
                ):
                    varParent = varParent.parent.parent.parent.parent

                if not (varParent.type == "right" and varParent.parent.type == "accessor"):
                    isFirstChild = node.parent.getFirstChild(True, True) == node

            # used in foo.bar.some[thing] where "some" is the identifier
            elif node.parent.type == "accessor":
                isVariableMember = True

                accessor = node.parent
                while accessor.parent.type == "accessor":
                    accessor = accessor.parent

                isFirstChild = accessor.parent.getFirstChild(True, True) == accessor

            # inside a variable parent only respect the first member
            if not isVariableMember or isFirstChild:
                name = node.get("name", False)
                if name:
                    yield (name, node)

        # Iterate over children
        if node.hasChildren():
            for child in node.children:
                for (name, use) in Scope.usedVariablesIterator(child):
                    yield (name, use)

    usedVariablesIterator = staticmethod(usedVariablesIterator)


class VariableDefinition:
    def __init__(self, name, node, isArgument, scope):
        self.name = name
        self.node = node
        self.isArgument = isArgument
        self.scope = scope
        self.uses = []

    def __str__(self):
        return self.name

    def addUse(self, variableUse):
        self.uses.append(variableUse)


class VariableUse:
    def __init__(self, name, node, scope):
        self.name = name
        self.node = node
        self.scope = scope

        self.definition = self.scope.script.getVariableDefinition(name, scope)
        if self.definition:
            self.definition.addUse(self)

    def __str__(self):
        return self.name


class ConsoleLogger:
    def __init__(self):
        pass

    def log(self, filename, row, column, msg):
        print """%s (%s,%s): %s""" % (filename, row, column, msg)


class Lint:
    def __init__(self, filename, logger=None):
        self.filename = filename
        self.tree = treegenerator.createSyntaxTree(tokenizer.parseFile(filename))
        self.script = Script(self.tree, self.filename)
        if not logger:
            self.logger = ConsoleLogger()
        else:
            self.logger = logger


    def log(self, node, msg):
        (row, column) = treeutil.getLineAndColumnFromSyntaxItem(node)
        self.logger.log(self.filename, row, column, msg)


    def checkMaps(self):
        for node in nodeIterator(self.tree, "map"):
            knownkeys = {}
            if node.hasChildren():
                for child in node.children:
                    if child.type == "keyvalue":
                        key = child.get("key")
                        if knownkeys.has_key(key):
                            self.log(child, "Map key '%s' redefined." % key)
                        else:
                            knownkeys[key] = child



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

    KNOWN_IDENTIFIER = set([

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
        "Number",

        "encodeURI", "decodeURI", "decodeURIComponent", "encodeURIComponent",
        "escape", "unescape",
        "parseInt", "parseFloat", "isNaN", "isFinite",

        "this", "arguments", "undefined", "NaN", "Infinity"
    ])

    def isGoodGlobal(self, identifier):
        return identifier in Lint.KNOWN_IDENTIFIER

    def checkUndefinedVariables(self, globals):
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
        choices=["ALL", "undefined_variables", "unused_variables", "maps"], action="append", default=[],
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

if __name__ == "__main__":
    sys.exit(main())
