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
    
    this.add(this._createTableContainer(), {flex: 0});
    this.add(this._createButtonContainer(), {flex: 0});
    this.add(this._createDisplayContainer(), {flex: 1});
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
  
  members :
  {
    __filterTextField : null,
    __importWindow : null,
    
    _createChildControlImpl : function(id, hash)
    {
      var control;
      switch(id) {
        case "table":
          control = new fce.view.Table();
          control.setMinWidth(440);
          this.bind("filter", control, "filter");
          control.addListener("cellDblclick", this.__onTableDoubleClick, this);
          break;
        case "list":
          control = new fce.view.List();
          control.getSelectedItems().addListener("change", this.__onSelectionChange, this);
          break;
        case "jsonField":
          control = new qx.ui.form.TextArea();
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
      var inner = new qx.ui.container.Composite(new qx.ui.layout.Dock());
      container.add(inner);
      var label = new qx.ui.basic.Label("Available Features");
      label.setFont("bigger");
      inner.add(label, {edge : "west"});
      label.setAlignY("bottom");
      var importButton = new qx.ui.form.Button("Import Feature Map", "icon/16/actions/window-new.png");
      importButton.addListener("execute", function(ev) {
        this._getImportWindow().open();
      }, this);
      inner.add(importButton, {edge : "east"});
      
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
        this.__importWindow.addListener("changeFeatureMap", function (ev) {
          var data = ev.getData();
          this.addFeatureSet(data);
        }, this);
      }
      return this.__importWindow;
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

        var initialValue;
        
        for (var setId in dataMap) {
          var setData = dataMap[setId];
          if (setData[keyName] !== undefined) {
            item[setId] = setData[keyName];
            if (initialValue === undefined) {
              initialValue = setData[keyName];
            }
            else if (initialValue !== setData[keyName]) {
              item.distinctValues++;
            }
          }
        }
        
        data.push(item);
        initialValue = undefined;
      }
      return data;
    },
    
    
    /**
     * Adds a new set to
     * 
     * @param {qx.event.type.Data} {@link fce.view.ImportWindow#featureMap} change 
     * event
     */
    addFeatureSet : function(newData) {
      var data = this.getFeatureData();
      for (var setName in newData) {
        data[setName] = newData[setName];
      }
      this.setFeatureData(null);
      this.setFeatureData(data);
    },
    
    
    // property apply
    _applyFeatureData : function(value, old)
    {
      if (value) {
        var data = this._getData(value);
        var model = qx.data.marshal.Json.createModel(data, true);
        this.setModel(model);
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
     * Displays the selected data 
     */
    __onSelectionChange : function()
    {
      var data = this.__itemsToMap(this.getChildControl("list").getSelectedItems());
      var json = this._getJson(data);
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
     * <pre>name</pre> property as the keys and the values of the <pre>userValue</pre>
     * properties as values
     * 
     * @param items {qx.data.Array} Data array of model items
     * @return {Map}
     */
    __itemsToMap : function(items)
    {
      var data = {};
      for (var i=0,l=items.length; i<l; i++) {
        var item = items.getItem(i);
        data[item.getName()] = item.getDetected();
      }
      return data;
    },
    
    
    /**
     * Stringifies a map and does a little pretty-printing.
     * 
     * @param data {Map} Map to be serialized
     * @return {String} Formatted JSON representation of the data
     */
    _getJson : function(data)
    {
      var json = qx.lang.Json.stringify(data);
      return json.replace(/{/, "{\n  ").replace(/}/, "\n}").replace(/,/g, ",\n  ");
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
    this._disposeObjects("__filterTextField", "__importWindow");
  }
});