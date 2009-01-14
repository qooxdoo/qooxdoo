/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

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
qx.Class.define("toolbox.Toolbox",
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
	
    qx.dev.Debug;

    var layout = new qx.ui.layout.VBox().set({ separator : "separator-vertical" });
    this.setLayout(layout);

    // Dependencies to loggers
    qx.log.appender.Native;
    qx.log.appender.Console;

    // variables-----------------------------------------------------------------
    this.__currentType = "gui";
    this.__currentFileName = "";
    this.__currentFilePath = "";
    this.__nameSpace = "";
    this.__logName = "";
    this.__isEdited = false;
    this.__isGenerateSource = false;

    this.widgets = {};
    this.tests = {};

    // Header // das schwarze
    this.add(this.__createHeader());

    // Toolbar
    this.toolbar = this.__makeToolbar();
    this.add(this.toolbar);

    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.Pane("horizontal");
    this.add(mainsplit, { flex : 1 });
    this.mainsplit = mainsplit;

    //the decorator of the panes
    var deco = new qx.ui.decoration.Background().set({ backgroundColor : "background-medium" });
    this._labelDeco = deco;

    // Adds the log console to the logStack
	  this.mainStack = new qx.ui.container.Stack;
    this.mainStack.add(this.__makeHomeContent());
    this.mainStack.add(this.__makeAppDevelContent());
    this.mainStack.add(this.__makeBuiltInAppContent());
    this.mainStack.add(this.__makeHelpContent());
    this.mainStack.setSelected(this.mainStack.getChildren()[0]);
    
    // Content of the toolbox
    this.__content = this.mainStack;
    this.mainsplit.add(this.__content, 2);
    
    //creates the log pane
    var log = this.__makeLogPane();

	  // Adds the log console to the logStack
	  this.logStack = new qx.ui.container.Stack;
	  this.logStack.setDecorator("main");
  	this.logStack.add(log);
	
  	this.mainsplit.add(this.logStack, 1);
  	this.logStack.exclude();
	
  	// Adds the event listener to the buttons
    this.__attachOpenLogPane();
    this.__attachAppDevelPane();
    this.__attachHomePane();
    this.__attachBuildInAppPane();
    this.__attachHelpPane();
    this.__assignListener();
    
    //loads the applications list
    this.__loadAppList();
    
    
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  statics : { APPLIST : null },
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
      this.homeButton = new qx.ui.toolbar.Button("Home", "toolbox/image/go-home.png");
      part1.add(this.homeButton);
      this.widgets["toolbar.homeButton"] = this.homeButton;
      this.homeButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Welcome page of the toolbox")));
      
      // --Application development button (The development part of the toolbox)
      this.AppDevelButton = new qx.ui.toolbar.Button("Application Development", "toolbox/image/development.png");
      part1.add(this.AppDevelButton);
      this.widgets["toolbar.appDevelButton"] = this.AppDevelButton;
      this.AppDevelButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Create new application with the toolbox")));

	    // --Application development button (The development part of the toolbox)
      this.AppBuiltButton = new qx.ui.toolbar.Button("Built-in Applications", "toolbox/image/applications-utilities.png");
      part1.add(this.AppBuiltButton);
      this.widgets["toolbar.AppBuiltButton"] = this.AppBuiltButton;
      this.AppBuiltButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Build the optimized version of the application")));

      // --Help button (Support part of the toolbox)
      this.helpButton = new qx.ui.toolbar.Button("Help", "toolbox/image/utilities-help.png");
      part1.add(this.helpButton);
      this.widgets["toolbar.helpButton"] = this.helpButton;
      this.helpButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Contains help and support")));

      // --Created applications menu
      this.__createdAppsMenuButton = new qx.ui.toolbar.MenuButton("Created Applications", "toolbox/image/folder-open.png");
      part1.add(this.__createdAppsMenuButton);
      this.widgets["toolbar.createdAppsMenuButton"] = this.__createdAppsMenuButton;
      this.__createdAppsMenuButton.setEnabled(false);

      toolbar.addSpacer();
      
	    var part2 = new qx.ui.toolbar.Part();
      toolbar.add(part2);
      
      // --Log button (shows/hides the log pane)
      this.logCheckButton = new qx.ui.toolbar.CheckBox("Log", "toolbox/image/utilities-log-viewer.png");
      part2.add(this.logCheckButton);
      this.widgets["toolbar.logCheckButton"] = this.logCheckButton;
      this.logCheckButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Show log output")));
      this.logCheckButton.setEnabled(false);
      
      
      
      //main functions of the toolbox-------------------------------------------
	    var part3 = new qx.ui.toolbar.Part();
      toolbar.add(part3);

      // -- create button
      this.createButton = new qx.ui.toolbar.Button(null, "toolbox/image/development.png");
      part3.add(this.createButton);
      this.widgets["toolbar.createButton"] = this.createButton;
      this.createButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Creates a new application")));

      // -- generate button
      this.generateButton = new qx.ui.toolbar.Button(null, "toolbox/image/system-run.png");
      part3.add(this.generateButton);
      this.widgets["toolbar.generateButton"] = this.generateButton;
      this.generateButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the source of the created application")));

      // -- generate build button
      this.generateBuildButton = new qx.ui.toolbar.Button(null, "toolbox/image/executable.png");
      part3.add(this.generateBuildButton);
      this.widgets["toolbar.generateBuildButton"] = this.generateBuildButton;
      this.generateBuildButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the build")));

      // -- generate Api
      this.generateApiButton = new qx.ui.toolbar.Button(null, "toolbox/image/help-contents.png");
      part3.add(this.generateApiButton);
      this.widgets["toolbar.generateApiButton"] = this.generateApiButton;
      this.generateApiButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the API of the application")));

      // -- make pretty
      this.makePrettyButton = new qx.ui.toolbar.Button(null, "toolbox/image/format-indent-more.png");
      part3.add(this.makePrettyButton);
      this.widgets["toolbar.makePrettyButton"] = this.makePrettyButton;
      this.makePrettyButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("makes the source pretty")));

      // -- validate code
      this.validateCodeButton = new qx.ui.toolbar.Button(null, "toolbox/image/edit-find.png");
      part3.add(this.validateCodeButton);
      this.widgets["toolbar.validateCodeButton"] = this.validateCodeButton;
      this.validateCodeButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Validates the source")));

      // -- test
      this.testButton = new qx.ui.toolbar.Button(null, "toolbox/image/dialog-apply.png");
      part3.add(this.testButton);
      this.widgets["toolbar.testButton"] = this.testButton;
      this.testButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Tests the application")));

      // -- test source
      this.testSourceButton = new qx.ui.toolbar.Button(null, "toolbox/image/check-spelling.png");
      part3.add(this.testSourceButton);
      this.widgets["toolbar.testSourceButton"] = this.testSourceButton;
      this.testSourceButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Tests the source")));

      this.configurationButton = new qx.ui.toolbar.Button(null, "toolbox/image/preferences.png");
      part3.add(this.configurationButton);
      this.widgets["toolbar.configurationButton"] = this.configurationButton;
      this.configurationButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Configuration of the application")));

      return toolbar;
    },  // makeToolbar
 

    
    /**
     * adds the event listener to the toolbox buttons
     *
     * @return {void} 
     */
    __assignListener : function()
    {
      this.widgets["toolbar.createButton"].addListener("execute", this.__createApplicationWindow, this);
      this.widgets["toolbar.generateButton"].addListener("execute", this.__generateSource, this);
      this.widgets["toolbar.generateApiButton"].addListener("execute", this.__generateApi, this);
      this.widgets["toolbar.configurationButton"].addListener("execute", this.__openConfiguration, this);
      this.widgets["toolbar.makePrettyButton"].addListener("execute", this.__makePretty, this);
      this.widgets["toolbar.validateCodeButton"].addListener("execute", this.__validateCode, this);
      this.widgets["toolbar.generateBuildButton"].addListener("execute", this.__generateBuild, this);
      this.widgets["toolbar.testSourceButton"].addListener("execute", this.__testSource, this);
      this.widgets["toolbar.testButton"].addListener("execute", this.__testApplication, this);
      this.widgets["toolbar.createdAppsMenuButton"].addListener("changeEnabled", this.__setAppListMenu, this);
    },  // assignListener

    /**
     * loads the created application list
     *
     * @return {void} 
     */
    __loadAppList : function() {
    	toolbox.Builder.prepareApplicationList(this.__adminPath,  
 				                                     this.__logFrame,
 				                                     this.__createdAppsMenuButton);
    },

    __setAppListMenu : function() {
    	this.__createdAppsMenuButton.setMenu(this.__getCreatedAppsMenu());
    },
    
    /**
     * returns the menu of the created applications
     *
     * @return {void} the menu of the created applications
     */
    __getCreatedAppsMenu : function() 
      {
      	var menu = new qx.ui.menu.Menu;
        var createdApp;
          for(var i = 0; i < toolbox.Toolbox.APPLIST.length; i++) {
            createdApp = new qx.ui.menu.Button("<b>" + toolbox.Toolbox.APPLIST[i].name + "</b> <br>" + toolbox.Toolbox.APPLIST[i].path);
  	        createdApp.getChildControl("label").setRich(true);	
  	        createdApp.addListener("execute", this.__onApplicationChanged, this);
            menu.add(createdApp);
          }
        return menu;
      },
    
      __onApplicationChanged : function(e){
      	var label = e.getTarget().getLabel().toString();
      	label = label.split(" ");
      	var appName = label[0].replace("<b>", "").replace("</b>", "");
      	this.__setCurrentFileName(appName);
      	var appPath = label[1].replace("<br>", "");
      	this.__setCurrentFilePath(appPath);
      	
        this.AppDevelCaption.setContent("Application Development of " +  label[0].replace("<b>", "").replace("</b>", ""));
      },
      
      
      
    /**
     * shows the create application dialog
     *
     * @return {void} 
     */
    __createApplicationWindow : function()
    {
      var gridLayout = new qx.ui.layout.Grid(5, 5);
      gridLayout.setColumnFlex(2, 1);
      gridLayout.setRowAlign(8, "right", "middle");

      this.__container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({ allowGrowX : false });

      var box = this.__createApplicationWindow = new qx.ui.window.Window("Create application");
      this.__createApplicationWindow.setShowMinimize(false);
      this.__createApplicationWindow.setShowMaximize(false);
      this.__createApplicationWindow.setShowClose(false);
      box.setModal(true);
      
      this.__createApplicationWindow.setLayout(gridLayout);
      
      // ------Buttons Start-----------------------------------------------------
      // Abort Button
      this.__abortButtonWindow = new qx.ui.form.Button("Cancel", "toolbox/image/dialog-close.png");
      this.__abortButtonWindow.addListener("execute", this.__cancelNewApplication, this);

      // Create Button
      this.__createButtonWindow = new qx.ui.form.Button("Create", "toolbox/image/dialog-ok.png");
      this.__createButtonWindow.addListener("execute", this.__createSkeleton, this);
      	
      
      // default value is disabled
      this.__createButtonWindow.setEnabled(false);

      // ------Buttons End-------------------------------------------------------
      this.__container.add(this.__createButtonWindow);
      this.__container.add(this.__abortButtonWindow);
      
      // ------Image End---------------------------------------------------------
      // ------Labels Start------------------------------------------------------
      this.__fileNameLabel = new qx.ui.basic.Label("").set(
      {
        rich    : true,
        content : 'Application name:<font color="red">*</font> '
      });

      this.__filePathLabel = new qx.ui.basic.Label("").set(
      {
        rich    : true,
        content : 'Output directory:<font color="red">*</font> '
      });

      this.__namespaceLabel = new qx.ui.basic.Label("Namespace: ");
      this.__logFileLabel = new qx.ui.basic.Label("Logfile: ");
      this.__typeLabel = new qx.ui.basic.Label("Type: ");
      this.__generateLabel = new qx.ui.basic.Label("Generate Source: ");

      // ------Labels End--------------------------------------------------------
      // ------Textfield Start---------------------------------------------------
      this.__fileNameText = new qx.ui.form.TextField("").set({ maxLength : 30 });

      this.__filePathText = new qx.ui.form.TextField("C:\\tmp\\");

      this.__namespaceText = new qx.ui.form.TextField("");

      this.__logText = new qx.ui.form.TextField("");

      // ------Textfield End-----------------------------------------------------
      // ------Checkbox Start----------------------------------------------------
      this.__logCheckBox = new qx.ui.form.CheckBox(null);
      this.__generateBox = new qx.ui.form.CheckBox(null);

      // ------Checkbox End------------------------------------------------------
      // ------Selectbox Start---------------------------------------------------
      types = [ "GUI (default)", "Bom", "Migration", "With-contrib" ];
      values = [ "gui", "bom", "migration", "with-contrib" ];

      this.__selectBox = new qx.ui.form.SelectBox();

      for (var i=0; i<types.length; i++)
      {
        var tempItem = new qx.ui.form.ListItem(types[i], "toolbox/image/engineering.png");
        tempItem.setValue(values[i]);
        this.__selectBox.add(tempItem);

        // select first item
        if (i == 0) {
          this.__selectBox.setSelected(tempItem);
        }
      }

      this.__selectBox.addListener("changeValue", function() {
        this.__setCurrentType(this.__selectBox.getValue());
      }, this);

      // ------Selectbox End---------------------------------------------------
      this.__createApplicationWindow.addListener("close", function() {
        this.__isGenerateSource = false;
      }, this);

      // Default hide log textfield
      this.__logText.hide();                            

      box.add(this.__fileNameLabel,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.__fileNameText,
      {
        row     : 1,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      box.add(this.__filePathLabel,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.__filePathText,
      {
        row     : 2,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      box.add(this.__namespaceLabel,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.__namespaceText,
      {
        row     : 3,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      box.add(this.__logFileLabel,
      {
        row     : 4,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.__logCheckBox,
      {
        row     : 4,
        column  : 1,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.__logText,
      {
        // box.add(this.__form, {
        row     : 4,
        column  : 2,
        rowSpan : 0,
        colSpan : 3
      });

      box.add(this.__typeLabel,
      {
        row     : 5,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.__selectBox,
      {
        row     : 5,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      box.add(this.__generateLabel,
      {
        row     : 6,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.__generateBox,
      {
        row     : 6,
        column  : 1,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(new qx.ui.core.Spacer(50,10),
      {
        row     : 7,
        column  : 1,
        rowSpan : 0,
        colSpan : 1
      });

      
      box.add(this.__container,
      {
        row     : 8,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      this.__logCheckBox.addListener("click", this.__showLogTextField, this);
      this.__fileNameText.addListener("input", this.__checkInput, this);
      this.__namespaceText.addListener("input", this.__checkNamespace, this);

      this.__filePathText.addListener("input", this.__checkInput, this);

      this.__logText.addListener("input", this.__checkInput, this);
      this.__logCheckBox.addListener("click", this.__checkInput, this);
      this.__fileNameText.addListener("input", this.__copyContent, this);

      this.__generateBox.addListener("click", function()
      {
        if (this.__generateBox.getChecked()) {
          this.__isGenerateSource = true;
        } else {
          this.__isGenerateSource = false;
        }
      },
      this);

      //this.__createApplicationWindow.setWidth(300);
      this.__createApplicationWindow.setMinHeight(270);
      this.__createApplicationWindow.setMaxHeight(270);
      this.__createApplicationWindow.moveTo(100, 100);
      this.__createApplicationWindow.open();

      this.__fileNameText.focus();
    },  // __createApplicationWindow

    /**
     * shows the log field
     *
     * @return {void} 
     */
    __showLogTextField : function()
    {
      if (this.__logCheckBox.getChecked())
      {
        this.__logText.show();
        this.__logCheckBox.setLabel("*");
        this.__logCheckBox.setTextColor("red");
      }
      else
      {
        this.__logText.hide();

        // this.__logText.getTextField().setValue("");
        this.__logText.setValue("");
        this.__logCheckBox.setLabel("");
      }
    },


    /**
     * checks the input fields for invalid inputs
     *
     * @return {void} 
     */
    __checkInput : function()
    {
      if (this.__fileNameText.getValue().length > 0 & this.__filePathText.getValue().length > 0 & !this.__logCheckBox.getChecked()) {
        this.__createButtonWindow.setEnabled(true);
      }
      else if (this.__fileNameText.getValue().length > 0 & this.__filePathText.getValue().length > 0 & this.__logCheckBox.getChecked() & this.__logText.getValue().length > 0)
      {  // this.__logText.getTextField().getValue().length > 0){
        this.__createButtonWindow.setEnabled(true);
      }
      else
      {
        this.__createButtonWindow.setEnabled(false);
      }

      for (var i=0; i<this.__fileNameText.getValue().length; i++)
      {
        if (this.__fileNameText.getValue()[i] == "Unidentified" || this.__fileNameText.getValue()[i] == "?" || this.__fileNameText.getValue()[i] == "\"" || this.__fileNameText.getValue()[i] == "/" || this.__fileNameText.getValue()[i] == ":" || this.__fileNameText.getValue()[i] == "*" || this.__fileNameText.getValue()[i] == "<" || this.__fileNameText.getValue()[i] == ">" || this.__fileNameText.getValue()[i] == "|" || this.__fileNameText.getValue()[i] == "\\")
        {
          alert("Invalid input: " + this.__fileNameText.getValue()[i]);

          var output = this.__fileNameText.getValue();
          output = output.replace(this.__fileNameText.getValue()[i], "");
          this.__fileNameText.setValue(output);
        }
      }
    },


    /**
     * checks the namespace for invalid character
     *
     * @return {void} 
     */
    __checkNamespace : function()
    {
      for (var i=0; i<this.__namespaceText.getValue().length; i++)
      {
        if (this.__namespaceText.getValue()[i] == "Unidentified" || this.__namespaceText.getValue()[i] == "?" || this.__namespaceText.getValue()[i] == "\"" || this.__namespaceText.getValue()[i] == "/" || this.__namespaceText.getValue()[i] == ":" || this.__namespaceText.getValue()[i] == "*" || this.__namespaceText.getValue()[i] == "<" || this.__namespaceText.getValue()[i] == ">" || this.__namespaceText.getValue()[i] == "|" || this.__namespaceText.getValue()[i] == "\\")
        {
          alert("Invalid input: " + this.__namespaceText.getValue()[i]);

          var output = this.__namespaceText.getValue();
          output = output.replace(this.__namespaceText.getValue()[i], "");
          this.__namespaceText.setValue(output);
        }
      }

      this.__isEdited = true;
    },


    /**
     * copies the content of the file name into the namespace field
     *
     * @return {void} 
     */
    __copyContent : function()
    {
      if (this.__isEdited == false) this.__namespaceText.setValue(this.__fileNameText.getValue());
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
     this)
   },

   /**
     * attaches the home pane to the toolbox
     *
     * @return {void} 
     */
   __attachHomePane : function() 
   { 
   	this.widgets["toolbar.homeButton"].addListener("execute", function() {
   	   this.logCheckButton.setEnabled(false);
   	   this.logStack.exclude();
   	   this.mainStack.setSelected(this.mainStack.getChildren()[0]);
   	}, this);
   },
   
   /**
     * attaches the development pane to the toolbox
     *
     * @return {void} 
     */
   __attachAppDevelPane : function() 
   { 
   	this.widgets["toolbar.appDevelButton"].addListener("execute", function() {
   	   if(this.logCheckButton.getChecked()) {
   	   	  this.logStack.show();
   	   }
   	   this.logCheckButton.setEnabled(true);
   	   this.mainStack.setSelected(this.mainStack.getChildren()[1]);
   	}, this);
   },
   
   /**
     * attaches the built-in pane to the toolbox
     *
     * @return {void} 
     */
   __attachBuildInAppPane : function() 
   {
   	this.widgets["toolbar.AppBuiltButton"].addListener("execute", function() {
   	   this.logCheckButton.setEnabled(false);
   	   this.logStack.exclude();
   	   this.mainStack.setSelected(this.mainStack.getChildren()[2]);
   	}, this);
   },
   
   /**
     * attaches the help pane to the toolbox
     *
     * @return {void} 
     */
   __attachHelpPane : function() 
   {
   	this.widgets["toolbar.helpButton"].addListener("execute", function() {
   	   this.logCheckButton.setEnabled(false);
   	   this.logStack.exclude();
   	   this.mainStack.setSelected(this.mainStack.getChildren()[3]);
   	}, this);
   },
    
    /**
     * creates a new application by sending the necessary information to the server
     *
     * @return 
     */
    __createSkeleton : function()
    {
      this.__setCurrentFileName(this.__fileNameText.getValue());
      this.__setCurrentFilePath(this.__filePathText.getValue());
      this.__setCurrentNamespace(this.__namespaceText.getValue());

      // this.__setCurrentLogName(this.__logText.getTextField().getValue());
      this.__setCurrentLogName(this.__logText.getValue());
      	toolbox.Builder.createNewApplication(this.__adminPath, 
                                             this.__getCurrentFileName(), 
                                             this.__getCurrentFilePath(), 
                                             this.__getCurrentNamespace(), 
                                             this.__getCurrentLogName(), 
                                             this.__getCurrentType(), 
                                             this.__isGenerateSource.toString(), 
                                             this.__logFrame,
                                             this.__createdAppsMenuButton);
       
       this.__createdAppsMenuButton.setEnabled(false);                                      
	     this.AppDevelCaption.setContent("Application Development of " +  this.__getCurrentFileName());
       this.__cancelNewApplication();                                   
      return;
    },


    /**
     * generates the source version of the  application by sending the necessary 
     * information to the server
     *
     * @return 
     */
    __generateSource : function()
    { 
      toolbox.Builder.generateSource(this.__adminPath, 
                                     this.__getCurrentFileName(), 
                                     this.__getCurrentFilePath(), 
                                     "true", 
                                     this.__logFrame);
      return;
    },


    /**
     * generates the build version of the  application by sending the necessary 
     * information to the server
     *
     * @return  
     */
    __generateBuild : function()
    {
      toolbox.Builder.generateBuild(this.__adminPath, 
                                    this.__getCurrentFileName(), 
                                    this.__getCurrentFilePath(), 
                                    this.__logFrame);
      return;
    },


    /**
     * generates the API of the created application by sending the necessary 
     * information to the server
     *
     * @return  
     */
    __generateApi : function()
    {
      toolbox.Builder.generateApi(this.__adminPath, 
                                  this.__getCurrentFileName(), 
                                  this.__getCurrentFilePath(), 
                                  this.__logFrame);
      return;
    },


    /**
     * prettifies the source code of the  application by sending the necessary 
     * information to the server
     *
     * @return {void} 
     */
    __makePretty : function()
    {
      toolbox.Builder.makePretty(this.__adminPath, 
       							 this.__getCurrentFileName(), 
       							 this.__getCurrentFilePath(), 
       							 this.__logFrame);
      return;
    },


    /**
     * opens the configurations dialog
     *
     * @return {void} 
     */
    __openConfiguration : function()
    {
      this.__configuration = new toolbox.Configuration(this.__adminPath, 
      												   this.__getCurrentFileName(), 
      												   this.__getCurrentFilePath(), 
      												   this.__logFrame);
      return;
    },


    /**
     * validates the source code of the  application by sending the necessary 
     * information to the server
     *
     * @return {void} 
     */
    __validateCode : function()
    {
      toolbox.Builder.validateCode(this.__adminPath, 
      							   this.__getCurrentFileName(), 
      							   this.__getCurrentFilePath(), 
      							   this.__logFrame);
      return;
    },



    /**
     * starts the test runner 
     *
     * @return {void} 
     */
    __testSource : function()
    {
      toolbox.Builder.testSource(this.__adminPath, 
                                 this.__getCurrentFileName(), 
                                 this.__getCurrentFilePath(), 
                                 this.__logFrame);

      return;
    },


    /**
     * starts the test runner
     *
     * @return {void} 
     */
    __testApplication : function() {
      toolbox.Builder.testApplication(this.__adminPath, 
      								  this.__getCurrentFileName(), 
      								  this.__getCurrentFilePath(), 
      								  this.__logFrame);
    },


    /**
     * cancels the create application dialog
     *
     * @return 
     */
    __cancelNewApplication : function()
    {
      this.__isEdited = false;
      this.__isGenerateSource = false;
      this.__createApplicationWindow.close();

      return;
    },

    // ------------------------------------------------------------------------
    //   SETTER AND GETTER
    // ------------------------------------------------------------------------
    /**
     * sets the current application type
     *
     * @param type {var} type of the application
     * @return {void} 
     */
    __setCurrentType : function(type) {
      this.__currentType = type;
    },


    /**
     * returns the type of the application
     *
     * @return {var} the type of the application
     */
    __getCurrentType : function() {
      return this.__currentType;
    },


    /**
     * sets the file name
     *
     * @param name {var} file name of the application
     * @return {void} 
     */
    __setCurrentFileName : function(name) {
      this.__currentFileName = name;
    },


    /**
     * returns the file name of the application
     *
     * @return {var} the filename of the current application
     */
    __getCurrentFileName : function() {
      return this.__currentFileName;
    },


    /**
     * sets the application path
     *
     * @param path {var} path of the application
     * @return {void} 
     */
    __setCurrentFilePath : function(path) {
      path = path.replace(/\//g, '\\');
      this.__currentFilePath = path;
    },


    /**
     * returns the current application path
     *
     * @return {var} the file path of the application
     */
    __getCurrentFilePath : function() {
      return this.__currentFilePath;
    },


    /**
     * set the namespace of the application
     *
     * @param nameSpace {var} namespace of the application
     * @return {void} 
     */
    __setCurrentNamespace : function(nameSpace)
    {
      if (nameSpace != "") this.__nameSpace = nameSpace;
    },


    /**
     * returns the namespace of the application
     *
     * @return {var} namespace of the application
     */
    __getCurrentNamespace : function() {
      return this.__nameSpace;
    },


    /**
     * sets the log name of the application
     *
     * @param logName {var} name of the log file
     * @return {void} 
     */
    __setCurrentLogName : function(logName) {
      this.__logName = logName;
    },


    /**
     * returns the log name of the application
     *
     * @return {var} log name of the application
     */
    __getCurrentLogName : function() {
      return this.__logName;
    },
    
    /**
     * creates the the log pane of the toolbox
     *
     * @return {var} container of the log pane
     */
    __makeLogPane : function() {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");
      var buttonLayoutContainer = new qx.ui.layout.HBox(null, "right", null);
      buttonLayoutContainer.set

      
      var buttonContainer = new qx.ui.container.Composite(buttonLayoutContainer);
      var clearButton = new qx.ui.form.Button("Clear log");
      clearButton.addListener("execute", function(){
        this.__logFrame.setHtml("");
      }, this);
      
      buttonContainer.setPadding(4, 4, 4, 4);
      buttonContainer.add(clearButton);
      
      var container = new qx.ui.container.Composite(layout);

      // caption of the log pane
      var caption = new qx.ui.basic.Label(this.tr("Log")).set(
      {
        font       : "bold",
        rich       : true,
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      
      container.add(caption);

      this.__logFrame = new qx.ui.embed.Html("");

      this.__logFrame.set(
      {
        backgroundColor : "white",
        overflowY       : "auto",
        overflowX       : "auto",
        padding         : 5
      });

      container.add(this.__logFrame, { flex : 1 });
      container.add(buttonContainer);
      return container;
    },
    
    
    
    
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
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
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.homeHtmlEmbed = new qx.ui.embed.Html('Welcome to the qooxdoo Toolbox');
      this.homeHtmlEmbed.set({ backgroundColor : "white" });
      container.add(this.homeHtmlEmbed, { flex : 1 });

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

      this.AppDevelCaption = new qx.ui.basic.Label(this.tr("Application Development")).set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(this.AppDevelCaption);

      this.AppDevelHtmlEmbed = new qx.ui.embed.Html('Create Application <br>');
      this.AppDevelHtmlEmbed.set({ backgroundColor : "white" });
      container.add(this.AppDevelHtmlEmbed, { flex : 1 });

      return container;
    },  // makeHomecontent
    
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

      var caption = new qx.ui.basic.Label(this.tr("Built-in Applications")).set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.BuiltInAppHtmlEmbed = new qx.ui.embed.Html('Builds etc. <br>');
      this.BuiltInAppHtmlEmbed.set({ backgroundColor : "white" });
      container.add(this.BuiltInAppHtmlEmbed, { flex : 1 });

      return container;
    },  // makeHomecontent
    
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
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.helpHtmlEmbed = new qx.ui.embed.Html('Help, Demobrowser etc. <br>');
      this.helpHtmlEmbed.set({ backgroundColor : "white" });
      container.add(this.helpHtmlEmbed, { flex : 1 });

      return container;
    },  // makeHomecontent
    


    // -------------------------------------------------------------------------
    /**
     * Creates the application header.
     *
     * @return {var} TODOC
     */
    __createHeader : function()
    {
      var layout = new qx.ui.layout.HBox();
      var header = new qx.ui.container.Composite(layout);
      header.setAppearance("app-header");

      var title = new qx.ui.basic.Label("qooxdoo: toolbox");  // muss schoener werden
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
    this._disposeObjects("mainsplit", "content", "runbutton", "generateButton", "closeButton", "toolbar", "f1", "f2", "f3");
  }
});