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

qx.Class.define("apiviewer.dao.Method",
{
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, listName)
  {
    this.base(arguments, classDocNode, parentClass, listName);
  },

  members :
  {

    getName : function()
    {
      if (this.isConstructor()) {
        return "construct"
      } else {
        return this._docNode.attributes.name;
      }
    },

    isStatic : function()
    {
      return this._docNode.attributes.isStatic || false;
    },

    isAbstract : function()
    {
      return this._docNode.attributes.isAbstract || false;
    },

    isConstructor : function()
    {
      return this._docNode.attributes.isCtor || false;
    },

    isFromProperty : function()
    {
      return !!this._docNode.attributes.fromProperty;
    },
    

    getParams : function()
    {
      if (this._params != null) {
        return this._params;
      } else {
        var paramsNode = apiviewer.TreeUtil.getChild(this.getDocNode().getNode(), "params");
        this._params = paramsNode ? this._createNodeList(paramsNode, apiviewer.dao.Param, this.getClass(), this) : [];
        return this._params;
      }
    },

    getReturn : function()
    {
      if (this._return != null) {
        return this._return;
      } else {
        var returnNode = apiviewer.TreeUtil.getChild(this.getDocNode().getNode(), "return");
        this._return = returnNode ? new apiviewer.dao.Param(returnNode, this.getClass(), this) : "";
        return this._return;
      }
    },


    getApply : function()
    {
      return this._docNode.attributes.apply;
    },


    getFromProperty : function()
    {
      return this.getClass().getItemByListAndName("properties", this._docNode.attributes.fromProperty);
    },


    _addChildNode : function(node)
    {
      switch (node.type) {
        case "params":
        case "return":
          break;
        default:
          return this.base(arguments, node);
      }
      return true;
    }

  }

});
