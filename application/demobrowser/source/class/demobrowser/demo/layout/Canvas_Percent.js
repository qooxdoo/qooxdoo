/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.layout.Canvas_Percent",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var border = new qx.ui.decoration.Decorator().set({
        width: 3,
        style: "solid",
        color: "black"
      });

      var w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: border
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

      var w5 = new qx.ui.core.Widget().set({
        backgroundColor: "orange",
        decorator: border
      });

      var w6 = new qx.ui.core.Widget().set({
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
