/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tino Butz (tbtz)

************************************************************************ */
/**
 * Main model containing the feeds and all the data. This is shared for
 * mobiel and desktop.
 */
qx.Class.define("feedreader.model.Model",
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);

    this._initializeModel();
  },


  properties : {
    /**
     * Contains the root folder of all feeds.
     */
    feedFolder : {
      init : null,
      event : "changeFeedFolder",
      nullable: true
    },


    /**
     * A folder containing all static feeds.
     */
    staticFeedFolder : {
      init : null,
      event : "changeStaticFeedFolder",
      nullable: true
    },


    /**
     * A folder containing all user feeds.
     */
    userFeedFolder : {
      init : null,
      event : "changeUserFeedFolder",
      nullable: true
    }
  },


  members :
  {
    /**
     * Sets up the model data. Also initializes the load of all the feeds.
     */
    _initializeModel : function()
    {
      // create the root folder
      var feedFolder = new feedreader.model.FeedFolder("Feeds");

      // Add static feeds
      var staticFeedFolder =
        new feedreader.model.FeedFolder(qx.locale.Manager.tr("Static Feeds"));
      feedFolder.getFeeds().push(staticFeedFolder);
      staticFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "qooxdoo News", "http://feeds2.feedburner.com/qooxdoo/news/content", "static"
        )
      );
      staticFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Google Chrome Releases", "http://feeds.feedburner.com/GoogleChromeReleases?format=xml", "static"
        )
      );
      staticFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Daring Fireball", "http://daringfireball.net/index.xml", "static"
        )
      );
      staticFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Surfin' Safari", "http://webkit.org/blog/feed/", "static"
        )
      );

      // Add user feeds
      var userFeedFolder =
        new feedreader.model.FeedFolder(qx.locale.Manager.tr("User Feeds"));
      feedFolder.getFeeds().push(userFeedFolder);
      userFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Heise", "http://www.heise.de/newsticker/heise-atom.xml", "user"
        )
      );
      userFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "IEBlog", "http://blogs.msdn.com/ie/rss.xml", "user"
        )
      );
      userFeedFolder.getFeeds().push(
        new feedreader.model.Feed(
          "Opera Desktop Blog", "http://my.opera.com/desktopteam/xml/rss/blog/", "user"
        )
      );

      this.setFeedFolder(feedFolder);
      this.setStaticFeedFolder(staticFeedFolder);
      this.setUserFeedFolder(userFeedFolder);
    }
  }
});
