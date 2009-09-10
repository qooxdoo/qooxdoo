/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

qx.Class.define("demobrowser.demo.progressive.ProgressiveTable",
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
                         location : row == rowCount - 1 ? "start" : "end",
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
      columnWidths.setMaxWidth(1, 200);
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
      var message = new qx.ui.basic.Atom("<span style='color:red;'>" +
                                         "Last item is intentionally " +
                                         "inserted at the top to show how " +
                                         "it's done" +
                                         "</span>");
      message.setRich(true);
      message.setHeight(16);
      progressive.add(message);

      // Instantiate a data model and populate it.
      var dataModel = new qx.ui.progressive.model.Default();
      var rowData = createRandomRows(500);
      dataModel.addElements(rowData);

      // Tell Progressive about its data model
      progressive.setDataModel(dataModel);

      // Instantiate a table row renderer
      var renderer =
        new qx.ui.progressive.renderer.table.Row(columnWidths);

      // Give Progressive the renderer, and assign a name
      progressive.addRenderer("row", renderer);

      progressive.set(
        {
          width : 500,
          maxWidth : 500
        });
      this.getRoot().add(progressive, { left : 50, top : 50, bottom : 50 });

      progressive.render();
    }
  }
});
