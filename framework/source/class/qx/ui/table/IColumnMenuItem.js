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
  events :
  {
    /**
     * Dispatched when a column changes visibility state. The event data is a
     * boolean indicating whether the table column associated with this menu
     * item is now visible.
     */
    changeVisible : "qx.event.type.Data"
  },

  members :
  {
    /**
     * Set whether the table column associated with this menu item is visible
     *
     * @param value {Boolean} whether the table column associated with this
     *   menu item is visible
     */
    setVisible : function (value) {
      this.assertBoolean(value);
    },


    /**
     * Get whether the table column associated with this menu item is visible
     *
     * @return {Boolean} whether the table column associated with this menu
     *   item is visible
     */
    getVisible : function () {}
  }
});
