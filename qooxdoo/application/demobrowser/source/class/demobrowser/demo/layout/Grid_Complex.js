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

qx.Class.define("demobrowser.demo.layout.Grid_Complex",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroll = new qx.ui.container.Scroll();
      this.getRoot().add(scroll, {edge: 0});

      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(20)).set({
        padding: 20
      })
      scroll.add(container);

      container.add(this.getGrid1());
      container.add(this.getGrid2());
    },


    getGrid1 : function()
    {
      // auto size
      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      box.setLayout(new qx.ui.layout.Grid(5, 20));

      box.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 0, column: 0});

      box.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 0, column: 1});

      box.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        width:150,
        maxWidth:150
      }), {row: 1, column: 0, rowSpan: 1, colSpan: 2});

      return box;
    },


    getGrid2 : function()
    {
      // flex columns
      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        width:500,
        allowShrinkX: false,
        allowShrinkY: false,
        allowGrowX: false
      });

      var layout = new qx.ui.layout.Grid();
      layout.setColumnFlex(1, 2);
      layout.setRowFlex(1, 3);
      layout.setColumnMinWidth(0,70);
      layout.setColumnMinWidth(1,100);
      layout.setColumnMaxWidth(2,150);
      layout.setRowMinHeight(0,70);
      layout.setSpacing(5);
      box.setLayout(layout);

      box.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 0, column: 0});

      box.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 0, column: 1, rowSpan: 1, colSpan: 2});

      box.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 1, column: 0});

      var innerBox = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "orange",
        width:400,
        padding: 5
      });
      box.add(innerBox, {row: 1, column: 1, rowSpan: 2, colSpan: 2});

      box.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 2, column: 0});

      box.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 3, column: 0, rowSpan: 1, colSpan: 2});

      box.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 3, column: 2});



      // set inner layout
      var innerLayout = new qx.ui.layout.Grid();
      innerBox.setLayout(innerLayout);

      innerLayout.setColumnAlign(1, "center", "middle");
      innerLayout.setColumnAlign(0, "right", "bottom");
      innerLayout.setColumnMinWidth(1, 40);
      innerLayout.setSpacing(5);
      innerLayout.setColumnFlex(1, 1);

      innerBox.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        width:150
      }), {row: 0, column: 0});

      innerBox.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        allowGrowX: false,
        height: 70,
        allowGrowX: false
      }), {row: 0, column: 1});

      innerBox.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        maxHeight: 60,
        allowGrowX: false
      }), {row: 1, column: 0});

      innerBox.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        minWidth:170
      }), {row: 2, column: 0});

      return box;
    }
  }
});
