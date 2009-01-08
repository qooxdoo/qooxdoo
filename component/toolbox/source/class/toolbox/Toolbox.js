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
    var home = this.__makeHomeContent();
    var appDevel = this.__makeAppDevelContent();
    
	this.mainStack = new qx.ui.container.Stack;
    this.mainStack.add(home);
    this.mainStack.add(appDevel);
    //this.mainStack.setSelected(this.mainStack.getChildren()[0]);
    
    // Content of the toolbox
    this.__content = this.mainStack;
    this.mainsplit.add(this.__content, 2);
    
    //creates the log pane
    var log = this.__createLog();

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
    this.__assignListener();
    
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

    // ------------------------------------------------------------------------
    //   CONSTRUCTOR HELPERS
    // ------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @return {var} TODOC
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
      this.widgets["toolbar.AppDevelButton"] = this.AppDevelButton;
      this.AppDevelButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Create new application with the toolbox")));

	  // --Application development button (The development part of the toolbox)
      this.AppBuiltButton = new qx.ui.toolbar.Button("Built-in Applications", "toolbox/image/applications-utilities.png");
      part1.add(this.AppBuiltButton);
      this.widgets["toolbar.AppBuiltButton"] = this.AppBuiltButton;
      this.AppBuiltButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Build the optimized version of your application")));

      // --Help button (Support part of the toolbox)
      this.helpButton = new qx.ui.toolbar.Button("Help", "toolbox/image/utilities-help.png");
      part1.add(this.helpButton);
      this.widgets["toolbar.helpButton"] = this.helpButton;
      this.helpButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Contains help and support")));

		
      toolbar.addSpacer();
      
	  var part2 = new qx.ui.toolbar.Part();
      toolbar.add(part2);
      
      // --Log button (shows/hides the log pane)
      this.logCheckButton = new qx.ui.toolbar.CheckBox("Log", "toolbox/image/utilities-log-viewer.png");
      part2.add(this.logCheckButton);
      this.widgets["toolbar.logCheckButton"] = this.logCheckButton;
      this.logCheckButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Show log output")));
      
      
      
      //main function of the toolbox---------------------------------------------------------------------
      
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
     * TODOC
     *
     * @return {void} 
     */
    __assignListener : function()
    {
      this.widgets["toolbar.createButton"].addListener("execute", this.__createApplicationWindow, this);
      this.widgets["toolbar.generateButton"].addListener("execute", this.__generateApplication, this);
      this.widgets["toolbar.generateApiButton"].addListener("execute", this.__generateApi, this);
      this.widgets["toolbar.configurationButton"].addListener("execute", this.__openConfiguration, this);
      this.widgets["toolbar.makePrettyButton"].addListener("execute", this.__makePretty, this);
      this.widgets["toolbar.validateCodeButton"].addListener("execute", this.__validateCode, this);
      this.widgets["toolbar.generateBuildButton"].addListener("execute", this.__generateBuild, this);
      this.widgets["toolbar.testSourceButton"].addListener("execute", this.__testSource, this);
      this.widgets["toolbar.testButton"].addListener("execute", this.__testApplication, this);
    },  // assignListener


    /**
     * TODOC
     *
     * @return {void} 
     */
    __createApplicationWindow : function()
    {
      var gridLayout = new qx.ui.layout.Grid(5, 5);
      gridLayout.setColumnFlex(2, 1);

      gridLayout.setRowFlex(7, 1);
      gridLayout.setRowAlign(8, "right", "middle");

      this.__container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({ allowGrowX : false });

      var box = this.__createApplicationWindow = new qx.ui.window.Window("Create application");
      box.setModal(true);

      this.__createApplicationWindow.setLayout(gridLayout);
      
      // ------Embed Start------------------------------------------------------
      this.__createApplicationLogFrame = new qx.ui.embed.Html().set(
      {
        overflowX  : "auto",
        overflowY  : "auto",
        minWidth   : 100,
        minHeight  : 100,
        paddingTop : 10
      });

      // ------Embed End--------------------------------------------------------
      // ------Buttons Start-----------------------------------------------------
      // Abort Button
      this.__abortButtonWindow = new qx.ui.form.Button("Cancel", "toolbox/image/dialog-close.png");
      this.__abortButtonWindow.addListener("execute", this.__cancelNewApplication, this);

      // Create Button
      this.__createButtonWindow = new qx.ui.form.Button("Create", "toolbox/image/dialog-ok.png");
      this.__createButtonWindow.addListener("execute", this.__createNewApplication, this);
      	
      
      // default value is disabled
      this.__createButtonWindow.setEnabled(false);

      // ------Buttons End-------------------------------------------------------
      this.__container.add(this.__abortButtonWindow);
      this.__container.add(this.__createButtonWindow);

      // ------Image Start-------------------------------------------------------
      this.__loadImage = new qx.ui.basic.Image('toolbox/image/loading22.gif');
      this.__loadImage.hide();

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

      // All components of the create-Dialog to disable while the process
      this.__windowContent = new Array(this.__fileNameText, 
                                       this.__filePathText, 
                                       this.__namespaceText, 
                                       this.__logCheckBox, 
                                       this.__logText, 
                                       this.__selectBox, 
                                       this.__generateBox, 
                                       this.__createButtonWindow, 
                                       this.__abortButtonWindow); 
                                       

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

      box.add(this.__createApplicationLogFrame,
      {
        row     : 7,
        column  : 0,
        rowSpan : 0,
        colSpan : 5
      });

      box.add(this.__loadImage,
      {
        row     : 8,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.__container,
      {
        row     : 8,
        column  : 1,
        rowSpan : 0,
        colSpan : 3
      });

      this.__logCheckBox.addListener("click", this.__showLogTextField, this);
      this.__fileNameText.addListener("input", this.__checkInput, this);
      this.__namespaceText.addListener("input", this.__checkNamespace, this);

      this.__filePathText.addListener("input", this.__checkInput, this);

      // this.__logText.getTextField().addListener("input", this.__checkInput, this);
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

      this.__createApplicationWindow.setWidth(400);
      this.__createApplicationWindow.setHeight(410);
      this.__createApplicationWindow.moveTo(100, 100);
      this.__createApplicationWindow.open();

      this.__fileNameText.focus();
    },  // __createApplicationWindow


    /**
     * TODOC
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
     * TODOC
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
     * TODOC
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
     * TODOC
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
   
   
   __attachHomePane : function() { //TODO
   	this.widgets["toolbar.AppDevelButton"].addListener("execute", function() {
   	   this.logStack.exclude();
   	   this.mainStack.setSelected(this.mainStack.getChildren()[0]);
   	}, this);
   },
   
   __attachAppDevelPane : function() { 
   	this.widgets["toolbar.AppDevelButton"].addListener("execute", function() {
   	   this.logStack.exclude();
   	   this.mainStack.setSelected(this.mainStack.getChildren()[1]);
   	}, this);
   },
    
    
    
    

    // creates a new Application
    /**
     * TODOC
     *
     * @return {void} 
     */
    __createNewApplication : function()
    {
      this.__loadImage.show();
      this.__setCurrentFileName(this.__fileNameText.getValue());
      this.__setCurrentFilePath(this.__filePathText.getValue());
      this.__setCurrentNamespace(this.__namespaceText.getValue());

      // this.__setCurrentLogName(this.__logText.getTextField().getValue());
      this.__setCurrentLogName(this.__logText.getValue());
		
	  if(this.__createButtonWindow.getLabel().toString() == "Close"){	      	
		   this.__cancelNewApplication();
	  } else {
      	toolbox.Builder.createNewApplication(this.__adminPath, 
                                           this.__getCurrentFileName(), 
                                           this.__getCurrentFilePath(), 
                                           this.__getCurrentNamespace(), 
                                           this.__getCurrentLogName(), 
                                           this.__getCurrentType(), 
                                           this.__isGenerateSource.toString(), 
                                           this.__loadImage, 
                                           this.__createApplicationLogFrame, 
                                           this.__windowContent, 
                                           this.__logFrame);
	  }
                                           
      return;
    },


    /**
     * TODOC
     *
     * @return {void} 
     */
    __generateApplication : function()
    {
      toolbox.Builder.generateSource(this.__adminPath, 
                                     this.__getCurrentFileName(), 
                                     this.__getCurrentFilePath(), 
                                     "true", 
                                     this.__createApplicationLogFrame, 
                                     this.__logFrame);
      return;
    },


    /**
     * TODOC
     *
     * @return {void} 
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
     * TODOC
     *
     * @return {void} 
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
     * TODOC
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
     * TODOC
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
     * TODOC
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
     * TODOC
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
     * TODOC
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
     * TODOC
     *
     * @return {void} 
     */
    __cancelNewApplication : function()
    {
      this.__loadImage.hide();
      this.__isEdited = false;
      this.__isGenerateSource = false;
      this.__createApplicationWindow.close();

      return;
    },

    // ------------------------------------------------------------------------
    //   SETTER AND GETTER
    // ------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @param type {var} TODOC
     * @return {void} 
     */
    __setCurrentType : function(type) {
      this.__currentType = type;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __getCurrentType : function() {
      return this.__currentType;
    },


    /**
     * TODOC
     *
     * @param name {var} TODOC
     * @return {void} 
     */
    __setCurrentFileName : function(name) {
      this.__currentFileName = name;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __getCurrentFileName : function() {
      return this.__currentFileName;
    },


    /**
     * TODOC
     *
     * @param path {var} TODOC
     * @return {void} 
     */
    __setCurrentFilePath : function(path) {
      this.__currentFilePath = path;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __getCurrentFilePath : function() {
      return this.__currentFilePath;
    },


    /**
     * TODOC
     *
     * @param nameSpace {var} TODOC
     * @return {void} 
     */
    __setCurrentNamespace : function(nameSpace)
    {
      if (nameSpace != "") this.__nameSpace = nameSpace;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __getCurrentNamespace : function() {
      return this.__nameSpace;
    },


    /**
     * TODOC
     *
     * @param logName {var} TODOC
     * @return {void} 
     */
    __setCurrentLogName : function(logName) {
      this.__logName = logName;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __getCurrentLogName : function() {
      return this.__logName;
    },
    
    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __createLog : function() {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({});

      // caption of the log pane
      var caption = new qx.ui.basic.Label(this.tr("Log")).set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.__logFrame = new qx.ui.embed.Html('');

      this.__logFrame.set(
      {
        backgroundColor : "white",
        overflowY       : "auto",
        overflowX       : "auto",
        padding         : 5
      });

      container.add(this.__logFrame, { flex : 1 });
      return container;
    },
    
    
    
    
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @return {var} TODOC
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

      this.f1 = new qx.ui.embed.Html('Welcome to the qooxdoo Toolbox');
      this.f1.set({ backgroundColor : "white" });
      container.add(this.f1, { flex : 1 });

      return container;
    },  // makeHomecontent
    
    
    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeAppDevelContent : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      var caption = new qx.ui.basic.Label(this.tr("Application Development")).set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.f1 = new qx.ui.embed.Html('Create Application <br>');
      this.f1.set({ backgroundColor : "white" });
      container.add(this.f1, { flex : 1 });

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