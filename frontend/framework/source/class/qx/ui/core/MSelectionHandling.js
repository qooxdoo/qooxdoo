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

************************************************************************ */

/**
 * This mixin links all methods to manage the selection from the
 * internal selection manager to the widget.
 */
qx.Mixin.define("qx.ui.core.MSelectionHandling",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    // Create selection manager
    var clazz = this.SELECTION_MANAGER;
    var manager = this.__manager = new clazz(this);

    // Add widget event listeners
    this.addListener("mousedown", manager.handleMouseDown, manager);
    this.addListener("mouseup", manager.handleMouseUp, manager);
    this.addListener("mousemove", manager.handleMouseMove, manager);
    this.addListener("losecapture", manager.handleLoseCapture, manager);
    this.addListener("keypress", manager.handleKeyPress, manager);

    this.addListener("addItem", manager.handleAddItem, manager);
    this.addListener("removeItem", manager.handleRemoveItem, manager);

    // Add manager listeners
    manager.addListener("change", this._onSelectionChange, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fires after the selection was modified */
    change : "qx.event.type.Data"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The selection mode to use.
     *
     * For further details please have a look at:
     * {@link qx.ui.core.selection.Abstract#mode}
     */
    selectionMode :
    {
      check : [ "single", "multi", "additive", "one" ],
      init : "single",
      apply : "_applySelectionMode"
    },


    /**
     * Whether drag selection (multi selection of items through
     * dragging the mouse in pressed states) should be enabled.
     */
    dragSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDragSelection"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      USER API
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the lead to the given item.
     *
     * @type member
     * @param item {Object} Any valid item
     * @return {void}
     */
    setLeadItem : function(item) {
      this.__manager.setLeadItem(item);
    },

    /**
     * Selects all items of the managed object.
     *
     * @type member
     * @return {void}
     */
    selectAll : function() {
      this.__manager.selectAll();
    },


    /**
     * Selects the given item. Replaces current selection
     * completely with the new item.
     *
     * Use {@link #addToSelection} instead if you want to add new
     * items to an existing selection.
     *
     * @type member
     * @param item {Object} Any valid item
     * @return {void}
     */
    select : function(item) {
      this.__manager.selectItem(item);
    },


    /**
     * Detects whether the given item is currently selected.
     *
     * @type member
     * @param item {var} Any valid selectable item
     * @return {Boolean} Whether the item is selected
     */
    isSelected : function(item) {
      this.__manager.isSelected(item);
    },


    /**
     * Adds the given item to the existing selection.
     *
     * Use {@link #selectItem} instead if you want to replace
     * the current selection.
     *
     * @type member
     * @param item {Object} Any valid item
     * @return {void}
     */
    addToSelection : function(item) {
      this.__manager.addItem(item);
    },


    /**
     * Removes the given item from the selection.
     *
     * Use {@link #clearSelection} when you want to clear
     * the whole selection at once.
     *
     * @type member
     * @param item {Object} Any valid item
     * @return {void}
     */
    removeFromSelection : function(item) {
      this.__manager.removeItem(item);
    },


    /**
     * Selects an item range between two given items.
     *
     * @type member
     * @param begin {Object} Item to start with
     * @param end {Object} Item to end at
     * @return {void}
     */
    selectRange : function(begin, end) {
      this.__manager.selectItemRange(begin, end);
    },


    /**
     * Clears the whole selection at once. Also
     * resets the lead and anchor items and their
     * styles.
     *
     * @type member
     * @return {void}
     */
    clearSelection : function() {
      this.__manager.clearSelection();
    },


    /**
     * Get the selected item. This method does only work in <code>single</code>
     * selection mode.
     *
     * @type member
     * @return {Object} The selected item.
     */
    getSelectedItem : function() {
      return this.__manager.getSelectedItem();
    },


    /**
     * Returns an array of currently selected items.
     *
     * @type member
     * @return {Object[]} The item or a list of items.
     */
    getSelection : function() {
      return this.__manager.getSelection();
    },


    /**
     * Whether the selection is empty
     *
     * @type member
     * @return {Boolean} Whether the selection is empty
     */
    isSelectionEmpty : function() {
      return this.__manager.isSelectionEmpty();
    },


    /**
     * Returns the internal selection manager. Use this with
     * caution!
     *
     * @type member
     * @return {qx.ui.core.selection.Abstract} The selection manager
     */
    _getManager : function() {
      return this.__manager;
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelectionMode : function(value, old) {
      this.__manager.setMode(value);
    },


    // property apply
    _applyDragSelection : function(value, old) {
      this.__manager.setDrag(value);
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for <code>change</code> event on selection manager.
     *
     * @type member
     * @param e {qx.event.type.Data} Data event
     * @return {void}
     */
    _onSelectionChange : function(e) {
      this.fireDataEvent("change", e.getData());
    }
  },




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__manager");
  }
});
