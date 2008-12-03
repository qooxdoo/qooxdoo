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
 * This is the main application class of your custom application "HelloWorld"
 */
qx.Class.define("toolbox.Configuration",
{
  extend : qx.core.Object,




  /*
          *****************************************************************************
             CONSTRUCTOR
          *****************************************************************************
        */

  construct : function(adminPath, fileName, filePath)
  {
    this.base(arguments, adminPath, fileName, filePath);
    this.__urlParms = new toolbox.UrlSearchParms();
    this.__showConfiguration(adminPath, fileName, filePath);
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
     * TODOC
     *
     * @type member
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @return {void} 
     */
    __showConfiguration : function(adminPath, fileName, filePath)
    {
    	fileName = "app1";
    	filePath = "C:\\tmp\\";
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST");
        var req2 = new qx.io.remote.Request(url, "POST");
        var dat = "action=show_Configuration";
        var saveDat = "action=save_Configuration";
        var createParams = [ fileName, filePath ];
        req.setTimeout(1000000);

        // check cygwin path
        if ('cygwin' in this.__urlParms.getParms())
        {
          var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
          dat += "&" + cygParm;
        }

        var params = [ "myName", "myPath" ];

        for (var i=0; i<createParams.length; i++)
        {
          if (createParams[i] != "")
          {
            dat += "&" + params[i] + "=" + createParams[i];
            saveDat += "&" + params[i] + "=" + createParams[i];
          }
        }

        req.setProhibitCaching(true);
        req.setData(dat);

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          var restoreResult = result;
          var vBoxLayout = new qx.ui.layout.VBox(5);
          vBoxLayout.setAlignX("right");

          var gridLayout = new qx.ui.layout.Grid(5, 5);
          gridLayout.setRowFlex(0, 1);
          gridLayout.setRowFlex(1, 1);
          gridLayout.setColumnFlex(0, 1);
          var mainContainer = new qx.ui.container.Composite(gridLayout);

          var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({ allowGrowX : false });

          var tabButtonContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "right"));

          this.win = new qx.ui.window.Window("Configuration");
          this.win.setModal(true);
          this.win.setLayout(vBoxLayout);
          this.win.setMinWidth(380);

          // --------Buttons-----------------------------------------------------
          var saveButton = new qx.ui.form.Button("Save", "toolbox/image/media-floppy.png");
          var closeButton = new qx.ui.form.Button("Close", "toolbox/image/dialog-close.png");

          // --------Buttons-----------------------------------------------------
          // --------Textarea----------------------------------------------------
          this.configFrame = new qx.ui.form.TextArea("");
          this.configFrame.setMinWidth(400);
          this.configFrame.setWrap(false);
          this.configFrame.setAllowGrowX(true);
          this.configFrame.setAllowGrowY(true);
          this.configFrame.setAllowStretchX(true);
          this.configFrame.setAllowStretchY(true);
          this.configFrame.setValue(result);
          this.configFrame.setMinHeight(400);

          // --------Textarea----------------------------------------------------
          this.analyzer = new toolbox.JsonAnalyzer();
          toolbox.Configuration.JSON = result = eval("(" + result + ")");
          var root = this.analyzer.createJsonTree(result);

          container.add(closeButton);
          container.add(saveButton);

          tabView = new qx.ui.tabview.TabView();

          var page1Name = "JSON-settings";
          var page2Name = "Professional view";

          var tabApplyButton = new qx.ui.form.Button("Apply changes", "toolbox/image/dialog-ok.png");
          var tabRestoreButton = new qx.ui.form.Button("Restore Defaults", "toolbox/image/edit-redo.png");

          this.isApplied = false;

          tabApplyButton.addListener("execute", function()
          {
            var obj = qx.util.Json.parse(this.configFrame.getValue());
            this.analyzer.createJsonTree(obj);
            toolbox.Configuration.JSON = obj;
            this.isApplied = true;
          },
          this);

          tabRestoreButton.addListener("execute", function()
          {
            if (typeof restoreResult != "object") {
              restoreResult = qx.util.Json.parse(restoreResult);
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

          tabView.addListener("changeSelected", function()
          {
            if (tabView.getSelected().getLabel().toString() == page2Name) {
              this.configFrame.setValue(qx.util.Json.stringify(toolbox.Configuration.JSON, true));
            }
            else if (tabView.getSelected().getLabel().toString() == page1Name)
            {
              if (this.configFrame.getValue().toString() != qx.util.Json.stringify(toolbox.Configuration.JSON, true).toString() & !this.isApplied) {
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

          page1.add(mainContainer);
          page2.add(this.configFrame);
          page2.add(tabButtonContainer);

          this.win.add(tabView, { flex : 1 });
          this.win.add(container);

          closeButton.addListener("execute", function() {
            this.win.close();
          }, this);

          saveButton.addListener("execute", function()
          {
            try
            {
              changedConfig = this.configFrame.getValue();
              qx.util.Json.parse(changedConfig);
              saveDat += "&changedConfig=" + changedConfig;
              req2.setData(saveDat);
              req2.send();
            }
            catch(err)
            {
              alert(err);
            }

            this.win.close();
          },
          this);

          this.win.open();
          this.win.moveTo(200, 50);

          this.setResult(result);
        },
        this);

        req2.addListener("completed", function(evt) {
          saveResult = evt.getContent();
        }, this);

        req.addListener("failed", function(evt) {
          this.error("Failed to post to URL: " + url);
        }, this);

        req.send();
      }
      else
      {
        alert("You don't created an application");
      }

      return;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    openSaveDialog : function()
    {  // TODO
      this.__saveDialog = new qx.ui.window.Window("Save changes", null);
      this.__saveDialog.setLayout(new qx.ui.layout.VBox(5));
      this.__saveDialog.add(new qx.ui.basic.Label("You changed the JSON-object in the professional view."));
      this.__saveDialog.add(new qx.ui.basic.Label("Do you want to save the changes?"));

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "right"));

      var yesButton = new qx.ui.form.Button("Yes");
      var noButton = new qx.ui.form.Button("No");

      noButton.addListener("execute", function() {
        this.__saveDialog.close();
      }, this);

      yesButton.addListener("execute", function()
      {
        this.analyzer.createJsonTree(qx.util.Json.parse(this.configFrame.getValue()));
        toolbox.Configuration.JSON = qx.util.Json.parse(this.configFrame.getValue());
        this.__saveDialog.close();
        this.isApplied = true;
      },
      this);

      container.add(yesButton);
      container.add(noButton);

      this.__saveDialog.add(container);

      this.__saveDialog.setAllowMaximize(false);
      this.__saveDialog.setAllowClose(true);
      this.__saveDialog.setAllowMinimize(false);
      this.__saveDialog.setModal(true);
      this.__saveDialog.open();
      this.__saveDialog.moveTo(this.win.getBounds()["left"] + 100, this.win.getBounds()["top"] + 50);
    },


    /**
     * TODOC
     *
     * @type member
     * @param state {var} TODOC
     * @return {void} 
     */
    setState : function(state) {
      this.__state = state;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getState : function() {
      return this.__state;
    },


    /**
     * TODOC
     *
     * @type member
     * @param content {var} TODOC
     * @return {void} 
     */
    setResult : function(content) {
      this.__content = content;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getResult : function() {
      return this.__content;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    destruct : function()
    {
      // this._disposeFields("widgets");
      this._disposeObjects("this.win", "this.__content", "this.__state");
    }
  }
});