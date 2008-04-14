/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * General selection manager to bring rich desktop like selection behavior
 * to widgets and low-level interactive controls.
 *
 * The selection handling supports both Shift and Ctrl/Meta modifies like
 * known from native applications.
 *
 * It also respects platform differences between Windows and Mac e.g. uses
 * the Ctrl key under Windows to add items to a selection while using
 * the Command/Meta key under Mac.
 *
 * The Mac platform has some differences in behavior between different
 * applications. Under Apple Mail and most other applications
 * the selection created via the Shift behaves identical to Windows. One
 * Exception is the Finder, where the Shift selections always behave like
 * Shift+Meta/Ctrl and always add keep the items of the selection and
 * just add new ones. The selection manager only support Windows style
 * selections for Shift key combinations.
 */
qx.Class.define("qx.ui.core.selection2.Abstract",
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

    // {Map} Interal selection storage
    this._selection = {};

    // Timer
    this._scrollTimer = new qx.event.Timer(200);
    this._scrollTimer.addListener("interval", this._onInterval, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     *
     */
    mode :
    {
      check : [ "single", "multi", "additive" ],
      init : "single",
      apply : "_applySelectionMode"
    },


    /**
     *
     */
    dragSelection :
    {
      check : "Boolean",
      init : true
    },


    /**
     *
     */
    leadItem :
    {
      nullable : true,
      apply : "_applyLeadItem"
    },


    /**
     *
     */
    anchorItem :
    {
      nullable : true,
      apply : "_applyAnchorItem"
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
      ABSTRACT METHODS FOR CONTAINER
    ---------------------------------------------------------------------------
    */

    _capture : function() {
      throw new Error("Abstract method call: _capture()");
    },


    _release : function() {
      throw new Error("Abstract method call: _release()");
    },


    _getLocation : function() {
      throw new Error("Abstract method call: _getLocation()");
    },


    _scrollBy : function(xoff, yoff) {
      throw new Error("Abstract method call: _scrollBy()");
    },






    /*
    ---------------------------------------------------------------------------
      ABSTRACT METHODS FOR SELECTABLES
    ---------------------------------------------------------------------------
    */

    _isSelectable : function(item) {
      throw new Error("Abstract method call: _isSelectable()");
    },


    _selectableToHashCode : function(item) {
      throw new Error("Abstract method call: _selectableToHashCode()");
    },


    _getSelectables : function(item) {
      throw new Error("Abstract method call: _getSelectables()");
    },


    _getSelectableRange : function(item1, item2) {
      throw new Error("Abstract method call: _getSelectableRange()");
    },


    _scrollSelectableIntoView : function(item) {
      throw new Error("Abstract method call: _scrollSelectableIntoView()");
    },


    _styleSelectable : function(item, type, enabled) {
      throw new Error("Abstract method call: _styleSelectable()");
    },


    _getFirstSelectable : function() {
      throw new Error("Abstract method call: _getFirstSelectable()");
    },


    _getLastSelectable : function() {
      throw new Error("Abstract method call: _getLastSelectable()");
    },


    _getRelatedSelectable : function(item, relation) {
      throw new Error("Abstract method call: _getRelatedSelectable()");
    },






    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelectionMode : function(value, old)
    {
      this.resetLeadItem();
      this.resetAnchorItem();

      this._clearSelection();
    },


    // property apply
    _applyLeadItem : function(value, old)
    {
      if (old) {
        this._styleSelectable(old, "lead", false);
      }

      if (value) {
        this._styleSelectable(value, "lead", true);
      }
    },


    // property apply
    _applyAnchorItem : function(value, old)
    {
      if (old) {
        this._styleSelectable(old, "anchor", false);
      }

      if (value) {
        this._styleSelectable(value, "anchor", true);
      }
    },





    /*
    ---------------------------------------------------------------------------
      MOUSE SUPPORT
    ---------------------------------------------------------------------------
    */

    handleMouseDown : function(event)
    {
      var item = event.getTarget();
      if (!this._isSelectable(item)) {
        return;
      }

      this._scrollSelectableIntoView(item);

      switch(this.getMode())
      {
        case "single":
          this._setSelectedItem(item);
          break;

        case "additive":
          this.setLeadItem(item);
          this.setAnchorItem(item);
          this._toggleInSelection(item);
          break;

        case "multi":
          // Update lead item
          this.setLeadItem(item);

          // Read in keyboard modifiers
          var isCtrlPressed = event.isCtrlPressed() || (qx.bom.client.Platform.MAC && event.isMetaPressed());

          // Create/Update range selection
          if (event.isShiftPressed())
          {
            var anchor = this.getAnchorItem();
            if (!anchor) {
              this.setAnchorItem(anchor = this.getFirstItem());
            }

            this._selectItemRange(anchor, item, isCtrlPressed);
          }

          // Toggle in selection
          else if (isCtrlPressed)
          {
            this.setAnchorItem(item);
            this._toggleInSelection(item);
          }

          // Replace current selection
          else
          {
            this.setAnchorItem(item);
            this._setSelectedItem(item);
          }

          break;
      }

      if (this.getDragSelection() && this.getMode() !== "single")
      {
        this._location = this._getLocation();

        this._startMouseX = event.getDocumentLeft() + this._widget.getScrollLeft();
        this._startMouseY = event.getDocumentTop() + this._widget.getScrollTop();

        this._capture();
        this._inCapture = true;
      }
    },


    handleMouseUp : function(event)
    {
      if (!this.getDragSelection()) {
        return;
      }

      delete this._inCapture;

      this._release();
      this._scrollTimer.stop();
    },


    handleMouseMove : function(event)
    {
      if (!this._inCapture) {
        return;
      }

      this._currentMouseY = event.getDocumentTop();

      var mouseY = event.getDocumentTop() + this._widget.getScrollTop();

      if (mouseY > this._startMouseY) {
        this._moveY = 1;
      } else if (mouseY < this._startMouseY) {
        this._moveY = -1;
      } else {
        this._moveY = 0;
      }

      //this.debug("MOVE: " + this._moveY)

      var loc = this._location;
      var top = event.getDocumentTop();

      if (top < loc.top) {
        this._scrollByY = top - loc.top;
      } else if (top > loc.bottom) {
        this._scrollByY = top - loc.bottom;
      } else {
        this._scrollByY = 0;
      }


      // TODO: x-axis
      this._scrollByX = 0;

      // Start interval
      this._scrollTimer.start();

      // Auto select based on new cursor position
      this._autoSelect();
    },


    _onInterval : function(e)
    {
      // Scroll by defined block size
      this._scrollBy(this._scrollByX, this._scrollByY);

      // Auto select based on new scroll position and cursor
      this._autoSelect();
    },


    _autoSelect : function()
    {
      // Get current relative Y position and compare it with previous one
      var relY = this._currentMouseY + this._widget.getScrollTop() - this._location.top;
      if (this._lastRelY === relY) {
        return;
      }

      this._lastRelY = relY;


      var next, pos, size;
      var anchor = this.getAnchorItem();
      var lead = anchor;
      var move = this._moveY;

      while (move !== 0)
      {
        // Find next item to process depending on current scroll direction
        next = move > 0 ? this._getRelatedSelectable(lead, "under") : this._getRelatedSelectable(lead, "above");

        // When the current lead is the first or last item, the result
        // here may be null
        if (!next) {
          break;
        }

        // Continue when the item is in the visible area
        pos = this._widget.getItemOffsetTop(next);
        size = this._widget.getItemHeight(next);

        if ((move > 0 && pos <= relY) || (move < 0 && (pos + size) >= relY)) {
          lead = next;
        } else {
          break;
        }
      }

      // Differenciate between the two supported modes
      var mode = this.getMode();
      if (mode === "multi")
      {
        // Replace current selection with new range
        this._selectItemRange(anchor, lead);
      }
      else if (mode === "additive")
      {
        // Behavior depends on the fact whether the
        // anchor item is selected or not
        if (this._isItemSelected(anchor)) {
          this._selectItemRange(anchor, lead, true);
        } else {
          this._deselectItemRange(anchor, lead);
        }

        // Improve performance. This mode does not rely
        // on full ranges as it always extend the old
        // selection/deselection.
        this.setAnchorItem(lead);
      }
    },






    /*
    ---------------------------------------------------------------------------
      KEYBOARD SUPPORT
    ---------------------------------------------------------------------------
    */

    /** {Map} All supported navigation keys */
    __navigationKeys :
    {
      Home : 1,
      Down : 1 ,
      Right : 1,
      PageDown : 1,
      End : 1,
      Up : 1,
      Left : 1,
      PageUp : 1
    },


    handleKeyPress : function(event)
    {
      var current, next;
      var key = event.getKeyIdentifier();
      var mode = this.getMode();

      // Support both control keys on Mac
      var isCtrlPressed = event.isCtrlPressed() || (qx.bom.client.Platform.MAC && event.isMetaPressed());
      var isShiftPressed = event.isShiftPressed();

      if (key === "A" && isCtrlPressed)
      {
        this._selectAllItems();
      }
      else if (key === "Escape")
      {
        this._clearSelection();
      }
      else if (key === "Space")
      {
        var lead = this.getLeadItem();
        if (lead && !isShiftPressed)
        {
          if (isCtrlPressed || mode === "additive") {
            this._toggleInSelection(lead);
          } else {
            this._setSelectedItem(lead);
          }
        }
      }
      else if (this.__navigationKeys[key])
      {
        if (mode === "single") {
          current = this._getSelectedItem();
        } else {
          current = this.getLeadItem();
        }

        var first = this._getFirstSelectable();
        var last = this._getLastSelectable();

        if (current)
        {
          switch(key)
          {
            case "Home":
              next = first;
              break;

            case "End":
              next = last;
              break;

            case "Up":
              next = this._getRelatedSelectable(current, "above");
              break;

            case "Down":
              next = this._getRelatedSelectable(current, "under");
              break;

            case "Left":
              next = this._getRelatedSelectable(current, "left");
              break;

            case "Right":
              next = this._getRelatedSelectable(current, "right");
              break;

            case "PageUp":

              //next =
              break;

            case "PageDown":
              //next =
              break;
          }
        }
        else
        {
          switch(key)
          {
            case "Home":
            case "Down":
            case "Right":
            case "PageDown":
              next = first;
              break;

            case "End":
            case "Up":
            case "Left":
            case "PageUp":
              next = last;
              break;
          }
        }

        // Process result
        if (next)
        {
          switch(mode)
          {
            case "single":
              this._setSelectedItem(next);
              break;

            case "additive":
              this.setLeadItem(next);
              break;

            case "multi":
              if (isShiftPressed)
              {
                var anchor = this.getAnchorItem();
                if (!anchor) {
                  this.setAnchorItem(anchor = this._getFirstSelectable());
                }

                this.setLeadItem(next);
                this._selectItemRange(anchor, next, isCtrlPressed);
              }
              else
              {
                this.setAnchorItem(next);
                this.setLeadItem(next);

                if (!isCtrlPressed) {
                  this._setSelectedItem(next);
                }
              }

              break;
          }

          this._scrollSelectableIntoView(next);
        }
      }
      else
      {
        // Do not stop this event
        return;
      }

      // Stop processed events
      event.stop();
    },






    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR ITEM RANGES
    ---------------------------------------------------------------------------
    */

    _selectAllItems : function()
    {
      var range = this._getSelectables();
      for (var i=0, l=range.length; i<l; i++) {
        this._addToSelection(range[i]);
      }
    },


    _clearSelection : function()
    {
      var selection = this._selection;
      for (var hash in selection) {
        this._removeFromSelection(selection[hash]);
      }
    },


    _selectItemRange : function(item1, item2, extend)
    {
      var range = this._getSelectableRange(item1, item2);

      // Remove items which are not in the detected range
      if (!extend)
      {
        var selected = this._selection;
        var mapped = this.__rangeToMap(range);

        for (var hash in selected)
        {
          if (!mapped[hash]) {
            this._removeFromSelection(selected[hash]);
          }
        }
      }

      // Add new items to the selection
      for (var i=0, l=range.length; i<l; i++) {
        this._addToSelection(range[i]);
      }
    },


    _deselectItemRange : function(item1, item2)
    {
      var range = this._getSelectableRange(item1, item2);
      for (var i=0, l=range.length; i<l; i++) {
        this._removeFromSelection(range[i]);
      }
    },


    __rangeToMap : function(range)
    {
      var mapped = {};
      var item;

      for (var i=0, l=range.length; i<l; i++)
      {
        item = range[i];
        mapped[this._selectableToHashCode(item)] = item;
      }

      return mapped;
    },






    /*
    ---------------------------------------------------------------------------
      SINGLE ITEM QUERY AND MODIFICATION
    ---------------------------------------------------------------------------
    */

    /**
     * Detects whether the given item is currently selected.
     *
     * @type member
     * @param item {var} Any valid selectable item
     * @return {Boolean} Whether the item is selected
     */
    _isItemSelected : function(item)
    {
      var hash = this._selectableToHashCode(item);
      return !!this._selection[hash];
    },


    /**
     * Returns the first selected item. Only makes sense
     * when using manager in single selection mode.
     *
     * @type member
     * @return {var} The selected item (or <code>null</code>)
     */
    _getSelectedItem : function()
    {
      for (var hash in this._selection) {
        return this._selection[hash];
      }

      return null;
    },


    /**
     * Replace current selection with given item.
     *
     * @type member
     * @param item {var} Any valid selectable item
     * @return {void}
     */
    _setSelectedItem : function(item)
    {
      this._clearSelection();
      this._addToSelection(item);
    },






    /*
    ---------------------------------------------------------------------------
      MODIFY ITEM SELECTION
    ---------------------------------------------------------------------------
    */

    _addToSelection : function(item)
    {
      var hash = this._selectableToHashCode(item);

      if (!this._selection[hash])
      {
        this._selection[hash] = item;
        this._styleSelectable(item, "selected", true);
      }
    },


    _toggleInSelection : function(item)
    {
      var hash = this._selectableToHashCode(item);

      if (!this._selection[hash])
      {
        this._selection[hash] = item;
        this._styleSelectable(item, "selected", true);
      }
      else
      {
        delete this._selection[hash];
        this._styleSelectable(item, "selected", false);
      }
    },


    _removeFromSelection : function(item)
    {
      var hash = this._selectableToHashCode(item);

      if (this._selection[hash])
      {
        delete this._selection[hash];
        this._styleSelectable(item, "selected", false);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_scrollTimer");
    this._disposeFields("_selection");
  }
});
