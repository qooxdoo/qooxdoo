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
      STATICS
   *****************************************************************************
  */
  statics :
  {
    /**
     * Global handler for the url shortening JSONP call.
     *
     * @param data {Object} The data from the JSONP call.
     * 
     * @lint ignoreDeprecated(alert)
     * @lint ignoreDeprecated(prompt)
     */
    handleShortendURl : function(data)
    {
      if (data.results) {
        var shorturl = data.results[qx.lang.Object.getKeys(data.results)[0]].shortUrl;
        prompt("URL", shorturl);
      } else {
        alert(data.errorMessage);
      }
    }
  },


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
    __playArea : null,
    
    // storages
    __samples : null,

    // API-Key for bit.ly
    __bitlyKey: "R_84ed30925212f47f60d700fdfc225e33",

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
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // container layout
      var layout = new qx.ui.layout.VBox();

      // main container
      var mainContainer = new qx.ui.container.Composite(layout);
      this.getRoot().add(mainContainer, { edge : 0 });

      // qooxdoo header
      mainContainer.add(new playground.view.Header(), { flex : 0 });

      // data stuff
      this.__samples = new playground.Samples();
      var initUserName = qx.bom.Cookie.get("playgroundUser");
      if (initUserName) {
        this.__loadGistsForUser(initUserName);
      }
      
      // toolbar
      this.__toolbar = new playground.view.Toolbar(this.__samples.getNames());
      mainContainer.add(this.__toolbar, { flex : 0 });

      // tool listener
      this.__toolbar.addListener("run", this.run, this);
      this.__toolbar.addListener("changeSample", this.__onSampleChange, this);
      this.__toolbar.addListener("changeHighlight", this.__onHighlightChange, this);
      this.__toolbar.addListener("changeGist", this.__onGistChange, this);
      this.__toolbar.addListener("reloadGists", function(e) {
        this.__loadGistsForUser(e.getData());
      }, this);
      this.__toolbar.addListener("changeLog", this.__onLogChange, this);
      this.__toolbar.addListener("shortenUrl", this.__onUrlShorten, this);
      this.__toolbar.addListener("openApi", this.__onApiOpen, this);
      this.__toolbar.addListener("openManual", this.__onManualOpen, this);
      
      // mainsplit, contains the editor and the info splitpane
      var mainsplit = new qx.ui.splitpane.Pane("horizontal");
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
      this.__playArea = new playground.view.PlayArea();
      infosplit.add(this.__playArea, 2);
      
      mainsplit.getChildControl("splitter").addListener("mousedown", function() {
        this.__editor.block();
      }, this);

      mainsplit.addListener("losecapture", function() {
        this.__editor.unblock();
      }, this);      

      this.__log = new playground.view.Log();

      infosplit.add(this.__log, 1);
      this.__log.exclude();

      this.__playArea.init(this);
    },


    finalize: function() {
      // Back button and bookmark support
      this.__initBookmarkSupport();
      
      // check for the highlight cookie
      if (qx.bom.Cookie.get("playgroundHighlight") === "false") {
        this.__editor.useHighlight(false);
      }
    },

    
    // ***************************************************
    // TOOLBAR HANDLER
    // ***************************************************
    /**
     * Handler for sample changes of the toolbar.
     * @param e {qx.event.type.Data} Data event containing the new name of 
     *   the sample.
     * 
     * @lint ignoreDeprecated(confirm)
     */
    __onSampleChange : function(e) {
      var userCode = this.__editor.getCode();
      var currentSample = this.__samples.getCurrent();
      if (userCode != currentSample)
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
    
    
    /**
     * Handler for changeGist which set the given text to the editor and 
     * runs it.
     * @param e {qx.event.type.Data} The data event containing the gist content.
     */
    __onGistChange : function(e) {
      this.__editor.setCode(e.getData());
      this.run();
    },
    
    
    /**
     * Handler for the changeHighlight event of the toolbar.
     * @param e {qx.event.type.Data} Data event containing the boolean to change
     *   the highlighted code view.
     */
    __onHighlightChange : function(e) {
      qx.bom.Cookie.set("playgroundHighlight", e.getData());
      this.__editor.useHighlight(e.getData());
    },


    /**
     * Handler for showing the log of the toolbar.
     * @param e {qx.event.type.Data} Data event containing if the log should 
     *   be shown.
     */
    __onLogChange : function(e) {
      e.getData() ? this.__log.show() : this.__log.exclude();
    },
    
    
    /**
     * Handler for the url shortening service.
     */
    __onUrlShorten : function() {
      var url = "http://api.bit.ly/shorten?version=2.0.1" + 
        "&login=qooxdoo" + 
        "&longUrl=" + escape(window.location.href) + 
        "&apiKey=" + this.__bitlyKey + 
        "&callback=playground.Application.handleShortendURl";
      var loader = new qx.io.ScriptLoader();
      loader.load(url);
    },


    /**
     * Handler for opening the api viewer.
     */
    __onApiOpen : function() {
      window.open(
        "http://demo.qooxdoo.org/" + 
        qx.core.Setting.get("qx.version") + 
        "/apiviewer/"
      );
    },
    
    
    /**
     * Handler for opening the manual.
     */
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
      this.__history.addListener("request", this.__onHistoryChanged, this);

      // Handle bookmarks
      var state = this.__history.getState();
      var name = state.replace(/_/g, " ");

      // checks if the state corresponds to a sample. If yes, the application
      // will be initialized with the selected sample
      if (state && this.__samples.isAvailable(name))
      {
        var sample = this.__samples.get(name);
        var code = sample;

      // check if a gist id is given
      } else if (state.indexOf("gist=") == 0) {
        var id = state.substring(5, state.lenght);
        var name = this.tr("Showing gist %1", id);
        this.__loadGist(id);

      // if there is a state given
      } else if (state != "") {
        var name = this.tr("Custom Code");
        var code = this.__parseURLCode(state);
      // if no state is given
      } else {
        var name = this.__samples.getNames()[0];
        var code = this.__samples.get(name);
      }
      
      this.__editor.setCode(code);
      this.run();

      // update the history
      qx.event.Timer.once(function() {
        this.__history.addToHistory(state, this.__updateTitle(name));
        this.__playArea.updateCaption(name);
      }, this, 0);
    },


    /**
     * Handler for changes of the history.
     * @param e {qx.event.type.Data} Data event containing the history changes.
     */
    __onHistoryChanged : function(e)
    {
      var state = e.getData();

      // is a sample name given
      if (this.__samples.isAvailable(state))
      {
        this.__editor.setCode(this.__samples.get(state));
        this.run();

      // is a gist id given
      } else if (state.indexOf("gist=") == 0) {
        this.__loadGist(state.substring(5, state.lenght));

      // is code given
      } else if (state != "") {
        var code = this.__parseURLCode(state);
        if (code != this.__editor.getCode()) {
          this.__editor.setCode(code);
          this.run();
        }
      }
    },
    
    
    /**
     * Helper method for parsing the given url parameter to a valid code 
     * fragment.
     * @param state {String} The given state of the browsers history.
     * @return {String} A valid code snippet.
     */
    __parseURLCode : function(state) 
    {
      try {
        var data = qx.util.Json.parse(state);
        return decodeURIComponent(data.code).replace(/%0D/g, "");        
      } catch (e) {
        var error = this.tr("// Could not handle URL parameter! \n// %1", e);
        
        if (qx.bom.client.Engine.MSHTML) {
          error += this.tr("// Your browser has a length restriction of the " + 
                          "URL parameter which could have caused the problem.");
        }
        return error;
      }
    },
    
    
    /**
     * Adds the given code to the history.
     * @param code {String} the code to add.
     * @lint ignoreDeprecated(confirm)
     */    
    __addCodeToHistory : function(code) {
      var codeJson = '{"code": ' + '"' + encodeURIComponent(code) + '"}';
      if (qx.bom.client.Engine.MSHTML && codeJson.length > 1300) {
        if (!this.__ignoreSaveFaults && confirm(
          this.tr("Could not save your code in the url because it is too much " + 
          "code. Do you want to ignore it?"))
        ) {
          this.__ignoreSaveFaults = true;
        };
        return;
      }
      this.__history.addToHistory(codeJson);      
    },


    // ***************************************************
    // GIST SUPPORT
    // ***************************************************
    /**
     * Handler for working with the new loaded gists.
     * @param e {qx.event.type.Data} The loaded event of the store.
     */
    __onGistsLoaded : function(e) {
      var model = e.getData();
      
      // error handling
      if (model == "FAIL!") {
        this.__toolbar.invalidGist(true, this.tr("No such user found."));
        this.__toolbar.updateGists([], []);
        return;
      } else {
        this.__toolbar.invalidGist(false);        
      }
      
      var names = [];
      var texts = [];
      for (var i = 0; i < model.getLength(); i++) {
        var item = model.getItem(i);
        var desc = qx.lang.Type.isString(item.getDescription()) ? 
          item.getDescription() : item.getRepo();
        names.push(desc);
        
        texts.push(item.getContent ? item.getContent() : "");
      };
      this.__toolbar.updateGists(names, texts);
    },
    
    
    /**
     * Load all gists viy YQL for the given username.
     * @param username {String} The username to load the gists for.
     */
    __loadGistsForUser : function(username) 
    {
      var query = 'USE "http://github.com/wittemann/yql-tables/raw/master/github/github.gist.list.xml" AS gh; SELECT * FROM gh WHERE user="' + username + '"';
      var delegate = {manipulateData : function(data) {
        if (data.query.results) {
          return data.query.results.gists.gist;
        } else {
          return "FAIL!";
        }
      }};
      var store = new qx.data.store.Yql(query, delegate);
      store.addListener("loaded", this.__onGistsLoaded, this);      
    },


    /**
     * Responsible for loading and running the gist stored with the given id.
     * @param id {String} The id of the gist to run.
     */
    __loadGist : function(id)
    {
      var url = "http://gist.github.com/" + id + ".txt";
      var request = new qx.io.remote.Request(
        url, "GET", "text/plain"
      );
      request.addListener("completed", function(e) {
        var data = e.getContent();
        this.__editor.setCode(data);
        this.__updatePlayground();
      }, this);
      request.send();
    },


    // ***************************************************
    // UPDATE & RUN
    // ***************************************************
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
     * Updates the playground.
     */
    __updatePlayground : function()
    {
      this.__log.clear();
      this.__playArea.reset();

      var reg = qx.Class.$$registry;
      delete reg[this.__currentStandalone];

      // build the code to run
      var code = this.__editor.getCode();
      var title = this.__samples.getCurrentName();
      code = 'this.info("' + this.tr("Starting application").toString() +
        (title ? " '" + title + "'": "") +
        ' ...");\n' + 
        ((code + ";") || "") +
        'this.info("' + this.tr("Successfully started").toString() + '.");\n';

      // try to create a function
      try {
        this.fun = new Function(code);
      } catch(ex) {
        var exc = ex;
      }

      // run the code
      try {
        this.fun.call(this.__playArea.getApp());
        qx.ui.core.queue.Manager.flush();
      }
      catch(ex) {
        var exc = ex;
      }

      // store the new standalone app if available
      for(var name in reg)
      {
        if(this.__isStandaloneApp(name))
        {
          this.__currentStandalone = name;
          this.__executeStandaloneApp(name);
          break;
        }
      } 
      
      // error handling
      if (exc) {
        this.error(this.__errorMsg.replace(/\|/g, "\n") + exc);
        this.__toolbar.showLog(true);
        this.__log.show();
        this.__playArea.reset();
      }

      this.__log.fetch();
    },
    
    
    /**
     * Runs the current set sample and checks if it need to be saved to the url.
     */
    run : function()
    {
      this.__updatePlayground();

      var name = this.__samples.getCurrentName();
      var currentSample = this.__samples.getCurrent();
      var code = this.__editor.getCode();
      if (code && code != currentSample) {
        this.__playArea.updateCaption(this.tr("%1 (modified)", name));
        this.__addCodeToHistory(code);
      } else {
        this.__playArea.updateCaption(name);
        this.__history.addToHistory(
          this.__samples.getCurrentName(), this.__updateTitle(name)
        );
      }
    },    

 
    // ***************************************************
    // STANDALONE SUPPORT
    // *************************************************** 
       
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
     */
    __executeStandaloneApp : function(name)
    {
      var self = this;
      qx.application.Standalone.prototype._createRootWidget = function() {
        return self.__playArea.getApp().getRoot(); 
      };

      var app = new qx.Class.$$registry[name];

      try {
        app.main();
        qx.ui.core.queue.Manager.flush();
      } catch(ex) {
        var exc = ex;
        this.error(this.__errorMsg.replace(/\|/g, "\n") + exc);
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
    this.__history = null;
    this._disposeObjects(
      "__currentStandalone", "__samples", "__toolbar", "__editor", 
      "__playArea", "__log"
    );
  }
});