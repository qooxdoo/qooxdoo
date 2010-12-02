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

      // check the intial data
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
    }
  }
});