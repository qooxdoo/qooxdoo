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

/**
 * An implementation of a dialog layout using a grid.
 */
qx.Class.define("demobrowser.demo.layout.Dialog_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.getRoot().setPadding(20);

      var dialog = new qx.ui.container.Composite().set({
         backgroundColor: "yellow",
         decorator: "black",
         padding: 10
      });
      this.getRoot().add(dialog);

      var layout = new qx.ui.layout.Grid();
      layout.setColumnFlex(0, 1);
      layout.setRowFlex(0, 1);
      layout.setSpacing(10);
      dialog.setLayout(layout);

      var pane = new qx.ui.basic.Label("Click here to resize ...").set({
        backgroundColor : "green",
        width: 600,
        height: 300,
        decorator: "black",
        padding: 10
      });

      dialog.add(pane, {row: 0, column: 0, colSpan: 3});

      var ok = new qx.ui.basic.Label("OK").set({
        backgroundColor : "green",
        decorator: "black",
        padding: [2, 5]
      });
      dialog.add(ok, {row: 1, column: 1});

      var cancel = new qx.ui.basic.Label("Cancel").set({
        backgroundColor : "green",
        decorator: "black",
        padding: [2, 5]
      });
      dialog.add(cancel, {row: 1, column: 2});

      var grow = false;
      pane.addListener("click", function(e)
      {
        if (grow) {
          pane.set({
            width: 600,
            height: 300
          });
        }
        else
        {
          pane.set({
            width: 300,
            height: 200
          });
        }
        grow = !grow;
      });
    }
  }
});
