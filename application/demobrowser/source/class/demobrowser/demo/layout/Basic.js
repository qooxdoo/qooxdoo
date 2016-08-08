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
qx.Class.define("demobrowser.demo.layout.Basic",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var borderColor = "black";
      var border = new qx.ui.decoration.Decorator().set({
        width: 3,
        style: "solid",
        color: borderColor
      });

      var w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: border,
        marginLeft : 10,
        minHeight: 200
      });

      var w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: border
      });

      var w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: border,
        padding: 3,
        height: 300
      });

      var w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: border,
        padding: 10,
        width: 400
      });


      var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());

      container.add(w1, {left: 10, top: 10});
      container.add(w2, {left: 200, top: 20});
      container.add(w3, {left: 350, top: 50});
      container.add(w4, {left: 50, top: 200});

      this.getRoot().add(container, {edge: 0});
    }
  }
});
