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
     * Christian Hagendorn (chris_schmidt)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Each object, which should support single selection have to
 * implement this interface.
 */
qx.Interface.define("qx.ui.core.ISingleSelection",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */


  events :
  {
    /** Fires after the selection was modified */
    "changeSelection" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /**
     * Returns an array of currently selected items.
     *
     * Note: The result is only a set of selected items, so the order can
     * differ from the sequence in which the items were added.
     *
     * @return {qx.ui.core.Widget[]} List of items.
     */
    getSelection : function() {},

    /**
     * Replaces current selection with the given items.
     *
     * @param items {qx.ui.core.Widget[]} Items to select.
     * @throws {Error} if the item is not a child element.
     */
    setSelection : function(items) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertArray(items);
    },

    /**
     * Clears the whole selection at once.
     */
    resetSelection : function() {},

    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {qx.ui.core.Widget} Any valid selectable item
     * @return {Boolean} Whether the item is selected.
     * @throws {Error} if the item is not a child element.
     */
    isSelected : function(item) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertQxWidget(item);  
    },

    /**
     * Whether the selection is empty.
     *
     * @return {Boolean} Whether the selection is empty.
     */
    isSelectionEmpty : function() {},

    /**
     * Returns all elements which are selectable.
     *
     * @param all {Boolean} true for all selectables, false for the
     *   selectables the user can interactively select
     * @return {qx.ui.core.Widget[]} The contained items.
     */
    getSelectables: function(all) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertBoolean(all);
    }
  }
});
