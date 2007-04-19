/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(qxunit)
#resource(css:css)
#resource(image:image)

************************************************************************ */

/**
 * The GUI definition of the API viewer.
 *
 * The connections between the GUI components are established in
 * the {@link Controller}.
 */

qx.Class.define("qxunit.runner.TestRunner",
{
  extend : qx.ui.layout.VerticalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);
    this.set({
      height : "100%",
      width : "100%"
      //border : "ridge"
      //border          : qx.renderer.border.BorderPresets.getInstance().inset
    });

    // Hidden IFrame for test runs
    var iframe = new qx.ui.embed.Iframe("html/QooxdooTest.html?testclass=qxunit.test");
    iframe.set({
      height: 100,
      width: 300
    });
    this.iframe = iframe;

    // Header Pane
    this.header = new qx.ui.embed.HtmlEmbed("<center><h3>QxRunner - The qooxdoo Test Runner</h3></center>");
    this.header.setHeight(70);
    this.add(this.header);

    // Toolbar
    this.toolbar = new qx.ui.toolbar.ToolBar;
    this.runbutton = new qx.ui.toolbar.Button("Run Test", "icon/16/categories/applications-development.png");
    this.toolbar.add(this.runbutton);
    this.toolbar.set({
      width : "100%",
      border : "inset"
    });
    this.add(this.toolbar);

    this.runbutton.addEventListener("click", this.runTest, this);


    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.HorizontalSplitPane(250, "1*");
    this.add(mainsplit);
    mainsplit.setLiveResize(true);
    mainsplit.set({
      height : "1*"
    });
    // Left
    var left = this.__makeLeft();
    mainsplit.addLeft(left);

    // Right
    var right = new qx.ui.layout.VerticalBoxLayout();
    right.set({
      width : "100%",
      spacing : 10,
      height : "100%",
      border : "inset",
      padding : [10]
    });
    mainsplit.addRight(right);
    // status
    var statuspane = this.__makeStatus();
    right.add(statuspane);

    // progress bar
    var progress = this.__makeProgress();
    right.add(progress);

    // button view
    var buttview = this.__makeButtonView();
    right.add(buttview);

    //this.testLoader();

  }, //constructor


  members: {
    __makeButtonView : function (){
      var buttview = new qx.ui.pageview.tabview.TabView();
      buttview.set({
        width: "100%",
        border: "inset",
        height: "1*"
      });

      var bsb1 = new qx.ui.pageview.tabview.Button("Test Results", "icon/16/devices/video-display.png");
      var bsb2 = new qx.ui.pageview.tabview.Button("Log", "icon/16/apps/graphics-snapshot.png");
      bsb1.setChecked(true);
      buttview.getBar().add(bsb1, bsb2);

      var p1 = new qx.ui.pageview.tabview.Page(bsb1);
      p1.set({
        padding : [5]
        //spacing   : 5
      });
      var p2 = new qx.ui.pageview.tabview.Page(bsb2);
      p2.set({
        padding : [5]
      });
      buttview.getPane().add(p1, p2);
      buttview.getPane().set({
        height : "100%"
      });


      var f1 = new qx.ui.form.TextField("Results of the current Test");
      this.f1 = f1;
      f1.set({
        //width : "100%",
        //height : "100%",
        //border : "inset",
        padding : [10]
      });
      var f2 = new qx.ui.form.TextField("Session Log, listing test invokations and all outputs");
      p1.add(f1);
      p2.add(f2);
      return buttview;
    }, //makeButtonView

    /**
     * Tree View in Left Pane
    */
    __makeLeft: function (){
      this.loader = qxunit.runner.TestLoaderStub.getInstance();
      //this.loader = qxunit.TestLoader.getInstance();
      this.tests = {};
      var that   = this;
      this.tests.handler = this.__makeTestHandler(this.loader.getTestDescriptions());

      /*
      var node = this.tests.handler.getRoot();
      this.debug("Root node: " + node);
      this.tests.handler.getChilds(node);
      this.tests.handler.getTests(node);
      */
      var tmap = this.tests.handler.tmap;
      
      //var left = new qx.ui.tree.Tree("Test Classes");
      var left = new qx.ui.tree.Tree("Root");
      left.set({
        width : "100%",
        height : "100%",
        padding : [10],
        border : "inset"
      });

      for (var i=0; i<tmap.length; i++) {
        var f = new qx.ui.tree.TreeFolder(tmap[i].classname);
        left.add(f);
        for (var j=0; j<tmap[i].tests.length; j++) {
          f.add(new qx.ui.tree.TreeFile(tmap[i].tests[j]));
        }
      }

      left.getManager().addEventListener("changeSelection", function (e) {
        that.tests.selected = e.getData()[0]._labelObject.getHtml();
        //that.right.buttview.bsb1.p1.f1 = this.tests.selected;
        //that.getChildren()[2].getChildren()[1].getChildren()[1].getPane().getChildren()[0].getChildren()[0] = that.tests.selected;
        that.f1.setValue(that.tests.selected);
      });

      return left;
    }, //makeLeft

    __makeProgress: function (){
      var progress = new qx.ui.layout.HorizontalBoxLayout();
      progress.set({
        border: "inset",
        height: "auto",
        padding: [5],
        spacing : 10,
        width : "100%"
      });
      progress.add(new qx.ui.basic.Label("Progress: "));
      var progressb = new qxunit.runner.ProgressBar();
      progress.add(progressb);
      /*
      var progressb = new qx.ui.component.ProgressBar();
      progressb.set({
        barColor : "blue",
        scale    : null,   // display no scale
        startLabel : "0%",
        endLabel   : "100%",
        fillLabel : "(0/10)", // status label right of bar
        fillStatus: "60%"     // fill degree of the progress bar
      });
      progressb.update("9/15"); // update progress
      progressb.update("68%");  // dito
      */
      progress.add(new qx.ui.basic.Label("(7/15)  (63%)"));
      return progress;
    }, //makeProgress

    __makeStatus: function (){
      var statuspane = new qx.ui.layout.HorizontalBoxLayout();
      statuspane.set({
        border : "inset",
        padding: [10],
        spacing : 10,
        height : "auto",
        width : "100%"
      });
      statuspane.add(new qx.ui.basic.Label("Current Test: "));
      var l1 = new qx.ui.basic.Label("qxunit.test.core.Variants");
      statuspane.add(l1);
      l1.set({
        backgroundColor : "#C1ECFF"
      });
      statuspane.add(new qx.ui.basic.Label("Number of Test: "));
      var l2 = new qx.ui.basic.Label("9");
      statuspane.add(l2);
      l2.set({
        backgroundColor : "#C1ECFF"
      });
      return statuspane;
    }, //makeStatus


    __makeTestHandler : function (testRep) {
      //testRep is Json currently
      var handler = function (){};
      handler.tmap    = eval(testRep); //[{classname:myClass,tests:['test1','test2']}, {...}]
      this.debug(qx.io.Json.stringify(testRep));

      handler.getRoot = function () {
        if (! this.Root) {
          var root = {classname: "", tests: []};
          var tmap = this.tmap;
          for (var i=0;i<this.tmap.length;i++){
            if (root.classname.length > tmap[i].classname.length){
              root = tmap[i];
            }
          }
          this.Root = root;
        }
        return this.Root.classname;
      };

      handler.getChilds = function (node){
        var cldList = [];
        var tmap    = this.tmap;
        var nodep   = "^" + node + "\\.[^\\.]+$";
        var pat     = new RegExp(nodep);
        for (var i=0;i<tmap.length;i++) {
          if (tmap[i].classname.match(pat)) {
            cldList.push(tmap[i]);
          }
        }
        return cldList;
      };

      handler.getTests = function (node) { // node is a string
        var tmap = this.tmap;
        for (var i=0;i<tmap.length;i++) {
          if (tmap[i].classname == node) {
            return tmap[i].tests;
          }
        }
        return [];
      }

      return handler;
    }, //makeTestHandler


    /**
     * runTest - event handler for the Run Test button - performs the test
    */
    runTest : function (e) {
      this.f1.setValue("Now running: " + this.tests.selected);
      // Set status bar entries (current test, no. of tests, ...)
      // Initialize progress bar
      // Make initial entry in output windows (test result, log, ...)

      // Foreach test subsumed by 'testLabel' (could be an individual test, or
      //   class with subclasses) do:

        // create iframe obj
        // create testResult obj
        // set up event listeners
        // start test


    }, //runTest


    testLoader : function()
    {

      var loader = qxunit.runner.TestLoaderStub.getInstance();
      this.debug(qx.io.Json.stringify(loader.getTestDescriptions()));

      var testResult = new qxunit.TestResult();
      testResult.addEventListener("startTest", function(e) {
        var test = e.getData();
        this.debug("Test '"+test.getFullName()+"' started.");
      });
      testResult.addEventListener("failure", function(e) {
        var ex = e.getData().exception;
        var test = e.getData().test;
        this.error("Test '"+test.getFullName()+"' failed: " +  ex.getMessage() + " - " + ex.getComment());
      });
      testResult.addEventListener("error", function(e) {
        var ex = e.getData().exception
        this.error("The test '"+e.getData().test.getFullName()+"' had an error: " + ex, ex);
      });

      loader.runTests(testResult, "qxunit.test.Lang");
      loader.runTests(testResult, "qxunit.test.Xml", "testParseSerializeXml");
    }//testLoader

  } //members

});


