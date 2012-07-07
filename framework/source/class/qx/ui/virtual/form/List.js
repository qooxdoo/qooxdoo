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

************************************************************************ */

/**
 * Experimental virtual list widget.
 *
 * This widget can either use HTML or widget cell renderer.
 *
 * EXPERIMENTAL!
 *
 * @childControl row-layer {qx.ui.virtual.Row} layer for all rows
 * @childControl grid-lines {qx.ui.virtual.layer.GridLines} show the grid lines
 *
 * @deprecated This 'qx.ui.virtual.form.List' is deprecated use 'qx.ui.list.List'
 *   instead. The current 'qx.ui.list.List' doens't support HTML rendering, but
 *   it will have this feature in the future. Due to the missing HTML rendering
 *   feature we suggest only to use deprecated 'qx.ui.virtual.form.List'
 *   implementation when the HTML rendering feature is needed otherwise use
 *   'qx.ui.list.List'.
 */
qx.Class.define("qx.ui.virtual.form.List",
{
  extend : qx.ui.virtual.core.Scroller,


  construct : function()
  {
    this.base(arguments, 0, 1, 20, 100);

    qx.ui.core.queue.Widget.add(this);

    this.getPane().addListener("resize", this._onResize, this);
    this._initSelectionManager();

    this.initRowHeight();
    this.initDelegate();
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "virtual-list"
    },


    /** The number of rows in the list */
    rowCount :
    {
      check : "Integer",
      event : "changeRowCount",
      init : 0,
      apply : "_applyRowCount"
    },

    /** The row height */
    rowHeight :
    {
      check : "Integer",
      event : "changeRowHeight",
      init : 20,
      apply : "_applyRowHeight",
      themeable : true
    },

    /** Whether to display grid lines */
    showGridLines :
    {
      check : "Boolean",
      event : "changeShowGridLines",
      init : false,
      apply : "_applyShowGridLines",
      themeable : true
    },

    /** Whether to use widgets to render the cells. */
    useWidgetCells :
    {
      check : "Boolean",
      init : false,
      apply : "_applyUseWidgetCells",
      themeable : true
    },

    /** The cell renderer to use */
    cellRenderer :
    {
      event : "changeCellRenderer",
      apply : "_applyCellRenderer",
      themeable : true
    },

    /**
     * List delegate to customize the widget. The delegate can implement any
     * subset of the methods defined in the {@link qx.ui.virtual.form.IListDelegate}
     * interface.
     */
    delegate :
    {
      check : "Object",
      event: "changeDelegate",
      init: null,
      nullable: true,
      apply : "_applyDelegate"
    }
  },


  members :
  {
    __defaultCellRenderer : null,
    __manager : null,
    __cellLayer : null,
    __useWidgetCells : null,

    /**
     * Initialize the widget cell layer
     */
    _initWidgetLayer : function()
    {
      var self = this;
      var widgetCellDelegate =
      {
        getCellWidget : function(row, column)
        {
          var data = self._getCellData(row);

          if (!data) {
            return null;
          }

          var states = {};
          if (self.__manager.isItemSelected(row)) {
            states.selected = true;
          }

          var cell = self._getCellRenderer(row);
          var widget = cell.getCellWidget(data, states);
          widget.setUserData("cell.row", row);
          widget.setUserData("cell.renderer", cell);

          return widget;
        },


        poolCellWidget : function(widget)
        {
          var cellRenderer = widget.getUserData("cell.renderer");
          cellRenderer.pool(widget);
        }
      };

      this._showChildControl("row-layer");
      this.__cellLayer = new qx.ui.virtual.layer.WidgetCell(widgetCellDelegate);
      this.getPane().addLayer(this.__cellLayer);

      if (!this.__defaultCellRenderer) {
        this.setCellRenderer(qx.ui.virtual.form.ListItemCell.getInstance());
      }
    },


    /**
     * Initialize the HTML cell layer
     */
    _initHtmlLayer : function()
    {
      var self = this;
      var htmlLayerDelegate =
      {
        getCellProperties : function(row, column)
        {
          var states = {};
          if (self.__manager.isItemSelected(row)) {
            states.selected = true;
          }
          return self._getCellRenderer(row).getCellProperties(
            self._getCellData(row), states
          );
        }
      };

      this._showChildControl("row-layer");
      this.__cellLayer = new qx.ui.virtual.layer.HtmlCell(htmlLayerDelegate);
      this.getPane().addLayer(this.__cellLayer);

      if (!this.__defaultCellRenderer) {
        this.setCellRenderer(new qx.ui.virtual.cell.Cell());
      }
    },


    /**
     * Initialize the selection manager
     */
    _initSelectionManager : function()
    {
      var self = this;
      var selectionDelegate = {
        isItemSelectable : function(item)
        {
          return self._delegate.isRowSelectable ?
            self._delegate.isRowSelectable(item) :
            true;
        },
        styleSelectable : function(item, type, wasAdded)
        {
          if (self.__useWidgetCells) {
            self._styleWidgetSelectable(item, type, wasAdded);
          } else {
            self._styleHtmlSelectable(item, type, wasAdded);
          }
        }
      }

      this.__manager = new qx.ui.virtual.selection.Row(
        this.getPane(), selectionDelegate
      );
      this.__manager.attachMouseEvents(this.getPane());
      this.__manager.attachKeyEvents(this);
    },


    /**
     * Get the selection manager
     *
     * @return {qx.ui.virtual.selection.Row} The selection manager
     */
    getSelectionManager : function() {
      return this.__manager;
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "row-layer" :
          control = new qx.ui.virtual.layer.Row(null, null);
          this.getPane().addLayer(control);
          break;

        case "grid-lines" :
          control = new qx.ui.virtual.layer.GridLines("horizontal");
          this.getPane().addLayer(control);
          break;

      }
      return control || this.base(arguments, id);
    },


    /**
     * Update the displayed list data
     */
    update : function()
    {
      if (this.__cellLayer) {
        this.__cellLayer.updateLayerData();
      }
    },


    // property apply
    _applyRowCount : function(value, old) {
      this.getPane().getRowConfig().setItemCount(value);
    },


    // property apply
    _applyRowHeight : function(value, old) {
      this.getPane().getRowConfig().setDefaultItemSize(value);
    },


    // property apply
    _applyShowGridLines : function(value, old)
    {
      if (value) {
        this._showChildControl("grid-lines");
      } else {
        this._excludeChildControl("grid-lines");
      }
    },


    // property apply
    _applyDelegate : function(value, old) {
      this._delegate = value || {};
    },


    // property apply
    _applyUseWidgetCells : function(value, old)
    {

      if (this.__useWidgetCells !== null)
      {
        throw new Error(
          "The property 'useWidgetCells' cannot be set after the list has " +
          "been rendered."
        );
      }
    },


    // property apply
    _applyCellRenderer : function(value, old)
    {
      this.__defaultCellRenderer = value;
      if (this.__cellLayer) {
        this.__cellLayer.fullUpdate();
      }
    },


    /**
     * Get the cell data of the given row
     *
     * @param row {Integer} the row index
     * @return {var} The data associated with the row. This can be anything
     *   ranging from a simple string to complex domain objects.
     */
    _getCellData : function(row) {
      return this._delegate.getCellData ? this._delegate.getCellData(row) : null;
    },


    /**
     * Get the cell renderer for the given row.
     *
     * @param row {Integer} The row index
     * @return {qx.ui.virtual.cell.IWidgetCell|qx.ui.virtual.cell.ICell} Either
     *   a widget or HTML cell renderer depending on the list's configuration.
     */
    _getCellRenderer : function(row)
    {
      return this._delegate.getCellRenderer ?
        this._delegate.getCellRenderer(row) :
        this.__defaultCellRenderer;
    },


    /**
     * Visualize selection (HTML mode)
     *
     * @param item {var} Item to modify
     * @param type {String} Any of <code>selected</code>, <code>anchor</code>
     *    or <code>lead</code>
     * @param wasAdded {Boolean} Whether the given style should be added or removed.
     */
    _styleHtmlSelectable : function(item, type, wasAdded)
    {
      if (type !== "selected") {
        return;
      }
      var rowLayer = this.getChildControl("row-layer");
      if (wasAdded) {
        rowLayer.setBackground(item, "selected");
      } else {
        rowLayer.setBackground(item, null);
      }
      this.__cellLayer.updateLayerData();
    },


    /**
     * Visualize selection (widget mode)
     *
     * @param item {var} Item to modify
     * @param type {String} Any of <code>selected</code>, <code>anchor</code>
     *    or <code>lead</code>
     * @param wasAdded {Boolean} Whether the given style should be added or removed.
     */
    _styleWidgetSelectable : function(item, type, wasAdded)
    {
      if (type !== "selected") {
        return;
      }

      var widgets = this.__cellLayer.getChildren();
      for (var i=0; i<widgets.length; i++)
      {
        var widget = widgets[i];
        var cellRow = widget.getUserData("cell.row");

        if (item !== cellRow) {
          continue;
        }

        if (this.getPane().isUpdatePending()) {
          continue;
        }

        var cell = this._getCellRenderer(item);

        if (wasAdded) {
          cell.updateStates(widget, {selected: 1});
        } else {
          cell.updateStates(widget, {});
        }
      }
    },


    // overridden
    syncWidget : function(jobs)
    {
      if (this.__useWidgetCells !== null) {
        return;
      }

      this.__useWidgetCells = this.getUseWidgetCells();

      if (this.__useWidgetCells) {
        this._initWidgetLayer();
      } else {
        this._initHtmlLayer();
      }
    },


    /**
     * Resize event handler
     *
     * @param e {qx.event.type.Data} The resizeevent object
     */
    _onResize : function(e) {
      this.getPane().getColumnConfig().setItemSize(0, e.getData().width);
    }
  },


  destruct : function()
  {
    this._delegate = this.__defaultCellRenderer = null;
    this._disposeObjects("__manager", "__cellLayer");
  }
});
