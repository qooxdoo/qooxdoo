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
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/actions/view-refresh.png)
************************************************************************ */

/**
 * The view for the objects view. The view shows all registered qooxdoo objects.
 */
qx.Class.define("inspector.objects.View",
{
  extend : inspector.components.AbstractView,

  /**
   * Constructs the view.
   *
   * @param controller {inspector.objects.Controller} The controller for the view.
   */
  construct : function(controller)
  {
    this.base(arguments);

    if (qx.core.Environment.get("qx.debug"))
    {
      qx.core.Assert.assertInterface(
        controller,
        inspector.objects.Controller,
        "Invalid parameter 'controller'."
      );
    }

    this.__controller = controller;
    this.__initialize();
  },

  members :
  {
    /** {qx.ui.toolbar.RadioButton} by Hash button. */
    __hash : null,

    /** {qx.ui.toolbar.RadioButton} by Count button */
    __count : null,

    /** {qx.ui.table.Table} table which shows the registered objects */
    __table : null,

    /** {qx.ui.form.TextField} filter value */
    __filter : null,

    /** {inspector.objects.Controller} controller for the view. */
    __controller : null,

    /**
     * Sets the "by Hash" button active.
     *
     * @param active {Boolean} <code>true</code> when the button should be active,
     *  <code>false</code> otherwise.
     */
    setByHashActive : function(active) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertBoolean(active, "Invalid parameter 'active'.");
      }
      this.__hash.setValue(active);
    },

    /**
     * Sets the "by Count" button active.
     *
     * @param active {Boolean} <code>true</code> when the button should be active,
     *  <code>false</code> otherwise.
     */
    setByCountActive : function(active) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertBoolean(active, "Invalid parameter 'active'.");
      }
      this.__count.setValue(active);
    },

    /**
     * Sets the model for the table.
     *
     * @param model {qx.ui.table.ITableModel} model to show.
     */
    setTableModel : function(model) {
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert.assertInterface(
          model, qx.ui.table.ITableModel, "Invalid parameter 'model'."
        );
      }
      this.__table.setTableModel(model);
      this.__updateTableResizeBehavior();
    },

    /**
     * Sets the selection mode for the table.
     *
     * @param mode {Integer} new selection mode.
     */
    setTableSelectionMode : function(mode) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInteger(mode, "Invalid parameter 'mode'.");
      }
      this.__table.getSelectionModel().setSelectionMode(mode);
    },

    /**
     * Select the passed object in the table.
     *
     * @param object {qx.core.Object} object to select.
     */
    selectObject : function(object) {
      var selectionModel = this.__table.getSelectionModel();
      selectionModel.resetSelection();

      if (object != null && selectionModel.getSelectionMode() !=
          qx.ui.table.selection.Model.NO_SELECTION)
      {
        var data = this.__table.getTableModel().getData();
        for (var i = 0; i < data.length; i++) {
          if (data[i][0] == object.toHashCode()) {
            selectionModel.setSelectionInterval(i, i);
            this.__table.scrollCellVisible(0, i);
            return;
          }
        }
      } else {
        this.__table.scrollCellVisible(0, 0);
      }
    },

    /**
     * Sets the filter for table.
     *
     * @param filter {String} filter value.
     */
    setFilter : function(filter) {
      this.__filter.setValue(filter);
    },

    /**
     * Initialize the view with all there components.
     */
    __initialize : function()
    {
      var toolbar = this._toolbar;

      // Creates the reload button
      var reload = new qx.ui.toolbar.Button(null, "icon/22/actions/view-refresh.png");
      reload.setToolTipText("Reloads the view.");
      reload.addListener("execute", this._onReaload, this);
      toolbar.add(reload);

      // Creates a seperator
      toolbar.addSeparator();

      // Creates the show button for hash
      this.__hash = new qx.ui.toolbar.RadioButton("by Hash");
      this.__hash.setUserData("show", "hash");
      this.__hash.addListener("execute", this._onShowByChanged, this);
      this.__hash.setToolTipText("Show the objects by there hash value.");
      toolbar.add(this.__hash);

      // Creates the show button for count
      this.__count = new qx.ui.toolbar.RadioButton("by Count");
      this.__count.setUserData("show", "count");
      this.__count.addListener("execute", this._onShowByChanged, this);
      this.__count.setToolTipText("Show the objects by there count.");
      toolbar.add(this.__count);

      // Creates Spacer
      toolbar.addSpacer();

      // Creates text field for filter
      this.__filter = new qx.ui.form.TextField().set(
      {
        appearance : "objects-textfield",
        liveUpdate : true,
        placeholder : "Filter...",
        toolTipText : "Enter a case sensitive value to filter the table."
      });
      this.__filter.addListener("changeValue", this._onFilterChanged, this);
      toolbar.add(this.__filter);

      // Creates the table
      var custom =
      {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };

      this.__table = new qx.ui.table.Table(null, custom).set(
      {
        appearance : "objects-table",
        columnVisibilityButtonVisible : false,
        toolTipText : "Select a item to inspect it or sort the table."
      });
      this.__table.getSelectionModel().addListener("changeSelection", this._onModelChangeSelection, this);
      this.__table.getDataRowRenderer().setHighlightFocusRow(false);
      this.add(this.__table, {flex: 1});
    },

    /**
     * Handler for reload button execution.
     *
     * @param event {qx.event.type.Event} execute event.
     */
    _onReaload : function(event) {
      this.__controller.reload();
    },

    /**
     * Handler for show button execution.
     *
     * @param event {qx.event.type.Event} change selection event.
     */
    _onShowByChanged : function(event) {
      var button = event.getTarget();
      var method = button ? button.getUserData("show") : "";

      switch(method) {
        case "hash":
          this.__controller.showByHash();
          break;
        case "count":
          this.__controller.showByCount();
          break;
        default:
          this.error("Method: '" + method + "' doesn't exist.");
          break;
      }
    },

    /**
     * Handler for filter changes, which is typed from the user.
     *
     * @param event {qx.event.type.Data} the new filter value.
     */
    _onFilterChanged : function(event) {
      this.__controller.setFilter(event.getData());
    },

    /**
     * Handler for table selection model.
     *
     * @param event {qx.event.type.Event} the selction changed event.
     */
    _onModelChangeSelection : function(event) {
      var selectionModel = this.__table.getSelectionModel();

      if (selectionModel.isSelectionEmpty()) {
        // This occurs if for e.q. the user reorder the table.
        this.__controller.inspect(null);
        return;
      }

      var selectionIndex = selectionModel.getSelectedRanges()[0].minIndex;
      var data = this.__table.getTableModel().getData()[selectionIndex];

      this.__controller.inspect(data[0]);
    },

    /**
     * Helper method to update the table size.
     */
    __updateTableResizeBehavior : function()
    {
      var resizeBehavior = this.__table.getTableColumnModel().getBehavior();
      resizeBehavior.setWidth(0, "20%");
      resizeBehavior.setMinWidth(0, 50);
      resizeBehavior.setMaxWidth(0, 100);
      resizeBehavior.setWidth(1, "80%");
      resizeBehavior.setMinWidth(1, 300);
    }
  },

  destruct : function()
  {
    this.__controller = null;
    this._disposeObjects("__hash", "__count", "__table");
  }
});
