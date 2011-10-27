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
     * Daniel Wagner (d_wagner)

************************************************************************ */

qx.Class.define("apiviewer.dao.ChildControl", {
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, listName)
  {
    this.base(arguments, classDocNode, parentClass);
    this._listName = listName;
  },

  members : {

    getTypes : function()
    {
      var result = this.base(arguments);
      var attributes = this._docNode.attributes;
      if (attributes.type) {
        result.push({
          type : attributes.type
        });
      }
      return result;
    },


    getType : function() {
      return this._docNode.attributes.type;
    },

    getDefaultValue : function()
    {
      return this._docNode.attributes.defaultValue;
    }

  }

});
