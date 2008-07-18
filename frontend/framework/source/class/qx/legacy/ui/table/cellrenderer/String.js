/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 OpenHex SPRL, http://www.openhex.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gaetan de Menten (ged)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * The string data cell renderer. All it does is escape the incoming String
 * values.
 */
qx.Class.define("qx.legacy.ui.table.cellrenderer.String",
{
  extend : qx.legacy.ui.table.cellrenderer.Conditional,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getContentHtml : function(cellInfo) {
      return qx.bom.String.escape(cellInfo.value || "");
    },

    // overridden
    _getCellClass : function(cellInfo) {
      return "qooxdoo-table-cell";
    }
  }
});
