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
    __playApp : null,
    __labelDeco : null,
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
      this.__labelDeco = deco;

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

      var log = this.__makeLog();

      this.stack = new qx.ui.container.Stack;
      this.stack.setDecorator("main");
      this.stack.add(log);

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
      this.__clearSource();
      this.__openApiViewer();
      this.__openHelpDialog();
      this.__openLog();

      this.textarea.setValue(this.sampleContainer["Hello World"]);
      
      //this.textarea.setHtml(this.sampleContainer["Hello World"]);
      
      this.updatePlayground(this.__playRoot);
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

      var caption = new qx.ui.basic.Label(this.tr("Application")).set(
      {
        font       : "bold",
        decorator  : this.__labelDeco,
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
        decorator  : this.__labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.textarea = new qx.ui.form.TextArea;
      //this.textarea = new qx.ui.embed.Html('');


      this.textarea.set(
      {
        wrap      : false,
        font      : "monospace",
        decorator : null
      });
     
/*
      this.textarea.set(
      {
        backgroundColor : "white",
        overflowY       : "scroll",
        overflowX       : "auto",
        font            : "monospace",
        padding         : 5
      });
*/   
      
      container.add(this.textarea, { flex : 1 });
      
      
      this.textarea.addListenerOnce("appear", function() {      	
      	this.editor = this.__addCodeMirror(CodeMirror.replace(this.textarea.getContentElement().getDomElement()), {  
          content: this.textarea.getValue(),
          parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
          stylesheet: "css/jscolors.css",
          path: "js/",
          textWrapping: false,
          continuousScanning: false,
          width: "100%",
          height: "2000px",
          autoMatchParens: true,
          initCallback : function(){  }
        });

      	
      	
        //**********************************************************************
        //**********************************************************************
        // The protector disables the opportunity to edit the editor, therefore it
        // will removed
        // This code is a temporary solution, it will removed, if another solution is found
        var protector = this.textarea.__protectorElement; 
        protector.getDomElement().parentNode.removeChild(protector.getDomElement());
        //**********************************************************************
        //**********************************************************************
        
      }, this);
      
      
      
      
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
      
      //this.code = this.textarea.getHtml();
      
      if(this.editor != undefined){
      this.code = this.editor.getCode();
      } else {
      	this.code = this.textarea.getValue();
      }
      
      try
      {
        this.fun = new Function(this.code);
        this.fun.call(this.__playApp);
      }
      catch(ex)
      {
        this.error(ex);
        this.widgets["toolbar.logCheckButton"].setChecked(true);
        this.stack.show();
      }
      this.logelem.innerHTML = "";
      this.__fetchLog();
    },


    /**
     * TODOC
     *
     * @return {void} 
     */
    __clearSource : function()
    {
      this.widgets["toolbar.clearButton"].addListener("execute", function()
      {
        //this.textarea.setValue("");
        //this.textarea.setHtml("");
        this.editor.setCode("")
        //this.textarea.focus();
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

      var elem = document.getElementsByTagName("TEXTAREA");
      
      for (var i=0; i<elem.length; i++)
      {
        if (elem[i].className == "qx_samples")
        {
          this.sampleContainer[elem[i].title] = elem[i].value;//elem[i].innerHTML;
          newButton = new qx.ui.menu.Button(elem[i].title, "icon/16/actions/document-new.png");
          menu.add(newButton);

          newButton.addListener("execute", this.__onSampleChanged, this);
        }
      }

      return menu;
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    __onSampleChanged : function(e)
    {
      var item = e.getTarget();

      var currentSelectedButton = item.getLabel().toString();
      var currentSource = this.sampleContainer[currentSelectedButton];
      currentSource = currentSource.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

      this.textarea.setValue(currentSource);
      this.editor.setCode(currentSource)
      //this.textarea.setHtml(currentSource);
      this.updatePlayground(this.__playRoot);
    },


    /**
     * TODOC
     *
     * @return {void} 
     */
    __openApiViewer : function()
    {
      this.widgets["toolbar.apiButton"].addListener("execute", function() {
        window.open("http://demo.qooxdoo.org/" + qx.core.Setting.get("qx.version") + "/apiviewer/");
      }, this);
    },


    /**
     * TODOC
     *
     * @return {void} 
     */
    __openHelpDialog : function()
    {
      this.widgets["toolbar.helpButton"].addListener("execute", function()
      {
        var arr = (qx.core.Setting.get("qx.version").split("-")[0]).split(".");
        window.open("http://qooxdoo.org/documentation/" + arr[0] + "." + arr[1]);
      },
      this);
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
    __makeLog : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({});

      var caption = new qx.ui.basic.Label(this.tr("Log")).set(
      {
        font       : "bold",
        decorator  : this.__labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(caption);

      this.logArea = new qx.ui.embed.Html('');

      this.logArea.set(
      {
        backgroundColor : "white",
        overflowY       : "scroll",
        overflowX       : "auto",
        font            : "monospace",
        padding         : 5
      });

      container.add(this.logArea, { flex : 1 });

      // log appender
      this.logappender = new qx.log.appender.Element();

      qx.log.Logger.unregister(this.logappender);

      // Directly create DOM element to use
      this.logelem = document.createElement("DIV");
      this.logappender.setElement(this.logelem);

      this.logArea.addListenerOnce("appear", function() {
        this.logArea.getContentElement().getDomElement().appendChild(this.logelem);
      }, this);

      return container;
    },
    
    
    __addCodeMirror : function (place, options) {
      this.home = document.createElement("DIV");
      if (place.appendChild)
        place.appendChild(this.home);
      else
        place(this.home);
    
      this.mirror = new CodeMirror(this.home, options);
    
      
      return this.mirror;
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

      var title = new qx.ui.basic.Label("Playground");
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

      var clearButton = new qx.ui.toolbar.Button("Reset", "playground/image/edit-delete.png");
      part1.add(clearButton);
      this.widgets["toolbar.clearButton"] = clearButton;
      clearButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Deletes the source of the current application")));

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