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
 * This example demonstrates how alignment is supported in the grid.
 */
qx.Class.define("demobrowser.demo.layout.Grid_Alignment",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroll = new qx.ui.container.Scroll();
      this.getRoot().add(scroll, {edge: 0});

      var container = new qx.ui.container.Composite(new qx.ui.layout.Grid(20)).set({
        padding: 20
      });
      scroll.add(container);

      container.add(this.getCellAlignGrid(), {row: 0, column: 0});
      container.add(this.getRowColumnAlignGrid(), {row: 0, column: 1});
      container.add(this.getColumnAlignGrid(), {row: 0, column: 2});
      container.add(this.getRowAlignGrid(), {row: 1, column: 0});
    },


    getNewWidget : function()
    {
      var widget = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        allowGrowX: false,
        allowGrowY: false,
        height: Math.round((Math.random()*30)+30),
        width: Math.round((Math.random()*30)+30)
      });
      return widget;
    },


    getColumnAlignGrid : function()
    {
      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false,
        allowGrowY: false
      });

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);
      layout.setColumnAlign(0, "left", "top");
      layout.setColumnAlign(1, "center", "middle");
      layout.setColumnAlign(2, "right", "bottom");
      box.setLayout(layout);

      for (var x=0; x<3; x++) {
        for (var y=0; y<6; y++) {
          box.add(this.getNewWidget(), {row: y, column: x});
        }
      }

      return box;
    },


    getRowAlignGrid : function()
    {
      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false,
        allowGrowY: false
      });

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);
      layout.setRowAlign(0, "left", "top");
      layout.setRowAlign(1, "center", "middle");
      layout.setRowAlign(2, "right", "bottom");
      box.setLayout(layout);

      for (var x=0; x<6; x++) {
        for (var y=0; y<3; y++) {
          box.add(this.getNewWidget(), {row: y, column: x});
        }
      }

      return box;
    },


    getCellAlignGrid : function()
    {
      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false,
        allowGrowY: false
      });

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);
      box.setLayout(layout);

      for (var x=0; x<5; x++) {
        layout.setColumnAlign(x, "center", "middle")
        for (var y=0; y<5; y++) {
          box.add(this.getNewWidget(), {row: y, column: x});
        }
      }

      var widget = layout.getCellWidget(0, 0);
      widget.set({
        alignX: "left",
        alignY: "top"
      })
      widget.set({
        backgroundColor : "orange",
        width: 20,
        height: 20
      });

      var widget = layout.getCellWidget(4, 4);
      widget.set({
        alignX: "right",
        alignY: "bottom"
      })

      widget.set({
        backgroundColor : "orange",
        width: 20,
        height: 20
      });

      return box;
    },


    getRowColumnAlignGrid : function()
    {
      // Ambiguous alignment of the center widget
      // hAlign is taken from the row
      // vAlign is taken from the column

      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false,
        allowGrowY: false
      });

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);
      box.setLayout(layout);

      for (var x=0; x<5; x++) {
        for (var y=0; y<5; y++) {
          box.add(this.getNewWidget(), {row: y, column: x});
        }
      }

      layout.setColumnAlign(2, "left", "top");
      layout.setRowAlign(2, "right", "bottom");

      for (var i=0; i<5; i++) {
        layout.getCellWidget(2, i).setBackgroundColor("gray");
        layout.getCellWidget(i, 2).setBackgroundColor("gray");
      }

      var widget = layout.getCellWidget(2, 2);
      widget.set({
        backgroundColor : "orange",
        width: 20,
        height: 20
      });

      return box;
    }
  }
});
