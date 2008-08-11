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

qx.Class.define("apiviewer.dao.Package", {
  extend : apiviewer.dao.Node,

  construct : function(classDocNode, pkg)
  {
    this.base(arguments, classDocNode);
    this._package = pkg;
    apiviewer.dao.Class.registerClass(this);
  },

  members : {

    getName : function()
    {
      return this._docNode.attributes.name;
    },

    getFullName : function()
    {
      return this._docNode.attributes.fullName || "";
    },

    /**
     * Get package description
     *
     * @return {String} package description
     */
    getDescription : function()
    {
      return this._desc || "";
    },

    getClasses : function()
    {
      return this._classes;
    },

    getPackages : function()
    {
      return this._packages;
    },

    getPackage : function()
    {
      return this._package;
    },

    addClass : function(clazz)
    {
      var className = clazz.getFullName()
      var classes = this.getClasses();

      for (var i=0; i<classes.length; i++)
      {
        if (classes[i].getFullName() == className) {
          classes[i] = clazz;
          return
        }
      }

      classes.push(clazz);
    },


    /**
     * Return a package item matching the given name.
     *
     * @param itemName {String} name of the package item
     * @return {apiviewer.dao.Class|Package} the package item.
     */
    getItem : function(itemName)
    {
      var itemListNames = [
        "getClasses",
        "getPackages"
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
     *   <li>classes</li>
     *   <li>packages</li>
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
      var methodMap = {
        "classes" : "getClasses",
        "packages": "getPackages"
      };
      return this[methodMap[listName]]();
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


    _initializeFields : function()
    {
      this.base(arguments);

      this._classes = [];
      this._packages = [];
    },


    _addChildNode : function(node)
    {
      switch (node.type) {
        case "classes":
          this._classes = this._createNodeList(node, apiviewer.dao.Class, this);
          break;
        case "packages":
          this._packages = this._createNodeList(node, apiviewer.dao.Package, this);
          break;
        case "desc":
          this._desc = node.attributes.text || "";
          break;
        default:
          return this.base(arguments, node);
      }
      return true;
    }

  }

});
