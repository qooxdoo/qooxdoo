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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * This mixin links all methods to manage the single selection.
 * 
 * The class which includes the mixin has to implement a method named 
 * <code>_getItems<code>, this method has to return a <code>Array</code>
 * with <code>qx.ui.core.Widget<code>.
 */
qx.Mixin.define("qx.ui.core.MSingleSelectionHandling",
{
  //TODO API doc
  
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
    __manager : null,


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns an array of currently selected items.
     *
     * @return {qx.ui.core.Widget[]} List of items.
     */
    getSelection : function() {
      var selected = this.__getManager().getSelected();
      
      if (selected) {
        return [selected];
      } else {
        return [];
      }
    },
    
    /**
     * Replaces current selection with the given items.
     *
     * @param items {qx.ui.core.Widget[]} Items to select
     */
    setSelection : function(items) {
      if (items.length !== 1) {
        throw new Error("Could only select one item, but the selection " +
          " array contains " + items.length + " items!");
      }
      
      this.__getManager().setSelected(items[0]);
    },
    
    /**
     * Clears the whole selection at once.
     */
    resetSelection : function() {
      this.__getManager().resetSelected();
    },
    
    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {qx.ui.core.Widget} Any valid selectable item
     * @return {Boolean} Whether the item is selected
     */
    isSelected : function(item) {
      return this.__getManager().isSelected(item);
    },
    
    /**
     * Whether the selection is empty.
     *
     * @return {Boolean} Whether the selection is empty
     */
    isSelectionEmpty : function() {
      return this.__getManager().isSelectionEmpty();
    },
    
    
    /**
     * Returns all elements which are selectable.
     * 
     * @return {qx.ui.core.Widget[]} The contained items.
     */
    getSelectables: function() {
      return this.__getManager().getSelectables();
    },
    
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    
    /**
     * Event listener for <code>changeSelected</code> event on single 
     * selection manager.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onChangeSelected : function(e) {
      var newValue = e.getData();
      var oldVlaue = e.getOldData();
      
      newValue == null ? newValue = [] : newValue = [newValue];
      oldVlaue == null ? oldVlaue = [] : oldVlaue = [oldVlaue];
      
      this.fireDataEvent("changeSelection", newValue, oldVlaue);
    },
    
    __getManager : function()
    {
      if (this.__manager == null)
      {
        var that = this;
        this.__manager = new qx.ui.core.SingleSelectionManager(
          {
            getItems : function() {
              return that._getItems();
          }
        }
        );
        this.__manager.setAllowEmptySelection(this._isAllowEmptySelection());
        this.__manager.addListener("changeSelected", this._onChangeSelected, this);
      }
      
      return this.__manager;
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
