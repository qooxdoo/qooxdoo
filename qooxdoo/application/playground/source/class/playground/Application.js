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
    // widget container for the buttons etc.
    widgets : {},

    // the root of the playarea (inline)
    __playRoot : null,
    __playApp : null,

    // global decoration
    __labelDeco : null,

    // Container for the sample codes
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

      this.__makeCommands();

      // qooxdoo header
      mainContainer.add(this.__createHeader(), { flex : 0 });

      // qooxdoo toolbar
      mainContainer.add(this.__makeToolbar(), { flex : 0 });

      // qooxdoo mainsplit, contains the textarea and the infosplitpane
      var mainsplit = new qx.ui.splitpane.Pane("horizontal");

      this.mainsplit = mainsplit;

      var infosplit = new qx.ui.splitpane.Pane("vertical");
      infosplit.setDecorator(null);

      mainContainer.add(mainsplit, { flex : 1 });

      mainsplit.add(this.__makeTextArea());
      mainsplit.add(infosplit, 1);
      infosplit.add(this.__makePlayArea(), 2);

      var log = this.__makeLog();

      // adds the log into the stack
      // therewith it is possible to show or hide the log pane
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

      // Adds the event listener to the buttons
      this.__runApplication(this.__playRoot);
      this.__openApiViewer();
      this.__openHelpDialog();
      this.__openLog();

      // Back button and bookmark support
      this._history = qx.bom.History.getInstance();

      this._history.addListener("request", function(e)
      {
        var newSample = e.getData();

        if (this.sampleContainer[state] != undefined)
        {
          this.textarea.setValue(this.sampleContainer[newSample]);

          if (this.editor != undefined) {
            this.editor.setCode(this.sampleContainer[newSample]);
          }

          this.updatePlayground(this.__playRoot);

          // update state on example change
          this._history.addToHistory(newSample, newSample);
        }
      },
      this);

      // initializing value of the textarea
      var state = this._history.getState();

      // checks for the state, if the state contains an example, it will initialize
      // the application with the selected sample
      if (this.sampleContainer[state] != undefined)
      {
        if (this.editor == undefined) {
          this.textarea.setValue(this.sampleContainer[state !== null ? state : "Hello World"]);
        } else {
          this.editor.setCode(this.sampleContainer[state !== null ? state : "Hello World"]);
        }
      }
      else
      {
        if (this.editor == undefined) {
          this.textarea.setValue(this.sampleContainer["Hello World"]);
        } else {
          this.editor.setCode(this.sampleContainer["Hello World"]);
        }
      }

      this.updatePlayground(this.__playRoot);
    },


    /**
     * creates an area to show the samples.
     *
     * @return {var} container of the play area
     */
    __makePlayArea : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      this.playAreaCaption = new qx.ui.basic.Label(this.tr("Hello World")).set(
      {
        font       : "bold",
        decorator  : this.__labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });

      container.add(this.playAreaCaption);

      this.playarea = new qx.ui.container.Scroll();

      this.dummy = new qx.ui.core.Widget;
      this.playarea.add(this.dummy);

      container.add(this.playarea, { flex : 1 });

      return container;
    },


    /**
     * creates a textarea to write your own code.
     *
     * @return {var} container of the textarea
     */
    __makeTextArea : function()
    {
      var container = new playground.EditorContainer();  
      this.container
      
      this.container = container;

      var caption = new qx.ui.basic.Label(this.tr("Source Code")).set(
      {
        font       : "bold",
        decorator  : this.__labelDeco,
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });


      container.add(caption);

      // The textarea to write your own source
      this.textarea = new qx.ui.form.TextArea;

      this.textarea.set(
      {
        wrap      : false,
        font      : "monospace",
        decorator : null
      });

      container.add(this.textarea, { flex : 1 });
      
      // this code part uses the Codemirror library to add syntax highlighting
      // to the current textarea
      this.textarea.addListenerOnce("appear", function()
      {
        var height = this.textarea.getBounds().height;
        var width = this.textarea.getBounds().width;

        this.textarea.getContentElement().getDomElement().style.display = "none";

        this.editor = new CodeMirror(this.textarea.getContainerElement().getDomElement(),
        {
          content            : this.textarea.getValue(),
          parserfile         : [ "tokenizejavascript.js", "parsejavascript.js" ],
          stylesheet         : "css/jscolors.css",
          path               : "js/",
          textWrapping       : false,
          continuousScanning : false,
          width              : width + "px",
          height             : height + "px",
          autoMatchParens    : true
        });

        var splitter = this.mainsplit._getChildControl("splitter");
        var pane = this.mainsplit;

        splitter.addListener("mousedown", function() {
          this.container.block();
        }, this);

        pane.addListener("losecapture", function() {
          this.container.unblock();
        }, this);

        this.editor.frame.style.width = this.textarea.getBounds().width + "px";
        this.editor.frame.style.height = this.textarea.getBounds().height + "px";

        // to achieve auto-resize, the editor sets the size of the container element
        this.textarea.addListener("resize", function()
        {
          this.editor.frame.style.width = this.textarea.getBounds().width + "px";
          this.editor.frame.style.height = this.textarea.getBounds().height + "px";
        },
        this);

        // ******************************************************************************
        // ******************************************************************************
        // The protector disables the opportunity to edit the editor, therefore it
        // will removed
        // This code fragment is a temporary solution, it will removed, if another solution is found
        var protector = this.textarea.getContainerElement().getChildren()[1];

        if (protector) {
          protector.getDomElement().parentNode.removeChild(protector.getDomElement());
        }
      },

      // ******************************************************************************
      // ******************************************************************************
      this);

      return container;
    },


    /**
     * adds shortcuts to the respective buttons.
     *
     * @return {void} 
     */
    __makeCommands : function()
    {
      this._runSample = new qx.event.Command("Control+Y");

      this._runSample.addListener("execute", function() {
        this.updatePlayground(this.__playRoot);
      }, this);
    },


    /**
     * checks, wheter the code is changed.
     * If the code changed, it will rename the application name
     * to "Application"
     *
     * @return {void} 
     */
    __isSourceCodeChanged : function()
    {
      if (this.currentSelectedButton == undefined) {
        this.currentSelectedButton = "Hello World";
      }

      var compareElem1 = document.getElementById("compare_div1");
      compareElem1.innerHTML = this.sampleContainer[this.currentSelectedButton];

      var compareElem2 = document.getElementById("compare_div2");
      compareElem2.innerHTML = this.editor.getCode();

      if (compareElem1.innerHTML.length == compareElem2.innerHTML.length)
      {
        if (compareElem1.innerHTML != compareElem2.innerHTML) {
          this.playAreaCaption.setContent("Application");
        } else {
          this.playAreaCaption.setContent(this.currentSelectedButton);
        }
      }
      else if (compareElem1.innerHTML.length != compareElem2.innerHTML.length)
      {
        this.playAreaCaption.setContent("Application");
      }
    },


    /**
     * runs the written source.
     *
     * @param root {var} the root of the play area
     * @return {void} 
     */
    __runApplication : function(root)
    {
      this.widgets["toolbar.runButton"].addListener("execute", function()
      {
        this.updatePlayground(root);

        if (this.editor != undefined) {
          this.__isSourceCodeChanged();
        }
      },
      this);
    },


    /**
     * updates the playground.
     *
     * @param root {var} of the playarea
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

      if (this.editor != undefined) {
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

      //this.logelem.innerHTML = "";
      this.__fetchLog();
    },


    /**
     * generates a file menu to select the samples.
     *
     * @return {var} menu of the samples
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
          this.sampleContainer[elem[i].title] = elem[i].value;
          newButton = new qx.ui.menu.Button(elem[i].title, "icon/16/actions/document-new.png");
          menu.add(newButton);

          newButton.addListener("execute", this.__onSampleChanged, this);
        }
      }

      return menu;
    },


    /**
     * initializes the playground with a sample.
     *
     * @param e {Event} the current target
     * @return {void} 
     */
    __onSampleChanged : function(e)
    {
      var item = e.getTarget();

      this.currentSelectedButton = item.getLabel().toString();
      var currentSource = this.sampleContainer[this.currentSelectedButton];
      currentSource = currentSource.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

      if (this.editor != undefined) {
        this.editor.setCode(currentSource);
      } else {
        this.textarea.setValue(currentSource);
      }

      this.playAreaCaption.setContent(this.currentSelectedButton);

      this.updatePlayground(this.__playRoot);
    },


    /**
     * opens the current qooxdoo api viewer.
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
     * opens the current qooxdoo documentation.
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
     * shows the log entries.
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
     * fetchs the log entries.
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
     * creates the log pane.
     *
     * @return {var} container contains the log pane
     */
    __makeLog : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({});

      // caption of the log pane
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

      // title of the header
      var title = new qx.ui.basic.Label("Playground");

      // qooxdoo version
      var version = new qx.ui.basic.Label("qooxdoo " + qx.core.Setting.get("qx.version"));

      header.add(title);
      header.add(new qx.ui.core.Spacer, { flex : 1 });
      header.add(version);

      return header;
    },


    /**
     * creates the toolbar of the application.
     *
     * @return {var} toolbar of the application
     */
    __makeToolbar : function()
    {
      // toolbar of the playground
      var toolbar = new qx.ui.toolbar.ToolBar();

      var part1 = new qx.ui.toolbar.Part();
      toolbar.add(part1);

      // run button
      var runButton = new qx.ui.toolbar.Button("Run", "playground/image/media-playback-start.png");
      part1.add(runButton);
      this.widgets["toolbar.runButton"] = runButton;
      this.widgets["toolbar.runButton"].setCommand(this._runSample);
      runButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Runs the created application [Shift+R]")));

      // select sample button
      var selectSampleButton = new qx.ui.toolbar.MenuButton("Samples", "playground/image/document-folder.png");
      part1.add(selectSampleButton);
      this.widgets["toolbar.selectSampleButton"] = selectSampleButton;
      selectSampleButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Selects a demo application")));
      selectSampleButton.setMenu(this.__getFileMenu());

      toolbar.addSpacer();

      var part2 = new qx.ui.toolbar.Part();
      toolbar.add(part2);

      // log Check button
      var logCheckButton = new qx.ui.toolbar.CheckBox("Log", "playground/image/utilities-log-viewer.png");
      part2.add(logCheckButton);
      this.widgets["toolbar.logCheckButton"] = logCheckButton;
      logCheckButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Shows the log entries")));

      // api button
      var apiButton = new qx.ui.toolbar.Button("API Viewer", "playground/image/help-contents.png");
      part2.add(apiButton);
      this.widgets["toolbar.apiButton"] = apiButton;
      apiButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Opens the API Viewer")));

      // help button
      var helpButton = new qx.ui.toolbar.Button("Help", "playground/image/help-about.png");
      part2.add(helpButton);
      this.widgets["toolbar.helpButton"] = helpButton;
      helpButton.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Opens the Help dialog")));

      return toolbar;
    }
  }
});