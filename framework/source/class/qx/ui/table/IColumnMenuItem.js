/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Interface for a column menu item corresponding to a table column.
 */
qx.Interface.define("qx.ui.table.IColumnMenuItem",
{
  properties :
  {
    /**
     * Whether the table column associated with this menu item is visible
     * Should be of type {Boolean}!
     */
    columnVisible : { }
  },

  events :
  {
    /**
     * Dispatched when a column changes visibility state. The event data is a
     * boolean indicating whether the table column associated with this menu
     * item is now visible.
     */
    changeColumnVisible : "qx.event.type.Data"
  }
});
