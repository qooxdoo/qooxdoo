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

#module(buildtool)

************************************************************************ */

/**
 * The GUI definition of the qooxdoo unit test runner.
 */
qx.Class.define("buildtool.AppFrame",
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
    this.app = {};
    this._useProfile = false;
    this.__states = {};
    this.__states.transientStack = [];
    this.__states.isLoading = false;
    this.__states.isFirstSample = false;
    this.__states.isLastSample  = false;

    this.__makeCommands();
    //this.__makeRpcServer();

    this._urlParms = new buildtool.UrlSearchParms();

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

    // Left
    var left = this.__makeLeft();
    this.left = left.buttview;
    this.mainsplit.addLeft(left);

    // Right
    //var right = new qx.ui.layout.VerticalBoxLayout();
    var right = new qx.ui.layout.CanvasLayout();

    right.set(
    {
      //border : "line-left",
      height : "100%",
      width  : "100%"
    });

    mainsplit.addRight(right);

    // 3 different content widgets - edit, run, info
    right.add(this.__makeRightEdit());
    right.add(this.__makeRightRun());
    right.add(this.__makeRightInfo());

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

    // Initial selections
    this.widgets["treeview.binfo"].setChecked(true);
    this.widgets["treeview.tinfo"].setSelected(true);

    //construct
  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties : {
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /*
    ----------------------------------------------------------------------------
      CONFIG SETTINGS
    ----------------------------------------------------------------------------
    */
    adminHost : "127.0.0.1",  // some machines dont know localhost
    adminPort : "8000",
    adminPath : "/tool/buildtool/bin/nph-qxadmin_cgi.py",
    adminUrl  : "http://"+this.adminHost+":"+this.adminPort+this.adminPath,

    /*
    ----------------------------------------------------------------------------
      CONSTRUCTOR HELPERS
    ----------------------------------------------------------------------------
    */
    __makeRpcServer : function()
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(10000000000000);
      rpc.setUrl("http://127.0.0.1:8007");
      rpc.setServiceName("qooxdoo.admin");
      rpc.setCrossDomain(true);

      this.RpcServer = rpc;

      // get qooxdoo base dir (aka QOOXDOO_PATH)
      var that = this;
      this.RpcRunning = this.RpcServer.callAsync(
        function(result, ex, id)
        {
          that.RpcRunning = null;
          if (ex == null) {
              that.debug("Got QOOXDOO_PATH");
              that.qooxdoo_path = result;
          } else {
              alert("Async(" + id + ") exception: " + ex);
          }
        },
        "fss.getBaseDir");

    }, //makeRpcServer


    /**
     * Create the header widget
     *
     * @type member
     * @return {qx.ui.embed.HtmlEmbed} The header widget
     */
    __makeHeader : function()
    {
      var header = new qx.ui.embed.HtmlEmbed("<h1>" + "<span>" + "qooxdoo Build Tool" + "</span>" + "</h1>" + "<div class='version'>qooxdoo " + qx.core.Version.toString() + "</div>");
      header.setHtmlProperty("id", "header");
      header.setStyleProperty("background", "#134275 url(" + qx.io.Alias.getInstance().resolve("buildtool/image/colorstrip.gif") + ") top left repeat-x");
      header.setHeight(70);
      return header;
    },


    __makeCommands : function()
    {
      this._cmdRunBuild = new qx.client.Command("F5");
      this._cmdRunBuild.addEventListener("execute", this.__ehRunBuild, this);

      this._cmdRunSave = new qx.client.Command("F9");
      this._cmdRunSave.addEventListener("execute", this.__ehRunSave, this);

      this._cmdRunReset = new qx.client.Command("F10");
      this._cmdRunReset.addEventListener("execute", this.__ehRunReset, this);

      this._cmdViewFile = new qx.client.Command("Ctrl-Left");
      this._cmdViewFile.addEventListener("execute", this.__ehViewFile, this);

      this._cmdOpenPage = new qx.client.Command("Ctrl-Right");
      this._cmdOpenPage.addEventListener("execute", this.__ehOpenPage, this);

    }, //makeCommands


    __setStateInitialized : function()
    {
      this._cmdRunBuild.setEnabled(true);
      this._cmdViewFile.setEnabled(false);
      this._cmdOpenPage.setEnabled(false);
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
      this._cmdRunBuild.setEnabled(true);
      if (!this.__states.isFirstSample) {
        this._cmdViewFile.setEnabled(true);
      }
      if (!this.__states.isLastSample) {
        this._cmdOpenPage.resetEnabled();
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



    __makeRightEdit : function ()
    {
      this.app.edit = {}; // var registry
      var vl = new qx.ui.layout.VerticalBoxLayout();
      this.widgets["rightedit"] = vl;
      vl.set(
      {
        height : "100%",
        width  : "100%",
        border : "line-left"
      });
      vl.add(this.__makeToolEdit());
      vl.add(this.__makeButtEdit());

      vl.addEventListener("appear", function (e) 
      {
        // check the current qooxdoo path
        if (this.widgets &&
            this.widgets["buttedit.varedit.page.items"] &&
            this.widgets["buttedit.varedit.page.items"]["QOOXDOO_PATH"] &&
            this.widgets["buttedit.varedit.page.items"]["QOOXDOO_PATH"]['dat'])
        {
          var qxp = this.widgets["buttedit.varedit.page.items"]["QOOXDOO_PATH"]['dat'].getValue();
          this.checkQxPath(qxp);
        }
      }, this);

      return vl;
    }, // makeRightEdit()


    __makeRightRun : function ()
    {
      var vl = new qx.ui.layout.VerticalBoxLayout();
      this.widgets["rightrun"] = vl;
      vl.set(
      {
        height : "100%",
        width  : "100%",
        border : "line-left"
      });
      vl.add(this.__makeToolRun());
      //vl.add(this.__makeOptionsPane());
      vl.add(this.__makeButtRun());

      return vl;
    }, // makeRightRun()


    __makeRightInfo : function () 
    {
      var vl = new qx.ui.layout.VerticalBoxLayout();
      this.widgets["rightinfo"] = vl;
      vl.set(
      {
        height : "100%",
        width  : "100%",
        border : "line-left"
      });
      vl.add(this.__makeToolInfo());
      vl.add(this.__makeButtInfo());

      return vl;
    }, // makeRightInfo()


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
    __makeToolRun : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;
      toolbar.setBorder("line-bottom");
      toolbar.setHeight(27);
      this.widgets["toolrun"] = toolbar;

      var mb = new qx.ui.toolbar.Part();
      toolbar.add(mb);
      this.widgets["toolrun.controlbutts"] = mb;

      // -- run button
      this.runbutton = new qx.ui.toolbar.Button("Generate Application", "icon/16/actions/media-playback-start.png");
      mb.add(this.runbutton);
      this.widgets["toolrun.runb"] = this.runbutton;
      this.__bindCommand(this.runbutton, this._cmdRunBuild);
      this.runbutton.setToolTip(new qx.ui.popup.ToolTip("Generate Application"));

      // -- open generated app in browser
      var openb = new qx.ui.toolbar.Button("Open Application", "icon/16/places/www.png");
      mb.add(openb);
      this.widgets["toolrun.openb"] = openb;
      this.__bindCommand(openb, this._cmdOpenPage);
      openb.setToolTip(new qx.ui.popup.ToolTip("Open application in browser"));

      return toolbar;
    },  // __makeToolRun()



    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __makeButtRun : function()
    {
      this.app.run = {};  // var registry

      // Main Container
      var buttview = new qx.ui.pageview.tabview.TabView();

      buttview.set(
      {
        height  : "1*",
        padding : 10
      });

      this.widgets["buttrun"] = buttview;
      this.widgets["buttrun.bar"] = buttview.getBar();

      // First Page
      var bsb1 = new qx.ui.pageview.tabview.Button("Log", "icon/16/mimetypes/text-ascii.png");
      this.widgets["buttrun.demopage.button"] = bsb1;
      bsb1.setChecked(true);
      buttview.getBar().add(bsb1);

      var p1 = new qx.ui.pageview.tabview.Page(bsb1);
      p1.set({ padding : [ 5 ] });
      buttview.getPane().add(p1);

      var f1 = new qx.ui.embed.Iframe;
      p1.add(f1);
      this.widgets["buttrun.demopage.page"] = f1;

      f1.set(
      {
        overflow : "auto",
        height   : "100%",
        width    : "100%",
        border   : "dark-shadow"
      });

      f1.setStyleProperty("font-family", '"Consolas", "Courier New", monospace');

      f1.addEventListener("load", this.__ehRunIframeLoaded, this);

      return buttview;

    },  // __makeButtRun()


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
      buttview.getBar().getManager().addEventListener("changeSelected",this.__ehLeftSelection,this);

      // First Pane
      var bsb1 = new qx.ui.pageview.buttonview.Button("Edit Configuration", "icon/16/actions/view-pane-tree.png");
      buttview.getBar().add(bsb1);
      this.widgets["treeview.bedit"] = bsb1;
      bsb1.setShow("icon");
      bsb1.setToolTip(new qx.ui.popup.ToolTip("Customize configuration"));

      var p1 = new qx.ui.pageview.buttonview.Page(bsb1);

      p1.set(
      {
        width           : "100%",
        height          : "100%",
        backgroundColor : "white"
      });

      buttview.getPane().add(p1);

      //var tree = new qx.ui.tree.Tree("Samples");
      //var tree = new buildtool.FileSystemService(this.RpcServer);
      /*
      this.tree = tree;
      */
      var tree = new qx.ui.tree.Tree("Customize Makefile");
      p1.add(tree);
      tree.setHideNode(true);
      this.widgets["treeview.makvars"] = tree;
      bsb1.setUserData('tree', tree);  // for changeSelected handling

      tree.set(
      {
        width    : "100%",
        height   : "100%",
        padding  : 5,
        overflow : "auto"
      });

      tree.getManager().addEventListener("changeSelection", this.__ehHandleEditTreeSelection, this);

      // Second Pane
      var bsb2 = new qx.ui.pageview.buttonview.Button("Generate Application", "icon/16/categories/applications-development.png");
      buttview.getBar().add(bsb2);
      this.widgets["treeview.brun"] = bsb2;
      bsb2.setShow("icon");
      bsb2.setToolTip(new qx.ui.popup.ToolTip("Generate application"));

      var p2 = new qx.ui.pageview.buttonview.Page(bsb2);

      p2.set(
      {
        width           : "100%",
        height          : "100%",
        backgroundColor : "white"
      });

      buttview.getPane().add(p2);

      // second pane content
      var treeData = 
        {
          label : "Target application",
          items : [
          {
            label : "source",
            props : {
              //selected : true,
              toolTip : new qx.ui.popup.ToolTip("Source version of your application")
            }
          },
          {
            label : "build",
            props : {
              toolTip : new qx.ui.popup.ToolTip("Build version of your application")
            }
          },
          {
            label : "api",
            props : {
              toolTip : new qx.ui.popup.ToolTip("API viewer of framework and your application classes")
            }
          },
          {
            label : "test",
            props : {
              toolTip : new qx.ui.popup.ToolTip("Testrunner application for your test classes")
            }
          }
          ]
        };

      var tree1 = this.createTree(treeData);
      p2.add(tree1);
      this.widgets["treeview.trun"] = tree1;
      bsb2.setUserData('tree', tree1);  // for changeSelected handling
      tree1.getFirstVisibleChildOfFolder().setOpen(true); // open 'Run make'
      tree1.getFirstVisibleChildOfFolder().getFirstVisibleChildOfFolder().setSelected(true); // select "source"

      tree1.set(
      {
        width    : "100%",
        height   : "100%",
        padding  : 5,
        overflow : "auto"
      });

      tree1.getManager().addEventListener("changeSelection", this.__ehHandleRunTreeSelection, this);

      // Third Pane
      var bsb3 = new qx.ui.pageview.buttonview.Button("Info", "buildtool/image/information18.png");
      buttview.getBar().add(bsb3);
      this.widgets["treeview.binfo"] = bsb3;
      bsb3.setShow("icon");
      bsb3.setToolTip(new qx.ui.popup.ToolTip("Info"));

      var p2 = new qx.ui.pageview.buttonview.Page(bsb3);

      p2.set(
      {
        width           : "100%",
        height          : "100%",
        backgroundColor : "white"
      });

      buttview.getPane().add(p2);

      // pane content
      var treeData = 
        {
          label : "Overview",
          items : []
        };

      var tree1 = this.createTree(treeData);
      this.widgets["treeview.tinfo"] = tree1;
      p2.add(tree1);
      tree1.set(
      {
        width    : "100%",
        height   : "100%",
        padding  : 5,
        overflow : "auto"
      });

      tree1.getManager().addEventListener("changeSelection", this.__handleInfoTreeSelection, this);


      return buttview;
    }, // __makeLeft()


    createTree : function (treeData)
    {
      var tree = new qx.ui.tree.Tree("AnonRoot");
      tree.setHideNode(true);
      var selected;

      // recursive worker function
      var createTreeR = function (tData)
      {
        if (!tData.items)
        {
          var node = new qx.ui.tree.TreeFile(tData.label);
        } else 
        {
          var node = new qx.ui.tree.TreeFolder(tData.label);
          node.setAlwaysShowPlusMinusSymbol(true);

          for (var i=0; i<tData.items.length; i++)
          {
            var item = tData.items[i];
            node.add(createTreeR(item));
          }
        }
        if (tData.props) {
          node.set(tData.props);
        };
        /*
        if (tData.ttip) // create tooltip
        {
          node.add(          
        }
        */
        return node;
      }; //createTreeR

      tree.add(createTreeR(treeData));

      return tree;
    },


    /** Traverse treeData and apply fn at each node
     */
    traverseTreeData : function (treeData, fn)
    {
      var level = 0;
      var rc;

      var traverseTD = function (treeData, fn, level)
      {
        if (!treeData.items)
        {
          rc = fn(treeData,'L', level);
          return;
        } else 
        {
          rc = fn(treeData,'N', level);
          if (rc == 0) // !=0 means prune this subtree
          {
            for (var i=0; i<treeData.items.length; i++)
            {
              var item = treeData.items[i];
              arguments.callee(item, fn, level + 1);
            }
          }
          return;
        }
      };

      traverseTD(treeData, fn, level);

      return;

    }, //traverseTreeData


    /** Select right hand side toolbar and button pane, depending on left hand side
     *  choice
     */
    __toggleRightSide : function (b) 
    {
      if (b=="edit") // make file edit
      {
        this.widgets["rightedit"].setVisibility(true);
        this.widgets["rightrun"].setVisibility(false);
        this.widgets["rightinfo"].setVisibility(false);
      } else if (b=="run")
      {
        this.widgets["rightedit"].setVisibility(false);
        this.widgets["rightrun"].setVisibility(true);
        this.widgets["rightinfo"].setVisibility(false);
      } else if (b=="info")
      {
        this.widgets["rightedit"].setVisibility(false);
        this.widgets["rightrun"].setVisibility(false);
        this.widgets["rightinfo"].setVisibility(true);
      }
      
    },

    __ehLeftSelection : function (e) 
    {
      var sel = e.getData();
      var lab = sel.getLabel();
      var tok;

      if (lab == "Edit Configuration") 
      {
        tok = "edit";
      } else if (lab == "Generate Application")
      {
        tok = "run";
      } else if (lab == "Info")
      {
        tok = "info";
      }
      this.__toggleRightSide(tok);
    },


    __makeToolEdit : function ()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;
      toolbar.setBorder("line-bottom");
      toolbar.setHeight(27);
      this.widgets["tooledit"] = toolbar;

      var mb = new qx.ui.toolbar.Part();
      toolbar.add(mb);
      this.widgets["tooledit.controlbutts"] = mb;

      // -- run button
      this.runbutton = new qx.ui.toolbar.Button("Save", "icon/16/actions/media-playback-start.png");
      mb.add(this.runbutton);
      this.widgets["tooledit.runbutton"] = this.runbutton;
      this.__bindCommand(this.runbutton, this._cmdRunSave);
      this.runbutton.setToolTip(new qx.ui.popup.ToolTip("Save"));

      // -- reset button
      var resetb = new qx.ui.toolbar.Button("Reset", "icon/16/actions/edit-undo.png");
      mb.add(resetb);
      this.widgets["tooledit.resetbutton"] = resetb;
      this.__bindCommand(resetb, this._cmdRunReset);
      resetb.setToolTip(new qx.ui.popup.ToolTip("Reset to load-time values"));

      return toolbar;
      
    }, //__makeToolEdit


    __makeButtEdit : function ()
    {
      // Main Container
      var buttview = new qx.ui.pageview.tabview.TabView();

      buttview.set(
      {
        height  : "1*",
        padding : 10
      });

      this.widgets["buttedit"] = buttview;
      this.widgets["buttedit.bar"] = buttview.getBar();

      // First Page
      var bsb1 = new qx.ui.pageview.tabview.Button("Customize Configuration", "icon/16/actions/system-run.png");
      this.widgets["buttedit.varedit.button"] = bsb1;
      bsb1.setChecked(true);
      buttview.getBar().add(bsb1);

      var p1 = new qx.ui.pageview.tabview.Page(bsb1);
      p1.set({ padding : [ 5 ] });
      buttview.getPane().add(p1);

      // contents widget
      //var f1 = new qx.ui.embed.HtmlEmbed();
      var f1 = new qx.ui.layout.GridLayout();
      p1.add(f1);
      this.widgets["buttedit.varedit.page"] = f1;
      this.widgets["buttedit.varedit.page.items"] = {}; // item widget registry

      f1.set(
      {
        overflow : "auto",
        height   : "100%",
        width    : "100%",
        border   : "dark-shadow"
      });
      f1.setStyleProperty("font-family", '"Consolas", "Courier New", monospace');

      /*
      //++tmp
      f1.setColumnCount(2);
      //f1.setRowCount(2);
      f1.addRow();
      f1.add(new qx.ui.basic.Label("Und 1.1"),0,0);
      f1.add(new qx.ui.basic.Label("Und 1.2"),0,1);
      f1.addRow();
      f1.add(new qx.ui.basic.Label("Und 2.1"),1,0);
      f1.add(new qx.ui.basic.Label("Und 2.2"),1,1);
      for (var i=0, N=f1.getColumnCount(); i<N; i++) {                                   
        f1.setColumnWidth(i, 54);                                                   
      }                                                                                   
                                                                                          
      for (var i=0, N=f1.getRowCount(); i<N; i++) {                                      
        f1.setRowHeight(i, 18);                                                     
      }                                                                                   

      //--tmp
      */

      return buttview;

    }, //makeButtEdit


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __makeToolInfo : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;
      toolbar.setBorder("line-bottom");
      toolbar.setHeight(27);
      this.widgets["toolinfo"] = toolbar;

      var mb = new qx.ui.toolbar.Part();
      toolbar.add(mb);
      this.widgets["toolinfo.controlbutts"] = mb;

      return toolbar;
    },  // __makeToolInfo()


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __makeButtInfo : function()
    {
      // Main Container
      var buttview = new qx.ui.pageview.tabview.TabView();

      buttview.set(
      {
        height  : "1*",
        padding : 10
      });

      this.widgets["buttinfo"] = buttview;
      this.widgets["buttinfo.bar"] = buttview.getBar();

      // First Page
      var bsb1 = new qx.ui.pageview.tabview.Button("Info", "icon/16/actions/system-run.png");
      this.widgets["buttinfo.infopage.button"] = bsb1;
      bsb1.setChecked(true);
      buttview.getBar().add(bsb1);

      var p1 = new qx.ui.pageview.tabview.Page(bsb1);
      p1.set({ padding : [ 5 ] });
      buttview.getPane().add(p1);

      var f1 = new qx.ui.embed.Iframe;
      p1.add(f1);
      this.widgets["buttinfo.infopage.page"] = f1;
      f1.set(
      {
        overflow : "auto",
        height   : "100%",
        width    : "100%",
        border   : "dark-shadow"
      });
      f1.setStyleProperty("font-family", '"Consolas", "Courier New", monospace');

      return buttview;

    },  // __makeButtInfo()


    __makeOptionsPane : function () 
    {
      var rightSub = new qx.ui.layout.VerticalBoxLayout();
      rightSub.set(
      {
        padding : 10,
        height  : "auto",
        spacing : 20 
      });

      var groupBox = new qx.ui.groupbox.GroupBox();
      groupBox.set({ height : "auto" });
      rightSub.add(groupBox);

      var vert = new qx.ui.layout.VerticalBoxLayout();

      vert.set(
      {
        height : "auto",
        width  : "100%"
      });

      groupBox.add(vert);

      var opts = new qx.ui.layout.HorizontalBoxLayout();
      //vert.add(opts);
      opts.set(
      {
        height : "auto",
        width : "100%"
      });

      var c1 = new qx.ui.form.CheckBox("source","sourceChecked","c1");
      opts.add(c1);

      var addOpts = new qx.ui.layout.HorizontalBoxLayout();
      vert.add(addOpts);
      addOpts.set(
      {
        height : "auto",
        width : "100%"
      });

      var t1 = new qx.ui.form.TextField();
      addOpts.add(t1);

      var l1 = new qx.ui.basic.Label("additional run options");
      addOpts.add(l1);


      return rightSub;

    }, //makeOptionsPane


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
    __ehHandleEditTreeSelection : function(e)
    {
      var id;
      if (id = e.getData()[0].getUserData('id'))
      {
        var eitem = this.widgets["buttedit.varedit.page.items"][id]['lab'];
        eitem.scrollIntoView(true);
      }

    }, //handleEditTreeSelection


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    __ehHandleRunTreeSelection : function(e)
    {
      var treeNode = e.getData()[0];

      this.__setRunButtons(treeNode);

    }, //handleRunTreeSelection


    __setRunButtons : function(treeNode)
    {
      // handle enable "Open Application" button
      if (treeNode == null) {
        this._cmdOpenPage.setEnabled(false);
      } else if (treeNode instanceof qx.ui.tree.TreeFolder || treeNode.getLabel() == "source") 
      {
        //this.widgets["toolrun.openb"].setEnabled(false);
        this._cmdOpenPage.setEnabled(false);
      } else 
      {
        //this.widgets["toolrun.openb"].setEnabled(true);
        this._cmdOpenPage.setEnabled(true);
      }

      // handle enable "Generate Application" button
      if (treeNode == null) {
        this._cmdRunBuild.setEnabled(false);
      } else if (treeNode instanceof qx.ui.tree.TreeFile) 
      {
        //this.widgets["toolrun.runb"].setEnabled(true);
        this._cmdRunBuild.setEnabled(true);
      } else 
      {
        //this.widgets["toolrun.runb"].setEnabled(false);
        this._cmdRunBuild.setEnabled(false);
      }

    }, // setRunButtons


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    __handleInfoTreeSelection : function(e)
    {
      this.widgets["buttinfo.infopage.page"].setSource("help_overview.html");

    }, //handleInfoTreeSelection


    __ehViewFile : function (e) 
    {
      if (!this.tree.getSelectedElement())
      {  // this is a kludge!
        return;
      }
      var treeNode = this.tree.getSelectedElement();

      if (treeNode instanceof qx.ui.tree.TreeFile) 
      {
        this.getFile(treeNode);
      }
    },


    __ehRunBuild : function (e)
    {
      /*
      if (!this.tree.getSelectedElement())
      {  // this is a kludge!
        return;
      }
      */
      var treeNode = this.widgets["treeview.trun"].getSelectedElement();

      if (treeNode instanceof qx.ui.tree.TreeFile) 
      {
        this.app.run.during_build = true;
        this._cmdRunBuild.setEnabled(false);
        this._cmdOpenPage.setEnabled(false);
        this.runBuild(treeNode);
      }
    },


    runBuild : function (treeNode) 
    {
      /*
      var a = this.getParentFolderChain(treeNode);
      var b = [];
      var that = this;

      for (var i=0; i<a.length; i++) 
      {
        b.push(a[i].getLabel());
      }
      //alert(b);
      // drop the root node
      b.shift();
      */
      var f1 = this.widgets["buttrun.demopage.page"];
      f1.getContentDocument().innerHtml = "<html><body>Processing, please wait ...</body></html>";

      // check cygwin path
      if ('cygwin' in this._urlParms.parms)
      {
        var cygParm = 'cygwin'+"="+this._urlParms.parms['cygwin'];
      }

      if (this.RpcServer) {
        // run make through RPC
        this.RpcRunning = this.RpcServer.callAsync(
          function(result, ex, id)
          {
            that.RpcRunning = null;
            if (ex == null) {
                that.debug("Build successfull, rendering output...");
                that.f2.setHtml('<pre>'+result+'</pre>')
                that.debug("Rendering complete.");
            } else {
                alert("Async(" + id + ") exception: " + ex);
            }
          },
          "fss.runMake",
          b,
          "source");
      } else {
        // run make through CGI
        var target = treeNode.getLabel();
        //var url = "http://"+this.adminHost+":"+this.adminPort+this.adminPath+"?action=run&make="+target+"&"+cygParm;
        var url = this.adminPath+"?action=run&make="+target+"&"+cygParm;
        var currUrl = f1.getSource();
        url == currUrl ? f1.reload() : f1.setSource(url);
      }

    },  // runBuild()


    __ehRunSave : function (e) 
    {
      var vals = this.__editCheckForm();
      if (vals.length == 0) 
      {
        return;
      } else {
        var rc   = this.__editSendData(vals);
      }
    },


    // reset edit form to values when page was loaded
    __ehRunReset : function (e) 
    {
      var makItems = this.widgets["buttedit.varedit.page.items"];
      for (var id in makItems) 
      {
        var item = makItems[id];
        if (!item['dat']) 
        {
          continue
        } else 
        {
          // compute reset value
          var oitem = this.findOldItem(id, this.__makoldvars);
          var rval = oitem ? oitem.dat : item.defaultt;
          // get current value
          var cval = item['dat'].getValue();
          // set new value?
          if (cval != rval) {
            item['dat'].setValue(rval);
            if (rval == item.defaultt) {
              item['dirty']=2;
            } else {
              item['dirty']=1;
            }
          }
        }
      }
    },


    __editCheckForm : function () 
    {
      var vals = [];
      // iterate through form data
      var makItems = this.widgets["buttedit.varedit.page.items"];
      for (var id in makItems) 
      {
        var item = makItems[id];
        if (!item['dat'])  // skip pure labels (like section heads)
        {
          continue;
        } else 
        {
          // check QOOXDOO_PATH
          if (id == "QOOXDOO_PATH") 
          {
            var currVal = item.dat.getValue();
            if (currVal == item.defaultt) {
              alert('You have to at least specify QOOXDOO_PATH (the path to your qooxdoo installation); aborting...');
              return [];
            }
          } else 
          {
            var currVal = item.dat.getValue();
          }
          if (item.dirty) {
            if (item.dirty==1) {
              // gather changed field
              vals.push({lab: item.lab.getText(), dat: currVal});
            } else if (item.dirty==2) {
              // mark for remove
              vals.push({lab: item.lab.getText(), dat: "__REMOVEME__"});
            }
          }
        }
      }

      return vals;

    }, // editCheckForm()


    __editSendData : function (vals)
    {
      //var url = "http://"+this.adminHost+":"+this.adminPort+this.adminPath;
      var url = this.adminPath;
      var req = new qx.io.remote.Request(url);
      //var dat = "action=save&makvars={'a':1,'b':2}";
      var dat = "action=save";
      // check cygwin path
      if ('cygwin' in this._urlParms.parms)
      {
        var cygParm = 'cygwin'+"="+this._urlParms.parms['cygwin'];
        dat += "&"+cygParm;
      }
      dat += "&makvars=";

      dat += qx.io.Json.stringify(vals);

      req.setTimeout(5000);
      req.setProhibitCaching(true);
      req.setMethod(qx.net.Http.METHOD_POST);
      req.setData(dat);
      //req.setCrossDomain(true);

      req.addEventListener("completed", function(evt)
      {
        var loadEnd = new Date();
        this.debug("Time to load page source from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");

        var content = evt.getData().getContent();

        if (content) {
          alert(content);
        }
      },
      this);

      req.addEventListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
      }, this);

      var loadStart = new Date();
      req.send();

      return;

    }, // editSendData()


    __ehOpenPage : function (e)
    {
      var treeNode = this.widgets["treeview.trun"].getSelectedElement();

      if (!treeNode) 
      {
        alert("Please select a previously built target to open (source, build, ...)");
        return;
      }

      if (treeNode instanceof qx.ui.tree.TreeFile) 
      {
        var target = treeNode.getLabel();
        if (target == "source") {
          // try a 'file:' url for source
          var lurl = this.adminPath+"?action=getroot";

          this.__loadPage(lurl, function (cont)
          {
            var docRoot = qx.lang.String.trim(cont);
            var url = "file://"+ docRoot + "/"+ target +"/index.html";
            // open index.html
            window.open(url);
          }, this);
        } else {
          var url = "/"+ target +"/index.html";
          window.open(url);
        }
      }
    },


    getFile : function (treeNode)
    {
      var a = this.getParentFolderChain(treeNode);
      var b = [];
      var that = this;
      var treeLabel = treeNode.getLabel();

      for (var i=0; i<a.length; i++) 
      {
        b.push(a[i].getLabel());
      }
      // drop the root node
      b.shift();
      // add file name
      b.push(treeLabel);

      this.RpcRunning = this.RpcServer.callAsync(
        function(result, ex, id)
        {
          that.RpcRunning = null;
          if (ex == null) {
              that.debug("Got file "+treeLabel);
              that.f3.setHtml('<pre>'+result+'</pre>');
          } else {
              alert("Async(" + id + ") exception: " + ex);
          }
        },
        "fss.getFile",
        b);

    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    leftReloadTree : function(tD, oldData)
    {
      var treeData = tD || this.__makvars;
      //var tree     = new qx.ui.tree.Tree("Customize Makefile");
      var tree     = this.widgets["treeview.makvars"];

      var makRoot = new qx.ui.tree.TreeFolder("Configuration Vars");
      tree.add(makRoot);

      this.createMakTree(makRoot,treeData);
      makRoot.setOpen(true);

      this.createMakList1(this.widgets["buttedit.varedit.page"],treeData,oldData);

      qx.client.Timer.once(function()
      {
        qx.ui.core.Widget.flushGlobalQueues();  // create all widgets
      }, this, 0);

      return;

    },  // leftReloadTree


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    createMakList : function(htmlContainer, tD)
    {
      var treeData = tD;
      var html = new qx.util.StringBuilder();

      this.traverseTreeData(treeData, function (item, type, level)
      {
        if (item.label.search(/Copyright/i) != -1 ||  // things to skip
            item.label.search(/INCLUDE/i)   != -1
           ) 
        {
          return -1; //prune these subtrees
        }
        if (item.type == 'part')
        {
          html.add('<h3>'+item.label+'</h3>');
        } else if (item.type == 'section')
        {
          
        } else if (item.type == 'var')
        {
          html.add(item.label+'<br>');
        }
        return 0;
      });

      htmlContainer.setHtml(html.get());

      return;

    }, //createMakList


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @param oldData {Array} Array like [{'lab':'QOOXDOO_PATH','dat':'../qooxdoo'},...]
     *                        containing previously set variables (via Makefile)
     * @return {void}
     */
    createMakList1 : function(canvasContainer, tD, oldData)
    {
      var treeData = tD;
      var container = canvasContainer;
      var rowIndex = 0;
      var that     = this;

      container.setColumnCount(4);

      this.traverseTreeData(treeData, function (item, type, level)
      {
        if (item.label.search(/Copyright/i) != -1 ||  // things to skip
            item.label.search(/INCLUDE/i)   != -1
           ) 
        {
          return -1; //prune these subtrees
        }
        if (item.type == 'part')
        {
          container.addRow();
          rowIndex = container.getRowCount() -1;
          var l = new qx.ui.basic.Label(item.label);
          that.widgets["buttedit.varedit.page.items"][item.label]={};
          that.widgets["buttedit.varedit.page.items"][item.label]['lab']=l; // register widget
          l.setUserData('id',item.label);
          //l.setStyleProperty("font-weight","bold");
          //l.setTextColor("red");
          l.setFont("bold");
          l.setBackgroundColor("#E1EEFF");
          container.add(l,0,rowIndex);
        } else if (item.type == 'section')
        {
          
        } else if (item.type == 'var')
        {
          container.addRow();
          rowIndex = container.getRowCount() -1;
          // Var Name
          var l = new qx.ui.basic.Label(item.label);
          container.add(l,0,rowIndex);
          that.widgets["buttedit.varedit.page.items"][item.label]={};
          that.widgets["buttedit.varedit.page.items"][item.label]['lab']=l; // register widget
          // Var Value
          var olditem = that.findOldItem(item.label, oldData);
          var value = olditem ? olditem.dat : item.defaultt;
          var tf = new qx.ui.form.TextField(value);
          tf.addEventListener("changeValue",that.__ehEditFormChanged,that);
          that.widgets["buttedit.varedit.page.items"][item.label]['dat']=tf; // register widget
          that.widgets["buttedit.varedit.page.items"][item.label]['defaultt']=item.defaultt; // always remember application.mk default
          tf.setUserData('id',item.label);
          container.add(tf,1,rowIndex);
          // Var Reset Button
          var rb = new qx.ui.form.Button("Reset value", "icon/16/actions/document-revert.png");
          rb.setUserData('id',item.label);
          rb.setShow("icon");
          rb.addEventListener("execute",that.__ehEditFormReset,that);
          rb.setToolTip(new qx.ui.popup.ToolTip("Reset to default"));
          container.add(rb,2,rowIndex);
          // File Chooser for QOOXDOO_PATH
          if (item.label == "QOOXDOO_PATH") 
          {
            var fc = new qx.ui.form.Button("Pick Qooxdoo Path", "icon/16/actions/document-open.png");
            fc.setUserData("id",item.label);
            fc.setShow("icon");
            fc.addEventListener("execute", that.__ehQxPathChooser,that);
            fc.setToolTip(new qx.ui.popup.ToolTip("Choose Qooxdoo Path"));
            container.add(fc,3,rowIndex);
          }
        }
        return 0;
      });

      for (var i=0; i<2; i++) {
        container.setColumnWidth(i, 350);
      }

      for (var i=2; i<4; i++) {
        container.setColumnWidth(i,30);
      }

      for (var i=0, N=container.getRowCount(); i<N; i++) {
        container.setRowHeight(i, 24);
      }

      return;

    }, //createMakList1

    
    // find item with 'lab'==label in itemList; return item
    findOldItem : function (label, itemList) 
    {
      var item = null;
      for (var i=0; i<itemList.length; i++) 
      {
        if (itemList[i]['lab'] == label)
        {
          item = itemList[i];
          break;
        }
      }

      return item;
    },


    __ehEditFormChanged : function (e) 
    {
      
      var id = e.getTarget().getUserData('id');
      if (id) {
        var item = this.widgets["buttedit.varedit.page.items"][id]
        if (item.dat.getValue() == item.defaultt) { // check if new value is a reset to default
          item.dirty = 2;  // means changed to default
        } else
        {
          item.dirty = 1;  // means changed to some other value
        }
      }
    },


    __ehEditFormReset : function (e) 
    {
      var id = e.getTarget().getUserData('id');
      if (id) 
      {
        var item = this.widgets["buttedit.varedit.page.items"][id]
        item['dat'].setValue(item['defaultt']);
        // item['dirty'] will be set in __ehEditFormChanged, which is invoked subsequently
      }
    },


    __ehQxPathChooser : function (e) 
    {
      var d = qx.ui.core.ClientDocument.getInstance();
      var diag = new qx.ui.window.Window("Qooxdoo Path Picker", "icon/16/actions/document-open.png");
      d.add(diag);
      diag.setSpace(200, 400, 100, 120);
      diag.set({
        showMaximize : false,
        showMinimize : false,
        modal : true
      });

      var box = new qx.ui.layout.VerticalBoxLayout();
      diag.add(box);
      box.set({
        horizontalChildrenAlign : 'center',
        padding : 10,
        spacing:  10,
        width : "100%",
        height: "100%"
      });

      var lab = new qx.ui.basic.Label("Please identify your qooxdoo installation by selecting one of its top-level files (AUTHORS, LICENSE,...)");
      this.widgets["window.chooseQxPath.lab"] = lab;
      box.add(lab);

      var tf = new qx.ui.embed.HtmlEmbed("<input type='file' onchange='qx.core.Init.getInstance().getApplication().viewer.getQxPath(this.value);'>");
      box.add(tf);
      tf.set({
        left   : 80,
        height : 30
      });

      var line1 = new qx.ui.layout.HorizontalBoxLayout();
      box.add(line1);
      line1.set({
        spacing : 5,
        width : "100%"
      });

      var b1 = new qx.ui.form.Button("OK");
      line1.add(b1);
      b1.addEventListener("execute", function (e) 
      {
        var qxpath_ent = this.widgets["buttedit.varedit.page.items"]["QOOXDOO_PATH"];
        if (qxpath_ent['tmp']) { // is there an temp. new value?
          var npath      = qxpath_ent['tmp'];
          if (npath != qxpath_ent['dat'].getValue())  // is it different?
          {
            qxpath_ent['dirty']=1; // means changed
            qxpath_ent['dat'].setValue(npath); // store value
          }
        }
        diag.close();
        diag.getParent().remove(diag);
        qx.ui.core.Widget.flushGlobalQueues();
        diag.dispose();
      }, this);

      var b2 = new qx.ui.form.Button("Cancel");
      line1.add(b2);
      b2.addEventListener("execute", function (e) 
      {
        diag.close();
        diag.getParent().remove(diag);
        qx.ui.core.Widget.flushGlobalQueues();
        diag.dispose();
      }, this);

      diag.open();
      
    }, 


    getQxPath : function (path) 
    {
      // strip 

      // Relativize path value (through server) and remember value
      var url = this.adminPath+"?action=reldir&path="+path;
      this.__loadPage(url, function (npath) 
      {
        npath = qx.lang.String.trim(npath);
        if (npath == "-1") 
        {
          this.widgets["window.chooseQxPath.lab"].setText("This does not seem like a proper qooxdoo installation path; choose again");
        } else 
        {
          this.widgets["window.chooseQxPath.lab"].setText("Good, this looks like a proper qooxdoo installation");
          this.widgets["buttedit.varedit.page.items"]["QOOXDOO_PATH"]['tmp']=npath; // remember value
        }
      }, this);
    },


    // bring up the path chooser if passed value is not a valid one
    checkQxPath : function (path) 
    {
      // Relativize path value (through server) and remember value
      var url = this.adminPath+"?action=reldir&path="+path;
      this.__loadPage(url, function (npath) 
      {
        npath = qx.lang.String.trim(npath);
        if (npath == "-1") 
        {
          this.__ehQxPathChooser(null);
        }
      }, this);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    createMakTree : function(widgetNode, tD)
    {
      var treeData = tD || this.__makvars;
      var parnt    = [widgetNode];

      // callback for the traverseTreeData method
      // :: at any node of the tree data, do the following:
      function buildWidgetTree(node, type, level)
      {
        var nnode;
        var olevel = parnt.length - 1;  // length of parent array as depth indicator

        if (node.label.search(/Copyright/i) != -1 ||  // things to skip
            node.label.search(/INCLUDE/i)   != -1
           ) 
        {
          return -1; //prune these subtrees
        }
        if (node.type == 'part')       // parts become folders in the widget tree
        {
          nnode = new qx.ui.tree.TreeFolder(node.label);
          if (olevel >= level) // coming back from a recursion
          {
            parnt.pop();
          }
          parnt[parnt.length-1].add(nnode);
          parnt.push(nnode);
        } else if (node.type == 'section') // skip sections for now
        {
        } else if (node.type == 'var')  // vars become leaf nodes
        {
          nnode = new qx.ui.tree.TreeFile(node.label);
          parnt[parnt.length-1].add(nnode);
        }
        if (nnode) {
          nnode.setUserData("id", node.label);  // for click event handling
        }

        return 0;

      }; // buildWidgetTree

      this.traverseTreeData(treeData, buildWidgetTree); 
              // return value will be attached to widgetNode

      return;

    },  // createMakTree


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

      var f1 = this.widgets["buttrun.demopage.page"];

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
        //this.widgets["treeview.makvars"].setSelectedElement(treeNode);
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

      this._currentSampleUrl == url ? f1.reload() : f1.setSource(url);

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
    __ehRunIframeLoaded : function(e)
    {
      if (this.app.run.during_build) {
        alert("Build finished");
        this.app.run.during_build = false;
        var treeNode = this.widgets["treeview.trun"].getSelectedElement();
        this.__setRunButtons(treeNode);
      }
      var ifrm = e.getTarget();
      ifrm.setScrollTop(ifrm.getScrollHeight());
      return;
    }, // __ehRunIframeLoaded


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
        this.widgets["treeview.makvars"].setSelectedElement(first);
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
    __applyPlayAll : function(value, old)
    {
      if (value == true )
      {
        this.widgets["toolbar.playall"].setIcon(buildtool.AppFrame.Img_PlayAll_Stop);
      } else
      {
        this.widgets["toolbar.playall"].setIcon(buildtool.AppFrame.Img_PlayAll_Default);
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
    __loadPage : function(url, fn, obj)
    {
      var req = new qx.io.remote.Request(url);

      req.setTimeout(180000);
      req.setProhibitCaching(true);

      req.addEventListener("completed", function(evt)
      {
        var loadEnd = new Date();
        this.debug("Time to load page source from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");

        var content = evt.getData().getContent();

        if (content) {
          fn.call(obj, content);
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
    dataLoader : function()
    {
      var url = "script/applicationvars.js";

      this.__loadPage(url, function (cont) 
      {
        this.__makvars = eval("("+cont+")");
        // get old vars too
        //var url1 = "http://"+this.adminHost+":"+this.adminPort+this.adminPath+"?action=getvars";
        var url1 = this.adminPath+"?action=getvars";
        //var url1 = this.adminUrl+"?action=getvars";
        // check cygwin path
        if ('cygwin' in this._urlParms.parms)
        {
          var cygParm = 'cygwin'+"="+this._urlParms.parms['cygwin'];
          url1 += "&"+cygParm;
        }
        this.__loadPage(url1, function (cont1) 
        {
          this.__makoldvars = eval("("+cont1+")");
          var start = new Date();
          this.leftReloadTree(this.__makvars, this.__makoldvars);
          var end = new Date();
          this.debug("Time to build/display tree: " + (end.getTime() - start.getTime()) + "ms");
        }, this);
      }, this);


      // read initial state
      var state = this._history.getState();
    },


    /**
     * Return the array of ancestor folders of a given element.
     *
     * @type member
     * @param treeElem {qx.ui.tree.AbstractTreeElement} Element of a tree
     * @return {qx.ui.tree.AbstractTreeElement[]|null} Array of ancestor folders
     */
    getParentFolderChain : function(treeElem) 
    {
      if (treeElem.getParentFolder() == null)
      {
        return null;
      } else 
      {
        return this.getParentFolderChainR(treeElem, []);
      }
      
    },

    getParentFolderChainR : function(treeElem,aAncestors)
    {
      var parnt = treeElem.getParentFolder();
      if (parnt == null)
      {
        return aAncestors;
      } else 
      {
        aAncestors.unshift(parnt);
        return arguments.callee(parnt, aAncestors);
      }
    }

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("widgets", "tests", "_sampleToTreeNodeMap", "tree", "__states");
    this._disposeObjects("header", "mainsplit", "tree1", "left", "runbutton", "toolbar", "f1", "f2", "logger", "_history", "logappender", '_cmdObjectSummary', '_cmdRunBuild', '_cmdRunSave', '_cmdRunReset', '_cmdViewFile', '_cmdOpenPage', '_cmdSampleInOwnWindow', '_cmdLoadProfile', '_cmdProfile', '_cmdShowLastProfile', '_cmdDisposeSample', '_cmdNamespacePollution');
  },


  defer : function (statics,members,properties) 
  {
    // I think I need this because getQxPath is called from a (document) input field
    qx.lang.Function.bind(members.getQxPath, this);
  }
});
