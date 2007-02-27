/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)
#embed(apiviewer.image/*)

************************************************************************ */

/**
 * A util class for handling the documentation tree.
 */
qx.Clazz.define("apiviewer.TreeUtil",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    qx.core.Object.call(this);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Gets the child of a doc node having a certain type.
     *
     * @type static
     * @param docNode {Map} the doc node to get the child of.
     * @param childType {String} the type of the child to get.
     * @return {Map} the wanted child or <code>null</code> if <code>docNode</code>
     *           is <code>null</code> or has no such child.
     */
    getChild : function(docNode, childType)
    {
      if (docNode != null && docNode.children != null)
      {
        for (var i=0; i<docNode.children.length; i++)
        {
          if (docNode.children[i].type == childType) {
            return docNode.children[i];
          }
        }
      }

      return null;
    },


    /**
     * Gets the child of a doc node having a certain attribute value.
     *
     * @type static
     * @param docNode {Map} the doc node to get the child of.
     * @param attributeName {String} the name of the attribute the wanted child must have.
     * @param attributeValue {String} the value of the attribute the wanted child must have.
     * @return {Map} the wanted child or <code>code</code> if there is no such child.
     */
    getChildByAttribute : function(docNode, attributeName, attributeValue)
    {
      if (docNode.children != null)
      {
        for (var i=0; i<docNode.children.length; i++)
        {
          var node = docNode.children[i];

          if (node.attributes && node.attributes[attributeName] == attributeValue) {
            return node;
          }
        }
      }

      return null;
    },


    /**
     * Searches the doc node of a item. Only use this method if you don't know the
     * type of the item.
     *
     * @type static
     * @param classNode {Map} the class node the item belongs to.
     * @param itemName {String} the name of the item to search.
     * @return {Map} the doc node of the item or <code>null</code> if the class has
     *           no such item.
     */
    getItemDocNode : function(classNode, itemName)
    {
      var TreeUtil = apiviewer.TreeUtil;

      // Go through the item lists and check whether one contains the wanted item
      for (var i=0; i<TreeUtil.ITEM_LIST_ARR.length; i++)
      {
        var listNode = TreeUtil.getChild(classNode, TreeUtil.ITEM_LIST_ARR[i]);

        if (listNode)
        {
          var itemNode = TreeUtil.getChildByAttribute(listNode, "name", itemName);

          if (itemNode) {
            return itemNode;
          }
        }
      }

      // Nothing found
      return null;
    },


    /**
     * Gets the doc node of a class.
     *
     * @type static
     * @param docTree {Map} the documentation tree.
     * @param className {String} the name of the class.
     * @return {Map} the doc node of the class.
     */
    getClassDocNode : function(docTree, className)
    {
      var splits = className.split(".");
      var currNode = docTree;

      for (var i=0; i<splits.length&&currNode!=null; i++)
      {
        if (i < splits.length - 1)
        {
          // The current name is a package name
          var packages = this.getChild(currNode, "packages");
          currNode = packages ? this.getChildByAttribute(packages, "name", splits[i]) : null;
        }
        else
        {
          // The current name is a class name
          var classes = this.getChild(currNode, "classes");
          currNode = classes ? this.getChildByAttribute(classes, "name", splits[i]) : null;
        }
      }

      return currNode;
    },


    /**
     * Gets the icon URL of a doc node.
     *
     * @type static
     * @param node {Map} the node to get the icon for.
     * @param inherited {Boolean,false} whether the node was inherited.
     * @param context {var} TODOC
     * @return {var} the URL of the icon. May be a string or an array of string
     *           (in case of an overlay icon).
     * @throws TODOC
     */
    getIconUrl : function(node, inherited, context)
    {
      var constName;

      switch(node.type)
      {
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

        case "event":
          constName = "ICON_EVENT";
          break;

        case "method":
          var isCtor = node.attributes.name == null;
          var isPublic = isCtor || (node.attributes.name.charAt(0) != "_");

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

        default:
          throw new Error("Unknown node type: " + node.type);
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

      var iconUrl = apiviewer.TreeUtil[constName];

      if (iconUrl == null) {
        throw new Error("Unknown img constant: " + constName);
      }

      return iconUrl;
    },

    /** {string[]} The names of lists containing items. */
    ITEM_LIST_ARR : [ "constants", "properties", "methods-pub", "methods-pub", "methods-static-prot", "methods-static-prot" ],

    /** {string} The URL of the overlay "abstract". */
    OVERLAY_ABSTRACT : "api/image/overlay_abstract18.gif",

    /** {string} The URL of the overlay "error". */
    OVERLAY_ERROR : "api/image/overlay_error18.gif",

    /** {string} The URL of the overlay "inherited". */
    OVERLAY_INHERITED : "api/image/overlay_inherited18.gif",

    /** {string} The URL of the overlay "overridden". */
    OVERLAY_OVERRIDDEN : "api/image/overlay_overridden18.gif",

    /** {string} The URL of the overlay "static". */
    OVERLAY_STATIC : "api/image/overlay_static18.gif",

    /** {string} The URL of the overlay "warning". */
    OVERLAY_WARN : "api/image/overlay_warning18.gif",

    /** {string} The icon URL of a package. */
    ICON_PACKAGE : "api/image/package18.gif",

    /** {string} The icon URL of a package with warning. */
    ICON_PACKAGE_WARN : "api/image/package_warning18.gif",

    /** {string} The icon URL of a class. */
    ICON_CLASS : "api/image/class18.gif",

    /** {string} The icon URL of a class with warning. */
    ICON_CLASS_WARN : "api/image/class_warning18.gif",

    /** {string} The icon URL of a class with error. */
    ICON_CLASS_ERROR : "api/image/class_warning18.gif",

    /** {string} The icon URL of a static class. */
    ICON_CLASS_STATIC : "api/image/class_static18.gif",

    /** {string} The icon URL of a static class with warning. */
    ICON_CLASS_STATIC_WARN : "api/image/class_static_warning18.gif",

    /** {string} The icon URL of a static class with error. */
    ICON_CLASS_STATIC_ERROR : "api/image/class_static_warning18.gif",

    /** {string} The icon URL of an abstract class. */
    ICON_CLASS_ABSTRACT : "api/image/class_abstract18.gif",

    /** {string} The icon URL of an abstract class with warning. */
    ICON_CLASS_ABSTRACT_WARN : "api/image/class_abstract_warning18.gif",

    /** {string} The icon URL of an abstract class with error. */
    ICON_CLASS_ABSTRACT_ERROR : "api/image/class_abstract_warning18.gif",

    /** {string} The icon URL of a property. */
    ICON_PROPERTY : "api/image/property18.gif",

    /** {string} The icon URL of an event. */
    ICON_EVENT : "api/image/event18.gif",
    
    /** {string} The icon URL of a public method. */
    ICON_METHOD_PUB : "api/image/method_public18.gif",

    /** {string} The icon URL of a constructor. */
    ICON_METHOD_PUB_CTOR : "api/image/constructor18.gif",

    /** {string} The icon URL of a protected method. */
    ICON_METHOD_PROT : "api/image/method_protected18.gif",

    /** {string} The icon URL of a constant. */
    ICON_CONSTANT : "api/image/constant18.gif"
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members, properties)
  {
    /** {string[]} The icon URL of an inherited event. */
    statics.ICON_EVENT_INHERITED = [statics.ICON_EVENT, statics.OVERLAY_INHERITED ];
    
    /** {string} The icon URL of an event. */
    statics.ICON_EVENT_ERROR = [statics.ICON_EVENT, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a property with warning. */
    statics.ICON_PROPERTY_WARN = [statics.ICON_PROPERTY, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of a property with error. */
    statics.ICON_PROPERTY_ERROR = [statics.ICON_PROPERTY, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an inherited property. */
    statics.ICON_PROPERTY_INHERITED = [statics.ICON_PROPERTY, statics.OVERLAY_INHERITED ];

    /** {string[]} The icon URL of an inherited property with warning. */
    statics.ICON_PROPERTY_INHERITED_WARN = [statics.ICON_PROPERTY, statics.OVERLAY_INHERITED, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an inherited property with error. */
    statics.ICON_PROPERTY_INHERITED_ERROR = [statics.ICON_PROPERTY, statics.OVERLAY_INHERITED, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an overridden property. */
    statics.ICON_PROPERTY_OVERRIDDEN = [statics.ICON_PROPERTY, statics.OVERLAY_OVERRIDDEN ];

    /** {string[]} The icon URL of an overridden property with warning. */
    statics.ICON_PROPERTY_OVERRIDDEN_WARN = [statics.ICON_PROPERTY, statics.OVERLAY_OVERRIDDEN, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an overridden property with error. */
    statics.ICON_PROPERTY_OVERRIDDEN_ERROR = [statics.ICON_PROPERTY, statics.OVERLAY_OVERRIDDEN, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a public method with warning. */
    statics.ICON_METHOD_PUB_WARN = [statics.ICON_METHOD_PUB, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a public method with error. */
    statics.ICON_METHOD_PUB_ERROR = [statics.ICON_METHOD_PUB, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an inherited public method. */
    statics.ICON_METHOD_PUB_INHERITED = [statics.ICON_METHOD_PUB, statics.OVERLAY_INHERITED ];

    /** {string[]} The icon URL of an inherited public method with warning. */
    statics.ICON_METHOD_PUB_INHERITED_WARN = [statics.ICON_METHOD_PUB, statics.OVERLAY_INHERITED, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an inherited public method with error. */
    statics.ICON_METHOD_PUB_INHERITED_ERROR = [statics.ICON_METHOD_PUB, statics.OVERLAY_INHERITED, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an overridden public method. */
    statics.ICON_METHOD_PUB_OVERRIDDEN = [statics.ICON_METHOD_PUB, statics.OVERLAY_OVERRIDDEN ];

    /** {string[]} The icon URL of an overridden public method with warning. */
    statics.ICON_METHOD_PUB_OVERRIDDEN_WARN = [statics.ICON_METHOD_PUB, statics.OVERLAY_OVERRIDDEN, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an overridden public method with error. */
    statics.ICON_METHOD_PUB_OVERRIDDEN_ERROR = [statics.ICON_METHOD_PUB, statics.OVERLAY_OVERRIDDEN, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a public static method. */
    statics.ICON_METHOD_PUB_STATIC = [statics.ICON_METHOD_PUB, statics.OVERLAY_STATIC ];

    /** {string[]} The icon URL of a public static method with error. */
    statics.ICON_METHOD_PUB_STATIC_ERROR = [statics.ICON_METHOD_PUB, statics.OVERLAY_STATIC, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a public abstract method. */
    statics.ICON_METHOD_PUB_ABSTRACT = [statics.ICON_METHOD_PUB, statics.OVERLAY_ABSTRACT ];

    /** {string[]} The icon URL of a public abstract method with warning. */
    statics.ICON_METHOD_PUB_ABSTRACT_WARN = [statics.ICON_METHOD_PUB, statics.OVERLAY_ABSTRACT, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of a public abstract method with error. */
    statics.ICON_METHOD_PUB_ABSTRACT_ERROR = [statics.ICON_METHOD_PUB, statics.OVERLAY_ABSTRACT, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an overridden public abstract method. */
    statics.ICON_METHOD_PUB_ABSTRACT_OVERRIDDEN = [statics.ICON_METHOD_PUB, statics.OVERLAY_ABSTRACT, statics.OVERLAY_OVERRIDDEN ];

    /** {string[]} The icon URL of an overridden public abstract method with warning. */
    statics.ICON_METHOD_PUB_ABSTRACT_OVERRIDDEN_WARN = [statics.ICON_METHOD_PUB, statics.OVERLAY_ABSTRACT, statics.OVERLAY_OVERRIDDEN, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an overridden public abstract method with error. */
    statics.ICON_METHOD_PUB_ABSTRACT_OVERRIDDEN_ERROR = [statics.ICON_METHOD_PUB, statics.OVERLAY_ABSTRACT, statics.OVERLAY_OVERRIDDEN, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an inherited public abstract method. */
    statics.ICON_METHOD_PUB_ABSTRACT_INHERITED = [statics.ICON_METHOD_PUB, statics.OVERLAY_ABSTRACT, statics.OVERLAY_INHERITED ];

    /** {string[]} The icon URL of an inherited public abstract method with warning. */
    statics.ICON_METHOD_PUB_ABSTRACT_INHERITED_WARN = [statics.ICON_METHOD_PUB, statics.OVERLAY_ABSTRACT, statics.OVERLAY_INHERITED, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an inherited public abstract method with error. */
    statics.ICON_METHOD_PUB_ABSTRACT_INHERITED_ERROR = [statics.ICON_METHOD_PUB, statics.OVERLAY_ABSTRACT, statics.OVERLAY_INHERITED, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a constructor with error. */
    statics.ICON_METHOD_PUB_CTOR_ERROR = [statics.ICON_METHOD_PUB_CTOR, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a protected method with warning. */
    statics.ICON_METHOD_PROT_WARN = [statics.ICON_METHOD_PROT, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a protected method with error. */
    statics.ICON_METHOD_PROT_ERROR = [statics.ICON_METHOD_PROT, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an inherited protected method. */
    statics.ICON_METHOD_PROT_INHERITED = [statics.ICON_METHOD_PROT, statics.OVERLAY_INHERITED ];

    /** {string[]} The icon URL of an inherited protected method with warning. */
    statics.ICON_METHOD_PROT_INHERITED_WARN = [statics.ICON_METHOD_PROT, statics.OVERLAY_INHERITED, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an inherited protected method with error. */
    statics.ICON_METHOD_PROT_INHERITED_ERROR = [statics.ICON_METHOD_PROT, statics.OVERLAY_INHERITED, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an overridden protected method. */
    statics.ICON_METHOD_PROT_OVERRIDDEN = [statics.ICON_METHOD_PROT, statics.OVERLAY_OVERRIDDEN ];

    /** {string[]} The icon URL of an overridden protected method with warning. */
    statics.ICON_METHOD_PROT_OVERRIDDEN_WARN = [statics.ICON_METHOD_PROT, statics.OVERLAY_OVERRIDDEN, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an overridden protected method with error. */
    statics.ICON_METHOD_PROT_OVERRIDDEN_ERROR = [statics.ICON_METHOD_PROT, statics.OVERLAY_OVERRIDDEN, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a protected static method. */
    statics.ICON_METHOD_PROT_STATIC = [statics.ICON_METHOD_PROT, statics.OVERLAY_STATIC ];

    /** {string[]} The icon URL of a protected static method with error. */
    statics.ICON_METHOD_PROT_STATIC_ERROR = [statics.ICON_METHOD_PROT, statics.OVERLAY_STATIC, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an abstract protected method. */
    statics.ICON_METHOD_PROT_ABSTRACT = [statics.ICON_METHOD_PROT, statics.OVERLAY_ABSTRACT ];

    /** {string[]} The icon URL of an abstract protected method with warning. */
    statics.ICON_METHOD_PROT_ABSTRACT_WARN = [statics.ICON_METHOD_PROT, statics.OVERLAY_ABSTRACT, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an abstract protected method with error. */
    statics.ICON_METHOD_PROT_ABSTRACT_ERROR = [statics.ICON_METHOD_PROT, statics.OVERLAY_ABSTRACT, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of an inherited abstract protected method. */
    statics.ICON_METHOD_PROT_ABSTRACT_INHERITED = [statics.ICON_METHOD_PROT, statics.OVERLAY_ABSTRACT, statics.OVERLAY_INHERITED ];

    /** {string[]} The icon URL of an inherited abstract protected method with warning. */
    statics.ICON_METHOD_PROT_ABSTRACT_INHERITED_WARN = [statics.ICON_METHOD_PROT, statics.OVERLAY_ABSTRACT, statics.OVERLAY_INHERITED, statics.OVERLAY_WARN ];

    /** {string[]} The icon URL of an inherited abstract protected method with error. */
    statics.ICON_METHOD_PROT_ABSTRACT_INHERITED_ERROR = [statics.ICON_METHOD_PROT, statics.OVERLAY_ABSTRACT, statics.OVERLAY_INHERITED, statics.OVERLAY_ERROR ];

    /** {string[]} The icon URL of a constant with error. */
    statics.ICON_CONSTANT_ERROR = [statics.ICON_CONSTANT, statics.OVERLAY_ERROR ];
  }
});
