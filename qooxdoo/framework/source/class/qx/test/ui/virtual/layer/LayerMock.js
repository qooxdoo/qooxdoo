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

qx.Class.define("qx.test.ui.virtual.layer.LayerMock",
{
  extend : qx.ui.virtual.layer.Abstract,

  construct : function()
  {
    this.base(arguments);

    this.calls = [];
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    updateLayerData : function()
    {
      this.calls.push(["updateLayerData", qx.lang.Array.fromArguments(arguments)]);
      this.base(arguments);
    },


    _updateLayerData : function() {
      this.calls.push(["_updateLayerData", qx.lang.Array.fromArguments(arguments)]);
    },


    fullUpdate : function(
      firstRow, firstColumn,
      rowSizes, columnSizes
    )
    {
      this.calls.push(["fullUpdate", qx.lang.Array.fromArguments(arguments)]);
      this.base(
        arguments, firstRow, firstColumn,
        rowSizes, columnSizes
      );
    },


    _fullUpdate : function(firstRow, firstColumn, rowSizes, columnSizes) {
      this.calls.push(["_fullUpdate", qx.lang.Array.fromArguments(arguments)]);
    },


    updateLayerWindow : function(
      firstRow, firstColumn,
      rowSizes, columnSizes
    )
    {
      this.calls.push(["updateLayerWindow", qx.lang.Array.fromArguments(arguments)]);
      this.base(
        arguments, firstRow, firstColumn,
        rowSizes, columnSizes
      );
    },


    _updateLayerWindow : function(
      firstRow, firstColumn,
      rowSizes, columnSizes
    ) {
      this.calls.push(["_updateLayerWindow", qx.lang.Array.fromArguments(arguments)]);
    }
  }
});
