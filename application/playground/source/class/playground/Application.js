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
     * Andreas Ecker (ecker)
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/*)
#asset(playground/*)

************************************************************************ */

/**
 * EXPERIMENTAL: This playground application is a minimal implementation,
 * that requires further improvements (object destruction, etc.)
 */
qx.Class.define("playground.Application",
{
  extend : qx.application.Standalone,




  /*
      *****************************************************************************
         MEMBERS
      *****************************************************************************
      */

  members :
  {
    widgets : {},
    __playRoot : null,
    currentSelectedButton : "",
    sampleContainer : {},


    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @return {void} 
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;

        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      var self = this;

      var doc = this.getRoot();

      // label decorator
      var deco = new qx.ui.decoration.Background().set({ backgroundColor : "background-medium" });
      this._labelDeco = deco;

      // container layout
      var layout = new qx.ui.layout.VBox();

      // Main container
      var mainContainer = new qx.ui.container.Composite(layout);
      doc.add(mainContainer, { edge : 0 });

      // qooxdoo header
      mainContainer.add(this.__createHeader(), { flex : 0 });

      // qooxdoo toolbar
      mainContainer.add(this.__makeToolbar(), { flex : 0 });

      var mainsplit = new qx.ui.splitpane.Pane("horizontal");

      var infosplit = new qx.ui.splitpane.Pane("horizontal");
      infosplit.setDecorator(null);

      mainContainer.add(mainsplit, { flex : 1 });

      mainsplit.add(this.__makeTextArea());
      mainsplit.add(infosplit, 1);
      infosplit.add(this.__makePlayArea(), 2);

      var logView = this.__makeLogView();

      this.stack = new qx.ui.container.Stack;
      this.stack.setDecorator("main");
      this.stack.add(logView);

      infosplit.add(this.stack, 1);
      this.stack.exclude();

      
      
      
      qx.html.Element.flush();
      var playRootEl = this.dummy.getContainerElement().getDomElement();
      this.__playRoot = new qx.ui.root.Inline(playRootEl);
      this.__playRoot._setLayout(new qx.ui.layout.Canvas());

      this.playarea.addListener("resize", function(e)
      {
        var data = e.getData();
        self.__playRoot.setMinWidth(data.width);
        self.__playRoot.setMinHeight(data.height);
      });

      this.__playApp = this.clone();
      this.__playApp.getRoot = function() {
        return self.__playRoot;
      };
      
      this.__playRoot.addListener("resize", function(e)
      {
        var data = e.getData();
        self.dummy.setMinWidth(data.width);
        self.dummy.setMinHeight(data.height);
      });

      this.__runApplication(this.__playRoot);
      this.__resetApplication();
      this.__openApiViewer();
      this.__openHelpDialog();
      this.__openLog();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeLog : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      var caption = new qx.ui.basic.Label(this.tr("Log")).set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.logArea = new qx.ui.embed.Html('');
      this.logArea.set({
        backgroundColor : "white",
        overflowY : "scroll"
      });
      pp2.add(this.logArea, {flex: 1});

      container.add(this.logArea, { flex : 1 });

      
      // log appender
      this.logappender = new qx.log.appender.Element();

      qx.log.Logger.unregister(this.logappender);

      // Directly create DOM element to use
      this.logelem = document.createElement("DIV");
      this.logappender.setElement(this.logelem);

      this.logArea.addListenerOnce("appear", function(){
        this.logArea.getContentElement().getDomElement().appendChild(this.logelem);
      }, this);

      return container;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makePlayArea : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      var caption = new qx.ui.basic.Label(this.tr("Play Area")).set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.playarea = new qx.ui.container.Scroll();

      this.dummy = new qx.ui.core.Widget;
      this.playarea.add(this.dummy);

      container.add(this.playarea, { flex : 1 });

      return container;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeTextArea : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      var caption = new qx.ui.basic.Label(this.tr("Source Code")).set(
      {
        font       : "bold",
        decorator  : this._labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.textarea = new qx.ui.form.TextArea(this.sampleContainer[this.currentSelectedButton]);

      this.textarea.set(
      {
        wrap : false,
        font : "monospace",
        decorator: null
      });

      container.add(this.textarea, { flex : 1 });

      return container;
    },


    /**
     * TODOC
     *
     * @param root {var} TODOC
     * @return {void} 
     */
    __runApplication : function(root)
    {
      this.widgets["toolbar.runButton"].addListener("execute", function() {
        this.updatePlayground(root);
      }, this);
    },


    /**
     * TODOC
     *
     * @param root {var} TODOC
     * @return {void} 
     */
    updatePlayground : function(root)
    {
      for (var i=0, ch=root.getChildren(), chl=ch.length; i<chl; i++)
      {
        if (ch[i]) {
          ch[i].destroy();
        }
      }

      this.code = this.textarea.getValue();

      try
      {
        this.fun = new Function(this.code);
        this.fun.call(this.__playApp);
      }
      catch(ex)
      {
        this.error(ex);
        alert(this.tr("Sorry, invalid code!") + "\n\n" + ex);
      }
      
       this.__fetchLog();
      
      
    },


    /**
     * TODOC
     *
     * @return {void} 
     */
    __resetApplication : function()
    {
      this.widgets["toolbar.resetButton"].addListener("execute", function()
      {
        var currentSource = this.sampleContainer[this.currentSelectedButton];
        if(currentSource != undefined){
        currentSource = currentSource.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

        this.textarea.setValue(currentSource);
        }
      },
      this);
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __getFileMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var newButton;

      var counter = 0;
      var elem;

      while (true)
      {
        elem = document.getElementById("qx_sample_" + counter);

        if (elem != null)
        {
          this.sampleContainer[elem.title] = elem.innerHTML;
          newButton = new qx.ui.menu.Button(elem.title, "icon/16/actions/document-new.png");
          counter++;
        }
        else
        {
          break;
        }

        menu.add(newButton);
      }

      for (var i=0; i<menu.getChildren().length; i++)
      {
        menu.getChildren()[i].addListener("execute", function(e)
        {
          this.currentSelectedButton = menu.getSelectedButton().getLabel().toString();
          var currentSource = this.sampleContainer[this.currentSelectedButton];
          currentSource = currentSource.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

          this.textarea.setValue(currentSource);

          this.updatePlayground(this.__playRoot);
        },
        this);
      }

      return menu;
    },




    /**
     * TODOC
     *
     * @return {void} 
     */
    __openApiViewer : function()
    {
      this.widgets["toolbar.apiButton"].addListener("execute", function() {
        window.open("http://demo.qooxdoo.org/current/apiviewer/");
      }, this);
    },


    /**
     * TODOC
     *
     * @return {void} 
     */
    __openHelpDialog : function()
    {
      this.widgets["toolbar.helpButton"].addListener("execute", function() {
        window.open("http://qooxdoo.org/documentation/0.8");
      }, this);
    },


    /**
     * TODOC
     *
     * @return {void} 
     */
    __openLog : function()
    {
      this.widgets["toolbar.logCheckButton"].addListener("click", function(E)
      {
        var state = this.widgets["toolbar.logCheckButton"].getChecked();

        if (state == true) {
          this.stack.show();
        } else {
          this.stack.exclude();
        }
        
      },
      this);
    },


    /**
     * TODOC
     *
     * @return {void} 
     */
    __fetchLog : function()
    {
      var w = this.playarea.getContentElement().getDomElement();

      var logger;

      logger = qx.log.Logger;

      // Register to flush the log queue into the appender.
      logger.register(this.logappender);

      // Clear buffer
      logger.clear();

      // Unregister again, so that the logger can flush again the next time the tab is clicked.
      logger.unregister(this.logappender);
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    __makeLogView : function()
    {
      this.f2 = new qx.ui.embed.Html();
      this.f2.setOverflow("auto", "auto");
      this.f2.setFont("monospace");
      this.f2.setBackgroundColor("white");

      // Create appender and unregister from this logger
      this.logappender = new qx.log.appender.Element();
      qx.log.Logger.unregister(this.logappender);

      // Directly create DOM element to use
      var wrap = document.createElement("div");
      this.logelem = document.createElement("div");
      this.logelem.style.padding = "8px";
      this.logappender.setElement(this.logelem);
      wrap.appendChild(this.logelem);

      this.f2.getContentElement().useElement(wrap);

      return this.f2;
    },


    /**
     * creates the application header.
     *
     * @return {var} header of the application
     */
    __createHeader : function()
    {
      var layout = new qx.ui.layout.HBox();
      var header = new qx.ui.container.Composite(layout);
      header.setAppearance("app-header");

      var title = new qx.ui.basic.Label("qooxdoo Playground");
      var version = new qx.ui.basic.Label("qooxdoo " + qx.core.Setting.get("qx.version"));

      header.add(title);
      header.add(new qx.ui.core.Spacer, { flex : 1 });
      header.add(version);

      return header;
    },


    /**
     * creates the toolbar of the application
     *
     * @return {var} toolbar of the application
     */
    __makeToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar();

      var part1 = new qx.ui.toolbar.Part();
      toolbar.add(part1);

      var runButton = new qx.ui.toolbar.Button("Run", "playground/image/media-playback-start.png");
      part1.add(runButton);
      this.widgets["toolbar.runButton"] = runButton;
      runButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Runs the created application")));

      var resetButton = new qx.ui.toolbar.Button("Reset", "playground/image/edit-redo.png");
      part1.add(resetButton);
      this.widgets["toolbar.resetButton"] = resetButton;
      resetButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Resets the current application")));

      var selectSampleButton = new qx.ui.toolbar.MenuButton("Samples", "playground/image/document-folder.png");
      part1.add(selectSampleButton);
      this.widgets["toolbar.selectSampleButton"] = selectSampleButton;
      selectSampleButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Selects a demo application")));
      selectSampleButton.setMenu(this.__getFileMenu());

      toolbar.addSpacer();

      var part2 = new qx.ui.toolbar.Part();
      toolbar.add(part2);

      var logCheckButton = new qx.ui.toolbar.CheckBox("Log", "playground/image/utilities-log-viewer.png");
      part2.add(logCheckButton);
      this.widgets["toolbar.logCheckButton"] = logCheckButton;
      logCheckButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Shows the log entries")));

      var apiButton = new qx.ui.toolbar.Button("API Viewer", "playground/image/help-contents.png");
      part2.add(apiButton);
      this.widgets["toolbar.apiButton"] = apiButton;
      apiButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Opens the API Viewer")));

      var helpButton = new qx.ui.toolbar.Button("Help", "playground/image/help-about.png");
      part2.add(helpButton);
      this.widgets["toolbar.helpButton"] = helpButton;
      helpButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Opens the Help dialog")));

      return toolbar;
    }
  }
});