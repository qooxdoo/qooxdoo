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

    var manager = this._getManager();
    this.removeListener("keypress", manager.handleKeyPress, manager);
  },

  properties :
  {
    /**
     * Data array of model items displayed in the list
     */
    selectedItems :
    {
      event : "changeSelectedItems"
    },

    /** The name of the model property holding the value to be displayed */
    modelValueProperty :
    {
      init : null,
      nullable : true
    }
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
      if (!this.getModelValueProperty()) {
        return;
      }
      var items = this.getSelectedItems();
      for (var i=0, l=items.length; i<l; i++) {
        var modelItem = items.getItem(i);
        if (!this.isItemListed(modelItem)) {
          var listItem = new fce.view.ListItem(modelItem, this.getModelValueProperty(), "name");
          this.add(listItem);
          this.__listedItems.push(modelItem);
        }
      }
    },


    /**
     * Checks whether the given item or another item with the same name are
     * currently listed
     *
     * @param item {qx.core.Object} model item to check for
     * @return {Boolean} Whether the item or an equivalent item is listed
     */
    isItemListed : function(item)
    {
      if (qx.lang.Array.contains(this.__listedItems, item)) {
        return true;
      }

      var itemName = item.getName();
      for (var i=0, l=this.__listedItems.length; i<l; i++) {
        if (this.__listedItems[i].getName() === itemName) {
          return true;
        }
      }
      return false;
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
     * Removes all entries from the list
     */
    removeAll : function()
    {
      var listItems = this.getChildren().concat();
      for (var i=0,l=listItems.length; i<l; i++) {
        var modelItem = listItems[i].getModelItem();
        this.getSelectedItems().remove(modelItem);
        listItems[i].destroy();
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