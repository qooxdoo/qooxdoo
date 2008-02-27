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

qx.Class.define("demobrowser.demo.layout.CanvasLayout_4",
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
        decorator: border,
        width: 400
      });

      w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: border,
        minWidth: 400
      });

      w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: border,
        width: 400
      });

      w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: border,
        minWidth: 400
      });


      layout = new qx.ui.layout.Canvas();

      layout.add(w1, 10, 10);
      layout.add(w2, 10, 80);
      layout.add(w3, null, 150, 10);
      layout.add(w4, null, 220, 10);

      var container = new qx.ui.core.Widget().set({
        layout: layout,
        decorator: border
      });

      doc.add(container, 20, 20);
    }
  }
});
