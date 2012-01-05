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
 * The <code>qx.ui.list.List</code> is based on the virtual infrastructure and
 * supports filtering, sorting, grouping, single selection, multi selection,
 * data binding and custom rendering.
 *
 * Using the virtual infrastructure has considerable advantages when there is a
 * huge amount of model items to render because the virtual infrastructure only
 * creates widgets for visible items and reuses them. This saves both creation
 * time and memory.
 *
 * With the {@link qx.ui.list.core.IListDelegate} interface it is possible
 * to configure the list's behavior (item and group renderer configuration,
 * filtering, sorting, grouping, etc.).
 *
 * Here's an example of how to use the widget:
 * <pre class="javascript">
 * //create the model data
 * var rawData = [];
 * for (var i = 0; i < 2500; i++) {
 *  rawData[i] = "Item No " + i;
 * }
 * var model = qx.data.marshal.Json.createModel(rawData);
 *
 * //create the list
 * var list = new qx.ui.list.List(model);
 *
 * //configure the lists's behavior
 * var delegate = {
 *   sorter : function(a, b) {
 *     return a > b ? 1 : a < b ? -1 : 0;
 *   }
 * };
 * list.setDelegate(delegate);
 *
 * //Pre-Select "Item No 20"
 * list.getSelection().push(model.getItem(20));
 *
 * //log selection changes
 * list.getSelection().addListener("change", function(e) {
 *   this.debug("Selection: " + list.getSelection().getItem(0));
 * }, this);
 * </pre>
 *
 * @childControl row-layer {qx.ui.virtual.layer.Row} layer for all rows
 */
qx.Class.define("qx.ui.list.List",
{
  extend : qx.ui.virtual.core.Scroller,
  include : [qx.ui.virtual.selection.MModel],
  implement : qx.data.controller.ISelection,

  /**
   * Creates the <code>qx.ui.list.List</code> with the passed model.
   *
   * @param model {qx.data.Array|null} model for the list.
   */
  construct : function(model)
  {
    this.base(arguments, 0, 1, 20, 100);

    this._init();

    this.__defaultGroups = new qx.data.Array();
    this.initGroups(this.__defaultGroups);

    if(model != null) {
      this.initModel(model);
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
      nullable : true,
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
     * displayed as a label. This is only needed if objects are stored in the
     * model.
     */
    labelPath :
    {
      check: "String",
      apply: "_applyLabelPath",
      nullable: true
    },


    /**
     * The path to the property which holds the information that should be
     * displayed as an icon. This is only needed if objects are stored in the
     * model and icons should be displayed.
     */
    iconPath :
    {
      check: "String",
      apply: "_applyIconPath",
      nullable: true
    },


    /**
     * The path to the property which holds the information that should be
     * displayed as a group label. This is only needed if objects are stored in the
     * model.
     */
    groupLabelPath :
    {
      check: "String",
      apply: "_applyGroupLabelPath",
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
     * A map containing the options for the group label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    groupLabelOptions :
    {
      apply: "_applyGroupLabelOptions",
      nullable: true
    },


    /**
     * Delegation object which can have one or more functions defined by the
     * {@link qx.ui.list.core.IListDelegate} interface.
     */
    delegate :
    {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
    },


    /**
     * Indicates that the list is managing the {@link #groups} automatically.
     */
    autoGrouping :
    {
      check: "Boolean",
      init: true
    },


    /**
     * Contains all groups for data binding, but do only manipulate the array
     * when the {@link #autoGrouping} is set to <code>false</code>.
     */
    groups :
    {
      check: "qx.data.Array",
      event: "changeGroups",
      nullable: false,
      deferredInit: true
    }
  },


  members :
  {
    /** {qx.ui.virtual.layer.Row} background renderer */
    _background : null,


    /** {qx.ui.list.provider.IListProvider} provider for cell rendering */
    _provider : null,


    /** {qx.ui.virtual.layer.Abstract} layer which contains the items. */
    _layer : null,


    /**
     * {Array} lookup table to get the model index from a row. To get the
     * correct value after applying filter, sorter, group.
     *
     * Note the value <code>-1</code> indicates that the value is a group item.
     */
    __lookupTable : null,


    /** {Array} lookup table for getting the group index from the row */
    __lookupTableForGroup : null,


    /**
     * {Map} contains all groups with the items as children. The key is
     * the group name and the value is an <code>Array</code> containing each
     * item's model index.
     */
    __groupHashMap : null,


    /**
     * {Boolean} indicates when one or more <code>String</code> are used for grouping.
     */
    __groupStringsUsed : false,


    /**
     * {Boolean} indicates when one or more <code>Object</code> are used for grouping.
     */
    __groupObjectsUsed : false,


    /**
     * {Boolean} indicates when a default group is used for grouping.
     */
    __defaultGroupUsed : false,

    __defaultGroups : null,


    /**
     * Trigger a rebuild from the internal data structure.
     */
    refresh : function() {
      this.__buildUpLookupTable();
    },


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
     * Initializes the virtual list.
     */
    _init : function()
    {
      this._provider = new qx.ui.list.provider.WidgetProvider(this);

      this.__lookupTable = [];
      this.__lookupTableForGroup = [];
      this.__groupHashMap = {};
      this.__groupStringsUsed = false;
      this.__groupObjectsUsed = false;
      this.__defaultGroupUsed = false;

      this.getPane().addListener("resize", this._onResize, this);

      this._initBackground();
      this._initLayer();
    },


    /**
     * Initializes the background renderer.
     */
    _initBackground : function()
    {
      this._background = this.getChildControl("row-layer");
      this.getPane().addLayer(this._background);
    },


    /**
     * Initializes the layer for rendering.
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
     * Returns the model data for the given row.
     *
     * @param row {Integer} row to get data for.
     * @return {var|null} the row's model data.
     */
    _getDataFromRow : function(row) {
      var data = null;

      var model = this.getModel();
      if (model == null) {
        return null;
      }

      if (this._isGroup(row)) {
        data = this.getGroups().getItem(this._lookupGroup(row));
      } else {
        data = model.getItem(this._lookup(row));
      }

      if (data != null) {
        return data;
      } else {
        return null;
      }
    },


    /**
     * Return the internal lookup table. But do not manipulate the
     * lookup table!
     *
     * @return {Array} The internal lookup table.
     */
    _getLookupTable : function() {
      return this.__lookupTable;
    },


    /**
     * Performs a lookup from row to model index.
     *
     * @param row {Number} The row to look at.
     * @return {Number} The model index or
     *   <code>-1</code> if the row is a group item.
     */
    _lookup : function(row) {
      return this.__lookupTable[row];
    },


    /**
     * Performs a lookup from row to group index.
     *
     * @param row {Number} The row to look at.
     * @return {Number} The group index or
     *   <code>-1</code> if the row is a not a group item.
     */
    _lookupGroup : function(row) {
      return this.__lookupTableForGroup.indexOf(row);
    },


    /**
     * Performs a lookup from model index to row.
     *
     * @param index {Number} The index to look at.
     * @return {Number} The row or <code>-1</code>
     *  if the index is not a model index.
     */
    _reverseLookup : function(index) {
      if (index < 0) {
        return -1;
      }
      return this.__lookupTable.indexOf(index);
    },


    /**
     * Checks if the passed row is a group or an item.
     *
     * @param row {Integer} row to check.
     * @return {Boolean} <code>true</code> if the row is a group element,
     *  <code>false</code> if the row is an item element.
     */
    _isGroup : function(row) {
      return this._lookup(row) == -1;
    },


    /**
     * Returns the selectable model items.
     *
     * @return {qx.data.Array | null} The selectable items.
     */
    _getSelectables : function() {
      return this.getModel();
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // apply method
    _applyModel : function(value, old)
    {
      if (value != null) {
        value.addListener("change", this._onModelChange, this);
      }

      if (old != null) {
        old.removeListener("change", this._onModelChange, this);
      }

      this._provider.removeBindings();
      this._onModelChange();
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
    _applyGroupLabelPath : function(value, old) {
      this._provider.setGroupLabelPath(value);
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
    _applyGroupLabelOptions : function(value, old) {
      this._provider.setGroupLabelOptions(value);
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
      this._applyDefaultSelection();
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
      this.__lookupTableForGroup = [];
      this.__groupHashMap = {};

      if (this.isAutoGrouping()) {
        this.getGroups().removeAll();
      }

      var model = this.getModel();

      if (model != null) {
        this._runDelegateFilter(model);
        this._runDelegateSorter(model);
        this._runDelegateGroup(model);
      }

      this._updateSelection();
      this.__updateRowCount();
    },


    /**
     * Invokes filtering using the filter given in the delegate.
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
     * Invokes sorting using the sorter given in the delegate.
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
     * Invokes grouping using the group result given in the delegate.
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
          var index = this.__lookupTable[i];
          var item = this.getModel().getItem(index);
          var group = groupMethod(item);

          this.__addGroup(group, index);
        }
        this.__lookupTable = this.__createLookupFromGroup();
      }
    },


    /**
     * Adds a model index the the group.
     *
     * @param group {String|Object|null} the group.
     * @param index {Integer} model index to add.
     */
    __addGroup : function(group, index)
    {
      // if group is null add to default group
      if (group == null)
      {
        this.__defaultGroupUsed = true;
        group = "???";
      }

      var name = this.__getUniqueGroupName(group);
      if (this.__groupHashMap[name] == null)
      {
        this.__groupHashMap[name] = [];
        if (this.isAutoGrouping()) {
          this.getGroups().push(group);
        }
      }
      this.__groupHashMap[name].push(index);
    },


    /**
     * Creates a lookup table form the internal group hash map.
     *
     * @return {Array} the lookup table based on the internal group hash map.
     */
    __createLookupFromGroup : function()
    {
      this.__checkGroupStructure();

      var result = [];
      var row = 0;
      var groups = this.getGroups();
      for (var i = 0; i < groups.getLength(); i++)
      {
        var group = groups.getItem(i);

        // indicate that the value is a group
        result.push(-1);
        this.__lookupTableForGroup.push(row);
        row++;

        var key = this.__getUniqueGroupName(group);
        var groupMembers = this.__groupHashMap[key];
        if (groupMembers != null)
        {
          for (var k = 0; k < groupMembers.length; k++) {
            result.push(groupMembers[k]);
            row++;
          }
        }
      }
      return result;
    },


    /**
     * Returns an unique group name for the passed group.
     *
     * @param group {String|Object} Group to find unique group name.
     * @return {String} Unique group name.
     */
    __getUniqueGroupName : function(group)
    {
      var name = null;
      if (!qx.lang.Type.isString(group))
      {
        var index = this.getGroups().indexOf(group);
        this.__groupObjectsUsed = true;

        name = "group";
        if (index == -1) {
           name += this.getGroups().getLength();
        } else {
          name += index;
        }
      }
      else
      {
        this.__groupStringsUsed = true;
        var name = group;
      }
      return name;
    },


    /**
     * Checks that <code>Object</code> and <code>String</code> are not mixed
     * as group identifier, otherwise an exception occurs.
     */
    __checkGroupStructure : function() {
      if (this.__groupObjectsUsed && this.__defaultGroupUsed ||
          this.__groupObjectsUsed && this.__groupStringsUsed)
      {
        throw new Error("GroupingTypeError: You can't mix 'Objects' and 'Strings' as" +
          " group identifier!");
      }
    }
  },


  destruct : function()
  {
    this._background.dispose();
    this._provider.dispose();
    this._layer.dispose();
    this._background = this._provider = this._layer =
      this.__lookupTable = this.__lookupTableForGroup =
      this.__groupHashMap = null;

    if (this.__defaultGroups) {
      this.__defaultGroups.dispose();
    }
  }
});
