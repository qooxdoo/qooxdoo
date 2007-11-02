/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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
    this.base(arguments, this.tr("News feeds"));
    
    this._controller = controller;
    
    this.set(
    {
      height   : "100%",
      width    : "100%",
      padding  : 5,
      border   : "line-right",
      overflow : "auto"
    });
    
    this.getManager().addEventListener("changeSelection", this._onChangeSelection, this);
    this.refresh();
  },

  members : 
  {
    refresh : function()
    {
      var db = this._controller.getFeeds();
      for (var url in db)
      {
        var folder = new qx.ui.tree.TreeFolder(db[url].title);
        folder.setUserData("url", url);
        this.add(folder);
      }      
    },
    
    _onChangeSelection : function(e)
    {
      var controller = this._controller;
      var item = e.getData()[0];
      var url = item.getUserData("url");
      
      controller.selectFeed(url);
    }
  }
});
