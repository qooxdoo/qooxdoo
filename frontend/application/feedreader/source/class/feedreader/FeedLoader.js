qx.Class.define("feedreader.FeedLoader",
{
  extend : qx.core.Object,
  type : "singleton",

  members :
  {

    loadAll : function(feedList)
    {
      var feeds = feedList.getFeeds();
      for (i=0; i<feeds.length; i++) {
        this.load(feeds[i]);
      }
    },


    load : function(feed)
    {
      feed.setStatus("loading");

      var proxy, entry, req;

      // Redirect request through proxy (required for cross-domain loading)
      // The proxy also translates the data from XML to JSON
      proxy = "http://resources.qooxdoo.org/proxy.php?mode=jsonp&proxy=" + encodeURIComponent(feed.getUrl());

      // Create request object
      req = new qx.io.remote.Request(proxy, "GET", qx.legacy.util.Mime.TEXT);

      // Json data is useable cross-domain (in fact it is jsonp in this case)
      req.setCrossDomain(true);

      // Wait longer on slow connections (normally always a lot of data)
      req.setTimeout(30000);

      // Add the listener
      req.addListener("completed", this.__createOnLoaded(feed), this);

      // And finally send the request
      req.send();
    },


    __createOnLoaded : function(feed)
    {
      return function(response)
      {
        // Read content
        var json = response.getContent();
        try {
          // Normalize json feed data to item list
          var items = feedreader.FeedParser.parseFeed(json);

          for (var i=0; i<items.length; i++)
          {
            var item = items[i];
            var article = new feedreader.model.Article();
            article.set({
              title   : item.title,
              author  : item.author || "",
              date    : item.date,
              content : item.content,
              link    : item.link,
              id      : item.id
            });
            feed.addArticle(article);
          }

          // mark the feed as not loading
          feed.setStatus("loaded");
        }
        catch(ex)
        {
          feed.setStatus("error");
          this.warn("Could not parse feed: " + feed.getUrl());
        }
      }
    }
  }
});