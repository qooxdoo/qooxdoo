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
#    * Fabian Jakobs (fjakobs)
#
################################################################################

##
# Representing scopes of variables.
##

from ecmascript.frontend import treeutil
from ecmascript.frontend.tree import Node

##
# Class representing a single, flat scope (not including nested scopes), in
# which variables have a specific binding
#
# Each scope has a type, one of ("global", "function" or "exception"), and
# relates to its top-most AST node. Variables in a scope come in different
# flavors, depending on the type of scope there are declared ("var") variables,
# parameters ("arguments") of functions, or arguments of exceptions ("catch"
# arguments).

class Scope(object):

    def __init__(self, node, script):
        self.node   = node
        self.script = script
        self.type   = self._getType()

        if self.type == Scope.EXCEPTION:
            self.variables = self._getExceptionVariables()
        else:
            self.variables = self._getDeclaredVariables()

        self.arguments       = self._getArguments()
        self.parentScopeNode = self._getParentScopeNode()
        self.uses            = []
        return


    GLOBAL    = "global"
    FUNCTION  = "function"
    EXCEPTION = "exception"


    def __str__(self):
        arguments = ", ".join([s.__str__() for s in self.arguments])
        variables = ", ".join([s.__str__() for s in self.variables])
        uses = ", ".join([s.__str__() for s in self.uses])

        return """
Function %s(%s):
  - Defined variables: %s
  - Used Variables: %s""" % (
            treeutil.getFunctionName(self.node),
            arguments, variables, uses
        )


    ##
    # Find all nodes where a variable is referenced/used (rather than
    # declared) in this scope

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


    ##
    # Return the parent in the scope chain, if any.

    def getParentScope(self):
        if self.parentScopeNode:
            return self.script.getScope(self.parentScopeNode)
        else:
            if self.type == Scope.FUNCTION:
                return self.script.getGlobalScope()
            else:
                return None


    ##
    # See if a given variable name is defined in the local scope

    def getLocalDefinition(self, variableName):
        for var in self.variables:
            if var.name == variableName:
                return var

        for arg in self.arguments:
            if arg.name == variableName:
                return arg

        return None


    ##
    # Return the scope type

    def _getType(self):
        if self.node.type == "function":
            return Scope.FUNCTION
        elif self.node.type == "catch":
            return Scope.EXCEPTION
        else:
            return Scope.GLOBAL


    ##
    # Return the parameter ("arguments") of a function scope.

    def _getArguments(self):
        paramsNode = self.node.getChild("params", False)
        if not paramsNode:
            return []

        arguments = []

        if paramsNode.hasChildren():
            for child in paramsNode.children:
                if child.type == "variable":
                    #name = child.getChild("identifier").get("name")
                    identifier = child.getChild("identifier")
                    name       = identifier.get("name")
                    arguments.append(VariableDefinition(name, identifier, True, self))

        return arguments


    ##
    # Return the parameters of a "catch" expression.

    def _getExceptionVariables(self):
        identifier = treeutil.selectNode(self.node, "expression/variable/identifier")
        return [VariableDefinition(identifier.get("name",None), identifier, False, self)]


    ##
    # Return the tree node of the parent scope.

    def _getParentScopeNode(self):
        node = self.node
        while node.hasParent():
            node = node.parent
            if node.type in ["function", "catch"]:
                return node
        return None


    ##
    # Create VariableDefinition's for the variable declarations in this scope.

    def _getDeclaredVariables(self):
        variables = {}

        if self.type == Scope.GLOBAL:
            startNode = self.node
        elif self.type == Scope.FUNCTION:
            startNode = self.node.getChild("body")

        for (name, node) in Scope.declaredVariablesIterator(startNode):
            if name in variables:
                variables[name].addDecl(node)
            else:
                variables[name] = VariableDefinition(name, node, False, self)

        return variables.values()


    ##
    # Generator for all nodes in a tree that "var" declare variables

    @staticmethod
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


    ##
    # Generate all "identifier" nodes down from this one
    # which are bare identifiers (as in "var foo;" yielding "foo") or head
    # a chain of identifiers (as in "tree.selection.Manager", yielding
    # "tree")

    @staticmethod
    def usedVariablesIterator(node):

        ##
        # chainTypes:
        # These are not all types that can show up in a chained ("a.b.c")
        # expression, but the ones you come across when going from an identifier
        # node upwards in the tree.
        chainTypes = set([
            "identifier",
            "accessor",
            "left", "right",
            "call", "operand",
            "variable",
            ])

        ##
        # Find the primary identifier for a chained expression (like "a" in
        # "a.b().c()[0].d()"), starting from any identifier *within* this
        # expression.
        def findChainRoot(node):
            current = node

            while current.parent and current.parent.type in chainTypes:
                current = current.parent

            return current  # this must be the chain root

        ##
        # Find the leftmost child of the passed node, assumed to be an
        # identifier.
        def findLeftmostIdentifier(node):
            child = node

            while child.children:
                c = child.getFirstChild(mandatory=False, ignoreComments=True)
                if c:
                    child = c
                else:
                    break
            #assert child.type == "identifier"

            return child

        ##
        # Check if the given identifier node is the first in a chained
        # expression ("a.b.c().d[]"); uses findLeftmostIdentifier().
        def checkFirstChild(node):
            chainRoot = findChainRoot(node)
            leftmostIdentifier = findLeftmostIdentifier(chainRoot)

            # compare to current node
            if leftmostIdentifier == node:
                return True
            else:
                return False


        # - Main ---------------------------------------------------------------

        # Switch on node context:
        # "function", "catch":
        if node.type in ["function", "catch"]:
            return

        # "catch": skip the identifier of catch clauses, e.g. the 'e' in 'catch(e)'
        if node.type == "expression" and node.parent.type == "catch":
            return

        # "for-in": treat variables used in for-in loops as used variables
        if (
            node.type == "first" and
            node.parent.type == "operation" and
            node.parent.get("operator") == "IN"
           ):
            use = treeutil.selectNode(node, "definitionList/definition")
            if use:
                name = use.get("identifier", False)
                yield (name, use)
                return

        # "identifier": 
        if node.type == "identifier":
            isFirstChild     = False
            isVariableMember = False

            # not sure why the next would be relevant for "accessor" type parents, but the
            # old code treated it like this, and I keep it that way.
            if node.parent.type in ("variable", "accessor"):
                isVariableMember = True
                isFirstChild = checkFirstChild(node)

            # inside a variable parent only respect the first member
            if not isVariableMember or isFirstChild:
                name = node.get("name", False)
                if name:
                    yield (name, node)

        # -- Recurse over children
        if node.children:
            for child in node.children:
                for (name, use) in Scope.usedVariablesIterator(child):
                    yield (name, use)

        return


##
# Class representing a defining occurrence of a variable in the code
# (e.g. as in "var a=3;"); a variable can be defined multiple times
# within a single scope; each instance links to its scope, and has 
# a list of its VariableUses (see further).

class VariableDefinition(object):

    def __init__(self, name, node, isArgument, scope):
        self.name = name
        self.nodes = [node]
        self.isArgument = isArgument
        self.scope = scope
        self.uses = []

    def __str__(self):
        return self.name

    def addUse(self, variableUse):
        self.uses.append(variableUse)

    def addDecl(self, node):
        self.nodes.append(node)


##
# Class representing a use occurrence of a variable in the code;
# VariableUse's maintain their relation the variable's definition
# at the corresponding VariableDefinition object

class VariableUse(object):

    def __init__(self, name, node, scope):
        self.name = name
        self.node = node
        self.scope = scope

        self.definition = self.scope.script.getVariableDefinition(name, scope)
        if self.definition:
            self.definition.addUse(self)

    def __str__(self):
        return self.name


