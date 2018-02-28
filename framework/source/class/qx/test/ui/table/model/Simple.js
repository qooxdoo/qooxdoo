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

************************************************************************ */
qx.Class.define("qx.test.ui.table.model.Simple",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testGetRowDataAsMap : function() {
      var tableDataWithMeta = [{
          "id" : 100,
          "col1" : 'test',
          "col2" : 'test2'
      }];

      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns(["Col1", "Col2"], ["col1", "col2"]);
      tableModel.setDataAsMapArray(tableDataWithMeta, true);

      // check the initial data
      var data = tableModel.getRowDataAsMap(0);
      this.assertEquals(100, data.id);
      this.assertEquals("test", data.col1);
      this.assertEquals("test2", data.col2);

      // change the data
      tableModel.setValue(0, 0, "affe");

      data = tableModel.getRowDataAsMap(0);
      // check the changed data
      this.assertEquals(100, data.id);
      this.assertEquals("affe", data.col1);
      this.assertEquals("test2", data.col2);

      tableModel.dispose();
    },
    
    getStringValues : function() {
      return ["aaaa", "bbbb", "cccc", "dddd", "eeee", "ffff"];
    },
    
    createRandomRows : function(rowCount)
    {
      var rowData = [];
      var strings = this.getStringValues();
      for (var row = 0; row < rowCount; row++) {
        rowData.push([ row+1, strings[row % strings.length] ]);
      }
      return rowData;
    },
    
    testCustomSortFunction : function()
    {
      var stringValues = this.getStringValues();
      var rowCount = 20;
      
      // table
      var model = new qx.ui.table.model.Simple();
      model.setColumns([ "ID", "String" ]);
      model.setData(this.createRandomRows(rowCount));

      // custom individual ascending descending integer sort function for column 0
      model.setSortMethods(0, {
        ascending : function(row1, row2, columnIndex) {
          var int1 = row1[columnIndex];
          var int2 = row2[columnIndex];
          return (int1 > int2) ? 1 : ((int1 == int2) ? 0 : -1);
        },
        descending : function(row2, row1, columnIndex) {
          var int1 = row1[columnIndex];
          var int2 = row2[columnIndex];
          return (int1 > int2) ? 1 : ((int1 == int2) ? 0 : -1);
        } 
      });
      
      // custom single string sort function for column 1
      model.setSortMethods(1, function(row1, row2, columnIndex) {
        var string1 = row1[columnIndex];
        var string2 = row2[columnIndex];
        return string1.localeCompare(string2);
      });
      
      var table = new qx.ui.table.Table(model);

      // test sorting column 1
      
      // sort descending
      model.sortByColumn(1);
      var data = model.getData();
      this.assertTrue(data[0][1] == stringValues[stringValues.length-1]);
      this.assertTrue(data[data.length-1][1] == stringValues[0]);

      // sort ascending
      model.sortByColumn(1, true);
      this.assertTrue(data[0][1] == stringValues[0]);
      this.assertTrue(data[data.length-1][1] == stringValues[stringValues.length-1]);

      
      // test sorting column 0
      
      // sort descending
      model.sortByColumn(0);
      this.assertTrue(data[0][0] == rowCount);
      this.assertTrue(data[data.length-1][0] == 1);

      // sort ascending
      model.sortByColumn(0, true);
      this.assertTrue(data[0][0] == 1);
      this.assertTrue(data[data.length-1][0] == rowCount);
      
      table.destroy();
      model.dispose();
    },
    
    testCustomSortFunctionArgumentsCalleeColumnIndexDeprecated : function()
    {
      var stringValues = this.getStringValues();
      var rowCount = 20;
      
      // table
      var model = new qx.ui.table.model.Simple();
      model.setColumns([ "ID", "String" ]);
      model.setData(this.createRandomRows(rowCount));

      // custom individual ascending descending integer sort function for column 0
      model.setSortMethods(0, {
        ascending : function(row1, row2) {
          var columnIndex = arguments.callee.columnIndex;
          var int1 = row1[columnIndex];
          var int2 = row2[columnIndex];
          return (int1 > int2) ? 1 : ((int1 == int2) ? 0 : -1);
        },
        descending : function(row2, row1) {
          var columnIndex = arguments.callee.columnIndex;
          var int1 = row1[columnIndex];
          var int2 = row2[columnIndex];
          return (int1 > int2) ? 1 : ((int1 == int2) ? 0 : -1);
        } 
      });
      
      // custom single string sort function for column 1
      model.setSortMethods(1, function(row1, row2) {
        var columnIndex = arguments.callee.columnIndex;
        var string1 = row1[columnIndex];
        var string2 = row2[columnIndex];
        return string1.localeCompare(string2);
      });
      
      var table = new qx.ui.table.Table(model);

      // test sorting column 1
      
      // sort descending
      model.sortByColumn(1);
      var data = model.getData();
      this.assertTrue(data[0][1] == stringValues[stringValues.length-1]);
      this.assertTrue(data[data.length-1][1] == stringValues[0]);

      // sort ascending
      model.sortByColumn(1, true);
      this.assertTrue(data[0][1] == stringValues[0]);
      this.assertTrue(data[data.length-1][1] == stringValues[stringValues.length-1]);

      
      // test sorting column 0
      
      // sort descending
      model.sortByColumn(0);
      this.assertTrue(data[0][0] == rowCount);
      this.assertTrue(data[data.length-1][0] == 1);

      // sort ascending
      model.sortByColumn(0, true);
      this.assertTrue(data[0][0] == 1);
      this.assertTrue(data[data.length-1][0] == rowCount);
      
      table.destroy();
      model.dispose();
    }

  }
});
