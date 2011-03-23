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
 * The main page of the mobile part of the feed reader.
 */
qx.Class.define("feedreader.mobile.OverviewPage", 
{
  extend : qx.ui.mobile.page.Page,

  properties : {
    /**
     * Model for all feeds which should be shown.
     */
    feeds : {
      event : "changeFeeds",
      init : null,
      apply : "_applyFeeds"
    },


    /**
     * The current selected feed of the view.
     */
    selectedFeed : {
      event : "changeSelectedFeed",
      init : null
    }
  },


  members :
  {
    __list : null,
    __predefinedFeeds : null,

    // overridden
    _initialize : function() {
      this.base(arguments);

      // create the toolbar
      var toolbar = new qx.ui.mobile.toolbar.ToolBar();
      var title = new qx.ui.mobile.toolbar.Title("Feed Reader");
      toolbar.add(title, {flex: 1});
      this.add(toolbar);

      // add a scroller
      var scroller = new qx.ui.mobile.container.Scroller();
      this.add(scroller, {flex: 1});
      
      // add a list
      this.__list = new qx.ui.mobile.list.List();
      this.__list.setListItem(new feedreader.mobile.FeedItem());
      scroller.add(this.__list);
      
      this.__list.addListener("changeSelection", function(e) {
        var item = this.__predefinedFeeds.getItem(e.getData());
        this.setSelectedFeed(item);
      }, this);
    },


    // property apply
    _applyFeeds : function(value, old) {
      this.__predefinedFeeds = value.getFeeds().getItem(0).getFeeds();
      this.__list.setModel(this.__predefinedFeeds);
    }
  }
});
