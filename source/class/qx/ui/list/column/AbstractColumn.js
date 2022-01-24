/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Zenesis Ltd, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (https://githuib.com/johnspackman, john.spackman@zenesis.com)

************************************************************************ */

/**
 * Abstract base for columns; this works with `qx.ui.list.Table`
 * to provide an easy way for columns of specific types to be managed
 */
qx.Class.define("qx.ui.list.column.AbstractColumn", {
  extend: qx.core.Object,
  type: "abstract",

  construct() {
    super();
    this.__pool = [];
    this.__bindData = {};
    this.__cellWidgets = [];
  },

  properties: {
    /** The list */
    list: {
      init: null,
      nullable: true,
      check: "qx.ui.list.List",
      apply: "_applyList"
    },

    /** Index of this column */
    columnIndex: {
      check: "Integer"
    },

    /** Caption for the header */
    caption: {
      init: null,
      check: "String"
    },

    /** Minimum width, can be null */
    minWidth: {
      init: null,
      nullable: true,
      check: "Integer",
      apply: "_applyMinWidth"
    },

    /** Maximum width, can be null */
    maxWidth: {
      init: null,
      nullable: true,
      check: "Integer",
      apply: "_applyMaxWidth"
    },

    /** Flex of the column, this is  */
    flex: {
      init: 0,
      nullable: false,
      check: "Integer",
      apply: "_applyFlex"
    },

    /** Whether the column is editable */
    readOnly: {
      init: false,
      check: "Boolean",
      apply: "_applyReadOnly",
      event: "changeReadOnly"
    }
  },

  events: {
    change: "qx.event.type.Data"
  },

  members: {
    /** @type {qx.ui.core.Widget[]} pool of unused widgets */
    __pool: null,

    /** @type {Map} map of bind data according to widget hash code */
    __bindData: null,

    /** @type {qx.ui.core.Widget} header widget */
    __headerWidget: null,

    /** @type {qx.ui.core.Widget[]} sparse array of cell widgets */
    __cellWidgets: null,

    /**
     * Returns the Model object for a given row
     *
     * @param rowIndex {Integer} zero based index
     * @return {qx.core.Object}
     */
    getModelForRow(rowIndex) {
      let arr = this.getList().getModel();
      if (!arr || arr.getLength() <= rowIndex) return null;
      return arr.getItem(rowIndex);
    },

    /**
     * Returns the widget to use for the header; expected to cache the result
     *
     * @return {qx.ui.core.Widget}
     */
    getHeaderWidget() {
      let widget = this.__headerWidget;
      if (!widget) {
        widget = this.__headerWidget = new qx.ui.container.Composite(
          new qx.ui.layout.VBox()
        ).set({
          appearance: "virtual-list-header-cell"
        });

        widget.add(
          new qx.ui.basic.Label(this.getCaption()).set({
            rich: true,
            wrap: true,
            allowGrowX: true,
            allowGrowY: true
          })
        );
      }
      return widget;
    },

    /**
     * Discards the widget to use for the header
     *
     * @param widget {qx.ui.core.Widget} the widget previous returned by `getHeaderWidget`
     */
    poolHeaderWidget(widget) {
      // Nothing
    },

    /**
     * This method returns the configured cell for the given cell. The return
     * value may be <code>null</code> to indicate that the cell should be empty.
     *
     * @param rowIndex {Integer} The cell's row index.
     * @return {qx.ui.core.LayoutItem} The configured widget for the given cell.
     */
    getCellWidget(rowIndex) {
      let rowModel = this.getModelForRow(rowIndex);
      let widget = this.__cellWidgets[rowIndex];

      let bindData;
      if (widget) {
        bindData = this.__bindData[widget.toHashCode()];
        if (bindData && bindData.rowModel === rowModel) {
          return widget;
        }
        this.poolCellWidget(widget);
        widget = null;
        bindData = null;
      }

      if (!widget) {
        widget = this.__pool.pop() || this._createCellWidget(rowModel);
      }

      bindData = this._bindCellWidget(widget, rowModel) || {};
      bindData.rowModel = rowModel;
      bindData.rowIndex = rowIndex;
      this.__bindData[widget.toHashCode()] = bindData;
      this.__cellWidgets[rowIndex] = widget;

      let list = this.getList();
      let readOnly = false;
      let enabled = true;
      if (list) {
        readOnly = list.getReadOnly();
        enabled = list.getEnabled();
      }
      this._updateEditableImpl(bindData, enabled, readOnly);
      widget.$$createdHere = this.classname;
      return widget;
    },

    /**
     * Release the given cell widget. Either pool or destroy the widget.
     *
     * @param widget {qx.ui.core.LayoutItem} The cell widget to pool.
     */
    poolCellWidget(widget) {
      if (widget.$$createdHere !== this.classname) {
        throw new Error("Unexpected widget in poolCellWidget");
      }

      let bindData = this.__bindData[widget.toHashCode()];
      delete this.__cellWidgets[bindData.rowIndex];

      delete this.__bindData[widget.toHashCode()];
      this._unbindCellWidget(widget, bindData);
      this.__pool.push(widget);
    },

    /**
     * Called when the editability of the widget needs to be updated; @see _updateEditableImpl
     */
    updateEditable() {
      let list = this.getList();
      let readOnly = false;
      let enabled = true;
      if (list) {
        readOnly = list.getReadOnly();
        enabled = list.getEnabled();
      }
      Object.keys(this.__bindData).forEach(hash =>
        this._updateEditableImpl(this.__bindData[hash], enabled, readOnly)
      );
    },

    /**
     * Helper method that binds single selection widgets
     *
     * @param widget {qx.ui.form.ISingleSelection} the widget
     * @param model {qx.core.Object} the model object
     * @param path {String} the path in the model object
     * @param options {Map?} binding options
     * @return {Map?} bind data (needed by _unbindSingleSelection)
     */
    _bindSingleSelection(widget, model, path, options) {
      let firstUp = qx.lang.String.firstUp(path);

      const updateWidget = (value, fireEvent) => {
        if (options && options.converter)
          value = options.converter(value, null, model, widget);
        widget.getModelSelection().replace(value !== undefined ? [value] : []);
        if (fireEvent) this.fireDataEvent("change", value);
      };

      let bindData = {
        model,
        widget,
        modelValueBindId: model.addListener("change" + firstUp, evt =>
          updateWidget(evt.getData(), true)
        ),

        widgetBindId: widget.getModelSelection().addListener("change", evt => {
          let sel = widget.getModelSelection();
          let value = sel.getLength() ? sel.getItem(0) : null;
          if (options && options.onUpdate)
            options.onUpdate(widget, model, value);
          else model["set" + firstUp](value);
        })
      };

      updateWidget(model["get" + firstUp]());
      return bindData;
    },

    /**
     * Helper method that unbinds single selection widgets, reversing _bindSingleSelection
     *
     * @param bindData {Map} the data returned by _bindSingleSelection
     */
    _unbindSingleSelection(bindData) {
      bindData.model.removeListenerById(bindData.modelValueBindId);
      bindData.widget
        .getModelSelection()
        .removeListenerById(bindData.widgetBindId);
    },

    /**
     * Helper method that updated editabiluty for single selection widgets
     *
     * @param bindData {Map} the data returned by _bindSingleSelection
     * @param enabled {Boolean} whether the widgets should be enabled
     * @param readOnly {Boolean} whether the widgets should be readOnly
     */
    _updateEditableSingleSelection(bindData, enabled, readOnly) {
      if (this.isReadOnly()) readOnly = true;
      if (enabled) {
        if (typeof bindData.widget.setReadOnly == "function")
          bindData.widget.set({ enabled: true, readOnly: readOnly });
        else bindData.widget.set({ enabled: !readOnly });
      } else {
        bindData.widget.set({ enabled: false });
      }
    },

    /**
     * Abstract method to create a widget instance
     *
     * @param rowModel {qx.core.Object} model for the row
     * @return {qx.ui.core.Widget?} the widget, or null if the cell should be empty
     */
    _createCellWidget(rowModel) {
      throw new Error(
        "No such implementation for " + this.classname + "._createCellWidget"
      );
    },

    /**
     * Binds a cell widget to a row model
     *
     * @param widget {qx.ui.core.Widget} the widget, provided by `_createCellWidget`
     * @param rowModel {qx.core.Object} model for the row
     * @return {Object?} binding data object which is passed to `_unbindCellWidget`
     */
    _bindCellWidget(widget, rowModel) {
      throw new Error(
        "No such implementation for " + this.classname + "._bindCellWidget"
      );
    },

    /**
     * Unbinds a cell widget to a row model
     *
     * @param widget {qx.ui.core.Widget} the widget, provided by `_createCellWidget`
     * @param bindData {Object} return value from `_bindCellWidget`
     */
    _unbindCellWidget(widget, bindData) {
      throw new Error(
        "No such implementation for " + this.classname + "._unbindCellWidget"
      );
    },

    /**
     * Called to update the editability of a widget
     *
     * @param bindData {Object} return value from `_bindCellWidget`
     * @param enabled {Boolean} whether the widgets should be enabled
     * @param readOnly {Boolean} whether the widgets should be readOnly
     */
    _updateEditableImpl(bindData, enabled, readOnly) {
      throw new Error(
        "No such implementation for " + this.classname + "._updateEditableImpl"
      );
    },

    /**
     * Apply for `list` property
     */
    _applyList(value) {
      if (value) {
        let columnConfig = value.getPane().getColumnConfig();
        let columnIndex = this.getColumnIndex();
        columnConfig.setItemMinSize(columnIndex, this.getMinWidth());
        columnConfig.setItemMaxSize(columnIndex, this.getMaxWidth());
      }
      this.updateEditable();
    },

    /**
     * Apply for `minWidth` property
     */
    _applyMinWidth(value) {
      let list = this.getList();
      if (list)
        list
          .getPane()
          .getColumnConfig()
          .setItemMinSize(this.getColumnIndex(), value);
    },

    /**
     * Apply for `maxWidth` property
     */
    _applyMaxWidth(value) {
      let list = this.getList();
      if (list)
        list
          .getPane()
          .getColumnConfig()
          .setItemMaxSize(this.getColumnIndex(), value);
    },

    /**
     * Apply for `flex` property
     */
    _applyFlex(value) {
      let list = this.getList();
      if (list)
        list
          .getPane()
          .getColumnConfig()
          .setItemFlex(this.getColumnIndex(), value);
    },

    /**
     * Apply for `readOnly` property`
     */
    _applyReadOnly(value) {
      this.updateEditable();
    }
  }
});
