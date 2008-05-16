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
#asset(qx/icon/Oxygen/22/apps/internet-feed-reader.png)

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
    selectedFeed :
    {
      check    : "feedreader.model.Feed",
      nullable : true,
      apply    : "_applySelectedFeed"
    },

    /** The current selected article */
    selectedArticle :
    {
      check    : "feedreader.model.Article",
      nullable : true,
      apply    : "_applySelectedArticle"
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

      qx.util.AliasManager.getInstance().add("feedreader", qx.core.Setting.get("feedreader.resourceUri") + "/feedreader");

      // create the model
      this._createModel();

      // Create application layout
      this._createLayout();
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
    _createModel : function()
    {
      var list = new feedreader.model.FeedList();
      list.addFeed(new feedreader.model.Feed("qooxdoo News", "http://feeds.feedburner.com/qooxdoo/news/content", "static"));
      list.addFeed(new feedreader.model.Feed("Mozilla Developer News", "http://developer.mozilla.org/devnews/index.php/feed/", "static"));
      list.addFeed(new feedreader.model.Feed("JScript Team Blog", "http://blogs.msdn.com/jscript/rss.xml", "static"));
      list.addFeed(new feedreader.model.Feed("Daring Fireball", "http://daringfireball.net/index.xml", "static"));
      list.addFeed(new feedreader.model.Feed("Surfin' Safari", "http://webkit.org/blog/?feed=rss2", "static"));
      list.addFeed(new feedreader.model.Feed("Ajaxian", "http://feeds.feedburner.com/ajaxian", "static"));

      list.addFeed(new feedreader.model.Feed("Heise", "http://www.heise.de/newsticker/heise-atom.xml", "user"));
      list.addFeed(new feedreader.model.Feed("A List Apart", "http://www.alistapart.com/rss.xml", "user"));
      list.addFeed(new feedreader.model.Feed("Apple Insider", "http://www.appleinsider.com/appleinsider.rss", "user"));
      list.addFeed(new feedreader.model.Feed("Opera Desktop Blog", "http://my.opera.com/desktopteam/xml/rss/blog/", "user"));

      this._feedList = list;

      list.addListener("changeSelected", this._onChangeSelectedFeed, this);
    },


    /**
     * Event handler for the change event of feed list.
     *
     * @param e {qx.event.type.Data} The data event of the feed list change.
     */
    _onChangeSelectedFeed : function(e)
    {
      var feed = e.getValue();
      var oldFeed = e.getOldValue();

      if (oldFeed) {
        oldFeed.removeListener("changeSelected", this._onChangeSelectedArticle, this);
      }

      if (feed)
      {
        feed.addListener("changeSelected", this._onChangeSelectedArticle, this);

        this.setSelectedFeed(feed);

        var selectedArticle = feed.getSelected();
        this.setSelectedArticle(selectedArticle);
      }
    },


    /**
     * Event handler. Called on a change of the selected article in the data model.
     *
     * @param e {qx.event.type.Data} The data event of the article change.
     */
    _onChangeSelectedArticle : function(e)
    {
      var article = e.getValue();
      this.setSelectedArticle(article);
    },


    /*
    ---------------------------------------------------------------------------
      GUI RELATED INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the core layout.
     */
    _createLayout : function()
    {
      // Create main layout
      var dockLayoutComposite = new qx.ui.container.Composite(new qx.ui.layout.Dock());
      this.getRoot().add(dockLayoutComposite, {edge:0});

      // Create toolbar
      this._toolBarView = new feedreader.view.ToolBar(this);
      dockLayoutComposite.add(this._toolBarView, {edge: "north"});

      // Create horizontal spliter
      var hBox = new qx.ui.layout.HBox();
      var hBoxComposite = new qx.ui.container.Composite(hBox);

      dockLayoutComposite.add(hBoxComposite, {edge: "center"});

      // Create tree view
      this._treeView = new feedreader.view.Tree(this._feedList);
      hBoxComposite.add(this._treeView);

      // Create vertical spliter
      var vBox = new qx.ui.layout.VBox();
      var vBoxComposite = new qx.ui.container.Composite(vBox);
      vBoxComposite.setBackgroundColor("white");
      hBoxComposite.add(vBoxComposite, {flex: 1});

      // Create the list view
      this._listView = new feedreader.view.List(this._feedList);
      vBoxComposite.add(this._listView, {flex: 1, height : "30%"});

      // Create article view
      this._articleView = new feedreader.view.Article();
      vBoxComposite.add(this._articleView, {flex: 1, height : "70%"});
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
      this._prefWindow.open();
    },


    /**
     * Shows the about popup for the application.
     */
    showAbout : function() {
      alert("qooxdoo based feed reader");
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
      this._addFeedWindow.open();
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelectedFeed : function(value, old) {
      this._listView.setFeed(value);
    },


    // property apply
    _applySelectedArticle : function(value, old)
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
    this._disposeObjects(
      "_toolbarView", "_listView", "_articleView", "_treeView",
      "_feedList"
    );
  }
});
