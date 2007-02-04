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
 * A simple table model that provides an API for changing the model data.
 */
qx.OO.defineClass("qx.ui.tablevarrowheight.SimpleTableModel",
                  qx.ui.table.SimpleTableModel,
function()
{
  this.debug("TableVarRowHeight::SimpleTableModel");
  qx.ui.table.SimpleTableModel.call(this);
});
