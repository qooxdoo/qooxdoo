/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/mimetypes/media-audio.png)
#asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)
#asset(qx/icon/${qx.icontheme}/16/status/dialog-warning.png)

************************************************************************ */

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
      var rowData = [[0, "loading ...", "loading ...", 0, false]];

      // table model
      var tableModel = this._tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "Chart Pos.", "Title", "Artist", "Year", "Explicit" ]);
      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);
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
        width: 540,
        height: 400,
        decorator : null,
        headerCellHeight : null,
        showCellFocusIndicator: false
      });

      table.getSelectionModel().setSelectionMode(
        qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION
      );

      var tcm = table.getTableColumnModel();
      tcm.setDataCellRenderer(0, new qx.ui.table.cellrenderer.Number());
      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Number());
      tcm.setDataCellRenderer(4, new qx.ui.table.cellrenderer.Boolean());

      tcm.setHeaderCellRenderer(1,
        new qx.ui.table.headerrenderer.Icon(
          "icon/16/mimetypes/media-audio.png", "Title"
        )
      );
      tcm.setHeaderCellRenderer(3,
        new qx.ui.table.headerrenderer.Icon(
          "icon/16/apps/office-calendar.png", "Year"
        )
      );
      tcm.setHeaderCellRenderer(4,
        new qx.ui.table.headerrenderer.Icon(
          "icon/16/status/dialog-warning.png", "Explicit"
        )
      );


      // Obtain the behavior object to manipulate
      var resizeBehavior = tcm.getBehavior();

      // This uses the set() method to set all attriutes at once; uses flex
      resizeBehavior.set(1, {width: "2*", minWidth: 60});
      resizeBehavior.set(2, {width: "1*", minWidth: 60});

      // We could also set them individually:
      resizeBehavior.setWidth(0, 80);
      resizeBehavior.setWidth(3, 70);
      resizeBehavior.setWidth(4, 85);

      win.setCaption("Popular Music Tracks");
      win.setLayout(new qx.ui.layout.Grow());
      win.add(table);

      this._loadData(tableModel);
    },


    _loadData : function(tableModel)
    {
      var query = "select * from music.track.popular";
      var url = "http://query.yahooapis.com/v1/public/yql?q=" +
      encodeURIComponent(query) +
      "&format=json&diagnostics=false&" +
      "env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=" +
      "showcase.page.table.Content.saveResult";

      var loader = new qx.bom.request.Script();

      loader.on("load", function() {
        var result = showcase.page.table.Content._result.query.results;

        var rows = [];
        if (result == null) {
          var rawData = [];
          rows.push([0, "Failed to load the data", "---", 0, false]);
        } else {
          var rawData = result.Track;
        }

        for (var i = 0; i < rawData.length; i++) {
          var row = [];
          row.push(parseInt(rawData[i].ItemInfo.ChartPosition["this"]));
          row.push(rawData[i].title || "");
          if (rawData[i].Artist instanceof Array) {
            var artists = "";
            for (var j = 0; j < rawData[i].Artist.length; j++) {
              if (j != 0) {
                 artists += ", ";
              }
              artists += rawData[i].Artist[j].name;
            };
            row.push(artists);
          } else {
            if (rawData[i].Artist) {
              row.push(rawData[i].Artist.name || "");
            } else {
              row.push("---");
            }

          }
          row.push(parseInt(rawData[i].releaseYear));
          row.push(rawData[i].explicit !== "0");
          rows.push(row);
        };
        tableModel.setData(rows);
      });
      loader.open("GET", url);
      loader.send();
    }
  }
});