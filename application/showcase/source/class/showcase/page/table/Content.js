/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 *
 * @asset(qx/icon/${qx.icontheme}/16/status/dialog-information.png)
 * @asset(qx/icon/${qx.icontheme}/16/categories/internet.png)
 */

qx.Class.define("showcase.page.table.Content",
{
  extend : showcase.page.AbstractDesktopContent,

  construct : function(page) {
    this.base(arguments, page);
  },


  statics :
  {
    saveResult: function(result) {
      this._result = result;
    }
  },


  members :
  {
    _addWindowContent : function(win)
    {
      // Create the initial data
      var rowData = [[0, "loading data...", "", 0, "", ""]];

      // table model
      var tableModel = this._tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns(["", "Ocean", "URI", "language", "WOEID", ""]);
      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(3, true);
      tableModel.setColumnEditable(4, true);
      tableModel.setColumnSortable(3, true);

      var custom =
      {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };

      // table
      var table = new qx.ui.table.Table(tableModel, custom);

      table.set({
        width: 680,
        height: 300,
        decorator : null,
        headerCellHeight : null,
        showCellFocusIndicator: false
      });

      table.getSelectionModel().setSelectionMode(
        qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION
      );

      var tcm = table.getTableColumnModel();
      tcm.setDataCellRenderer(0, new qx.ui.table.cellrenderer.Number());
      tcm.setDataCellRenderer(2, new qx.ui.table.cellrenderer.Html());
      tcm.setDataCellRenderer(4, new qx.ui.table.cellrenderer.Number());
      tcm.setColumnVisible(5, false);


      tcm.setHeaderCellRenderer(1,
        new qx.ui.table.headerrenderer.Icon(
          "icon/16/status/dialog-information.png", "Ocean"
        )
      );

      tcm.setHeaderCellRenderer(2,
        new qx.ui.table.headerrenderer.Icon(
          "icon/16/categories/internet.png", "URI"
        )
      );

      // Obtain the behavior object to manipulate
      var resizeBehavior = tcm.getBehavior();

      // This uses the set() method to set all attriutes at once; uses flex
      resizeBehavior.set(1, {width: "3*", minWidth: 60});
      resizeBehavior.set(2, {width: "1*", minWidth: 60});

      // We could also set them individually:
      resizeBehavior.setWidth(0, 40);
      resizeBehavior.setWidth(1, 130);
      resizeBehavior.setWidth(2, 310);
      resizeBehavior.setWidth(4, 90);

      table.addListener("cellTap", function(e) {
        if (e.getColumn() === 2) {
          table.getSelectionModel().iterateSelection(function(index) {
            var url = tableModel.getRowData(index)[2];
            window.open(url);
          });
        }
      }, this);

      win.setCaption("YQL Geo Places: Oceans");
      win.setLayout(new qx.ui.layout.Grow());
      win.add(table);

      this._loadData(tableModel);
    },


    _loadData : function(tableModel)
    {
      var query = "select * from geo.oceans";
      var url = "http://query.yahooapis.com/v1/public/yql?q=" +
      encodeURIComponent(query) +
      "&format=json&diagnostics=false&" +
      "env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=" +
      "showcase.page.table.Content.saveResult";

      var loader = new qx.bom.request.Script();

      loader.on("load", function() {
        var result = showcase.page.table.Content._result;
        var rows = [];
        var rawData;
        if (result.query && result.query.results && result.query.results.place &&
            result.query.results.place.length > 0) {
          rawData = result.query.results.place;
        } else {
          rawData = [];
          rows.push([0, "Failed to load the data", "---", 0, false]);
        }

        for (var i = 0; i < rawData.length; i++) {
          var row = [];
          row.push(i+1);
          row.push(rawData[i].name);
          row.push(rawData[i].uri);
          row.push(rawData[i].lang);
          row.push(rawData[i].woeid);
          rows.push(row);
        }
        tableModel.setData(rows);
      });
      loader.open("GET", url);
      loader.send();
    }
  }
});
