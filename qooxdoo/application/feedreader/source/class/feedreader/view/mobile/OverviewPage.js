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
qx.Class.define("feedreader.view.mobile.OverviewPage",
{
  extend : qx.ui.mobile.page.NavigationPage,


  construct : function()
  {
    this.base(arguments);
    this.setTitle("Feed Reader");
  },


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
      init : null,
      nullable : true
    }
  },


  members :
  {
    __list : null,
    __predefinedFeeds : null,

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      // add a list
      this.__list = new qx.ui.mobile.list.List();
      this.__list.setDelegate({
        configureItem : function(item, data)
        {
          item.setTitle(data.getTitle());
          item.setShowArrow(true);
        }
      });

      this.__list.addListener("changeSelection", function(e) {
        var item = this.__predefinedFeeds.getItem(e.getData());
        this.setSelectedFeed(item);
      }, this);

      this.getContent().add(this.__list);
    },


    // property apply
    _applyFeeds : function(value, old) {
      this.__predefinedFeeds = value.getFeeds().getItem(0).getFeeds();
      this.__list.setModel(this.__predefinedFeeds);
    }
  }
});
