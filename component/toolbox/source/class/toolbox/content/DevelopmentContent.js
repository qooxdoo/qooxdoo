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
 * This class contains the whole content of the Home pane
 */
qx.Class.define("toolbox.content.DevelopmentContent",
{
  extend : qx.ui.container.Composite,

  construct : function(widgets, appList, removeButton, caption)
  {
    this.base(arguments);
    
    this.__adminHost = "127.0.0.1";
    this.__adminPort = "8000";
    this.__adminPath = "/component/toolbox/tool/bin/nph-qxadmin_cgi.py"; 
    
    //widget container
    this.widgets = {};
    
    //variables
    this.__isEdited = false;
    this.__currentType = "gui";
    this.__currentFileName = "";
    this.__currentFilePath = "";
    this.__nameSpace = "";
    this.__logName = "";
    this.__isGenerateSource = false;
    
    this.appList = appList;
    this.removeButton = removeButton;
    this.appDevelCaption = caption;
    
    this.myLogFrame = widgets["pane.logFrame"];
    var layout = new qx.ui.layout.Grid(5, 5);
    this.setLayout(layout);
    this.setBackgroundColor("white");
    this.setPadding(4, 4, 4, 4);
    
    var label = new qx.ui.basic.Label("<b>Create Application</b>").set({rich : true});
    

    
    // -- create button
    var createSkeletonButton = new qx.ui.form.Button("Creates Application", "toolbox/image/development.png");
    this.widgets["development.createSkeletonButton"] = createSkeletonButton;
    createSkeletonButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Creates a new application")));
    
    //Listener
    this.widgets["development.createSkeletonButton"].addListener("execute", this.__createApplicationDialog, this);
    
    
    
    this.add(label, {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
    });
    
    this.add(createSkeletonButton, {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
    });
    
    
    
  },
  
  members : {
  
  
  
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
		                                           this.myLogFrame, 
		                                           this.appList);

      this.appList.setEnabled(false);
      this.appDevelCaption.setContent(this.__getCurrentFileName());
      this.__cancelNewApplication();
      return;
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
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "-" 
         || this.widgets["createDialog.namespaceText"].getValue()[i] == "|" 
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
    }
  
  
  
  
  
  
  
  
  
  
  
  
  }
  
});