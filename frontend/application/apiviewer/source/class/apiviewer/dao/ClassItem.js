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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */


qx.Class.define("apiviewer.dao.ClassItem",
{
  extend : apiviewer.dao.Node,

  construct : function(classDocNode, parentClass, listName)
  {
    this._class = parentClass;
    this._listName = listName;
    this.base(arguments, classDocNode);
  },

  members :
  {
    getClass : function()
    {
      return this._class;
    },

    getName : function()
    {
      return this._docNode.attributes.name;
    },

    getErrors : function()
    {
      return this._errors;
    },

    getDescription : function()
    {
      return this._desc || "";
    },

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

    getSee : function()
    {
      return this._see;
    },

    getOverriddenFrom : function()
    {
      return apiviewer.dao.Class.getClassByName(this._docNode.attributes.overriddenFrom);
    },


    getDocNode : function()
    {
      if (this._itemDocNode) {
        return this._itemDocNode;
      }
      var docClass = apiviewer.dao.Class.getClassByName(this._docNode.attributes.docFrom);
      if (docClass) {
        var listNode = apiviewer.TreeUtil.getChild(docClass.getNode(), this._listName);
        var itemDocNode = apiviewer.TreeUtil.getChildByAttribute(listNode, "name", this.getName());
        this._itemDocNode = itemDocNode.cls;
      }
      this._itemDocNode = this._itemDocNode || this;
      return this._itemDocNode;
    },


    /**
     * Checks whether the node is required by the interface.
     */
    isRequiredByInterface : function(ifaceNode) {
      var parentNode = apiviewer.TreeUtil.getChild(ifaceNode.getNode(), this._listName);
      if (parentNode) {
        var node = apiviewer.TreeUtil.getChildByAttribute(parentNode, "name", this.getName())
        return node ? true : false;
      }
      return false;
    },


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
      this._params = [];
      this._see = [];
      this._errors = [];
      this._types = [];
    },


    _addChildNode : function(node)
    {
      switch (node.type) {
        case "errors":
          this._errors = this._createNodeList(node);
          break;
        case "desc":
          this._desc = node.attributes.text || "";
          break;
        case "see":
          this._see.push(node.attributes.name);
          break;
        case "types":
          this._types = this._createNodeList(node);
          break;
        default:
          return this.base(arguments, node);
      }
      return true;
    }

  }
});