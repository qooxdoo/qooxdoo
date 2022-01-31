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

qx.Class.define("qx.test.ui.virtual.layer.LayerMock", {
  extend: qx.ui.virtual.layer.Abstract,

  construct() {
    super();

    this.calls = [];
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    updateLayerData() {
      this.calls.push([
        "updateLayerData",
        qx.lang.Array.fromArguments(arguments)
      ]);

      super.updateLayerData();
    },

    _updateLayerData() {
      this.calls.push([
        "_updateLayerData",
        qx.lang.Array.fromArguments(arguments)
      ]);
    },

    fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
      this.calls.push(["fullUpdate", qx.lang.Array.fromArguments(arguments)]);
      super.fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
    },

    _fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
      this.calls.push(["_fullUpdate", qx.lang.Array.fromArguments(arguments)]);
    },

    updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
      this.calls.push([
        "updateLayerWindow",
        qx.lang.Array.fromArguments(arguments)
      ]);

      super.updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes);
    },

    _updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
      this.calls.push([
        "_updateLayerWindow",
        qx.lang.Array.fromArguments(arguments)
      ]);
    }
  }
});
