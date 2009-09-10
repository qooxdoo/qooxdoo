#!/usr/bin/env python

import sys
import os
import logging

# reconfigure path to import modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "../../modules"))

import tree, compiler, comment






def getAssignment(elem):
    if elem.parent.type == "right" and elem.parent.parent.type == "assignment":
        return elem.parent.parent

    return None


def getName(elem):
    # find last identifier
    last = elem.getLastChild(False, True)

    if last.type == "identifier":
        return last.get("name")


def getMode(var, classname):
    # find last identifier
    last = var.getLastChild(False, True)
    prev = last.getPreviousSibling(False, True)

    if not prev:
        return None

    if prev.type == "identifier":
        mode = prev.get("name")

        if mode == "Proto":
            return "members"
        elif mode == "Clazz":
            return "statics"

    combined = []
    length = var.getChildrenLength(True)
    pos = length - 1
    for iden in var.children:
        if iden.type == "identifier":
            combined.append(iden.get("name"))

            # if variable starts with the classname and has one unique identifier afterwards
            if ".".join(combined) == classname and pos == 1:
                return "statics"

            pos -= 1

    return None


def getNameOfAssignment(elem):
    name = None

    if elem.hasChild("left"):
        left = elem.getChild("left")

        if left.hasChild("variable"):
            name = getName(left.getChild("variable"))

    return name


def getModeOfAssignment(elem, classname):
    mode = None

    if elem.hasChild("left"):
        left = elem.getChild("left")

        if left.hasChild("variable"):
            var = left.getChild("variable")
            mode = getMode(var, classname)

    return mode


def getAndRemovePropertyName(definition):
    for keyValue in definition.children:
        if keyValue.type == "keyvalue" and keyValue.get("key") == "name":
            name = keyValue.getChild("value").getChild("constant").get("value")
            keyValue.parent.removeChild(keyValue)
            return name

    logging.warn("  * Could not extract property name!")
    return None


def replaceMapKey(definition, searchKey, replaceKey):
    for keyValue in definition.children:
        if keyValue.type == "keyvalue" and keyValue.get("key") == searchKey:
            keyValue.set("key", replaceKey)
            return

    logging.warn("  * Could not replace key %s with %s" % (searchKey, replaceKey))



def createPair(key, value, commentParent=None):
    par = tree.Node("keyvalue")
    sub = tree.Node("value")

    par.set("key", key)
    par.addChild(sub)
    sub.addChild(value)

    if commentParent and commentParent.hasChild("commentsBefore"):
        par.addChild(commentParent.getChild("commentsBefore"))

    return par


def patch(id, node):
    if not node.hasChildren():
        return False

    classDefine, className, classMap, settingsMap, variantsMap, propertiesMap, membersMap, staticsMap = createClassDefine(id)
    errorCounter = 0
    pos = 0

    while node.hasChildren() and pos < len(node.children):
        child = node.children[pos]
        breakBefore = child.get("breakBefore", False)
        if breakBefore == None:
            breakBefore = False

        pos += 1

        # Add instance and static methods
        if child.type == "assignment":
            if child.hasChild("right"):
                right = child.getChild("right")
                elem = right.getFirstChild(True, True)

                name = getNameOfAssignment(child)
                mode = getModeOfAssignment(child, id)

                if mode in [ "members", "statics" ]:
                    if mode == "members":
                        pair = createPair(name, elem, child)

                        if breakBefore:
                            pair.set("breakBefore", True)

                        membersMap.addChild(pair)

                    elif mode == "statics":
                        # Special Handling of old singleton definition
                        if name == "getInstance":
                            pair = createPair("type", createConstant("string", "singleton"))
                            #pair.addChild(createBlockComment("type"))

                            if breakBefore:
                                pair.set("breakBefore", True)

                            classMap.addChild(pair, 0)

                        else:
                            pair = createPair(name, elem, child)

                            if breakBefore:
                                pair.set("breakBefore", True)

                            staticsMap.addChild(pair)

                    node.removeChild(child)
                    pos -= 1

        elif child.type == "call":
            oper = child.getChild("operand")
            var = oper.getChild("variable", False)

            if var:
                lastIdentifier = var.getLastChild(False, True)
                if lastIdentifier.type == "identifier":
                    name = lastIdentifier.get("name")
                    params = child.getChild("params")

                    if name in [ "addProperty", "changeProperty", "addCachedProperty", "addFastProperty", "addPropertyGroup" ]:
                        definition = params.getFirstChild(False, True)

                        if definition.type == "map":
                            if lastIdentifier.get("name") == "addFastProperty":
                                definition.addChild(createPair("_fast", createConstant("boolean", "true")), 0)
                            elif lastIdentifier.get("name") == "addCachedProperty":
                                definition.addChild(createPair("_cached", createConstant("boolean", "true")), 0)
                            elif lastIdentifier.get("name") == "addProperty" or lastIdentifier.get("name") == "changeProperty":
                                definition.addChild(createPair("_legacy", createConstant("boolean", "true")), 0)
                            elif lastIdentifier.get("name") == "addPropertyGroup":
                                replaceMapKey(definition, "members", "group")

                            name = getAndRemovePropertyName(definition)
                            pair = createPair(name, definition, child)

                            if breakBefore:
                                pair.set("breakBefore", True)

                            propertiesMap.addChild(pair)

                            node.removeChild(child)
                            pos -= 1

                    elif name == "setDefault":
                        nameNode = params.getChildByPosition(0, True)
                        valueNode = params.getChildByPosition(1, True)

                        name = nameNode.get("value")

                        pair = createPair(name, valueNode, child)

                        if breakBefore:
                            pair.set("breakBefore", True)

                        settingsMap.addChild(pair)

                        node.removeChild(child)
                        pos -= 1

                    elif name == "defineClass":
                        if params.getFirstChild(False, True).get("value") != id:
                            logging.warn("    - The class seems to have a wrong definition!")

                        # 3 params = name, superclass, constructor
                        # 2 params = name, map
                        # 1 param = name

                        # Move class comment
                        if child.hasChild("commentsBefore"):
                            classDefine.addChild(child.getChild("commentsBefore"))

                        childrenLength = params.getChildrenLength(True)

                        if childrenLength == 1:
                            node.removeChild(child)
                            pos -= 1

                        elif childrenLength == 2:
                            statics_new = params.getChildByPosition(1, True, True)

                            while statics_new.hasChildren():
                                staticsMap.addChild(statics_new.getFirstChild())

                            node.removeChild(child)
                            pos -= 1

                        elif childrenLength == 3:
                            ext = params.getChildByPosition(1, True, True)
                            construct = params.getChildByPosition(2, True, True)

                            extendPair = createPair("extend", ext)
                            constructPair = createPair("construct", construct)

                            # extendPair.addChild(createBlockComment("superclass"))
                            constructPair.addChild(createBlockComment("constructor"))

                            classMap.addChild(extendPair, 0)
                            classMap.addChild(constructPair, 1)

                            node.removeChild(child)
                            pos -= 1

                    elif name == "define":
                        prev = lastIdentifier.getPreviousSibling(False, True)

                        if prev.type == "identifier":
                            if prev.get("name") in ["Class", "Mixin", "Interface", "Theme", "Locale"]:
                                logging.debug("      - Class is already up-to-date.")
                                return False

                            elif prev.get("name") == "Setting":
                                nameNode = params.getChildByPosition(0, True)
                                valueNode = params.getChildByPosition(1, True)

                                name = nameNode.get("value")

                                pair = createPair(name, valueNode, child)
                                pair.set("quote", "doublequotes")

                                if breakBefore:
                                    pair.set("breakBefore", True)

                                settingsMap.addChild(pair)

                                node.removeChild(child)
                                pos -= 1

                            elif prev.get("name") == "Variant":
                                nameNode = params.getChildByPosition(0, True)
                                allowedNode = params.getChildByPosition(1, True)
                                defaultNode = params.getChildByPosition(2, True)

                                name = nameNode.get("value")

                                variantDef = tree.Node("map")
                                variantDef.addChild(createPair("allowedValues", allowedNode))
                                variantDef.addChild(createPair("defaultValue", defaultNode))

                                pair = createPair(name, variantDef, child)
                                pair.set("quote", "doublequotes")

                                if breakBefore:
                                    pair.set("breakBefore", True)

                                variantsMap.addChild(pair)

                                node.removeChild(child)
                                pos -= 1

        # Post-Check
        if child.parent == node:
            logging.warn("      - Could not move element %s at line %s" % (child.type, child.get("line")))
            errorCounter += 1


    # Remove empty maps
    if settingsMap.getChildrenLength() == 0:
        keyvalue = settingsMap.parent.parent
        classMap.removeChild(keyvalue)

    if variantsMap.getChildrenLength() == 0:
        keyvalue = variantsMap.parent.parent
        classMap.removeChild(keyvalue)

    if propertiesMap.getChildrenLength() == 0:
        keyvalue = propertiesMap.parent.parent
        classMap.removeChild(keyvalue)

    if membersMap.getChildrenLength() == 0:
        keyvalue = membersMap.parent.parent
        classMap.removeChild(keyvalue)

    if staticsMap.getChildrenLength() == 0:
        keyvalue = staticsMap.parent.parent
        classMap.removeChild(keyvalue)

    # Add new class definition
    node.addChild(classDefine, 0)




    if errorCounter > 0:
        logging.info("      - Could not convert %s elements." % errorCounter)

    # Debug
    #print compiler.compile(node)
    #print tree.nodeToXmlString(node)

    # Return Modification
    return True


def createConstant(type, value):
    constant = tree.Node("constant")
    constant.set("constantType", type)
    constant.set("value", value)

    if type == "string":
        constant.set("detail", "doublequotes")

    return constant



def createVariable(l):
    var = tree.Node("variable")

    for name in l:
        iden = tree.Node("identifier")
        iden.set("name", name)
        var.addChild(iden)

    return var

def createClassDefineCore(id):
    call = tree.Node("call")
    oper = tree.Node("operand")
    para = tree.Node("params")
    con = createConstant("string", id)
    args = tree.Node("map")

    call.addChild(oper)
    call.addChild(para)

    oper.addChild(createVariable(["qx", "Class", "define"]))

    para.addChild(con)
    para.addChild(args)

    return call, con, args


def createClassDefine(id):
    classDefine, className, classMap = createClassDefineCore(id)

    settingsMap = tree.Node("map")
    settingsPair = createPair("settings", settingsMap)

    variantsMap = tree.Node("map")
    variantsPair = createPair("variants", variantsMap)

    propertiesMap = tree.Node("map")
    propertiesPair = createPair("properties", propertiesMap)

    membersMap = tree.Node("map")
    membersPair = createPair("members", membersMap)

    staticsMap = tree.Node("map")
    staticsPair = createPair("statics", staticsMap)

    propertiesPair.addChild(createBlockComment("properties"))
    membersPair.addChild(createBlockComment("members"))
    staticsPair.addChild(createBlockComment("statics"))
    settingsPair.addChild(createBlockComment("settings"))
    variantsPair.addChild(createBlockComment("variants"))

    classMap.addChild(staticsPair)
    classMap.addChild(propertiesPair)
    classMap.addChild(membersPair)
    classMap.addChild(settingsPair)
    classMap.addChild(variantsPair)

    return classDefine, className, classMap, settingsMap, variantsMap, propertiesMap, membersMap, staticsMap


def createBlockComment(txt):
    l = "*****************************************************************************"

    s = ""
    s += "/*\n"
    s += "%s\n" % l
    s += "   %s\n" % txt.upper()
    s += "%s\n" % l
    s += "*/"

    bef = tree.Node("commentsBefore")
    com = tree.Node("comment")

    bef.addChild(com)

    com.set("multiline", True)
    com.set("connection", "before")
    com.set("text", s)
    com.set("detail", comment.getFormat(s))

    return bef


