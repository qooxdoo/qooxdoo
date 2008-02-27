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

qx.Class.define("demobrowser.demo.layout.CanvasLayout_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);


      doc = new qx.ui.root.Application(document);

      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var border = new qx.ui.decoration.Basic(3, "solid", "black");

      w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: border
      });

      w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: border
      });

      w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: border
      });

      w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: border
      });

      w5 = new qx.ui.core.Widget().set({
        backgroundColor: "orange",
        decorator: border
      });

      w6 = new qx.ui.core.Widget().set({
        backgroundColor: "teal",
        decorator: border
      });

      layout = new qx.ui.layout.Canvas();

      layout.add(w1, 10, 10, 10, 10);
      layout.add(w2, 30, 30, 30);
      layout.add(w3, 50, 50, null, 50);
      layout.add(w4, 70, 70);
      layout.add(w5, null, 50, 50);
      layout.add(w6, null, null, 50, 50);

      var container = new qx.ui.core.Widget().set({
        backgroundColor: "gray",
        padding: 10
      });
      container.setLayout(layout);

      doc.add(container, 0, 0, 0, 0);
    }
  }
});
