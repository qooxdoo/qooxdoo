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
    getNextSelectableItem : function(selectedItem) {
      this.assertInstance(selectedItem, qx.ui.core.Widget);
    },


    /**
     * Given the selected item, return the previous selectable item.
     *
     * @param selectedItem {qx.ui.core.Widget} The currently selected item
     * @return {qx.ui.core.Widget|null} The previous selectable item after the selected
     *     item. May be <code>null</code> if the item is the first item.
     */
    getPreviousSelectableItem : function(selectedItem) {},


    /**
     * Get the top position of the selected item relative to the selection
     * container.
     *
     * @param item {qx.ui.core.Widget} The item to get the offset of
     * @return {Integer} The item's top position relative to the selection container
     */
    getItemOffset : function(item) {
      this.assertInstance(item, qx.ui.core.Widget);
    },


    /**
     * Get the item's height
     *
     * @param item {qx.ui.core.Widget} The item to get the height of
     * @return {Integer} The item's height
     */
    getItemHeight : function(item) {
      this.assertInstance(item, qx.ui.core.Widget);
    },


    /**
     * Get the current scoll top position
     *
     * @return {Integer} The current scroll top position inside of the container
     */
    getScrollTop : function() {},


    /**
     * Set the scoll top position of the selection container
     *
     * @param scroll {Integer} The current scroll top position inside of the selection container
     */
    setScrollTop : function(scroll) {
      this.assertNumber(scroll)
    },


    /**
     * Scroll the given item into the container's visible area.
     *
     * @param item {qx.ui.core.Widget} The item to scroll into view
     */
    scrollItemIntoView : function(item) {
      this.assertInstance(item, qx.ui.core.Widget);
    },


    /**
     * Get the inner height of the container.
     *
     * @return {Integer} The inner height of the selection container
     */
    getInnerHeight : function() {}
  }
});