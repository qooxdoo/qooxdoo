/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("feedreader.WebsiteApplication",
{
  extend : qx.application.Native,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __feedFolder : null,


    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // set the qooxdoo version
      document.getElementById("qxTag").innerHTML = 
        "qooxdoo " + qx.core.Environment.get("qx.version");

      // Initialize the model
      var model = new feedreader.model.Model();
      this.__feedFolder = model.getFeedFolder();
      var tree = document.getElementById("tree");
      var list = document.getElementById("list");
      this.fillTree(tree, model);

      var self = this;
      qx.bom.Event.addNativeListener(tree, "change", function(e) {
        var feed = qx.bom.Event.getTarget(e).feed;
        self.fillList(list, feed);
      });

      var firstFeed = model.getStaticFeedFolder().getFeeds().getItem(0);
      firstFeed.addListener("stateModified", function(e) {
        if (e.getData() == "loaded") {
          this.fillList(list, firstFeed);
        }
      }, this);

      this.reload();
    },


    reload : function() {
      var loader = feedreader.io.FeedLoader.getInstance();
      loader.loadAll(this.__feedFolder);
    },


    fillList : function(el, feed) {
      el.innerHTML = "";

      var articles = feed.getArticles();
      for (var i=0; i < articles.length; i++) {
        var article = articles.getItem(i);
        el.appendChild(feedreader.website.Factory.createArticleView(article));
      };
    },


    fillTree : function(el, model) {
      // empty loading text
      el.innerHTML = "";

      var folders = [model.getStaticFeedFolder(), model.getUserFeedFolder()];
      var names = ["Static Feeds", "User Feeds"];
      
      for (var i=0; i < folders.length; i++) {
        
        var feeds = folders[i].getFeeds();
        el.appendChild(feedreader.website.Factory.createTreeFolder(names[i]));

        for (var j=0; j < feeds.length; j++) {
          var feed = feeds.getItem(j);
          var item = feedreader.website.Factory.createTreeItem(feed);
          if (i === 0 && j === 0) {
            item.childNodes[0].checked = true;
            qx.bom.element.Class.add(item.childNodes[1], "selectedFeed");
          }
          el.appendChild(item);
        };
      };
    }
  }
});