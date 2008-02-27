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

qx.Class.define("demobrowser.demo.layout.GridLayout_1",
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
      docLayout.add(this.getGrid3());
    },


    getGrid1 : function()
    {
      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      // auto size
      var box = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", minHeight:300});
      var layout = new qx.ui.layout.Grid();
      layout.setVerticalSpacing(20);
      layout.setHorizontalSpacing(10);
      layout.setRowMaxHeight(0, 60);
      layout.setRowMaxHeight(1, 60);

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 1);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 1, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 1, 1);

      box.setLayout(layout);

      return box;
    },


    getGrid2 : function()
    {
      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      // auto size
      var box = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", allowGrowX: false});
      var layout = new qx.ui.layout.Grid();

      layout.setColumnAlign(1, "center", "top");
      layout.setColumnAlign(0, "right", "middle");
      layout.setSpacing(5);

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", width:150}), 0, 0);

      var resizeWidget = new qx.ui.basic.Label("click me")
      resizeWidget.set({decorator: border, backgroundColor: "green", allowGrowX: false, width:50, height: 50});
      layout.add(resizeWidget, 0, 1);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxHeight: 60, allowGrowX: false}), 1, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", height: 80}), 1, 1);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 2, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 2, 1);

      box.setLayout(layout);

      var increment = 10;
      resizeWidget.addListener("click", function(e)
      {
        resizeWidget.setWidth(50 + increment);
        increment = -increment;
      });

      return box;
    },


    getGrid3 : function()
    {
      // flex columns
      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      var box = (new qx.ui.core.Widget).set({
        decorator: border,
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
      box.setLayout(layout);

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 1);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 1, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 1, 1);

      return box;
    }
  }
});
