qx.Class.define("twitter.TwitterService",
{
  extend : qx.core.Object,

  properties : {
    tweets : {
      nullable: true,
      event: "changeTweets"
    }
  },


  events : {
    "postOk" : "qx.event.type.Event"
  },


  members :
  {
    __store : null,


    fetchTweets : function() {
      if (this.__store == null) {
        var url = "http://api.twitter.com/1/statuses/public_timeline.json";
        this.__store = new qx.data.store.Jsonp(url, null, "callback");
        this.__store.bind("model", this, "tweets");
      } else {
        this.__store.reload();
      }
    },


    post : function(message)
    {
      // redirect to twitter because an OAuth login would be too much for this
      // tutorial
      window.open("http://twitter.com/?status=" + encodeURIComponent(message));
    }
  }
});
