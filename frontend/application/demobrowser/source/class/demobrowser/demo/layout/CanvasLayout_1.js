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
  extend : qx.application.Standalone,

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

      var container = new qx.ui.core.Composite(new qx.ui.layout.Canvas()).set({
        padding: 10
      });

      container.add(w1, {left:10, top:10, right:10, bottom:10});
      container.add(w2, {left:30, top:30, right:30});
      container.add(w3, {left:50, top:50, bottom:50});
      container.add(w4, {left:70, top:70});
      container.add(w5, {top:50, right:50});
      container.add(w6, {right:50, bottom:50});

      this.getRoot().addMain(container);
    }
  }
});
