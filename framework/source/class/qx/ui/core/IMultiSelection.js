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
     * Christian Schmidt (chris_schmidt)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Each object, which should support single selection have to
 * implement this interface.
 */
qx.Interface.define("qx.ui.core.IMultiSelection",
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
     * @return {Object[]} List of items.
     */
    getSelection : function() {
      return true;
    },
    
    /**
     * Replaces current selection with the given items.
     *
     * @param items {Object} Items to select
     * @return {void}
     */
    setSelection : function(items) {
      return arguments.length == 1;
    },
    
    /**
     * Clears the whole selection at once.
     *
     * @return {void}
     */
    resetSelection : function() {
      return true;
    },
    
    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {Object} Any valid selectable item
     * @return {Boolean} Whether the item is selected
     */
    isSelected : function(item) {
      return arguments.length == 1;
    },
    
    /**
     * Whether the selection is empty.
     *
     * @return {Boolean} Whether the selection is empty
     */
    isSelectionEmpty : function() {
      return true;
    },
    
    /**
     * Selects all items of the managed object.
     */
    selectAll : function() {
      return true;
    },
    
    /**
     * Adds the given item to the existing selection.
     *
     * @param item {Object} Any valid item
     * @return {void}
     */
    addToSelection : function(item) {
      return arguments.length == 1;
    },
    
    /**
     * Removes the given item from the selection.
     *
     * Use {@link #resetSelection} when you want to clear
     * the whole selection at once.
     *
     * @param item {Object} Any valid item
     * @return {void}
     */
    removeFromSelection : function(item) {
      return arguments.length == 1;
    },
    
    
    /**
     * Returns all elements which are selectable.
     * 
     * @return {LayoutItem[]} The contained items.
     */
    getSelectables: function() {
      return true;
    }
  }
});
