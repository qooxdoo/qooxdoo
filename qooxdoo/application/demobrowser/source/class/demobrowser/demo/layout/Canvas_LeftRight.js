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

qx.Class.define("demobrowser.demo.layout.Canvas_LeftRight",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var border = new qx.ui.decoration.Single(3, "solid", "black");

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


      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({
        decorator: border
      });

      this.getRoot().setPadding(20);

      container.add(w1, {left:10, top:10});
      container.add(w2, {left:10, top:80});
      container.add(w3, {top:150, right:10});
      container.add(w4, {top:220, right:10});

      this.getRoot().add(container, {edge: 0});
    }
  }
});
