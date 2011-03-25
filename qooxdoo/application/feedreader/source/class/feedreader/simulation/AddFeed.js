qx.Class.define("feedreader.simulation.AddFeed", {
  
  extend : feedreader.simulation.FeedreaderAbstract,
  
  members :
  {
    testAddFeed : function()
    {
      this.getQxSelenium().setSpeed("1000");
      // Get the last item's label
      var lastItemScript = 'return this.getItems()[this.getItems().length -1].getLabel()';
      var lastFeedLabel = String(this.getQxSelenium().getRunInContext(this.locators.feedTree, lastItemScript));
      
      // Click "Add Feed"
      this.getQxSelenium().qxClick(this.locators.addFeedButton);
      
      this.getSimulation().waitForWidget(this.locators.feedWindow, 10000);
      
      // Enter new feed details
      this.getQxSelenium().qxType(this.locators.feedWindow + "/qx.ui.form.renderer.SinglePlaceholder/child[1]", "Golem");
      this.getQxSelenium().qxType(this.locators.feedWindow + "/qx.ui.form.renderer.SinglePlaceholder/child[2]", "http://rss.golem.de/rss.php?feed=ATOM1.0");
      
      this.getQxSelenium().qxClick(this.locators.feedWindowButton);
      this.getSimulation().wait(2000);
      
      // Check if the Add Feed window was closed
      // assertException won't work with Rhino's JavaExceptions
      var exception;
      try {
        this.getQxSelenium().qxClick(this.locators.feedWindow);
      } catch(ex) {
        exception = true;
      }
      if (!exception) {
        throw new Error("Add Feed window did not close!");
      }
    
      // Check if the new feed loaded.
      this.waitForFeeds();
      
      var lastFeedLabelNew = String(this.getQxSelenium().getRunInContext(this.locators.feedTree, lastItemScript));
      this.assertNotEquals(lastFeedLabelNew, lastFeedLabel);
    }
  }
  
});