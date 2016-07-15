/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("apiviewer.dao.Event", {
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, listName)
  {
    this.base(arguments, classDocNode, parentClass, listName);
  },

  members : {

    getType : function () {
      return apiviewer.dao.Class.getClassByName(this._type);
    },

    getTypes : function () {
      if (this._type) {
        return [{
          type: this._type
        }]
      } else {
        return [];
      }
    },

    _addChildNode : function(childNode)
    {
      switch (childNode.type) {
        case "types":
          this._type = childNode.children[0].attributes.type;
          break;
        default:
          return this.base(arguments, childNode);
      }
      return true;
    }

  }

});
