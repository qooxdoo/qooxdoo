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

qx.Class.define("demobrowser.demo.layout.Grid_Simple",
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
      container.add(this.getGrid3());
    },


    getGrid1 : function()
    {
      // auto size
      var container = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 20)).set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false,
        allowGrowY: false
      });

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 0, column: 0});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 0, column: 1});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 1, column: 0});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 1, column: 1});

      return container;
    },


    getGrid2 : function()
    {
      var layout = new qx.ui.layout.Grid();
      layout.setColumnAlign(1, "center", "top");
      layout.setColumnAlign(0, "right", "middle");
      layout.setSpacing(5);

      var container = new qx.ui.container.Composite(layout).set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        width:150
      }), {row: 0, column: 0});

      var resizeWidget = new qx.ui.basic.Label("click me").set({
        decorator: "main",
        backgroundColor: "green",
        allowGrowX: false,
        width:50,
        height: 50
      });
      container.add(resizeWidget, {row: 0, column: 1});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main", backgroundColor: "green",
        maxHeight: 60,
        allowGrowX: false
      }), {row: 1, column: 0});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        height: 80
      }), {row: 1, column: 1});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 2, column: 0});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 2, column: 1});

      var increment = 10;
      resizeWidget.addListener("click", function(e)
      {
        resizeWidget.setWidth(50 + increment);
        increment = -increment;
      });

      return container;
    },


    getGrid3 : function()
    {
      // flex columns
      var container = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        width:400,
        height : 300,
        allowShrinkX: false,
        allowShrinkY: false
      });

      var layout = new qx.ui.layout.Grid();
      layout.setColumnFlex(1, 2);
      layout.setRowFlex(1, 3);
      layout.setSpacing(5);
      container.setLayout(layout);

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 0, column: 0});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 0, column: 1});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 1, column: 0});

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), {row: 1, column: 1});

      return container;
    }

  }
});
