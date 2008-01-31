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

qx.Class.define("feedreader.view.Table",
{
  extend : qx.ui.table.Table,

  construct : function(controller)
  {
    // Establish controller link
    this._controller = controller;

    // Create table model
    this._tableModel = new qx.ui.table.model.Simple();
    this._tableModel.setColumnIds([ "title", "date", "id" ]);

    this._tableModel.setColumnNamesById(
    {
      title : this.tr("Subject"),
      date  : this.tr("Date"),
      id    : this.tr("ID")
    });

    // Customize the table column model. We want one that
    // automatically resizes columns.
    this.base(arguments, this._tableModel,
    {
      tableColumnModel : function(obj) {
        return new qx.ui.table.columnmodel.Resize(obj);
      }
    });

    // Basic setup
    this.setDimension("100%", "100%");
    this.setBorder("line-bottom");
    this.setStatusBarVisible(false);
    this.getDataRowRenderer().setHighlightFocusRow(false);
    this.getPaneScroller(0).setShowCellFocusIndicator(false);

    // Configure columns
    var columnModel = this.getTableColumnModel();
    var resizeBehavior = columnModel.getBehavior();

    resizeBehavior.setWidth(0, "3*");
    resizeBehavior.setWidth(1, "1*");

    this.getTableColumnModel().setColumnVisible(2, false);

    // Add selection listener
    this.getSelectionModel().addEventListener("changeSelection", this._onChangeSelection, this);
  },

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onChangeSelection : function(e)
    {
      var selectedEntry = this.getSelectionModel().getAnchorSelectionIndex();
      var feed = this._controller.getSelectedFeed();

      if (selectedEntry >= 0)
      {
        var itemData = this.getTableModel().getRowData(selectedEntry);

        // If this is undefined, the data is not yet ready...
        if (itemData)
        {
          var itemId = itemData[2];

          feed.selected = itemId;
          this._controller.setSelectedArticle(feed.items[itemId]);
        }
      }
    }
  }
});
