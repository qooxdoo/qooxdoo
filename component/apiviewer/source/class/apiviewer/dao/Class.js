/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This Class wraps the access to the documentation data of classes.
 */
qx.Class.define("apiviewer.dao.Class",
{
  extend : apiviewer.dao.Node,

  /**
   * @param classDocNode {Map} class documentation node
   */
  construct : function(classDocNode, pkg)
  {
    this.base(arguments, classDocNode);
    this.self(arguments).registerClass(this);
    this._package = pkg;
  },


  statics :
  {
    _class_registry : {},
    _top_level_classes : [],

    /**
     * Register a class to to be used by {@link #getClassByName}.
     *
     * @param cls {apiviewer.dao.Class} The class to register.
     */
    registerClass : function(cls)
    {
      if (!cls.getFullName())
      {
        return;
      }
      this._class_registry[cls.getFullName()] = cls;
      if (!cls._docNode.attributes.superClass) {
        this._top_level_classes.push(cls);
      }
    },


    /**
     * Get a class documentation by the class name.
     *
     * @param className {String} name of the class
     * @return {apiviewer.dao.Class} The class documentation
     */
    getClassByName : function(className)
    {
      return this._class_registry[className];
    },


    /**
     * Get a list of all top level classes. Top level classes are classes
     * without super class.
     *
     * @return {apiviewer.dao.Class[]} List of top level classes.
     */
    getAllTopLevelClasses : function()
    {
      return this._top_level_classes;
    }

  },


  members :
  {

    /**
     * Get the name of the class.
     *
     * @return {String} name of the class
     */
    getName : function()
    {
      return this._docNode.attributes.name;
    },


    /**
     * Return the class
     *
     * @return {apiviewer.dao.Class} the class.
     */
    getClass : function()
    {
      return this;
    },


    getPackage : function()
    {
      return this._package;
    },


    isLoaded : function()
    {
      return this._docNode.attributes.externalRef != "true";
    },


    /**
     * Get the full name of the class, including the package name.
     *
     * @return {String} full name of the class
     */
    getFullName : function()
    {
      return this._docNode.attributes.fullName || "";
    },


    /**
     * Get the package name of the class.
     *
     * @return {String} package name of the class
     */
    getPackageName : function()
    {
      return this._docNode.attributes.packageName || "";
    },


    /**
     * Get class description
     *
     * @return {String} class description
     */
    getDescription : function()
    {
      return this._desc || "";
    },


    /**
     * Get type of the class. Valid types are "class", "interface" and "mixin".
     *
     * @return {String} The type of the class. Valid types are "class", "interface" and "mixin".
     */
    getType : function()
    {
      return this._docNode.attributes.type || "class";
    },


    /**
     * Get whether the class is abstract.
     *
     * @return {Boolean} Whether the class is abstract.
     */
    isAbstract : function()
    {
      return this._docNode.attributes.isAbstract || false;
    },


    /**
     * Get whether the class is a static class.
     *
     * @return {Boolean} Whether the class is static.
     */
    isStatic : function()
    {
      return this._docNode.attributes.isStatic || false;
    },


    /**
     * Get whether the class is a singleton.
     *
     * @return {Boolean} Whether the class is a singleton.
     */
    isSingleton : function()
    {
      return this._docNode.attributes.isSingleton || false;
    },


    /**
     * Get all references declared using the "see" attribute.
     *
     * @return {String[]} A list of all references declared using the "see" attribute.
     */
    getSee : function()
    {
      return this._see;
    },


    /**
     * Get the super class of the class.
     *
     * @return {apiviewer.dao.Class} The super class of the class.
     */
    getSuperClass : function()
    {
      return this.self(arguments).getClassByName(this._docNode.attributes.superClass);
    },


    /**
     * Get the dircet child classes of the class.
     *
     * @return {apiviewer.dao.Class[]} A list of direct child classes of the class.
     */
    getChildClasses : function()
    {
      return this._docNode.attributes.childClasses ? this._docNode.attributes.childClasses.split(",") : [];
    },


    /**
     * Get all interfaces declared at the class declaration.
     *
     * @return {apiviewer.dao.Class[]} All interfaces declared at the class declaration.
     */
    getInterfaces : function()
    {
      return this._docNode.attributes.interfaces ? this._docNode.attributes.interfaces.split(",") : [];
    },


    /**
     * Get all mixins declared at the class declaration.
     *
     * @return {apiviewer.dao.Class[]} All mixins declared at the class declaration.
     */
    getMixins : function()
    {
      return this._docNode.attributes.mixins ? this._docNode.attributes.mixins.split(",") : [];
    },


    /**
     * Get all implementations of this interface.
     * (Only for interfaces)
     *
     * @return {apiviewer.dao.Class[]} All implementations of this interface.
     */
    getImplementations : function()
    {
      return this._docNode.attributes.implementations ? this._docNode.attributes.implementations.split(",") : [];
    },


    /**
     * Get all classes including this mixin.
     * (Only for mixins)
     *
     * @return {apiviewer.dao.Class[]} All classes including this mixin.
     */
    getIncluder : function()
    {
      return this._docNode.attributes.includer ? this._docNode.attributes.includer.split(",") : [];
    },

    /**
     * Get the constructor of the class.
     *
     * @return {apiviewer.dao.Method} The constructor of the class.
     */
    getConstructor : function()
    {
      if (this._constructor != null) {
        return this._constructor;
      }

      var node = apiviewer.TreeUtil.getChild(this.getNode(), "constructor");
      if (node)
      {
        this._constructor = new apiviewer.dao.Method(node.children[0], this, node.type);
      }
      else
      {
        this._constructor = "";
        var superClass = this.getSuperClass();
        while (superClass)
        {
          var superConstructor = superClass.getConstructor();
          if (superConstructor)
          {
            var node = superConstructor.getNode();
            this._constructor = new apiviewer.dao.Method(node, this, "constructor");
            break;
          }
          superClass = superClass.getSuperClass();
        }
      }
      return this._constructor;
    },


    /**
     * Get the members of the class.
     *
     * @return {apiviewer.dao.Method[]} The members of the class.
     */
    getMembers : function()
    {
      if (this._members != null) {
        return this._members;
      } else {
        var node = apiviewer.TreeUtil.getChild(this.getNode(), "methods");
        this._members = node ? this._createNodeList(node, apiviewer.dao.Method, this, node.type) : [];
        return this._members;
      }
    },


    /**
     * Get the statics of the class.
     *
     * @return {apiviewer.dao.Method[]} The statics of the class.
     */
    getStatics : function()
    {
      if (this._statics != null) {
        return this._statics;
      } else {
        var node = apiviewer.TreeUtil.getChild(this.getNode(), "methods-static");
        this._statics = node ? this._createNodeList(node, apiviewer.dao.Method, this, node.type) : [];
        return this._statics;
      }
    },


    /**
     * Get the events of the class.
     *
     * @return {apiviewer.dao.Event[]} The events of the class.
     */
    getEvents : function()
    {
      if (this._events != null) {
        return this._events;
      } else {
        var node = apiviewer.TreeUtil.getChild(this.getNode(), "events");
        this._events = node ? this._createNodeList(node, apiviewer.dao.Event, this, node.type) : [];
        return this._events;
      }
    },


    /**
     * Get the properties of the class.
     *
     * @return {apiviewer.dao.Property[]} The properties of the class.
     */
    getProperties : function()
    {
      if (this._properties != null) {
        return this._properties;
      } else {
        var node = apiviewer.TreeUtil.getChild(this.getNode(), "properties");
        this._properties = node ? this._createNodeList(node, apiviewer.dao.Property, this, node.type) : [];
        return this._properties;
      }
    },


    /**
     * Get the constants of the class.
     *
     * @return {apiviewer.dao.Constant[]} The constants of the class.
     */
    getConstants : function()
    {
      if (this._constants != null) {
        return this._constants;
      } else {
        var node = apiviewer.TreeUtil.getChild(this.getNode(), "constants");
        this._constants = node ? this._createNodeList(node, apiviewer.dao.Constant, this, node.type) : [];
        return this._constants;
      }
    },


    /**
     * Get the appearances of the class.
     *
     * @return {apiviewer.dao.Appearance[]} The appearances of the class.
     */
    getAppearances : function()
    {
      if (this._appearances != null) {
        return this._appearances;
      } else {
        var node = apiviewer.TreeUtil.getChild(this.getNode(), "appearances");
        this._appearances = node ? this._createNodeList(node, apiviewer.dao.Appearance, this, node.type) : [];
        return this._appearances;
      }
    },


    /**
     * Get all super interfaces.
     * (Only for interfaces)
     *
     * @return {apiviewer.dao.Class[]} All super interfaces.
     */
    getSuperInterfaces : function() {
      return this._superInterfaces;
    },


    /**
     * Get all super mixins.
     * (Only for mixins)
     *
     * @return {apiviewer.dao.Class[]} All super mixins.
     */
    getSuperMixins : function() {
      return this._superMixins;
    },


    /* COMPLEX FUNCTIONS */

    /**
     * Get the documentation nodes of all classes in the inheritance chain
     * of a class. The first entry in the list is the class itself.
     *
     * @return {apiviewer.dao.Class[]} array of super classes of the given class.
     */
    getClassHierarchy : function()
    {
      var result = [];
      var currentClass = this;
      while (currentClass) {
        result.push(currentClass);
        currentClass = currentClass.getSuperClass();
      }
      return result;
    },


    /**
     * Return a class item matching the given name.
     *
     * @param itemName {String} name of the class item
     * @return {apiviewer.dao.ClassItem} the class item.
     */
    getItem : function(itemName)
    {
      var itemListNames = [
        "getMembers",
        "getStatics",
        "getEvents",
        "getProperties",
        "getConstants",
        "getAppearances"
      ];

      for (var i=0; i<itemListNames.length; i++)
      {
        var list = this[itemListNames[i]]();
        for (var j=0; j<list.length; j++)
        {
          if (itemName == list[j].getName()) {
            return list[j];
          }
        }
      }

    },


    /**
     * Get an array of class items matching the given list name. Known list names are:
     * <ul>
     *   <li>events</li>
     *   <li>constructor</li>
     *   <li>properties</li>
     *   <li>methods</li>
     *   <li>methods-static</li>
     *   <li>constants</li>
     *   <li>appearances</li>
     *   <li>superInterfaces</li>
     *   <li>superMixins</li>
     * </li>
     *
     * @param listName {String} name of the item list
     * @return {apiviewer.dao.ClassItem[]} item list
     */
    getItemList : function(listName)
    {
      var methodMap =
      {
        "events" : "getEvents",
        "constructor": "getConstructor",
        "properties" : "getProperties",
        "methods" : "getMembers",
        "methods-static" : "getStatics",
        "constants" : "getConstants",
        "appearances" : "getAppearances",
        "superInterfaces" : "getSuperInterfaces",
        "superMixins" : "getSuperMixins"
      };

      if (listName == "constructor") {
        return this.getConstructor() ? [this.getConstructor()] : [];
      } else {
        return this[methodMap[listName]]();
      }
    },


    /**
     * Get a class item by the item list name and the item name.
     * Valid item list names aer documented at {@link #getItemList}.
     * .
     * @param listName {String} name of the item list.
     * @param itemName {String} name of the class item.
     * @return {apiviewer.dao.ClassItem} the matching class item.
     */
    getItemByListAndName : function(listName, itemName)
    {
      var list = this.getItemList(listName);
      for (var j=0; j<list.length; j++)
      {
        if (itemName == list[j].getName()) {
          return list[j];
        }
      }
    },


    /**
     * Get the dafault appearance of the class
     *
     * @return {Appearance} the default appearance of the class.
     */
    getClassAppearance : function()
    {
      var appearances = this.getAppearances();
      for (var i=0; i<appearances.length; i++)
      {
        if (appearances[i].getType() == this)
        {
          return appearances[i];
        }
      }
      return null;
    },


    /**
     * Returns a list of all interfaces the class implements directly.
     *
     * @param includeSuperClasses {Boolean?false} Whether the interfaces of all
     *   super classes should be returned as well.
     */
    getAllInterfaces : function(includeSuperClasses)
    {
      if (includeSuperClasses) {
        var classNodes = this.getClassHierarchy();
      } else {
        classNodes = [this];
      }

      var interfaceNodes = [];

      for (var classIndex=0; classIndex<classNodes.length; classIndex++)
      {
        var classNode = classNodes[classIndex];

        var ifaceRecurser = function(ifaceName) {
          var ifaceNode = apiviewer.dao.Class.getClassByName(ifaceName);
          interfaceNodes.push(ifaceNode);

          var superIfaces = ifaceNode.getSuperInterfaces();
          for (var i=0; i<superIfaces.length; i++) {
            ifaceRecurser(superIfaces[i].getName());
          }
        }

        var interfaces = classNode.getInterfaces();
        for (var i=0; i<interfaces.length; i++) {
          ifaceRecurser(interfaces[i]);
        }

      }
      return interfaceNodes;
    },


    /**
     * Return a list of all class items of from all mixins of a class
     *
     * @param itemName {String} name if the item list. e.g. "constants", "methods-static", "methods", ...
     * @return {apiviewer.dao.ClassItem[]} list of all class items of a panel from all mixins of the class
     */
    getNodesOfTypeFromMixins : function(itemName)
    {
      var mixins = this.getMixins();
      var classItems = []
      for (var mixinIndex=0; mixinIndex<mixins.length; mixinIndex++)
      {
        var mixinRecurser = function(mixinNode)
        {
          var items = mixinNode.getItemList(itemName);
          for (var i=0; i<items.length; i++) {
            classItems.push(items[i]);
          }

          // recursive decent
          var superClasses = mixinNode.getSuperMixins();
          for (var i=0; i<superClasses.length; i++) {
            mixinRecurser(apiviewer.dao.Class.getClassByName(superClasses[i].getName()));
          }
        }

        var mixinNode = apiviewer.dao.Class.getClassByName(mixins[mixinIndex]);
        mixinRecurser(mixinNode);

      }
      return classItems;
    },


    /**
     * Return a list of all classes, mixins and interfaces this class depends on.
     * This includes all super classes and their mixins/interfaces and the class itself.
     *
     * @return {Class[]} array of dependent classes.
     */
    getDependendClasses : function() {
      return this._findClasses(this, []);
    },


    /**
     * Get the node, which contains the documentation for this node. Overridden properties
     * and methods may refer to the overridden item for documentation.
     *
     * @return {ClassItem} The node, which contains the documentation for this node.
     */
    getDocNode : function() {
      return this;
    },


    _findClasses : function(clazz, foundClasses)
    {
      foundClasses.push(clazz);

      var superClass = clazz.getSuperClass();
      if (superClass) {
        this._findClasses(superClass, foundClasses);
      }

      var mixins = clazz.getMixins();
      for (var i=0; i<mixins.length; i++)
      {
        var mixin = apiviewer.dao.Class.getClassByName(mixins[i]);
        if (mixin) {
          this._findClasses(mixin, foundClasses);
        } else {
          this.warn("Missing mixin: " + mixins[i]);
        }
      }

      var superMixins = clazz.getSuperMixins();
      for (var i=0; i<superMixins.length; i++)
      {
        var superMixin = apiviewer.dao.Class.getClassByName(superMixins[i]);
        if (superMixin) {
          this._findClasses(superMixin, foundClasses);
        } else {
          this.warn("Missing super mixin: " + superMixins[i]);
        }
      }

      var interfaces = clazz.getInterfaces();
      for (var i=0; i<interfaces.length; i++)
      {
        var iface = apiviewer.dao.Class.getClassByName(interfaces[i]);
        if (iface) {
          this._findClasses(iface, foundClasses);
        } else {
          this.warn("Missing interface: " + interfaces[i]);
        }
      }

      var superInterfaces = clazz.getSuperInterfaces();
      for (var i=0; i<superInterfaces.length; i++)
      {
        var superInterface = apiviewer.dao.Class.getClassByName(superInterfaces[i]);
        if (superInterface) {
          this._findClasses(superInterface, foundClasses);
        } else {
          this.warn("Missing super interface: " + superInterfaces[i]);
        }
      }

      return foundClasses;
    },



    _initializeFields : function()
    {
      this.base(arguments);

      this._desc = "";
      this._see = [];
      this._superInterfaces = [];
      this._superMixins = [];
    },


    _addChildNode : function(childNode)
    {
      switch (childNode.type) {
        case "constructor" :
        case "methods" :
        case "methods-static" :
        case "events" :
        case "properties" :
        case "constants" :
        case "appearances" :
          break;
        case "superInterfaces" :
          this._superInterfaces = this._createNodeList(childNode, apiviewer.dao.ClassItem, this, childNode.type);
          break;
        case "superMixins" :
          this._superMixins = this._createNodeList(childNode, apiviewer.dao.ClassItem, this, childNode.type);
          break;
        case "desc":
          this._desc = childNode.attributes.text || "";
          break;
        case "see":
          this._see.push(childNode.attributes.name);
          break;
        default:
          return this.base(arguments, childNode);
      }
      return true;
    }

  }
});
