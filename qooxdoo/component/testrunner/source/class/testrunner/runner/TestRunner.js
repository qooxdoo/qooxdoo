/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Tango/22/actions/media-playback-start.png)
#asset(qx/icon/Tango/22/actions/media-playback-stop.png)
#asset(qx/icon/Tango/22/actions/view-refresh.png)
#asset(qx/icon/Tango/22/actions/system-run.png)
#asset(qx/icon/Tango/22/actions/document-properties.png)
#asset(qx/icon/Tango/22/categories/system.png)
#asset(qx/icon/Tango/22/status/dialog-information.png)
#asset(qx/icon/Tango/22/status/dialog-warning.png)
#asset(qx/icon/Tango/22/status/dialog-error.png)

#asset(testrunner/image/*)

************************************************************************ */

/**
 * The GUI definition of the qooxdoo unit test runner.
 */
qx.Class.define("testrunner.runner.TestRunner",
{
  extend : qx.ui.container.Composite,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.nameSpace = qx.core.Setting.get("qx.testNameSpace");

    var params = location.search;

    // Determine test to preselect: Use the test namespace as a default
    this.__setCurrentTestArray(this.nameSpace);
    // then check the history
    var history = qx.bom.History.getInstance();
    if (history.getState()) {
      this.__setCurrentTestArray(history.getState());
    }
    // then look for a "testclass" URI parameter
    else if (params.indexOf("testclass=") > 0 ) {
      var uri = params.substr(params.indexOf("testclass=") + 10);
      this.__setCurrentTestArray(uri);
      this.nameSpace = uri;
    }
    // finally check for the cookie
    else {
      var cookieSelection = qx.bom.Cookie.get("selectedTest");
      if (cookieSelection !== null) {
        this.__setCurrentTestArray(cookieSelection);
      }
    }

    var layout = new qx.ui.layout.VBox().set({
      separator :"separator-vertical"
    });

    this.setLayout(layout);

    // Dependencies to loggers
    qx.log.appender.Console;

    this.widgets = {};
    this.tests = {};

    // Header
    this.add(this.__createHeader());

    // Toolbar
    this.toolbar = this.__makeToolbar();
    this.add(this.toolbar);

    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.Pane("horizontal");
    this.add(mainsplit, {flex : 1});
    this.mainsplit = mainsplit;

    var deco = new qx.ui.decoration.Background().set({
      backgroundColor : "background-medium"
    });

    this.__labelDeco = deco;

    // Left -- is done when iframe is loaded
    var left = this.__makeLeft();

    var leftPaneWidth = qx.bom.Cookie.get("leftPaneWidth");
    if (leftPaneWidth !== null) {
      left.setWidth(parseInt(leftPaneWidth));
    }
    else {
      left.setWidth(250);
    }

    left.setUserData("pane", "left");
    left.addListener("resize", this.__onPaneResize);

    this.left = left;
    this.mainsplit.add(left, 0);


    // Right
    var right = new qx.ui.container.Composite(new qx.ui.layout.VBox);
    mainsplit.add(right, 1);

    // progress bar
    this.__progress = this.__makeProgress();

    // output views
    var buttview = this.__makeOutputViews();
    right.add(buttview, {flex : 1});

    // Log Appender
    this.debug("This should go to the dedicated log window ...");

    // status
    var statuspane = this.__makeStatus();
    this.widgets["statuspane"] = statuspane;
    this.add(statuspane);
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    succCnt :
    {
      check : "Integer",
      init  : 0,
      apply : "_applySuccCnt"
    },

    failCnt :
    {
      check : "Integer",
      init  : 0,
      apply : "_applyFailCnt"
    },

    queCnt :
    {
      check : "Integer",
      init  : 0,
      apply : "_applyQueCnt"
    },

    stopped :
    {
      check : "Boolean",
      init  : false
    },

    logLevel :
    {
      check : ["debug", "info", "warn", "error"],
      init  : "debug",
      event : "changeLogLevel",
      apply : "_applyLogLevel"
    },

    currentTest :
    {
      check : "Array",
      init : null
    }
  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    TREEICONS :
    {
      "package" : "testrunner/image/package18_grey.gif",
      "class" : "testrunner/image/class18_grey.gif",
      "test" : "testrunner/image/method_public18_grey.gif"
    },

    TREEICONSOK :
    {
      "package" : "testrunner/image/package18.gif",
      "class" : "testrunner/image/class18.gif",
      "test" : "testrunner/image/method_public18.gif"
    },

    TREEICONSERROR :
    {
      "package" : "testrunner/image/package_warning18.gif",
      "class" : "testrunner/image/class_warning18.gif",
      "test" : "testrunner/image/method_public_error18.gif"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * URL of the test application, with 'testclass' parameter (test namespace).
     */
    __testSuiteUrl : null,

    /**
     * Amount of attempts made to load the test application. Used to enforce
     * a limit in order to avoid an endless loop if the test app is invalid.
     */
    __loadAttempts : null,

    /**
     * Timer used for repeated attempts to load the test application.
     */
    __loadTimer : null,

    /**
     * Background for pane labels.
     */
    __labelDeco : null,

    /**
     * Progress bar instance.
     */
    __progress : null,

    /** This one is called by Application.js
     */
    load : function() {
      this.iframe.setSource(this.__testSuiteUrl);
    },


    // ------------------------------------------------------------------------
    //   CONSTRUCTOR HELPERS
    // ------------------------------------------------------------------------

    /**
     * TODOC
     *
     */
    __setCurrentTestArray : function(testName)
    {
      if (testName.indexOf("?") > 0) {
        testName = testName.substr(0,testName.indexOf("?"));
      }
      var testNameArray = testName.split(".");
      if (testNameArray.length > 0) {
        this.setCurrentTest(testNameArray);
      }
    },

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;

      var part1 = new qx.ui.toolbar.Part();
      toolbar.add(part1);

      // -- run button
      this.runbutton = new qx.ui.toolbar.Button(this.tr('<b>Run&nbsp;Tests!</b>'), "icon/22/actions/media-playback-start.png");
      this.runbutton.setTextColor("#36a618");
      this.runbutton.setRich(true);
      part1.add(this.runbutton);

      this.stopbutton = new qx.ui.toolbar.Button(this.tr('<b>Stop&nbsp;Tests</b>'), "icon/22/actions/media-playback-stop.png");
      this.stopbutton.setTextColor("#ff0000");
      this.stopbutton.setRich(true);
      this.stopbutton.setVisibility("excluded");
      part1.add(this.stopbutton);

      // -- reload button
      this.reloadbutton = new qx.ui.toolbar.Button(this.tr("Reload"), "icon/22/actions/view-refresh.png");
      part1.add(this.reloadbutton);
      this.reloadbutton.setToolTipText(this.tr("Reload application under test"));
      this.reloadbutton.addListener("execute", this.reloadTestSuite, this);

      this.widgets["toolbar.runbutton"] = this.runbutton;
      this.runbutton.addListener("execute", this.runTest, this);
      this.runbutton.setToolTipText(this.tr("Run selected test(s)"));

      this.widgets["toolbar.stopbutton"] = this.stopbutton;
      this.stopbutton.addListener("execute", function(e) {
        this.setStopped(true);
        this.runbutton.setVisibility("visible");
        this.stopbutton.setVisibility("excluded");
      }, this);
      this.stopbutton.setToolTipText(this.tr("Stop running tests"));

      var testUri   = qx.core.Setting.get("qx.testPageUri");
      this.__testSuiteUrl = testUri+"?testclass="+this.nameSpace;
      this.testSuiteUrl = new qx.ui.form.TextField(this.__testSuiteUrl);

      var part2 = new qx.ui.toolbar.Part();
      toolbar.add(part2);

      part2.add(this.testSuiteUrl);
      this.testSuiteUrl.setToolTipText(this.tr("Application under test URL"));

      this.testSuiteUrl.set(
      {
        width : 300,
        alignY : "middle",
        marginLeft : 3
      });

      this.testSuiteUrl.addListener("keydown", function(e)
      {
        if (e.getKeyIdentifier() == "Enter") {
          this.reloadTestSuite();
        }
      },
      this);

      toolbar.addSpacer();

      // -- reload switch
      var part3 = new qx.ui.toolbar.Part();
      toolbar.add(part3);
      this.reloadswitch = new qx.ui.toolbar.CheckBox(this.tr("Auto Reload"), "icon/22/actions/system-run.png");
      part3.add(this.reloadswitch);
      this.reloadswitch.setShow("both");
      this.reloadswitch.setToolTipText(this.tr("Always reload application under test before testing"));

      // -- log level menu
      this.levelbox = this.__createLogLevelMenu();

      part3.add(this.levelbox);

      // -- stack trace toggle
      this.stacktoggle = new qx.ui.toolbar.CheckBox(this.tr("Show Stack Trace"), "icon/22/actions/document-properties.png");
      part3.add(this.stacktoggle);
      this.stacktoggle.setShow("both");
      this.stacktoggle.setToolTipText(this.tr("Show stack trace information for exceptions"));
      this.stacktoggle.setValue(true);
      this.stacktoggle.addListener("click",function(e) {
        this.f1.setShowStackTrace(this.stacktoggle.getValue());
      }, this);

      return toolbar;
    },  // makeToolbar

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __createLogLevelMenu : function()
    {
      var logLevelData = {
        debug :
        {
          label : "Debug",
          icon : "icon/22/categories/system.png"
        },
        info :
        {
          label : "Information",
          icon : "icon/22/status/dialog-information.png"
        },
        warn :
        {
          label : "Warning",
          icon : "icon/22/status/dialog-warning.png"
        },
        error :
        {
          label : "Error",
          icon : "icon/22/status/dialog-error.png"
        }
      };

      var levelbox = new qx.ui.toolbar.MenuButton(this.tr("Log Level"), "icon/22/categories/system.png");
      var levelMenu = new qx.ui.menu.Menu();
      levelbox.setMenu(levelMenu);

      var debugButton = new qx.ui.menu.Button(logLevelData.debug.label, logLevelData.debug.icon);
      debugButton.setFont("bold");
      debugButton.addListener("execute", function(e){
        this.setLogLevel("debug");
      }, this);
      levelMenu.add(debugButton);

      var infoButton = new qx.ui.menu.Button(logLevelData.info.label, logLevelData.info.icon);
      infoButton.addListener("execute", function(e){
        this.setLogLevel("info");
      }, this);
      levelMenu.add(infoButton);

      var warnButton = new qx.ui.menu.Button(logLevelData.warn.label, logLevelData.warn.icon);
      warnButton.addListener("execute", function(e){
        this.setLogLevel("warn");
      }, this);
      levelMenu.add(warnButton);

      var errorButton = new qx.ui.menu.Button(logLevelData.error.label, logLevelData.error.icon);
      errorButton.addListener("execute", function(e){
        this.setLogLevel("error");
      }, this);
      levelMenu.add(errorButton);

      var logLevelIconConverter = function(data) {
        return logLevelData[data].icon;
      }

      var logLevelController = new qx.data.controller.Object(this);
      logLevelController.addTarget(levelbox, "icon", "logLevel", false, {converter: logLevelIconConverter});

      return levelbox;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeOutputViews : function()
    {
      // Main Container
      var pane = new qx.ui.splitpane.Pane("horizontal");
      pane.setDecorator(null);
      this.widgets["tabview"] = pane;


      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      // First Page
      var p1 = new qx.ui.container.Composite(layout).set({
        decorator : "main"
      });
      pane.add(p1, 0);

      var centerPaneWidth = qx.bom.Cookie.get("centerPaneWidth");
      if (centerPaneWidth !== null) {
        p1.setWidth(parseInt(centerPaneWidth));
      }
      else {
        p1.setWidth(400);
      }

      p1.setUserData("pane", "center");
      p1.addListener("resize", this.__onPaneResize);

      var caption1 = new qx.ui.basic.Label(this.tr("Test Results")).set({
        font : "bold",
        decorator : this.__labelDeco,
        padding : 5,
        allowGrowX : true,
        allowGrowY : true
      });
      p1.add(caption1);

      var f1 = new testrunner.runner.TestResultView();
      this.f1 = f1;
      p1.add(this.__progress);
      p1.add(f1, {flex : 1});


      // Second Page
      var pane2 = new qx.ui.splitpane.Pane("vertical");
      pane2.setDecorator(null);
      pane.add(pane2, 1);


      var layout2 = new qx.ui.layout.VBox();
      layout2.setSeparator("separator-vertical");

      // Last but not least: IFrame for test runs
      var pp3 = new qx.ui.container.Composite(layout2).set({
        decorator : "main"
      });
      pane2.add(pp3, 1);

      var caption3 = new qx.ui.basic.Label(this.tr("Application under test")).set({
        font : "bold",
        decorator : this.__labelDeco,
        padding : 5,
        allowGrowX : true,
        allowGrowY : true
      });
      pp3.add(caption3);

      var iframe = new qx.ui.embed.Iframe();
      iframe.setSource(null);
      this.iframe = iframe;
      pp3.add(iframe, {flex: 1});

      iframe.set({
        width : 50,
        height : 50,
        zIndex : 5,
        decorator : null
      });

      // Get the TestLoader from the Iframe (in the event handler)
      iframe.addListener("load", this.__ehIframeOnLoad, this);



      var layout3 = new qx.ui.layout.VBox();
      layout3.setSeparator("separator-vertical");


      // log frame
      var pp2 = new qx.ui.container.Composite(layout3).set({
        decorator : "main"
      });
      pane2.add(pp2, 1);

      var caption2 = new qx.ui.basic.Label("Log").set({
        font : "bold",
        decorator : this.__labelDeco,
        padding : [4, 3],
        allowGrowX : true,
        allowGrowY : true
      });
      pp2.add(caption2);

      // main output area
      this.f2 = new qx.ui.embed.Html('');
      this.f2.set({
        backgroundColor : "white",
        overflowY : "scroll"
      });
      pp2.add(this.f2, {flex: 1});
      this.f2.getContentElement().setAttribute("id", "sessionlog");

      // log appender
      this.logappender = new qx.log.appender.Element();

      qx.log.Logger.unregister(this.logappender);

      // Directly create DOM element to use
      this.logelem = document.createElement("DIV");
      this.logappender.setElement(this.logelem);

      this.f2.addListenerOnce("appear", function(){
        this.f2.getContentElement().getDomElement().appendChild(this.logelem);
      }, this);


      return pane;
    },  // makeOutputViews

    // -------------------------------------------------------------------------
    /**
     * Tree View in Left Pane
     * - only make root node; rest will befilled when iframe has loaded (with
     *   leftReloadTree)
     *
     * @return {var} TODOC
     */
    __makeLeft : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({
        decorator : "main"
      });

      var caption = new qx.ui.basic.Label(this.tr("Tests")).set({
        font : "bold",
        decorator : this.__labelDeco,
        padding : 5,
        allowGrowX : true,
        allowGrowY : true
      });
      container.add(caption)

      var tree = new qx.ui.tree.Tree(this.tr("Tests"));
      tree.set({
        decorator : null,
        selectionMode : "single"
      });

      this.tree = tree;
      this.widgets["treeview.full"] = tree;

      tree.addListener("changeSelection", this.treeGetSelection, this);

      // fake unique tree for selection (better to have a selection on the model)
      this.tree = {};
      var that = this;

      this.tree.getSelectedElement = function() {
        return that.widgets["treeview.full"].getSelection()[0];
      };

      container.add(tree, {flex : 1});
      return container;
    },  // makeLeft

    // -------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeProgress : function()
    {
      var layout = new qx.ui.layout.VBox();
      var progress = new qx.ui.container.Composite(layout);
      progress.setMarginLeft(10)


      var labelBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      labelBox.setPadding(2);
      labelBox.setMarginTop(2)

      var progressb = new testrunner.runner.ProgressBar();
      progress.add(progressb);
      progress.add(labelBox);

      progressb.set({
        barColor : "#ffffff",
        margin : 5
      });

      this.widgets["progresspane"] = progress;
      this.widgets["progresspane.progressbar"] = progressb;

      labelBox.add(new qx.ui.basic.Label(this.tr("Queued: ")).set({
        alignY : "middle"
      }));
      var queuecnt = new qx.ui.form.TextField("0").set({
        width : 40,
        font : "small",
        readOnly : true,
        textAlign : "right"
      });
      labelBox.add(queuecnt);



      labelBox.add(new qx.ui.basic.Label(this.tr("Failed: ")).set({
        alignY : "middle"
      }));
      var failcnt = new qx.ui.form.TextField("0").set({
        width : 40,
        font : "small",
        readOnly : true,
        textAlign : "right"
      });
      labelBox.add(failcnt);

      labelBox.add(new qx.ui.basic.Label(this.tr("Succeeded: ")).set({
        alignY : "middle"
      }));
      var succcnt = new qx.ui.form.TextField("0").set({
        width : 40,
        font : "small",
        readOnly : true,
        textAlign : "right"
      });

      labelBox.add(succcnt);
      this.widgets["progresspane.succ_cnt"] = succcnt;
      this.widgets["progresspane.fail_cnt"] = failcnt;
      this.widgets["progresspane.queue_cnt"] = queuecnt;

      return progress;
    },  // makeProgress


    /**
     * Creates the application header.
     */
    __createHeader : function()
    {
      var layout = new qx.ui.layout.HBox();
      var header = new qx.ui.container.Composite(layout);
      header.setAppearance("app-header");

      var title = new qx.ui.basic.Label("Test Runner");
      var version = new qx.ui.basic.Label("qooxdoo " + qx.core.Setting.get("qx.version"));

      header.add(title);
      header.add(new qx.ui.core.Spacer, {flex : 1});
      header.add(version);

      return header;
    },


    // -------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeStatus : function()
    {
      var layout = new qx.ui.layout.HBox(10);
      var statuspane = new qx.ui.container.Composite(layout);
      statuspane.set({
        margin : 4
      });

      // Test Info
      statuspane.add(new qx.ui.basic.Label(this.tr("Selected Test: ")).set({
        alignY : "middle"
      }));
      var l1 = new qx.ui.form.TextField("").set({
        width : 150,
        font : "small",
        readOnly : true
      });
      statuspane.add(l1);


      this.widgets["statuspane.current"] = l1;
      statuspane.add(new qx.ui.basic.Label(this.tr("Number of Tests: ")).set({
        alignY : "middle"
      }));
      var l2 = new qx.ui.form.TextField("").set({
        width : 40,
        font : "small",
        readOnly : true,
        textAlign : "right"
      });

      statuspane.add(l2);
      this.widgets["statuspane.number"] = l2;

      // System Info
      statuspane.add(new qx.ui.basic.Label(this.tr("System Status: ")).set({
        alignY : "middle"
      }));
      var l3 = new qx.ui.basic.Label("").set({
        alignY : "middle"
      });
      statuspane.add(l3);
      l3.set({ width : 150 });
      this.widgets["statuspane.systeminfo"] = l3;
      this.widgets["statuspane.systeminfo"].setValue(this.tr("Loading..."));
      this.widgets["toolbar.runbutton"].setEnabled(false);
      this.toolbar.setEnabled(false);

      return statuspane;
    },  // makeStatus

    // ------------------------------------------------------------------------
    //   EVENT HANDLER
    // ------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    treeGetSelection : function(e)
    {

      var treeNode = this.tree.getSelectedElement();
      var modelNode = treeNode.getUserData("modelLink");

      this.tests.selected = this.tests.handler.getFullName(modelNode);

      // update status pane
      this.widgets["statuspane.current"].setValue(this.tests.selected);
      this.tests.selected_cnt = this.tests.handler.testCount(modelNode);
      this.widgets["statuspane.number"].setValue(this.tests.selected_cnt + "");

      // update toolbar
      this.widgets["toolbar.runbutton"].resetEnabled();

      // update selection in other tree
      // -- not working!

      this.widgets["statuspane.systeminfo"].setValue(this.tr("Tests selected"));

      if (parseInt(this.widgets["progresspane.succ_cnt"].getValue()) > 0 ||
          parseInt(this.widgets["progresspane.fail_cnt"].getValue()) > 0) {
        this.__scrollToResult();
      }

      // store selected test in cookie
      qx.bom.Cookie.set("selectedTest", this.tests.selected);
    },  // treeGetSelection

    // -------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    leftReloadTree : function(e)
    {  // use tree struct

      /**
       * create widget tree from model
       *
       * @param widgetR {qx.ui.tree.TreeFolder}    [In/Out]
       *        widget root under which the widget tree will be built
       * @param modelR  {testrunner.runner.Tree} [In]
       *        model root for the tree from which the widgets representation
       *        will be built
       */
      function buildSubTree(widgetR, modelR, level)
      {
        var children = modelR.getChildren();
        var t;

        var children = qx.lang.Array.clone(children);

        for (var i=0; i<children.length; i++)
        {
          var currNode = children[i];
          var firstChar = currNode.label.charAt(0);

          if (firstChar.toUpperCase() === firstChar) {
            currNode.__type = 2;
          } else if (currNode.hasChildren()) {
            currNode.__type = 4;
          } else {
            currNode.__type = 1;
          }
        }

        children.sort(function(a, b)
        {
          if (a.__type != b.__type) {
            return b.__type - a.__type;
          }

          return a.label > b.label ? 1 : -1;
        });

        for (var i=0; i<children.length; i++)
        {
          var currNode = children[i];
          var firstChar = currNode.label.charAt(0);

          var ns = testrunner.runner.TestRunner.TREEICONS;

          if (qx.bom.client.Engine.MSHTML) {
            var ns = testrunner.runner.TestRunner.TREEICONSOK;
          }

          if (currNode.hasChildren())
          {
            t = new qx.ui.tree.TreeFolder(currNode.label).set({
              icon: ns[currNode.type] || null
            });
            if (level < 2 && !that.getCurrentTest())
            {
              t.setOpen(true);
              // Store node to select:
              initalSelected = t;
            }

            if (that.getCurrentTest()) {
              if (that.getCurrentTest()[level] == currNode.label) {
                t.setOpen(true);
                // Store node to select:
                initalSelected = t;
              }
            }

            buildSubTree(t, currNode, level+1);
          }
          else
          {
            t = new qx.ui.tree.TreeFile(currNode.label).set({
              icon: ns[currNode.type] || null
            });

            if (that.getCurrentTest()) {
              if (that.getCurrentTest()[level] == currNode.label &&
              that.getCurrentTest()[level-1] == currNode.parent.label) {
                // Store node to select:
                initalSelected = t;
              }
            }

            t.addListener("dblclick", that.runTest, that);
          }

          // make connections
          widgetR.add(t);
          t.setUserData("modelLink", currNode);
          currNode.widgetLinkFull = t;

          if (that.tests.handler.getFullName(currNode) == that.tests.selected) {
            selectedElement = currNode;
          }
        }
      }

      // -- Main --------------------------------
      var ttree = this.tests.handler.ttree;
      var that = this;
      var initalSelected = null;

      // Reset Status Pane Elements
      this.widgets["statuspane.current"].setValue("");
      this.widgets["statuspane.number"].setValue("");

      var fulltree = this.widgets["treeview.full"];

      fulltree.setUserData("modelLink", ttree);

      // link top level model to widgets
      ttree.widgetLinkFull = fulltree;

      var selectedElement = null;  // if selection exists will be set by

      var root1 = new qx.ui.tree.TreeFolder("root1");
      root1.setOpen(true);
      fulltree.setRoot(root1);
      fulltree.setHideRoot(true);
      fulltree.setRootOpenClose(true);

      buildSubTree(this.widgets["treeview.full"].getRoot(), ttree, 0);

      // Now select item:
      if (initalSelected) {
        fulltree.setSelection([initalSelected]);
      }

      if (selectedElement)  // try to re-select previously selected element
      {
        var element = selectedElement.widgetLinkFull.getParent();

        while(element != null)
        {
          element.setOpen(true);
          element = element.getParent();
        }

        // Finally select the element
        selectedElement.widgetLinkFull.getTree().setSelection([selectedElement.widgetLinkFull]);
      }

    },  // leftReloadTree

    // -------------------------------------------------------------------------
    /**
     * event handler for the Run Test button - performs the tests
     *
     * @param e {Event} TODOC
     * @return {void}
     * @lint ignoreDeprecated(alert)
     */
    runTest : function(e)
    {
      // -- Vars and Setup -----------------------
      this.widgets["toolbar.runbutton"].setVisibility("excluded");
      this.widgets["toolbar.stopbutton"].setVisibility("visible");
      this.setStopped(false);

      this.logelem.innerHTML = "";
      if (this.__state === 0)
      {
        this.setQueCnt(this.tests.selected_cnt);
        this.__state = 1;
      }

      // this.tree.setEnabled(false);
      this.widgets["statuspane.systeminfo"].setValue(this.tr("Preparing..."));

      this.resetGui();
      var bar = this.widgets["progresspane.progressbar"];

      // Make initial entry in output windows (test result, log, ...)
      this.appender(this.tr("Now running: ") + this.tests.selected);

      var tstCnt = this.tests.selected_cnt;
      var tstCurr = 1;
      var testResult;

      // start test
      // Currently, a flat list of individual tests is computed (buildList), and
      // then processed by a recursive Timer.once-controlled funtion (runtest);
      // each test is passed to the same iframe object to be run(loader.runTests).
      var that = this;
      var tlist = [];
      var handler = this.tests.handler;

      // -- Helper Functions ---------------------
      // create testResult obj
      function init_testResult()
      {
        var testResult = new that.frameWindow.qx.dev.unit.TestResult();

        // Set queue count
        that.setQueCnt(that.tests.selected_cnt);

        // set up event listeners
        testResult.addListener("startTest", function(e)
        {
          var test = e.getData();
          that.currentTestData = new testrunner.runner.TestResultData(test.getFullName());
          that.f1.addTestResult(that.currentTestData);
          that.appender(this.tr("Test '") + test.getFullName() + this.tr("' started."));
          // store current test in history - slows everything down
          //that.__history.addToHistory(test.getFullName().replace(":", "."));
        },
        that);

        testResult.addListener("wait", function(e)
        {
          var test = e.getData();
          that.currentTestData.setState("wait");
          that.appender(this.tr("Test '") + test.getFullName() + this.tr("' waiting."));
        },
        that);

        testResult.addListener("failure", function(e)
        {
          var ex = e.getData().exception;
          var test = e.getData().test;
          that.currentTestData.setException(ex);
          that.currentTestData.setState("failure");
          bar.setBarColor("#9d1111");
          var val = that.getFailCnt();
          that.setFailCnt(++val);
          that.setQueCnt(that.getQueCnt() - 1);
          that.appender(this.tr("Test '") + test.getFullName() + this.tr("' failed: ") + ex.message + " - " + ex.getComment());
          that.widgets["progresspane.progressbar"].update(String(tstCurr + "/" + tstCnt));
          tstCurr++;
          if (!qx.bom.client.Engine.MSHTML) {
            that.__markTree(e.getData().test.getFullName(), "failure");
          }
        },
        that);

        testResult.addListener("error", function(e)
        {
          var ex = e.getData().exception;
          that.currentTestData.setException(ex);
          that.currentTestData.setState("error");
          bar.setBarColor("#9d1111");
          var val = that.getFailCnt();
          that.setFailCnt(++val);
          that.setQueCnt(that.getQueCnt() - 1);
          that.appender(this.tr("The test '") + e.getData().test.getFullName() + this.tr("' had an error: ") + ex, ex);
          that.widgets["progresspane.progressbar"].update(String(tstCurr + "/" + tstCnt));
          tstCurr++;
          if (!qx.bom.client.Engine.MSHTML) {
            that.__markTree(e.getData().test.getFullName(), "error");
          }
        },
        that);

        testResult.addListener("endTest", function(e)
        {
          var state = that.currentTestData.getState();

          this.__fetchLog();

          if (state == "start")
          {
            that.currentTestData.setState("success");

            var val = that.getSuccCnt();
            that.setSuccCnt(++val);
            that.setQueCnt(that.getQueCnt() - 1);
            that.widgets["progresspane.progressbar"].update(String(tstCurr + "/" + tstCnt));
            tstCurr++;
            if (!qx.bom.client.Engine.MSHTML) {
              that.__markTree(e.getData().getFullName(), "success");
            }
          }

          if (!this.getStopped()) {
            qx.event.Timer.once(runtest, this, 0);
          } else {
            this.setStopped(false);
            that.widgets["toolbar.runbutton"].setVisibility("visible");
            that.widgets["toolbar.stopbutton"].setVisibility("excluded");
          }

          // Flush the test application's dispose queue to prevent tests
          // influencing each other
          this.iframe.getWindow().qx.ui.core.queue.Dispose.flush();

        },
        that);

        return testResult;
      }
        // init_testResult

      /*
       * function to process a list of individual tests
       * because of Timer.once restrictions, using an external var as parameter
       * (tlist)
       */

      function runtest()
      {
        that.widgets["statuspane.systeminfo"].setValue(that.tr("Running tests..."));
        that.toolbar.setEnabled(true);
        that.widgets["toolbar.runbutton"].setVisibility("excluded");
        that.widgets["toolbar.stopbutton"].setVisibility("visible");

        if (tlist.length && that.getStopped() == false)
        {
          var test = tlist[0];
          that.loader.runTests(testResult, test[0], test[1]);
          tlist = tlist.slice(1, tlist.length);  // recurse with rest of list
        }
        else
        {  // no more tests -> re-enable run button
          that.widgets["toolbar.runbutton"].setVisibility("visible");
          that.widgets["toolbar.stopbutton"].setVisibility("excluded");
          this.__state == 0;
          if (that.tests.firstrun)
          {
            that.reloadswitch.setValue(true);
            that.tests.firstrun = false;
            that.widgets["statuspane.systeminfo"].setValue(that.tr("Enabled auto-reload"));
          }
          else
          {
            that.widgets["statuspane.systeminfo"].setValue(that.tr("Ready"));
          }
        }
      }


      /**
       * build up a list that will be used by runtest() as input (var tlist)
      */
      function buildList(node)  // node is a modelNode
      {
        var tlist = [];
        var path = handler.getPath(node);
        var tclass = path.join(".");

        if (node.hasChildren())
        {
          var children = node.getChildren();

          for (var i=0; i<children.length; i++)
          {
            if (children[i].hasChildren()) {
              tlist = tlist.concat(buildList(children[i]));
            } else {
              // Don't add empty packages or classes to the list.
              if (children[i].type == "test") {
                tlist.push([tclass, children[i].label]);
              }
            }
          }
        }
        else
        {
          // Don't add empty packages or classes to the list.
          if (node.type == "test") {
            tlist.push([tclass, node.label]);
          }
        }

        return tlist;
      }
        // buildList

      // -- Main ---------------------------------
      // get model node from selected tree node
      var widgetNode = this.tree.getSelectedElement();

      if (widgetNode) {
        var modelNode = widgetNode.getUserData("modelLink");
      }
      else
      {  // no selected tree node - this should never happen here!
        alert(this.tr("Please select a test node from the tree!"));
        that.toolbar.setEnabled(true);
        this.widgets["toolbar.runbutton"].setVisibility("visible");
        this.widgets["toolbar.stopbutton"].setVisibility("excluded");
        return;
      }

      // build list of individual tests to perform
      var tlist = buildList(modelNode);

      // sort the tests to make sure they have always the same order to keep
      // the dependencies between the tests constant
      tlist.sort(function(a, b) {
        if (a[0] > b[0]) {
          return 1;
        } else if (a[0] < b[0]) {
          return -1;
        } else {
          if (a[1] > b[1]) {
            return 1
          } else if (a[1] < b[1]) {
            return -1;
          } else {
            return 0;
          }
        }
      });

      if (this.reloadswitch.getValue())
      {
        // set up pending tests
        this.tests.run_pending = function()
        {
          testResult = init_testResult();

          if (!testResult) {
            that.debug(this.tr("Alarm: no testResult!"));
          } else {
            runtest();
          }
        };

        this.setQueCnt(this.tests.selected_cnt);
        this.reloadTestSuite();
      }
      else
      {
        // run the tests now
        testResult = init_testResult();
        runtest();
      }
    },  // runTest

    // -------------------------------------------------------------------------
    /**
     * reloads iframe's URL
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    reloadTestSuite : function(e)
    {
      var curr = this.iframe.getSource();
      var neu = this.testSuiteUrl.getValue();
      this.widgets["toolbar.runbutton"].setEnabled(false);
      this.toolbar.setEnabled(false);
      this.widgets["statuspane.systeminfo"].setValue(this.tr("Reloading test suite..."));

      // destroy widget and model trees to avoid leaking memory on reload.
      var oldRoot = this.widgets["treeview.full"].getRoot();
      this.widgets["treeview.full"].setRoot(null);
      oldRoot.destroy();

      this.tests.handler.ttree.widgetLinkFull = null;
      this.tests.handler.ttree.widgetLinkFlat = null;
      this.tests.handler.ttree.dispose();

      // reset status information
      this.resetGui();

      qx.event.Timer.once(function()
      {
        if (curr == neu) {
          this.iframe.reload();
        }
        else
        {
          this.iframe.setSource(neu);
        }
      },
      this, 0);
    },  // reloadTestSuite


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     * @lint ignoreDeprecated(alert)
     */
    __ehIframeOnLoad : function(e)
    {
      if (!this.__loadAttempts) {
        this.__loadAttempts = 0;
      }
      this.__loadAttempts++;

      var iframe = this.iframe;

      this.frameWindow = iframe.getWindow();

      if (this.__loadTimer)
      {
        this.__loadTimer.stop();
        this.__loadTimer = null;
      }

      if (this.__loadAttempts <= 300) {
        // Repeat until testrunner in iframe is loaded
        if (!this.frameWindow.testrunner) {
          //this.debug("no testrunner" + this.frameWindow);
          this.__loadTimer = qx.event.Timer.once(this.__ehIframeOnLoad, this, 100);
          return;
        }

        this.loader = this.frameWindow.testrunner.TestLoader.getInstance();
        // Avoid errors in slow browsers

        if (!this.loader) {
          //this.debug("no loader");
          this.__loadTimer = qx.event.Timer.once(this.__ehIframeOnLoad, this, 100);
          return;
        }

        if (!this.loader.getSuite()) {
          //this.debug("no test suite");
          this.__loadTimer = qx.event.Timer.once(this.__ehIframeOnLoad, this, 100);
          return;
        }
      }
      else {
        alert(this.tr("The selected test file is invalid."));
        this.toolbar.setEnabled(true);
        this.widgets["statuspane.systeminfo"].setValue(this.tr("Invalid test file selected!"));
        return;
      }

      //this.warn("loaded!!!!!");

      var testRep = this.loader.getTestDescriptions();
      this.tests.handler = new testrunner.runner.TestHandler(testRep);
      this.tests.firstrun = true;
      this.leftReloadTree();
      this.toolbar.setEnabled(true);  // in case it was disabled (for reload)
      this.widgets["toolbar.runbutton"].setEnabled(true);
      this.widgets["toolbar.runbutton"].setVisibility("visible");
      this.widgets["toolbar.stopbutton"].setVisibility("excluded");
      this.reloadswitch.setValue(false);  // disable for first run

      if (this.tests.run_pending)
      {  // do we have pending tests to run?
        this.tests.run_pending();
        delete this.tests.run_pending;
      }

      if(this.widgets["treeview.full"].getRoot().getChildren().length > 0)
      {
        this.widgets["statuspane.systeminfo"].setValue(this.tr("Ready"));
        this.runbutton.setEnabled(true);
      }
      else
      {
        this.widgets["statuspane.systeminfo"].setValue(this.tr("No test file selected!"));
      }
    },  // __ehIframeOnLoad

    /**
     * Store pane width in cookie
     *
     * @param e {Event} Event data: The pane
     * @return {void}
     */
    __onPaneResize : function(e)
    {
      var pane = this.getUserData("pane");
      qx.bom.Cookie.set(pane + "PaneWidth", e.getData().width, 365);
    },

    /**
     * Iterate over the (model) tree, searching for a specific test
     *
     * @param testName {String} The full name of a test, as returned by
     * {@link qx.dev.unit.TestFunction#getFullName()}
     * @param status {String} The test's final status, one of "success",
     * "failure", "error"
     * @return {void}
     */
    __markTree : function(testName, status)
    {
      testName = testName.replace(/\:/, ".");
      var iter = this.tests.handler.ttree.getIterator("depth");
      var curr;
      while (curr = iter()) {
        var nodePath = curr.pwd();
        nodePath.shift();
        var nodeName = qx.lang.Array.clone(nodePath);
        nodeName.push(curr.label);

        if (nodeName.join('.') == testName) {

          var widgetNode = curr.widgetLinkFull;
          var type = curr.type;

          if (type == "test") {

            var that = this;
            function markParentRec(treeNode, modelNode) {
              if (modelNode.type != "root") {
                if (!modelNode.status || status != "success") {
                  modelNode.status = "fail";
                  that.__setTreeIcon(treeNode, modelNode.type, status);
                }
              }

              if (treeNode.getParent()) {
                markParentRec(treeNode.getParent(), modelNode.parent);
              }

            }

            markParentRec(widgetNode, curr);

          }

        }
      }
    },

    /**
     * Set the icon for a given (widget) tree node according to the node's type
     * and the corresponding test's status.
     *
     * @param node {qx.ui.tree.AbstractTreeItem} The tree node to work with
     * @param type {String} The node's type, one of "package", "class", "test"
     * @param status {String} The test's final status, one of "success",
     * "failure", "error"
     * @return {void}
     */
    __setTreeIcon : function(node, type, status) {
      var icons;
      if (status == "success") {
        icons = testrunner.runner.TestRunner.TREEICONSOK;
      } else {
        icons = testrunner.runner.TestRunner.TREEICONSERROR;
        node.setTextColor("#ff0000");
      }
      node.setIcon(icons[type]);
    },

    /**
     * Scroll the test result pane to display the currently selected test's
     * entry.
     *
     * @return {void}
     */
    __scrollToResult : function()
    {
      var modelNode = this.tree.getSelectedElement().getUserData("modelLink");
      var dirname = modelNode.pwd();
      dirname.shift();
      var fullname = dirname.join(".");
      fullname += ":" + modelNode.label;
      var resultPane = this.f1.getContentElement().getDomElement();
      var resultDivs = resultPane.childNodes;
      for (var i=0; i<resultDivs.length; i++) {
        if (resultDivs[i].firstChild.firstChild.nodeValue == fullname) {
          var dist = qx.bom.element.Location.getRelative(resultDivs[i], resultDivs[0]);
          this.f1.getContentElement().scrollToY(dist.top);
        }
      }
    },

    // ------------------------------------------------------------------------
    //   MISC HELPERS
    // ------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @return {void}
     */
    resetGui : function()
    {
      this.resetProgress();
      this.resetTabView();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    resetProgress : function()
    {
      var bar = this.widgets["progresspane.progressbar"];
      bar.reset();
      bar.setBarColor("#36a618");
      this.setSuccCnt(0);
      this.setFailCnt(0);
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    resetTabView : function() {
      this.f1.clear();
    },


    /**
     * TODOC
     *
     * @param newSucc {var} TODOC
     * @return {void}
     */
    _applySuccCnt : function(newSucc) {
      this.widgets["progresspane.succ_cnt"].setValue(newSucc + "");
    },


    /**
     * TODOC
     *
     * @param newFail {var} TODOC
     * @return {void}
     */
    _applyFailCnt : function(newFail) {
      this.widgets["progresspane.fail_cnt"].setValue(newFail + "");
    },

    // property apply
    _applyQueCnt : function(value, old){
      this.widgets["progresspane.queue_cnt"].setValue(value + "");
    },

    /**
     * TODOC
     *
     * @param str {String} TODOC
     * @return {void}
     */
    appender : function(str) {

    },

    __fetchLog : function()
    {
      var w = this.iframe.getWindow();

      var logger;
      if (w.qx && w.qx.log && w.qx.log.Logger)
      {
        logger = w.qx.log.Logger;
        logger.setLevel(this.getLogLevel());

        // Register to flush the log queue into the appender.
        logger.register(this.logappender);

        // Clear buffer
        logger.clear();

        // Unregister again, so that the logger can flush again the next time the tab is clicked.
        logger.unregister(this.logappender);
      }
    },

    _applyLogLevel : function(value, old)
    {
      var menuButtons = this.levelbox.getMenu().getChildren();
      for (var i=0,l=menuButtons.length; i<l; i++) {
        if (menuButtons[i].getLabel().toLowerCase().indexOf(value) >= 0) {
          menuButtons[i].setFont("bold");
        } else {
          menuButtons[i].setFont("default");
        }
      }
    },

    __state : 0
  },


  destruct : function ()
  {
    this.widgets = this.tests = this.tree = this.frameWindow = null;
    this._disposeObjects(
      "mainsplit",
      "left",
      "runbutton",
      "stopbutton",
      "testSuiteUrl",
      "reloadbutton",
      "reloadswitch",
      "stacktoggle",
      "levelbox",
      "toolbar",
      "f1",
      "f2",
      "logappender",
      "iframe",
      "tree1",
      "loader",
      "__labelDeco",
      "__progress",
      "logelem",
      "currentTestData"
    );
  },


  defer : function()
  {
    qx.core.Setting.define("qx.testPageUri",   "html/tests.html");
    qx.core.Setting.define("qx.testNameSpace", "testrunner.test");
  }

});
