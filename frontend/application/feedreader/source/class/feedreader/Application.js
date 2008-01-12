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

    // this.fetchFeedDesc();
    this.setFeeds([]);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    _feedDesc : qx.lang.Object.select(qx.core.Client.getInstance().getRunsLocally() ? "local" : "remote",
    {
      "local" :
      [
        {
          url  : "feedreader/feeds/qooxdoo-news.xml",
          name : "qooxdoo-blog"
        },
        {
          url  : "feedreader/feeds/qooxdoo-blog.xml",
          name : "qooxdoo-news"
        },
        {
          url  : "feedreader/feeds/ajaxian.xml",
          name : "ajaxian"
        },
        {
          url  : "feedreader/feeds/safari.xml",
          name : "Surfin' Safari"
        }
      ],

      "remote" :
      [
        {
          url  : "feedreader/proxy/proxy.php?proxy=" + encodeURIComponent("http://feeds.feedburner.com/qooxdoo/blog/content"),
          name : "qooxdoo-blog"
        },
        {
          url  : "feedreader/proxy/proxy.php?proxy=" + encodeURIComponent("http://feeds.feedburner.com/qooxdoo/news/content"),
          name : "qooxdoo-news"
        },
        {
          url  : "feedreader/proxy/proxy.php?proxy=" + encodeURIComponent("http://feeds.feedburner.com/ajaxian"),
          name : "ajaxian"
        },
        {
          url  : "feedreader/proxy/proxy.php?proxy=" + encodeURIComponent("http://webkit.org/blog/?feed=rss2"),
          name : "Surfin' Safari"
        }
      ]
    })
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    feeds        : { },
    selectedFeed : { }
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
      METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    close : function()
    {
      this.base(arguments);

      // return "Do you really want to quit?";
    },


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
      qx.legacy.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("feedreader/css/reader.css"));

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
      var reload_cmd = new qx.event.Command("Control+R");

      reload_cmd.addListener("execute", function(e)
      {
        this.fetchFeeds();
        this.debug(this.tr("reloading ...").toString());
      },
      this);

      var about_cmd = new qx.event.Command("F1");

      about_cmd.addListener("execute", function(e) {
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
      pref_btn.addListener("execute", this.showPreferences, this);
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

      radioManager.addListener("changeSelected", function(e)
      {
        var lang = e.getData().getUserData("locale");
        this.debug("lang:" + lang);
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

      var feedDesc = feedreader.Application._feedDesc;

      for (var i=0; i<feedDesc.length; i++)
      {
        var folder = new qx.ui.tree.TreeFolder(feedDesc[i].name);

        tree.getManager().addListener("changeSelection", function(e)
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
      table.getTableColumnModel().setColumnWidth(0, 350);
      table.getTableColumnModel().setColumnWidth(1, 200);
      table.getTableColumnModel().setColumnWidth(2, 200);
      table.getTableColumnModel().setColumnVisible(3, false);


      table.getSelectionModel().addListener("changeSelection", function(e)
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

      qx.theme.manager.Meta.getInstance().addListener("changeTheme", this.onChangeTheme, this);
      this.onChangeTheme();

      // load and display feed data
      this.setSelectedFeed(feedDesc[0].name);
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
      if (!this._prefWindow)
      {
        var win = new qx.ui.window.Window(this.tr("Preferences"), "icon/16/apps/preferences.png");
        win.set({
          modal : true,
          showMinimize: false,
          showMaximize: false,
          allowMaximize: false,
          width: 150
        });
        win.addToDocument();

        var winLayout = new qx.ui.layout.VerticalBoxLayout();
        winLayout.set({
          width: "100%",
          height: "auto",
          spacing: 5,
          padding: 5
        });
        win.add(winLayout);

        var gb = new qx.ui.groupbox.GroupBox(this.tr("Theme"));
        gb.set({
          height: "auto",
          width: "100%"
        });
        winLayout.add(gb);

        var vb = new qx.ui.layout.VerticalBoxLayout();
        gb.add(vb);

        var btn_classic = new qx.ui.form.RadioButton("Classic");
        var btn_ext = new qx.ui.form.RadioButton("Ext");
        btn_ext.setChecked(true);
        var rm = new qx.ui.selection.RadioManager();
        rm.add(btn_classic, btn_ext);
        vb.add(btn_classic, btn_ext);

        var hb = new qx.ui.layout.HorizontalBoxLayout();
        hb.set({
          width: "100%",
          horizontalChildrenAlign: "right",
          spacing: 5,
          paddingRight: 3
        });

        var btn_cancel = new qx.ui.form.Button(this.tr("Cancel"));
        btn_cancel.addListener("execute", win.close, win);
        var btn_ok = new qx.ui.form.Button(this.tr("OK"));
        btn_ok.addListener("execute", function() {
          if (btn_ext.getChecked()) {
            qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Ext);
          } else {
            qx.theme.manager.Meta.getInstance().setTheme(qx.theme.ClassicRoyale);
          }
          win.close();
        }, this);
        hb.add(btn_cancel);
        hb.add(btn_ok);

        winLayout.add(hb);

        this._prefWindow = win;
        win.addListener("appear", win.centerToBrowser, win);
      }

      this._prefWindow.open();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    fetchFeedDesc : function()
    {
      var req = new qx.io.remote.Request(qx.io.Alias.getInstance().resolve("feedreader/feeds/febo-feeds.opml.xml"), "GET", qx.util.Mime.XML);
      feedreader.Application._feedDesc = [];

      req.addListener("completed", function(e)
      {
        var xml = e.getContent();
        var eItems = xml.getElementsByTagName("outline");

        for (var i=0; i<eItems.length; i++)
        {
          var eDesc = eItems[i];

          feedreader.Application._feedDesc.push(
          {
            name : eDesc.getAttribute("title"),
            url  : qx.io.Alias.getInstance().resolve("feedreader/proxy/proxy.php") + "?proxy=" + encodeURIComponent(eDesc.getAttribute("xmlUrl"))
          });
        }
      },
      this);

      req.setAsynchronous(false);
      req.send();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    fetchFeeds : function()
    {
      qx.io.remote.RequestQueue.getInstance().setMaxConcurrentRequests(2);
      var feedDesc = feedreader.Application._feedDesc;
      var that = this;

      var getCallback = function(feedName)
      {
        return function(e)
        {
          that.debug("loading " + feedName + " complete!");
          that.parseXmlFeed(feedName, e.getContent());
        };
      };

      for (var i=0; i<feedDesc.length; i++)
      {
        var req = new qx.io.remote.Request(qx.io.Alias.getInstance().resolve(feedDesc[i].url), "GET", qx.util.Mime.XML);
        req.addListener("completed", getCallback(feedDesc[i].name));
        req.send();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param feedName {var} TODOC
     * @param xml {var} TODOC
     * @return {void}
     */
    parseXmlFeed : function(feedName, xml)
    {
      var items = [];

      if (xml.documentElement.tagName == "rss") {
        items = this.parseRSSFeed(xml);
      } else if (xml.documentElement.tagName == "feed") {
        items = this.parseAtomFeed(xml);
      }

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
     * @param xml {var} TODOC
     * @return {var} TODOC
     */
    parseAtomFeed : function(xml)
    {
      var eItems = xml.getElementsByTagName("entry");
      var empty = xml.createElement("empty");
      var items = [];

      for (var i=0; i<eItems.length; i++)
      {
        var eItem = eItems[i];
        var item = {};
        item.title = qx.dom.Node.getText(eItem.getElementsByTagName("title")[0]);

        if (eItem.getElementsByTagName("author").length > 0) {
          item.author = qx.dom.Node.getText(eItem.getElementsByTagName("author")[0].getElementsByTagName("name")[0]);
        } else {
          item.author = "";
        }

        item.date = qx.dom.Node.getText(eItem.getElementsByTagName("created")[0] || eItem.getElementsByTagName("published")[0] || eItem.getElementsByTagName("updated")[0] || empty);
        item.content = qx.dom.Node.getText(eItem.getElementsByTagName("content")[0] || empty);
        item.link = eItem.getElementsByTagName("link")[0].getAttribute("href");
        item.id = i;
        items.push(item);
      }

      return items;
    },


    /**
     * TODOC
     *
     * @type member
     * @param xml {var} TODOC
     * @return {var} TODOC
     */
    parseRSSFeed : function(xml)
    {
      var eItems = xml.getElementsByTagName("item");
      var empty = xml.createElement("empty");
      var items = [];

      for (var i=0; i<eItems.length; i++)
      {
        var eItem = eItems[i];
        var item = {};
        item.title = qx.dom.Node.getText(eItem.getElementsByTagName("title")[0]);
        item.author = qx.dom.Node.getText(qx.xml.Element.getElementsByTagNameNS(eItem, qx.xml.Namespace.DC, "creator")[0] || empty);
        item.date = qx.dom.Node.getText(eItem.getElementsByTagName("pubDate")[0]);
        item.content = qx.dom.Node.getText(qx.xml.Element.getElementsByTagNameNS(eItem, qx.xml.Namespace.RSS1, "encoded")[0] || empty);
        item.link = qx.dom.Node.getText(eItem.getElementsByTagName("link")[0]);
        item.id = i;
        items.push(item);
      }

      return items;
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
