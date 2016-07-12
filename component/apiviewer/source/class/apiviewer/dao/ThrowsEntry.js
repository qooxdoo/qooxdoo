/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("apiviewer.dao.ThrowsEntry",
{
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, method)
  {
    this.base(arguments, classDocNode, parentClass);
  },

  members :
  {

    getType : function() {
      return this._docNode.attributes.type || null;
    },

    getDefaultType : function() {
      return "Error";
    },

    getDescription : function()
    {
      return this._docNode.attributes.text;
    }

  }

});
