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
 * Creates the gui of the configuration dialog
 */
qx.Class.define("toolbox.configuration.ConfigurationDialog",
{
  extend : qx.ui.window.Window,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(adminPath, fileName, filePath, logFrame, recResult)
  {
    this.base(arguments, adminPath, fileName, filePath, logFrame, recResult);
    this.__createConfiguration(adminPath, fileName, filePath, logFrame, recResult);
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  statics : { JSON : null },

  members :
  {
    /**
     * shows the configuration of the current application
     *
     * @param adminPath {var} path of the cgi-script
     * @param fileName {var} name of the application
     * @param filePath {var} path of the application
     * @param logFrame {var} log output
     * @param recResult {var} received Result from the web server
     * @return {void} 
     * @throws error on save process
     */
    __createConfiguration : function(adminPath, fileName, filePath, logFrame, recResult)
    {
      var saveDat = "action=save_Configuration";
      var restoreResult = recResult;

      var req = new qx.io.remote.Request(adminPath, "POST");
      var createParams = [ fileName, filePath ];
      req.setTimeout(1000000);

      var params = [ "myName", "myPath" ];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "") {
          saveDat += "&" + params[i] + "=" + createParams[i];
        }
      }

      var vBoxLayout = new qx.ui.layout.VBox(5);
      vBoxLayout.setAlignX("right");

      var gridLayout = new qx.ui.layout.Grid(5, 5);
      gridLayout.setRowFlex(0, 1);
      gridLayout.setRowFlex(1, 1);
      gridLayout.setColumnFlex(0, 1);
      gridLayout.setColumnFlex(1, 1);

      var mainContainer = new qx.ui.container.Composite(gridLayout);

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({ allowGrowX : false });

      var tabButtonContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "right"));

      this.setCaption("Configuration of " + fileName);
      this.setModal(true);
      this.setShowMinimize(false);
      this.setLayout(vBoxLayout);
      this.setWidth(550);
      this.setMinWidth(410);
      this.setMinHeight(500);
      this.open();
      this.show();

      // --------Buttons-----------------------------------------------------
      var saveButton = new qx.ui.form.Button("Save", "toolbox/image/media-floppy.png");
      var cancelButton = new qx.ui.form.Button("Cancel", "toolbox/image/dialog-close.png");

      // --------Buttons-----------------------------------------------------
      // --------Textarea----------------------------------------------------
      this.configFrame = new qx.ui.form.TextArea("").set({ font : qx.bom.Font.fromString("14px monospace") });
      this.configFrame.setWrap(false);
      this.configFrame.setAllowGrowX(true);
      this.configFrame.setAllowGrowY(true);
      this.configFrame.setAllowStretchX(true);
      this.configFrame.setAllowStretchY(true);
      this.configFrame.setValue(restoreResult);

      // --------Textarea----------------------------------------------------
      this.analyzer = new toolbox.configuration.JsonAnalyzer();
      toolbox.configuration.Configuration.JSON = restoreResult = qx.util.Json.parseQx(restoreResult);
      this.analyzer.createJsonTree(restoreResult);

      container.add(saveButton);
      container.add(cancelButton);

      var tabView = new qx.ui.tabview.TabView();

      var page1Name = "JSON-settings";
      var page2Name = "Professional view";

      var tabApplyButton = new qx.ui.form.Button("Apply changes", "toolbox/image/dialog-ok.png");
      var tabRestoreButton = new qx.ui.form.Button("Restore defaults", "toolbox/image/edit-redo.png");

      this.isApplied = false;

      tabApplyButton.addListener("execute", function()
      {
        var obj = qx.util.Json.parseQx(this.configFrame.getValue());
        this.analyzer.createJsonTree(obj);
        toolbox.configuration.Configuration.JSON = obj;
        this.isApplied = true;
      },
      this);

      tabRestoreButton.addListener("execute", function()
      {
        if (typeof restoreResult != "object") {
          restoreResult = qx.util.Json.parseQx(restoreResult);
        }

        this.configFrame.setValue(qx.util.Json.stringify(restoreResult, true));
      },
      this);

      tabButtonContainer.add(tabApplyButton);
      tabButtonContainer.add(tabRestoreButton);

      var page1 = new qx.ui.tabview.Page(page1Name, null);
      page1.setLayout(new qx.ui.layout.VBox());
      tabView.add(page1);

      var page2 = new qx.ui.tabview.Page("Professional view", null);
      page2.setLayout(new qx.ui.layout.VBox(5));
      page2.add(new qx.ui.basic.Label("Config.js"));
      tabView.add(page2);

      tabView.addListener("changeSelection", function()
      {
        if (tabView.getSelection()[0].getLabel().toString() == page2Name) {
          this.configFrame.setValue(qx.util.Json.stringify(toolbox.configuration.Configuration.JSON, true));
        }
        else if (tabView.getSelection()[0].getLabel().toString() == page1Name)
        {
          if (this.configFrame.getValue().toString() != qx.util.Json.stringify(toolbox.configuration.Configuration.JSON, true).toString() & !this.isApplied) {
            this.openSaveDialog();
          } else {
            this.isApplied = false;
          }
        }
      },
      this);

      mainContainer.add(this.analyzer.getTreeGroup(),
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      mainContainer.add(this.analyzer.getCommandFrame(this.analyzer.getTree()),
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      page1.add(mainContainer, { flex : 1 });
      page2.add(this.configFrame, { flex : 1 });
      page2.add(tabButtonContainer);

      this.add(tabView, { flex : 1 });
      this.add(container);

      cancelButton.addListener("execute", function() {
        this.close();
      }, this);

      saveButton.addListener("execute", function()
      {
        try
        {
          var changedConfig = this.configFrame.getValue();
          changedConfig = qx.util.Json.stringify(qx.util.Json.parseQx(changedConfig), true);
          saveDat += "&changedConfig=" + changedConfig;

          req.setData(saveDat);
          req.send();
        }
        catch(err)
        {
          throw new Error(err.toString());
        }

        this.close();
      },
      this);

      this.open();
      this.moveTo(200, 50);

      req.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
      },
      this);

      return;
    },


    /**
     * opens the save dialog to apply the changes in the professional view.
     *
     * @return {void} 
     */
    openSaveDialog : function()
    {
      var saveDialog = new qx.ui.window.Window("Save changes", null);
      var layout = new qx.ui.layout.Grid(5, 5);
      saveDialog.setLayout(layout);
      var label = new qx.ui.basic.Label("You changed the JSON-object in the professional view.<br/>Do you want to save the changes?").set({ rich : true})

      saveDialog.add(label,
      {
        row     : 0,
        column  : 1,
        rowSpan : 0,
        colSpan : 0
      });
      
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "right"));
	  var warningImage = new qx.ui.basic.Image("toolbox/image/48/dialog-warning.png");
      var yesButton = new qx.ui.form.Button("Yes");
      var noButton = new qx.ui.form.Button("No");

      noButton.addListener("execute", function() {
        saveDialog.close();
      }, this);

      yesButton.addListener("execute", function()
      {
        this.analyzer.createJsonTree(qx.util.Json.parse(this.configFrame.getValue()));
        toolbox.configuration.Configuration.JSON = qx.util.Json.parse(this.configFrame.getValue());
        saveDialog.close();
        this.isApplied = true;
      },
      this);

      container.add(yesButton);
      container.add(noButton);

	  saveDialog.add(warningImage,
      {
        row     : 0,
        column  : 0,
        rowSpan : 1,
        colSpan : 0
      });
      
      saveDialog.add(container,
      {
        row     : 1,
        column  : 1,
        rowSpan : 0,
        colSpan : 0
      });

      saveDialog.setShowMaximize(false);
      saveDialog.setAllowClose(true);
      saveDialog.setShowMinimize(false);
      saveDialog.setModal(true);
      saveDialog.open();
      saveDialog.moveTo(this.getBounds()["left"] + 100, this.getBounds()["top"] + 50);
    },


    /**
     * disposes all global objects
     *
     * @return {void} 
     */
    destruct : function() {
      this._disposeObjects("this.__content", "this.__state");
    }
  }
});