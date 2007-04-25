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
    });
    this.widgets = {};
    this.tests   = {};

    // Hidden IFrame for test runs
    var iframe = new qx.ui.embed.Iframe("html/QooxdooTest.html?testclass=qxunit.test");
    iframe.setEdge(0);
    this.iframe = iframe;
    iframe.addToDocument();

    this.setBackgroundColor("threedface");
    this.setZIndex(5);

    // Get the TestLoader from the Iframe
    iframe.addEventListener("load", function (e) {
      this.loader = iframe.getContentWindow().qxunit.TestLoader.getInstance();
      var testRep = this.loader.getTestDescriptions();
      this.tests.handler = new qxunit.runner.TestHandler(testRep);
      //this.debug(qx.io.Json.stringify(testRep));
      if (! this.left) {
        var left = this.__makeLeft();
        this.left = left;
        this.mainsplit.addLeft(left);
      } else {
        this.leftReloadTree();
      }
      this.toolbar.setEnabled(true);  // in case it was disabled (for reload)
    }, this);

    // Header Pane
    this.header = new qx.ui.embed.HtmlEmbed("<center><h1>QxRunner - The qooxdoo Test Runner</h1></center>");
    this.header.setHtmlProperty("className", "header");
    this.header.setHeight(80);
    this.add(this.header);

    // Toolbar
    this.toolbar = new qx.ui.toolbar.ToolBar;
    this.add(this.toolbar);

    this.runbutton = new qx.ui.toolbar.Button("Run Test", "icon/16/actions/media-playback-start.png");
    this.toolbar.add(this.runbutton);
    this.runbutton.addEventListener("execute", this.runTest, this);
    this.toolbar.add(new qx.ui.toolbar.Separator);

    this.reloadbutton = new qx.ui.toolbar.Button("Reload", "icon/16/actions/view-refresh.png");
    this.toolbar.add(this.reloadbutton);
    this.testSuiteUrl = new qx.ui.form.TextField("html/QooxdooTest.html?testclass=qxunit.test");
    this.toolbar.add(this.testSuiteUrl);
    this.testSuiteUrl.set({
      width : 250
      //font  : new qx.renderer.font.Font(6,"Times")
    });
    this.reloadbutton.addEventListener("execute", this.reloadTestSuite, this);



    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.HorizontalSplitPane(250, "1*");
    this.add(mainsplit);
    this.mainsplit = mainsplit;
    mainsplit.setLiveResize(true);
    mainsplit.set({
      height : "1*"
    });
    // Left
    /*
    var left = this.__makeLeft();
    mainsplit.addLeft(left);
    */

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
    this.widgets["statuspane"] = statuspane;

    // progress bar
    var progress = this.__makeProgress();
    right.add(progress);

    // button view
    var buttview = this.__makeButtonView();
    right.add(buttview);

  }, //constructor


  members: {

    /*
    _onreadystatechange : function()
      {
        if (this.getDocumentNode().readyState == "complete") {
          this.iframe.set({display: false});
        }
      },
      */

    appendr : function (str) {
      //this.f1.setValue(this.f1.getValue() + str);
      this.f1.setHtml(this.f1.getHtml()+"<br>"+str);
    }, //appender


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


      // First Page
      var pp1 = new qx.ui.layout.VerticalBoxLayout();
      p1.add(pp1);
      pp1.set({
        height : "100%",
        width  : "100%"
      });

      var f1 = new qx.ui.embed.HtmlEmbed("Results of the current Test");
      this.f1 = f1;
      pp1.add(f1);
      f1.set({
        overflow: "auto",
        height : "95%",
        width : "100%"
        //border : "inset",
        //padding : [10]
      });

      var ff1    = new qx.ui.toolbar.ToolBar;
      var ff1_b1 = new qx.ui.toolbar.Button("Clear");
      ff1.add(ff1_b1);
      ff1_b1.set({
        //bottom: 5,
        //top:    300,
        width : "auto"
      });
      ff1_b1.addEventListener("execute", function (e) {
        this.f1.setHtml("");
      }, this);
      pp1.add(ff1);

      // Second Page
      var f2 = new qx.ui.form.TextArea("Session Log, listing test invokations and all outputs");
      p2.add(f2);
      return buttview;
    }, //makeButtonView

    /**
     * Tree View in Left Pane
    */
    __makeLeft: function (){
      var that   = this;

      /*
      var node = this.tests.handler.getRoot();
      this.debug("Root node: " + node);
      this.tests.handler.getChilds(node);
      this.tests.handler.getTests(node);
      */
      var tmap = this.tests.handler.tmap;

      //var left = new qx.ui.tree.Tree("Test Classes");
      var left = new qx.ui.tree.Tree("All");
      left.set({
        width : "100%",
        height : "100%",
        padding : [10],
        overflow: "auto",
        border : "inset"
      });

      // fill the tree
      this.left = left; // only because leftReloadTree needs it
      this.leftReloadTree(null);

      left.getManager().addEventListener("changeSelection", this.leftGetSelection, this);

      return left;
    }, //makeLeft


    leftGetSelection : function (e) {
      this.tests.selected = e.getData()[0]._labelObject.getText();
      this.appendr(this.tests.selected);
      this.widgets["statuspane.current"].setText(this.tests.selected);
      this.tests.selected_cnt = this.tests.handler.testCount(this.tests.selected);
      this.widgets["statuspane.number"].setText(this.tests.selected_cnt+"");
    }, //leftGetSelection

    leftReloadTree : function (e) {
      var tmap = this.tests.handler.tmap;
      var left = this.left;
      left.removeAll();
      for (var i=0; i<tmap.length; i++) {
        var f = new qx.ui.tree.TreeFolder(tmap[i].classname);
        left.add(f);
        for (var j=0; j<tmap[i].tests.length; j++) {
          f.add(new qx.ui.tree.TreeFile(tmap[i].tests[j]));
        }
      }
    }, //leftReloadTree


    __makeProgress: function (){
      var progress = new qx.ui.layout.HorizontalBoxLayout();
      progress.set({
        border: "inset",
        height: "auto",
        padding: [5],
        spacing : 10,
        width : "100%"
      });
      //progress.add(new qx.ui.basic.Label("Progress: "));
      var progressb = new qxunit.runner.ProgressBar();
      progress.add(progressb);
      this.widgets["progresspane"] = progress;
      this.widgets["progresspane.progressbar"] = progressb;
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
      //progress.add(new qx.ui.basic.Label("(7/15)  (63%)"));
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
      statuspane.add(new qx.ui.basic.Label("Selected Test: "));
      var l1 = new qx.ui.basic.Label("");
      statuspane.add(l1);
      l1.set({
        backgroundColor : "#C1ECFF"
      });
      this.widgets["statuspane.current"] = l1;
      statuspane.add(new qx.ui.basic.Label("Number of Test: "));
      var l2 = new qx.ui.basic.Label("");
      statuspane.add(l2);
      l2.set({
        backgroundColor : "#C1ECFF"
      });
      this.widgets["statuspane.number"] = l2;

      return statuspane;
    }, //makeStatus


    /**
     * runTest - event handler for the Run Test button - performs the test
     */
    runTest : function (e) {
      this.toolbar.setEnabled(false);
      this.appendr("Now running: " + this.tests.selected);
      // Initialize progress bar
      this.widgets["progresspane.progressbar"].update("0%");
      // Make initial entry in output windows (test result, log, ...)

      // Foreach test subsumed by 'testLabel' (could be an individual test, or
      //   class with subclasses) do:

        // create iframe obj
        // create testResult obj
        var tstCnt = this.tests.selected_cnt;
        var tstCurr = 1;
        var testResult = new qxunit.TestResult();
        // set up event listeners
        testResult.addEventListener("startTest", function(e) {
          var test = e.getData();
          this.appendr("Test '"+test.getFullName()+"' started.");
          this.widgets["progresspane.progressbar"].update(String(tstCurr+"/"+tstCnt));
          tstCurr++;
        }, this);
        testResult.addEventListener("failure", function(e) {
          var ex = e.getData().exception;
          var test = e.getData().test;
          this.appendr("Test '"+test.getFullName()+"' failed: " +  ex.getMessage() + " - " + ex.getComment());
        }, this);
        testResult.addEventListener("error", function(e) {
          var ex = e.getData().exception;
          this.appendr("The test '"+e.getData().test.getFullName()+"' had an error: " + ex, ex);
        }, this);

        // start test
        var that = this;
        var tlist =[];
        function runtest() {
          if (tlist.length) {
            var test = tlist[0];
            var className = that.tests.handler.classFromTest(test);
            that.loader.runTests(testResult, className, test);
            tlist = tlist.slice(1,tlist.length);  // recurse with rest of list
            qx.client.Timer.once(runtest,this,100);
          } else { // no more tests -> enable toolbar
            that.toolbar.setEnabled(true);
          }
        };
        if (this.tests.handler.isClass(this.tests.selected)) {
          //this.loader.runTestsFromNamespace(testResult, this.tests.selected);
          tlist = this.tests.handler.getTests(this.tests.selected);
          runtest(tlist);
        } else { // on method
          /*
          var className = this.tests.handler.classFromTest(this.tests.selected);
          this.loader.runTests(testResult, className, this.tests.selected);
          */
          tlist = [this.tests.selected];
          runtest(tlist);
        }

    }, //runTest

    /**
     * reloads iframe's URL
     */
    reloadTestSuite : function (e) {
      var curr = this.iframe.getSource();
      var neu  = this.testSuiteUrl.getValue();
      this.toolbar.setEnabled(false);
      qx.client.Timer.once(function () {
        if (curr == neu) {
          this.iframe.reload();
        } else {
          this.iframe.setSource(neu);
        }
      },this,0);
    } //reloadTestSuite

  } //members

});


