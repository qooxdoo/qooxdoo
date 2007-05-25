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

#module(ui_tablevarrowheight)

************************************************************************ */

/**
 * Shows the header of a table.
 */
qx.Class.define("qx.ui.tablevarrowheight.TablePaneHeader",
{
  extend : qx.ui.table.pane.Header,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param paneScroller {TablePaneScroller}
   *   The TablePaneScroller the header belongs to.
   */
  construct : function(paneScroller) {
    this.base(arguments, paneScroller);
  }
});
