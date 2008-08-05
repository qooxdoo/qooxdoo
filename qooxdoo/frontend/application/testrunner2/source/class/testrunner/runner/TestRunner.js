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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/${qx.icontheme}/16/apps/video-player.png)
#asset(qx/icon/${qx.icontheme}/16/apps/photo-album.png)
#asset(qx/icon/${qx.icontheme}/16/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-start.png)
#asset(qx/icon/${qx.icontheme}/16/apps/network-manager.png)
#asset(qx/icon/${qx.icontheme}/16/apps/preferences-display.png)

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

    this.setLayout(new qx.ui.layout.VBox);

    // Dependencies to loggers
    qx.log.appender.Native;
    qx.log.appender.Console;

    this.widgets = {};
    this.tests = {};

    // Header Pane
    this.header = this.__makeHeader();
    this.add(this.header);
    
    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.Pane("horizontal");
    this.add(mainsplit, {flex : 1});
    this.mainsplit = mainsplit;

    // Left -- is done when iframe is loaded
    var left = this.__makeLeft();
    left.setWidth(250);
    this.left = left;
    this.mainsplit.add(left, 0);


    // Right
    var right = new qx.ui.container.Composite(new qx.ui.layout.VBox);

    mainsplit.add(right, 1);

    // Toolbar
    this.toolbar = this.__makeToolbar();
    right.add(this.toolbar);

    var rightSub = new qx.ui.container.Composite(new qx.ui.layout.VBox);
    rightSub.setPadding(10);
    right.add(rightSub, {flex : 1});

    var groupBox = new qx.ui.groupbox.GroupBox();
    groupBox.setLayout(new qx.ui.layout.Grow)

    var vert = new qx.ui.container.Composite(new qx.ui.layout.VBox);

    groupBox.add(vert);

    rightSub.add(groupBox);
    
    // status
    var statuspane = this.__makeStatus();

    // right.add(statuspane);
    vert.add(statuspane);
    this.widgets["statuspane"] = statuspane;

    // progress bar
    var progress = this.__makeProgress();
    vert.add(progress);

    // right.add(progress);
    // output views
    var buttview = this.__makeOutputViews();
    rightSub.add(buttview, {flex : 1});

    // Log Appender
    this.debug("This should go to the dedicated log window ...");

    // Last but not least:
    // Hidden IFrame for test runs
    var iframe = new qx.ui.embed.Iframe;
    iframe.setSource("about:blank")
    this.iframe = iframe;

    this._add(iframe);
    iframe.set({
      width  : 0,
      height : 0,
      zIndex : 5
    })

    // Get the TestLoader from the Iframe (in the event handler)
    iframe.addListener("load", this.ehIframeOnLoad, this);
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
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** This one is called by Application.js
     */
    load : function() {
      this.iframe.setSource(this.__testSuiteUrl);
    },


    // ------------------------------------------------------------------------
    //   CONSTRUCTOR HELPERS
    // ------------------------------------------------------------------------
    /**
     * Create the header widget
     *
     * @return {qx.ui.embed.Html} The header widget
     */
    __makeHeader : function()
    {
      var header = new qx.ui.embed.Html("<h1>" + "<span>" + "qooxdoo Test Runner" + "</span>" + "</h1>" + "<div class='version'>qooxdoo " + qx.core.Setting.get("qx.version") + "</div>");
      var element = header.getContentElement();
      element.setAttribute("id", "header");
      element.setStyle("background", "#134275 url(" + qx.util.ResourceManager.toUri("testrunner/image/colorstrip.gif") + ") top left repeat-x");
      header.setHeight(70);
      return header;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;

      // -- run button
      this.runbutton = new qx.ui.toolbar.Button(null, "icon/16/actions/media-playback-start.png");
      toolbar.add(this.runbutton);
      this.widgets["toolbar.runbutton"] = this.runbutton;
      this.runbutton.addListener("execute", this.runTest, this);
      this.runbutton.setToolTip(new qx.ui.tooltip.ToolTip("Run selected test(s)"));

      toolbar.add(new qx.ui.toolbar.Separator);

      var testUri   = qx.core.Setting.get("qx.testPageUri");
      var nameSpace = qx.core.Setting.get("qx.testNameSpace");
      this.__testSuiteUrl = testUri+"?testclass="+nameSpace;
      this.testSuiteUrl = new qx.ui.form.TextField(this.__testSuiteUrl);
      toolbar.add(this.testSuiteUrl);
      this.testSuiteUrl.setToolTip(new qx.ui.tooltip.ToolTip("Test backend application URL"));

      this.testSuiteUrl.set(
      {
        width       : 300,
        marginRight : 5,
        marginTop : 2,
        marginBottom : 2,
        allowGrowY : true
      });

      this.testSuiteUrl.addListener("keydown", function(e)
      {
        if (e.getKeyIdentifier() == "Enter") {
          this.reloadTestSuite();
        }
      },
      this);

      // -- reload button
      this.reloadbutton = new qx.ui.toolbar.Button(null, "icon/16/actions/view-refresh.png");
      toolbar.add(this.reloadbutton);
      this.reloadbutton.setToolTip(new qx.ui.tooltip.ToolTip("Reload test backend application"));
      this.reloadbutton.addListener("execute", this.reloadTestSuite, this);

      toolbar.addSpacer();

      // -- reload switch
      var part = new qx.ui.toolbar.Part();
      //part.setVerticalChildrenAlign("middle");
      toolbar.add(part);
      this.reloadswitch = new qx.ui.toolbar.CheckBox("Reload before Test", "testrunner/image/yellow_diamond_hollow18.gif");
      part.add(this.reloadswitch);
      this.reloadswitch.setShow("both");
      this.reloadswitch.setToolTip(new qx.ui.tooltip.ToolTip("Always reload test backend before testing"));

      this.reloadswitch.addListener("changeChecked", function(e)
      {
        if (this.reloadswitch.getChecked()) {
          this.reloadswitch.setIcon("testrunner/image/yellow_diamond_full18.gif");
        } else {
          this.reloadswitch.setIcon("testrunner/image/yellow_diamond_hollow18.gif");
        }
      },
      this);

      return toolbar;
    },  // makeToolbar


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeOutputViews : function()
    {
      // Main Container
      var tabview = new qx.ui.tabview.TabView;

      var p1 = new qx.ui.tabview.Page("Test Results", "icon/16/apps/video-player.png");
      p1.setLayout(new qx.ui.layout.Grow);
      p1.set({ padding : [ 5 ] });

      // spacing   : 5
      var p2 = new qx.ui.tabview.Page("Log", "icon/16/apps/photo-album.png");
      p2.setLayout(new qx.ui.layout.Grow);
      p2.set({ padding : [ 5 ] });
      tabview.add(p1);
      tabview.add(p2);
      
      // First Page
      var f1 = new testrunner.runner.TestResultView();

      this.f1 = f1;
      p1.add(f1);

      // Second Page
      var pp2 = new qx.ui.container.Composite(new qx.ui.layout.VBox(20)) ;// new qx.legacy.ui.layout.VerticalBoxLayout();
      p2.add(pp2);

      // main output area
      this.f2 = new qx.ui.embed.Html('');
      this.f2.setBackgroundColor("white");
      pp2.add(this.f2);
      //this.f2.setHtmlProperty("id", "sessionlog");
      this.f2.getContentElement().setAttribute("id", "sessionlog");

      // toolbar
      var ff1_b1 = new qx.ui.form.Button("Clear");
      ff1_b1.setAllowGrowX(false);
      pp2.add(ff1_b1);

      // width : "auto"
      ff1_b1.addListener("execute", function(e) {
        this.f2.setHtml("");
      }, this);

      // log appender
      // this.logappender = new qx.legacy.log.appender.Window("qooxdoo Test Runner");
      // this.logappender = new qx.legacy.log.appender.Div("sessionlog");

      ////this.logappender = new testrunner.runner.TestAppender(this.f2);

      // TODO: the next line needs re-activation
      //this.getLogger().getParentLogger().getParentLogger().addAppender(this.logappender);

      // Third Page
      // -- Tab Button
      ////var bsb3 = new qx.ui.pageview.tabview.Button("Tabled Results", "icon/16/apps/graphics-snapshot.png");

      // buttview.getBar().add(bsb3);
      // -- Tab Pane
      //var p3 = new qx.legacy.ui.pageview.tabview.Page(bsb3);
      /*
      var p3 = new qx.ui.tabview.Page("Tabled Results", "icon/16/apps/graphics-snapshot.png");
      p3.setLayout(new qx.ui.layout.Grow)
      p3.set({ padding : [ 5 ] });

      // -- Pane Content
      var f3 = new qx.ui.embed.Html("Results should go into a table here.");
      p3.add(f3);
      
      tabview.add(p3);
      */

      return tabview;
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
      //var buttview = new qx.legacy.ui.pageview.buttonview.ButtonView();
      var tabview = new qx.ui.tabview.TabView;
      this.widgets["treeview"] = tabview;

      // full view
      var p1 = new qx.ui.tabview.Page(null, "icon/16/apps/network-manager.png");
      p1.setLayout(new qx.ui.layout.Grow);
      p1.getButton().setToolTip( new qx.ui.tooltip.ToolTip("Full Tree"));
      p1.getButton().setHeight(25);
      tabview.add(p1);

      var tree = new qx.ui.tree.Tree("Tests");
      tree.setSelectionMode("single");
      p1.add(tree);
      this.tree = tree;
      this.widgets["treeview.full"] = tree;

      tree.addListener("changeSelection", this.treeGetSelection, this);

      // flat view
      var p2 = new qx.ui.tabview.Page(null, "icon/16/apps/preferences-display.png");
      p2.setLayout(new qx.ui.layout.Grow);
      p2.getButton().setToolTip( new qx.ui.tooltip.ToolTip("Flat tree view (only one level of containers)"));
      p2.getButton().setHeight(25);
      tabview.add(p2);

      var tree1 = new qx.ui.tree.Tree("Tests");
      p2.add(tree1);
      tree1.setSelectionMode("single");
      this.tree1 = tree1;
      this.widgets["treeview.flat"] = tree1;

      tree1.addListener("changeSelection", this.treeGetSelection, this);

      // fake unique tree for selection (better to have a selection on the model)
      this.tree = {};
      var that = this;

      this.tree.getSelectedElement = function()
      {
        var sel = that.widgets["treeview"].getSelected();
        var elem;

        if (sel.getIcon() == "icon/16/apps/network-manager.png") {
          elem = that.widgets["treeview.full"].getSelectedItem();
        } else {
          elem = that.widgets["treeview.flat"].getSelectedItem();
        }

        return elem;        
      };

      return tabview;
    },  // makeLeft

    // -------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeProgress : function()
    {
      var layout = new qx.ui.layout.HBox(10);
      var progress = new qx.ui.container.Composite(layout);// new qx.legacy.ui.layout.HorizontalBoxLayout();
      progress.setPadding(10)

      var progressb = new testrunner.runner.ProgressBar();
      progress.add(progressb);

      progressb.set(
      {
        showStepStatus : true,
        showPcntStatus : true,
        barColor       : "#36a618"
      });

      this.widgets["progresspane"] = progress;
      this.widgets["progresspane.progressbar"] = progressb;
      progress.add(new qx.ui.toolbar.Separator);

      /* Wishlist:
      var progressb = new qx.legacy.ui.component.ProgressBar();
      progressb.set({
        scale    : null,   // display no scale
        startLabel : "0%",
        endLabel   : "100%",
        fillLabel : "(0/10)", // status label right of bar
        fillStatus: "60%"     // fill degree of the progress bar
      });
      progressb.update("9/15"); // update progress
      progressb.update("68%");  // dito
      */

      progress.add(new qx.ui.basic.Label("Failed: "));
      var failcnt = new qx.ui.basic.Label("0");
      progress.add(failcnt);
      failcnt.set({ backgroundColor : "#C1ECFF" });

      progress.add(new qx.ui.basic.Label("Succeeded: "));
      var succcnt = new qx.ui.basic.Label("0");
      progress.add(succcnt);
      succcnt.set({ backgroundColor : "#C1ECFF" });
      this.widgets["progresspane.succ_cnt"] = succcnt;
      this.widgets["progresspane.fail_cnt"] = failcnt;

      return progress;
    },  // makeProgress

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
      statuspane.setPadding(10);

      // Test Info
      statuspane.add(new qx.ui.basic.Label("Selected Test: "));
      var l1 = new qx.ui.basic.Label("");
      statuspane.add(l1);
      l1.set({ backgroundColor : "#C1ECFF" });
      this.widgets["statuspane.current"] = l1;
      statuspane.add(new qx.ui.basic.Label("Number of Tests: "));
      var l2 = new qx.ui.basic.Label("");
      statuspane.add(l2);
      l2.set({ backgroundColor : "#C1ECFF" });
      this.widgets["statuspane.number"] = l2;

      ////statuspane.add((new qx.ui.basic.HorizontalSpacer).set({ width : "1*" }));

      // System Info
      statuspane.add(new qx.ui.basic.Label("System Status: "));
      var l3 = new qx.ui.basic.Label("");
      statuspane.add(l3);
      l3.set({ width : 150 });
      this.widgets["statuspane.systeminfo"] = l3;
      this.widgets["statuspane.systeminfo"].setContent("Loading...");

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
      this.widgets["statuspane.current"].setContent(this.tests.selected);
      this.tests.selected_cnt = this.tests.handler.testCount(modelNode);
      this.widgets["statuspane.number"].setContent(this.tests.selected_cnt + "");

      // update toolbar
      this.widgets["toolbar.runbutton"].resetEnabled();

      // update selection in other tree
      // -- not working!

      this.widgets["statuspane.systeminfo"].setContent("Tests selected");
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
      function buildSubTree(widgetR, modelR)
      {
        var children = modelR.getChildren();
        var t;
        var ico;

        var children = qx.lang.Array.copy(children);

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

          if (currNode.__type === 2)
          {
            ico = "testrunner/image/class18.gif";
          }
          else if (currNode.__type === 4)
          {
            ico = "testrunner/image/package18.gif";
          }
          else
          {
            ico = "testrunner/image/method_public18.gif";
          }

          if (currNode.hasChildren())
          {
            t = new qx.ui.tree.TreeFolder(currNode.label, ico);
            buildSubTree(t, currNode);
          }
          else
          {
            t = new qx.ui.tree.TreeFile(currNode.label, ico);
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
        // buildSubTree;

      function buildSubTreeFlat(widgetR, modelR)
      {
        var iter = modelR.getIterator("depth");
        var currNode;

        while (currNode = iter())
        {
          if (currNode.type && currNode.type == "test")
          {
            ;
          } else  // it's a container
          {
            if (handler.hasTests(currNode))
            {
              var fullName = handler.getFullName(currNode);
              var t = new qx.ui.tree.TreeFolder(fullName, "testrunner/image/class18.gif");
              widgetR.add(t);
              t.setUserData("modelLink", currNode);
              currNode.widgetLinkFlat = t;

              if (that.tests.handler.getFullName(currNode) == that.tests.selected) {
                selectedElement = currNode;
              }

              var children = currNode.getChildren();

              for (var i=0; i<children.length; i++)
              {
                if (children[i].type && children[i].type == "test")
                {
                  var c = new qx.ui.tree.TreeFile(children[i].label, "testrunner/image/method_public18.gif");
                  t.add(c);
                  c.setUserData("modelLink", children[i]);
                  children[i].widgetLinkFlat = c;

                  if (that.tests.handler.getFullName(children[i]) == that.tests.selected) {
                    selectedElement = children[i];
                  }
                }
              }
            }
          }
        }
      }
        // buildSubTreeFlat

      // -- Main --------------------------------
      var ttree = this.tests.handler.ttree;
      var handler = this.tests.handler;
      var that = this;

      // Reset Status Pane Elements
      this.widgets["statuspane.current"].setContent("");
      this.widgets["statuspane.number"].setContent("");

      // Disable Tree View
      this.widgets["treeview"].setEnabled(false);

      // Handle current Tree Selection and Content
      var fulltree = this.widgets["treeview.full"];
      var flattree = this.widgets["treeview.flat"];
      var trees = [ fulltree, flattree ];
      var stree = this.widgets["treeview"].getSelected();

      for (var i=0; i<trees.length; i++) {
        trees[i].setUserData("modelLink", ttree);  // link top level widgets and model
      }

      // link top level model to widgets
      ttree.widgetLinkFull = fulltree;
      ttree.widgetLinkFlat = flattree;

      var selectedElement = null;  // if selection exists will be set by

      // buildSubTree* functions to a model node
      // Build the widget trees
      
      var root1 = new qx.ui.tree.TreeFolder("root1");
      root1.setOpen(true);
      fulltree.setRoot(root1);
      fulltree.setHideRoot(true);

      var root2 = new qx.ui.tree.TreeFolder("root2");
      root2.setOpen(true);
      flattree.setRoot(root2);
      flattree.setHideRoot(true);

      
      
      buildSubTree(this.widgets["treeview.full"].getRoot(), ttree);
      buildSubTreeFlat(this.widgets["treeview.flat"].getRoot(), ttree);

      // Re-enable and Re-select
      this.widgets["treeview"].setEnabled(true);

      if (selectedElement)  // try to re-select previously selected element
      {
        var activeTree;
        var link;

        if(that.widgets["treeview"].getSelected().getIcon() == "icon/16/apps/network-manager.png")
        {
          activeTree = this.widgets["treeview.full"];
          link = "widgetLinkFull";
        }
        else
        {
          activeTree = this.widgets["treeview.flat"];
          link = "widgetLinkFlat";
        }

        // Open all element's parents 
        var element = selectedElement[link].getParent();
        while(element != null)
        {
          element.setOpen(true);
          element = element.getParent();
        }

        // Finally select the element
        selectedElement[link].getTree().select(selectedElement[link]);
      }

    },  // leftReloadTree

    // -------------------------------------------------------------------------
    /**
     * event handler for the Run Test button - performs the tests
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    runTest : function(e)
    {
      // -- Vars and Setup -----------------------
      this.toolbar.setEnabled(false);

      // this.tree.setEnabled(false);
      this.widgets["statuspane.systeminfo"].setContent("Preparing...");

      this.resetGui();
      var bar = this.widgets["progresspane.progressbar"];

      // Make initial entry in output windows (test result, log, ...)
      this.appender("Now running: " + this.tests.selected);

      var tstCnt = this.tests.selected_cnt;
      var tstCurr = 1;
      var testResult;

      // start test
      // Currently, a flat list of individual tests is computed (buildList), and
      // then processed by a recursive Timer.once-controlled funtion (runtest);
      // each test is passed to the same iframe object to be run(loader.runTests).
      var that = this;
      var tlist = [];
      var tlist1 = [];
      var handler = this.tests.handler;

      // -- Helper Functions ---------------------
      // create testResult obj
      function init_testResult()
      {
        var testResult = new that.frameWindow.testrunner.TestResult();

        // set up event listeners
        testResult.addListener("startTest", function(e)
        {
          var test = e.getData();
          that.currentTestData = new testrunner.runner.TestResultData(test.getFullName());
          that.f1.addTestResult(that.currentTestData);
          that.appender("Test '" + test.getFullName() + "' started.");
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
          that.appender("Test '" + test.getFullName() + "' failed: " + ex.getMessage() + " - " + ex.getComment());
          that.widgets["progresspane.progressbar"].update(String(tstCurr + "/" + tstCnt));
          tstCurr++;
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
          that.appender("The test '" + e.getData().test.getFullName() + "' had an error: " + ex, ex);
          that.widgets["progresspane.progressbar"].update(String(tstCurr + "/" + tstCnt));
          tstCurr++;
        },
        that);

        testResult.addListener("endTest", function(e)
        {
          var state = that.currentTestData.getState();

          if (state == "start")
          {
            that.currentTestData.setState("success");

            // that.widgets["progresspane.succ_cnt"].setContent(++that.tests.succ_cnt+"");
            var val = that.getSuccCnt();
            that.setSuccCnt(++val);
            that.widgets["progresspane.progressbar"].update(String(tstCurr + "/" + tstCnt));
            tstCurr++;
          }
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
        that.widgets["statuspane.systeminfo"].setContent("Running tests...");
        that.toolbar.setEnabled(false);  // if we are run as run_pending

        if (tlist.length)
        {
          var test = tlist[0];
          that.loader.runTests(testResult, test[0], test[1]);
          tlist = tlist.slice(1, tlist.length);  // recurse with rest of list
          qx.event.Timer.once(runtest, this, 100);
        }
        else
        {  // no more tests -> re-enable toolbar
          that.toolbar.setEnabled(true);

          // that.tree.setEnabled(true);
          if (that.tests.firstrun)
          {
            that.reloadswitch.setChecked(true);
            that.tests.firstrun = false;
            that.widgets["statuspane.systeminfo"].setContent("Enabled auto-reload");
          }
          else
          {
            that.widgets["statuspane.systeminfo"].setContent("Ready");
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
              tlist.push([ tclass, children[i].label ]);
            }
          }
        }
        else
        {
          tlist.push([ tclass, node.label ]);
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
        alert("Please select a test node from the tree!");
        that.toolbar.setEnabled(true);
        return;
      }

      // build list of individual tests to perform
      var tlist = buildList(modelNode);

      if (this.reloadswitch.getChecked())
      {
        // set up pending tests
        this.tests.run_pending = function()
        {
          testResult = init_testResult();

          if (!testResult) {
            that.debug("Alarm: no testResult!");
          } else {
            runtest();
          }
        };

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
      this.toolbar.setEnabled(false);
      this.widgets["statuspane.systeminfo"].setContent("Reloading test suite...");

      // reset status information
      this.resetGui();

      qx.event.Timer.once(function()
      {
        if (curr == neu) {
          this.iframe.reload();
        } else {
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
     */
    ehIframeOnLoad : function(e)
    {
      var iframe = this.iframe;

      this.frameWindow = iframe.getWindow();

      if (!this.frameWindow.testrunner) {
        qx.event.Timer.once(this.ehIframeOnLoad, this, 100);
        return;
      }

      this.loader = this.frameWindow.testrunner.TestLoader.getInstance();
      // TODO: the next line needs re-activation
      //this.loader.getLogger().getParentLogger().addAppender(this.logappender);
      var testRep = this.loader.getTestDescriptions();
      this.tests.handler = new testrunner.runner.TestHandler(testRep);
      this.tests.firstrun = true;
      this.leftReloadTree();
      this.toolbar.setEnabled(true);  // in case it was disabled (for reload)
      this.reloadswitch.setChecked(false);  // disable for first run

      if (this.tests.run_pending)
      {  // do we have pending tests to run?
        this.tests.run_pending();
        delete this.tests.run_pending;
      }

      this.widgets["statuspane.systeminfo"].setContent("Ready");
    },  // ehIframeOnLoad

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
      this.widgets["progresspane.succ_cnt"].setContent(newSucc + "");
    },


    /**
     * TODOC
     *
     * @param newFail {var} TODOC
     * @return {void}
     */
    _applyFailCnt : function(newFail) {
      this.widgets["progresspane.fail_cnt"].setContent(newFail + "");
    },


    /**
     * TODOC
     *
     * @param str {String} TODOC
     * @return {void}
     */
    appender : function(str) {

    }
  },


  destruct : function ()
  {
    this._disposeFields(
      "widgets",
      "tests",
      "tree",
      "frameWindow"
    );
    this._disposeObjects(
      "header",
      "mainsplit",
      "left",
      "runbutton",
      "testSuiteUrl",
      "reloadbutton",
      "reloadswitch",
      "toolbar",
      "f1",
      "f2",
      "logappender",
      "iframe",
      "tree1",
      "loader"
    );
  },


  defer : function()
  {
    qx.core.Setting.define("qx.testPageUri",   "html/QooxdooTest.html");
    qx.core.Setting.define("qx.testNameSpace", "testrunner.test");
  }

});
