/*
 * Example of using the Boolean cell renderer with Progressive's Table.
 */
qx.Class.define("demobrowser.demo.progressive.ProgressiveTable_Boolean",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var nextId = 0;
      var createRandomRows = function(rowCount) {
        var rowData = [];
        var now = new Date().getTime();
        var dateRange = 400 * 24 * 60 * 60 * 1000; // 400 days
        for (var row = 0; row < rowCount; row++) {
          var date = new Date(now + Math.random() * dateRange - dateRange / 2);
          rowData.push(
                       {
                         renderer : "row",
                         location : "end",
                         data     : [
                                     nextId++,
                                     (Math.floor(Math.random() * 2) == 0
                                      ? false
                                      : true)
                                    ]
                       });
        }
        return rowData;
      };

      var columnWidths = new qx.ui.progressive.renderer.table.Widths(2);
      columnWidths.setWidth(0, 100);
      columnWidths.setWidth(1, 100);

      var columnNames = [ "Id", "Boolean" ];

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
      var rowData = createRandomRows(20);
      dataModel.addElements(rowData);

      // Tell Progressive about its data model
      progressive.setDataModel(dataModel);

      // Instantiate a table row renderer
      var rowRenderer =
        new qx.ui.progressive.renderer.table.Row(columnWidths);

      // Give Progressive the renderer, and assign a name
      progressive.addRenderer("row", rowRenderer);

      // Tell the row renderer to use a boolean renderer for column 1
      var boolRenderer = new qx.ui.progressive.renderer.table.cell.Boolean();
      boolRenderer.setAllowToggle(true);
      rowRenderer.addRenderer(1, boolRenderer);

      progressive.set(
        {
          width : 200 + qx.bom.element.Overflow.getScrollbarWidth(),
          maxWidth : 200 + qx.bom.element.Overflow.getScrollbarWidth()
        });
      this.getRoot().add(progressive, { left : 50, top : 50, bottom : 50 });

      progressive.render();
    }
  }
});
