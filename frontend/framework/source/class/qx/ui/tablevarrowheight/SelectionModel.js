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
 * A selection model.
 *
 * @event changeSelection {qx.event.type.Event}
 *   Fired when the selection has changed.
 */
qx.OO.defineClass("qx.ui.tablevarrowheight.SelectionModel",
                  qx.ui.table.SelectionModel,
function()
{
  this.debug("TableVarRowHeight::SelectionModel");
  qx.ui.table.SelectionModel.call(this);
});
