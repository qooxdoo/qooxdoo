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
 * previews of a simple custom application.
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
    },


    /** The current selected sample model. */
    currentSample : {
      apply : "_applyCurrentSample",
      event : "changeCurrentSample",
      nullable : true
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
    __header : null,
    __toolbar : null,
    __log : null,
    __editor : null,
    __playArea : null,
    __samplesPane : null,
    __editorsplit : null,

    // storages
    __samples : null,
    __store : null,

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

    __mode : null,
    __maximized : null,

    /**
     * This method contains the initial application code and gets called
     * during startup of the application.
     *
     * @lint ignoreUndefined(qxc)
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
      this.__header = new playground.view.Header();
      mainContainer.add(this.__header, { flex : 0 });
      this.__header.addListener("changeMode", this._onChangeMode, this);

      // toolbar
      this.__toolbar = new playground.view.Toolbar();
      mainContainer.add(this.__toolbar, { flex : 0 });

      // toolbar listener
      this.__toolbar.addListener("run", this.run, this);
      this.__toolbar.addListener("changeSample", this.__onSampleChange, this);
      this.__toolbar.addListener("changeHighlight", this.__onHighlightChange, this);
      this.__toolbar.addListener("changeLog", this.__onLogChange, this);
      this.__toolbar.addListener("shortenUrl", this.__onUrlShorten, this);
      this.__toolbar.addListener("openApi", this.__onApiOpen, this);
      this.__toolbar.addListener("openManual", this.__onManualOpen, this);
      this.__toolbar.addListener("openDemoBrowser",this.__onDemoBrowser,this);

      // mainsplit, contains the editor splitpane and the info splitpane
      var mainsplit = new qx.ui.splitpane.Pane("horizontal");
      mainContainer.add(mainsplit, { flex : 1 });
      mainsplit.setAppearance("app-splitpane");

      // editor split (left side of main split)
      this.__editorsplit = new qx.ui.splitpane.Pane("horizontal");
      this.__editorsplit.setDecorator(null); // get rid of the 3px broder
      // info split (right side of the main split)
      var infosplit = new qx.ui.splitpane.Pane("vertical");
      infosplit.setDecorator(null);

      // examples pane
      this.__samplesPane = new playground.view.Samples();
      this.__samplesPane.addListener("save", this.__onSave, this);
      this.__samplesPane.addListener("saveAs", this.__onSaveAs, this);
      this.__samplesPane.addListener("delete", this.__onDelete, this);
      this.__samplesPane.addListener("rename", this.__onRename, this);
      this.bind("currentSample", this.__samplesPane, "currentSample");
      this.__samplesPane.addListener("beforeSelectSample", function(e) {
        if (this.__discardChanges()) {
          e.stop();
        }
      }, this);
      this.__samplesPane.addListener("selectSample", function(e) {
        this.setCurrentSample(e.getData());
      }, this);

      // initialize custom samples
      this.__store = new qx.data.store.Offline("qooxdoo-playground-samples");
      // if the local storage is not empty
      if (this.__store.getModel() != null) {
        // use the stored array to initialize the built in samples
        this.__samples = new playground.Samples(this.__store.getModel());
      } else {
        // init the samples and store in the local storage
        this.__samples = new playground.Samples();
        this.__store.setModel(this.__samples.getModel());
      }
      this.__store.bind("model", this.__samplesPane, "model");


      // need to split up the creation process
      this.__editor = new playground.view.Editor();
      this.__editor.addListener("disableHighlighting", function() {
        this.__toolbar.enableHighlighting(false);
      }, this);
      this.__editor.init();

      this.__editorsplit.add(this.__samplesPane, 1);
      this.__editorsplit.add(this.__editor, 4);

      mainsplit.add(this.__editorsplit, 6);
      mainsplit.add(infosplit, 3);

      this.__playArea = new playground.view.PlayArea();
      this.__playArea.addListener("toggleMaximize", this._onToggleMaximize, this);
      infosplit.add(this.__playArea, 2);

      mainsplit.getChildControl("splitter").addListener("mousedown", function() {
        this.__editor.block();
      }, this);

      mainsplit.addListener("losecapture", function() {
        this.__editor.unblock();
      }, this);

      this.__log = new qxc.ui.logpane.LogView();

      infosplit.add(this.__log, 1);
      this.__log.exclude();
    },


    // overridden
    finalize: function() {
      // check if mobile chould be used
      if (this.__supportsMode("mobile")) {
        // check for the mode cookie
        if (qx.bom.Cookie.get("playgroundMode") === "mobile") {
          this.setMode("mobile");
        } else {
          this.setMode("ria");
        }
      } else {
        this.setMode("ria");
        this.__header.setEnabledMode("mobile", false);
      }

      // Back button and bookmark support
      this.__initBookmarkSupport();

      // check for the highlight and examples cookie
      if (qx.bom.Cookie.get("playgroundHighlight") === "false") {
        this.__editor.useHighlight(false);
      }
      if (qx.bom.Cookie.get("playgroundShowExamples") === "false") {
        this.__toolbar.showExamples(false);
      }
    },


    // ***************************************************
    // PROPERTY APPLY
    // ***************************************************
    // property apply
    _applyName : function(value, old) {
      if (!this.__playArea) {
        return;
      }
      this.__playArea.updateCaption(value);
      this.__updateTitle(value);
    },


    // property apply
    _applyOriginCode : function(value, old) {
      this.__modified = false;
    },


    // property apply
    _applyCurrentSample : function(newSample, old) {
      // ignore when the sample is set to null
      if (!newSample) {
        return;
      }

      this.setMode(newSample.getMode());

      // need to get the code from the editor in case he changes something
      // in the code
      this.__editor.setCode(newSample.getCode());
      this.setOriginCode(this.__editor.getCode());

      // only add static samples to the url as name
      if (newSample.getCategory() == "static") {
        this.__history.addToHistory(newSample.getName() + "-" + newSample.getMode());
      } else {
        this.__addCodeToHistory(newSample.getCode());
      }

      this.setName(newSample.getName());
      // run the new sample
      this.run();
    },


    // ***************************************************
    // MODE HANDLING
    // ***************************************************
    /**
     * Event handler for changing the mode of the palyground.
     * @param e {qx.event.type.Data} The data event containing the mode.
     */
    _onChangeMode : function(e) {
      var mode = e.getData();
      // ignore setting the same mode
      if (mode == this.__mode) {
        return;
      }

      if (!this.setMode(mode)) {
        this.__header.setMode(e.getOldData());
      } else {
        // select the first sample
        this.setCurrentSample(this.__samples.getFirstSample(mode));
      }
    },


    /**
     * Helper to determinate if the mode is currently supported e.g. mobile
     * in the current runtime.
     * @param mode {String} The name of the mode.
     * @return {boolean} <code>true</code>, if the given mode can be used.
     */
    __supportsMode : function(mode) {
      if (mode == "mobile") {
        var engine = qx.core.Environment.get("engine.name");
        return (engine == "webkit" || engine == "gecko");
      } else if (mode == "ria") {
        return true;
      }
      return false;
    },


    /**
     * Setter and dispatcher for the current mode the playground is in.
     * @param mode {String} The mode to use.
     */
    setMode : function(mode) {
      // check if the mode is supported
      if (!this.__supportsMode(mode)) {
        throw new Error("Mode '" + mode + "' not supported");
      }

      // only set new mode if not already set
      if (this.__mode == mode) {
        return true;
      }

      // only change the mode if no code gets lost
      if (this.__discardChanges()) {
        return false;
      }

      // store the mode
      qx.bom.Cookie.set("playgroundMode", mode, 100);
      this.__mode = mode;

      // update the views (changes the play application)
      this.__playArea.setMode(mode);
      this.__header.setMode(mode);
      this.__samplesPane.setMode(mode);

      // erase the code
      this.__editor.setCode("");

      return true;
    },


    // ***************************************************
    // SAMPEL SAVE / DELETE
    // ***************************************************
    /**
     * Helper to write the current code to the model and with that to the
     * offline store.
     */
    __onSave : function() {
      var current = this.getCurrentSample();

      // if we don't have a current sample and the sample is a static one
      if (!current || current.getCategory() == "static") {
        this.__onSaveAs();
      // if its a user sample which is selected, we just store the new code
      } else {
        // store in curent sample
        current.setCode(this.__editor.getCode());
        this.setOriginCode(current.getCode());
        // set the name to make sure no "changed" state is displayed
        this.setName(current.getName());
      }
    },


    /**
     * Helper to write the current code to the model and with that to the
     * offline store.
     * @lint ignoreDeprecated(confirm)
     */
    __onSaveAs : function() {
      // ask the user for a new name for the property
      var name = prompt(this.tr("Please enter a name"), ""); // empty value string of IE
      if (!name) {
        return;
      }
      // check for overriding sample names
      var samples = this.__store.getModel();
      for (var i = 0; i < samples.length; i++) {
        if (samples.getItem(i).getName() == name) {
          if (confirm(this.tr("Sample already exists. Do you want to overwrite?"))) {
            this.__onSave();
          }
          return;
        }
      };
      // create new sample
      var data = {
        name: name,
        code: this.__editor.getCode(),
        mode: this.__mode,
        category: "user"
      };
      var sample = qx.data.marshal.Json.createModel(data, true);
      // push the data to the model (storest automatically)
      this.__store.getModel().push(sample);
      // store the origin code and select the new sample
      this.setOriginCode(sample.getCode());
      this.__samplesPane.select(sample);
    },


    /**
     * Helper to delete the selected sample.
     */
    __onDelete : function() {
      var current = this.getCurrentSample();
      // if we have a sample selected and its not a static one
      if (current || current.getCategory() != "static") {
        // remove the selection
        this.__samplesPane.select(null);
        // delete the current sample
        this.__store.getModel().remove(current);
        // reset the current selected sample
        this.setCurrentSample(null);
      }
    },


    /**
     * Helper to rename a sample.
     */
    __onRename : function() {
      var current = this.getCurrentSample();
      // if we have a sample and its not a static one
      if (current || current.getCategory() != "static") {
        // ask the user for a new name
        var name = prompt(this.tr("Please enter a name"), current.getName());
        if (!name) {
          return;
        }
        // just write the new name to the to the sample
        current.setName(name);
      }
    },


    /**
     * Helper to toggle the editors split pane which means togglinge the
     * visibility of the editor and the samples pane.
     */
    _onToggleMaximize : function() {
      this.__maximized = !this.__maximized;
      if (this.__maximized) {
        this.__editorsplit.exclude();
      } else {
        this.__editorsplit.show();
      }
    },


    // ***************************************************
    // TOOLBAR HANDLER
    // ***************************************************
    /**
     * Handler for sample changes of the toolbar.
     * @param e {qx.event.type.Data} Data event containing the boolean
     * weather the examples should be shown.
     */
    __onSampleChange : function(e) {
      qx.bom.Cookie.set("playgroundShowExamples", e.getData(), 100);
      if (e.getData()) {
        this.__samplesPane.show();
      } else {
        this.__samplesPane.exclude();
      }
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
        qx.core.Environment.get("qx.version") +
        "/apiviewer/"
      );
    },


    /**
     * Handler for opening the manual.
     */
    __onManualOpen : function() {
      window.open(
        "http://manual.qooxdoo.org/" + qx.core.Environment.get("qx.version")
      );
    },


    /**
     * Handler for opening the demo browser.
     */
    __onDemoBrowser : function() {
      window.open(
        "http://demo.qooxdoo.org/" +
        qx.core.Environment.get("qx.version") +
        "/demobrowser/"
      );
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
      this.__history.addListener("changeState", this.__onHistoryChanged, this);

      // Handle bookmarks
      var state = this.__history.getState();
      var name = state.replace(/_/g, " ");

      var code = "";

      // checks if the state corresponds to a sample. If yes, the application
      // will be initialized with the selected sample
      if (state && this.__samples.isAvailable(state))
      {
        var sample = this.__samples.get(state);
        this.setCurrentSample(sample);
        return;

      // check if a mode is given
      } else if (state.indexOf("mode=") == 0) {
        var mode = state.substring(5, state.length);
        if (mode == "mobile") {
          // try to set the mobile mode but if its not supported, take ria
          try {
            this.setMode("mobile");
          } catch (e) {
            this.setMode("ria");
          }
        } else {
          this.setMode("ria");
        }
        var sample = this.__samples.getFirstSample(this.__mode);
        this.setCurrentSample(sample);
        return;

      // if there is a state given
      } else if (state && state.charAt(0) == "{") {
        var name = this.tr("Custom Code");
        code = this.__parseURLCode(state);
        // need to get the code from the editor in case he changes something
        // in the code
        this.__editor.setCode(code);
        this.setOriginCode(this.__editor.getCode());

        // try to select a custom sample
        this.__samplesPane.selectByCode(code);

        this.setName(name);
        this.run();

      // if no state is given
      } else {
        var sample = this.__samples.getFirstSample(this.__mode);
        this.setCurrentSample(sample);
        return;
      }
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
        if (this.__isCodeNotEqual(sample.getCode(), this.__editor.getCode())) {
          this.setCurrentSample(sample);
        }

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
        var data = qx.lang.Json.parse(state);
        // change the mode in case a different mode is given
        if (data.mode && data.mode != this.__mode) {
          this.setMode(data.mode);
        }
        return decodeURIComponent(data.code).replace(/%0D/g, "");
      } catch (e) {
        var error = this.tr("// Could not handle URL parameter! \n// %1", e);

        if (qx.core.Environment.get("engine.name") == "mshtml") {
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
      var codeJson =
        '{"code":' + '"' + encodeURIComponent(code) + '", "mode":"' + this.__mode + '"}';
      if (qx.core.Environment.get("engine.name") == "mshtml" && codeJson.length > 1300) {
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
    // UPDATE & RUN & COMPARE
    // ***************************************************
    /**
     * Checcks if the code is changed. If that is the case, the user will be
     * prompted to discard the changes.
     *
     * @lint ignoreDeprecated(confirm)
     * @return {Boolean} <code>true</code> if the code has been modified
     */
    __discardChanges : function() {
      var userCode = this.__editor.getCode();
      if (userCode && this.__isCodeNotEqual(userCode, this.getOriginCode()))
      {
        if (!confirm(this.tr("Click OK to discard your changes.")))
        {
          return true;
        }
      }
      return false;
    },


    /**
     * Special compare method for IE.
     * @param code1 {String} The first code to compare.
     * @param code2 {String} The second code to compare.
     * @return {Boolean} true, if the code is equal.
     */
    __isCodeNotEqual : function(code1, code2)
    {
      if (qx.core.Environment.get("engine.name") == "opera") {
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
      // special replacement for unicode "zero width space" [BUG #3635]
      code = code.replace("\u200b", "");
      code = 'this.info("' + this.tr("Starting application").toString() +
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
        qx.ui.core.queue.Manager.flush();
        this.__beforeReg = qx.lang.Object.clone(qx.core.ObjectRegistry.getRegistry());

        // run the aplpication
        this.fun.call(this.__playArea.getApp());
        qx.ui.core.queue.Manager.flush();
        this.__afterReg = qx.lang.Object.clone(qx.core.ObjectRegistry.getRegistry());
      } catch(ex) {
        var exc = ex;
      }

      // store the new standalone app if available
      for(var name in reg)
      {
        if(this.__isAppClass(name))
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
     * registry and is a qooxdoo application class.
     *
     * @param name {String} Name of the class to examine
     * @return {Boolean} Whether it is a registered application class
     */
    __isAppClass : function(name)
    {
      if (name === "playground.Application") {
        return false;
      }
      var clazz = qx.Class.$$registry[name];
      // ria mode supports standalone applications
      if (this.__mode == "ria") {
        return (
          clazz && clazz.superclass &&
          clazz.superclass.classname === "qx.application.Standalone"
        )
      // mobile mode supports mobild applications
      } else if (this.__mode == "mobile") {
        return (
          clazz && clazz.superclass &&
          clazz.superclass.classname === "qx.application.Mobile"
        )
      }
      return false;
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