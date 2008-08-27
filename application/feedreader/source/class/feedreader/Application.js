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

/**
 * The feed reader's main application class.
 */
qx.Class.define("feedreader.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The current selected feed */
    feed :
    {
      check    : "feedreader.model.Feed",
      nullable : true,
      apply    : "_applyFeed"
    },


    /** The current selected article */
    article :
    {
      check    : "feedreader.model.Article",
      nullable : true,
      apply    : "_applyArticle"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
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
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      // Initialize the model
      this._initializeModel();

      // Initialize commands
      this._initializeCommands();

      // Create application layout
      this._createLayout();

      // Add static feeds
      this._feedList.addFeed(new feedreader.model.Feed("qooxdoo News", "http://feedproxy.feedburner.com/qooxdoo/news/content", "static"));
      this._feedList.addFeed(new feedreader.model.Feed("Mozilla Developer News", "http://developer.mozilla.org/devnews/index.php/feed/", "static"));
      this._feedList.addFeed(new feedreader.model.Feed("JScript Team Blog", "http://blogs.msdn.com/jscript/rss.xml", "static"));
      this._feedList.addFeed(new feedreader.model.Feed("Daring Fireball", "http://daringfireball.net/index.xml", "static"));
      this._feedList.addFeed(new feedreader.model.Feed("Surfin' Safari", "http://webkit.org/blog/?feed=rss2", "static"));
      this._feedList.addFeed(new feedreader.model.Feed("Ajaxian", "http://feedproxy.feedburner.com/ajaxian", "static"));

      // Add user feeds
      this._feedList.addFeed(new feedreader.model.Feed("Heise", "http://www.heise.de/newsticker/heise-atom.xml", "user"));
      this._feedList.addFeed(new feedreader.model.Feed("A List Apart", "http://www.alistapart.com/rss.xml", "user"));
      this._feedList.addFeed(new feedreader.model.Feed("Apple Insider", "http://www.appleinsider.com/appleinsider.rss", "user"));
      this._feedList.addFeed(new feedreader.model.Feed("Opera Desktop Blog", "http://my.opera.com/desktopteam/xml/rss/blog/", "user"));
    },


    /**
     * Invokes a fetching of the data.
     */
    finalize : function()
    {
      this.base(arguments);
      this.reload();
    },




    /*
    ---------------------------------------------------------------------------
      MODEL RELATED
    ---------------------------------------------------------------------------
    */

    /**
     * Initialize the feed data model
     */
    _initializeModel : function()
    {
      this._feedList = new feedreader.model.FeedList();

      // Register listener
      this._feedList.addListener("change", this._onSelectFeed, this);
    },


    /**
     * Event handler for the change event of feed list.
     *
     * @param e {qx.event.type.Data} The data event of the feed list change.
     */
    _onSelectFeed : function(e)
    {
      var feed = e.getData();
      var oldFeed = e.getOldData();

      if (oldFeed) {
        oldFeed.removeListener("change", this._onSelectArticle, this);
      }

      this.setFeed(feed);

      if (feed)
      {
        feed.addListener("change", this._onSelectArticle, this);

        var selectedArticle = feed.getSelected();
        this.setArticle(selectedArticle);
      }
    },


    /**
     * Event handler. Called on a change of the selected article in the data model.
     *
     * @param e {qx.event.type.Data} The data event of the article change.
     */
    _onSelectArticle : function(e)
    {
      var article = e.getData();
      this.setArticle(article);
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
      dockLayout.setSeparatorY("separator-vertical");
      var dockLayoutComposite = new qx.ui.container.Composite(dockLayout);
      this.getRoot().add(dockLayoutComposite, {edge:0});

      // Create header
      this._header = new feedreader.view.Header();
      dockLayoutComposite.add(this._header, {edge: "north"});

      // Create toolbar
      this._toolBarView = new feedreader.view.ToolBar(this);
      dockLayoutComposite.add(this._toolBarView, {edge: "north"});

      // Create horizontal splitpane for tree and list+article view
      this._horizontalSplitPane = new qx.ui.splitpane.Pane();
      dockLayoutComposite.add(this._horizontalSplitPane);

      // Create tree view
      this._treeView = new feedreader.view.Tree(this._feedList);
      this._treeView.setWidth(250);
      this._horizontalSplitPane.add(this._treeView, 0);

      // Create vertical splitpane for list and detail view
      this._verticalSplitPane = new qx.ui.splitpane.Pane("vertical");
      this._verticalSplitPane.setDecorator(null);
      this._horizontalSplitPane.add(this._verticalSplitPane, 1);

      // Create the list view
      this._listView = new feedreader.view.List(this._feedList);
      this._listView.setHeight(200);
      this._listView.setDecorator("main");
      this._verticalSplitPane.add(this._listView, 0);

      // Create article view
      this._articleView = new feedreader.view.Article();
      this._articleView.setDecorator("main");
      this._verticalSplitPane.add(this._articleView, 1);
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

      commands.reload = new qx.event.Command("Control+R");
      commands.reload.addListener("execute", this.reload, this);

      commands.about = new qx.event.Command("F1");
      commands.about.addListener("execute", this.showAbout, this);

      commands.preferences = new qx.event.Command("Control+P");
      commands.preferences.addListener("execute", this.showPreferences, this);

      commands.addFeed = new qx.event.Command("Control+A");
      commands.addFeed.addListener("execute", this.showAddFeed, this);

      commands.removeFeed = new qx.event.Command("Control+D");
      commands.removeFeed.addListener("execute", this.removeFeed, this);

      this.__commands = commands;
    },


    /**
     * Get the command with the given command id
     *
     * @param commandId {String} the command's command id
     * @return {qx.event.Command} The command
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
      this._feedList.addFeed(feed);

      var loader = feedreader.io.FeedLoader.getInstance();
      loader.load(feed);
    },


    /**
     * Removes the currently selected selected feed from the view.
     */
    removeFeed : function()
    {
      var feed = this._feedList.getSelected();
      if (feed && feed.getCategory() !== "static") {
        this._feedList.removeFeed(feed);
      }
    },


    /**
     * Reloads the feed readers including all feeds.
     */
    reload : function()
    {
      var loader = feedreader.io.FeedLoader.getInstance();
      loader.loadAll(this._feedList);
    },


    /**
     * Opens the preferences window
     */
    showPreferences : function()
    {
      // if the window is not created
      if (!this._prefWindow) {
        // create it
        this._prefWindow = new feedreader.view.PreferenceWindow();
        this.getRoot().add(this._prefWindow);
      }

      // open the window
      this._prefWindow.center();
      this._prefWindow.open();
    },


    /**
     * Shows the about popup for the application.
     */
    showAbout : function() {
      alert(this.tr("FeedReader (qooxdoo powered)"));
    },


    /**
     * Opens the "add feed" window
     */
    showAddFeed : function()
    {
      // if the window is not created
      if (!this._addFeedWindow)
      {
        // create it
        this._addFeedWindow = new feedreader.view.AddFeedWindow(this);
        this.getRoot().add(this._addFeedWindow);
      }

      // open the window
      this._addFeedWindow.center();
      this._addFeedWindow.open();
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyFeed : function(value, old)
    {
      this._listView.setFeed(value);
      this.getCommand("removeFeed").setEnabled(!!(value && value.getCategory() !== "static"));
    },


    // property apply
    _applyArticle : function(value, old)
    {
      if (value) {
        this._articleView.setArticle(value);
      } else {
        this._articleView.resetArticle();
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
    this._disposeFields("__commands");
    this._disposeObjects("_toolBarView", "_listView", "_articleView", "_treeView", 
        "_feedList", "_horizontalSplitPane", "_verticalSplitPane");
  }
});
