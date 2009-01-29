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

qx.Class.define("qx.ui.virtual.form.List", 
{
  extend : qx.ui.virtual.core.Scroller,
  implement : [
    qx.ui.virtual.core.IWidgetCellProvider,
    qx.ui.form.IFormElement,
    qx.ui.core.ISingleSelection,
    qx.ui.core.IMultiSelection
  ],
  include : [qx.ui.core.MSelectionHandling],

  construct : function()
  {
    this.base(arguments, 0, 1, this.getItemHeight(), 0);
    
    this.pane.addLayer(new qx.ui.virtual.layer.WidgetCell(this))
    
    this.pane.addListener("resize", this._onResize, this);
    this.__items = [];
    this.__pool = [];
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
    changeValue : "qx.event.type.Data"
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
    }
  },


  members :
  {
    
    update : function() {
      this.pane.fullUpdate();
    },

    /*
    ---------------------------------------------------------------------------
      SELECTION API
    ---------------------------------------------------------------------------
    */

    /** {Class} Pointer to the selection manager to use */
    SELECTION_MANAGER : qx.ui.core.selection.Abstract,
    
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */    
    
    _onResize : function(e)
    {
      this.pane.columnConfig.setItemSize(0, e.getData().width);
      this.pane.fullUpdate();
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
      this.fireDataEvent("addItem", child);
      this.update();
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
      this.fireDataEvent("removeItem", child);
      this.update();
      return this;
    },


    /**
     * Remove all children.
     *
     * @return {void}
     */
    removeAll : function()
    {
      for (var i=0,j=this.__items.lenth; i<j; i++) {
        this.fireDataEvent("removeItem", this.__items[i]);
      }
      this.__items = [];
      this.update();
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
      this.fireDataEvent("addItem", child);
      this.update();
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
      this.fireDataEvent("addItem", child);
      this.update();
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
      this.fireDataEvent("addItem", child);
      this.update();
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
      this.fireDataEvent("removeItem", child);
      this.update();
    }    
    
  }
});
