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

/**
 * The list displayes the articles of a feed as a list.
 */
qx.Class.define("feedreader.view.List",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(feedList)
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.VBox());

    // Create the header of the list
    var listHeader = new qx.ui.basic.Label(this.tr("Posts"));
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
    this._list.addListener("changeSelection", this._onChangeSelectionView, this);
    this._stack.add(this._list);

    // Create the loading image for the list
    this._listLoadImage = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, "center"));
    loadImage = new qx.ui.basic.Image("feedreader/images/loading66.gif");
    loadImage.setAlignY("middle");
    this._listLoadImage.add(loadImage);
    this._stack.add(this._listLoadImage);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The feed to display in the list */
    feed :
    {
      check : "feedreader.model.Feed",
      nullable : true,
      apply : "_applyFeed"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyFeed : function(value, old)
    {
      this._list.removeAll();

      if (old) {
        old.removeListener("stateModified", this._onFeedStateModified, this);
      }

      if (value)
      {
        value.addListener("stateModified", this._onFeedStateModified, this);
        this._updateFeedState();
      }
    },


    /**
     * Event listener. Called if the loading state of the feed changes
     *
     * @param e {qx.event.type.Data} The change event
     */
    _onFeedStateModified : function(e) {
      this._updateFeedState();
    },


    /**
     * Visualizes the loading state of the feed
     */
    _updateFeedState : function()
    {
      var feed = this.getFeed();
      var state = feed.getState();

      if (state == "loaded")
      {
        this._list.removeAll();
        this._stack.setSelected(this._list);

        var articles = feed.getArticles();
        var selected = feed.getSelected();

        for (var i=0, l=articles.length; i<l; i++)
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
      else if (state == "loading")
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

        // get the feed and select the article
        this.getFeed().setSelected(article);
      }
    }
  }
});
