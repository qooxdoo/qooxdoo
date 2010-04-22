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

      var proxy, req;

      // Redirect request through proxy (required for cross-domain loading)
      // The proxy also translates the data from XML to JSON
      proxy = "http://resources.qooxdoo.org/proxy_1.php?mode=jsonp&proxy=" + encodeURIComponent(feed.getUrl());

      // Create request object
      req = new qx.io.remote.Request(proxy, "GET", "text/plain");

      // Json data is useable cross-domain (in fact it is jsonp in this case)
      req.setCrossDomain(true);

      // Wait longer on slow connections (normally always a lot of data)
      req.setTimeout(30000);

      // Add the listener
      req.addListener("completed", this.__createOnLoaded(feed), this);
      var failHandler = qx.lang.Function.bind(this.__onFail, this, feed);
      req.addListener("timeout", failHandler, this);
      req.addListener("failed", failHandler, this);

      // And finally send the request
      req.send();
    },


    /**
     * Handler for failing requests.
     *
     * @param e {qx.io.request.Response} The failed response.
     */
    __onFail : function(feed, e) {
      feed.setState("error");
    },


    /**
     * Create a calback to parse the response
     *
     * @param feed {feedreader.model.Feed} feed, which got loaded
     * @return {Function} callback handler
     */
    __createOnLoaded : function(feed)
    {
      return function(response)
      {
        // Read content
        var json = response.getContent();

        // Test content
        if (json == null)
        {
          this.warn("Empty feed content: " + feed.getUrl());
          feed.setState("error");
        }
        else
        {
          try
          {
            // Clear old articles
            feed.getArticles().splice(0, feed.getArticles().length);

            // Normalize json feed data to article list
            var articles = feedreader.io.FeedParser.parseFeed(json);
            for (var i = 0; i < articles.length; i++) {
              feed.getArticles().push(articles[i]);
            }

            // mark the feed as not loading
            feed.setState("loaded");
          }
          catch(ex)
          {
            feed.setState("error");
            this.warn("Could not parse feed: " + feed.getUrl());
          }
        }
      }
    }
  }
});
