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

qx.Class.define("demobrowser.demo.test.Table_FocusIndicator",
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

      var fi = new qx.ui.table.pane.FocusIndicator(this.getScrollerMock()).set({
        decorator : "main"
      })
      table.add(fi);


      var row = 6;
      var col = 2;
      fi.moveToCell(col, row);

      table.addListener("keypress", function(e)
      {
        switch(e.getKeyIdentifier())
        {
          case "Left":
            col -= 1;
            break;

          case "Right":
            col += 1;
            break;

          case "Up":
            row -= 1;
            break;

          case "Down":
            row += 1;
            break;

          default:
            return;
        }
        col = Math.min(Math.max(0, col), 5);
        row = Math.min(Math.max(0, row), 19);
        fi.moveToCell(col, row);
      });
    }
  }
});
