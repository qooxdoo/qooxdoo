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

qx.Class.define("demobrowser.demo.layout.Canvas_Percent",
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

      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      container.add(w1, {left:"3%", top:"3%", right:"3%", bottom:"3%", width:"20%", height:"20%" });
      container.add(w2, {left:"6%", top:"6%", right:"6%", width:"20%", height:"20%" });
      container.add(w3, {left:"9%", top:"9%", bottom:"9%", width:"20%", height:"20%" });
      container.add(w4, {left:"12%", top:"12%", width:"20%", height:"20%" });
      container.add(w5, {top: "9%", right:"9%", width:"20%", height:"20%" });
      container.add(w6, {right:"9%", bottom:"9%", width:"20%", height:"20%" });

      this.getRoot().add(container, {edge: 0});
    }
  }
});
