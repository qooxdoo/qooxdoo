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
     * Martin Wittemann (martinwittemann)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/32/actions/help-contents.png)
#asset(qx/icon/${qx.icontheme}/16/actions/help-contents.png)

************************************************************************ */

/**
 * The GUI definition of the qooxdoo unit test runner.
 */
qx.Class.define("demobrowser.DemoBrowser",
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

    this.widgets = {};
    this.tests = {};
    this._useProfile = false;

    // Commands
    this.__makeCommands();

    // Header Pane
    this.header = this.__makeHeader();
    
    this.add(this.header);

    // Menu Bar
    this.add(this.__makeMenuBar());

    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.Pane("horizontal");
    this.mainsplit = mainsplit;
    this.add(mainsplit, {flex : 1});

    // Left
    var left = this.__makeLeft();
    mainsplit.add(left, 0);


    
    // Right
    var right = new qx.ui.container.Composite(new qx.ui.layout.VBox); 
    mainsplit.add(right, 1);

    // Toolbar
    this.toolbar = this.__makeToolbar();
    right.add(this.toolbar);

    // output views
    var buttview = this.__makeOutputViews();
    right.add(buttview, {flex:1});

    this.__setStateInitialized();

    // back button and bookmark support
    this._history = qx.bom.History.getInstance();

    // listen for state changes
    this._history.addListener("request", function(e)
    {
      var newSample = e.getData().replace("~", "/");

      if (this._currentSample != newSample) {
        this.setCurrentSample(newSample);
      }
    },
    this);

    this.__states = {};
    this.__states.isLoading = false;
    this.__states.isFirstSample = false;
    this.__states.isLastSample  = false;

  }, //construct


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    Img_PlayAll_Default : "icon/16/actions/media-seek-forward.png",
    Img_PlayAll_Stop    : "icon/16/actions/media-playback-stop.png"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties : {
    playAll :
    {
      check : "Boolean",
      apply : "__applyPlayAll",
      init  : false
    }
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
      var header = new qx.ui.embed.HtmlEmbed("<h1>" + "<span>" + "qooxdoo Demo Browser" + "</span>" + "</h1>" + "<div class='version'>qooxdoo " + qx.core.Setting.get("qx.version") + "</div>");
      var element = header.getContentElement();

      element.setAttribute("id", "header");
      element.setStyle("background", "#134275 url(" + qx.util.ResourceManager.toUri("demobrowser/image/colorstrip.gif") + ") top left repeat-x");
      header.setHeight(70);
      return header;
    },


    __makeCommands : function()
    {
      this._cmdObjectSummary = new qx.event.Command("Ctrl-O");
      this._cmdObjectSummary.addListener("execute", this.__getObjectSummary, this);

      this._cmdRunSample = new qx.event.Command("F5");
      this._cmdRunSample.addListener("execute", this.runSample, this);

      this._cmdPrevSample = new qx.event.Command("Ctrl-Left");
      this._cmdPrevSample.addListener("execute", this.playPrev, this);

      this._cmdNextSample = new qx.event.Command("Ctrl-Right");
      this._cmdNextSample.addListener("execute", this.playNext, this);

      this._cmdSampleInOwnWindow = new qx.event.Command();
      this._cmdSampleInOwnWindow.addListener("execute", this.__sampleInOwnWindow, this);

      this._cmdLoadProfile = new qx.event.Command();
      this._cmdLoadProfile.addListener("execute", this.__loadProfile, this);

      this._cmdProfile = new qx.event.Command("Ctrl-Shift-P");
      this._cmdProfile.addListener("execute", this.__toggleProfile, this);
      this._cmdProfile.setUserData("checked", true);

      this._cmdShowLastProfile = new qx.event.Command();
      this._cmdShowLastProfile.addListener("execute", this.__showLastProfile, this);

      this._cmdDisposeSample = new qx.event.Command();
      this._cmdDisposeSample.addListener("execute", this.__disposeSample, this);

      this._cmdNamespacePollution = new qx.event.Command();
      this._cmdNamespacePollution.addListener("execute", this.__showPollution, this);

    }, //makeCommands

    __getObjectSummary : function()
    {
      var cw = this.f1.getWindow();
      if (cw && cw.qx) {
        alert(cw.qx.dev.ObjectSummary.getInfo());
      } else {
        alert("Unable to access Sample namespace currently.");
      }
    },

    __sampleInOwnWindow : function()
    {
      var sampUrl = this.f1.getWindow().location.href;
      window.open(sampUrl, "Sample", "width=700,height=550");
    },

    __loadProfile : function(e)
    {
      var checked = e.getData().getChecked();
      this._useProfile = checked;
      this.runSample();
    },
    
    __toggleProfile : function(e)
    {
      var checked = e.getData().getChecked();
      var cw = this.f1.getWindow();
      if (cw && cw.qx) {
        if (checked) {
          cw.qx.dev.Profile.start();
        } else {
          cw.qx.dev.Profile.stop();
          cw.qx.dev.Profile.normalizeProfileData();
          this.showProfile(cw.qx.dev.Profile.getProfileData());
          this._cmdShowLastProfile.setEnabled(true);
        }
      }
      this._cmdProfile.setEnabled(false);
      this.widgets["toolbar.profile"].setChecked(checked)
      this.widgets["menu.profile"].setChecked(checked);
      this._cmdProfile.setEnabled(true);
    },
    
    __showLastProfile : function()
    {
      var cw = this.f1.getWindow();
      if (cw && cw.qx) {
        cw.qx.dev.Profile.normalizeProfileData();
        this.showProfile(cw.qx.dev.Profile.getProfileData());
      }
    },

    __disposeSample : function(e)
    {
      var cw = this.f1.getWindow();

      if (cw && cw.qx)
      {
        cw.qx.core.ObjectRegistry.shutdown();
        alert("Done!");
      }
      else
      {
        alert("Unable to access Sample namespace currently.");
      }
      this._cmdDisposeSample.setEnabled(false);
    },
    
    __setStateInitialized : function()
    {
      this._cmdObjectSummary.setEnabled(false);
      this._cmdRunSample.setEnabled(false);
      this._cmdPrevSample.setEnabled(false);
      this._cmdNextSample.setEnabled(false);
      this._cmdSampleInOwnWindow.setEnabled(false);
      this._cmdProfile.setEnabled(false);
      this._cmdShowLastProfile.setEnabled(false);
      this._cmdDisposeSample.setEnabled(false);
      this._cmdNamespacePollution.setEnabled(false);
      this.widgets["toolbar.playall"].setEnabled(true);
    },
    
    __showPollution : function(e)
    {
      var cw = this.f1.getWindow();

      if (cw && cw.qx) {
        alert(cw.qx.dev.Pollution.getInfo());
      } else {
        alert("Unable to access Sample namespace currently.");
      }
    },

    __setStateLoading : function()
    {
      this.__states.isLoading = true;
      this.__setStateInitialized();
      if (!this.isPlayAll()) {
        this.widgets["toolbar.playall"].setEnabled(false);
      }
    },


    __setStateLoaded : function ()
    {
      this.__states.isLoading = false;
      this.widgets["toolbar.playall"].setEnabled(true);
      this.widgets["outputviews.demopage.page"].resetEnabled();
      this.widgets["outputviews"].resetEnabled();
    },


    __setStateSampleLoaded : function()
    {
      this._cmdObjectSummary.setEnabled(true);
      this._cmdRunSample.setEnabled(true);
      if (!this.__states.isFirstSample) {
        this._cmdPrevSample.setEnabled(true);
      }
      if (!this.__states.isLastSample) {
        this._cmdNextSample.resetEnabled();
      }
      this._cmdSampleInOwnWindow.setEnabled(true);
      this.widgets["toolbar.playall"].setEnabled(true);

      this.widgets["toolbar.profile"].setChecked(true)
      this.widgets["menu.profile"].setChecked(true);
      this._cmdProfile.setEnabled(this._useProfile);

      this._cmdShowLastProfile.setEnabled(false);
      this._cmdDisposeSample.setEnabled(true);
      this._cmdNamespacePollution.setEnabled(true);
    },


    __makeMenuBar : function()
    {
      var menuData = [
        {
          label : "Demo",
          items : [
            {
              label : "Reload",
              command : this._cmdRunSample
            },
            {
              label : "Open in own window",
              command : this._cmdSampleInOwnWindow
            },
            { type : "Separator" },
            {
              label : "Next Demo",
              command : this._cmdNextSample
            },
            {
              label : "Previous Demo",
              command : this._cmdPrevSample
            }
          ]
        },
        {
          label : "Profile",
          items : [
            {
              label : "Load demos with profiling",
              type : "CheckBox",
              checked : false
            },
            {
              label : "Profile",
              type : "CheckBox",
              checked : this._cmdProfile.getUserData("checked"),
              id : "menu.profile"
            },
            {
              label : "Show last results",
              command : this._cmdShowLastProfile
            }
          ]
        },
        {
          label : "Debug",
          items :
          [
            {
              label : "Object Summary",
              command : this._cmdObjectSummary
            },
            {
              label : "Global Namespace Pollution",
              command : this._cmdNamespacePollution
            },
            { type : "Separator" },
            {
              label : "Dispose Demo",
              command : this._cmdDisposeSample
            }
          ]
        }
      ];

      var self = this;
      var setWidgetProperties = function(widget, widgetData)
      {
        var props = {};
        for (var key in widgetData) {
          if (key !== "type" && key !== "items" && key !== "label" && key !== "id") {
            props[key] = widgetData[key];
          }
        }
        widget.set(props);
        if (widgetData.id !== undefined) {
          self.widgets[widgetData.id] = widget;
        }
        if (widgetData.command !== undefined) {
          widgetData.command.addListener("changeEnabled", function(e) {
            widget.setEnabled(e.getData());
          });
        }
      }


      var createMenu = function(menuItems)
      {
        var menu = new qx.ui.menu.Menu();
        for (var i=0; i<menuItems.length; i++)
        {
          var item = menuItems[i];
          var itemType = item.type || "Button";
          switch (itemType) {
            case "Button":
              var itemWidget = new qx.ui.menu.Button(item.label);
              break;

            case "CheckBox":
              var itemWidget = new qx.ui.menu.CheckBox(item.label);
              break;

            case "Separator":
              var itemWidget = new qx.ui.menu.Separator;
              break;

            default:
              throw new Error("Invalid case : '"+itemType+"'!");
          }

          setWidgetProperties(itemWidget, item);
          menu.add(itemWidget);
        }
        return menu;
      }


      var bar = new qx.ui.toolbar.ToolBar();
      for (var i=0; i<menuData.length; i++)
      {
        var btn = new qx.ui.toolbar.MenuButton(menuData[i].label);
        btn.setMenu(createMenu(menuData[i].items));
        setWidgetProperties(btn, menuData[i]);
        bar.add(btn);
      }
      return bar;
    }, //makeMenuBar


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __makeToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;
//      toolbar.setBorder("line-bottom");
      toolbar.setHeight(27);

      var mb = new qx.ui.toolbar.Part();
      toolbar.add(mb);
      this.widgets["toolbar.controlbutts"] = mb;

      // -- run button
      this.runbutton = new qx.ui.toolbar.Button("Run Sample", "icon/16/actions/system-run.png");
      this.runbutton.setShow("icon");
      mb.add(this.runbutton);
      this.widgets["toolbar.runbutton"] = this.runbutton;
      this.runbutton.addListener("execute", this.runSample, this);
      this.runbutton.setToolTip(new qx.ui.tooltip.ToolTip("Run/reload selected sample"));

      // -- playall button
      var playallb = new qx.ui.toolbar.Button("Play All", demobrowser.DemoBrowser.Img_PlayAll_Default);
      playallb.setShow("icon");
      this.widgets["toolbar.playall"] = playallb;
      mb.add(playallb);
      playallb.addListener("execute", this.__ehPlayAll, this);
      playallb.setToolTip(new qx.ui.tooltip.ToolTip("Run all examples"));

      // -- previous navigation
      var prevbutt = new qx.ui.toolbar.Button("Previous Sample", "icon/16/actions/go-previous.png");
      prevbutt.setShow("icon");
      mb.add(prevbutt);
      this.widgets["toolbar.prevbutt"] = prevbutt;
      prevbutt.addListener("execute", this.playPrev, this);
      prevbutt.setToolTip(new qx.ui.tooltip.ToolTip("Run the previous sample"));

      // -- next navigation
      var nextbutt = new qx.ui.toolbar.Button("Next Sample", "icon/16/actions/go-next.png");
      nextbutt.setShow("icon");
      mb.add(nextbutt);
      this.widgets["toolbar.nextbutt"] = nextbutt;
      nextbutt.addListener("execute", this.playNext, this);
      nextbutt.setToolTip(new qx.ui.tooltip.ToolTip("Run the next sample"));

      // -- spin-out sample
      var sobutt = new qx.ui.toolbar.Button("Spin out Sample", "icon/16/actions/edit-redo.png");
      sobutt.setShow("icon");
      mb.add(sobutt);
      this.widgets["toolbar.sobutt"] = sobutt;
      sobutt.setToolTip(new qx.ui.tooltip.ToolTip("Open Sample in Own Window"));
      sobutt.addListener("execute", this.__sampleInOwnWindow, this);


      toolbar.addSpacer();

      // -- Sample Features
      var gb = new qx.ui.toolbar.Part();
      toolbar.add(gb);
      this.widgets["toolbar.sampbutts"] = gb;

      gb.setEnabled(false);

      // profiling
      var sb0 = new qx.ui.toolbar.CheckBox("Profile", "icon/16/apps/utilities-terminal.png", this._cmdProfile.getUserData("checked"));
      sb0.setShow("icon");
      gb.add(sb0);

      sobutt.addListener("execute", this.__toggleProfile, this);
      sb0.setToolTip(new qx.ui.tooltip.ToolTip("Profile Running Sample"));
      this.widgets["toolbar.profile"] = sb0;

      // object summary
      var sb1 = new qx.ui.toolbar.Button("Object Summary", "icon/16/apps/graphics-viewer.png");
      gb.add(sb1);

      sb1.addListener("execute", this.__getObjectSummary, this);
      sb1.setToolTip(new qx.ui.tooltip.ToolTip("Sample Object Summary"));
      sb1.setShow("icon");

      // -- sample: global pollution
      var sb2 = new qx.ui.toolbar.Button("Global Pollution", "icon/16/apps/internet-web-browser.png");
      sb2.setShow("icon");
      gb.add(sb2);
      sb2.addListener("execute", this.__showPollution, this);

      sb2.setToolTip(new qx.ui.tooltip.ToolTip("Sample Global Pollution"));

      return toolbar;
    },  // __makeToolbar()


    showProfile : function(profData)
    {
      if (!this._profWindow)
      {
        var win = new qx.legacy.ui.window.Window("Profiling Data");
        win.set({
          space: [20, 800, 20, 600],
          minWidth : 400,
          minHeight : 300,
          showMinimize : false,
          modal : true
        });
        win.addToDocument();
        this._profWindow = win;

        var tableModel = new qx.legacy.ui.table.model.Simple();
        tableModel.setColumns([ "Function", "Type", "Own Time", "Avg Time", "Call Count" ]);
        tableModel.setData([]);
        this._profTableModel = tableModel;

        var custom = {
          tableColumnModel : function(obj) {
            return new qx.legacy.ui.table.columnmodel.Resize(obj);
          }
        };

        var table = new qx.legacy.ui.table.Table(tableModel, custom);
        table.set({
          height: "100%",
          width: "100%"
        });

        var tcm = table.getTableColumnModel();
        var resizeBehavior = tcm.getBehavior();
        resizeBehavior.set(0, { width:"2*", minWidth:50 });
        resizeBehavior.setMaxWidth(1, 80);
        resizeBehavior.setMaxWidth(2, 80);
        resizeBehavior.setMaxWidth(3, 80);
        resizeBehavior.setMaxWidth(4, 80);

        win.add(table);
      }

      var rowData = [];
      for (var key in profData) {
        var data = profData[key];
        if (data.name == "qx.core.Aspect.__calibrateHelper") {
          continue;
        }
        rowData.push([data.name+"()", data.type, data.calibratedOwnTime, data.calibratedOwnTime/data.callCount, data.callCount]);
      }
      this._profTableModel.setData(rowData);
      this._profTableModel.sortByColumn(2);

      this._profWindow.open();
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
      var tabview = new qx.ui.tabview.TabView;

      this.widgets["outputviews"] = tabview;

      // First Page
      var p1 = new qx.ui.tabview.Page("Start", "icon/16/actions/system-run.png");
      p1.setLayout(new qx.ui.layout.Grow);
      tabview.add(p1);

      var f1 = new qx.ui.embed.Iframe;
      f1.addListener("load", this.__ehIframeLoaded, this);
      this.f1 = f1;
      p1.add(f1);
      this.widgets["outputviews.demopage.page"] = f1;

      // Second Page
      var p2 = new qx.ui.tabview.Page("Log", "icon/16/mimetypes/text-plain.png");
      p2.setBackgroundColor("white");
      p2.setLayout(new qx.ui.layout.Grow);
      tabview.add(p2);

      // main output area
      this.f2 = new qx.ui.embed.HtmlEmbed();
      this.f2.setOverflowY("scroll");
      p2.add(this.f2);

      // Create appender and unregister from this logger
      // (we are interested in demo messages only)
      this.logappender = new qx.log.appender.Element();
      qx.log.Logger.unregister(this.logappender);

      // Directly create DOM element to use
      this.logelem = document.createElement("DIV");
      this.logappender.setElement(this.logelem);

      this.f2.addListenerOnce("appear", function(){
        this.f2.getContentElement().getDomElement().appendChild(this.logelem);
      }, this);     
      
      // Third Page
      // -- Tab Button
      var p3 = new qx.ui.tabview.Page("HTML Code", "icon/16/mimetypes/text-html.png");
      p3.setBackgroundColor("white");
      p3.setLayout(new qx.ui.layout.Grow);
      tabview.add(p3);

      // -- Pane Content
      var f3 = new qx.ui.embed.HtmlEmbed("<div class='script'>The sample source will be displayed here.</div>");
      f3.setOverflowY("scroll");
      p3.add(f3);
      this.widgets["outputviews.sourcepage.html.page"] = f3;

      f3.getContentElement().setAttribute("id", "qx_srcview");

      
      
      
      // -- Tab Pane
      var p4 = new qx.ui.tabview.Page("JavaScript Code", "icon/16/mimetypes/office-spreadsheet.png");
      p4.setBackgroundColor("white");
      p4.setLayout(new qx.ui.layout.Grow);
      tabview.add(p4);

      // -- Pane Content
      var f4 = new qx.ui.embed.HtmlEmbed("<div class='script'>The sample JS source will be displayed here.</div>");
      f4.setOverflowY("scroll");
      p4.add(f4);
      this.widgets["outputviews.sourcepage.js.page"] = f4;

      f4.getContentElement().setAttribute("id", "qx_srcview");

      return tabview; 
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

      var tree1 = new qx.ui.tree.Tree;
      var root = new qx.ui.tree.TreeFolder("Tests");
      tree1.setRoot(root);
      tree1.select(root);
      tree1.setWidth(200);
      
      this.tree = tree1;
      this.tree = this.widgets["treeview.flat"] = tree1;

      tree1.addListener("changeSelection", this.treeGetSelection, this);
      tree1.addListener("dblclick", function(e){
        qx.event.Timer.once(this.runSample, this, 50);
      }, this);

      return tree1;
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
      var treeNode = this.tree.getSelectedItem();
      var modelNode = treeNode.getUserData("modelLink");
      this.tests.selected = this.tests.handler.getFullName(modelNode);

      // update toolbar
      if (treeNode instanceof qx.ui.tree.TreeFolder)
      {
        this._cmdRunSample.setEnabled(false);
        this._cmdPrevSample.setEnabled(false);
        this._cmdNextSample.setEnabled(false);
        this._cmdSampleInOwnWindow.setEnabled(false);
      }
      else
      {
        this._cmdRunSample.setEnabled(true);

        if (treeNode.getUserData('modelLink').getPrevSibling())
        {
          this._cmdPrevSample.setEnabled(true);
          this.__states.isFirstSample=false;
        }
        else
        {
          this._cmdPrevSample.setEnabled(false);
          this.__states.isFirstSample=true;
        }

        if (treeNode.getUserData('modelLink').getNextSibling())
        {
          this._cmdNextSample.setEnabled(true);
          this.__states.isLastSample=false;
        }
        else
        {
          this._cmdNextSample.setEnabled(false);
          this.__states.isLastSample=true;
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
      var _initialSection    = "widget";
      var _initialNode = null;

      // set a section to open initially
      var state   = this._history.getState();
      var section =  state.match(/([^~]+)~/);
      if (section) {
        _initialSection = section[1];
      }

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
            t.setIconOpened("demobrowser/image/package18.gif");
            t.setUserData("filled", false);
            t.setUserData("node", currNode);

            buildSubTree(t, t.getUserData("node"));

            if (currNode.label == _initialSection)
            {
              _initialNode = t;
              t.setOpen(true);
            }
          }
          else
          {
            t = new qx.ui.tree.TreeFile(that.polish(currNode.label), "demobrowser/image/method_public18.gif");
            t.setIconOpened("demobrowser/image/method_public18.gif");
            var fullName = currNode.pwd().slice(1).join("/") + "/" + currNode.label;
            _sampleToTreeNodeMap[fullName] = t;
          }

          // make connections
          widgetR.add(t);
          t.setUserData("modelLink", currNode);
          currNode.widgetLinkFull = t;

        }
      }

      // -- Main --------------------------------
      var ttree = this.tests.handler.ttree;
      var that = this;

      // Handle current Tree Selection and Content
      this.tree.setUserData("modelLink", ttree);  // link top level widgets and model

      this.tree.getRoot().setOpen(true)
      buildSubTree(this.tree.getRoot(), ttree);

      if (_initialNode != null) {
        this.tree.select(_initialNode);
      }

    },  // leftReloadTree


    /**
     * event handler for the Run Test button - performs the tests
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    runSample : function(e)
    {
      var file = this.tests.selected.replace(".", "/");
      this.setCurrentSample(file);
    },  // runSample()


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
      this.widgets["outputviews.demopage.page"].setEnabled(false);

      this.__setStateLoading();

      var url;
      var treeNode = this._sampleToTreeNodeMap[value];

      if (treeNode)
      {
        treeNode.getTree().select(treeNode);
        url = 'demo/' + value;
        if (this._useProfile) {
          url += "?qxvariant:qx.aspects:on&qxsetting:qx.enableAspect:true"
        } else {
          url += "?qxvariant:qx.aspects:off&qx.enableAspect:false"
        }
      }
      else
      {
        url = this.defaultUrl;
      }

      // Clear log
      this.logappender.clear();

      this._currentSampleUrl == url ? this.f1.reload() : this.f1.setSource(url);

      this._currentSample = value;
      this._currentSampleUrl = url;
      
      // Focus first tab
      this.widgets["outputviews"].setSelected(this.widgets["outputviews"].getChildren()[0]);
    },  // setCurrentSample


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    __ehIframeLoaded : function()
    {
      var fwindow = this.f1.getWindow();

      // TODO
      /*
      // poll for the logger to be loaded
      if (!fwindow.qx || !fwindow.qx.log || !fwindow.qx.log.Logger)
      {
        qx.event.Timer.once(this.__ehIframeLoaded, this, 0);
        return;
      }
      */

      var fpath = fwindow.location.pathname + "";
      var splitIndex = fpath.indexOf("?");
      if (splitIndex != -1) {
        fpath = fpath.substring(0, splitIndex + 1);
      }
      // local files in the IE6 use \ insted of /
      if (window.location.protocol == "file:" &&
          qx.bom.client.Engine.MSHTML == true &&
          qx.bom.client.Engine.VERSION < 7) {
        var path = fpath.split("\\");
      } else {
        var path = fpath.split("/");
      }

      var furl = this.f1.getSource();
      //if (this._currentSampleUrl != this.defaultUrl)
      if (furl != null && furl != this.defaultUrl)
      {
        var url = fwindow.location.href;
        var posHtml = url.indexOf("/demo/") + 6;
        var posSearch = url.indexOf("?");
        posSearch = posSearch == -1 ? url.length : posSearch;
        var split = url.substring(posHtml, posSearch).split("/");
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

        // register appender
        fwindow.qx.log.Logger.register(this.logappender);

        // load sample source code
        if (this._currentSampleUrl != this.defaultUrl)
        {
          this.__setStateSampleLoaded();
          this.__getPageSource(this._currentSampleUrl);
        } else {
          this.__setStateInitialized();
        }
      }

      this.__setStateLoaded();
      var tabName = this.tree.getSelectedItem().getLabel();
      this.widgets["outputviews"].getChildren()[0].setLabel(tabName);

      if (this.isPlayAll())
      {
        if (this.widgets["toolbar.nextbutt"].isEnabled())
        {
          // give some time before proceeding
          qx.event.Timer.once(function ()
          {
            this.widgets["toolbar.nextbutt"].execute();
          }, this, 1500);
        } else
        {
          this.setPlayAll(false);
        }
      }

    }, // __ehIframeLoaded


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    __ehPlayAll : function(e)
    {
      if (! this.isPlayAll())  // start playing all
      {
        this.setPlayAll(true);  // turn on global flag
        // select first example
        var first = this._sampleToTreeNodeMap['ui/Cursor_1.html'];
        this.tree.select(first);
        // run sample
        this.widgets["toolbar.runbutton"].execute();
      } else                  // end playing all
      {
        if (this.__states.isLoading) {
          this.widgets["toolbar.playall"].setEnabled(false);
        }
        this.setPlayAll(false);
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
    __applyPlayAll : function(value, old)
    {
      if (value == true )
      {
        this.widgets["toolbar.playall"].setIcon(demobrowser.DemoBrowser.Img_PlayAll_Stop);
      } else
      {
        this.widgets["toolbar.playall"].setIcon(demobrowser.DemoBrowser.Img_PlayAll_Default);
        //this.widgets["toolbar.playall"].resetEnabled();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param url {var} TODOC
     * @return {String} TODOC
     */
    __getPageSource : function(url) {

      if( typeof(url) != "string" ){
        return;
      }
      // create a and config request to the given url
      var req = new qx.io.remote.Request(url);
      req.setTimeout(180000);
      req.setProhibitCaching(false);

      req.addListener("completed", function(evt)
      {
        // get the content of the request
        var content = evt.getContent();
        // if there is a content
        if (content) {
          // extract the name of the js file
          var secondSrcTagPosition = content.indexOf("<script", content.indexOf("<script")+7);
          var srcAttributeStart = content.indexOf("src", secondSrcTagPosition);
          var srcAttributeEnd = content.indexOf("\"", srcAttributeStart + 5);
          var jsFileName = content.substring(srcAttributeStart + 5, srcAttributeEnd);
          var jsSourceFileName = jsFileName.substring(4, jsFileName.length - 3) + ".src.js";
          // get the javascript code
          var reqJSFile = new qx.io.remote.Request(jsSourceFileName);
          reqJSFile.setTimeout(180000);
          reqJSFile.setProhibitCaching(false);
          reqJSFile.addListener("completed", function(evt2) {
            var jsCode = evt2.getContent();
            if (jsCode) {
              // set the javascript code to the javascript page
              this.widgets["outputviews.sourcepage.js.page"].setHtml(this.__beautySource(jsCode, "javascript"));
            }
          }, this);
          // add a listener which handles the failure of the request
          reqJSFile.addListener("failed", function(evt) {
            this.error("Couldn't load file: " + url);
          }, this);
          // send the request for the javascript code
          reqJSFile.send();

          // write the html code to the html page
          this.widgets["outputviews.sourcepage.html.page"].setHtml(this.__beautySource(content));
        }
      }, this);
      // add a listener which handles the failure of the request
      req.addListener("failed", function(evt) {
        this.error("Couldn't load file: " + url);
      }, this);
      // send the request for the html file
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

      req.addListener("completed", function(evt)
      {
        var content = evt.getContent();

        var treeData = eval(content);

        // give the browser a chance to update its UI before doing more
        qx.event.Timer.once(function()
        {
          this.tests.handler = new demobrowser.TreeDataHandler(treeData);
          this.leftReloadTree();

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

      req.addListener("failed", function(evt) {
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
      var currSamp = this.tree.getSelectedItem();  // widget

      if (currSamp)
      {
        var otherSamp = currSamp.getUserData('modelLink').getPrevSibling().widgetLinkFull;

        if (otherSamp)
        {
          this.tree.select(otherSamp);
          this.runSample();
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
      var currSamp = this.tree.getSelectedItem();  // widget

      if (currSamp)
      {
        try{
          var otherSamp = currSamp.getUserData('modelLink').getNextSibling().widgetLinkFull;
        }catch(e)
        {
          this.debug(e)
        }

        if (otherSamp)
        {
          this.tree.select(otherSamp);
          this.runSample();
        }
      }
    },


    __beautySource : function (src, type)
    {
      var bsrc = "<pre>";
      var lines = [];
      var currBlock = ""
      var PScriptStart = /^\s*<script\b[^>]*?(?!\bsrc\s*=)[^>]*?>\s*$/i;
      var PScriptEnd = /^\s*<\/script>\s*$/i;


      src = src.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      var lines = src.split('\n');

      // if the source is a javascript file
      if (type == "javascript") {
        return "<pre><div class='script'>" +
                     qx.dev.Tokenizer.javaScriptToHtml(src) +
                     "</div></pre>";
      }

      for (var i=0; i<lines.length; i++)
      {
          if (PScriptStart.exec(lines[i])) // start of inline script
          {
            // add this line to 'normal' code
            bsrc += this.__beautyHtml(qx.bom.String.escape(currBlock + lines[i]));
            currBlock = "";  // start new block
          }
          else if (PScriptEnd.exec(lines[i])) // end of inline script
          {
            // pass script block to tokenizer
            var s1 = qx.dev.Tokenizer.javaScriptToHtml(currBlock);
            bsrc += '<div class="script">'+s1+'</div>';
            currBlock = lines[i]+'\n';  // start new block
          }
          else // no border line
          {
            currBlock += lines[i]+'\n';
          }
      }


      // collect rest of page
      bsrc += this.__beautyHtml(qx.bom.String.escape(currBlock)) + "</pre>";

      return bsrc;

    }, // beautySource()


    __beautyHtml : function (str)
    {
      var res = str;

      // This match function might be a bit of overkill right now, but provides
      // for later extensions (cf. Flanagan(5th), 703)
      function matchfunc (vargs)
      {
        var s = arguments[1]+'<span class="html-tag-name">'+arguments[2]+'</span>';
        var curr;
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

    defaultUrl : "demo/welcome.html"
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("widgets", "tests", "_sampleToTreeNodeMap", "tree", "__states", "logelem");
    this._disposeObjects("header", "mainsplit", "tree1", "left", "runbutton", "toolbar", "f1", "f2", "logger", "_history", "logappender", '_cmdObjectSummary', '_cmdRunSample', '_cmdPrevSample', '_cmdNextSample', '_cmdSampleInOwnWindow', '_cmdLoadProfile', '_cmdProfile', '_cmdShowLastProfile', '_cmdDisposeSample', '_cmdNamespacePollution');
  }
});
