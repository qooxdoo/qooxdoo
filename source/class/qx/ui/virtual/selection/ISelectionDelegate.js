/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */


/**
 * Objects, which are used as delegates for a virtual selection manager may
 * implement any of the methods described in this interface. The delegate does
 * not need implement all of the methods of this interface. If a method is not
 * implemented the selection manager provides a default implementation.
 *
 * Note: This interface is meant to document the delegate but should not be
 * listed in the <code>implement</code> key of a class unless all methods are
 * really implemented.
 */
qx.Interface.define("qx.ui.virtual.selection.ISelectionDelegate",
{
  members :
  {
    /**
     * Returns whether the given item is selectable. The type of the item
     * depends on the concrete selection manager implementation. The
     * {@link Row} and {@link Column} selection manager use row/column indexes
     * as items. The {@link qx.ui.virtual.cell.Cell} uses cells as items. Cells are represented by
     * a map containing <code>row</code> and <code>column</code> keys.
     *
     * If this method is not implemented by the delegate all items are selectable.
     *
     * @param item {var} The item to be checked
     * @return {Boolean} Whether the given item is selectable
     */
    isItemSelectable : function(item) {},


    /**
     * Update the style (appearance) of the given item.
     *
     * @param item {var} Item to modify
     * @param type {String} Any of <code>selected</code>, <code>anchor</code>
     *    or <code>lead</code>
     * @param wasAdded {Boolean} Whether the given style should be added or removed.
     */
    styleSelectable : function(item, type, wasAdded) {}
  }
});