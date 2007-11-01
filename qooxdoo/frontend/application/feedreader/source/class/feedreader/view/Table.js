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

qx.Class.define("feedreader.Table",
{
  extend : qx.ui.table.xxx,
  
  construct : function()
  {
    // create table model
    this._tableModel = new qx.ui.table.model.Simple();
    this._tableModel.setColumnIds([ "title", "author", "date", "id" ]);

    this._tableModel.setColumnNamesById(
    {
      title  : this.tr("Subject"),
      author : this.tr("Sender"),
      date   : this.tr("Date"),
      id     : this.tr("ID")
    });

    // add table
    // Customize the table column model.  We want one that automatically
    // resizes columns.
    var custom =
    {
      tableColumnModel : function(obj) {
        return new qx.ui.table.columnmodel.Resize(obj);
      }
    };

    var table = new qx.ui.table.Table(this._tableModel, custom);

    table.set(
    {
      height : "100%",
      width  : "100%",
      border : "line-bottom"
    });

    table.setStatusBarVisible(false);
    table.getDataRowRenderer().setHighlightFocusRow(false);
    table.getPaneScroller(0).setShowCellFocusIndicator(false);
    table.getTableColumnModel().setColumnWidth(0, 350);
    table.getTableColumnModel().setColumnWidth(1, 200);
    table.getTableColumnModel().setColumnWidth(2, 200);
    table.getTableColumnModel().setColumnVisible(3, false);

    table.getSelectionModel().addEventListener("changeSelection", function(e)
    {
      var selectedEntry = table.getSelectionModel().getAnchorSelectionIndex();
      var feedName = this.getSelectedFeed();

      if (selectedEntry >= 0)
      {
        var feeds = this.getFeeds();
        var itemId = this._tableModel.getRowData(selectedEntry)[3];
        feeds[feedName].selected = itemId;
        var item = feeds[feedName].items[itemId];
        this.displayArticle(item);
      }
    },
    this);    
    
    
    
  }
});
