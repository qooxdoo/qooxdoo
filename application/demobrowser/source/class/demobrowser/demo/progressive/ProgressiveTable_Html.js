/*
 * Example of using the HTML cell renderer with Progressive''s Table.
 */
qx.Class.define("demobrowser.demo.progressive.ProgressiveTable_Html",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var nextId = 0;
      var createRow = function(html, height)
      {
        var ret =
        {
          renderer : "row",
          location : "end",
          data     : [ html, html ]
        };
        return ret;
      };

      var columnWidths = new qx.ui.progressive.renderer.table.Widths(2);
      columnWidths.setWidth(0, "2*");
      columnWidths.setWidth(1, "1*");

      var columnNames = [ "Literal", "Html" ];

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
      var rowData = [ ];

      var html =
        "<div style='background-color: cyan; text-align: center;'>" +
        "  Hello world!" +
        "</div>";
      rowData.push(createRow(html));

      var html =
        "<div style='background-color: cyan; text-align: center;'>" +
        "  Hi there." +
        "  <span style='color: red;'>" +
        "    &nbsp;&nbsp;&nbsp;" +
        "    I'm red!" +
        "  </span>" +
        "</div>";
      rowData.push(createRow(html));

      dataModel.addElements(rowData);

      // Tell Progressive about its data model
      progressive.setDataModel(dataModel);

      // Instantiate a table row renderer
      var rowRenderer =
        new qx.ui.progressive.renderer.table.Row(columnWidths);

      // Give Progressive the renderer, and assign a name
      progressive.addRenderer("row", rowRenderer);

      // Tell the row renderer to use a String renderer for column 0
      var r = new qx.ui.progressive.renderer.table.cell.String();
      rowRenderer.addRenderer(0, r);

      // Tell the row renderer to use an HTML renderer for column 1
      var r = new qx.ui.progressive.renderer.table.cell.Html();
      rowRenderer.addRenderer(1, r);

      this.getRoot().add(progressive, { edge : 50 });

      progressive.render();
    }
  }
});
