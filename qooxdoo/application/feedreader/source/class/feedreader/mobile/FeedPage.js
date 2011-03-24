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
 * Responsible for showing a list of articles for the mobile UI.
 */
qx.Class.define("feedreader.mobile.FeedPage", 
{
  extend : qx.ui.mobile.page.Page,

  properties : {
    /**
     * Model object holding the feed which should be shown.
     */
    feed : {
      event : "changeFeed", 
      init : null,
      nullable : true,
      apply : "_applyFeed"
    },


    /**
     * Model of the currently selected article.
     */
    selectedArticle : {
      event : "changeSelectedArticle",
      init : null,
      nullable : true
    }
  },


  events : {
    /**
     * Navigation event for the back button.
     */
    "back" : "qx.event.type.Event"
  },

  members :
  {
    __list : null,
    __title : null,
    __articles : null,


    // overridden
    _initialize : function() {
      this.base(arguments);

      // create the navigationbar
      var navigationbar = new qx.ui.mobile.navigationbar.NavigationBar();
      var backButton = new qx.ui.mobile.navigationbar.BackButton(this.tr("Back"));
      navigationbar.add(backButton);
      backButton.addListener("tap", function() {
        this.fireEvent("back");
      }, this);
      this.__title = new qx.ui.mobile.navigationbar.Title("Feed");
      navigationbar.add(this.__title, {flex: 1});
      this.add(navigationbar);

      // add a scroller
      var scroller = new qx.ui.mobile.container.Scroller();
      this.add(scroller, {flex: 1});
      
      // add a list
      this.__list = new qx.ui.mobile.list.List();
      this.__list.setListItem(new feedreader.mobile.FeedItem());
      scroller.add(this.__list);

      this.__list.addListener("changeSelection", function(e) {
        var item = this.__articles.getItem(e.getData());
        this.setSelectedArticle(item);
      }, this);
    },


    // property apply
    _applyFeed : function(value, old) {
      if (value != null) {
        this.__articles = value.getArticles();
        this.__list.setModel(this.__articles);
        this.__title.setValue(value.getTitle());
      }
    }
  }
});
