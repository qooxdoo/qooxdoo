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

qx.Class.define("demobrowser.demo.ui.VBoxLayout_1",
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


      // auto size
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}));
      box1.setLayout(layout1);
      doc.add(box1, 10, 10);


      // container wider, horizontal alignment
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", minWidth: 60});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxWidth: 40}), { align : "left" });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxWidth: 40}), { align : "center" });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxWidth: 40}), { align : "right" });
      box1.setLayout(layout1);
      doc.add(box1, 130, 10);


      // container higher, vertical alignment = bottom
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", height: 300});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);
      layout1.setAlign("bottom");
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}));
      box1.setLayout(layout1);
      doc.add(box1, 210, 10);


      // container higher, vertical alignment = middle
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", height: 300});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);
      layout1.setAlign("middle");
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}));
      box1.setLayout(layout1);
      doc.add(box1, 330, 10);


      // auto size + vertical margins
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"})

      layout1.add(w1, { marginBottom : 10 });
      layout1.add(w2, { marginTop : 20, marginBottom : 10 });
      layout1.add(w3, { marginBottom : 10 });

      box1.setLayout(layout1);
      doc.add(box1, 450, 10);




      // manual height + vertical margins + alignment=bottom
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", height: 300});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);
      layout1.setAlign("bottom");

      var w1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"})

      layout1.add(w1, { marginBottom : 10 });
      layout1.add(w2, { marginTop : 20, marginBottom : 10 });
      layout1.add(w3, { marginBottom : 10 });

      box1.setLayout(layout1);
      doc.add(box1, 570, 10);



      // manual height + vertical margins + alignment=middle
      var box1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", height: 300});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);
      layout1.setAlign("middle");

      var w1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"})

      layout1.add(w1, { marginBottom : 10 });
      layout1.add(w2, { marginTop : 20, marginBottom : 10 });
      layout1.add(w3, { marginBottom : 10 });

      box1.setLayout(layout1);
      doc.add(box1, 690, 10);
    }
  }
});
