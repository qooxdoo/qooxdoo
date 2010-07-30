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
 * EXPERIMENTAL!
 *
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

    /** {qx.ui.list.core.WidgetCellProvider} provider for widget cell rendering */
    _widgetCellProvider : null,

    /** {qx.ui.virtual.layer.WidgetCell} widget cell renderer. */
    _layer : null,

    // overridden
    _createChildControlImpl : function(id)
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
     * Returns the model data from the passed row.
     *
     * @param row {Integer} row to get data.
     * @return {var|null} the model data from the row.
     */
    _getDataFromRow : function(row) {
      var data = this.getModel().getItem(row);

      if (data != null) {
        return data;
      } else {
        return null;
      }
    },

    /**
     * Initialized the virtual list.
     */
    _init : function()
    {
      this.addListener("resize", this._onResize, this);
      this.setScrollbarX("off");

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
      this._widgetCellProvider = new qx.ui.list.core.WidgetCellProvider(this);
      this._layer = new qx.ui.virtual.layer.WidgetCell(this._widgetCellProvider);
      this.getPane().addLayer(this._layer);
    },

    // apply method
    _applyModel : function(value, old)
    {
      value.addListener("change", this._onModelChange, this);

      if (old != null) {
        old.removeListener("change", this._onModelChange, this);
      }

      this._widgetCellProvider.removeBindings();
      this.__updateRowCount();
    },

    // apply method
    _applyRowHeight : function(value, old) {
      this.getPane().getRowConfig().setDefaultItemSize(30);
    },

    // apply method
    _applyLabelPath : function(value, old) {
      this._widgetCellProvider.setLabelPath(value);
    },

    // apply method
    _applyIconPath : function(value, old) {
      this._widgetCellProvider.setIconPath(value);
    },

    // apply method
    _applyLabelOptions : function(value, old) {
      this._widgetCellProvider.setLabelOptions(value);
    },

    // apply method
    _applyIconOptions : function(value, old) {
      this._widgetCellProvider.setIconOptions(value);
    },

    // apply method
    _applyDelegate : function(value, old) {
      this._widgetCellProvider.setDelegate(value);
    },

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
      this.__updateRowCount();
    },

    /**
     * Helper method to update the row count.
     */
    __updateRowCount : function()
    {
      this.getPane().getRowConfig().setItemCount(this.getModel().getLength());
      this.getPane().fullUpdate();
    }
  },

  destruct : function()
  {
    this._background.dispose();
    this._widgetCellProvider.dispose();
    this._layer.dispose();
    this._background = null;
    this._widgetCellProvider = null;
    this._layer = null;
  }
});
