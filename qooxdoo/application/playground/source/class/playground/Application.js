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

  properties :
  {
    /** The name of the current application.*/
    name : {
      check : "String",
      apply : "_applyName",
      init: ""
    },

    /** Code to check agains as unchanged source of the loaded code.*/
    originCode : {
      check : "String",
      apply : "_applyOriginCode",
      init : ""
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
    __gists : null,

    __history : null,
    __urlShorter : null,

    __currentStandalone: null,

    // flag used for the warning for IE
    __ignoreSaveFaults : false,

    __modified : false,

    // used for removing the created objects in the run code
    __beforeReg : null,
    __afterReg : null,
    __oldCode : null,

    __errorMsg: qx.locale.Manager.tr(
      "Unfortunately, an unrecoverable internal error was caused by your code." +
      " This may prevent the playground application to run properly.||"
    ),


    /**
     * This method contains the initial application code and gets called
     * during startup of the application.
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
      this.__toolbar.addListener("newGist", this.__newGist, this);
      this.__toolbar.addListener("editGist", this.__onEditGist, this);
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
    // PROPERTY APPLY
    // ***************************************************
    _applyName : function(value, old) {
      this.__playArea.updateCaption(value);
      this.__updateTitle(value);
    },

    _applyOriginCode : function(value, old) {
      this.__modified = false;
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
      if (this.__isCodeNotEqual(userCode, this.getOriginCode()))
      {
        if (!confirm(this.tr("You changed the code of the current sample.|" +
          "Click OK to discard your changes.").replace(/\|/g, "\n")))
        {
          return ;
        }
      }

      // set the new sample data
      var newSample = this.__samples.get(e.getData());
      // need to get the code from the editor in case he changes something
      // in the code
      this.__editor.setCode(newSample);
      this.setOriginCode(this.__editor.getCode());

      this.setName(e.getData());
      // run the new sample
      this.run();
    },


    /**
     * Handler for changeGist which set the given text to the editor and
     * runs it.
     * @param e {qx.event.type.Data} The data event containing the gist content.
     */
    __onGistChange : function(e) {
      var code = e.getData().code;
      // need to get the code from the editor in case he changes something
      // in the code
      this.__editor.setCode(code);
      this.setOriginCode(this.__editor.getCode());
      this.setName(e.getData().name);
      this.run();
    },


    /**
     * Handler for the changeHighlight event of the toolbar.
     * @param e {qx.event.type.Data} Data event containing the boolean to change
     *   the highlighted code view.
     */
    __onHighlightChange : function(e) {
      qx.bom.Cookie.set("playgroundHighlight", e.getData(), 100);
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
      window.open(
        "http://tinyurl.com/create.php?url=" + encodeURIComponent(location.href),
        "tinyurl",
        "width=800,height=600,resizable=yes,scrollbars=yes"
      );
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
     */
    __initBookmarkSupport : function()
    {
      this.__history = qx.bom.History.getInstance();
      this.__history.addListener("request", this.__onHistoryChanged, this);

      // Handle bookmarks
      var state = this.__history.getState();
      var name = state.replace(/_/g, " ");

      var code = "";

      // checks if the state corresponds to a sample. If yes, the application
      // will be initialized with the selected sample
      if (state && this.__samples.isAvailable(name))
      {
        var sample = this.__samples.get(name);
        code = sample;

      // check if a gist id is given
      } else if (state.indexOf("gist=") == 0) {
        var id = state.substring(5, state.length);
        var name = this.tr("Showing gist %1", id);
        this.__loadGist(id);

      // if there is a state given
      } else if (state && state.charAt(0) == "{") {
        var name = this.tr("Custom Code");
        code = this.__parseURLCode(state);
      // if no state is given
      } else {
        var name = this.__samples.getNames()[0];
        code = this.__samples.get(name);
      }

      // need to get the code from the editor in case he changes something
      // in the code
      this.__editor.setCode(code);
      this.setOriginCode(this.__editor.getCode());

      this.setName(name);
      this.run();
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
        var sample = this.__samples.get(state);
        if (this.__isCodeNotEqual(sample, this.__editor.getCode())) {
          this.__editor.setCode(sample);
          this.setName(state);
          this.run();
        }

      // is a gist id given
      } else if (state.indexOf("gist=") == 0) {
        var id = state.substring(5, state.length);
        this.__loadGist(id);
        this.setName(this.tr("Showing gist %1", id));

      // is code given
      } else if (state != "") {
        var code = this.__parseURLCode(state);
        if (code != this.__editor.getCode()) {
          this.__editor.setCode(code);
          this.setName(this.tr("Custom Code"));
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
          this.tr("Cannot append sample code to URL, as it is too long. " +
                  "Disable this warning in the future?"))
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
      this.__gists = model;

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
          if (data.query.results.gists.gist) {
            if (qx.lang.Type.isArray(data.query.results.gists.gist)) {
              return data.query.results.gists.gist;
            } else {
              // single gists are transfered without an array
              return [data.query.results.gists.gist];
            }

          } else {
            return [];
          }
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
      var query = 'USE "http://github.com/wittemann/yql-tables/raw/master/github/github.gist.content.xml" AS gh; SELECT * FROM gh WHERE repo="' + id + '"';
      var store = new qx.data.store.Yql(query);

      store.addListener("loaded", function(e) {
        try {
          var code = e.getData().getQuery().getResults().getContent();
          if (code == null) {
            this.setName(this.tr("Gist contains no content."));
          }
          this.__editor.setCode(code);
          this.setName("gist " + id);
          this.__updatePlayground();
        } catch (e) {
          this.info(this.tr("Can't load the gist."));
        }
      }, this);
    },


    /**
     * Handler for creating a new gists. (Opens up a window
     * for creating a new gist)
     */
    __newGist : function() {
      window.open("http://gist.github.com");
    },


    /**
     * Handler for editing gists.
     * @param e {qx.event.type.Data} The data event containing the name of
     *   the gist.
     */
    __onEditGist : function(e) {
      var name = e.getData();

      // if the name is not in the description of any item, its the repo itself
      var repo = name;

      // search for the fitting repo number
      for (var i = 0; i < this.__gists.getLength(); i++) {
        if (this.__gists.getItem(i).getDescription() == name) {
          repo = this.__gists.getItem(i).getRepo();
          break;
        }
      }

      window.open("http://gist.github.com/gists/" + repo + "/edit");
    },


    // ***************************************************
    // UPDATE & RUN & COMPARE
    // ***************************************************
    /**
     * Special compare method for IE.
     * @param code1 {String} The first code to compare.
     * @param code2 {String} The second code to compare.
     * @return {Boolean} true, if the code is equal.
     */
    __isCodeNotEqual : function(code1, code2)
    {
      if (qx.core.Variant.isSet("qx.client", "opera")) {
        code1 = code1.replace(/\r?\n/g, "\n");
        code2 = code2.replace(/\r?\n/g, "\n");
        return code1 != code2;
      }

      var compareElem1 = document.getElementById("compare_div1");
      compareElem1.innerHTML = code1;

      var compareElem2 = document.getElementById("compare_div2");
      compareElem2.innerHTML = code2;

      return (compareElem1.innerHTML.length != compareElem2.innerHTML.length ||
        compareElem1.innerHTML != compareElem2.innerHTML);
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
     * Updates the playground.
     */
    __updatePlayground : function()
    {
      this.__log.clear();
      this.__playArea.reset(this.__beforeReg, this.__afterReg, this.__oldCode);

      var reg = qx.Class.$$registry;
      delete reg[this.__currentStandalone];

      // build the code to run
      var code = this.__editor.getCode();
      code = 'this.info("' + this.tr("Starting application").toString() +
      // special replacement for unicode "zero width space" [BUG #3635]
      code = code.replace("\u200b", "");
        " '" + this.getName() + "'" + ' ...");\n' +
        (code || "") +
        'this.info("' + this.tr("Successfully started").toString() + '.");\n';

      // try to create a function
      try {
        this.__oldCode = code;
        this.fun = new Function(code);
      } catch(ex) {
        var exc = ex;
      }

      // run the code
      try {
        // save the current registry
        this.__beforeReg = qx.lang.Object.clone(qx.core.ObjectRegistry.getRegistry());
        // run the aplpication
        this.fun.call(this.__playArea.getApp());
        qx.ui.core.queue.Manager.flush();
        this.__afterReg = qx.lang.Object.clone(qx.core.ObjectRegistry.getRegistry());
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
        this.__playArea.reset(this.__beforeReg, this.__afterReg, this.__oldCode);
      }

      this.__log.fetch();
    },


    /**
     * Runs the current set sample and checks if it need to be saved to the url.
     *
     * @param e {qx.event.type.Event} A possible events (unused)
     */
    run : function(e)
    {
      var code = this.__editor.getCode();
      if (code && this.__isCodeNotEqual(code, this.getOriginCode())) {
        this.__addCodeToHistory(code);
        if (!this.__modified) {
          this.setName(this.tr("%1 (modified)", this.getName()));
        }
        this.__modified = true;
      }

      this.__updatePlayground();
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
    this.__history = this.__beforeReg = this.__afterReg = null;
    this._disposeObjects(
      "__currentStandalone", "__samples", "__toolbar", "__editor",
      "__playArea", "__log"
    );
  }
});
