/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008-2009 1&1 Internet AG, Germany, http://www.1und1.de

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
    // UI Components
    __toolbar : null,
    __log : null,
    __editor : null, 
    
    // storage for all samples
    __samples : null,

    // the root of the playarea (inline)
    __playRoot : null,
    __playApp : null,

    __history : null,
    
    __currentStandalone: null,
    
    // flag used for the warning for IE
    __ignoreSaveFaults : false,

    __errorMsg: qx.locale.Manager.tr(
      "Unfortunately, an unrecoverable internal error was caused by your code." + 
      " This may prevent the playground application to run properly.||Please " + 
      "copy your code, restart the playground and paste your code.||"
    ),
    

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

      var self = this;

      // container layout
      var layout = new qx.ui.layout.VBox();

      // Main container
      var mainContainer = new qx.ui.container.Composite(layout);
      this.getRoot().add(mainContainer, { edge : 0 });

      // qooxdoo header
      mainContainer.add(new playground.view.Header(), { flex : 0 });

      // toolbar
      this.__samples = new playground.Samples();
      this.__toolbar = new playground.view.Toolbar(this.__samples.getNames());
      mainContainer.add(this.__toolbar, { flex : 0 });

      // tool listener
      this.__toolbar.addListener("run", this.run, this);
      this.__toolbar.addListener("changeSample", this.__onSampleChange, this);
      this.__toolbar.addListener("changeHighlight", this.__onHighlightChange, this);
      this.__toolbar.addListener("changeLog", this.__onLogChange, this);
      this.__toolbar.addListener("openApi", this.__onApiOpen, this);
      this.__toolbar.addListener("openManual", this.__onManualOpen, this);

      // mainsplit, contains the editor and the info splitpane
      var mainsplit = new qx.ui.splitpane.Pane("horizontal");
      this.mainsplit = mainsplit;

      mainContainer.add(mainsplit, { flex : 1 });

      var infosplit = new qx.ui.splitpane.Pane("vertical");
      infosplit.setDecorator(null);
      
      // need to split up the creation process
      this.__editor = new playground.view.Editor();
      this.__editor.init();
      this.__editor.addListener("disableHighlighting", function() {
        this.__toolbar.enableHighlighting(false);
      });
      
      mainsplit.add(this.__editor);
      mainsplit.add(infosplit, 1);
      infosplit.add(this.__createPlayArea(), 2);
      
      mainsplit.getChildControl("splitter").addListener("mousedown", function() {
        this.__editor.block();
      }, this);

      mainsplit.addListener("losecapture", function() {
        this.__editor.unblock();
      }, this);      

      this.__log = new playground.view.Log();

      // Adds the log console to the stack
      this.stack = new qx.ui.container.Stack();
      this.stack.setDecorator("main");
      this.stack.add(this.__log);

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
      playground.Application.__PLAYROOT = this.__playRoot;

      this.__playApp.getRoot = function() {
        return self.__playRoot;
      };

      this.__playRoot.addListener("resize", function(e)
      {
        var data = e.getData();
        self.dummy.setMinWidth(data.width);
        self.dummy.setMinHeight(data.height);
      });
    },

    finalize: function()
    {
      // Back button and bookmark support
      this.__initBookmarkSupport();      
    },

    
    // ***************************************************
    // TOOLBAR HANDLER
    // ***************************************************
    
    __onSampleChange : function(e) {
      var userCode = this.__editor.getCode();
      if (escape(userCode) != escape(this.__samples.getCurrent()).replace(/%0D/g, ""))
      {
        if (!confirm(this.tr("You changed the code of the current sample.|" + 
          "Click OK to discard your changes.").replace(/\|/g, "\n"))) 
        {
          return ;
        }
      }

      // set the new sample data
      var newSample = this.__samples.get(e.getData());
      this.__editor.setCode(newSample);
      // run the new sample
      this.run();
    },
    
    __onHighlightChange : function(e) {
      this.__editor.useHighlight(e.getData());
    },

    __onLogChange : function(e) {
      e.getData() ? this.stack.show() : this.stack.exclude();
    },
    
    __onApiOpen : function() {
      window.open(
        "http://demo.qooxdoo.org/" + 
        qx.core.Setting.get("qx.version") + 
        "/apiviewer/"
      );
    },
    
    __onManualOpen : function() {
      var arr = (qx.core.Setting.get("qx.version").split("-")[0]).split(".");
      window.open("http://qooxdoo.org/documentation/" + arr[0] + "." + arr[1]);
    },


    // ***************************************************
    // HISTORY SUPPORT
    // ***************************************************
    /**
     * Back button and bookmark support
     * @lint ignoreDeprecated(alert)
     */
    __initBookmarkSupport : function()
    {
      this.__history = qx.bom.History.getInstance();

      // Handle bookmarks
      var state = this.__history.getState();
      var name = state.replace(/_/g, " ");

      // checks if the state corresponds to a sample. If yes, the application
      // will be initialized with the selected sample
      if (state && this.__samples.isAvailable(name))
      {
        var sample = this.__samples.get(name);
        this.__editor.setCode(sample);
        this.updatePlayground(this.__playRoot);
        this.playAreaCaption.setValue(name);

      // if there is a state given
      } 
      else if (state != "")
      {
        var name = this.tr("Custom Code");
        
        try {
          var data = qx.util.Json.parse(state);
          var code = decodeURIComponent(data.code).replace(/%0D/g, "");
          this.__editor.setCode(code);
          this.run();
        } catch (e) {
          var name = this.tr("Unreadable Custom Code");
          var errorMessage = "Unable to read the URL parameter.";
          if (qx.bom.client.Engine.MSHTML) {
            errorMessage += this.tr(" Your browser has a length restriction of the " + 
                            "URL parameter which could have caused the problem.");
          }
          alert(errorMessage);
        }
      }
      else
      {
        var name = this.__samples.getNames()[0];
        this.__editor.setCode(this.__samples.get(name));
        this.run();
      }

      this.__history.addListener("request", this.__onHistoryChanged, this);

      qx.event.Timer.once(function() {
        this.__history.addToHistory(state,
            this.__updateTitle(name));
        this.playAreaCaption.setValue(name);
      }, this, 0);
    },


    __onHistoryChanged : function(e)
    {
      var state = e.getData();

      if (this.__samples.isAvailable(state))
      {
        this.__editor.setCode(this.__samples.get(state));

        this.updatePlayground(this.__playRoot);

        var newName = state;
        this.playAreaCaption.setValue(newName);

        // update state on sample change
        this.__history.addToHistory(state, this.__updateTitle(newName));
      } else if (state != "") {
        var data = qx.util.Json.parse(state);
        var code = decodeURIComponent(data.code).replace(/%0D/g, "");
        if (code != this.__editor.getCode()) {
          this.__editor.setCode(code);
          this.run();
        }
      }
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
     * Checks, whether the code is changed. If yes, the application name is
     * renamed
     *
     * @return {void}
     */
    __isSourceCodeChanged : function()
    {
      var compareElem1 = document.getElementById("compare_div1");
      compareElem1.innerHTML = this.__samples.getCurrent();

      var compareElem2 = document.getElementById("compare_div2");
      compareElem2.innerHTML = this.__editor.getCode();

      var label = this.__samples.getCurrentName();

      if ((compareElem1.innerHTML.length == compareElem2.innerHTML.length &&
          compareElem1.innerHTML != compareElem2.innerHTML) ||
          compareElem1.innerHTML.length != compareElem2.innerHTML.length)
      {
        this.playAreaCaption.setValue(this.tr("%1 (modified)", label));
        //top.location.hash = "#";
      }
      else {
        this.playAreaCaption.setValue(label);
        this.__history.addToHistory(this.__samples.getCurrentName(), this.__updateTitle(label));
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
      this.__log.clear();

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
      
      var layout = root.getLayout();
      root.setLayout(new qx.ui.layout.Canvas());
      layout.dispose();

      var reg = qx.Class.$$registry;
      delete reg[this.__currentStandalone];

      this.code = this.__editor.getCode();

      var title = this.__samples.getCurrentName();
      this.code = 'this.info("' + this.tr("Starting application").toString() +
        (title ? " '" + title + "'": "") +
        ' ...");\n' + 
        ((this.code + ";") || "") +
        'this.info("' + this.tr("Successfully started").toString() + '.");\n';

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
        alert(this.__errorMsg.replace(/\|/g, "\n") + exc);
      }

      for( var name in reg )
      {
        if(this.__isStandaloneApp(name))
        {
          this.__currentStandalone = name;
          this.__executeStandaloneApp(name);
          continue;
        }
      } 
      
      if (exc)
      {
        this.error(exc);
        this.__toolbar.showLog(true);
        this.stack.show();
      }

      this.__log.fetch();
    },

    
    /**
     * Determines whether the class (given by name) exists in the object 
     * registry and is a qooxdoo standalone application class
     *
     * @param name {String} Name of the class to examine
     * @return {Boolean} Whether it is a registered standalone application class
     */
    __isStandaloneApp : function(name)
    {
      if (name === "playground.Application") {
        return false;
      }
      var clazz = qx.Class.$$registry[name];
      return (
        clazz && clazz.superclass && 
        clazz.superclass.classname === "qx.application.Standalone"
      )      
    },


    /**
     * Execute the class (given by name) as a standalone app
     *
     * @param name {String} Name of the application class to execute
     * @return {void}
     */
    __executeStandaloneApp : function(name)
    {
      qx.application.Standalone.prototype._createRootWidget = function() {
        return playground.Application.__PLAYROOT; };

      var app = new qx.Class.$$registry[name];

      try
      {
        app.main();
        qx.ui.core.queue.Manager.flush();
      }
      catch(ex)
      {
        var exc = ex;
        alert(this.__errorMsg.replace(/\|/g, "\n") + exc);
      }
    },


    /**
     * @lint ignoreDeprecated(confirm)
     */
    run : function()
    {
      this.updatePlayground(this.__playRoot);

      if (this.__samples.getCurrent() != "") {
        this.__isSourceCodeChanged();
      }
      // get the currently set code
      var code = this.__editor.getCode();

      if (escape(code) != escape(this.__samples.getCurrent()).replace(/%0D/g, "")) {
        var codeJson = '{"code": ' + '"' + encodeURIComponent(code) + '"}';
        if (qx.bom.client.Engine.MSHTML && codeJson.length > 1300) {
          if (!this.__ignoreSaveFaults && confirm(this.tr("Could not save your code in the url because it is too much code. Do you want to ignore it?"))) {
            this.__ignoreSaveFaults = true;
          };
          return;
        }
        this.__history.addToHistory(codeJson);
      }
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this.__history = this.__playApp = null;
    this._disposeObjects("mainsplit", 
                         "container", 
                         "textarea", 
                         "playarea", 
                         "playAreaCaption",
                         "dummy",
                         "stack",
                         "__playRoot",
                         "__currentStandalone",
                         "editor");
  }
});