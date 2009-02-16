/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.ui.virtual.cell.Default", 
{
  extend : qx.ui.virtual.cell.Abstract,


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    STYLEFLAG_ALIGN_RIGHT : 1,
    STYLEFLAG_BOLD        : 2,
    STYLEFLAG_ITALIC      : 4
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the alignment should automatically be set according to the cell value.
     * If true numbers will be right-aligned.
     */
    useAutoAlign :
    {
      check : "Boolean",
      init : true
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {

    _getStyleFlags : function(value)
    {
      if (this.getUseAutoAlign())
      {
        if (typeof value == "number") {
          return qx.ui.virtual.cell.Default.STYLEFLAG_ALIGN_RIGHT;
        }
      }
    },


    // overridden
    _getCssClasses : function(value)
    {
      var cellClass = this.base(arguments, value);
      if (!cellClass) {
        return "";
      }

      var stylesToApply = this._getStyleFlags(value);

      if (stylesToApply & qx.ui.virtual.cell.Default.STYLEFLAG_ALIGN_RIGHT) {
        cellClass += " qooxdoo-cell-right";
      }

      if (stylesToApply & qx.ui.virtual.cell.Default.STYLEFLAG_BOLD) {
        cellClass += " qooxdoo-cell-bold";
      }

      if (stylesToApply & qx.ui.virtual.cell.Default.STYLEFLAG_ITALIC) {
        cellClass += " qooxdoo-cell-italic";
      }

      return cellClass;
    },


    // overridden
    _getValue : function(value, states) {
      return qx.bom.String.escape(this._formatValue(value));
    },


    _formatValue : function(value)
    {
      if (value == null) {
        return "";
      }

      if (typeof value == "string") {
        return value;
      }
      else if (typeof value == "number")
      {
        if (!qx.ui.virtual.cell.Default._numberFormat)
        {
          qx.ui.virtual.cell.Default._numberFormat = new qx.util.format.NumberFormat();
          qx.ui.virtual.cell.Default._numberFormat.setMaximumFractionDigits(2);
        }

        var res = qx.ui.virtual.cell.Default._numberFormat.format(value);
      }
      else if (value instanceof Date)
      {
        res = qx.util.format.DateFormat.getDateInstance().format(value);
      }
      else
      {
        res = value;
      }

      return res;
    }


  }
});