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
    }
  }
});
