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

#include(qx.theme.Classic)
#include(qx.theme.Modern)

#asset(feedreader/css/*)
#asset(feedreader/images/*)

#asset(qx/icon/Tango/22/apps/internet-feed-reader.png)

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
      this._dateFormat = new qx.util.format.DateFormat();
      // Add some static feeds
      this.addFeed("qooxdoo News", "http://feeds.feedburner.com/qooxdoo/news/content", true);
      this.addFeed("Mozilla Developer News", "http://developer.mozilla.org/devnews/index.php/feed/", true);
      this.addFeed("JScript Team Blog", "http://blogs.msdn.com/jscript/rss.xml", true);
      this.addFeed("Daring Fireball", "http://daringfireball.net/index.xml", true);
      this.addFeed("Surfin' Safari", "http://webkit.org/blog/?feed=rss2", true);
      this.addFeed("Ajaxian", "http://feeds.feedburner.com/ajaxian", true);

      // Define alias for custom resource path
      //qx.util.AliasManager.getInstance().add("feedreader", qx.core.Setting.get("feedreader.resourceUri") + "/feedreader");

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


    /**
     * Returns the feed with the given title.
     * If no feed could be found, null will be returned.
     *
     * @param title {String} The title of the searched feed.
     * @return The searched feed.
     */
    getFeedDataByTitle : function(title)
    {
      var db = this._feeds;
      var entry;

      // go threw all feeds
      for (var url in db)
      {
        entry = db[url];

        if (entry.title == title) {
          // return the feed if the title matches
          return db[url];
        }
      }

      // return null, if no feed could be found with the fitting title
      return null;
    },


    /**
     * Adds a feed to the feeds database.
     *
     * @param title {String} The title of the feed.
     * @param url {String} The url to the feed.
     */
    addFeed : function(title, url, predefined)
    {
      // get the database
      var db = this._feeds;

      // if the feed already exists
      if (db[url])
      {
        // alert the user and return
        alert("The feed " + title + " is already in your subscription list.");
        return;
      }

      // Add the feed to the database
      db[url] =
      {
        title      : title,
        items      : [],
        loader     : qx.lang.Function.bind(this._loadJsonFeed, this, url),
        added      : new Date,
        predefined : predefined,
        loading    : false,
        url        : url
      };

      // if there is already a tree
      if (this._treeView) {
        // add the feed to the tree
        this._treeView.addFeed(url);
        // get the data for the feed
        this._fetchDataForFeed(url);
      }
    },


    /**
     * Removes the current selected feed from the view.
     */
    removeFeed : function()
    {
      var currentSelectedFolder = this._treeView.getSelectedItem();

      // is a feed is selected
      if (currentSelectedFolder)
      {
        var currentUrl = currentSelectedFolder.getUserData("url");
        if (currentUrl && this._feeds[currentUrl].predefined) {
          alert("Can not remove static feeds.");
          return;
        }

        // remove the feed from the db
        var url = currentSelectedFolder.getUserData("url");
        if (this._feeds[url]) {
          delete this._feeds[url];
        }

        // remove the folder from the tree
        if (currentSelectedFolder.getParent() != this._treeView.getRoot()) {
          currentSelectedFolder.getParent().remove(currentSelectedFolder);
        }

        // reset the list view
        this._listView.removeAll();

        // reset the article view
        this._articleView.setArticle(null);
      }
    },


    /**
     * Selects the feed stored with the given url.
     *
     * @param url {String} The url of the feed to select.
     */
    selectFeed : function(url)
    {
      var value = this._feeds[url];

      // if the selected feed is loading
      if (value && value.loading)
      {
        // if the list is shown
        if (this._stack.getSelected != this._listView)
        {
          // show the loading image
          this._stack.next();
        }
      }

      value ? this.setSelectedFeed(value) : this.resetSelectedFeed();
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
      var dockLayout = new qx.ui.layout.Dock();
      var dockLayoutComposite = new qx.ui.container.Composite(dockLayout);
      this.getRoot().addMain(dockLayoutComposite, true);

      // Create toolbar
      this._toolBarView = new feedreader.view.ToolBar(this);
      dockLayoutComposite.add(this._toolBarView, {edge: "north"});

      // Create horizontal spliter
      var hBox = new qx.ui.layout.HBox();
      var hBoxComposite = new qx.ui.container.Composite(hBox);

      dockLayoutComposite.add(hBoxComposite, {edge: "center"});

      // Create tree view
      this._treeView = new feedreader.view.Tree(this);
      hBoxComposite.add(this._treeView);

      // Create vertical spliter
      var vBox = new qx.ui.layout.VBox();
      var vBoxComposite = new qx.ui.container.Composite(vBox);
      vBoxComposite.setBackgroundColor("white");
      hBoxComposite.add(vBoxComposite, {flex: 1});

      // Create the vBox for the list and header of the list
      var listVBox = new qx.ui.layout.VBox();
      var listVBoxComposite = new qx.ui.container.Composite(listVBox);
      vBoxComposite.add(listVBoxComposite, {flex: 1, height : "30%"});

      // Create the header of the list
      var listHeader = new qx.ui.basic.Label("Posts");
      listHeader.setBackgroundColor("background-light");
      listHeader.setPadding(5);
      listHeader.setDecorator("line-bottom");
      listHeader.setAllowGrowX(true);
      listHeader.setFont("bold");
      listVBoxComposite.add(listHeader);

      // Create the stack for the list
      this._stack = new qx.ui.container.Stack();
      listVBoxComposite.add(this._stack, {flex: 1});

      // Create the list view
      this._listView = new feedreader.view.List(this);
      this._stack.add(this._listView);

      // Create the loading image for the list
      var imageHBoxComposite = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, "center"));
      imageHBoxComposite.setBackgroundColor("background-light");
      this._listLoadImage = new qx.ui.basic.Image("feedreader/images/loading66.gif");
      this._listLoadImage.setAlignY("middle");
      imageHBoxComposite.add(this._listLoadImage);
      this._stack.add(imageHBoxComposite);

      // Create article view
      this._articleView = new feedreader.view.Article();
      vBoxComposite.add(this._articleView, {flex: 1, height : "70%"});
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
     *
     */
    showAddFeed : function() {
      // if the window is not created
      if (!this._addFeedWindow) {
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
    _applySelectedFeed : function(value, old)
    {
      if (value)
      {
        // Update the list with new data
        this._listView.removeAll();

        for (var i = 0; i < value.items.length; i++)
        {
          var title = value.items[i].title;
          var listItem = new qx.ui.form.ListItem(title);
          listItem.setUserData("id", i);
          this._listView.add(listItem);
        }

        // Initially select first article
        var firstItem = this._listView.getChildren()[0];
        if (firstItem) {
          this._listView.select(firstItem);
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

    /**
     * Reloads the feed readers including all feeds.
     */
    reload : function() {
      // if a feed is selected
      if (this.getSelectedFeed()) {
        // if the list is on the screen
        if (this._stack.getSelected() == this._listView) {
          // show the loading image
          this._stack.next();
        }
      }
      this._fetchData();
    },


    /**
     * Fetches all feed data using the qooxdoo proxy.
     */
    _fetchData : function()
    {
      for (var url in this._feeds)
      {
        this._fetchDataForFeed(url);
      }
    },


    /**
     * Fetches the feed data for the given url.
     * @param url {String} The url to the feed.
     */
    _fetchDataForFeed : function(url)
    {
      var db = this._feeds;
      var proxy, entry, req;
      entry = db[url];

      // mark the feed as loading
      entry.loading = true;

      // replace the folder icon
      var folder = this._treeView.getFolderByUrl(url);
      if (folder) {
        folder.setIcon("feedreader/images/loading22.gif");
      }

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
    },

    /**
     * This is used as a callback from {@link _fetchFeeds} to handle
     * JSON processing a display updates after specific feed data
     * arrives.
     *
     * @param url {String} The URL which was loaded
     * @param response {qx.io.remote.Response} Response object
     */
    _loadJsonFeed : function(url, response)
    {
      // Link to feed entry
      var feed = this._feeds[url];

      // if the feed has already been deleted
      if (!feed) {
        return;
      }

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

        // change the tree icon (finished loading)
        var folder = this._treeView.getFolderByUrl(url);
        folder.setIcon("icon/22/apps/internet-feed-reader.png");

        // if the list is not shown
        if (this._stack.getSelected() != this._listView) {
          // if a feed is selected
          if (this.getSelectedFeed()) {
            var selectedUrl = this.getSelectedFeed().url;
            // if the current feed is selected
            if (selectedUrl == url) {
              // show the list
              this._stack.next();
            }
          }
        }
        // mark the feed as not loading
        feed.loading = false;
      }
      catch(ex)
      {
        var treeFolder = this._treeView.getFolderByUrl(url);
        if (treeFolder) {
          this._treeView.getRoot().remove(treeFolder);
          alert("Could not parse feed: " + url);
        }
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
    this._disposeObjects("_listLoadImage", "_stack", "_toolbarView", "_headerView", "_listView", "_articleView", "_treeView");
  }
});
