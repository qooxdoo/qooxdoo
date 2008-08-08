/*
 * Example of using the Image cell renderer with Progressive''s Table.
 * This also demonstrates how the minimum row height can be set by a
 * cell renderer.
 */
qx.Class.define("demobrowser.demo.progressive.ProgressiveTable_6",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var imageData =
        [
          {
            url     : "icon/16/status/dialog-error.png",
            height  : 20,
            tooltip : "small icon"
          },

          {
            url     : "icon/32/status/dialog-error.png",
            height  : 40,
            tooltip : "TALL ICON"
          },

          "icon/32/status/dialog-error.png"
        ];

      var nextId = 0;
      var createRow = function(imageNum, text)
      {
        var ret =
        {
          renderer : "row",
          location : "end",
          data     : [ text, imageData[imageNum] ]
        };
        return ret;
      };

      var columnWidths = new qx.ui.progressive.renderer.table.Widths(2);
      columnWidths.setWidth(0, 200);
      columnWidths.setWidth(1, "1*");

      var columnNames = [ "Id", "Image" ];

      // Instantiate a Progressive with a default structure with header
      var header = new qx.ui.progressive.headfoot.TableHeading(columnWidths,
                                                               columnNames);
      var footer = new qx.ui.progressive.headfoot.Progress(columnWidths,
                                                           columnNames);
      var structure = new qx.ui.progressive.structure.Default(header,
                                                              footer);
      var progressive = new qx.ui.progressive.Progressive(structure);

      // Add a message
      var message =
        new qx.ui.basic.Atom("Note variable row heights in this table.");
      message.setHeight(16);
      message.setTextColor("red");
      progressive.add(message);

      // Instantiate a data model and populate it.
      var dataModel = new qx.ui.progressive.model.Default();
      var rowData = [ ];

      rowData.push(createRow(0, "I am small."));
      rowData.push(createRow(1, "I am tall."));
      rowData.push(createRow(0, "This, too, is small."));
      rowData.push(createRow(1, "This, too, is tall."));
      rowData.push(createRow(2, "No attributes specified."));

      dataModel.addElements(rowData);

      // Tell Progressive about its data model
      progressive.setDataModel(dataModel);

      // Instantiate a table row renderer
      var rowRenderer =
        new qx.ui.progressive.renderer.table.Row(columnWidths);

      // Give Progressive the renderer, and assign a name
      progressive.addRenderer("row", rowRenderer);

      // Tell the row renderer to use an image renderer for column 1
      var r = new qx.ui.progressive.renderer.table.cell.Image();
      rowRenderer.addRenderer(1, r);

      progressive.set(
        {
          width : 400,
          maxWidth :400
        });
      this.getRoot().add(progressive, { left : 50, top : 50, bottom : 50 });

      progressive.render();
    }
  }
});
