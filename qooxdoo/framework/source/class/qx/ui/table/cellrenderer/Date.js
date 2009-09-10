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

/**
 * Specific data cell renderer for dates.
 */
qx.Class.define("qx.ui.table.cellrenderer.Date",
{
  extend : qx.ui.table.cellrenderer.Conditional,

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
      nullable : true
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _getContentHtml : function(cellInfo)
    {
      var df = this.getDateFormat();

      if (df)
      {
        if (cellInfo.value) {
          return qx.bom.String.escape(df.format(cellInfo.value));
        } else {
          return "";
        }
      }
      else
      {
        return cellInfo.value || "";
      }
    },


    // overridden
    _getCellClass : function(cellInfo) {
      return "qooxdoo-table-cell";
    }
  }
});
