/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
      return table;
    },

    testBetween : function()
    {
      var table = this.createTable();
      var model = table.getTableModel();

      model.addBetweenFilter("!between", 4, 6, "a");
      model.applyFilters();

      this.assertIdentical(3, model.getRowCount());

      var data = model.getDataAsMapArray();
      var listA = [];

      data.forEach(function(obj) {
        listA.push(obj.a);
      });

      this.assertNotInArray(3, listA);
      this.assertInArray(4, listA);
      this.assertInArray(5, listA);
      this.assertInArray(6, listA);
      this.assertNotInArray(7, listA);

      table.destroy();
    },

    testNotBetween : function()
    {
      var table = this.createTable();
      var model = table.getTableModel();

      model.addBetweenFilter("between", 2, 8, "a");
      model.applyFilters();

      var data = table.getTableModel().getDataAsMapArray();
      var listA = [];

      data.forEach(function(obj) {
        listA.push(obj.a);
      });

      this.assertNotInArray(3, listA);
      this.assertNotInArray(7, listA);
      this.assertInArray(1, listA);
      this.assertInArray(9, listA);

      table.destroy();
    },

    testNumericFilter : function()
    {
      var table = this.createTable();
      var model = table.getTableModel();

      model.addNumericFilter("==", 8, "a");
      model.applyFilters();

      this.assertIdentical(9, model.getRowCount());

      model.resetHiddenRows();

      model.addNumericFilter("<", 4, "a");
      model.applyFilters();

      this.assertIdentical(7, model.getRowCount());

      model.resetHiddenRows();

      model.addNumericFilter(">=", 9, "a");
      model.applyFilters();

      this.assertIdentical(8, model.getRowCount());

      model.resetHiddenRows();

      model.addNumericFilter("!=", 1, "a");
      model.applyFilters();

      this.assertIdentical(1, model.getRowCount());

      table.destroy();
    }
  }
});
