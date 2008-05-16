
qx.Class.define("feedreader.model.FeedList",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
    this.__feeds = [];
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

    addFeed : function(feed)
    {
      this.__feeds.push(feed);
      this.fireEvent("change");
    },

    removeFeed : function(feed)
    {
      qx.lang.Array.remove(this.__feeds, feed);

      if (this.getSelected() == feed) {
        this.setSelected(null);
      }
      this.fireEvent("change");
    }
  }
})