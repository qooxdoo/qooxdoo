/*
 * Example of Progressive rendering of a table with fancy handling of
 * mouseover.  Try moving the mouse over the date column.  The
 * DateCellRenderer class which does the fancy handling is defined in the
 * source file of this example.  Note that row height need not be constant!
 */
qx.Class.define("demobrowser.demo.progressive.ProgressiveTable_Mouseover",
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
                                     Math.random() * 10000,
                                     date
                                    ]
                       });
        }
        return rowData;
      };

      var columnWidths = new qx.ui.progressive.renderer.table.Widths(3);
      columnWidths.setWidth(0, 100);
      columnWidths.setWidth(1, "1*");
      columnWidths.setWidth(2, 300);

      var columnNames = [ "Id", "Number", "Date" ];

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
        new qx.ui.basic.Atom("Move your mouse over the Date field");
      message.setTextColor("red");
      message.setHeight(16);
      message.setRich(true);
      progressive.add(message);

      // Instantiate a data model and populate it.
      var dataModel = new qx.ui.progressive.model.Default();
      var rowData = createRandomRows(500);
      dataModel.addElements(rowData);

      // Tell Progressive about its data model
      progressive.setDataModel(dataModel);

      // Instantiate a table row renderer
      var rowRenderer =
        new qx.ui.progressive.renderer.table.Row(columnWidths);

      // Give Progressive the renderer, and assign a name
      progressive.addRenderer("row", rowRenderer);

      // Tell the row renderer to use our custom date cell renderer
      rowRenderer.addRenderer(2, new DateCellRenderer());

      this.getRoot().add(progressive, { edge : 50 });

      progressive.render();
    }
  }
});

qx.Class.define("DateCellRenderer",
{
  extend     : qx.ui.progressive.renderer.table.cell.Default,

  statics :
  {
    onmouseover : function(cellDiv)
    {
      // Save the original text color
      cellDiv.__oldcolor = qx.bom.element.Style.get(cellDiv, "color");

      // Set the color temporarily to red
      cellDiv.style.color = "rgb(255, 0, 0)";

      // Resize the row to hold our expanded date
      cellDiv.parentNode.style.height = 32;

      // Save the original text
      cellDiv.__innerHTML = cellDiv.innerHTML;

      // Generate an expanded date representation
      var ms =
        Date.parse(cellDiv.attributes.getNamedItem("celldata").nodeValue);
      var date = new Date(ms);
      cellDiv.innerHTML = date.toUTCString() + "<br>" + date.toString();
    },

    onmouseout : function(cellDiv)
    {
      // Restore the original color
      cellDiv.style.color = cellDiv.__oldcolor;

      // Restore the original row height
      cellDiv.parentNode.style.height = 16;

      // Restore the original cell data
      cellDiv.innerHTML = cellDiv.__innerHTML;
    }
  },


  members :
  {
    _getCellExtras : function(cellInfo)
    {
      var html = [ ];

      // Add superclass extras
      html.push(this.base(arguments));

      // Save the cell data for reformatting upon mouseover
      html.push("celldata='" + cellInfo.cellData.toUTCString() + "' ");

      // Create some event handlers
      html.push("onmouseover='DateCellRenderer.onmouseover(this);' ",
                "onmouseout='DateCellRenderer.onmouseout(this);' ");

      return html.join("");
    }
  }
});
