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

qx.Class.define("feedreader.view.Tree",
{
  extend : qx.ui.tree.Tree,

  construct : function(controller)
  {
    this.base(arguments, "News feeds");

    // save the reference to the controller
    this._controller = controller;

    // set the properties of the tree
    this.setBackgroundColor("white");
    this.setWidth(200);
    this.setDecorator("line-right");

    // add the root folder
    this._root = new qx.ui.tree.TreeFolder("Feeds");
    this._root.setOpen(true);
    this.setHideRoot(true);
    this.setRootOpenClose(true);
    this.setRoot(this._root);

    // add the subfolders
    this._staticFeedsFolder = new qx.ui.tree.TreeFolder("Static Feeds");
    this._staticFeedsFolder.setOpen(true);
    this.getRoot().add(this._staticFeedsFolder);
    this._userFeedsFolder = new qx.ui.tree.TreeFolder("User Feeds");
    this._userFeedsFolder.setOpen(true);
    this.getRoot().add(this._userFeedsFolder);

    // register the change listener
    this.addListener("change", this._onChangeSelection, this);

    // refresh the tree view
    this.refresh();
  },

  members :
  {

    /**
     * Invokes a refresh of the tree.
     * This includes getting the feeds of the controller and
     * creation of a tree folder for every feed.
     */
    refresh : function()
    {
      // get the feeds
      var db = this._controller.getFeeds();

      // remove old folders
      this._staticFeedsFolder.removeAll();
      this._userFeedsFolder.removeAll();

      // go threw all feeds
      for (var url in db)
      {
        // create and add a folder for every feed
        var folder = new qx.ui.tree.TreeFolder(db[url].title);
        folder.setIcon("feedreader/images/loading22.gif");
        folder.setUserData("url", url);
        if (db[url].predefined) {
          this._staticFeedsFolder.add(folder);
        } else {
          this._userFeedsFolder.add(folder);
        }
      }
    },


    addFeed : function(url)
    {
      // get the feeds
      var db = this._controller.getFeeds();

      // create and add a folder for the feed
      var folder = new qx.ui.tree.TreeFolder(db[url].title);
      folder.setIcon("feedreader/images/loading22.gif");
      folder.setUserData("url", url);
      if (db[url].predefined) {
        this._staticFeedsFolder.add(folder);
      } else {
        this._userFeedsFolder.add(folder);
      }
    },


    /**
     * Returns the tree folder associated with the given url.
     * If no folder is associated with the url, null will be returned.
     *
     * @param url {String} The url of the feed.
     * @return {qx.ui.tree.AbstractTreeItem | null} The tree folder or null.
     */
    getFolderByUrl : function(url)
    {
      // get all folders (recursive)
      var folders = this.getItems(true);
      for (var i = 0; i < folders.length; i++) {
          var folderUrl = folders[i].getUserData("url");
          if (folderUrl == url) {
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
    _onChangeSelection : function(e)
    {
      // get the url of the item
      var item = e.getData()[0];

      if (item) {
        var url = item.getUserData("url");

        // tell the controller to select the new feed
        this._controller.selectFeed(url);
      }
    }
  }
});
