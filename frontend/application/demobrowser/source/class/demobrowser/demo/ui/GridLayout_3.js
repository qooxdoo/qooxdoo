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
qx.Class.define("demobrowser.demo.ui.GridLayout_3",
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

      var docLayout = new qx.ui.layout.Grid();
      docLayout.setSpacing(20);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      this._border = new qx.ui.decoration.Basic(1, "solid", "black");

      docLayout.add(this.getCellAlignGrid(), 0, 0);
      docLayout.add(this.getRowColumnAlignGrid(), 0, 1);
      docLayout.add(this.getColumnAlignGrid(), 0, 2);
      docLayout.add(this.getRowAlignGrid(), 1, 0);
    },


    getNewWidget : function() {
      var widget = new qx.ui.core.Widget().set({
        decorator: this._border,
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
      var box = (new qx.ui.core.Widget).set({decorator: this._border, backgroundColor: "yellow", allowGrowX: false, allowGrowY: false});
      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);

      layout.setColumnAlign(0, "left", "top");
      layout.setColumnAlign(1, "center", "middle");
      layout.setColumnAlign(2, "right", "bottom");

      for (var x=0; x<3; x++) {
        for (var y=0; y<6; y++) {
          layout.add(this.getNewWidget(), y, x);
        }
      }

      box.setLayout(layout);

      return box;
    },


    getRowAlignGrid : function()
    {
      var box = (new qx.ui.core.Widget).set({decorator: this._border, backgroundColor: "yellow", allowGrowX: false, allowGrowY: false});
      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);

      layout.setRowAlign(0, "left", "top");
      layout.setRowAlign(1, "center", "middle");
      layout.setRowAlign(2, "right", "bottom");

      for (var x=0; x<6; x++) {
        for (var y=0; y<3; y++) {
          layout.add(this.getNewWidget(), y, x);
        }
      }

      box.setLayout(layout);

      return box;
    },


    getCellAlignGrid : function()
    {
      var box = (new qx.ui.core.Widget).set({decorator: this._border, backgroundColor: "yellow", allowGrowX: false, allowGrowY: false});
      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);

      for (var x=0; x<5; x++) {
        layout.setColumnAlign(x, "center", "middle")
        for (var y=0; y<5; y++) {
          layout.add(this.getNewWidget(), y, x);
        }
      }

      var widget = layout.getCellWidget(0, 0);
      layout.addLayoutProperty(widget, "hAlign", "left");
      layout.addLayoutProperty(widget, "vAlign", "top");
      widget.set({
        backgroundColor : "orange",
        width: 20,
        height: 20
      });

      var widget = layout.getCellWidget(4, 4);
      layout.addLayoutProperty(widget, "hAlign", "right");
      layout.addLayoutProperty(widget, "vAlign", "bottom");
      widget.set({
        backgroundColor : "orange",
        width: 20,
        height: 20
      });

      box.setLayout(layout);

      return box;
    },


    getRowColumnAlignGrid : function()
    {
      // Ambiguous alignment of the center widget
      // hAlign is taken from the row
      // vAlign is taken from the column

      var box = (new qx.ui.core.Widget).set({decorator: this._border, backgroundColor: "yellow", allowGrowX: false, allowGrowY: false});
      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);

      for (var x=0; x<5; x++) {
        for (var y=0; y<5; y++) {
          layout.add(this.getNewWidget(), y, x);
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

      box.setLayout(layout);

      return box;
    }
  }
});
