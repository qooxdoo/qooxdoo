from ecmascript.frontend import treeutil
from ecmascript.frontend.Scope import Scope, VariableDefinition, VariableUse 

class Script(object):
    def __init__(self, rootNode, filename=""):
        self.root = rootNode
        self.filename = filename
        self.scopes = self._buildScopes()
        self._computeVariableUses()

    def _buildScopes(self):
        scopes = {}
        self.globalScope = Scope(self.root, self)
        scopes[self.root] = self.globalScope

        for node in treeutil.nodeIterator(self.root, ["function", "catch"]):
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


