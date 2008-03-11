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

qx.Class.define("demobrowser.demo.layout.HBoxLayout_6",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      // auto size with limited height
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", maxHeight : 100});
      var layout1 = new qx.ui.layout.HBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      w1.setHeight(200);
      w2.setHeight(300);
      w3.setHeight(400);

      layout1.add(w1);
      layout1.add(w2);
      layout1.add(w3);

      box1.setLayout(layout1);
      doc.add(box1, 10, 10);
    }
  }
});
