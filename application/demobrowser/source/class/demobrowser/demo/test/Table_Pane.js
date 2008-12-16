/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/apps/internet-feed-reader.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.test.Table_Pane",
{
  extend : qx.application.Standalone,
  include : [demobrowser.demo.table.MUtil, qx.core.MAssert],

  members :
  {
    main: function()
    {
      this.base(arguments);

      var table = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({
        decorator : "main",
        backgroundColor : "#FFE",
        width: 600,
        height: 400
      });
      this.getRoot().add(table, {left: 10, top: 10});

      var pane = new qx.ui.table.pane.Pane(this.getScrollerMock()).set({
        firstVisibleRow: 0,
        visibleRowCount: 20
      });
      table.add(pane);

      var row = 0;

      table.addListener("keypress", function(e)
      {
        switch(e.getKeyIdentifier())
        {
          case "Up":
            row -= 1;
            break;

          case "Down":
            row += 1;
            break;

          default:
            return;
        }
        row = Math.min(Math.max(0, row), 499);
        pane.setFirstVisibleRow(row);
      });
    }
  }
});
