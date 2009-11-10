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
     * Jonathan Weiß (jonathan_rass)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/*)
#asset(playground/*)
#ignore(CodeMirror)

************************************************************************ */

/**
 * Playground application, which allows for source code editing and live
 * previews of a simple custom application
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
    __widgets : null,

    // the root of the playarea (inline)
    __playRoot : null,
    __playApp : null,

    // global decoration
    __labelDeco : null,

    // Container for the sample codes
    __sampleContainer : null,

    __runSample : null,

    __history : null,
    
    // flag used for the warning for IE
    __ignoreSaveFaults : false,


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

      this.__widgets = {};
      this.__sampleContainer = {};

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

      //this.__createCommands();

      // qooxdoo header
      mainContainer.add(this.__createHeader(), { flex : 0 });

      // qooxdoo toolbar
      mainContainer.add(this.__createToolbar(), { flex : 0 });

      // qooxdoo mainsplit, contains the editor and the info splitpane
      var mainsplit = new qx.ui.splitpane.Pane("horizontal");
      this.mainsplit = mainsplit;

      mainContainer.add(mainsplit, { flex : 1 });

      var infosplit = new qx.ui.splitpane.Pane("vertical");
      infosplit.setDecorator(null);

      mainsplit.add(this.__createTextArea());
      mainsplit.add(infosplit, 1);
      infosplit.add(this.__createPlayArea(), 2);

      var log = this.__createLog();

      // Adds the log console to the stack
      this.stack = new qx.ui.container.Stack;
      this.stack.setDecorator("main");
      this.stack.add(log);

      infosplit.add(this.stack, 1);
      this.stack.exclude();

      qx.html.Element.flush();
      var playRootEl = this.dummy.getContainerElement().getDomElement();
      this.__playRoot = new qx.ui.root.Inline(playRootEl);
      this.__playRoot._setLayout(new qx.ui.layout.Canvas());

      this.__playRoot.getLayoutParent = function() { return self.playarea; };
      this.playarea.getChildren = this.playarea._getChildren =
        function() { return [self.__playRoot]; };

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
      this.__attachRunApplication(this.__playRoot);
      this.__attachOpenApiViewer();
      this.__attachOpenManual();
      this.__attachOpenLog();

      // Back button and bookmark support
      this.__initBookmarkSupport();
    },

    /**
     * Back button and bookmark support
     * @lint ignoreDeprecated(alert)
     */
    __initBookmarkSupport : function()
    {
      this.__history = qx.bom.History.getInstance();

      // Handle bookmarks
      var state = this.__history.getState();

      // checks if the state corresponds to a sample. If yes, the application
      // will be initialized with the selected sample
      if (state && this.__sampleContainer[state] != undefined) {
        this.textarea.setValue(this.__sampleContainer[state]);
        if (this.editor != undefined) {
          this.editor.setCode(this.__sampleContainer[state]);
        }
        this.currentSample = state;
        this.updatePlayground(this.__playRoot);
        var title = state;
        this.playAreaCaption.setValue(this.__decodeSampleId(title));

      // if there is a state given
      } else if (state != "") {
        var title = this.tr("Custom Code");
        this.currentSample = "";
        
        try {
          var data = qx.util.Json.parse(state);
          var code = decodeURIComponent(data.code);
          this.textarea.setValue(code);
        } catch (e) {
          title = this.tr("Unreadable Custom Code");
          var errorMessage = "Unable to read the URL parameter.";
          if (qx.bom.client.Engine.MSHTML) {
            errorMessage += this.tr(" Your browser has a length restriction of the " + 
                            "URL parameter which could have caused the problem.");
          }
          alert(errorMessage);
        }
        this.__widgets["toolbar.runButton"].execute();        

      } else {
        state = qx.lang.Object.getKeys(this.__sampleContainer)[0];
        this.currentSample = state;
        this.textarea.setValue(this.__sampleContainer[state]);
        var title = state;
      }

      this.__history.addListener("request", function(e)
      {
        var state = e.getData();

        if (this.__sampleContainer[state] != undefined)
        {
          this.editor.setCode(this.__sampleContainer[state]);

          this.updatePlayground(this.__playRoot);

          var newName = this.__decodeSampleId(state);
          this.playAreaCaption.setValue(newName);

          // update state on sample change
          this.__history.addToHistory(state, this.__updateTitle(newName));
        } else {
          var data = qx.util.Json.parse(state);
          var code = decodeURIComponent(data.code);
          if (this.showSyntaxHighlighting) {
            if (code != this.editor.getCode()) {
              this.editor.setCode(code);
              this.__widgets["toolbar.runButton"].execute();              
            }
          } else {
            if (code != this.textarea.getValue()) {
              this.textarea.setValue(code);
              this.__widgets["toolbar.runButton"].execute();              
            }
          }
        }
      }, this);

      qx.event.Timer.once(function() {
        this.__history.addToHistory(state,
            this.__updateTitle(this.__decodeSampleId(title)));
        this.playAreaCaption.setValue(this.__decodeSampleId(title));
      }, this, 0);
    },

    /**
     * Transform sample label into sample id
     * @param label {String} label
     * @return
     */
    __encodeSampleId : function(label) {
      return label.replace(/\s+/g, "_");
    },

    /**
    * Transform sample id into sample label
    * @param id {String} id
    * @return
    */
    __decodeSampleId : function(id) {
      return id.replace(/_/g, " ");
    },

    /**
     * Update the window title with given sample label
     * @param label {String} sample label
     * @return {String} new window title
     */
    __updateTitle : function(label) {
      var title = document.title.split(":")[0] + ": " + label;
      return title;
    },

    /**
     * Creates an area to show the samples.
     *
     * @return {var} container of the play area
     */
    __createPlayArea : function()
    {
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      var container = new qx.ui.container.Composite(layout).set({ decorator : "main" });

      this.playAreaCaption = new qx.ui.basic.Label().set(
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
     * Creates an editor for the source code
     *
     * @return {var} container of the editor
     *
     * @lint ignoreUndefined(CodeMirror)
     */
    __createTextArea : function()
    {
      var container = new playground.EditorContainer();
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

      this.textarea = new qx.ui.form.TextArea().set(
      {
        wrap      : false,
        font      : qx.bom.Font.fromString("14px monospace"),
        decorator : null,
        padding   : [0,0,0,5]
      });

      container.add(this.textarea, { flex : 1 });
      qx.html.Element.flush();

      if (CodeMirror != undefined)
      {
        this.showSyntaxHighlighting = true;

        // this code part uses the CodeMirror library to add a
        // syntax-highlighting editor as an textarea replacement
        this.textarea.addListenerOnce("appear", function()
        {
          var height = this.textarea.getBounds().height;
          var width = this.textarea.getBounds().width;

          this.textarea.getContentElement().getDomElement().style.visibility = "hidden";

          this.editor = new CodeMirror(this.textarea.getContainerElement().getDomElement(),
          {
            content            : this.textarea.getValue(),
            parserfile         : [ "tokenizejavascript.js", "parsejavascript.js" ],
            stylesheet         : "resource/playground/css/jscolors.css",
            path               : "resource/playground/js/",
            textWrapping       : false,
            continuousScanning : false,
            width              : width + "px",
            height             : height + "px",
            autoMatchParens    : true
          });

          var splitter = this.mainsplit.getChildControl("splitter");
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

          // The protector blocks the editor, therefore it needs to be removed.
          // This code fragment is a temporary solution, it will be removed once
          // a better solution is found
          var protector = this.textarea.getContainerElement().getChildren()[1];
          if (protector) {
            protector.getDomElement().parentNode.removeChild(protector.getDomElement());
          }

        }, this);
      }
      else
      {
        this.showSyntaxHighlighting = false;
        this.__widgets["toolbar.toggleButton"].setEnabled(false);

        this.editor = {};
        var self = this;
        this.editor.setCode = function(code) { self.textarea.setValue.call(self.textarea, code); };
        this.editor.getCode = function() { return self.textarea.getValue.call(self.textarea); };
      }

      return container;
    },


    /**
     * adds shortcuts to the respective buttons.
     *
     * @return {void}
     */
    __createCommands : function()
    {
      this.__runSample = new qx.ui.core.Command("Control+Y");

      this.__runSample.addListener("execute", function() {
        this.updatePlayground(this.__playRoot);
      }, this);
    },


    /**
     * Checks, whether the code is changed. If yes, the application name is
     * renamed
     *
     * @return {void}
     */
    __isSourceCodeChanged : function()
    {
      var compareElem1 = document.getElementById("compare_div1");
      compareElem1.innerHTML = this.__sampleContainer[this.currentSample];

      var compareElem2 = document.getElementById("compare_div2");
      compareElem2.innerHTML = this.editor.getCode();

      var label = this.__decodeSampleId(this.currentSample);

      if ((compareElem1.innerHTML.length == compareElem2.innerHTML.length &&
          compareElem1.innerHTML != compareElem2.innerHTML) ||
          compareElem1.innerHTML.length != compareElem2.innerHTML.length)
      {
        this.playAreaCaption.setValue(this.tr("%1 (modified)", label));
        //top.location.hash = "#";
      }
      else {
        this.playAreaCaption.setValue(label);
        this.__history.addToHistory(this.currentSample, this.__updateTitle(label));
      }
    },

    /**
     * Updates the playground.
     *
     * @param root {var} of the playarea
     * @return {void}
     *
     * @lint ignoreDeprecated(alert)
     */
    updatePlayground : function(root)
    {
      if(this.logelem) {
        this.logelem.innerHTML = "";
      }

      // This currently only destroys the children of the application root.
      // While this is ok for many simple scenarios, it cannot account for
      // application code that generates temporary objects without adding them
      // to the application (as widgets for instance). There is no real
      // solution for such a multi-application scenario that is playground
      // specific.
      var ch = root.getChildren();
      var i = ch.length;
      while(i--)
      {
        if (ch[i]) {
          ch[i].destroy();
        }
      }

      if (this.showSyntaxHighlighting && this.editor) {
          this.code = this.editor.getCode() || this.textarea.getValue();
      } else {
        this.code = this.textarea.getValue();
      }

      var title = this.__decodeSampleId(this.currentSample);
      this.code = 'this.info("' + this.tr("Starting application") +
        (title ? " '" + title + "'": "") +
        ' ...");\n' + (this.code || "") +
        'this.info("' + this.tr("Successfully started") + '.");\n';

      try
      {
        this.fun = new Function(this.code);
      }
      catch(ex)
      {
        var exc = ex;
      }

      try
      {
        this.fun.call(this.__playApp);
        qx.ui.core.queue.Manager.flush();
      }
      catch(ex)
      {
        var exc = ex;
        alert(
          this.tr("Unfortunately, an unrecoverable internal error was caused by your code. This may prevent the playground application to run properly.||Please copy your code, restart the playground and paste your code.||").replace(/\|/g, "\n") +
          exc
        );
      }


      if (exc)
      {
        this.error(exc);
        this.__widgets["toolbar.logCheckButton"].setValue(true);
        this.stack.show();
      }

      this.__fetchLog();
    },


    /**
     * Generates a menu to select the samples.
     *
     * @return {var} menu of the samples
     */
    __createSampleMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var newButton;

      var elem = document.getElementsByTagName("TEXTAREA");
      var id;

      for (var i=0; i<elem.length; i++)
      {
        if (elem[i].className == "qx_samples")
        {
          var id = this.__encodeSampleId(elem[i].title);
          this.__sampleContainer[id] = elem[i].value;
          newButton = new qx.ui.menu.Button(elem[i].title, "icon/16/mimetypes/office-document.png");
          menu.add(newButton);

          newButton.addListener("execute", this.__onSampleChanged, this);
        }
      }

      return menu;
    },


    /**
     * Initializes the playground with a sample.
     *
     * @lint ignoreDeprecated(confirm)
     *
     * @param e {Event} the current target
     * @return {void}
     */
    __onSampleChanged : function(e)
    {
      var userCode = this.showSyntaxHighlighting ?
                     this.editor.getCode() :
                     this.textarea.getValue();

      if (escape(userCode) != escape(this.__sampleContainer[this.currentSample]).replace(/%0D/g, ""))
      {
        if (!confirm(this.tr("You changed the code of the current sample.|Click OK to discard your changes.").replace(/\|/g, "\n"))) {
          return ;
        }
      }

      var label = e.getTarget().getLabel().toString();
      this.playAreaCaption.setValue(label);

      this.currentSample = this.__encodeSampleId(label);
      var currentSource = this.__sampleContainer[this.currentSample];
      currentSource = currentSource.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

      if (this.showSyntaxHighlighting) {
        this.editor.setCode(currentSource);
      } else {
        this.textarea.setValue(currentSource);
      }

      this.__history.addToHistory(this.currentSample, this.__updateTitle(label));
    },


    /**
     * Attach listener to run the current source code
     *
     * @lint ignoreDeprecated(confirm)
     * @param root {var} the root of the play area
     * @return {void}
     */
    __attachRunApplication : function(root)
    {
      this.__widgets["toolbar.runButton"].addListener("execute", function()
      {
        this.updatePlayground(root);

        if (this.currentSample != "" && this.editor != undefined) {
          this.__isSourceCodeChanged();
        }
        // get the currently set code
        if (this.showSyntaxHighlighting) {
          var code = this.editor.getCode();
        } else {
          var code = this.textarea.getValue();
        }

        if (escape(code) != escape(this.__sampleContainer[this.currentSample]).replace(/%0D/g, "")) {
          var codeJson = '{"code": ' + '"' + encodeURIComponent(code) + '"}';
          if (qx.bom.client.Engine.MSHTML && codeJson.length > 1300) {
            if (!this.__ignoreSaveFaults && confirm(this.tr("Could not save your code in the url because it is too much code. Do you want to ignore it?"))) {
              this.__ignoreSaveFaults = true;
            };
            return;
          }
          this.__history.addToHistory(codeJson);
        }
      },
      this);
    },


    /**
     * Opens the qooxdoo api viewer.
     *
     * @return {void}
     */
    __attachOpenApiViewer : function()
    {
      this.__widgets["toolbar.apiButton"].addListener("execute", function() {
        window.open("http://demo.qooxdoo.org/" + qx.core.Setting.get("qx.version") + "/apiviewer/");
      }, this);
    },


    /**
     * Opens the qooxdoo user manual.
     *
     * @return {void}
     */
    __attachOpenManual : function()
    {
      this.__widgets["toolbar.helpButton"].addListener("execute", function()
      {
        var arr = (qx.core.Setting.get("qx.version").split("-")[0]).split(".");
        window.open("http://qooxdoo.org/documentation/" + arr[0] + "." + arr[1]);
      },
      this);
    },


    /**
    * Shows the log entries.
    *
    * @return {void}
    */
   __attachOpenLog : function()
   {
     this.__widgets["toolbar.logCheckButton"].addListener("click", function()
     {
       var logState = this.__widgets["toolbar.logCheckButton"].getValue();

       if (logState == true) {
         this.stack.show();
       } else {
         this.stack.exclude();
       }
     },
     this);
   },


   /**
    * Toggle editor
    *
    * @return {void}
    */
   __toggleEditor : function(e)
   {
      if (!this.editor) {
        return;
      }

      if (e.getData())
      {
        this.editor.setCode(this.textarea.getValue());
        this.editor.frame.style.visibility = "visible";
        this.textarea.getContentElement().getDomElement().style.visibility = "hidden";

        this.showSyntaxHighlighting = true;
      }
      else
      {
        this.textarea.setValue(this.editor.getCode());
        this.textarea.getContentElement().getDomElement().style.visibility = "visible";
        this.editor.frame.style.visibility = "hidden";

        this.showSyntaxHighlighting = false;
      }
   },


    /**
     * Fetches the log entries.
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
     * Creates the log pane.
     *
     * @return {var} container contains the log pane
     */
    __createLog : function()
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
     * Creates the application header.
     *
     * @return {var} header of the application
     */
    __createHeader : function()
    {
      var layout = new qx.ui.layout.HBox();
      var header = new qx.ui.container.Composite(layout);
      header.setAppearance("app-header");

      // title of the header
      var title = new qx.ui.basic.Label(this.tr("Playground"));

      // qooxdoo version
      var version = new qx.ui.basic.Label(this.tr("qooxdoo %1", qx.core.Setting.get("qx.version")));

      header.add(title);
      header.add(new qx.ui.core.Spacer, { flex : 1 });
      header.add(version);

      return header;
    },


    /**
     * Creates the toolbar of the application.
     *
     * @return {var} toolbar of the application
     */
    __createToolbar : function()
    {
      // toolbar of the playground
      var toolbar = new qx.ui.toolbar.ToolBar();

      var part1 = new qx.ui.toolbar.Part();
      toolbar.add(part1);

      // run button
      var runButton = new qx.ui.toolbar.Button(this.tr("Run"), "playground/image/media-playback-start.png");
      part1.add(runButton);
      this.__widgets["toolbar.runButton"] = runButton;
      //this.__widgets["toolbar.runButton"].setCommand(this.__runSample);
      runButton.setToolTipText(this.tr("Run the source code"));

      // select sample button
      var selectSampleButton = new qx.ui.toolbar.MenuButton(this.tr("Samples"), "playground/image/document-folder.png");
      part1.add(selectSampleButton);
      this.__widgets["toolbar.selectSampleButton"] = selectSampleButton;
      selectSampleButton.setToolTipText(this.tr("Select a sample"));
      selectSampleButton.setMenu(this.__createSampleMenu());

      var toggleButton = new qx.ui.form.ToggleButton(this.tr("Syntax Highlighting"), "icon/16/actions/check-spelling.png");
      part1.add(toggleButton);
      toggleButton.setAppearance("toolbar-button");
      this.__widgets["toolbar.toggleButton"] = toggleButton;

      toggleButton.addListener("changeValue", function(e)
      {
        this.__toggleEditor(e);
      }, this);
      toggleButton.setValue(true);

      toolbar.addSpacer();

      var part2 = new qx.ui.toolbar.Part();
      toolbar.add(part2);

      // log Check button
      var logCheckButton = new qx.ui.toolbar.CheckBox(this.tr("Log"), "playground/image/utilities-log-viewer.png");
      part2.add(logCheckButton);
      this.__widgets["toolbar.logCheckButton"] = logCheckButton;
      logCheckButton.setToolTipText(this.tr("Show log output"));

      // api button
      var apiButton = new qx.ui.toolbar.Button(this.tr("API Viewer"), "playground/image/help-contents.png");
      part2.add(apiButton);
      this.__widgets["toolbar.apiButton"] = apiButton;
      apiButton.setToolTipText(this.tr("Open the qooxdoo API Viewer"));

      // help button
      var helpButton = new qx.ui.toolbar.Button(this.tr("Manual"), "playground/image/help-about.png");
      part2.add(helpButton);
      this.__widgets["toolbar.helpButton"] = helpButton;
      helpButton.setToolTipText(this.tr("Open the qooxdoo Manual"));

      return toolbar;
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeMap("__widgets");
    this._disposeMap("__sampleContainer");
    this._disposeFields("__labelDeco", "logelem", "__history", "__playApp");
    this._disposeObjects("mainsplit", 
                         "container", 
                         "textarea", 
                         "playarea", 
                         "playAreaCaption",
                         "dummy",
                         "logArea",
                         "logappender",
                         "stack",
                         "__playRoot",
                         "editor");
  }
});