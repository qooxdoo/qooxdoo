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

qx.Class.define("demobrowser.demo.widget.Tree_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(layout);

      this.getRoot().add(container, 0, 0);

      layout.add(this.getTree1());
    },


    getTree1 : function()
    {
      var tree = new qx.ui.tree.Tree();

      var t0 = new qx.ui.tree.TreeFolder("Juhu1")
      tree.add(t0);

      var t1 = new qx.ui.tree.TreeFolder("Juhu2")
      tree.add(t1, t0);

      var t2 = new qx.ui.tree.TreeFolder("Juhu3")
      tree.add(t2, t0);

      var t3 = new qx.ui.tree.TreeFolder("Juhu4")
      tree.add(t3);

      var t4 = new qx.ui.tree.TreeFolder("Juhu5")
      tree.add(t4, t3);


      var t5 = new qx.ui.tree.TreeFile("Juhu5")
      tree.add(t5, t3);

      var t6 = new qx.ui.tree.TreeFile("Juhu5")
      tree.add(t6, t3);

      var t6 = new qx.ui.tree.TreeFile("Juhu5")
      tree.add(t6, t4);

      return tree;
    }
  }
});
