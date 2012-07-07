/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */
/* ************************************************************************

#asset(qx/mobile/icon/android/*)
#asset(qx/mobile/icon/ios/*)
#asset(qx/mobile/icon/common/*)

************************************************************************ */

/**
 * The feed reader's mobile main application class.
 */
qx.Class.define("feedreader.MobileApplication",
{
  extend : qx.application.Mobile,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // private members
    __feedFolder : null,
    __overview : null,



    /*
    ---------------------------------------------------------------------------
      APPLICATION METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Application initialization which happens when
     * all library files are loaded and ready
     */
    main : function()
    {
      this.base(arguments);

      // Add log appenders
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      var model = new feedreader.model.Model();
      var loader = feedreader.io.FeedLoader.getInstance();
      this.__feedFolder = model.getFeedFolder();

      loader.loadAll(this.__feedFolder);

      this.buildUpGui();
    },


    /**
     * Installs listener for "stateModified" on any feed available.
     */
    __installStateListeners : function (feedFolder) {
      // static feeds
      var staticFeeds = feedFolder.getFeeds().getItem(0).getFeeds();
      for (var i = 0; i < staticFeeds.length; i++) {
        var staticFeed = staticFeeds.getItem(i);
        staticFeed.addListener("stateModified", this.__onStateChanged, this);
      }
      // user feeds
      var userFeeds = feedFolder.getFeeds().getItem(1).getFeeds();
      for (i = 0; i < userFeeds.length; i++) {
        staticFeed.addListener("stateModified", this.__onStateChanged, this);
      }
    },


    /**
     * Main routine which builds the whole GUI.
     */
    buildUpGui : function()
    {
      // create the pages
      var overview = new feedreader.view.mobile.OverviewPage();
      var feedpage = new feedreader.view.mobile.FeedPage();
      var articlePage = new feedreader.view.mobile.ArticlePage();

      this.__overview = overview;

      var manager = new qx.ui.mobile.page.Manager(false,this.getRoot());
      manager.addDetail([overview,feedpage,articlePage]);

      // show the first page and set the feeds
      overview.show();
      overview.setFeeds(this.__feedFolder);

      this.__installStateListeners(this.__feedFolder,overview);

      // connect the back buttons
      feedpage.addListener("back", function() {
        overview.show({reverse: true});
        overview.setSelectedFeed(null);
      });

      articlePage.addListener("back", function() {
        feedpage.show({reverse: true});
        feedpage.setSelectedArticle(null);
      });

      // connect the page flow
      feedpage.addListener("changeSelectedArticle", function(e) {
        if(e.getData()){
          articlePage.show();
        }
      });

      overview.addListener("changeSelectedFeed", function(e) {
        if(e.getData()){
          feedpage.show();
        }
      });

      // bind the data
      overview.bind("selectedFeed", feedpage, "feed");
      feedpage.bind("selectedArticle", articlePage, "article");
    },


    /**
     * Handler for stateChanges on any feed.
     */
    __onStateChanged : function() {
      this.__overview.setFeeds(null);
      this.__overview.setFeeds(this.__feedFolder);
    }

  }
});