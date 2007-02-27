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
 * The model of a table pane. This model works as proxy to a {@link
 * TableColumnModel} and manages the visual order of the columns shown in a
 * {@link TablePane}.
 *
 * @param tableColumnModel {TableColumnModel}
 *   The TableColumnModel of which this model is the proxy.
 *
 * @event modelChanged {qx.event.type.Event}
 *   Fired when the model changed.
 */
qx.OO.defineClass("qx.ui.tablevarrowheight.TablePaneModel",
                  qx.ui.table.TablePaneModel,
function(tableColumnModel)
{
  qx.ui.table.TablePaneModel.call(this, tableColumnModel);
});
