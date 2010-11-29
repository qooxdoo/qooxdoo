/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Virtual list widget for virtual widget rendering.
 *
 * @childControl row-layer {qx.ui.virtual.Row} layer for all rows
 */
qx.Class.define("qx.ui.list.List",
{
  extend : qx.ui.virtual.core.Scroller,
  include : [qx.ui.list.core.MSelectionHandling],


  /**
   * Creates the <code>List</code> with the passed model.
   *
   * @param model {qx.data.Array|null} model for the list.
   */
  construct : function(model)
  {
    this.base(arguments, 0, 1, 20, 100);

    this._init();

    if(model != null) {
      this.initModel(model);
    } else {
      this.initModel(new qx.data.Array());
    }

    this.initItemHeight();
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "virtual-list"
    },


    // overridden
    focusable :
    {
      refine : true,
      init : true
    },


    // overridden
    width :
    {
      refine : true,
      init : 100
    },


    // overridden
    height :
    {
      refine : true,
      init : 200
    },


    /** Data array containing the data which should be shown in the list. */
    model :
    {
      check : "qx.data.Array",
      apply : "_applyModel",
      event: "changeModel",
      nullable : false,
      deferredInit : true
    },


    /** Default item height */
    itemHeight :
    {
      check : "Integer",
      init : 25,
      apply : "_applyRowHeight",
      themeable : true
    },


    /**
     * The path to the property which holds the information that should be
     * shown as a label. This is only needed if objects are stored in the model.
     */
    labelPath :
    {
      check: "String",
      apply: "_applyLabelPath",
      nullable: true
    },


    /**
     * The path to the property which holds the information that should be
     * shown as a icon. This is only needed if objects are stored in the model
     * and if the icon should be shown.
     */
    iconPath :
    {
      check: "String",
      apply: "_applyIconPath",
      nullable: true
    },


    /**
     * A map containing the options for the label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    labelOptions :
    {
      apply: "_applyLabelOptions",
      nullable: true
    },


    /**
     * A map containing the options for the icon binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    iconOptions :
    {
      apply: "_applyIconOptions",
      nullable: true
    },


    /**
     * Delegation object, which can have one or more functions defined by the
     * {@link qx.ui.list.core.IControllerDelegate} interface.
     */
    delegate :
    {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
    }
  },


  members :
  {
    /** {qx.ui.virtual.layer.Row} background renderer */
    _background : null,


    /** {qx.ui.list.provider.IListProvider} provider for cell rendering */
    _provider : null,


    /** {qx.ui.virtual.layer.Abstract} layer which containing the items. */
    _layer : null,


    /** {Array} lookup table for sorting etc. */
    __lookupTable : null,


    /** {Array} lookup table for getting the group name form the row */
    __lookupTableForGroup : null,


    /** {Array} contains all groups with the items as children. The key is 
     * the group name and the value is an <code>Array</code> containing the 
     * row number from each item. */
    __groupHashMap : null,


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "row-layer" :
          control = new qx.ui.virtual.layer.Row(null, null);
          break;
      }
      return control || this.base(arguments, id);
    },


    /**
     * Initialized the virtual list.
     */
    _init : function()
    {
      this._provider = new qx.ui.list.provider.WidgetProvider(this);
      this.__lookupTable = [];

      this.__groupHashMap = [];
      this.__lookupTableForGroup = [];

      this.getPane().addListener("resize", this._onResize, this);

      this._initBackground();
      this._initLayer();
    },


    /**
     * Initialized the background renderer.
     */
    _initBackground : function()
    {
      this._background = this.getChildControl("row-layer");
      this.getPane().addLayer(this._background);
    },


    /**
     * Initialized the widget cell renderer.
     */
    _initLayer : function()
    {
      this._layer = this._provider.createLayer();
      this.getPane().addLayer(this._layer);
    },


    /*
    ---------------------------------------------------------------------------
      INTERNAL API
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the model data from the passed row.
     *
     * @param row {Integer} row to get data.
     * @return {var|null} the model data from the row.
     */
    _getDataFromRow : function(row) {
      var data = null;

      if (this._isGroup(row)) {
        data = this.__lookupTableForGroup[row];
      } else {
        data = this.getModel().getItem(this._lookup(row));
      }

      if (data != null) {
        return data;
      } else {
        return null;
      }
    },


    /**
     * Performs a lookup.
     *
     * @param index {Number} The index to look at.
     */
    _lookup : function(index) {
      return this.__lookupTable[index];
    },


    /**
     * Checks if the passed row is a group or an item.
     * 
     * @param row {Integer} row to check.
     * @return {Boolean} <code>true</code> when the row is a group element,
     *  <code>false</code> when the row is an item element.
     */
    _isGroup : function(row) {
      return !!this.__lookupTableForGroup[row];
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // apply method
    _applyModel : function(value, old)
    {
      value.addListener("change", this._onModelChange, this);

      if (old != null) {
        old.removeListener("change", this._onModelChange, this);
      }

      this._provider.removeBindings();
      this.__buildUpLookupTable();
    },


    // apply method
    _applyRowHeight : function(value, old) {
      this.getPane().getRowConfig().setDefaultItemSize(value);
    },


    // apply method
    _applyLabelPath : function(value, old) {
      this._provider.setLabelPath(value);
    },


    // apply method
    _applyIconPath : function(value, old) {
      this._provider.setIconPath(value);
    },


    // apply method
    _applyLabelOptions : function(value, old) {
      this._provider.setLabelOptions(value);
    },


    // apply method
    _applyIconOptions : function(value, old) {
      this._provider.setIconOptions(value);
    },


    // apply method
    _applyDelegate : function(value, old) {
      this._provider.setDelegate(value);
      this.__buildUpLookupTable();
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */


    /**
     * Event handler for the resize event.
     *
     * @param e {qx.event.type.Data} resize event.
     */
    _onResize : function(e) {
      this.getPane().getColumnConfig().setItemSize(0, e.getData().width);
    },


    /**
     * Event handler for the model change event.
     *
     * @param e {qx.event.type.Data} model change event.
     */
    _onModelChange : function(e) {
      this.__buildUpLookupTable();
    },


    /*
    ---------------------------------------------------------------------------
      HELPER ROUTINES
    ---------------------------------------------------------------------------
    */


    /**
     * Helper method to update the row count.
     */
    __updateRowCount : function()
    {
      this.getPane().getRowConfig().setItemCount(this.__lookupTable.length);
      this.getPane().fullUpdate();
    },


    /**
     * Internal method for building the lookup table.
     */
    __buildUpLookupTable : function()
    {
      this.__lookupTable = [];

      var model = this.getModel();

      if (model == null) {
        return;
      }

      this._runDelegateFilter(model);
      this._runDelegateSorter(model);
      this._runDelegateGroup(model);
      this.__updateRowCount();
    },


    /**
     * Invokes a filtering using the filter given in the delegate.
     *
     * @param model {qx.data.IListData} The model.
     */
    _runDelegateFilter : function (model)
    {
      var filter = qx.util.Delegate.getMethod(this.getDelegate(), "filter");

      for (var i = 0,l = model.length; i < l; ++i)
      {
        if (filter == null || filter(model.getItem(i))) {
          this.__lookupTable.push(i);
        }
      }
    },


    /**
     * Invokes a sorting using the sorter given in the delegate.
     *
     * @param model {qx.data.IListData} The model.
     */
    _runDelegateSorter : function (model)
    {
      if (this.__lookupTable.length == 0) {
        return;
      }

      var sorter = qx.util.Delegate.getMethod(this.getDelegate(), "sorter");

      if (sorter != null)
      {
        this.__lookupTable.sort(function(a, b)
        {
          return sorter(model.getItem(a), model.getItem(b));
        });
      }
    },


    /**
     * Invokes a grouping using the group result given in the delegate.
     *
     * @param model {qx.data.IListData} The model.
     */
    _runDelegateGroup : function (model)
    {
      var groupMethod = qx.util.Delegate.getMethod(this.getDelegate(), "group");

      if (groupMethod != null)
      {
        for (var i = 0,l = this.__lookupTable.length; i < l; ++i)
        {
          var row = this.__lookupTable[i];
          var item = this.getModel().getItem(row);
          var group = groupMethod(item);

          this.__addGroup(group, row);
        }
        this.__lookupTable = this.__createLookupFromGroup();
      }
    },


    /**
     * Adds a row the the group.
     * 
     * @param name {String} the group name.
     * @param row {Integer} row number to add.
     */
    __addGroup : function(name, row)
    {
      if (this.__groupHashMap[name] == null) {
        this.__groupHashMap[name] = [];
      }
      this.__groupHashMap[name].push(row);
    },


    /**
     * Creates a lookup table form the internal group hash map.
     * 
     * @return {Array} the lookup table based on the internal group hash map.
     */
    __createLookupFromGroup : function()
    {
      var result = [];
      var row = 0;
      for (var group in this.__groupHashMap)
      {
        result.push(group);
        this.__lookupTableForGroup[row] = group;
        row++;

        var groupMembers = this.__groupHashMap[group];
        for (var i = 0,l = groupMembers.length; i < l; i++) {
          result.push(groupMembers[i]);
          row++;
        }
      }
      return result;
    }
  },


  destruct : function()
  {
    this._background.dispose();
    this._provider.dispose();
    this._layer.dispose();
    this._background = null;
    this._provider = null;
    this._layer = null;
  }
});
