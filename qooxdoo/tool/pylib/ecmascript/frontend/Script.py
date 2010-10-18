from operator import itemgetter
from ecmascript.frontend import treeutil
from ecmascript.frontend.Scope import Scope, VariableDefinition, VariableUse 

class Script(object):
    def __init__(self, rootNode, filename=""):
        self.root = rootNode
        self.filename = filename
        self.scopes = self._buildScopes()  # tuple list [(Node(), Scope())], to preserve order
        self._computeVariableUses()

    def _buildScopes(self):
        scopes = []
        self.globalScope = Scope(self.root, self)
        scopes.append((self.root, self.globalScope))

        for node in treeutil.nodeIterator(self.root, ["function", "catch"]):
            scope = Scope(node, self)
            scopes.append((node, scope))

        return scopes

    def _computeVariableUses(self):
        for scope in self.iterScopes():
            scope.computeVariableUses()

    def getScope(self, functionNode):
        try:
            idx = map(itemgetter(0), self.scopes).index(functionNode)
        except ValueError:
            return None
        return self.scopes[idx][1]

    def getGlobalScope(self):
        return self.globalScope

    def iterScopes(self):
        return (x[1] for x in self.scopes)

    def getVariableDefinition(self, variableName, scope):
        while True:
            definition = scope.getLocalDefinition(variableName)
            if definition is not None:
                return definition
            scope = scope.getParentScope()
            if scope is None:
                return None


