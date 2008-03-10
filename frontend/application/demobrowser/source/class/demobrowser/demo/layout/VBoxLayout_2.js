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

qx.Class.define("demobrowser.demo.layout.VBoxLayout_2",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);


      // auto size + negative margins
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", width:180});
      var layout1 = new qx.ui.layout.VBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      layout1.add(w1, { align : "left" });
      layout1.add(w2, { marginTop : -10, align : "center" });
      layout1.add(w3, { marginTop : -10, align : "right" });

      box1.setLayout(layout1);
      doc.add(box1, 10, 10);




      // auto size + negative margins + collapsing
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", width:180});
      var layout1 = new qx.ui.layout.VBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      layout1.add(w1, { align : "left" });
      layout1.add(w2, { marginTop : -10, marginBottom : 20, align : "center" });
      layout1.add(w3, { marginTop : -10, align : "right" });

      box1.setLayout(layout1);
      doc.add(box1, 210, 10);




      // auto size + negative margins + flex
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", width:180, height: 300});
      var layout1 = new qx.ui.layout.VBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      layout1.add(w1, { flex : 1, align : "left" });
      layout1.add(w2, { flex : 1, marginTop : -10, align : "center" });
      layout1.add(w3, { flex : 1, marginTop : -10, align : "right" });

      box1.setLayout(layout1);
      doc.add(box1, 410, 10);





      // auto size + negative margins + different flex
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", width:180, height: 300});
      var layout1 = new qx.ui.layout.VBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      layout1.add(w1, { flex : 1, align : "left" });
      layout1.add(w2, { flex : 2, marginTop : -10, align : "center" });
      layout1.add(w3, { flex : 3, marginTop : -10, align : "right" });

      box1.setLayout(layout1);
      doc.add(box1, 610, 10);



      // auto size + negative margins + different flex (using height)
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", width:180, height: 300});
      var layout1 = new qx.ui.layout.VBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      layout1.add(w1, { height : "1*", align : "left" });
      layout1.add(w2, { height : "2*", marginTop : -10, align : "center" });
      layout1.add(w3, { height : "3*", marginTop : -10, align : "right" });

      box1.setLayout(layout1);
      doc.add(box1, 810, 10);
    }
  }
});
