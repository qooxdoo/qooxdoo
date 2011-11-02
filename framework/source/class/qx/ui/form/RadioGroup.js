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
     * Christian Hagendorn (chris_schmidt)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The radio group handles a collection of items from which only one item
 * can be selected. Selection another item will deselect the previously selected
 * item.
 *
 * This class is e.g. used to create radio groups or {@link qx.ui.form.RadioButton}
 * or {@link qx.ui.toolbar.RadioButton} instances.
 *
 * We also offer a widget for the same purpose which uses this class. So if
 * you like to act with a widget instead of a pure logic coupling of the
 * widgets, take a look at the {@link qx.ui.form.RadioButtonGroup} widget.
 */
qx.Class.define("qx.ui.form.RadioGroup",
{
  extend : qx.core.Object,
  implement : [
    qx.ui.core.ISingleSelection,
    qx.ui.form.IForm,
    qx.ui.form.IModelSelection
  ],
  include : [
    qx.ui.core.MSingleSelectionHandling,
    qx.ui.form.MModelSelection
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * @param varargs {qx.core.Object} A variable number of items, which are
   *     initially added to the radio group, the first item will be selected.
   */
  construct : function(varargs)
  {
    this.base(arguments);

    // create item array
    this.__items = [];

    // add listener before call add!!!
    this.addListener("changeSelection", this.__onChangeSelection, this);

    if (varargs != null) {
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
     * Whether the radio group is enabled
     */
    enabled :
    {
      check : "Boolean",
      apply : "_applyEnabled",
      event : "changeEnabled",
      init: true
    },

    /**
     * Whether the selection should wrap around. This means that the successor of
     * the last item is the first item.
     */
    wrap :
    {
      check : "Boolean",
      init: true
    },

    /**
     * If is set to <code>true</code> the selection could be empty,
     * otherwise is always one <code>RadioButton</code> selected.
     */
    allowEmptySelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyAllowEmptySelection"
    },

    /**
     * Flag signaling if the group at all is valid. All children will have the
     * same state.
     */
    valid : {
      check : "Boolean",
      init : true,
      apply : "_applyValid",
      event : "changeValid"
    },

    /**
     * Flag signaling if the group is required.
     */
    required : {
      check : "Boolean",
      init : false,
      event : "changeRequired"
    },

    /**
     * Message which is shown in an invalid tooltip.
     */
    invalidMessage : {
      check : "String",
      init: "",
      event : "changeInvalidMessage",
      apply : "_applyInvalidMessage"
    },


    /**
     * Message which is shown in an invalid tooltip if the {@link #required} is
     * set to true.
     */
    requiredInvalidMessage : {
      check : "String",
      nullable : true,
      event : "changeInvalidMessage"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /** {qx.ui.form.IRadioItem[]} The items of the radio group */
    __items : null,


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */


    /**
     * Get all managed items
     *
     * @return {qx.ui.form.IRadioItem[]} All managed items.
     */
    getItems : function() {
      return this.__items;
    },


    /*
    ---------------------------------------------------------------------------
      REGISTRY
    ---------------------------------------------------------------------------
    */


    /**
     * Add the passed items to the radio group.
     *
     * @param varargs {qx.ui.form.IRadioItem} A variable number of items to add.
     */
    add : function(varargs)
    {
      var items = this.__items;
      var item;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        item = arguments[i];

        if (qx.lang.Array.contains(items, item)) {
          continue;
        }

        // Register listeners
        item.addListener("changeValue", this._onItemChangeChecked, this);

        // Push RadioButton to array
        items.push(item);

        // Inform radio button about new group
        item.setGroup(this);

        // Need to update internal value?
        if (item.getValue()) {
          this.setSelection([item]);
        }
      }

      // Select first item when only one is registered
      if (!this.isAllowEmptySelection() && items.length > 0 && !this.getSelection()[0]) {
        this.setSelection([items[0]]);
      }
    },

    /**
     * Remove an item from the radio group.
     *
     * @param item {qx.ui.form.IRadioItem} The item to remove.
     */
    remove : function(item)
    {
      var items = this.__items;
      if (qx.lang.Array.contains(items, item))
      {
        // Remove RadioButton from array
        qx.lang.Array.remove(items, item);

        // Inform radio button about new group
        if (item.getGroup() === this) {
          item.resetGroup();
        }

        // Deregister listeners
        item.removeListener("changeValue", this._onItemChangeChecked, this);

        // if the radio was checked, set internal selection to null
        if (item.getValue()) {
          this.resetSelection();
        }
      }
    },


    /**
     * Returns an array containing the group's items.
     *
     * @return {qx.ui.form.IRadioItem[]} The item array
     */
    getChildren : function()
    {
      return this.__items;
    },


    /*
    ---------------------------------------------------------------------------
      LISTENER FOR ITEM CHANGES
    ---------------------------------------------------------------------------
    */


    /**
     * Event listener for <code>changeValue</code> event of every managed item.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onItemChangeChecked : function(e)
    {
      var item = e.getTarget();
      if (item.getValue()) {
        this.setSelection([item]);
      } else if (this.getSelection()[0] == item) {
        this.resetSelection();
      }
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */
    // property apply
    _applyInvalidMessage : function(value, old) {
      for (var i = 0; i < this.__items.length; i++) {
        this.__items[i].setInvalidMessage(value);
      }
    },

    // property apply
    _applyValid: function(value, old) {
      for (var i = 0; i < this.__items.length; i++) {
        this.__items[i].setValid(value);
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
          items[i].setEnabled(value);
        }
      }
    },

    // property apply
    _applyAllowEmptySelection : function(value, old)
    {
      if (!value && this.isSelectionEmpty()) {
        this.resetSelection();
      }
    },


    /*
    ---------------------------------------------------------------------------
      SELECTION
    ---------------------------------------------------------------------------
    */


    /**
     * Select the item following the given item.
     */
    selectNext : function()
    {
      var item = this.getSelection()[0];
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

      this.setSelection([items[index]]);
    },


    /**
     * Select the item previous the given item.
     */
    selectPrevious : function()
    {
      var item = this.getSelection()[0];
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

      this.setSelection([items[index]]);
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS FOR SELECTION API
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the items for the selection.
     *
     * @return {qx.ui.form.IRadioItem[]} Items to select.
     */
    _getItems : function() {
      return this.getItems();
    },

    /**
     * Returns if the selection could be empty or not.
     *
     * @return {Boolean} <code>true</code> If selection could be empty,
     *    <code>false</code> otherwise.
     */
    _isAllowEmptySelection: function() {
      return this.isAllowEmptySelection();
    },


    /**
     * Returns whether the item is selectable. In opposite to the default
     * implementation (which checks for visible items) every radio button
     * which is part of the group is selected even if it is currently not visible.
     *
     * @param item {qx.ui.form.IRadioItem} The item to check if its selectable.
     * @return {Boolean} <code>true</code> if the item is part of the radio group
     *    <code>false</code> otherwise.
     */
    _isItemSelectable : function(item) {
      return this.__items.indexOf(item) != -1;
    },


    /**
     * Event handler for <code>changeSelection</code>.
     *
     * @param e {qx.event.type.Data} Data event.
     */
    __onChangeSelection : function(e)
    {
      var value = e.getData()[0];
      var old = e.getOldData()[0];

      if (old) {
        old.setValue(false);
      }

      if (value) {
        value.setValue(true);
      }
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
