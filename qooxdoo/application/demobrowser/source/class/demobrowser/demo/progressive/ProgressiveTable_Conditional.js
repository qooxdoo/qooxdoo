/*
 * Example of using the Conditional cell renderer with Progressive's Table.
 */
qx.Class.define("demobrowser.demo.progressive.ProgressiveTable_Conditional",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var nextId = 0;
      var createRandomRows = function(rowCount)
        {
        var rowData = [ ];
        for (var row = 0; row < rowCount; row++)
        {
          var x = Math.random() * 1000;
          rowData.push(
                       {
                         renderer : "row",
                         location : "end",
                         data     : [ row, x, x ]
                       });
        }

        return rowData;
      };

      var columnWidths = new qx.ui.progressive.renderer.table.Widths(3);
      var columnNames = [ "ID", "Number 1", "Number 2" ];

      // Instantiate a Progressive with a default structure with header
      var header = new qx.ui.progressive.headfoot.TableHeading(columnWidths,
                                                               columnNames);
      var footer = new qx.ui.progressive.headfoot.Progress(columnWidths,
                                                           columnNames);
      var structure = new qx.ui.progressive.structure.Default(header,
                                                              footer);
      var progressive = new qx.ui.progressive.Progressive(structure);

      // Instantiate a data model and populate it.
      var dataModel = new qx.ui.progressive.model.Default();
      var rowData = createRandomRows(100);
      dataModel.addElements(rowData);

      // Tell Progressive about its data model
      progressive.setDataModel(dataModel);

      // Instantiate a table row renderer
      var rowRenderer =
        new qx.ui.progressive.renderer.table.Row(columnWidths);

      // Give Progressive the renderer, and assign a name
      progressive.addRenderer("row", rowRenderer);

      // Tell the row renderer to use a conditional renderer for column 2
      var r = new qx.ui.progressive.renderer.table.cell.Conditional(
        "right", "", "", "");

      r.addNumericCondition(">", 0,   null, "FF0000", null, null);
      r.addNumericCondition(">", 50,  null, "EE0011", null, null);
      r.addNumericCondition(">", 100, null, "DD0022", null, null);
      r.addNumericCondition(">", 150, null, "CC0033", null, null);
      r.addNumericCondition(">", 200, null, "BB0044", null, null);
      r.addNumericCondition(">", 250, null, "AA0055", null, null);
      r.addNumericCondition(">", 300, null, "990066", null, null);
      r.addNumericCondition(">", 350, null, "880077", null, null);
      r.addNumericCondition(">", 400, null, "770088", null, null);
      r.addNumericCondition(">", 450, null, "660099", null, null);
      r.addNumericCondition(">", 500, null, "5500AA", null, null);
      r.addNumericCondition(">", 550, null, "4400BB", null, null);
      r.addNumericCondition(">", 600, null, "3300CC", null, null);
      r.addNumericCondition(">", 650, null, "2200DD", null, null);
      r.addNumericCondition(">", 700, null, "1100EE", null, null);
      r.addNumericCondition(">", 750, null, "0000FF", null, null);
      r.addNumericCondition(">", 800, null, "0033FF", null, null);
      r.addNumericCondition(">", 850, null, "0066FF", null, null);
      r.addNumericCondition(">", 900, null, "0099FF", null, null);
      r.addNumericCondition(">", 950, "center", "00CCFF", null, "bold");

      rowRenderer.addRenderer(2, r);

      this.getRoot().add(progressive, { edge : 50 });

      progressive.render();
    }
  }
});
