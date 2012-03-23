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

************************************************************************ */

/**
 * The feed reader's website main application class.
 */
qx.Class.define("feedreader.WebsiteApplication",
{
  extend : qx.application.Native,


  statics : {
    fadeOut : {duration : 300, keep: 100, keyFrames : {
      0: {opacity: 1},
      100: {opacity: 0}
    }},

    fadeIn : {duration : 300, keep: 100, keyFrames : {
      0: {opacity: 0},
      100: {opacity: 1}
    }}
  },

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
      qx.bom.Collection.id("qxTag").setAttribute(
        "html", "qooxdoo " + qx.core.Environment.get("qx.version")
      );

      // Initialize the model
      var model = new feedreader.model.Model();

      // get list and tree
      var tree = qx.bom.Collection.id("tree");
      var list = qx.bom.Collection.id("list");
      // fill the tree with the feeds
      this.fillTree(tree, model);

      // add a listener to the tree to change the selected feed
      var self = this;
      qx.bom.Event.addNativeListener(tree[0], "click", function(e) {
        var feed = qx.bom.Event.getTarget(e).feed;
        // if the selected feed is loaded
        if (feed.getState() == "loaded") {
          self.fillList(list, feed);
        } else if (feed.getState() == "error") {
          qx.bom.Collection.id("list").setAttribute("html", "Sorry, unable to load the feed.");
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
     * @param col {qx.bom.Collection} A collection which will be filled.
     * @param feed {qx.core.Object} The model for the feed.
     */
    fillList : function(col, feed) {
      var fadeOut = feedreader.WebsiteApplication.fadeOut;
      var fadeIn = feedreader.WebsiteApplication.fadeIn;
      qx.bom.element.Animation.animate(col[0], fadeOut).on("end", function() {
        // delete the current content
        col[0].innerHTML = "";

        /// putt all articles in the list
        var articles = feed.getArticles();
        for (var i=0; i < articles.length; i++) {
          var article = articles.getItem(i);
          col.append(feedreader.view.website.Factory.createArticleView(article));
        };
        qx.bom.element.Animation.animate(col[0], fadeIn);
      });
    },


    /**
     * Fills the given tree with the data of the given model.
     *
     * @param col {qx.bom.Collection} The collection which will be filled.
     * @param model {qx.core.Object} The model to take the data from.
     */
    fillTree : function(col, model) {
      var fadeOut = feedreader.WebsiteApplication.fadeOut;
      var fadeIn = feedreader.WebsiteApplication.fadeIn;
      qx.bom.element.Animation.animate(col[0], fadeOut).on("end", function() {
        // empty loading text
        col[0].innerHTML = "";

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
              qx.bom.element.Class.add(item, "selectedFeed");
              // if the selected feed is loaded
              if (feed.getState() === "loaded") {
                this.fillList(qx.bom.Collection.id("list"), feed);
              } else {
                // if not loaded, add a listener
                feed.addListener("stateModified", function(e) {
                  if (e.getData() == "loaded") {
                    this.fillList(qx.bom.Collection.id("list"), e.getTarget());
                  }
                }, this);
              }
            }
            col.append(item);
          };
        };
        qx.bom.element.Animation.animate(col[0], fadeIn);
      }, this);
    }
  }
});