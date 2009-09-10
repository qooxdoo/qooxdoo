/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */


qx.Class.define("demobrowser.demo.virtual.messenger.GroupModel",
{
  extend : qx.core.Object,


  construct : function(name)
  {
    this.base(arguments);

    if (name !== undefined) {
      this.setName(name);
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    name :
    {
      init : "Friends",
      event : "changeName",
      check : "String"
    },

    row :
    {
      event : "changeRow",
      check : "Integer",
      apply : "_applyRow"
    },

    open :
    {
      check : "Boolean",
      init : true,
      event : "changeOpen"
    },

    itemCount :
    {
      check : "Integer",
      init : 0,
      event : "changeItemCount"
    }
  },


  members :
  {
    __oldRow : null,


    _applyRow : function(value, old) {
      this.__oldRow = old
    },


    getOldRow : function() {
      return this.__oldRow;
    }
  }
});