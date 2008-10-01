from ecmascript.frontend import treeutil

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
            treeutil.getFunctionName(self.node),
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

        # treat variables used in for-in loops as used variables
        if (
            node.type == "first" and
            node.parent.type == "operation" and
            node.parent.get("operator") == "IN"
        ):
            use = treeutil.selectNode(node, "definitionList/definition")
            if use:
                name = use.get("identifier", False)
                yield (name, node)
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


