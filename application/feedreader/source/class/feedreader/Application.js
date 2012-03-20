/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(feedreader/*)
#asset(qx/icon/Tango/22/apps/internet-feed-reader.png)
#asset(qx/icon/Tango/22/actions/process-stop.png)
#asset(qx/icon/Tango/22/apps/preferences-clock.png)
#asset(qx/icon/Tango/22/places/folder.png)

************************************************************************ */

/**
 * The feed reader's main application class.
 */
qx.Class.define("feedreader.Application",
{
  extend : qx.application.Standalone,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // private memebers
    __treeController : null,
    __listController : null,

    __commands : null,

    __treeView : null,
    __header : null,
    __toolBarView : null,
    __listView : null,
    __horizontalSplitPane : null,
    __verticalSplitPane : null,
    __prefWindow : null,
    __articleView : null,
    __addFeedWindow : null,

    __feedFolder : null,
    __userFeedFolder : null,
    __staticFeedFolder: null,

    __addFeedWindowLoaded : false,
    __preferencesWindowLoaded : false,

    /*
    ---------------------------------------------------------------------------
      APPLICATION METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Application initialization which happens when
     * all library files are loaded and ready
     */
    main : function()
    {
      this.base(arguments);

      // Add log appenders
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      qx.io.PartLoader.getInstance().addListener("partLoaded", function(e) {
        this.debug("part loaded: " + e.getData().getName());
      }, this);

      // Load current locale part
      var currentLanguage = qx.locale.Manager.getInstance().getLanguage();
      var knownParts = qx.Part.getInstance().getParts();
      // if the locale is available as part
      if (knownParts[currentLanguage]) {
        // load this part
        qx.io.PartLoader.require([currentLanguage], function() {
          // forcing identical locale
          qx.locale.Manager.getInstance().setLocale(currentLanguage);
          // build the GUI after the initial locals has been loaded
          this.buildUpGui();
        }, this);
      } else {
        // if we cant find the default locale, print a warning and load the gui
        this.warn(
          "Cannot load locale part for current language " +
          currentLanguage + ", falling back to English."
        );
        this.buildUpGui();
      }
    },


    /**
     * Main routine which builds the whole GUI.
     */
    buildUpGui : function()
    {
      // Initialize commands
      this._initializeCommands();

      // Create application layout
      this._createLayout();

      // Initialize the model
      var model = new feedreader.model.Model();
      this.__feedFolder = model.getFeedFolder();
      this.__staticFeedFolder = model.getStaticFeedFolder();
      this.__userFeedFolder = model.getUserFeedFolder();

      // Initialize the bindings
      this._setUpBinding();

      // Set up the default view of the tree
      this.__treeView.getRoot().setOpen(true);
      this.__treeView.getRoot().getChildren()[0].setOpen(true);
      this.__treeView.getRoot().getChildren()[1].setOpen(true);
      this.__treeView.setHideRoot(true);

      // Preselect the qooxdoo feed
      this.__treeController.getSelection().push(
        this.__staticFeedFolder.getFeeds().getItem(0)
      );

      this.reload();
    },


    /*
    ---------------------------------------------------------------------------
      BINDING RELATED
    ---------------------------------------------------------------------------
    */

    /**
     * Set up the bindings and controller.
     */
    _setUpBinding : function() {

      // bind the tree //
      // create the options used to store the converter for the icon
      var iconOptions = {converter: this._state2iconConverter};
      // create the controller which binds the feeds to the tree
      // 1. Parameter: The model (root feed folder)
      // 2. Parameter: The view (the tree widget)
      // 3. Parameter: name of the children of the model items
      // 4. Parameter: name of the model property to show as label in the tree
      this.__treeController = new qx.data.controller.Tree(
        this.__feedFolder, this.__treeView, "feeds", "title"
      );
      // set the options for the icon binding
      this.__treeController.setIconOptions(iconOptions);
      // set the property for the icon binding
      this.__treeController.setIconPath("state");

      // bind the list //
      // create the controller which binds ths list
      // 1. Parameter: The model (null because is bound in the next line)
      // 2. Parameter: The view (the list widget)
      // 3. Parameter: name of the model property to show as label in the list
      this.__listController = new qx.data.controller.List(
        null, this.__listView.getList(), "title"
      );
      // bind the first selection of the tree as the model of the list
      this.__treeController.bind(
        "selection[0].articles", this.__listController, "model"
      );

      // bind the article //
      // bind the first selection of the list to the article view
      this.__listController.bind("selection[0]", this.__articleView, "article");

      // register a handler for the change of the list selection
      this.__listController.getSelection().addListener(
        "change" , this._listControllerChange, this
      );
      // register a handler for the change of the model of the list
      this.__listController.addListener(
        "changeModel", this._treeControllerChange, this
      );

      // binding for showing the loading image in the list
      var options = {converter: this._state2loadingConverter};
      this.__treeController.bind(
        "selection[0].state", this.__listView, "loading", options
      );

      // bind the enabled property of the remove feed button
      options = {converter: this._category2enabledConverter};
      this.__treeController.bind(
        "selection[0]", this.__toolBarView.getRemoveButton(), "enabled", options
      );
    },


    /**
     * Converts the category to a boolean for the enabled status of the remove
     * button.
     * @param data {String} The category name.
     */
    _category2enabledConverter : function(data) {
      return !!data && data.getCategory() == "user";
    },


    /**
     * Converter function which converts the state of a feed to a icon url.
     * @param value {String} The loading state of the request.
     */
    _state2iconConverter : function(value) {
      if (value == "new" || value == "loading") {
        return "feedreader/images/loading22.gif";
      }
      else if (value == "loaded") {
        return "icon/22/apps/internet-feed-reader.png";
      } else if (value == "error") {
        return "icon/22/actions/process-stop.png";
      } else if (value == "cached") {
        return "icon/22/apps/preferences-clock.png";
      }
      return "icon/22/places/folder.png";
    },


    /**
     * Converter function which converts the state of a feed to a loading
     * indicator in the list view.
     * @param data {String} The loading state of the request.
     */
    _state2loadingConverter : function(data) {
      if (data == "new" || data == "loading") {
        return true;
      }
      return false;
    },


    /**
     * Event handler for a change of the selection of the list.
     * @param ev {qx.event.type.Data} The change event of the list controller.
     */
    _listControllerChange : function(ev) {
      // get the selected feed
      var feed = this.__treeController.getSelection().getItem(0);
      // get the selected article
      var article = this.__listController.getSelection().getItem(0);
      // set the selected article
      if (article != undefined) {
        feed.setSelectedArticle(article);
      }
    },


    /**
     * Event handler for a change of the selection of the tree.
     * @param ev {qx.event.type.Data} The change event of the tree controller.
     */
    _treeControllerChange : function(ev) {
      // get the selected feed
      var feed = this.__treeController.getSelection().getItem(0);
      // restore the last selected feed
      // if a feed is selected and its not an folder and an article was selected
      // and if the article belongs to the current feed
      if (
        feed != null &&
        feed.classname == "feedreader.model.Feed" &&
        feed.getSelectedArticle() != null &&
        feed.getArticles().contains(feed.getSelectedArticle())
      ) {
        qx.event.Timer.once(function() {
          this.__listController.getSelection().push(feed.getSelectedArticle());
        }, this, 0);
      } else {
        this.__listView.getList().scrollToY(0);
      }
    },




    /*
    ---------------------------------------------------------------------------
      GUI RELATED
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the core layout.
     */
    _createLayout : function()
    {
      // Create main layout
      var dockLayout = new qx.ui.layout.Dock();
      // dockLayout.setSeparatorY("separator-vertical");
      var dockLayoutComposite = new qx.ui.container.Composite(dockLayout);
      this.getRoot().add(dockLayoutComposite, {edge:0});

      // Create header
      this.__header = new feedreader.view.desktop.Header();
      dockLayoutComposite.add(this.__header, {edge: "north"});

      // Create toolbar
      this.__toolBarView = new feedreader.view.desktop.ToolBar(this);
      dockLayoutComposite.add(this.__toolBarView, {edge: "north"});

      // Create horizontal splitpane for tree and list+article view
      this.__horizontalSplitPane = new qx.ui.splitpane.Pane();
      dockLayoutComposite.add(this.__horizontalSplitPane);

      // Create tree view
      this.__treeView = new qx.ui.tree.Tree();
      this.__treeView.setWidth(250);
      this.__treeView.setDecorator("main");
      this.__treeView.setPadding(0);
      this.__horizontalSplitPane.add(this.__treeView, 0);

      // Create vertical splitpane for list and detail view
      this.__verticalSplitPane = new qx.ui.splitpane.Pane("vertical");
      this.__verticalSplitPane.setDecorator(null);
      this.__horizontalSplitPane.add(this.__verticalSplitPane, 1);
      this.__horizontalSplitPane.setAppearance("app-splitpane");

      // Create the list view
      this.__listView = new feedreader.view.desktop.List(this.__feedFolder);
      this.__listView.setHeight(200);
      this.__listView.setDecorator("main");
      this.__verticalSplitPane.add(this.__listView, 0);

      // Create article view
      this.__articleView = new feedreader.view.desktop.Article();
      this.__articleView.setDecorator("main");
      this.__verticalSplitPane.add(this.__articleView, 1);
    },




    /*
    ---------------------------------------------------------------------------
      COMMANDS
    ---------------------------------------------------------------------------
    */

    /**
     * Initialize commands (shortcuts, ...)
     */
    _initializeCommands : function()
    {
      var commands = {};

      commands.reload = new qx.ui.core.Command("Control+R");
      commands.reload.addListener("execute", this.reload, this);

      commands.about = new qx.ui.core.Command("F1");
      commands.about.addListener("execute", this.showAbout, this);

      commands.preferences = new qx.ui.core.Command("Control+P");
      commands.preferences.addListener("execute", this.showPreferences, this);

      commands.addFeed = new qx.ui.core.Command("Control+A");
      commands.addFeed.addListener("execute", this.showAddFeed, this);

      commands.removeFeed = new qx.ui.core.Command("Control+D");
      commands.removeFeed.addListener("execute", this.removeFeed, this);

      this.__commands = commands;
    },


    /**
     * Get the command with the given command id
     *
     * @param commandId {String} the command's command id
     * @return {qx.ui.core.Command} The command
     */
    getCommand : function(commandId) {
      return this.__commands[commandId];
    },





    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a feed to the feeds database.
     *
     * @param title {String} The title of the feed.
     * @param url {String} The url to the feed.
     * @param category {String?""} The category of the new feed
     */
    addFeed : function(title, url, category)
    {
      var feed = new feedreader.model.Feed(title, url, category);
      this.__userFeedFolder.getFeeds().push(feed);

      var loader = feedreader.io.FeedLoader.getInstance();
      loader.load(feed);
    },


    /**
     * Removes the currently selected selected feed from the view.
     */
    removeFeed : function()
    {
      // get the selected feed
      var feed = this.__treeController.getSelection().getItem(0);
      // if there is a feed and its not static
      if (feed && feed.getCategory && feed.getCategory() !== "static") {
        var userFeeds = this.__userFeedFolder.getFeeds();
        // remove it
        for (var i = 0; i < userFeeds.length; i++) {
          if (feed === userFeeds.getItem(i)) {
            userFeeds.splice(i, 1);
            return;
          }
        }
      }
    },


    /**
     * Reloads the feed readers including all feeds.
     */
    reload : function()
    {
      var loader = feedreader.io.FeedLoader.getInstance();
      loader.loadAll(this.__feedFolder);
      // remove the article which is currently on the screen
      this.__articleView.setArticle(null);
    },


    /**
     * Opens the preferences window
     */
    showPreferences : function()
    {
      if (!this.__preferencesWindowLoaded) {
        this.__toolBarView.signalLoading("settings", true);
      }
      qx.io.PartLoader.require(["settings"], function()
      {
        // mark as loaded
        this.__preferencesWindowLoaded = true;

        // if the window is not created
        if (!this.__prefWindow)
        {
          // create it
          this.__prefWindow = new feedreader.view.desktop.PreferenceWindow();
          this.getRoot().add(this.__prefWindow);
        }

        // open the window
        this.__prefWindow.center();
        this.__prefWindow.open();

        // signal the end of the loading
        this.__toolBarView.signalLoading("settings", false);
      }, this);
    },


    /**
     * Shows the about popup for the application.
     * @lint ignoreDeprecated(alert)
     */
    showAbout : function() {
      alert(this.tr("FeedReader (qooxdoo powered)"));
    },


    /**
     * Opens the "add feed" window
     */
    showAddFeed : function()
    {
      if (!this.__addFeedWindowLoaded) {
        this.__toolBarView.signalLoading("addfeed", true);
      }

      qx.io.PartLoader.require(["addfeed"], function()
      {
        this.__addFeedWindowLoaded = true;
        // if the window is not created
        if (!this.__addFeedWindow)
        {
            // create it
          this.__addFeedWindow = new feedreader.view.desktop.AddFeedWindow(this);
          this.getRoot().add(this.__addFeedWindow);
        }

        // open the window
        this.__addFeedWindow.center();
        this.__addFeedWindow.open();

        // signal the end of the loading
        this.__toolBarView.signalLoading("addfeed", false);
      }, this);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__commands = null;
    this._disposeObjects("__toolBarView", "__listView", "__articleView", "__treeView",
        "__feedFolder", "__horizontalSplitPane", "__verticalSplitPane", "__header",
        "__staticFeedFolder", "__userFeedFolder", "__treeController", "__listController",
        "__prefWindow", "__addFeedWindow");
  }
});
