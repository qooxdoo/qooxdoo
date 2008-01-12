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

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

/**
 * This Class wraps the access to the documentation data of a class item.
 */
qx.Class.define("apiviewer.dao.ClassItem",
{
  extend : apiviewer.dao.Node,

  /**
   * @param classDocNode {Map} class documentation node
   * @param parentClass {apiviewer.dao.Class} reference to the class this item belongs to
   * @param listName {String} name of the list in the JSON structure of the class
   */
  construct : function(classDocNode, parentClass, listName)
  {
    this._class = parentClass;
    this._listName = listName;
    this.base(arguments, classDocNode);
  },

  members :
  {

    /**
     * Get the class, this item belongs to
     *
     * @return {apiviewer.dao.Class} the class this item belongs to
     */
    getClass : function()
    {
      return this._class;
    },


    /**
     * Get the name of the item.
     *
     * @return {String} name of the item
     */
    getName : function()
    {
      return this._docNode.attributes.name;
    },


    /**
     * @return {String}
     */
    getListName : function()
    {
      return this._listName;
    },


    /**
     * Get a list of errors of this item.
     *
     * @return {Map[]} errors of this item.
     */
    getErrors : function()
    {
      return this._errors;
    },


    /**
     * Get class description
     *
     * @return {String} class description
     */
    getDescription : function()
    {
      return this.getDocNode()._desc || "";
    },


    /**
     * Get the types of the item.
     *
     * @return {Map[]} Array of types of the item. A type has the keys 'type' and 'dimensions'.
     */
    getTypes : function()
    {
      var result = [];
      for (var i=0; i<this._types.length; i++)
      {
        var type = {};
        if (this._types[i].attributes.dimensions) {
          type.dimensions = this._types[i].attributes.dimensions;
        }
        type.type = this._types[i].attributes.type;
        result.push(type);
      }
      return result;
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
     * If the item is overwridden from one of the super classes, get the item, which is overwridden.
     *
     * @return {ClassItem} the overwridden class item
     */
    getOverriddenFrom : function()
    {
      return apiviewer.dao.Class.getClassByName(this._docNode.attributes.overriddenFrom);
    },


    /**
     * Get the node, which contains the documentation for this node. Overridden properties
     * and methods may refer to the overridden item for documentation.
     *
     * @return {ClassItem} The node, which contains the documentation for this node.
     */
    getDocNode : function()
    {
      if (this._itemDocNode)
      {
        return this._itemDocNode;
      }
      this._itemDocNode = this;
      var docClass = apiviewer.dao.Class.getClassByName(this._docNode.attributes.docFrom);
      if (docClass) {
        var itemList = docClass.getItemList(this._listName);
        for (var i=0; i<itemList.length; i++) {
          if (itemList[i].getName() == this.getName())
          {
            this._itemDocNode = itemList[i];
            break;
          }
        }
      }
      return this._itemDocNode;
    },


    /**
     * Checks whether the node is required by the given interface.
     *
     * @param ifaceNode {apiviewer.dao.Class} interface to check for
     * @return {Boolean} whether the item is required by the interface.
     */
    isRequiredByInterface : function(ifaceNode) {
      var parentNode = apiviewer.TreeUtil.getChild(ifaceNode.getNode(), this._listName);
      if (parentNode) {
        var node = apiviewer.TreeUtil.getChildByAttribute(parentNode, "name", this.getName())
        return node ? true : false;
      }
      return false;
    },


    /**
     * Get the interface this item is required by.
     *
     * @return {apiviewer.dao.Class} The interface this item is required by.
     */
    getRequiredBy : function()
    {
      if (this._requiredBy) {
        return this._requiredBy;
      }

      var requiredBy = [];
      var interfaces = this.getClass().getAllInterfaces(true);

      for (var j=0; j<interfaces.length; j++) {
        if (this.isRequiredByInterface(interfaces[j])) {
          requiredBy.push(interfaces[j]);
        }
      }
      this._requiredBy = requiredBy;
      return requiredBy;
    },


    _initializeFields : function() {
      this.base(arguments);
      this._see = [];
      this._errors = [];
      this._types = [];
    },


    _addChildNode : function(childNode)
    {
      switch (childNode.type) {
        case "errors":
          this._errors = this._createNodeList(childNode);
          break;
        case "desc":
          this._desc = childNode.attributes.text || "";
          break;
        case "see":
          this._see.push(childNode.attributes.name);
          break;
        case "types":
          this._types = this._createNodeList(childNode);
          break;
        default:
          return this.base(arguments, childNode);
      }
      return true;
    }

  }
});
