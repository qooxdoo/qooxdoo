/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.table.Dispose",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testSimple : function()
    {
      this.assertDestroy(function()
      {
        // table model
        var tableModel = new qx.ui.table.model.Simple();
        tableModel.setColumns([ "ID", "A number", "A date", "Boolean" ]);
        tableModel.setData([[]]);

        // table
        var table = new qx.ui.table.Table(tableModel);

        this.getRoot().add(table);
        qx.ui.core.queue.Manager.flush();

        table.destroy();
        tableModel.dispose();
      }, this, "Dispose simple table");
    }

  }
});
