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

qx.Class.define("demobrowser.demo.layout.VBox_ShrinkX",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto size with limited height
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set(
      {
        decorator: "main",
        backgroundColor: "yellow",
        maxWidth : 100
      });

      box.setSpacing(5);

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});

      w1.setWidth(200);
      w2.setWidth(300);
      w3.setWidth(400);

      container.add(w1);
      container.add(w2);
      container.add(w3);

      this.getRoot().add(container, {left:10, top:10});
    }
  }
});
