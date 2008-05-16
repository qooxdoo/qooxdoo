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
 * this class displays the feed list as tree
 */
qx.Class.define("feedreader.view.Tree",
{
  extend : qx.ui.tree.Tree,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param feedList {feedreader.model.FeedList} the feed list to display
   */
  construct : function(feedList)
  {
    this.base(arguments);

    this._feedList = feedList;

    // Set the properties of the tree
    this.setBackgroundColor("white");
    this.setWidth(200);
    this.setDecorator("line-right");

    // Add the root folder
    this._root = new qx.ui.tree.TreeFolder("Feeds");
    this._root.setOpen(true);
    this.setHideRoot(true);
    this.setRootOpenClose(true);
    this.setRoot(this._root);

    // Add the subfolders
    this._staticFeedsFolder = new qx.ui.tree.TreeFolder("Static Feeds");
    this._staticFeedsFolder.setOpen(true);
    this.getRoot().add(this._staticFeedsFolder);
    this._userFeedsFolder = new qx.ui.tree.TreeFolder("User Feeds");
    this._userFeedsFolder.setOpen(true);
    this.getRoot().add(this._userFeedsFolder);

    // Register the change listener
    this.addListener("change", this._onChangeSelectionView, this);

    // Refresh the tree view
    this._refresh();

    // listen for model changes
    feedList.addListener("change", this._refresh, this);
    feedList.addListener("changeSelected", this._onChangeSelectionModel, this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Invokes a refresh of the tree.
     * This includes getting the feeds of the controller and
     * creation of a tree folder for every feed.
     */
    _refresh : function()
    {
      // remove old folders
      this._staticFeedsFolder.removeAll();
      this._userFeedsFolder.removeAll();

      var feeds = this._feedList.getFeeds();

      // go threw all feeds
      for (var i=0; i<feeds.length; i++)
      {
        var feed = feeds[i];

        feed.addListener("changeState", this._onFeedChangeState, this);

        // create and add a folder for every feed
        var folder = new qx.ui.tree.TreeFolder(feed.getTitle());
        this._updateFolderState(folder, feed.getState());
        folder.setUserData("feed", feed);
        if (feed.getCategory() == "static") {
          this._staticFeedsFolder.add(folder);
        } else {
          this._userFeedsFolder.add(folder);
        }
      }
    },


    /**
     * Visualizes the loading state of the feed folder
     *
     * @param folder {qx.ui.tree.TreeFolder} the folder to update
     * @param state {String} the loading state of the feed
     */
    _updateFolderState : function(folder, state)
    {
      if (state == "new" || state == "loading") {
        folder.setIcon("feedreader/images/loading22.gif");
      } else if (state == "loaded") {
        folder.setIcon("icon/22/apps/internet-feed-reader.png");
      } else if (folder.getParent()) {
        folder.getParent().remove(folder);
      }
    },


    /**
     * Event handler. Called on loading state changes of a feed.
     *
     * @param e {qx.event.type.Change} The change event
     */
    _onFeedChangeState : function(e)
    {
      var feed = e.getTarget();
      var folder = this.getFolder(feed);
      var state = e.getValue();

      if (!folder) {
        return;
      }

      this._updateFolderState(folder, state);
    },


    /**
     * Get the folder widget for the given feed
     *
     * @param feed {feedreader.model.Feed} feed to get the folder widget for
     * @return {qx.ui.tree.TreeFolder} the folder widget
     */
    getFolder : function(feed)
    {
      // get all folders (recursive)
      var folders = this.getItems(true);
      for (var i = 0; i < folders.length; i++)
      {
        var folderFeed = folders[i].getUserData("feed");
        if (folderFeed == feed) {
          return folders[i];
        }
      }
      return null;
    },


    /**
     * Event handler for the change event of the tree selection.
     *
     * @param e {qx.event.type.Data} The data event of the tree managers change.
     */
    _onChangeSelectionView : function(e)
    {
      // get the feed of the item
      var item = e.getData()[0];

      if (item) {
        var feed = item.getUserData("feed");

        // tell the controller to select the new feed
        this._feedList.setSelected(feed);
      }
    },


    /**
     * Event handler for the change event of feed list.
     *
     * @param e {qx.event.type.Data} The data event of the feed list change.
     */
    _onChangeSelectionModel : function(e)
    {
      var feed = e.getValue();

      if (!feed)
      {
        if (this.getSelection()[0].getUserData("feed")) {
          this.clearSelection();
        }
        return;
      }

      var folder = this.getFolder(feed);
      if (!folder) {
        this.clearSelection();
      }

      if (this.getSelectedItem() != folder) {
        this.addToSelection(folder);
      }
    }
  }
});
