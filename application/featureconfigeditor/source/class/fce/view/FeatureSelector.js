/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/16/actions/edit-find.png)
#asset(qx/icon/Tango/16/actions/window-new.png)
#asset(qx/icon/Tango/16/actions/go-next.png)
#asset(qx/icon/Tango/16/actions/go-previous.png)
#asset(qx/icon/Tango/16/actions/view-restore.png)
************************************************************************ */

/**
 * Visualizes one or more feature sets. Individual features can be added to a
 * list where their values can be edited. The selected features are displayed in
 * JSON-serialized form so they can be copied into an application config file.
 */
qx.Class.define("fce.view.FeatureSelector", {

  extend : qx.ui.container.Composite,

  construct : function()
  {
    var layout = new qx.ui.layout.HBox(20);
    this.base(arguments, layout);
    this.setAppearance("featureselector");

    this.add(this._createTableContainer(), {flex: 1});
    this.add(this._createButtonContainer(), {flex: 0});
    this.add(this._createDisplayContainer(), {flex: 1});

    this.__stash = {};
  },

  properties :
  {
    /**
     * Map of feature sets
     */
    featureData :
    {
      init : {},
      nullable : true,
      apply : "_applyFeatureData"
    },

    /**
     * Data model representing the feature sets. Automatically created from
     * {@link #featureData}
     */
    model :
    {
      apply : "_applyModel"
    },

    /**
     * String to be used as a filter for the table view.
     */
    filter :
    {
      init : "",
      event : "changeFilter"
    }
  },

  statics :
  {
    /**
     * Converts a string into a valid JavaScript identifier (lossy).
     *
     * @param id {String} The identifier to sanitize
     * @return {String} The sanitized identifier
     */
    sanitizeId : function(id)
    {
      if (/^[$A-Za-z_][0-9A-Za-z_]*$/.test(id)) {
        return id;
      }

      id = id.replace(/[^0-9a-z_]/gi, "");

      if (id.length == 0) {
        id = "_" + new Date().getTime();
      }
      return id;
    }
  },

  members :
  {
    __filterTextField : null,
    __importWindow : null,
    __setsMenu : null,
    __setsMenuEntries : null,
    __stash : null,
    __modifiedData : null,


    _createChildControlImpl : function(id, hash)
    {
      var control;
      switch(id) {
        case "table":
          control = new fce.view.Table();
          control.setMinWidth(330);
          this.bind("filter", control, "filter");
          control.addListener("cellDblclick", this.__onTableDoubleClick, this);
          qx.data.SingleValueBinding.bind(control, "sourceProperty", this.getChildControl("list"), "modelValueProperty");
          break;
        case "list":
          control = new fce.view.List();
          control.setMinWidth(330);
          control.setMinHeight(75);
          control.getSelectedItems().addListener("change", this.__onSelectionChange, this);
          break;
        case "jsonField":
          control = new qx.ui.form.TextArea();
          control.setMinWidth(330);
          control.setMinHeight(75);
          control.setReadOnly(true);
      }

      return control;
    },


    /**
     * Returns the table view consisting of the filter text field and the actual
     * table.
     *
     * @return {qx.ui.container.Composite} Table view container
     */
    _createTableContainer : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      var inner = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      container.add(inner);
      var label = new qx.ui.basic.Label("Available Features");
      label.setFont("bigger");
      inner.add(label);
      label.setAlignY("bottom");

      inner.add(new qx.ui.core.Spacer(), {flex: 1});

      /*
      var setsMenu = new qx.ui.menu.Menu();
      this.__setsMenu = setsMenu;
      var selectSetsButton = new qx.ui.form.MenuButton("Toggle Displayed Sets", "icon/16/actions/view-restore.png", setsMenu);
      inner.add(selectSetsButton);
      */

      var importButton = new qx.ui.form.Button("Import Feature Map", "icon/16/actions/window-new.png");
      importButton.addListener("execute", function(ev) {
        this._getImportWindow().open();
      }, this);
      inner.add(importButton);

      var table = this.getChildControl("table");

      container.add(table, {flex: 1});
      container.addBefore(this._createFilterBox(), table);
      return container;
    },


    /**
     * Returns a container with the "add" and "remove" buttons.
     *
     * @return {qx.ui.container.Composite} Button container
     */
    _createButtonContainer : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(20, "middle"));
      var addButton = new qx.ui.form.Button(null, "icon/16/actions/go-next.png");
      addButton.addListener("execute", this.__addItemsToList, this);
      container.add(addButton);
      var removeButton = new qx.ui.form.Button(null, "icon/16/actions/go-previous.png");
      removeButton.addListener("execute", this.__removeItemsFromList, this);
      container.add(removeButton);
      return container;
    },


    /**
     * Returns the list view.
     *
     * @return {qx.ui.container.Composite} List view container
     */
    _createDisplayContainer : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      var selectionLabel = new qx.ui.basic.Label("Selected Features");
      container.add(selectionLabel);
      selectionLabel.setFont("bigger");
      container.add(this.getChildControl("list"), {flex: 1});

      var jsonLabel = new qx.ui.basic.Label("JSON");
      jsonLabel.setFont("bigger");
      container.add(jsonLabel);
      container.add(this.getChildControl("jsonField"), {flex: 1});
      return container;
    },


    /**
     * Returns the filter text box.
     *
     * @return {qx.ui.container.Composite} Filter box container
     */
    _createFilterBox : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      container.setAppearance("textfield");
      var box = this.__filterTextField = new qx.ui.form.TextField();
      box.setLiveUpdate(true);
      box.setAppearance("widget");
      box.setPlaceholder("Filter by feature name (RegEx)");
      container.add(box, {flex: 1});
      var searchIcon = new qx.ui.basic.Image("icon/16/actions/edit-find.png");
      container.add(searchIcon);

      var filterTimer = new qx.event.Timer(500);
      filterTimer.addListener("interval", function(ev) {
        this.setFilter(this.__filterTextField.getValue());
        filterTimer.stop();
      }, this);

      box.addListener("changeValue", function(ev) {
        filterTimer.restart();
      }, this);

      return container;
    },


    /**
     * Creates an Import Window (if necessary) and returns it
     *
     * @return {fce.view.ImportWindow} import window
     */
    _getImportWindow : function()
    {
      if (!this.__importWindow) {
        this.__importWindow = new fce.view.ImportWindow();
        this.__importWindow.center();
        this.__importWindow.addListener("changeFeatureMap", this.__importFeatureSet, this);
      }
      return this.__importWindow;
    },


    /**
     * Adds imported feature set data
     *
     * @param ev {qx.event.type.Data} Event that holds the imported data
     */
    __importFeatureSet : function (ev) {
      var data = ev.getData();
      this._saveModifiedData();
      this.__filterTextField.setValue("");
      this.getChildControl("list").removeAll();
      this.addFeatureSet(data);
      this._restoreModifiedData();
    },


    /**
     * Returns a list of maps. Each map represents one feature and holds all
     * known values
     *
     * @param dataMap {Map} Map of feature data sets
     * @return {Array} Array of feature maps
     */
    _getData : function(dataMap)
    {
      var data = [];
      var uniqueKeys = [];
      var setIds = [];
      for (var setId in dataMap) {
        setIds.push(setId);
        var map = dataMap[setId];
        for (var key in map) {
          if (!qx.lang.Array.contains(uniqueKeys, key)) {
            uniqueKeys.push(key);
          }
        }
      }

      uniqueKeys.sort();

      for (var i=0, l=uniqueKeys.length; i<l;  i++) {
        var keyName = uniqueKeys[i];
        var item = {
          name : keyName,
          distinctValues : 1
        }

        var distinctValues = [];

        for (var setId in dataMap) {
          var setData = dataMap[setId];
          if (setData[keyName] !== undefined) {
            item[setId] = setData[keyName];

            if (distinctValues.length == 0) {
              distinctValues.push(setData[keyName]);
            }
            else {
              var temp = distinctValues.concat();
              for (var x=0, y=temp.length; x<y; x++) {
                if (!fce.Util.valuesEqual(setData[keyName], temp[x])) {
                  if (!qx.lang.Array.contains(temp, setData[keyName])) {
                    distinctValues.push(setData[keyName]);
                  }
                }
              }
            }
          }
        }
        item.distinctValues = distinctValues.length;
        data.push(item);
      }
      return data;
    },


    /**
     * Saves user-modified data so it can be re-applied after the model has changed
     */
    _saveModifiedData : function()
    {
      this.__modifiedData = [];
      var list = this.getChildControl("list");
      var listItems = list.getChildren();
      for (var i=0,l=listItems.length; i<l; i++) {
        var listItem = listItems[i];
        var modelItem = listItem.getModelItem();
        var key = modelItem.getName();
        var valueProp = listItem.getValueProperty();
        var value = modelItem.get(valueProp);
        var entry = {
          key : key,
          value : value,
          valueProp : valueProp
        };
        this.__modifiedData.push(entry);
      }
    },


    /**
     * Restores user modifications to a (new) model
     */
    _restoreModifiedData : function()
    {
      for (var i=0,l=this.__modifiedData.length; i<l; i++) {
        var entry = this.__modifiedData[i];
        var modelItem = this.__getModelItemByPropertyValue("name", entry.key);
        if (modelItem) {
          modelItem.set(entry.valueProp, entry.value);
          this.getChildControl("list").addItemsUnique(new qx.data.Array([modelItem]));
        }
      }
    },


    /**
     * Finds the first item in the model where the given property has the given
     * value
     *
     * @param property {String} Name of the property
     * @param value {var} Value to search for
     * @return {Object|null} Matching model item
     */
    __getModelItemByPropertyValue : function(property, value)
    {
      var model = this.getModel();
      for (var i=0,l=model.length; i<l; i++) {
        var item = model.getItem(i);
        if (item.get(property) === value) {
          return item;
        }
      }
      return null;
    },


    /**
     * Adds a new feature set to the display. Data must be a map with one key
     * that will be used to identify the set. The value must be a map of
     * environment feature name/value pairs.
     *
     * @param featureSet {Map} Feature set to be added
     */
    addFeatureSet : function(featureSet) {
      var data = this.getFeatureData();
      for (var setName in featureSet) {
        var cleanName = fce.view.FeatureSelector.sanitizeId(setName);
        data[cleanName] = featureSet[setName];
      }
      this.setFeatureData(null);
      this.setFeatureData(data);
    },


    // property apply
    _applyFeatureData : function(value, old)
    {
      if (value) {
        var data = this._getData(value);
        this.__serializeNonPrimitiveValues(data);
        var model = qx.data.marshal.Json.createModel(data, true);
        this.setModel(model);
        //this._getSetsMenu(qx.lang.Object.getKeys(value));
      }
    },


    // property apply
    _applyModel : function(value, old)
    {
      if (old) {
        old.removeListener("changeBubble", this.__onSelectionChange, this);
      }
      value.addListener("changeBubble", this.__onSelectionChange, this);
      this.getChildControl("table").setModel(value);
    },


    /**
     * Serialize non-primitive values so they can be displayed and edited
     *
     * @param data {Array} Environment data
     */
    __serializeNonPrimitiveValues : function(data)
    {
      for (var i=0,l=data.length; i<l; i++) {
        var entry = data[i];
        for (var key in entry) {
          var type = typeof entry[key];
          if (!(type == "boolean" || type == "number" || type == "string")) {
            entry[key] = qx.lang.Json.stringify(entry[key]);
          }
        }
      }
    },


    /**
     * Displays the selected data
     */
    __onSelectionChange : function()
    {
      var valueProperty = this.getChildControl("list").getModelValueProperty();
      var data = this.__itemsToMap(this.getChildControl("list").getSelectedItems(),
        valueProperty);
      var json = fce.Util.getFormattedJson(data);
      this.getChildControl("jsonField").setValue(json);
    },


    /**
     * Adds a double-clicked table row's item to the list
     *
     * @param ev {qx.ui.table.pane.CellEvent} cell event
     */
    __onTableDoubleClick : function(ev)
    {
      var table = this.getChildControl("table");
      var tableModel = table.getTableModel();
      var row = ev.getRow();
      var dataColumnIndex = tableModel.getColumnCount() - 1;
      var item = tableModel.getValue(dataColumnIndex, row);
      this.getChildControl("list").addItemsUnique(new qx.data.Array([item]));
    },


    /**
     * Takes a list of objects and returns a map with the values of each object's
     * "name" property as the keys and the values of the given property as values
     *
     * @param items {qx.data.Array} Data array of model items
     * @param valueProperty {String} Name of the model property containing the
     * desired value
     * @return {Map}
     */
    __itemsToMap : function(items, valueProperty)
    {
      var data = {};
      for (var i=0,l=items.length; i<l; i++) {
        var item = items.getItem(i);

        if (!qx.Class.hasProperty(item.constructor, valueProperty)) {
          for (var prop in qx.util.PropertyUtil.getAllProperties(item.constructor)) {
            if (prop !== "name" && prop !== "distinctValues") {
              valueProperty = prop;
              break;
            }
          }
        }
        data[item.getName()] = item.get(valueProperty);
      }
      return data;
    },


    /**
     * Creates a menu with checkbox buttons for the given set ids
     * @param setIds {String[]} List of set IDs (key names of the {@link #featureData}
     *  map).
     */
    _getSetsMenu : function(setIds) {
      if (!this.__setsMenuEntries) {
        this.__setsMenuEntries = [];
      }

      for (var i=0, l=setIds.length; i<l; i++) {
        if (!qx.lang.Array.contains(this.__setsMenuEntries, setIds[i])) {
          var checkBox = new qx.ui.menu.CheckBox(setIds[i]);
          checkBox.setValue(true);
          checkBox.setUserData("set", setIds[i]);
          checkBox.addListener("changeValue", function(ev) {
            var setId = ev.getTarget().getUserData("set");
            var value = ev.getData();
            if (value) {
              this._unstashSet(setId);
            }
            else {
              this._stashSet(setId);
            }
          }, this);
          this.__setsMenu.add(checkBox);
          this.__setsMenuEntries.push(setIds[i]);
        }
      }
    },


    /**
     * Removes a data set from {@link #featureData} and stores it for later use
     *
     * @param setId {String} One of the key names in {@link #featureData}
     */
    _stashSet : function(setId) {
      var data = this.getFeatureData();
      if (data[setId]) {
        this.__stash[setId] = data[setId];
        delete data[setId];
        this.setFeatureData(null);
        this.setFeatureData(data);
      }
    },


    /**
     * Adds a stored data set to {@link #featureData}
     *
     * @param setId {String} One of the key names in {@link #featureData}
     */
    _unstashSet : function(setId) {
      var data = this.getFeatureData();
      if (this.__stash[setId]) {
        data[setId] = this.__stash[setId];
        delete this.__stash[setId];
        this.setFeatureData(null);
        this.setFeatureData(data);
      }
    },


    /**
     * Adds the currently selected model items to the list display
     */
    __addItemsToList : function()
    {
      var selectedItems = this.getChildControl("table").getSelectedItems();
      this.getChildControl("list").addItemsUnique(selectedItems);
    },


    /**
     * Instructs the list to remove its selected items
     */
    __removeItemsFromList : function()
    {
      this.getChildControl("list").removeSelected();
    }

  },


  destruct : function()
  {
    this.getChildControl("list").getSelectedItems().removeListener("change",
      this.__onSelectionChange, this);
    this._disposeObjects("__filterTextField", "__importWindow", "__setsMenu");
  }
});