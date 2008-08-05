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
 * Specific data cell renderer for dates.
 */
qx.Class.define("qx.legacy.ui.table.cellrenderer.Date",
{
  extend : qx.legacy.ui.table.cellrenderer.Conditional,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(align, color, style, weight)
  {
    this.base(arguments, align, color, style, weight);

    this.initDateFormat();
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * DateFormat used to format the data.
     */
    dateFormat :
    {
      check : "qx.util.format.DateFormat",
      init : null,
      apply : "_applyDateFormat"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyDateFormat : function(value, old) {
      var method;
      if (value) {
        method = function(cellInfo) {
          if (cellInfo.value) {
            return qx.bom.String.escape(value.format(cellInfo.value));
          } else {
            return "";
          }
        }
      } else {
        method = function(cellInfo) {
          return cellInfo.value || "";
        }
      }
      // dynamically override _getContentHtml method
      this._getContentHtml = method;
    },

    // overridden
    _getCellClass : function(cellInfo) {
      return "qooxdoo-table-cell";
    }
  }
});
