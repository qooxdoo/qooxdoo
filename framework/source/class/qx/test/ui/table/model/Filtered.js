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
     * William Oprandi (woprandi)

************************************************************************ */
qx.Class.define("qx.test.ui.table.model.Filtered",
{
  extend : qx.dev.unit.TestCase,
  members :
  {
    createTable : function()
    {
      var table = new qx.ui.table.Table(new qx.ui.table.model.Filtered());
      var data = [ {
        a : 1
      }, {
        a : 2
      }, {
        a : 3
      }, {
        a : 4
      }, {
        a : 5
      }, {
        a : 6
      }, {
        a : 7
      }, {
        a : 8
      }, {
        a : 9
      }, {
        a : 10
      }];
      table.getTableModel().setColumns(["a"]);
      table.getTableModel().setDataAsMapArray(data);
      table.getTableModel().addBetweenFilter("!between", 4, 6, "a");
      table.getTableModel().applyFilters();
      return table;
    },
    testSimple : function()
    {
      var table = this.createTable();
      this.assertIdentical(3, table.getTableModel().getRowCount(), "Only 3 rows are not filtered");
    },
    testInArray : function()
    {
      var table = this.createTable();
      var data = table.getTableModel().getDataAsMapArray();
      var listA = [];
      for (var i = 0; i < data.length; ++i) {
        listA.push(data[i]['a']);
      }
      this.assertInArray(4, listA, "Must be in array");
      this.assertInArray(5, listA, "Must be in array");
      this.assertInArray(6, listA, "Must be in array");
    },
    testNotInArray : function()
    {
      var table = this.createTable();
      var data = table.getTableModel().getDataAsMapArray();
      var listA = [];
      for (var i = 0; i < data.length; ++i) {
        listA.push(data[i]['a']);
      }

      // assertNotInArray function could be useful in qx.dev.unit.TestCase class
      this.assert(listA.indexOf(3) == -1, "Must not be in array");
      this.assert(listA.indexOf(7) == -1, "Must not be in array");
    }
  }
});
