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
/* ************************************************************************

#asset(feedreader/css/website.css)

#require(qx.module.Attribute)
#require(qx.module.Animation)
#require(qx.module.Event)
#require(qx.module.Template)
#require(qx.module.Manipulating)
#require(qx.module.Traversing)
#require(qx.module.Transform)

************************************************************************ */

/**
 * The feed reader's website main application class.
 */
qx.Class.define("feedreader.WebsiteApplication",
{
  extend : qx.application.Native,

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug")) {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }


      // set the qooxdoo version
      q("#qxTag").setAttribute(
        "html", "qooxdoo " + qx.core.Environment.get("qx.version")
      );

      // Initialize the model
      var model = new feedreader.model.Model();

      // get list and tree
      var tree = q("#tree");
      var list = q("#list");
      // fill the tree with the feeds
      this.fillTree(tree, model);

      // add a listener to the tree to change the selected feed
      var self = this;
      tree.on("click", function(e) {
        var feed = (e.target || e.srcElement).feed;
        // ignore clicks on headlines
        if (!feed) {
          return;
        }
        // if the selected feed is loaded
        if (feed.getState() == "loaded") {
          list.stop();
          self.fillList(list, feed);
        } else if (feed.getState() == "error") {
          list.setAttribute("html", "Sorry, unable to load the feed.");
        } else {
          // if not loaded, add a listener
          feed.addListener("stateModified", function(e) {
            if (e.getData() == "loaded") {
              self.fillList(list, feed);
            }
          });
        }
      });

      // load the feeds
      var loader = feedreader.io.FeedLoader.getInstance();
      loader.loadAll(model.getFeedFolder());
    },


    /**
     * Fills the given list with the data of the given feed.
     *
     * @param col {q} A collection which will be filled.
     * @param feed {qx.core.Object} The model for the feed.
     */
    fillList : function(col, feed) {
      col.fadeOut().once("animationEnd", function() {
        // delete the current content
        col.setHtml("");

        /// putt all articles in the list
        var articles = feed.getArticles();
        for (var i=0; i < articles.length; i++) {
          var article = articles.getItem(i);
          col.append(feedreader.view.website.Factory.createArticleView(article));
        };
        col.fadeIn();
      });
    },


    /**
     * Fills the given tree with the data of the given model.
     *
     * @param col {q} The collection which will be filled.
     * @param model {qx.core.Object} The model to take the data from.
     */
    fillTree : function(col, model) {
      col.fadeOut().once("animationEnd", function() {
        // empty loading text
        col.setHtml("");

        // take both folders
        var folders = [model.getStaticFeedFolder(), model.getUserFeedFolder()];
        var names = ["Static Feeds", "User Feeds"];

        for (var i=0; i < folders.length; i++) {
          // create a folder item in the tree
          var feeds = folders[i].getFeeds();
          col.append(feedreader.view.website.Factory.createTreeFolder(names[i]));

          // create a feed item for every feed in the folder
          for (var j=0; j < feeds.length; j++) {
            var feed = feeds.getItem(j);
            var item = feedreader.view.website.Factory.createTreeItem(feed);
            // special handling for the initial selection
            if (i === 0 && j === 0) {
              // mark the first one as selected by default
              q(item).addClass("selectedFeed");
              // if the selected feed is loaded
              if (feed.getState() === "loaded") {
                this.fillList(q("#list"), feed);
              } else {
                // if not loaded, add a listener
                feed.addListener("stateModified", function(e) {
                  if (e.getData() == "loaded") {
                    this.fillList(q("#list"), e.getTarget());
                  }
                }, this);
              }
            }
            col.append(item);
          };
        };
        col.fadeIn();
      }, this);
    }
  }
});
