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

    this._selection = {};
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    multiSelection :
    {
      check : "Boolean",
      init : false
    },

    leadItem :
    {
      nullable : true,
      apply : "_applyLeadItem"
    },

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
    _applyMultiSelection : function(value, old)
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
      if (this.getMultiSelection())
      {
        // Update lead item
        this.setLeadItem(item);

        // Read in keyboard modifiers
        var ctrlPressed = event.isCtrlPressed();
        var shiftPressed = event.isShiftPressed();

        if (ctrlPressed && shiftPressed)
        {

        }

        // Add to selection / Toggle in selection
        else if (ctrlPressed)
        {
          this._toggleInSelection(item);
        }

        // Create/Update range selection
        else if (shiftPressed && this.getAnchorItem())
        {
          this._selectItemRange(this.getAnchorItem(), item);
        }

        // Replace current selection
        else
        {
          this.setAnchorItem(item);
          this._setSelectedItem(item);
        }

        // Fill empty anchor item
        if (!this.getAnchorItem()) {
          this.setAnchorItem(item);
        }
      }
      else
      {
        this._setSelectedItem(item);
      }
    },

    handleKeyPress : function(item, event)
    {
      var next;
      var current;

      if (this.getMultiSelection()) {
        current = this.getLeadItem();
      } else {
        current = this._getSelectedItem();
      }

      switch(event.getKeyIdentifier())
      {
        case "Home":
          next = this._getFirstItem();
          break;

        case "End":
          next = this._getLastItem();
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

        default:
          return;
      }

      // Process result
      if (next)
      {
        if (this.getMultiSelection())
        {

        }
        else
        {
          this._setSelectedItem(next);
          this._scrollItemIntoView(next);
        }
      }

      // Stop processed events
      event.stopPropagation();
      event.preventDefault();
    },


    _selectItemRange : function(item1, item2)
    {
      var range = this._getItemRange(item1, item2);
      var mapped = this._mapRange(range);
      var selected = this._selection;
      var current;
      var hash;

      for (hash in selected)
      {
        if (!mapped[hash]) {
          this._removeFromSelection(selected[hash]);
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


    _mapRange : function(range)
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
