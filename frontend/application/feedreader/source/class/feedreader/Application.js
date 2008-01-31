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

************************************************************************ */

/* ************************************************************************

#resource(feedreader.css:css)
#resource(feedreader.images:images)
#embed(feedreader.css/*)
#embed(feedreader.images/*)
#embed(qx.icontheme/16/actions/help-about.png)
#embed(qx.icontheme/16/actions/view-refresh.png)
#embed(qx.icontheme/16/apps/preferences.png)

************************************************************************ */

/**
 * qooxdoo news reader Application class.
 */
qx.Class.define("feedreader.Application",
{
  extend : qx.application.Gui,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    selectedFeed :
    {
      check    : "Object",
      nullable : true,
      apply    : "_applySelectedFeed"
    },

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
     *
     * @type member
     * @return {void}
     */
    main : function()
    {
      this.base(arguments);

      // Initialize data field
      this._feeds = {};

      // Initialialize date format
      this._dateFormat = new qx.util.format.DateFormat;

      // Add some static feeds
      this.addFeed("qooxdoo Blog", "http://feeds.feedburner.com/qooxdoo/blog/content");
      this.addFeed("qooxdoo News", "http://feeds.feedburner.com/qooxdoo/news/content");
      this.addFeed("Mozilla Developer News", "http://developer.mozilla.org/devnews/index.php/feed/");
      this.addFeed("JScript Team Blog", "http://blogs.msdn.com/jscript/rss.xml");
      this.addFeed("Daring Fireball", "http://daringfireball.net/index.xml");
      this.addFeed("Surfin' Safari", "http://webkit.org/blog/?feed=rss2");
      this.addFeed("Ajaxian", "http://feeds.feedburner.com/ajaxian");
      this.addFeed("The WHATWG Blog", "http://blog.whatwg.org/feed/");

      // Define alias for custom resource path
      qx.io.Alias.getInstance().add("feedreader", qx.core.Setting.get("feedreader.resourceUri"));

      // Include CSS file
      qx.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("feedreader/css/reader.css"));

      // Increase parallel requests
      qx.io.remote.RequestQueue.getInstance().setMaxConcurrentRequests(10);

      // Create Application Layout
      this._createLayout();

      // React on theme selection changes
      qx.theme.manager.Meta.getInstance().addEventListener("changeTheme", this._applyCssTheme, this);
      this._applyCssTheme();
    },


    /**
     * Executes after the preloading of images and initial layout rendering is done.
     * It is always a good idea to load data in the next step because the GUI feels better then (Outlook effect).
     *
     * @type member
     * @return {void}
     */
    _postload : function()
    {
      this.base(arguments);

      // Fetch feed data
      this._fetchData();
    },




    /*
    ---------------------------------------------------------------------------
      FEED MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFeeds : function() {
      return this._feeds;
    },


    /**
     * TODOC
     *
     * @type member
     * @param url {var} TODOC
     * @return {var} TODOC
     */
    getFeedDataByUrl : function(url)
    {
      var db = this._feeds;
      return db[url] || null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param title {var} TODOC
     * @return {var | null} TODOC
     */
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


    /**
     * Adds a new feed
     *
     * @type member
     * @param title {var} TODOC
     * @param url {var} TODOC
     * @return {void}
     */
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

      if (this._tree) {
        this._tree.refreshView(url);
      }
    },


    /**
     * Removes a feed by given URL or title
     *
     * @type member
     * @param url {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    removeFeed : function(url)
    {
      var db = this._feeds;

      if (db[url])
      {
        delete db[url];

        if (this._tree) {
          this._tree.refreshView(url);
        }

        return;
      }

      throw new Error("The feed could not be found!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param url {var} TODOC
     * @return {void}
     */
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
     *
     * @type member
     * @return {void}
     */
    _createLayout : function()
    {
      // Create main layout
      var dockLayout = new qx.ui.layout.DockLayout();
      dockLayout.setEdge(0);
      dockLayout.addToDocument();

      // Create header
      this._headerView = new feedreader.view.Header;
      dockLayout.addTop(this._headerView);

      // Create toolbar
      this._toolBarView = new feedreader.view.ToolBar(this);
      dockLayout.addTop(this._toolBarView);

      // Create horizontal split pane
      var horSplitPane = new qx.ui.splitpane.HorizontalSplitPane(200, "1*");
      dockLayout.add(horSplitPane);

      // Create tree view
      this._treeView = new feedreader.view.Tree(this);
      horSplitPane.addLeft(this._treeView);

      // Create vertical split pane
      var vertSplitPane = new qx.ui.splitpane.VerticalSplitPane("1*", "2*");
      vertSplitPane.setEdge(0);
      vertSplitPane.setBorder("line-left");
      horSplitPane.addRight(vertSplitPane);

      // Create table view
      this._tableView = new feedreader.view.Table(this);
      vertSplitPane.addTop(this._tableView);

      // Create article view
      this._articleView = new feedreader.view.Article;
      vertSplitPane.addBottom(this._articleView);
    },


    /**
     * Syncs CSS theme to selected meta theme
     *
     * @type member
     * @return {void}
     */
    _applyCssTheme : function() {
      document.body.className = qx.theme.manager.Meta.getInstance().getTheme() == qx.theme.Ext ? "Ext" : "Classic";
    },


    /**
     * Opens the preferences window
     *
     * @type member
     * @return {void}
     */
    showPreferences : function()
    {
      if (!this._prefWindow) {
        this._prefWindow = new feedreader.PreferenceWindow;
      }

      this._prefWindow.open();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    showAbout : function() {
      alert("qooxdoo based feed reader");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    showAddFeed : function() {
      alert("Missing implementation");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    showRemoveFeed : function() {
      alert("Missing implementation");
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param old {var} TODOC
     * @return {void}
     */
    _applySelectedFeed : function(value, old)
    {
      if (old)
      {
        // Store old selection
        old.selection = this._tableView.getSelectionModel().getAnchorSelectionIndex();
      }

      if (value)
      {
        // Update model with new data
        this._tableView.getTableModel().setDataAsMapArray(value.items);

        if (value.selection != null)
        {
          // If a selection was stored, recover it
          this._tableView.getSelectionModel().setSelectionInterval(value.selection, value.selection);
          delete value.selection;
        }
        else
        {
          // Initially select first article
          this._tableView.getSelectionModel().setSelectionInterval(0, 0);
        }
      }
      else
      {
        // Clean up model
        this._tableView.getTableModel().setDataAsMapArray([]);

        // Clean up article
        this._articleView.resetArticle();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param old {var} TODOC
     * @return {void}
     */
    _applySelectedArticle : function(value, old) {
      this._articleView.setArticle(value);
    },




    /*
    ---------------------------------------------------------------------------
      DATA RELATED INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    reload : function() {
      this._fetchData();
    },


    /**
     * Load feed data from remote servers
     *
     * @type member
     * @return {void}
     */
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
        req = new qx.io.remote.Request(proxy, "GET", qx.util.Mime.TEXT);

        // Json data is useable cross-domain (in fact it is jsonp in this case)
        req.setCrossDomain(true);

        // Wait longer on slow connections (normally always a lot of data)
        req.setTimeout(30000);

        // Add the listener
        req.addEventListener("completed", entry.loader);

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

      // Normalize json feed data to item list
      var items = feedreader.FeedParser.parseFeed(json);

      // Post processing items
      for (var i=0, l=items.length; i<l; i++) {
        items[i].date = this._dateFormat.format(items[i].date);
      }

      // Store items
      feed.items = items;

      // Update display
      if (this.getSelectedFeed() == feed) {
        this._applySelectedFeed(feed);
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
    this._disposeObjects("_toolbarView", "_headerView", "_tableView", "_articleView", "_treeView");
  }
});
