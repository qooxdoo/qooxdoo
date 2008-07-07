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
  implement : qx.ui.core.IFormElement,
  


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
    this.base(arguments);

    // create item array
    this.__items = [];

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
      event : "changeEnabled"
    },
    
    
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
     * The name of the radio manager. Mainly used for seralization proposes.
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
    "changeValue" : "qx.event.type.Data"    
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
      return this.__items;
    },


    /**
     * Set the checked state of a given item
     *
     * @param item {IRadioItem} The item to set the checked state of
     * @param vChecked {Boolean} Whether the item should be checked
     */
    select : function(item) {
      this.setSelected(item);
    },


    /**
     * Select the radio item, with the given value.
     *
     * @param value {var} Value of the radio item to select
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
     * @return {var|null} The value of the selected radio item. Returns
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
     * Add the passed items to the radio manager.
     *
     * @type member
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
        
        if (item.getManager() === this) {
          continue;
        }

        // Register listeners 
        item.addListener("changeName", this._onChangeName, this);       
        item.addListener("changeChecked", this._onChangeChecked, this);

        // Push RadioButton to array
        items.push(item);

        // Inform radio button about new manager
        item.setManager(this);

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
     * Remove an item from the radio manager
     *
     * @param item {IRadioItem} The item to remove
     */
    remove : function(item)
    {
      if (item.getManager() === this) 
      {
        // Remove RadioButton from array
        qx.lang.Array.remove(this.__items, item);
  
        // Inform radio button about new manager
        item.resetManager();
        
        // Deregister listeners        
        item.removeListener("changeName", this._onChangeName, this);
        item.removeListener("changeChecked", this._onChangeChecked, this);
  
        // if the radio was checked, set internal selection to null
        if (item.getChecked()) 
        {
          this.resetSelected();
          this.resetValue();
        }
      }
    },



    /*
    ---------------------------------------------------------------------------
      LISTENER FOR ITEM CHANGES
    ---------------------------------------------------------------------------
    */
    
    _onChangeName : function(e)
    {
      var name = e.getData();
      name == null ? this.resetName() : this.setName(name);
    },    
    
    _onChangeValue : function(e)
    {
      var target = e.getTarget();
      if (target == this.getChecked()) {
        this.setValue(target.getValue());
      }
    },
    
    _onChangeChecked : function(e)
    {
      var item = e.getTarget();
      if (item.getChecked()) {
        this.setSelected(item); 
      } else if (this.getSelected() == item) {
        this.resetSelected();
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
     *
     * @param item {IRadioItem} The item to select the next item of
     */
    selectNext : function(item)
    {
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
     *
     * @param item {IRadioItem} The item to select the previous item of
     */
    selectPrevious : function(item)
    {
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
