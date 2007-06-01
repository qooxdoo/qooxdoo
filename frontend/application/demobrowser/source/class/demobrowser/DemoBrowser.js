/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(demobrowser)

************************************************************************ */

/**
 * The GUI definition of the qooxdoo unit test runner.
 */

qx.Class.define("demobrowser.DemoBrowser",
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

    // Header Pane
    this.header = this.__makeHeader();
    this.add(this.header);

    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.HorizontalSplitPane(250, "1*");
    this.add(mainsplit);
    this.mainsplit = mainsplit;
    mainsplit.setLiveResize(true);
    mainsplit.set({
      height : "1*"
    });

    // Left -- is done when iframe is loaded
    var left = this.__makeLeft();
    this.left = left.buttview;
    this.mainsplit.addLeft(left);
    // fill the tree
    /* done in dataLoader function
    //var testRep = window._demoData_;
    var testRep = "";
    this.tests.handler = new demobrowser.TreeDataHandler(testRep);
    //this.tests.selected = "examples.Atom_1.html";  // pre-set selection
    this.leftReloadTree();
    */
    this.dataLoader("script/layout.js");

    // Right
    var right = new qx.ui.layout.VerticalBoxLayout();
    right.set({
      //border : "inset",
      //spacing : 10,
      //padding : 10,
      height : "100%",
      width : "100%"
    });
    mainsplit.addRight(right);

    // Toolbar
    this.toolbar = this.__makeToolbar();
    this.toolbar.set({
      height : 30,
      show   : "icon",
      verticalChildrenAlign : "middle",
      padding : [0,3]
    });
    right.add(this.toolbar);

    /*
    var groupBox = new qx.ui.groupbox.GroupBox();
    groupBox.set({
      height : "auto"
    });
    right.add(groupBox);

    var vert = new qx.ui.layout.VerticalBoxLayout();
    vert.set({
      height : "auto",
      width  : "100%"
    });
    groupBox.add(vert);
    */

    /*
    // status
    var statuspane = this.__makeStatus();
    //right.add(statuspane);
    vert.add(statuspane);
    this.widgets["statuspane"] = statuspane;
    */

    /*
    // progress bar
    var progress = this.__makeProgress();
    vert.add(progress);
    //right.add(progress);
    */

    // output views
    var buttview = this.__makeOutputViews();
    right.add(buttview);

    // add eventhandler now, after objects are created
    this.widgets["treeview"].getBar().getManager().addEventListener("changeSelected",
      function (e)
      {
        if (e.getData().tree.getSelectedElement() == null)
        {
          this.widgets["toolbar.runbutton"].setEnabled(false);
        }
      },
      this);
    this.widgets["treeview.bsb1"].setChecked(true);

    // Log Appender
    //this.debug("This should go to the dedicated log window ...");


    /*
    // Last but not least:
    // Hidden IFrame for test runs
    var iframe = new qx.ui.embed.Iframe("html/QooxdooTest.html?testclass=demobrowser.test");
    iframe.setEdge(0);
    this.iframe = iframe;
    iframe.addToDocument();
    this.setZIndex(5);

    // Get the TestLoader from the Iframe (in the event handler)
    iframe.addEventListener("load", this.ehIframeOnLoad, this);
    */

    // EXPERIMENTAL !
    //var treetest = new demobrowser.TreeTest();


  }, //constructor


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
  members: {

    // ------------------------------------------------------------------------
    //   CONSTRUCTOR HELPERS
    // ------------------------------------------------------------------------


        /**
     * Create the header widget
     *
     * @return {qx.ui.embed.HtmlEmbed} The header widget
     */
    __makeHeader : function()
    {
      var header = new qx.ui.embed.HtmlEmbed(
        "<h1>" +
        "<span>" + "qooxdoo Demo Browser" + "</span>" +
        "</h1>" +
        "<div class='version'>qooxdoo " + qx.core.Version.toString() + "</div>"
      );
      header.setHtmlProperty("id", "header");
      header.setStyleProperty(
        "background",
        "#134275 url(" +
        qx.io.Alias.getInstance().resolve("demobrowser/image/colorstrip.gif") +
        ") top left repeat-x"
      );
      header.setHeight(70);
      return header;
    },


    __makeToolbar : function () {
      var toolbar = new qx.ui.toolbar.ToolBar;

      // -- run button
      this.runbutton = new qx.ui.toolbar.Button("Run Sample", "icon/16/actions/media-playback-start.png");
      toolbar.add(this.runbutton);
      this.widgets["toolbar.runbutton"] = this.runbutton;
      this.runbutton.addEventListener("execute", this.runTest, this);
      this.runbutton.setToolTip(new qx.ui.popup.ToolTip("Run/reload selected sample"));

      // -- previous navigation
      var prevbutt = new qx.ui.toolbar.Button("Previous Sample","icon/16/actions/go-left.png");
      toolbar.add(prevbutt);
      this.widgets["toolbar.prevbutt"] = prevbutt;
      prevbutt.addEventListener("execute", this.ehDummyAlert,this);
      prevbutt.setToolTip(new qx.ui.popup.ToolTip("Run the previous sample"));

      // -- next navigation
      var nextbutt = new qx.ui.toolbar.Button("Next Sample","icon/16/actions/go-right.png");
      toolbar.add(nextbutt);
      this.widgets["toolbar.nextbutt"] = nextbutt;
      nextbutt.addEventListener("execute", this.ehDummyAlert,this);
      nextbutt.setToolTip(new qx.ui.popup.ToolTip("Run the next sample"));

      toolbar.add((new qx.ui.basic.HorizontalSpacer).set({width:"1*"}));

      // -- sample: object summary
      var gb = new qx.ui.toolbar.Part();
      toolbar.add(gb);
      this.widgets["toolbar.sampbutts"] = gb;
      gb.set({height : "100%", width : "auto", border : null});
      gb.resetBorder();
      gb.setEnabled(false);
      

      var sb1 = new qx.ui.toolbar.Button("Object Summary", "icon/16/apps/accessories-magnifier.png");
      gb.add(sb1);
      sb1.set({ height : "100%", width : "auto" });
      sb1.addEventListener("execute", function (e) 
      {
        var cw = this.f1.getContentWindow();
        if (cw && cw.qx) {
          alert(cw.qx.dev.ObjectSummary.getInfo());
        } else 
        {
          alert("Unable to access Sample namespace currently.");
        }
      },this);
      sb1.setToolTip(new qx.ui.popup.ToolTip("Sample Object Summary"));

      // -- sample: global pollution
      var sb2 = new qx.ui.toolbar.Button("Global Pollution", "icon/16/places/www.png");
      gb.add(sb2);
      sb2.addEventListener("execute", function (e) 
      {
        var cw = this.f1.getContentWindow();
        if (cw && cw.qx) {
          alert(cw.qx.dev.Pollution.getInfo());
        } else 
        {
          alert("Unable to access Sample namespace currently.");
        }
      },this);
      sb2.setToolTip(new qx.ui.popup.ToolTip("Sample Global Pollution"));

      // -- sample: dispose app
      var sb3 = new qx.ui.toolbar.Button("Dispose App", "icon/16/places/user-trash.png");
      gb.add(sb3);
      sb3.addEventListener("execute", function (e) 
      {
        var cw = this.f1.getContentWindow();
        if (cw && cw.qx) {
          cw.qx.core.Object.dispose();
          alert("Done!");
        } else 
        {
          alert("Unable to access Sample namespace currently.");
        }
      },this);
      sb3.setToolTip(new qx.ui.popup.ToolTip("Dispose Sample Application"));

      return toolbar;
    }, //makeToolbar


    __makeOutputViews : function ()
    {

      // Main Container
      var buttview = new qx.ui.pageview.tabview.TabView();
      buttview.set({
        height : "1*"
      });
      this.widgets["outputviews.bar"] = buttview.getBar();

      var bsb1 = new qx.ui.pageview.tabview.Button("Demo Page", "icon/16/actions/system-run.png");
      this.widgets["outputviews.demopage.button"] = bsb1;
      var bsb2 = new qx.ui.pageview.tabview.Button("Log", "icon/16/mimetypes/text-ascii.png");
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

      // First Page
      //var f1 = new qx.ui.embed.Iframe('html/example/Atom_1.html');
      var f1 = new qx.ui.embed.Iframe('');
      this.f1 = f1;
      p1.add(f1);
      f1.set({
        overflow: "auto",
        height : "100%",
        width : "100%"
      });

      f1.addEventListener("load", function(e) 
      {
        var fwindow = this.f1.getContentWindow();
        if ( // wait for iframe to load
          !fwindow ||
          !fwindow.qx ||
          !fwindow.qx.log ||
          !fwindow.qx.log.Logger)
        {
          qx.client.Timer.once(arguments.callee, this, 50);
          return;
        }
        this.toolbar.setEnabled(true);  // in case it was disabled (for reload)
        // set logger
        fwindow.qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
        fwindow.qx.log.Logger.ROOT_LOGGER.addAppender(this.logappender);
        // delete demo description
        var div = fwindow.document.getElementById("demoDescription");
        if (div && div.parentNode) {
          div.parentNode.removeChild(div);
        }
        // enable sample buttons
        this.widgets["toolbar.sampbutts"].resetEnabled(); // in case it was disabled
      }, this);

      // Second Page
      var pp2 = new qx.ui.layout.VerticalBoxLayout();
      p2.add(pp2);
      pp2.set({
        height : "100%",
        width  : "100%"
      });

      // main output area
      //this.f2 = new qx.ui.form.TextArea("Session Log, listing test invokations and all outputs");
//      this.f2 = new qx.ui.embed.HtmlEmbed('<div id="sessionlog">Session Log</div>');
      this.f2 = new qx.ui.embed.NodeEmbed("qx_divlog");
      pp2.add(this.f2);
//      this.f2.setHtmlProperty("id","sessionlog");
      this.f2.set({
        overflow : "auto",
        height : "1*",
        width : "100%"
      });
/*
      this.f2.setStyleProperty("fontSize",12);
      this.f2.setStyleProperty("fontFamily",'"Bitstream Vera Sans Mono", "Courier New", "Courier", monospace');

      // toolbar
      var ff1 = new qx.ui.toolbar.ToolBar;
      pp2.add(ff1);

      var ff1_b1 = new qx.ui.toolbar.Button("Clear");
      ff1.add(ff1_b1);
      ff1_b1.set({
        border : "outset"
        //width : "auto"
      });
      ff1_b1.addEventListener("execute", function (e) {
        this.f2.setHtml("");
      }, this);

      var ff1_b2 = new qx.ui.toolbar.Button("Save As");
      //ff1.add(ff1_b2);
      ff1_b2.set({
        border : "outset"
        //width : "auto"
      });
      ff1_b2.addEventListener("execute", function (e) {
        var c = (this.f2.getHtml());
        var w = window.open('','');
        //var w = new qx.ui.window.Window("Session Log");
      }, this);
*/
      // log appender
      this.logappender = new demobrowser.LogAppender(this.f2);
      //this.logappender = new qx.log.WindowAppender("qooxdoo Test Runner");
      //this.logappender = new qx.log.DivAppender("sessionlog");
      this.logappender = new qx.log.appender.Div("qx_divlog");
//AE      this.logappender = new demobrowser.LogAppender(this.f2);
      //this.getLogger().getParentLogger().getParentLogger().addAppender(this.logappender);
      qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
      qx.log.Logger.ROOT_LOGGER.addAppender(this.logappender);


      // Third Page
      // -- Tab Button
      var bsb3 = new qx.ui.pageview.tabview.Button("Source Code","icon/16/apps/graphics-snapshot.png");
      //buttview.getBar().add(bsb3);

      // -- Tab Pane
      var p3 = new qx.ui.pageview.tabview.Page(bsb3);
      p3.set({
        padding : [5]
      });
      buttview.getPane().add(p3);

      // -- Pane Content
      var f3 =  new qx.ui.embed.HtmlEmbed("The sample source code should go here.");
      p3.add(f3);


      return buttview;
    }, //makeOutputViews

    // -------------------------------------------------------------------------

    /**
     * Tree View in Left Pane
     * - only make root node; rest will befilled when iframe has loaded (with
     *   leftReloadTree)
    */
    __makeLeft: function ()
    {
      /*
      var leftSide = new qx.ui.layout.VerticalBoxLayout();
      leftSide.set({
        height : "80%",
        width  : "100%"
      });
      */
      var leftSide = new qx.ui.splitpane.VerticalSplitPane("80%","20%");
      leftSide.set({
        height : "100%",
        width  : "100%"
      });

      var buttview = new qx.ui.pageview.buttonview.ButtonView();
      leftSide.addTop(buttview);
      leftSide.buttview = buttview;
      buttview.set({
        height : "100%",
        width  : "100%"
      });
      //buttview.setBorder(null);
      buttview.getBar().set({
        backgroundColor : "#E1EEFF",
        height          : 29
      });
      this.widgets["treeview"] = buttview;
      buttview.getPane().set({
        overflow: "auto"
      });

      // full view
      var bsb1 = new qx.ui.pageview.buttonview.Button("Full Tree","icon/16/actions/view-pane-tree.png");
      buttview.getBar().add(bsb1);
      this.widgets["treeview.bsb1"] = bsb1;
      bsb1.setShow("icon");
      bsb1.setToolTip(new qx.ui.popup.ToolTip("Full tree view"));

      var p1 = new qx.ui.pageview.buttonview.Page(bsb1);
      p1.set({
        width   : "100%",
        height  : "100%",
        padding : [0]
        //spacing   : 5
      });
      buttview.getPane().add(p1);

      var tree = new qx.ui.tree.Tree("Samples");
      p1.add(tree);
      this.tree = tree;
      this.widgets["treeview.full"] = tree;
      bsb1.tree = tree;    // for changeSelected handling
      tree.set({
        width : "100%",
        height : "100%",
        backgroundColor: "white"
      });
      tree.getManager().addEventListener("changeSelection", this.treeGetSelection, this);
      tree.addEventListener("dblclick", function (e) 
      {
        qx.client.Timer.once(this.runTest, this, 50);  // allow treeGetSelection to run first
      }, this);

      // flat view
      var bsb2 = new qx.ui.pageview.buttonview.Button("Flat Tree","icon/16/actions/view-pane-text.png");
      //buttview.getBar().add(bsb2);
      this.widgets["treeview.bsb2"] = bsb2;
      bsb2.setShow("icon");
      bsb2.setToolTip(new qx.ui.popup.ToolTip("Flat tree view (only one level of containers)"));

      var p2 = new qx.ui.pageview.buttonview.Page(bsb2);
      p2.set({
        padding : [5]
      });
      buttview.getPane().add(p2);

      var tree1 = new qx.ui.tree.Tree("Tests");
      p2.add(tree1);
      this.tree1 = tree1;
      this.widgets["treeview.flat"] = tree1;
      bsb2.tree = tree1;    // for changeSelected handling
      tree1.set({
        width : "100%",
        height : "100%",
        //padding : [10],
        overflow: "auto",
        //border : "inset",
        backgroundColor: "white"
      });
      tree1.getManager().addEventListener("changeSelection", this.treeGetSelection, this);

      // fake unique tree for selection (better to have a selection on the model)
      this.tree = {};
      var that  = this;
      this.tree.getSelectedElement = function ()
      {
        var sel = that.widgets["treeview"].getBar().getManager().getSelected();
        var elem;
        if (sel.getLabel() == "Full Tree")
        {
          elem = that.widgets["treeview.full"].getSelectedElement();
        } else
        {
          elem = that.widgets["treeview.flat"].getSelectedElement();
        }

        return elem;
      };

      // Info Pane
      var infop = new qx.ui.embed.HtmlEmbed("");
      leftSide.addBottom(infop);
      infop.set({
        width    : "100%",
        height   : "100%",
        overflow : "auto",
        border   : "dark-shadow",
        backgroundColor : "white"
      });
      infop.setStyleProperty("fontSize",12);
      this.widgets["left.info"] = infop;


      return leftSide;
    }, //makeLeft


    // -------------------------------------------------------------------------

    __makeProgress: function ()
    {
      var progress = new qx.ui.layout.HorizontalBoxLayout();
      progress.set({
        height: "auto",
        padding: [10],
        spacing : 10,
        width : "100%"
      });

      var progressb = new demobrowser.ProgressBar();
      progress.add(progressb);
      progressb.set({
        showStepStatus: true,
        showPcntStatus: true,
        barColor: "#36a618"
      });
      this.widgets["progresspane"] = progress;
      this.widgets["progresspane.progressbar"] = progressb;
      progress.add(new qx.ui.toolbar.Separator);

      /* Wishlist:
      var progressb = new qx.ui.component.ProgressBar();
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
      failcnt.set({
        backgroundColor : "#C1ECFF"
      });

      progress.add(new qx.ui.basic.Label("Succeeded: "));
      var succcnt = new qx.ui.basic.Label("0");
      progress.add(succcnt);
      succcnt.set({
        backgroundColor : "#C1ECFF"
      });
      this.widgets["progresspane.succ_cnt"] = succcnt;
      this.widgets["progresspane.fail_cnt"] = failcnt;

      return progress;
    }, //makeProgress


    // -------------------------------------------------------------------------

    __makeStatus: function (){
      var statuspane = new qx.ui.layout.HorizontalBoxLayout();
      statuspane.set({
        padding: [10],
        spacing : 10,
        height : "auto",
        width : "100%"
      });
      // Test Info
      statuspane.add(new qx.ui.basic.Label("Selected Test: "));
      var l1 = new qx.ui.basic.Label("");
      statuspane.add(l1);
      l1.set({
        backgroundColor : "#C1ECFF"
      });
      this.widgets["statuspane.current"] = l1;
      statuspane.add(new qx.ui.basic.Label("Number of Tests: "));
      var l2 = new qx.ui.basic.Label("");
      statuspane.add(l2);
      l2.set({
        backgroundColor : "#C1ECFF"
      });
      this.widgets["statuspane.number"] = l2;


      statuspane.add((new qx.ui.basic.HorizontalSpacer).set({width:"1*"}));

      // System Info
      statuspane.add(new qx.ui.basic.Label("System Status: "));
      var l3 = new qx.ui.basic.Label("");
      statuspane.add(l3);
      l3.set({
        width : 150
      });
      this.widgets["statuspane.systeminfo"] = l3;
      this.widgets["statuspane.systeminfo"].setText("Loading...");

      return statuspane;
    }, //makeStatus


    // ------------------------------------------------------------------------
    //   EVENT HANDLER
    // ------------------------------------------------------------------------

    treeGetSelection : function (e) {
      if (! this.tree.getSelectedElement()) {// this is a kludge!
        return; }
      var treeNode    = this.tree.getSelectedElement();
      var modelNode   = treeNode.getUserData("modelLink");
      this.tests.selected = this.tests.handler.getFullName(modelNode);
      // update toolbar
      if (treeNode instanceof qx.ui.tree.TreeFolder) 
      {
        this.widgets["toolbar.runbutton"].setEnabled(false);
      } else
      {
        this.widgets["toolbar.runbutton"].resetEnabled();
      }
      // update selection in other tree
      // -- not working!
      var selButt = this.widgets["treeview"].getBar().getManager().getSelected();
      if (selButt.getLabel() == "Full Tree")
      {
        if (modelNode.widgetLinkFlat){
          this.widgets["treeview.flat"].setSelectedElement(modelNode.widgetLinkFlat);
          if (modelNode.widgetLinkFlat instanceof qx.ui.tree.TreeFolder)
          {
            modelNode.widgetLinkFlat.open();
          }
        } else
        {
          this.widgets["treeview.flat"].getManager().deselectAll();
        }
      } else
      {
        this.widgets["treeview.full"].setSelectedElement(modelNode.widgetLinkFull);
        if (modelNode.widgetLinkFull instanceof qx.ui.tree.TreeFolder)
        {
          modelNode.widgetLinkFull.open();
        }
      }

    }, //treeGetSelection

    
    runNeighbour : function (e) 
    {
      if (! this.tree.getSelectedElement()) {// this is a kludge!
        return; }
      var treeNode    = this.tree.getSelectedElement();
      var modelNode   = treeNode.getUserData("modelLink");
      var modelNext   = modelNode.getNextSibling();
      this.tests.selected = this.tests.handler.getFullName(modelNode);
      
    }, //runNeighbour


    // -------------------------------------------------------------------------

    leftReloadTree : function (e) {  // use tree struct

      /**
       * create widget tree from model
       *
       * @param widgetR {qx.ui.tree.Tree}    [In/Out]
       *        widget root under which the widget tree will be built
       * @param modelR  {demobrowser.Tree} [In]
       *        model root for the tree from which the widgets representation
       *        will be built
       */
      function buildSubTree (widgetR, modelR)
      {
        var children = modelR.getChildren();
        var t;
        for (var i=0; i<children.length; i++)
        {
          var currNode = children[i];
          if (currNode.hasChildren())
          {
            t = new qx.ui.tree.TreeFolder(that.polish(currNode.label),"demobrowser/image/package18.gif");
            if (currNode.label == "example") { // TODO: hard-wired
              t.setOpen(true);
            }
            buildSubTree(t,currNode);
          } else
          {
            t = new qx.ui.tree.TreeFile(that.polish(currNode.label),"demobrowser/image/method_public18.gif");
            //t.setToolTip(new qx.ui.popup.ToolTip(currNode.desc).setHideInterval(1000000));
            t.addEventListener("mouseover",function (e) 
            {
              var desc = e.getCurrentTarget().getUserData('modelLink').desc;
              that.widgets["left.info"].setHtml(desc);
            },this);
          }
          // make connections
          widgetR.add(t);
          t.setUserData("modelLink", currNode);
          currNode.widgetLinkFull = t;
          if (that.tests.handler.getFullName(currNode) == that.tests.selected)
          {
            selectedElement = currNode;
          }
        }

      }; //buildSubTree;


      function buildSubTreeFlat (widgetR, modelR)
      {
        var iter = modelR.getIterator("depth");
        var currNode;
        while (currNode = iter())
        {
          if (currNode.type && currNode.type == "test")
            ;
          else  // it's a container
          {
            if (handler.hasTests(currNode)) {
              var fullName = handler.getFullName(currNode);
              var t = new qx.ui.tree.TreeFolder(that.polish(fullName),"demobrowser/image/package18.gif");
              widgetR.add(t);
              t.setUserData("modelLink", currNode);
              currNode.widgetLinkFlat = t;
              if (that.tests.handler.getFullName(currNode) == that.tests.selected)
              {
                selectedElement = currNode;
              }
              var children = currNode.getChildren();
              for (var i=0; i<children.length; i++)
              {
                if (children[i].type && children[i].type == "test")
                {
                  var c = new qx.ui.tree.TreeFile(that.polish(children[i].label),"demobrowser/image/class18.gif");
                  c.setToolTip(new qx.ui.popup.ToolTip(children[i].desc));
                  t.add(c);
                  c.setUserData("modelLink", children[i]);
                  children[i].widgetLinkFlat = c;
                  if (that.tests.handler.getFullName(children[i]) == that.tests.selected)
                  {
                    selectedElement = children[i];
                  }
                }
              }
            }
          }
        }
      }; //buildSubTreeFlat

      // -- Main --------------------------------

      var ttree   = this.tests.handler.ttree;
      var handler = this.tests.handler;
      var that    = this;

      /*
      // Reset Status Pane Elements
      this.widgets["statuspane.current"].setText("");
      this.widgets["statuspane.number"].setText("");
      */

      // Disable Tree View
      this.widgets["treeview"].setEnabled(false);

      // Handle current Tree Selection and Content
      var fulltree = this.widgets["treeview.full"];
      var flattree = this.widgets["treeview.flat"];
      var trees    = [fulltree, flattree];
      var stree    = this.widgets["treeview"].getBar().getManager().getSelected();

      for (var i=0; i<trees.length; i++)
      {
        trees[i].resetSelected();
        trees[i].destroyContent(); // clean up before re-build
        trees[i].setUserData("modelLink", ttree); // link top level widgets and model
      }
      // link top level model to widgets
      ttree.widgetLinkFull = fulltree;
      ttree.widgetLinkFlat = flattree;

      var selectedElement = null; // if selection exists will be set by
                                  // buildSubTree* functions to a model node
      // Build the widget trees
      buildSubTree(this.widgets["treeview.full"],ttree);
      buildSubTreeFlat(this.widgets["treeview.flat"],ttree);

      // Re-enable and Re-select
      this.widgets["treeview"].setEnabled(true);
      if (selectedElement)  // try to re-select previously selected element
      {
        // select tree element and open if folder
        if (selectedElement.widgetLinkFull) {
          this.widgets["treeview.full"].setSelectedElement(selectedElement.widgetLinkFull);
          if (selectedElement.widgetLinkFull instanceof qx.ui.tree.TreeFolder)  {
            selectedElement.widgetLinkFull.open();
          }
        }
        if (selectedElement.widgetLinkFlat) {
          this.widgets["treeview.flat"].setSelectedElement(selectedElement.widgetLinkFlat);
          if (selectedElement.widgetLinkFlat instanceof qx.ui.tree.TreeFolder) {
            selectedElement.widgetLinkFlat.open();
          }
        }
      }

    }, //leftReloadTree


    // -------------------------------------------------------------------------
    /**
     * event handler for the Run Test button - performs the tests
     */
    runTest : function (e)
    {

      // -- Feasibility Checks -----------------
      if (! this.tests.selected)
      {
        return;
      }
      if (! this.widgets["toolbar.runbutton"].isEnabled())
      {
        return;
      }

      // -- Vars and Setup -----------------------
      this.toolbar.setEnabled(false);
      //this.tree.setEnabled(false);

      // TODO: do not use appender internals
      this.logappender._logElem.innerHTML = "";  

//      this.info("Now running: " + this.tests.selected);
      this.widgets["outputviews.bar"].getManager().setSelected(this.widgets["outputviews.demopage.button"]);

      // start test

      var that    = this;
      var tlist   = [];
      var tlist1  = [];
      var handler = this.tests.handler;

      // -- Helper Functions ---------------------

      /**
       * build up a list that will be used by runtest() as input (var tlist)
      */
      function buildList(node) // node is a modelNode
      {
        var tlist = [];
        var path = handler.getPath(node);
        var tclass = path.join(".");

        if (node.hasChildren()) {
          var children = node.getChildren();
          for (var i=0; i<children.length; i++)
          {
            if (children[i].hasChildren()){
              tlist = tlist.concat(buildList(children[i]));
            } else {
              tlist.push([tclass, children[i].label]);
            }
          }
        } else {
          tlist.push([tclass, node.label]);
        }
        return tlist;
      }; //buildList


      // -- Main ---------------------------------

      var file = this.tests.selected.replace(".","/");
      var base = file.substring(file.indexOf("/")+1);
      var neu  = 'html/'+file;
      var curr = this.f1.getSource();
      if (curr == neu) 
      {
        this.f1.reload();
      } else 
      {
        this.f1.setSource(neu);
      }
      this.widgets["outputviews.demopage.button"].setLabel(this.polish(base));

    }, //runTest


    // -------------------------------------------------------------------------
    /**
     * reloads iframe's URL
     */
    reloadTestSuite : function (e)
    {
      var curr = this.iframe.getSource();
      var neu  = this.testSuiteUrl.getValue();
      this.toolbar.setEnabled(false);
      this.widgets["statuspane.systeminfo"].setText("Reloading test suite...");
      // reset status information
      this.resetGui();
      qx.client.Timer.once(function () {
        if (curr == neu) {
          this.iframe.reload();
        } else {
          this.iframe.setSource(neu);
        }
      },this,0);
    }, //reloadTestSuite


    ehIframeOnLoad : function (e)
    {
      var iframe = this.iframe;

      this.frameWindow = iframe.getContentWindow();

      if (
        !this.frameWindow ||
        !this.frameWindow.demobrowser ||
        !this.frameWindow.demobrowser.TestLoader ||
        !this.frameWindow.demobrowser.TestLoader.getInstance()
      ) { // wait for the iframe to load
        qx.client.Timer.once(arguments.callee, this, 50);
        return;
      }

      this.loader = this.frameWindow.demobrowser.TestLoader.getInstance();
      this.loader.getLogger().getParentLogger().addAppender(this.logappender);
      var testRep = this.loader.getTestDescriptions();
      this.tests.handler = new demobrowser.TreeDataHandler(testRep);
      this.tests.firstrun = true;
      this.leftReloadTree();
      this.toolbar.setEnabled(true);  // in case it was disabled (for reload)
      this.reloadswitch.setChecked(false);  // disable for first run
      if (this.tests.run_pending) {   // do we have pending tests to run?
        this.tests.run_pending();
        delete this.tests.run_pending;
      }
      this.widgets["statuspane.systeminfo"].setText("Ready");

    }, //ehIframeOnLoad


    // ------------------------------------------------------------------------
    //   MISC HELPERS
    // ------------------------------------------------------------------------

    resetGui : function ()
    {
      this.resetProgress();
      this.resetTabView();
    },


    resetProgress : function ()
    {
      var bar = this.widgets["progresspane.progressbar"];
      bar.reset();
      bar.setBarColor("#36a618");
      this.setSuccCnt(0);
      this.setFailCnt(0);
    },


    resetTabView : function ()
    {
      this.f1.clear();
    },


    _applySuccCnt : function (newSucc)
    {
      this.widgets["progresspane.succ_cnt"].setText(newSucc+"");
    },


    _applyFailCnt : function (newFail)
    {
      this.widgets["progresspane.fail_cnt"].setText(newFail+"");
    },


    dataLoader : function (url) 
    {
      var req = new qx.io.remote.Request(url);

      req.setTimeout(180000);

      req.addEventListener("completed", function(evt)
      {
        var loadEnd = new Date();
        this.debug("Time to load data from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");

        var content = evt.getData().getContent();

        var start = new Date();

        // extracting the meat
        var data  = content.match('_demoData_ = .*\n\n')[0];
        var treeData = eval(data);

        var end = new Date();
        this.debug("Time to eval tree data: " + (end.getTime() - start.getTime()) + "ms");

        // give the browser a chance to update its UI before doing more
        qx.client.Timer.once(function() {

          this.tests.handler = new demobrowser.TreeDataHandler(treeData);
          this.leftReloadTree();

        }, this, 0);
      }, this);

      req.addEventListener("failed", function(evt) {
        this.error("Couldn't load file: " + url);
      }, this);

      var loadStart = new Date();
      req.send();
    },


    ehDummyAlert : function (e) 
    {
      alert("Not yet implemented!"); 
    },


    /**
     * 'Atom_1.html' -> 'Atom 1'
     */
    polish : function (str) 
    {
      return str.replace(".html","").replace("_"," ");
    },


    appender : function (str) {
      //this.f1.setValue(this.f1.getValue() + str);
      //this.f1.setHtml(this.f1.getHtml()+"<br>"+str);
    } //appender


  } //members

});


