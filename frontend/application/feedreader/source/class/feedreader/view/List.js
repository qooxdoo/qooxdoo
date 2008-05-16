/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("feedreader.view.List",
{
  extend : qx.ui.core.Widget,


  construct : function(feedList)
  {
    this.base(arguments);

    this._feedList = feedList;

    this._setLayout(new qx.ui.layout.VBox());

    // Create the header of the list
    var listHeader = new qx.ui.basic.Label("Posts");
    listHeader.setBackgroundColor("background-light");
    listHeader.setPadding(5);
    listHeader.setDecorator("line-bottom");
    listHeader.setAllowGrowX(true);
    listHeader.setFont("bold");
    this._add(listHeader);

    // Create the stack for the list
    this._stack = new qx.ui.container.Stack();
    this._add(this._stack, {flex: 1});

    // create list view
    this._list = new qx.ui.form.List()
    this._list.setSelectionMode("single");
    this._list.setDecorator(null);
    this._list.setBackgroundColor("white");
    this._list.addListener("change", this._onChangeSelectionView, this);
    this._stack.add(this._list);

    // Create the loading image for the list
    this._listLoadImage = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, "center"));
    this._listLoadImage.setBackgroundColor("background-light");
    loadImage = new qx.ui.basic.Image("feedreader/images/loading66.gif");
    loadImage.setAlignY("middle");
    this._listLoadImage.add(loadImage);
    this._stack.add(this._listLoadImage);
  },


  properties :
  {
    feed :
    {
      check : "feedreader.model.Feed",
      apply : "_applyFeed"
    }
  },


  members :
  {
    _applyFeed : function(value, old)
    {
      this._list.removeAll();

      if (old) {
        old.removeListener("changeStatus", this._onChangeStatusFeed, this);
      }

      if (value)
      {
        value.addListener("changeStatus", this._onChangeStatusFeed, this);
        this._updateFeedStatus();
      }
    },


    _onChangeStatusFeed : function(e) {
      this._updateFeedStatus();
    },


    _updateFeedStatus : function()
    {
      var feed = this.getFeed();
      var status = feed.getStatus();

      if (status == "loaded")
      {
        this._stack.setSelected(this._list);

        var articles = feed.getArticles();
        var selected = feed.getSelected();

        for (var i=0; i<articles.length; i++)
        {
          var article = articles[i];
          var listItem = new qx.ui.form.ListItem(article.getTitle());
          listItem.setUserData("article", article);
          this._list.add(listItem);

          if (article == selected) {
            this._list.addToSelection(listItem);
          }
        }
      }
      else if (status == "loading")
      {
        this._stack.setSelected(this._listLoadImage);
      }
    },


    /**
     * Event handler for the change event of the selection.
     *
     * @param e {qx.event.type.Data} The data event of the list managers change.
     */
    _onChangeSelectionView : function(e)
    {
      // get the selected item
      var item = e.getData()[0];

      if (item)
      {
        // get the article model
        var article = item.getUserData("article");

        // get the selected feed and select the article
        var feed = this._feedList.getSelected();
        feed.setSelected(article);
      }
    }
  }
});
