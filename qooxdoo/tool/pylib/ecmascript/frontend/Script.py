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
# Script represents a piece of JS code (as AST), over which variable scopes
# are calculated.
##

from operator import itemgetter
from ecmascript.frontend import treeutil
from ecmascript.frontend.Scope import Scope, VariableDefinition, VariableUse 

##
# Class representing JS code for variable scopes

class Script(object):

    ##
    # Computes all variable scopes in the code, storing them in an instance member
    # for later inspection.
    #
    # @param rootNode {ecmascript.frontend.tree.Node} AST representing the JS code

    def __init__(self, rootNode, filename=""):
        self.root = rootNode
        self.filename = filename
        self.scopes = self._buildScopes()  # tuple list [(Node(), Scope())], to preserve order
        self._computeVariableUses()


    ##
    # Create the scope list for this code, using treeutil.nodeIterator, providing
    # 'global', 'function' and 'catch' scopes

    def _buildScopes(self):
        scopes = []
        self.globalScope = Scope(self.root, self)
        scopes.append((self.root, self.globalScope))

        for node in treeutil.nodeIterator(self.root, ["function", "catch"]):
            scope = Scope(node, self)
            scopes.append((node, scope))

        return scopes


    ##
    # Just trigger computation of variable uses in all known scopes

    def _computeVariableUses(self):
        for scope in self.iterScopes():
            scope.computeVariableUses()


    ##
    # If <functionNode> is the root of a scope, return the corresp. scope object
    #
    def getScope(self, functionNode):
        try:
            idx = map(itemgetter(0), self.scopes).index(functionNode)
        except ValueError:
            return None
        return self.scopes[idx][1]


    ##
    # Return the global scope

    def getGlobalScope(self):
        return self.globalScope


    ##
    # Generate the known scopes

    def iterScopes(self):
        return (x[1] for x in self.scopes)


    ##
    # Return the Scope.VariableDefinition() object of a variable name,
    # climbing up the scope chain as necessary

    def getVariableDefinition(self, variableName, scope):
        while True:
            definition = scope.getLocalDefinition(variableName)
            if definition is not None:
                return definition
            scope = scope.getParentScope()
            if scope is None:
                return None


