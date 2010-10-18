from ecmascript.frontend import treeutil
from ecmascript.frontend.Scope import Scope, VariableDefinition, VariableUse 

class Script(object):
    def __init__(self, rootNode, filename=""):
        self.root = rootNode
        self.filename = filename
        scopes = self._buildScopes()
        self.scopes = scopes[0]
        self.scopetuples = scopes[1]
        self._computeVariableUses()

    def _buildScopes(self):
        scopes = {}
        scopetuples = []
        self.globalScope = Scope(self.root, self)
        scopes[self.root] = self.globalScope

        for node in treeutil.nodeIterator(self.root, ["function", "catch"]):
            scope = Scope(node, self)
            #scopes[node] = scope
            scopetuples.append((node, scope))

        scopes = dict(scopetuples)
        return scopes, scopetuples

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

    def iterScopes1(self):
        for scope in self.scopes.itervalues():
            yield scope

    def iterScopes(self):
        return (x[1] for x in self.scopetuples)

    def getVariableDefinition(self, variableName, scope):
        while True:
            definition = scope.getLocalDefinition(variableName)
            if definition is not None:
                return definition
            scope = scope.getParentScope()
            if scope is None:
                return None


