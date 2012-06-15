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
qx.Class.define("feedreader.view.mobile.FeedPage",
{
  extend : qx.ui.mobile.page.NavigationPage,


  construct : function()
  {
    this.base(arguments);
    this.setShowBackButton(true);
    this.setBackButtonText(this.tr("Back"));
  },


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


  members :
  {
    __list : null,
    __articles : null,


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
        var item = this.__articles.getItem(e.getData());
        this.setSelectedArticle(item);
      }, this);

      this.getContent().add(this.__list);
    },


    // property apply
    _applyFeed : function(value, old)
    {
      if (value != null)
      {
        this.__articles = value.getArticles();
        this.__list.setModel(this.__articles);
        this.setTitle(value.getTitle());
      }
      }
    }
});
