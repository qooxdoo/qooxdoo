/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Widgets, which implement a selection behaviour of sub items using the
 * {@link SelectionManager} must implement this interface.
 */
qx.Interface.define("qx.ui.core.selection.IContainer",
{
  members :
  {
    /**
     * Get all selectable items
     *
     * @return {qx.ui.core.Widget[]} An array of all selectable items
     */
    getSelectableItems : function() {},


    /**
     * Given the selected item, return the next selectable item.
     *
     * @param selectedItem {qx.ui.core.Widget} The currently selected item
     * @return {qx.ui.core.Widget|null} The next selectable item after the selected
     *     item. May be <code>null</code> if the item is the last item.
     */
    getItemUnder : function(selectedItem) {
      this.assertInstance(selectedItem, qx.ui.core.Widget);
    },


    /**
     * Given the selected item, return the previous selectable item.
     *
     * @param selectedItem {qx.ui.core.Widget} The currently selected item
     * @return {qx.ui.core.Widget|null} The previous selectable item after the selected
     *     item. May be <code>null</code> if the item is the first item.
     */
    getItemAbove : function(selectedItem) {}
  }
});