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

qx.Class.define("demobrowser.demo.layout.ToolbarEmu_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      // toolbar like with one "button" which does not stretch
      var layout = new qx.ui.layout.HBox();

      var box1 = (new qx.ui.core.Widget).set({
        decorator: "black",
        backgroundColor: "yellow",
        width: 600,
        height : 50,
        layout: layout
      });


      var w1 = (new qx.ui.core.Widget).set({
        decorator: "black",
        backgroundColor: "green",
        height : 20
      });
      layout.add(w1);

      var w2 = (new qx.ui.core.Widget).set({
        decorator: "black",
        backgroundColor: "green",
        height : 40
      });
      layout.add(w2);

      var w3 = (new qx.ui.core.Widget).set({
        decorator: "black",
        backgroundColor: "green",
        height : 20,
        allowGrowY: false
      });
      layout.add(w3);
      layout.addLayoutProperty(w3, "align", "middle");

      var w4 = (new qx.ui.core.Widget).set({
        decorator: "black",
        backgroundColor: "green",
        height : 20
      });
      layout.add(w4);

      doc.add(box1, 10, 10);
    }
  }
});
