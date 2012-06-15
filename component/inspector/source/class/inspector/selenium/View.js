/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/actions/list-add.png)
#asset(qx/icon/Tango/22/actions/list-remove.png)
#asset(qx/icon/Tango/22/actions/media-playback-start.png)
#asset(qx/icon/Tango/22/actions/media-record.png)
#asset(qx/icon/Tango/22/actions/window-new.png)
#asset(qx/icon/Tango/22/categories/system.png)
************************************************************************ */

/**
 * This class represents the Selenium window view.
 *
 * The Selenium window recreates some of the Selenium IDE Firefox extension's
 * functionality, namely generating locator strings (in this case for qooxdoo
 * widgets instead of regular DOM elements) and running Selenium commands
 * against the inspected application.
 */
qx.Class.define("inspector.selenium.View", {

  extend : inspector.components.AbstractView,

  /**
   * Creates a new instance of a selenium view.
   */
  construct : function()
  {
    this.base(arguments);

    this.__seleniumScripts = [
      "/core/scripts/xmlextras.js",
      "/core/lib/prototype.js",
      "/core/lib/cssQuery/cssQuery-p.js",
      "/core/lib/snapsie.js",
      "/core/scripts/htmlutils.js",
      "/core/scripts/ui-element.js",
      "/core/scripts/selenium-browserdetect.js",
      "/core/scripts/selenium-browserbot.js",
      "/core/scripts/find_matching_child.js",
      "/core/scripts/selenium-api.js",
      "/core/scripts/selenium-commandhandlers.js",
      "/core/scripts/selenium-executionloop.js",
      "/core/scripts/selenium-remoterunner.js",
      "/core/scripts/selenium-logging.js",
      "/core/scripts/selenium-version.js",
      "/core/xpath/util.js",
      "/core/xpath/xmltoken.js",
      "/core/xpath/dom.js",
      "/core/xpath/xpath.js",
      "/core/xpath/javascript-xpath-0.1.11.js"
    ];

    this.__userExt = qx.core.Environment.get("inspector.selenium.extensions");
    if (!this.__userExt) {
      this.__userExt = /(.*?)framework/.exec(qx.util.LibraryManager.getInstance().get("qx", "sourceUri"))[1] + "component/simulator/tool/user-extensions/user-extensions.js";
    }

    this.__availableCommands = [];

    // Toolbar
    var part1 = this.__getToolbarPart1();
    part1.setEnabled(false);
    this._toolbar.add(part1);
    var part2 = this.__getToolbarPart2();
    part2.setEnabled(false);
    this._toolbar.add(part2);
    var part3 = this.__getToolbarPart3();
    part3.setEnabled(false);
    this._toolbar.add(part3);
    this._toolbar.addSpacer();
    this._toolbar.add(this.__getToolbarPart4());

    // Options window
    this._optionsWindow = new inspector.selenium.OptionsWindow("Selenium Options", null, this);

    var pane = new qx.ui.splitpane.Pane("vertical");
    this.add(pane, {flex: 1});

    // Table
    this._table = this.__getTable();
    pane.add(this._table, 2);

    // Log
    var logContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(2, "middle"));
    logContainer.add(this.__getLogControls());
    this._logArea = this.__getLogArea();
    logContainer.add(this._logArea, {flex: 1});
    pane.add(logContainer, 1);
  },

  properties : {

    /**
     * Array containing the URIs of the Selenium Core and qooxdoo user
     * extensions scripts
     */
    seleniumScripts : {
      init : null,
      apply : "_applySeleniumScripts",
      event : "changeSeleniumScripts"
    }

  },

  members : {

    __availableCommands : null,
    __selectedWidget : null,
    __selenium : null,
    __seleniumCommandQueue : null,
    __seleniumScripts : null,
    __userExt : null,
    __seleneseTestCase : null,

    /**
     * Set the currently inspected widget. Add a locator for it if recording
     * mode is active
     *
     * @param widget {qx.ui.core.Widget} The inspected widget
     */
    select : function(widget) {
      if (widget == this.__selectedWidget) {
        return;
      }
      this.__selectedWidget = widget;
      if (this._recordButton.getValue()) {
        this.__addLocator();
      }
    },

    /**
     * Returns the currently inspected widget
     *
     * @return {qx.ui.core.Widget}
     */
    getSelection : function() {
      // get the selected element
      var selectedElement = this.__selectedWidget;
      // return the id if an element is selected
      if (selectedElement != null) {
        return selectedElement.getUserData("instance");
      }
      // return null otherwise
      return null;
    },

    /**
     * Returns a Selenium instance that can be used to run commands against the
     * inspected application.
     *
     * @return {Object} The Selenium instance
     */
    getSelenium : function() {
      if (this.__selenium) {
        return this.__selenium;
      }

      var iframeWindow = qx.core.Init.getApplication().getIframeWindowObject();
      this.__selenium = window.Selenium.createForWindow(iframeWindow);
      this.setLogHook();
      //DEBUGGING ONLY:
      //window.selenium = this.__selenium;
      return this.__selenium;
    },

    /**
     * Creates the toolbar part containing the add and remove buttons
     *
     * @return {qx.ui.toolbar.Part}
     */
    __getToolbarPart1 : function()
    {
      var part1 = new qx.ui.toolbar.Part();

      // create and add the add button
      var addButton = new qx.ui.toolbar.Button(null,
          "icon/22/actions/list-add.png");
      part1.add(addButton);
      addButton.addListener("execute", this.__addLocator, this);
      addButton.setToolTipText("Add locator for inspected widget");

      var removeButton = new qx.ui.toolbar.Button(null,
          "icon/22/actions/list-remove.png");
      part1.add(removeButton);
      removeButton.addListener("execute", this.__removeSelectedRows, this);
      removeButton.setToolTipText("Remove selected command(s)");

      return part1;
    },

    /**
     * Creates the toolbar part containing the speed slider
     *
     * @return {qx.ui.toolbar.Part}
     */
    __getToolbarPart2 : function()
    {
      var part2 = new qx.ui.toolbar.Part();

      this._speedSlider = new qx.ui.form.Slider();
      this._speedSlider.set({
        toolTipText : "Step speed (Selenium command execution delay)",
        minimum : 2,
        maximum : 50,
        singleStep : 1,
        pageStep : 10,
        allowGrowY : false,
        width : 50,
        marginTop : 10,
        marginLeft : 5
      });
      this._speedSlider.setValue(5);
      part2.add(this._speedSlider);

      var speedLabel = new qx.ui.basic.Label("");
      speedLabel.set({
        marginTop : 10,
        marginLeft : 4
      });
      part2.add(speedLabel);
      var options = {
        converter : function(value) { return (value * 100) + " ms"; }
      };
      this._speedSlider.bind("value", speedLabel, "value", options);

      return part2;
    },


    /**
     * Creates the toolbar part containing the run, record
     * and export buttons
     *
     * @return {qx.ui.toolbar.Part}
     */
    __getToolbarPart3 : function()
    {
      var part3 = new qx.ui.toolbar.Part();

      var runCmdButton = new qx.ui.toolbar.Button(null, "icon/22/actions/media-playback-start.png");
      part3.add(runCmdButton)
      runCmdButton.addListener("execute", this.runSeleniumCommands, this);
      runCmdButton.setToolTipText("Run selected command(s)");

      this._recordButton = new qx.ui.toolbar.CheckBox(null,
          "icon/22/actions/media-record.png");
      part3.add(this._recordButton);
      var recOpts = {
        converter : function(data) {
          return data ? "Stop adding commands for inspected widgets" :
          "Automatically add a new command for each inspected widget";
        }
      };
      this._recordButton.bind("value", this._recordButton, "toolTipText", recOpts);

      this._exportButton = new qx.ui.toolbar.CheckBox(null, "icon/22/actions/window-new.png");
      part3.add(this._exportButton);
      this._exportButton.setToolTipText("Import/export Selenese");
      this._exportButton.addListenerOnce("changeValue", function(ev) {
        this.__getSelenese();
      }, this);

      return part3;
    },


    /**
     * Creates the toolbar part containing the options button
     *
     * @return {qx.ui.toolbar.Part}
     */
    __getToolbarPart4 : function()
    {
      var part4 = new qx.ui.toolbar.Part();
      this._optionsButton = new qx.ui.toolbar.Button(null, "icon/22/categories/system.png");
      this._optionsButton.setToolTipText("Options");
      part4.add(this._optionsButton);
      this._optionsButton.addListener("execute", function(ev) {
        if (!this._optionsWindow.isVisible()) {
          this._optionsWindow.open();
        }
      }, this);

      return part4;
    },

    /**
     * Adds an entry to the Selenium commands table consisting of a command
     * (currently always "qxClick") and a locator for the currently inspected
     * widget
     */
    __addLocator : function()
    {
      var rowArr = ["", "", ""];
      if (this.__selectedWidget) {
        var iframeWindow = qx.core.Init.getApplication().getIframeWindowObject();
        var root = iframeWindow.qx.core.Init.getApplication().getRoot();
        // inline application: Determine the correct root widget
        if (root.classname == "qx.ui.root.Page" && !iframeWindow.qx.ui.core.Widget.contains(root, this.__selectedWidget)) {
          var objects = iframeWindow.qx.core.ObjectRegistry.getRegistry();
          for (var key in objects) {
            var object = objects[key];
            if (object.classname == "qx.ui.root.Inline" && iframeWindow.qx.ui.core.Widget.contains(object, this.__selectedWidget)) {
              root = object;
              break;
            }
          }
        }
        var locator = inspector.selenium.SeleniumUtil.getQxhLocator(this.__selectedWidget, root, iframeWindow);
        var command = "qxClick";
        rowArr = [command, locator, "", this.__availableCommands ];
      }
      this._table.getTableModel().addRows([rowArr]);
    },

    /**
     * Remove the selected rows from the Selenium commands table
     */
    __removeSelectedRows : function()
    {
      var tableModel = this._table.getTableModel();
      var selectedRows = [];
      this._table.getSelectionModel().iterateSelection(function(index) {
        selectedRows.push(index);
        this
      }, this);

      for (var i=0,l=selectedRows.length; i<l; i++) {
        var row = selectedRows[i];
        tableModel.removeRows(row - i, 1);
      }
    },

    /**
     * Clears the table model data.
     */
    __clearTableData : function()
    {
      var tableModel = this._table.getTableModel();
      tableModel.setData([]);
    },

    /**
     * Creates the Selenium commands table
     *
     * @return {qx.ui.table.Table} The commands table
     */
    __getTable : function()
    {
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "Command", "Target", "Value" , "commands"]);
      tableModel.setColumnEditable(0, true);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);

      // cell editor factory function
      // returns a cellEditorFactory instance based on data in the row itself
      var cellEditorFactoryFunc = function (cellInfo)
      {
        var table = cellInfo.table;
        var tableModel = table.getTableModel();
        var rowData = tableModel.getRowData(cellInfo.row);
        var commands = rowData[3];
        var cellEditor = new qx.ui.table.celleditor.ComboBox();
        cellEditor.setListData(commands);
        return cellEditor;
      }

      // create a "meta" cell editor object
      var cellEditorFactory = new qx.ui.table.celleditor.Dynamic(cellEditorFactoryFunc);

      var customColumnModel =
      {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };

      var table = new qx.ui.table.Table(tableModel, customColumnModel);
      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);

      var tcm = table.getTableColumnModel();
      tcm.setColumnVisible(3, false);
      tcm.setCellEditorFactory(0, cellEditorFactory);

      var resizeBehavior = tcm.getBehavior();
      resizeBehavior.setWidth(0, "20%");
      resizeBehavior.setWidth(1, "50%");
      resizeBehavior.setWidth(2, "30%");

      return table;
    },


    /**
     * Creates the "clear log" button and Selenium log level select box
     *
     * @return {qx.ui.container.Composite} Container with the log controls
     */
    __getLogControls : function()
    {
      var logLevels = ["debug", "info", "warn", "error"];
      var logContainerInner = new qx.ui.container.Composite(new qx.ui.layout.HBox(10, "right"));
      var logLevelSelect = new qx.ui.form.SelectBox();
      for (var i=0; i<4; i++) {
        var label = qx.lang.String.firstUp(logLevels[i]);
        logLevelSelect.add(new qx.ui.form.ListItem(label, null, logLevels[i]));
      }
      // Selenium's default log level is "info".
      logLevelSelect.setSelection([logLevelSelect.getChildren()[1]]);
      logLevelSelect.addListener("changeSelection", function(ev) {
        if (window.LOG) {
          var level = ev.getData()[0].getModel();
          window.LOG.setLogLevelThreshold(level);
        }
      }, this);
      logContainerInner.add(logLevelSelect);

      var btnClear = new qx.ui.form.Button("Clear");
      btnClear.addListener("execute", function(ev) {
        this._logArea.setHtml("")
      }, this);
      logContainerInner.add(btnClear);

      return logContainerInner;
    },


    /**
     * Creates the log output widget
     *
     * @return {qx.ui.embed.Html} The log widget
     */
    __getLogArea : function()
    {
      var logArea = new qx.ui.embed.Html();
      logArea.set({
        padding: 5,
        cssClass: "seleniumLog",
        overflowY: "auto",
        decorator: "main",
        backgroundColor: "white",
        allowStretchY: true
      });

      // scroll to to the last entry if a message is added
      logArea.addListener("changeHtml", function(ev) {
        // need to use a timer to make sure the HTML is updated
        qx.event.Timer.once(function() {
          var domElem = this.getContentElement().getDomElement();
          var lastChildIndex = domElem.childNodes.length - 1;
          if (lastChildIndex > 0) {
            var lastChild = domElem.childNodes[lastChildIndex];
            qx.bom.element.Scroll.intoViewY(lastChild);
          }
        }, this, 0);
      });

      // add the CSS to style log messages
      var logCss = '.seleniumLog .debug { color: #008000 }';
      logCss +=    '.seleniumLog .info  { color: #000000 }';
      logCss +=    '.seleniumLog .warn  { color: #FFA500 }';
      logCss +=    '.seleniumLog .error { color: #E50000; font-weight: bold }';
      qx.bom.Stylesheet.createElement(logCss);

      return logArea;
    },

    /**
     * Run the selected Selenium commands. If no commands are selected, all
     * commands in the table will be executed
     */
    runSeleniumCommands : function()
    {
      var tableModel = this._table.getTableModel();
      var selectedCount = this._table.getSelectionModel().getSelectedCount();

      if (selectedCount > 0) {
        var rowData = [];
        this._table.getSelectionModel().iterateSelection(function(index) {
          rowData.push(tableModel.getRowData(index));
        });
      } else {
        // no selection, run all commands
        var rowData = [];
        for (var i=0; i<tableModel.getRowCount(); i++) {
          rowData.push(tableModel.getRowData(i));
        }
      }

      if (rowData.length > 0) {
        this.__seleniumCommandQueue = rowData;
        this.__runSeleniumCommand();
      }
    },

    /**
     * Process the Selenium command queue
     */
    __runSeleniumCommand : function()
    {
      if (this.__seleniumCommandQueue.length == 0) {
        return;
      }

      var commandData = this.__seleniumCommandQueue.shift();
      var command = commandData[0];
      var locator = commandData[1];
      var value = commandData[2];
      var selenium = this.getSelenium();
      command = "do" + command.replace(/^.{1}/, command.substr(0,1).toUpperCase());
      try {
        selenium[command](locator, value);
      }
      catch(ex) {
        // Use Selenium's logger
        window.LOG.error(ex.message);
      }

      var stepSpeed = this._speedSlider.getValue() * 100;
      qx.event.Timer.once(this.__runSeleniumCommand, this, stepSpeed);

    },

    /**
     * Creates a SeleneseTestCase instance and sets up the binding between the
     * export button and the window.
     */
    __getSelenese : function()
    {
      var url = qx.core.Init.getApplication().getIframeWindowObject().location.href;
      var iframeWindow = qx.core.Init.getApplication().getIframeWindowObject();
      var iframeEnvironment = iframeWindow.qx.core.Environment;
      var title = iframeEnvironment.get("qx.application");

      this.__seleneseTestCase = new inspector.selenium.SeleneseTestCase(url, title);
      this.__seleneseTestCase.addListenerOnce("appear", function(event) {
        var btnOpts = {
          converter : function(data) {
            return data ? "visible" : "hidden";
          }
        };
        this._exportButton.bind("value", this.__seleneseTestCase, "visibility", btnOpts);

        var winOpts = {
          converter : function(data) {
            return data == "visible";
          }
        };

        this.__seleneseTestCase.bind("visibility", this._exportButton, "value", winOpts);

      }, this);

      this.__seleneseTestCase.addListener("appear", function(ev) {
        this.__seleneseTestCase.reset();
        // add commands to test case
        var model = this._table.getTableModel();
        for (var i=0,l=model.getRowCount(); i<l; i++) {
          var rowData = model.getRowData(i);
          this.__seleneseTestCase.addCommand(rowData.slice(0,3));
        }
        this.__seleneseTestCase.showSelenese();
      }, this);

      this.__seleneseTestCase.addListener("changeSeleneseCommands", this.__importCommands, this);

      this.__seleneseTestCase.open();
    },

    /**
     * Deletes all commands after asking for confirmation.
     *
     * @lint ignoreDeprecated(confirm)
     */
    clearTable : function()
    {
      if (this._table.getTableModel().getRowCount() > 0) {
        var clear = confirm("Delete current test command list?");
        if (clear) {
          this.__clearTableData();
        }
      }

    },

    /**
     * Returns a list of commands supported by the currently used Selenium
     * instance.
     *
     * @return {Array} List of commands (method names)
     */
    getAvailableCommands : function()
    {
      var commands = [];
      var selenium = this.getSelenium();
      for (var prop in selenium) {
        if (typeof selenium[prop] == "function" && prop.indexOf("do") == 0) {
          //convert to names used in Selenium API, e.g. doSomeThing -> someThing
          var command = prop.substr(2);
          command = command.replace(/^.{1}/, command.substr(0,1).toLowerCase())
          commands.push(command);
        }
      }
      commands.sort();
      return commands;
    },

    /**
     * Tells Selenium's Logger to use the logArea widget
     */
    setLogHook : function()
    {
      if (!window.Logger) {
        this.warn("Selenium Logger not ready!");
        return;
      }
      var self = this;
      window.Logger.prototype.logHook = function(logLevel, message)
      {
        if (!message) {
          return;
        }
        var level = logLevel || "info";
        var oldValue = self._logArea.getHtml() || "";
        var newValue = oldValue + '<div class="' + level + '">' + message + '</div><hr/>';
        self._logArea.setHtml(newValue);
      };
    },

    /**
     * Loads the Selenium Core and qooxdoo user extensions scripts
     *
     * @lint ignoreDeprecated(alert)
     * @param value {String[]} Array containing the URIs for the Selenium Core
     * and qooxdoo user extenions scripts
     * @param old {String[]|null} Old value
     */
    _applySeleniumScripts : function(value, old)
    {
      if (value == old) {
        return;
      }

      this._toolbar.getChildren()[0].setEnabled(false);
      this._toolbar.getChildren()[1].setEnabled(false);
      this._toolbar.getChildren()[2].setEnabled(false);

      if (window.Selenium) {
        window.Selenium = null;
      }

      var seleniumCore = value;

      // strip trailing slash
      if (seleniumCore.substr(seleniumCore.length - 1) == "/") {
        seleniumCore = seleniumCore.substr(0, seleniumCore.length - 1);
      }

      var loader = new inspector.selenium.QueuedScriptLoader();
      var oldTitle = document.title; // selenium changes the tile and we have to reset the title.
      loader.addListenerOnce("finished", function(ev) {
        document.title = oldTitle; // reset the title
        if (ev.getData().fail > 0) {
          alert("Couldn't load Selenium Core scripts, make sure the path is correct!");
          return;
        }
        loader.addListenerOnce("finished", this.__scriptsLoaded, this);
        loader.load(this.__userExt);
      }, this);

      var coreQueue = [];
      for (var i=0,l=this.__seleniumScripts.length; i<l; i++) {
        coreQueue.push(seleniumCore + this.__seleniumScripts[i]);
      }
      loader.load(coreQueue);
    },

    /**
     * TODOC
     *
     * @lint ignoreDeprecated(confirm)
     * @param ev {}
     */
    __importCommands : function(ev)
    {
      var rows = ev.getData();
      if (!rows || rows.length == 0) {
        return;
      };

      var tableModel = this._table.getTableModel();
      var tableRowCount = tableModel.getRowCount();
      if (tableRowCount > 0) {
        if (!confirm("Importing will overwrite the current test case. Continue?")) {
          return;
        } else {
          tableModel.removeRows(0, tableRowCount);
        }
      }

      for (var i=0,l=rows.length; i<l; i++) {
        var row = rows[i];
        row.push(this.__availableCommands);
        this._table.getTableModel().addRows([row]);
      }
    },


    /**
     * Called once the script loader is done. Checks if the Selenium scripts
     * were loaded correctly and, if so, enables the toolbar
     *
     * @lint ignoreDeprecated(alert)
     * @param ev {qx.event.type.Data} The script loader's "finished" event
     */
    __scriptsLoaded : function(ev)
    {
      if (!window.Selenium) {
        alert("Selenium instance could not be created!");
        return;
      }

      // make sure a Selenium instance is created. This used to be done
      // automatically but apparently that's no longer the case in recent
      // Selenium-core versions
      if (!window.selenium) {
        window.selenium = window.Selenium.createForWindow(window);
      }

      if ((ev.getData().fail > 0) || !window.Selenium.prototype.qx) {
        alert("Couldn't load qooxdoo Selenium user extensions!");
        return;
      }

      qx.bom.Cookie.set("coreScripts", this.getSeleniumScripts(), 365);
      this._toolbar.getChildren()[0].setEnabled(true);
      this._toolbar.getChildren()[1].setEnabled(true);
      this._toolbar.getChildren()[2].setEnabled(true);
      this.__availableCommands = this.getAvailableCommands();
    }

  },

  destruct : function()
  {
    this.__selenium = null;
    window.selenium = null;
    window.LOG = null;
    this._disposeObjects("_recordButton", "_speedSlider", "_optionsButton", "_optionsWindow", "_table", "_logArea");
  }
});
