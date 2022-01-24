/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
 *
 * Note about backward compatibility: Although a number of method were protected (eg _runDelegateXxxx),
 * they could not be overridden in 6.0.0 or earlier because implementation required access to private methods
 * and data structures, and therefore are exempt from BC concerns
 *
 *
 * @childControl row-layer {qx.ui.virtual.layer.Row} layer for all rows
 */
qx.Class.define("qx.ui.list.List", {
  extend: qx.ui.virtual.core.Scroller,
  include: [qx.ui.virtual.selection.MModel],
  implement: qx.data.controller.ISelection,

  /**
   * Creates the <code>qx.ui.list.List</code> with the passed model.
   *
   * @param model {qx.data.IListData|null?} model for the list.
   */
  construct(model) {
    super(0, 1, 20, 100);

    this._init();

    this.__defaultGroups = new qx.data.Array();
    this.initGroups(this.__defaultGroups);

    if (model != null) {
      this.initModel(model);
    }

    this.initItemHeight();
  },

  events: {
    /**
     * Fired when the length of {@link #model} changes.
     */
    changeModelLength: "qx.event.type.Data",

    /** Fired when properties of the model change */
    change: "qx.event.type.Data"
  },

  properties: {
    // overridden
    appearance: {
      refine: true,
      init: "virtual-list"
    },

    // overridden
    focusable: {
      refine: true,
      init: true
    },

    // overridden
    width: {
      refine: true,
      init: 100
    },

    // overridden
    height: {
      refine: true,
      init: 200
    },

    /** Data array containing the data which should be shown in the list. */
    model: {
      check: "qx.data.IListData",
      apply: "_applyModel",
      event: "changeModel",
      nullable: true,
      deferredInit: true
    },

    /** Default item height */
    itemHeight: {
      check: "Integer",
      init: 25,
      apply: "_applyRowHeight",
      themeable: true
    },

    /** Group item height */
    groupItemHeight: {
      check: "Integer",
      init: null,
      nullable: true,
      apply: "_applyGroupRowHeight",
      themeable: true
    },

    /**
     * The path to the property which holds the information that should be
     * displayed as a label. This is only needed if objects are stored in the
     * model.
     */
    labelPath: {
      check: "String",
      apply: "_applyLabelPath",
      nullable: true
    },

    /**
     * The path to the property which holds the information that should be
     * displayed as an icon. This is only needed if objects are stored in the
     * model and icons should be displayed.
     */
    iconPath: {
      check: "String",
      apply: "_applyIconPath",
      nullable: true
    },

    /**
     * The path to the property which holds the information that should be
     * displayed as a group label. This is only needed if objects are stored in the
     * model.
     */
    groupLabelPath: {
      check: "String",
      apply: "_applyGroupLabelPath",
      nullable: true
    },

    /**
     * A map containing the options for the label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    labelOptions: {
      apply: "_applyLabelOptions",
      nullable: true
    },

    /**
     * A map containing the options for the icon binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    iconOptions: {
      apply: "_applyIconOptions",
      nullable: true
    },

    /**
     * A map containing the options for the group label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    groupLabelOptions: {
      apply: "_applyGroupLabelOptions",
      nullable: true
    },

    /**
     * Delegation object which can have one or more functions defined by the
     * {@link qx.ui.list.core.IListDelegate} interface.
     */
    delegate: {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
    },

    /**
     * Indicates that the list is managing the {@link #groups} automatically.
     */
    autoGrouping: {
      check: "Boolean",
      init: true
    },

    /**
     * Contains all groups for data binding, but do only manipulate the array
     * when the {@link #autoGrouping} is set to <code>false</code>.
     */
    groups: {
      check: "qx.data.Array",
      event: "changeGroups",
      nullable: false,
      deferredInit: true
    },

    /** 
     * Render list items with variable height, 
     * calculated from the individual item size. 
     * @deprecated {7.0} see `autoSizeRows` (and `autoSizeColumns`)
     *
     * Note that this property is now implemented manually, and while 
     * deprecated it now just defers to `autoSizeRows`
     
    variableItemHeight: {
      check: "Boolean",
      nullable: false,
      init: true
    },
    */

    /** Whether to auto size the row heights */
    autoSizeRows: {
      init: true,
      check: "Boolean",
      apply: "_applyAutoSizeRows"
    },

    /** Whether to auto size the column widths */
    autoSizeColumns: {
      init: true,
      check: "Boolean",
      apply: "_applyAutoSizeColumns"
    },

    /** Whether to repeat the items into columns, within each group */
    repeatingColumnCount: {
      init: 1,
      check: "Integer",
      nullable: false
    },

    /** Whether the table is readonly */
    readOnly: {
      init: false,
      check: "Boolean",
      apply: "_applyReadOnly",
      event: "changeReadOnly"
    }
  },

  members: {
    /** @type {qx.ui.virtual.layer.Row} background renderer */
    _background: null,

    /** @type {qx.ui.list.provider.IListProvider} provider for cell rendering */
    _provider: null,

    /** @type {qx.ui.virtual.layer.Abstract} layer which contains the items. */
    _layer: null,

    /**
     * @type {Array} lookup table to get the model index from a row. To get the
     *   correct value after applying filter, sorter, group.  Each element is an
     *   array of integers, the array length depends on `repeatingColumnCount`
     *
     * Note the value <code>null</code> indicates that the value is a group item.
     */
    __lookupTable: null,

    /** @type {Array} lookup table for getting the group index from the row */
    __lookupTableForGroup: null,

    /**
     * @type {Map} contains all groups with the items as children. The key is
     *   the group name and the value is an <code>Array</code> containing each
     *   item's model index.
     */
    __groupHashMap: null,

    /**
     * @type {Boolean} indicates when one or more <code>String</code> are used for grouping.
     */
    __groupStringsUsed: false,

    /**
     * @type {Boolean} indicates when one or more <code>Object</code> are used for grouping.
     */
    __groupObjectsUsed: false,

    /**
     * @type {Boolean} indicates when a default group is used for grouping.
     */
    __defaultGroupUsed: false,

    __defaultGroups: null,

    /**
     * Trigger a rebuild from the internal data structure.
     */
    refresh() {
      this.__buildUpLookupTable();
    },

    /** @type {qx.ui.list.AbstractColumn[]} the columns */
    __columns: null,

    // overridden
    _createChildControlImpl(id, hash) {
      var control;

      switch (id) {
        case "row-layer":
          control = new qx.ui.virtual.layer.Row();
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    /**
     * Initialize the virtual list provider.
     */
    _initWidgetProvider() {
      this._provider = new qx.ui.list.provider.WidgetProvider(this);
    },

    /**
     * Returns the virtual list provider
     *
     * @return {qx.ui.list.provider.IListProvider}
     */
    getProvider() {
      return this._provider;
    },

    /**
     * Initializes the virtual list.
     */
    _init() {
      this._initWidgetProvider();
      this._provider.addListener("change", evt =>
        this.fireDataEvent("change", evt.getData())
      );

      this.__lookupTable = [];
      this.__lookupTableForGroup = [];
      this.__groupHashMap = {};
      this.__groupStringsUsed = false;
      this.__groupObjectsUsed = false;
      this.__defaultGroupUsed = false;

      this.getPane().addListener("resize", this._onResize, this);

      this._initBackground();
      this._initLayer();
      this.getPane().set({
        autoSizeRows: this.isAutoSizeRows(),
        autoSizeColumns: this.isAutoSizeColumns()
      });
    },

    /**
     * Initializes the background renderer.
     */
    _initBackground() {
      this._background = this.getChildControl("row-layer");
      this.getPane().addLayer(this._background);
    },

    /**
     * Initializes the layer for rendering.
     */
    _initLayer() {
      this._layer = this._provider.createLayer();
      this.getPane().addLayer(this._layer);
    },

    /**
     * Returns the layer
     * @return {qx.ui.virtual.core.ILayer}
     */
    getLayer() {
      return this._layer;
    },

    /**
     * Apply for `readOnly`
     */
    _applyReadOnly(value, oldValue) {
      this.updateEditable();
    },

    /**
     * @Override
     */
    _applyEnabled(value, oldValue) {
      super._applyEnabled(value, oldValue);
      this.updateEditable();
    },

    /**
     * Called to update editability of columns/widgets
     */
    updateEditable() {
      this._provider.updateEditable();
    },

    /*
    ---------------------------------------------------------------------------
      INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the model data for the given row.
     *
     * @param cell {Object} map containg:
     *    row {Integer} row to get data for.
     *    column {Integer} column to get data for
     * @return {var|null} the row's model data.
     */
    _getDataFromRow(cell) {
      var data = null;

      var model = this.getModel();
      if (model == null) {
        return null;
      }

      if (this._isGroup(cell.row)) {
        data = this.getGroups().getItem(this._lookupGroup(cell.row));
      } else {
        let row = cell.row;
        if (this.getProvider().getShowHeaders()) row--;
        data = model.getItem(this._lookupByRowAndColumn(row, cell.column));
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
    _getLookupTable() {
      if (
        qx.core.Environment.get("qx.debug") &&
        this.getRepeatingColumnCount() == 1 &&
        !this.__warnedAbout_getLookupTable
      ) {
        this.warn(
          "Calling _getLookupTable to retrieve the internal lookup table has changed since v7"
        );

        this.__warnedAbout_getLookupTable = true;
      }
      return this.__lookupTable;
    },

    /**
     * Performs a lookup from row to model index.
     *
     * @param row {Number} The row to look at.
     * @return {Number} The model index or <code>-1</code> if the row is a group item.
     * @deprecated {6.0} see `_lookupByRowAndColumn`
     */
    _lookup(row) {
      if (this.getRepeatingColumnCount() != 1)
        throw new Error(
          this.classname +
            "._lookup is not supported when using repeating columns"
        );

      return this._lookupByRowAndColumn(row, 0);
    },

    /**
     * Performs a lookup from row to model index.
     *
     * @param row {Number} The row to look at.
     * @param column {Number} the column to look at
     * @return {Number} The model index or
     *   <code>-1</code> if the row is a group item.
     */
    _lookupByRowAndColumn(row, column) {
      if (this.getRepeatingColumnCount() == 1) {
        column = 0;
      }

      if (column < 0 || column >= this.getRepeatingColumnCount())
        throw new Error("Invalid column index");

      let columnIndexes = this.__lookupTable[row];
      if (!columnIndexes) return -1;

      if (columnIndexes.length < column) return null;
      return columnIndexes[column];
    },

    /**
     * Performs a lookup from row to group index.
     *
     * @param row {Number} The row to look at.
     * @return {Number} The group index or
     *   <code>-1</code> if the row is a not a group item.
     */
    _lookupGroup(row) {
      return this.__lookupTableForGroup.indexOf(row);
    },

    /**
     * Performs a lookup from model index to row.
     *
     * @param index {Number} The index to look at.
     * @return {Map} containing `row` and `column`, both are zero based indexes
     */
    _reverseLookup(index) {
      if (index < 0) {
        return null;
      }
      for (let i = 0; i < this.__lookupTable.length; i++) {
        let arr = this.__lookupTable[i];
        if (arr !== null) {
          let col = arr.indexOf(index);
          if (col > -1) return { row: i, col };
        }
      }
      return -1;
    },

    /**
     * Checks if the passed row is a group or an item.
     *
     * @param row {Integer} row to check.
     * @return {Boolean} <code>true</code> if the row is a group element,
     *  <code>false</code> if the row is an item element.
     */
    _isGroup(row) {
      if (this.getProvider().getShowHeaders()) {
        if (row === 0) return false;
        row--;
      }

      return this._lookupByRowAndColumn(row, 0) === -1;
    },

    /**
     * Returns the selectable model items.
     *
     * @return {qx.data.Array | null} The selectable items.
     */
    _getSelectables() {
      return this.getModel();
    },

    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // apply method
    _applyModel(value, old) {
      if (value != null) {
        value.addListener("changeLength", this._onModelChange, this);
      }

      if (old != null) {
        old.removeListener("changeLength", this._onModelChange, this);
      }

      this._onModelChange();
    },

    // apply method
    _applyRowHeight(value, old) {
      this.getPane().getRowConfig().setDefaultItemSize(value);
    },

    // apply method
    _applyGroupRowHeight(value, old) {
      this.__updateGroupRowHeight();
    },

    // apply method
    _applyLabelPath(value, old) {
      this._provider.setLabelPath(value);
    },

    // apply method
    _applyIconPath(value, old) {
      this._provider.setIconPath(value);
    },

    // apply method
    _applyGroupLabelPath(value, old) {
      this._provider.setGroupLabelPath(value);
    },

    // apply method
    _applyLabelOptions(value, old) {
      this._provider.setLabelOptions(value);
    },

    // apply method
    _applyIconOptions(value, old) {
      this._provider.setIconOptions(value);
    },

    // apply method
    _applyGroupLabelOptions(value, old) {
      this._provider.setGroupLabelOptions(value);
    },

    // apply method
    _applyDelegate(value, old) {
      this._provider.setDelegate(value);
      this.__buildUpLookupTable();
    },

    /**
     * Psuedo-property variableItemHeight
     * @deprecated {7.0}
     */
    setVariableItemHeight(value) {
      this.setAutoSizeRows(value);
    },

    /**
     * Psuedo-property variableItemHeight
     * @deprecated {7.0}
     */
    getVariableItemHeight() {
      return this.getAutoSizeRows();
    },

    /**
     * Psuedo-property variableItemHeight
     * @deprecated {7.0}
     */
    isVariableItemHeight() {
      return this.getAutoSizeRows();
    },

    /**
     * Psuedo-property variableItemHeight
     * @deprecated {7.0}
     */
    resetVariableItemHeight() {
      this.resetAutoSizeRows();
    },

    // property apply
    _applyAutoSizeRows(value) {
      this.getPane().setAutoSizeRows(value);
    },

    // property apply
    _applyAutoSizeColumns(value) {
      this.getPane().setAutoSizeColumns(value);
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
    _onResize(e) {
      if (!this.isAutoSizeColumns() && this.getRepeatingColumnCount() == 1)
        this.getPane().getColumnConfig().setItemSize(0, e.getData().width);
    },

    /**
     * Event handler for the model change event.
     *
     * @param e {qx.event.type.Data} model change event.
     */
    _onModelChange(e) {
      // we have to remove the bindings before we rebuild the lookup table
      // otherwise bindings might be dispatched to wrong items
      // see: https://github.com/qooxdoo/qooxdoo/issues/196
      this._provider.removeBindings();
      this.__buildUpLookupTable();
      this._applyDefaultSelection();

      if (e instanceof qx.event.type.Data) {
        this.fireDataEvent("changeModelLength", e.getData(), e.getOldData());
      }
      this.getPane().fullUpdate();
    },

    /*
    ---------------------------------------------------------------------------
      HELPER ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * Helper method to update the row & column counts.
     */
    __updateRowColumnCount() {
      this.getPane()
        .getRowConfig()
        .setItemCount(this.__lookupTable.length + 1);
      let count = this.getRepeatingColumnCount();
      if (count !== 1) {
        let columnConfig = this.getPane().getColumnConfig();
        columnConfig.setItemCount(count);
        let autoSize = this.isAutoSizeColumns();
        for (let i = 0; i < count; i++) {
          columnConfig.setItemFlex(i, autoSize ? 1 : null);
        }
      }
      this.getPane().fullUpdate();
    },

    /**
     * Helper method to update group row heights.
     */
    __updateGroupRowHeight() {
      if (this.isAutoSizeRows()) {
        return;
      }
      var rc = this.getPane().getRowConfig();
      var gh = this.getGroupItemHeight();
      rc.resetItemSizes();

      if (gh) {
        for (var i = 0, l = this.__lookupTable.length; i < l; ++i) {
          if (this.__lookupTable[i] === null) {
            rc.setItemSize(i, gh);
          }
        }
      }
    },

    /**
     * Internal method for building the lookup table.
     */
    __buildUpLookupTable() {
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
      this.__updateGroupRowHeight();
      this.__updateRowColumnCount();
    },

    /**
     * Invokes filtering using the filter given in the delegate.
     *
     * @param model {qx.data.IListData} The model.
     */
    _runDelegateFilter(model) {
      var filter = qx.util.Delegate.getMethod(this.getDelegate(), "filter");

      for (var i = 0, l = model.length; i < l; ++i) {
        if (filter == null || filter(model.getItem(i))) {
          this.__lookupTable.push([i]);
        }
      }
    },

    /**
     * Invokes sorting using the sorter given in the delegate.
     *
     * @param model {qx.data.IListData} The model.
     */
    _runDelegateSorter(model) {
      if (this.__lookupTable.length == 0) {
        return;
      }

      var sorter = qx.util.Delegate.getMethod(this.getDelegate(), "sorter");

      if (sorter != null) {
        // TODO
        this.__lookupTable.sort(function (a, b) {
          return sorter(model.getItem(a), model.getItem(b));
        });
      }
    },

    /**
     * Invokes grouping using the group result given in the delegate.
     *
     * @param model {qx.data.IListData} The model.
     */
    _runDelegateGroup(model) {
      var groupMethod = qx.util.Delegate.getMethod(this.getDelegate(), "group");

      if (groupMethod != null) {
        this.__lookupTable.forEach(arr => {
          arr.forEach(index => {
            var item = this.getModel().getItem(index);
            var group = groupMethod(item);

            this.__addGroup(group, index);
          });
        });

        this.__lookupTable = this.__createLookupFromGroup();
      }
    },

    /**
     * Adds a model index the the group.
     *
     * @param group {String|Object|null} the group.
     * @param index {Integer} model index to add.
     */
    __addGroup(group, index) {
      // if group is null add to default group
      if (group == null) {
        this.__defaultGroupUsed = true;
        group = "???";
      }

      var name = this.__getUniqueGroupName(group);
      if (this.__groupHashMap[name] == null) {
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
    __createLookupFromGroup() {
      this.__checkGroupStructure();

      var result = [];
      var row = 0;
      var groups = this.getGroups();
      let colCount = this.getRepeatingColumnCount();
      for (var i = 0; i < groups.getLength(); i++) {
        var group = groups.getItem(i);

        // indicate that the value is a group
        result.push(null);
        this.__lookupTableForGroup.push(row);
        row++;

        var key = this.__getUniqueGroupName(group);
        var groupMembers = this.__groupHashMap[key];
        if (groupMembers != null) {
          let col = 0;
          groupMembers.forEach(index => {
            if (col == 0) {
              result.push([index]);
            } else {
              let arr = result[result.length - 1];
              arr.push(index);
            }

            col++;
            // Wrap onto next row
            if (col == colCount) {
              row++;
              col = 0;
            }
          });
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
    __getUniqueGroupName(group) {
      var name = null;
      if (!qx.lang.Type.isString(group)) {
        var index = this.getGroups().indexOf(group);
        this.__groupObjectsUsed = true;

        name = "group";
        if (index == -1) {
          name += this.getGroups().getLength();
        } else {
          name += index;
        }
      } else {
        this.__groupStringsUsed = true;
        var name = group;
      }
      return name;
    },

    /**
     * Checks that <code>Object</code> and <code>String</code> are not mixed
     * as group identifier, otherwise an exception occurs.
     */
    __checkGroupStructure() {
      if (
        (this.__groupObjectsUsed && this.__defaultGroupUsed) ||
        (this.__groupObjectsUsed && this.__groupStringsUsed)
      ) {
        throw new Error(
          "GroupingTypeError: You can't mix 'Objects' and 'Strings' as" +
            " group identifier!"
        );
      }
    }
  },

  destruct() {
    var model = this.getModel();
    if (model != null) {
      model.removeListener("changeLength", this._onModelChange, this);
    }

    var pane = this.getPane();
    if (pane != null) {
      pane.removeListener("resize", this._onResize, this);
    }

    this._background.dispose();
    this._provider.dispose();
    this._layer.dispose();
    this._background =
      this._provider =
      this._layer =
      this.__lookupTable =
      this.__lookupTableForGroup =
      this.__groupHashMap =
        null;

    if (this.__defaultGroups) {
      this.__defaultGroups.dispose();
    }
  }
});
