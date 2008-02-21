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

qx.Class.define("demobrowser.demo.ui.HBoxLayout_2",
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

      var border = new qx.ui.decoration.Basic(1, "solid", "black");


      // auto size + negative margins
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", height:80});
      var layout1 = new qx.ui.layout.HBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "grey", maxHeight: 50});

      layout1.add(w1, { align : "top" });
      layout1.add(w2, { align : "middle", marginLeft : -10 });
      layout1.add(w3, { align : "bottom", marginLeft : -10 });

      box1.setLayout(layout1);
      doc.add(box1, 10, 10);




      // auto size + negative margins + collapsing
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", height:80});
      var layout1 = new qx.ui.layout.HBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "grey", maxHeight: 50});

      layout1.add(w1, { align : "top" });
      layout1.add(w2, { align : "middle", marginLeft : -10, marginRight : 20 });
      layout1.add(w3, { align : "bottom", marginLeft : -10 });

      box1.setLayout(layout1);
      doc.add(box1, 10, 100);




      // auto size + negative margins + flex
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", height:80, width: 500});
      var layout1 = new qx.ui.layout.HBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "grey", maxHeight: 50});

      layout1.add(w1, { flex : 1, align : "top" });
      layout1.add(w2, { flex : 1, align : "middle", marginLeft : -10 });
      layout1.add(w3, { flex : 1, align : "bottom", marginLeft : -10 });

      box1.setLayout(layout1);
      doc.add(box1, 10, 190);





      // auto size + negative margins + different flex
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", height:80, width: 500});
      var layout1 = new qx.ui.layout.HBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "grey", maxHeight: 50});

      layout1.add(w1, { flex : 1, align : "top" });
      layout1.add(w2, { flex : 2, align : "middle", marginLeft : -10 });
      layout1.add(w3, { flex : 3, align : "bottom", marginLeft : -10 });

      box1.setLayout(layout1);
      doc.add(box1, 10, 280);




      // auto size + negative margins + different flex (using width)
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", height:80, width: 500});
      var layout1 = new qx.ui.layout.HBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "grey", maxHeight: 50});

      layout1.add(w1, { width : "1*", align : "top" });
      layout1.add(w2, { width : "2*", align : "middle", marginLeft : -10 });
      layout1.add(w3, { width : "3*", align : "bottom", marginLeft : -10 });

      box1.setLayout(layout1);
      doc.add(box1, 10, 370);
    }
  }
});
