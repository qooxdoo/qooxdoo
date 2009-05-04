/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008-09 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************
#asset(toolbox/*)

************************************************************************ */

/**
 * The GUI definition of the qooxdoo toolbox.
 */
qx.Class.define("toolbox.gui.Toolbox",
{
  extend : qx.ui.container.Composite,




  /*
  *****************************************************************************
	 CONSTRUCTOR
  ****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var layout = new qx.ui.layout.VBox().set({ separator : "separator-vertical" });
    this.setLayout(layout);

    // Dependencies to loggers
    qx.log.appender.Native;
    qx.log.appender.Console;

    this.widgets = {};

    // Header
    this.add(this.__createHeader());

    // Toolbar
    this.toolbar = this.__makeToolbar();
    this.add(this.toolbar);

    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.Pane("horizontal");
    this.add(mainsplit, { flex : 1 });
    this.mainsplit = mainsplit;

    // the decorator of the panes
    var deco = new qx.ui.decoration.Background().set({ backgroundColor : "background-medium" });
    this.widgets["decorator.deco"] = deco;

    // creates the log pane
    var log = this.__makeLogPane();

    // Adds the log console to the logStack
    this.mainStack = new qx.ui.container.Stack;
    this.mainStack.add(this.__makeHomeContent());
    this.mainStack.add(this.__makeAppDevelContent());
    this.mainStack.add(this.__makeBuiltInAppContent());
    this.mainStack.add(this.__makeHelpContent());
    this.mainStack.setSelection([this.mainStack.getChildren()[0]]);

    // Content of the toolbox
    var content = this.mainStack;
    this.mainsplit.add(content, 2);

    // Adds the log console to the logStack
    this.logStack = new qx.ui.container.Stack;
    this.logStack.setDecorator("main");
    this.logStack.add(log);

    this.mainsplit.add(this.logStack, 1);
    this.logStack.exclude();

    // Adds the event listener to the buttons
    this.__attachOpenLogPane();
    this.__assignHomeInitialListener();
    this.__attachContent();
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

    __adminHost : "127.0.0.1",
    __adminPort : "8000",
    __adminPath : "/component/toolbox/tool/bin/nph-qxadmin_cgi.py",
    __adminUrl : "http://" + this.adminHost + ":" + this.adminPort + this.adminPath,

    // variables-----------------------------------------------------------------
    __currentType : "gui",
    __currentFileName : "",
    __currentFilePath : "",
    __nameSpace : "",
    __logName : "",
    __isEdited : false,
    __isGenerateSource : false,

    // ------------------------------------------------------------------------
    //   CONSTRUCTOR HELPERS
    // ------------------------------------------------------------------------
    /**
     * creates the toolbar of the toolbox
     *
     * @return {var} toolbar of the toolbox
     */
    __makeToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;

      var part1 = new qx.ui.toolbar.Part();
      toolbar.add(part1);

      // -- home button (The Welcome page of the toolbox)
      var homeButton = new qx.ui.toolbar.RadioButton("Home", "toolbox/image/go-home.png");
      part1.add(homeButton);
      this.widgets["toolbar.homeButton"] = homeButton;
      homeButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Welcome page of the toolbox")));
      homeButton.setChecked(true);

      // --Application development button (The development part of the toolbox)
      var appDevelButton = new qx.ui.toolbar.RadioButton("Application Development", "toolbox/image/development.png");
      part1.add(appDevelButton);
      this.widgets["toolbar.appDevelButton"] = appDevelButton;
      appDevelButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Create new application with the toolbox")));

      // --Application development button (The development part of the toolbox)
      var appBuiltButton = new qx.ui.toolbar.RadioButton("Built-in Applications", "toolbox/image/applications-utilities.png");
      part1.add(appBuiltButton);
      this.widgets["toolbar.appBuiltButton"] = appBuiltButton;
      appBuiltButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Build the optimized version of the application")));

      // --Help button (Support part of the toolbox)
      var helpButton = new qx.ui.toolbar.RadioButton("Help", "toolbox/image/utilities-help.png");
      part1.add(helpButton);
      this.widgets["toolbar.helpButton"] = helpButton;
      helpButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Contains help and support")));

      // Radiobutton Manager
      var manager = new qx.ui.form.RadioGroup(homeButton, appDevelButton, appBuiltButton, helpButton);
      this.widgets["radioButton.manager"] = manager;

      toolbar.addSpacer();

      var part2 = new qx.ui.toolbar.Part();
      toolbar.add(part2);

      // --Log button (shows/hides the log pane)
      var logCheckButton = new qx.ui.toolbar.CheckBox("Log File", "toolbox/image/utilities-log-viewer.png");
      part2.add(logCheckButton);
      this.widgets["toolbar.logCheckButton"] = logCheckButton;
      logCheckButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Show log output")));
      logCheckButton.setEnabled(false);

      return toolbar;
    },  // makeToolbar


    /**
     * adds the event listener to the toolbox buttons
     *
     * @return {void} 
     */
    __assignHomeInitialListener : function()
    {
      this.widgets["toolbar.homeButton"].addListener("click", function() {
        this.widgets["toolbar.homeButton"].setChecked(true);
      }, this);
    },


    /**
     * Shows the log entries.
     *
     * @return {void} 
     */
    __attachOpenLogPane : function()
    {
      this.widgets["toolbar.logCheckButton"].addListener("click", function()
      {
        var logState = this.widgets["toolbar.logCheckButton"].getChecked();

        if (logState == true) {
          this.logStack.show();
        } else {
          this.logStack.exclude();
        }
      },
      this);
    },


    /**
     * attaches the content of the toolbox
     *
     * @return {void} 
     */
    __attachContent : function()
    {
      this.widgets["radioButton.manager"].addListener("changeSelection", function(e)
      {
        if (e.getData()[0] != null)
        {
          if (e.getData()[0].getLabel().toString() == "Home")
          {
            this.logStack.exclude();
            this.mainStack.setSelection([this.mainStack.getChildren()[0]]);

            this.widgets["toolbar.homeButton"].addListener("click", function() {
              this.widgets["toolbar.homeButton"].setChecked(true);
            }, this);

            this.widgets["toolbar.logCheckButton"].setEnabled(false);
          }
          else if (e.getData()[0].getLabel().toString() == "Application Development")
          {
            if (this.widgets["toolbar.logCheckButton"].getChecked()) {
              this.logStack.show();
            }

            this.widgets["toolbar.logCheckButton"].setEnabled(true);
            this.mainStack.setSelection([this.mainStack.getChildren()[1]]);

            this.widgets["toolbar.appDevelButton"].addListener("click", function() {
              this.widgets["toolbar.appDevelButton"].setChecked(true);
            }, this);
          }
          else if (e.getData()[0].getLabel().toString() == "Built-in Applications")
          {
            // this.logStack.exclude();
            this.mainStack.setSelection([this.mainStack.getChildren()[2]]);

            this.widgets["toolbar.appBuiltButton"].addListener("click", function() {
              this.widgets["toolbar.appBuiltButton"].setChecked(true);
            }, this);

            if (this.widgets["toolbar.logCheckButton"].getChecked()) {
              this.logStack.show();
            }

            this.widgets["toolbar.logCheckButton"].setEnabled(true);
          }
          else if (e.getData()[0].getLabel().toString() == "Help")
          {
            this.logStack.exclude();
            this.mainStack.setSelection([this.mainStack.getChildren()[3]]);

            this.widgets["toolbar.helpButton"].addListener("click", function() {
              this.widgets["toolbar.helpButton"].setChecked(true);
            }, this);

            this.widgets["toolbar.logCheckButton"].setEnabled(false);
          }
        }
      },

      this);
    },


    /**
     * creates the the log pane of the toolbox
     *
     * @return {var} container of the log pane
     */
    __makeLogPane : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");
      var buttonLayoutContainer = new qx.ui.layout.HBox(null, "right", null);
      buttonLayoutContainer.set;

      var buttonContainer = new qx.ui.container.Composite(buttonLayoutContainer);
      var clearButton = new qx.ui.form.Button("Clear log");

      clearButton.addListener("execute", function() {
        logFrame.setHtml("");
      }, this);

      buttonContainer.setPadding(4, 4, 4, 4);
      buttonContainer.add(clearButton);

      var container = new qx.ui.container.Composite(layout);

      // caption of the log pane
      var caption = new qx.ui.basic.Label(this.tr("Log File")).set(
      {
        font       : "bold",
        rich       : true,
        decorator  : this.widgets["decorator.deco"],
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      var logFrame = new qx.ui.embed.Html("");
      this.widgets["pane.logFrame"] = logFrame;

      logFrame.set(
      {
        backgroundColor : "white",
        overflowY       : "auto",
        overflowX       : "auto",
        padding         : 5
      });

      container.add(logFrame, { flex : 1 });
      container.add(buttonContainer);
      return container;
    },


    /**
     * creates the home pane of the toolbox
     *
     * @return {var} container of the home pane
     */
    __makeHomeContent : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      var caption = new qx.ui.basic.Label(this.tr("Home")).set(
      {
        font       : "bold",
        decorator  : this.widgets["decorator.deco"],
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.home = new toolbox.content.HomeContent;
      container.add(this.home, { flex : 1 });

      return container;
    },  // makeHomecontent


    /**
     * creates the development pane of the toolbox
     *
     * @return {var} container of the development pane
     */
    __makeAppDevelContent : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      var appDevelCaption = new qx.ui.basic.Label(this.tr("No application selected")).set(
      {
        font       : "bold",
        decorator  : this.widgets["decorator.deco"],
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      this.widgets["development.caption"] = appDevelCaption;

      container.add(appDevelCaption);

      this.appDevel = new toolbox.content.DevelopmentContent(this.widgets);

      container.add(this.appDevel, { flex : 1 });

      return container;
    },


    /**
     * creates the built-in pane of the toolbox
     *
     * @return {var} container of the built-in pane
     */
    __makeBuiltInAppContent : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");
	  var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });
      
      
      var containerScroll = new qx.ui.container.Scroll();
	  
      
      var caption = new qx.ui.basic.Label(this.tr("Built-in Applications")).set(
      {
        font       : "bold",
        decorator  : this.widgets["decorator.deco"],
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);
      
      var builtIn = new toolbox.content.BuiltInContent(this.widgets);
      container.add(containerScroll, { flex : 1 });
      containerScroll.add(builtIn);
	  
      return container;
    },  


    /**
     * creates the help pane of the toolbox
     *
     * @return {var} container of the help pane
     */
    __makeHelpContent : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      var caption = new qx.ui.basic.Label(this.tr("Help")).set(
      {
        font       : "bold",
        decorator  : this.widgets["decorator.deco"],
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.help = new toolbox.content.HelpContent;
      container.add(this.help, { flex : 1 });

      return container;
    },  // makeHomecontent

    // -------------------------------------------------------------------------
    /**
     * Creates the application header.
     *
     * @return {var} header of the toolbox
     */
    __createHeader : function()
    {
      var layout = new qx.ui.layout.HBox();
      var header = new qx.ui.container.Composite(layout);
      header.setAppearance("app-header");

      var title = new qx.ui.basic.Label("Toolbox");
      var version = new qx.ui.basic.Label("qooxdoo " + qx.core.Setting.get("qx.version"));

      header.add(title);
      header.add(new qx.ui.core.Spacer, { flex : 1 });
      header.add(version);

      return header;
    }
  },

  destruct : function()
  {
    this._disposeFields("widgets");
    this._disposeObjects("mainsplit", "content", "toolbar");
  }
});