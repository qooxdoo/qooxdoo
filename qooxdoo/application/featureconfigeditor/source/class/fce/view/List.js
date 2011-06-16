/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Container for {@link fce.view.ListItem} widgets. Model items can be added
 * using drag & drop.
 */
qx.Class.define("fce.view.List", {

  extend : qx.ui.form.List,
  
  construct : function(horizontal)
  {
    this.base(arguments, horizontal);
    
    this.set({
      enableInlineFind: true,
      selectionMode: "multi"
    });
    
    this._setUpDragDrop();
    
    this.addListener("keypress", function(ev) {
      if (ev.getKeyIdentifier() === "Delete") {
        this.removeSelected();
      }
    }, this);
    
    var selection = new qx.data.Array();
    selection.addListener("change", this.__onSelectionChange, this);
    this.setSelectedItems(selection);
    this.__listedItems = [];
  },
  
  properties :
  {
    /**
     * Data array of model items displayed in the list 
     */
    selectedItems : 
    {
      event : "changeSelectedItems"
    }
    
    /*
    modelValueProperty :
    {
      init : "detected"
    }
    */
  },
  
  members :
  {
    __listedItems : null,
    
    /**
     * Drag & drop support: Add dropped model items to the list
     */
    _setUpDragDrop : function()
    {
      this.setDroppable(true);
      
      this.addListener("drop", function(ev) {
        var items = ev.getData("items");
        this.addItemsUnique(items);
      }, this);
      
      this.addListener("dragover", function(ev) {
        if (!ev.supportsType("items")) {
          ev.preventDefault();
        }
      });
    },
    
    
    /**
     * Synchronizes the selected model items with the list
     */
    __onSelectionChange : function()
    {
      var items = this.getSelectedItems();
      for (var i=0, l=items.length; i<l; i++) {
        var modelItem = items.getItem(i);
        if (!qx.lang.Array.contains(this.__listedItems, modelItem)) {
          var listItem = new fce.view.ListItem(modelItem, "detected", "name");
          this.add(listItem);
          this.__listedItems.push(modelItem);
        }
      }
    },
    
    
    /**
     * Removes the model item corresponding with the selected list item
     */
    removeSelected : function()
    {
      var listSelection = this.getSelection();
      for (var i=0, l=listSelection.length; i<l; i++) {
        var modelItem = listSelection[i].getModelItem();
        this.getSelectedItems().remove(modelItem);
        listSelection[i].destroy();
        qx.lang.Array.remove(this.__listedItems, modelItem);
      }
    },
    
    
    /**
     * Adds the given model items to the list if they're not already in it
     * 
     * @param items {qx.data.Array}  data array of model items
     */
    addItemsUnique : function(items)
    {
      for (var i=0, l=items.length; i<l; i++) {
        var selectedItems = this.getSelectedItems();
        if (!selectedItems.contains(items.getItem(i))) {
          selectedItems.push(items.getItem(i));
        }
      }
    }
  },
  
  destruct : function()
  {
    this.getSelectedItems().removeListener("change", this.__onSelectionChange, this);
    this.__listedItems = null;
    //this._disposeObjects("__list");
  }
});