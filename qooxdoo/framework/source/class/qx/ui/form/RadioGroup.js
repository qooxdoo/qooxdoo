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
 * The radio group handles a collection of items from which only one item
 * can be selected. Selection another item will deselect the previously selected
 * item.
 *
 * This class is e.g. used to create radio groups or {@link qx.ui.form.RadioButton}
 * or {@link qx.ui.toolbar.RadioButton} instances.
 */
qx.Class.define("qx.ui.form.RadioGroup",
{
  extend : qx.core.Object,
  implement : qx.ui.form.IFormElement,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param varargs {qx.core.Object} A variable number of items, which are
   *     intially added to the radio group.
   */
  construct : function(varargs)
  {
    this.base(arguments);

    // create item array
    this.__items = [];

    if (varargs != null) {
      this.add.apply(this, arguments);
    }

    // Add listener for selection to fire changeValue event
    this.addListener("changeSelected", this._onChangeSelected);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the radio group is enabled
     */
    enabled :
    {
      check : "Boolean",
      apply : "_applyEnabled",
      event : "changeEnabled"
    },


    /**
     * The currently selected item of the radio group
     */
    selected :
    {
      nullable : true,
      apply : "_applySelected",
      event : "changeSelected",
      check : "qx.ui.form.IRadioItem"
    },


    /**
     * The name of the radio group. Mainly used for seralization proposes.
     */
    name :
    {
      check : "String",
      nullable : true,
      apply : "_applyName",
      event : "changeName"
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
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the value was modified (after selection change) */
    "changeValue" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {IRadioItem[]} The items of the radio group */
    __items : null,

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
      return this.__items;
    },


    /**
     * Set the checked state of a given item
     *
     * @param item {IRadioItem} The item to select
     */
    select : function(item) {
      this.setSelected(item);
    },


    /**
     * Select the radio item, with the given value.
     *
     * @param value {String} Value of the radio item to select
     */
    setValue : function(value)
    {
      var items = this.__items;
      var item;

      for (var i=0, l=items.length; i<l; i++)
      {
        item = items[i];

        if (item.getValue() == value)
        {
          this.setSelected(item);
          break;
        }
      }
    },


    /**
     * Get the value of the selected radio item
     *
     * @return {String} The value of the selected radio item. Returns
     *     <code>null</code> if no item is selected.
     */
    getValue : function()
    {
      var selected = this.getSelected();
      return selected ? selected.getValue() : null;
    },






    /*
    ---------------------------------------------------------------------------
      REGISTRY
    ---------------------------------------------------------------------------
    */

    /**
     * Add the passed items to the radio group.
     *
     * @param varargs {IRadioItem} A variable number of items to add
     * @return {void}
     */
    add : function(varargs)
    {
      var items = this.__items;
      var item;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        item = arguments[i];

        if (item.getGroup() === this) {
          continue;
        }

        // Register listeners
        item.addListener("changeChecked", this._onItemChangeChecked, this);

        // Push RadioButton to array
        items.push(item);

        // Inform radio button about new group
        item.setGroup(this);

        // Need to update internal value?
        if (item.getChecked()) {
          this.setSelected(item);
        }
      }

      // Select first item when only one is registered
      if (items.length > 0 && !this.getSelected()) {
        this.setSelected(items[0]);
      }
    },


    /**
     * Remove an item from the radio group
     *
     * @param item {IRadioItem} The item to remove
     */
    remove : function(item)
    {
      if (item.getGroup() === this)
      {
        // Remove RadioButton from array
        qx.lang.Array.remove(this.__items, item);

        // Inform radio button about new group
        item.resetGroup();

        // Deregister listeners
        item.removeListener("changeChecked", this._onItemChangeChecked, this);

        // if the radio was checked, set internal selection to null
        if (item.getChecked()) {
          this.resetSelected();
        }
      }
    },



    /*
    ---------------------------------------------------------------------------
      LISTENER FOR ITEM CHANGES
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for <code>changeChecked</code> event of every managed item.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onItemChangeChecked : function(e)
    {
      var item = e.getTarget();
      if (item.getChecked()) {
        this.setSelected(item);
      } else if (this.getSelected() == item) {
        this.resetSelected();
      }
    },


    /**
     * Event listener for <code>changeSelected</code> event.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onChangeSelected : function(e)
    {
      var item = e.getData();
      var value = null;

      if (item)
      {
        value = item.getValue();
        if (value == null) {
          value = item.getLabel();
        }
      }

      this.fireDataEvent("changeValue", value);
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

      if (value) {
        value.setChecked(true);
      }

      // Fire value change event
      var oldValue = old ? old.getValue() : null;
      var newValue = value ? value.getValue() : null;

      if (oldValue != newValue) {
        this.fireNonBubblingEvent("changeValue", qx.event.type.Data, [newValue, oldValue]);
      }
    },


    // property apply
    _applyEnabled : function(value, old)
    {
      var items = this.__items;
      if (value == null)
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].resetEnabled();
        }
      }
      else
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].setEnabled(true);
        }
      }
    },


    // property apply
    _applyName : function(value, old)
    {
      var items = this.__items;
      if (value == null)
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].resetName();
        }
      }
      else
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].setName(value);
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
     */
    selectNext : function()
    {
      var item = this.getSelected();
      var items = this.__items;
      var index = items.indexOf(item);
      if (index == -1) {
        return;
      }

      var i = 0;
      var length = items.length;

      // Find next enabled item
      if (this.getWrap()) {
        index = (index + 1) % length;
      } else {
        index = Math.min(index + 1, length - 1);
      }

      while (i < length && !items[index].getEnabled())
      {
        index = (index + 1) % length;
        i++;
      }

      this.setSelected(items[index]);
    },


    /**
     * Select the item previous the given item
     */
    selectPrevious : function()
    {
      var item = this.getSelected();
      var items = this.__items;
      var index = items.indexOf(item);
      if (index == -1) {
        return;
      }

      var i = 0;
      var length = items.length;

      // Find previous enabled item
      if (this.getWrap()) {
        index = (index - 1 + length) % length;
      } else {
        index = Math.max(index - 1, 0);
      }

      while (i < length && !items[index].getEnabled())
      {
        index = (index - 1 + length) % length;
        i++;
      }

      this.setSelected(items[index]);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeArray("__items");
  }
});
