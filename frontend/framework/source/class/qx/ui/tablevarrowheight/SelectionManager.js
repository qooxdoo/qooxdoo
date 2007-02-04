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
 * A selection manager. This is a helper class that handles all selection
 * related events and updates a SelectionModel.
 *
 * @see SelectionModel
 */
qx.OO.defineClass("qx.ui.tablevarrowheight.SelectionManager",
                  qx.ui.table.SelectionManager,
function()
{
  this.debug("TableVarRowHeight::SelectionManager");
  qx.ui.table.SelectionManager.call(this);
});
