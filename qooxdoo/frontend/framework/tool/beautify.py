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
                    defStr = "this.%s = null;" % (varName)
                    defNode = treeutil.compileString(defStr);
                    print defNode.toXml()
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


def moveFunctions(node, target):
    if node.type == "function":
        return

    if node.type == "assignment":
        if node.hasChild("left") and node.hasChild("right"):
            keyChild = node.getChild("left").getFirstChild(False, True)
            assignChild = node.getChild("right").getFirstChild(False, True)

            name = None

            if keyChild and keyChild.type == "variable":
                nameChild = keyChild.getChild("identifier").getFollowingSibling(False, True)

                if nameChild and nameChild.type == "identifier":
                    name = nameChild.get("name")

                    if assignChild and assignChild.type == "function":
                        pairChild = treeutil.createPair(name, assignChild, node)
                        target.addChild(pairChild)

                        node.parent.removeChild(node)
                        return


    if node.hasChildren():
        for child in node.children:
            moveFunctions(child, target)


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
    # TODO
    paramsNode = fcnNode.getChild("params", False)
    print paramsNode.toXml()

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


def translatePrivateName(name):
    # member variable
    if name.startswith("m") and name[1].isupper():
        name = name[1].lower() + name[2:]

    # add double underscore (private)
    name = "__" + name

    return name


def beautify(fileName):
    restree = treegenerator.createSyntaxTree(tokenizer.parseFile(fileName))

    define = api.findQxDefine(restree)
    classData = treeutil.selectNode(define, "params/2")
    classMap = treeutil.mapNodeToMap(classData)

    constructor = classMap["construct"].getChild("function")
    constructorBody = constructor.getChild("body")
    scope =  buildScope(constructor)

    constructorDefs = scope[constructor]["variables"] + scope[constructor]["arguments"]
    print constructorDefs
    print scope

    renameDefinitions(constructorBody, constructorDefs)

    print "-------------------------------------"
    print constructorBody.toXml()
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

    moveFunctions(constructorBody, members)

    print "-------------------------------------"
    print members.toXml()
    print "-------------------------------------"

    print restree.toJavascript()

    print translatePrivateName("mFunc")
    print translatePrivateName("children")
    print translatePrivateName("MailUtil")

def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) != 2:
        return

    beautify(argv[1])

if __name__ == "__main__":
    sys.exit(main())
