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

/**
 * The loader loads the feed data by using JSONP over a proxy
 */
qx.Class.define("feedreader.io.FeedLoader",
{
  extend : qx.core.Object,
  type : "singleton",



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Load all feeds from the feed list
     *
     * @param feedFolder {feedreader.model.FeedFolder} load all feed from this feed folder
     */
    loadAll : function(feedFolder)
    {
      // static feeds
      var staticFeeds = feedFolder.getFeeds().getItem(0).getFeeds();
      for (var i = 0; i < staticFeeds.length; i++) {
        this.load(staticFeeds.getItem(i));
      }
      // user feeds
      var userFeeds = feedFolder.getFeeds().getItem(1).getFeeds();
      for (i = 0; i < userFeeds.length; i++) {
        this.load(userFeeds.getItem(i));
      }
    },


    /**
     * Load the given feed.
     *
     * @param feed {feedreader.model.Feed} the feed to load
     */
    load : function(feed)
    {
      feed.setState("loading");

      var query = "select * from feed where url='" + feed.getUrl() + "'";
      var store = new qx.data.store.Yql(query, {manipulateData : function(data) {
        try {
          data = data.query.results.item || data.query.results.entry;
          // normalize titles
          for (var i = 0; i < data.length; i++) {
            if (!qx.lang.Type.isString(data[i].title)) {
              data[i].title = data[i].title.content;
            }
          };
          // locale storage support
          if (qx.core.Environment.get("html.storage.local")) {
            var key = "qx-feeds-" + feed.getUrl();
            qx.bom.Storage.getLocal().setItem(key, data);
          }
          return data;
        } catch (e) {
          return "failed";
        }
      }, configureRequest : function(req) {
        req.setTimeout(10000);
      }}, qx.core.Environment.get("io.ssl"));

      store.addListener("loaded", this.__createOnLoaded(feed), this);
      store.addListener("changeState",
        qx.lang.Function.bind(this.__onChangeState, this, feed)
      , this);
    },


    /**
     * State change handler for the yql store.
     * @param feed {feedreader.model.feed} The feed which was loaded.
     * @param e {qx.event.type.Data} The change event.
     */
    __onChangeState : function(feed, e)
    {
      if (e.getData() == "aborted" ||
        e.getData() == "timeout" ||
        e.getData() == "failed")
      {
        var state = "error";
        // locale storage support
        if (qx.core.Environment.get("html.storage.local")) {
          var key = "qx-feeds-" + feed.getUrl();
          var oldData = qx.bom.Storage.getLocal().getItem(key);
          if (oldData) {
            var articles = qx.data.marshal.Json.createModel(oldData);
            feed.setArticles(articles);
            state = "cached";
          }
        }
        feed.setState(state);
      }
    },


    /**
     * Create a calback to save the response
     *
     * @param feed {feedreader.model.Feed} feed, which got loaded
     * @return {Function} callback handler
     */
    __createOnLoaded : function(feed)
    {
      return function(e) {
        var model = e.getData();

        // check for wrong urls
        if (model == "failed") {
          feed.setState("error");
          return;
        }

        feed.setArticles(model);
        feed.setState("loaded");
      };
    }
  }
});