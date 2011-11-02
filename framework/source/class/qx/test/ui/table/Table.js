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

************************************************************************ */
qx.Class.define("qx.test.ui.table.Table",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    createModel : function()
    {
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "String", "A date", "Boolean" ]);
      tableModel.setData(this.createRandomRows(5));

      return tableModel;
    },


    createRandomRows : function(rowCount)
    {
      var rowData = [];
      var nextId = 0;
      var strings = ["a", "b", "c", "d"]
      for (var row = 0; row < rowCount; row++) {
        var date = new Date(row * row * row);
        var number = row % 2 == 0 ? row / 2 : NaN;
        rowData.push([ nextId++, number, strings[row % 4], date, (row % 2 == 1) ]);
      }
      return rowData;
    },


    testSortInteger : function()
    {
      // table
      var model = this.createModel()
      var table = new qx.ui.table.Table(model);

      // sort descending
      model.sortByColumn(0);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][0] >= data[i+1][0]);
      };

      // sort ascending
      model.sortByColumn(0, true);
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][0] <= data[i+1][0]);
      };

      table.destroy();
      model.dispose();
    },


    testSortIntegerNaN : function()
    {
      // table
      var model = this.createModel()
      var table = new qx.ui.table.Table(model);

      // sort descending
      model.sortByColumn(1);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        if (isNaN(data[i][1])) {
          // both should be NaN
          this.assertTrue(isNaN(data[i+1][1]));
        } else if (isNaN(data[i+1][1])) {
          // should be a number
          this.assertFalse(isNaN(data[i][1]));
        } else {
          this.assertTrue(data[i][1] >= data[i+1][1]);
        }
      };

      // sort ascending
      model.sortByColumn(1, true);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        if (isNaN(data[i][1])) {
          // both should be NaN
          this.assertTrue(isNaN(data[i+1][1]));
        } else if (isNaN(data[i+1][1])) {
          // should be a number
          this.assertFalse(isNaN(data[i][1]));
        } else {
          this.assertTrue(data[i][1] <= data[i+1][1]);
        }
      };

      table.destroy();
      model.dispose();
    },


    testSortIntegerNaNInsensitive : function()
    {
      // table
      var model = this.createModel()
      var table = new qx.ui.table.Table(model);
      model.setCaseSensitiveSorting(false);

      // sort descending
      model.sortByColumn(1);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        if (isNaN(data[i][1])) {
          // both should be NaN
          this.assertTrue(isNaN(data[i+1][1]));
        } else if (isNaN(data[i+1][1])) {
          // should be a number
          this.assertFalse(isNaN(data[i][1]));
        } else {
          this.assertTrue(data[i][1] >= data[i+1][1]);
        }
      };

      // sort ascending
      model.sortByColumn(1, true);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        if (isNaN(data[i][1])) {
          // both should be NaN
          this.assertTrue(isNaN(data[i+1][1]));
        } else if (isNaN(data[i+1][1])) {
          // should be a number
          this.assertFalse(isNaN(data[i][1]));
        } else {
          this.assertTrue(data[i][1] <= data[i+1][1]);
        }
      };

      table.destroy();
      model.dispose();
    },


    testSortStringInsensitive : function()
    {
      // table
      var model = this.createModel()
      var table = new qx.ui.table.Table(model);
      model.setCaseSensitiveSorting(false);

      // sort descending
      model.sortByColumn(2);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][2] >= data[i+1][2]);
      };

      // sort ascending
      model.sortByColumn(2, true);
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][2] <= data[i+1][2]);
      };

      table.destroy();
      model.dispose();
    },


    testSortString : function()
    {
      // table
      var model = this.createModel()
      var table = new qx.ui.table.Table(model);

      // sort descending
      model.sortByColumn(2);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][2] >= data[i+1][2]);
      };

      // sort ascending
      model.sortByColumn(2, true);
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][2] <= data[i+1][2]);
      };

      table.destroy();
      model.dispose();
    },


    testRegularListener : function() {
      var table = new qx.ui.table.Table();

      var executed = false;
      var id = table.addListener("changeRowHeight", function() {executed = true;}, this);
      this.assertNotNull(id);

      table.removeListenerById(id);

      // invoke event
      table.setRowHeight(111);
      this.assertFalse(executed);

      table.dispose();
    },


    testSpecialListener : function() {
      var table = new qx.ui.table.Table();
      // use a meta column to see if both events are handled properly
      table.setMetaColumnCounts([1, -1]);

      var executed = false;
      var id = table.addListener("cellClick", function() {executed = true;}, this);
      this.assertNotNull(id);

      table.removeListenerById(id);

      // invoke synthetic cellClick event
      var scroller = table._getPaneScrollerArr()[0];
      var mouse = new qx.event.type.Mouse();
      mouse.init({}, scroller, scroller, false, true);
      scroller.fireEvent("cellClick", qx.ui.table.pane.CellEvent, [scroller, mouse, 0, 0], true);
      this.assertFalse(executed, "Listener not removed");

      mouse.dispose();
      table.dispose();
    },


    testScrollAfterScrollbarVisibilityChange : function()
    {
      var rowData = [];
      for (var row = 0; row < 15; row++) {
        rowData.push([ row ]);
      }

      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns(["ID"]);
      tableModel.setData(rowData);
      var table = new qx.ui.table.Table(tableModel).set({width: 200, height: 200});
      this.getRoot().add(table);

      qx.ui.core.queue.Manager.flush();

      // scroll to the end
      table.getPaneScroller(0).setScrollY(100);
      // resize the first column to show a vertical scrollbar
      table.getTableColumnModel().setColumnWidth(0, 300);
      // resize back
      table.getTableColumnModel().setColumnWidth(0, 100);
      // check that the table is not scrolled back to the top
      this.assertEquals(100, table.getPaneScroller(0).getScrollY());
    },


    testFocusAfterRemove : function()
    {
      var tableModelSimple = new qx.ui.table.model.Simple();
      tableModelSimple.setColumns([ "Location", "Team" ]);
      var tableSimple = new qx.ui.table.Table(tableModelSimple);

      var data = [ [1, 'team1'],
                   [2, 'team2'],
                   [3, 'team3']];

      tableModelSimple.setData(data);

      // select and focus row 2
      tableSimple.getSelectionModel().addSelectionInterval(1,1);
      tableSimple.setFocusedCell(1,1);

      // remove this row
      tableModelSimple.removeRows(1,1);

      // check if the selection and the focus is gone
      this.assertEquals(null, tableSimple.getFocusedRow()); // dont use assertNull because it can be undefined
      this.assertEquals(0, tableSimple.getSelectionModel().getSelectedCount());

      tableSimple.dispose();
      tableModelSimple.dispose();
    }
  }
});
