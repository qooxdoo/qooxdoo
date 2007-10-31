/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#resource(feedreader.feeds:feeds)
#resource(feedreader.css:css)
#resource(feedreader.proxy:proxy)
#resource(feedreader.images:images)
#embed(feedreader.proxy/*)
#embed(feedreader.feeds/*)
#embed(feedreader.css/*)
#embed(feedreader.images/*)
#embed(qx.icontheme/16/actions/dialog-ok.png)
#embed(qx.icontheme/16/actions/dialog-cancel.png)
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
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.setFeeds([]);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    feeds        : {  },
    selectedFeed : {  }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _feedDesc :
    [
      {
        url  : "http://feeds.feedburner.com/qooxdoo/blog/content",
        name : "qooxdoo Blog"
      },
      {
        url  : "http://feeds.feedburner.com/qooxdoo/news/content",
        name : "qooxdoo News"
      },
      {
        url  : "http://feeds.feedburner.com/ajaxian",
        name : "Ajaxian"
      },
      {
        url  : "http://webkit.org/blog/?feed=rss2",
        name : "Surfin' Safari"
      },
      {
        url  : "http://daringfireball.net/index.xml",
        name : "Daring Fireball"
      },
      {
        url  : "http://blogs.msdn.com/jscript/rss.xml",
        name : "JScript Team Blog"
      },
      {
        url  : "http://developer.mozilla.org/devnews/index.php/feed/",
        name : "Mozilla Developer News"
      },
      {
        url  : "http://blog.whatwg.org/feed/",
        name : "The WHATWG Blog"
      }
    ],


    /*
    ---------------------------------------------------------------------------
      METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    main : function()
    {
      this.base(arguments);

      // Define alias for custom resource path
      qx.io.Alias.getInstance().add("feedreader", qx.core.Setting.get("feedreader.resourceUri"));

      // Include CSS file
      qx.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("feedreader/css/reader.css"));

      // create main layout
      var dockLayout = new qx.ui.layout.DockLayout();

      dockLayout.set(
      {
        height : "100%",
        width  : "100%"
      });

      // create header
      this._header = new qx.ui.embed.HtmlEmbed("<h1><span>qooxdoo</span> reader</h1>");
      this._header.setHtmlProperty("className", "header");
      this._header.setHeight(50);
      dockLayout.addTop(this._header);

      // define commands
      var reload_cmd = new qx.client.Command("Control+R");

      reload_cmd.addEventListener("execute", function(e)
      {
        this.fetchFeeds();
        this.debug(this.tr("reloading ...").toString());
      },
      this);

      var about_cmd = new qx.client.Command("F1");

      about_cmd.addEventListener("execute", function(e) {
        alert(this.tr("qooxdoo feed reader."));
      }, this);

      // create toolbar
      var toolBar = new qx.ui.toolbar.ToolBar();
      toolBar.setBorder("line-bottom");
      toolBar.add(new qx.ui.toolbar.Button(this.trn("Add feed", "Add feeds", 2), "icon/16/actions/dialog-ok.png"));
      toolBar.add(new qx.ui.toolbar.Button(this.tr("Remove feed"), "icon/16/actions/dialog-cancel.png"));
      toolBar.add(new qx.ui.toolbar.Separator());

      var reload_btn = new qx.ui.toolbar.Button(this.tr("Reload"), "icon/16/actions/view-refresh.png");
      reload_btn.setCommand(reload_cmd);
      reload_btn.setToolTip(new qx.ui.popup.ToolTip(this.tr("(%1) Reload the feeds.", reload_cmd.toString())));
      toolBar.add(reload_btn);
      toolBar.add(new qx.ui.toolbar.Separator());

      var pref_btn = new qx.ui.toolbar.Button(this.tr("Preferences"), "icon/16/apps/preferences.png");
      pref_btn.addEventListener("execute", this.showPreferences, this);
      pref_btn.setToolTip(new qx.ui.popup.ToolTip(this.tr("Open preferences window.")));
      toolBar.add(pref_btn);

      toolBar.add(new qx.ui.basic.HorizontalSpacer());

      // poulate languages menu and add it to the toolbar
      var locales =
      {
        en : this.tr("English"),
        de : this.tr("German"),
        en : this.tr("English"),
        tr : this.tr("Turkish"),
        it : this.tr("Italian"),
        es : this.tr("Spanish"),
        sv : this.tr("Swedish"),
        ru : this.tr("Russian")
      };

      var availableLocales = qx.locale.Manager.getInstance().getAvailableLocales();
      var locale = qx.locale.Manager.getInstance().getLocale();
      var lang_menu = new qx.ui.menu.Menu();
      var radioManager = new qx.ui.selection.RadioManager("lang");

      for (var lang in locales)
      {
        if (availableLocales.indexOf(lang) == -1) {
          continue;
        }

        var menuButton = new qx.ui.menu.RadioButton(locales[lang], null, locale == lang);
        menuButton.setUserData("locale", lang);
        lang_menu.add(menuButton);
        radioManager.add(menuButton);
      }

      radioManager.addEventListener("changeSelected", function(e)
      {
        var lang = e.getValue().getUserData("locale");
        qx.locale.Manager.getInstance().setLocale(lang);
      });

      lang_menu.addToDocument();
      toolBar.add(new qx.ui.toolbar.MenuButton("", lang_menu, "feedreader/images/locale.png"));

      var about_btn = new qx.ui.toolbar.Button(this.tr("Help"), "icon/16/actions/help-about.png");
      about_btn.setCommand(about_cmd);
      about_btn.setToolTip(new qx.ui.popup.ToolTip("(" + about_cmd.toString() + ")"));
      toolBar.add(about_btn);

      dockLayout.addTop(toolBar);

      // add tree
      var tree = new qx.ui.tree.Tree(this.tr("News feeds"));

      tree.set(
      {
        height : "100%",
        width  : "100%",
        padding : 5,
        border : "line-right",
        overflow : "auto"
      });

      var feedDesc = this._feedDesc;

      for (var i=0; i<feedDesc.length; i++)
      {
        var folder = new qx.ui.tree.TreeFolder(feedDesc[i].name);

        tree.getManager().addEventListener("changeSelection", function(e)
        {
          if (e.getData()[0].getParentFolder()) {
            this.displayFeed(e.getData()[0].getLabel());
          }
        },
        this);

        tree.add(folder);
      }

      // create table model
      this._tableModel = new qx.ui.table.model.Simple();
      this._tableModel.setColumnIds([ "title", "author", "date", "id" ]);

      this._tableModel.setColumnNamesById(
      {
        title  : this.tr("Subject"),
        author : this.tr("Sender"),
        date   : this.tr("Date"),
        id     : this.tr("ID")
      });


      // add table

      // Customize the table column model.  We want one that automatically
      // resizes columns.
      var custom = {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };

      var table = new qx.ui.table.Table(this._tableModel, custom);
      //table.setBorder("inset");

      table.set(
      {
        height : "100%",
        width  : "100%",
        border : "line-bottom"
      });

      table.setStatusBarVisible(false);
      table.getDataRowRenderer().setHighlightFocusRow(false);
      table.getPaneScroller(0).setShowCellFocusIndicator(false);
      table.getTableColumnModel().setColumnWidth(0, 350);
      table.getTableColumnModel().setColumnWidth(1, 200);
      table.getTableColumnModel().setColumnWidth(2, 200);
      table.getTableColumnModel().setColumnVisible(3, false);


      table.getSelectionModel().addEventListener("changeSelection", function(e)
      {
        var selectedEntry = table.getSelectionModel().getAnchorSelectionIndex();
        var feedName = this.getSelectedFeed()
        if (selectedEntry >= 0) {
          var feeds = this.getFeeds();
          var itemId = this._tableModel.getRowData(selectedEntry)[3];
          feeds[feedName].selected = itemId;
          var item = feeds[feedName].items[itemId];
          this.displayArticle(item);
        }
      },
      this);

      this._table = table;

      // add blog entry
      this._blogEntry = new feedreader.ArticleView();

      this._blogEntry.set(
      {
        height : "100%",
        width  : "100%",
        border : "line-top"
      });

      //this._blogEntry.setBorder("inset");

      // create splitpane for the right hand content area
      var contentSplitPane = new qx.ui.splitpane.VerticalSplitPane("1*", "2*");

      contentSplitPane.set(
      {
        height : "100%",
        width  : "100%",
        border : "line-left"
      });

      contentSplitPane.setLiveResize(true);
      contentSplitPane.addTop(table);
      contentSplitPane.addBottom(this._blogEntry);

      // create vertival splitter
      var mainSplitPane = new qx.ui.splitpane.HorizontalSplitPane(200, "1*");
      mainSplitPane.setLiveResize(true);
      mainSplitPane.addLeft(tree);
      mainSplitPane.addRight(contentSplitPane);

        dockLayout.add(mainSplitPane);

      dockLayout.addToDocument();

      qx.theme.manager.Meta.getInstance().addEventListener("changeTheme", this.onChangeTheme, this);
      this.onChangeTheme();

      // load and display feed data
      this.setSelectedFeed(feedDesc[0].name);
    },


    _postload : function()
    {
      this.base(arguments);

      this.fetchFeeds();
    },


    onChangeTheme : function()
    {
      if (qx.theme.manager.Meta.getInstance().getTheme() == qx.theme.Ext)
      {
        document.body.className = "Ext";
      }
      else
      {
        document.body.className = "Classic";
      }
    },


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
    fetchFeeds : function()
    {
      qx.io.remote.RequestQueue.getInstance().setMaxConcurrentRequests(10);
      var feedDesc = this._feedDesc;
      var that = this;

      var getCallback = function(feedName)
      {
        return function(e)
        {
          // that.debug("loading " + feedName + " complete!");
          that.loadJsonFeed(feedName, e.getContent());
        };
      };

      for (var i=0; i<feedDesc.length; i++)
      {
        var feedUrl = "http://resources.qooxdoo.org/proxy.php?mode=jsonp&proxy=" + encodeURIComponent(feedDesc[i].url);
        var req = new qx.io.remote.Request(feedUrl, "GET", qx.util.Mime.TEXT);
        req.setCrossDomain(true);
        req.setTimeout(30000);
        req.addEventListener("completed", getCallback(feedDesc[i].name));
        req.send();
      }
    },

    loadJsonFeed : function(feedName, json)
    {
      var items = feedreader.FeedParser.parseFeed(json);

      this.getFeeds()[feedName] =
      {
        selected : 0,
        items    : items
      };

      if (feedName == this.getSelectedFeed()) {
        this.displayFeed(feedName);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param feedName {var} TODOC
     * @return {void}
     */
    displayFeed : function(feedName)
    {
      if (this.getSelectedFeed() != feedName) {
        this.getFeeds()[this.getSelectedFeed()].selected = this._table.getSelectionModel().getAnchorSelectionIndex();
      }

      this.setSelectedFeed(feedName);

      if (this.getFeeds()[feedName])
      {
        var items = this.getFeeds()[feedName].items;
        var selection = this.getFeeds()[feedName].selected;

        this._tableModel.setDataAsMapArray(items);
        this._table.getSelectionModel().setSelectionInterval(selection, selection);
        this._table.setFocusedCell(0, selection, true);
        this.displayArticle(items[selection]);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param item {var} TODOC
     * @return {void}
     */
    displayArticle : function(item) {
      this._blogEntry.setArticle(item);
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "feedreader.resourceUri" : "./resource"
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_blogEntry", "_table", "_tableModel", "_header");
  }
});
