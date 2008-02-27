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

qx.Class.define("demobrowser.demo.layout.PageRoot_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var doc = new qx.ui.root.Page(document);

      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      // doc.getElement().setStyle("font", "11px Tahoma, sans-serif");
      doc.setTextColor("black");

      var box = new qx.ui.core.Widget();
      var layout = new qx.ui.layout.HBox();
      box.setLayout(layout);

      var w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: border,
        padding: 10
      });

      var w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: border
      });

      var w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: border
      });

      var w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: border
      });

      layout.add(w1);
      layout.add(w2);
      layout.add(w3);
      layout.add(w4);

      doc.add(box, 30, 120);
    }
  }
});
