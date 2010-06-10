/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.list.List",
{
  extend : qx.ui.virtual.core.Scroller,

  implement : [
    qx.ui.virtual.core.IWidgetCellProvider
  ],


  construct : function()
  {
    this.base(arguments, 0, 1, this.getItemHeight(), 10);

    this.__widgetLayer = new qx.ui.virtual.layer.WidgetCell(this);
    this.getPane().addLayer(this.__widgetLayer)
    this.getPane().addListener("resize", this._onResize, this);

    this.__items = [];
    this.__pool = [];

    this.__selectionManager = new qx.ui.virtual.selection.Row(this.getPane());
    this.__selectionManager.addListener("changeSelection", this._onChangeSelection, this);
    this.__selectionManager.attachMouseEvents();
    this.__selectionManager.attachKeyEvents(this);
    this.__selectionManager.attachListEvents(this);

    // Creates the prefetch behavior
    new qx.ui.virtual.behavior.Prefetch(
      this,
      {
        minLeft : 0,
        maxLeft : 0,
        minRight : 0,
        maxRight : 0,
        minAbove : 400,
        maxAbove : 600,
        minBelow : 400,
        maxBelow : 600
      }
    ).set({
      interval: 500
    });
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * This event is fired after a list item was added to the list. The
     * {@link qx.event.type.Data#getData} method of the event returns the
     * added item.
     */
    addItem : "qx.event.type.Data",


    /**
     * This event is fired after a list item has been removed from the list.
     * The {@link qx.event.type.Data#getData} method of the event returns the
     * removed item.
     */
    removeItem : "qx.event.type.Data",


    /**
     * Fired on every modification of the selection which also means that the
     * value has been modified.
     */
    changeValue : "qx.event.type.Data",


    /** Fires after the selection was modified */
    changeSelection : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "list"
    },


    // overridden
    focusable :
    {
      refine : true,
      init : true
    },


    /** Spacing between the items */
    spacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applySpacing",
      themeable : true
    },


    /** Controls whether the inline-find feature is activated or not */
    enableInlineFind :
    {
      check : "Boolean",
      init : true
    },


    /** The name of the list. Mainly used for serialization proposes. */
    name :
    {
      check : "String",
      nullable : true,
      event : "changeName"
    },


    itemHeight :
    {
      init : 24,
      themeable : true,
      check : "Number",
      apply : "_applyItemHeight"
    },


    /**
     * The selection mode to use.
     *
     * For further details please have a look at:
     * {@link qx.ui.core.selection.Abstract#mode}
     */
    selectionMode :
    {
      check : [ "single", "multi", "additive", "one" ],
      init : "single",
      apply : "_applySelectionMode"
    },


    /**
     * Enable drag selection (multi selection of items through
     * dragging the mouse in pressed states).
     *
     * Only possible for the selection modes <code>multi</code> and <code>additive</code>
     */
    dragSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDragSelection"
    },


    /**
     * Enable quick selection mode, where no click is needed to change the selection.
     *
     * Only possible for the modes <code>single</code> and <code>one</code>.
     */
    quickSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyQuickSelection"
    }
  },


  members :
  {
    __items : null,
    __pool : null,
    __selectionManager : null,
    __widgetLayer : null,

    syncWidget : function() {
      this.update();
    },


    update : function()
    {
      var rowConfig = this.getPane().getRowConfig();
      rowConfig.setItemCount(this.__items.length);

      rowConfig.resetItemSizes();
      for(var i=0; i<this.__items.length; i++)
      {
        var height = this.__items[i].getHeight();
        if (height !== null) {
          rowConfig.setItemSize(i, height);
        }
      }
    },


    updateSelection : function()
    {
      var widgets = this.__widgetLayer.getChildren();
      for (var i=0; i<widgets.length; i++)
      {
        var widget = widgets[i];
        var row = widget.getUserData("row");

        if (this.__selectionManager.isItemSelected(row)) {
          widget.addState("selected");
        } else {
          widget.removeState("selected");
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    _onResize : function(e)
    {
      this.getPane().getColumnConfig().setItemSize(0, e.getData().width);
      qx.ui.core.queue.Widget.add(this);
    },

    _onChangeItemHeight : function(e) {
      qx.ui.core.queue.Widget.add(this);
    },

    _onChangeSelection : function(e)
    {
      this.updateSelection();
      this.fireDataEvent("changeSelection", this.__rowsToItems(e.getData()));
    },


    /*
    ---------------------------------------------------------------------------
      CELL PROVIDER API
    ---------------------------------------------------------------------------
    */

    // interface implementation
    getCellWidget : function(row, column)
    {
      var data = this.__items[row];
      if (!data) {
        return null;
      }

      var widget = this.__pool.pop() || new qx.ui.form.ListItem();
      widget.set({
        label : data.getLabel(),
        icon : data.getIcon()
      });

      if (this.__selectionManager.isItemSelected(row)) {
        widget.addState("selected");
      } else {
        widget.removeState("selected");
      }
      widget.setUserData("row", row);

      return widget;
    },

    // interface implementation
    poolCellWidget : function(widget) {
      this.__pool.push(widget);
    },

    /*
    ---------------------------------------------------------------------------
      FORM ELEMENT API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the stringified value of the list. This is a comma
     * separated string with all the values (or labels as fallback).
     *
     * @return {String} Value of the list
     */
    getValue : function()
    {
      var selected = this.getSelection();
      var result = [];
      var value;

      for (var i=0, l=selected.length; i<l; i++)
      {
        // Try value first
        value = selected[i].getValue();

        // Fallback to label
        if (value == null) {
          value = selected[i].getLabel();
        }

        result.push(value);
      }

      return result.join(",");
    },


    /**
     * Applied new selection from a comma separated list of values (labels
     * as fallback) of the list items.
     *
     * @param value {String} Comma separated list
     */
    setValue : function(value)
    {
      // Clear current selection
      var splitted = value.split(",");

      // Building result list
      var result = [];
      var item;
      for (var i=0, l=splitted.length; i<l; i++)
      {
        item = this.findItem(splitted[i]);
        if (item) {
          result.push(item);
        }
      }

      // Replace current selection
      this.setSelection(result);
    },


    /*
    ---------------------------------------------------------------------------
      CHILDREN HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the children list
     *
     * @return {LayoutItem[]} The children array (Arrays are
     *   reference types, please to not modify them in-place)
     */
    getChildren : function() {
      return this.__items;
    },


    /**
     * Whether the widget contains children.
     *
     * @return {Boolean} Returns <code>true</code> when the widget has children.
     */
    hasChildren : function() {
      return this.__items.length > 0;
    },


    _addHelper : function(child)
    {
      this.fireDataEvent("addItem", child);
      child.addListener("changeHeight", this._onChangeItemHeight, this);
      qx.ui.core.queue.Widget.add(this);
    },


    _removeHelper : function(child)
    {
      this.fireDataEvent("removeItem", child);
      child.removeListener("changeHeight", this._onChangeItemHeight, this);
      qx.ui.core.queue.Widget.add(this);
    },


    /**
     * Adds a new child widget.
     *
     * The supported keys of the layout options map depend on the layout manager
     * used to position the widget. The options are documented in the class
     * documentation of each layout manager {@link qx.ui.layout}.
     *
     * @param child {LayoutItem} the item to add.
     * @return {Widget} This object (for chaining support)
     */
    add : function(child)
    {
      this.__items.push(child);
      this._addHelper(child);
      return this;
    },


    /**
     * Remove the given child item.
     *
     * @param child {LayoutItem} the item to remove
     * @return {Widget} This object (for chaining support)
     */
    remove : function(child)
    {
      qx.lang.Array.remove(this.__items, child);
      this._removeHelper(child);
      return this;
    },


    /**
     * Remove all children.
     *
     * @return {void}
     */
    removeAll : function()
    {
      for (var i=0,j=this.__items.length; i<j; i++) {
        this._removeHelper(this.__items[i]);
      }
      this.__items = [];
    },


    /**
     * Returns the index position of the given item if it is
     * a child item. Otherwise it returns <code>-1</code>.
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {LayoutItem} the item to query for
     * @return {Integer} The index position or <code>-1</code> when
     *   the given item is no child of this layout.
     */
    indexOf : function(child) {
      return this.__items.indexOf(child);
    },


    /**
     * Add a child at the specified index
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {LayoutItem} item to add
     * @param index {Integer} Index, at which the item will be inserted
     */
    addAt : function(child, index)
    {
      qx.lang.Array.insertAt(this.__items, child, index);
      this._addHelper(child);
    },


    /**
     * Add a item before another already inserted item
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {LayoutItem} item to add
     * @param before {LayoutItem} item before the new item will be inserted.
     */
    addBefore : function(child, before)
    {
      qx.lang.Array.insertBefore(this.__items, child, before);
      this._addHelper(child);
    },


    /**
     * Add a item after another already inserted item
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {LayoutItem} item to add
     * @param after {LayoutItem} item, after which the new item will be inserted
     */
    addAfter : function(child, after)
    {
      qx.lang.Array.insertAfter(this.__items, child, after);
      this._addHelper(child);
    },


    /**
     * Remove the item at the specified index.
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param index {Integer} Index of the item to remove.
     */
    removeAt : function(index)
    {
      this.__items.splice(index, 1);
      this._removeHelper(this.__items[index]);
    },


    /*
    ---------------------------------------------------------------------------
      SELECTION HANDLING
    ---------------------------------------------------------------------------
    */

    __itemToRow : function(item)
    {
      var row = this.__items.indexOf(item);
      if (row < 0) {
        return null;
      } else {
        return row;
      }
    },


    __rowToItem : function(row)
    {
      var item = this.__items[row];
      return item;
    },


    __itemsToRows : function(items)
    {
      var rows = [];
      for (var i=0; i<items.length; i++) {
        rows.push(this.__itemToRow(items[i]));
      }
      return rows;
    },


    __rowsToItems : function(rows)
    {
      var items = [];
      for (var i=0; i<rows.length; i++) {
        items.push(this.__items[rows[i]]);
      }
      return items;
    },


    /**
     * Selects all items of the managed object.
     */
    selectAll : function() {
      this.__selectionManager.selectAll();
    },


    /**
     * Selects the given item. Replaces current selection
     * completely with the new item.
     *
     * @param item {Object} Any valid item
     * @return {void}
     */
    setSelected : function(item) {
      this.__selectionManager.selectItem(this.__itemToRow(item));
    },


    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {Object} Any valid selectable item
     * @return {Boolean} Whether the item is selected
     */
    isSelected : function(item) {
      return this.__selectionManager.isItemSelected(this.__itemToRow(item));
    },


    /**
     * Adds the given item to the existing selection.
     *
     * Use {@link #selectItem} instead if you want to replace
     * the current selection.
     *
     * @param item {Object} Any valid item
     * @return {void}
     */
    addToSelection : function(item) {
      this.__selectionManager.addItem(this.__itemToRow(item));
    },


    /**
     * Removes the given item from the selection.
     *
     * Use {@link #clearSelection} when you want to clear
     * the whole selection at once.
     *
     * @param item {Object} Any valid item
     * @return {void}
     */
    removeFromSelection : function(item) {
      this.__selectionManager.removeItem(this.__itemToRow(item));
    },


    /**
     * Selects an item range between two given items.
     *
     * @param begin {Object} Item to start with
     * @param end {Object} Item to end at
     * @return {void}
     */
    selectRange : function(begin, end) {
      this.__selectionManager.selectItemRange(
        this.__itemToRow(begin),
        this.__itemToRow(end)
      );
    },


    /**
     * Clears the whole selection at once.
     *
     * @return {void}
     */
    resetSelection : function() {
      this.__selectionManager.clearSelection();
    },


    /**
     * Replaces current selection with the given items.
     *
     * @param items {Object} Items to select
     * @return {void}
     */
    setSelection : function(items) {
      this.__selectionManager.replaceSelection(this.__itemsToRows(items));
    },


    /**
     * Get the selected item. This method does only work in <code>single</code>
     * selection mode.
     *
     * @deprecated Use 'getSelected' instead!
     * @return {Object} The selected item.
     */
    getSelectedItem : function() {
      return this.__items[this.getSelected()];
    },


    /**
     * Get the selected item.
     *
     * @return {Object} The selected item.
     */
    getSelected : function() {
      return this.__items[this.__selectionManager.getSelectedItem()];
    },


    /**
     * Returns an array of currently selected items.
     *
     * @return {Object[]} List of items.
     */
    getSelection : function() {
      return this.__rowsToItems(this.__selectionManager.getSelection());
    },


    /**
     * Returns an array of currently selected items sorted
     * by their index in the container.
     *
     * @return {Object[]} Sorted list of items
     */
    getSortedSelection : function() {
      return this.__rowsToItems(this.__selectionManager.getSortedSelection());
    },


    /**
     * Whether the selection is empty
     *
     * @return {Boolean} Whether the selection is empty
     */
    isSelectionEmpty : function() {
      return this.__selectionManager.isSelectionEmpty();
    },


    /**
     * Returns the last selection context. One of <code>click</code>,
     * <code>quick</code>, <code>drag</code> or <code>key</code> or
     * <code>null</code>.
     */
    getSelectionContext : function() {
      return this.__selectionManager.getSelectionContext();
    },


    /**
     * Returns all elements which are selectable.
     *
     * @return {LayoutItem[]} The contained items.
     */
    getSelectables: function() {
      return this.__rowsToItems(this.__selectionManager.getSelectables());
    },


    // property apply
    _applySelectionMode : function(value, old) {
      this.__selectionManager.setMode(value);
    },


    // property apply
    _applyDragSelection : function(value, old) {
      this.__selectionManager.setDrag(value);
    },


    // property apply
    _applyQuickSelection : function(value, old) {
      this.__selectionManager.setQuick(value);
    }
  }
});
