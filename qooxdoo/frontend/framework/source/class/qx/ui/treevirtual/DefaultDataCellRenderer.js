/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(treevirtual)

************************************************************************ */

/**
 * The default data cell renderer for a virtual tree (columns other than the
 * tree column)
 */
qx.Class.define("qx.ui.treevirtual.DefaultDataCellRenderer",
{
  extend : qx.ui.table.cellrenderer.Default,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @return {var} TODOC
     */
    _getCellStyle : function(cellInfo)
    {
      // Return the style for the div for the cell.  If there's cell-specific
      // style information provided, append it.
      var html = this.base(arguments, cellInfo) + qx.ui.treevirtual.SimpleTreeDataCellRenderer.MAIN_DIV_STYLE;
      return html;
    }
  }
});
