/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/actions/view-refresh.png)
************************************************************************ */

qx.Class.define("inspector.objects.ObjectsWindow",
{
  extend : inspector.components.AbstractWindow,


  construct : function()
  {
    this.base(arguments, "Objects");

    this._reloadButton = new qx.ui.toolbar.Button(null,
        "icon/22/actions/view-refresh.png");
    this._toolbar.add(this._reloadButton);
    this._reloadButton.addListener("execute", function() {
      this.load(null, this._filterTextField.getValue());
    }, this);
    this._toolbar.add(new qx.ui.toolbar.Separator());
    this._toolbar.addSpacer();
    this._filterTextField = new qx.ui.form.TextField();
    this._filterTextField.setPlaceholder("Filter...");
    this._filterTextField.setLiveUpdate(true);
    this._filterTextField.setMarginRight(5);
    this._toolbar.add(this._filterTextField);

    this._filterTextField.addListener("changeValue", function(e) {
      var timer = qx.util.TimerManager.getInstance();
      // check for the old listener
      if (this.__timerId != null) {
        // stop the old one
        timer.stop(this.__timerId);
        this.__timerId = null;
      }
      // start a new listener to update the controller
      this.__timerId = timer.start(function() {
        // reload
        this.load(null, e.getData());
        this.__timerId = null;
        }, 0, this, null, 200);
    }, this);

    // table
    this._model = new qx.ui.table.model.Simple();
    // necessary to get the table working!
    this._model.setColumns(["", ""]);
    this._table = new qx.ui.table.Table(this._model);
    this._table.setDecorator(null);
    this._table.setColumnVisibilityButtonVisible(false);
    this._table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
    this.add(this._table, {flex: 1});
    this._table.getSelectionModel().addListener("changeSelection", this._onChangeSelection, this);

    // remove the highlight bachground of the table
    this._table.getDataRowRenderer().setHighlightFocusRow(false);

    // add the models
    this._modelRadio = new qx.ui.form.RadioGroup();
    this._currentModel = null;
    this._addModel(new inspector.objects.HashModel());
    this._addModel(new inspector.objects.CountModel());
  },

  members :
  {
    __timerId : null,

    _addModel: function(model) {
      // add the button
      var button = new qx.ui.toolbar.RadioButton(model.getName());
      this._toolbar.addAt(button, this._toolbar.getChildren().length - 2);
      // add the button to a radio manager
      this._modelRadio.add(button);
      button.addListener("changeValue", function(e) {
        // only process the currently checked button
        if (!e.getData()) {
          return;
        }
        this._currentModel = model;
        this._model.setColumns(model.getColumns());
        // load the data
        this.load();
        // handle the selection
        if (model.selectionEnabled()) {
          this._table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
          this.select(qx.core.Init.getApplication().getSelectedObject());
        } else {
          this._table.resetSelection();
          this._table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.NO_SELECTION);
        }
        // remove current filter
        this._filterTextField.setValue("");
      }, this);

      // set the first model to default
      if (this._currentModel == null) {
        this._currentModel = model;
        // set the column names
        this._model.setColumns(model.getColumns());
        this._table.setColumnWidth(0, 50);
        this._table.setColumnWidth(1, 230);
      }
    },


    setInitSizeAndPosition: function() {
      var left = qx.bom.Viewport.getWidth() - this.getWidth();
      var height = parseInt((qx.bom.Viewport.getHeight() - 30) / 3);
      this.moveTo(left, 30);
      this.setHeight(height);
    },


    load: function(window, filter) {
      this._iFrameWindow = window || this._iFrameWindow;
      // get the data of the current model
      var data = this._currentModel.getData(this._iFrameWindow);
      // filter the data if necessary
      if (filter) {
        data = this._filterData(data, filter);
      }
      this._table.getTableModel().setData(data);
    },


    select: function(object) {
      // if the current model supports selection
      if (this._currentModel.selectionEnabled()) {
        var selectionModel = this._table.getSelectionModel();
        var data = this._table.getTableModel().getData();
        for (var i = 0; i < data.length; i++) {
          if (data[i][0] == object.toHashCode()) {
            selectionModel.resetSelection();
            selectionModel.setSelectionInterval(i, i);
            // scroll into view
            this._table.scrollCellVisible(0, i);
            return;
          }
        }
      }
    },


    _onChangeSelection: function(e) {
      // check for empty selections, do nothing
      if (this._table.getSelectionModel().isSelectionEmpty()) {
        return;
      }
      if (this._table.getSelectionModel().getSelectedRanges()[0] && this._iFrameWindow) {
        var selectionIndex = this._table.getSelectionModel().getSelectedRanges()[0].minIndex;
        var data = this._table.getTableModel().getData()[selectionIndex];
        var object = this._iFrameWindow.qx.core.ObjectRegistry.fromHashCode(data[0]);
        qx.core.Init.getApplication().select(object, this);
      }
    },


    _filterData : function(data, filter) {
      // go threw all data elements
      for (var i = data.length - 1; i >= 0; i--) {
        // check if the first element in the data is a string
        if (data[i][0] instanceof String) {
          // it its a string, use it for the filtering too
          if (data[i][0].search(filter) == -1 &&
              data[i][1].search(filter) == -1) {
            // if the element does not fit, remove it
            data.splice(i, 1);
          }
        // if the firste element is no string
        } else {
          // just check the second element
          if (data[i][1].search(filter) == -1) {
            data.splice(i, 1);
          }
        }
      }
      return data;
    },


    getSelection : function() {
      var selectionModel = this._table.getSelectionModel();
      var selectedIndex = selectionModel.getSelectedRanges().minIndex;
      if (selectedIndex) {
        var row = this._table.getTableModel().getData()[selectedIndex];
        return qx.core.ObjectRegistry.fromHashCode(row[0]);
      }
      return null;
    }

  },
  
  destruct : function()
  {
    this._currentModel = this._iFrameWindow = null;
    this._disposeObjects("_reloadButton", "_filterTextField", "_model",
      "_table", "_modelRadio");
  }
});
