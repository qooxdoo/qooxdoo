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
      ABSTRACT METHODS
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyLeadItem : function(value, old) {
      throw new Error("Abstract method call: _applyLeadItem()");
    },


    // property apply
    _applyAnchorItem : function(value, old) {
      throw new Error("Abstract method call: _applyAnchorItem()");
    },


    // overridden
    _itemToHashCode : function(item) {
      throw new Error("Abstract method call: itemToHashcode()");
    },


    // overridden
    _getSelectableItems : function(item) {
      throw new Error("Abstract method call: _getItems()");
    },


    // overridden
    _getItemRange : function(item1, item2) {
      throw new Error("Abstract method call: _getItemRange()");
    },


    // overridden
    _scrollItemIntoView : function(item) {
      throw new Error("Abstract method call: _scrollItemIntoView()");
    },


    // overridden
    _styleItemSelected : function(item) {
      throw new Error("Abstract method call: _styleItemSelected()");
    },


    // overridden
    _styleItemUnselected : function(item) {
      throw new Error("Abstract method call: _styleItemUnselected()");
    },


    // overridden
    _getFirstItem : function() {
      throw new Error("Abstract method call: _getFirstItem()");
    },


    // overridden
    _getLastItem : function() {
      throw new Error("Abstract method call: _getLastItem()");
    },


    // overridden
    _getItemAbove : function(rel) {
      throw new Error("Abstract method call: _getItemAbove()");
    },


    // overridden
    _getItemUnder : function(rel) {
      throw new Error("Abstract method call: _getItemUnder()");
    },


    // overridden
    _getItemLeft : function(rel) {
      throw new Error("Abstract method call: _getItemLeft()");
    },


    // overridden
    _getItemRight : function(rel) {
      throw new Error("Abstract method call: _getItemRight()");
    },


    // overridden
    _getItemPageUp : function(rel) {
      throw new Error("Abstract method call: _getItemPageUp()");
    },


    // overridden
    _getItemPageDown : function(rel) {
      throw new Error("Abstract method call: _getItemPageDown()");
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelectionMode : function(value, old)
    {
      this.resetLeadItem();
      this.resetAnchorItem();

      this._clearSelection();
    },





    /*
    ---------------------------------------------------------------------------
      CALLED BY THE CONNECTED OBJECT
    ---------------------------------------------------------------------------
    */

    handleMouseDown : function(item, event)
    {
      switch(this.getMode())
      {
        case "single":
          this._setSelectedItem(item);
          break;

        case "additive":
          this.setLeadItem(item);
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
    },
    
    
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
    

    handleKeyPress : function(item, event)
    {
      var current, next;
      var key = event.getKeyIdentifier();
      var mode = this.getMode();
      
      // Support both control keys on Mac
      var isCtrlPressed = event.isCtrlPressed() || (qx.bom.client.Platform.MAC && event.isMetaPressed());
      var isShiftPressed = event.isShiftPressed();
      
      if (key === "Space")
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

        var first = this._getFirstItem();
        var last = this._getLastItem();
      
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
              next = this._getItemAbove(current);
              break;

            case "Down":
              next = this._getItemUnder(current);
              break;

            case "Left":
              next = this._getItemLeft(current);
              break;

            case "Right":
              next = this._getItemRight(current);
              break;

            case "PageUp":
              next = this._getItemPageUp(current);
              break;

            case "PageDown":
              next = this._getItemPageDown(current);
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
                  this.setAnchorItem(anchor = this._getFirstItem());
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

          this._scrollItemIntoView(next);
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


    _selectItemRange : function(item1, item2, extend)
    {
      var range = this._getItemRange(item1, item2);
      var selected = this._selection;
      var current;
      var hash;

      // Remove items which are not in the detected range
      if (!extend)
      {
        var mapped = this.__rangeToMap(range);
        for (hash in selected)
        {
          if (!mapped[hash]) {
            this._removeFromSelection(selected[hash]);
          }
        }
      }

      for (var i=0, l=range.length; i<l; i++)
      {
        current = range[i];
        hash = this._itemToHashCode(current);

        if (!selected[hash]) {
          this._addToSelection(current);
        }
      }
    },


    __rangeToMap : function(range)
    {
      var mapped = {};
      var item;

      for (var i=0, l=range.length; i<l; i++)
      {
        item = range[i];
        mapped[this._itemToHashCode(item)] = item;
      }

      return mapped;
    },








    _isSelected : function(item)
    {
      var hash = this._itemToHashCode(item);
      return !!this._selection[hash];
    },


    _getSelectedItem : function()
    {
      for (var hash in this._selection) {
        return this._selection[hash];
      }
    },


    _setSelectedItem : function(item)
    {
      this._clearSelection();
      this._addToSelection(item);
    },






    _addToSelection : function(item)
    {
      var hash = this._itemToHashCode(item);

      if (!this._selection[hash])
      {
        this._selection[hash] = item;
        this._styleItemSelected(item);
      }
    },


    _toggleInSelection : function(item)
    {
      var hash = this._itemToHashCode(item);

      if (!this._selection[hash])
      {
        this._selection[hash] = item;
        this._styleItemSelected(item);
      }
      else
      {
        delete this._selection[hash];
        this._styleItemUnselected(item);
      }
    },


    _removeFromSelection : function(item)
    {
      var hash = this._itemToHashCode(item);

      if (this._selection[hash])
      {
        delete this._selection[hash];
        this._styleItemUnselected(item);
      }
    },


    _clearSelection : function()
    {
      var selection = this._selection;
      for (var hash in selection) {
        this._removeFromSelection(selection[hash]);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_selection");
  }
});
