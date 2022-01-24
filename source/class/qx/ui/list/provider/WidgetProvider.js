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
 * The provider implements the {@link qx.ui.virtual.core.IWidgetCellProvider} API,
 * which can be used as delegate for the widget cell rendering and it
 * provides a API to bind the model with the rendered item.
 *
 * @internal
 */
qx.Class.define("qx.ui.list.provider.WidgetProvider", {
  extend: qx.core.Object,

  implement: [
    qx.ui.virtual.core.IWidgetCellProvider,
    qx.ui.list.provider.IListProvider,
    qx.ui.virtual.core.ILayerCellSizeProvider
  ],

  include: [qx.ui.list.core.MWidgetController],

  /**
   * Creates the <code>WidgetProvider</code>
   *
   * @param list {qx.ui.list.List} list to provide.
   */
  construct(list) {
    super();

    this._list = list;
    this.__cellWidgets = {};

    this._itemRenderer = this.createItemRenderer();
    this._groupRenderer = this.createGroupRenderer();

    this._itemRenderer.addListener("created", this._onItemCreated, this);
    this._groupRenderer.addListener("created", this._onGroupItemCreated, this);
    this._list.addListener("changeDelegate", this._onChangeDelegate, this);
  },

  properties: {
    /** Whether to show headers */
    showHeaders: {
      init: true,
      check: "Boolean",
      apply: "_applyShowHeaders"
    }
  },

  events: {
    /** Fired when properties of the model change */
    change: "qx.event.type.Data"
  },

  members: {
    /** @type {qx.ui.virtual.cell.WidgetCell} the used item renderer */
    _itemRenderer: null,

    /** @type {qx.ui.virtual.cell.WidgetCell} the used group renderer */
    _groupRenderer: null,

    /** @type {qx.ui.list.column.AbstractColumn[]} the columns for tabular presentation */
    __columns: null,

    __cellWidgets: null,

    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a column
     *
     * @param column {qx.ui.list.AbstractColumn} the column to add
     */
    addColumn(column) {
      if (this.__columns === null) this.__columns = [];
      let columnIndex = this.__columns.length;
      column.setColumnIndex(columnIndex);
      column.setList(this._list);
      this.__columns.push(column);
      let columnConfig = this._list.getPane().getColumnConfig();
      columnConfig.setItemCount(this.__columns.length);
      columnConfig.setItemFlex(columnIndex, column.getFlex());
      column.addListener("change", evt =>
        this.__onColumnChangeEvent(column, evt)
      );

      this._list
        .getChildControl("row-layer")
        .setHasHeader(this.isShowHeaders());
    },

    /**
     * Event handler for changes by column widgets
     */
    __onColumnChangeEvent(column, evt) {
      this.fireDataEvent("change", {
        column,
        value: evt.getData()
      });
    },

    /**
     * Returns the columns
     *
     * @return {qx.ui.list.column.AbstractColumn[]}
     */
    getColumns() {
      return this.__columns;
    },

    /**
     * Updates the editability of the columns
     */
    updateEditable() {
      if (this.__columns)
        this.__columns.forEach(column => column.updateEditable());
    },

    /**
     * @Override
     */
    getCellSizeHint(rowIndex, columnIndex) {
      let widget = this.getCellWidget(rowIndex, columnIndex);
      if (!widget) return null;
      let hint = widget.getSizeHint();
      if (!this._list._isGroup(rowIndex)) {
        let column = null;
        if (this.__columns !== null) {
          if (this.__columns.length > columnIndex)
            column = this.__columns[columnIndex];
        }
        if (column) {
          let maxWidth = column.getMaxWidth();
          if (maxWidth && (!hint.maxWidth || hint.maxWidth > maxWidth))
            hint.maxWidth = maxWidth;
          let minWidth = column.getMinWidth();
          if (minWidth && (!hint.minWidth || hint.minWidth < minWidth))
            hint.minWidth = minWidth;
        }
      }
      return hint;
    },

    /*
     * @Override
     */
    getCellWidget(rowIndex, columnIndex) {
      let id = rowIndex + "x" + columnIndex;
      let widget = null;

      if (this.__columns !== null) {
        if (this.__columns.length <= columnIndex) return null;
        let column = this.__columns[columnIndex];

        if (rowIndex == 0) {
          widget = column.getHeaderWidget();
        } else {
          rowIndex--;
          let model = this._list.getModel();
          if (!model || model.getLength() <= rowIndex) return null;
          widget = column.getCellWidget(rowIndex);
        }
      } else {
        // We can cache the widget for our own, but do not do this for Columns because they have their own
        //  caching and need to decide whether to cache or reload for the row/column model
        widget = this.__cellWidgets[id] || null;
        if (widget) return widget;

        if (!this._list._isGroup(rowIndex)) {
          widget = this._itemRenderer.getCellWidget();
          widget.setUserData("cell.type", "item");
          this._bindItem(
            widget,
            this._list._lookupByRowAndColumn(rowIndex, columnIndex)
          );

          if (this._list._manager.isItemSelected(rowIndex)) {
            this._styleSelectabled(widget);
          } else {
            this._styleUnselectabled(widget);
          }
        } else if (columnIndex == 0) {
          widget = this._groupRenderer.getCellWidget();
          widget.setUserData("cell.type", "group");
          this._bindGroupItem(widget, this._list._lookupGroup(rowIndex));
        }
      }

      this.__cellWidgets[id] = widget;

      return widget;
    },

    /*
     * @Override
     */
    poolCellWidget(widget) {
      let columnIndex = widget.getUserData("cell.column");
      let rowIndex = widget.getUserData("cell.row");
      let id = rowIndex + "x" + columnIndex;
      this._removeBindingsFrom(widget);
      delete this.__cellWidgets[id];

      if (widget.getUserData("cell.type") == "group") {
        this._groupRenderer.pool(widget);
        this._onPool(widget);
      } else {
        if (this.__columns !== null) {
          let column = this.__columns[columnIndex];

          if (rowIndex == 0) column.poolHeaderWidget(widget);
          else column.poolCellWidget(widget);
        } else {
          this._itemRenderer.pool(widget);
          this._onPool(widget);
        }
      }
    },

    /*
     * @Override
     */
    createLayer() {
      return new qx.ui.virtual.layer.WidgetCell(this);
    },

    /*
     * @Override
     */
    _applyShowHeaders(value) {
      this._list
        .getChildControl("row-layer")
        .setHasHeader(this.__columns !== null && value);
    },

    /*
     * @Override
     */
    createItemRenderer() {
      var createWidget = qx.util.Delegate.getMethod(
        this.getDelegate(),
        "createItem"
      );

      if (createWidget == null) {
        createWidget = function () {
          return new qx.ui.form.ListItem();
        };
      }

      var renderer = new qx.ui.virtual.cell.WidgetCell().set({
        delegate: {
          createWidget: createWidget
        }
      });

      return renderer;
    },

    /*
     * @Override
     */
    createGroupRenderer() {
      var createWidget = qx.util.Delegate.getMethod(
        this.getDelegate(),
        "createGroupItem"
      );

      if (createWidget == null) {
        createWidget = function () {
          var group = new qx.ui.basic.Label();
          group.setAppearance("group-item");

          return group;
        };
      }

      var renderer = new qx.ui.virtual.cell.WidgetCell().set({
        delegate: {
          createWidget: createWidget
        }
      });

      return renderer;
    },

    /*
     * @Override
     */
    styleSelectabled(item) {
      if (this.__columns !== null) {
        let rowLayer = this._list.getChildControl("row-layer");
        rowLayer.setSelected(item.row, true);
      } else {
        var widget = this.__getWidgetFrom(item);
        this._styleSelectabled(widget);
      }
    },

    /*
     * @Override
     */
    styleUnselectabled(item) {
      if (this.__columns !== null) {
        let rowLayer = this._list.getChildControl("row-layer");
        rowLayer.setSelected(item.row, false);
      } else {
        var widget = this.__getWidgetFrom(item);
        this._styleUnselectabled(widget);
      }
    },

    /*
     * @Override
     */
    isSelectable(cell) {
      if (this._list._isGroup(cell.row)) {
        return false;
      }

      return true;
    },

    /*
    ---------------------------------------------------------------------------
      INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * Styles a selected item.
     *
     * @param widget {qx.ui.core.Widget} widget to style.
     */
    _styleSelectabled(widget) {
      this.__updateStates(widget, { selected: 1 });
    },

    /**
     * Styles a not selected item.
     *
     * @param widget {qx.ui.core.Widget} widget to style.
     */
    _styleUnselectabled(widget) {
      this.__updateStates(widget, {});
    },

    /**
     * Calls the delegate <code>onPool</code> method when it is used in the
     * {@link #delegate} property.
     *
     * @param item {qx.ui.core.Widget} Item to modify.
     */
    _onPool(item) {
      var onPool = qx.util.Delegate.getMethod(this.getDelegate(), "onPool");

      if (onPool != null) {
        onPool(item);
      }
    },

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for the created item widget event.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onItemCreated(event) {
      var widget = event.getData();
      this._configureItem(widget);
    },

    /**
     * Event handler for the created item widget event.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onGroupItemCreated(event) {
      var widget = event.getData();
      this._configureGroupItem(widget);
    },

    /**
     * Event handler for the change delegate event.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onChangeDelegate(event) {
      this._itemRenderer.dispose();
      this._itemRenderer = this.createItemRenderer();
      this._itemRenderer.addListener("created", this._onItemCreated, this);
      this._groupRenderer.dispose();
      this._groupRenderer = this.createGroupRenderer();
      this._groupRenderer.addListener(
        "created",
        this._onGroupItemCreated,
        this
      );

      this.removeBindings();
      this._list.getPane().fullUpdate();
    },

    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Helper method to get the widget from the passed row.
     *
     * @param cell {Map} containing `row` and `column`
     * @return {qx.ui.core.Widget|null} The found widget or <code>null</code> when no widget found.
     */
    __getWidgetFrom(cell) {
      return this._list._layer.getRenderedCellWidget(cell.row, cell.column);
    },

    /**
     * Helper method to update the states from a widget.
     *
     * @param widget {qx.ui.core.Widget} widget to set states.
     * @param states {Map} the state to set.
     */
    __updateStates(widget, states) {
      if (widget == null) {
        return;
      }

      this._itemRenderer.updateStates(widget, states);
    }
  },

  destruct() {
    this._itemRenderer.dispose();
    this._groupRenderer.dispose();
    this._itemRenderer = this._groupRenderer = null;
  }
});
