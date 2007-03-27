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

    getParams : function()
    {
      return this._params;
    },

    getReturn : function()
    {
      return this._return;
    },

    _initializeFields : function() {
      this.base(arguments);
      this._params = [];
    },

    _addChildNode : function(node)
    {
      switch (node.type) {
        case "params":
          this._params = this._createNodeList(node, apiviewer.dao.Param, this.getClass());
          break;
        case "return":
          this._return = new apiviewer.dao.ClassItem(node, this.getClass());
          break;
        default:
          return this.base(arguments, node);
      }
      return true;
    }

  }

});