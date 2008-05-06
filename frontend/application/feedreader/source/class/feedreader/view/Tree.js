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

************************************************************************ */

qx.Class.define("feedreader.view.Tree",
{
  extend : qx.ui.tree.Tree,

  construct : function(controller)
  {
    this.base(arguments, "News feeds");

    this._controller = controller;

    this.set(
    {
      width    : 200,
      padding  : 5,
      decorator: "line-right"
    });
    
    // add the root folder
    this._root = new qx.ui.tree.TreeFolder("Feeds");
    this._root.setOpen(true);
    this.setHideRoot(true);
    this.setRoot(this._root);

    this.getManager().addListener("change", this._onChangeSelection, this);    
    this.refresh();
  },

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    refresh : function()
    {
      var db = this._controller.getFeeds();

      // TODO remove old folders?

      for (var url in db) 
      {
        var folder = new qx.ui.tree.TreeFolder(db[url].title);
        folder.setUserData("url", url);
        this.getRoot().add(folder);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onChangeSelection : function(e)
    {
      var controller = this._controller;
      var item = e.getData()[0];
      var url = item.getUserData("url");

      controller.selectFeed(url);
    }
  }
});
