/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Delegate to customize a virtual list.
 *
 * List delegates can choose to implement any subset of the methods defined in
 * this interface.
 *
 * EXPERIMENTAL!
 *
 * @deprecated {2.1} See {@link qx.ui.virtual.form.List}
 */
qx.Interface.define("qx.ui.virtual.form.IListDelegate",
{
  members :
  {
    /**
     * Get the cell data of the given row
     *
     * @param row {Integer} the row index
     * @return {var} The data associated with the row. This can be anything
     *   ranging from a simple string to complex domain objects.
     */
    getCellData : function(row) {},

    /**
     * Get the cell renderer for the given row.
     *
     * @param row {Integer} The row index
     * @return {qx.ui.virtual.cell.IWidgetCell|qx.ui.virtual.cell.ICell} Either
     *   a widget or HTML cell renderer depending on the list's configuration.
     */
    getCellRenderer : function(row) {},

    /**
     * Whether the given row is selectable
     *
     * @param row {Integer} The row index
     * @return {Boolean} Whether the given row is selectable
     */
    isRowSelectable : function(row) {}
  }
})
