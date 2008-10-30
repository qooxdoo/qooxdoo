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

  /**
  * Create a new instance of a Default Data Cell Renderer
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
    _getCellStyle : function(cellInfo)
    {
      // Return the style for the div for the cell.  If there's cell-specific
      // style information provided, append it.
      var html = this.base(arguments, cellInfo) + qx.ui.treevirtual.SimpleTreeDataCellRenderer.MAIN_DIV_STYLE;
      return html;
    }
  }
});
