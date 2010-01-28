from ecmascript.frontend import treeutil

class Scope(object):
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
            treeutil.getFunctionName(self.node),
            arguments, variables, uses
        )


    def computeVariableUses(self):
        # find all nodes where a variable is referenced/used (rather than
        # declared) in this scope
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
                    #name = child.getChild("identifier").get("name")
                    identifier = child.getChild("identifier")
                    name       = identifier.get("name")
                    arguments.append(VariableDefinition(name, identifier, True, self))

        return arguments


    def _getExceptionVariables(self):
        identifier = treeutil.selectNode(self.node, "expression/variable/identifier")
        return [VariableDefinition(identifier.get("name",None), identifier, False, self)]


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
            if name in variables:
                variables[name].addDecl(node)
            else:
                variables[name] = VariableDefinition(name, node, False, self)

        return variables.values()


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


    @staticmethod
    def usedVariablesIterator(node):
        # generate all "identifier" nodes down from this one
        # which are bare identifiers (as in "var foo;" yielding "foo") or head
        # a chain of identifiers (as in "tree.selection.Manager", yielding
        # "tree")

        # chainTypes:
        # these are not all types that can show up in a chained expression,
        # but the ones you come across when going from an identifier node
        # upwards in the tree
        chainTypes = set([
            "identifier",
            "accessor",
            "left", "right",
            "call", "operand",
            "variable",
            ])

        def findChainRoot(node):
            # find the root node for a chained expression like a.b().c()[0].d()
            current = node

            while current.hasParent() and current.parent.type in chainTypes:
                current = current.parent

            return current  # this must be the chain root

        def findLeftmostIdentifier(node):
            # find the leftmost child, assumed to be an identifier
            child = node

            while child.hasChildren():
                c = child.getFirstChild(mandatory=False, ignoreComments=True)
                if c:
                    child = c
                else:
                    break
            #assert child.type == "identifier"

            return child

        def checkFirstChild(node):
            # check if the given identifier is the first in a chained expression "a.b.c().d[]"
            chainRoot = findChainRoot(node)
            leftmostIdentifier = findLeftmostIdentifier(chainRoot)

            # compare to current node
            if leftmostIdentifier == node:
                return True
            else:
                return False


        # - main ---------------------------------------------------------------

        # -- Switch on node context

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
        if node.hasChildren():
            for child in node.children:
                for (name, use) in Scope.usedVariablesIterator(child):
                    yield (name, use)


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


