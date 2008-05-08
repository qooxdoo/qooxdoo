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

#resource(feedreader.css:feedreader/css)
#resource(feedreader.images:feedreader/images)
#embed(feedreader.css/*)
#embed(feedreader.images/*)

#include(qx.theme.Classic)

#asset(feedreader/css/*)
#asset(feedreader/images/*)

************************************************************************ */


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
      check    : "Object",
      nullable : true,
      apply    : "_applySelectedFeed"
    },

    /** The current selected article */
    selectedArticle :
    {
      check    : "Object",
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

      // Initialize data field
      this._feeds = {};

      // Initialialize date format
      this._dateFormat = new qx.util.format.DateFormat;
      // Add some static feeds
      this.addFeed("qooxdoo News", "http://feeds.feedburner.com/qooxdoo/news/content");
      this.addFeed("Mozilla Developer News", "http://developer.mozilla.org/devnews/index.php/feed/");
      this.addFeed("JScript Team Blog", "http://blogs.msdn.com/jscript/rss.xml");
      this.addFeed("Daring Fireball", "http://daringfireball.net/index.xml");
      this.addFeed("Surfin' Safari", "http://webkit.org/blog/?feed=rss2");
      this.addFeed("Ajaxian", "http://feeds.feedburner.com/ajaxian");

      // Define alias for custom resource path
      qx.util.AliasManager.getInstance().add("feedreader", qx.core.Setting.get("feedreader.resourceUri") + "/feedreader");

      // Include CSS file
      qx.bom.Stylesheet.includeFile(qx.util.AliasManager.getInstance().resolve("feedreader/css/reader.css"));

      // Increase parallel requests
      qx.io.remote.RequestQueue.getInstance().setMaxConcurrentRequests(10);

      // Create Application Layout
      this._createLayout();

      // Load data file
      qx.event.Timer.once(this._load, this, 0);
    },


    /**
     * Invokes a fetching of the data.
     */
    _load : function()
    {
      // Fetch feed data
      this._fetchData();
    },


    /*
    ---------------------------------------------------------------------------
      FEED MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Getter for the feeds database.
     *
     * @return {Map} A map containing all feeds.
     */
    getFeeds : function() {
      return this._feeds;
    },


    /**
     * Returns the feed addressed by the given url.
     *
     * @param url {String} The url of the feed to return.
     * @return {Map} Map containing the feed which belongs to the given url.
     */
    getFeedDataByUrl : function(url)
    {
      var db = this._feeds;
      return db[url] || null;
    },



    getFeedDataByTitle : function(title)
    {
      var db = this._feeds;
      var entry;

      for (var url in db)
      {
        entry = db[url];

        if (entry.title == title) {
          return db[url];
        }
      }

      return null;
    },



    addFeed : function(title, url)
    {
      var db = this._feeds;

      if (db[url])
      {
        alert("The feed " + title + " is already in your subscription list.");
        return;
      }

      db[url] =
      {
        title  : title,
        items  : [],
        loader : qx.lang.Function.bind(this._loadJsonFeed, this, url),
        added  : new Date
      };

      if (this._treeView) {
        this._treeView.refreshView();
      }
    },



    removeFeed : function(url)
    {
      var db = this._feeds;

      if (db[url])
      {
        delete db[url];

        if (this._treeView) {
          this._treeView.refreshView();
        }

        return;
      }

      throw new Error("The feed could not be found!");
    },



    selectFeed : function(url)
    {
      var value = this._feeds[url];
      value ? this.setSelectedFeed(value) : this.resetSelectedFeed();
    },




    /*
    ---------------------------------------------------------------------------
      GUI RELATED INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the core layout
     */
    _createLayout : function()
    {
      // Create main layout
      var dockLayout = new qx.ui.layout.Dock();
      var dockLayoutComposite = new qx.ui.container.Composite(dockLayout);
      this.getRoot().addMain(dockLayoutComposite, true);
      // Create header
      this._headerView = new feedreader.view.Header();
      dockLayoutComposite.add(this._headerView, {edge: "north"});

      // Create toolbar
      this._toolBarView = new feedreader.view.ToolBar(this);
      dockLayoutComposite.add(this._toolBarView, {edge: "north"});

      // Create horizontal spliter
      var hBox = new qx.ui.layout.HBox();
      var hBoxComposite = new qx.ui.container.Composite(hBox);
      hBoxComposite.setBackgroundColor("blue");
      dockLayoutComposite.add(hBoxComposite, {edge: "center"});

      // Create tree view
      this._treeView = new feedreader.view.Tree(this);
      hBoxComposite.add(this._treeView);

      // Create vertical spliter
      var vBox = new qx.ui.layout.VBox();
      var vBoxComposite = new qx.ui.container.Composite(vBox);
      vBoxComposite.setBackgroundColor("white");
      hBoxComposite.add(vBoxComposite, {flex: 1});

      // Create the list view
      this._listView = new feedreader.view.List(this);
      vBoxComposite.add(this._listView, {flex: 1});

      // Create article view
      this._articleView = new feedreader.view.Article();
      vBoxComposite.add(this._articleView, {flex: 2});
    },


    /**
     * Opens the preferences window
     */
    showPreferences : function()
    {
      if (!this._prefWindow) {
        this._prefWindow = new feedreader.PreferenceWindow();
        this.getRoot().add(this._prefWindow);
      }

      this._prefWindow.open();
    },



    showAbout : function() {
      alert("qooxdoo based feed reader");
    },



    showAddFeed : function() {
      alert("Missing implementation");
    },


    showRemoveFeed : function() {
      alert("Missing implementation");
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelectedFeed : function(value, old)
    {
      if (old)
      {
        // Store old selection
        old.selection = this._listView.indexOf(this._listView.getSelectedItem());
        old.offset = this._listView.getScrollTop();
      }

      if (value)
      {
        // Update the list with new data
        this._listView.removeAll();
        for (var i = 0; i < value.items.length; i++) {
          var title = value.items[i].title;
          var listItem = new qx.ui.form.ListItem(title);
          listItem.setUserData("id", i);
          this._listView.add(listItem);
        }

        if (value.selection != null)
        {
          // If a selection was stored, recover it
          this._listView.select(this._listView.getChildren()[value.selection]);
          this._listView.setScrollTop(value.offset);

          delete value.selection;
          delete value.offset;
        }
        else
        {
          // Initially select first article
          var firstItem = this._listView.getChildren()[0];
          if (firstItem) {
            this._listView.select(firstItem);
          }
        }
      }
      else
      {
        // Clean up model
        this._listView.removeAll();

        // Clean up article
        this._articleView.resetArticle();
      }
    },


    // property apply
    _applySelectedArticle : function(value, old) {
      this._articleView.setArticle(value);
    },




    /*
    ---------------------------------------------------------------------------
      DATA RELATED INTERNAL API
    ---------------------------------------------------------------------------
    */


    reload : function() {
      this._fetchData();
    },


    _fetchData : function()
    {
      var db = this._feeds;
      var proxy, entry, req;

      for (var url in db)
      {
        entry = db[url];

        // Redirect request through proxy (required for cross-domain loading)
        // The proxy also translates the data from XML to JSON
        proxy = "http://resources.qooxdoo.org/proxy.php?mode=jsonp&proxy=" + encodeURIComponent(url);

        // Create request object
        req = new qx.io.remote.Request(proxy, "GET", qx.legacy.util.Mime.TEXT);

        // Json data is useable cross-domain (in fact it is jsonp in this case)
        req.setCrossDomain(true);

        // Wait longer on slow connections (normally always a lot of data)
        req.setTimeout(30000);

        // Add the listener
        req.addListener("completed", entry.loader);

        // And finally send the request
        req.send();
      }
    },


    /**
     * This is used as a callback from {@link _fetchFeeds} to handle
     * JSON processing a display updates after specific feed data
     * arrives.
     *
     * @type member
     * @param url {String} The URL which was loaded
     * @param response {qx.io.remote.Response} Response object
     * @return {void}
     */
    _loadJsonFeed : function(url, response)
    {
      // Link to feed entry
      var feed = this._feeds[url];

      // Read content
      var json = response.getContent();


      try {
        // Normalize json feed data to item list
        var items = feedreader.FeedParser.parseFeed(json);

        // Post processing items
        for (var i=0, l=items.length; i<l; i++) {
          if (items[i].date) {
            items[i].date = this._dateFormat.format(items[i].date);
          }
        }

        // Store items
        feed.items = items;

        // Update display
        if (this.getSelectedFeed() == feed) {
          this._applySelectedFeed(feed);
        }
      }
      catch(ex)
      {
        this.error("Could not parse feed: " + url);
      }
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : { "feedreader.resourceUri" : "./resource" },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("_feeds");
    this._disposeObjects("_toolbarView", "_headerView", "_listView", "_articleView", "_treeView");
  }
});
