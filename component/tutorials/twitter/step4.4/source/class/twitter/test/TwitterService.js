qx.Class.define("twitter.test.TwitterService", {

  extend : qx.dev.unit.TestCase,

  members :
  {
    __twitterService : null,

    setUp : function()
    {
      this.__twitterService = new twitter.TwitterService();
    },

    tearDown : function()
    {
      this.__twitterService.dispose();
      this.__twitterService = null;
    },

    testFetchTweets : function()
    {
      this.__twitterService.addListener("changeTweets", function() {
        this.resume();
      }, this);

      qx.event.Timer.once(function() {
        this.__twitterService.fetchTweets();
      }, this, 100);

      this.wait(5000);
    }
  }
});