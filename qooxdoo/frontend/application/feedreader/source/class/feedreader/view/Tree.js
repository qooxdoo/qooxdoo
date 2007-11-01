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

qx.Class.define("feedreader.Tree",
{
  construct : function()
  {
    // add tree
    var tree = new qx.ui.tree.Tree(this.tr("News feeds"));

    tree.set(
    {
      height   : "100%",
      width    : "100%",
      padding  : 5,
      border   : "line-right",
      overflow : "auto"
    });

    var feedDesc = this._feedDesc;

    for (var i=0; i<feedDesc.length; i++)
    {
      var folder = new qx.ui.tree.TreeFolder(feedDesc[i].name);

      tree.getManager().addEventListener("changeSelection", function(e)
      {
        if (e.getData()[0].getParentFolder()) {
          this.displayFeed(e.getData()[0].getLabel());
        }
      },
      this);

      tree.add(folder);
    }
  },

  members : {}
});
