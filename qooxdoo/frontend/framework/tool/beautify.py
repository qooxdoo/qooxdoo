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


def declaredVariables(node):
    if node.type == "function":
        return

    if node.hasChildren():
        for child in node.children:

            if child.type == "definitionList":
                for definition in child.children:
                    if definition.type == "definition":
                        yield definition.get("identifier")

            for var in declaredVariables(child):
                yield var


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

    if node.type == "definitionList":
        if node.hasChildren():
            for child in node.children:
                pass

def beautify(fileName):
    restree = treegenerator.createSyntaxTree(tokenizer.parseFile(fileName))

    #print restree.toXml()
    define = api.findQxDefine(restree)
    #print define.toXml()

    classMap = treeutil.mapNodeToMap(treeutil.selectNode(define, "params/2"))
    constructorBody = treeutil.selectNode(classMap["construct"], "function/body")
    constructorParams = treeutil.selectNode(classMap["construct"], "function/params")

    print constructorBody.toXml()
    #getDeclaredVariables(constructorBody)
    variables = []
    for var in declaredVariables(constructorBody):
        variables.append(var)

    renameDefinitions(constructorBody, variables)

    if not classMap.has_key("members"):
        keyvalue = tree.Node("keyvalue")
        keyvalue.set("key", "members")
        value = tree.Node("value")
        members = tree.Node("map")

    else:
        members = classMap["members"]

    #moveFunctions(constructorBody, members)

    print restree.toJavascript()

def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) != 2:
        return

    beautify(argv[1])

if __name__ == "__main__":
    sys.exit(main())
