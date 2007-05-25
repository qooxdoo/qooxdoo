/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(treevirtual)

************************************************************************ */

/**
 * A data row renderer for a simple tree row
 */
qx.Class.define("qx.ui.treevirtual.SimpleTreeDataRowRenderer",
{
  extend : qx.ui.table.rowrenderer.Default,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param rowInfo {var} TODOC
     * @param rowElem {var} TODOC
     * @return {void}
     */
    updateDataRowElement : function(rowInfo, rowElem)
    {
      // If the node is selected, select the row
      var tree = rowInfo.table;
      var rowData = rowInfo.rowData;
      var tableModel = tree.getTableModel();
      var treeCol = tableModel.getTreeColumn();
      var node = rowData[treeCol];

      // Set the row's selected state based on the data model
      rowInfo.selected = node.bSelected;

      if (node.bSelected)
      {
        // Ensure that the selection model knows it's selected
        var nodeRowMap = tableModel.getNodeRowMap();
        var row = nodeRowMap[node.nodeId];
        tree.getSelectionModel()._addSelectionInterval(row, row);
      }

      // Now call our superclass
      var ddrr = qx.ui.table.rowrenderer.Default;
      ddrr.prototype.updateDataRowElement.call(this, rowInfo, rowElem);
    }
  }
});
