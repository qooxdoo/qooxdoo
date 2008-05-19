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

qx.Class.define("apiviewer.dao.Appearance", {
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, listName)
  {
    this.base(arguments, classDocNode, parentClass, listName);
  },

  members : {

    getType : function()
    {
      return apiviewer.dao.Class.getClassByName(this._docNode.attributes.type);
    },

    getTypes : function()
    {
      return [{
          type : this._docNode.attributes.type
        }]
    },

    getAppearance : function()
    {
      return this.getClass();
    },

    getStates : function()
    {
      return this._states || [];
    },

    _addChildNode : function(node)
    {
      switch (node.type) {
        case "states":
          this._states = this._createNodeList(node, apiviewer.dao.State, this);
          break;
        default:
          return this.base(arguments, node);
      }
      return true;
    }

  }

});
