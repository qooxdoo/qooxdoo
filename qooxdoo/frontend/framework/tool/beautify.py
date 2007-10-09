#!/usr/bin/env python
# encoding: utf-8

import re
import os
import sys
import getopt

from modules import treegenerator
from modules import tokenizer
from modules import treeutil
from modules import tree
from modules import api


def declaredVariablesIterator(node):
    if node.type == "function":
        return

    if node.hasChildren():
        for child in node.children:

            if child.type == "definitionList":
                for definition in child.children:
                    if definition.type == "definition":
                        yield definition.get("identifier")

            for var in declaredVariablesIterator(child):
                yield var


def getDeclaredVariables(node):
    variables = []
    for var in declaredVariablesIterator(node):
        variables.append(var)
    return variables


def renameDefinitions(node, variables):
    if node.type == "function":
        return

    if node.type == "definitionList":
        defNodes = []
        for definition in node.children:
            if definition.type == "definition":

                assignment = definition.getChild("assignment", False)
                if assignment is not None:
                    renameDefinitions(assignment, variables)

                varName = definition.get("identifier")
                if varName in variables:
                    defStr = "this.%s = null;" % (translatePrivateName(varName))
                    defNode = treeutil.compileString(defStr);
                    if assignment is not None and assignment.hasChildren():
                        defNode.getChild("right").replaceChild(defNode.getChild("right").getFirstChild(), assignment.getFirstChild());
                    defNodes.append(defNode)

        parent = node.parent
        defIndex = parent.getChildPosition(node)
        for defNode in defNodes:
            parent.addChild(defNode, defIndex)
            defIndex += 1

        if len(defNodes) > 0 and node.hasChild("commentsBefore"):
            defNodes[0].addChild(node.getChild("commentsBefore"), 0)

        parent.removeChild(node)
        return

    if node.hasChildren():
        for child in node.children:
            renameDefinitions(child, variables)


def renameIdentifier(node, renameVariables, scopes, constructor):
    idenName = node.get("name", False)

    if idenName != None and idenName in renameVariables:

        parentFcn = getParentFunction(node)
        decl = getVariableDeclaration(parentFcn, scopes, idenName)

        if decl != None and (decl == constructor):
            if idenName == "self":
                node.set("name", "this")
            else:
                replName = translatePrivateName(idenName)

                parent = node.parent
                thisNode = tree.Node("identifier")
                thisNode.set("name", "this")
                parent.addChild(thisNode, 0)
                node.set("name", replName)


def updateFunction(node, renameVariables, scopes, constructor):

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

            if not (varParent.type == "right" and varParent.parent.type == "accessor"):
                isFirstChild = node.parent.getFirstChild(True, True) == node

        elif node.parent.type == "identifier" and node.parent.parent.type == "accessor":
            isVariableMember = True
            accessor = node.parent.parent
            isFirstChild = accessor.parent.getFirstChild(True, True) == accessor

        # inside a variable parent only respect the first member
        if not isVariableMember or isFirstChild:
            renameIdentifier(node, renameVariables, scopes, constructor)


    # Iterate over children
    if node.hasChildren():
        for child in node.children:
            updateFunction(child, renameVariables, scopes, constructor)


def renameUses(constructorNode, renameVariables, scopes):
    updateFunction(constructorNode, renameVariables, scopes, constructorNode)



def moveFunctions(node, target, removeList):
    if node.type == "function":
        return

    if node.type == "assignment":
        if node.hasChild("left") and node.hasChild("right"):
            keyChild = node.getChild("left").getFirstChild(False, True)
            assignChild = node.getChild("right").getFirstChild(False, True)

            name = None

            if keyChild and keyChild.type == "variable":
                nameChild = keyChild.getLastChild(False)

                if nameChild and nameChild.type == "identifier":
                    name = nameChild.get("name")

                    if assignChild and assignChild.type == "function":
                        pairChild = treeutil.createPair(name, assignChild, node)
                        target.addChild(pairChild)

                        removeList.append(node)
                        return


    if node.hasChildren():
        for child in node.children:
            moveFunctions(child, target, removeList)


def getParentFunction(fcnNode):
    node = fcnNode
    while node.hasParent():
        node = node.parent
        if node.type == "function":
            return node
    return None


def functionIterator(node):
    if node.type == "function":
        yield node

    if node.hasChildren():
        for child in node.children:
            for fcn in functionIterator(child):
                yield fcn


def getArguments(fcnNode):
    paramsNode = fcnNode.getChild("params", False)

    arguments = []

    if paramsNode.hasChildren():
        for child in paramsNode.children:
            if child.type == "variable":
                arguments.append(child.getChild("identifier").get("name"))


    return arguments


def buildScope(root):
    scopes = {}
    for fcn in functionIterator(root):
        parentFcn = getParentFunction(fcn)
        scopes[fcn] = {
            "variables" : getDeclaredVariables(fcn.getChild("body")),
            "parentFcn" : parentFcn,
            "arguments" : getArguments(fcn)
        }
    return scopes


def getVariableDeclaration(fcn, scopes, variable):
    while True:
        scope = scopes[fcn]
        if variable in scope["arguments"] or variable in scope["variables"]:
            return fcn
        fcn = scope["parentFcn"]
        if fcn is None:
            return None


def translatePrivateName(name):
    # class alias
    if name[0].isupper():
        return name

    # member variable
    if name.startswith("m") and name[1].isupper():
        name = name[1].lower() + name[2:]

    # add double underscore (private)
    name = "__" + name

    return name


def fixSuperCalls(node):
    if node.type == "assignment" and node.hasChild("left") and node.hasChild("right"):
        # contains identifiers: this + superName
        left = node.getChild("left").getFirstChild(False, True)

        # contains identifiers: this + name
        right = node.getChild("right").getFirstChild(False, True)

        leftOrig = ""
        leftName = ""
        rightMatch = False

        if left.type == "variable" and left.getChildrenLength(True) == 2:
            first = left.getFirstChild(True, True)
            last = left.getLastChild(True, True)

            if first.get("name") == "this" and last.get("name").startswith("__super"):
                leftOrig = last.get("name")
                leftName = last.get("name")[7].lower() + last.get("name")[8:]


        if right.type == "variable" and left.getChildrenLength(True) == 2:
            first = right.getFirstChild(True, True)
            last = right.getLastChild(True, True)

            if first.get("name") == "this" and last.get("name") == leftName:
               rightMatch = True


        if rightMatch:
            replNode = treeutil.compileString("this." + leftOrig + " = this.self(arguments).superclass.prototype." + leftName)
            node.parent.replaceChild(node, replNode)


    elif node.hasChildren():
        for child in node.children:
            fixSuperCalls(child)


def beautify(fileName):
    restree = treegenerator.createSyntaxTree(tokenizer.parseFile(fileName))

    define = api.findQxDefine(restree)
    classData = treeutil.selectNode(define, "params/2")
    classMap = treeutil.mapNodeToMap(classData)

    constructor = classMap["construct"].getChild("function")
    constructorBody = constructor.getChild("body")
    scope =  buildScope(constructor)

    constructorDefs = scope[constructor]["variables"]
    print constructorDefs
    print scope

    # only in constructor
    renameDefinitions(constructorBody, constructorDefs)
    renameUses(constructor, constructorDefs, scope)
    #return

    print "-------------------------------------"
    #print constructorBody.toXml()
    print "-------------------------------------"

    if not classMap.has_key("members"):
        keyvalue = tree.Node("keyvalue")
        keyvalue.set("key", "members")
        value = tree.Node("value")
        keyvalue.addChild(value)
        members = tree.Node("map")
        value.addChild(members)
        classData.addChild(keyvalue)

    else:
        members = classMap["members"].getChild("map")

    removeList = []
    moveFunctions(constructorBody, members, removeList)
    for entry in removeList:
        entry.parent.removeChild(entry)


    fixSuperCalls(constructorBody)

    #print "-------------------------------------"
    #print members.toXml()
    #print "-------------------------------------"

    print restree.toJavascript()


def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) != 2:
        return

    beautify(argv[1])

if __name__ == "__main__":
    sys.exit(main())
