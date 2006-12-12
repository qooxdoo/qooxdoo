/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#resource(readerfeeds:feeds)
#resource(readercss:css)
#resource(readerproxy:proxy)
#embed(readerproxy/*)
#embed(readerfeeds/*)
#embed(readercss/*)
#embed(icon/16/button-ok.png)
#embed(icon/16/button-cancel.png)
#embed(icon/16/reload.png)
#embed(icon/16/locale.png)
#embed(icon/16/help.png)
#load(feedreader.locale.de)

************************************************************************ */

/**
 * qooxdoo news reader Application class
 */
qx.OO.defineClass("feedreader.Application", qx.component.AbstractApplication,
function () {
  qx.component.AbstractApplication.call(this);

  //this.fetchFeedDesc();
  this.setFeeds([]);
});

qx.OO.addProperty({name: "feeds"});
qx.OO.addProperty({name: "selectedFeed"});

/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

if (qx.sys.Client.getInstance().getRunsLocally())
{
	qx.Class._feedDesc = [
	  {
	    url: "./resource/feeds/qooxdoo-news.xml",
	    name: "qooxdoo-news"
	  },
	  {
	    url: "./resource/feeds/qooxdoo-blog.xml",
	    name: "qooxdoo-blog"
	  },
	  {
	    url: "./resource/feeds/ajaxian.xml",
	    name: "ajaxian"
	  },
	  {
	    url: "./resource/feeds/safari.xml",
	    name: "Surfin' Safari"
	  }
	];
} 
else 
{	
	qx.Class._feedDesc = [
	  {
	    url: "./resource/proxy/proxy.php?proxy=" + encodeURIComponent("http://feeds.feedburner.com/qooxdoo/blog/content"),
	    name: "qooxdoo-news"
	  },
	  {
	    url: "./resource/proxy/proxy.php?proxy=" + encodeURIComponent("http://feeds.feedburner.com/qooxdoo/news/content"),
	    name: "qooxdoo-blog"
	  },
	  {
	    url: "./resource/proxy/proxy.php?proxy=" + encodeURIComponent("http://feeds.feedburner.com/ajaxian"),
	    name: "ajaxian"
	  },
	  {
	    url: "./resource/proxy/proxy.php?proxy=" + encodeURIComponent("http://webkit.org/blog/?feed=rss2"),
	    name: "Surfin' Safari"
	  }
	];
}

qx.Proto.initialize = function(e)
{
  qx.manager.object.AliasManager.getInstance().add("custom", "./resource");
};

qx.Proto.main = function(e)
{
  var dockLayout = new qx.ui.layout.DockLayout();
  dockLayout.set({
    height: "100%",
    width: "100%"
  });

  var header = new qx.ui.embed.HtmlEmbed("<h1><span>qooxdoo</span> reader</h1>");
  header.setCssClassName("header");
  header.setHeight(50);
  dockLayout.addTop(header);

  var reload_cmd = new qx.client.Command("Control+R");
  reload_cmd.addEventListener("execute", function(e) {
    this.fetchFeeds();
    this.debug(this.tr("reloading ...").toString());
  }, this);

  var about_cmd = new qx.client.Command("F1");
  about_cmd.addEventListener("execute", function(e) {
    alert(this.tr("qooxdoo feed reader."));
  }, this);

  var toolBar = new qx.ui.toolbar.ToolBar();
  toolBar.add(new qx.ui.toolbar.Button(this.trn("Add feed", "Add feeds", 2), "icon/16/button-ok.png"));
  toolBar.add(new qx.ui.toolbar.Button(this.tr("Remove feed"), "icon/16/button-cancel.png"));
  toolBar.add(new qx.ui.toolbar.Separator());

  var reload_btn = new qx.ui.toolbar.Button(this.tr("Reload"), "icon/16/reload.png");
  reload_btn.setCommand(reload_cmd);
  reload_btn.setToolTip(new qx.ui.popup.ToolTip(this.tr("(%1) Reload the feeds.", reload_cmd.toString())));
  toolBar.add(reload_btn);

  toolBar.add(new qx.ui.basic.HorizontalSpacer());
	
	var locale = qx.nls.Manager.getInstance().getLocale();
	var mb_de = new qx.ui.menu.RadioButton(this.tr("German"), null, locale == "de" );
	mb_de.setUserData("locale", "de");
	var mb_en = new qx.ui.menu.RadioButton(this.tr("English"), null, locale == "en");
	mb_en.setUserData("locale", "en");
	var lang_menu = new qx.ui.menu.Menu();
	var radioManager = new qx.manager.selection.RadioManager("lang", [mb_de, mb_en]);
	radioManager.addEventListener("changeSelected", function(e) {
		var lang = e.getData().getUserData("locale");
		qx.nls.Manager.getInstance().setLocale(lang);
	}); 
	lang_menu.add(mb_de, mb_en);
	lang_menu.addToDocument();
	toolBar.add(new qx.ui.toolbar.MenuButton("", lang_menu, "icon/16/locale.png"));

  var about_btn = new qx.ui.toolbar.Button(this.tr("Help"), "icon/16/help.png");
  about_btn.setCommand(about_cmd);
  about_btn.setToolTip(new qx.ui.popup.ToolTip("(" + about_cmd.toString() + ")"));
  toolBar.add(about_btn);

  dockLayout.addTop(toolBar);

  var tree = new qx.ui.tree.Tree(this.tr("News feeds"));
  tree.setWidth(200);
	tree.setOverflow("auto");
  tree.setBorder(qx.renderer.border.BorderPresets.getInstance().inset);
  tree.setBackgroundColor("#EEEEEE");
  tree.setMargin(3);

  var feedDesc = feedreader.Application._feedDesc;
  for (var i=0; i<feedDesc.length; i++) {
    var folder = new qx.ui.tree.TreeFolder(feedDesc[i].name);
    tree.getManager().addEventListener("changeSelection", function(e) {
      this.displayFeed(e.getData()[0].getLabel());
    }, this);
    tree.add(folder);
  }

  dockLayout.addLeft(tree)

  this._tableModel = new qx.ui.table.SimpleTableModel();
  this._tableModel.setColumnIds(["title", "author", "date"]);
  this._tableModel.setColumnNamesById({
    title: this.tr("Subject"),
    author: this.tr("Sender"),
    date: this.tr("Date")
  });

  var table = new qx.ui.table.Table(this._tableModel);
  table.setBorder(qx.renderer.border.BorderPresets.getInstance().inset);
  table.setHeight(300);
  table.getTableColumnModel().setColumnWidth(0, 350);
  table.getTableColumnModel().setColumnWidth(1, 200);
  table.getTableColumnModel().setColumnWidth(2, 200);
  table.getSelectionModel().addEventListener("changeSelection", function(e) {
    var selectedEntry = table.getSelectionModel().getAnchorSelectionIndex();
    var item = this.getFeeds()[this.getSelectedFeed()][selectedEntry];
    this.displayArticle(item);
  }, this);

  this._blogEntry = new feedreader.ArticleView();
  this._blogEntry.setBorder(qx.renderer.border.BorderPresets.getInstance().inset);

  var contentArea = new qx.ui.layout.DockLayout();
  contentArea.addTop(table);
  contentArea.add(this._blogEntry);
  dockLayout.add(contentArea);

  dockLayout.addToDocument();

	this.displayFeed(feedreader.Application._feedDesc[0].name);
  this.fetchFeeds();
};


qx.Proto.fetchFeedDesc = function() {
	var req = new qx.io.remote.Request("./resource/feeds/febo-feeds.opml.xml", "GET", "application/xml");
	feedreader.Application._feedDesc = [];
    req.addEventListener("completed", function(e) {
		var xml = e.getData().getContent();
		var eItems = xml.getElementsByTagName("outline");
		for(var i=0; i<eItems.length; i++) {
			var eDesc = eItems[i];
			feedreader.Application._feedDesc.push({
				name: eDesc.getAttribute("title"),
				url: "./resource/proxy/proxy.php?proxy=" + encodeURIComponent(eDesc.getAttribute("xmlUrl"))
			});
		}
	}, this);
	req.setAsynchronous(false);
    req.send();	
};


qx.Proto.fetchFeeds = function() {
  qx.io.remote.RequestQueue.getInstance().setMaxConcurrentRequests(2);
  var feedDesc = feedreader.Application._feedDesc;
  var that = this;
  var getCallback = function(feedName) {
    return function(e) {
      that.debug("loading " + feedName + " complete!");
      that.parseXmlFeed(feedName, e.getData().getContent());
    }
  }
  for (var i=0; i<feedDesc.length; i++) {
    var req = new qx.io.remote.Request(feedDesc[i].url, "GET", "application/xml");
    req.addEventListener("completed", getCallback(feedDesc[i].name));
    req.send();
  }
};


qx.Proto.getElementsByTagNameNS = function(element, ns, nsPrefix, name) {
  if (element.getElementsByTagNameNS) {
    return element.getElementsByTagNameNS(ns, name);
  } else {
    return element.getElementsByTagName(nsPrefix+':'+name);
  }
};


qx.Proto.parseXmlFeed = function(feedName, xml) {
  var items = [];
  if (xml.documentElement.tagName == "rss") {
    items = this.parseRSSFeed(xml);
  } else if	(xml.documentElement.tagName == "feed") {
	items = this.parseAtomFeed(xml);
  }
  this.getFeeds()[feedName] = items;
  if (feedName == this.getSelectedFeed()) {
	  this.displayFeed(feedName);
	}
};


qx.Proto.parseAtomFeed = function(xml) {
  var eItems = xml.getElementsByTagName("entry");
  var empty = xml.createElement("empty");
  var items = [];
  for (var i=0; i<eItems.length; i++) {
    var eItem = eItems[i];
    var item = {}
    item.title = qx.xml.Core.getTextContent(eItem.getElementsByTagName("title")[0]);
    if (eItem.getElementsByTagName("author").length > 0) {
      item.author = qx.xml.Core.getTextContent(eItem.getElementsByTagName("author")[0].getElementsByTagName("name")[0]);
    } else {
	  item.author = ""
    }
    item.date = qx.xml.Core.getTextContent(
		eItem.getElementsByTagName("created")[0] ||
		eItem.getElementsByTagName("published")[0] ||
		eItem.getElementsByTagName("updated")[0] ||
		empty
	);
    item.content = qx.xml.Core.getTextContent(eItem.getElementsByTagName("content")[0] || empty);
    item.link = eItem.getElementsByTagName("link")[0].getAttribute("href");
    items.push(item);
  }
  return items;
}


qx.Proto.parseRSSFeed = function(xml) {
  var eItems = xml.getElementsByTagName("item");
  var empty = xml.createElement("empty");
  var items = [];
  for (var i=0; i<eItems.length; i++) {
    var eItem = eItems[i];
    var item = {}
    item.title = qx.xml.Core.getTextContent(eItem.getElementsByTagName("title")[0]);
    item.author = qx.xml.Core.getTextContent(this.getElementsByTagNameNS(eItem, "http://purl.org/dc/elements/1.1/", "dc", "creator")[0] || empty);
    item.date = qx.xml.Core.getTextContent(eItem.getElementsByTagName("pubDate")[0]);
    item.content = qx.xml.Core.getTextContent(this.getElementsByTagNameNS(eItem, "http://purl.org/rss/1.0/modules/content/", "content", "encoded")[0] || empty);
    item.link = qx.xml.Core.getTextContent(eItem.getElementsByTagName("link")[0]);
    items.push(item);
  }
  return items;
};


qx.Proto.displayFeed = function(feedName) {
  this.setSelectedFeed(feedName);
  var items = this.getFeeds()[feedName];
  if (items) {
    this._tableModel.setDataAsMapArray(items);
    this.displayArticle(this.getFeeds()[feedName][0]);
  }
};


qx.Proto.displayArticle = function(item) {
  this._blogEntry.setArticle(item);
};


qx.Proto.finalize = function(e)
{
};

qx.Proto.close = function(e)
{
  // prompt user
  // e.returnValue = "[qooxdoo application: Do you really want to close the application?]";
};

qx.Proto.terminate = function(e)
{
  // alert("terminated");
};
