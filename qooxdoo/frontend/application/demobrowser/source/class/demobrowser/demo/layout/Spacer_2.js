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

/**
 * This example demonstrates how spacer can be used to have different spacings
 * between grid columns or rows
 */
qx.Class.define("demobrowser.demo.layout.Spacer_2",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var docLayout = new qx.ui.layout.HBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      docLayout.add(this.getGrid1());
      docLayout.add(this.getGrid2());
    },


    getGrid1 : function()
    {
      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      // auto size
      var box = (new qx.ui.core.Widget).set({
        decorator: border,
        backgroundColor: "yellow",
        allowGrowX: false,
        allowGrowY: false
      });

      var layout = new qx.ui.layout.Grid();

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 1);

      layout.add(new qx.ui.core.Spacer(0, 10), 1, 0);

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 2, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 2, 1);

      layout.add(new qx.ui.core.Spacer(0, 20), 3, 0);

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 4, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 4, 1);

      box.setLayout(layout);

      return box;
    },

    getGrid2 : function()
    {
      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      // auto size
      var box = (new qx.ui.core.Widget).set({
        decorator: border,
        backgroundColor: "yellow",
        allowGrowX: false,
        allowGrowY: false
      });
      var layout = new qx.ui.layout.Grid();

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 0);
      layout.add(new qx.ui.core.Spacer(10, 0), 0, 2);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 3);
      layout.add(new qx.ui.core.Spacer(30, 0), 1, 4);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 5);

      layout.add(new qx.ui.core.Spacer(0, 5), 1, 0);

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 2, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 2, 3);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 2, 5);

      box.setLayout(layout);

      return box;
    }
  }
});
