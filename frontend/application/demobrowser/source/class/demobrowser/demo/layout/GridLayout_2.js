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

qx.Class.define("demobrowser.demo.layout.GridLayout_2",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      doc.add(this.getGrid1(), 20, 10);
      doc.add(this.getGrid2(), 260, 10);
    },


    getGrid1 : function()
    {
      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      // auto size
      var box = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow"});
      var layout = new qx.ui.layout.Grid();
      layout.setVerticalSpacing(20);
      layout.setHorizontalSpacing(5);

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 1);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", width:150, maxWidth:150}), 1, 0, {rowSpan: 1, colSpan: 2});

      box.setLayout(layout);

      return box;
    },


    getGrid2 : function()
    {
      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      // flex columns
      var box = (new qx.ui.core.Widget).set({
        decorator: border,
        backgroundColor: "yellow",
        width:500,
        allowShrinkX: false,
        allowShrinkY: false
      });

      var layout = new qx.ui.layout.Grid();
      layout.setColumnFlex(1, 2);
      layout.setRowFlex(1, 3);
      layout.setColumnMinWidth(0,70);
      layout.setColumnMinWidth(1,100);
      layout.setColumnMaxWidth(2,150);
      layout.setRowMinHeight(0,70);
      layout.setSpacing(5);


      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 0, 1, {rowSpan: 1, colSpan: 2});
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 1, 0);

      var container = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "orange", width:400, padding: 5});
      layout.add(container, 1, 1, {rowSpan: 2, colSpan: 2});

      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 2, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 3, 0, {rowSpan: 1, colSpan: 2});
      layout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), 3, 2);

      box.setLayout(layout);


      // set inner layout
      var innerLayout = new qx.ui.layout.Grid();
      container.setLayout(innerLayout);

      innerLayout.setColumnAlign(1, "center", "middle");
      innerLayout.setColumnAlign(0, "right", "bottom");
      innerLayout.setColumnMinWidth(1, 40);
      innerLayout.setSpacing(5);
      innerLayout.setColumnFlex(1, 1);

      innerLayout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", width:150}), 0, 0);
      innerLayout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", allowGrowX: false, height: 70, allowGrowX: false}), 0, 1);//, 2, 1);
      innerLayout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxHeight: 60, allowGrowX: false}), 1, 0);
      innerLayout.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", minWidth:170}), 2, 0);//, 1, 2);

      return box;
    }
  }
});
