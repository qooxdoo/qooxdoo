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

    this.set(
    {
      height : "100%",
      width  : "100%"
    });

    this.widgets = {};
    this.tests = {};

    // Header Pane
    this.header = this.__makeHeader();
    this.add(this.header);

    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.HorizontalSplitPane(200, "1*");
    this.add(mainsplit);
    this.mainsplit = mainsplit;
    mainsplit.setLiveResize(true);
    mainsplit.set({ height : "1*" });

    // Left
    var left = this.__makeLeft();
    this.left = left.buttview;
    this.mainsplit.addLeft(left);

    // Right
    var right = new qx.ui.layout.VerticalBoxLayout();

    right.set(
    {
      height : "100%",
      width  : "100%",
      border : "line-left"
    });

    mainsplit.addRight(right);

    // Toolbar
    this.toolbar = this.__makeToolbar();

    this.toolbar.set(
    {
      show                  : "icon",
      verticalChildrenAlign : "middle"
    });

    right.add(this.toolbar);

    // output views
    var buttview = this.__makeOutputViews();
    right.add(buttview);

    // add eventhandler now, after objects are created
    this.widgets["treeview"].getBar().getManager().addEventListener("changeSelected", this.__ehTreeSelection, this);

    this.widgets["treeview.bsb1"].setChecked(true);

    // back button and bookmark support
    this._history = qx.client.History.getInstance();

    // listen for state changes
    this._history.addEventListener("request", function(e)
    {
      var newSample = e.getData().replace("~", "/");

      if (this._currentSample != newSample) {
        this.setCurrentSample(newSample);
      }
    },
    this);
  }, // construct()




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties : {},




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // ------------------------------------------------------------------------
    //   CONSTRUCTOR HELPERS
    // ------------------------------------------------------------------------
    /**
     * Create the header widget
     *
     * @type member
     * @return {qx.ui.embed.HtmlEmbed} The header widget
     */
    __makeHeader : function()
    {
      var header = new qx.ui.embed.HtmlEmbed("<h1>" + "<span>" + "qooxdoo Demo Browser" + "</span>" + "</h1>" + "<div class='version'>qooxdoo " + qx.core.Version.toString() + "</div>");
      header.setHtmlProperty("id", "header");
      header.setStyleProperty("background", "#134275 url(" + qx.io.Alias.getInstance().resolve("demobrowser/image/colorstrip.gif") + ") top left repeat-x");
      header.setHeight(70);
      return header;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __makeToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;
      toolbar.setBorder("line-bottom");
      toolbar.setHeight(27);

      var mb = new qx.ui.toolbar.Part();
      toolbar.add(mb);
      this.widgets["toolbar.controlbutts"] = mb;

      // -- run button
      this.runbutton = new qx.ui.toolbar.Button("Run Sample", "icon/16/actions/media-playback-start.png");
      mb.add(this.runbutton);
      this.widgets["toolbar.runbutton"] = this.runbutton;
      this.runbutton.addEventListener("execute", this.runTest, this);
      this.runbutton.setToolTip(new qx.ui.popup.ToolTip("Run/reload selected sample"));

      // -- previous navigation
      var prevbutt = new qx.ui.toolbar.Button("Previous Sample", "icon/16/actions/go-left.png");
      mb.add(prevbutt);
      this.widgets["toolbar.prevbutt"] = prevbutt;
      prevbutt.addEventListener("execute", this.playPrev, this);
      prevbutt.setToolTip(new qx.ui.popup.ToolTip("Run the previous sample"));

      // -- next navigation
      var nextbutt = new qx.ui.toolbar.Button("Next Sample", "icon/16/actions/go-right.png");
      mb.add(nextbutt);
      this.widgets["toolbar.nextbutt"] = nextbutt;
      nextbutt.addEventListener("execute", this.playNext, this);
      nextbutt.setToolTip(new qx.ui.popup.ToolTip("Run the next sample"));

      // -- spin-out sample
      var sobutt = new qx.ui.toolbar.Button("Spin out Sample", "icon/16/actions/edit-redo.png");
      mb.add(sobutt);
      this.widgets["toolbar.sobutt"] = sobutt;
      sobutt.setToolTip(new qx.ui.popup.ToolTip("Open Sample in Own Window"));

      sobutt.addEventListener("execute", function(e)
      {
        //var sampUrl = 'html/' + this._currentSample;
        var sampUrl = this.f1.getContentWindow().location.href;
        var nw = new qx.client.NativeWindow(sampUrl, "Sample");
        this.widgets["nativewindow"] = nw;
        nw.setDimension(700, 550);
        nw.open();
        return;
      },
      this);

      toolbar.add((new qx.ui.basic.HorizontalSpacer).set({ width : "1*" }));

      // -- sample: object summary
      var gb = new qx.ui.toolbar.Part();
      toolbar.add(gb);
      this.widgets["toolbar.sampbutts"] = gb;

      gb.set(
      {
        height : "100%",
        width  : "auto",
        border : null
      });

      gb.resetBorder();
      gb.setEnabled(false);

      var sb1 = new qx.ui.toolbar.Button("Object Summary", "icon/16/apps/accessories-magnifier.png");
      gb.add(sb1);

      sb1.set(
      {
        height : "100%",
        width  : "auto"
      });

      sb1.addEventListener("execute", function(e)
      {
        var cw = this.f1.getContentWindow();

        if (cw && cw.qx) {
          alert(cw.qx.dev.ObjectSummary.getInfo());
        } else {
          alert("Unable to access Sample namespace currently.");
        }
      },
      this);

      sb1.setToolTip(new qx.ui.popup.ToolTip("Sample Object Summary"));

      // -- sample: global pollution
      var sb2 = new qx.ui.toolbar.Button("Global Pollution", "icon/16/places/www.png");
      gb.add(sb2);

      sb2.addEventListener("execute", function(e)
      {
        var cw = this.f1.getContentWindow();

        if (cw && cw.qx) {
          alert(cw.qx.dev.Pollution.getInfo());
        } else {
          alert("Unable to access Sample namespace currently.");
        }
      },
      this);

      sb2.setToolTip(new qx.ui.popup.ToolTip("Sample Global Pollution"));

      // -- sample: dispose app
      var sb3 = new qx.ui.toolbar.Button("Dispose App", "icon/16/places/user-trash.png");
      gb.add(sb3);

      sb3.addEventListener("execute", function(e)
      {
        var cw = this.f1.getContentWindow();

        if (cw && cw.qx)
        {
          cw.qx.core.Object.dispose();
          alert("Done!");
        }
        else
        {
          alert("Unable to access Sample namespace currently.");
        }
      },
      this);

      sb3.setToolTip(new qx.ui.popup.ToolTip("Dispose Sample Application"));

      return toolbar;
    },  // __makeToolbar()


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __makeOutputViews : function()
    {
      // Main Container
      var buttview = new qx.ui.pageview.tabview.TabView();

      buttview.set(
      {
        height  : "1*",
        padding : 10
      });

      this.widgets["outputviews"] = buttview;
      this.widgets["outputviews.bar"] = buttview.getBar();

      // First Page
      var bsb1 = new qx.ui.pageview.tabview.Button("Start", "icon/16/actions/system-run.png");
      this.widgets["outputviews.demopage.button"] = bsb1;
      bsb1.setChecked(true);
      buttview.getBar().add(bsb1);

      var p1 = new qx.ui.pageview.tabview.Page(bsb1);
      p1.set({ padding : [ 5 ] });
      buttview.getPane().add(p1);

      var f1 = new qx.ui.embed.Iframe;
      this.f1 = f1;
      p1.add(f1);
      this.widgets["outputviews.demopage.page"] = f1;

      f1.set(
      {
        overflow : "auto",
        height   : "100%",
        width    : "100%",
        border   : "dark-shadow"
      });

      f1.addEventListener("load", this.__ehIframeLoaded, this);


      // Second Page
      var bsb2 = new qx.ui.pageview.tabview.Button("Log", "icon/16/mimetypes/text-ascii.png");
      buttview.getBar().add(bsb2);

      var p2 = new qx.ui.pageview.tabview.Page(bsb2);
      p2.set({ padding : [ 5 ] });
      buttview.getPane().add(p2);

      var pp2 = new qx.ui.layout.VerticalBoxLayout();
      p2.add(pp2);

      pp2.set(
      {
        height : "100%",
        width  : "100%"
      });

      // main output area
      this.f2 = new qx.ui.embed.HtmlEmbed();
      pp2.add(this.f2);

      this.f2.set(
      {
        overflow : "auto",
        height   : "1*",
        width    : "100%",
        border   : "dark-shadow",
        font     : "monospace"
      });

      this.logappender = new qx.log.appender.HtmlElement;
      this.logger = new qx.log.Logger("Demo Browser");
      this.logger.addAppender(this.logappender);

      this.f2.addEventListener("appear", function(e) {
        this.logappender.setElement(this.f2.getElement());
      }, this);

      // Third Page
      // -- Tab Button
      var bsb3 = new qx.ui.pageview.tabview.Button("Source Code", "icon/16/apps/graphics-snapshot.png");
      buttview.getBar().add(bsb3);

      // -- Tab Pane
      var p3 = new qx.ui.pageview.tabview.Page(bsb3);
      p3.set({ padding : [ 5 ] });
      buttview.getPane().add(p3);

      // -- Pane Content
      //var f3 = new qx.ui.form.TextArea("The sample source will be displayed here.");
      var f3 = new qx.ui.embed.HtmlEmbed("<div class='script'>The sample source will be displayed here.</div>");
      p3.add(f3);
      this.widgets["outputviews.sourcepage.page"] = f3;

      f3.set(
      {
        overflow : "auto",
        width    : "100%",
        height   : "100%"
      });
      f3.setHtmlProperty("id", "qx_srcview");

      return buttview;

    },  // __makeOutputViews()


    /**
     * Tree View in Left Pane
     * - only make root node; rest will befilled when iframe has loaded (with
     *   leftReloadTree)
     *
     * @type member
     * @return {var} TODOC
     */
    __makeLeft : function()
    {
      var buttview = new qx.ui.pageview.buttonview.ButtonView();

      buttview.set(
      {
        height : "100%",
        width  : "100%",
        border : "line-right"
      });

      buttview.getPane().setPadding(0);

      this.widgets["treeview"] = buttview;

      // full view
      var bsb1 = new qx.ui.pageview.buttonview.Button("Full Tree", "icon/16/actions/view-pane-tree.png");
      buttview.getBar().add(bsb1);
      this.widgets["treeview.bsb1"] = bsb1;
      bsb1.setShow("icon");
      bsb1.setToolTip(new qx.ui.popup.ToolTip("Full tree view"));

      var p1 = new qx.ui.pageview.buttonview.Page(bsb1);

      p1.set(
      {
        width           : "100%",
        height          : "100%",
        backgroundColor : "white"
      });

      buttview.getPane().add(p1);

      var tree = new qx.ui.tree.Tree("Samples");
      p1.add(tree);
      this.tree = tree;
      this.widgets["treeview.full"] = tree;
      bsb1.setUserData('tree', tree);  // for changeSelected handling

      tree.set(
      {
        width    : "100%",
        height   : "100%",
        padding  : 5,
        overflow : "auto"
      });

      tree.getManager().addEventListener("changeSelection", this.treeGetSelection, this);

      tree.addEventListener("dblclick", function(e)
      {
        if (e.getTarget() instanceof qx.ui.tree.TreeFile)
        {
          // allow treeGetSelection to run first
          qx.client.Timer.once(this.runTest, this, 50);
        }
        else
        {
          this.setCurrentSample(this.defaultUrl);
        }
      },
      this);

      // flat view
      var bsb2 = new qx.ui.pageview.buttonview.Button("Flat Tree", "icon/16/actions/view-pane-text.png");

      // buttview.getBar().add(bsb2);
      this.widgets["treeview.bsb2"] = bsb2;
      bsb2.setShow("icon");
      bsb2.setToolTip(new qx.ui.popup.ToolTip("Flat tree view (only one level of containers)"));

      var p2 = new qx.ui.pageview.buttonview.Page(bsb2);
      buttview.getPane().add(p2);

      var tree1 = new qx.ui.tree.Tree("Tests");
      p2.add(tree1);
      this.tree1 = tree1;
      this.widgets["treeview.flat"] = tree1;
      bsb2.setUserData('tree', tree1);  // for changeSelected handling

      tree1.set(
      {
        width    : "100%",
        height   : "100%",
        padding  : 5,
        overflow : "auto"
      });

      tree1.getManager().addEventListener("changeSelection", this.treeGetSelection, this);

      // fake unique tree for selection (better to have a selection on the model)
      this.tree = {};
      var that = this;

      this.tree.getSelectedElement = function()
      {
        var sel = that.widgets["treeview"].getBar().getManager().getSelected();
        var elem;

        if (sel.getLabel() == "Full Tree") {
          elem = that.widgets["treeview.full"].getSelectedElement();
        } else {
          elem = that.widgets["treeview.flat"].getSelectedElement();
        }

        return elem;
      };

      return buttview;
    },

    // ------------------------------------------------------------------------
    //   EVENT HANDLER
    // ------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    treeGetSelection : function(e)
    {
      if (!this.tree.getSelectedElement())
      {  // this is a kludge!
        return;
      }

      var treeNode = this.tree.getSelectedElement();
      var modelNode = treeNode.getUserData("modelLink");
      this.tests.selected = this.tests.handler.getFullName(modelNode);

      // update toolbar
      if (treeNode instanceof qx.ui.tree.TreeFolder)
      {
        this.widgets["toolbar.runbutton"].setEnabled(false);
        this.widgets["toolbar.prevbutt"].setEnabled(false);
        this.widgets["toolbar.nextbutt"].setEnabled(false);
        this.widgets["toolbar.sobutt"].setEnabled(false);
      }
      else
      {
        this.widgets["toolbar.runbutton"].resetEnabled();

        if (treeNode.getUserData('modelLink').getPrevSibling()) {
          this.widgets["toolbar.prevbutt"].resetEnabled();
        } else {
          this.widgets["toolbar.prevbutt"].setEnabled(false);
        }

        if (treeNode.getUserData('modelLink').getNextSibling()) {
          this.widgets["toolbar.nextbutt"].resetEnabled();
        } else {
          this.widgets["toolbar.nextbutt"].setEnabled(false);
        }
      }

      // update selection in other tree
      // -- not working!
      var selButt = this.widgets["treeview"].getBar().getManager().getSelected();

      if (selButt.getLabel() == "Full Tree")
      {
        if (modelNode.widgetLinkFlat)
        {
          this.widgets["treeview.flat"].setSelectedElement(modelNode.widgetLinkFlat);

          if (modelNode.widgetLinkFlat instanceof qx.ui.tree.TreeFolder) {
            modelNode.widgetLinkFlat.open();
          }
        }
        else
        {
          this.widgets["treeview.flat"].getManager().deselectAll();
        }
      }
      else
      {
        this.widgets["treeview.full"].setSelectedElement(modelNode.widgetLinkFull);

        if (modelNode.widgetLinkFull instanceof qx.ui.tree.TreeFolder) {
          modelNode.widgetLinkFull.open();
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    leftReloadTree : function(e)
    {
      this._sampleToTreeNodeMap = {};
      var _sampleToTreeNodeMap = this._sampleToTreeNodeMap;

      // use tree struct
      /**
       * create widget tree from model
       *
       * @param widgetR {qx.ui.tree.Tree}    [In/Out]
       *        widget root under which the widget tree will be built
       * @param modelR  {demobrowser.Tree} [In]
       *        model root for the tree from which the widgets representation
       *        will be built
       */
      function buildSubTree(widgetR, modelR)
      {
        var children = modelR.getChildren();
        var t, tt, desc;

        for (var i=0; i<children.length; i++)
        {
          var currNode = children[i];

          if (currNode.hasChildren())
          {
            t = new qx.ui.tree.TreeFolder(that.polish(currNode.label), "demobrowser/image/package18.gif");
            t.setUserData("filled", false);
            t.setUserData("node", currNode);
            t.setAlwaysShowPlusMinusSymbol(true);

            t.addEventListener("changeOpen", function(e)
            {
              if (!this.getUserData("filled"))
              {
                buildSubTree(this, this.getUserData("node"));
                this.setUserData("filled", true);
              }
            });

            if (currNode.label == "example")
            {  // TODO: hard-wired
              t.setOpen(true);
            }
          }
          else
          {
            t = new qx.ui.tree.TreeFile(that.polish(currNode.label), "demobrowser/image/method_public18.gif");
            var fullName = currNode.pwd().slice(1).join("/") + "/" + currNode.label;
            _sampleToTreeNodeMap[fullName] = t;

            desc = currNode.desc;

            // force reduced margins
            desc = desc.replace(/<p>/g, '<p style="margin:4px 0;padding:0">');
            desc = desc.replace(/<ul>/g, '<ul style="margin:4px 0;padding:0">');
            desc = desc.replace(/<ol>/g, '<ol style="margin:4px 0;padding:0">');

            if (qx.core.Variant.isSet("qx.client", "mshtml")) {
              desc = '<div style="width:200px">' + desc + '</div>';
            } else {
              desc = '<div style="max-width:200px">' + desc + '</div>';
            }

            tt = new qx.ui.popup.ToolTip(desc, "icon/32/actions/help-contents.png");
            tt.getAtom().getLabelObject().setWrap(true);
            tt.setShowInterval(200);
            t.setToolTip(tt);
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

      function buildSubTreeFlat(widgetR, modelR)
      {
        var iter = modelR.getIterator("depth");
        var currNode;

        while (currNode = iter())
        {
          // it's a container
          if (!(currNode.type && currNode.type == "test"))
          {
            if (handler.hasTests(currNode))
            {
              var fullName = handler.getFullName(currNode);
              var t = new qx.ui.tree.TreeFolder(that.polish(fullName), "demobrowser/image/package18.gif");
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
                  var c = new qx.ui.tree.TreeFile(that.polish(children[i].label), "demobrowser/image/class18.gif");
                  c.setToolTip(new qx.ui.popup.ToolTip(children[i].desc));
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

      // -- Main --------------------------------
      var ttree = this.tests.handler.ttree;
      var handler = this.tests.handler;
      var that = this;

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
      var trees = [ fulltree, flattree ];
      var stree = this.widgets["treeview"].getBar().getManager().getSelected();

      for (var i=0; i<trees.length; i++)
      {
        trees[i].resetSelected();
        trees[i].destroyContent();  // clean up before re-build
        trees[i].setUserData("modelLink", ttree);  // link top level widgets and model
      }

      // link top level model to widgets
      ttree.widgetLinkFull = fulltree;
      ttree.widgetLinkFlat = flattree;

      var selectedElement = null;  // if selection exists will be set by

      // buildSubTree* functions to a model node
      // Build the widget trees
      buildSubTree(this.widgets["treeview.full"], ttree);

      // buildSubTreeFlat(this.widgets["treeview.flat"], ttree);
      // Re-enable and Re-select
      this.widgets["treeview"].setEnabled(true);

      if (selectedElement)  // try to re-select previously selected element
      {
        // select tree element and open if folder
        if (selectedElement.widgetLinkFull)
        {
          this.widgets["treeview.full"].setSelectedElement(selectedElement.widgetLinkFull);

          if (selectedElement.widgetLinkFull instanceof qx.ui.tree.TreeFolder) {
            selectedElement.widgetLinkFull.open();
          }
        }

        if (selectedElement.widgetLinkFlat)
        {
          this.widgets["treeview.flat"].setSelectedElement(selectedElement.widgetLinkFlat);

          if (selectedElement.widgetLinkFlat instanceof qx.ui.tree.TreeFolder) {
            selectedElement.widgetLinkFlat.open();
          }
        }
      }
    },  // leftReloadTree


    /**
     * event handler for the Run Test button - performs the tests
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    runTest : function(e)
    {
      // -- Feasibility Checks -----------------
      if (!this.tests.selected) {
        return;
      }

      if (!this.widgets["toolbar.runbutton"].isEnabled()) {
        return;
      }

      if (true)
      {
        var file = this.tests.selected.replace(".", "/");

        this.setCurrentSample(file);
      }
    },  // runTest()


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @return {void} 
     */
    setCurrentSample : function(value)
    {
      if (!value) {
        return;
      }

      if (!this._sampleToTreeNodeMap) {
        return;
      }

      // -- Vars and Setup -----------------------
      this.toolbar.setEnabled(false);
      this.widgets["outputviews.bar"].getManager().setSelected(this.widgets["outputviews.demopage.button"]);
      this.widgets["outputviews.demopage.page"].setEnabled(false);
      this.widgets["treeview"].setEnabled(false);

      /*
      this.widgets["outputviews.demopage.page"].block();
      this.widgets["outputviews.demopage.page"].getBlockerNode().style.opacity = 0.5;
      this.widgets["outputviews.demopage.canvas"].setZIndex(10);
      this.widgets["outputviews.demopage.page"].hide();
      */

      var iDoc = this.widgets["outputviews.demopage.page"].getContentDocument();
      if (iDoc) 
      {
        iDoc.body.innerHTML = "";
      }
      this.widgets["outputviews.bar"].setEnabled(false);
      this.widgets["outputviews"].setEnabled(false);

      var url;
      var treeNode = this._sampleToTreeNodeMap[value];

      if (treeNode)
      {
        treeNode.setSelected(true);
        url = 'html/' + value;
      }
      else
      {
        url = this.defaultUrl;
      }

      // Clear log
      this.logappender.clear();
      this.logger.info("load demo: " + value);

      if (this._currentSample == value) {
        this.f1.reload();
      }
      else
      {
        // the guru says ...
        // it is better to use 'replace' than 'setSource', since 'replace' does not interfer
        // with the history (which is taken care of by the history manager), but there
        // has to be a loaded document
        if (this.f1.getContentWindow()) {  // loaded document?
          this.f1.getContentWindow().location.replace(url);  // use 'replace'
        } else {
          this.f1.setSource(url);  // otherwise use 'setSource'
        }
      }

      this._currentSample = value;
      this._currentSampleUrl = url;
    },  // setCurrentSample


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    __ehIframeLoaded : function(e)
    {
      var fwindow = this.f1.getContentWindow();
      var fpath   = fwindow.location.pathname;
      var path    = fwindow.location.pathname.split("/");

      //if (this._currentSampleUrl != this.defaultUrl)
      if (!fpath.match(this.defaultUrl))
      { // things to do only if a sample was loaded
        // wait for iframe to load
        if (!fwindow || !fwindow.qx || !fwindow.qx.log || !fwindow.qx.log.Logger || !fwindow.document || !fwindow.document.body)
        {
          qx.client.Timer.once(arguments.callee, this, 50);
          return;
        }

        // set logger
        fwindow.qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
        fwindow.qx.log.Logger.ROOT_LOGGER.addAppender(this.logappender);

        // delete demo description
        this.__cleanupSample(fwindow.document);

        var url = fwindow.location.href;
        var pos = url.indexOf("/html/") + 6;
        var split = url.substring(pos).split("/");
        var div = String.fromCharCode(187);

        if (split.length == 2)
        {
          var category = split[0];
          category = category.charAt(0).toUpperCase() + category.substring(1);
          var pagename = split[1].replace(".html", "").replace(/_/g, " ");
          pagename = pagename.charAt(0).toUpperCase() + pagename.substring(1);
          var title = "qooxdoo " + div + " Demo Browser " + div + " " + category + " " + div + " " + pagename;
        }
        else
        {
          var title = "qooxdoo " + div + " Demo Browser " + div + " Welcome";
        }

        // update state on example change
        var sample = path.slice(-2).join('~');
        this._history.addToHistory(sample, title);

        // load sample source code
        if (this._currentSampleUrl != this.defaultUrl)
        {
          // var src = fwindow.document.body.innerHTML;
          this.__getPageSource(this._currentSampleUrl);
        }
      }

      // enabling widgets
      this.toolbar.resetEnabled();  // in case it was disabled (for reload)
      this.widgets["outputviews.bar"].resetEnabled();
      this.widgets["outputviews.demopage.page"].resetEnabled();

      /*
      this.widgets["outputviews.demopage.page"].getBlockerNode().style.opacity = null;
      this.widgets["outputviews.demopage.page"].release();
      this.widgets["outputviews.demopage.canvas"].setZIndex(0);
      this.widgets["outputviews.demopage.page"].show();
      */

      this.widgets["outputviews"].resetEnabled();
      this.widgets["toolbar.sobutt"].resetEnabled();
      this.widgets["toolbar.sampbutts"].resetEnabled();  // in case it was disabled
      this.widgets["treeview"].resetEnabled();

      this.widgets["outputviews.demopage.button"].setLabel(this.polish(path[path.length - 1]));

    }, // __ehIframeLoaded


    __applyModifiedSample : function () 
    {
      // get source code
      var src = this.widgets["outputviews.sourcepage.page"].getValue();

      // inject into iframe document
      var iDoc = this.widgets["outputviews.demopage.page"].getContentDocument();
      if (iDoc)
      {
        iDoc.open();
        iDoc.write(src);
        iDoc.close();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    __ehTreeSelection : function(e)
    {
      if (e.getData().getUserData('tree').getSelectedElement() == null)
      {
        this.widgets["toolbar.runbutton"].setEnabled(false);
        this.widgets["toolbar.prevbutt"].setEnabled(false);
        this.widgets["toolbar.nextbutt"].setEnabled(false);
        this.widgets["toolbar.sobutt"].setEnabled(false);
      }
    },

    // ------------------------------------------------------------------------
    //   MISC HELPERS
    // ------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @type member
     * @param url {var} TODOC
     * @return {String} TODOC
     */
    __getPageSource : function(url)
    {
      var req = new qx.io.remote.Request(url);

      req.setTimeout(180000);
      req.setProhibitCaching(false);

      req.addEventListener("completed", function(evt)
      {
        var loadEnd = new Date();
        this.debug("Time to load data from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");

        var content = evt.getData().getContent();

        if (content) {
          //this.widgets["outputviews.sourcepage.page"].setValue(content);
          this.widgets["outputviews.sourcepage.page"].setHtml(this.__beautySource(content));
          //this.widgets["outputviews.sourcepage.page"].setHtml('<pre>'+qx.html.String.escape(content)+'</pre>');
          this.__sourceCodeLoaded = 1;
        }
      },
      this);

      req.addEventListener("failed", function(evt) {
        this.error("Couldn't load file: " + url);
      }, this);

      var loadStart = new Date();
      req.send();
    },


    /**
     * TODOC
     *
     * @type member
     * @param url {var} TODOC
     * @return {void} 
     */
    dataLoader : function(url)
    {
      var req = new qx.io.remote.Request(url);

      req.setTimeout(180000);
      req.setProhibitCaching(false);

      req.addEventListener("completed", function(evt)
      {
        var loadEnd = new Date();
        this.debug("Time to load data from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");

        var content = evt.getData().getContent();

        var start = new Date();
        var treeData = eval(content);

        var end = new Date();
        this.debug("Time to eval tree data: " + (end.getTime() - start.getTime()) + "ms");

        // give the browser a chance to update its UI before doing more
        qx.client.Timer.once(function()
        {
          this.tests.handler = new demobrowser.TreeDataHandler(treeData);

          var start = new Date();
          this.leftReloadTree();
          var end = new Date();
          this.debug("Time to build/display tree: " + (end.getTime() - start.getTime()) + "ms");

          // read initial state
          var state = this._history.getState();

          if (state) {
            this.setCurrentSample(state.replace("~", "/"));
          } else {
            this.setCurrentSample(this.defaultUrl);
          }
        },
        this, 0);
      },
      this);

      req.addEventListener("failed", function(evt) {
        this.error("Couldn't load file: " + url);
      }, this);

      var loadStart = new Date();
      req.send();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    playPrev : function(e)
    {
      var currSamp = this.tree.getSelectedElement();  // widget

      if (currSamp)
      {
        var otherSamp = currSamp.getUserData('modelLink').getPrevSibling().widgetLinkFull;

        if (otherSamp)
        {
          this.widgets["treeview.full"].setSelectedElement(otherSamp);
          this.runTest();
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    playNext : function(e)
    {
      var currSamp = this.tree.getSelectedElement();  // widget

      if (currSamp)
      {
        var otherSamp = currSamp.getUserData('modelLink').getNextSibling().widgetLinkFull;

        if (otherSamp)
        {
          this.widgets["treeview.full"].setSelectedElement(otherSamp);
          this.runTest();
        }
      }
    },


    __cleanupSample : function (doc) 
    {

      if (doc) 
      {
        // delete demo description
        var div = doc.getElementById("demoDescription");

        if (div && div.parentNode) {
          var remc = div.parentNode.removeChild(div);
          this.debug("Found and removed demo description");
        } else 
        {
          this.debug("No valid demo description found to remove");
        
        }
      }
    }, // cleanupSample()


    __beautySource : function (src) 
    {
      src = src.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      
      //var bsrc = "";
      var bsrc = "<pre>";
      var reg  = /(.*<script\b[^>]*?(?!\bsrc\s*=)[^>]*?>)(.*?)(?=<\/script>)/gm;
      var linep = /^.*$/gm; // matches a line
      var result;
      var eof = false;
      var line = "";
      var currBlock = ""
      var PScriptStart = /^\s*<script\b[^>]*?(?!\bsrc\s*=)[^>]*?>\s*$/i;
      var PScriptEnd = /^\s*<\/script>\s*$/i;
      var oldIndex = 0;

      while (! eof) 
      {
        result   = linep.exec(src);
        
        if (result == null) 
        {
          eof = true;
        } else 
        {
          line = result[0];
          if (line == "")
          {
            if (oldIndex == linep.lastIndex) {  // fix bug in non-IE browser
              linep.lastIndex++;
            }
          }
          oldIndex = linep.lastIndex;
           
          if (PScriptStart.exec(line)) 
          {
            // add this line to 'normal' code
            //bsrc += '<pre>'+qx.html.String.escape(currBlock + line)+'</pre>';
            bsrc += this.__beautyHtml(qx.html.String.escape(currBlock + line));
            currBlock = "";  // start new block
          } else if (PScriptEnd.exec(line)) 
          {
            // pass script block to tokenizer
            var s1 = qx.dev.Tokenizer.javaScriptToHtml(currBlock);
            //bsrc += '<div class="script"><pre>'+s1+'</pre></div>';
            bsrc += '<div class="script">'+s1+'</div>';
            currBlock = line+'\n';  // start new block
          } else // no border line 
          {
            currBlock += line+'\n';
          }
        }
      }

      // collect rest of page
      bsrc += this.__beautyHtml(qx.html.String.escape(currBlock))+'</pre>';

      
      return bsrc;
      
    }, // beautySource()


    __beautyHtml : function (str) 
    {
      var res = str;
      var PTagStart = '&lt;\/?'

      // This match function might be a bit of overkill right now, but provides
      // for later extensions (cf. Flanagan(5th), 703)
      function matchfunc (vargs) 
      {
        var s = arguments[1]+'<span class="html-tag-name">'+arguments[2]+'</span>';
        var pair, curr;
        var endT = false;

        // handle rest of submatches
        if (arguments.length -2 > 3) {
          for (var i=3; i<arguments.length-2; i++)
          {
            curr = arguments[i];
            if (curr == "/") 
            {
              endT = true;
              break;
            }
            else // handle tag attributes
            {
              var m = /\s*([^=]+?)\s*=\s*((?!&quot;)\S+|&quot;.*?&quot;)\s*/g;
              var r;

              while ((r = m.exec(curr)) != null) {
                s += ' <span class="keyword">'+r[1]+'</span>=<span class="string">'+
                      r[2].replace(/\s*$/,"")+'</span>';
              }
            }
          }
          s += (endT?"/":"");
        }
        s += '&gt;';

        return s;

      } //matchfunc()

      //res = res.replace(/(&lt;\/?)([a-zA-Z]+)\b/g, matchfunc);  // only tag start
      res = res.replace(/(&lt;\/?)([a-zA-Z]+)(.*?)(\/?)&gt;/g, matchfunc); // whole tag

      return res;
    },


    /**
     * 'Atom_1.html' -> 'Atom 1'
     *
     * @type member
     * @param str {String} TODOC
     * @return {var} TODOC
     */
    polish : function(str) {
      return str.replace(".html", "").replace("_", " ");
    },

    defaultUrl : "html/welcome.html"

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("widgets", "tests", "_sampleToTreeNodeMap", "tree");
    this._disposeObjects("header", "mainsplit", "tree1", "left", "runbutton", "toolbar", "f1", "f2", "logger", "_history", "logappender");
  }
});
