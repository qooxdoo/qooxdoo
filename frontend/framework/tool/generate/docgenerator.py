#!/usr/bin/env python

import sys, os, re, optparse
import compile, tree, treegenerator, tokenizer


# contains 4 groups (1:type, 2:array dimensions, 5:default value)
TYPE_REGEX = r'\{([^@][\w\.]*)((\[\])*)(,\s*([^\},]+)\s*)?\}'

# contains 6 groups (1: param name, 3:type, 4:array dimensions, 7:default value)
COMMENT_PARAM_ATTR_RE = re.compile(r'^\s*(\w+)\s+(' + TYPE_REGEX + r')?\s*')

# contains same groups as TYPE_REGEX
LEADING_TYPE_RE = re.compile(r'^\s*' + TYPE_REGEX + r'\s*')



class DocException (Exception):
  def __init__ (self, msg, syntaxItem):
    Exception.__init__(self, msg)
    self.node = syntaxItem



def createDoc(syntaxTree, docTree = None):
  if not docTree:
    docTree = tree.Node("doctree")

  # TODO: Events

  try:
    currClassNode = None
    for item in syntaxTree.children:
      if item.type == "assignment":
        leftItem = item.getFirstListChild("left")
        rightItem = item.getFirstListChild("right")
        if leftItem.type == "variable":
          if currClassNode and len(leftItem.children) == 3 and leftItem.children[0].get("name") == "qx":
            if leftItem.children[1].get("name") == "Proto" and rightItem.type == "function":
              # It's a method definition
              handleMethodDefinition(item, False, currClassNode)
            elif leftItem.children[1].get("name") == "Class":
              if rightItem.type == "function":
                handleMethodDefinition(item, True, currClassNode)
              elif leftItem.children[2].get("name").isupper():
                handleConstantDefinition(item, currClassNode)
          elif currClassNode and assembleVariable(leftItem).startswith(currClassNode.get("fullName")):
            # This is definition of the type "mypackage.MyClass.bla = ..."
            if rightItem.type == "function":
              handleMethodDefinition(item, True, currClassNode)
            elif leftItem.children[len(leftItem.children) - 1].get("name").isupper():
              handleConstantDefinition(item, currClassNode)

      elif item.type == "call":
        operand = item.getChild("operand", False)
        if operand:
          var = operand.getChild("variable", False)
          if var and len(var.children) == 3 and var.children[0].get("name") == "qx" and var.children[1].get("name") == "OO":
            methodName = var.children[2].get("name")
            if methodName == "defineClass":
              currClassNode = handleClassDefinition(docTree, item)
            elif methodName == "addProperty" or methodName == "addFastProperty" or methodName == "addCachedProperty" or methodName == "changeProperty":
              handlePropertyDefinition(item, currClassNode)
      #elif item.type == "function":
      #  name = item.get("name", False)
      #  if name and name[0].isupper():
      #    # This is an old class definition "function MyClass (...)"
      #    currClassNode = handleClassDefinition(docTree, item)

  except Exception:
    exc = sys.exc_info()[1]
    msg = "Create documentation failed: " + str(exc)

    if hasattr(exc, "node"):
      line = getLineFromSyntaxItem(exc.node)
      if line != None:
        msg += " - line " + line

    raise Exception, msg, sys.exc_info()[2]

  return docTree



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



def variableHasOnlyIdentifiers(varItem):
  for varChild in varItem:
    varChild = varItem.children[i]
    if not varChild.type == "identifier":
      return False
  return True



def variableIs(var, nameArr):
  if len(var.children) != len(nameArr):
    return False

  i = 0
  for child in var.children:
    if child.type != "identifier" or child.get("name") != nameArr[i]:
      return False
    i += 1

  return True



def assembleVariable(variableItem):
  if variableItem.type != "variable":
    raise DocException("'variableItem' is no variable", variableItem)

  assembled = ""
  for child in variableItem.children:
    if len(assembled) != 0:
      assembled += "."
    assembled += child.get("name")

  return assembled



def handleClassDefinition(docTree, item):
  params = item.getChild("params")

  paramsLen = len(params.children);
  if paramsLen == 1:
    superClassName = "Object"
    ctorItem = None
  elif paramsLen == 2:
    superClassName = "Object"
    ctorItem = params.children[1]
  elif paramsLen == 3:
    superClassName = assembleVariable(params.children[1])
    ctorItem = params.children[2]
  else:
    raise DocException("defineClass call has more than three parameters: " + str(len(params.children)), item)

  className = params.children[0].get("value")
  classNode = getClassNode(docTree, className)

  if superClassName != "Object":
    superClassNode = getClassNode(docTree, superClassName)
    childClasses = superClassNode.get("childClasses", False)
    if childClasses:
      childClasses += "," + className
    else:
      childClasses = className
    superClassNode.set("childClasses", childClasses)

    classNode.set("superClass", superClassName)

  commentNode = parseDocComment(item)

  if ctorItem and ctorItem.type == "function":
    ctor = handleFunction(ctorItem, commentNode, classNode)
    ctor.set("isCtor", "true")
    classNode.addListChild("constructor", ctor)

    # Check for methods defined in the constructor
    # (for method definition style that supports real private methods)
    ctorBlock = ctorItem.getChild("body").getChild("block")
    for item in ctorBlock.children:
      if item.type == "assignment":
        leftItem = item.getFirstListChild("left")
        rightItem = item.getFirstListChild("right")
        if leftItem.type == "variable" and len(leftItem.children) == 2 and (leftItem.children[0].get("name") == "this" or leftItem.children[0].get("name") == "self") and rightItem.type == "function":
          # It's a method definition
          handleMethodDefinition(item, False, classNode)

  elif ctorItem and ctorItem.type == "map":
    for keyvalueItem in ctorItem.children:
      valueItem = keyvalueItem.getChild("value").getFirstChild()
      if (valueItem.type == "function"):
        handleMethodDefinition(keyvalueItem, True, classNode)
      else:
        handleConstantDefinition(keyvalueItem, classNode)

  return classNode;



def handlePropertyDefinition(item, classNode):
  paramsMap = item.getChild("params").getChild("map")

  node = tree.Node("property")
  node.set("name", paramsMap.getChildByAttribute("key", "name").getChild("value").getChild("constant").get("value"))

  propType = paramsMap.getChildByAttribute("key", "type", False)
  if propType:
    node.set("type", getType(propType.getChild("value").getFirstChild()))

  allowNull = paramsMap.getChildByAttribute("key", "allowNull", False)
  if allowNull:
    node.set("allowNull", allowNull.getChild("value").getChild("constant").get("value"))

  defaultValue = paramsMap.getChildByAttribute("key", "defaultValue", False)
  if defaultValue:
    node.set("defaultValue", getValue(defaultValue.getFirstListChild("value")))

  getAlias = paramsMap.getChildByAttribute("key", "getAlias", False)
  if getAlias:
    node.set("getAlias", getAlias.getChild("value").getChild("constant").get("value"))

  setAlias = paramsMap.getChildByAttribute("key", "setAlias", False)
  if setAlias:
    node.set("setAlias", setAlias.getChild("value").getChild("constant").get("value"))

  unitDetection = paramsMap.getChildByAttribute("key", "unitDetection", False)
  if unitDetection:
    node.set("unitDetection", unitDetection.getChild("value").getChild("constant").get("value"))

  instance = paramsMap.getChildByAttribute("key", "instance", False)
  if instance:
    node.set("instance", instance.getChild("value").getChild("constant").get("value"))

  classname = paramsMap.getChildByAttribute("key", "classname", False)
  if classname:
    node.set("classname", classname.getChild("value").getChild("constant").get("value"))

  possibleValues = paramsMap.getChildByAttribute("key", "possibleValues", False)
  if possibleValues:
    array = possibleValues.getChild("value").getChild("array")
    values = ""
    for arrayItem in array.children:
      if len(values) != 0:
        values += ", "
      values += getValue(arrayItem)
    node.set("possibleValues", values)

  commentNode = parseDocComment(item)
  if not commentNode:
    addError(node, "doc comment is missing", item)
  else:
    # If the description has a type specified then take this type
    # (and not the one extracted from the paramsMap)
    desc = commentNode.get("text")
    match = LEADING_TYPE_RE.search(desc)
    if match:
      addTypeInfo(node, match.group(1), match.group(2), match.group(5))
      commentNode.set("text", desc[match.end(0):])

    node.addChild(commentNode)

  classNode.addListChild("properties", node)



def getValue(item):
  value = None
  if item.type == "constant":
    if item.get("constantType") == "string":
      value = '"' + item.get("value") + '"'
    else:
      value = item.get("value")
  elif item.type == "variable":
    value = assembleVariable(item)
  elif item.type == "operation" and item.get("operator") == "SUB":
    # E.g. "-1" or "-Infinity"
    value = "-" + getValue(item.getChild("first").getFirstChild())
  if value == None:
    raise DocException("Can't get value from item type " + item.type, item)

  return value



def handleMethodDefinition(item, isStatic, classNode):
  if (item.type == "assignment"):
    # This is a "normal" method definition
    leftItem = item.getFirstListChild("left")
    name = leftItem.children[len(leftItem.children) - 1].get("name")
    functionItem = item.getFirstListChild("right")
  elif (item.type == "keyvalue"):
    # This is a method definition of a map-style class (like qx.Const)
    name = item.get("key")
    functionItem = item.getFirstListChild("value")

  commentNode = parseDocComment(item)

  node = handleFunction(functionItem, commentNode, classNode)
  node.set("name", name)

  isPublic = name[0] != "_"
  listName = "methods"
  if isStatic:
    node.set("isStatic", "true")
    listName += "-static"
  if isPublic:
    listName += "-pub"
  else:
    listName += "-prot"

  classNode.addListChild(listName, node)



def handleConstantDefinition(item, classNode):
  if (item.type == "assignment"):
    # This is a "normal" constant definition
    leftItem = item.getFirstListChild("left")
    name = leftItem.children[len(leftItem.children) - 1].get("name")
  elif (item.type == "keyvalue"):
    # This is a constant definition of a map-style class (like qx.Const)
    name = item.get("key")

  node = tree.Node("constant")
  node.set("name", name)

  commentNode = parseDocComment(item)
  if not commentNode:
    addError(node, "doc comment is missing", item)
  else:
    desc = commentNode.get("text")
    match = LEADING_TYPE_RE.search(desc)
    if match:
      addTypeInfo(node, match.group(1), match.group(2), match.group(5))
      commentNode.set("text", desc[match.end(0):])

    node.addChild(commentNode)

  classNode.addListChild("constants", node)



def handleFunction(funcItem, commentNode, classNode):
  if funcItem.type != "function":
    raise DocException("'funcItem' is no function", funcItem)

  node = tree.Node("method")

  # Read the parameters
  params = funcItem.getChild("params", False)
  if params:
    for param in params.children:
      paramNode = tree.Node("param")
      paramNode.set("name", param.getFirstChild().get("name"))
      node.addListChild("params", paramNode)

  # Check whether the function is abstract
  bodyBlockItem = funcItem.getChild("body").getFirstChild();
  if bodyBlockItem.type == "block" and bodyBlockItem.hasChildren():
    firstStatement = bodyBlockItem.children[0];
    if firstStatement.type == "throw":
      # The first statement of the function is a throw statement
      # -> The function is abstract
      node.set("isAbstract", "true")

  # Read the doc comment
  if commentNode and commentNode.hasChildren():
    attributesNode = commentNode.getChild("attributes")
    attributesCount = len(attributesNode.children)

    # Read all @param and @return attributes
    # NOTE: We have to go backwards, because we'll remove children
    for i in range(attributesCount):
      attrNode = attributesNode.children[attributesCount - i - 1]
      attrName = attrNode.get("name")
      attrText = attrNode.get("text")
      if attrName == "param":
        # This is a @param attribute
        attributesNode.removeChild(attrNode)

        match = COMMENT_PARAM_ATTR_RE.search(attrText)
        if not match:
          addError(node, "doc comment has malformed attribute 'param': " + attrText, funcItem)
          continue

        # Find the matching param node
        paramName = match.group(1)
        paramNode = node.getListChildByAttribute("params", "name", paramName, False)
        if not paramNode:
          addError(node, "doc comment has attribute 'param' for non-existing parameter: '" + paramName + "'", funcItem)
          continue

        # Add the type infos
        if match.group(3):
          addTypeInfo(paramNode, match.group(3), match.group(4), match.group(7))
        else:
          addError(node, "documentation of parameter: '" + paramName + "' has no type", funcItem)

        # Add the description
        paramNode.addChild(tree.Node("desc").set("text", attrText[match.end(0):]))
      elif attrName == "return":
        # This is a @return attribute
        attributesNode.removeChild(attrNode)

        returnNode = tree.Node("return")
        node.addChild(returnNode)

        match = LEADING_TYPE_RE.search(attrText)
        desc = attrText
        if match:
          addTypeInfo(returnNode, match.group(1), match.group(2), match.group(5))
          desc = attrText[match.end(0):]

        returnNode.addChild(tree.Node("desc").set("text", desc))

    # remove the attributes node from the comment if it has no children any more
    if not attributesNode.hasChildren():
      commentNode.removeChild(attributesNode)

  # Check for documentation errors
  if not commentNode:
    addError(node, "doc comment is missing", funcItem)
  else:
    # Check whether all parameters have been documented
    paramsListNode = node.getChild("params", False);
    if paramsListNode:
      for paramNode in paramsListNode.children:
        if not paramNode.getChild("desc", False):
          addError(node, "parameter '" + paramNode.get("name") + "' is not documented", funcItem)

  node.addChild(commentNode)

  return node



def addTypeInfo(node, dataType, arrayDims, defaultValue):
  if dataType:
    node.set("type", dataType)

  if arrayDims:
    node.set("arrayDimensions", str(len(arrayDims) / 2))

  if defaultValue:
    node.set("defaultValue", defaultValue)



def addError(node, msg, syntaxItem):
  errorNode = tree.Node("error")
  errorNode.set("msg", msg)

  line = getLineFromSyntaxItem(syntaxItem)
  if line:
    errorNode.set("line", line)

  node.addListChild("errors", errorNode)
  node.set("hasError", "true")



def getLineFromSyntaxItem(syntaxItem):
  line = None
  while line == None and syntaxItem:
    line = syntaxItem.get("line", False)
    if hasattr(syntaxItem, "parent"):
      syntaxItem = syntaxItem.parent
    else:
      syntaxItem = None
  return line



def getType(item):
  if item.type == "constant" and item.get("constantType") == "string":
    return item.get("value")
  elif item.type == "variable":
    assembled = assembleVariable(item)
    if assembled == "qx.constant.Type.NUMBER":
      return "number"
    elif assembled == "qx.constant.Type.BOOLEAN":
      return "boolean"
    elif assembled == "qx.constant.Type.STRING":
      return "string"
    elif assembled == "qx.constant.Type.OBJECT":
      return "object"
    elif assembled == "qx.constant.Type.FUNCTION":
      return "function"
    else:
      raise DocException("Unknown data type: " + assembled, item)
  else:
    raise DocException("Can't gess type. type is neither string nor variable: " + item.type, item)



def parseDocComment(item):
  """Takes the last doc comment from the commentsBefore child, parses it and
  returns a Node representing the doc comment"""

  # Find the last doc comment
  lastDoc = None
  commentsBefore = item.getChild("commentsBefore", False)
  if commentsBefore:
    for comment in commentsBefore.children:
      text = comment.get("text")
      if text.startswith("/**") or text.startswith("/*!"):
        # This is a doc comment
        lastDoc = text

  # Parse the doc comment
  if lastDoc:
    # Strip "/**" and "*/"
    lastDoc = lastDoc[3:-2]

    # Strip leading stars in every line
    lines = lastDoc.split("\n")
    lastDoc = ""
    for line in lines:
      lastDoc += re.sub(r'^\s*\*', '', line) + "\n"

    # Create the doc Node
    descNode = tree.Node("desc")

    # Search for attributes
    attrRe = re.compile(r'[^{]@(\w+)\s*')
    lastAttribNode = None
    pos = 0
    match = attrRe.search(lastDoc, pos) # TODO: Do this smarter (not twice)
    while match != None:
      textBefore = lastDoc[pos:match.start(0)].strip()
      if lastAttribNode == None:
        descNode.set("text", textBefore)
      else:
        lastAttribNode.set("text", textBefore)

      lastAttribNode = tree.Node("attribute")
      lastAttribNode.set("name", match.group(1))
      descNode.addListChild("attributes", lastAttribNode)

      pos = match.end(0)
      match = attrRe.search(lastDoc, pos) # TODO: Do this smarter (not twice)

    # Add the text after the last attribute
    lastText = lastDoc[pos:].strip()
    if lastAttribNode == None:
      descNode.set("text", lastText)
    else:
      lastAttribNode.set("text", lastText)

    #print "### found desc:"+tree.nodeToXmlString(descNode)

    return descNode



def getClassNode(docTree, className):
  splits = className.split(".")

  currPackage = docTree
  length = len(splits)
  for i in range(length):
    split = splits[i]

    if (i < length - 1):
      # This is a package name -> Get the right package
      childPackage = currPackage.getListChildByAttribute("packages", "name", split, False)
      if not childPackage:
        childPackageName = ".".join(splits[:-(length-i-1)])

        # The package does not exist -> Create it
        childPackage = tree.Node("package")
        childPackage.set("name", split)
        childPackage.set("fullName", childPackageName)
        childPackage.set("packageName", childPackageName.replace("." + split, ""))

        currPackage.addListChild("packages", childPackage)

      # Update current package
      currPackage = childPackage

    else:
      # This is a class name -> Get the right class
      classNode = currPackage.getListChildByAttribute("classes", "name", split, False)
      if not classNode:
        # The class does not exist -> Create it
        classNode = tree.Node("class")
        classNode.set("name", split)
        classNode.set("fullName", className)
        classNode.set("packageName", className.replace("." + split, ""))
        currPackage.addListChild("classes", classNode)

      return classNode



def postWorkPackage(docTree, packageNode):
  childHasError = False

  packages = packageNode.getChild("packages", False)
  if packages:
    packages.children.sort(nameComparator)
    for node in packages.children:
      hasError = postWorkPackage(docTree, node)
      if hasError:
        childHasError = True

  classes = packageNode.getChild("classes", False)
  if classes:
    classes.children.sort(nameComparator)
    for node in classes.children:
      hasError = postWorkClass(docTree, node)
      if hasError:
        childHasError = True

  if childHasError:
    packageNode.set("hasWarning", "true")

  return childHasError



def postWorkClass(docTree, classNode):
  # Sort child classes
  childClasses = classNode.get("childClasses", False)
  if childClasses:
    classArr = childClasses.split(",")
    classArr.sort()
    childClasses = ",".join(classArr)
    classNode.set("childClasses", childClasses)

  # Remove the property-modifier-methods
  removePropertyModifiers(classNode)

  # Mark overridden items
  postWorkItemList(docTree, classNode, "properties", True)
  postWorkItemList(docTree, classNode, "methods-pub", True)
  postWorkItemList(docTree, classNode, "methods-prot", True)
  postWorkItemList(docTree, classNode, "methods-static-pub", False)
  postWorkItemList(docTree, classNode, "methods-static-prot", False)

  # Check whether the class is static
  superClassName = classNode.get("superClass", False)
  if (superClassName == None or superClassName == "QxObject") \
    and classNode.getChild("properties", False) == None \
    and classNode.getChild("methods-pub", False) == None \
    and classNode.getChild("methods-prot", False) == None:
    # This class has is static
    classNode.set("isStatic", "true")

  # Check whether the class is abstract
  if isClassAbstract(docTree, classNode, {}):
    classNode.set("isAbstract", "true")

  # Check for errors
  childHasError = listHasError(classNode, "constructor") or listHasError(classNode, "properties") \
    or listHasError(classNode, "methods-pub") or listHasError(classNode, "methods-prot") \
    or listHasError(classNode, "methods-static-pub") or listHasError(classNode, "methods-static-prot") \
    or listHasError(classNode, "constants")

  if childHasError:
    classNode.set("hasWarning", "true")

  return childHasError



def isClassAbstract(docTree, classNode, visitedMethodNames):
  if containsAbstractMethods(classNode.getChild("methods-pub", False), visitedMethodNames) \
    or containsAbstractMethods(classNode.getChild("methods-prot", False), visitedMethodNames):
    # One of the methods is abstract
    return True

  # No abstract methods found -> Check whether the super class has abstract
  # methods that haven't been overridden
  superClassName = classNode.get("superClass", False)
  if superClassName:
    superClassNode = getClassNode(docTree, superClassName)
    return isClassAbstract(docTree, superClassNode, visitedMethodNames)



def containsAbstractMethods(methodListNode, visitedMethodNames):
  if methodListNode:
    for methodNode in methodListNode.children:
      name = methodNode.get("name")
      if not name in visitedMethodNames:
        visitedMethodNames[name] = True
        if methodNode.get("isAbstract", False):
          return True

  return False



def removePropertyModifiers(classNode):
  propertiesList = classNode.getChild("properties", False)
  methodsProtList = classNode.getChild("methods-prot", False)
  if propertiesList and methodsProtList:
    for propNode in propertiesList.children:
      name = propNode.get("name")
      upperName = name[0].upper() + name[1:]

      modifyNode = methodsProtList.getChildByAttribute("name", "_modify" + upperName, False)
      if modifyNode:
        methodsProtList.removeChild(modifyNode);

      changeNode = methodsProtList.getChildByAttribute("name", "_change" + upperName, False)
      if changeNode:
        methodsProtList.removeChild(changeNode);

      checkNode = methodsProtList.getChildByAttribute("name", "_check" + upperName, False)
      if checkNode:
        methodsProtList.removeChild(checkNode);

    if not methodsProtList.hasChildren():
      classNode.removeChild(methodsProtList)



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
      if overridable:
        superClassName = classNode.get("superClass", False)
        overriddenFound = False
        docFound = (itemNode.getChild("desc", False) != None)
        while superClassName and (not overriddenFound or not docFound):
          superClassNode = getClassNode(docTree, superClassName)
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
                docFound = (superItemNode.getChild("desc", False) != None)

                # Remove previously recorded documentation errors from the item
                # (Any documentation errors will be recorded in the super class)
                removeErrors(itemNode)
            if not overriddenFound:
              # This super class has the item defined -> Add a overridden attribute
              itemNode.set("overriddenFrom", superClassName)
              overriddenFound = True

          # Check the next superclass
          superClassName = superClassNode.get("superClass", False)

        if not docFound and itemNode.get("overriddenFrom", False):
          # This item is overridden, but we didn't find any documentation in the
          # super classes -> Add a warning
          itemNode.set("hasWarning", "true")



def paramsMatch(methodNode1, methodNode2):
  params1 = methodNode1.getChild("params1", False)
  params2 = methodNode1.getChild("params2", False)

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
  if errors:
    node.removeChild(errors)
    node.remove("hasError")



def sortByName(node, listName):
  listNode = node.getChild(listName, False)
  if listNode:
    listNode.children.sort(nameComparator)



def nameComparator(node1, node2):
  name1 = node1.get("name")
  name2 = node2.get("name")
  return cmp(name1, name2)



def listHasError(node, listName):
  listNode = node.getChild(listName, False)
  if listNode:
    for childNode in listNode.children:
      if childNode.get("hasError", False):
        return True

  return False
