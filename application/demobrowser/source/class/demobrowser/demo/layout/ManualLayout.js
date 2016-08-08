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

qx.Class.define("demobrowser.demo.layout.ManualLayout",
{
  extend : qx.application.Standalone,

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
        paddingLeft: 10,
        paddingRight: 10
      });
      w1.setUserBounds(10, 10, 100, 30);

      var w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: border
      });
      w2.setUserBounds(200, 20, 150, 100);

      var w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: border,
        padding: 3
      });
      w3.setUserBounds(380, 50, 150, 100);

      var w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: border,
        padding: 10
      });
      w4.setUserBounds(50, 200, 150, 100);

      var container = new qx.ui.container.Composite();

      container.add(w1);
      container.add(w2);
      container.add(w3);
      container.add(w4);

      this.getRoot().add(container, {edge:0});
    }
  }
});
