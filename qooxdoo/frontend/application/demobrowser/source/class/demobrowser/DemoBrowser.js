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
    this._useProfile = false;

    this.__makeCommands();

    // Header Pane
    this.header = this.__makeHeader();
    this.add(this.header);

    // Menu Bar
    this.add(this.__makeMenuBar());

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

    this.widgets["treeview.bsb1"].setChecked(true);

    this.__setStateInitialized();

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
      var header = new qx.ui.embed.HtmlEmbed("<h1>" + "<span>" + "qooxdoo Demo Browser" + "</span>" + "</h1>" + "<div class='version'>qooxdoo " + qx.core.Version.toString() + "</div>");
      header.setHtmlProperty("id", "header");
      header.setStyleProperty("background", "#134275 url(" + qx.io.Alias.getInstance().resolve("demobrowser/image/colorstrip.gif") + ") top left repeat-x");
      header.setHeight(70);
      return header;
    },


    __makeCommands : function()
    {
      this._cmdObjectSummary = new qx.client.Command("Ctrl-O");
      this._cmdObjectSummary.addEventListener("execute", function() {
        var cw = this.f1.getContentWindow();
        if (cw && cw.qx) {
          alert(cw.qx.dev.ObjectSummary.getInfo());
        } else {
          alert("Unable to access Sample namespace currently.");
        }
      }, this);

      this._cmdRunSample = new qx.client.Command("F5");
      this._cmdRunSample.addEventListener("execute", this.runSample, this);

      this._cmdPrevSample = new qx.client.Command("Ctrl-Left");
      this._cmdPrevSample.addEventListener("execute", this.playPrev, this);

      this._cmdNextSample = new qx.client.Command("Ctrl-Right");
      this._cmdNextSample.addEventListener("execute", this.playNext, this);

      this._cmdSampleInOwnWindow = new qx.client.Command();
      this._cmdSampleInOwnWindow.addEventListener("execute", function(e)
      {
        var sampUrl = this.f1.getContentWindow().location.href;
        var nw = new qx.client.NativeWindow(sampUrl, "Sample");
        this.widgets["nativewindow"] = nw;
        nw.setDimension(700, 550);
        nw.open();
        return;
      }, this);

      this._cmdLoadProfile = new qx.client.Command();
      this._cmdLoadProfile.addEventListener("execute", function(e)
      {
        var checked = e.getData().getChecked();
        this._useProfile = checked;
        this.runSample();
      }, this);

      this._cmdProfile = new qx.client.Command("Ctrl-Shift-P");
      this._cmdProfile.addEventListener("execute", function(e)
      {
        var checked = e.getData().getChecked();
        var cw = this.f1.getContentWindow();
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
      }, this);
      this._cmdProfile.setUserData("checked", true);

      this._cmdShowLastProfile = new qx.client.Command();
      this._cmdShowLastProfile.addEventListener("execute", function() {
        var cw = this.f1.getContentWindow();
        if (cw && cw.qx) {
          cw.qx.dev.Profile.normalizeProfileData();
          this.showProfile(cw.qx.dev.Profile.getProfileData());
        }
      }, this);

      this._cmdDisposeSample = new qx.client.Command();
      this._cmdDisposeSample.addEventListener("execute", function(e) {
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
        this._cmdDisposeSample.setEnabled(false);
      }, this);

      this._cmdNamespacePollution = new qx.client.Command();
      this._cmdNamespacePollution.addEventListener("execute", function(e)
      {
        var cw = this.f1.getContentWindow();

        if (cw && cw.qx) {
          alert(cw.qx.dev.Pollution.getInfo());
        } else {
          alert("Unable to access Sample namespace currently.");
        }
      }, this);

    }, //makeCommands


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
      this.widgets["menu.appearance"].setEnabled(false);
      this.widgets["toolbar.playall"].setEnabled(true);
    },


    __setStateLoading : function() {
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
      this.widgets["outputviews.bar"].resetEnabled();
      this.widgets["outputviews.demopage.page"].resetEnabled();
      this.widgets["outputviews"].resetEnabled();
      this.widgets["treeview"].resetEnabled();
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

      this.__fillAppearanceMenu();
    },


    __fillAppearanceMenu : function()
    {
      var cw = this.f1.getContentWindow();

      if (cw && cw.qx)
      {
        var menuButton = this.widgets["menu.appearance"];
        menuButton.setEnabled(true);

        var menu = menuButton.getMenu();
        menu.removeAll();

        var mgr = cw.qx.theme.manager.Meta.getInstance();
        var themes = mgr.getMetaThemes();

        var radioMgr = new qx.ui.selection.RadioManager();
        for (var i=0, l=themes.length; i<l; i++)
        {
          theme = themes[i];

          if (theme.type === "abstract") {
            continue;
          }

          var checked = (theme == mgr.getTheme());
          var item = new qx.ui.menu.RadioButton(theme.title, null, checked);
          item.setUserData("theme", theme);
          item.addEventListener("execute", function(e) {
            mgr.setTheme(e.getTarget().getUserData("theme"));
          })
          radioMgr.add(item);
          menu.add(item);
        }
      }
    }, //fillAppearanceMenu


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
          label : "Appearance",
          items : [],
          enabled : false,
          id : "menu.appearance"
        },
        {
          label : "Profile",
          items : [
            {
              label : "Load demos with profiling",
              type : "CheckBox",
              checked : false,
              command : this._cmdLoadProfile
            },
            {
              label : "Profile",
              type : "CheckBox",
              checked : this._cmdProfile.getUserData("checked"),
              command : this._cmdProfile,
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
          widgetData.command.addEventListener("changeEnabled", function(e) {
            widget.setEnabled(e.getValue());
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
        menu.addToDocument();
        return menu;
      }


      var bar = new qx.ui.menubar.MenuBar();
      for (var i=0; i<menuData.length; i++)
      {
        var btn = new qx.ui.menubar.Button(menuData[i].label);
        btn.setMenu(createMenu(menuData[i].items));
        setWidgetProperties(btn, menuData[i]);
        bar.add(btn);
      }
      return bar;
    }, //makeMenuBar


    __bindCommand: function(widget, command) {
      widget.setCommand(command);
      command.addEventListener("changeEnabled", function(e) {
        widget.setEnabled(e.getValue());
      });
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
      this.__bindCommand(this.runbutton, this._cmdRunSample);
      this.runbutton.setToolTip(new qx.ui.popup.ToolTip("Run/reload selected sample"));

      // -- playall button
      var playallb = new qx.ui.toolbar.Button("Play All", demobrowser.DemoBrowser.Img_PlayAll_Default);
      this.widgets["toolbar.playall"] = playallb;
      mb.add(playallb);
      playallb.addEventListener("execute", this.__ehPlayAll, this);
      playallb.setToolTip(new qx.ui.popup.ToolTip("Run all examples"));

      // -- previous navigation
      var prevbutt = new qx.ui.toolbar.Button("Previous Sample", "icon/16/actions/go-left.png");
      mb.add(prevbutt);
      this.widgets["toolbar.prevbutt"] = prevbutt;
      this.__bindCommand(prevbutt, this._cmdPrevSample);
      prevbutt.setToolTip(new qx.ui.popup.ToolTip("Run the previous sample"));

      // -- next navigation
      var nextbutt = new qx.ui.toolbar.Button("Next Sample", "icon/16/actions/go-right.png");
      mb.add(nextbutt);
      this.widgets["toolbar.nextbutt"] = nextbutt;
      this.__bindCommand(nextbutt, this._cmdNextSample);
      nextbutt.setToolTip(new qx.ui.popup.ToolTip("Run the next sample"));

      // -- spin-out sample
      var sobutt = new qx.ui.toolbar.Button("Spin out Sample", "icon/16/actions/edit-redo.png");
      mb.add(sobutt);
      this.widgets["toolbar.sobutt"] = sobutt;
      sobutt.setToolTip(new qx.ui.popup.ToolTip("Open Sample in Own Window"));
      this.__bindCommand(sobutt, this._cmdSampleInOwnWindow);

      toolbar.add((new qx.ui.basic.HorizontalSpacer).set({ width : "1*" }));

      // -- Sample Features
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

      // profiling
      var sb0 = new qx.ui.toolbar.CheckBox("Profile", "icon/16/apps/accessories-alarm.png", this._cmdProfile.getUserData("checked"));
      gb.add(sb0);

      this.__bindCommand(sb0, this._cmdProfile);
      sb0.setToolTip(new qx.ui.popup.ToolTip("Profile Running Sample"));
      this.widgets["toolbar.profile"] = sb0;

      // object summary
      var sb1 = new qx.ui.toolbar.Button("Object Summary", "icon/16/apps/accessories-magnifier.png");
      gb.add(sb1);

      sb1.set(
      {
        height : "100%",
        width  : "auto",
        command: this._cmdObjectSummary
      });

      this.__bindCommand(sb1, this._cmdObjectSummary)
      sb1.setToolTip(new qx.ui.popup.ToolTip("Sample Object Summary"));

      // -- sample: global pollution
      var sb2 = new qx.ui.toolbar.Button("Global Pollution", "icon/16/places/www.png");
      gb.add(sb2);
      this.__bindCommand(sb2, this._cmdNamespacePollution)

      sb2.setToolTip(new qx.ui.popup.ToolTip("Sample Global Pollution"));

      return toolbar;
    },  // __makeToolbar()


    showProfile : function(profData)
    {
      if (!this._profWindow)
      {
        var win = new qx.ui.window.Window("Profiling Data");
        win.set({
          space: [20, 800, 20, 600],
          minWidth : 400,
          minHeight : 300,
          showMinimize : false,
          modal : true
        });
        win.addToDocument();
        this._profWindow = win;

        var tableModel = new qx.ui.table.model.Simple();
        tableModel.setColumns([ "Function", "Type", "Own Time", "Avg Time", "Call Count" ]);
        tableModel.setData([]);
        this._profTableModel = tableModel;

        var custom = {
          tableColumnModel : function(obj) {
            return new qx.ui.table.columnmodel.Resize(obj);
          }
        };

        var table = new qx.ui.table.Table(tableModel, custom);
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
        height   : "100%",
        border   : "dark-shadow",
        font     : "monospace"
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
          qx.client.Timer.once(this.runSample, this, 50);
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
        this._cmdRunSample.setEnabled(false);
        this._cmdPrevSample.setEnabled(false);
        this._cmdNextSample.setEnabled(false);
        this._cmdSampleInOwnWindow.setEnabled(false);
      }
      else
      {
        this._cmdRunSample.setEnabled(true);

        if (treeNode.getUserData('modelLink').getPrevSibling()) {
          this._cmdPrevSample.setEnabled(true);
          this.__states.isFirstSample=false;
        } else {
          this._cmdPrevSample.setEnabled(false);
          this.__states.isFirstSample=true;
        }

        if (treeNode.getUserData('modelLink').getNextSibling()) {
          this._cmdNextSample.setEnabled(true);
          this.__states.isLastSample=false;
        } else {
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
    runSample : function(e)
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
      this.widgets["outputviews.bar"].getManager().setSelected(this.widgets["outputviews.demopage.button"]);
      this.widgets["outputviews.demopage.page"].setEnabled(false);

      this.__setStateLoading();

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
        //this.widgets["treeview.full"].setSelectedElement(treeNode);
        url = 'html/' + value;
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

      // disable tree *after* setSelectedElement
      this.widgets["treeview"].setEnabled(false);

      // Clear log
      this.logappender.clear();
      this.logger.info("load demo: " + value);

      this._currentSampleUrl == url ? this.f1.reload() : this.f1.setSource(url);

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
      var fpath = fwindow.location.pathname + "";
      var splitIndex = fpath.indexOf("?");
      if (splitIndex != -1) {
        fpath = fpath.substring(0, splitIndex + 1);
      }
      var path = fpath.split("/");

      //if (this._currentSampleUrl != this.defaultUrl)
      if (this.f1.getSource() != "" && this.f1.getSource() != this.defaultUrl)
      {
        // set logger
        fwindow.qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
        fwindow.qx.log.Logger.ROOT_LOGGER.addAppender(this.logappender);

        var url = fwindow.location.href;
        var posHtml = url.indexOf("/html/") + 6;
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
      this.widgets["outputviews.demopage.button"].setLabel(this.polish(path[path.length - 1]));
      this.debug("Demo loaded...");

      if (this.isPlayAll())
      {
        if (this.widgets["toolbar.nextbutt"].isEnabled())
        {
          // give some time before proceeding
          qx.client.Timer.once(function ()
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
        var first = this._sampleToTreeNodeMap['example/Atom_1.html'];
        this.widgets["treeview.full"].setSelectedElement(first);
        // run sample
        this.widgets["toolbar.runbutton"].execute();
      } else                  // end playing all
      {
        if (this.__states.isLoading)
        {
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
    __getPageSource : function(url)
    {

      if( typeof(url) != "string" ){
        return ;
      }

      var req = new qx.io.remote.Request(url);

      req.setTimeout(180000);
      req.setProhibitCaching(false);

      req.addEventListener("completed", function(evt)
      {
        var loadEnd = new Date();
        this.debug("Time to load page source from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");

        var content = evt.getContent();

        if (content) {
          //this.widgets["outputviews.sourcepage.page"].setValue(content);
          this.widgets["outputviews.sourcepage.page"].setHtml(this.__beautySource(content));
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

        var content = evt.getContent();

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
            //this.widgets["treevi"].setSelectedElement()//TODO: this is a kludge!
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
      var currSamp = this.tree.getSelectedElement();  // widget

      if (currSamp)
      {
        var otherSamp = currSamp.getUserData('modelLink').getNextSibling().widgetLinkFull;

        if (otherSamp)
        {
          this.widgets["treeview.full"].setSelectedElement(otherSamp);
          this.runSample();
        }
      }
    },


    __beautySource : function (src)
    {
      var bsrc = "<pre>";
      var lines = [];
      var currBlock = ""
      var PScriptStart = /^\s*<script\b[^>]*?(?!\bsrc\s*=)[^>]*?>\s*$/i;
      var PScriptEnd = /^\s*<\/script>\s*$/i;


      src = src.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      var lines = src.split('\n');

      for (var i=0; i<lines.length; i++)
      {
          if (PScriptStart.exec(lines[i])) // start of inline script
          {
            // add this line to 'normal' code
            bsrc += this.__beautyHtml(qx.html.String.escape(currBlock + lines[i]));
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
      bsrc += this.__beautyHtml(qx.html.String.escape(currBlock)) + "</pre>";

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
    this._disposeFields("widgets", "tests", "_sampleToTreeNodeMap", "tree", "__states");
    this._disposeObjects("header", "mainsplit", "tree1", "left", "runbutton", "toolbar", "f1", "f2", "logger", "_history", "logappender", '_cmdObjectSummary', '_cmdRunSample', '_cmdPrevSample', '_cmdNextSample', '_cmdSampleInOwnWindow', '_cmdLoadProfile', '_cmdProfile', '_cmdShowLastProfile', '_cmdDisposeSample', '_cmdNamespacePollution');
  }
});
