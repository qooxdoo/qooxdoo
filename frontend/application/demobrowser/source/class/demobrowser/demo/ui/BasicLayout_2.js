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

qx.Class.define("demobrowser.demo.ui.BasicLayout_2",
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

      var borderColor = "black";
      var border = new qx.ui.decoration.Basic(3, "solid", borderColor);

      w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: border,
        paddingLeft: 10,
        paddingRight: 10,
        minHeight: 200
      });

      w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: border,
        height: 300
      });

      w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: border,
        padding: 3
      });

      w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: border,
        padding: 10,
        width: 1000
      });

      layout = new qx.ui.layout.Basic();

      layout.add(w1, 10, 10);
      layout.add(w2, 200, 20);
      layout.add(w3, 350, 50);
      layout.add(w4, 50, 200);

      var container = new qx.ui.core.Widget();
      container.setLayout(layout);

      doc.add(container, 0, 0, 0, 0);
    }
  }
});
