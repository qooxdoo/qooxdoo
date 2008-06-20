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

************************************************************************ */

/**
 * The radio manager handles a collection of items from which only one item
 * can be selected. Selection another item will deselect the previously selected
 * item.
 *
 * This class is e.g. used to create radio groups or {@link qx.ui.form.RadioButton}
 * or {@link qx.ui.toolbar.RadioButton} instances.
 */
qx.Class.define("qx.ui.core.RadioManager",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param varargs {qx.core.Object} A variable number of items, which are
   *     intially added to the radio manager.
   */
  construct : function(varargs)
  {
    // we don't need the manager data structures
    this.base(arguments);

    // create item array
    this._items = [];

    if (varargs != null)
    {
      // add() iterates over arguments, but vMembers is an array
      this.add.apply(this, arguments);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The currently selected item of the radio group
     */
    selected :
    {
      nullable : true,
      apply : "_applySelected",
      event : "change",
      check : "qx.ui.core.IRadioItem"
    },


    /**
     * Whether the selection should wrap arond. This means that the successor of
     * the last item is the first item.
     */
    wrap :
    {
      check : "Boolean",
      init: true
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Get all managed items
     *
     * @return {IRadioItem[]} All managed items
     */
    getItems : function() {
      return this._items;
    },


    /**
     * Set the checked state of a given item
     *
     * @param vItem {IRadioItem} The item to set the checked state of
     * @param vChecked {Boolean} Whether the item should be checked
     */
    setItemChecked : function(vItem, vChecked)
    {
      if (vChecked) {
        this.setSelected(vItem);
      } else if (this.getSelected() == vItem) {
        this.setSelected(null);
      }
    },


    /**
     * Select the radio item, with the given value.
     *
     * @param value {var} Value of the radio item to select
     */
    setValue : function(value)
    {
      var items = this._items;
      for (var i=0; i<items.length; i++)
      {
        var item = items[i];
        if (item.getValue() == value)
        {
          this.setSelected(item);;
          break;
        }
      }
    },


    /**
     * Get the value of the selected radio item
     *
     * @return {var|null} The value of the selected radio item. Returns
     *     <code>null</code> if no item is selected.
     */
    getValue : function()
    {
      var selected = this.getSelected();
      if (selected) {
        return selected.getValue();
      } else {
        return null;
      }
    },


    /**
     * Set the enabled state of all managed widgets
     *
     * @param isEnabled {Boolean|null} The new enabled state of all managed
     *     widgets. A value of <code>null</code> will reset the enabled state of
     *     all managed widgets.
     */
    setEnabled : function(isEnabled)
    {
      var items = this._items;
      for (var i=0; i<items.length; i++)
      {
        if (isEnabled == null) {
          items[i].resetEnabled();
        } else {
          items[i].setEnabled(isEnabled);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      REGISTRY
    ---------------------------------------------------------------------------
    */

    /**
     * Add the passed items to the radio manager.
     *
     * @type member
     * @param varargs {IRadioItem} A variable number of items to add
     * @return {void}
     */
    add : function(varargs)
    {
      var vItems = arguments;
      var vLength = vItems.length;
      var vItem;

      for (var i=0; i<vLength; i++)
      {
        vItem = vItems[i];

        if (qx.lang.Array.contains(this._items, vItem)) {
          return;
        }

        // Push RadioButton to array
        this._items.push(vItem);

        // Inform radio button about new manager
        vItem.setManager(this);

        // Need to update internal value?
        if (vItem.getChecked()) {
          this.setSelected(vItem);
        }
      }
    },



    /**
     * Remove an item from the radio manager
     *
     * @param vItem {IRadioItem} The item to remove
     */
    remove : function(vItem)
    {
      // Remove RadioButton from array
      qx.lang.Array.remove(this._items, vItem);

      // Inform radio button about new manager
      vItem.setManager(null);

      // if the radio was checked, set internal selection to null
      if (vItem.getChecked()) {
        this.setSelected(null);
      }
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelected : function(value, old)
    {
      if (old) {
        old.setChecked(false);
      }

      if (value) 
      {
        value.setChecked(true);
        
        // If the old one was focused, now switch focus to the new item
        if (old && old.hasState("focused")) {
          value.focus(); 
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      SELECTION
    ---------------------------------------------------------------------------
    */

    /**
     * Select the item following the given item
     *
     * @param vItem {IRadioItem} The item to select the next item of
     */
    selectNext : function(vItem)
    {
      var vIndex = this._items.indexOf(vItem);

      if (vIndex == -1) {
        return;
      }

      var i = 0;
      var vLength = this._items.length;

      // Find next enabled item
      if (this.getWrap()) {
        vIndex = (vIndex + 1) % vLength;
      } else {
        vIndex = Math.min(vIndex + 1, vLength - 1);
      }

      while (i < vLength && !this._items[vIndex].getEnabled())
      {
        vIndex = (vIndex + 1) % vLength;
        i++;
      }

      this._selectByIndex(vIndex);
    },


    /**
     * Select the item previous the given item
     *
     * @param vItem {IRadioItem} The item to select the previous item of
     */
    selectPrevious : function(vItem)
    {
      var vIndex = this._items.indexOf(vItem);

      if (vIndex == -1) {
        return;
      }

      var i = 0;
      var vLength = this._items.length;

      // Find previous enabled item
      if (this.getWrap()) {
        vIndex = (vIndex - 1 + vLength) % vLength;
      } else {
        vIndex = Math.max(vIndex - 1, 0);
      }

      while (i < vLength && !this._items[vIndex].getEnabled())
      {
        vIndex = (vIndex - 1 + vLength) % vLength;
        i++;
      }

      this._selectByIndex(vIndex);
    },



    /**
     * Select an item by its internal index
     *
     * @param vIndex {Integer} The index if the item to select.
     */
    _selectByIndex : function(vIndex) {
      this.setSelected(this._items[vIndex]);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeArray("_items");
  }
});
