qx.Class.define("tweets.IdenticaService",
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
        var url = "http://identi.ca/api/statuses/public_timeline.json";
        this.__store = new qx.data.store.Jsonp(url, null, "callback");
        this.__store.bind("model", this, "tweets");
      } else {
        this.__store.reload();
      }
    },


    post : function(message)
    {
      // redirect to identi.ca
      window.open("http://identi.ca/?action=newnotice&status_textarea=" + encodeURIComponent(message));
    }
  }
});
