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
 * This class contains the whole content of the Development pane
 */
qx.Class.define("toolbox.content.DevelopmentContent",
{
  extend : qx.ui.container.Composite,

  construct : function(widgets)
  {
    this.base(arguments);

    this.__adminHost = "127.0.0.1";
    this.__adminPort = "8000";
    this.__adminPath = "/component/toolbox/tool/bin/nph-qxadmin_cgi.py";

    // widget container
    this.develWidgets = {};

    // variables
    this.__isEdited = false;
    this.__currentType = "gui";
    this.__currentFileName = "";
    this.__currentFilePath = "";
    this.__nameSpace = "";
    this.__logName = "";
    this.__isGenerateSource = false;

    // Widgets
    this.appDevelCaption = widgets["development.caption"];
    this.myLogFrame = widgets["pane.logFrame"];

    var layout = new qx.ui.layout.Grid();
    layout.setColumnFlex(0, 1);
    layout.setRowFlex(0, 1);
    this.setLayout(layout);
    this.setBackgroundColor("white");

    // -- create button
    var createSkeletonButton = new qx.ui.form.Button(null, "toolbox/image/48/development.png");
    this.develWidgets["development.createSkeletonButton"] = createSkeletonButton;
    createSkeletonButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Creates a new application")));

    // -- generate source button
    var removeButton = new qx.ui.form.Button(null, "toolbox/image/48/edit-delete.png");
    this.develWidgets["development.removeButton"] = removeButton;
    removeButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Removes the selected application")));
    removeButton.setEnabled(false);

    // --Created applications menu
    var selectAppMenuButton = new qx.ui.form.MenuButton(null, "toolbox/image/48/folder-open.png");
    this.develWidgets["development.selectAppMenuButton"] = selectAppMenuButton;
    selectAppMenuButton.setEnabled(false);

    // -- generate source button
    var generateSourceButton = new qx.ui.form.Button(null, "toolbox/image/48/system-run.png");
    this.develWidgets["development.generateSourceButton"] = generateSourceButton;
    generateSourceButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the source version of the current application")));

    // -- generate build button
    var generateBuildButton = new qx.ui.form.Button("Generate Build", "toolbox/image/executable.png");
    this.develWidgets["development.generateBuildButton"] = generateBuildButton;
    generateBuildButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the build version of the current application")));

    // -- make pretty
    var makePrettyButton = new qx.ui.form.Button("Prettify Source", "toolbox/image/format-indent-more.png");
    this.develWidgets["development.makePrettyButton"] = makePrettyButton;
    makePrettyButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Prettifies the source code")));

    // -- validate code
    var validateCodeButton = new qx.ui.form.Button("Validate Source", "toolbox/image/edit-find.png");
    this.develWidgets["development.validateCodeButton"] = validateCodeButton;
    validateCodeButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Validates the source Code")));

    // -- generate Api
    var generateApiButton = new qx.ui.form.Button("Generate API", "toolbox/image/help-contents.png");
    this.develWidgets["development.generateApiButton"] = generateApiButton;
    generateApiButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the API of current the application")));

    // -- test source
    var testSourceButton = new qx.ui.form.Button("Test Source", "toolbox/image/check-spelling.png");
    this.develWidgets["development.testSourceButton"] = testSourceButton;
    testSourceButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Starts the Testrunner for testing the source version")));

    // -- test build
    var testBuildButton = new qx.ui.form.Button("Test Build", "toolbox/image/dialog-apply.png");
    this.develWidgets["development.testBuildButton"] = testBuildButton;
    testBuildButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Starts the Testrunner for testing the build version")));

    var configurationButton = new qx.ui.form.Button("Configuration", "toolbox/image/preferences.png");
    this.develWidgets["development.configurationButton"] = configurationButton;
    configurationButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Configuration of the application")));

    // disables all function (initial)
    this.__setEnableAllFunctions(false);

    // Listener, signs all listener to the correspondig functions
    this.develWidgets["development.createSkeletonButton"].addListener("execute", this.__createApplicationDialog, this);
    this.develWidgets["development.removeButton"].addListener("execute", this.__removeDialog, this);
    this.develWidgets["development.generateSourceButton"].addListener("execute", this.__generateSource, this);
    this.develWidgets["development.generateBuildButton"].addListener("execute", this.__generateBuild, this);
    this.develWidgets["development.makePrettyButton"].addListener("execute", this.__makePretty, this);
    this.develWidgets["development.validateCodeButton"].addListener("execute", this.__validateCode, this);
    this.develWidgets["development.generateApiButton"].addListener("execute", this.__generateApi, this);
    this.develWidgets["development.testSourceButton"].addListener("execute", this.__testSource, this);
    this.develWidgets["development.testBuildButton"].addListener("execute", this.__testBuild, this);
    this.develWidgets["development.configurationButton"].addListener("execute", this.__openConfiguration, this);
    this.develWidgets["development.selectAppMenuButton"].addListener("changeEnabled", this.__setAppListMenu, this);

    //The Tabview
    this.add(this.getTabView(),
    {
      row     : 0,
      column  : 0,
      rowSpan : 0,
      colSpan : 0
    });

    this.__loadAppList();
  },

  //Applicationlist
  statics : { APPLIST : null },
  
  members :
  {
    /**
     * sets the application list menu
     *
     * @return {void} 
     */
    __setAppListMenu : function() {
      this.develWidgets["development.selectAppMenuButton"].setMenu(this.__getCreatedAppsMenu());
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

      // Creates dynamically all application according the application list
      for (var i=0; i<toolbox.content.DevelopmentContent.APPLIST.length; i++)
      {
        createdApp = new qx.ui.menu.Button("<b>" + toolbox.content.DevelopmentContent.APPLIST[i].name + "</b> <br>" + toolbox.content.DevelopmentContent.APPLIST[i].path);
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
      this.setCurrentFileName(appName);
      var appPath = label[1].replace("<br>", "");
      this.setCurrentFilePath(appPath);

      this.appDevelCaption.setContent("Current application: " + appName);
      this.__setEnableAllFunctions(true);
    },


    /**
     * retunrs the Tabview
     *
     * @return {var} tabView contains all panes
     */
    getTabView : function()
    {
      tabView = new qx.ui.tabview.TabView();
      tabView.setBarPosition("left");

      // Adding
      tabView.add(this.getApplicationPane());
      tabView.add(this.getGenerationPane());
      tabView.add(this.getTestApiPane());
      tabView.add(this.getConfigurationPane());
      tabView.add(this.getInspectorPane());

      return tabView;
    },


    /**
     * contains the functions to create/delete or select applications
     *
     * @return {var} applicationPage 
     */
    getApplicationPane : function()
    {
      var applicationPage = new qx.ui.tabview.Page("<b>Application</b>", "toolbox/image/64/development.png");
      applicationPage.getChildControl("button").getChildControl("label").setRich(true);
      applicationPage.getChildControl("button").setIconPosition("top");

      //gruopbox 1 contains the "New Application" button
      var box1 = new qx.ui.groupbox.GroupBox();
      box1.setLayout(new qx.ui.layout.Grid(5, 5));
      
      //gruopbox 2 contains the "Switch Application" button
      var box2 = new qx.ui.groupbox.GroupBox();
      box2.setLayout(new qx.ui.layout.Grid(5, 5));
      
      //gruopbox 3 contains the "Remove Application" button
      var box3 = new qx.ui.groupbox.GroupBox();
      box3.setLayout(new qx.ui.layout.Grid(5, 5));
      
      
      applicationPage.setLayout(new qx.ui.layout.Grid(5, 5));

      applicationPage.add(box1,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      applicationPage.add(box2,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });
      
      applicationPage.add(box3,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });
      
      box1.add(this.develWidgets["development.createSkeletonButton"],
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(new qx.ui.basic.Label('<font size="+2">New Application</font> <br>' + 
                                     'Creates a new qooxdoo-skeleton.<br>' + 
                                     'This step is necessary if you want develop a new application.').set({ rich : true }),
      {
        row     : 0,
        column  : 1,
        rowSpan : 0,
        colSpan : 0
      });

      box2.add(this.develWidgets["development.selectAppMenuButton"],
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box2.add(new qx.ui.basic.Label('<font size="+2">Switch Application</font> <br>' + 
                                     'All created application will be list here. <br/>' + 
                                     'You can switch already created applications. ').set({ rich : true }),
      {
        row     : 1,
        column  : 1,
        rowSpan : 0,
        colSpan : 0
      });

      box3.add(this.develWidgets["development.removeButton"],
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box3.add(new qx.ui.basic.Label('<font size="+2">Remove Application</font> <br>' + 
                                     'Removes the current application <br/>' + 
                                     '<b>ATTENTION:</b> This step is irrevocable.').set({ rich : true }),
      {
        row     : 2,
        column  : 1,
        rowSpan : 0,
        colSpan : 0
      });

      return applicationPage;
    },


    /**
     * contains the functions to generate the source or build version
     *
     * @return {var} generationPage
     */
    getGenerationPane : function()
    {
      var generationPage = new qx.ui.tabview.Page("<b>Generation</b>", "toolbox/image/64/system-run.png");
      generationPage.getChildControl("button").getChildControl("label").setRich(true);
      generationPage.getChildControl("button").setIconPosition("top");

      
      // layout
      var layout = new qx.ui.layout.Grid(5, 5);
      var layout2 = new qx.ui.layout.Grid(5, 5);

      var box = new qx.ui.groupbox.GroupBox();
      box.setLayout(layout2);
      generationPage.setLayout(layout);

      generationPage.add(box,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box.add(this.develWidgets["development.generateSourceButton"],
      {
        row     : 0,
        column  : 0,
        rowSpan : 1,
        colSpan : 0
      });

      box.add(new qx.ui.basic.Label('<font size="+2">Generate Source</font> <br>' + 'Generates the source version of the current application.<br>' + 
      							                'Herewith you can run the application.').set({ rich : true }),
      {
        row     : 0,
        column  : 1,
        rowSpan : 0,
        colSpan : 0
      });

      box.add(new qx.ui.form.Button("Open"),
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });
      
      box.add(new qx.ui.basic.Label('Opens the application').set({ rich : true }),
      {
        row     : 1,
        column  : 1,
        rowSpan : 0,
        colSpan : 0
      });
      
      

      return generationPage;
    },


    /**
     * contains the functions to generate the Api-reference or Testrunner 
     *
     * @return {var} testApiPage
     */
    getTestApiPane : function()
    {
      var testApiPage = new qx.ui.tabview.Page("<b>Test/API</b>", "toolbox/image/64/utilities-help.png");
      testApiPage.getChildControl("button").getChildControl("label").setRich(true);
      testApiPage.getChildControl("button").setIconPosition("top");

      return testApiPage;
    },


    /**
     * contains the function to change the configuration file of the current application 
     *
     * @return {var} configurationPage
     */
    getConfigurationPane : function()
    {
      var configurationPage = new qx.ui.tabview.Page("<b>Configuration</b>", "toolbox/image/64/preferences.png");
      configurationPage.getChildControl("button").getChildControl("label").setRich(true);
      configurationPage.getChildControl("button").setIconPosition("top");

      return configurationPage;
    },

    /**
     * contains the debugging tool (inspector) 
     *
     * @return {var} inspectorPage
     */
    getInspectorPane : function()
    {
      var inspectorPage = new qx.ui.tabview.Page("<b>Debugging</b>", "toolbox/image/64/system-search.png");
      inspectorPage.getChildControl("button").getChildControl("label").setRich(true);
      inspectorPage.getChildControl("button").setIconPosition("top");

      return inspectorPage;
    },

    /**
     * loads the created application list
     *
     * @return {void} 
     */
    __loadAppList : function() {
      toolbox.builder.Builder.prepareApplicationList(this.__adminPath, this.myLogFrame, this.develWidgets["development.selectAppMenuButton"]);
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
      this.develWidgets["createDialog.abortButton"] = abortButton;
      abortButton.addListener("execute", this.__cancelNewApplication, this);

      // Create Button
      var createButton = new qx.ui.form.Button("Create", "toolbox/image/dialog-ok.png");
      this.develWidgets["createDialog.createButton"] = createButton;
      this.develWidgets["createDialog.createButton"].addListener("execute", this.__createSkeleton, this);

      // default value is disabled
      createButton.setEnabled(false);

      // ------Buttons End-------------------------------------------------------
      // Adding of the buttons to the container
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
      this.develWidgets["createDialog.fileNameText"] = fileNameText;

      var filePathText = new qx.ui.form.TextField("C:\\tmp\\");  // Initial path
      this.develWidgets["createDialog.filePathText"] = filePathText;

      var namespaceText = new qx.ui.form.TextField("");
      this.develWidgets["createDialog.namespaceText"] = namespaceText;

      var logText = new qx.ui.form.TextField("");
      this.develWidgets["createDialog.logText"] = logText;

      // ------Textfield End----------------------------------------------------
      // ------Checkbox Start---------------------------------------------------
      var logCheckBox = new qx.ui.form.CheckBox(null);
      this.develWidgets["createDialog.logCheckBox"] = logCheckBox;

      var generateBox = new qx.ui.form.CheckBox(null);
      this.develWidgets["createDialog.generateBox"] = generateBox;

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
        this.setCurrentType(selectBox.getValue());
      }, this);

      // ------Selectbox End----------------------------------------------------
      // resets the generate variable
      this.__createApplicationWindow.addListener("close", function() {
        this.__isGenerateSource = false;
      }, this);

      // default hide log textfield
      this.develWidgets["createDialog.logText"].hide();

      box.add(fileNameLabel,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.develWidgets["createDialog.fileNameText"],
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

      box.add(this.develWidgets["createDialog.filePathText"],
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

      box.add(this.develWidgets["createDialog.namespaceText"],
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

      box.add(this.develWidgets["createDialog.logCheckBox"],
      {
        row     : 4,
        column  : 1,
        rowSpan : 0,
        colSpan : 1
      });

      box.add(this.develWidgets["createDialog.logText"],
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

      box.add(this.develWidgets["createDialog.generateBox"],
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

      this.develWidgets["createDialog.logCheckBox"].addListener("click", this.__showLogTextField, this);
      this.develWidgets["createDialog.fileNameText"].addListener("input", this.__checkInput, this);
      this.develWidgets["createDialog.namespaceText"].addListener("input", this.__checkNamespace, this);
      this.develWidgets["createDialog.filePathText"].addListener("input", this.__checkInput, this);
      this.develWidgets["createDialog.logText"].addListener("input", this.__checkInput, this);
      this.develWidgets["createDialog.logCheckBox"].addListener("click", this.__checkInput, this);
      this.develWidgets["createDialog.fileNameText"].addListener("input", this.__copyContent, this);

      this.develWidgets["createDialog.generateBox"].addListener("click", function()
      {
        if (this.develWidgets["createDialog.generateBox"].getChecked()) {
          this.__isGenerateSource = true;
        } else {
          this.__isGenerateSource = false;
        }
      },
      this);

      // Initial size for the Create Application dialog
      this.__createApplicationWindow.setMinHeight(270);
      this.__createApplicationWindow.setMaxHeight(270);
      this.__createApplicationWindow.moveTo(100, 100);
      this.__createApplicationWindow.open();

      this.develWidgets["createDialog.fileNameText"].focus();
    },


    /**
     * creates a new application by sending the necessary information to the server
     *
     * @return {void} 
     */
    __createSkeleton : function()
    {
      this.setCurrentFileName(this.develWidgets["createDialog.fileNameText"].getValue());
      this.setCurrentFilePath(this.develWidgets["createDialog.filePathText"].getValue());
      this.setCurrentNamespace(this.develWidgets["createDialog.namespaceText"].getValue());

      this.setCurrentLogName(this.develWidgets["createDialog.logText"].getValue());
      toolbox.builder.Builder.createNewApplication(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.getCurrentNamespace(), this.getCurrentLogName(), this.getCurrentType(), this.__isGenerateSource.toString(), this.myLogFrame, this.develWidgets["development.selectAppMenuButton"]);

      this.develWidgets["development.selectAppMenuButton"].setEnabled(false);
      this.appDevelCaption.setContent("Current application: " + this.getCurrentFileName());
      this.__cancelNewApplication();
      this.__setEnableAllFunctions(true);
      return;
    },


    /**
     * shows the Remove Application dialog
     *
     * @return {void} 
     */
    __removeDialog : function()
    {
      var removeDialog = new qx.ui.window.Window("Remove Application", null);
      var label = new qx.ui.basic.Label("Do you really want to remove <b>\"" + this.getCurrentFileName() + "\"</b>");
      label.setRich(true);
      removeDialog.setLayout(new qx.ui.layout.VBox(5));
      removeDialog.add(label);

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "right"));

      var yesButton = new qx.ui.form.Button("Yes");
      var noButton = new qx.ui.form.Button("No");

      // aborts the remove process
      noButton.addListener("execute", function() {
        removeDialog.close();
      }, this);

      // removes the current application
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

      // Move this dialog to the center
      removeDialog.moveTo(parseInt(this.getLayout().getSizeHint().width / 2), parseInt(this.getLayout().getSizeHint().height / 2));
    },


    /**
     * removes the current selected application
     *
     * @return {void} 
     */
    __removeApplication : function()
    {
      this.develWidgets["development.selectAppMenuButton"].setEnabled(false);
      toolbox.builder.Builder.removeCurrentApplication(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.myLogFrame, this.develWidgets["development.selectAppMenuButton"]);
      this.appDevelCaption.setContent("No Application selected");
    },


    /**
     * generates the source version of the  application by sending the necessary 
     * information to the server
     *
     * @return {void} 
     */
    __generateSource : function()
    {
      toolbox.builder.Builder.generateSource(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.myLogFrame);
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
      toolbox.builder.Builder.generateBuild(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.myLogFrame);
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
      toolbox.builder.Builder.makePretty(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.myLogFrame);
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
      toolbox.builder.Builder.validateCode(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.myLogFrame);
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
      toolbox.builder.Builder.generateApi(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.myLogFrame);
      return;
    },


    /**
     * starts the test runner
     *
     * @return {void} 
     */
    __testSource : function()
    {
      toolbox.builder.Builder.testSource(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.myLogFrame);

      return;
    },


    /**
     * starts the test runner
     *
     * @return {void} 
     */
    __testBuild : function() {
      toolbox.builder.Builder.testApplication(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.myLogFrame);
    },


    /**
     * opens the configurations dialog
     *
     * @return {void} 
     */
    __openConfiguration : function()
    {
      // An Configuration object have to exist because the Jsonanalyzer needs the coordinates of this dialog
      this.__configuration = new toolbox.configuration.Configuration(this.__adminPath, this.getCurrentFileName(), this.getCurrentFilePath(), this.myLogFrame, this.develWidgets["development.configurationButton"]);
      return;
    },


    /**
     * enables/disables all functions
     *
     * @param value {var} the boolean value
     * @return {void} 
     */
    __setEnableAllFunctions : function(value)
    {
      this.develWidgets["development.generateSourceButton"].setEnabled(value);
      this.develWidgets["development.generateBuildButton"].setEnabled(value);
      this.develWidgets["development.removeButton"].setEnabled(value);
      this.develWidgets["development.makePrettyButton"].setEnabled(value);
      this.develWidgets["development.validateCodeButton"].setEnabled(value);
      this.develWidgets["development.generateApiButton"].setEnabled(value);
      this.develWidgets["development.testBuildButton"].setEnabled(value);
      this.develWidgets["development.testSourceButton"].setEnabled(value);
      this.develWidgets["development.configurationButton"].setEnabled(value);
    },


    /**
     * shows the log textfield
     *
     * @return {void} 
     */
    __showLogTextField : function()
    {
      // if checked then show the log textfield
      if (this.develWidgets["createDialog.logCheckBox"].getChecked())
      {
        this.develWidgets["createDialog.logText"].show();
        this.develWidgets["createDialog.logCheckBox"].setLabel("*");
        this.develWidgets["createDialog.logCheckBox"].setTextColor("red");
      }
      else
      {
        // else resets the variables and hide log textfield
        this.develWidgets["createDialog.logText"].hide();
        this.develWidgets["createDialog.logText"].setValue("");
        this.develWidgets["createDialog.logCheckBox"].setLabel("");
      }
    },


    /**
     * checks the input fields for invalid inputs
     *
     * @return {void} 
     */
    __checkInput : function()
    {
      if (this.develWidgets["createDialog.fileNameText"].getValue().length > 0 & this.develWidgets["createDialog.filePathText"].getValue().length > 0 & !this.develWidgets["createDialog.logCheckBox"].getChecked()) {
        this.develWidgets["createDialog.createButton"].setEnabled(true);
      } else if (this.develWidgets["createDialog.fileNameText"].getValue().length > 0 & this.develWidgets["createDialog.filePathText"].getValue().length > 0 & this.develWidgets["createDialog.logCheckBox"].getChecked() & this.develWidgets["createDialog.logText"].getValue().length > 0) {
        this.develWidgets["createDialog.createButton"].setEnabled(true);
      } else {
        this.develWidgets["createDialog.createButton"].setEnabled(false);
      }

      for (var i=0; i<this.develWidgets["createDialog.fileNameText"].getValue().length; i++)
      {
        if (this.develWidgets["createDialog.fileNameText"].getValue()[i] == "Unidentified" || this.develWidgets["createDialog.fileNameText"].getValue()[i] == "?" || this.develWidgets["createDialog.fileNameText"].getValue()[i] == "\"" || this.develWidgets["createDialog.fileNameText"].getValue()[i] == "/" || this.develWidgets["createDialog.fileNameText"].getValue()[i] == ":" || this.develWidgets["createDialog.fileNameText"].getValue()[i] == "*" || this.develWidgets["createDialog.fileNameText"].getValue()[i] == "<" || this.develWidgets["createDialog.fileNameText"].getValue()[i] == ">" || this.develWidgets["createDialog.fileNameText"].getValue()[i] == "|" || this.develWidgets["createDialog.fileNameText"].getValue()[i] == "\\")
        {
          alert("Invalid input: " + this.develWidgets["createDialog.fileNameText"].getValue()[i]);

          var output = this.develWidgets["createDialog.fileNameText"].getValue();
          output = output.replace(this.develWidgets["createDialog.fileNameText"].getValue()[i], "");
          this.develWidgets["createDialog.fileNameText"].setValue(output);
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
      for (var i=0; i<this.develWidgets["createDialog.namespaceText"].getValue().length; i++)
      {
        if (this.develWidgets["createDialog.namespaceText"].getValue()[i] == "Unidentified" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == "?" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == "\"" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == "/" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == ":" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == "*" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == "<" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == ">" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == "-" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == "|" || this.develWidgets["createDialog.namespaceText"].getValue()[i] == "\\")
        {
          alert("Invalid input: " + this.develWidgets["createDialog.namespaceText"].getValue()[i]);

          var output = this.develWidgets["createDialog.namespaceText"].getValue();
          output = output.replace(this.develWidgets["createDialog.namespaceText"].getValue()[i], "");
          this.develWidgets["createDialog.namespaceText"].setValue(output);
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
      if (this.__isEdited == false) {
        this.develWidgets["createDialog.namespaceText"].setValue(this.develWidgets["createDialog.fileNameText"].getValue().replace(/-/g, ""));
      }
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
    setCurrentType : function(type) {
      this.__currentType = type;
    },


    /**
     * returns the type of the application
     *
     * @return {var} the type of the application
     */
    getCurrentType : function() {
      return this.__currentType;
    },


    /**
     * sets the file name
     *
     * @param name {var} file name of the application
     * @return {void} 
     */
    setCurrentFileName : function(name) {
      this.__currentFileName = name;
    },


    /**
     * returns the file name of the application
     *
     * @return {var} the filename of the current application
     */
    getCurrentFileName : function() {
      return this.__currentFileName;
    },


    /**
     * sets the application path
     *
     * @param path {var} path of the application
     * @return {void} 
     */
    setCurrentFilePath : function(path)
    {
      path = path.replace(/\//g, '\\');
      this.__currentFilePath = path;
    },


    /**
     * returns the current application path
     *
     * @return {var} the file path of the application
     */
    getCurrentFilePath : function() {
      return this.__currentFilePath;
    },


    /**
     * set the namespace of the application
     *
     * @param nameSpace {var} namespace of the application
     * @return {void} 
     */
    setCurrentNamespace : function(nameSpace)
    {
      if (nameSpace != "") {
        this.__nameSpace = nameSpace;
      }
    },


    /**
     * returns the namespace of the application
     *
     * @return {var} namespace of the application
     */
    getCurrentNamespace : function() {
      return this.__nameSpace;
    },


    /**
     * sets the log name of the application
     *
     * @param logName {var} name of the log file
     * @return {void} 
     */
    setCurrentLogName : function(logName) {
      this.__logName = logName;
    },


    /**
     * returns the log name of the application
     *
     * @return {var} log name of the application
     */
    getCurrentLogName : function() {
      return this.__logName;
    }
  }
});