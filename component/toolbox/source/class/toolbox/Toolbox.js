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
        *****************************************************************************
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

    var deco = new qx.ui.decoration.Background().set({ backgroundColor : "background-medium" });

    this._labelDeco = deco;

    // Left -- is done when iframe is loaded, das ist Test, ganz links
    var left = this.__makeLeft();
    left.setWidth(250);
    this.left = left;
    this.mainsplit.add(left, 0);

    // Right
    var right = new qx.ui.container.Composite(new qx.ui.layout.VBox);
    mainsplit.add(right, 1);

    // output views
    var buttview = this.__makeOutputViews();
    right.add(buttview, { flex : 1 });

    // status
    var statuspane = this.__makeStatus();
    this.widgets["statuspane"] = statuspane;
    this.add(statuspane);

    // assignListener
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
     * @type member
     * @return {var} TODOC
     */
    __makeToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;

      var part1 = new qx.ui.toolbar.Part();
      toolbar.add(part1);

      // -- create button
      this.createButton = new qx.ui.toolbar.Button("New application", "toolbox/image/development.png");
      part1.add(this.createButton);
      this.widgets["toolbar.createButton"] = this.createButton;
      this.createButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Creates a new application")));

      // -- generate button
      this.generateButton = new qx.ui.toolbar.Button("Generate source", "toolbox/image/system-run.png");
      part1.add(this.generateButton);
      this.widgets["toolbar.generateButton"] = this.generateButton;
      this.generateButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the source of the created application")));

      // -- generate build button
      this.generateBuildButton = new qx.ui.toolbar.Button("Generate build", "toolbox/image/executable.png");
      part1.add(this.generateBuildButton);
      this.widgets["toolbar.generateBuildButton"] = this.generateBuildButton;
      this.generateBuildButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the build")));

      var part2 = new qx.ui.toolbar.Part();
      toolbar.add(part2);

      // -- generate Api
      this.generateApiButton = new qx.ui.toolbar.Button("Generate api", "toolbox/image/help-faq.png");
      part2.add(this.generateApiButton);
      this.widgets["toolbar.generateApiButton"] = this.generateApiButton;
      this.generateApiButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Generates the API of the application")));

      // -- make pretty
      this.makePrettyButton = new qx.ui.toolbar.Button("Format source", "toolbox/image/format-indent-more.png");
      part2.add(this.makePrettyButton);
      this.widgets["toolbar.makePrettyButton"] = this.makePrettyButton;
      this.makePrettyButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("makes the source pretty")));

      // -- validate code
      this.validateCodeButton = new qx.ui.toolbar.Button("Validate source", "toolbox/image/edit-find.png");
      part2.add(this.validateCodeButton);
      this.widgets["toolbar.validateCodeButton"] = this.validateCodeButton;
      this.validateCodeButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Validates the source")));

      // -- test
      this.testButton = new qx.ui.toolbar.Button("Test", "toolbox/image/dialog-apply.png");
      part2.add(this.testButton);
      this.widgets["toolbar.testButton"] = this.testButton;
      this.testButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Tests the application")));

      // -- test source
      this.testSourceButton = new qx.ui.toolbar.Button("Test source", "toolbox/image/check-spelling.png");
      part2.add(this.testSourceButton);
      this.widgets["toolbar.testSourceButton"] = this.testSourceButton;
      this.testSourceButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Tests the source")));

      toolbar.addSpacer();

      var part3 = new qx.ui.toolbar.Part();
      toolbar.add(part3);

      this.configurationButton = new qx.ui.toolbar.Button("Configuration", "toolbox/image/preferences.png");
      part3.add(this.configurationButton);
      this.widgets["toolbar.configurationButton"] = this.configurationButton;
      this.configurationButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Configuration of the application")));

      return toolbar;
    },  // makeToolbar


    /**
     * TODOC
     *
     * @type member
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
     * @type member
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
      this.__frame = new qx.ui.embed.Html().set(
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
      this.__abortButtonWindow = new qx.ui.form.Button("Abort", "toolbox/image/dialog-close.png");
      this.__abortButtonWindow.addListener("execute", this.__abortNewApplication, this);

      // Create Button
      this.__createButtonWindow = new qx.ui.form.Button("Create", "toolbox/image/dialog-ok.png");
      this.__createButtonWindow.addListener("execute", this.__createNewApplication, this);

      // default value is disabled
      this.__createButtonWindow.setEnabled(false);

      // ------Buttons End-------------------------------------------------------
      this.__container.add(this.__abortButtonWindow);
      this.__container.add(this.__createButtonWindow);

      // --------------------------CONTRIB---------------------------------------
      /*
                   * SINGLE UPLOAD WIDGET 
                         
                  this.__form = new uploadwidget.UploadForm('uploadFrm').set({paddingTop: 30});
                  this.__form.setLayout(new qx.ui.layout.Basic);
            
                  this.__logText = new uploadwidget.UploadField('uploadfile', 'Browse','toolbox/image/document-save.png');
                  this.__form.add(this.__logText, {left:0,top:0});
            
                  this.__logText.getTextField().setWidth(170);
                  this.__logText.getTextField().setAllowGrowX(true);
                  
                  this.__form.addListener('completed', function(e) {
                    //this.debug('completed');
                    this.__logText.setFieldValue('');
                    //var response = this.getIframeHtmlContent();
                    //this.debug(response);
                  });
                  */

      // -------------------------CONTRIB----------------------------------------
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

      this.__selectBox.addListener("changeValue", function(e) {
        this.__setCurrentType(this.__selectBox.getValue());
      }, this);

      // ------Selectbox End---------------------------------------------------
      this.__createApplicationWindow.addListener("close", function() {
        this.__isGenerateSource = false;
      }, this);

      // Default hide log textfield
      this.__logText.hide();

      // this.__form
      this.__windowContent = new Array(this.__fileNameText, this.__filePathText, this.__namespaceText, this.__logCheckBox, this.__logText, this.__selectBox, this.__generateBox, this.__createButtonWindow);

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

      box.add(this.__frame,
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
     * @type member
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
     * @type member
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
     * @type member
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
     * @type member
     * @return {void} 
     */
    __copyContent : function()
    {
      if (this.__isEdited == false) this.__namespaceText.setValue(this.__fileNameText.getValue());
    },

    // creates a new Application
    /**
     * TODOC
     *
     * @type member
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

      toolbox.Builder.createNewApplication(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), this.__getCurrentNamespace(), this.__getCurrentLogName(), this.__getCurrentType(), this.__isGenerateSource.toString(), this.__loadImage, this.__frame, this.__windowContent, this.logFrame);

      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __generateApplication : function()
    {
      toolbox.Builder.generateSource(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), "true", this.__frame, this.logFrame);

      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __generateBuild : function()
    {
      toolbox.Builder.generateBuild(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), this.logFrame);
      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __generateApi : function()
    {
      toolbox.Builder.generateApi(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), this.logFrame);
      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __makePretty : function()
    {
      toolbox.Builder.makePretty(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), this.logFrame);
      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __openConfiguration : function()
    {
      this.__configuration = new toolbox.Configuration(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), this.logFrame);
      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __validateCode : function()
    {
      toolbox.Builder.validateCode(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), this.logFrame);
      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __abortProcess : function()
    {
      this.__abortCurrentProcess = new toolbox.AbortProcess(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), this.logFrame);
      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __testSource : function()
    {
      toolbox.Builder.testSource(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), this.logFrame);

      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __testApplication : function() {
      toolbox.Builder.testApplication(this.__adminPath, this.__getCurrentFileName(), this.__getCurrentFilePath(), this.logFrame);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __abortNewApplication : function()
    {
      this.__loadImage.hide();
      this.__isEdited = false;
      this.__isGenerateSource = false;
      this.__abortProcess();
      this.__createApplicationWindow.close();

      return;
    },

    // ------------------------------------------------------------------------
    //   SETTER AND GETTER
    // ------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @type member
     * @param type {var} TODOC
     * @return {void} 
     */
    __setCurrentType : function(type) {
      this.__currentType = type;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __getCurrentType : function() {
      return this.__currentType;
    },


    /**
     * TODOC
     *
     * @type member
     * @param name {var} TODOC
     * @return {void} 
     */
    __setCurrentFileName : function(name) {
      this.__currentFileName = name;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __getCurrentFileName : function() {
      return this.__currentFileName;
    },


    /**
     * TODOC
     *
     * @type member
     * @param path {var} TODOC
     * @return {void} 
     */
    __setCurrentFilePath : function(path) {
      this.__currentFilePath = path;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __getCurrentFilePath : function() {
      return this.__currentFilePath;
    },


    /**
     * TODOC
     *
     * @type member
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
     * @type member
     * @return {var} TODOC
     */
    __getCurrentNamespace : function() {
      return this.__nameSpace;
    },


    /**
     * TODOC
     *
     * @type member
     * @param logName {var} TODOC
     * @return {void} 
     */
    __setCurrentLogName : function(logName) {
      this.__logName = logName;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __getCurrentLogName : function() {
      return this.__logName;
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
      var pane = new qx.ui.splitpane.Pane("horizontal");
      pane.setDecorator(null);

      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      // First Page
      var p1 = new qx.ui.container.Composite(layout).set(
      {
        // width           : 700,
        backgroundColor : "white",
        decorator       : "main"
      });

      pane.add(p1, 1);

      var caption1 = new qx.ui.basic.Label(this.tr("Toolbox Results")).set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      p1.add(caption1);

      this.pp1 = new qx.ui.embed.Html('');

      this.pp1.set(
      {
        backgroundColor : "white",
        overflowY       : "scroll"
      });

      p1.add(this.pp1, { flex : 1 });

      // Second Page
      var pane2 = new qx.ui.splitpane.Pane("vertical");
      pane2.setDecorator(null);
      pane.add(pane2, 1);

      var layout3 = new qx.ui.layout.VBox();
      layout3.setSeparator("separator-vertical");

      // log frame
      var pp2 = new qx.ui.container.Composite(layout3).set({ decorator : "main" });
      pane2.add(pp2, 1);

      var caption2 = new qx.ui.basic.Label("Log").set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : [ 4, 3 ],
        allowGrowX : true,
        allowGrowY : true
      });

      pp2.add(caption2);

      // main output area
      this.logFrame = new qx.ui.embed.Html('');

      this.logFrame.set(
      {
        backgroundColor : "white",
        overflowY       : "scroll",
        overflowX       : "scroll"
      });

      pp2.add(this.logFrame, { flex : 1 });

      return pane;
    },  // makeOutputViews

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __makeLeft : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      var caption = new qx.ui.basic.Label(this.tr("Qooxdoo Explorer")).set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.f3 = new qx.ui.embed.Html('');
      this.f3.set({ backgroundColor : "white" });
      container.add(this.f3, { flex : 1 });

      return container;
    },  // makeLeft

    // -------------------------------------------------------------------------
    /**
     * Creates the application header.
     *
     * @type member
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
    },

    // -------------------------------------------------------------------------
    /**
     * Statusbalken, unten...
     *
     * @type member
     * @return {var} TODOC
     */
    __makeStatus : function()
    {
      var layout = new qx.ui.layout.HBox(10);
      var statuspane = new qx.ui.container.Composite(layout);
      statuspane.set({ margin : 4 });

      // Test Info
      statuspane.add(new qx.ui.basic.Label(this.tr("Selected Test: ")).set({ alignY : "middle" }));

      var l1 = new qx.ui.form.TextField("").set(
      {
        width    : 150,
        font     : "small",
        readOnly : true
      });

      statuspane.add(l1);

      // System Info
      statuspane.add(new qx.ui.basic.Label(this.tr("System Status: ")).set({ alignY : "middle" }));

      return statuspane;

    }  // makeStatus
  },

  destruct : function()
  {
    this._disposeFields("widgets");
    this._disposeObjects("mainsplit", "left", "runbutton", "generateButton", "closeButton", "toolbar", "f1", "f2", "f3");
  }
});