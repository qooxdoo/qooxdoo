
qx.Class.define("feedreader.model.FeedList",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
    this.__feeds = {};
  },

  events :
  {
    "change" : "qx.event.type.Event"
  },

  properties :
  {
    selected :
    {
      check : "feedreader.model.Feed",
      nullable : true,
      init : null,
      event : "changeSelected"
    }
  },

  members :
  {
    getFeeds : function() {
      return qx.lang.Object.getValues(this.__feeds);
    },

    getFeedByUrl : function(url) {
      return this.__feeds[url];
    },

    addFeed : function(feed)
    {
      this.__feeds[feed.getUrl()] = feed;
      this.fireEvent("change");
    },

    removeFeed : function(feed)
    {
      delete this.__feeds[feed.getUrl()];

      if (this.getSelected() == feed) {
        this.setSelected(null);
      }
      this.fireEvent("change");
    }
  }
})