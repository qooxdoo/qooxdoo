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

/* ************************************************************************

#asset(feedreader/*)
#asset(qx/icon/Tango/22/apps/internet-feed-reader.png)
#asset(qx/icon/Tango/22/actions/process-stop.png)

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

    // Add the root folder
    this._root = new qx.ui.tree.TreeFolder;
    this._root.setOpen(true);
    this.setHideRoot(true);
    this.setRootOpenClose(true);
    this.setRoot(this._root);

    // Add the subfolders
    this._staticFeedsFolder = new qx.ui.tree.TreeFolder(this.tr("Static Feeds"));
    this._staticFeedsFolder.setOpen(true);
    this.getRoot().add(this._staticFeedsFolder);

    this._userFeedsFolder = new qx.ui.tree.TreeFolder(this.tr("User Feeds"));
    this._userFeedsFolder.setOpen(true);
    this.getRoot().add(this._userFeedsFolder);

    // Register the change listener
    this.addListener("changeSelection", this._onChangeSelectionView, this);

    // Listen for model changes
    feedList.addListener("add", this._onFeedAdded, this);
    feedList.addListener("remove", this._onFeedRemoved, this);
    feedList.addListener("change", this._onFeedSelected, this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Executed on addition of a feed from the list.
     *
     * @param e {qx.event.type.DataEvent} Incoming data event. Contains the added feed.
     */
    _onFeedAdded : function(e)
    {
      var feed = e.getData();
      feed.addListener("stateModified", this._onFeedStateModified, this);

      // create and add a folder for every feed
      var folder = new qx.ui.tree.TreeFolder(feed.getTitle());
      
      this._updateFolderState(folder, feed.getState());
      folder.setUserData("feed", feed);
      
      if (feed.getCategory() == "static") {
        this._staticFeedsFolder.add(folder);
      } else {
        this._userFeedsFolder.add(folder);
      }      
    },
    

    /**
     * Executed on removal of a feed from the list.
     * 
     * @param e {qx.event.type.DataEvent} Incoming data event. Contains the remove feed.
     */
    _onFeedRemoved : function(e)
    {
      var feed = e.getData();
      this.getFolder(feed).destroy();
    },


    /**
     * Visualizes the loading state of the feed folder
     *
     * @param folder {qx.ui.tree.TreeFolder} the folder to update
     * @param state {String} the loading state of the feed
     */
    _updateFolderState : function(folder, state)
    {
      if (state == "new" || state == "loading") 
      {
        folder.setIcon("feedreader/images/loading22.gif");
        folder.resetEnabled();
      }
      else if (state == "loaded")
      {
        folder.setIcon("icon/22/apps/internet-feed-reader.png");
        folder.resetEnabled();
      }
      else if (folder.getParent())
      {
        folder.setIcon("icon/22/actions/process-stop.png");
        folder.setEnabled(false);
      }
    },


    /**
     * Event handler. Called on loading state changes of a feed.
     *
     * @param e {qx.event.type.Data} The change event
     */
    _onFeedStateModified : function(e)
    {
      var feed = e.getTarget();
      var folder = this.getFolder(feed);
      var state = e.getData();

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

      if (item)
      {
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
    _onFeedSelected : function(e)
    {
      var feed = e.getData();

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
  },
  
  
  
  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */
  
  destruct : function()
  {
    this._disposeFields("_feedList");
    this._disposeObjects("_root", "_staticFeedsFolder", "_userFeedsFolder");
  }
});
