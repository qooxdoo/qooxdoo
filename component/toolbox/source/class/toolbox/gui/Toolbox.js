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
    this.mainStack.setSelected(this.mainStack.getChildren()[0]);

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
    this.__assignListener();
    this. __attachContent();
    

    // loads the applications list
    this.__loadAppList();

    // disables all functions
    this.__setEnableAllFunctions(false);
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

      //Radiobutton Manager
      var manager = new qx.ui.form.RadioGroup(homeButton, appDevelButton, appBuiltButton, helpButton);
      this.widgets["radioButton.manager"] = manager;
      
      // --Created applications menu
      var selectAppMenuButton = new qx.ui.toolbar.MenuButton("Select Application", "toolbox/image/folder-open.png");
      part1.add(selectAppMenuButton);
      this.widgets["toolbar.selectAppMenuButton"] = selectAppMenuButton;
      selectAppMenuButton.setEnabled(false);

      // --Delete button (deletes the selected application)
      var removeButton = new qx.ui.toolbar.Button("Remove Application", "toolbox/image/edit-delete.png");
      part1.add(removeButton);
      this.widgets["toolbar.removeButton"] = removeButton;
      removeButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Removes the selected application")));
      removeButton.setEnabled(false);

      toolbar.addSpacer();

      var part2 = new qx.ui.toolbar.Part();
      toolbar.add(part2);

      // --Log button (shows/hides the log pane)
      var logCheckButton = new qx.ui.toolbar.CheckBox("Log", "toolbox/image/utilities-log-viewer.png");
      part2.add(logCheckButton);
      this.widgets["toolbar.logCheckButton"] = logCheckButton;
      logCheckButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Show log output")));
      logCheckButton.setEnabled(false);

      // main functions of the toolbox-------------------------------------------
      var part3 = new qx.ui.toolbar.Part();
      toolbar.add(part3);

      // -- create button
      var createSkeletonButton = new qx.ui.toolbar.Button(null, "toolbox/image/development.png");
      part3.add(createSkeletonButton);
      this.widgets["toolbar.createSkeletonButton"] = createSkeletonButton;
      createSkeletonButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Creates a new application")));

      // -- generate button
      var generateButton = new qx.ui.toolbar.Button(null, "toolbox/image/system-run.png");
      part3.add(generateButton);
      this.widgets["toolbar.generateButton"] = generateButton;
      generateButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the source of the created application")));

      // -- generate build button
      var generateBuildButton = new qx.ui.toolbar.Button(null, "toolbox/image/executable.png");
      part3.add(generateBuildButton);
      this.widgets["toolbar.generateBuildButton"] = generateBuildButton;
      generateBuildButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the build")));

      // -- generate Api
      var generateApiButton = new qx.ui.toolbar.Button(null, "toolbox/image/help-contents.png");
      part3.add(generateApiButton);
      this.widgets["toolbar.generateApiButton"] = generateApiButton;
      generateApiButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the API of the application")));

      // -- make pretty
      var makePrettyButton = new qx.ui.toolbar.Button(null, "toolbox/image/format-indent-more.png");
      part3.add(makePrettyButton);
      this.widgets["toolbar.makePrettyButton"] = makePrettyButton;
      makePrettyButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("makes the source pretty")));

      // -- validate code
      var validateCodeButton = new qx.ui.toolbar.Button(null, "toolbox/image/edit-find.png");
      part3.add(validateCodeButton);
      this.widgets["toolbar.validateCodeButton"] = validateCodeButton;
      validateCodeButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Validates the source")));

      // -- test
      var testButton = new qx.ui.toolbar.Button(null, "toolbox/image/dialog-apply.png");
      part3.add(testButton);
      this.widgets["toolbar.testButton"] = testButton;
      testButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Starts the Testrunner for testing the build version")));

      // -- test source
      var testSourceButton = new qx.ui.toolbar.Button(null, "toolbox/image/check-spelling.png");
      part3.add(testSourceButton);
      this.widgets["toolbar.testSourceButton"] = testSourceButton;
      testSourceButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Starts the Testrunner for testing the source version")));

      var configurationButton = new qx.ui.toolbar.Button(null, "toolbox/image/preferences.png");
      part3.add(configurationButton);
      this.widgets["toolbar.configurationButton"] = configurationButton;
      configurationButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Configuration of the application")));

      return toolbar;
    },  // makeToolbar


    /**
     * adds the event listener to the toolbox buttons
     *
     * @return {void} 
     */
    __assignListener : function()
    {
      this.widgets["toolbar.createSkeletonButton"].addListener("execute", this.__createApplicationDialog, this);
      this.widgets["toolbar.generateButton"].addListener("execute", this.__generateSource, this);
      this.widgets["toolbar.generateApiButton"].addListener("execute", this.__generateApi, this);
      this.widgets["toolbar.configurationButton"].addListener("execute", this.__openConfiguration, this);
      this.widgets["toolbar.makePrettyButton"].addListener("execute", this.__makePretty, this);
      this.widgets["toolbar.validateCodeButton"].addListener("execute", this.__validateCode, this);
      this.widgets["toolbar.generateBuildButton"].addListener("execute", this.__generateBuild, this);
      this.widgets["toolbar.testSourceButton"].addListener("execute", this.__testSource, this);
      this.widgets["toolbar.testButton"].addListener("execute", this.__testApplication, this);
      this.widgets["toolbar.selectAppMenuButton"].addListener("changeEnabled", this.__setAppListMenu, this);
      this.widgets["toolbar.removeButton"].addListener("execute", this.__removeDialog, this);
      this.widgets["toolbar.homeButton"].addListener("click", function() { this.widgets["toolbar.homeButton"].setChecked(true);}, this);
    },  // assignListener


    /**
     * enables/disables all functions
     *
     * @param value {var} the boolean value
     * @return {void} 
     */
    __setEnableAllFunctions : function(value)
    {
      this.widgets["toolbar.generateButton"].setEnabled(value);
      this.widgets["toolbar.generateBuildButton"].setEnabled(value);
      this.widgets["toolbar.generateApiButton"].setEnabled(value);
      this.widgets["toolbar.configurationButton"].setEnabled(value);
      this.widgets["toolbar.makePrettyButton"].setEnabled(value);
      this.widgets["toolbar.validateCodeButton"].setEnabled(value);
      this.widgets["toolbar.testSourceButton"].setEnabled(value);
      this.widgets["toolbar.testButton"].setEnabled(value);
      this.widgets["toolbar.removeButton"].setEnabled(value);
    },


    /**
     * loads the created application list
     *
     * @return {void} 
     */
    __loadAppList : function() {
      toolbox.builder.Builder.prepareApplicationList(this.__adminPath, 
                                                     this.widgets["pane.logFrame"], 
                                                     this.widgets["toolbar.selectAppMenuButton"]);
    },


    /**
     * sets the application list menu
     *
     * @return {void} 
     */
    __setAppListMenu : function() {
      this.widgets["toolbar.selectAppMenuButton"].setMenu(this.__getCreatedAppsMenu());
    },


    /**
     * returns the menu of the created applications
     *
     * @return {var} the menu of the created applications
     */
    __getCreatedAppsMenu : function()
    {
      var menu = new qx.ui.menu.Menu;
      var createdApp;
      
	  //Creates dynamically all application according the application list
      for (var i=0; i<toolbox.gui.Toolbox.APPLIST.length; i++)
      {
        createdApp = new qx.ui.menu.Button("<b>" + toolbox.gui.Toolbox.APPLIST[i].name + "</b> <br>" + toolbox.gui.Toolbox.APPLIST[i].path);
        createdApp.getChildControl("label").setRich(true);
        createdApp.addListener("execute", this.__onApplicationChanged, this);
        menu.add(createdApp);
      }

      return menu;
    },


    /**
     * sets some changes, if a application was selected from the list
     *
     * @param e {Event} TODOC
     * @return {void} 
     */
    __onApplicationChanged : function(e)
    {
      var label = e.getTarget().getLabel().toString();
      label = label.split(" ");
      var appName = label[0].replace("<b>", "").replace("</b>", "");
      this.__setCurrentFileName(appName);
      var appPath = label[1].replace("<br>", "");
      this.__setCurrentFilePath(appPath);
	  
      this.appDevelCaption.setContent(appName);
      this.__setEnableAllFunctions(true);
    },


    /**
     * shows the create application dialog
     *
     * @return {void} 
     */
    __createApplicationDialog : function()
    {	
      var gridLayout = new qx.ui.layout.Grid(5, 5);
      gridLayout.setColumnFlex(2, 1);
      gridLayout.setRowAlign(8, "right", "middle");

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({ allowGrowX : false });

      var box = this.__createApplicationWindow = new qx.ui.window.Window("Create Application");
      this.__createApplicationWindow.setShowMinimize(false);
      this.__createApplicationWindow.setShowMaximize(false);
      this.__createApplicationWindow.setShowClose(false);
      box.setModal(true);

      this.__createApplicationWindow.setLayout(gridLayout);

      // ------Buttons Start-----------------------------------------------------
      // Abort Button
      var abortButton = new qx.ui.form.Button("Cancel", "toolbox/image/dialog-close.png");
      this.widgets["createDialog.abortButton"] = abortButton;
      abortButton.addListener("execute", this.__cancelNewApplication, this);

      // Create Button
      var createButton = new qx.ui.form.Button("Create", "toolbox/image/dialog-ok.png");
      this.widgets["createDialog.createButton"] = createButton;
      this.widgets["createDialog.createButton"].addListener("execute", this.__createSkeleton, this);

      // default value is disabled
      createButton.setEnabled(false);

      // ------Buttons End-------------------------------------------------------
      
      //Adding of the buttons to the container
      container.add(createButton);
      container.add(abortButton);

      // ------Labels Start------------------------------------------------------
      // All labels of the Create Application dialog were defined in this code section
      var fileNameLabel = new qx.ui.basic.Label("").set(
      {
        rich    : true,
        content : 'Application name:<font color="red">*</font> '
      });
	  
      var filePathLabel = new qx.ui.basic.Label("").set(
      {
        rich    : true,
        content : 'Output directory:<font color="red">*</font> '
      });

      var namespaceLabel = new qx.ui.basic.Label("Namespace: ");
      var logFileLabel = new qx.ui.basic.Label("Logfile: ");
      var typeLabel = new qx.ui.basic.Label("Type: ");
      var generateLabel = new qx.ui.basic.Label("Generate Source: ");
      // ------Labels End-------------------------------------------------------
      
      // ------Textfield Start--------------------------------------------------
      var fileNameText = new qx.ui.form.TextField("").set({ maxLength : 30 });
      this.widgets["createDialog.fileNameText"] = fileNameText;
      
      var filePathText = new qx.ui.form.TextField("C:\\tmp\\"); //Initial path
      this.widgets["createDialog.filePathText"] = filePathText;
      
      var namespaceText = new qx.ui.form.TextField("");
      this.widgets["createDialog.namespaceText"] = namespaceText;
      
      var logText = new qx.ui.form.TextField("");
      this.widgets["createDialog.logText"] = logText;
      // ------Textfield End----------------------------------------------------
      
      // ------Checkbox Start---------------------------------------------------
      var logCheckBox = new qx.ui.form.CheckBox(null);
      this.widgets["createDialog.logCheckBox"] = logCheckBox;
      
      var generateBox = new qx.ui.form.CheckBox(null);
      this.widgets["createDialog.generateBox"] = generateBox;
      // ------Checkbox End-----------------------------------------------------
      
      // ------Selectbox Start--------------------------------------------------
      var types = [ "GUI (default)", "Bom", "Migration" ];
      var values = [ "gui", "bom", "migration" ];

      var selectBox = new qx.ui.form.SelectBox();

      for (var i=0; i<types.length; i++)
      {
        var tempItem = new qx.ui.form.ListItem(types[i], "toolbox/image/engineering.png");
        tempItem.setValue(values[i]);
        selectBox.add(tempItem);

        // select first item
        if (i == 0) {
          selectBox.setSelected(tempItem);
        }
      }

      selectBox.addListener("changeValue", function() {
        this.__setCurrentType(selectBox.getValue());
      }, this);

      // ------Selectbox End----------------------------------------------------
      
      // resets the generate variable
      this.__createApplicationWindow.addListener("close", function() {
        this.__isGenerateSource = false;
      }, this);

      // default hide log textfield
      this.widgets["createDialog.logText"].hide();

      box.add(fileNameLabel,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.widgets["createDialog.fileNameText"],
      {
        row     : 1,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      box.add(filePathLabel,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.widgets["createDialog.filePathText"],
      {
        row     : 2,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      box.add(namespaceLabel,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.widgets["createDialog.namespaceText"],
      {
        row     : 3,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      box.add(logFileLabel,
      {
        row     : 4,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.widgets["createDialog.logCheckBox"],
      {
        row     : 4,
        column  : 1,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.widgets["createDialog.logText"],
      {
        row     : 4,
        column  : 2,
        rowSpan : 0,
        colSpan : 3
      });

      box.add(typeLabel,
      {
        row     : 5,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(selectBox,
      {
        row     : 5,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      box.add(generateLabel,
      {
        row     : 6,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.widgets["createDialog.generateBox"],
      {
        row     : 6,
        column  : 1,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(new qx.ui.core.Spacer(50, 10),
      {
        row     : 7,
        column  : 1,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(container,
      {
        row     : 8,
        column  : 1,
        rowSpan : 0,
        colSpan : 4
      });

      this.widgets["createDialog.logCheckBox"].addListener("click", this.__showLogTextField, this);
      this.widgets["createDialog.fileNameText"].addListener("input", this.__checkInput, this);
      this.widgets["createDialog.namespaceText"].addListener("input", this.__checkNamespace, this);
      this.widgets["createDialog.filePathText"].addListener("input", this.__checkInput, this);
      this.widgets["createDialog.logText"].addListener("input", this.__checkInput, this);
      this.widgets["createDialog.logCheckBox"].addListener("click", this.__checkInput, this);
      this.widgets["createDialog.fileNameText"].addListener("input", this.__copyContent, this);
      this.widgets["createDialog.generateBox"].addListener("click", function()
      {
        if (this.widgets["createDialog.generateBox"].getChecked()) {
          this.__isGenerateSource = true;
        } else {
          this.__isGenerateSource = false;
        }
      },
      this);
	  
      //Initial size for the Create Application dialog
      this.__createApplicationWindow.setMinHeight(270);
      this.__createApplicationWindow.setMaxHeight(270);
      this.__createApplicationWindow.moveTo(100, 100);
      this.__createApplicationWindow.open();

      this.widgets["createDialog.fileNameText"].focus();
    },  // __createApplicationWindow


    /**
     * shows the Remove Application dialog
     *
     * @return {void} 
     */
    __removeDialog : function()
    {
      var removeDialog = new qx.ui.window.Window("Remove Application", null);
      var label = new qx.ui.basic.Label("Do you really want to remove <b>\"" + this.__getCurrentFileName() + "\"</b>");
      label.setRich(true);
      removeDialog.setLayout(new qx.ui.layout.VBox(5));
      removeDialog.add(label);

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "right"));

      var yesButton = new qx.ui.form.Button("Yes");
      var noButton = new qx.ui.form.Button("No");
      
	  //aborts the remove process
      noButton.addListener("execute", function() {
        removeDialog.close();
      }, this);

      //removes the current application
      yesButton.addListener("execute", function()
      {
        removeDialog.close();
        this.__removeApplication();
        this.__setEnableAllFunctions(false);
      },
      this);

      container.add(yesButton);
      container.add(noButton);

      removeDialog.add(container);

      removeDialog.setShowMaximize(false);
      removeDialog.setShowClose(false);
      removeDialog.setShowMinimize(false);
      removeDialog.setModal(true);
      removeDialog.open();
      //Move this dialog to the center
      removeDialog.moveTo(parseInt(this.getLayout().getSizeHint().width / 2), 
                          parseInt(this.getLayout().getSizeHint().height / 2));
    },


    /**
     * shows the log textfield
     *
     * @return {void} 
     */
    __showLogTextField : function()
    {
      //if checked then show the log textfield
      if (this.widgets["createDialog.logCheckBox"].getChecked())
      {
        this.widgets["createDialog.logText"].show();
        this.widgets["createDialog.logCheckBox"].setLabel("*");
        this.widgets["createDialog.logCheckBox"].setTextColor("red");
      }
      else
      {
      	//else resets the variables and hide log textfield 
        this.widgets["createDialog.logText"].hide();
        this.widgets["createDialog.logText"].setValue("");
        this.widgets["createDialog.logCheckBox"].setLabel("");
      }
    },


    /**
     * checks the input fields for invalid inputs
     *
     * @return {void} 
     */
    __checkInput : function()
    {
      if (this.widgets["createDialog.fileNameText"].getValue().length > 0 
        & this.widgets["createDialog.filePathText"].getValue().length > 0 
        & !this.widgets["createDialog.logCheckBox"].getChecked()) {
        this.widgets["createDialog.createButton"].setEnabled(true);
      } else if (this.widgets["createDialog.fileNameText"].getValue().length > 0 
               & this.widgets["createDialog.filePathText"].getValue().length > 0 
               & this.widgets["createDialog.logCheckBox"].getChecked() 
               & this.widgets["createDialog.logText"].getValue().length > 0) {
        this.widgets["createDialog.createButton"].setEnabled(true);
      } else {
        this.widgets["createDialog.createButton"].setEnabled(false);
      }

      for (var i=0; i<this.widgets["createDialog.fileNameText"].getValue().length; i++)
      {
        if (this.widgets["createDialog.fileNameText"].getValue()[i] == "Unidentified" 
         || this.widgets["createDialog.fileNameText"].getValue()[i] == "?" 
         || this.widgets["createDialog.fileNameText"].getValue()[i] == "\"" 
         || this.widgets["createDialog.fileNameText"].getValue()[i] == "/" 
         || this.widgets["createDialog.fileNameText"].getValue()[i] == ":" 
         || this.widgets["createDialog.fileNameText"].getValue()[i] == "*" 
         || this.widgets["createDialog.fileNameText"].getValue()[i] == "<" 
         || this.widgets["createDialog.fileNameText"].getValue()[i] == ">" 
         || this.widgets["createDialog.fileNameText"].getValue()[i] == "|" 
         || this.widgets["createDialog.fileNameText"].getValue()[i] == "\\")
        {
          alert("Invalid input: " + this.widgets["createDialog.fileNameText"].getValue()[i]);

          var output = this.widgets["createDialog.fileNameText"].getValue();
          output = output.replace(this.widgets["createDialog.fileNameText"].getValue()[i], "");
          this.widgets["createDialog.fileNameText"].setValue(output);
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
      for (var i=0; i<this.widgets["createDialog.namespaceText"].getValue().length; i++)
      {
        if (this.widgets["createDialog.namespaceText"].getValue()[i] == "Unidentified" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "?" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "\"" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "/" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == ":" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "*" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "<" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == ">" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "|"
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "-" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "\\")
        {
          alert("Invalid input: " + this.widgets["createDialog.namespaceText"].getValue()[i]);

          var output = this.widgets["createDialog.namespaceText"].getValue();
          output = output.replace(this.widgets["createDialog.namespaceText"].getValue()[i], "");
          this.widgets["createDialog.namespaceText"].setValue(output);
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
      if (this.__isEdited == false) { this.widgets["createDialog.namespaceText"].setValue(this.widgets["createDialog.fileNameText"].getValue().replace(/-/g, "")); }
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
    __attachContent : function() {
    	this.widgets["radioButton.manager"].addListener("changeSelected", function(e) {
    		if(e.getData() != null) {
    		    if(e.getData().getLabel().toString() == "Home") {
    			  this.logStack.exclude();
            this.mainStack.setSelected(this.mainStack.getChildren()[0]);      
            this.widgets["toolbar.homeButton"].addListener("click", function()
			      {
			      	this.widgets["toolbar.homeButton"].setChecked(true);
			      },
			      this);
			      this.widgets["toolbar.logCheckButton"].setEnabled(false);  
    		    } else if (e.getData().getLabel().toString() == "Application Development") {
	    			  if (this.widgets["toolbar.logCheckButton"].getChecked()) {
			          this.logStack.show();
			        }
			        this.widgets["toolbar.logCheckButton"].setEnabled(true);
	        		this.mainStack.setSelected(this.mainStack.getChildren()[1]);
	        		this.widgets["toolbar.appDevelButton"].addListener("click", function()
			        {
			      		this.widgets["toolbar.appDevelButton"].setChecked(true);
			        },
			        this);
	    		} else if (e.getData().getLabel().toString() == "Built-in Applications") {
	    			this.logStack.exclude();
	        		this.mainStack.setSelected(this.mainStack.getChildren()[2]);
	        		this.widgets["toolbar.appBuiltButton"].addListener("click", function()
			        {
			      		this.widgets["toolbar.appBuiltButton"].setChecked(true);
			        },
			        this);
			        this.widgets["toolbar.logCheckButton"].setEnabled(false);
	    		} else if (e.getData().getLabel().toString() == "Help"){
	    			this.logStack.exclude();
	        		this.mainStack.setSelected(this.mainStack.getChildren()[3]);
	        		this.widgets["toolbar.helpButton"].addListener("click", function()
			        {
			      		this.widgets["toolbar.helpButton"].setChecked(true);
			        },
			        this);
			        this.widgets["toolbar.logCheckButton"].setEnabled(false);
	    		}  
    	    } 
    		/*
    		
    	   */
    	}, this);
    },



    /**
     * creates a new application by sending the necessary information to the server
     *
     * @return {void} 
     */
    __createSkeleton : function()
    {
      this.__setCurrentFileName(this.widgets["createDialog.fileNameText"].getValue());
      this.__setCurrentFilePath(this.widgets["createDialog.filePathText"].getValue());
      this.__setCurrentNamespace(this.widgets["createDialog.namespaceText"].getValue());

      this.__setCurrentLogName(this.widgets["createDialog.logText"].getValue());
      toolbox.builder.Builder.createNewApplication(this.__adminPath, 
		                                           this.__getCurrentFileName(), 
		                                           this.__getCurrentFilePath(), 
		                                           this.__getCurrentNamespace(), 
		                                           this.__getCurrentLogName(), 
		                                           this.__getCurrentType(),
		                                           this.__isGenerateSource.toString(), 
		                                           this.widgets["pane.logFrame"], 
		                                           this.widgets["toolbar.selectAppMenuButton"]);

      this.widgets["toolbar.selectAppMenuButton"].setEnabled(false);
      this.appDevelCaption.setContent(this.__getCurrentFileName());
      this.__cancelNewApplication();
      this.__setEnableAllFunctions(true);
      return;
    },


    /**
     * removes the current selected application
     *
     * @return {void} 
     */
    __removeApplication : function()
    {
      this.widgets["toolbar.selectAppMenuButton"].setEnabled(false);
      toolbox.builder.Builder.removeCurrentApplication(this.__adminPath, 
		                                               this.__getCurrentFileName(), 
		                                               this.__getCurrentFilePath(), 
		                                               this.widgets["pane.logFrame"], 
		                                               this.widgets["toolbar.selectAppMenuButton"]);
      this.appDevelCaption.setContent("");
    },


    /**
     * generates the source version of the  application by sending the necessary 
     * information to the server
     *
     * @return {void} 
     */
    __generateSource : function()
    {
      toolbox.builder.Builder.generateSource(this.__adminPath, 
		                                     this.__getCurrentFileName(), 
		                                     this.__getCurrentFilePath(), 
		                                     this.widgets["pane.logFrame"]);
      return;
    },


    /**
     * generates the build version of the  application by sending the necessary 
     * information to the server
     *
     * @return {void} 
     */
    __generateBuild : function()
    {
      toolbox.builder.Builder.generateBuild(this.__adminPath, 
                                    this.__getCurrentFileName(), 
                                    this.__getCurrentFilePath(), 
                                    this.widgets["pane.logFrame"]);
      return;
    },


    /**
     * generates the API of the created application by sending the necessary 
     * information to the server
     *
     * @return {void} 
     */
    __generateApi : function()
    {
      toolbox.builder.Builder.generateApi(this.__adminPath, 
                                  this.__getCurrentFileName(), 
                                  this.__getCurrentFilePath(), 
                                  this.widgets["pane.logFrame"]);
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
      toolbox.builder.Builder.makePretty(this.__adminPath, 
                                 this.__getCurrentFileName(), 
                                 this.__getCurrentFilePath(), 
                                 this.widgets["pane.logFrame"]);
      return;
    },


    /**
     * opens the configurations dialog
     *
     * @return {void} 
     */
    __openConfiguration : function()
    {
      // An Configuration object have to exist because the Jsonanalyzer needs the coordinates of this dialog 
      this.__configuration = new toolbox.configuration.Configuration(this.__adminPath, 
			                                                         this.__getCurrentFileName(), 
									                                 this.__getCurrentFilePath(),
									                                 this.widgets["pane.logFrame"]);
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
      toolbox.builder.Builder.validateCode(this.__adminPath, 
                                   this.__getCurrentFileName(), 
                                   this.__getCurrentFilePath(), 
                                   this.widgets["pane.logFrame"]);
      return;
    },


    /**
     * starts the test runner
     *
     * @return {void} 
     */
    __testSource : function()
    {
      toolbox.builder.Builder.testSource(this.__adminPath, 
                                 this.__getCurrentFileName(), 
                                 this.__getCurrentFilePath(), 
                                 this.widgets["pane.logFrame"]);

      return;
    },


    /**
     * starts the test runner
     *
     * @return {void} 
     */
    __testApplication : function() {
      toolbox.builder.Builder.testApplication(this.__adminPath, 
                                      this.__getCurrentFileName(), 
                                      this.__getCurrentFilePath(), 
                                      this.widgets["pane.logFrame"]);
    },


    /**
     * cancels the create application dialog
     *
     * @return {void} 
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
    __setCurrentFilePath : function(path)
    {
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
      if (nameSpace != "") { this.__nameSpace = nameSpace; }
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
      var caption = new qx.ui.basic.Label(this.tr("Log")).set(
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

      this.appDevelCaption = new qx.ui.basic.Label(this.tr("")).set(
      {
        font       : "bold",
        decorator  : this.widgets["decorator.deco"],
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(this.appDevelCaption);

      this.appDevel = new toolbox.content.DevelopmentContent(this.widgets,
      														 this.widgets["toolbar.selectAppMenuButton"],
      														 this.widgets["toolbar.removeButton"],
      														 this.appDevelCaption);
      container.add(this.appDevel, { flex : 1 });

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
        decorator  : this.widgets["decorator.deco"],
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.builtInApp = new toolbox.content.BuiltInContent;
	 
      this.builtInApp.set({ backgroundColor : "white" });
      container.add(this.builtInApp, { flex : 1 });

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
     * @return {var} TODOC
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
    this._disposeObjects("mainsplit", "content", "runbutton", "generateButton", "closeButton", "toolbar", "f1", "f2", "f3");
  }
});