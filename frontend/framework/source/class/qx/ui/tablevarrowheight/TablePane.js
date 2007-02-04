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
 * The table pane that shows a certain section from a table. This class
 * handles the display of the data part of a table and is therefore the base
 * for virtual scrolling.
 *
 * @param paneScroller {TablePaneScroller}
 *   The TablePaneScroller the header belongs to.
 */
qx.OO.defineClass("qx.ui.tablevarrowheight.TablePane",
                  qx.ui.table.TablePane,
function(paneScroller)
{
  this.debug("TableVarRowHeight::TablePane");
  qx.ui.table.TablePane.call(this, paneScroller);
});
