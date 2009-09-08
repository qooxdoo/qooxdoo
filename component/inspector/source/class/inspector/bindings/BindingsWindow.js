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
qx.Class.define("inspector.bindings.BindingsWindow",
{
  extend : inspector.components.AbstractWindow,


  construct : function()
  {
    this.base(arguments, "Bindings");

    this._reloadButton = new qx.ui.toolbar.Button("Reload");
    this._toolbar.add(this._reloadButton);
    this._reloadButton.addListener("execute", function() {
      this.load();
    }, this);
    this._toolbar.add(new qx.ui.toolbar.Separator());
    // create a label
    this._errorLabel = new qx.ui.basic.Label("");
    this._toolbar.add(this._errorLabel);
    // add the spacer and the filter field
    this._toolbar.addSpacer();
    this._filterTextField = new qx.ui.form.TextField();
    this._filterTextField.setLiveUpdate(true);
    this._filterTextField.setMarginRight(5);
    this._toolbar.add(this._filterTextField);
    this._filterTextField.addListener("changeValue", function(e) {
      this.load(null, e.getData());
    }, this);

    // table
    this._model = new qx.ui.table.model.Simple();
    // necessary to get the table working!
    this._model.setColumns(["Source-Object", "Source-Property", "Tagert-Obect", "Target-Property"]);
    this._table = new qx.ui.table.Table(this._model);
    this._table.setColumnVisibilityButtonVisible(false);
    this.add(this._table, {flex: 1});

    this._table.setColumnWidth(0, 100);
    this._table.setColumnWidth(1, 50);
    this._table.setColumnWidth(2, 100);
    this._table.setColumnWidth(3, 50);

    // TODO focusChange instead of selection change
    this._table.getSelectionModel().addListener("changeSelection", function(e) {
      var row = this._table.getFocusedRow();
      var column = this._table.getFocusedColumn();
      var dataItem = this._table.getTableModel().getData()[row][column];

      // check if its an object
      if (typeof dataItem == "string" && dataItem.charAt(dataItem.length - 1) == "]") {
        var hash = dataItem.substring(dataItem.indexOf("[") + 1, dataItem.length - 1);
        qx.core.Init.getApplication().setWidgetByHash(hash);
      }
    }, this);

    // TODO
    // Selection support for the widgets (Visual line for the bindings)

    // TODO bug für die Table
  },

  members :
  {

    setInitSizeAndPosition: function() {
      var left = qx.bom.Viewport.getWidth() - this.getWidth();
      var height = parseInt((qx.bom.Viewport.getHeight() - 30) / 3);
      this.moveTo(left, 30 + 2 * height);
      this.setHeight(height);
    },


    load: function(window, filter) {
      if (window != undefined) {
        this._iFrameWindow = window;
      }
      if (this._iFrameWindow == null) {
        this._iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      }

      if (this._iFrameWindow.qx.data == undefined) {
        this._errorLabel.setValue("No data binding found!");
        this._errorLabel.setEnabled(true);
        this._toolbar.setEnabled(false);
        return;
      }
      // if a data binding was found, enable the toolbar
      // and reset the error message
      this._toolbar.setEnabled(true);
      this._errorLabel.setValue("");

      // get all bindings
      var bindings = this._iFrameWindow.qx.data.SingleValueBinding.getAllBindings();
      // get the data
      var data = [];
      for (var sourceHash in bindings) {
        for (var i = 0;  i < bindings[sourceHash].length; i++) {
          var currentBinding = bindings[sourceHash][i];
          data.push(
            [
              currentBinding[1].toString(),
              currentBinding[2],
              currentBinding[3].toString(),
              currentBinding[4]
            ]
          );
        }
      }

      // filter the data if necessary
      if (filter) {
        data = this._filterData(data, filter);
      }
      this._model.setData(data);
    },


    _filterData : function(data, filter) {
      // go threw all data elements
      for (var i = data.length - 1; i >= 0; i--) {
        // it its a string, use it for the filtering too
        if (data[i][0].search(filter) == -1 &&
            data[i][1].search(filter) == -1 &&
            data[i][2].search(filter) == -1 &&
            data[i][3].search(filter) == -1) {
          // if the element does not fit, remove it
          data.splice(i, 1);
        }
      }
      return data;
    }

  }
});