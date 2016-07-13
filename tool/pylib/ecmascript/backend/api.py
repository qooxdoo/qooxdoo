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
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

##
# MODULE DESCRIPTIOIN
#
#  api.py -- Generates a tree of documentation nodes from a JavaScript synatx
#            tree, walking the syntax tree and picking out ecmascript.frontend.
#            comment nodes; uses ecmascript.frontend.tree.Node for the tree;
#            creates a suitable tree structure to hold the individual JSDoc
#            comments (which are -unfortunately- formatted in e.f.comment into
#            HTML).
##

import sys, os, re, string, copy
from ecmascript.frontend import tree, Comment, lang
from ecmascript.frontend import treeutil
from ecmascript.frontend import treegenerator
from ecmascript.frontend.treegenerator import PackerFlags as pp
from ecmascript.transform.optimizer import variantoptimizer  # ugly here
from generator import Context



########################################################################################
#
#  MAIN
#
########################################################################################

class DocException (Exception):
    def __init__ (self, msg, syntaxItem):
        Exception.__init__(self, msg)
        self.node = syntaxItem


def createDoc(syntaxTree, docTree = None):
    if not docTree:
        docTree = tree.Node("doctree")
    attachMap = {} # {"targetclass#targetmethod" : method_docnode}

    defineNode = treeutil.findQxDefine(syntaxTree)
    if defineNode != None:
        variant = treeutil.selectNode(defineNode, "operand").toJS(pp).split(".")[1].lower()  # 'class' in 'qx.Class.define'
        handleClassDefinition(docTree, defineNode, variant)
        attachMap = findAttachMethods(docTree)

    ret = (docTree, False, attachMap)

    return ret


def createPackageDoc(text, packageName, docTree = None):
    if not docTree:
        docTree = tree.Node("doctree")

    package = getPackageNode(docTree, packageName)

    commentAttributes = Comment.Comment(text).parse(want_errors=True)

    # check for JSDoc issues (no filtering)
    for attrib in commentAttributes:
        if 'error' in attrib:
            lineno = attrib['line'] # assume the comment text is the only contents of the package odc
            msg = "%s (%s): %s" % (packageName, lineno, attrib['message'])
            msg += (": %s" % attrib['text']) if 'text' in attrib and attrib['text'] else ''
            Context.console.warn(msg)

    # Read description, see attributes
    for attrib in commentAttributes:
        # Add description
        if attrib["category"] == "description":
            package = addChildIf(package, *(handleJSDocDecsription(attrib)))

        elif attrib["category"] == "see":
            package = addChildIf(package, *(handleJSDocSee(attrib)))

    return docTree


def handleClassDefinition(docTree, callNode, variant):
    params = callNode.getChild("arguments")
    className = params.children[0].get("value")

    if len(params.children) > 1:
        classMap = params.children[1]
    else:
        classMap = {}

    cls_cmnt_node = treeutil.findLeftmostChild(callNode.getChild("operand"))
    commentAttributes = Comment.parseNode(cls_cmnt_node)[-1]

    classNode = classNodeFromDocTree(docTree, className, commentAttributes)
    if variant == "class":
        classNode.set("type", "class")
        type = treeutil.selectNode(params, "2/keyvalue[@key='type']/value/constant/@value")
        if type == "singleton":
            classNode.set("isSingleton", True)
        elif type == "abstract":
            classNode.set("isAbstract", True)

    else:
        classNode.set("type", variant)

    handleDeprecated(classNode, commentAttributes)
    handleAccess(classNode, commentAttributes)
    handleChildControls(callNode, classNode, className, commentAttributes)

    try:
        children = classMap.children
    except AttributeError:
        return

    for keyvalueItem in children:

        if keyvalueItem.type != "keyvalue":
            continue

        key = keyvalueItem.get("key")

        valueItem = keyvalueItem.getChild("value").getFirstChild()

        # print "KEY: %s = %s" % (key, valueItem.type)

        if key == "extend":
            if variant in ("class", "bootstrap"):
                handleClassExtend(valueItem, classNode, docTree, className)

            elif variant == "interface":
                handleInterfaceExtend(valueItem, classNode, docTree, className)

        elif key == "include":
            handleMixins(valueItem, classNode, docTree, className)

        elif key == "implement":
            handleInterfaces(valueItem, classNode, docTree)

        elif key == "construct":
            handleConstructor(valueItem, classNode)

        elif key == "statics":
            handleStatics(valueItem, classNode)

        elif key == "properties":
            handleProperties(valueItem, classNode)

        elif key == "members":
            handleMembers(valueItem, classNode)

        elif key == "events":
            handleEvents(valueItem, classNode)

    handleSingleton(classNode, docTree)

    if not classNode.hasChild("desc"):
        addError(classNode, "Class documentation is missing.", callNode)



def handleClassExtend(valueItem, classNode, docTree, className):
    superClassName = (treeutil.assembleVariable(valueItem))[0]
    superClassNode = classNodeFromDocTree(docTree, superClassName)
    childClasses = superClassNode.get("childClasses", False)

    if childClasses:
        childClasses += "," + className
    else:
        childClasses = className

    superClassNode.set("childClasses", childClasses)
    classNode.set("superClass", superClassName)


def handleInterfaceExtend(valueItem, classNode, docTree, className):
    superInterfaceNames = treeutil.variableOrArrayNodeToArray(valueItem)

    for superInterface in superInterfaceNames:
        superInterfaceNode = classNodeFromDocTree(docTree, superInterface)
        childInterfaces = superInterfaceNode.get("childClasses", False)

        if childInterfaces:
            childInterfaces += "," + className
        else:
            childInterfaces = className

        superInterfaceNode.set("childClasses", childInterfaces)

        node = tree.Node("class")
        node.set("type", "interface")
        node.set("name", superInterface)
        packageName = superInterface[:superInterface.rindex(".")]
        node.set("packageName", packageName)
        classNode.addListChild("superInterfaces", node)
        #superInterfaceNode.type = "interface"
        #classNode.addListChild("superInterfaces", superInterfaceNode)

        # example for string-valued attributes["superInterfaces"] property

        #superInterfaces = classNode.get("superInterfaces", False)
        #if superInterfaces:
        #    superInterfaces += "," + superInterface
        #else:
        #    superInterfaces = superInterface
        #classNode.set("superInterfaces", superInterfaces)

    return


def handleMixins(item, classNode, docTree, className):
    try:
        # direct symbol or list of symbols
        mixins = treeutil.variableOrArrayNodeToArray(item)
    except tree.NodeAccessException:
        try:
            # call to qx.core.Environment.filter
            filterMap = variantoptimizer.getFilterMap(item, classNode.get("fullName"))
            assert filterMap
            includeSymbols = []
            for key, node in filterMap.items():
                # to select the current environment variant, add something like:
                #  if key not in variants or (key in variants and bool(variants[key]):

                # map value has to be variable
                variable =  node.children[0]
                assert variable.isVar()
                symbol, isComplete = treeutil.assembleVariable(variable)
                assert isComplete
                includeSymbols.append(symbol)
            mixins = includeSymbols
        except AssertionError:
            Context.console.warn("Illegal include definition in " + classNode.get("fullName"))
            return
    for mixin in mixins:
        mixinNode = classNodeFromDocTree(docTree, mixin)
        includer = mixinNode.get("includer", False)
        if includer:
            includer += "," + className
        else:
            includer = className
        mixinNode.set("includer", includer)

    classNode.set("mixins", ",".join(mixins))


def handleSingleton(classNode, docTree):
    if classNode.get("isSingleton", False) == True:
        className = classNode.get("fullName")
        functionCode = ("/**\n"
            "* Returns a singleton instance of this class. On the first call the class\n"
            "* is instantiated by calling the constructor with no arguments. All following\n"
            "* calls will return this instance.\n"
            "*\n"
            '* This method has been added by setting the "type" key in the class definition\n'
            '* ({@link qx.Class#define}) to "singleton".\n'
            "*\n"
            "* @return {%s} The singleton instance of this class.\n"
            "*/\n"
            "function() {}") % className

        node = treeutil.compileString(functionCode)
        commentAttributes = Comment.parseNode(node)[-1]
        docNode = handleFunction(node, "getInstance", commentAttributes, classNode)

        docNode.set("isStatic", True)
        classNode.addListChild("methods-static", docNode)


def handleInterfaces(item, classNode, docTree):
    className = classNode.get("fullName")
    try:
        interfaces = treeutil.variableOrArrayNodeToArray(item)
    except tree.NodeAccessException:
        Context.console.warn("")
        Context.console.warn("Illegal implement definition in " + classNode.get("fullName"))
        return

    for interface in interfaces:
        interfaceNode = classNodeFromDocTree(docTree, interface)
        impl = interfaceNode.get("implementations", False)
        if impl:
            impl += "," + className
        else:
            impl = className
        interfaceNode.set("implementations", impl)

    classNode.set("interfaces", ",".join(interfaces))


def handleConstructor(ctorItem, classNode):
    if ctorItem and ctorItem.type == "function":
        commentAttributes = Comment.parseNode(ctorItem.parent.parent)[-1]
        ctor = handleFunction(ctorItem, "ctor", commentAttributes, classNode, reportMissingDesc=False)
        ctor.set("isCtor", True)
        classNode.addListChild("constructor", ctor)


def handleStatics(item, classNode):
    for key, value in treeutil.mapNodeToMap(item).items():
        keyvalue = value.parent
        value = value.getFirstChild()

        commentAttributes = Comment.parseNode(keyvalue)[-1]

        # handle @signature
        if value.type != "function":
            for docItem in commentAttributes:
                if docItem["category"] == "signature":
                    js_string = 'function(' + ",".join(docItem['arguments']) + '){}'
                    value = treeutil.compileString(js_string)
                    #TODO: Warn if syntax error

        # Function
        if value.type == "function":
            node = handleFunction(value, key, commentAttributes, classNode)
            node.set("isStatic", True)
            if classNode.get("type", False) == "mixin":
                node.set("isMixin", True)

            classNode.addListChild("methods-static", node)


        # Constant
        elif not key[:2] == "$$":
            handleConstantDefinition(keyvalue, classNode)


def handleMembers(item, classNode):

    for key, value in treeutil.mapNodeToMap(item).items():
        keyvalue = value.parent
        value = value.getFirstChild()

        commentAttributes = Comment.parseNode(keyvalue)[-1]

        # handle @signature
        signatureError = None
        if value.type != "function":
            for docItem in commentAttributes:
                if docItem["category"] == "signature":
                    if "error" in docItem:
                        signatureError = "%s: %s" % (docItem["category"], docItem["message"])
                        value = treeutil.compileString('function(){}')
                        continue

                    js_string = 'function(' + ",".join(docItem['arguments']) + '){}'
                    value = treeutil.compileString(js_string)

        if value.type == "function":
            node = handleFunction(value, key, commentAttributes, classNode)
            if classNode.get("type", False) == "mixin":
                node.set("isMixin", True)
            if signatureError:
                addError(node, signatureError)

            classNode.addListChild("methods", node)


def generatePropertyMethods(propertyName, classNode, generatedMethods):

    if propertyName[:2] == "__":
        access = "__"
        name = propertyName[2:]
    elif propertyName[:1] == "_":
        access = "_"
        name = propertyName[1:]
    else:
        access = ""
        name = propertyName

    name = name[0].upper() + name[1:]

    propData = {
        access + "set" + name : ("/**\n"
            "* Sets the user value of the property <code>%s</code>.\n"
            "*\n"
            "* For further details take a look at the property definition: {@link #%s}.\n"
            "*\n"
            "* @param value {var} New value for property <code>%s</code>.\n"
            "* @return {var} The unmodified incoming value.\n"
            "*/\n"
            "function (value) {}; ") % (propertyName, propertyName, propertyName),

        access + "get" + name : ("/**\n"
            "* Returns the (computed) value of the property <code>%s</code>.\n"
            "*\n"
            "* For further details take a look at the property definition: {@link #%s}.\n"
            "*\n"
            "* @return {var} (Computed) value of <code>%s</code>.\n"
            "*/\n"
            "function () {}; ") % (propertyName, propertyName, propertyName),

        access + "reset" + name : ("/**\n"
            "* Resets the user value of the property <code>%s</code>.\n"
            "*\n"
            "* The computed value falls back to the next available value e.g. appearance, init or\n"
            "* inheritance value depeneding on the property configuration and value availability.\n"
            "*\n"
            "* For further details take a look at the property definition: {@link #%s}.\n"
            "*/\n"
            "function () {}; ") % (propertyName, propertyName),

        access + "init" + name : ("/**\n"
            "* Calls the apply method and dispatches the change event of the property <code>%s</code>\n"
            "* with the default value defined by the class developer. This function can\n"
            "* only be called from the constructor of a class.\n"
            "*\n"
            "* For further details take a look at the property definition: {@link #%s}.\n"
            "*\n"
            "* @protected\n"
            "* @param value {var} Initial value for property <code>%s</code>.\n"
            "* @return {var} the default value\n"
            "*/\n"
            "function (value) {}; ") % (propertyName, propertyName, propertyName),

        access + "toggle" + name : ("/**\n"
            "* Toggles the (computed) value of the boolean property <code>%s</code>.\n"
            "*\n"
            "* For further details take a look at the property definition: {@link #%s}.\n"
            "*\n"
            "* @return {Boolean} the new value\n"
            "*/\n"
            "function () {}; ") % (propertyName, propertyName),


        access + "is" + name : ("/**\n"
            "* Check whether the (computed) value of the boolean property <code>%s</code> equals <code>true</code>.\n"
            "*\n"
            "* For further details take a look at the property definition: {@link #%s}.\n"
            "*\n"
            "* @return {Boolean} Whether the property equals <code>true</code>.\n"
            "*/\n"
            "function () {}; ") % (propertyName, propertyName)
    }

    for funcName in generatedMethods:
        funcName = access + funcName + name
        functionCode = propData[funcName]
        node = treeutil.compileString(functionCode)
        node.getRoot().set('file', '|generated@api.py|')
        commentAttributes = Comment.parseNode(node)[-1]
        docNode = handleFunction(node, funcName, commentAttributes, classNode, False, False)
        docNode.remove("line")
        docNode.set("fromProperty", propertyName)
        classNode.addListChild("methods", docNode)


def handlePropertyDefinitionNew(propName, propDefinition, classNode):
    node = tree.Node("property")
    node.set("name", propName)

    if "init" in propDefinition:
        node.set("defaultValue", getValue(propDefinition["init"].getFirstChild()))

    if "nullable" in propDefinition:
        node.set("allowNull", propDefinition["nullable"].getChild("constant").get("value"))

    if "inheritable" in propDefinition:
        node.set("inheritable", propDefinition["inheritable"].getChild("constant").get("value"))

    if "themeable" in propDefinition:
        node.set("themeable", propDefinition["themeable"].getChild("constant").get("value"))

    if "refine" in propDefinition:
        refineValue = propDefinition["refine"].getChild("constant").get("value")
        if refineValue == "true":
            node.set("refine", "true")

    if "apply" in propDefinition:
        node.set("apply", propDefinition["apply"].getChild("constant").get("value"))

    if "event" in propDefinition:
        eventName = propDefinition["event"].getChild("constant").get("value")
        node.set("event", eventName)
        event = tree.Node("event")
        event.set("name", eventName)
        event.addChild(tree.Node("desc").set("text", "Fired on change of the property {@link #%s}." % propName))

        typesNode = tree.Node("types")
        event.addChild(typesNode)
        itemNode = tree.Node("entry")
        typesNode.addChild(itemNode)
        itemNode.set("type", "qx.event.type.Data")
        classNode.addListChild("events", event)

    if "check" in propDefinition:
        check = propDefinition["check"].getFirstChild()
        if check.type == "array":
            values = [getValue(arrayItem) for arrayItem in check.children]
            node.set("possibleValues", ",".join(values))
        elif check.type == "function":
            node.set("check", "Custom check function.")
        elif check.type == "constant":
            # this can mean: type name or check expression
            # test by parsing it
            check_value = check.get("value")
            check_tree = treegenerator.parse(check_value)
            if check_tree.children[0].isVar(): # tree is (statements (...))
                node.set("check", check_value)  # type name
            else:  # don't dare to be more specific
            #elif check_tree.type in ('operation', 'call'): # "value<=100", "qx.util.Validate.range(0,100)"
                node.set("check", "Custom check function.")  # that's good enough so the param type is set to 'var'
        else:
            addError(node, "Unknown property check value: '%s'" % check.type, propDefinition["check"])

    return node


def generateGroupPropertyMethod(propertyName, groupMembers, mode, classNode):
    if propertyName[:2] == "__":
        access = "__"
        functionName = propertyName[2:]
    elif propertyName[:1] == "_":
        access = "_"
        functionName = propertyName[1:]
    else:
        access = ""
        functionName = propertyName

    functionName = access + "set" + functionName[0].upper() + functionName[1:]

    functionTemplate = ("/**\n"
        "* Sets the values of the property group <code>%(name)s</code>.\n"
        "* %(modeDoc)s\n"
        "* For further details take a look at the property definition: {@link #%(name)s}.\n"
        "*\n"
        "%(params)s\n"
        "*/\n"
        "function (%(paramList)s) {}; ")

    paramsTemplate = " * @param %s {var} Sets the value of the property {@link #%s}."
    paramsDef = [paramsTemplate % (name, name) for name in groupMembers]

    if mode == "shorthand":
        modeDoc = "\n * This setter supports a shorthand mode compatible with the way margins and paddins are set in CSS.\n *"
    else:
        modeDoc = ""

    functionCode = functionTemplate % ({
        "name" : propertyName,
        "modeDoc" : modeDoc,
        "params" : "\n".join(paramsDef),
        "paramList" : ", ".join(groupMembers)
    })
    functionNode = treeutil.compileString(functionCode)
    commentAttributes = Comment.parseNode(functionNode)[-1]
    docNode = handleFunction(functionNode, functionName, commentAttributes, classNode)

    docNode.set("fromProperty", propertyName)
    classNode.addListChild("methods", docNode)


def handlePropertyGroup(propName, propDefinition, classNode):
    node = tree.Node("property")
    node.set("name", propName)

    group = propDefinition["group"].getFirstChild()
    groupMembers = [getValue(arrayItem) for arrayItem in group.children]

    node.set("group", ",".join(groupMembers));

    if "mode" in propDefinition:
        node.set("mode", propDefinition["mode"].getChild("constant").get("value"))

    if "themeable" in propDefinition:
        node.set("themeable", propDefinition["themeable"].getChild("constant").get("value"))

    return node


def handleProperties(item, classNode):
    for propName, value in treeutil.mapNodeToMap(item).items():
        keyvalue = value.parent
        value = value.getFirstChild()

        if value.type != "map":
            continue

        propDefinition = treeutil.mapNodeToMap(value)
        #print propName, propDefinition

        if "group" in propDefinition:
            node = handlePropertyGroup(propName, propDefinition, classNode)
            node.set("propertyType", "group")
            groupMembers = [member[1:-1] for member in node.get("group").split(",")]
            generateGroupPropertyMethod(propName, groupMembers, node.get("mode", False), classNode)
            generatePropertyMethods(propName, classNode, ["reset"])
        else:
            node = handlePropertyDefinitionNew(propName, propDefinition, classNode)
            node.set("propertyType", "new")
            if node.get("refine", False) != "true":
                generatePropertyMethods(propName, classNode, ["set", "get", "init", "reset"])
                if node.get("check", False) == "Boolean":
                    generatePropertyMethods(propName, classNode, ["toggle", "is"])


        if classNode.get("type", False) == "mixin":
            node.set("isMixin", True)

        commentAttributes = Comment.parseNode(keyvalue)[-1]

        for attrib in commentAttributes:
            addTypeInfo(node, attrib, item)

        handleDeprecated(node, commentAttributes)
        handleAccess(node, commentAttributes)

        if not node.hasChild("desc"):
            addError(node, "Documentation is missing.", item)

        classNode.addListChild("properties", node)





def handleEvents(item, classNode):
    for key, value_ in treeutil.mapNodeToMap(item).items():
        keyvalue = value_.parent
        value = value_.getFirstChild(True, True).toJavascript()
        value = string.strip(value, '\'"') # unquote result from .toJavascript; TODO: unnecessary with .toJS!?

        node = tree.Node("event")

        commentAttributes = Comment.parseNode(keyvalue)[-1]
        try:
            desc = commentAttributes[0]["text"]
        except (IndexError, KeyError):
            desc = None
            addError(node, "Documentation is missing.", item)

        if desc != None:
            node.addChild(tree.Node("desc").set("text", desc))

        node.set("name", key)

        typesNode = tree.Node("types")
        node.addChild(typesNode)
        itemNode = tree.Node("entry")
        typesNode.addChild(itemNode)
        itemNode.set("type", value)

        handleDeprecated(node, commentAttributes)
        handleAccess(node, commentAttributes)

        classNode.addListChild("events", node)


def handleDeprecated(docNode, commentAttributes):
    for docItem in commentAttributes:
        if docItem["category"] == "deprecated":
            deprecatedNode = tree.Node("deprecated")
            if "text" in docItem:
                descNode = tree.Node("desc").set("text", docItem["text"])
                deprecatedNode.addChild(descNode)
            docNode.addChild(deprecatedNode)


def handleAccess(docNode, commentAttributes):
    name = docNode.get("name")
    if name[:2] == "__":
        access = "private"
    elif name[:1] == "_":
        access = "protected"
    else:
        access = "public"

    for docItem in commentAttributes:
        if docItem["category"] == "internal":
            access = "internal"
            docNode.set("isInternal", True)
        elif docItem["category"] == "public":
            access = "public"
        elif docItem["category"] == "protected":
            access = "protected"
        elif docItem["category"] == "public":
            access = "public"

    if access != "public":
        docNode.set("access", access)


def handleChildControls(item, classNode, className, commentAttributes):
    for attrib in commentAttributes:
        if attrib["category"] == "childControl":
            if "error" in attrib:
                msg = "%s: %s" % (attrib["category"], attrib["message"])
                addError(classNode, msg, item)

            if not "name" in attrib:
                addError(classNode, "No name defined for child control.", item)
                return
            childControlName = attrib["name"]
            childControlNode = tree.Node("childControl")
            childControlNode.set("name", childControlName)

            if not "type" in attrib:
                addError(classNode, "No type defined for child control: '%s'." % childControlName, item)
            addTypeInfo(childControlNode, attrib, item)

            classNode.addListChild("childControls", childControlNode)


def handleConstantDefinition(item, classNode):
    if (item.type == "assignment"):
        # This is a "normal" constant definition
        leftItem = item.getFirstListChild("left")
        name = leftItem.children[len(leftItem.children) - 1].get("name")
        valueNode = item.getChild("right")
    elif (item.type == "keyvalue"):
        # This is a constant definition of a map-style class (like qx.Const)
        name = item.get("key")
        valueNode = item.getChild("value")

    node = tree.Node("constant")
    node.set("name", name)

    if valueNode.hasChild("constant"):
        node.set("value", valueNode.getChild("constant").get("value"))
        node.set("type", valueNode.getChild("constant").get("constantType").capitalize())
    elif valueNode.hasChild("array"):
        arrayNode = valueNode.getChild("array")
        if all([x.type == "constant" for x in arrayNode.children]):
            node.set("value", arrayNode.toJS(pp))
            node.set("type", "Array")

    commentAttributes = Comment.parseNode(item)[-1]
    for attr in commentAttributes:
        addTypeInfo(node, attr, item)

    handleDeprecated(node, commentAttributes)
    handleAccess(node, commentAttributes)
    classNode.addListChild("constants", node)


def getReturnNodes(parent):
    returnNodes = []

    def getReturnNode(parent):
        for node in parent.getChildren():
            if node.type == "return":
                returnNodes.append(node)
                continue
            if node.type == "function":
                continue
            if len(node.getChildren()) > 0:
                getReturnNode(node)

    getReturnNode(parent)
    return returnNodes


def handleFunction(funcItem, name, commentAttributes, classNode, reportMissingDesc=True, checkReturn=True):

    node = tree.Node("method")
    node.set("name", name)

    (line, column) = treeutil.getLineAndColumnFromSyntaxItem(funcItem)
    if line:
        node.set("line", line)

    # Read the parameters
    params = funcItem.getChild("params", False)
    if params and params.hasChildren():
        for param in params.children:
            if param.type != "identifier":
                continue

            paramNode = tree.Node("param")
            paramNode.set("name", param.get("value"))
            node.addListChild("params", paramNode)

    # Check whether the function is abstract
    #bodyBlockItem = funcItem.getChild("body").getFirstChild()
    #if bodyBlockItem.type == "block" and bodyBlockItem.hasChildren():
    #    firstStatement = bodyBlockItem.children[0]

    handleAccess(node, commentAttributes)

    handleDeprecated(node, commentAttributes)

    isAbstract = classNode.get("isAbstract", False)

    # Read all description, param and return attributes
    isAbstract = handleFunctionOtherAttributes(classNode, funcItem, name, commentAttributes, node, isAbstract)

    # Check for documentation errors
    if node.hasChild("params"):
        paramsListNode = node.getChild("params")
        for paramNode in paramsListNode.children:
            if not paramNode.getChild("desc", False):
                addError(node, "Parameter is not documented: '%s'" % paramNode.get("name"), funcItem)

    if reportMissingDesc and not node.hasChild("desc"):
        addError(node, "Documentation is missing.", funcItem)

    # Check whether return value documentation is correct
    if checkReturn:
        handleFunctionReturn(classNode, funcItem, name, commentAttributes, node, isAbstract)

    return node


def handleFunctionOtherAttributes(classNode, funcItem, name, commentAttributes, node, isAbstract):
    for attrib in commentAttributes:

        # Add description
        if attrib["category"] == "description":
            node = addChildIf(node, *(handleJSDocDecsription(attrib, funcItem)))

        elif attrib["category"] == "see":
            node = addChildIf(node, *(handleJSDocSee(attrib)))

        elif attrib["category"] in ("attach", "attachStatic"):
            if not "targetClass" in attrib:
                addError(node, "Missing target for attach.", funcItem)
                continue

            attachNode = tree.Node(attrib["category"]).set("targetClass", attrib["targetClass"])
            attachNode.set("targetMethod", attrib["targetMethod"])
            attachNode.set("sourceClass", classNode.get("fullName"))  # these two are interesting for display at the target class
            attachNode.set("sourceMethod", name)
            node.addChild(attachNode)

        elif attrib["category"] == "param":
            if not "name" in attrib:
                addError(node, "Missing name of parameter", funcItem)
                continue

            # Find the matching param node
            paramName = attrib["name"]
            paramNode = node.getListChildByAttribute("params", "name", paramName, False)

            if not paramNode:
                addError(node, "Contains information for non-existing parameter: '%s'." % paramName, funcItem)
                continue

            addTypeInfo(paramNode, attrib, funcItem)

        elif attrib["category"] == "return":
            returnNode = tree.Node("return")
            node.addChild(returnNode)

            addTypeInfo(returnNode, attrib, funcItem)

        elif attrib["category"] == "throws":

            if node.hasChild("throws"):
                throwsNode = node.getChild("throws")
            else:
                throwsNode = tree.Node("throws")

            if not "text" in attrib:
                addError(node, "Throws documentation is missing.", funcItem)
            else:
                child = tree.Node("desc")
                child.set("text", attrib["text"])
                if "type" in attrib:
                    child.set("type", attrib["type"])
                throwsNode.addChild(child)
                node.addChild(throwsNode)

        elif attrib["category"] == "abstract":
            isAbstract = True
            if not classNode.get("isAbstract", False):
                node.set("isAbstract", True)

    return isAbstract


def handleFunctionReturn(classNode, funcNode, funcName, commentAttributes, docNode, isAbstract):
    hasComment = len(commentAttributes) > 0
    isInterface = classNode.get("type", False) == "interface"

    hasSignatureDef = False
    for docItem in commentAttributes:
        if docItem["category"] == "signature":
            hasSignatureDef = True

    #overrides = False
    #if len(commentAttributes) == 0:
    #    superClassName = classNode.get("superClass", False)
    #    if superClassName:
    #        superClassNode = selectNode(classNode, "../class[@fullName='%s']" %superClassName)
    #        while superClassNode:
    #            superClassNode = selectNode(classNode, "../class[@fullName='%s']" %superClassName)

    if hasComment and not isInterface and not hasSignatureDef and not isAbstract:

        returnNodes = getReturnNodes(funcNode)
        hasReturnValue = False
        hasNoReturnValue = False
        hasReturnNodes = len(returnNodes) > 0
        for returnNode in returnNodes:
            if len(returnNode.getChildren()) > 0:
                hasReturnValue = True
            else:
                hasNoReturnValue = True

        hasReturnDoc = False
        hasUndefinedOrVarType = False
        hasNonUndefinedOrVarType = False
        if Comment.getAttrib(commentAttributes, "return"):
            hasVoidType = False
            if "type" in Comment.getAttrib(commentAttributes, "return"):
                for typeDef in Comment.getAttrib(commentAttributes, "return")["type"]:
                    if typeDef["type"] == "void":
                        hasVoidType = True
                    elif typeDef["type"] == "undefined" or typeDef["type"] == "var":
                        hasUndefinedOrVarType = True
                    else:
                        hasNonUndefinedOrVarType = True
            if not hasVoidType:
                hasReturnDoc = True

        isSingletonGetInstance = classNode.get("isSingleton", False) and funcName == "getInstance"

        if hasReturnDoc and not hasReturnNodes and not isSingletonGetInstance:
            addError(docNode, "Contains documentation for return value but no return statement found.", funcNode)
        if hasReturnDoc and (not hasReturnValue and hasNoReturnValue) and not hasUndefinedOrVarType:
            addError(docNode, "Contains documentation for return value but returns nothing.", funcNode)
        if hasReturnDoc and hasReturnValue and hasNoReturnValue and not hasUndefinedOrVarType:
            addError(docNode, "Contains documentation for return value but at least one return statement has no value.", funcNode)
        if hasReturnValue and not hasReturnDoc:
            addError(docNode, "Missing documentation for return value.", funcNode)

    return docNode



########################################################################################
#
#  COMMON STUFF
#
#######################################################################################


def handleJSDocDecsription(attrib_desc, treeItem=None):
    descNode = None
    err_node = None
    if "text" in attrib_desc:
        if "TODOC" in attrib_desc["text"]:
            err_node = createError("Documentation is missing.", treeItem)
        descNode = tree.Node("desc").set("text", attrib_desc["text"])
    return descNode, err_node

def handleJSDocSee(attrib_see, treeItem=None):
    result_node = None
    err_node = None
    if not 'name' in attrib_see:
        err_node = createError("Missing target for see.", treeItem)
    else:
        result_node = tree.Node("see").set("name", attrib_see["name"])
        if "text" in attrib_see:
            desc_node = tree.Node("desc").set("text", attrib_see["text"])
            result_node.addChild(desc_node)
    return result_node, err_node


def findAttachMethods(docTree):
    attachMap = {}
    sections = {"attach": "members", "attachStatic" :"statics"}

    for method in methodNodeIterator(docTree):
        for child in method.children:
            if child.type in ("attach", "attachStatic"):
                target_class = child.get("targetClass")
                if target_class not in attachMap:
                    attachMap[target_class] = {"statics": {}, "members": {}}
                target_method = child.get("targetMethod")
                if not target_method:
                    target_method = method.get("name")
                cmethod = attachMap[target_class][sections[child.type]][target_method] = copy.deepcopy(method)  # copy.deepcopy(method)?
                # patch isStatics in target class
                if sections[child.type] == "statics":
                    cmethod.set("isStatic", True)
                else:
                    cmethod.set("isStatic", False)
                cmethod.set("sourceClass", child.get("sourceClass"))
                cmethod.set("sourceMethod", method.get("name"))
                clazz = None
                for node in treeutil.findNode(docTree, ["class"], [("fullName", child.get("sourceClass"))]):
                    clazz = node
                if clazz and "group" in clazz.attributes:
                    cmethod.set("group", clazz.attributes["group"])


    return attachMap


def variableIsClassName(varItem):
    length = len(varItem.children)
    for i in range(length):
        varChild = varItem.children[i]
        if not varChild.type == "identifier":
            return False
        if i < length - 1:
            # This is not the last identifier -> It must a package (= lowercase)
            if not varChild.get("name").islower():
                return False
        else:
            # This is the last identifier -> It must the class name (= first letter uppercase)
            if not varChild.get("name")[0].isupper():
                return False
    return True


def getValue(item):
    value = None
    if item.type == "constant":
        if item.get("constantType") == "string":
            value = '"' + item.get("value") + '"'
        else:
            value = item.get("value")
    elif item.isVar():
        value, isComplete = treeutil.assembleVariable(item)
        if not isComplete:
            value = "[Complex expression]"
    elif item.type == "operation" and item.get("operator") == "SUB":
        # E.g. "-1" or "-Infinity"
        value = "-" + getValue(item.getFirstChild())
    if value == None:
        value = "[Unsupported item type: " + item.type + "]"

    return value



def addTypeInfo(node, commentAttrib=None, item=None):
    if commentAttrib == None:
        if node.type == "constant" and node.get("value", False):
                pass

        elif node.type == "param":
            addError(node, "Parameter is not documented: '%s'" % commentAttrib.get("name"), item)

        elif node.type == "return":
            addError(node, "Return value is not documented.", item)

        else:
            addError(node, "Documentation is missing.", item)

        return

    # add description
    if "text" in commentAttrib:
        descNode = treeutil.findChild(node, "desc")
        if descNode:
            # add any additional text attributes (e.g. type description) to the
            # existing desc node
            descNode.set("text", descNode.get("text") + commentAttrib["text"])
        else:
            node.addChild(tree.Node("desc").set("text", commentAttrib["text"]))

    # add types
    if "type" in commentAttrib and commentAttrib["type"] and not commentAttrib["category"] == "throws":
        typesNode = tree.Node("types")
        node.addChild(typesNode)

        for item in commentAttrib["type"]:
            itemNode = tree.Node("entry")
            typesNode.addChild(itemNode)

            itemNode.set("type", item["type"])

            if item["dimensions"] != 0:
                itemNode.set("dimensions", item["dimensions"])

    # add default value
    if "defaultValue" in commentAttrib:
        defaultValue = commentAttrib["defaultValue"]
        if defaultValue != None:
            # print "defaultValue: %s" % defaultValue
            node.set("defaultValue", defaultValue)

    # optional parameter?
    if "optional" in commentAttrib and commentAttrib["optional"]:
        node.set("optional", commentAttrib["optional"])


def addEventNode(classNode, classItem, commentAttrib):
    node = tree.Node("event")

    node.set("name", commentAttrib["name"])

    if "text" in commentAttrib:
        node.addChild(tree.Node("desc").set("text", commentAttrib["text"]))

    # add types
    if "type" in commentAttrib:
        typesNode = tree.Node("types")
        node.addChild(typesNode)

        for item in commentAttrib["type"]:
            itemNode = tree.Node("entry")
            typesNode.addChild(itemNode)
            itemNode.set("type", item["type"])

            if item["dimensions"] != 0:
                itemNode.set("dimensions", item["dimensions"])

    classNode.addListChild("events", node)



def createError(msg, syntaxItem=None):
    errorNode = tree.Node("error")
    errorNode.set("msg", msg)

    if syntaxItem:
        (line, column) = treeutil.getLineAndColumnFromSyntaxItem(syntaxItem)
        if line:
            errorNode.set("line", line)

            if column:
                errorNode.set("column", column)
    return errorNode

def addError(node, msg, syntaxItem=None):
    errorNode = createError(msg, syntaxItem)
    node.addListChild("errors", errorNode)
    node.set("hasError", True)

##
# Adds a child node to <node>, handles error nodes and None as <child_node>.
# - allows both child and error node at the same time
def addChildIf(node, child_node, err_node, force=False):
    if err_node != None:
        node.addListChild("errors", err_node)
        node.set("hasError", True)
    if child_node != None:
        node.addChild(child_node)
    return node


def getPackageNode(docTree, namespace):
    currPackage = docTree
    childPackageName = ""
    for nsPart in namespace.split("."):
        childPackage = currPackage.getListChildByAttribute("packages", "name", nsPart, False)
        childPackageName += nsPart
        if not childPackage:

            # The package does not exist -> Create it
            childPackage = tree.Node("package")
            childPackage.set("name", nsPart)
            childPackage.set("fullName", childPackageName)
            childPackage.set("packageName", (childPackageName.replace("." + nsPart, "")
                if "." in childPackageName else "" )
            )

            currPackage.addListChild("packages", childPackage)

        childPackageName += "."

        # Update current package
        currPackage = childPackage

    return currPackage


##
# Get (or create) the node for the given class name in the docTree
#
def classNodeFromDocTree(docTree, fullClassName, commentAttributes = None):
    if commentAttributes == None:
        commentAttributes = {}

    packageName = ""
    className = fullClassName
    classNode = None
    package = None

    if "." in fullClassName:
        dotIndex = fullClassName.rindex(".")
        packageName = fullClassName[:dotIndex]
        className = fullClassName[dotIndex+1:]
        package = getPackageNode(docTree, packageName)
        classNode = package.getListChildByAttribute("classes", "name", className, False)
    else:
        package = docTree
        classNode = package.getListChildByAttribute("classes", "name", className, False)

    if not classNode:
        # The class does not exist -> Create it
        classNode = tree.Node("class")
        classNode.set("name", className)
        classNode.set("fullName", fullClassName)
        classNode.set("packageName", packageName)

        # Read all description, param and return attributes
        for attrib in commentAttributes:
            # Add description
            if attrib["category"] == "description":
                classNode = addChildIf(classNode, *(handleJSDocDecsription(attrib)))

            elif attrib["category"] == "group":
                classNode.set("group", attrib["name"])

            elif attrib["category"] == "see":
                classNode = addChildIf(classNode, *(handleJSDocSee(attrib)))

        if package:
            if fullClassName in lang.BUILTIN:
                pass # don't add JS built-in classes
            else:
                package.addListChild("classes", classNode)

    return classNode



def connectPackage(docTree, packageNode):
    childHasError = False

    packages = packageNode.getChild("packages", False)
    if packages:
        packages.children.sort(nameComparator)
        for node in packages.children:
            Context.console.dot()
            hasError = connectPackage(docTree, node)
            if hasError:
                childHasError = True

    classes = packageNode.getChild("classes", False)
    if classes:
        classes.children.sort(nameComparator)
        for node in classes.children:
            Context.console.dot()
            hasError = connectClass(docTree, node)
            if hasError:
                childHasError = True

    if childHasError:
        packageNode.set("hasWarning", True)

    return childHasError



def connectClass(docTree, classNode):

    # mark property apply methods
    markPropertyApply(docTree, classNode)

    # Sort child classes
    childClasses = classNode.get("childClasses", False)
    if childClasses:
        classArr = childClasses.split(",")
        classArr.sort()
        childClasses = ",".join(classArr)
        classNode.set("childClasses", childClasses)

    # Mark overridden items
    postWorkItemList(docTree, classNode, "constructor", True)
    postWorkItemList(docTree, classNode, "properties", True)
    postWorkItemList(docTree, classNode, "events", False)
    postWorkItemList(docTree, classNode, "methods", True)
    postWorkItemList(docTree, classNode, "methods-static", False)

    # Check whether the class is static
    superClassName = classNode.get("superClass", False)
    if not superClassName \
        and classNode.getChild("properties", False) == None \
        and classNode.getChild("methods", False) == None:
        # This class is static
        classNode.set("isStatic", True)

    # Check for errors
    childHasError = (
        classNode.get("hasError", False) or
        listHasError(classNode, "constructor") or
        listHasError(classNode, "properties") or
        listHasError(classNode, "methods") or
        listHasError(classNode, "methods-static") or
        listHasError(classNode, "constants") or
        listHasError(classNode, "events")
    )

    if childHasError:
        classNode.set("hasWarning", True)

    return childHasError


def documentApplyMethod(methodNode, props):
    if methodNode.getChild("desc", False) != None:
        return

    firstParam = treeutil.selectNode(methodNode, "params/param[1]/@name")
    if firstParam is None:
        firstParam = "value"

    secondParam = treeutil.selectNode(methodNode, "params/param[2]/@name")
    if secondParam is None:
        secondParam = "old"

    paramType = "var"
    paramTypes = []
    propNames = []
    for prop in props:
        propNames.append(prop.get("name"))
        pType = prop.get("check", False)
        if pType is False or pType == "Custom check function.":
            pType = "var"
        paramTypes.append(pType)

    # if all properties have the same value for "check", use that
    if paramTypes[1:] == paramTypes[:-1]:
        paramType = paramTypes[0]

    if len(propNames) > 1:
        propNames.sort()
        propList = "</code>, <code>".join(propNames[:-1]) + "</code> and <code>" + propNames[-1]
        propNamesString = "properties <code>%s</code>" %propList

        linkList = "}, {@link #".join(propNames[:-1]) + "} and {@link #" + propNames[-1]
        propLinksString = "s: {@link #%s}" %linkList
    else:
        propNamesString = "property <code>%s</code>" %propNames[0]
        propLinksString = ": {@link #%s}" %propNames[0]

    functionCode = ("/**\n"
        "* Applies changes of the property value of the %(propNames)s.\n"
        "*\n"
        "* For further details take a look at the property definition%(propLinks)s.\n"
        "*\n"
        "* @param %(firstParamName)s {%(paramType)s} new value of the property\n"
        "* @param %(secondParamName)s {%(paramType)s} previous value of the property (null if it was not yet set).\n"
        "*/\n"
        "function(%(firstParamName)s, %(secondParamName)s) {}") % ({
            "firstParamName": firstParam,
            "secondParamName": secondParam,
            "paramType": paramType,
            "propNames": propNamesString,
            "propLinks": propLinksString,
            "propName": methodNode.get("name")
        })

    node = treeutil.compileString(functionCode)
    commentAttributes = Comment.parseNode(node)[-1]
    docNode = handleFunction(node, methodNode.get("name"), commentAttributes, treeutil.selectNode(methodNode, "../.."))

    oldParams = methodNode.getChild("params", False)
    if oldParams:
        methodNode.replaceChild(oldParams, docNode.getChild("params"))
    else:
        methodNode.addChild(docNode.getChild("params"))

    oldDesc = methodNode.getChild("desc", False)
    if oldDesc:
        methodNode.replaceChild(oldDesc, docNode.getChild("desc"))
    else:
        methodNode.addChild(docNode.getChild("desc"))


def markPropertyApply(docTree, classNode):

    # Sort the list
    sortByName(classNode, "methods")

    # Post work all items
    methods = classNode.getChild("methods", False)
    if not methods:
        return

    dependendClasses = [cls for cls in dependendClassIterator(docTree, classNode)]

    for itemNode in methods.children:
        name = itemNode.get("name")
        for dep in dependendClasses:
            props = dep.getChild("properties", False)
            if not props:
                continue
            applyFor = []
            for prop in props.children:
                if prop.get("apply", False) == name:
                    propNode = tree.Node("entry")
                    propNode.set("applies", dep.get("fullName") + "#" + prop.get("name"))
                    itemNode.addListChild("apply", propNode)
                    removeErrors(itemNode)
                    applyFor.append(prop)
            if len(applyFor) > 0:
                documentApplyMethod(itemNode, applyFor)


def dependendClassIterator(docTree, classNode):
    yield classNode

    directDependencies = []

    superClassName = classNode.get("superClass", False)
    if superClassName:
        directDependencies.append(superClassName)

    for list_ in ["mixins", "interfaces"]:
        listItems = classNode.get(list_, False)
        if listItems:
            directDependencies.extend(listItems.split(","))

    for list_ in ["superMixins", "superInterfaces"]:
        listNode = classNode.getChild(list_, False)
        if listNode:
            directDependencies.extend([depNode.get("name") for depNode in listNode.children])

    for dep in directDependencies:
        for cls in dependendClassIterator(docTree, classNodeFromDocTree(docTree, dep)):
            yield cls


def itemHasAnyDocs(node):
    if node.getChild("desc", False) != None:
        return True
    if node.hasChildren():
        for child in node.children:
            if child.type == "params":
                for param in child.children:
                    if param.getChild("desc", False) != None:
                        return True
            elif child.type != "errors":
                return True
    return False


def postWorkItemList(docTree, classNode, listName, overridable):
    """Does the post work for a list of properties or methods."""

    # Sort the list
    sortByName(classNode, listName)

    # Post work all items
    listNode = classNode.getChild(listName, False)
    if listNode:
        for itemNode in listNode.children:
            name = itemNode.get("name")

            # Check whether this item is overridden and try to inherit the
            # documentation from the next matching super class
            if not overridable:
                continue

            superClassName = classNode.get("superClass", False)
            overriddenFound = False
            docFound = itemHasAnyDocs(itemNode)

            # look for documentation in interfaces
            if (not docFound):
                for item in dependendClassIterator(docTree, classNode):
                    if item == classNode:
                        continue
                    if item.get("type", False) in ("interface", "mixin"):
                        interfaceItemNode = item.getListChildByAttribute(listName, "name", name, False)
                        if not interfaceItemNode:
                            continue
                        if item.get("type", "") == "mixin" and not interfaceItemNode.get("isCtor", False):
                            # item overrides a mixin item included by a super class
                            overriddenFound = True
                            itemNode.set("overriddenFrom", item.get("fullName"))
                        itemNode.set("docFrom", item.get("fullName"))
                        docFound = itemHasAnyDocs(interfaceItemNode)

                        # Remove previously recorded documentation errors from the item
                        # (Any documentation errors will be recorded in the super class)
                        removeErrors(itemNode)
                        break

            # look for documentation in super classes
            while superClassName and (not overriddenFound or not docFound):
                superClassNode = classNodeFromDocTree(docTree, superClassName)
                superItemNode = superClassNode.getListChildByAttribute(listName, "name", name, False)

                if superItemNode:
                    if not docFound:
                        # This super item has a description
                        # -> Check whether the parameters match
                        # NOTE: paramsMatch works for properties, too
                        #       (Because both compared properties always have no params)
                        if paramsMatch(itemNode, superItemNode):
                            # The parameters match -> We can use the documentation of the super class
                            itemNode.set("docFrom", superClassName)
                            docFound = itemHasAnyDocs(superItemNode)

                            # Remove previously recorded documentation errors from the item
                            # (Any documentation errors will be recorded in the super class)
                            removeErrors(itemNode)
                        else:
                            errorsNode = itemNode.getChild("errors", False)
                            if errorsNode:
                                if len(errorsNode.getChildren()) > 0:
                                    errorNode = errorsNode.getChildren()[0]
                                    msg = errorNode.get("msg") + " Signature of overriding method different from superclass method."
                                    errorNode.set("msg", msg)
                            docFound = True
                    if not overriddenFound:
                        # This super class has the item defined -> Add a overridden attribute
                        itemNode.set("overriddenFrom", superClassName)
                        overriddenFound = True

                # Check the next superclass
                superClassName = superClassNode.get("superClass", False)

            if not docFound and itemNode.get("overriddenFrom", False):
                # This item is overridden, but we didn't find any documentation in the
                # super classes -> Add a warning
                itemNode.set("hasWarning", True)



def paramsMatch(methodNode1, methodNode2):
    params1 = methodNode1.getChild("params", False)
    params2 = methodNode2.getChild("params", False)

    if params1 == None or params2 == None:
        # One method has no parameters -> The params match if both are None
        return params1 == params2
    elif len(params1.children) != len(params2.children):
        # The param count is different -> The params don't match
        return False
    else:
        for i in range(len(params1.children)):
            par1 = params1.children[i]
            par2 = params2.children[i]
            if (par1.get("name") != par2.get("name")):
                # These parameters don't match
                return False

        # All tests passed
        return True



def removeErrors(node):
    errors = node.getChild("errors", False)
    node.remove("hasWarning")
    if errors:
        node.removeChild(errors)
        node.remove("hasError")



def sortByName(node, listName):
    listNode = node.getChild(listName, False)
    if listNode:
        listNode.children.sort(nameComparator)



def nameComparator(node1, node2):
    name1 = node1.get("name").lower()
    name2 = node2.get("name").lower()
    return cmp(name1, name2)



def listHasError(node, listName):
    listNode = node.getChild(listName, False)
    if listNode:
        for childNode in listNode.children:
            if childNode.get("hasError", False):
                return True

    return False


def packagesToJsonString(node, prefix = "", childPrefix = "  ", newLine="\n", encoding="utf-8"):
    asString = prefix + '{type:"' + tree.escapeJsonChars(node.type) + '"'

    if node.type == "class":
        node.set("externalRef", True)

    if node.hasAttributes():
        asString += ',attributes:{'
        firstAttribute = True
        for key in node.attributes:
            if not firstAttribute:
                asString += ','
            asString += '"' + key + '":"' + tree.escapeJsonChars(node.attributes[key]) + '"'
            firstAttribute = False
        asString += '}'

    if node.type == "class":
        node.remove("externalRef")

    if node.hasChildren() and node.type != "class":
        asString += ',children:[' + newLine

        prefix = prefix + childPrefix
        for child in node.children:
            asString += packagesToJsonString(child, prefix, childPrefix, newLine) + ',' + newLine

        # NOTE We remove the ',\n' of the last child
        if newLine == "":
            asString = asString[:-1] + prefix + ']'
        else:
            asString = asString[:-2] + newLine + prefix + ']'

    asString += '}'

    return asString


##
# interface function

def getPackageData(node):
    data = {
      "type" : node.type
    }

    if node.type == "class":
        node.set("externalRef", True)

    if node.hasAttributes():
        data["attributes"] = {}
        for key in node.attributes:
            data["attributes"][key] = node.attributes[key]

    if node.type == "class":
        node.remove("externalRef")

    if node.hasChildren() and node.type != "class":
        data["children"] = []

        for child in node.children:
            data["children"].append(getPackageData(child))

    return data


def packagesToXmlString(node, prefix = "", childPrefix = "  ", newLine="\n", encoding="utf-8"):

    if node.type == "class":
        node.set("externalRef", True)

    hasText = False
    asString = prefix + "<" + node.type
    if node.hasAttributes():
        for key in node.attributes:
            if key == "text":
                hasText = True
            else:
                asString += " " + key + "=\"" + tree.escapeXmlChars(node.attributes[key], True, encoding) + "\""

    if node.type == "class":
        node.remove("externalRef")

    if not node.hasChildren() and not hasText:
        asString += "/>" + newLine
    else:
        asString += ">"

        if hasText:
            asString += newLine + prefix + childPrefix
            asString += "<text>" + tree.escapeXmlChars(node.attributes["text"], False, encoding) + "</text>" + newLine

        if node.hasChildren():
            asString += newLine
            for child in node.children:
                asString += packagesToXmlString(child, prefix + childPrefix, childPrefix, newLine, encoding)

        asString += prefix + "</" + node.type + ">" + newLine

    return asString


def classNodeIterator(docTree):
    if docTree.type == "class":
        yield docTree
        return

    if docTree.hasChildren():
        for child in docTree.children:
            for cls in classNodeIterator(child):
                yield cls


def methodNodeIterator(docTree):
    if docTree.type == "method":
        yield docTree
        return

    if docTree.hasChildren():
        for child in docTree.children:
            for method in methodNodeIterator(child):
                yield method


def docTreeIterator(docTree, type_):
    if docTree.type == type_:
        yield docTree

    if docTree.children:
        for child in docTree.children:
            for entry in docTreeIterator(child, type_):
                yield entry


def errorNodeIterator(docTree):
    if docTree.get("hasError", False) or docTree.get("hasWarning", False):
        yield docTree

    if docTree.hasChildren():
        for child in docTree.children:
            for fcn in errorNodeIterator(child):
                yield fcn

################################################################################
#
# API DOC VERIFICATION
#
################################################################################


# TODO: move to treeutil?
def getParentAttrib(node, attrib, type=None):
    while node:
        if node.hasAttributes():
            if attrib in node.attributes:
                if type:
                    if node.type == type:
                        return node.attributes[attrib]
                else:
                    return node.attributes[attrib]

        if node.hasParent():
            node = node.parent
        else:
            node = None
    return None


def getTopPackage(node):
    while node:
        if node.hasAttributes():
            if "packageName" in node.attributes:
                if node.attributes["packageName"] == "":
                    return node.get("name")
                elif not "." in node.attributes["packageName"]:
                    return node.get("packageName")
        if node.hasParent():
            node = node.parent
        else:
            node = None
    return None


def verifyLinks(docTree, index):
    Context.console.info("Verifying internal doc links...", False)

    linkRegExp = re.compile("\{\s*@link\s*([\w#-_\.]*)[\W\w\d\s]*?\}")

    descNodes = docTree.getAllChildrenOfType("desc")

    links = []
    for descNode in descNodes:
        if not "@link" in descNode.attributes["text"]:
            continue
        match = linkRegExp.findall(descNode.attributes["text"])
        if not match:
            continue
        internalLinks = []
        for link in match:
            if not "<a" in link:
                internalLinks.append(link)
        if len(internalLinks) > 0:
            nodeType = descNode.parent.type
            if nodeType == "param":
                itemName = getParentAttrib(descNode.parent, "name")
                paramName = getParentAttrib(descNode, "name")
                paramForType = descNode.parent.parent.parent.type
            else:
                itemName = getParentAttrib(descNode, "name")
                paramName = None
                paramForType = None
            linkData = {
                "nodeType": nodeType,
                "packageName": getParentAttrib(descNode, "packageName"),
                "className": getParentAttrib(descNode, "name", "class"),
                "itemName": itemName,
                "paramName": paramName,
                "paramForType": paramForType,
                "links": internalLinks,
                "parent": descNode.parent
            }
            links.append(linkData)

    count = 0
    classesWithWarnings = []
    for link in links:
        count += 1
        Context.console.progress(count, len(links))
        result = checkLink(link, docTree, index)
        if result:
            for ref, link in result.iteritems():
                addError(link["parent"], "Unknown link target: '%s'" % ref)

                if not link["className"] in classesWithWarnings:
                    parent = link["parent"]
                    while parent:
                        if parent.type == "class":
                            classesWithWarnings.append(link["className"])
                            parent.set("hasWarning", True)
                            parent = None
                            break
                        if hasattr(parent, "parent"):
                            parent = parent.parent


def checkLink(link, docTree, index):
    brokenLinks = {}

    def getTargetName(ref):
        targetPackageName = None
        targetClassName = None
        targetItemName = None

        classItem = ref.split("#")
        # internal class item reference
        if classItem[0] == "":
            targetPackageName = link["packageName"]
            targetClassName = link["className"]
        else:
            namespace = classItem[0].split(".")
            targetPackageName = ".".join(namespace[:-1])
            if targetPackageName == "":
                if link["nodeType"] == "package":
                    targetPackageName = link["packageName"] + "." + link["itemName"]
                else:
                    targetPackageName = link["packageName"]
            targetClassName = namespace[-1]
        if len(classItem) == 2:
            targetItemName = classItem[1]

        return (targetPackageName + "." + targetClassName, targetItemName)

    def isClassInHierarchy(docTree, className, searchFor):
        targetClass = docTree.getChildByTypeAndAttribute("class", "fullName", className, False, True)
        if not targetClass:
            return False

        while targetClass:
            if targetClass.attributes["fullName"] in searchFor:
                return True
            if "mixins" in targetClass.attributes:
                for wanted in searchFor:
                    if wanted in targetClass.attributes["mixins"]:
                        return True
            if "superClass" in targetClass.attributes:
                superClassName = targetClass.attributes["superClass"]
                targetClass = docTree.getChildByTypeAndAttribute("class", "fullName", superClassName, False, True)
            else:
                targetClass = None

        return False

    for ref in link["links"]:
        # Remove parentheses from method references
        if ref[-2:] == "()":
            ref = ref[:-2]

        # ref is a fully qualified package or class name
        if ref in index["__fullNames__"]:
            continue

        name = getTargetName(ref)
        targetClassName = name[0]
        targetItemName = name[1]

        # unknown class or package
        if not targetClassName in index["__fullNames__"]:
            brokenLinks[ref] = link
            continue

        # valid package or class ref
        if not targetItemName:
            continue

        # unknown class item
        if not "#" + targetItemName in index["__index__"]:
            # the index doesn't tell us if the class is static
            # so we have to assume #construct is a valid target
            if targetItemName != "construct":
                brokenLinks[ref] = link
            continue

        classHasItem = False
        classesWithItem = []
        # get all classes that have an item with the same name as the referenced item
        for occurrence in index["__index__"]["#" + targetItemName]:
            className = index["__fullNames__"][occurrence[1]]
            classesWithItem.append(className)
            if targetClassName == className:
                classHasItem = True
                break

        if classHasItem:
            continue

        # search for a superclass or included mixin with the referenced item
        classHasItem = isClassInHierarchy(docTree, targetClassName, classesWithItem)

        if not classHasItem:
            brokenLinks[ref] = link

    return brokenLinks


def verifyTypes(docTree, index):
    Context.console.info("Verifying types...", False)
    knownTypes = lang.GLOBALS[:]
    knownTypes = knownTypes + ["var", "null",
                               # additional types supported by the property system:
                               "Integer", "PositiveInteger", "PositiveNumber",
                               "Float", "Double", "Map",
                               "Node", "Element", "Document", "Window",
                               "Event", "Class", "Mixin", "Interface", "Theme",
                               "Color", "Decorator", "Font"
                              ]

    count = 0
    docNodes = docTree.getAllChildrenOfType("return")
    docNodes = docNodes + docTree.getAllChildrenOfType("param")
    docNodes = docNodes + docTree.getAllChildrenOfType("childControl")
    total = len(docNodes)

    for docNode in docNodes:
        count += 1
        Context.console.progress(count, total)
        for typesNode in docNode.getAllChildrenOfType("types"):
            for entryNode in typesNode.getAllChildrenOfType("entry"):
                unknownTypes = []
                entryType = entryNode.get("type")
                if (not entryType in knownTypes) and not ("value" in entryType and re.search("[\<\>\=]", entryType)):
                    unknownTypes.append(entryType)
                if len(unknownTypes) > 0:
                    itemName = getParentAttrib(docNode, "name")
                    packageName = getParentAttrib(docNode, "packageName")
                    className = getParentAttrib(docNode, "name", "class")

                    linkData = {
                      "itemName": itemName,
                      "packageName": packageName,
                      "className": className,
                      "nodeType": docNode.parent.type,
                      "links": unknownTypes
                    }

                    docNodeType = ""
                    if docNode.type == "param":
                        docNodeType = "Parameter '%s'" % docNode.get("name")
                    elif docNode.type == "return":
                        docNodeType = "Return value"
                    elif docNode.type == "childControl":
                        docNodeType = "Child control '%s'" % docNode.get("name")

                    classesWithWarnings = []
                    for ref in checkLink(linkData, docTree, index):
                        fullName = "%s.%s#%s" % (packageName, className, itemName)
                        #msg = "%s of %s is documented as unknown type '%s'" % (docNodeType, fullName, ref)
                        msg = "%s: Unknown type '%s'" % (docNodeType, ref)
                        if (docNode.parent.get("name", False)):
                            #Add error to method/event/... node, not params node
                            addError(docNode.parent, msg)
                        else:
                            addError(docNode.parent.parent, msg)
                        if not linkData["className"] in classesWithWarnings:
                            parent = docNode
                            while parent:
                                if parent.type == "class":
                                    classesWithWarnings.append(linkData["className"])
                                    parent.set("hasWarning", True)
                                    parent = None
                                    break
                                if hasattr(parent, "parent"):
                                    parent = parent.parent


def verifyDocPercentage(docTree):
    packages = {}

    for docNode in treeutil.nodeIterator(docTree, ["package", "class", "property", "event", "method"]):
        pkg = getTopPackage(docNode)
        if pkg == "":
            import pydb
            pydb.set_trace()
        if not pkg in packages:
            packages[pkg] = {
                "documentableItems": 0,
                "undocumentedItems": 0
            }
        packages[pkg]["documentableItems"] += 1
        if docNode.get("hasError", False):
            packages[pkg]["undocumentedItems"] += 1

    for pkgName, pkgStats in packages.iteritems():
        Context.console.info("API Documentation Statistics for package '%s':" % pkgName)
        undocumentedItems = pkgStats["undocumentedItems"]
        documentableItems = pkgStats["documentableItems"]
        percentageWithErrors = (float(undocumentedItems) / documentableItems) * 100
        percentageOk = "{0:.2f}".format(100 - percentageWithErrors)
        Context.console.indent()
        Context.console.info("%s API items total" % documentableItems)
        Context.console.info("%s API items with missing or incomplete documentation" % undocumentedItems)
        Context.console.info("%s%% API documentation completeness" % percentageOk)
        Context.console.outdent()


def logErrors(docTree, targets):
    for errNode in treeutil.nodeIterator(docTree, ["error"]):

        if "console" in targets:
            itemName = getParentAttrib(errNode, "fullName")
            itemType = errNode.parent.parent.type

            if itemType == 'doctree':
                Context.console.warn(errNode.get("msg"))

            if not itemType in ["class", "package"]:
                #itemName = itemName + "#" + getParentAttrib(errNode, "name")
                pass

            line = errNode.get("line", False)
            column = errNode.get("column", False)
            lineCol = ""
            if line:
                lineCol = " (" + str(line)
                if column:
                    lineCol = "%s,%s" % (lineCol, str(column))
                lineCol = lineCol + ")"

            Context.console.warn("%s%s: %s" % (itemName, lineCol, errNode.get("msg")))

    if not "data" in targets:
        for node in errorNodeIterator(docTree):
            removeErrors(node)
