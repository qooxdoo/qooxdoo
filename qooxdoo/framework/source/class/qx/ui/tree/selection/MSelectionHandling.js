/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * EXPERIMENTAL!
 *
 * Implements the single selection mode.
 *
 * @internal
 */
qx.Mixin.define("qx.ui.tree.selection.MSelectionHandling",
{
  properties :
  {
    /** Current selected items */
    selection :
    {
      check : "qx.data.Array",
      event : "changeSelection",
      apply : "_applySelection",
      nullable : false,
      deferredInit : true
    },
    
    
    /**
     * The selection mode to use.
     *
     * For further details please have a look at:
     * {@link qx.ui.core.selection.Abstract#mode}
     */
    selectionMode :
    {
      check : ["single", "one"],
      init : "single",
      apply : "_applySelectionMode"
    }
  },


  members :
  {
    /** {qx.ui.virtual.selection.Row} selection manager */
    _manager : null,


    /** {Boolean} flag to ignore the selection change from {@link #selection} */
    __ignoreChangeSelection : false,


    /** {Boolean} flag to ignore the selection change from _manager */
    __ignoreManagerChangeSelection : false,
    
    
    /** {Array} internal parent chain form the last selected node */
    __parentChain : null,


    /**
     * Initialize the selection handling mixin.
     */
    _initSelection : function()
    {
      this._initSelectionManager();
      this.initSelection(new qx.data.Array());
    },


    /**
     * Initialize the selection manager with his delegate.
     */
    _initSelectionManager : function()
    {
      var self = this;
      var selectionDelegate =
      {
        isItemSelectable : function(row) {
          return self._provider.isSelectable(row);
        },

        styleSelectable : function(row, type, wasAdded)
        {
          if (type != "selected") {
            return;
          }

          if (wasAdded) {
            self._provider.styleSelectabled(row);
          } else {
            self._provider.styleUnselectabled(row);
          }
        }
      }

      this._manager = new qx.ui.virtual.selection.Row(
        this.getPane(), selectionDelegate
      );
      this._manager.attachMouseEvents(this.getPane());
      this._manager.attachKeyEvents(this);
      this._manager.addListener("changeSelection", this._onManagerChangeSelection, this);
      this._manager._applyDefaultSelection();
    },

    
    /**
     * Remove items form the selection which are not in the
     * lookup table.
     */
    _updateSelection : function()
    {
      if (this._manager == null) {
        return;
      }

      var selection = this.getSelection();
      var lookupTable = this.getLookupTable();
      
      this.__ignoreManagerChangeSelection = true;
      if (selection.getLength() > 0)
      {
        var item = selection.getItem(0);
        if (!lookupTable.contains(item)) {
          selection.remove(item);
        }
      }
      this.__ignoreManagerChangeSelection = false;
      this._onChangeSelection();
    },
    

    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // apply method
    _applySelection : function(value, old)
    {
      value.addListener("change", this._onChangeSelection, this);

      if (old != null) {
        old.removeListener("change", this._onChangeSelection, this);
      }

      this._onChangeSelection();
    },


    // apply method
    _applySelectionMode : function(value, old) {
      this._manager.setMode(value);
    },


    /*
    ---------------------------------------------------------------------------
      SELECTION HANDLERS
    ---------------------------------------------------------------------------
    */


    /**
     * Event handler for the internal selection change {@link #selection}.
     *
     * @param e {qx.event.type.Data} the change event.
     */
    _onChangeSelection : function(e)
    {
      if (this.__ignoreManagerChangeSelection == true) {
        return;
      }

      this.__ignoreChangeSelection = true;
      var selection = this.getSelection();

      var newSelection = [];
      for (var i = 0; i < selection.getLength(); i++)
      {
        var item = selection.getItem(i);
        var row = this.getLookupTable().indexOf(item);

        if (qx.core.Environment.get("qx.debug"))
        {
          if (row < 0)
          {
            this.warn("Couldn't select item '" + item +
            "': Not visible or not an item of the model!");
          }
        }

        if (row >= 0) {
          newSelection.push(row);
        }
      }

      // set the first visible parent as selected
      if (selection.getLength() === 0 &&
          this.getSelectionMode() === "one")
      {
        var visibleParent = this.__getVisibleParent();
        var row = this.getLookupTable().indexOf(visibleParent);
        
        if (row >= 0) {
          newSelection.push(row);
        }
      } 
      
      try {
        this._manager.replaceSelection(newSelection);
      }
      catch(e)
      {
        this._manager.selectItem(newSelection[newSelection.length - 1]);
      }
      this.__synchronizeSelection();
      
      // build parent chain
      if (selection.getLength() > 0 &&
          this.getSelectionMode() === "one"
      ) {
        this.__buildParentChain(selection.getItem(0));
      } else {
        this.__parentChain = [];
      }

      this.__ignoreChangeSelection = false;
    },


    /**
     * Event handler for the selection change from the _manager.
     *
     * @param e {qx.event.type.Data} the change event.
     */
    _onManagerChangeSelection : function(e)
    {
      if (this.__ignoreChangeSelection == true) {
        return;
      }

      var selection = this.getSelection();
      var currentSelection = e.getData();

      this.__ignoreManagerChangeSelection = true;

      // replace selection and fire event
      this.__synchronizeSelection();
      if (selection.getLength() > 0)
      {
        var lastIndex = selection.getLength() - 1;
        selection.splice(lastIndex, 1, this.getLookupTable().getItem(currentSelection[lastIndex]));
      } else {
        selection.removeAll();
      }

      this.__ignoreManagerChangeSelection = false;
    },


    /**
     * Synchronized the selection form the manager with the local one.
     */
    __synchronizeSelection : function()
    {
      var localSelection = this.getSelection();
      var nativArray = localSelection.toArray();
      var managerSelection = this._manager.getSelection();

      qx.lang.Array.removeAll(nativArray);
      for(var i = 0; i < managerSelection.length; i++) {
        nativArray.push(this.getLookupTable().getItem(managerSelection[i]));
      }
      localSelection.length = nativArray.length;
    },

    
    /**
     * Builds the parent chain form the passed item.
     * 
     * @param item {var} Item to build parent chain.
     */
    __buildParentChain : function(item)
    {
      this.__parentChain = [];
      var parent = this.getParent(item); 
      while(parent != null)
      {
        this.__parentChain.unshift(parent);
        parent = this.getParent(parent); 
      }
    },
    
    
    /**
     * Return the first visible parent node from the last selected node.
     * 
     * @return {var} The first visible node.
     */
    __getVisibleParent : function()
    {
      if (this.__parentChain == null) {
        return this.getModel();
      }
      
      var lookupTable = this.getLookupTable();
      var parent = this.__parentChain.pop();

      while(parent != null)
      {
        if (lookupTable.contains(parent)) {
          return parent;
        }
        parent = this.__parentChain.pop();
      }
      return this.getModel();
    },
    

    /**
     * Helper Method to select default item.
     */
    _applyDefaultSelection : function()
    {
      if (this._manager != null) {
        this._manager._applyDefaultSelection();
      }
    }
  },


  destruct : function()
  {
    this._manager.dispose();
    this._manager = null;
  }
});
