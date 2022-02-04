/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Table Cell Renderer for Progressive.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.String", {
  extend: qx.ui.progressive.renderer.table.cell.Abstract,

  /**
   */
  construct() {
    super();
  },

  members: {
    // overridden
    _getContentHtml(cellInfo) {
      return qx.bom.String.escape(cellInfo.cellData);
    }
  }
});
