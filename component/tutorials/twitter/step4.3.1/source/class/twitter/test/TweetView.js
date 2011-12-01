/* ************************************************************************
#asset(twitter/test.png)
************************************************************************ */

qx.Class.define("twitter.test.TweetView", {

  extend : qx.dev.unit.TestCase,

  members :
  {
    __tweetView : null,


    setUp : function()
    {
      this.__tweetView = new twitter.TweetView();
    },

    tearDown : function()
    {
      this.__tweetView.dispose();
      this.__tweetView = null;
    },

    testSetIcon : function()
    {
      var expectedSource = qx.util.ResourceManager.getInstance().toUri("test.png");
      this.__tweetView.setIcon(expectedSource);
      var foundSource = this.__tweetView.getChildControl("icon").getSource();
      this.assertEquals(expectedSource, foundSource, "Icon source was not set correctly!");
    }
  }
});