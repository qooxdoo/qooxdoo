qx.Class.define("feedreader.simulation.DisplayFeeds", {

  extend : feedreader.simulation.FeedreaderAbstract,
  
  members :
  {
    /**
     * Checks the feed tree for items with a "stop" icon which indicates they
     * didn't load correctly.
     */
    testFeedsLoaded : function()
    {
      var itemScript = 'var items = this.getItems();\
      var invalidFeeds = [];\
      for (var i=0,l=items.length; i<l; i++) {\
        if (items[i].getIcon().indexOf("process-stop") >= 0) {\
          invalidFeeds.push(items[i].getLabel());\
        }\
      }\
      return invalidFeeds';
      
      var result = String(this.getQxSelenium().getRunInContext(this.locators.feedTree, itemScript));
      var resultArray = qx.lang.Json.parse(result);
      this.assertArrayEquals([], resultArray, "Feed(s) not loaded correctly! " + resultArray.join(","));
    },
    
    /**
     * Select the first item of the first feed in the tree and check the article
     * view's model
     */
    testSelectFirstArticle : function()
    {
      this.getQxSelenium().qxClick(this.locators.firstFeed);  
      this.getQxSelenium().qxClick(this.locators.firstFeedItem);
      var result = this.getQxSelenium().getQxObjectFunction(this.locators.articleView, "getArticle");
      this.assertMatch(result, "qx\.data\.model");
    }
  }
  
});