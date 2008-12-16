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

qx.Class.define("demobrowser.demo.ui.Cursor",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var box = new qx.ui.layout.HBox();
      box.setSpacing(10);

      var container = new qx.ui.container.Composite(box);
      container.setPadding(20);

      this.getRoot().add(container, {left:0,top:0});

      container.add(this.getGrid1());
    },


    getGrid1 : function()
    {
      var container = new qx.ui.container.Composite().set({
        textColor: "#DDD"
      });

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(20);
      container.setLayout(layout);

      var cursors = [
        "default",
        "crosshair",
        "pointer",
        "move",
        "n-resize",
        "ne-resize",
        "e-resize",
        "se-resize",
        "s-resize",
        "sw-resize",
        "w-resize",
        "nw-resize",
        "text",
        "wait",
        "help "
      ];

      var i=0;
      for (var i=0; i<15; i++)
      {
        container.add(new qx.ui.basic.Label(cursors[i]).set({
          decorator: "main",
          backgroundColor: "#555",
          cursor: cursors[i],
          padding: 5,
          height: 100,
          width: 100
        }), {row: Math.floor(i/5), column: i%5});
      }

      return container;
    }
  }
});
