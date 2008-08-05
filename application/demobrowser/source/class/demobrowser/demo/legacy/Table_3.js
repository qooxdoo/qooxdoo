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

************************************************************************ */

/* ************************************************************************

#use(qx.legacy.theme.ClassicRoyale)

************************************************************************ */

/**
 * Table using the ConditionalDataCellRenderer to display values in different
 * ranges using varying colors; and the ImageDataCellRenderer to display
 * varying images.
 */
qx.Class.define("demobrowser.demo.legacy.Table_3",
{
  extend : qx.legacy.application.Gui,

  members :
  {
    main : function()
    {
      this.base(arguments);
      var d = qx.legacy.ui.core.ClientDocument.getInstance();

      // table model
      var tableModel = new qx.legacy.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "Number 1", "Number 2", "Image" ]);

      var image = [
                   "widget/tree/plus.gif",
                   "widget/tree/minus.gif"
                  ];

      var rowData = [];
      for (var row = 0; row < 100; row++) {
        var x = Math.random() * 1000;
        rowData.push([ row, x, x, image[Math.floor(x) % 2] ]);
      }
      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);

      // table
      var table = new qx.legacy.ui.table.Table(tableModel);
      with (table) {
        set({
              left:20,
              top:20,
              width:550,
              height:400,
              border:"inset-thin"
            });
        setMetaColumnCounts([1, -1]);
        var selectionMode =
          qx.legacy.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION;
        getSelectionModel().setSelectionMode(selectionMode);
        var newRenderer =
          new qx.legacy.ui.table.cellrenderer.Conditional("right", "", "", "");

        try {
          newRenderer.addNumericCondition(">", 0,   null,
                                          "FF0000", null, null);
          newRenderer.addNumericCondition(">", 50,  null,
                                          "EE0011", null, null);
          newRenderer.addNumericCondition(">", 100, null,
                                          "DD0022", null, null);
          newRenderer.addNumericCondition(">", 150, null,
                                          "CC0033", null, null);
          newRenderer.addNumericCondition(">", 200, null,
                                          "BB0044", null, null);
          newRenderer.addNumericCondition(">", 250, null,
                                          "AA0055", null, null);
          newRenderer.addNumericCondition(">", 300, null,
                                          "990066", null, null);
          newRenderer.addNumericCondition(">", 350, null,
                                          "880077", null, null);
          newRenderer.addNumericCondition(">", 400, null,
                                          "770088", null, null);
          newRenderer.addNumericCondition(">", 450, null,
                                          "660099", null, null);
          newRenderer.addNumericCondition(">", 500, null,
                                          "5500AA", null, null);
          newRenderer.addNumericCondition(">", 550, null,
                                          "4400BB", null, null);
          newRenderer.addNumericCondition(">", 600, null,
                                          "3300CC", null, null);
          newRenderer.addNumericCondition(">", 650, null,
                                          "2200DD", null, null);
          newRenderer.addNumericCondition(">", 700, null,
                                          "1100EE", null, null);
          newRenderer.addNumericCondition(">", 750, null,
                                          "0000FF", null, null);
          newRenderer.addNumericCondition(">", 800, null,
                                          "0033FF", null, null);
          newRenderer.addNumericCondition(">", 850, null,
                                          "0066FF", null, null);
          newRenderer.addNumericCondition(">", 900, null,
                                          "0099FF", null, null);
          newRenderer.addNumericCondition(">", 950, "center",
                                          "00CCFF", null, "bold");
        } catch (ex) {
          alert("Error: " + ex);
        }

        getTableColumnModel().setDataCellRenderer(2, newRenderer);

        var renderer = new qx.legacy.ui.table.cellrenderer.Image(19, 16);
        getTableColumnModel().setDataCellRenderer(3, renderer);
      };

      d.add(table);
    }
  }
});