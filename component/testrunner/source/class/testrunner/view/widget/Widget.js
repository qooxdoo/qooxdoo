/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/actions/media-playback-start.png)
#asset(qx/icon/Tango/22/actions/media-playback-stop.png)
#asset(qx/icon/Tango/22/actions/view-refresh.png)
#asset(qx/icon/Tango/16/categories/system.png)
#asset(qx/icon/Tango/22/categories/system.png)
#asset(qx/icon/Tango/22/actions/system-run.png)
#asset(qx/icon/Tango/22/status/dialog-information.png)
#asset(qx/icon/Tango/22/status/dialog-warning.png)
#asset(qx/icon/Tango/22/status/dialog-error.png)
#asset(qx/icon/Tango/16/actions/document-properties.png)
#asset(qx/icon/Tango/22/actions/media-seek-forward.png)
#asset(qx/icon/Tango/22/actions/document-open-recent.png)

#asset(testrunner/view/widget/css/testrunner.css)
#asset(testrunner/view/widget/image/*)
************************************************************************ */
/**
 * Widget-based Testrunner view
 */
qx.Class.define("testrunner.view.widget.Widget", {

  extend : testrunner.view.Abstract,

  include : [testrunner.view.MAutoRun],

  construct : function()
  {
    this.__menuItemStore = {};

    this.__app = qx.core.Init.getApplication();

    var mainContainer = new qx.ui.container.Composite();
    mainContainer.setBackgroundColor("light-background");
    var layout = new qx.ui.layout.VBox();

    mainContainer.setLayout(layout);
    this.__app.getRoot().add(mainContainer, {edge : 0});

    // Header
    mainContainer.add(this.__createHeader());

    // Toolbar
    mainContainer.add(this.__createToolbar());

    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.Pane("horizontal");
    mainsplit.setAppearance("app-splitpane");
    mainContainer.add(mainsplit, {flex : 1});

    this.__labelDeco = null;
    try {
      this.__labelDeco = new qx.ui.decoration.Background().set({
        backgroundColor : "white"
      });
    } catch(ex) {}

    var leftPane = this.__createTestList();
    mainsplit.add(leftPane, 0);

    var outerPane = new qx.ui.splitpane.Pane("horizontal");
    outerPane.setDecorator(null);

    mainsplit.add(outerPane, 1);

    var centerPane = this.__createCenterPane();
    outerPane.add(centerPane, 1);

    var rightPane = this.__createAutPane();
    outerPane.add(rightPane, 1);

    qx.ui.core.queue.Manager.flush();

    var statuspane = this.__createStatusBar();
    mainContainer.add(statuspane);

    this._makeCommands();

    this._applyPaneWidths(centerPane, rightPane);

    leftPane.addListener("resize", this.__onPaneResize);
    centerPane.addListener("resize", this.__onPaneResize);
    rightPane.addListener("resize", this.__onPaneResize);
  },

  statics :
  {
    /** Grey icons for items without a result */
    TREEICONS :
    {
      "package" : "testrunner/view/widget/image/package18_grey.gif",
      "class" : "testrunner/view/widget/image/class18_grey.gif",
      "test" : "testrunner/view/widget/image/method_public18_grey.gif"
    },

    /** Green icons for items without failures */
    TREEICONSOK :
    {
      "package" : "testrunner/view/widget/image/package18.gif",
      "class" : "testrunner/view/widget/image/class18.gif",
      "test" : "testrunner/view/widget/image/method_public18.gif"
    },

    /** Red icons for items with failures */
    TREEICONSERROR :
    {
      "package" : "testrunner/view/widget/image/package_warning18.gif",
      "class" : "testrunner/view/widget/image/class_warning18.gif",
      "test" : "testrunner/view/widget/image/method_public_error18.gif"
    }
  },

  properties :
  {
    /** Controls the display of stack trace information for exceptions */
    showStackTrace :
    {
      check : "Boolean",
      event : "changeShowStackTrace"
    },

    /** Running count of failed tests */
    failedTestCount :
    {
      check : "Integer",
      init : 0,
      event : "changeFailedTestCount"
    },

    /** Running count of passed tests */
    successfulTestCount :
    {
      check : "Integer",
      init : 0,
      event : "changeSuccessfulTestCount"
    },

    /** Running count of skipped tests */
    skippedTestCount :
    {
      check : "Integer",
      init : 0,
      event : "changeSkippedTestCount"
    },

    /** Reload the test suite before running the selected tests */
    autoReload :
    {
      check :"Boolean",
      init : false
    },

    /** Log level for the AUT log appender */
    logLevel :
    {
      check : ["debug", "info", "warn", "error"],
      init  : "debug",
      event : "changeLogLevel"
    }
  },

  members :
  {
    /**
     * Creates the application header.
     */

    __app : null,
    __iframe : null,
    __overflowMenu : null,
    __menuItemStore : null,
    __labelDeco : null,
    __testTree : null,
    __runButton : null,
    __stopButton : null,
    __autUriField : null,
    __progressBar : null,
    __testResultView : null,
    __testCountField : null,
    __statusField : null,
    __autoReloadActive : false,
    __loadingContainer : null,
    __stack : null,
    __logView : null,
    __testResults : null,

    /**
     * Returns the iframe element the AUT should be loaded in.
     * @return {Element} Iframe element
     */
    getIframe : function()
    {
      return this.__iframe.getContentElement().getDomElement();
    },

    /**
     * Returns a DIV element that will be used by a
     * {@link qx.log.appender.Element} to display the AUT's log output.
     *
     * @return {Element} DIV element
     */
    getLogAppenderElement : function() {
      return this.__logView.getAppenderElement();
    },

    /**
     * Returns the application header
     *
     * @return {qx.ui.container.Composite} The application header
     * @lint ignoreUndefined(qxc)
     */
    __createHeader : function()
    {
      var layout = new qx.ui.layout.HBox();
      var header = new qx.ui.container.Composite(layout);
      header.setAppearance("app-header");

      var title = new qx.ui.basic.Label("Test Runner");
      var version = new qxc.ui.versionlabel.VersionLabel();
      version.setFont("default");

      header.add(title);
      header.add(new qx.ui.core.Spacer, {flex : 1});
      header.add(version);

      return header;
    },

    /**
     * Returns the tool bar with the main test suite controls
     *
     * @lint ignoreDeprecated(eval)
     * @return {qx.ui.toolbar.ToolBar} The tool bar
     */
    __createToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;

      var part1 = new qx.ui.toolbar.Part();
      toolbar.add(part1);

      this.bind("testSuiteState", part1, "enabled", {converter : function(data) {
        switch(data) {
          case "init":
          case "loading":
            return false;
            break;
          default:
            return true;
            break;
        }
      }});

      // Run button
      var runButton = this.__runButton = new qx.ui.toolbar.Button(this.__app.tr('<b>Run&nbsp;Tests!</b>'), "icon/22/actions/media-playback-start.png");
      runButton.set({
        textColor : "#36a618",
        rich : true,
        visibility : "excluded",
        toolTipText : this.__app.tr("Run selected tests (Ctrl+R)")
      });
      runButton.setUserData("value", "run");

      runButton.addListener("execute", this.__runTests, this);

      part1.add(runButton);

      // Stop button
      var stopButton = this.__stopButton = new qx.ui.toolbar.Button(this.__app.tr('<b>Stop&nbsp;Tests</b>'), "icon/22/actions/media-playback-stop.png");
      stopButton.set({
        textColor : "#ff0000",
        rich : true,
        toolTipText : this.__app.tr("Stop the test suite (Ctrl+S)")
      });
      stopButton.setUserData("value", "stop");

      stopButton.addListener("execute", this.__stopTests, this);

      part1.add(stopButton);

      // Reload button
      var reloadButton = new qx.ui.toolbar.Button(this.__app.tr("Reload"), "icon/22/actions/view-refresh.png");
      part1.add(reloadButton);
      reloadButton.setToolTipText(this.__app.tr("Reload the test suite (Ctrl+Shift+R)"));
      reloadButton.addListener("execute", this.__reloadAut, this);

      this.bind("testSuiteState", reloadButton, "enabled", {converter : function(data) {
        switch(data) {
          case "init":
          case "loading":
          case "running":
            return false;
            break;
          default:
            return true;
        }
      }});


      var autUriField = new qx.ui.form.TextField();
      this.__autUriField = autUriField;
      this.bind("autUri", autUriField, "value");
      autUriField.addListener("keydown", function(ev) {
        if (ev.getKeyIdentifier() == "Enter") {
          this.__reloadAut();
        }
      }, this);

      autUriField.setToolTipText(this.__app.tr("Application under test URL"));
      autUriField.set(
      {
        width : 300,
        alignY : "middle",
        marginLeft : 3
      });

      toolbar.add(autUriField, {flex: 1});

      var part3 = new qx.ui.toolbar.Part();
      toolbar.add(part3);

      var autoReloadToggle = new qx.ui.toolbar.CheckBox(this.__app.tr("Auto Reload"), "icon/22/actions/system-run.png");
      var autoReloadValue = qx.bom.Cookie.get("testrunner.autoReload");
      if (autoReloadValue !== null) {
        autoReloadToggle.setValue(eval(autoReloadValue));
      }
      autoReloadToggle.bind("value", this, "autoReload", {
        converter : function(data)
        {
          qx.bom.Cookie.set("testrunner.autoReload", data.toString(), 365);
          return data
        }
      });
      part3.add(autoReloadToggle);

      if (qx.core.Environment.get("testrunner.performance") &&
        qx.Class.hasMixin(this.constructor, testrunner.view.MPerformance) &&
        window.console && window.console.profile)
      {
        var nativeProfilingToggle = new qx.ui.toolbar.CheckBox(this.__app.tr("Native Profiling"), "icon/22/actions/document-open-recent.png");
        nativeProfilingToggle.setToolTipText("Additionally use the browser's native"
          + " profiling feature (console.profile) for performance tests");
        var nativeProfilingValue = qx.bom.Cookie.get("testrunner.nativeProfiling");
        if (nativeProfilingValue !== null) {
          nativeProfilingToggle.setValue(eval(nativeProfilingValue));
        }
        nativeProfilingToggle.bind("value", this, "nativeProfiling", {
          converter : function(data)
          {
            qx.bom.Cookie.set("testrunner.nativeProfiling", data.toString(), 365);
            return data
          }
        });
        part3.add(nativeProfilingToggle);
      }

      // enable overflow handling
      toolbar.setOverflowHandling(true);

      // add a button for overflow handling
      var chevron = new qx.ui.toolbar.MenuButton(null, "icon/22/actions/media-seek-forward.png");
      chevron.setAppearance("toolbar-button");  // hide the down arrow icon
      toolbar.add(chevron);
      toolbar.setOverflowIndicator(chevron);

      // set priorities for overflow handling
      toolbar.setRemovePriority(part1, 2);
      toolbar.setRemovePriority(part3, 3);
      toolbar.setRemovePriority(autUriField, 1);

      // add the overflow menu
      this.__overflowMenu = new qx.ui.menu.Menu();
      chevron.setMenu(this.__overflowMenu);

      // add the listener
      toolbar.addListener("hideItem", this._onHideItem, this);
      toolbar.addListener("showItem", this._onShowItem, this);

      return toolbar;
    },

    /**
     * Handler for the overflow handling which will be called on hide.
     * @param e {qx.event.type.Data} The event.
     */
    _onHideItem : function(e) {
      var partItem = e.getData();
      var menuItems = this._getMenuItems(partItem);
      for(var i=0,l=menuItems.length;i<l;i++){
        menuItems[i].setVisibility("visible");
      }
    },


    /**
     * Handler for the overflow handling which will be called on show.
     * @param e {qx.event.type.Data} The event.
     */
    _onShowItem : function(e) {
      var partItem = e.getData();
      var menuItems = this._getMenuItems(partItem);
      for(var i=0,l=menuItems.length;i<l;i++){
        menuItems[i].setVisibility("excluded");
      }
    },


    /**
     * Helper for the overflow handling. It is responsible for returning a
     * corresponding menu item for the given toolbar item.
     *
     * @param partItem {qx.ui.core.Widget} The toolbar item to look for.
     * @return {qx.ui.core.Widget} The coresponding menu items.
     */
    _getMenuItems : function(partItem) {
      var cachedItems = [];
      if (partItem instanceof qx.ui.toolbar.Part)
      {
        var partButtons = partItem.getChildren();
        for(var i=0,l=partButtons.length;i<l;i++)
        {
          if(partButtons[i].getVisibility()=='excluded'){
            continue;
          }
          var cachedItem = this.__menuItemStore[partButtons[i].toHashCode()];

          if (!cachedItem)
          {
            if(partButtons[i] instanceof qx.ui.toolbar.Button)
            {
              cachedItem = new qx.ui.menu.Button(
                partButtons[i].getLabel().translate(),
                partButtons[i].getIcon()
                );
              cachedItem.getChildControl('label',false).setRich(true);
              cachedItem.setTextColor(partButtons[i].getTextColor());
              cachedItem.setToolTipText(partButtons[i].getToolTipText());
              partButtons[i].bind("enabled",cachedItem,"enabled");
              cachedItem.setEnabled(partButtons[i].getEnabled());
            }
            else if(partButtons[i] instanceof qx.ui.toolbar.CheckBox)
            {
              cachedItem = new qx.ui.menu.CheckBox(
                partButtons[i].getLabel().translate()
                );
              cachedItem.setIcon(partButtons[i].getIcon());
              cachedItem.setToolTipText(partButtons[i].getToolTipText());
              partButtons[i].bind("value",cachedItem,"value");
              partButtons[i].bind("enabled",cachedItem,"enabled");
              cachedItem.setEnabled(partButtons[i].getEnabled());
              cachedItem.setValue(partButtons[i].getValue());
            }
            else
            {
              cachedItem = new qx.ui.menu.Separator();
            }
            var listeners = qx.event.Registration.getManager(partButtons[i]).getListeners(partButtons[i],'execute');
            if(listeners && listeners.length>0)
            {
              for(var j=0,k=listeners.length;j<k;j++) {
                cachedItem.addListener('execute',qx.lang.Function.bind(listeners[j].handler,listeners[j].context));
              }
            }
            listeners = qx.event.Registration.getManager(partButtons[i]).getListeners(partButtons[i],'changeValue');
            if(listeners && listeners.length>0)
            {
              for(var j=0,k=listeners.length;j<k;j++) {
                cachedItem.addListener('changeValue',qx.lang.Function.bind(listeners[j].handler,listeners[j].context));
              }
            }
            listeners = qx.event.Registration.getManager(partButtons[i]).getListeners(partButtons[i],'click');
            if(listeners && listeners.length>0)
            {
              for(var j=0,k=listeners.length;j<k;j++) {
                cachedItem.addListener('click',qx.lang.Function.bind(listeners[j].handler,listeners[j].context));
              }
            }
            this.__overflowMenu.addAt(cachedItem, 0);
            this.__menuItemStore[partButtons[i].toHashCode()] = cachedItem;
            cachedItems.push(cachedItem);
          }
        }
      }

      return cachedItems;
    },

    /**
     * Returns a container with the list of available tests
     *
     * @return {qx.ui.container.Composite}
     */
    __createTestList : function()
    {
      var layout = new qx.ui.layout.VBox();
      //layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({
        decorator : "main"
      });

      var leftPaneWidth = qx.bom.Cookie.get("testrunner.leftPaneWidth");
      if (leftPaneWidth !== null) {
        container.setWidth(parseInt(leftPaneWidth));
      }
      else {
        container.setWidth(250);
      }

      container.setUserData("pane", "left");

      var caption = new qx.ui.basic.Label(this.__app.tr("Tests")).set({
        font : "bold",
        decorator : this.__labelDeco,
        padding : [8, 3, 7, 10],
        allowGrowX : true,
        allowGrowY : true
      });
      container.add(caption);

      var stack = this.__stack = new qx.ui.container.Stack();

      this.__testTree = new qx.ui.tree.VirtualTree();
      this.__testTree.set({
        labelPath : "name",
        childProperty : "children",
        delegate : {
          bindItem : this.__bindTreeItem
        },
        decorator : "separator-vertical",
        padding: 0
      });

      var selection = new qx.data.Array();
      selection.addListener("change",
        this._onChangeTestSelection, this);

      this.__testTree.setSelection(selection);

      this.setSelectedTests(this.__testTree.getSelection());

      stack.add(this.__testTree);

      var loadingContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      loadingContainer.setDecorator("separator-vertical");
      loadingContainer.setBackgroundColor("white");
      this.__loadingContainer = loadingContainer;
      stack.add(loadingContainer);
      var loadingImg = new qx.ui.basic.Image("testrunner/view/widget/image/loading66.gif");
      loadingContainer.add(loadingImg, {left: "40%", top: "40%"});

      container.add(stack, {flex : 1});

      return container;
    },


    /**
     * Open a selected node
     *
     * @param ev {qx.event.type.Data} Data event containing the selection
     */
    _onChangeTestSelection : function(ev)
    {
      var selected = this.getSelectedTests();
      if (selected.length > 0) {
        var node = selected.getItem(0);
        if (!this.__testTree.isNodeOpen(node)) {
          this.__testTree.openNodeAndParents(node);
        }
        qx.bom.Cookie.set("testrunner.selectedTest", node.getFullName());
      }
    },

    /**
     * Sets the tree icons according to the model item's state and type.
     *
     * @param controller {MWidgetController} The currently used controller.
     * @param node {qx.ui.core.Widget} The created and used node.
     * @param id {Integer} The id for the binding.
     */
    __bindTreeItem : function(controller, node, id) {
      controller.bindProperty("", "model", null, node, id);
      controller.bindProperty("name", "label", null, node, id);
      controller.bindProperty("state", "icon", {
        converter : function(data, model) {
          var state = data;
          var type = model.getType();
          var iconMap;
          switch (state) {
            case "success":
              iconMap = "TREEICONSOK";
              break;
            case "error":
            case "failure":
              iconMap = "TREEICONSERROR"
              break;
            default:
              iconMap = "TREEICONS";
            break;
          }
          return testrunner.view.widget.Widget[iconMap][type];
        }
      }, node, id);
    },

    /**
     * Store pane width in cookie
     *
     * @param e {Event} Event data: The pane
     * @return {void}
     */
    __onPaneResize : function(e)
    {
      var pane = this.getUserData("pane");
      var width = e.getData().width;
      qx.bom.Cookie.set("testrunner." + pane + "PaneWidth", width, 365);
    },

    /**
     * Returns a container with the progress bar and test results view
     *
     * @return {qx.ui.container.Composite} The center pane's content
     */
    __createCenterPane : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var p1 = new qx.ui.container.Composite(layout).set({
        decorator : "main"
      });

      p1.setUserData("pane", "center");

      var inner = new qx.ui.container.Composite(new qx.ui.layout.Dock());
      inner.setBackgroundColor("white");
      p1.add(inner);
      var caption1 = new qx.ui.basic.Label(this.__app.tr("Test Results")).set({
        font : "bold",
        decorator : this.__labelDeco,
        padding : [8, 3, 7, 10],
        allowGrowX : true,
        allowGrowY : true
      });
      inner.add(caption1, {edge: "west"});

      // Stack trace toggle
      var stacktoggle = new qx.ui.form.ToggleButton(this.__app.tr("Show Stack Trace"), "icon/16/actions/document-properties.png");
      inner.add(stacktoggle, {edge: "east"});
      stacktoggle.set({
        toolTipText : this.__app.tr("Show stack trace information for exceptions"),
        value : true,
        margin: [3, 5]
      });
      //stacktoggle.setShow("both");
      stacktoggle.bind("value", this, "showStackTrace");


      p1.add(this.__createProgressBar());

      var uri = qx.util.ResourceManager.getInstance().toUri("testrunner/view/widget/css/testrunner.css");
      qx.bom.Stylesheet.includeFile(uri);
      this.__testResultView = new testrunner.view.widget.TestResultView();
      p1.add(this.__testResultView, {flex : 1});
      this.bind("showStackTrace", this.__testResultView, "showStackTrace");

      return p1;
    },

    /**
     * Returns the rightmost pane containing the AUT iframe and log
     *
     * @return {qx.ui.splitpane.Pane} The configured pane
     */
    __createAutPane : function()
    {
      // Second Page
      var pane2 = new qx.ui.splitpane.Pane("vertical");
      pane2.setDecorator(null);

      pane2.add(this.__createIframeContainer(), 1);
      pane2.add(this.__createLogContainer(), 1);

      pane2.setUserData("pane", "right");

      return pane2;
    },

    /**
     * Returns a container with the AUT iframe widget
     *
     * @return {qx.ui.container.Composite} Iframe container
     */
    __createIframeContainer : function()
    {
      var layout2 = new qx.ui.layout.VBox();

      var pp3 = new qx.ui.container.Composite(layout2).set({
        decorator : "main"
      });

      var caption3 = new qx.ui.basic.Label(this.__app.tr("Application under test")).set({
        font : "bold",
        decorator : this.__labelDeco,
        padding : [8, 3, 7, 10],
        allowGrowX : true,
        allowGrowY : true
      });

      pp3.add(caption3);

      var iframe = new qx.ui.embed.Iframe();
      iframe.setSource(null);
      this.__iframe = iframe;
      pp3.add(iframe, {flex: 1});

      iframe.set({
        width : 50,
        height : 50,
        zIndex : 5,
        decorator : "separator-vertical"
      });

      return pp3;
    },

    /**
     * Returns a container with the AUT log element
     *
     * @lint ignoreUndefined(qxc)
     * @return {log.LogView} The log container
     */
    __createLogContainer : function()
    {
      this.__logView = new qxc.ui.logpane.LogView()
      this.__logView.setShowLogLevel(true);
      this.__logView.bind("logLevel", this, "logLevel");
      return this.__logView;
    },

    /**
     * Returns a container with the progress bar
     *
     * @return {qx.ui.container.Composite} The progressbar container
     */
    __createProgressBar : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox());

      var bar = this.__progressBar = new qx.ui.indicator.ProgressBar(0, 10);
      bar.setMargin(5);
      container.add(bar);

      var labelBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(3));
      labelBox.setPadding(2);
      labelBox.setMarginTop(2);
      labelBox.setMarginLeft(5);
      container.add(labelBox);

      labelBox.add(new qx.ui.basic.Label(this.__app.tr("Queued: ")));
      var queuecnt = new qx.ui.basic.Label("0").set({
        width : 40,
        font: "bold"
      });
      labelBox.add(queuecnt);

      this.bind("testCount", queuecnt, "value", {
        converter : function(data) {
          if (data) {
            return data.toString();
          }
          else {
            return "0";
          }
        }
      });

      labelBox.add(new qx.ui.basic.Label(this.__app.tr("Failed: ")));
      var failcnt = new qx.ui.basic.Label("0").set({
        width : 40,
        font : "bold",
        textColor: "#9D1111"
      });
      labelBox.add(failcnt);

      this.bind("failedTestCount", failcnt, "value", {
        converter : function(data) {
          return data.toString();
        }
      });

      labelBox.add(new qx.ui.basic.Label(this.__app.tr("Succeeded: ")));
      var succcnt = new qx.ui.basic.Label("0").set({
        width : 40,
        font : "bold",
        textColor: "#51A634"
      });
      labelBox.add(succcnt);

      this.bind("successfulTestCount", succcnt, "value", {
        converter : function(data) {
          return data.toString();
        }
      });

      labelBox.add(new qx.ui.basic.Label(this.__app.tr("Skipped: ")));
      var skipcnt = new qx.ui.basic.Label("0").set({
        width : 40,
        font : "bold",
        marginRight: 5,
        textColor: "#888"
      });
      labelBox.add(skipcnt);

      this.bind("skippedTestCount", skipcnt, "value", {
        converter : function(data) {
          return data.toString();
        }
      });

      return container;
    },

    /**
     * Returns a container with the status bar
     *
     * @return {qx.ui.container.Composite} Status bar container
     */
    __createStatusBar : function()
    {
      var layout = new qx.ui.layout.HBox(3);
      var statuspane = new qx.ui.container.Composite(layout);
      statuspane.set({
        margin : [0, 10, 10, 10]
      });

      var l2 = new qx.ui.basic.Label("0").set({
        font : "bold",
        textAlign : "right"
      });
      this.__testCountField = l2;

      statuspane.add(l2);

      statuspane.add(new qx.ui.basic.Label(this.__app.tr("tests selected")).set({
        alignY : "middle"
      }));

      this.getSelectedTests().addListener("change", function(ev) {
        var selectedName = "";
        var count = 0;
        var selectedTests = this.getSelectedTests();
        if (selectedTests !== null && selectedTests.length > 0) {
          count = testrunner.runner.ModelUtil.getItemsByProperty(selectedTests.getItem(0), "type", "test").length;
          selectedName = this.getSelectedTests().getItem(0).getFullName();
        }
        this.__testCountField.setValue(count.toString());
      }, this);

      statuspane.add(new qx.ui.core.Spacer, {flex : 1});

      // System Info
      statuspane.add(new qx.ui.basic.Label(this.__app.tr("System Status: ")).set({
        textAlign : "right"
      }));
      var l3 = new qx.ui.basic.Label("").set({
        textAlign : "right"
      });
      statuspane.add(l3);
      this.__statusField = l3;

      return statuspane;
    },

    /**
     *
     * @param value {String} New suite state value
     * @param old {String} Old suite state value
     * @lint ignoreDeprecated(alert)
     */
    _applyTestSuiteState : function(value, old)
    {
      switch(value)
      {
        case "init":
          this.setStatus("Waiting for tests");
          break;
        case "loading" :
          this.__stack.setSelection([this.__loadingContainer]);
          this.setStatus("Loading tests...");
          this.__testTree.setEnabled(false);
          this.__testTree.resetModel();
          break;
        case "ready" :
          this.__stack.setSelection([this.__testTree]);
          this.setStatus("Test suite ready");
          this.__progressBar.setValue(0);
          this._setActiveButton(this.__runButton);
          this._applyTestCount(this.getTestCount());
          this.__testTree.setEnabled(true);
          // Don't apply the cookie selection if the previous state was
          // "aborted" (user clicked stop, then run)
          if (old === "loading") {
            this.__setSelectionFromCookie();
          }
          // no selection from cookie, select root node
          if (this.getSelectedTests().length === 0) {
            this.__testTree.getSelection().push(this.getTestModel());
          }

          if ((this.getAutoReload() && this.__autoReloadActive)
          || this.getAutoRun())
          {
            this.reset();
            this.fireEvent("runTests");
          }
          break;
        case "running" :
          this.__progressBar.setValue(0);
          var totalTests = testrunner.runner.ModelUtil.getItemsByProperty(this.getSelectedTests().getItem(0), "type", "test");
          this.__progressBar.setMaximum(totalTests.length);
          this.setStatus("Running tests...");
          this._setActiveButton(this.__stopButton);
          this.__testTree.setEnabled(false);
          break;
        case "finished" :
          this.setStatus("Test suite finished.");
          this._setActiveButton(this.__runButton);
          this.__testTree.setEnabled(true);

          if (this.getAutoReload() && this.__autoReloadActive) {
            this.__autoReloadActive = false;
          }
          break;
        case "aborted" :
          this.setStatus("Test run stopped");
          this._setActiveButton(this.__runButton);
          this.__testTree.setEnabled(true);
          break;
        case "error" :
          this.setStatus("Error loading test suite!");
          this.__stack.setSelection([this.__testTree]);
          alert(this._getAutLoadErrorMessage());
      };
    },

    _applyAutUri : function(value, old)
    {
      this.__iframe.setSource(value);
    },

    _applyTestModel : function(value, old)
    {
      if (value && value !== old) {
        var model = qx.data.marshal.Json.createModel(value);
        this.__testTree.setModel(model);
        this.__testTree.openNode(model.getChildren().getItem(0));
        this.__testResultView.clear();
      }

    },

    _applyTestCount : function(value, old)
    {},

    _applyStatus : function(value, old)
    {
      if (value) {
        this.__statusField.setValue(value);
      }
    },


    _onTestChangeState : function(testResultData)
    {
      var state = testResultData.getState();
      var testName = testResultData.getFullName();
      switch (state) {
        case "skip":
          if (!this.__testResults[testName]) {
            this.__testResults[testName] = state;
            this.__progressBar.setValue(this.__progressBar.getValue() + 1);
            this.setSkippedTestCount(this.getSkippedTestCount() + 1);
          }
          break;
        case "error":
        case "failure":
          if (!this.__testResults[testName]) {
            this.__testResults[testName] = state;
            this.__progressBar.setValue(this.__progressBar.getValue() + 1);
            this.setFailedTestCount(this.getFailedTestCount() + 1);
          }
          break;
        case "success":
          if (!this.__testResults[testName]) {
            this.__testResults[testName] = state;
            this.__progressBar.setValue(this.__progressBar.getValue() + 1);
            this.setSuccessfulTestCount(this.getSuccessfulTestCount() + 1);
          }
      }
    },

    /**
     * Toggle the visibility of the run/stop buttons
     *
     * @param button {qx.ui.core.Widget} The button that should be visible
     */
    _setActiveButton : function(button)
    {
      button.setVisibility("visible");
      if (button == this.__runButton) {
        this.__stopButton.setVisibility("excluded");
      }
      else if (button == this.__stopButton) {
        this.__runButton.setVisibility("excluded");
      }
    },


    /**
     * Returns the error message to be displayed if the AUT couldn't be loaded
     * @return {String} error message
     */
    _getAutLoadErrorMessage : function()
    {
      var autDebug;
      try {
        autDebug = this.__iframe.getWindow().qx.core.Environment.get("qx.debug");
      }
      catch(ex) {
        autDebug = false;
      }
      var autSrc = autDebug ? "/html/tests-source.html" : "/html/tests.html";

      return "The test suite couldn't be loaded. Make sure the AUT URI is correct, " +
        'e.g. "' + autSrc + '".' +
        "\n\nAlso check the testclass parameter: This should be \"" +
        qx.core.Init.getApplication().runner._testNameSpace +
        "\" according to the current configuration.";
    },


    /**
     * Run the selected tests
     */
    __runTests : function()
    {
      if (this.getAutoReload()) {
        this.__autoReloadActive = true;
        this.__reloadAut();
        return;
      }

      /*
       * Reverse the selection to trigger a "change" event on the selection
       * which causes the runner to rebuild its queue, allowing the user to
       * run the same selection multiple times.
       * Reversing the selection has no visible effect since it only contains
       * one item.
       */
      this.getSelectedTests().reverse();
      this.reset();
      this.fireEvent("runTests");
    },

    /**
     * Stop a running test suite
     */
    __stopTests : function()
    {
      this.fireEvent("stopTests");
    },

    /**
     * Reload the test suite
     */
    __reloadAut : function()
    {
      this.__stack.setSelection([this.__loadingContainer]);
      this.getSelectedTests().removeAll();
      var src = this.__autUriField.getValue();
      this.resetAutUri();
      this.setAutUri(src);
    },

    __setSelectionFromCookie : function()
    {
      var cookieSelection = qx.bom.Cookie.get("testrunner.selectedTest");
      if (cookieSelection) {
        var found = testrunner.runner.ModelUtil.getItemByFullName(this.getTestModel(), cookieSelection);
        if (found) {
          this.getSelectedTests().removeAll();
          this.getSelectedTests().push(found);
        }
      }
    },

    // overridden
    addTestResult : function(testResultData)
    {
      this.base(arguments, testResultData);
      this.__testResultView.addTestResult(testResultData);
    },

    /**
     * Resets the result counters so that the suite can be run again.
     */
    reset : function()
    {
      this.__testResults = {};
      this.resetFailedTestCount();
      this.resetSuccessfulTestCount();
      this.resetSkippedTestCount();
    },

    /**
     * Create keyboard shortcuts for the main controls.
     */
    _makeCommands : function()
    {
      var runTests = new qx.ui.core.Command("Ctrl+R");
      runTests.addListener("execute", this.__runTests, this);

      var stopTests = new qx.ui.core.Command("Ctrl+S");
      stopTests.addListener("execute", this.__stopTests, this);

      var reloadAut = new qx.ui.core.Command("Ctrl+Shift+R");
      reloadAut.addListener("execute", this.__reloadAut, this);
    },

    /**
     * Applies the cookie width values to the center and right panes
     *
     * @param centerPane {qx.ui.core.Widget} center pane
     * @param rightPane {qx.ui.core.Widget} right pane
     */
    _applyPaneWidths : function(centerPane, rightPane)
    {
      var centerPaneWidth = qx.bom.Cookie.get("testrunner.centerPaneWidth");
      var rightPaneWidth = qx.bom.Cookie.get("testrunner.rightPaneWidth");
      if (centerPaneWidth !== null && rightPaneWidth !== null) {
        var centerWidth = parseInt(centerPaneWidth);
        var rightWidth = parseInt(rightPaneWidth);
        centerPane.setLayoutProperties({ flex : centerWidth });
        rightPane.setLayoutProperties({ flex : rightWidth });
      }
    }
  },

  destruct : function()
  {
    this._disposeObjects(
    "__iframe",
    "__overflowMenu",
    "__labelDeco",
    "__testTree",
    "__runButton",
    "__stopButton",
    "__progressBar",
    "__testResultView",
    "__testCountField",
    "__statusField",
    "__autUriField",
    "__loadingContainer",
    "__stack",
    "__app");

    this._disposeMap("__menuItemStore");
  }
});
