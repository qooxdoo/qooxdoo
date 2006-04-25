/**
 * A util class for handling the documentation tree.
 */
qx.apiviewer.TreeUtil = function () {
  QxObject.call(this);
};

clazz = qx.apiviewer.TreeUtil;

clazz.extend(QxObject, "qx.apiviewer.TreeUtil");


/**
 * Gets the child of a doc node having a certain type.
 *
 * @param docNode {Map} the doc node to get the child of.
 * @param childType {string} the type of the child to get.
 * @return {Map} the wanted child or <code>null</code> if <code>docNode</code>
 *         is <code>null</code> or has no such child.
 */
clazz.getChild = function(docNode, childType) {
  if (docNode != null && docNode.children != null) {
    for (var i = 0; i < docNode.children.length; i++) {
      if (docNode.children[i].type == childType) {
        return docNode.children[i];
      }
    }
  }

  return null;
};


/**
 * Gets the child of a doc node having a certain attribute value.
 *
 * @param docNode {Map} the doc node to get the child of.
 * @param attributeName {string} the name of the attribute the wanted child must have.
 * @param attributeValue {string} the value of the attribute the wanted child must have.
 * @return {Map} the wanted child or <code>code</code> if there is no such child.
 */
clazz.getChildByAttribute = function(docNode, attributeName, attributeValue) {
  if (docNode.children != null) {
    for (var i = 0; i < docNode.children.length; i++) {
      var node = docNode.children[i];
      if (node.attributes && node.attributes[attributeName] == attributeValue) {
        return node;
      }
    }
  }

  return null;
};


/**
 * Searches the doc node of a item. Only use this method if you don't know the
 * type of the item.
 *
 * @param classNode {Map} the class node the item belongs to.
 * @param itemName {string} the name of the item to search.
 * @return {Map} the doc node of the item or <code>null</code> if the class has
 *         no such item.
 */
clazz.getItemDocNode = function(classNode, itemName) {
  var TreeUtil = qx.apiviewer.TreeUtil;

  // Go through the item lists and check whether one contains the wanted item
  for (var i = 0; i < TreeUtil.ITEM_LIST_ARR.length; i++) {
    var listNode = TreeUtil.getChild(classNode, TreeUtil.ITEM_LIST_ARR[i]);
    if (listNode) {
      var itemNode = TreeUtil.getChildByAttribute(listNode, "name", itemName);
      if (itemNode) {
        return itemNode;
      }
    }
  }

  // Nothing found
  return null;
};


/**
 * Gets the doc node of a class.
 *
 * @param docTree {Map} the documentation tree.
 * @param className {string} the name of the class.
 * @return {Map} the doc node of the class.
 */
clazz.getClassDocNode = function(docTree, className) {
  var splits = className.split(".");
  var currNode = docTree;
  for (var i = 0; i < splits.length && currNode != null; i++) {
    if (i < splits.length - 1) {
      // The current name is a package name
      var packages = this.getChild(currNode, "packages");
      currNode = packages ? this.getChildByAttribute(packages, "name", splits[i]) : null;
    } else {
      // The current name is a class name
      var classes = this.getChild(currNode, "classes");
      currNode = classes ? this.getChildByAttribute(classes, "name", splits[i]) : null;
    }
  }

  return currNode;
};


/**
 * Gets the icon URL of a doc node.
 *
 * @param node {Map} the node to get the icon for.
 * @param inherited {boolean,false} whether the node was inherited.
 * @return {var} the URL of the icon. May be a string or an array of string
 *         (in case of an overlay icon).
 */
clazz.getIconUrl = function(node, inherited) {
  var constName;
  switch (node.type) {
    case "package":
      constName = "ICON_PACKAGE";
      break;
    case "class":
      constName = "ICON_CLASS";

      if (node.attributes.isStatic) {
        constName += "_STATIC";
      } else if (node.attributes.isAbstract) {
        constName += "_ABSTRACT";
      }

      break;
    case "property":
      constName = "ICON_PROPERTY";
      break;
    case "method":
      var isCtor = node.attributes.name == null;
      var isPublic = isCtor || (node.attributes.name[0] != "_");

      constName = "ICON_METHOD" + (isPublic ? "_PUB" : "_PROT");

      if (isCtor) {
        constName += "_CTOR";
      } else if (node.attributes.isStatic) {
        constName += "_STATIC";
      } else if (node.attributes.isAbstract) {
        constName += "_ABSTRACT";
      }

      break;
    case "constant":
      constName = "ICON_CONSTANT";
      break;
    default: throw new Error("Unknown node type: " + node.type);
  }

  if (inherited) {
    constName += "_INHERITED";
  } else if (node.attributes.overriddenFrom) {
    constName += "_OVERRIDDEN";
  }

  if (node.attributes.hasError) {
    constName += "_ERROR";
  } else if (node.attributes.hasWarning) {
    constName += "_WARN";
  }

  var iconUrl = qx.apiviewer.TreeUtil[constName];
  if (iconUrl == null) {
    throw new Error("Unknown img constant: " + constName);
  }
  return iconUrl;
};


/** {string[]} The names of lists containing items. */
clazz.ITEM_LIST_ARR = [ "constants", "properties", "methods-pub", "methods-pub",
                        "methods-static-prot", "methods-static-prot" ];


/** {string} The URL of the overlay "abstract". */
clazz.OVERLAY_ABSTRACT   = "images/overlay_abstract18.gif";
/** {string} The URL of the overlay "constructor". */
clazz.OVERLAY_CTOR       = "images/overlay_constructor18.gif";
/** {string} The URL of the overlay "error". */
clazz.OVERLAY_ERROR      = "images/overlay_error18.gif";
/** {string} The URL of the overlay "inherited". */
clazz.OVERLAY_INHERITED  = "images/overlay_inherited18.gif";
/** {string} The URL of the overlay "overridden". */
clazz.OVERLAY_OVERRIDDEN = "images/overlay_overridden18.gif";
/** {string} The URL of the overlay "static". */
clazz.OVERLAY_STATIC     = "images/overlay_static18.gif";
/** {string} The URL of the overlay "warning". */
clazz.OVERLAY_WARN       = "images/overlay_warning18.gif";


/** {string} The icon URL of a package. */
clazz.ICON_PACKAGE      = "images/package18.gif";
/** {string} The icon URL of a package with warning. */
clazz.ICON_PACKAGE_WARN = "images/package_warning18.gif";


/** {string} The icon URL of a class. */
clazz.ICON_CLASS      = "images/class18.gif";
/** {string} The icon URL of a class with warning. */
clazz.ICON_CLASS_WARN = "images/class_warning18.gif";

/** {string} The icon URL of a static class. */
clazz.ICON_CLASS_STATIC      = "images/class_static18.gif";
/** {string} The icon URL of a static class with warning. */
clazz.ICON_CLASS_STATIC_WARN = "images/class_static_warning18.gif";

/** {string} The icon URL of an abstract class. */
clazz.ICON_CLASS_ABSTRACT      = "images/class_abstract18.gif";
/** {string} The icon URL of an abstract class with warning. */
clazz.ICON_CLASS_ABSTRACT_WARN = "images/class_abstract_warning18.gif";


/** {string} The icon URL of a property. */
clazz.ICON_PROPERTY       = "images/property18.gif";
/** {string[]} The icon URL of a property with warning. */
clazz.ICON_PROPERTY_WARN  = [ clazz.ICON_PROPERTY, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of a property with error. */
clazz.ICON_PROPERTY_ERROR = [ clazz.ICON_PROPERTY, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of an inherited property. */
clazz.ICON_PROPERTY_INHERITED       = [ clazz.ICON_PROPERTY, clazz.OVERLAY_INHERITED ];
/** {string[]} The icon URL of an inherited property with warning. */
clazz.ICON_PROPERTY_INHERITED_WARN  = [ clazz.ICON_PROPERTY, clazz.OVERLAY_INHERITED, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of an inherited property with error. */
clazz.ICON_PROPERTY_INHERITED_ERROR = [ clazz.ICON_PROPERTY, clazz.OVERLAY_INHERITED, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of an overridden property. */
clazz.ICON_PROPERTY_OVERRIDDEN       = [ clazz.ICON_PROPERTY, clazz.OVERLAY_OVERRIDDEN ];
/** {string[]} The icon URL of an overridden property with warning. */
clazz.ICON_PROPERTY_OVERRIDDEN_WARN  = [ clazz.ICON_PROPERTY, clazz.OVERLAY_OVERRIDDEN, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of an overridden property with error. */
clazz.ICON_PROPERTY_OVERRIDDEN_ERROR = [ clazz.ICON_PROPERTY, clazz.OVERLAY_OVERRIDDEN, clazz.OVERLAY_ERROR ];


/** {string} The icon URL of a public method. */
clazz.ICON_METHOD_PUB       = "images/method_public18.gif";
/** {string[]} The icon URL of a public method with warning. */
clazz.ICON_METHOD_PUB_WARN  = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_ERROR ];
/** {string[]} The icon URL of a public method with error. */
clazz.ICON_METHOD_PUB_ERROR = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of an inherited public method. */
clazz.ICON_METHOD_PUB_INHERITED       = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_INHERITED ];
/** {string[]} The icon URL of an inherited public method with warning. */
clazz.ICON_METHOD_PUB_INHERITED_WARN  = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_INHERITED, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of an inherited public method with error. */
clazz.ICON_METHOD_PUB_INHERITED_ERROR = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_INHERITED, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of an overridden public method. */
clazz.ICON_METHOD_PUB_OVERRIDDEN       = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_OVERRIDDEN ];
/** {string[]} The icon URL of an overridden public method with warning. */
clazz.ICON_METHOD_PUB_OVERRIDDEN_WARN  = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_OVERRIDDEN, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of an overridden public method with error. */
clazz.ICON_METHOD_PUB_OVERRIDDEN_ERROR = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_OVERRIDDEN, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of a constructor. */
clazz.ICON_METHOD_PUB_CTOR       = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_CTOR ];
/** {string[]} The icon URL of a constructor with error. */
clazz.ICON_METHOD_PUB_CTOR_ERROR = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_CTOR, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of a public static method. */
clazz.ICON_METHOD_PUB_STATIC       = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_STATIC ];
/** {string[]} The icon URL of a public static method with error. */
clazz.ICON_METHOD_PUB_STATIC_ERROR = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_STATIC, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of a public abstract method. */
clazz.ICON_METHOD_PUB_ABSTRACT       = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_ABSTRACT ];
/** {string[]} The icon URL of a public abstract method with warning. */
clazz.ICON_METHOD_PUB_ABSTRACT_WARN  = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of a public abstract method with error. */
clazz.ICON_METHOD_PUB_ABSTRACT_ERROR = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of an inherited public abstract method. */
clazz.ICON_METHOD_PUB_ABSTRACT_INHERITED       = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_INHERITED ];
/** {string[]} The icon URL of an inherited public abstract method with warning. */
clazz.ICON_METHOD_PUB_ABSTRACT_INHERITED_WARN  = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_INHERITED, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of an inherited public abstract method with error. */
clazz.ICON_METHOD_PUB_ABSTRACT_INHERITED_ERROR = [ clazz.ICON_METHOD_PUB, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_INHERITED, clazz.OVERLAY_ERROR ];


/** {string} The icon URL of a protected method. */
clazz.ICON_METHOD_PROT       = "images/method_protected18.gif";
/** {string[]} The icon URL of a protected method with warning. */
clazz.ICON_METHOD_PROT_WARN  = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_ERROR ];
/** {string[]} The icon URL of a protected method with error. */
clazz.ICON_METHOD_PROT_ERROR = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of an inherited protected method. */
clazz.ICON_METHOD_PROT_INHERITED       = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_INHERITED ];
/** {string[]} The icon URL of an inherited protected method with warning. */
clazz.ICON_METHOD_PROT_INHERITED_WARN  = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_INHERITED, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of an inherited protected method with error. */
clazz.ICON_METHOD_PROT_INHERITED_ERROR = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_INHERITED, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of an overridden protected method. */
clazz.ICON_METHOD_PROT_OVERRIDDEN       = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_OVERRIDDEN ];
/** {string[]} The icon URL of an overridden protected method with warning. */
clazz.ICON_METHOD_PROT_OVERRIDDEN_WARN  = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_OVERRIDDEN, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of an overridden protected method with error. */
clazz.ICON_METHOD_PROT_OVERRIDDEN_ERROR = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_OVERRIDDEN, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of a protected static method. */
clazz.ICON_METHOD_PROT_STATIC       = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_STATIC ];
/** {string[]} The icon URL of a protected static method with error. */
clazz.ICON_METHOD_PROT_STATIC_ERROR = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_STATIC, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of an abstract protected method. */
clazz.ICON_METHOD_PROT_ABSTRACT       = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_ABSTRACT ];
/** {string[]} The icon URL of an abstract protected method with warning. */
clazz.ICON_METHOD_PROT_ABSTRACT_WARN  = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of an abstract protected method with error. */
clazz.ICON_METHOD_PROT_ABSTRACT_ERROR = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_ERROR ];

/** {string[]} The icon URL of an inherited abstract protected method. */
clazz.ICON_METHOD_PROT_ABSTRACT_INHERITED       = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_INHERITED ];
/** {string[]} The icon URL of an inherited abstract protected method with warning. */
clazz.ICON_METHOD_PROT_ABSTRACT_INHERITED_WARN  = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_INHERITED, clazz.OVERLAY_WARN ];
/** {string[]} The icon URL of an inherited abstract protected method with error. */
clazz.ICON_METHOD_PROT_ABSTRACT_INHERITED_ERROR = [ clazz.ICON_METHOD_PROT, clazz.OVERLAY_ABSTRACT, clazz.OVERLAY_INHERITED, clazz.OVERLAY_ERROR ];


/** {string} The icon URL of a constant. */
clazz.ICON_CONSTANT       = "images/constant18.gif";
/** {string[]} The icon URL of a constant with error. */
clazz.ICON_CONSTANT_ERROR = [ clazz.ICON_CONSTANT, clazz.OVERLAY_ERROR ];
