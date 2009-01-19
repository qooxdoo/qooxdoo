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
     * Get the selected item.
     *
     * @return {Object} The selected item.
     */
    getSelected : function() {
      return true;
    },
    
    /**
     * Selects the given item. Replaces current selection
     * completely with the new item.
     *
     * @param item {Object} Any valid item
     * @return {void}
     */
    setSelected : function(item) {
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
    }
  }
});
