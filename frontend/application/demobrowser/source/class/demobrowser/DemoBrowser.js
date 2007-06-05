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
    var mainsplit = new qx.ui.splitpane.HorizontalSplitPane(250, "1*");
    this.add(mainsplit);
    this.mainsplit = mainsplit;
    mainsplit.setLiveResize(true);
    mainsplit.set({ height : "1*" });

    // Left -- is done when iframe is loaded
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
    this.widgets["treeview"].getBar().getManager().addEventListener("changeSelected", function(e)
    {
      if (e.getData().getUserData('tree').getSelectedElement() == null) {
        this.widgets["toolbar.runbutton"].setEnabled(false);
        this.widgets["toolbar.prevbutt"].setEnabled(false);
        this.widgets["toolbar.nextbutt"].setEnabled(false);
      }
    },
    this);

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
    }, this);

  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

  },




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
    },


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
      buttview.set({ height : "1*", padding : 10 });
      this.widgets["outputviews.bar"] = buttview.getBar();

      var bsb1 = new qx.ui.pageview.tabview.Button("Start", "icon/16/actions/system-run.png");
      this.widgets["outputviews.demopage.button"] = bsb1;
      var bsb2 = new qx.ui.pageview.tabview.Button("Log", "icon/16/mimetypes/text-ascii.png");
      bsb1.setChecked(true);
      buttview.getBar().add(bsb1, bsb2);

      var p1 = new qx.ui.pageview.tabview.Page(bsb1);
      p1.set({ padding : [ 5 ] });

      var p2 = new qx.ui.pageview.tabview.Page(bsb2);
      p2.set({ padding : [ 5 ] });
      buttview.getPane().add(p1, p2);

      // First Page
      var f1 = new qx.ui.embed.Iframe;
      this.f1 = f1;
      p1.add(f1);

      f1.set(
      {
        overflow : "auto",
        height   : "100%",
        width    : "100%",
        border : "dark-shadow"
      });

      f1.addEventListener("load", function(e)
      {
        var fwindow = this.f1.getContentWindow();

        // wait for iframe to load
        if (!fwindow || !fwindow.qx || !fwindow.qx.log || !fwindow.qx.log.Logger)
        {
          qx.client.Timer.once(arguments.callee, this, 50);
          return;
        }

        this.toolbar.resetEnabled();  // in case it was disabled (for reload)

        // set logger
        fwindow.qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
        fwindow.qx.log.Logger.ROOT_LOGGER.addAppender(this.logappender);

        // delete demo description
        var div = fwindow.document.getElementById("demoDescription");

        if (div && div.parentNode) {
          div.parentNode.removeChild(div);
        }

        // enable sample buttons
        this.widgets["toolbar.sampbutts"].resetEnabled();  // in case it was disabled

        // update state on example change
        var path = fwindow.location.pathname.split("/");
        var sample = path.slice(-2).join('~');
        this._history.addToHistory(sample, "qooxdoo » Demo Browser » " + this.polish(path.slice(-2).join(' » ')));

      },
      this);

      // Second Page
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

      // -- Tab Pane
      var p3 = new qx.ui.pageview.tabview.Page(bsb3);
      p3.set({ padding : [ 5 ] });
      buttview.getPane().add(p3);

      // -- Pane Content
      var f3 = new qx.ui.embed.HtmlEmbed("The sample source code should go here.");
      p3.add(f3);

      return buttview;
    },


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
        width   : "100%",
        height  : "100%",
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
        width   : "100%",
        height  : "100%",
        padding : 5,
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
      }, this);

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
        width   : "100%",
        height  : "100%",
        padding : 5,
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
      if (treeNode instanceof qx.ui.tree.TreeFolder) {
        this.widgets["toolbar.runbutton"].setEnabled(false);
        this.widgets["toolbar.prevbutt"].setEnabled(false);
        this.widgets["toolbar.nextbutt"].setEnabled(false);
      } else {
        this.widgets["toolbar.runbutton"].resetEnabled();
        if (treeNode.getUserData('modelLink').getPrevSibling())
        {
          this.widgets["toolbar.prevbutt"].resetEnabled();
        } else
        {
          this.widgets["toolbar.prevbutt"].setEnabled(false);
        }

        if (treeNode.getUserData('modelLink').getNextSibling())
        {
          this.widgets["toolbar.nextbutt"].resetEnabled();
        } else
        {
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
    runNeighbour : function(e)
    {
      if (!this.tree.getSelectedElement())
      {  // this is a kludge!
        return;
      }

      var treeNode = this.tree.getSelectedElement();
      var modelNode = treeNode.getUserData("modelLink");
      var modelNext = modelNode.getNextSibling();
      this.tests.selected = this.tests.handler.getFullName(modelNode);
    },  // runNeighbour


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
            var fullName = currNode.pwd().slice(1).join("/") + "/" + currNode.label
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
      //buildSubTreeFlat(this.widgets["treeview.flat"], ttree);

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
    },


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

      // -- Vars and Setup -----------------------
      this.toolbar.setEnabled(false);
      this.widgets["outputviews.bar"].getManager().setSelected(this.widgets["outputviews.demopage.button"]);

      // -- Main ---------------------------------
      var file = this.tests.selected.replace(".", "/");
      var base = file.substring(file.indexOf("/") + 1);

      this.setCurrentSample(file);

      this.widgets["outputviews.demopage.button"].setLabel(this.polish(base));
    },


    setCurrentSample : function(value)
    {
      if (!value) {
        return;
      }

      var url;
      var treeNode = this._sampleToTreeNodeMap[value];
      if (treeNode){
        treeNode.setSelected(true);
        url = 'html/' + value;
      } else
      {
        url = this.defaultUrl;
      }

      // Clear log
      this.logappender.clear();
      this.logger.info("load demo: " + value);

      if (this._currentSample == value) {
        this.f1.reload();
      } else {
        //this.f1.setSource(url);
        if (this.f1.getContentWindow()) {
          this.f1.getContentWindow().location.replace(url);
        } else {
          this.f1.setSource(url);
        }
      }

      this._currentSample = value;
    },


    /**
     * reloads iframe's URL
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    reloadTestSuite : function(e)
    {
      var curr = this.iframe.getSource();
      var neu = this.testSuiteUrl.getValue();
      this.toolbar.setEnabled(false);
      this.widgets["statuspane.systeminfo"].setText("Reloading test suite...");

      // reset status information
      this.resetGui();

      qx.client.Timer.once(function()
      {
        if (curr == neu) {
          this.iframe.reload();
        } else {
          this.iframe.setSource(neu);
        }
      },
      this, 0);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    ehIframeOnLoad : function(e)
    {
      var iframe = this.iframe;

      this.frameWindow = iframe.getContentWindow();

      if (!this.frameWindow || !this.frameWindow.demobrowser || !this.frameWindow.demobrowser.TestLoader || !this.frameWindow.demobrowser.TestLoader.getInstance())
      {  // wait for the iframe to load
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

      if (this.tests.run_pending)
      {  // do we have pending tests to run?
        this.tests.run_pending();
        delete this.tests.run_pending;
      }

      this.widgets["statuspane.systeminfo"].setText("Ready");
    },

    // ------------------------------------------------------------------------
    //   MISC HELPERS
    // ------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @type member
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
     * @type member
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
     * @type member
     * @return {void}
     */
    resetTabView : function() {
      this.f1.clear();
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
          } else
          {
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
    ehDummyAlert : function(e) {
      alert("Not yet implemented!");
    },


    playPrev : function (e)
    {
      var currSamp = this.tree.getSelectedElement(); // widget

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


    playNext : function (e)
    {
      var currSamp = this.tree.getSelectedElement(); // widget

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


    /**
     * TODOC
     *
     * @type member
     * @param str {String} TODOC
     * @return {void}
     */
    appender : function(str) {},


    defaultUrl : "html/welcome.html"

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields(
      "widgets", 
      "tests", 
      "_sampleToTreeNodeMap",
      "tree"
    );
    this._disposeObjects(
      "header", 
      "mainsplit", 
      "tree1", 
      "left", 
      "runbutton", 
      "toolbar", 
      "f1", 
      "f2", 
      "logger",
      "_history",
      "logappender"
    );
  }
});
