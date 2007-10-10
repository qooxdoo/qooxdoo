/* ************************************************************************

    qooxdoo - the new era of web development

    http://qooxdoo.org

    Copyright:
      2007 by Christian Boulanger

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

    Authors:
      * Christian Boulanger (cboulanger)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * A cell renderer which hides cell values such as passwords form view
 * by masking them by *s
 *
 */
qx.Class.define("qx.ui.table.cellrenderer.Password",
{
  extend : qx.ui.table.cellrenderer.Default,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Overridden; called whenever the cell updates.
     *
     * @type member
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {String}
     */
    _getContentHtml : function(cellInfo)
    {
      var value = cellInfo.value;
      if ( value === null ) value = "";
      cellInfo.value = value.replace(/./g,"*");
      return qx.html.String.escape(this._formatValue(cellInfo));
    }
  }
});
