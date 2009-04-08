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

      qx.io2.PartLoader.getInstance().addListener("partLoaded", function(e) {
        this.debug("part loaded: " + e.getData().getName());
      }, this);
      
      // Initialize commands
      this._initializeCommands();

      // Create application layout
      this._createLayout();
      
      // Initialize the model
      this._initializeModel();    
      
      // Initialize the bindings
      this._setUpBinding(); 
      
      // set up the default view of the tree
      this._treeView.getRoot().setOpen(true);
      this._treeView.getRoot().getChildren()[0].setOpen(true);
      this._treeView.getRoot().getChildren()[1].setOpen(true);
      this._treeView.setHideRoot(true);      
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
      // create the root folder
      this._feedFolder = new feedreader.model.FeedFolder("Feeds");
      
      // Add static feeds
      this._staticFeedFolder = 
        new feedreader.model.FeedFolder(this.tr("Static Feeds"));
      this._feedFolder.getFeeds().push(this._staticFeedFolder);
      this._staticFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "qooxdoo News", "http://feeds2.feedburner.com/qooxdoo/news/content", "static"
        )
      );      
      this._staticFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "JScript Team Blog", "http://blogs.msdn.com/jscript/rss.xml", "static"
        )
      );
      this._staticFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Daring Fireball", "http://daringfireball.net/index.xml", "static"
        )
      );
      this._staticFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Surfin' Safari", "http://webkit.org/blog/?feed=rss2", "static"
        )
      );
      this._staticFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Ajaxian","http://feeds2.feedburner.com/ajaxian", "static"
        )
      );

      // Add user feeds
      this._userFeedFolder = 
        new feedreader.model.FeedFolder(this.tr("User Feeds"));
      this._feedFolder.getFeeds().push(this._userFeedFolder);
      this._userFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Heise", "http://www.heise.de/newsticker/heise-atom.xml", "user"
        )
      );
      this._userFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "A List Apart", "http://www.alistapart.com/rss.xml", "user"
        )
      );
      this._userFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Apple Insider", "http://www.appleinsider.com/appleinsider.rss", "user"
        )
      );
      this._userFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Opera Desktop Blog", "http://my.opera.com/desktopteam/xml/rss/blog/", "user"
        )
      );      
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
        this._feedFolder, this._treeView, "feeds", "title"
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
        null, this._listView.getList(), "title"
      );
      // bind the first selection of the tree as the model of the list
      this.__treeController.bind(
        "selection[0].articles", this.__listController, "model"
      );
      
      // bind the article //
      // bind the first selection of the list to the article view
      this.__listController.bind("selection[0]", this._articleView, "article"); 
      
      // register a handler for the change of the list selection
      this.__listController.getSelection().addListener(
        "change" , this._listControllerChange, this
      );
      // register a handler for the change of the trr selection
      this.__treeController.getSelection().addListener(
        "change", this._treeControllerChange, this
      ); 
      
      // binding for showing the loading image in the list
      var options = {converter: this._state2loadingConverter};
      this.__treeController.bind(
        "selection[0].state", this._listView, "loading", options
      );
      
      // bind the enabled property of the remove feed button
      options = {converter: this._category2enabledConverter};
      this.__treeController.bind(
        "selection[0].category", this._toolBarView.getRemoveButton(), "enabled", options
      );      
      
    },
    
    
    /**
     * Converts the category to a boolean for the enabled status of the remove 
     * button.
     */
    _category2enabledConverter : function(data) {
      if (data == "user") {
        return true;
      }
      return false;   
    },
    
    
    /**
     * Converter function which converts the state of a feed to a icon url.
     */
    _state2iconConverter : function(value) {
      if (value == "new" || value == "loading") {
        return "feedreader/images/loading22.gif";
      }
      else if (value == "loaded") {
        return "icon/22/apps/internet-feed-reader.png";
      } else if (value == "error") {
        return "icon/22/actions/process-stop.png";
      }
      return null;
    },
    
    
    /**
     * Converter function which converts the state of a feed to a loading 
     * indicator in the list view.
     */
    _state2loadingConverter : function(data) {
      if (data == "new" || data == "loading") {
        return true;
      }
      return false;
    },
    
    
    /**
     * Event handler for a change of the selection of the list.
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
     */
    _treeControllerChange : function(ev) {
      // only act if something new is selected
      if (ev.getData().type != "add") {
        return;
      }
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
        this.__listController.getSelection().push(feed.getSelectedArticle());
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
      this._treeView = new qx.ui.tree.Tree();
      this._treeView.setWidth(250);
      this._treeView.setBackgroundColor("white");
      this._horizontalSplitPane.add(this._treeView, 0);

      // Create vertical splitpane for list and detail view
      this._verticalSplitPane = new qx.ui.splitpane.Pane("vertical");
      this._verticalSplitPane.setDecorator(null);
      this._horizontalSplitPane.add(this._verticalSplitPane, 1);

      // Create the list view
      this._listView = new feedreader.view.List(this._feedFolder);
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
      this._userFeedFolder.getFeeds().push(feed);

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
        var userFeeds = this._userFeedFolder.getFeeds();
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
      loader.loadAll(this._feedFolder);
    },


    /**
     * Opens the preferences window
     */
    showPreferences : function()
    {
      qx.io2.PartLoader.require(["settings"], function()
      {
        // if the window is not created
        if (!this._prefWindow)
        {
          // create it
          this._prefWindow = new feedreader.view.PreferenceWindow();
          this.getRoot().add(this._prefWindow);
          this.showPreferences();
        }
  
        // open the window
        this._prefWindow.center();
        this._prefWindow.open();
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
      qx.io2.PartLoader.require(["addfeed"], function()
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
    this._disposeFields("__commands");
    this._disposeObjects("_toolBarView", "_listView", "_articleView", "_treeView",
        "_feedFolder", "_horizontalSplitPane", "_verticalSplitPane", "_header");
  }
});
