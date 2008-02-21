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

qx.Class.define("demobrowser.demo.ui.VBoxLayout_3",
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

      var border = new qx.ui.decoration.Basic(1, "solid", "black");


      // auto height + reversed
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", width: 120});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);
      layout1.setReversed(true);

      var w1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "grey", maxWidth:100});

      layout1.add(w1, { align : "left" });
      layout1.add(w2, { align : "center" });
      layout1.add(w3, { align : "right" });

      box1.setLayout(layout1);
      doc.add(box1, 10, 10);
    }
  }
});
