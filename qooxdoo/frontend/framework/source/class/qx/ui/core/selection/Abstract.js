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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class represents a selection and manages incoming events for widgets
 * which need selection support.
 */
qx.Class.define("qx.ui.core.selection.Abstract",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._selectedItems = new qx.ui.core.selection.Storage(this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /**
     * Fired on a selection change. The "data" proeprty is set to an array of
     * selected items as returned by {@link #getSelectedItems}.
     **/
    "changeSelection" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Should multiple selection be allowed? */
    multiSelection :
    {
      check: "Boolean",
      init : true
    },


    /** Enable drag selection? */
    dragSelection :
    {
      check : "Boolean",
      init : true
    },


    /** Should the user be able to select */
    canDeselect :
    {
      check : "Boolean",
      init : true
    },


    /** Should a change event be fired? */
    fireChange :
    {
      check : "Boolean",
      init : true
    },


    /** The current anchor in range selections. */
    anchorItem :
    {
      check : "Object",
      nullable : true,
      apply : "_applyAnchorItem",
      event : "changeAnchorItem"
    },


    /** The last selected item */
    leadItem :
    {
      check : "Object",
      nullable : true,
      apply : "_applyLeadItem",
      event : "changeLeadItem"
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
      ABSTRACT METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns a list of selectable items
     *
     * @type member
     * @return {Array} List of all selectable items
     */
    getItems : function() {
      throw new Error("Abstract method call: getItems()");
    },


    /**
     * Returns the next item relative to the given one.
     *
     * @type member
     * @param item {var} Any item
     * @return {var} The next item
     */
    getNextItem : function(item) {
      throw new Error("Abstract method call: getNextItem()");
    },


    /**
     * Returns the previous item relative to the given one.
     *
     * @type member
     * @param item {var} Any item
     * @return {var} The previous item
     */
    getPreviousItem : function(item) {
      throw new Error("Abstract method call: getPreviousItem()");
    },


    /**
     * Applies or resets the styling to mark a item as selected.
     *
     * @type member
     * @param item {var} Any item
     * @param isSelected {Boolean} Whether the item is selected
     * @return {void}
     */
    renderItemSelectionState : function(item, isSelected) {
      throw new Error("Abstract method call: renderItemSelectionState()");
    },


    /**
     * Applies or resets the styling to mark a item as a anchor item.
     *
     * @type member
     * @param item {var} Any item
     * @param isAnchor {Boolean} Whether the item is the anchor item
     * @return {void}
     */
    renderItemAnchorState : function(item, isAnchor) {
      throw new Error("Abstract method call: renderItemAnchorState()");
    },


    /**
     * Applies or resets the styling to mark a item as a leading item.
     *
     * @type member
     * @param item {var} Any item
     * @param isLead {var} Whether the item is the lead item
     * @return {void}
     */
    renderItemLeadState : function(item, isLead) {
      throw new Error("Abstract method call: renderItemLeadState()");
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyAnchorItem : function(value, old)
    {
      if (old) {
        this.renderItemAnchorState(old, false);
      }

      if (value) {
        this.renderItemAnchorState(value, true);
      }
    },


    // property apply
    _applyLeadItem : function(value, old)
    {
      if (old) {
        this.renderItemLeadState(old, false);
      }

      if (value) {
        this.renderItemLeadState(value, true);
      }
    },






    /*
    ---------------------------------------------------------------------------
      INTERNAL APIS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFirst : function()
    {
      var items = this.getItems();
      return items[0] || null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLast : function()
    {
      var items = this.getItems();

      var pos = items.length - 1;
      if (pos > 0) {
        return items[pos];
      }

      return null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param item {var} TODOC
     * @return {var} TODOC
     */
    getNext : function(item)
    {
      var items = this.getItems();
      var pos = items.indexOf(item) + 1;

      return items[pos] || null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param item {var} TODOC
     * @return {var} TODOC
     */
    getPrevious : function(item)
    {
      var items = this.getItems();
      var pos = items.indexOf(item) - 1;

      return pos >= 0 ? items[pos] : null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vItem1 {var} TODOC
     * @param vItem2 {var} TODOC
     * @return {boolean} TODOC
     */
    isBefore : function(vItem1, vItem2)
    {
      var items = this.getItems();
      return items.indexOf(vItem1) < items.indexOf(vItem2);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vItem1 {var} TODOC
     * @param vItem2 {var} TODOC
     * @return {var} TODOC
     */
    isEqual : function(vItem1, vItem2) {
      return vItem1 === vItem2;
    },


    /**
     * TODOC
     *
     * @type member
     * @param item {var} TODOC
     * @return {var} TODOC
     */
    isItemSelected : function(item) {
      return this._selectedItems.contains(item);
    },






    /*
    ---------------------------------------------------------------------------
      SELECTION HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Make a single item selected / not selected
     *
     * #param item[qx.ui.core.Widget]: Item which should be selected / not selected
     * #param vSelected[Boolean]: Should this item be selected?
     *
     * @type member
     * @param item {var} TODOC
     * @param vSelected {var} TODOC
     * @return {void}
     */
    setItemSelected : function(item, vSelected)
    {
      switch(this.getMultiSelection())
      {
          // Multiple item selection is allowed
        case true:
          // If selection state is not to be changed => return
          if (this.isItemSelected(item) == vSelected) {
            return;
          }

          // Otherwise render new state
          this.renderItemSelectionState(item, vSelected);

          // Add item to selection hash / delete it from there
          vSelected ? this._selectedItems.add(item) : this._selectedItems.remove(item);

          // Dispatch change Event
          this._dispatchChange();

          break;

          // Multiple item selection is NOT allowed

        case false:
          var item0 = this.getSelectedItems()[0];

          if (vSelected)
          {
            // Precheck for any changes
            var old = item0;

            if (this.isEqual(item, old)) {
              return;
            }

            // Reset rendering of previous selected item
            if (old != null) {
              this.renderItemSelectionState(old, false);
            }

            // Render new item as selected
            this.renderItemSelectionState(item, true);

            // Reset current selection hash
            this._selectedItems.removeAll();

            // Add new one
            this._selectedItems.add(item);

            // Dispatch change Event
            this._dispatchChange();
          }
          else
          {
            // Reset rendering as selected item
            this.renderItemSelectionState(item, false);

            // Reset current selection hash
            this._selectedItems.removeAll();

            // Dispatch change Event
            this._dispatchChange();
          }

          break;
      }
    },


    /**
     * Get the selected items (objects)
     *
     * @type member
     * @return {var} TODOC
     */
    getSelectedItems : function() {
      return this._selectedItems.toArray();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getSelectedItem : function() {
      return this._selectedItems.getFirst();
    },


    /**
     * Select given items
     *
     * #param vItems[Array of Widgets]: Items to select
     *
     * @type member
     * @param vItems {var} TODOC
     * @return {void}
     */
    setSelectedItems : function(vItems)
    {
      var oldVal = this._getChangeValue();

      // Temporary disabling of event fire
      var oldFireChange = this.getFireChange();
      this.setFireChange(false);

      // Deselect all currently selected items
      this._deselectAll();

      // Apply new selection
      var item;
      var vItemLength = vItems.length;

      for (var i=0; i<vItemLength; i++)
      {
        item = vItems[i];

        // Add item to selection
        this._selectedItems.add(item);

        // Render new state for item
        this.renderItemSelectionState(item, true);
      }

      // Recover change event status
      this.setFireChange(oldFireChange);

      // Dispatch change Event
      if (oldFireChange && this._hasChanged(oldVal)) {
        this._dispatchChange();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param item {var} TODOC
     * @return {void}
     */
    setSelectedItem : function(item)
    {
      if (!item) {
        return;
      }

      var oldVal = this._getChangeValue();

      // Temporary disabling of event fire
      var oldFireChange = this.getFireChange();
      this.setFireChange(false);

      // Deselect all currently selected items
      this._deselectAll();

      // Add item to selection
      this._selectedItems.add(item);

      // Render new state for item
      this.renderItemSelectionState(item, true);

      // Recover change event status
      this.setFireChange(oldFireChange);

      // Dispatch change Event
      if (oldFireChange && this._hasChanged(oldVal)) {
        this._dispatchChange();
      }
    },


    /**
     * Select all items.
     *
     * @type member
     * @return {void}
     */
    selectAll : function()
    {
      var oldVal = this._getChangeValue();

      // Temporary disabling of event fire
      var oldFireChange = this.getFireChange();
      this.setFireChange(false);

      // Call sub method to select all items
      this._selectAll();

      // Recover change event status
      this.setFireChange(oldFireChange);

      // Dispatch change Event
      if (oldFireChange && this._hasChanged(oldVal)) {
        this._dispatchChange();
      }
    },


    /**
     * Sub method for selectAll. Handles the real work
     *  to select all items.
     *
     * @type member
     * @return {void | Boolean} TODOC
     */
    _selectAll : function()
    {
      if (!this.getMultiSelection()) {
        return;
      }

      var item;
      var vItems = this.getItems();

      console.log(vItems);

      var vItemsLength = vItems.length;

      // Reset current selection hash
      this._selectedItems.removeAll();

      for (var i=0; i<vItemsLength; i++)
      {
        item = vItems[i];

        // Add item to selection
        this._selectedItems.add(item);

        // Render new state for item
        this.renderItemSelectionState(item, true);
      }

      return true;
    },


    /**
     * Deselect all items.
     *
     * @type member
     * @return {void}
     */
    deselectAll : function()
    {
      var oldVal = this._getChangeValue();

      // Temporary disabling of event fire
      var oldFireChange = this.getFireChange();
      this.setFireChange(false);

      // Call sub method to deselect all items
      this._deselectAll();

      // Recover change event status
      this.setFireChange(oldFireChange);

      // Dispatch change Event
      if (oldFireChange && this._hasChanged(oldVal)) this._dispatchChange();
    },


    /**
     * Sub method for deselectAll. Handles the real work
     *  to deselect all items.
     *
     * @type member
     */
    _deselectAll : function()
    {
      // Render new state for items
      var items = this._selectedItems.toArray();

      for (var i=0; i<items.length; i++) {
        this.renderItemSelectionState(items[i], false);
      }

      // Delete all entries in selectedItems hash
      this._selectedItems.removeAll();

      return true;
    },


    /**
     * Select a range of items.
     *
     * #param vItem1[qx.ui.core.Widget]: Start item
     * #param vItem2[qx.ui.core.Widget]: Stop item
     *
     * @type member
     * @param vItem1 {var} TODOC
     * @param vItem2 {var} TODOC
     * @return {void}
     */
    selectItemRange : function(vItem1, vItem2)
    {
      var oldVal = this._getChangeValue();

      // Temporary disabling of event fire
      var oldFireChange = this.getFireChange();
      this.setFireChange(false);

      // Call sub method to select the range of items
      this._selectItemRange(vItem1, vItem2, true);

      // Recover change event status
      this.setFireChange(oldFireChange);

      // Dispatch change Event
      if (oldFireChange && this._hasChanged(oldVal)) {
        this._dispatchChange();
      }
    },


    /**
     * Sub method for selectItemRange. Handles the real work
     * to select a range of items.
     *
     * #param vItem1[qx.ui.core.Widget]: Start item
     * #param vItem2[qx.ui.core.Widget]: Stop item
     * #param vDelect[Boolean]: Deselect currently selected items first?
     *
     * @type member
     * @param vItem1 {var} TODOC
     * @param vItem2 {var} TODOC
     * @param vDeselect {var} TODOC
     * @return {var | Boolean} TODOC
     */
    _selectItemRange : function(vItem1, vItem2, vDeselect)
    {
      // this.debug("SELECT_RANGE: " + vItem1.toText() + "<->" + vItem2.toText());
      // this.debug("SELECT_RANGE: " + vItem1.pos + "<->" + vItem2.pos);
      // Pre-Check a revert call if vItem2 is before vItem1
      if (this.isBefore(vItem2, vItem1)) {
        return this._selectItemRange(vItem2, vItem1, vDeselect);
      }

      // Deselect all
      if (vDeselect) {
        this._deselectAll();
      }

      var vCurrentItem = vItem1;

      while (vCurrentItem != null)
      {
        // Add item to selection
        this._selectedItems.add(vCurrentItem);

        // Render new state for item
        this.renderItemSelectionState(vCurrentItem, true);

        // Stop here if we reached target item
        if (this.isEqual(vCurrentItem, vItem2)) {
          break;
        }

        // Get next item
        vCurrentItem = this.getNext(vCurrentItem);
      }

      return true;
    },


    /**
     * Internal method for deselection of ranges.
     *
     * #param vItem1[qx.ui.core.Widget]: Start item
     * #param vItem2[qx.ui.core.Widget]: Stop item
     *
     * @type member
     * @param vItem1 {var} TODOC
     * @param vItem2 {var} TODOC
     * @return {var} TODOC
     */
    _deselectItemRange : function(vItem1, vItem2)
    {
      // Pre-Check a revert call if vItem2 is before vItem1
      if (this.isBefore(vItem2, vItem1)) {
        return this._deselectItemRange(vItem2, vItem1);
      }

      var vCurrentItem = vItem1;

      while (vCurrentItem != null)
      {
        // Add item to selection
        this._selectedItems.remove(vCurrentItem);

        // Render new state for item
        this.renderItemSelectionState(vCurrentItem, false);

        // Stop here if we reached target item
        if (this.isEqual(vCurrentItem, vItem2)) {
          break;
        }

        // Get next item
        vCurrentItem = this.getNext(vCurrentItem);
      }
    },







    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    _activeDragSession : false,


    /**
     * TODOC
     *
     * @type member
     * @param item {var} TODOC
     * @param e {Event} TODOC
     * @return {void}
     */
    handleMouseDown : function(item, e)
    {
      // Only allow left and right button
      if (!e.isLeftPressed() && !e.isRightPressed()) {
        return;
      }

      // Keep selection on right click on already selected item
      if (e.isRightPressed() && this.isItemSelected(item)) {
        return;
      }

      // Shift Key
      //   or
      // Click on an unseleted item (without Ctrl)
      if (
        e.isShiftPressed() ||
        this.getDragSelection() ||
        (!this.isItemSelected(item) && !e.isCtrlPressed())
      )
      {
        // Handle event
        this._onmouseevent(item, e);
      }
      else
      {
        // Update lead item
        this.setLeadItem(item);
      }

      // Handle dragging
      this._activeDragSession = this.getDragSelection();

      if (this._activeDragSession)
      {
        // Add mouseup listener and register as capture widget
        this.getWidget().addListener("mouseup", this._ondragup, this);
        this.getWidget().capture();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _ondragup : function(e)
    {
      this.getWidget().removeListener("mouseup", this._ondragup, this);
      this.getWidget().releaseCapture();
      this._activeDragSession = false;
    },


    /**
     * TODOC
     *
     * @type member
     * @param item {var} TODOC
     * @param e {Event} TODOC
     * @return {void}
     */
    handleMouseUp : function(item, e)
    {
      if (!e.isLeftPressed()) {
        return;
      }

      if (e.isCtrlPressed() || this.isItemSelected(item) && !this._activeDragSession) {
        this._onmouseevent(item, e);
      }

      if (this._activeDragSession)
      {
        this._activeDragSession = false;
        this.getWidget().releaseCapture();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param oItem {Object} TODOC
     * @param e {Event} TODOC
     * @return {void}
     */
    handleMouseOver : function(oItem, e)
    {
      if (!this.getDragSelection() || !this._activeDragSession) {
        return;
      }

      this._onmouseevent(oItem, e, true);
    },


    /**
     * Internal handler for all mouse events bound to this manager.
     *
     * @type member
     * @param oItem {Object} TODOC
     * @param e {Event} TODOC
     * @param bOver {Boolean} TODOC
     * @return {void}
     */
    _onmouseevent : function(oItem, e, bOver)
    {
      // ********************************************************************
      //   Init
      // ********************************************************************
      // Cache current (old) values
      var oldVal = this._getChangeValue();
      var oldLead = this.getLeadItem();

      // Temporary disabling of event fire
      var oldFireChange = this.getFireChange();
      this.setFireChange(false);

      // Cache selection and count
      var selectedItems = this.getSelectedItems();
      var selectedCount = selectedItems.length;

      // Update lead item
      this.setLeadItem(oItem);
      this.getWidget().scrollItemIntoView(oItem);

      // Cache current anchor item
      var currentAnchorItem = this.getAnchorItem();

      // Cache keys pressed
      var vCtrlKey = e.isCtrlPressed();
      var vShiftKey = e.isShiftPressed();

      // ********************************************************************
      //   Do we need to update the anchor?
      // ********************************************************************
      if (
        !currentAnchorItem ||
        selectedCount == 0 ||
        (vCtrlKey && !vShiftKey && this.getMultiSelection() && !this.getDragSelection()))
      {
        this.setAnchorItem(oItem);
        currentAnchorItem = oItem;
      }

      // ********************************************************************
      //   Mode #1: Replace current selection with new one
      // ********************************************************************
      if ((!vCtrlKey && !vShiftKey && !this._activeDragSession || !this.getMultiSelection()))
      {
        // Remove current selection
        this._deselectAll();

        // Update anchor item
        this.setAnchorItem(oItem);

        // a little bit hacky, but seems to be a fast way to detect if we slide to top or to bottom
        if (this._activeDragSession) {
          this.getWidget().scrollItemIntoView((this.getWidget().getScrollTop() > (this.getWidget().getItemOffset(oItem) - 1) ? this.getPrevious(oItem) : this.getNext(oItem)) || oItem);
        }

        if (!this.isItemSelected(oItem)) {
          this.renderItemSelectionState(oItem, true);
        }

        // Clear up and add new one
        // this._selectedItems.removeAll();
        this._selectedItems.add(oItem);

        this._addToCurrentSelection = true;
      }

      // ********************************************************************
      //   Mode #2: (De-)Select item range in mouse drag session
      // ********************************************************************
      else if (this._activeDragSession && bOver)
      {
        if (oldLead) {
          this._deselectItemRange(currentAnchorItem, oldLead);
        }

        // Drag down
        if (this.isBefore(currentAnchorItem, oItem))
        {
          if (this._addToCurrentSelection) {
            this._selectItemRange(currentAnchorItem, oItem, false);
          } else {
            this._deselectItemRange(currentAnchorItem, oItem);
          }
        }

        // Drag up
        else
        {
          if (this._addToCurrentSelection) {
            this._selectItemRange(oItem, currentAnchorItem, false);
          } else {
            this._deselectItemRange(oItem, currentAnchorItem);
          }
        }

        // a little bit hacky, but seems to be a fast way to detect if we slide to top or to bottom
        this.getWidget().scrollItemIntoView((this.getWidget().getScrollTop() > (this.getWidget().getItemOffset(oItem) - 1) ? this.getPrevious(oItem) : this.getNext(oItem)) || oItem);
      }

      // ********************************************************************
      //   Mode #3: Add new item to current selection (ctrl pressed)
      // ********************************************************************
      else if (this.getMultiSelection() && vCtrlKey && !vShiftKey)
      {
        if (!this._activeDragSession) {
          this._addToCurrentSelection = !(this.getCanDeselect() && this.isItemSelected(oItem));
        }

        this.setItemSelected(oItem, this._addToCurrentSelection);
        this.setAnchorItem(oItem);
      }

      // ********************************************************************
      //   Mode #4: Add new (or continued) range to selection
      // ********************************************************************
      else if (this.getMultiSelection() && vCtrlKey && vShiftKey)
      {
        if (!this._activeDragSession) {
          this._addToCurrentSelection = !(this.getCanDeselect() && this.isItemSelected(oItem));
        }

        if (this._addToCurrentSelection) {
          this._selectItemRange(currentAnchorItem, oItem, false);
        } else {
          this._deselectItemRange(currentAnchorItem, oItem);
        }
      }

      // ********************************************************************
      //   Mode #5: Replace selection with new range selection
      // ********************************************************************
      else if (this.getMultiSelection() && !vCtrlKey && vShiftKey)
      {
        if (this.getCanDeselect()) {
          this._selectItemRange(currentAnchorItem, oItem, true);
        }
        else
        {
          if (oldLead) {
            this._deselectItemRange(currentAnchorItem, oldLead);
          }

          this._selectItemRange(currentAnchorItem, oItem, false);
        }
      }

      // Recover change event status
      this.setFireChange(oldFireChange);

      // Dispatch change Event
      if (oldFireChange && this._hasChanged(oldVal)) {
        this._dispatchChange();
      }
    },




    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    /**
     * Handles key event to perform selection and navigation
     *
     * @type member
     * @param ev {qx.event.type.KeyEvent} event object
     * @return {void}
     */
    handleKeyPress : function(ev)
    {
      var oldVal = this._getChangeValue();

      // this.debug("KeyPress: " + ev.getKeyIdentifier());

      // Temporary disabling of event fire
      var oldFireChange = this.getFireChange();
      this.setFireChange(false);

      // Ctrl+A: Select all
      if (ev.getKeyIdentifier() == "A" && ev.isCtrlPressed())
      {
        if (this.getMultiSelection())
        {
          this._selectAll();

          // Update lead item to this new last
          // (or better here: first) selected item
          this.setLeadItem(this.getFirst());
        }
      }

      // Default operation
      else
      {
        var aIndex = this.getAnchorItem();
        var itemToSelect = this.getItemToSelect(ev);

        // this.debug("Anchor: " + (aIndex ? aIndex.getLabel() : "null"));
        // this.debug("ToSelect: " + (itemToSelect ? itemToSelect.getLabel() : "null"));
        if (itemToSelect)
        {
          // Update lead item to this new last selected item
          this.setLeadItem(itemToSelect);

          // Scroll new item into view
          this.getWidget().scrollItemIntoView(itemToSelect);

          // Select a range
          if (ev.isShiftPressed() && this.getMultiSelection())
          {
            // Make it a little bit more failsafe:
            // Set anchor if not given already. Allows us to select
            // a range without any previous selection.
            if (aIndex == null) {
              this.setAnchorItem(itemToSelect);
            }

            // Select new range (and clear up current selection first)
            this._selectItemRange(this.getAnchorItem(), itemToSelect, true);
          }
          else if (!ev.isCtrlPressed())
          {
            // Clear current selection
            this._deselectAll();

            // Update new item to be selected
            this.renderItemSelectionState(itemToSelect, true);

            // Add item to new selection
            this._selectedItems.add(itemToSelect);

            // Update anchor to this new item
            // (allows following shift range selection)
            this.setAnchorItem(itemToSelect);
          }
          else if (ev.getKeyIdentifier() == "Space")
          {
            if (this._selectedItems.contains(itemToSelect))
            {
              // Update new item to be selected
              this.renderItemSelectionState(itemToSelect, false);

              // Add item to new selection
              this._selectedItems.remove(itemToSelect);

              // Fix anchor item
              this.setAnchorItem(this._selectedItems.getFirst());
            }
            else
            {
              // Clear current selection
              if (!ev.isCtrlPressed() || !this.getMultiSelection()) {
                this._deselectAll();
              }

              // Update new item to be selected
              this.renderItemSelectionState(itemToSelect, true);

              // Add item to new selection
              this._selectedItems.add(itemToSelect);

              // Update anchor to this new item
              // (allows following shift range selection)
              this.setAnchorItem(itemToSelect);
            }
          }
        }
      }

      // Recover change event status
      this.setFireChange(oldFireChange);

      // Dispatch change Event
      if (oldFireChange && this._hasChanged(oldVal)) {
        this._dispatchChange();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vKeyboardEvent {var} TODOC
     * @return {null | var} TODOC
     */
    getItemToSelect : function(vKeyboardEvent)
    {
      // Don't handle ALT here
      if (vKeyboardEvent.isAltPressed()) {
        return null;
      }

      // Handle event by key identifier
      switch(vKeyboardEvent.getKeyIdentifier())
      {
        case "Home":
          return this.getFirst();

        case "End":
          return this.getLast();

        case "Down":
          return this.getNext(this.getLeadItem());

        case "Up":
          return this.getPrevious(this.getLeadItem());

        case "PageUp":
          return this.getPageUp(this.getLeadItem()) || this.getFirst();

        case "PageDown":
          return this.getPageDown(this.getLeadItem()) || this.getLast();

        case "Space":
          if (vKeyboardEvent.isCtrlPressed()) {
            return this.getLeadItem();
          }
      }

      return null;
    },




    /*
    ---------------------------------------------------------------------------
      CHANGE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _dispatchChange : function()
    {
      if (!this.getFireChange()) {
        return;
      }

      this.fireDataEvent("changeSelection", this.getSelectedItems(), true);
    },


    /**
     * TODOC
     *
     * @type member
     * @param sOldValue {String} TODOC
     * @return {var} TODOC
     */
    _hasChanged : function(sOldValue) {
      return sOldValue != this._getChangeValue();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _getChangeValue : function() {
      return this._selectedItems.getChangeValue();
    },






    /*
    ---------------------------------------------------------------------------
      PAGE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Jump a "page" up.
     *
     * #param item[qx.ui.core.Widget]: Relative to this widget
     *
     * @type member
     * @param item {var} TODOC
     * @return {var} TODOC
     */
    getPageUp : function(item)
    {
      var vBoundedWidget = this.getWidget();
      var vParentScrollTop = vBoundedWidget.getScrollTop();
      var vParentClientHeight = vBoundedWidget.getInnerHeight();

      // Find next item
      var nextItem = this.getLeadItem();

      if (!nextItem) {
        nextItem = this.getFirst();
      }

      // Normally we should reach the status "lead" for the
      // nextItem after two iterations.
      var tryLoops = 0;

      while (tryLoops < 2)
      {
        while (nextItem && (this.getWidget().getItemOffset(nextItem) - this.getWidget().getItemHeight(nextItem) >= vParentScrollTop)) {
          nextItem = this.getPrevious(nextItem);
        }

        // This should never occour after the fix above
        if (nextItem == null) {
          break;
        }

        // If the nextItem is not anymore the leadItem
        // Means: There has occured a change.
        // We break here. This is normally the second step.
        if (nextItem != this.getLeadItem())
        {
          // be sure that the top is reached
          vBoundedWidget.scrollItemIntoView(nextItem);
          break;
        }

        // Update scrolling (this is normally the first step)
        vBoundedWidget.setScrollTop(vParentScrollTop - vParentClientHeight - vBoundedWidget.getItemHeight(nextItem));

        // Use the real applied value instead of the calulated above
        vParentScrollTop = vBoundedWidget.getScrollTop();

        // Increment counter
        tryLoops++;
      }

      return nextItem;
    },


    /**
     * Jump a "page" down.
     *
     * #param item[qx.ui.core.Widget]: Relative to this widget
     *
     * @type member
     * @param item {var} TODOC
     * @return {var} TODOC
     */
    getPageDown : function(item)
    {
      var vBoundedWidget = this.getWidget();
      var vParentScrollTop = vBoundedWidget.getScrollTop();
      var vParentClientHeight = vBoundedWidget.getInnerHeight();

      // Find next item
      var nextItem = this.getLeadItem();

      if (!nextItem) {
        nextItem = this.getFirst();
      }

      // Normally we should reach the status "lead" for the
      // nextItem after two iterations.
      var tryLoops = 0;

      while (tryLoops < 2)
      {
        // Find next
        while (nextItem && ((vBoundedWidget.getItemOffset(nextItem) + (2 * vBoundedWidget.getItemHeight(nextItem))) <= (vParentScrollTop + vParentClientHeight))) {
          nextItem = this.getNext(nextItem);
        }

        // This should never occour after the fix above
        if (nextItem == null) {
          break;
        }

        // If the nextItem is not anymore the leadItem
        // Means: There has occured a change.
        // We break here. This is normally the second step.
        if (nextItem != this.getLeadItem()) {
          break;
        }

        // Update scrolling (this is normally the first step)
        vBoundedWidget.setScrollTop(vParentScrollTop + vParentClientHeight - 2 * vBoundedWidget.getItemHeight(nextItem));

        // Use the real applied value instead of the calulated above
        vParentScrollTop = vBoundedWidget.getScrollTop();

        // Increment counter
        tryLoops++;
      }

      return nextItem;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_selectedItems");
  }
});
